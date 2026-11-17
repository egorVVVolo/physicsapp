// Projectiles: two motions on one clock. Horizontally nothing pushes the body, so its velocity never changes
// (x = uₓt). Vertically it accelerates at g downward, exactly like a dropped body (y = h + u_y t − ½gt²).
// Air resistance is ignored. Up is positive; y is the height above the level where the body lands.
// Position and velocity are marked 'worklet' so figures can call them on the UI thread.
import { G } from './kinematics.ts';
import { components } from './vectors.ts';

/** A launch: speed u (m s⁻¹) at `angle` degrees above the horizontal, from `h` metres above the landing level. */
export type Launch = { u: number; angle: number; h: number };

/** The horizontal and vertical parts of the launch velocity: uₓ = u cos θ, u_y = u sin θ. */
export function launchParts(l: Launch): { ux: number; uy: number } {
  const c = components(l.u, l.angle);
  return { ux: c.along, uy: c.across };
}

/** Where the body is at time t: x along the ground from the launch point, y above the landing level. */
export function projectilePosition(t: number, l: Launch, g = G): { x: number; y: number } {
  'worklet';
  const rad = (l.angle * Math.PI) / 180;
  return { x: l.u * Math.cos(rad) * t, y: l.h + l.u * Math.sin(rad) * t - 0.5 * g * t * t };
}

/** The velocity at time t: vₓ stays uₓ, v_y = u_y − gt. */
export function projectileVelocity(t: number, l: Launch, g = G): { vx: number; vy: number } {
  'worklet';
  const rad = (l.angle * Math.PI) / 180;
  return { vx: l.u * Math.cos(rad), vy: l.u * Math.sin(rad) - g * t };
}

/** Time until the body is back at the landing level (y = 0): the positive root of h + u_y t − ½gt² = 0. */
export function flightTime(l: Launch, g = G): number {
  const { uy } = launchParts(l);
  return (uy + Math.sqrt(uy * uy + 2 * g * l.h)) / g;
}

/** How far along the ground the body lands: uₓ × the time of flight. */
export function projectileRange(l: Launch, g = G): number {
  return launchParts(l).ux * flightTime(l, g);
}

/** Time until the vertical velocity is zero (the top of the path); 0 for a body launched level or downward. */
export function timeToTop(l: Launch, g = G): number {
  return Math.max(0, launchParts(l).uy / g);
}

/** How far the body rises above its launch point: 0 = u_y² − 2gs gives s = u_y² / 2g. */
export function topHeight(l: Launch, g = G): number {
  const uy = Math.max(0, launchParts(l).uy);
  return (uy * uy) / (2 * g);
}

/** Speed just before landing: the two parts added tip to tail, √(vₓ² + v_y²). */
export function landingSpeed(l: Launch, g = G): number {
  const v = projectileVelocity(flightTime(l, g), l, g);
  return Math.hypot(v.vx, v.vy);
}
