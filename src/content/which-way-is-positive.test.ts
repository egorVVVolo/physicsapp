// Every number in "Which way is positive?" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whichWayIsPositive as L, ANSWERS as X, BOUNCE, HIKE, LAP, RUN_A, RUN_B, SWIM, T, T_MID } from './which-way-is-positive.ts';
import { tripPosition, tripVelocity } from '../physics/kinematics.ts';
import type { BuildScreen, EstimateScreen, ExamCardScreen, OptionQuestion, SortScreen, SpotErrorScreen, WorkedScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: BuildScreen, id: string) => b.chips.find((c) => c.id === id)!.label;
const spot = (id: string) => all.find((s) => s.id === id) as SpotErrorScreen;
const NB = '\u00A0';
const near = (a: number, b: number, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('runner A: 300 m east, 500 m west in 200 s; distance 800 m, displacement −200 m (the estimate)', () => {
  near(X.out, 300);
  near(X.back, -500);
  near(X.distA, 800);
  near(X.dispA, -200);
  const est = L.story.find((s) => s.id === 'finish') as EstimateScreen;
  near(est.answer, tripPosition(T, RUN_A));
  near(est.answer, -200);
  assert.ok(est.scale.min <= -200 && est.scale.max >= 300, 'the scale holds both the finish and the turn');
  assert.ok(est.after.kind === 'track' && est.after.play === true, 'checking plays the run');
});

test('average velocity is built from the displacement: −1.0 m s⁻¹; the wrong chips are named mistakes', () => {
  near(X.avgSpeedA, 4);
  near(X.avgVelA, -1);
  const b = build('avg-velocity');
  assert.deepEqual(b.boxes, { s: 'disp', t: 'time' });
  assert.equal(chip(b, 'disp'), `−200${NB}m`);
  assert.equal(chip(b, 'time'), `200${NB}s`);
  assert.equal(chip(b, 'path'), `800${NB}m`);
  assert.equal(chip(b, 'plus'), `+200${NB}m`);
  // the same-unit wrong times are the two legs of runner A's run
  assert.equal(chip(b, 'first'), `${RUN_A.phases[0].dt}${NB}s`);
  assert.equal(chip(b, 'second'), `${RUN_A.phases[1].dt}${NB}s`);
  assert.equal(b.choose!.options.find((o) => o.correct)!.label, 'v = s ÷ t');
  near(b.result.value, X.dispA / T);
  assert.equal(label('flip', 'right'), `+1.0${NB}m${NB}s⁻¹`);
  assert.equal(label('flip', 'speed'), `+4.0${NB}m${NB}s⁻¹`);
});

test('the sort: every quantity is in its right bin', () => {
  const sort = L.story.find((s) => s.id === 'quantities') as SortScreen;
  const bin = (id: string) => sort.items.find((i) => i.id === id)!.bin;
  for (const id of ['distance', 'speed', 'time']) assert.equal(bin(id), 'scalar', id);
  for (const id of ['displacement', 'velocity', 'acceleration']) assert.equal(bin(id), 'vector', id);
});

test("Noor's mistake: she divided the distance, 800 m ÷ 200 s = 4.0 m s⁻¹, the average speed", () => {
  const w = spot('working');
  const wrong = w.lines.find((l) => l.wrong)!;
  assert.equal(wrong.id, 'rule');
  assert.ok(wrong.text.includes('distance') && wrong.fix!.includes('displacement'));
  const calc = w.lines.find((l) => l.id === 'calc')!;
  assert.ok(calc.text.includes(`800${NB}m`) && calc.text.includes(`+4.0${NB}m${NB}s⁻¹`));
  near(X.distA / T, 4);
});

test('the puzzle: both runners have the same average velocity, and A catches B exactly at the finish', () => {
  near(X.avgVelB, X.avgVelA);
  near(tripPosition(T, RUN_B), tripPosition(T, RUN_A));
  for (let t = 1; t < T; t += 1) assert.ok(tripPosition(t, RUN_A) > tripPosition(t, RUN_B), `A is not ahead (east) of B at ${t} s`);
  assert.equal(right('hook-again'), 'same');
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.equal(hook.kind, 'predict');
});

test('at 120 s both move west; runner A is the faster one', () => {
  near(X.vA, tripVelocity(T_MID, RUN_A));
  assert.ok(X.vA < 0 && X.vB < 0 && Math.abs(X.vA) > Math.abs(X.vB));
});

test('runner A is back at the lamp post at 150 s, after 600 m', () => {
  near(tripPosition(X.tHome, RUN_A), 0);
  near(X.tHome, 150);
  near(X.distHome, 600);
  const scrub = L.story.find((s) => s.id === 'scrub')!;
  assert.ok(scrub.kind === 'explore' && scrub.question.options.find((o) => o.correct)!.label === `At 150${NB}s`);
});

test('the hiker: 5.0 km at 53° east of north (7.0 km walked), worked through then asked about the bearing', () => {
  near(X.hike.right, Math.hypot(HIKE.north, HIKE.east));
  near(X.hike.right, 5);
  near(X.hike.angle, (Math.atan(HIKE.east / HIKE.north) * 180) / Math.PI);
  const w = L.story.find((s) => s.id === 'hiker') as WorkedScreen;
  assert.equal(w.kind, 'worked');
  const opt = (id: string) => w.last!.options.find((o) => o.id === id)!;
  assert.equal(opt('right').label, `5.0${NB}km`);
  assert.ok(opt('right').correct);
  assert.equal(opt('added').label, `7.0${NB}km`);
  assert.equal(label('bearing', 'right'), '53° east of north');
  assert.equal(label('bearing', 'from-east'), '37° east of north');
});

test('Skill check: river 1.5 m s⁻¹ (built), bounce −10.0 m s⁻¹ (the sign in line 1 is wrong), braking west is a positive acceleration', () => {
  near(X.swim.right, Math.hypot(SWIM.across, SWIM.current));
  const r = build('river');
  assert.equal(r.result.value, X.swim.right);
  assert.equal(chip(r, 'across'), `1.2${NB}m${NB}s⁻¹`);
  assert.equal(chip(r, 'current'), `0.9${NB}m${NB}s⁻¹`);
  assert.equal(chip(r, 'added'), `2.1${NB}m${NB}s⁻¹`);
  near(X.bounce.right, BOUNCE.v - BOUNCE.u);
  near(X.bounce.sizes, -2);
  const wrong = spot('bounce').lines.find((l) => l.wrong)!;
  assert.equal(wrong.id, 'signs');
  assert.ok(wrong.text.includes(`+4.0${NB}m${NB}s⁻¹`) && wrong.fix!.includes(`−4.0${NB}m${NB}s⁻¹`));
  assert.ok(spot('bounce').lines.find((l) => l.id === 'calc')!.text.includes(`−2.0${NB}m${NB}s⁻¹`));
  assert.equal(right('brake-sign'), 'right');
  // the sign of the acceleration of a cyclist braking from west-moving to rest
  assert.ok((0 - -5) / 3 > 0);
});

test('the exam card: half a lap, displacement is the diameter, 3.2 m s⁻¹, 2 marks for 2 boxes', () => {
  near(X.lap.chord, LAP.round / Math.PI, 1e-9);
  const card = L.skillCheck.find((s) => s.id === 'half-lap') as ExamCardScreen;
  assert.equal(card.kind, 'examCard');
  const b = card.parts.find((p) => p.id === 'b')!;
  assert.ok(b.kind === 'build');
  if (b.kind === 'build') {
    assert.equal(b.build.chips.find((c) => c.id === 'chord')!.label, `127${NB}m`);
    assert.equal(b.build.chips.find((c) => c.id === 'half')!.label, `200${NB}m`);
    assert.equal(b.build.chips.find((c) => c.id === 'whole')!.label, `${LAP.t * 2}${NB}s`);
    near(b.build.result.value, X.lap.right);
  }
  assert.equal(`${X.lap.right.toFixed(1)}`, '3.2');
  assert.equal(card.parts.reduce((n, p) => n + p.marks, 0), 3);
});

test('every option label is different within a question', () => {
  for (const s of all) {
    if (s.kind === 'choice' || s.kind === 'tapFig') {
      const labels = s.options.map((o) => o.label);
      assert.equal(new Set(labels).size, labels.length, `${s.id}: two options read the same: ${labels.join(' | ')}`);
    }
  }
});

test('the transfer sort: only a journey that ends at its start has no average velocity', () => {
  const sort = L.story.at(-1) as SortScreen;
  assert.equal(sort.id, 'transfer');
  for (const item of sort.items) assert.equal(item.bin, ['lift', 'lap', 'ball'].includes(item.id) ? 'zero' : 'not', item.id);
});
