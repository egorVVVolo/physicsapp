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
