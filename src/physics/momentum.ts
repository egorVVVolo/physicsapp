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

// ── Collisions (WPH11 point 14): total momentum before = total momentum after ─────────────────────

/** Velocity of two bodies that stick together: the total momentum shared by the total mass. */
export function stickVelocity(mA: number, uA: number, mB: number, uB: number): number {
  return (mA * uA + mB * uB) / (mA + mB);
}

/** B's velocity after the collision, from conservation, when A's velocity after (vA) is known. */
export function velocityAfter(mA: number, uA: number, mB: number, uB: number, vA: number): number {
  return (mA * uA + mB * uB - mA * vA) / mB;
}

/** One body in a collision: mass, velocity before (u) and after (v), right positive. */
export type Body = { m: number; u: number; v: number };

/**
 * A on the left, B on the right. Closing in (uA > uB): A's buffer tip starts `gap` metres from B's front face; on contact
 * the bodies close at a constant relative deceleration chosen so the buffer squashes at most `squash` metres, and both
 * velocities change at constant rates (equal and opposite forces) until they reach v. Pushed apart (both at rest): they
 * sit touching for `gap` seconds with the spring squashed by `squash`, then the spring pushes them apart over that length.
 */
export type Collision = { a: Body; b: Body; gap: number; squash: number };

/** When contact starts and ends. */
export function collisionTimes(c: Collision): { tHit: number; tEnd: number } {
  const w0 = c.a.u - c.b.u; // closing speed before
  const w1 = c.a.v - c.b.v; // closing speed after (≤ 0: they move apart or together)
  if (w0 <= 0) return { tHit: c.gap, tEnd: c.gap + (2 * c.squash) / Math.max(-w1, 1e-9) };
  const acc = (w0 * w0) / (2 * c.squash);
  const tHit = c.gap / w0;
  return { tHit, tEnd: tHit + (w0 - w1) / acc };
}

/** Displacement s (m, right positive, from its start) and velocity of each body, t seconds into the clip. */
export function collisionRun(t: number, c: Collision): { sA: number; vA: number; sB: number; vB: number } {
  const { tHit, tEnd } = collisionTimes(c);
  const tau = tEnd - tHit;
  const one = (b: Body) => {
    if (t <= tHit) return { s: b.u * t, v: b.u };
    const tc = Math.min(t, tEnd) - tHit;
    const acc = (b.v - b.u) / tau;
    const s = b.u * (tHit + tc) + 0.5 * acc * tc * tc;
    if (t <= tEnd) return { s, v: b.u + acc * tc };
    return { s: s + b.v * (t - tEnd), v: b.v };
  };
  const A = one(c.a);
  const B = one(c.b);
  return { sA: A.s, vA: A.v, sB: B.s, vB: B.v };
}

/**
 * How far A's buffer is squashed (m): closing in, the overlap past first touch; pushed apart, the squash left in the spring.
 * Never negative.
 */
export function collisionSquash(t: number, c: Collision): number {
  const r = collisionRun(t, c);
  const closing = c.a.u - c.b.u > 0;
  return Math.max(0, closing ? r.sA - r.sB - c.gap : c.squash + r.sA - r.sB);
}
