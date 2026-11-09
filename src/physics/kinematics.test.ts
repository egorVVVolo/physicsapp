import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G, position, velocity, timesForDisplacement, timeAtRest, timeToReach } from './kinematics.ts';

const near = (actual: number, expected: number, tol = 0.005) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected}, got ${actual}`);

// Balloon task: sandbag released at 30 m from a balloon rising at 4.0 m s⁻¹, up positive.
const bag = { s0: 30, u: 4, a: -G };

test('top of the rise', () => {
  near(timeAtRest(bag)!, 0.408);
  near(position(timeAtRest(bag)!, bag), 30.82);
});

test('back at release height after twice the rise time', () => {
  near(timeToReach(30, bag)!, 0.815);
  near(velocity(timeToReach(30, bag)!, bag), -4.0);
});

test('lands at 2.91 s, moving at 24.6 m s⁻¹ down', () => {
  const t = timeToReach(0, bag)!;
  near(t, 2.91);
  near(velocity(t, bag), -24.59, 0.01);
});

test('both roots of −30 = 4t − 4.905t²', () => {
  const [a, b] = timesForDisplacement(-30, 4, -G);
  near(a, 2.91);
  near(b, -2.1);
});

test('wrong answers: from rest lands at 2.47 s, real bag still 9.9 m up', () => {
  const t = timeToReach(0, { s0: 30, u: 0, a: -G })!;
  near(t, 2.47);
  near(position(t, bag), 9.9, 0.05);
});

test('wrong signs give no solution', () => {
  assert.deepEqual(timesForDisplacement(30, 4, -G), []);
});
