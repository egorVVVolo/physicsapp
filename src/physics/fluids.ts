// Density and upthrust (WPH11 points 23 and 24).
// Density is mass per unit volume, ρ = m ÷ V, in kg m⁻³. A fluid pushes harder on the deeper faces of a body than on
// the shallower ones; the difference is the upthrust. Archimedes: upthrust = the weight of the fluid displaced,
// U = ρ(fluid) × V(below the surface) × g. A floating body sinks until the fluid it displaces weighs as much as it does,
// so it displaces m ÷ ρ(fluid) of fluid, whatever its own density.

import { weight } from './dynamics.ts';
import { G } from './kinematics.ts';

export const RHO_WATER = 1000; // kg m⁻³

/** Density (kg m⁻³) of a mass m (kg) taking up a volume V (m³): ρ = m ÷ V. */
export function density(m: number, V: number): number {
  return m / V;
}

/** Volume (m³) of a mass m (kg) of a material of density ρ (kg m⁻³): V = m ÷ ρ. */
export function volumeOf(m: number, rho: number): number {
  return m / rho;
}

/** Mass (kg) of a volume V (m³) of a material of density ρ (kg m⁻³): m = ρV. */
export function massOf(rho: number, V: number): number {
  return rho * V;
}

/** Upthrust (N) on a body with a volume V (m³) below the surface of a fluid of density ρ: the weight of the fluid displaced, ρVg. */
export function upthrust(rhoFluid: number, V: number, g = G): number {
  return weight(massOf(rhoFluid, V), g);
}

/** Volume (m³) of fluid a floating body of mass m (kg) displaces: its own weight of fluid, m ÷ ρ(fluid). */
export function floatingDisplacement(m: number, rhoFluid: number): number {
  return m / rhoFluid;
}

/**
 * Volume (m³) of an upright block below the surface when its bottom face is `depth` (m) under it: the base area times
 * the part of its height that is under, from none (depth ≤ 0) to all of it (depth ≥ the block's height).
 */
export function submergedVolume(base: number, height: number, depth: number): number {
  return base * Math.max(0, Math.min(height, depth));
}

/** How far (m) a level rises when a volume ΔV (m³) more is displaced in a tank of base area A (m²); negative: it falls. */
export function levelRise(dV: number, area: number): number {
  return dV / area;
}

/** What a newtonmeter reads (N) when a body of weight W hangs in a fluid that pushes up on it with U: W − U. */
export function apparentWeight(W: number, U: number): number {
  return W - U;
}

/**
 * Density (kg m⁻³) of a body that weighs W in air and reads `inFluid` fully under a fluid of density ρ:
 * the upthrust W − inFluid is the weight of the body's own volume of fluid, so ρ(body) = ρ(fluid) × W ÷ (W − inFluid).
 */
export function densityByWeighing(W: number, inFluid: number, rhoFluid: number): number {
  return (rhoFluid * W) / (W - inFluid);
}

/**
 * How far (m) the level of a tank (base A) falls when a load of mass m and density ρ is taken off a floating boat and
 * sunk: on board it displaced m ÷ ρ(fluid), on the bottom only its own volume m ÷ ρ. Zero for a load as dense as the fluid.
 */
export function tankLevelFall(m: number, rho: number, area: number, rhoFluid = RHO_WATER): number {
  return levelRise(floatingDisplacement(m, rhoFluid) - volumeOf(m, rho), area);
}
