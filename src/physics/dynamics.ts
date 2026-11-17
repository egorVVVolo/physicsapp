// Forces on a body: weight, normal reaction, Newton's second law in one dimension.
// Up is positive. Every force shown in a lesson is computed here, never typed by hand.

import { G } from './kinematics.ts';

/** Weight W = mg, in N (magnitude, acts downwards). */
export function weight(m: number, g = G): number {
  'worklet';
  return m * g;
}

/**
 * Normal reaction from the floor of a lift with acceleration a (up positive), in N.
 * From ΣF = ma with up positive: N − mg = ma, so N = m(g + a).
 * The floor can only push, so N is never negative: if a < −g the body leaves the floor (N = 0).
 */
export function normalInLift(m: number, a: number, g = G): number {
  'worklet';
  return Math.max(0, m * (g + a));
}

/** Resultant force ΣF = ma, in N (up positive). */
export function resultant(m: number, a: number): number {
  'worklet';
  return m * a;
}

/** What scales calibrated in kg would show: the push N read as if it were a weight. */
export function scaleKg(n: number, g = G): number {
  'worklet';
  return n / g;
}

const RAD = Math.PI / 180;

/**
 * Normal reaction on a body resting or sliding on a level floor while a force `pull` acts on it at `angle` degrees
 * above the horizontal (a rope); a negative angle points below the horizontal (a pole pushing down).
 * Nothing accelerates up or down, so N + pull·sin θ = W.
 */
export function normalWithPull(w: number, pull: number, angle: number): number {
  'worklet';
  return Math.max(0, w - pull * Math.sin(angle * RAD));
}

/**
 * The push of a smooth wall on a uniform ladder resting at `angle` degrees to a rough floor, in N.
 * Moments about the foot: W · (L/2) cos α = P · L sin α, so P = W / (2 tan α). Horizontal, away from the wall.
 */
export function ladderWallPush(w: number, angle: number): number {
  'worklet';
  return w / (2 * Math.tan(angle * RAD));
}

/** The coefficient of friction μ = F / N of a surface where sliding friction F goes with normal reaction N. */
export function frictionCoefficient(friction: number, normal: number): number {
  'worklet';
  return friction / normal;
}
