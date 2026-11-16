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

test('braking: 0 = u² + 2as gives the braking distance; twice the speed needs four times the distance', async () => {
  const { brakingDistance, stoppingTime, brakingPosition, brakingVelocity } = await import('./kinematics.ts');
  close(brakingDistance(12, -8), 9);
  close(brakingDistance(24, -8), 36);
  const car = { u: 24, a: -8, react: 0 };
  close(stoppingTime(car), 3);
  close(brakingPosition(1, car), 20);
  close(brakingPosition(3, car), 36);
  close(brakingPosition(10, car), 36); // it stays where it stopped
  close(brakingVelocity(1.5, car), 12);
  assert.equal(brakingVelocity(10, car), 0);
});

test('braking with a reaction time: steady speed first, then the brakes', async () => {
  const { thinkingDistance, stoppingDistance, stoppingTime, brakingPosition, brakingVelocity, brakingTimeAt, speedAfter } = await import('./kinematics.ts');
  const car = { u: 24, a: -8, react: 0.5 };
  close(thinkingDistance(car), 12);
  close(stoppingDistance(car), 48);
  close(stoppingTime(car), 3.5);
  close(brakingPosition(0.25, car), 6);
  assert.equal(brakingVelocity(0.5, car), 24);
  close(brakingPosition(3.5, car), 48);
  // a tree 40 m ahead: 28 m of braking are left, the car arrives at √(24² − 2 × 8 × 28) = 11.3 m s⁻¹
  const tHit = brakingTimeAt(40, car)!;
  close(brakingPosition(tHit, car), 40);
  close(brakingVelocity(tHit, car), speedAfter(24, -8, 28)!);
  close(brakingVelocity(tHit, car), 11.314);
  assert.equal(brakingTimeAt(50, car), null); // it stops at 48 m
  close(brakingTimeAt(6, car)!, 0.25); // still thinking
});

test('each of the four equations leaves out exactly one quantity', async () => {
  const { leftOut, RELATIONS, QUANTITIES, distanceFromAverage } = await import('./kinematics.ts');
  assert.deepEqual([leftOut('vuat'), leftOut('sut'), leftOut('v2as'), leftOut('suvt')], ['s', 'v', 't', 'a']);
  for (const r of Object.values(RELATIONS)) assert.equal(r.has.length, QUANTITIES.length - 1);
  assert.equal(distanceFromAverage(30, 10, 25), 500);
});

test('a trip of phases: the tram goes 0 → 8 m s⁻¹ in 4 s, holds 6 s, stops in 2 s and covers 72 m', async () => {
  const { tripDuration, tripVelocity, tripPosition, tripAcceleration, tripDisplacement, tripDistance } = await import('./kinematics.ts');
  const tram = { u: 0, phases: [{ dt: 4, a: 2 }, { dt: 6, a: 0 }, { dt: 2, a: -4 }] };
  assert.equal(tripDuration(tram), 12);
  close(tripVelocity(2, tram), 4);
  close(tripVelocity(7, tram), 8);
  close(tripVelocity(11, tram), 4);
  close(tripVelocity(12, tram), 0);
  close(tripPosition(4, tram), 16);
  close(tripPosition(10, tram), 64);
  close(tripPosition(12, tram), 72);
  close(tripPosition(20, tram), 72); // at rest after the last phase
  assert.equal(tripAcceleration(1, tram), 2);
  assert.equal(tripAcceleration(5, tram), 0);
  assert.equal(tripAcceleration(11, tram), -4);
  close(tripDisplacement(4, 10, tram), 48);
  close(tripDistance(0, 12, tram), 72);
});

test('a trip that turns back: +6 to −4 m s⁻¹ in 5 s is +9 m and −4 m, displacement +5 m, distance 13 m', async () => {
  const { tripVelocity, tripDisplacement, tripDistance, tripBreaks } = await import('./kinematics.ts');
  const ball = { u: 6, phases: [{ dt: 5, a: -2 }] };
  close(tripVelocity(3, ball), 0);
  close(tripVelocity(5, ball), -4);
  assert.deepEqual(tripBreaks(0, 5, ball), [3]);
  close(tripDisplacement(0, 3, ball), 9);
  close(tripDisplacement(3, 5, ball), -4);
  close(tripDisplacement(0, 5, ball), 5);
  close(tripDistance(0, 5, ball), 13);
});

test('the chase: a steady 10 m s⁻¹ against 2.5 m s⁻² from rest. Equal speeds at 4 s (gap 20 m), level at 8 s', async () => {
  const { tripVelocity, tripPosition } = await import('./kinematics.ts');
  const a = { u: 10, phases: [{ dt: 10, a: 0 }] };
  const b = { u: 0, phases: [{ dt: 10, a: 2.5 }] };
  close(tripVelocity(4, b), tripVelocity(4, a));
  close(tripPosition(4, a) - tripPosition(4, b), 20);
  close(tripPosition(8, a), 80);
  close(tripPosition(8, b), 80);
  // the gap is largest when the speeds are equal
  for (const t of [3.5, 4.5]) assert.ok(tripPosition(t, a) - tripPosition(t, b) < 20);
});
