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

/** Newton's second law for a body of constant mass: a = ΣF / m, in m s⁻² (ΣF is the resultant, with its sign). */
export function acceleration(sumF: number, m: number): number {
  'worklet';
  return sumF / m;
}

/** Gravitational field strength g = F / m, in N kg⁻¹: the force of gravity on each kilogram. */
export function fieldStrength(f: number, m: number): number {
  return f / m;
}

/**
 * A trolley of mass `trolley` on a smooth level bench, pulled by a string over a light, smooth pulley to a mass `hanging`.
 * The weight of the hanging mass accelerates both bodies: a = m g / (M + m), in m s⁻².
 */
export function connectedAcceleration(trolley: number, hanging: number, g = G): number {
  'worklet';
  return (hanging * g) / (trolley + hanging);
}

/** The tension in that string, in N: the only horizontal force on the trolley, so T = M a (less than the hanging weight). */
export function stringTension(trolley: number, hanging: number, g = G): number {
  'worklet';
  return trolley * connectedAcceleration(trolley, hanging, g);
}

/**
 * Where the trolley of that set-up is `t` seconds after it is let go from rest, and how fast it moves, when the hanging
 * mass lands on the floor after falling `drop` metres. Until then s = ½at²; after it the string goes slack, no horizontal
 * force acts and the trolley rolls on at the speed it had (Newton's first law).
 */
export function pulleyRun(t: number, trolley: number, hanging: number, drop: number, g = G): { s: number; v: number; landed: boolean } {
  'worklet';
  const a = connectedAcceleration(trolley, hanging, g);
  const tLand = Math.sqrt((2 * drop) / a);
  if (t <= tLand) return { s: 0.5 * a * t * t, v: a * t, landed: false };
  const vLand = a * tLand;
  return { s: drop + vLand * (t - tLand), v: vLand, landed: true };
}
