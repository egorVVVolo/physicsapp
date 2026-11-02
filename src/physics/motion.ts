// Motion Lab model: velocity is a straight-line graph through knots at fixed times.
// Position, acceleration and areas are all computed from these knots, never drawn by eye.
export const KNOT_TIMES = [0, 2, 4, 6, 8]; // s
export const DURATION = 8; // s
const SEG = 2; // s between knots

// Velocities (m/s) at KNOT_TIMES.
export type Knots = number[];

const segmentOf = (t: number) => Math.min(Math.max(Math.floor(t / SEG), 0), KNOT_TIMES.length - 2);

export function accelerationAt(vs: Knots, t: number): number {
  const i = segmentOf(t);
  return (vs[i + 1] - vs[i]) / SEG;
}

export function velocityAt(vs: Knots, t: number): number {
  const i = segmentOf(t);
  return vs[i] + accelerationAt(vs, t) * (t - i * SEG);
}

// Position (m) from the start: the area under the v-t graph, with sign.
export function displacementAt(vs: Knots, t: number): number {
  const tc = Math.min(Math.max(t, 0), DURATION);
  const i = segmentOf(tc);
  let s = 0;
  for (let k = 0; k < i; k++) s += ((vs[k] + vs[k + 1]) / 2) * SEG;
  const dt = tc - i * SEG;
  return s + vs[i] * dt + 0.5 * accelerationAt(vs, tc) * dt * dt;
}

// One straight piece of the graph that stays on one side of the time axis.
export type Piece = { t0: number; v0: number; t1: number; v1: number };

// The graph from 0 to t, cut where it crosses v = 0, so each piece has one sign.
export function piecesUpTo(vs: Knots, t: number): Piece[] {
  const out: Piece[] = [];
  const end = Math.min(Math.max(t, 0), DURATION);
  for (let k = 0; k < KNOT_TIMES.length - 1; k++) {
    const a = k * SEG;
    if (a >= end) break;
    const b = Math.min(a + SEG, end);
    const acc = (vs[k + 1] - vs[k]) / SEG;
    const v0 = vs[k];
    const v1 = v0 + acc * (b - a);
    if (v0 * v1 < 0) {
      const tz = a + -v0 / acc;
      out.push({ t0: a, v0, t1: tz, v1: 0 }, { t0: tz, v0: 0, t1: b, v1 });
    } else {
      out.push({ t0: a, v0, t1: b, v1 });
    }
  }
  return out;
}

export const pieceArea = (p: Piece) => ((p.v0 + p.v1) / 2) * (p.t1 - p.t0);

// Total path length (m), ignoring direction.
export function distanceAt(vs: Knots, t: number): number {
  return piecesUpTo(vs, t).reduce((sum, p) => sum + Math.abs(pieceArea(p)), 0);
}

// Lowest and highest position over the whole run, used to size the track.
export function positionRange(vs: Knots): { min: number; max: number } {
  let min = 0;
  let max = 0;
  for (let i = 0; i <= 160; i++) {
    const s = displacementAt(vs, (i / 160) * DURATION);
    min = Math.min(min, s);
    max = Math.max(max, s);
  }
  return { min, max };
}
