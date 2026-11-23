// FIG: Rose moves a crate across a level floor. On the left the scene: the crate, a hatched floor, Rose's gloved hand on
// a rope (pulling at θ above the floor) or a pole (pushing at θ below it). On the right the crate's free-body diagram:
// the crate shrunk to a dot (it slides without turning), one arrow per force, all to one scale (KF). N comes from
// normalWithPull and friction from what balances the forward push (src/physics/dynamics), so every arrow is the model's.
// Played, the floor slides past at a steady speed; once Rose lets go the crate slides on and stops (friction μN).
// A force the question asks about is a dashed "?" stub until Check; arrows grow when they first appear and change
// smoothly when the sheet is kept for the next screen.
import { useEffect, useRef, useState } from 'react';
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { acceleration, normalWithPull, weight, frictionCoefficient } from '@/physics/dynamics';
import { brakingPosition, G, stoppingTime } from '@/physics/kinematics';
import { components } from '@/physics/vectors';
import { fixed } from '@/physics/format';
import type { CrateFig, CrateForce } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { CHANGE_DELAY, STILL, useLoopTime, useTween, type DrawClock } from './anim';
import { CgMark, ForceArrow, ForceLetter, MonoLabel } from './draw';
import { Mitten } from './SledgeFigure';
import { stage, Tag } from './kit';

export const CRATE_VB = { w: 340, h: 230 };

const PEN = { floor: [0, 0.3], crate: [0.2, 0.5], hand: [0.4, 0.62], fbd: [0.58, 0.8], labels: [0.78, 0.95] } as const;
const RAD = Math.PI / 180;

const FLOOR = 190; // the floor line of the scene
const BOX = { w: 72, h: 50 }; // the crate's front face
const ROPE = 78; // from the hitch to Rose's hand
const POLE = 64; // from Rose's hand to the crate
const DOT = { x: 266, y: 124 }; // the crate as a particle
const DIVIDE = 212; // the dashed line between the scene and the free-body diagram
const KF = 0.25; // viewBox units per newton on the free-body diagram
// A flat rope (the crate accelerates, `friction` set): a shorter rope and a narrower scene leave room for a 300 N pull
const FLAT = { rope: 50, dot: { x: 236, y: 116 }, divide: 182 };
const ACC_PX_PER_M = 24; // the scene of an accelerating crate: the floor goes by faster, so a smaller scale
const ACC_U = 2; // m s⁻¹, the crate's speed when an accelerating clip starts
const ACC_RUN = 2; // s, how long an accelerating clip runs before it starts again
const ACC_MARK = { x: 292, y: 62 }; // the acceleration chevrons on the free-body diagram (upper right, clear of N and T)
const LEGEND = { x: 14, y: 26, step: 13 }; // the list of sizes: top left, above the scene
const PX_PER_M = 60; // the scene: metres of floor to viewBox units
const STEADY_V = 1; // m s⁻¹, how fast the floor slides past while Rose pulls
const LET_GO_V = 3; // m s⁻¹, the crate's speed when Rose lets go
const TICK = 9; // gap between the floor's hatch ticks

/** Where the back of the crate stands (before the sheet is centred), for each way of moving it. */
const BACK = { rope: 34, pole: 66, none: 14 };

/**
 * Every force on the crate, from the model, and its acceleration. `live` is the explore slider: the rope's angle, or the
 * pull when `slider: 'force'`.
 */
export function crateForces(fig: CrateFig, live?: number) {
  const angle = fig.slider === 'force' ? fig.angle : (live ?? fig.angle);
  const force = fig.slider === 'force' ? (live ?? fig.force) : fig.force;
  const w = weight(fig.m);
  const signed = fig.by === 'pole' ? -angle : angle; // a pole pushes down: below the horizontal
  const c = components(force, angle);
  if (fig.by === 'none') {
    // Rose has let go: sliding friction is μN, with μ from the steady pull that came before
    const mu = frictionCoefficient(c.along, normalWithPull(w, force, angle));
    return { W: w, N: w, F: mu * w, T: 0, forward: 0, up: 0, mu, sum: -mu * w, a: acceleration(-mu * w, fig.m) };
  }
  // a fixed sliding friction: the forces need not balance, the crate accelerates; otherwise friction balances the pull
  const F = fig.friction ?? c.along;
  const sum = c.along - F;
  return { W: w, N: normalWithPull(w, force, signed), F, T: force, forward: c.along, up: c.across, mu: 0, sum, a: acceleration(sum, fig.m) };
}

