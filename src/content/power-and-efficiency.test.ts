// Every number in "Power and efficiency" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { powerAndEfficiency as L, ANSWERS as X, CAR, EBIKE, LOAD, MOTOR, RIDE, SPEEDS, STAIRS, WINCH } from './power-and-efficiency.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { OptionQuestion } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = ' ';
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);
const g = 9.81;

test('each second Kira does 54.0 J against the air: 54.0 W', () => {
  near(X.perSecond.right, 9.0 * 6.0);
  near(X.perSecond.power, X.perSecond.right / 1);
  assert.equal(label('per-second', 'right'), `54.0${NB}J`);
  assert.equal(label('per-second', 'force'), `9.00${NB}J`);
  assert.equal(label('per-second', 'fOverV'), `1.50${NB}J`);
  assert.ok(label('per-second', 'zero').startsWith(`0${NB}J`));
  assert.ok(q('per-second').why.includes(`54.0${NB}W`));
});

test('explore: air resistance grows as v², 9.0 N → 36.0 N, within the slider', () => {
  near(X.faster.d2, 4 * X.faster.d1);
  near(X.faster.d1, 9.0);
  const s = L.story.find((x) => x.id === 'faster')!;
  assert.ok(s.kind === 'explore' && s.slider.min === SPEEDS.min && s.slider.max === SPEEDS.max && s.slider.start === RIDE.v);
  assert.ok(RIDE.fast <= SPEEDS.max);
  assert.ok(s.question.right.includes(`36.0${NB}N`));
});

test('the puzzle: twice the speed, eight times the power, 432 W', () => {
  near(X.puzzle.right, 8 * X.puzzle.same);
  assert.equal(right('hook-again'), 'right');
  assert.equal(label('hook-again', 'right'), `432${NB}W`);
  assert.equal(label('hook-again', 'speedOnly'), `108${NB}W`);
  assert.equal(label('hook-again', 'forceOnly'), `216${NB}W`);
  assert.ok(label('hook-again', 'same').startsWith(`54.0${NB}W`));
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'eight'));
});

test('the winch: 785 W useful from 1.20 kW is 65.4% efficient; 415 W heats the motor', () => {
  near(X.winch.right, (WINCH.m * g * WINCH.h) / WINCH.t);
  assert.equal(label('winch', 'right'), `785${NB}W`);
  assert.equal(label('winch', 'energy'), `9.42${NB}kW`);
  assert.equal(label('winch', 'mass'), `80.0${NB}W`);
  assert.equal(label('winch', 'timesT'), `113${NB}kW`);
  near(X.efficient.right, X.winch.right / WINCH.input);
  assert.ok(X.efficient.right < 1 && X.efficient.upside > 1);
  assert.equal(label('efficient', 'right'), '65.4%');
  assert.equal(label('efficient', 'upside'), '153%');
  assert.equal(label('efficient', 'wasted'), '34.6%');
  assert.equal(label('efficient', 'mass'), '6.67%');
  assert.ok(q('efficient').why.includes(`415${NB}W`));
});

test('explore: the same useful power lifts twice the load at half the speed', () => {
  near(X.heavier.double, X.heavier.v / 2);
  near(X.heavier.v, WINCH.h / WINCH.t);
  const s = L.story.find((x) => x.id === 'heavier')!;
  assert.ok(s.kind === 'explore' && s.slider.min === LOAD.min && s.slider.max === LOAD.max && s.slider.start === WINCH.m);
  assert.ok(2 * WINCH.m <= LOAD.max);
  assert.ok(s.question.right.includes(`0.333${NB}m${NB}s⁻¹`));
});

test('Skill check: stairs 855 W, car 1.20 kN, motor 3.68 kJ, e-bike 30.0 N', () => {
  near(X.stairs.right, (STAIRS.m * g * STAIRS.h) / STAIRS.t);
  assert.equal(label('stairs', 'right'), `855${NB}W`);
  assert.equal(label('stairs', 'mass'), `87.2${NB}W`);
  assert.equal(label('stairs', 'energy'), `2.74${NB}kW`);
  assert.equal(label('stairs', 'timesT'), `8.76${NB}kW`);
  near(X.car.right * CAR.v, CAR.P);
  assert.equal(label('car', 'right'), `1.20${NB}kN`);
  assert.equal(label('car', 'timesV'), `750${NB}kN`);
  assert.equal(label('car', 'overV2'), `48.0${NB}N`);
  near(X.motor.right * MOTOR.eff, MOTOR.m * g * MOTOR.h);
  assert.equal(label('motor', 'right'), `3.68${NB}kJ`);
  assert.equal(label('motor', 'useful'), `1.47${NB}kJ`);
  assert.equal(label('motor', 'times'), `589${NB}J`);
  assert.equal(label('motor', 'wasted'), `2.45${NB}kJ`);
  near(X.ebike.right * EBIKE.v, EBIKE.input * EBIKE.eff);
  assert.equal(label('ebike', 'right'), `30.0${NB}N`);
  assert.equal(label('ebike', 'noEff'), `37.5${NB}N`);
  assert.equal(label('ebike', 'divided'), `46.9${NB}N`);
  assert.equal(label('ebike', 'timesV'), `1.92${NB}kN`);
});

test('the lesson is on the map and playable', () => {
  assert.equal(lessons[L.id]?.id, L.id);
  const ref = course.levels.flatMap((l) => l.lessons).find((r) => r.id === L.id);
  assert.ok(ref?.ready);
  assert.deepEqual(ref?.spec, L.spec);
});
