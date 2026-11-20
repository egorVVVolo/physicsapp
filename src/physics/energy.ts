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

// Conservation of energy (WPH11 point 20): energy moves between stores and is never lost. With no friction or air,
// the GPE a body gives up is the kinetic energy it gains; with friction, the rest is the work done against it.

/** Speed (m s⁻¹) after a body moving at u drops a height dh (m) with no losses: ½mv² = ½mu² + mgΔh, so v² = u² + 2gΔh, whatever its mass or direction. */
export function speedAfterDrop(u: number, dh: number, g = G): number {
  return Math.sqrt(Math.max(0, u * u + 2 * g * dh));
}

/** Energy (J) transferred by friction or air resistance while a mass m (kg) drops dh (m) and its speed goes from u to v: mgΔh − ΔEk. */
export function energyToFriction(m: number, dh: number, u: number, v: number, g = G): number {
  return potentialChange(m, dh, g) - (kineticEnergy(m, v) - kineticEnergy(m, u));
}

/**
 * Speed (m s⁻¹) at the foot of a slide of height h and length L (m) for a mass m (kg) that starts from rest, with a
 * steady friction force F (N) up the slide: ½mv² = mgh − FL. Zero when friction takes all the GPE.
 */
export function slideSpeed(m: number, h: number, L: number, F: number, g = G): number {
  return speedFromKinetic(m, Math.max(0, potentialChange(m, h, g) - F * L));
}

/** Acceleration (m s⁻²) down that slide: the weight's part along it, mg h ÷ L, less the friction, over the mass. */
export function slideAcceleration(m: number, h: number, L: number, F: number, g = G): number {
  return (m * g * h) / L / m - F / m;
}