/** "1.25 m s⁻²", with a minus sign when the crate slows down. */
const accText = (a: number) => `${fixed(a, 2)} m s⁻²`;

/** The given values in the sheet header; on the explore screen it reads N and the forward part of the pull. */
export function crateParams(fig: CrateFig, live?: number): string {
  if (live !== undefined) {
    const f = crateForces(fig, live);
    if (fig.slider === 'force') return `ΣF ${fixed(f.sum, 0)} N · a ${accText(f.a)}`;
    return `N ${fixed(f.N, 0)} N · forward ${fixed(f.forward, 1)} N`;
  }
  const m = `m = ${fig.m} kg`;
  if (fig.friction !== undefined) return `${m}, T = ${fixed(fig.force, 0)} N, F = ${fixed(fig.friction, 0)} N`;
  if (fig.by === 'rope') return `${m}, pull ${fixed(fig.force, 0)} N at ${fixed(fig.angle, 0)}°`;
  if (fig.by === 'pole') return `${m}, push ${fixed(fig.force, 0)} N at ${fixed(fig.angle, 0)}° down`;
  return `${m}, let go at ${LET_GO_V} m s⁻¹`;
}

export const cratePlays = (fig: CrateFig): boolean => fig.play === true;
/** It keeps playing while the explore slider moves (the slider sets the pull, the floor follows). */
export const cratePlaysLive = (fig: CrateFig): boolean => fig.play === true && fig.slider === 'force';

/** The free-body diagram is drawn (otherwise the scene stands alone, in the middle of the sheet). */
const hasFbd = (fig: CrateFig) => fig.forces.length > 0 || fig.fbdAfterCheck === true;
/** How far the whole scene is moved right: to the middle when there is no free-body diagram. */
const sceneShift = (fig: CrateFig) => (hasFbd(fig) ? 0 : 57) + BACK[fig.by];
/** Alone on the sheet, the scene is drawn larger (about the middle of the crate and rope, on the floor). */
const sceneZoom = (fig: CrateFig) => (hasFbd(fig) ? 1 : 1.4);

type Props = { fig: CrateFig; live?: number; playing: boolean; clock?: DrawClock; prev?: CrateFig };

