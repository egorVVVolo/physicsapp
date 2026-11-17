import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dragAcceleration, dragConstantFor, dragForce, fallFromRest, peakDragRatio, skydive, skydiveSamples, terminalVelocity } from './drag.ts';

const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('terminal velocity: kv² = mg', () => {
  const k = dragConstantFor(70, 50);
  near(terminalVelocity(70, k), 50);
  near(dragForce(k, 50), 70 * 9.81);
});

test('four times the weight, same shape: twice the terminal velocity', () => {
  const k = dragConstantFor(0.0006, 1.2);
  near(terminalVelocity(4 * 0.0006, k), 2.4, 1e-12);
});

test('falling from rest: a = g at the start, v approaches vt, and v is the integral of a', () => {
  near(fallFromRest(0, 50).a, 9.81);
  assert.ok(fallFromRest(30, 50).v < 50 && fallFromRest(30, 50).v > 49.99);
  const dt = 1e-4;
  near((fallFromRest(3 + dt, 50).v - fallFromRest(3, 50).v) / dt, fallFromRest(3, 50).a, 1e-3);
  near((fallFromRest(3 + dt, 50).s - fallFromRest(3, 50).s) / dt, fallFromRest(3, 50).v, 1e-3);
  near(dragAcceleration(50, 50), 0);
});

test('the parachute: the speed settles at the new terminal velocity, drag peaks near 5 W', () => {
  const sd = { vt1: 50, vt2: 6, open: 15, inflate: 4 };
  near(skydive(15, sd).v, fallFromRest(15, 50).v);
  near(skydive(28, sd).v, 6, 1e-3);
  near(skydive(28, sd).dOverW, 1, 1e-3);
  assert.ok(skydive(15.5, sd).a < 0); // slowing down while still falling: the resultant is upward
  const peak = peakDragRatio(sd);
  assert.ok(peak > 4.9 && peak < 5.05, `peak ${peak}`);
});

test('the sampled skydive matches the direct one', () => {
  const sd = { vt1: 50, vt2: 6, open: 15, inflate: 4 };
  const table = skydiveSamples(sd, 30, 0.05);
  for (const t of [3, 15, 16.5, 21, 30]) {
    const row = table[Math.round(t / 0.05)];
    near(row.v, skydive(t, sd).v, 1e-6);
  }
});
