import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flightTime, landingSpeed, launchParts, projectilePosition, projectileRange, projectileVelocity, timeToTop, topHeight } from './projectile.ts';

const near = (actual: number, expected: number, tol = 0.01) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected}, got ${actual}`);

test('rolled off a 1.25 m bench at 2.0 m s⁻¹: 0.505 s, 1.01 m; twice as fast, the same time', () => {
  const b = { u: 2, angle: 0, h: 1.25 };
  near(flightTime(b), 0.505, 0.001);
  near(projectileRange(b), 1.01, 0.005);
  near(flightTime({ ...b, u: 4 }), flightTime(b), 1e-12);
  near(flightTime({ ...b, u: 0 }), flightTime(b), 1e-12); // a dropped ball lands at the same moment
  near(projectilePosition(flightTime(b), b).y, 0, 1e-9);
});

test('20 m s⁻¹ at 30° and at 60°: 2.04 s and 3.53 s, both 35.3 m; 45° goes 40.8 m', () => {
  const mia = { u: 20, angle: 30, h: 0 };
  const leo = { u: 20, angle: 60, h: 0 };
  near(launchParts(mia).ux, 17.32);
  near(launchParts(mia).uy, 10.0);
  near(flightTime(mia), 2.04);
  near(flightTime(leo), 3.53);
  near(projectileRange(mia), 35.31);
  near(projectileRange(leo), projectileRange(mia), 1e-9);
  near(projectileRange({ u: 20, angle: 45, h: 0 }), 40.77);
  near(topHeight(leo), 15.29);
  near(timeToTop(mia), flightTime(mia) / 2, 1e-12);
});

test('the horizontal velocity never changes; at the top only the vertical part is zero', () => {
  const mia = { u: 20, angle: 30, h: 0 };
  const top = projectileVelocity(timeToTop(mia), mia);
  near(top.vy, 0, 1e-9);
  near(top.vx, launchParts(mia).ux, 1e-12);
});

test('off a 20 m cliff at 15 m s⁻¹: 2.02 s, 30.3 m, lands at 24.8 m s⁻¹', () => {
  const c = { u: 15, angle: 0, h: 20 };
  near(flightTime(c), 2.019, 0.001);
  near(projectileRange(c), 30.29);
  near(landingSpeed(c), 24.85);
});
