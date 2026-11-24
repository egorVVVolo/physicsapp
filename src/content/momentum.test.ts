// Every number in "Momentum" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { momentumLesson as L, ANSWERS as X, BACK, BOWLING, C, CRICKET, DROP, M, REBOUND, SKATERS, TENNIS, U } from './momentum.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { BuildScreen, EstimateScreen, ExamCardScreen, OptionQuestion, SpotErrorScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const NB = ' ';
const P = `${NB}kg${NB}m${NB}s⁻¹`;
const V = `${NB}m${NB}s⁻¹`;
const g = 9.81;
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('A before the hit: p = mv = 1.20 kg m s⁻¹', () => {
  near(X.first.right, M * U);
  assert.equal(label('first-p', 'right'), `1.20${P}`);
  assert.equal(label('first-p', 'm-over-v'), `0.533${P}`);
  assert.equal(label('first-p', 'newton'), `1.20${NB}N`);
  assert.equal(label('first-p', 'v-over-m'), `1.88${P}`);
});

test('A after the bounce: −0.80 kg m s⁻¹', () => {
  near(X.back.right, -M * BACK);
});

test('B stops (built): Δp = 0.80 × (0 − 1.5) = −1.20, the signs as chips', () => {
  const b = build('stop-build');
  near(b.result.value, M * (0 - U));
  near(X.stop.right, b.result.value);
  assert.deepEqual(b.boxes, { m: 'mass', v: 'final', u: 'initial' });
  assert.equal(chip(b, 'mass'), `0.80${NB}kg`);
  assert.equal(chip(b, 'final'), `0${V}`);
  assert.equal(chip(b, 'initial'), `+1.5${V}`);
  assert.equal(chip(b, 'wrongway'), `−1.5${V}`);
  assert.equal(chip(b, 'p'), `1.20${P}`);
});

test('the puzzle (an estimate): A bounces, Δp = −2.00, the bigger change; the scale does not start on the answer', () => {
  near(X.bounce.right, -M * BACK - M * U);
  assert.ok(Math.abs(X.bounce.right) > Math.abs(X.stop.right));
  const est = L.story.find((s) => s.id === 'hook-again') as EstimateScreen;
  near(est.answer, -2);
  assert.ok(est.scale.min < est.answer && est.scale.max > est.answer);
  assert.notEqual((est.scale.min + est.scale.max) / 2, est.answer);
  assert.ok(est.why.includes(`−2.00${P}`));
  near(X.explore.full, 2 * X.explore.stop);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.find((o) => o.id === 'A')!.correct);
});

test("Ravi drops the sign of A's rebound velocity: −0.40 instead of −2.00", () => {
  near(X.bounce.sizes, M * (BACK - U));
  assert.equal(X.bounce.sizes.toFixed(2), '-0.40');
  const s = L.story.find((x) => x.id === 'dropped-sign') as SpotErrorScreen;
  const wrong = s.lines.find((l) => l.wrong)!;
  assert.equal(wrong.id, 'v');
  assert.ok(wrong.fix!.includes(`−1.0${V}`));
  assert.ok(s.lines.find((l) => l.id === 'calc')!.text.endsWith(`−0.40${P}`));
  assert.ok(s.why.includes(`−2.00${P}`));
});

test('the bowling ball has more momentum than the cricket ball', () => {
  near(X.balls.cricket, CRICKET.m * CRICKET.v);
  near(X.balls.bowling, BOWLING.m * BOWLING.v);
  assert.ok(X.balls.bowling > X.balls.cricket);
  assert.equal(right('heavy-fast'), 'right');
});

test('A and C cancel (built): Σp = 0.80 × 1.5 + 1.20 × (−1.0) = 0', () => {
  const b = build('head-on');
  near(X.headOn.right, M * U + C.m * C.v);
  near(b.result.value, 0);
  assert.equal(chip(b, 'uA'), `+1.5${V}`);
  assert.equal(chip(b, 'uC'), `−1.0${V}`);
  assert.equal(chip(b, 'plusC'), `+1.0${V}`);
});

test('Skill check: skaters +10 (built), drop 5.89 (spot the error), tennis 3.02, exam card −1.00', () => {
  const b = build('skaters');
  near(b.result.value, SKATERS.a.m * SKATERS.a.v + SKATERS.b.m * SKATERS.b.v);
  near(b.result.value, 10);
  assert.equal(chip(b, 'uA'), `+3.0${V}`);
  assert.equal(chip(b, 'uB'), `−4.0${V}`);
  assert.equal(chip(b, 'plusB'), `+4.0${V}`);
  const s = all.find((x) => x.id === 'drop-error') as SpotErrorScreen;
  const wrong = s.lines.find((l) => l.wrong)!;
  assert.equal(wrong.id, 'p');
  assert.ok(wrong.text.includes(`0.60${P}`));
  assert.ok(wrong.fix!.includes(`5.89${P}`));
  near(X.drop.right, DROP.m * g * DROP.t);
  near(X.tennis.right, TENNIS.m * (TENNIS.u + TENNIS.v));
  assert.equal(label('tennis', 'right'), `3.02${P} away from the wall`);
  assert.equal(label('tennis', 'speeds'), `0.464${P} away from the wall`);
  assert.equal(label('tennis', 'before'), `1.74${P} away from the wall`);
  assert.equal(label('tennis', 'toward'), `3.02${P} towards the wall`);
  const card = all.find((x) => x.id === 'rebound') as ExamCardScreen;
  const [a, bb] = card.parts;
  assert.ok(a.kind === 'build' && bb.kind === 'order');
  near(X.rebound.right, REBOUND.m * (-REBOUND.back - REBOUND.u));
  near(X.rebound.right, -1);
  assert.ok(Math.abs(X.rebound.right) > Math.abs(X.rebound.p0));
  if (a.kind === 'build') {
    near(a.build.result.value, X.rebound.right);
    assert.equal(chip(a.build, 'final'), `−0.6${V}`);
    assert.equal(chip(a.build, 'initial'), `+1.4${V}`);
  }
  assert.equal(a.marks + bb.marks, 4);
});

test('every option label is different within a question', () => {
  for (const s of all) {
    if (s.kind === 'choice' || s.kind === 'tapFig') {
      const labels = s.options.map((o) => o.label);
      assert.equal(new Set(labels).size, labels.length, `${s.id}: two options read the same: ${labels.join(' | ')}`);
    }
    if (s.kind === 'build') {
      const labels = s.chips.map((c) => c.label);
      assert.equal(new Set(labels).size, labels.length, `${s.id}: two chips read the same: ${labels.join(' | ')}`);
    }
  }
});

test('the lesson is playable from the map', () => {
  assert.equal(lessons[L.id]?.id, L.id);
  assert.ok(course.levels.flatMap((lv) => lv.lessons).some((l) => l.id === L.id && l.ready));
});
