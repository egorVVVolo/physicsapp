// Every number in "Kinetic and potential energy" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kineticAndPotentialEnergy as L, ANSWERS as X, CAR, HIKER, PARK, SERVE, TROLLEYS } from './kinetic-and-potential-energy.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { OptionQuestion } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = ' ';
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('the car at 10 m s⁻¹: 60.0 kJ', () => {
  near(X.ke10.right, 0.5 * CAR.m * CAR.v1 ** 2);
  assert.equal(label('ke10', 'right'), `60.0${NB}kJ`);
  assert.equal(label('ke10', 'halfMv'), `6.00${NB}kJ`);
  assert.equal(label('ke10', 'momentum'), `12.0${NB}kJ`);
  assert.equal(label('ke10', 'noHalf'), `120${NB}kJ`);
});

test('explore: twice the speed, four times the energy; the slider reaches both speeds', () => {
  near(X.explore.at20, 4 * X.explore.at10);
  const s = L.story.find((x) => x.id === 'square')!;
  assert.ok(s.kind === 'explore' && s.slider.min === 0 && s.slider.max === CAR.v2 && s.slider.start === CAR.v1);
});

test('the puzzle: 60.0 kJ, then 180 kJ, three times as much', () => {
  near(X.puzzle.second, 3 * X.puzzle.first, 1e-6);
  assert.equal(right('hook-again'), 'right');
  assert.equal(label('hook-again', 'right'), `60.0${NB}kJ, then 180${NB}kJ`);
  assert.equal(label('hook-again', 'linear'), `60.0${NB}kJ, then 60.0${NB}kJ`);
  assert.equal(label('hook-again', 'end'), `60.0${NB}kJ, then 240${NB}kJ`);
  assert.equal(label('hook-again', 'noHalf'), `120${NB}kJ, then 360${NB}kJ`);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'second'));
});

test('the car park: 106 kJ, only the rise counts', () => {
  near(X.park.right, CAR.m * 9.81 * PARK.up);
  assert.equal(label('car-park', 'right'), `106${NB}kJ`);
  assert.equal(label('car-park', 'along'), `1410${NB}kJ`);
  assert.equal(label('car-park', 'noG'), `10.8${NB}kJ`);
  assert.equal(label('car-park', 'half'), `53.0${NB}kJ`);
});

test('the crane: the bars meet at 20.4 m, inside the slider; the van needs the same height', () => {
  near(CAR.m * 9.81 * X.crane.height, X.crane.ek, 1e-6);
  const s = L.story.find((x) => x.id === 'crane')!;
  assert.ok(s.kind === 'explore' && s.slider.max > X.crane.height && s.slider.min === 0);
  assert.ok(s.question.right.includes(`20.4${NB}m`));
  assert.equal(label('van', 'right'), `20.4${NB}m, the same as the car`);
  assert.equal(label('van', 'heavier'), `10.2${NB}m: it is twice as heavy`);
  assert.equal(label('van', 'double'), `40.8${NB}m: it has twice the energy`);
  assert.equal(label('van', 'vOverG'), `2.04${NB}m`);
  near(X.machine, 40 * 9.81 * 1.2);
});

test('Skill check: cricket 98.0 J, hiker 274 kJ, serve 49.1 m s⁻¹, trolleys 1.52 m s⁻¹', () => {
  assert.equal(label('cricket', 'right'), `98.0${NB}J`);
  assert.equal(label('cricket', 'momentum'), `5.60${NB}J`);
  assert.equal(label('cricket', 'noHalf'), `196${NB}J`);
  assert.equal(label('cricket', 'notSquared'), `2.80${NB}J`);
  near(X.hiker.right, HIKER.m * 9.81 * HIKER.up);
  assert.equal(label('hiker', 'right'), `274${NB}kJ`);
  assert.equal(label('hiker', 'path'), `1460${NB}kJ`);
  assert.equal(label('hiker', 'noG'), `27.9${NB}kJ`);
  assert.equal(label('hiker', 'half'), `137${NB}kJ`);
  near(0.5 * SERVE.m * X.serve.right ** 2, SERVE.E, 1e-9);
  assert.equal(label('serve', 'right'), `49.1${NB}m s⁻¹`);
  assert.equal(label('serve', 'noTwo'), `34.7${NB}m s⁻¹`);
  assert.equal(label('serve', 'noRoot'), `2410${NB}m s⁻¹`);
  assert.equal(label('serve', 'divided'), `1210${NB}m s⁻¹`);
  near(0.5 * TROLLEYS.mB * X.trolleys.right ** 2, 0.5 * TROLLEYS.mA * TROLLEYS.vA ** 2, 1e-9);
  assert.equal(label('trolleys', 'right'), `1.52${NB}m s⁻¹`);
  assert.equal(label('trolleys', 'momentum'), `0.960${NB}m s⁻¹`);
  assert.equal(label('trolleys', 'flipped'), `3.79${NB}m s⁻¹`);
  assert.equal(label('trolleys', 'ratio'), `6.00${NB}m s⁻¹`);
});

test('the lesson is on the map and playable', () => {
  assert.equal(lessons[L.id]?.id, L.id);
  const ref = course.levels.flatMap((l) => l.lessons).find((r) => r.id === L.id);
  assert.ok(ref?.ready);
  assert.deepEqual(ref?.spec, L.spec);
});
