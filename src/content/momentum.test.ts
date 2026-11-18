// Every number in "Momentum" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { momentumLesson as L, ANSWERS as X, BACK, BOWLING, C, CRICKET, DROP, M, SKATERS, TENNIS, U } from './momentum.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { Question } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as Question;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = ' ';
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
  assert.equal(label('back-p', 'right'), `−0.80${P}`);
  assert.equal(label('back-p', 'plus'), `+0.80${P}`);
  assert.equal(label('back-p', 'zero'), `0${P}`);
  assert.equal(label('back-p', 'before'), `−1.20${P}`);
  assert.equal(right('back-p'), 'right');
});

test('B stops: Δp = −1.20; the puzzle: A bounces, Δp = −2.00, the bigger change', () => {
  near(X.stop.right, 0 - M * U);
  assert.equal(label('stop-dp', 'right'), `−1.20${P}`);
  assert.equal(label('stop-dp', 'reversed'), `+1.20${P}`);
  near(X.bounce.right, -M * BACK - M * U);
  assert.ok(Math.abs(X.bounce.right) > Math.abs(X.stop.right));
  assert.equal(label('hook-again', 'right'), `−2.00${P}`);
  assert.equal(label('hook-again', 'sizes'), `−0.40${P}`);
  assert.equal(label('hook-again', 'reversed'), `+2.00${P}`);
  assert.equal(label('hook-again', 'like-b'), `−1.20${P}`);
  near(X.explore.full, 2 * X.explore.stop);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'A'));
});

test('the bowling ball has more momentum than the cricket ball; A and C cancel', () => {
  near(X.balls.cricket, CRICKET.m * CRICKET.v);
  near(X.balls.bowling, BOWLING.m * BOWLING.v);
  assert.ok(X.balls.bowling > X.balls.cricket);
  assert.equal(right('heavy-fast'), 'right');
  near(X.headOn.right, M * U + C.m * C.v);
  assert.equal(label('head-on', 'right'), `0${P}`);
  assert.equal(label('head-on', 'sizes'), `2.40${P}`);
  assert.equal(label('head-on', 'a-only'), `1.20${P}`);
});

test('Skill check: car 18.0 m s⁻¹, tennis 3.02, drop 5.89 downward, skaters 10 east', () => {
  assert.equal(label('car', 'right'), `18.0${V}`);
  assert.equal(label('car', 'm-over-p'), `0.0556${V}`);
  assert.equal(label('car', 'twice'), `36.0${V}`);
  assert.equal(label('car', 'times'), `4.05 × 10⁷${V}`);
  near(X.tennis.right, TENNIS.m * (TENNIS.u + TENNIS.v));
  assert.equal(label('tennis', 'right'), `3.02${P}`);
  assert.equal(label('tennis', 'speeds'), `0.464${P}`);
  assert.equal(label('tennis', 'before'), `1.74${P}`);
  assert.equal(label('tennis', 'after'), `1.28${P}`);
  near(X.drop.right, DROP.m * g * DROP.t);
  assert.equal(label('drop', 'right'), `5.89${P} downward`);
  assert.equal(label('drop', 'mt'), `0.600${P} downward`);
  assert.equal(label('drop', 'weight'), `4.91${P} downward`);
  assert.equal(label('drop', 'average'), `2.94${P} downward`);
  near(X.skaters.right, SKATERS.a.m * SKATERS.a.v + SKATERS.b.m * SKATERS.b.v);
  assert.equal(label('skaters', 'right'), `10${P} east`);
  assert.equal(label('skaters', 'sizes'), `410${P} east`);
});

test('every option label is different within a question', () => {
  for (const s of all) {
    if (s.kind === 'choice' || s.kind === 'tapFig') {
      const labels = s.options.map((o) => o.label);
      assert.equal(new Set(labels).size, labels.length, `${s.id}: two options read the same: ${labels.join(' | ')}`);
    }
  }
});

test('the lesson is playable from the map', () => {
  assert.equal(lessons[L.id], L);
  assert.ok(course.levels.flatMap((lv) => lv.lessons).some((l) => l.id === L.id && l.ready));
});
