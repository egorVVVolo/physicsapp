// Work done by a force (WPH11 point 17): ΔW = FΔs, where Δs is the distance moved in the direction of the force.
// For a force at an angle θ to the motion only its part along the motion, F cos θ, does work: ΔW = FΔs cos θ.
// Work done is energy transferred, in joules (1 J = 1 N m).

import { weight } from './dynamics.ts';
import { G } from './kinematics.ts';

const RAD = Math.PI / 180;

/**
 * Work done (J) by a force F (N) on a body that moves a distance s (m), the force at `angle` degrees to the motion.
 * At 90° the force does no work: cos 90° is returned as exactly 0, not 6e-17.
 */
export function workDone(force: number, s: number, angle = 0): number {
  const c = Math.cos(angle * RAD);
  return force * s * (Math.abs(c) < 1e-12 ? 0 : c);
}

/** The steady force along the motion (N) that does work W (J) over a distance s (m): F = ΔW ÷ Δs. */
export function forceFromWork(work: number, s: number): number {
  return work / s;
}

/** Work done (J) against gravity lifting a mass m (kg) a height h (m) at a steady speed: mg × h. */
export function liftWork(m: number, h: number, g = G): number {
  return workDone(weight(m, g), h);
}

/**
 * The steady push along a smooth ramp of length L (m) that raises a mass m (kg) a height h (m): the part of the weight
 * down the slope, mg sin θ with sin θ = h ÷ L. Over the ramp it does mg h of work, the same as lifting straight up.
 */
export function rampPush(m: number, h: number, L: number, g = G): number {
  return (weight(m, g) * h) / L;
}
