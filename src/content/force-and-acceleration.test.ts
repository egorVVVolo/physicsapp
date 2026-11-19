// Every number in "Force and acceleration" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forceAndAcceleration as L, ANSWERS as X, CAR, FRICTION, LAB, M, MARS, MOON_G, PULL, PULL2, ROCKET, TOW } from './force-and-acceleration.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { Question } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as Question;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = '\u00A0';
const A = `${NB}m${NB}s⁻²`;
const g = 9.81;
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('150 N against 100 N of friction: ΣF = 50 N, a = 1.25 m s⁻²', () => {
  near(X.sum1, PULL - FRICTION);
  near(X.first.right * M, X.sum1);
  assert.equal(label('first-a', 'right'), `1.25${A}`);
  assert.equal(label('first-a', 'pull-only'), `3.75${A}`);
  assert.equal(label('first-a', 'added'), `6.25${A}`);
  assert.equal(label('first-a', 'by-weight'), `0.127${A}`);
  assert.equal(right('first-a'), 'right');
});

test('the puzzle: twice the pull gives four times the acceleration, 5.00 m s⁻²', () => {
  near(X.second.right * M, PULL2 - FRICTION);
  near(X.second.right / X.first.right, 4);
  assert.equal(label('hook-again', 'right'), `5.00${A}`);
  assert.equal(label('hook-again', 'doubled'), `2.50${A}`);
  assert.equal(label('hook-again', 'pull-only'), `7.50${A}`);
  assert.equal(label('hook-again', 'same'), `1.25${A}`);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'more'));
});

test('on the Moon the mass and so the acceleration are the same: 1.25 m s⁻²', () => {
  near(X.moon.right, X.first.right);
  assert.equal(label('moon', 'smaller-mass'), `7.57${A}`);
  assert.equal(label('moon', 'moon-weight'), `0.772${A}`);
  near(X.moon.byMoonWeight, X.sum1 / (M * MOON_G));
});

test('the lab: a = 1.96 m s⁻², T = 1.57 N (less than the 1.96 N weight), then a steady 1.40 m s⁻¹', () => {
  const W = LAB.hanging * g;
  near(X.lab.a.right * (LAB.trolley + LAB.hanging), W);
  near(W - X.lab.T.right, LAB.hanging * X.lab.a.right); // the hanging mass: mg − T = ma
  near(X.lab.T.right, LAB.trolley * X.lab.a.right); // the trolley: T = Ma
  near(X.lab.vLand, Math.sqrt(2 * X.lab.a.right * LAB.drop));
  assert.equal(label('lab-a', 'right'), `1.96${A}`);
  assert.equal(label('lab-a', 'trolley-only'), `2.45${A}`);
  assert.equal(label('lab-a', 'by-weight'), `0.200${A}`);
  assert.equal(label('tension', 'right'), `1.57${NB}N`);
  assert.equal(label('tension', 'weight'), `1.96${NB}N`);
  assert.equal(label('tension', 'ma'), `0.392${NB}N`);
  assert.equal(label('tension', 'sum'), `2.35${NB}N`);
  assert.equal(label('slack', 'right'), 'It rolls on at a steady 1.40 m s⁻¹');
});

test('Skill check: tow bar 750 N, rocket 6.19 m s⁻², Mars 1.29 m s⁻², car 3000 N', () => {
  const towA = TOW.drive / (TOW.car + TOW.trailer);
  near(X.tow.right, TOW.trailer * towA);
  near(TOW.drive - X.tow.right, TOW.car * towA); // the car: drive − T = M a
  assert.equal(label('tow', 'right'), `750${NB}N`);
  assert.equal(label('tow', 'ratio'), `1091${NB}N`);
  assert.equal(label('tow', 'car'), `1650${NB}N`);
  near(X.rocket.right, (ROCKET.thrust - ROCKET.m * g) / ROCKET.m);
  assert.equal(label('rocket', 'right'), `6.19${A}`);
  assert.equal(label('rocket', 'no-weight'), `16.0${A}`);
  assert.equal(label('rocket', 'added'), `25.8${A}`);
  assert.equal(label('rocket', 'by-weight'), `0.631${A}`);
  near(X.mars.g, MARS.reading / MARS.m);
  near(X.mars.right, (MARS.lift - MARS.reading) / MARS.m);
  assert.equal(label('mars', 'right'), `1.29${A} upward`);
  assert.equal(label('mars', 'no-weight'), `5.00${A} upward`);
  assert.equal(label('mars', 'added'), `8.71${A} upward`);
  near(X.car.right, CAR.m * (CAR.v / CAR.t) + CAR.resist);
  assert.equal(label('car', 'right'), `3000${NB}N`);
  assert.equal(label('car', 'forgot'), `2400${NB}N`);
  assert.equal(label('car', 'subtracted'), `1800${NB}N`);
  assert.equal(label('car', 'mv'), `36000${NB}N`);
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
