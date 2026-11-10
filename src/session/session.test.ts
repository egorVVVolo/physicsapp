import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build, exam, l4 } from '../content/l4.ts';
import {
  buildOutcome,
  chooseChip,
  chooseFinal,
  chooseRelation,
  currentHighlight,
  currentPrompt,
  initialBuild,
  marksEarned,
  type BuildState,
} from './build.ts';
import { countOutcomes, currentStep, isQuestion, nextStep, onYourOwn, parseProgress, questionCount, recordOutcome, startState, type SessionState } from './logic.ts';

const core = l4.sessions[0];

/** Tap the right equation, then the right chip on each slot. */
function toFinal(step = build): BuildState {
  let s = chooseRelation(step, initialBuild, 'sut').state;
  for (const sl of step.slots) s = chooseChip(step, s, sl.correct).state;
  return s;
}
const toSlots = () => chooseRelation(build, initialBuild, 'sut').state;

test('build: straight through is independent, each stage is its own screen, and the end plays the full flight', () => {
  let s = initialBuild;
  assert.equal(currentPrompt(build, s), build.relationPrompt);
  assert.equal(currentHighlight(build, s), null);
  let r = chooseRelation(build, s, 'sut');
  assert.equal(r.correct, true);
  assert.equal(r.verdict, null);
  s = r.state;
  assert.deepEqual([s.stage, s.slotIndex, s.relation], ['slot', 0, 'sut']);
  for (const [i, sl] of build.slots.entries()) {
    assert.equal(currentPrompt(build, s), sl.prompt);
    assert.equal(currentHighlight(build, s), sl.highlight);
    assert.equal(s.slotIndex, i);
    r = chooseChip(build, s, sl.correct);
    assert.equal(r.correct, true);
    assert.equal(r.verdict, null);
    s = r.state;
  }
  assert.equal(s.stage, 'final');
  assert.deepEqual(s.values, { s: -20, u: 12, a: -9.81 });
  assert.equal(currentPrompt(build, s), build.final.prompt);
  r = chooseFinal(build, s, 'land');
  assert.equal(r.state.stage, 'done');
  assert.equal(r.verdict!.ok, true);
  assert.ok(r.playback);
  assert.equal(buildOutcome(build, r.state), 'independent');
});

test('build: a wrong equation counts, is marked, and the next tap clears the mark', () => {
  const r = chooseRelation(build, initialBuild, 'vuat');
  assert.equal(r.correct, false);
  assert.equal(r.state.stage, 'relation');
  assert.equal(r.state.wrong, 1);
  assert.equal(r.state.marked, true);
  assert.equal(r.verdict!.ok, false);
  assert.equal(r.playback, null);
  const again = chooseRelation(build, r.state, 'sut');
  assert.equal(again.state.marked, false);
  assert.equal(again.state.stage, 'slot');
});

test('build: a wrong chip is marked, plays as a ghost, the second miss gives the method hint, the third reveals', () => {
  const s0 = toSlots();
  const u0 = chooseChip(build, chooseChip(build, s0, -20).state, 0); // s right, u wrong
  assert.equal(u0.correct, false);
  assert.equal(u0.state.marked, true);
  assert.equal(u0.state.slotIndex, 1);
  assert.equal(u0.state.wrong, 1);
  assert.ok(u0.playback?.companion);
  assert.match(u0.verdict!.text, /balloon/);
  assert.equal(u0.verdict!.ok, false);
  const r2 = chooseChip(build, u0.state, -12);
  assert.equal(r2.state.marked, true);
  assert.equal(r2.verdict!.text, build.methodHint);
  assert.ok(r2.playback?.companion);
  assert.equal(buildOutcome(build, r2.state), 'assisted');
  const r3 = chooseChip(build, r2.state, 0);
  assert.equal(r3.state.revealed, true);
  assert.equal(r3.state.stage, 'done');
  assert.deepEqual(r3.state.values, { s: -20, u: 12, a: -9.81 });
  assert.equal(r3.state.relation, 'sut');
  assert.deepEqual(r3.verdict, { ok: false, text: 'Here is the full solution.' });
  assert.ok(r3.playback);
  assert.equal(buildOutcome(build, r3.state), 'revealed');
});

test('build: a wrong chip clears the mark when the next tap is right', () => {
  const wrong = chooseChip(build, toSlots(), 20);
  assert.equal(wrong.state.marked, true);
  const ok = chooseChip(build, wrong.state, -20);
  assert.equal(ok.state.marked, false);
  assert.equal(ok.state.slotIndex, 1);
});

test('build: the root before the release is a wrong attempt, then the landing finishes', () => {
  const s = toFinal();
  const r = chooseFinal(build, s, 'before');
  assert.equal(r.correct, false);
  assert.equal(r.state.stage, 'final');
  assert.equal(r.state.marked, true);
  assert.equal(r.playback, null);
  assert.equal(buildOutcome(build, r.state), 'assisted');
  const done = chooseFinal(build, r.state, 'land');
  assert.equal(done.state.stage, 'done');
  assert.equal(buildOutcome(build, done.state), 'assisted');
});

test('build: taps on the wrong stage do nothing', () => {
  const r = chooseChip(build, initialBuild, -20);
  assert.deepEqual([r.state, r.verdict, r.playback, r.correct], [initialBuild, null, null, false]);
  assert.equal(chooseFinal(build, toSlots(), 'land').state.stage, 'slot');
});

