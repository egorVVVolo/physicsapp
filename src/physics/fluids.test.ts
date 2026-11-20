import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apparentWeight, density, densityByWeighing, floatingDisplacement, levelRise, massOf, RHO_WATER, submergedVolume, tankLevelFall, upthrust, volumeOf } from './fluids.ts';

const near = (a: number, b: number, tol = 1e-12) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('ρ = m ÷ V, and its two rearrangements agree', () => {
  near(volumeOf(0.78, 7800), 1.0e-4);
  near(density(0.78, 1.0e-4), 7800, 1e-9);
  near(massOf(1.2, 144), 172.8, 1e-9);
});

test('upthrust is the weight of the fluid displaced', () => {
  near(upthrust(RHO_WATER, 1.0e-4), 0.981, 1e-12);
  near(upthrust(1.2, 0.012), 0.012 * 1.2 * 9.81);
});

test('a block lowered into water: the submerged volume grows, then stops once it is under', () => {
  const base = 0.0025;
  const h = 0.04;
  assert.equal(submergedVolume(base, h, -0.01), 0);
  near(submergedVolume(base, h, 0.02), 5.0e-5);
  near(submergedVolume(base, h, 0.04), 1.0e-4);
  near(submergedVolume(base, h, 0.07), 1.0e-4);
  near(apparentWeight(7.6518, upthrust(RHO_WATER, 1.0e-4)), 7.6518 - 0.981, 1e-12);
});

test('a floating body displaces its own weight of fluid, whatever its density', () => {
  near(floatingDisplacement(0.78, RHO_WATER), 7.8e-4);
  near(upthrust(RHO_WATER, floatingDisplacement(0.78, RHO_WATER)), 0.78 * 9.81, 1e-12);
});

test('weighing in air and in water gives the density', () => {
  near(densityByWeighing(4.5, 2.7, RHO_WATER), 2500, 1e-9);
  // a steel block: 7800 kg m⁻³ back from its two readings
  const W = 0.78 * 9.81;
  near(densityByWeighing(W, W - upthrust(RHO_WATER, 1e-4), RHO_WATER), 7800, 1e-6);
});

test('the boat and the steel block: the level falls 1.36 cm; a load as dense as water leaves it', () => {
  near(tankLevelFall(0.78, 7800, 0.05), 0.0136, 1e-12);
  near(tankLevelFall(0.78, RHO_WATER, 0.05), 0, 1e-15);
  assert.ok(tankLevelFall(0.78, 11000, 0.05) > tankLevelFall(0.78, 7800, 0.05));
  near(levelRise(-6.8e-4, 0.05), -0.0136, 1e-12);
});
