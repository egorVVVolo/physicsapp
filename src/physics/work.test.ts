import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forceFromWork, liftWork, rampPush, workDone } from './work.ts';
import { weight } from './dynamics.ts';

const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('ΔW = FΔs along the motion', () => {
  near(workDone(150, 6), 900);
  near(workDone(40, 30), 1200);
});

test('at an angle only F cos θ counts; at right angles no work at all', () => {
  near(workDone(40, 30, 60), 600, 1e-9);
  assert.equal(workDone(147.15, 30, 90), 0);
  near(workDone(60, 25, 40), 1149.1, 0.05);
});

test('the work found back from the force, and the force from the work', () => {
  near(forceFromWork(workDone(157, 3), 3), 157);
});

test('a ramp: a smaller push over a longer distance does the same work as lifting', () => {
  const lift = liftWork(40, 1.2);
  near(lift, weight(40) * 1.2);
  for (const L of [1.6, 3, 4.8]) near(workDone(rampPush(40, 1.2, L), L), lift, 1e-9);
  near(rampPush(40, 1.2, 3), 156.96, 1e-9);
});
