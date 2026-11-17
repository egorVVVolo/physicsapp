// FIG: a lab bench seen from the side. Ball A is dropped from its left end; ball B (and C) rolls off its right end.
// Every position comes from projectilePosition (src/physics/projectile): sideways x = ut, downward ½gt², on one clock.
// Played, the falls run at a quarter of real speed (half a second is too quick to see), leaving a strobe copy of each
// ball every 0.1 s; dashed lines join the copies taken at the same moment, so you see the balls stay level.
// On the explore screen the slider is the clock, and an inset draws B's velocity as its two parts.
// The first bench figure of a lesson draws itself: floor → bench → balls; the marks come last.
import type { ReactNode } from 'react';
import { Circle, G as Group, Line, Path } from 'react-native-svg';
import { flightTime, projectilePosition, projectileRange, projectileVelocity, type Launch } from '@/physics/projectile';
import { fixed } from '@/physics/format';
import type { BenchFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { useReducedMotionPref } from '@/ui/parts';
import { STILL, useLoopTime, type DrawClock } from './anim';
import { DrawnFade, DrawnShape, FILLS, ForceLetter, Hatch, MonoLabel, rectPath } from './draw';
import { HollowArrow } from './ResolveFigure';
import { Tag } from './RoadFigure';

export const BENCH_VB = { w: 340, h: 252 };

const GROUND = 214;
const K = 100; // viewBox units per metre
const R = 7; // ball radius
const BENCH = { x1: 40, x2: 118, slab: 8, leg: 5 }; // x1, x2: where the balls' centres leave the bench
const SLOW = 4; // the played falls run this many times slower than real time
const HOLD = 1.3; // s the played figure waits with every ball on the floor before it starts again
const STROBE = 0.1; // s between the strobe copies
const KV = 11; // viewBox units per m s⁻¹ in the velocity inset
const INSET: [number, number] = [214, 24]; // where the velocity inset's dot is

const PEN = {
  floor: [0, 0.24],
  bench: [0.14, 0.5],
  marks: [0.8, 0.95],
} as const;

const launchOf = (fig: BenchFig, u: number): Launch => ({ u, angle: 0, h: fig.h });
/** The fastest rolling ball: the one the dimension line and the velocity inset are about. */
const fastest = (fig: BenchFig) => fig.balls.reduce((a, b) => (b.u > a.u ? b : a));
const topY = (fig: BenchFig) => GROUND - fig.h * K;

/** Where a ball is drawn at model time t (its centre), from the end of the bench it leaves. */
function ballAt(fig: BenchFig, u: number, t: number): { x: number; y: number } {
  const tt = Math.min(t, flightTime(launchOf(fig, u)));
  const pos = projectilePosition(tt, launchOf(fig, u));
  const x0 = u === 0 ? BENCH.x1 : BENCH.x2;
  return { x: x0 + pos.x * K, y: GROUND - R - pos.y * K };
}

/** True when the figure plays the falls (and so gets a pause button). */
export function benchPlays(fig: BenchFig): boolean {
  return fig.play === true;
}

/** The given values in the sheet header; on the explore screen (`t` from the slider) where B is. */
export function benchParams(fig: BenchFig, t?: number): string {
  const rolling = fig.balls.filter((b) => b.u > 0);
  if (t !== undefined) {
    const b = fastest(fig);
    const tt = Math.min(t, flightTime(launchOf(fig, b.u)));
    const pos = projectilePosition(tt, launchOf(fig, b.u));
    return `${b.id}: across ${fixed(pos.x, 2)} m · down ${fixed(fig.h - pos.y, 2)} m`;
  }
  const speeds = rolling.length === 1 ? `u = ${fixed(rolling[0].u, 1)} m s⁻¹` : rolling.map((b) => `${b.id} ${fixed(b.u, 1)}`).join(', ') + ' m s⁻¹';
  return `h = ${fixed(fig.h, 2)} m, ${speeds}`;
}

type Props = { fig: BenchFig; live?: number; playing: boolean; clock?: DrawClock };

export function BenchFigure({ fig, live, playing, clock = STILL }: Props) {
  const { palette: p } = useTheme();
  const reduced = useReducedMotionPref();
  const plays = benchPlays(fig);
  const length = Math.max(...fig.balls.map((b) => flightTime(launchOf(fig, b.u))));
  const loop = useLoopTime(plays && playing && !reduced && !clock.on, length * SLOW, fig.balls.map((b) => b.id).join(''), HOLD);
  const still = fig.at === 'end' ? length : 0;
  const t = live ?? (plays ? (reduced ? length : loop / SLOW) : still);
  const showStrobe = live !== undefined || plays;
  const top = topY(fig);
  const late = (children: ReactNode) => (
    <DrawnFade clock={clock} from={PEN.marks[0]} to={PEN.marks[1]}>
      {children}
    </DrawnFade>
  );

  // the strobe copies: every 0.1 s from the start up to now (the ball itself covers the newest one)
  const moments: number[] = [];
  if (showStrobe) for (let k = 0; k * STROBE <= Math.min(t, length) - 0.03; k++) moments.push(k * STROBE);
  const slowest = fig.balls.reduce((a, b) => (b.u < a.u ? b : a));
  const far = fastest(fig);

  return (
    <Group>
      <Hatch x1={6} x2={334} y={GROUND} color={p.draw} clock={clock} from={PEN.floor[0]} to={PEN.floor[1]} />

      {/* the bench: a slab on two legs; its top is h above the floor */}
      {/* the balls start just past its ends (x1 and x2 are their centres), so a falling ball never runs into a leg */}
      <DrawnShape clock={clock} pen={PEN.bench} {...rectPath(BENCH.x1 + R, top, BENCH.x2 - BENCH.x1 - 2 * R, BENCH.slab, 1.5)} fill={p.drawFillDark} stroke={p.draw} strokeWidth={1.6} />
      {[BENCH.x1 + R + 6, BENCH.x2 - R - 6 - BENCH.leg].map((x) => (
        <DrawnShape key={x} clock={clock} pen={PEN.bench} {...rectPath(x, top + BENCH.slab, BENCH.leg, GROUND - top - BENCH.slab)} fill={p.drawFill} stroke={p.draw} strokeWidth={1.4} />
      ))}

      {/* while it plays: how much slower than real time, and the clock */}
      {plays && live === undefined && late(<MonoLabel x={10} y={18} text={`t = ${fixed(t, 2)} s · ¼ SPEED`} color={p.label} size={9} anchor="start" />)}

      {/* dashed lines joining the slowest and fastest balls' copies taken at the same moment: they are always level */}
      {fig.levels &&
        slowest !== far &&
        moments.map((m) => {
          const a = ballAt(fig, slowest.u, m);
          const b = ballAt(fig, far.u, m);
          return <Line key={`l${m}`} x1={a.x + R} y1={a.y} x2={b.x - R} y2={b.y} stroke={p.lineStrong} strokeWidth={1} strokeDasharray="3 3" />;
        })}

      {/* the strobe copies */}
      {fig.balls.flatMap((b) =>
        moments.map((m) => {
          const at = ballAt(fig, b.u, m);
          return <Circle key={`${b.id}${m}`} cx={at.x} cy={at.y} r={R} fill="none" stroke={p.label} strokeWidth={1.1} opacity={0.6} />;
        }),
      )}

      {/* the landing distance of the fastest ball, measured along the floor from the end of the bench */}
      {fig.range === 'shown' && late(<RangeLine fig={fig} u={far.u} />)}

      {/* the balls */}
      {fig.balls.map((b) => {
        const at = ballAt(fig, b.u, t);
        return (
          <DrawnFade key={b.id} clock={clock} from={FILLS[0]} to={FILLS[1]}>
            <Circle cx={at.x} cy={at.y} r={R} fill={p.drawFillDark} />
            <Circle cx={at.x - 1.5} cy={at.y - 1.5} r={R * 0.55} fill={p.drawFill} />
            <Circle cx={at.x} cy={at.y} r={R} fill="none" stroke={p.draw} strokeWidth={1.5} />
            {b.u === 0 ? (
              <ForceLetter x={at.x - R - 4} y={at.y + 5} text={b.id} color={p.ink} size={14} anchor="end" />
            ) : (
              <ForceLetter x={at.x} y={at.y - R - 5} text={b.id} color={p.ink} size={14} />
            )}
          </DrawnFade>
        );
      })}

      {fig.arrows && late(<VelocityInset fig={fig} u={far.u} id={far.id} t={t} />)}
    </Group>
  );
}

/** A dimension line under the floor, from below the end of the bench to where the ball lands, with its length. */
function RangeLine({ fig, u }: { fig: BenchFig; u: number }) {
  const { palette: p } = useTheme();
  const x2 = BENCH.x2 + projectileRange(launchOf(fig, u)) * K;
  const y = GROUND + 18;
  return (
    <Group>
      <Path d={`M${BENCH.x2},${topY(fig)} V${GROUND}`} stroke={p.lineStrong} strokeWidth={1} strokeDasharray="3 3" />
      <Path d={`M${BENCH.x2},${y - 5} V${y + 5} M${x2},${y - 5} V${y + 5} M${BENCH.x2},${y} H${x2}`} stroke={p.label} strokeWidth={1.2} />
      <Tag x={(BENCH.x2 + x2) / 2} y={y + 3.5} text={`${fixed(projectileRange(launchOf(fig, u)), 2)} m`} />
    </Group>
  );
}

/** B's velocity at time t, drawn apart from the ball as its two parts from one dot: sideways stays, downward grows. */
function VelocityInset({ fig, u, id, t }: { fig: BenchFig; u: number; id: string; t: number }) {
  const { palette: p } = useTheme();
  const tt = Math.min(t, flightTime(launchOf(fig, u)));
  const v = projectileVelocity(tt, launchOf(fig, u));
  const [x, y] = INSET;
  const down = -v.vy;
  return (
    <Group>
      <MonoLabel x={x - 8} y={y + 4} text={`${id}'S VELOCITY`} color={p.label} size={8.5} anchor="end" />
      <HollowArrow from={[x, y]} to={[x + v.vx * KV, y]} color={p.draw} thin />
      {down * KV > 2 && <HollowArrow from={[x, y]} to={[x, y + down * KV]} color={p.draw} thin />}
      <Circle cx={x} cy={y} r={2.6} fill={p.draw} />
      <MonoLabel x={x + v.vx * KV + 6} y={y + 3.5} text={`${fixed(v.vx, 1)} m s⁻¹`} color={p.ink} size={9} anchor="start" />
      <MonoLabel x={x + 9} y={y + Math.max(14, down * KV - 2)} text={`${fixed(down, 1)} m s⁻¹`} color={p.ink} size={9} anchor="start" />
    </Group>
  );
}
