// Falling through air: drag grows with speed (for these bodies D = kv²) until it balances the weight.
// Down is positive here (the body falls). Every number shown in a lesson is computed here, never typed by hand.

import { G } from './kinematics.ts';

/** Drag D = kv², in N, for a body with drag constant k (N s² m⁻²) moving at speed v. */
export function dragForce(k: number, v: number): number {
  'worklet';
  return k * v * v;
}

/** Terminal velocity: the speed where kv² = mg, so v = √(mg / k), in m s⁻¹. */
export function terminalVelocity(m: number, k: number, g = G): number {
  'worklet';
  return Math.sqrt((m * g) / k);
}

/** The drag constant of a body of mass m that falls with terminal velocity vt: k = mg / vt². */
export function dragConstantFor(m: number, vt: number, g = G): number {
  'worklet';
  return (m * g) / (vt * vt);
}

/** Acceleration (down positive) at speed v for a body with terminal velocity vt: a = g(1 − v² / vt²). */
export function dragAcceleration(v: number, vt: number, g = G): number {
  'worklet';
  return g * (1 - (v * v) / (vt * vt));
}

/**
 * Let go from rest: v = vt tanh(gt / vt), fallen s = (vt² / g) ln cosh(gt / vt) (the exact solution of m dv/dt = mg − kv²).
 */
export function fallFromRest(t: number, vt: number, g = G): { v: number; s: number; a: number } {
  'worklet';
  const x = (g * t) / vt;
  const v = vt * Math.tanh(x);
  // ln cosh x, written so it never overflows for large x
  const lnCosh = Math.abs(x) + Math.log(1 + Math.exp(-2 * Math.abs(x))) - Math.LN2;
  return { v, s: ((vt * vt) / g) * lnCosh, a: dragAcceleration(v, vt, g) };
}

/**
 * A skydive: free fall from rest with terminal velocity vt1; at `open` seconds the parachute starts to open and its drag
 * constant grows evenly over `inflate` seconds until the terminal velocity is vt2. Integrated in steps of 0.01 s (RK4).
 * Returns the speed, the distance fallen, the acceleration and the drag as a multiple of the weight (D / W).
 */
export type Skydive = { vt1: number; vt2: number; open: number; inflate: number };

export function skydive(t: number, sd: Skydive, g = G): { v: number; s: number; a: number; dOverW: number } {
  'worklet';
  // per unit mass: D/m = c v², with c = g / vt²
  const c1 = g / (sd.vt1 * sd.vt1);
  const c2 = g / (sd.vt2 * sd.vt2);
  const c = (time: number) => {
    if (time <= sd.open) return c1;
    const f = Math.min(1, (time - sd.open) / sd.inflate);
    return c1 + (c2 - c1) * f;
  };
  const acc = (time: number, v: number) => g - c(time) * v * v;
  if (t <= sd.open) {
    const r = fallFromRest(t, sd.vt1, g);
    return { v: r.v, s: r.s, a: r.a, dOverW: (r.v * r.v) / (sd.vt1 * sd.vt1) };
  }
  const start = fallFromRest(sd.open, sd.vt1, g);
  let v = start.v;
  let s = start.s;
  let time = sd.open;
  const h = 0.01;
  while (time < t - 1e-9) {
    const dt = Math.min(h, t - time);
    const k1 = acc(time, v);
    const k2 = acc(time + dt / 2, v + (k1 * dt) / 2);
    const k3 = acc(time + dt / 2, v + (k2 * dt) / 2);
    const k4 = acc(time + dt, v + k3 * dt);
    s += v * dt + (dt * dt * (k1 + k2 + k3)) / 6;
    v += (dt * (k1 + 2 * k2 + 2 * k3 + k4)) / 6;
    time += dt;
  }
  return { v, s, a: acc(t, v), dOverW: (c(t) * v * v) / g };
}

/** The biggest drag during the parachute's opening, as a multiple of the weight (searched every 0.01 s). */
export function peakDragRatio(sd: Skydive, g = G): number {
  let peak = 0;
  for (let t = sd.open; t <= sd.open + sd.inflate + 2; t += 0.01) peak = Math.max(peak, skydive(t, sd, g).dOverW);
  return peak;
}

