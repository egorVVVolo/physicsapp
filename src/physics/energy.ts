// Kinetic and gravitational potential energy (WPH11 points 18 and 19).
// Ek = ½mv²: the work needed to bring a mass m from rest to speed v (FΔs with F = ma and v² = 2aΔs).
// ΔEp = mgΔh: the work done against the weight lifting a mass m through a height Δh. Energies in joules.

import { G } from './kinematics.ts';

/** Kinetic energy (J) of a mass m (kg) moving at speed v (m s⁻¹): ½mv². */
export function kineticEnergy(m: number, v: number): number {
  return 0.5 * m * v * v;
}

/** The speed (m s⁻¹) of a mass m (kg) that has kinetic energy E (J): v = √(2E ÷ m). */
export function speedFromKinetic(m: number, E: number): number {
  return Math.sqrt((2 * E) / m);
}

/** Change in gravitational potential energy (J) of a mass m (kg) raised a height dh (m): mgΔh (negative when lowered). */
export function potentialChange(m: number, dh: number, g = G): number {
  return m * g * dh;
}

/** The height (m) whose ΔEp equals the kinetic energy at speed v (m s⁻¹): mgh = ½mv², so h = v² ÷ 2g, whatever the mass. */
export function heightForSpeed(v: number, g = G): number {
  return (v * v) / (2 * g);
}
