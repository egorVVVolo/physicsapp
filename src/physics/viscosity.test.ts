import { test } from 'node:test';
import assert from 'node:assert/strict';
import { glycerolViscosity, GLYCEROL_TABLE, reynolds, RHO_GLYCEROL, RHO_STEEL, sphereUpthrust, sphereVolume, sphereWeight, stokesDrag, stokesFall, stokesStream, stokesTerminal, streamlineOffset, turbulentTerminal, viscosityFromFall, viscosityFromForces } from './viscosity.ts';

const near = (a: number, b: number, tol = 1e-12) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test("Stokes' law: F = 6πηrv", () => {
  near(stokesDrag(1.41, 1e-3, 0.01), 6 * Math.PI * 1.41 * 1e-3 * 0.01);
  near(sphereVolume(1e-3), (4 / 3) * Math.PI * 1e-9);
});

test('at terminal velocity the drag fills the gap between the weight and the upthrust', () => {
  const r = 1e-3;
  const eta = 1.41;
  const v = stokesTerminal(r, RHO_STEEL, RHO_GLYCEROL, eta);
  near(stokesDrag(eta, r, v), sphereWeight(r, RHO_STEEL) - sphereUpthrust(r, RHO_GLYCEROL), 1e-15);
  near(v, (2 * r * r * (RHO_STEEL - RHO_GLYCEROL) * 9.81) / (9 * eta), 1e-15);
  // and the falling-ball method gives the viscosity back
  near(viscosityFromFall(r, RHO_STEEL, RHO_GLYCEROL, v), eta, 1e-12);
  near(viscosityFromForces(sphereWeight(r, RHO_STEEL), sphereUpthrust(r, RHO_GLYCEROL), r, v), eta, 1e-12);
});

test('twice the radius: 8 times the weight, 4 times the terminal velocity', () => {
  near(sphereWeight(2e-3, RHO_STEEL) / sphereWeight(1e-3, RHO_STEEL), 8, 1e-12);
  near(stokesTerminal(2e-3, RHO_STEEL, RHO_GLYCEROL, 1.41) / stokesTerminal(1e-3, RHO_STEEL, RHO_GLYCEROL, 1.41), 4, 1e-12);
  // a bubble rises: its terminal velocity is negative (up)
  assert.ok(stokesTerminal(0.5e-3, 1.2, RHO_GLYCEROL, 1.41) < 0);
});

test('from rest at the surface the ball is at its terminal velocity within milliseconds', () => {
  const f0 = stokesFall(0, 2e-3, RHO_STEEL, RHO_GLYCEROL, 1.41);
  assert.equal(f0.v, 0);
  assert.equal(f0.s, 0);
  assert.ok(f0.tau < 0.01);
  const f = stokesFall(1, 2e-3, RHO_STEEL, RHO_GLYCEROL, 1.41);
  near(f.v, f.vt, 1e-12);
  near(f.s, f.vt * (1 - f.tau), 1e-12);
});

test('in glycerol the flow round both balls is laminar; in water the small ball drops fast and turbulently', () => {
  for (const r of [1e-3, 2e-3]) assert.ok(reynolds(RHO_GLYCEROL, stokesTerminal(r, RHO_STEEL, RHO_GLYCEROL, 1.41), 2 * r, 1.41) < 0.2);
  const v = turbulentTerminal(1e-3, RHO_STEEL, 1000);
  assert.ok(v > 0.5 && v < 0.7);
  assert.ok(reynolds(1000, v, 2e-3, 0.001) > 1000);
});

test('glycerol: the measured values, and in between ln η runs straight', () => {
  for (const [T, eta] of GLYCEROL_TABLE) near(glycerolViscosity(T), eta, 1e-12);
  near(glycerolViscosity(25), Math.sqrt(1.41 * 0.612), 1e-12);
  // warmer is always runnier
  for (let T = 0; T < 50; T += 0.5) assert.ok(glycerolViscosity(T + 0.5) < glycerolViscosity(T));
});

test('Stokes streamlines: far away ψ = ½ρ², and every streamline keeps clear of the sphere', () => {
  near(stokesStream(1e6, 2, 1), 2, 1e-5);
  assert.equal(stokesStream(0, 0.5, 1), 0);
  for (const along of [-3, -1, 0, 1, 3]) {
    const off = streamlineOffset(along, 1.5, 1);
    assert.ok(Math.hypot(along, off) > 1);
    near(stokesStream(along, off, 1), 0.5 * 1.5 * 1.5, 1e-9);
  }
  // pushed out most beside the sphere, the same before and after it
  assert.ok(streamlineOffset(0, 1.5, 1) > streamlineOffset(3, 1.5, 1));
  near(streamlineOffset(-2, 1.5, 1), streamlineOffset(2, 1.5, 1), 1e-9);
});
