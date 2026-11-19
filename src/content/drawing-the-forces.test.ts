// Every number in "Drawing the forces" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drawingTheForces as L, ANSWERS as X, ANGLE, BOOK, ICE, LADDER, M, PULL, SIGN, SLOPE } from './drawing-the-forces.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { Question } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as Question;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = '\u00A0';
const rad = Math.PI / 180;
const g = 9.81;
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('the crate: W = 392 N, the rope gives 103.9 N forward and 60.0 N up', () => {
  near(X.weight, M * g);
  near(X.forward, PULL * Math.cos(ANGLE * rad));
  near(X.up, PULL * Math.sin(ANGLE * rad));
});

test('friction at steady speed is the forward part: 104 N, not 120 N', () => {
  near(X.friction.right, X.forward);
  assert.equal(label('friction', 'right'), `104${NB}N`);
  assert.equal(label('friction', 'whole'), `120${NB}N`);
  assert.equal(label('friction', 'sin'), `60.0${NB}N`);
  assert.equal(right('friction'), 'right');
});

test('the puzzle: the floor pushes 332 N, less than the weight', () => {
  near(X.normal.right + X.up, X.weight); // up and down balance
  assert.ok(X.normal.right < X.weight);
  assert.equal(label('hook-again', 'right'), `332${NB}N`);
  assert.equal(label('hook-again', 'weight'), `392${NB}N`);
  assert.equal(label('hook-again', 'rope-down'), `452${NB}N`);
  assert.equal(label('hook-again', 'cos'), `288${NB}N`);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.equal(hook.kind, 'predict');
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'smaller'));
});

test('a pole pushing down at 30° makes the floor push 452 N', () => {
  near(X.pole.right, X.weight + X.up);
  assert.equal(label('push', 'right'), `452${NB}N`);
  assert.equal(label('push', 'copied'), `332${NB}N`);
  assert.equal(label('push', 'cos'), `496${NB}N`);
});

test('the ladder: the smooth wall pushes 27.4 N; friction 27.4 N towards the wall; N = W = 118 N', () => {
  const w = LADDER.m * g;
  const a = LADDER.angle * rad;
  near(w * 0.5 * Math.cos(a), X.ladder.wall * Math.sin(a)); // moments about the foot
  near(X.ladder.friction, X.ladder.wall);
  near(X.ladder.normal, w);
  assert.equal(label('foot', 'right'), `27.4${NB}N towards the wall`);
  assert.equal(right('wall'), 'normal');
});

test('the box on ice: the resultant is 80 N to the left, the motion cannot be told', () => {
  assert.equal(X.ice.resultant, ICE.b - ICE.a);
  near(X.ice.weight, ICE.m * g);
  assert.equal(right('ice'), 'right');
});

test('Skill check: sign 38.4 N, slope 20.7 N, book 11.8 N, thrown ball: weight only', () => {
  const sw = SIGN.m * g;
  near(2 * X.sign.right * Math.sin(SIGN.angle * rad), sw);
  assert.equal(label('sign', 'right'), `38.4${NB}N`);
  assert.equal(label('sign', 'half'), `29.4${NB}N`);
  assert.equal(label('sign', 'cos'), `45.8${NB}N`);
  near(X.slope.right, SLOPE.m * g * Math.sin(SLOPE.angle * rad));
  assert.equal(label('slope', 'right'), `20.7${NB}N up the slope`);
  assert.equal(label('slope', 'cos'), `44.5${NB}N up the slope`);
  near(X.book.right, BOOK.m * g);
  assert.equal(label('book', 'right'), `11.8${NB}N upward`);
  assert.equal(label('book', 'sum'), `41.8${NB}N upward`);
  assert.equal(right('thrown'), 'right');
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
  assert.equal(lessons[L.id]?.id, L.id);
  assert.ok(course.levels.flatMap((lv) => lv.lessons).some((l) => l.id === L.id && l.ready));
});
