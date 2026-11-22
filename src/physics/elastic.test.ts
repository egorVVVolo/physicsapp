import { test } from 'node:test';
import assert from 'node:assert/strict';
import { areaUnder, bandForce, elasticEnergy, energyForForce, launchSpeed, riseHeight, springEnergy } from './elastic.ts';

const near = (a: number, b: number, rel = 1e-9) => assert.ok(Math.abs(a - b) <= rel * Math.abs(b), `expected ${b}, got ${a}`);

test('½FΔx = ½kΔx²: the launcher stores 0.18 J at 3.0 cm', () => {
  near(elasticEnergy(12, 0.03), 0.18);
  near(springEnergy(400, 0.03), 0.18);
  near(energyForForce(12, 400), 0.18);
});

test('twice the squash, four times the energy', () => {
  near(springEnergy(400, 0.06) / springEnergy(400, 0.03), 4);
  near(springEnergy(400, 0.06), 0.72);
  // the second 2.0 cm adds three times the first
  near((springEnergy(50, 0.04) - springEnergy(50, 0.02)) / springEnergy(50, 0.02), 3);
});

test('the same force: the softer spring stores twice as much', () => {
  near(energyForForce(12, 400) / energyForForce(12, 800), 2);
});

test('the energy becomes kinetic or potential energy', () => {
  near(launchSpeed(0.72, 0.02), Math.sqrt(72));
  near(launchSpeed(0.72, 0.02) / launchSpeed(0.18, 0.02), 2);
  near(riseHeight(0.18, 0.02, 9.81), 0.18 / (0.02 * 9.81));
});

test('the area under a straight line is the triangle; the band needs the area under its curve', () => {
  near(areaUnder((x) => 400 * x, 0, 0.03), 0.18, 1e-9);
  near(bandForce(0.2), 8);
  const band = areaUnder(bandForce, 0, 0.2);
  assert.ok(band < elasticEnergy(8, 0.2)); // below the triangle through the end point
  near(band, 0.2 * 8 * (0.55 * (2 / 3) + 0.45 / 4), 1e-4); // √x at the origin: Simpson is close, not exact
});
