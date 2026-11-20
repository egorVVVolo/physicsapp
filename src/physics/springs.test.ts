import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bobOmega, bobStep, bounceAt, cutStiffness, extensionFor, hookeForce, parallelStiffness, seriesStiffness, springLength, stiffness, stiffnessFromPair } from './springs.ts';

const near = (a: number, b: number, tol = 1e-12) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test("Hooke's law: ΔF = kΔx, and back", () => {
  near(hookeForce(50, 0.06), 3);
  near(extensionFor(3, 50), 0.06);
  near(stiffness(3, 0.06), 50);
  near(springLength(0.1, 3, 50), 0.16);
  near(springLength(0.08, -12, 400), 0.05); // squashed
  near(stiffnessFromPair(2, 0.15, 5, 0.225), 40);
});

test('half a spring is twice as stiff; two springs one below the other are half as stiff, side by side twice', () => {
  near(cutStiffness(50, 0.5), 100);
  near(seriesStiffness(100, 100), 50); // the two halves joined again: the whole spring
  near(parallelStiffness(100, 100), 200);
  near(seriesStiffness(50), 50);
});

test('the bounce starts at rest at x0 and settles at xEq', () => {
  const w = bobOmega(50, 3);
  near(w, Math.sqrt(50 / (3 / 9.81)));
  near(bounceAt(0, 0, 0.06, w, 0.1), 0);
  near(bounceAt(60, 0, 0.06, w, 0.1), 0.06, 1e-9);
  // it overshoots: the first turn is past the rest position
  const top = bounceAt(Math.PI / (w * Math.sqrt(1 - 0.01)), 0, 0.06, w, 0.1);
  assert.ok(top > 0.06 && top < 0.12);
});

test('the stepped bob follows the exact bounce', () => {
  const w = bobOmega(50, 3);
  let bob = { x: 0, v: 0 };
  for (let i = 0; i < 60; i++) bob = bobStep(bob, 0.06, w, 0.12, 1 / 60);
  near(bob.x, bounceAt(1, 0, 0.06, w, 0.12), 2e-4);
});