export function CrateFigure({ fig, live, playing, clock = STILL, prev }: Props) {
  const { palette: p, material: m, stroke, pick } = useTheme();
  const angle = fig.slider === 'force' ? fig.angle : (live ?? fig.angle);
  const f = crateForces(fig, live);
  const flat = fig.friction !== undefined;
  const dot = flat ? FLAT.dot : DOT;
  const divide = flat ? FLAT.divide : DIVIDE;
  const rope = flat ? FLAT.rope : ROPE;
  const kf = KF;
  const fbd = hasFbd(fig) && !fig.fbdAfterCheck;
  const asked = (k: CrateForce) => (fig.ask ?? []).some((a) => a.force === k);
  const shown = (k: CrateForce, of: CrateFig) => hasFbd(of) && !of.fbdAfterCheck && of.forces.includes(k) && !(of.ask ?? []).some((a) => a.force === k);
  const prevF = prev ? crateForces(prev) : undefined;

  // each arrow eases to its length: grows from nothing when it first appears (one after another), follows the slider
  const kept = prev !== undefined;
  const target = (k: CrateForce) => (shown(k, fig) ? f[k] * kf : 0);
  const from = (k: CrateForce) => (prev && prevF && shown(k, prev) ? prevF[k] * kf : 0);
  const ms = live !== undefined ? 160 : 420;
  const wait = (i: number) => (kept ? CHANGE_DELAY : 300 + i * 220);
  const len = {
    W: useTween(target('W'), from('W'), ms, wait(0)),
    N: useTween(target('N'), from('N'), ms, wait(1)),
    F: useTween(target('F'), from('F'), ms, wait(2)),
    T: useTween(target('T'), from('T'), ms, wait(3)),
  };
  const split = useTween(fig.split ? 1 : 0, prev?.split ? 1 : 0, 420, kept ? CHANGE_DELAY : 1100);
  const shift = useTween(sceneShift(fig), prev ? sceneShift(prev) : undefined, 420, kept ? CHANGE_DELAY : 0);
  const zoom = useTween(sceneZoom(fig), prev ? sceneZoom(prev) : undefined, 420, kept ? CHANGE_DELAY : 0);
  const floorEnd = useTween(hasFbd(fig) ? divide - 8 : 332, prev ? (hasFbd(prev) ? divide - 8 : 332) : undefined, 420, kept ? CHANGE_DELAY : 0);

  // the motion: the floor slides past (steady), or the crate slides on and stops (let go)
  const braking = { u: LET_GO_V, a: -f.mu * G, react: 0 };
  const tStop = fig.by === 'none' ? stoppingTime(braking) : 0;
  const accelerates = fig.friction !== undefined && fig.by !== 'none';
  const t = useLoopTime(playing && fig.play === true && !accelerates, fig.by === 'none' ? tStop : TICK / (STEADY_V * PX_PER_M), fig.by, fig.by === 'none' ? 0.9 : 0);
  const run = useAccelerating(playing && fig.play === true && accelerates, f.a);
  const slid = fig.by === 'none' ? brakingPosition(fig.play ? t : 0, braking) * PX_PER_M : 0;
  const scroll = accelerates ? run.s * ACC_PX_PER_M : fig.by === 'none' ? 0 : t * STEADY_V * PX_PER_M;

  const x0 = shift + slid; // the back of the crate
  const top = FLOOR - BOX.h;
  const cg: [number, number] = [x0 + BOX.w / 2, FLOOR - BOX.h / 2];
  const d: [number, number] = [Math.cos(angle * RAD), (fig.by === 'pole' ? 1 : -1) * Math.sin(angle * RAD)]; // the force's direction
  const hitch: [number, number] = [x0 + BOX.w, FLOOR - BOX.h / 2];
  const mitten: [number, number] = [hitch[0] + d[0] * rope, hitch[1] + d[1] * rope];
  const poleEnd: [number, number] = [x0, top + 18];
  const hand: [number, number] = [poleEnd[0] - d[0] * POLE, poleEnd[1] - d[1] * POLE];

  // the floor: a line with hatch ticks that slide back while the crate is pulled along
  const ticks: string[] = [];
  const off = scroll % TICK;
  for (let x = 8 - off; x + 8 < floorEnd; x += TICK) if (x >= 8) ticks.push(`M${x},${FLOOR + 8} L${x + 8},${FLOOR}`);

  // free-body diagram tips
  const tip = {
    W: [dot.x, dot.y + len.W] as const,
    N: [dot.x, dot.y - len.N] as const,
    F: [dot.x - len.F, dot.y] as const,
    T: [dot.x + d[0] * len.T, dot.y + d[1] * len.T] as const,
  };
  const fwdTip: [number, number] = [dot.x + d[0] * len.T, dot.y];
  const letters = { W: 'W', N: 'N', F: 'F', T: 'T' };
  const legend: string[] = [];
  if (fbd && fig.values) {
    for (const k of ['W', 'N', 'F', 'T'] as const) {
      if (!fig.forces.includes(k)) continue;
      legend.push(`${k} ${asked(k) ? '?' : `${fixed(f[k], 0)} N`}`);
    }
    if (fig.split) legend.push(`T forward ${fixed(f.forward, 1)} N`, `T up ${fixed(f.up, 1)} N`);
    if (fig.friction !== undefined) legend.push(`ΣF ${fixed(f.sum, 0)} N`);
  }
  const accLabel = fig.accel === 'shown' ? accText(f.a) : fig.accel ? '?' : null;

  return (
    <Group>
      {stage(clock, 
        PEN.floor,
        <Group>
          <Rect x={8} y={FLOOR} width={floorEnd - 8} height={8} fill={pick(m.floor, 'none')} />
          <Line x1={8} y1={FLOOR} x2={floorEnd} y2={FLOOR} stroke={p.draw} strokeWidth={pick(stroke.body, 2)} />
          <Path d={ticks.join(' ')} stroke={p.draw} strokeWidth={pick(stroke.thin, 1)} opacity={0.55} />
        </Group>,
      )}

      <Group transform={`translate(${x0 + 79} ${FLOOR}) scale(${zoom}) translate(${-(x0 + 79)} ${-FLOOR})`}>
      {/* the crate: a front face of planks with a brace, a top facet, its centre of gravity */}
      {stage(clock, 
        PEN.crate,
        <Group>
          <Path d={`M${x0},${top} L${x0 + 7},${top - 6} H${x0 + BOX.w + 7} L${x0 + BOX.w},${top} Z`} fill={pick(m.woodSide, p.drawFillDark)} stroke={p.draw} strokeWidth={pick(stroke.body, 1.6)} strokeLinejoin="round" />
          <Rect x={x0} y={top} width={BOX.w} height={BOX.h} rx={1.5} fill={pick(m.wood, p.drawFill)} stroke={p.draw} strokeWidth={stroke.body} />
          <Path d={`M${x0 + 2},${top + BOX.h / 3} H${x0 + BOX.w - 2} M${x0 + 2},${top + (2 * BOX.h) / 3} H${x0 + BOX.w - 2}`} stroke={p.draw} strokeWidth={pick(stroke.thin, 1)} opacity={0.5} />
          <Path d={`M${x0 + 6},${FLOOR - 4} L${x0 + BOX.w - 6},${top + 4}`} stroke={p.draw} strokeWidth={stroke.thin} opacity={0.6} />
          <CgMark x={cg[0]} y={cg[1]} color={p.draw} />
        </Group>,
      )}

      {/* Rose's hand: on the rope, on the pole, or gone (the rope lies slack on the floor) */}
      {stage(clock, 
        PEN.hand,
        <Group>
          {fig.by === 'rope' && (
            <Group>
              <Line x1={hitch[0]} y1={hitch[1]} x2={mitten[0]} y2={mitten[1]} stroke={pick(m.rubber, p.draw)} strokeWidth={pick(stroke.body, 1.6)} />
              <Circle cx={hitch[0]} cy={hitch[1]} r={2.4} fill={p.draw} />
              <Mitten x={mitten[0]} y={mitten[1]} dx={d[0]} dy={d[1]} />
              <MonoLabel x={mitten[0] + (angle < 15 ? -2 : 6)} y={mitten[1] + (angle < 15 ? -14 : 18)} text="ROSE" color={p.label} size={9} anchor={angle < 15 ? 'middle' : 'start'} />
            </Group>
          )}
          {fig.by === 'pole' && (
            <Group>
              <Line x1={hand[0]} y1={hand[1]} x2={poleEnd[0]} y2={poleEnd[1]} stroke={p.draw} strokeWidth={5} strokeLinecap="round" />
              <Line x1={hand[0]} y1={hand[1]} x2={poleEnd[0]} y2={poleEnd[1]} stroke={pick(m.wood, p.drawFillDark)} strokeWidth={2.4} strokeLinecap="round" />
              <Mitten x={hand[0]} y={hand[1]} dx={-d[0]} dy={-d[1]} />
              <MonoLabel x={hand[0] + 4} y={hand[1] - 16} text="ROSE" color={p.label} size={9} />
            </Group>
          )}
          {fig.by === 'none' && (
            <Path
              d={`M${hitch[0]},${hitch[1]} Q${hitch[0] + 10},${FLOOR - 2} ${hitch[0] + 22},${FLOOR - 1.2} H${hitch[0] + 38}`}
              fill="none"
              stroke={pick(m.rubber, p.draw)}
              strokeWidth={pick(stroke.body, 1.6)}
            />
          )}
          {fig.play && <MotionTag x={cg[0]} y={top - 20} text={accelerates ? (run.v === 0 ? 'stopped' : `v = ${fixed(run.v, 1)} m s⁻¹`) : fig.by === 'none' ? 'slowing down' : 'steady speed'} />}
          {fig.floorPush && (
            <Group>
              <ForceArrow x1={cg[0]} y1={FLOOR} x2={cg[0]} y2={FLOOR + 32} color={p.force} width={2.8} />
              <Circle cx={cg[0]} cy={FLOOR} r={3} fill={p.force} />
              <ForceLetter x={cg[0] + 9} y={FLOOR + 30} text="P" color={p.force} size={14} anchor="start" />
            </Group>
          )}
        </Group>,
      )}
      </Group>

      {/* the free-body diagram: the crate as a dot */}
      {hasFbd(fig) &&
        stage(clock, 
          PEN.fbd,
          <Group>
            <Line x1={divide} y1={14} x2={divide} y2={216} stroke={p.paperLine} strokeWidth={1.2} strokeDasharray="4 4" />
            <MonoLabel x={flat ? 332 : divide + 6} y={flat ? 200 : 192} text="CRATE" color={p.label} size={9} anchor={flat ? 'end' : 'start'} />
            <MonoLabel x={flat ? 332 : divide + 6} y={flat ? 211 : 203} text="ALONE" color={p.label} size={9} anchor={flat ? 'end' : 'start'} />
            <Rect x={dot.x - 7} y={dot.y - 7} width={14} height={14} rx={2} fill="none" stroke={p.label} strokeWidth={1} strokeDasharray="3 3" />
            {!fbd && <MonoLabel x={dot.x + 18} y={dot.y - 14} text="?" color={p.ink} size={12} />}
            {fig.split && split > 0 && (
              <Path
                d={`M${tip.T[0]},${tip.T[1]} V${fwdTip[1]} M${tip.T[0]},${tip.T[1]} H${dot.x}`}
                fill="none"
                stroke={p.label}
                strokeWidth={1.1}
                strokeDasharray="3 3"
                opacity={split}
              />
            )}
            {(['W', 'N', 'F', 'T'] as const).map((k) => (
              <ForceArrow key={k} x1={dot.x} y1={dot.y} x2={tip[k][0]} y2={tip[k][1]} color={p.force} width={fig.split && k === 'T' ? 3.6 : 3.2} />
            ))}
            {fbd && (fig.ask ?? []).map((a) => <AskStub key={a.force} force={a.force} />)}
            <Circle cx={dot.x} cy={dot.y} r={3.6} fill={p.force} />
          </Group>,
        )}

      {fbd &&
        stage(clock, 
          PEN.labels,
          <Group>
            {len.W > 4 && <ForceLetter x={dot.x - 8} y={tip.W[1] - 2} text={letters.W} color={p.force} size={14} anchor="end" />}
            {len.N > 4 && <ForceLetter x={dot.x - 8} y={tip.N[1] + 11} text={letters.N} color={p.force} size={14} anchor="end" />}
            {len.F > 4 && <ForceLetter x={tip.F[0] - 4} y={dot.y - 6} text={letters.F} color={p.force} size={14} anchor="end" />}
            {len.T > 4 && <ForceLetter x={tip.T[0] + 5} y={tip.T[1] + (d[1] < 0 ? 2 : 12)} text={letters.T} color={p.force} size={14} anchor="start" />}
            {accLabel !== null && Math.abs(f.a) > 0.005 && <AccMark x={ACC_MARK.x} y={ACC_MARK.y} back={f.a < 0} />}
            {accLabel !== null && (
              <Group>
                <MonoLabel x={ACC_MARK.x} y={ACC_MARK.y + 24} text={accLabel === '?' ? 'a = ?' : `a = ${fixed(f.a, 2)}`} color={p.ink} size={10} />
                {accLabel !== '?' && <MonoLabel x={ACC_MARK.x} y={ACC_MARK.y + 36} text="m s⁻²" color={p.label} size={9} />}
              </Group>
            )}
            {legend.map((line, i) => (
              <MonoLabel key={line} x={LEGEND.x} y={LEGEND.y + i * LEGEND.step} text={line} color={p.ink} size={9} anchor="start" />
            ))}
          </Group>,
        )}
    </Group>
  );
}

