// Uniformly accelerated motion in one dimension (SUVAT).
// Every number shown in a lesson is computed here, never typed by hand.
// Functions are marked 'worklet' so scenes can call them on the UI thread.

export const G = 9.81; // m s⁻², Edexcel default

export type Motion = {
  s0: number; // starting position, m
  u: number; // initial velocity, m s⁻¹ (sign = direction)
  a: number; // constant acceleration, m s⁻²
};

/** Position at time t: s = s0 + ut + ½at² */
export function position(t: number, m: Motion): number {
  'worklet';
  return m.s0 + m.u * t + 0.5 * m.a * t * t;
}

/** Velocity at time t: v = u + at */
export function velocity(t: number, m: Motion): number {
  'worklet';
  return m.u + m.a * t;
}

/** Solve s = ut + ½at² for t. Returns real roots, largest first ([] if none). */
export function timesForDisplacement(s: number, u: number, a: number): number[] {
  if (a === 0) return u === 0 ? [] : [s / u];
  const A = 0.5 * a;
  const D = u * u + 4 * A * s;
  if (D < 0) return [];
  const r = Math.sqrt(D);
  return [(-u + r) / (2 * A), (-u - r) / (2 * A)].sort((p, q) => q - p);
}

/** Time when velocity is zero (top of the motion), or null if it never stops. */
export function timeAtRest(m: Motion): number | null {
  if (m.a === 0) return null;
  const t = -m.u / m.a;
  return t >= 0 ? t : null;
}

/** First positive time the object reaches position `target`, or null if never. */
export function timeToReach(target: number, m: Motion): number | null {
  const positive = timesForDisplacement(target - m.s0, m.u, m.a).filter((t) => t > 1e-9);
  return positive.length ? Math.min(...positive) : null;
}
