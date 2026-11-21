// Stress–strain behaviour of a ductile wire (WPH11 points 29–30). Loading: a straight line (slope E) up to the limit of
// proportionality, then a curve; past the elastic limit the strain is partly plastic. Unloading from a point (ε, σ) beyond
// the elastic limit follows a line PARALLEL to the straight part, so only σ ÷ E of the strain springs back and the rest
// is permanent. A wire's greatest load is the ultimate tensile stress times its cross-sectional area.

import { circleArea } from './young.ts';

/** The copper wire of the lesson: its Young modulus, Pa. */
export const E_COPPER = 1.2e11;

/** The copper curve, zoomed to the first 0.6 %: straight to the yield (180 MPa at 1.5 × 10⁻³), then rising on to 240 MPa at 5.0 × 10⁻³. */
export const COPPER = {
  yieldStrain: 1.5e-3,
  yieldStress: 180e6,
  endStrain: 5.0e-3,
  endStress: 240e6,
};

/** The stress (Pa) on the loading curve at strain ε: Eε up to the yield, then a straight rise to the end point and on. */
export function loadingStress(epsilon: number, E = E_COPPER): number {
  const { yieldStrain, yieldStress, endStrain, endStress } = COPPER;
  if (epsilon <= yieldStrain) return E * epsilon;
  return yieldStress + ((endStress - yieldStress) / (endStrain - yieldStrain)) * (epsilon - yieldStrain);
}

/** The strain (no unit) that springs back when a stress σ (Pa) is taken off: σ ÷ E. */
export function elasticRecovery(sigma: number, E = E_COPPER): number {
  return sigma / E;
}

/** The strain left after loading to strain ε on the loading curve and releasing: ε − σ ÷ E, and none below the yield. */
export function permanentStrain(epsilon: number, E = E_COPPER): number {
  if (epsilon <= COPPER.yieldStrain) return 0;
  return epsilon - elasticRecovery(loadingStress(epsilon, E), E);
}

/** The stress (Pa) on the unloading line that starts at strain ε reached on loading, at strain e (down to the permanent strain). */
export function unloadingStress(epsilon: number, e: number, E = E_COPPER): number {
  if (epsilon <= COPPER.yieldStrain) return E * e;
  return Math.max(0, loadingStress(epsilon, E) - E * (epsilon - e));
}

/** The greatest force (N) a wire of diameter d (m) carries before it fails at the ultimate tensile stress uts (Pa): uts × A. */
export function breakingForce(uts: number, d: number): number {
  return uts * circleArea(d);
}
