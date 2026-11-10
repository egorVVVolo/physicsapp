import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build, exam, l4 } from '../content/l4.ts';
import { buildOutcome, check, initialBuild, marksEarned, pickChip, pickFinal, pickRelation, pickSlot, type BuildState } from './build.ts';
import { countOutcomes, currentStep, nextStep, onYourOwn, parseProgress, recordOutcome, startState, type SessionState } from './logic.ts';
import type { BuildStep } from '../content/types.ts';

const core = l4.sessions[0];

function fill(step: BuildStep, s: BuildState, values: Record<string, number>): BuildState {
  for (const [q, v] of Object.entries(values)) s = pickChip(step, pickSlot(s, q as 's'), v);
  return s;
}
const toSlots = (step: BuildStep) => check(step, pickRelation(initialBuild, 'sut')).state;

test('build: straight through is independent and ends with the full flight', () => {
  let s = toSlots(build);
  assert.equal(s.stage, 'slots');
  assert.equal(s.active, 's');
  s = fill(build, s, { s: -20, u: 8, a: -9.81 });
  s = check(build, s).state;
  assert.equal(s.stage, 'final');
  const r = check(build, pickFinal(s, 'land'));
  assert.equal(r.state.stage, 'done');
  assert.equal(r.verdict!.ok, true);
  assert.ok(r.playback);
  assert.equal(buildOutcome(build, r.state), 'independent');
});

test('build: a wrong equation counts as a wrong attempt and stays on the stage', () => {
  const r = check(build, pickRelation(initialBuild, 'vuat'));
  assert.equal(r.state.stage, 'relation');
  assert.equal(r.state.wrong, 1);
  assert.equal(r.verdict!.ok, false);
});

test('build: a wrong slot is marked, plays as a ghost, and the second miss gives the method hint', () => {
  let s = fill(build, toSlots(build), { s: -20, u: 0, a: -9.81 });
  const r1 = check(build, s);
  assert.equal(r1.state.marked, 'u');
  assert.equal(r1.state.active, 'u');
  assert.ok(r1.playback?.companion);
  assert.match(r1.verdict!.text, /hovering/);
  s = pickChip(build, r1.state, -8);
  assert.equal(s.marked, null, 'changing the marked slot clears the mark');
  const r2 = check(build, s);
  assert.equal(r2.verdict!.text, build.methodHint);
  assert.equal(buildOutcome(build, r2.state), 'assisted');
  const r3 = check(build, r2.state);
  assert.equal(r3.state.revealed, true);
  assert.equal(r3.state.stage, 'done');
  assert.deepEqual(r3.state.values, { s: -20, u: 8, a: -9.81 });
  assert.equal(buildOutcome(build, r3.state), 'revealed');
});

test('build: all signs flipped is a note, not a wrong attempt', () => {
  const s = fill(build, toSlots(build), { s: 20, u: -8, a: 9.81 });
  const r = check(build, s);
  assert.equal(r.verdict!.ok, null);
  assert.equal(r.state.wrong, 0);
  assert.equal(r.state.stage, 'slots');
});

test('build: the root before the release is a wrong attempt', () => {
  let s = check(build, fill(build, toSlots(build), { s: -20, u: 8, a: -9.81 })).state;
  const r = check(build, pickFinal(s, 'before'));
  assert.equal(r.state.stage, 'final');
  assert.equal(buildOutcome(build, r.state), 'assisted');
  s = check(build, pickFinal(r.state, 'land')).state;
  assert.equal(s.stage, 'done');
});

test('exam format: one attempt per part, a miss loses the mark and moves on', () => {
  let r = check(exam, pickRelation(initialBuild, 'vuat'));
  assert.equal(r.state.stage, 'slots');
  assert.equal(r.state.relation, 'sut');
  assert.equal(r.state.lost, 1);
  r = check(exam, fill(exam, r.state, { s: 24, a: -9.81 }));
  assert.equal(r.state.stage, 'final');
  assert.equal(r.state.values.s, -24);
  assert.equal(r.playback, null);
  r = check(exam, pickFinal(r.state, 'up'));
  assert.equal(r.state.stage, 'done');
  assert.equal(marksEarned(exam, r.state), 1);
  assert.equal(buildOutcome(exam, r.state), 'revealed');
});

test('session: steps in order, a revealed build step is followed by its retry', () => {
  let s: SessionState = startState;
  assert.equal(currentStep(s, core)!.id, 'hook');
  s = nextStep(recordOutcome(s, core, 'revealed'), core);
  s = nextStep(recordOutcome(s, core, 'independent'), core);
  assert.equal(currentStep(s, core)!.id, 'build');
  s = nextStep(recordOutcome(s, core, 'revealed'), core);
  assert.equal(currentStep(s, core)!.id, 'build-retry');
  s = recordOutcome(s, core, 'independent');
  assert.equal(s.outcomes.build, 'revealed', 'the retry does not rewrite the outcome');
  s = nextStep(s, core);
  assert.equal(currentStep(s, core)!.id, 'spot-error');
  for (let i = 0; i < 3; i++) s = nextStep(recordOutcome(s, core, 'independent'), core);
  assert.equal(s.finished, true);
  assert.equal(currentStep(s, core), null);
  assert.deepEqual(countOutcomes(s), { independent: 4, assisted: 0, revealed: 2 });
  assert.equal(onYourOwn(s, core), true);
});

test('saved progress: round trip, and anything unexpected starts from the beginning', () => {
  const state = nextStep(recordOutcome(startState, core, 'independent'), core);
  const json = JSON.stringify({ v: 1, lessonId: l4.id, sessionId: core.id, state, survey: {}, updatedAt: 1 });
  assert.deepEqual(parseProgress(json, l4.id, core)!.state, state);
  assert.equal(parseProgress(null, l4.id, core), null);
  assert.equal(parseProgress('{oops', l4.id, core), null);
  assert.equal(parseProgress(json.replace('"v":1', '"v":2'), l4.id, core), null);
  assert.equal(parseProgress(json.replace('hook', 'gone'), l4.id, core), null);
  assert.equal(parseProgress(json, 'other-lesson', core), null);
});