test('exam format: one attempt per part, a miss loses the mark, fills the right answer and moves on', () => {
  let r = chooseRelation(exam, initialBuild, 'vuat');
  assert.equal(r.state.stage, 'slot');
  assert.equal(r.state.relation, 'sut');
  assert.equal(r.state.lost, 1);
  assert.equal(r.verdict!.ok, false);
  assert.equal(r.verdict!.text, exam.relations.find((x) => x.id === 'vuat')!.feedback);
  assert.equal(r.playback, null);
  r = chooseChip(exam, r.state, 24); // wrong s
  assert.equal(r.state.values.s, -24);
  assert.equal(r.state.slotIndex, 1);
  assert.equal(r.state.lost, 2);
  assert.equal(r.playback, null);
  r = chooseChip(exam, r.state, -9.81); // right a
  assert.equal(r.correct, true);
  assert.equal(r.state.stage, 'final');
  assert.equal(r.state.lost, 2);
  r = chooseFinal(exam, r.state, 'up');
  assert.equal(r.state.stage, 'done');
  assert.equal(marksEarned(exam, r.state), 1);
  assert.equal(buildOutcome(exam, r.state), 'revealed');
});

test('exam format: all right is independent and earns all three marks; never a reveal', () => {
  const s = toFinal(exam);
  const r = chooseFinal(exam, s, 'up');
  assert.equal(marksEarned(exam, r.state), 3);
  assert.equal(buildOutcome(exam, r.state), 'independent');
  let w = chooseFinal(exam, toFinal(exam), 'down');
  assert.equal(w.state.stage, 'done');
  assert.equal(w.state.revealed, false);
  assert.equal(marksEarned(exam, w.state), 2);
});

test('idea steps are not questions and are skipped by the tally', () => {
  assert.equal(questionCount(core), 5);
  assert.deepEqual(core.steps.filter((s) => !isQuestion(s)).map((s) => s.id), ['idea-release', 'idea-gravity', 'idea-sign']);
  let s: SessionState = startState;
  assert.equal(currentStep(s, core)!.id, 'idea-release');
  s = recordOutcome(s, core, 'revealed'); // ignored
  assert.deepEqual(s.outcomes, {});
  s = nextStep(s, core);
  assert.equal(currentStep(s, core)!.id, 'hook');
});

test('session: steps in order, a revealed build step is followed by its retry, the tally counts questions only', () => {
  let s: SessionState = startState;
  const ids: string[] = [];
  const play = (outcome: 'independent' | 'assisted' | 'revealed') => {
    ids.push(currentStep(s, core)!.id);
    s = nextStep(recordOutcome(s, core, outcome), core);
  };
  play('independent'); // idea-release (ignored)
  play('revealed'); // hook
  play('independent'); // idea-gravity
  play('independent'); // acc-top
  play('independent'); // idea-sign
  assert.equal(currentStep(s, core)!.id, 'build');
  play('revealed'); // build, so the retry follows
  assert.equal(currentStep(s, core)!.id, 'build-retry');
  s = recordOutcome(s, core, 'independent');
  assert.equal(s.outcomes.build, 'revealed', 'the retry does not rewrite the outcome');
  s = nextStep(s, core);
  assert.equal(currentStep(s, core)!.id, 'spot-error');
  play('independent');
  play('independent'); // exam
  assert.equal(s.finished, true);
  assert.equal(currentStep(s, core), null);
  assert.deepEqual(ids, ['idea-release', 'hook', 'idea-gravity', 'acc-top', 'idea-sign', 'build', 'spot-error', 'exam']);
  assert.deepEqual(countOutcomes(s), { independent: 3, assisted: 0, revealed: 2 });
  assert.equal(onYourOwn(s, core), true);
});

test('saved progress: round trip, and anything unexpected starts from the beginning', () => {
  let state = nextStep(recordOutcome(startState, core, 'independent'), core); // idea: no outcome
  state = nextStep(recordOutcome(state, core, 'independent'), core); // hook
  const json = JSON.stringify({ v: 1, lessonId: l4.id, sessionId: core.id, state, survey: {}, updatedAt: 1 });
  assert.deepEqual(parseProgress(json, l4.id, core)!.state, state);
  assert.deepEqual(state.outcomes, { hook: 'independent' });
  assert.equal(parseProgress(null, l4.id, core), null);
  assert.equal(parseProgress('{oops', l4.id, core), null);
  assert.equal(parseProgress(json.replace('"v":1', '"v":2'), l4.id, core), null);
  assert.equal(parseProgress(json.replace('hook', 'gone'), l4.id, core), null);
  assert.equal(parseProgress(json.replace('hook', 'idea-sign'), l4.id, core), null, 'an idea step never has an outcome');
  assert.equal(parseProgress(json, 'other-lesson', core), null);
});

test('recordOutcome keeps the first outcome of a step (a replay after resume cannot rewrite it)', () => {
  let s: SessionState = startState;
  s = nextStep(s, core); // idea-release done: the hook question is current
  s = recordOutcome(s, core, 'revealed');
  s = recordOutcome(s, core, 'independent');
  assert.equal(s.outcomes.hook, 'revealed');
});