/** The same skydive sampled every `step` seconds from 0 to tEnd in one pass (for drawing its v–t graph cheaply). */
export function skydiveSamples(sd: Skydive, tEnd: number, step = 0.05, g = G): { t: number; v: number; s: number; dOverW: number }[] {
  const out: { t: number; v: number; s: number; dOverW: number }[] = [];
  for (let i = 0; i * step <= tEnd + 1e-9; i++) {
    const t = i * step;
    // before the parachute the exact solution; after it, continue from the previous sample with the step integrator
    if (t <= sd.open || out.length === 0) {
      const r = skydive(t, sd, g);
      out.push({ t, v: r.v, s: r.s, dOverW: r.dOverW });
    } else {
      const prev = out[out.length - 1];
      const r = skydiveFrom(prev.t, prev.v, prev.s, t, sd, g);
      out.push({ t, ...r });
    }
  }
  return out;
}

/** Continue a skydive from (t0, v0, s0) to t1 with the same RK4 steps as `skydive`. */
function skydiveFrom(t0: number, v0: number, s0: number, t1: number, sd: Skydive, g: number): { v: number; s: number; dOverW: number } {
  const c1 = g / (sd.vt1 * sd.vt1);
  const c2 = g / (sd.vt2 * sd.vt2);
  const c = (time: number) => (time <= sd.open ? c1 : c1 + (c2 - c1) * Math.min(1, (time - sd.open) / sd.inflate));
  const acc = (time: number, v: number) => g - c(time) * v * v;
  let v = v0;
  let s = s0;
  let time = t0;
  while (time < t1 - 1e-9) {
    const dt = Math.min(0.01, t1 - time);
    const k1 = acc(time, v);
    const k2 = acc(time + dt / 2, v + (k1 * dt) / 2);
    const k3 = acc(time + dt / 2, v + (k2 * dt) / 2);
    const k4 = acc(time + dt, v + k3 * dt);
    s += v * dt + (dt * dt * (k1 + k2 + k3)) / 6;
    v += (dt * (k1 + 2 * k2 + 2 * k3 + k4)) / 6;
    time += dt;
  }
  return { v, s, dOverW: (c(t1) * v * v) / g };
}

/**
 * The curves of the "which v–t graph?" questions, sampled every `step` seconds: 'model' is the fall itself; the wrong ones are
 * named mistakes. After `open` seconds the drag constant changes evenly over `inflate` seconds until the terminal velocity
 * is `vt2` (a parachute opening, or the skydiver tucking in).
 *  · 'stop'     — as the model until `open`, then the speed falls evenly to zero (twice as long as the change takes);
 *  · 'straight' — a = g until the terminal velocity, then suddenly 0; as the model after `open`;
 *  · 'flat'     — as the model until `open`, then the speed stays where it was.
 */
export type FallCurve = 'model' | 'stop' | 'straight' | 'flat';

export function fallVtCurve(curve: FallCurve, vt1: number, change: { vt: number; open: number; inflate: number }, tEnd: number, step = 0.25, g = G): { t: number; v: number }[] {
  const sd: Skydive = { vt1, vt2: change.vt, open: change.open, inflate: change.inflate };
  const table = skydiveSamples(sd, tEnd, step, g);
  if (curve === 'model') return table.map((r) => ({ t: r.t, v: r.v }));
  const atOpen = table.find((r) => r.t >= change.open - 1e-9)!;
  if (curve === 'straight') return table.map((r) => ({ t: r.t, v: r.t <= change.open ? Math.min(g * r.t, vt1) : r.v }));
  if (curve === 'flat') return table.map((r) => ({ t: r.t, v: r.t <= change.open ? r.v : atOpen.v }));
  const toZero = 2 * change.inflate;
  return table.map((r) => ({ t: r.t, v: r.t <= change.open ? r.v : Math.max(0, atOpen.v * (1 - (r.t - change.open) / toZero)) }));
}