/** The force a question asks about: a short dashed arrow from the dot with its letter and "?". */
function AskStub({ force }: { force: 'N' | 'F' }) {
  const { palette: p } = useTheme();
  const up = force === 'N';
  const end: [number, number] = up ? [DOT.x, DOT.y - 30] : [DOT.x - 26, DOT.y];
  return (
    <Group>
      <ForceArrow x1={DOT.x} y1={DOT.y} x2={end[0]} y2={end[1]} color={p.force} width={2.4} dashed />
      <ForceLetter x={up ? DOT.x - 8 : end[0] - 4} y={up ? end[1] + 11 : DOT.y - 6} text={`${force} ?`} color={p.force} size={14} anchor="end" />
    </Group>
  );
}

/** "steady speed →": an outline arrow along the motion with a tag above it. */
function MotionTag({ x, y, text }: { x: number; y: number; text: string }) {
  const { palette: p } = useTheme();
  const [a, b] = [x - 24, x + 24];
  const d = `M${a},${y - 3} H${b - 10} V${y - 8} L${b},${y} L${b - 10},${y + 8} V${y + 3} H${a} Z`;
  return (
    <Group>
      <Path d={d} fill="none" stroke={p.label} strokeWidth={1.6} strokeLinejoin="round" />
      <Tag x={x} y={y - 12} text={text} />
    </Group>
  );
}

