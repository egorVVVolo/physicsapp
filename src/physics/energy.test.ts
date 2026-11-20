import { test } from 'node:test';
import assert from 'node:assert/strict';
import { energyToFriction, heightForSpeed, kineticEnergy, potentialChange, slideAcceleration, slideSpeed, speedAfterDrop, speedFromKinetic } from './energy.ts';
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

test('conservation: v² = u² + 2gΔh, the same as the projectile model for any throw angle', async () => {
  const { landingSpeed } = await import('./projectile.ts');
  for (const angle of [45, 0, -45, 90]) near(landingSpeed({ u: 12, angle, h: 20 }), speedAfterDrop(12, 20), 1e-9);
  near(speedAfterDrop(0, 20), Math.sqrt(2 * 9.81 * 20));
  near(speedAfterDrop(6, -heightForSpeed(6)), 0, 1e-6);
});

test('energy to friction: GPE lost less the gain in Ek', () => {
  near(energyToFriction(25, 2.5, 0, 4), 25 * 9.81 * 2.5 - 200);
  near(energyToFriction(1, 5, 0, speedAfterDrop(0, 5)), 0, 1e-9);
});

test('the slide: the energy sum agrees with suvat at a = g h ÷ L − F ÷ m', () => {
  const [m, h, L, F] = [25, 2.5, 5, 82.625];
  near(slideSpeed(m, h, L, F), 4, 1e-9);
  near(Math.sqrt(2 * slideAcceleration(m, h, L, F) * L), slideSpeed(m, h, L, F), 1e-9);
  assert.equal(slideSpeed(m, h, 8, F), 0);
});
