import { test } from 'node:test';
import assert from 'node:assert/strict';
import { heightForSpeed, kineticEnergy, potentialChange, speedFromKinetic } from './energy.ts';
import { workDone } from './work.ts';

const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('Ek = ½mv²: twice the speed, four times the energy', () => {
  near(kineticEnergy(1200, 10), 60000);
  near(kineticEnergy(1200, 20), 4 * kineticEnergy(1200, 10));
  assert.equal(kineticEnergy(5, 0), 0);
});

test('Ek is the work a steady force does from rest: FΔs with v² = 2aΔs', () => {
  const m = 2.5;
  const F = 8;
  const a = F / m;
  const s = 3.6;
  const v = Math.sqrt(2 * a * s);
  near(kineticEnergy(m, v), workDone(F, s));
});

test('the speed from a kinetic energy undoes ½mv²', () => {
  near(speedFromKinetic(1200, kineticEnergy(1200, 13.7)), 13.7, 1e-12);
  near(speedFromKinetic(0.058, 70), 49.13, 0.01);
});

test('ΔEp = mgΔh, negative when lowered', () => {
  near(potentialChange(40, 1.2), 40 * 9.81 * 1.2);
  near(potentialChange(2, -3), -2 * 9.81 * 3);
});

test('the height that matches a speed does not depend on the mass', () => {
  for (const m of [0.1, 1200, 2400]) near(potentialChange(m, heightForSpeed(20)), kineticEnergy(m, 20), 1e-6);
  near(heightForSpeed(20), 20.387, 0.001);
});
