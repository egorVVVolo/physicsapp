// Every number in "Collisions" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collisions as L, ANSWERS as X, A, APART, ASTRONAUT, B, BOUNCE, C, D, GLIDERS, WAGONS } from './collisions.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { Question } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as Question;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = ' ';
const V = `${NB}m${NB}s⁻¹`;
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);
/** Total momentum before = total after, worked out by hand for each case. */
const conserved = (m1: number, u1: number, v1: number, m2: number, u2: number, v2: number) => near(m1 * u1 + m2 * u2, m1 * v1 + m2 * v2);

test('A sticks to B at rest: 0.75 m s⁻¹; the explore keeps Σp at 1.20', () => {
  conserved(A.m, A.u, X.stick.right, B.m, 0, X.stick.right);
  assert.equal(label('stick', 'right'), `0.75${V}`);
  assert.equal(label('stick', 'one-mass'), `1.50${V}`);
  assert.equal(label('stick', 'momentum'), `1.20${V}`);
  near(X.explore.total, A.m * A.u);
  near(X.explore.light, 1.2);
  near(X.explore.heavy, 0.375);
});

test('head-on with D: 0.50 m s⁻¹ to the right', () => {
  conserved(A.m, A.u, X.headOn.right, D.m, D.u, X.headOn.right);
  assert.equal(label('head-on', 'right'), `0.50${V} to the right`);
  assert.equal(label('head-on', 'left'), `0.50${V} to the left`);
  assert.equal(label('head-on', 'sizes'), `1.50${V} to the right`);
});

test('the puzzle: A and C stop dead', () => {
  near(X.puzzle.right, 0);
  conserved(A.m, A.u, 0, C.m, C.u, 0);
  assert.equal(right('hook-again'), 'right');
  assert.equal(label('hook-again', 'averaged'), `0.25${V} to the right`);
  assert.equal(label('hook-again', 'sizes'), `1.20${V} to the right`);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'stop'));
});

test('pushed apart: C at 0.60 right; the bounce: C at 1.20 right', () => {
  conserved(A.m, 0, APART.vA, C.m, 0, X.apart.right);
  assert.equal(label('spring', 'right'), `0.60${V} to the right`);
  assert.equal(label('spring', 'same'), `0.90${V} to the right`);
  assert.equal(label('spring', 'swapped'), `1.35${V} to the right`);
  assert.equal(label('spring', 'left'), `0.60${V} to the left`);
  conserved(A.m, A.u, BOUNCE.vA, C.m, 0, X.bounce.right);
  assert.equal(label('bounce', 'right'), `1.20${V} to the right`);
  assert.equal(label('bounce', 'sign'), `0.80${V} to the right`);
  assert.equal(label('bounce', 'left-out'), `1.00${V} to the right`);
  assert.equal(label('bounce', 'a-speed'), `1.5${V} to the right`);
});

test('Skill check: wagons 1.88, astronaut 0.150 opposite, gliders 1.0 right', () => {
  conserved(WAGONS.m1, WAGONS.u, X.wagons.right, WAGONS.m2, 0, X.wagons.right);
  assert.equal(label('wagons', 'right'), `1.88${V}`);
  assert.equal(label('wagons', 'other'), `5.00${V}`);
  assert.equal(label('wagons', 'half'), `1.50${V}`);
  assert.equal(label('wagons', 'swapped'), `1.13${V}`);
  conserved(ASTRONAUT.wrench, 0, ASTRONAUT.v, ASTRONAUT.m, 0, X.astronaut.right);
  assert.equal(label('astronaut', 'right'), `0.150${V}, opposite to the wrench`);
  assert.equal(label('astronaut', 'both'), `0.146${V}, opposite to the wrench`);
  conserved(GLIDERS.m1, GLIDERS.u1, X.gliders.right, GLIDERS.m2, GLIDERS.u2, GLIDERS.v2);
  assert.equal(label('gliders', 'right'), `1.0${V} to the right`);
  assert.equal(label('gliders', 'signs'), `3.0${V} to the right`);
  assert.equal(label('gliders', 'left-out'), `2.0${V} to the right`);
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
