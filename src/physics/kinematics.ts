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

/** Speed after a displacement s, from v² = u² + 2as (null if the body never gets that far). */
export function speedAfter(u: number, a: number, s: number): number | null {
  const v2 = u * u + 2 * a * s;
  return v2 < 0 ? null : Math.sqrt(v2);
}

/** How far a body thrown up at u rises before it stops: 0 = u² + 2as with a = −g gives s = u² / 2g. */
export function riseHeight(u: number, g = G): number {
  return (u * u) / (2 * g);
}

/** Core Practical 1: a body dropped from rest falls h = ½gt², so a graph of h against t² has gradient g/2. */
export function gFromGradient(gradient: number): number {
  return 2 * gradient;
}

/** Solve s = ut + ½at² for u (t ≠ 0). */
export function initialVelocityFor(s: number, a: number, t: number): number {
  return (s - 0.5 * a * t * t) / t;
}

/**
 * A motion shown on a scene between two clock times. Before `from` the body sits at its start,
 * after `end` it stays where it stopped (for example on the ground).
 */
export type Track = { motion: Motion; from: number; end: number };

export function trackPosition(t: number, tr: Track): number {
  'worklet';
  const tt = Math.min(Math.max(t, tr.from), tr.end) - tr.from;
  return tr.motion.s0 + tr.motion.u * tt + 0.5 * tr.motion.a * tt * tt;
}

export function trackVelocity(t: number, tr: Track): number {
  'worklet';
  const tt = Math.min(Math.max(t, tr.from), tr.end) - tr.from;
  return tr.motion.u + tr.motion.a * tt;
}

// The four equations of uniformly accelerated motion and the quantities each one contains.
export type Quantity = 's' | 'u' | 'v' | 'a' | 't';
export type RelationId = 'vuat' | 'sut' | 'v2as' | 'suvt';
export const RELATIONS: Record<RelationId, { text: string; has: Quantity[] }> = {
  vuat: { text: 'v = u + at', has: ['v', 'u', 'a', 't'] },
  sut: { text: 's = ut + ½at²', has: ['s', 'u', 'a', 't'] },
  v2as: { text: 'v² = u² + 2as', has: ['v', 'u', 'a', 's'] },
  suvt: { text: 's = ½(u + v)t', has: ['s', 'u', 'v', 't'] },
};

/** True if the equation contains the unknown and every other quantity in it is known. */
export function relationFits(id: RelationId, known: Quantity[], unknown: Quantity): boolean {
  const has = RELATIONS[id].has;
  return has.includes(unknown) && has.every((q) => q === unknown || known.includes(q));
}

export type Stop = { t: number; why: 'target' | 'ground' | 'offTop' | 'apex' };

/**
 * Where to stop the playback of a (possibly wrong) motion aimed at height `target`.
 * If it gets there: at the target (or when it leaves the ruler, if that comes first).
 * If it never gets there: at its turning point, else when it leaves the ruler, else on the ground.
 */
export function motionStop(m: Motion, target: number, worldTop: number): Stop {
  const tTarget = timeToReach(target, m);
  const tOff = timeToReach(worldTop, m);
  if (tTarget !== null) return tOff !== null && tOff < tTarget ? { t: tOff, why: 'offTop' } : { t: tTarget, why: 'target' };
  const tTurn = timeAtRest(m);
  if (tTurn !== null && tTurn > 1e-9) return { t: tTurn, why: 'apex' };
  if (tOff !== null) return { t: tOff, why: 'offTop' };
  const tGround = timeToReach(0, m);
  return tGround !== null ? { t: tGround, why: 'ground' } : { t: 1.5, why: 'apex' };
}
