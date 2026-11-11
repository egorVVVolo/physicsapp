import { test } from 'node:test';
import assert from 'node:assert/strict';
import { weight, normalInLift, resultant, scaleKg } from './dynamics.ts';
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
