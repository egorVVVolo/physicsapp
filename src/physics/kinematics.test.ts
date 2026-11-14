import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G, position, velocity, timesForDisplacement, timeAtRest, timeToReach } from './kinematics.ts';

const near = (actual: number, expected: number, tol = 0.005) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected}, got ${actual}`);

// Balloon task: sandbag released at 30 m from a balloon rising at 4.0 m s⁻¹, up positive.
const bag = { s0: 30, u: 4, a: -G };

test('top of the rise', () => {
  near(timeAtRest(bag)!, 0.408);
  near(position(timeAtRest(bag)!, bag), 30.82);
});

test('back at release height after twice the rise time', () => {
  near(timeToReach(30, bag)!, 0.815);
  near(velocity(timeToReach(30, bag)!, bag), -4.0);
});

test('lands at 2.91 s, moving at 24.6 m s⁻¹ down', () => {
  const t = timeToReach(0, bag)!;
  near(t, 2.91);
  near(velocity(t, bag), -24.59, 0.01);
});

test('both roots of −30 = 4t − 4.905t²', () => {
  const [a, b] = timesForDisplacement(-30, 4, -G);
  near(a, 2.91);
  near(b, -2.1);
});

test('wrong answers: from rest lands at 2.47 s, real bag still 9.9 m up', () => {
  const t = timeToReach(0, { s0: 30, u: 0, a: -G })!;
  near(t, 2.47);
  near(position(t, bag), 9.9, 0.05);
});

test('wrong signs give no solution', () => {
  assert.deepEqual(timesForDisplacement(30, 4, -G), []);
});

import { initialVelocityFor, motionStop, relationFits, trackPosition, trackVelocity } from './kinematics.ts';

const close = (a: number, b: number, tol = 0.005) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('whole flight in one equation: s = −20, u = +8, a = −g gives 2.99 s and −1.36 s', () => {
  const roots = timesForDisplacement(-20, 8, -G);
  close(roots[0], 2.993);
  close(roots[1], -1.362);
  assert.deepEqual(timesForDisplacement(20, 8, -G), [], 's = +20 has no real solution');
  assert.deepEqual(timesForDisplacement(-20, 8, G), [], 'a = +g has no real solution');
});

test('initialVelocityFor inverts s = ut + ½at²', () => {
  const u = initialVelocityFor(-24, -G, 3);
  close(u, 6.715);
  close(-24, u * 3 + 0.5 * -G * 9, 1e-9);
});

test('relationFits: only s = ut + ½at² works for known s, u, a and unknown t', () => {
  assert.equal(relationFits('sut', ['s', 'u', 'a'], 't'), true);
  assert.equal(relationFits('vuat', ['s', 'u', 'a'], 't'), false);
  assert.equal(relationFits('v2as', ['s', 'u', 'a'], 't'), false);
  assert.equal(relationFits('suvt', ['s', 'u', 'a'], 't'), false);
  assert.equal(relationFits('sut', ['s', 'a', 't'], 'u'), true);
});

test('track clamps before its start and after its end', () => {
  const tr = { motion: { s0: 20, u: 8, a: -G }, from: 1, end: 2 };
  assert.equal(trackPosition(0, tr), 20);
  assert.equal(trackVelocity(0.5, tr), 8);
  close(trackPosition(1.5, tr), 20 + 4 - 0.5 * G * 0.25, 1e-9);
  assert.equal(trackPosition(9, tr), trackPosition(2, tr));
});

test('motionStop: where a wrong setup stops, never at the real landing time', () => {
  const top = 30;
  const rest = motionStop({ s0: 20, u: 0, a: -G }, 0, top);
  assert.equal(rest.why, 'target');
  close(rest.t, 2.019);
  close(motionStop({ s0: 20, u: -8, a: -G }, 0, top).t, 1.362);
  const short = motionStop({ s0: 20, u: 8, a: -G }, 40, top); // aims at 40 m, turns at 23.3 m
  assert.equal(short.why, 'apex');
  close(short.t, 0.815);
  assert.equal(motionStop({ s0: 20, u: 0, a: -G }, 40, top).why, 'ground'); // falls away from the target
  const up = motionStop({ s0: 20, u: 8, a: G }, 0, top); // accelerates upwards
  assert.equal(up.why, 'offTop');
  close(up.t, 0.826);
  const dip = motionStop({ s0: 20, u: -8, a: G }, 0, top); // dips to 16.7 m, then climbs away
  assert.equal(dip.why, 'apex');
  close(dip.t, 0.815);
  assert.equal(motionStop({ s0: 20, u: 8, a: G }, 40, top).why, 'offTop'); // passes the ruler top first
});

test('speedAfter: v² = u² + 2as, the sign of u drops out', async () => {
  const { speedAfter } = await import('./kinematics.ts');
  assert.ok(Math.abs(speedAfter(8, -9.81, -12)! - 17.304) < 1e-3);
  assert.equal(speedAfter(8, -9.81, -12), speedAfter(-8, -9.81, -12));
  assert.equal(speedAfter(8, -9.81, 5), null); // a ball at 8 m s⁻¹ never rises 5 m
});

test('riseHeight and gFromGradient', async () => {
  const { riseHeight, gFromGradient } = await import('./kinematics.ts');
  assert.ok(Math.abs(riseHeight(8) - 3.262) < 1e-3);
  assert.equal(gFromGradient(4.87), 9.74);
});
