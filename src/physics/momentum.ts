// Momentum p = mv (WPH11 point 13) and the clip of a trolley running into a wall.
// One direction is positive (towards the wall in the lesson); every momentum keeps its sign.

/** Momentum p = mv, in kg m s⁻¹ (signed like v). */
export function momentum(m: number, v: number): number {
  return m * v;
}

/** Change in momentum Δp = mv − mu: final minus initial, signs in. */
export function momentumChange(m: number, u: number, v: number): number {
  return m * v - m * u;
}

/** Total momentum of several bodies: each mv added with its sign. */
export function totalMomentum(bodies: readonly { m: number; v: number }[]): number {
  return bodies.reduce((sum, b) => sum + b.m * b.v, 0);
}

/** The speed of a body with momentum p and mass m: v = p / m. */
export function speedFromMomentum(p: number, m: number): number {
  return p / m;
}

/**
 * A trolley rolls at u towards a wall; its buffer's tip starts `gap` metres from the wall. When the tip touches, the buffer
 * squashes with a constant deceleration chosen so it squashes at most `squash` metres (a = u² / 2·squash). The deceleration
 * lasts until the trolley moves away at `back` (0: it stops and stays). Forward (towards the wall) is positive.
 */
export type WallHit = { u: number; back: number; gap: number; squash: number };

/** When the buffer touches, how hard it decelerates the trolley, and when the trolley leaves at its bounce speed. */
export function wallContact(h: WallHit): { tHit: number; a: number; tEnd: number } {
  const tHit = h.gap / h.u;
  const a = (h.u * h.u) / (2 * h.squash);
  return { tHit, a, tEnd: tHit + (h.u + h.back) / a };
}

/** Where the trolley is (s, metres towards the wall from its start) and its velocity, t seconds after the clip starts. */
export function wallRun(t: number, h: WallHit): { s: number; v: number } {
  const { tHit, a, tEnd } = wallContact(h);
  if (t <= tHit) return { s: h.u * t, v: h.u };
  const tc = Math.min(t, tEnd) - tHit; // time in contact so far
  const s = h.gap + h.u * tc - 0.5 * a * tc * tc;
  if (t <= tEnd) return { s, v: h.u - a * tc };
  return { s: s - h.back * (t - tEnd), v: -h.back };
}
