// FIG: Rose moves a crate across a level floor. On the left the scene: the crate, a hatched floor, Rose's gloved hand on
// a rope (pulling at θ above the floor) or a pole (pushing at θ below it). On the right the crate's free-body diagram:
// the crate shrunk to a dot (it slides without turning), one arrow per force, all to one scale (KF). N comes from
// normalWithPull and friction from what balances the forward push (src/physics/dynamics), so every arrow is the model's.
// Played, the floor slides past at a steady speed; once Rose lets go the crate slides on and stops (friction μN).
// A force the question asks about is a dashed "?" stub until Check; arrows grow when they first appear and change
// smoothly when the sheet is kept for the next screen.
import type { ReactNode } from 'react';
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { normalWithPull, weight, frictionCoefficient } from '@/physics/dynamics';
import { brakingPosition, G, stoppingTime } from '@/physics/kinematics';
import { components } from '@/physics/vectors';
import { fixed } from '@/physics/format';
import type { CrateFig, CrateForce } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { CHANGE_DELAY, STILL, useLoopTime, useTween, type DrawClock } from './anim';
import { CgMark, DrawnFade, ForceArrow, ForceLetter, MonoLabel } from './draw';
import { Tag } from './RoadFigure';
import { Mitten } from './SledgeFigure';

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
const LEGEND = { x: 14, y: 26, step: 13 }; // the list of sizes: top left, above the scene
const PX_PER_M = 60; // the scene: metres of floor to viewBox units
const STEADY_V = 1; // m s⁻¹, how fast the floor slides past while Rose pulls
const LET_GO_V = 3; // m s⁻¹, the crate's speed when Rose lets go
const TICK = 9; // gap between the floor's hatch ticks

/** Where the back of the crate stands (before the sheet is centred), for each way of moving it. */
const BACK = { rope: 34, pole: 66, none: 14 };

/** Every force on the crate, from the model. `angle` is the rope's angle (the slider on the explore screen). */
export function crateForces(fig: CrateFig, angle = fig.angle) {
  const w = weight(fig.m);
  const signed = fig.by === 'pole' ? -angle : angle; // a pole pushes down: below the horizontal
  const c = components(fig.force, angle);
  if (fig.by === 'none') {
    // Rose has let go: sliding friction is μN, with μ from the steady pull that came before
    const mu = frictionCoefficient(c.along, normalWithPull(w, fig.force, angle));
    return { W: w, N: w, F: mu * w, T: 0, forward: 0, up: 0, mu };
  }
  return { W: w, N: normalWithPull(w, fig.force, signed), F: c.along, T: fig.force, forward: c.along, up: c.across, mu: 0 };
}

/** The given values in the sheet header; on the explore screen it reads N and the forward part of the pull. */
export function crateParams(fig: CrateFig, angle?: number): string {
  if (angle !== undefined) {
    const f = crateForces(fig, angle);
    return `N ${fixed(f.N, 0)} N · forward ${fixed(f.forward, 1)} N`;
  }
  const m = `m = ${fig.m} kg`;
  if (fig.by === 'rope') return `${m}, pull ${fixed(fig.force, 0)} N at ${fixed(fig.angle, 0)}°`;
  if (fig.by === 'pole') return `${m}, push ${fixed(fig.force, 0)} N at ${fixed(fig.angle, 0)}° down`;
  return `${m}, let go at ${LET_GO_V} m s⁻¹`;
}

export const cratePlays = (fig: CrateFig): boolean => fig.play === true;

/** The free-body diagram is drawn (otherwise the scene stands alone, in the middle of the sheet). */
const hasFbd = (fig: CrateFig) => fig.forces.length > 0 || fig.fbdAfterCheck === true;
/** How far the whole scene is moved right: to the middle when there is no free-body diagram. */
const sceneShift = (fig: CrateFig) => (hasFbd(fig) ? 0 : 57) + BACK[fig.by];
/** Alone on the sheet, the scene is drawn larger (about the middle of the crate and rope, on the floor). */
const sceneZoom = (fig: CrateFig) => (hasFbd(fig) ? 1 : 1.4);

type Props = { fig: CrateFig; live?: number; playing: boolean; clock?: DrawClock; prev?: CrateFig };

