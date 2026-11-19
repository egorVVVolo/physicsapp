// Every number in "Turning forces" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { turningForces as L, ANSWERS as X, BAR, BOLT, F, LEO, MIA, PEDAL, POLE, WHEEL } from './turning-forces.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { Question } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as Question;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = ' ';
const NM = `${NB}N${NB}m`;
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);
const RAD = Math.PI / 180;

test("Leo: 40 N at right angles, 0.20 m: 8.0 N m", () => {
  near(X.leo.right, F * LEO.r);
  assert.equal(label('leo', 'right'), `8.0${NM}`);
  assert.equal(label('leo', 'cm'), `800${NM}`);
  assert.equal(label('leo', 'divided'), `200${NM}`);
  assert.equal(label('leo', 'unit'), `8.0${NB}N`);
});

test('explore: along the handle the moment is zero, at right angles 12.0 N m', () => {
  near(X.explore.along, 0);
  near(X.explore.across, 12);
});

test("the puzzle: Mia's x is 0.15 m, 6.0 N m, less than Leo's 8.0", () => {
  near(X.puzzle.x, MIA.r * Math.sin(MIA.angle * RAD));
  near(X.puzzle.right, 6);
  assert.ok(X.puzzle.right < X.puzzle.leo);
  assert.equal(right('hook-again'), 'right');
  assert.equal(label('hook-again', 'right'), `Leo's: Mia's is only 6.0${NM}`);
  assert.equal(label('hook-again', 'point'), `Mia's: hers is 12.0${NM}`);
  assert.equal(label('hook-again', 'cos'), `Mia's: hers is 10.4${NM}`);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'leo'));
});

test('the sign on the pole: horizontal distance 1.73 m, 86.6 N m', () => {
  assert.equal(right('pole-x'), 'across');
  near(X.pole.x, POLE.L * Math.cos(POLE.angle * RAD));
  assert.equal(label('pole', 'right'), `86.6${NM}`);
  assert.equal(label('pole', 'along'), `100${NM}`);
  assert.equal(label('pole', 'height'), `50.0${NM}`);
});

test('the bar: 15.0 anticlockwise, 10.0 clockwise, resultant 5.0 anticlockwise', () => {
  near(X.bar.left, BAR.left.W * -BAR.left.at);
  near(X.bar.right, -BAR.right.W * BAR.right.at);
  near(X.bar.total, 5);
  assert.equal(label('bar', 'right'), `5.0${NM} anticlockwise`);
  assert.equal(label('bar', 'added'), `25.0${NM} anticlockwise`);
  assert.equal(label('bar', 'bigger'), `5.0${NM} clockwise`);
});

test('Skill check: pedal 25.5, wheel 7.2, bolt 0.42 m', () => {
  near(X.pedal.right, PEDAL.F * PEDAL.r * Math.cos(PEDAL.below * RAD));
  assert.equal(label('pedal', 'right'), `25.5${NM}`);
  assert.equal(label('pedal', 'length'), `51.0${NM}`);
  assert.equal(label('pedal', 'sin'), `44.2${NM}`);
  assert.equal(label('pedal', 'divided'), `1760${NM}`);
  near(X.wheel.right, 2 * WHEEL.F * (WHEEL.across / 2));
  assert.equal(label('wheel', 'right'), `7.2${NM}`);
  assert.equal(label('wheel', 'one'), `3.6${NM}`);
  assert.equal(label('wheel', 'diameter'), `14.4${NM}`);
  near(BOLT.F * Math.sin(BOLT.angle * RAD) * X.bolt.right, BOLT.M);
  assert.equal(label('bolt', 'right'), `0.42${NB}m`);
  assert.equal(label('bolt', 'ignored'), `0.36${NB}m`);
  assert.equal(label('bolt', 'cos'), `0.72${NB}m`);
  assert.equal(label('bolt', 'inverted'), `2.4${NB}m`);
  assert.equal(right('slide'), 'right');
});

test('the lesson is on the map and playable', () => {
  assert.equal(lessons[L.id], L);
  const ref = course.levels.flatMap((l) => l.lessons).find((r) => r.id === L.id);
  assert.ok(ref?.ready);
  assert.deepEqual(ref?.spec, L.spec);
});
