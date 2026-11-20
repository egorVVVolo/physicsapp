// Hooke's law (WPH11 point 27): up to the limit of proportionality, the change in force on a spring (or a wire)
// is proportional to the change in its length, ΔF = kΔx, where k is the stiffness of the object, in N m⁻¹.
// The extension Δx is the change in length, never the length itself; a squashed spring obeys the same law (compression).
// Every part of a hanging spring carries the whole load, so each coil stretches the same amount: a piece made of a
// fraction of the coils stretches that fraction of the extension, and is stiffer by the same factor (half → twice as stiff).

import { G } from './kinematics.ts';

/** The force (N) that changes a spring's length by Δx (m): ΔF = kΔx. */
export function hookeForce(k: number, dx: number): number {
  return k * dx;
}

/** The extension (m) a force F (N) gives a spring of stiffness k (N m⁻¹): Δx = F ÷ k. */
export function extensionFor(F: number, k: number): number {
  return F / k;
}

/** The stiffness (N m⁻¹) of a spring that a force F (N) stretches by Δx (m): k = F ÷ Δx. */
export function stiffness(F: number, dx: number): number {
  return F / dx;
}

/** The stiffness (N m⁻¹) from two loads and the lengths they give: k = ΔF ÷ ΔL. */
export function stiffnessFromPair(F1: number, L1: number, F2: number, L2: number): number {
  return (F2 - F1) / (L2 - L1);
}

/** The length (m) of a spring of natural length L0 under a load F (N): L0 + F ÷ k. A negative F squashes it. */
export function springLength(L0: number, F: number, k: number): number {
  return L0 + F / k;
}

/** The stiffness (N m⁻¹) of a piece cut from a spring of stiffness k, made of `part` (0…1] of its coils: k ÷ part. */
export function cutStiffness(k: number, part: number): number {
  return k / part;
}

/** Springs one below the other: each carries the whole load, the extensions add, 1/k = Σ 1/kᵢ. */
export function seriesStiffness(...ks: number[]): number {
  return 1 / ks.reduce((sum, k) => sum + 1 / k, 0);
}

/** Springs side by side, sharing the load and stretching the same: the forces add, k = Σ kᵢ. */
export function parallelStiffness(...ks: number[]): number {
  return ks.reduce((sum, k) => sum + k, 0);
}

/** The angular frequency (rad s⁻¹) a load of weight W (N) bobs at on a spring of stiffness k: √(k ÷ m), m = W ÷ g. */
export function bobOmega(k: number, W: number, g = G): number {
  return Math.sqrt(k / (W / g));
}

/**
 * A load let go from rest at extension x0 on a spring, settling at xEq with light damping (ratio ζ < 1):
 * x(t) = xEq + (x0 − xEq) e^(−ζωt) (cos ω_d t + ζω ÷ ω_d · sin ω_d t), ω_d = ω√(1 − ζ²).
 */
export function bounceAt(t: number, x0: number, xEq: number, omega: number, zeta: number): number {
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  return xEq + (x0 - xEq) * Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));
}

export type Bob = { x: number; v: number };

/**
 * One step of a load on a spring heading for extension xEq: x'' = −ω²(x − xEq) − 2ζωx'. Small sub-steps
 * (semi-implicit Euler), so a figure can follow a target that changes while it moves (the explore's slider).
 */
export function bobStep(bob: Bob, xEq: number, omega: number, zeta: number, dt: number): Bob {
  const n = Math.max(1, Math.ceil(dt / 0.002));
  const h = dt / n;
  let { x, v } = bob;
  for (let i = 0; i < n; i++) {
    v += (-omega * omega * (x - xEq) - 2 * zeta * omega * v) * h;
    x += v * h;
  }
  return { x, v };
}