export function CrateFigure({ fig, live, playing, clock = STILL, prev }: Props) {
  const { palette: p } = useTheme();
  const angle = live ?? fig.angle;
  const f = crateForces(fig, angle);
  const fbd = hasFbd(fig) && !fig.fbdAfterCheck;
  const asked = (k: CrateForce) => (fig.ask ?? []).some((a) => a.force === k);
  const shown = (k: CrateForce, of: CrateFig) => hasFbd(of) && !of.fbdAfterCheck && of.forces.includes(k) && !(of.ask ?? []).some((a) => a.force === k);
  const prevF = prev ? crateForces(prev) : undefined;

  // each arrow eases to its length: grows from nothing when it first appears (one after another), follows the slider
  const kept = prev !== undefined;
  const target = (k: CrateForce) => (shown(k, fig) ? f[k] * KF : 0);
  const from = (k: CrateForce) => (prev && prevF && shown(k, prev) ? prevF[k] * KF : 0);
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
  const floorEnd = useTween(hasFbd(fig) ? DIVIDE - 8 : 332, prev ? (hasFbd(prev) ? DIVIDE - 8 : 332) : undefined, 420, kept ? CHANGE_DELAY : 0);

  // the motion: the floor slides past (steady), or the crate slides on and stops (let go)
  const braking = { u: LET_GO_V, a: -f.mu * G, react: 0 };
  const tStop = fig.by === 'none' ? stoppingTime(braking) : 0;
  const t = useLoopTime(playing && fig.play === true, fig.by === 'none' ? tStop : TICK / (STEADY_V * PX_PER_M), fig.by, fig.by === 'none' ? 0.9 : 0);
  const slid = fig.by === 'none' ? brakingPosition(fig.play ? t : 0, braking) * PX_PER_M : 0;
  const scroll = fig.by === 'none' ? 0 : t * STEADY_V * PX_PER_M;

  const x0 = shift + slid; // the back of the crate
  const top = FLOOR - BOX.h;
  const cg: [number, number] = [x0 + BOX.w / 2, FLOOR - BOX.h / 2];
  const d: [number, number] = [Math.cos(angle * RAD), (fig.by === 'pole' ? 1 : -1) * Math.sin(angle * RAD)]; // the force's direction
  const hitch: [number, number] = [x0 + BOX.w, FLOOR - BOX.h / 2];
  const mitten: [number, number] = [hitch[0] + d[0] * ROPE, hitch[1] + d[1] * ROPE];
  const poleEnd: [number, number] = [x0, top + 18];
  const hand: [number, number] = [poleEnd[0] - d[0] * POLE, poleEnd[1] - d[1] * POLE];
  const stage = (pen: readonly [number, number], children: ReactNode) => (
    <DrawnFade clock={clock} from={pen[0]} to={pen[1]}>
      {children}
    </DrawnFade>
  );

  // the floor: a line with hatch ticks that slide back while the crate is pulled along
  const ticks: string[] = [];
  const off = scroll % TICK;
  for (let x = 8 - off; x + 8 < floorEnd; x += TICK) if (x >= 8) ticks.push(`M${x},${FLOOR + 8} L${x + 8},${FLOOR}`);

  // free-body diagram tips
  const tip = {
    W: [DOT.x, DOT.y + len.W] as const,
    N: [DOT.x, DOT.y - len.N] as const,
    F: [DOT.x - len.F, DOT.y] as const,
    T: [DOT.x + d[0] * len.T, DOT.y + d[1] * len.T] as const,
  };
  const fwdTip: [number, number] = [DOT.x + d[0] * len.T, DOT.y];
  const letters = { W: 'W', N: 'N', F: 'F', T: 'T' };
  const legend: string[] = [];
  if (fbd && fig.values) {
    for (const k of ['W', 'N', 'F', 'T'] as const) {
      if (!fig.forces.includes(k)) continue;
      legend.push(`${k} ${asked(k) ? '?' : `${fixed(f[k], 0)} N`}`);
    }
    if (fig.split) legend.push(`T forward ${fixed(f.forward, 1)} N`, `T up ${fixed(f.up, 1)} N`);
  }

  return (
    <Group>
      {stage(
        PEN.floor,
        <Group>
          <Line x1={8} y1={FLOOR} x2={floorEnd} y2={FLOOR} stroke={p.draw} strokeWidth={2} />
          <Path d={ticks.join(' ')} stroke={p.draw} strokeWidth={1} opacity={0.55} />
        </Group>,
      )}

      <Group transform={`translate(${x0 + 79} ${FLOOR}) scale(${zoom}) translate(${-(x0 + 79)} ${-FLOOR})`}>
      {/* the crate: a front face of planks with a brace, a top facet, its centre of gravity */}
      {stage(
        PEN.crate,
        <Group>
          <Path d={`M${x0},${top} L${x0 + 7},${top - 6} H${x0 + BOX.w + 7} L${x0 + BOX.w},${top} Z`} fill={p.drawFillDark} stroke={p.draw} strokeWidth={1.6} strokeLinejoin="round" />
          <Rect x={x0} y={top} width={BOX.w} height={BOX.h} rx={1.5} fill={p.drawFill} stroke={p.draw} strokeWidth={1.8} />
          <Path d={`M${x0 + 2},${top + BOX.h / 3} H${x0 + BOX.w - 2} M${x0 + 2},${top + (2 * BOX.h) / 3} H${x0 + BOX.w - 2}`} stroke={p.draw} strokeWidth={1} opacity={0.5} />
          <Path d={`M${x0 + 6},${FLOOR - 4} L${x0 + BOX.w - 6},${top + 4}`} stroke={p.draw} strokeWidth={1.2} opacity={0.6} />
          <CgMark x={cg[0]} y={cg[1]} color={p.draw} />
        </Group>,
      )}

      {/* Rose's hand: on the rope, on the pole, or gone (the rope lies slack on the floor) */}
      {stage(
        PEN.hand,
        <Group>
          {fig.by === 'rope' && (
            <Group>
              <Line x1={hitch[0]} y1={hitch[1]} x2={mitten[0]} y2={mitten[1]} stroke={p.draw} strokeWidth={1.6} />
              <Circle cx={hitch[0]} cy={hitch[1]} r={2.4} fill={p.draw} />
              <Mitten x={mitten[0]} y={mitten[1]} dx={d[0]} dy={d[1]} />
              <MonoLabel x={mitten[0] + (angle < 15 ? -2 : 6)} y={mitten[1] + (angle < 15 ? -14 : 18)} text="ROSE" color={p.label} size={9} anchor={angle < 15 ? 'middle' : 'start'} />
            </Group>
          )}
          {fig.by === 'pole' && (
            <Group>
              <Line x1={hand[0]} y1={hand[1]} x2={poleEnd[0]} y2={poleEnd[1]} stroke={p.draw} strokeWidth={5} strokeLinecap="round" />
              <Line x1={hand[0]} y1={hand[1]} x2={poleEnd[0]} y2={poleEnd[1]} stroke={p.drawFillDark} strokeWidth={2.4} strokeLinecap="round" />
              <Mitten x={hand[0]} y={hand[1]} dx={-d[0]} dy={-d[1]} />
              <MonoLabel x={hand[0] + 4} y={hand[1] - 16} text="ROSE" color={p.label} size={9} />
            </Group>
          )}
          {fig.by === 'none' && (
            <Path
              d={`M${hitch[0]},${hitch[1]} Q${hitch[0] + 10},${FLOOR - 2} ${hitch[0] + 22},${FLOOR - 1.2} H${hitch[0] + 38}`}
              fill="none"
              stroke={p.draw}
              strokeWidth={1.6}
            />
          )}
          {fig.play && <MotionTag x={cg[0]} y={top - 20} text={fig.by === 'none' ? 'slowing down' : 'steady speed'} />}
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
        stage(
          PEN.fbd,
          <Group>
            <Line x1={DIVIDE} y1={14} x2={DIVIDE} y2={216} stroke={p.paperLine} strokeWidth={1.2} strokeDasharray="4 4" />
            <MonoLabel x={DIVIDE + 6} y={192} text="CRATE" color={p.label} size={9} anchor="start" />
            <MonoLabel x={DIVIDE + 6} y={203} text="ALONE" color={p.label} size={9} anchor="start" />
            <Rect x={DOT.x - 7} y={DOT.y - 7} width={14} height={14} rx={2} fill="none" stroke={p.label} strokeWidth={1} strokeDasharray="3 3" />
            {!fbd && <MonoLabel x={DOT.x + 18} y={DOT.y - 14} text="?" color={p.ink} size={12} />}
            {fig.split && split > 0 && (
              <Path
                d={`M${tip.T[0]},${tip.T[1]} V${fwdTip[1]} M${tip.T[0]},${tip.T[1]} H${DOT.x}`}
                fill="none"
                stroke={p.label}
                strokeWidth={1.1}
                strokeDasharray="3 3"
                opacity={split}
              />
            )}
            {(['W', 'N', 'F', 'T'] as const).map((k) => (
              <ForceArrow key={k} x1={DOT.x} y1={DOT.y} x2={tip[k][0]} y2={tip[k][1]} color={p.force} width={fig.split && k === 'T' ? 3.6 : 3.2} />
            ))}
            {fbd && (fig.ask ?? []).map((a) => <AskStub key={a.force} force={a.force} />)}
            <Circle cx={DOT.x} cy={DOT.y} r={3.6} fill={p.force} />
          </Group>,
        )}

      {fbd &&
        stage(
          PEN.labels,
          <Group>
            {len.W > 4 && <ForceLetter x={DOT.x - 8} y={tip.W[1] - 2} text={letters.W} color={p.force} size={14} anchor="end" />}
            {len.N > 4 && <ForceLetter x={DOT.x - 8} y={tip.N[1] + 11} text={letters.N} color={p.force} size={14} anchor="end" />}
            {len.F > 4 && <ForceLetter x={tip.F[0] - 4} y={DOT.y - 6} text={letters.F} color={p.force} size={14} anchor="end" />}
            {len.T > 4 && <ForceLetter x={tip.T[0] + 5} y={tip.T[1] + (d[1] < 0 ? 2 : 12)} text={letters.T} color={p.force} size={14} anchor="start" />}
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
