// Viscous drag (WPH11 points 25 and 26).
// A fluid's layers drag on one another: its viscosity η, in Pa s (N s m⁻²). In laminar flow the fluid moves in smooth
// layers and its streamlines never cross; in turbulent flow they break up into eddies. For a small sphere moving slowly
// through a fluid in laminar flow, Stokes' law gives the drag: F = 6πηrv. A ball falling through a liquid reaches its
// terminal velocity when weight = upthrust + drag, so v = 2r²(ρ − ρ(fluid))g ÷ 9η, and timing it gives η.
// Viscosity depends strongly on temperature: warm glycerol flows far more easily than cold.
// Down is positive for a falling ball.

import { upthrust } from './fluids.ts';
import { G } from './kinematics.ts';

export const RHO_STEEL = 7800; // kg m⁻³
export const RHO_GLYCEROL = 1260; // kg m⁻³ (it changes by well under 1 % between 10 °C and 40 °C)

/** Viscous drag (N) on a sphere of radius r (m) moving at v (m s⁻¹) through a fluid of viscosity η (Pa s): F = 6πηrv. */
export function stokesDrag(eta: number, r: number, v: number): number {
  return 6 * Math.PI * eta * r * v;
}

/** Volume (m³) of a sphere of radius r (m): 4/3 πr³. */
export function sphereVolume(r: number): number {
  return (4 / 3) * Math.PI * r ** 3;
}

/** Weight (N) of a sphere of radius r (m) and density ρ (kg m⁻³). */
export function sphereWeight(r: number, rho: number, g = G): number {
  return rho * sphereVolume(r) * g;
}

/** Upthrust (N) on a sphere of radius r (m) fully under a fluid of density ρ(fluid). */
export function sphereUpthrust(r: number, rhoFluid: number, g = G): number {
  return upthrust(rhoFluid, sphereVolume(r), g);
}

/**
 * Terminal velocity (m s⁻¹) of a sphere (radius r, density ρ) falling through a fluid (density ρ(fluid), viscosity η) by
 * Stokes' law: W = U + 6πηrv, so v = (W − U) ÷ 6πηr = 2r²(ρ − ρ(fluid))g ÷ 9η. Negative: it rises (a bubble).
 */
export function stokesTerminal(r: number, rho: number, rhoFluid: number, eta: number, g = G): number {
  return (sphereWeight(r, rho, g) - sphereUpthrust(r, rhoFluid, g)) / (6 * Math.PI * eta * r);
}

/** Viscosity (Pa s) from the forces on a ball falling at a steady v: η = (W − U) ÷ 6πrv. */
export function viscosityFromForces(W: number, U: number, r: number, v: number): number {
  return (W - U) / (6 * Math.PI * r * v);
}

/** Viscosity (Pa s) from a ball's terminal velocity: η = 2r²(ρ − ρ(fluid))g ÷ 9v (the falling-ball method). */
export function viscosityFromFall(r: number, rho: number, rhoFluid: number, v: number, g = G): number {
  return viscosityFromForces(sphereWeight(r, rho, g), sphereUpthrust(r, rhoFluid, g), r, v);
}

/**
 * A ball let go at the surface of a liquid: m dv/dt = W − U − 6πηrv, so v = vt(1 − e^(−t/τ)) with τ = m ÷ 6πηr = 2r²ρ ÷ 9η
 * (the liquid the ball drags along is left out), and the distance fallen s = vt(t − τ(1 − e^(−t/τ))). In glycerol τ is a
 * few milliseconds: the ball is at its terminal velocity almost at once.
 */
export function stokesFall(t: number, r: number, rho: number, rhoFluid: number, eta: number, g = G): { v: number; s: number; tau: number; vt: number } {
  const vt = stokesTerminal(r, rho, rhoFluid, eta, g);
  const tau = (2 * r * r * rho) / (9 * eta);
  const k = 1 - Math.exp(-t / tau);
  return { v: vt * k, s: vt * (t - tau * k), tau, vt };
}

/** The Reynolds number ρvd ÷ η of a sphere of diameter d: well below 1 the flow around it is laminar and Stokes' law holds. */
export function reynolds(rhoFluid: number, v: number, d: number, eta: number): number {
  return (rhoFluid * v * d) / eta;
}

/**
 * Terminal velocity (m s⁻¹) of a sphere when the flow around it is turbulent: drag ½ρ(fluid)Cd·πr²·v² with Cd ≈ 0.47,
 * so v = √(8rg(ρ − ρ(fluid)) ÷ 3Cd·ρ(fluid)). Used only to show how fast a steel ball drops through water.
 */
export function turbulentTerminal(r: number, rho: number, rhoFluid: number, cd = 0.47, g = G): number {
  return Math.sqrt((8 * r * g * (rho - rhoFluid)) / (3 * cd * rhoFluid));
}

/** Measured viscosity of pure glycerol (Pa s) by temperature (°C) (Segur and Oberstar, 1951). */
export const GLYCEROL_TABLE: readonly (readonly [number, number])[] = [
  [0, 12.07],
  [10, 3.9],
  [20, 1.41],
  [30, 0.612],
  [40, 0.284],
  [50, 0.142],
];

/** Viscosity of glycerol (Pa s) at T (°C), 0–50 °C: the measured values, ln η interpolated between them. */
export function glycerolViscosity(T: number): number {
  const tb = GLYCEROL_TABLE;
  const x = Math.max(tb[0][0], Math.min(tb[tb.length - 1][0], T));
  let i = 0;
  while (i < tb.length - 2 && x > tb[i + 1][0]) i++;
  const [t1, e1] = tb[i];
  const [t2, e2] = tb[i + 1];
  const f = (x - t1) / (t2 - t1);
  return Math.exp(Math.log(e1) + (Math.log(e2) - Math.log(e1)) * f);
}

/**
 * Stokes flow past a sphere of radius a, in the sphere's frame (the fluid streams by at speed 1 far away, along the
 * axis): the stream function ψ = ½ρ²(1 − 3a/2R + a³/2R³), with ρ the distance from the axis and R from the centre.
 * Each streamline is a line of constant ψ; far from the sphere ψ = ½ρ².
 */
export function stokesStream(along: number, across: number, a: number): number {
  const R = Math.hypot(along, across);
  if (R <= a) return 0;
  return 0.5 * across * across * (1 - (3 * a) / (2 * R) + a ** 3 / (2 * R ** 3));
}

/** How far from the axis (≥ 0) the streamline that starts `offset` from the axis far away passes at `along` (bisection on ψ). */
export function streamlineOffset(along: number, offset: number, a: number): number {
  const target = 0.5 * offset * offset;
  let lo = Math.abs(along) >= a ? 0 : Math.sqrt(a * a - along * along);
  let hi = offset * 4 + a * 4;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (stokesStream(along, mid, a) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
