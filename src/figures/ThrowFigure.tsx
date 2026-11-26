// FIG: throws from a balcony. Your hand is h above the ground; ball A goes straight up at +u, ball B straight down
// at −u. Up is positive (the ruler on the left is the axis). Every position and velocity comes from
// s = ut + ½at² and v = u + at with a = −g (src/physics/kinematics), measured from your hand.
// The velocity is an outline arrow beside the ball (it shrinks, passes zero at the top and flips);
// the acceleration is a double chevron that never changes. A played figure runs the flights in real time.
// The first throw figure of a lesson draws itself: ground → ruler → building → balcony → balls; the arrows come last.
import { Circle, G as Group, Rect } from 'react-native-svg';
import { G, position, velocity, type Motion } from '@/physics/kinematics';
import { fixed, signed } from '@/physics/format';
import { ACC_IDS, type ThrowFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { useReducedMotionPref } from '@/ui/parts';
import { STILL, useLoopTime, type DrawClock } from './anim';
import { AccChevrons, DrawnFade, DrawnPath, DrawnShape, FILLS, ForceLetter, Hatch, MonoLabel, rectPath } from './draw';
import type { TapProps, TapTarget } from './Sheet';
import { Ball, HollowArrow, Ruler, stage, Tag, type RulerTick } from './kit';

export const THROW_VB = { w: 340, h: 264 };

const GROUND = 240; // y of the ground
const K = 12.8; // viewBox units per metre of height
const R = 11; // ball radius
const KV = 3.1; // viewBox units per m s⁻¹ of velocity
const RULER_X = 12;
const BUILDING = { x: 40, w: 52, top: 56 };
const SLAB = { x2: 116, h: 5 };
const RAIL_H = 14; // the rail top is at the height of your hand
const HOLD = 1.4; // s the played figure waits with both balls on the ground before it starts again
const TRAIL_DT = 0.1; // s between the faint copies of ball A

/** y of a point `height` metres above the ground. */
const yOf = (height: number) => GROUND - height * K;

/** Where the balls fly: two columns side by side, or one in the middle when ball A is alone. */
function columnsOf(fig: ThrowFig): Record<'A' | 'B', number> {
  return fig.balls.includes('B') ? { A: 146, B: 262 } : { A: 196, B: 262 };
}

// when the pen draws each part, as shares of the draw-in
const PEN = {
  ground: [0, 0.22],
  ruler: [0.06, 0.26],
  building: [0.16, 0.44],
  slab: [0.4, 0.52],
  rail: [0.46, 0.58],
  hand: [0.54, 0.64],
  marks: [0.8, 0.95],
} as const;

const motionOf = (fig: ThrowFig, ball: 'A' | 'B'): Motion => ({ s0: 0, u: ball === 'A' ? fig.u : -fig.u, a: -G });

/** Seconds from the throw until the ball reaches the ground (s = −h). */
function landingTime(fig: ThrowFig, ball: 'A' | 'B'): number {
  const u = ball === 'A' ? fig.u : -fig.u;
  return (u + Math.sqrt(u * u + 2 * G * fig.h)) / G;
}

/** How far into its flight each ball is when the figure starts: ball A may stand at the top or back at the hand. */
function startOf(fig: ThrowFig, ball: 'A' | 'B'): number {
  if (ball === 'B') return 0;
  const tTop = fig.u / G;
  return fig.at === 'top' ? tTop : fig.at === 'back' ? 2 * tTop : 0;
}

/** True when the figure plays the flights (and so gets a pause button). */
export function throwPlays(fig: ThrowFig): boolean {
  return fig.play === true;
}

/** The given values in the sheet header. */
export function throwParams(fig: ThrowFig): string {
  const a = fig.showAcc ? `, a = ${fixed(-G, 2)} m s⁻²` : '';
  return fig.balls.includes('B') ? `h = ${fixed(fig.h, 1)} m, u = ${fixed(fig.u, 1)} m s⁻¹` : `u = ${signed(fig.u, 1)} m s⁻¹${a}`;
}

// the acceleration candidates beside ball A at the top
const CAND_W = 32;
const CAND_H = 56;
const candX = (i: number) => 240 + i * 36;

/** Tap targets in viewBox units (the three candidates for the acceleration at the top). */
export function throwTargets(fig: ThrowFig): TapTarget[] {
  if (!fig.candidates) return [];
  const y = yOf(fig.h + (fig.u * fig.u) / (2 * G));
  const names = { up: 'acceleration upward', zero: 'no acceleration', down: 'acceleration downward' };
  return ACC_IDS.map((id, i) => ({ id, x: candX(i) - CAND_W / 2, y: y - CAND_H / 2, w: CAND_W, h: CAND_H, label: names[id] }));
}

type Props = {
  fig: ThrowFig;
  /** Time since the throw, from the explore slider: ball A is drawn there instead of at `at`. */
  live?: number;
  playing: boolean;
  tap?: TapProps;
  clock?: DrawClock;
};

export function ThrowFigure({ fig, live, playing, tap, clock = STILL }: Props) {
  const { palette: p, material: m } = useTheme();
  const reduced = useReducedMotionPref();
  const col = columnsOf(fig);
  const plays = throwPlays(fig);
  // a played figure runs until every ball is on the ground, holds, and starts again
  const length = Math.max(...fig.balls.map((b) => landingTime(fig, b) - startOf(fig, b)));
  const loop = useLoopTime(plays && playing && !reduced && !clock.on, length, `${fig.at}-${fig.balls.join('')}`, HOLD);
  const clipT = plays ? (reduced ? length : loop) : 0;
  const line = (d: string, len: number, pen: readonly [number, number], color: string, width: number, extra?: object) => (
    <DrawnPath clock={clock} len={len} from={pen[0]} to={pen[1]} d={d} stroke={color} strokeWidth={width} fill="none" {...extra} />
  );
  const handY = yOf(fig.h);
  const slabY = handY + RAIL_H;

  return (
    <Group>
      {/* ground */}
      <Hatch x1={6} x2={334} y={GROUND} color={p.draw} clock={clock} from={PEN.ground[0]} to={PEN.ground[1]} />

      {/* the ruler is the axis: metres above the ground, up is positive */}
      <ThrowRuler fig={fig} clock={clock} />

      {/* the building */}
      <DrawnShape clock={clock} pen={PEN.building} {...rectPath(BUILDING.x, BUILDING.top, BUILDING.w, GROUND - BUILDING.top)} fill={p.paper} stroke={p.draw} strokeWidth={stroke.body} />
      {/* the balcony: a slab and a rail at the height of your hand */}
      <DrawnShape clock={clock} pen={PEN.slab} {...rectPath(BUILDING.x + BUILDING.w, slabY, SLAB.x2 - BUILDING.x - BUILDING.w, SLAB.h)} fill={p.drawFillDark} stroke={p.draw} strokeWidth={stroke.body} />
      {line(`M${BUILDING.x + BUILDING.w},${handY} H${SLAB.x2}`, SLAB.x2 - BUILDING.x - BUILDING.w, PEN.rail, p.draw, stroke.body)}
      {[100, 108, SLAB.x2 - 1].map((x) => (
        <Group key={x}>{line(`M${x},${handY} V${slabY}`, RAIL_H, PEN.rail, p.draw, stroke.thin)}</Group>
      ))}
      {/* the height of your hand, across to where the balls fly */}
      {line(`M${SLAB.x2 + 4},${handY} H332`, 332 - SLAB.x2 - 4, PEN.hand, p.lineStrong, stroke.thin, { strokeDasharray: '3 4' })}

      {/* faint copies of ball A along its path so far */}
      {fig.trail && stage(clock, PEN.marks, <Trail fig={fig} x={col.A} t={live ?? startOf(fig, 'A') + clipT} />)}

      {fig.candidates && stage(clock, PEN.marks, <Candidates fig={fig} tap={tap} />)}

      {fig.balls.map((b) => {
        const t = b === 'A' && live !== undefined ? live : startOf(fig, b) + clipT;
        return <FlyingBall key={b} fig={fig} ball={b} x={col[b]} t={t} still={!plays || live !== undefined} clock={clock} />;
      })}
    </Group>
  );
}

/** The axis on the left: a tick every 2 m, a number every 4 m, the arrow and "+" at the top. Bolder on the signs screen. */
function ThrowRuler({ fig, clock }: { fig: ThrowFig; clock: DrawClock }) {
  const { palette: p, material: m } = useTheme();
  const top = yOf(17.3);
  const ticks: RulerTick[] = [];
  for (let h = 0; h <= 16; h += 2) ticks.push({ at: yOf(h), len: h % 4 === 0 ? 6 : 4, label: h % 4 === 0 ? (h === 16 ? '16 m' : String(h)) : undefined, dy: h === 0 ? -7.5 : 0 });
  return (
    <Ruler axis="y" at={RULER_X} from={GROUND} to={top} arrow="end" ticks={ticks} side={1} labelAt={9} labelDy={3.5} labelAnchor="start" color={fig.signs ? p.ink : p.draw} width={fig.signs ? 2.4 : 1.6} clock={clock} pen={PEN.ruler}>
      <ForceLetter x={RULER_X + 9} y={top - (fig.signs ? 0 : 3)} text="+" color={fig.signs ? p.ink : p.label} size={fig.signs ? 19 : 15} anchor="start" />
      {fig.signs && <MonoLabel x={RULER_X + 26} y={top} text="up" color={p.ink} size={9} anchor="start" />}
    </Ruler>
  );
}

/** One ball at time t of its flight: the velocity arrow beside it, its letter, and its value or "v = ?". */
function FlyingBall({ fig, ball, x, t, still, clock }: { fig: ThrowFig; ball: 'A' | 'B'; x: number; t: number; still: boolean; clock: DrawClock }) {
  const { palette: p } = useTheme();
  const m = motionOf(fig, ball);
  const tLand = landingTime(fig, ball);
  const landed = t >= tLand - 1e-9;
  const tt = Math.min(t, tLand);
  const s = position(tt, m);
  const v = velocity(tt, m);
  const y = Math.min(yOf(fig.h + s), GROUND - R);
  const unknown = ball === 'A' && fig.unknownV;
  const arrowX = x + 20;
  const len = KV * Math.abs(v);
  // the value is written while the ball stands still (or is moved by the slider), and once it has landed
  const showValue = fig.values && !unknown && (still || landed);
  return (
    <Group>
      {!landed && !unknown && len > 1.5 && stage(clock, PEN.marks, <VelocityArrow x={arrowX} y={y} v={v} len={len} color={p.draw} />)}
      {ball === 'A' && fig.showAcc && stage(clock, PEN.marks, <AccMark x={x - 46} y={y} />)}
      <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
        <Ball x={x} y={y} r={R} tone={ball} />
        <ForceLetter x={x - 16} y={y + 5} text={ball} color={p.ink} size={14} anchor="end" />
      </DrawnFade>
      {showValue && stage(clock, PEN.marks, <ValueLabel x={x} y={y} arrowX={arrowX} v={v} len={len} landed={landed} beside={!fig.balls.includes('B')} />)}
      {unknown && stage(clock, PEN.marks, <Tag x={arrowX - 4} y={y + 3.5} text="v = ?" color={p.ink} size={10} anchor="start" />)}
    </Group>
  );
}

/**
 * The velocity in words: beside the arrow when ball A is alone; with two balls side by side, past the arrow's tip
 * (above it going up, below it going down) so they never collide; above the ball once it has landed.
 */
function ValueLabel({ x, y, arrowX, v, len, landed, beside }: { x: number; y: number; arrowX: number; v: number; len: number; landed: boolean; beside: boolean }) {
  const { palette: p, material: m } = useTheme();
  const text = `${signed(v, 1)} m s⁻¹`;
  if (landed) return <MonoLabel x={x} y={y - R - 8} text={text} color={p.ink} size={9} />;
  if (len <= 1.5 || Math.abs(v) < 0.05) return <Tag x={arrowX - 6} y={y + 3.5} text="v = 0" color={p.ink} anchor="start" />;
  if (beside) return <Tag x={arrowX + 12} y={y + 3.5} text={`v = ${text}`} color={p.ink} anchor="start" />;
  const tip = tipOf(y, v);
  return <MonoLabel x={arrowX} y={v > 0 ? tip - 6 : tip + 13} text={text} color={p.ink} size={9} />;
}


/** Where the velocity arrow's tip is: level with the leading edge of the ball, so it never runs into the ground. */
const tipOf = (y: number, v: number) => (v > 0 ? y - R : y + R);

/** A hollow arrow beside the ball, up for v > 0, down for v < 0, its length ∝ |v|, its tip level with the ball's front. */
function VelocityArrow({ x, y, v, len, color }: { x: number; y: number; v: number; len: number; color: string }) {
  const tip = tipOf(y, v);
  return <HollowArrow from={[x, tip + (v > 0 ? len : -len)]} to={[x, tip]} color={color} weight="track" />;
}

/** The acceleration of ball A: two chevrons pointing down and a small "a". It is the same everywhere in the flight. */
function AccMark({ x, y }: { x: number; y: number }) {
  const { palette: p, material: m } = useTheme();
  return (
    <Group>
      <AccChevrons x={x} y={y} dir="down" color={p.draw} />
      <MonoLabel x={x} y={y + 24} text="a" color={p.label} size={10} />
    </Group>
  );
}

/**
 * A dot where ball A was every 0.1 s from the throw up to time t, like a strobe photo: close together near the top.
 * The way up is drawn a little left of the ball's line and the way down a little right (as textbooks do), so the two never merge.
 */
function Trail({ fig, x, t }: { fig: ThrowFig; x: number; t: number }) {
  const { palette: p, soft } = useTheme();
  const m = motionOf(fig, 'A');
  const tLand = landingTime(fig, 'A');
  const tTop = fig.u / G;
  const dots: { x: number; y: number }[] = [];
  for (let k = 0; k * TRAIL_DT < Math.min(t, tLand) - 0.06; k++) {
    const tk = k * TRAIL_DT;
    const side = Math.max(-1, Math.min(1, (tk - tTop) / 0.15)); // −1 going up, +1 coming down, eased across the top
    dots.push({ x: x + side * 4.5, y: yOf(fig.h + position(tk, m)) });
  }
  return (
    <Group>
      {dots.map((d, i) => (
        <Circle key={i} cx={d.x} cy={d.y} r={3} fill={soft.A.edge} opacity={0.55} />
      ))}
    </Group>
  );
}


/** Three answers to "which way is a at the top?": up chevrons, a = 0, down chevrons. Chosen = blue; after Check, the verdict colours. */
function Candidates({ fig, tap }: { fig: ThrowFig; tap?: TapProps }) {
  const { palette: p, material: m } = useTheme();
  const y = yOf(fig.h + (fig.u * fig.u) / (2 * G));
  return (
    <Group>
      {ACC_IDS.map((id, i) => {
        const cx = candX(i);
        const mark = tap?.marks?.[id];
        const on = tap?.selected === id;
        const color = mark === 'right' ? p.ok : mark === 'wrong' ? p.bad : on ? p.select : p.faint;
        const bg = mark === 'right' ? p.okBg : mark === 'wrong' ? p.badBg : on ? p.selectBg : 'none';
        return (
          <Group key={id}>
            <Rect
              x={cx - CAND_W / 2}
              y={y - CAND_H / 2}
              width={CAND_W}
              height={CAND_H}
              rx={8}
              fill={bg}
              stroke={on || mark ? color : p.lineStrong}
              strokeWidth={on || mark ? 2 : 1.2}
              strokeDasharray={on || mark ? undefined : '4 3'}
            />
            {id === 'zero' ? (
              <MonoLabel x={cx} y={y + 4} text="a = 0" color={color} size={8.5} />
            ) : (
              <AccChevrons x={cx} y={y} dir={id} color={color} />
            )}
          </Group>
        );
      })}
    </Group>
  );
}
