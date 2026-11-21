import { test } from 'node:test';
import assert from 'node:assert/strict';
import { breakingForce, COPPER, E_COPPER, elasticRecovery, loadingStress, permanentStrain, unloadingStress } from './materials.ts';

const near = (a: number, b: number, rel = 1e-9) => assert.ok(Math.abs(a - b) <= rel * Math.abs(b) + 1e-15, `expected ${b}, got ${a}`);

test('loading: straight with slope E to the yield, then on to 240 MPa at 5.0 × 10⁻³', () => {
  near(loadingStress(1.0e-3), 120e6);
  near(loadingStress(COPPER.yieldStrain), 180e6);
  near(loadingStress(5.0e-3), 240e6);
});

test('only σ ÷ E springs back: 2.0 × 10⁻³ of the 5.0 × 10⁻³, 3.0 × 10⁻³ stays', () => {
  near(elasticRecovery(240e6), 2.0e-3);
  near(permanentStrain(5.0e-3), 3.0e-3);
  near(permanentStrain(5.0e-3) * 1.5, 4.5e-3); // a 1.50 m wire stays 4.50 mm longer
});

test('below the yield it springs back completely', () => {
  assert.equal(permanentStrain(1.0e-3), 0);
  assert.equal(permanentStrain(COPPER.yieldStrain), 0);
  assert.ok(permanentStrain(3.0e-3) > 0 && permanentStrain(3.0e-3) < 3.0e-3);
});

test('unloading runs parallel to the straight part, ends on the axis at the permanent strain', () => {
  const eps = 5.0e-3;
  near(unloadingStress(eps, eps), 240e6);
  near(unloadingStress(eps, 4.0e-3), 240e6 - E_COPPER * 1.0e-3);
  near(unloadingStress(eps, permanentStrain(eps)), 0);
  // the slope of the unloading line is E
  near((unloadingStress(eps, 5.0e-3) - unloadingStress(eps, 4.0e-3)) / 1.0e-3, E_COPPER);
});

test('the largest load is UTS × area: 171 N for a 0.80 mm wire of 340 MPa', () => {
  near(breakingForce(340e6, 0.8e-3), 340e6 * Math.PI * 0.4e-3 ** 2);
  assert.equal(Math.round(breakingForce(340e6, 0.8e-3)), 171);
  near(breakingForce(340e6, 1.6e-3) / breakingForce(340e6, 0.8e-3), 4);
});