/** The acceleration on the free-body diagram: two chevrons pointing forward (or back, when the crate slows down). */
function AccMark({ x, y, back }: { x: number; y: number; back: boolean }) {
  const { palette: p } = useTheme();
  const d = back ? -4 : 4; // half the width of one chevron, signed by its direction
  const one = (cx: number) => `M${cx - d},${y - 7} L${cx + d},${y} L${cx - d},${y + 7}`;
  return (
    <Group>
      <Path d={one(x - 5)} fill="none" stroke={p.draw} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      <Path d={one(x + 5)} fill="none" stroke={p.draw} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </Group>
  );
}

/**
 * The accelerating crate's clip: it starts at ACC_U and its speed follows v' = a (a from the model, so the slider changes it
 * smoothly mid-clip); it cannot slide backwards, so a slowing crate stops and stays. After ACC_RUN seconds it starts again.
 * Returns how far it has slid (m) and its speed.
 */
function useAccelerating(running: boolean, a: number): { s: number; v: number } {
  const [state, setState] = useState({ s: 0, v: ACC_U });
  const acc = useRef(a);
  useEffect(() => {
    acc.current = a;
  }, [a]);
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    let t = 0;
    let s = 0;
    let v = ACC_U;
    let stopped = -1; // when a slowing crate came to rest: it waits a moment, then the clip starts again
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      if (t > ACC_RUN || (stopped >= 0 && t - stopped > 0.6)) {
        t = 0;
        v = ACC_U;
        stopped = -1;
      }
      const v1 = Math.max(0, v + acc.current * dt);
      s += ((v + v1) / 2) * dt; // exact for a constant a
      v = v1;
      if (v === 0 && stopped < 0) stopped = t;
      setState({ s, v });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [running]);
  return state;
}
