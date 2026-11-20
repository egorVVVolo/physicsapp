import { test } from 'node:test';
import assert from 'node:assert/strict';
import { efficiency, inputFor, liftPower, liftSpeed, outputFor, power, powerFromForce } from './power.ts';
import { dragForce } from './drag.ts';
import { potentialChange } from './energy.ts';
import { workDone } from './work.ts';

const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('P = ΔW ÷ Δt, and P = Fv is the work done in one second', () => {
  near(power(potentialChange(62, 4.5), 3.2), 855.31, 0.01);
  for (const [F, v] of [[9, 6], [36, 12], [1200, 25]]) near(powerFromForce(F, v), power(workDone(F, v * 1), 1));
});

test('against air resistance D = kv², twice the speed costs eight times the power', () => {
  const k = 0.25;
  near(powerFromForce(dragForce(k, 6), 6), 54);
  near(powerFromForce(dragForce(k, 12), 12), 432);
  near(powerFromForce(dragForce(k, 12), 12) / powerFromForce(dragForce(k, 6), 6), 8);
});

test('efficiency is useful ÷ total; input and output found back from it', () => {
  near(efficiency(784.8, 1200), 0.654);
  near(inputFor(outputFor(1200, 0.654), 0.654), 1200);
  near(inputFor(potentialChange(30, 5), 0.4), 3678.75);
  near(outputFor(300, 0.8) / 8, 30);
});

test('lifting at a steady speed: P = mgv, and the same power lifts twice the load at half the speed', () => {
  const P = power(potentialChange(120, 8), 12);
  near(liftPower(120, 8 / 12), P);
  near(liftSpeed(P, 120), 8 / 12);
  near(liftSpeed(P, 240), liftSpeed(P, 120) / 2);
});
