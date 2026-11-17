import { test } from 'node:test';
import assert from 'node:assert/strict';
import { weight, normalInLift, resultant, scaleKg, normalWithPull, ladderWallPush, frictionCoefficient } from './dynamics.ts';
import { G } from './kinematics.ts';

const near = (actual: number, expected: number, tol = 0.05) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected}, got ${actual}`);

test('weight of a 60 kg person is 588.6 N', () => {
  near(weight(60), 588.6);
});

test('lift at rest or at steady speed: N equals W', () => {
  near(normalInLift(60, 0), weight(60));
});

test('accelerating upward at 1.5 m s⁻²: N = 678.6 N', () => {
  near(normalInLift(60, 1.5), 678.6);
});

test('accelerating downward at 1.5 m s⁻²: N = 498.6 N', () => {
  near(normalInLift(60, -1.5), 498.6);
});

test('free fall: the floor stops pushing', () => {
  near(normalInLift(75, -G), 0);
  near(normalInLift(75, -12), 0);
});

test('N − W is the resultant force ma', () => {
  near(normalInLift(75, 2) - weight(75), resultant(75, 2));
});

test('scales in kg read the mass only when a = 0', () => {
  near(scaleKg(normalInLift(60, 0)), 60, 1e-9);
  assert.ok(scaleKg(normalInLift(60, 1.5)) > 60);
});

test('a rope pulling up at 30° takes part of the weight off the floor; a pole pushing down adds to it', () => {
  const w = weight(40); // 392.4 N
  assert.ok(Math.abs(normalWithPull(w, 120, 30) - 332.4) < 1e-9);
  assert.ok(Math.abs(normalWithPull(w, 120, -30) - 452.4) < 1e-9);
  assert.equal(normalWithPull(w, 120, 0), w);
  assert.equal(normalWithPull(w, 1000, 90), 0); // the floor cannot pull
});

test('a 12 kg ladder at 65° on a smooth wall: the wall pushes with 27.4 N', () => {
  const p = ladderWallPush(weight(12), 65);
  assert.ok(Math.abs(p - 27.447) < 0.001);
  // moments about the foot balance for any length L
  const L = 3;
  const a = (65 * Math.PI) / 180;
  assert.ok(Math.abs(weight(12) * (L / 2) * Math.cos(a) - p * L * Math.sin(a)) < 1e-9);
});

test('μ = F / N', () => {
  assert.equal(frictionCoefficient(30, 120), 0.25);
});
