import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collisionRun, collisionSquash, collisionTimes, momentum, momentumChange, speedFromMomentum, stickVelocity, totalMomentum, velocityAfter, wallContact, wallRun, type WallHit } from './momentum.ts';

const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('p = mv keeps the sign of v', () => {
  near(momentum(0.8, 1.5), 1.2);
  near(momentum(0.8, -1.0), -0.8);
  near(speedFromMomentum(27000, 1500), 18);
});

test('a bounce changes momentum more than a stop', () => {
  near(momentumChange(0.8, 1.5, -1.0), -2.0);
  near(momentumChange(0.8, 1.5, 0), -1.2);
  near(totalMomentum([{ m: 0.8, v: 1.5 }, { m: 1.2, v: -1.0 }]), 0);
});

test('wallRun: position and velocity are continuous, the buffer squashes at most `squash`', () => {
  for (const back of [0, 1.0, 1.5]) {
    const h: WallHit = { u: 1.5, back, gap: 0.9, squash: 0.05 };
    const { tHit, tEnd } = wallContact(h);
    let maxS = 0;
    let prev = wallRun(0, h);
    for (let t = 0.001; t < tEnd + 1; t += 0.001) {
      const now = wallRun(t, h);
      assert.ok(Math.abs(now.s - prev.s) < 0.002, `jump in s at t = ${t}`);
      assert.ok(Math.abs(now.v - prev.v) < 0.05, `jump in v at t = ${t}`);
      maxS = Math.max(maxS, now.s);
      prev = now;
    }
    near(maxS - h.gap, h.squash, 1e-4);
    near(wallRun(tHit, h).v, h.u);
    near(wallRun(tEnd + 0.5, h).v, -back);
  }
});

test('sticking and bouncing conserve the total momentum', () => {
  near(stickVelocity(0.8, 1.5, 0.8, 0), 0.75);
  near(stickVelocity(0.8, 1.5, 1.2, -1.0), 0);
  near(velocityAfter(0.8, 1.5, 1.2, 0, -0.3), 1.2);
  near(velocityAfter(0.8, 0, 1.2, 0, -0.9), 0.6);
});

test('collisionRun: continuous, total momentum the same at every instant, buffer squash never past `squash`', () => {
  const cases = [
    { a: { m: 0.8, u: 1.5, v: stickVelocity(0.8, 1.5, 1.2, -1) }, b: { m: 1.2, u: -1, v: stickVelocity(0.8, 1.5, 1.2, -1) }, gap: 2.5, squash: 0.08 },
    { a: { m: 0.8, u: 1.5, v: -0.3 }, b: { m: 1.2, u: 0, v: velocityAfter(0.8, 1.5, 1.2, 0, -0.3) }, gap: 1.5, squash: 0.08 },
    { a: { m: 0.8, u: 0, v: -0.9 }, b: { m: 1.2, u: 0, v: velocityAfter(0.8, 0, 1.2, 0, -0.9) }, gap: 0.6, squash: 0.08 },
  ];
  for (const c of cases) {
    const total = c.a.m * c.a.u + c.b.m * c.b.u;
    const { tEnd } = collisionTimes(c);
    let prev = collisionRun(0, c);
    for (let t = 0.001; t < tEnd + 1; t += 0.001) {
      const now = collisionRun(t, c);
      assert.ok(Math.abs(now.sA - prev.sA) < 0.002 && Math.abs(now.sB - prev.sB) < 0.002, `jump in s at t = ${t}`);
      near(c.a.m * now.vA + c.b.m * now.vB, total, 1e-9);
      assert.ok(collisionSquash(t, c) <= c.squash + 1e-9);
      prev = now;
    }
    const end = collisionRun(tEnd + 0.5, c);
    near(end.vA, c.a.v);
    near(end.vB, c.b.v);
  }
});
