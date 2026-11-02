// Motion Lab model: velocity is a straight-line graph through points (t, v).
// Position, acceleration and areas are all computed from these points, never drawn by eye.

// Times are fixed per graph; the learner changes the speeds.
export type Graph = { t: number[]; v: number[] };

// Evenly spaced points: speeds at 0, dt, 2dt, ...
export const evenGraph = (v: number[], dt = 2): Graph => ({ t: v.map((_, i) => i * dt), v });

export const duration = (g: Graph) => g.t[g.t.length - 1];
export const withSpeeds = (g: Graph, v: number[]): Graph => ({ t: g.t, v });

const clampT = (g: Graph, t: number) => Math.min(Math.max(t, 0), duration(g));

// Index of the straight piece that contains t.
function segmentOf(g: Graph, t: number): number {
  const tc = clampT(g, t);
  let i = 0;
  while (i < g.t.length - 2 && tc >= g.t[i + 1]) i++;
  return i;
}

export function accelerationAt(g: Graph, t: number): number {
  const i = segmentOf(g, t);
  return (g.v[i + 1] - g.v[i]) / (g.t[i + 1] - g.t[i]);
}

export function velocityAt(g: Graph, t: number): number {
  const tc = clampT(g, t);
  const i = segmentOf(g, tc);
  return g.v[i] + accelerationAt(g, tc) * (tc - g.t[i]);
}

// Position (m) from the start: the area under the v-t graph, with sign.
export function displacementAt(g: Graph, t: number): number {
  const tc = clampT(g, t);
  const i = segmentOf(g, tc);
  let s = 0;
  for (let k = 0; k < i; k++) s += ((g.v[k] + g.v[k + 1]) / 2) * (g.t[k + 1] - g.t[k]);
  const dt = tc - g.t[i];
  return s + g.v[i] * dt + 0.5 * accelerationAt(g, tc) * dt * dt;
}

// Gradient of the s-t graph at t. It equals the velocity; named for what a student reads off.
export const slopeOfSt = velocityAt;

// Displacement divided by time.
export const averageVelocity = (g: Graph, t: number) => displacementAt(g, t) / t;

// One straight piece of the graph that stays on one side of the time axis.
export type Piece = { t0: number; v0: number; t1: number; v1: number };

// The graph from 0 to t, cut where it crosses v = 0, so each piece has one sign.
export function piecesUpTo(g: Graph, t: number): Piece[] {
  const out: Piece[] = [];
  const end = clampT(g, t);
  for (let k = 0; k < g.t.length - 1; k++) {
    const a = g.t[k];
    if (a >= end) break;
    const b = Math.min(g.t[k + 1], end);
    const acc = (g.v[k + 1] - g.v[k]) / (g.t[k + 1] - g.t[k]);
    const v0 = g.v[k];
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
export function distanceAt(g: Graph, t: number): number {
  return piecesUpTo(g, t).reduce((sum, p) => sum + Math.abs(pieceArea(p)), 0);
}

// Lowest and highest position over the whole run, used to size the track.
export function positionRange(g: Graph): { min: number; max: number } {
  let min = 0;
  let max = 0;
  for (let i = 0; i <= 160; i++) {
    const s = displacementAt(g, (i / 160) * duration(g));
    min = Math.min(min, s);
    max = Math.max(max, s);
  }
  return { min, max };
}

// Can the learner reach a goal by moving speeds that are whole numbers in [lo, hi]?
// Used by tests so a "make it end at 40 m" task is never impossible.
export function reachable(g: Graph, editable: number[], lo: number, hi: number, test: (g: Graph) => boolean): boolean {
  const v = g.v.slice();
  const walk = (k: number): boolean => {
    if (k === editable.length) return test({ t: g.t, v });
    for (let x = lo; x <= hi; x++) {
      v[editable[k]] = x;
      if (walk(k + 1)) return true;
    }
    return false;
  };
  return walk(0);
}
