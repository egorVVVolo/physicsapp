// Power and efficiency (WPH11 points 21 and 22).
// Power is the rate of doing work, or of transferring energy: P = ΔW ÷ Δt, in watts (1 W = 1 J s⁻¹). A force F whose
// point of application moves at speed v along it does F × v of work each second: P = Fv.
// Efficiency = useful energy (or power) output ÷ total energy (or power) input: a fraction, never more than 1.

import { weight } from './dynamics.ts';
import { G } from './kinematics.ts';

/** Power (W) when work or energy W (J) is transferred in a time t (s): P = ΔW ÷ Δt. */
export function power(work: number, t: number): number {
  return work / t;
}

/** Power (W) of a force F (N) whose point of application moves along it at speed v (m s⁻¹): P = Fv. */
export function powerFromForce(force: number, v: number): number {
  return force * v;
}

/** Efficiency as a fraction (0 to 1): useful output ÷ total input, both energies or both powers. */
export function efficiency(useful: number, total: number): number {
  return useful / total;
}

/** The total input (J or W) a machine of efficiency `eff` (a fraction) needs to give a useful output. */
export function inputFor(useful: number, eff: number): number {
  return useful / eff;
}

/** The useful output (J or W) of a machine of efficiency `eff` (a fraction) from a total input. */
export function outputFor(total: number, eff: number): number {
  return total * eff;
}

/** Useful power (W) lifting a mass m (kg) at a steady speed v (m s⁻¹): the pull equals the weight, so P = mg × v. */
export function liftPower(m: number, v: number, g = G): number {
  return powerFromForce(weight(m, g), v);
}

/** The steady speed (m s⁻¹) at which a useful power P (W) lifts a mass m (kg): v = P ÷ mg. */
export function liftSpeed(P: number, m: number, g = G): number {
  return P / weight(m, g);
}
