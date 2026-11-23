// Elastic strain energy (WPH11 point 32). The work done squashing or stretching a body is the area under its
// force–extension graph, and it is stored as elastic strain energy. While Hooke's law holds the graph is a straight line
// from the origin, so the area is a triangle: ΔE = ½FΔx = ½kΔx². Twice the extension, four times the energy.
// For the same force the softer spring moves further, so it stores more: E = F² ÷ 2k.

import { G } from './kinematics.ts';

/** The energy (J) stored by a force growing steadily from 0 to F (N) over an extension Δx (m): ½FΔx. */
export function elasticEnergy(F: number, dx: number): number {
  return 0.5 * F * dx;
}

/** The energy (J) in a spring of stiffness k (N m⁻¹) stretched or squashed by Δx (m): ½kΔx². */
export function springEnergy(k: number, dx: number): number {
  return 0.5 * k * dx * dx;
}

/** The energy (J) in a spring of stiffness k held by a force F: F² ÷ 2k (½FΔx with Δx = F ÷ k). */
export function energyForForce(F: number, k: number): number {
  return (F * F) / (2 * k);
}

/** The speed (m s⁻¹) of a mass m (kg) given an energy E (J) as kinetic energy: √(2E ÷ m). */
export function launchSpeed(E: number, m: number): number {
  return Math.sqrt((2 * E) / m);
}

/** How high (m) an energy E (J) can lift a mass m (kg): E ÷ mg. */
export function riseHeight(E: number, m: number, g = G): number {
  return E / (m * g);
}

/** A rubber band's force (N) at extension x (m): steep at first, then easier, then stiff again (not Hooke's law). */
export function bandForce(x: number): number {
  const u = x / 0.2;
  return 8 * (0.55 * Math.sqrt(Math.max(0, u)) + 0.45 * u ** 3);
}

/** The area (J) under a force–extension graph f from a to b (m): Simpson's rule, n strips. */
export function areaUnder(f: (x: number) => number, a: number, b: number, n = 200): number {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/**
 * A launcher released from a squash Δx (m): a light plunger, spring k (N m⁻¹), ball m (kg). While they touch, the spring
 * pushes plunger and ball out in simple harmonic motion, squash = Δx cos ωt with ω = √(k ÷ m). At the natural length
 * (a quarter period) the ball leaves with v = Δx ω, the speed ½mv² = ½kΔx² gives, and goes on at that speed.
 * Returns the squash left (m), how far the ball has moved (m) and its speed (m s⁻¹) at time t (s) after release.
 */
export function releaseRun(k: number, dx: number, m: number, t: number): { squash: number; moved: number; v: number; left: boolean } {
  const w = Math.sqrt(k / m);
  const tLeave = Math.PI / 2 / w;
  if (t <= 0) return { squash: dx, moved: 0, v: 0, left: false };
  if (t < tLeave) return { squash: dx * Math.cos(w * t), moved: dx * (1 - Math.cos(w * t)), v: dx * w * Math.sin(w * t), left: false };
  const v = dx * w;
  return { squash: 0, moved: dx + v * (t - tLeave), v, left: true };
}

/** Seconds from release until the ball leaves the spring (a quarter period, π/2 × √(m ÷ k)). */
export function leaveTime(k: number, m: number): number {
  return (Math.PI / 2) * Math.sqrt(m / k);
}
