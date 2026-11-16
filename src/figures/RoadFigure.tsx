// FIG: cars braking on a straight road, seen from the side. Each car has its own lane and starts with its front at
// the 0 m line when the clock starts: the brakes come on, or (with a reaction time) the driver sees the hazard.
// Forward is positive; the ruler along the bottom is the axis. Every position and velocity comes from
// brakingPosition and brakingVelocity (src/physics/kinematics): steady speed while the driver reacts, then
// s = ut + ½at² and v = u + at until the car stands still.
// The velocity is an outline arrow above the roof (it shrinks as the car slows); the acceleration is a double chevron
// pointing backward, drawn only while the brakes are on. The wheels roll without slipping on the drawn road.
// A played figure runs the braking in real time, holds the last frame and starts again.
// The first road figure of a lesson draws itself: road → ruler → cars; the arrows and labels come last.
import type { ReactNode } from 'react';
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { brakingPosition, brakingTimeAt, brakingVelocity, stoppingTime, thinkingDistance, type Braking } from '@/physics/kinematics';
import { fixed } from '@/physics/format';
import type { RoadFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { useReducedMotionPref } from '@/ui/parts';
import { STILL, useLoopTime, type DrawClock } from './anim';
import { DrawnFade, DrawnPath, DrawnShape, FILLS, ForceLetter, Hatch, MonoLabel, polyPath } from './draw';

export const ROAD_VB = { w: 340, h: 230 };

export const X0 = 78; // x of the 0 m line
export const X_END = 330;
export const RULER_Y = 210;
export const KV = 1.9; // viewBox units per m s⁻¹ of velocity
export const WHEEL_R = 6.5;
export const CAR_MID = 32; // from the front bumper back to the middle of the car
const HOLD = 1.4; // s the played figure waits on its last frame before it starts again

// heights above (−) and below (+) a lane's road surface
export const ARROW_DY = -40;
export const SPEED_DY = -50;
export const DIM_DY = 17;

/** viewBox units per metre of a road that shows `span` metres. */
export const roadScale = (span: number) => (X_END - X0 - 4) / span;
const scaleOf = (fig: RoadFig) => roadScale(fig.span);
/** y of the road surface of each lane when two cars are shown. */
export const LANES = { A: 84, B: 170 } as const;
/** y of the road surface of a car's lane: two lanes, or one in the middle when a car is alone. */
const laneOf = (fig: RoadFig, id: 'A' | 'B') => (fig.cars.length > 1 ? LANES[id] : 134);
const brakingOf = (fig: RoadFig, u: number): Braking => ({ u, a: fig.a, react: fig.react ?? 0 });

/** When a car's part of the clip ends: it stands still, or its front reaches the tree. */
function endTime(fig: RoadFig, u: number): number {
  const b = brakingOf(fig, u);
  const tStop = stoppingTime(b);
  return fig.tree === undefined ? tStop : (brakingTimeAt(fig.tree, b) ?? tStop);
}

/** True when the figure plays the braking (and so gets a pause button). */
export function roadPlays(fig: RoadFig): boolean {
  return fig.play === true;
}

/** The given values in the sheet header. */
export function roadParams(fig: RoadFig): string {
  const a = `a = ${fixed(fig.a, 1)} m s⁻²`;
  if (fig.react) return `reaction ${fixed(fig.react, 2)} s, ${a}`;
  if (fig.cars.length > 1) return fig.showAcc ? `${a} for both cars` : `u = ${fig.cars.map((c) => fixed(c.u, 1)).join(' and ')} m s⁻¹`;
  return `u = ${fixed(fig.cars[0].u, 1)} m s⁻¹${fig.showAcc ? `, ${a}` : ''}`;
}

// when the pen draws each part, as shares of the draw-in
export const PEN = {
  road: [0, 0.3],
  ruler: [0.1, 0.34],
  start: [0.26, 0.4],
  car: [0.36, 0.62],
  marks: [0.8, 0.95],
} as const;

type Props = {
  fig: RoadFig;
  /** Time since the clock started, from the explore slider: the cars are drawn there. */
  live?: number;
  playing: boolean;
  clock?: DrawClock;
};

export function RoadFigure({ fig, live, playing, clock = STILL }: Props) {
  const { palette: p } = useTheme();
  const reduced = useReducedMotionPref();
  const k = scaleOf(fig);
  const X = (s: number) => X0 + s * k;
  const plays = roadPlays(fig);
  const moving = fig.cars.filter((c) => !(fig.parkedA && c.id === 'A'));
  // a played figure runs until every car has come to the end of its clip, holds, and starts again
  const length = Math.max(...moving.map((c) => endTime(fig, c.u)));
  const loop = useLoopTime(plays && playing && !reduced && !clock.on, length, `${fig.cars.map((c) => c.id).join('')}-${fig.react ?? 0}-${fig.tree ?? ''}`, HOLD);
  const clipT = live !== undefined ? live : plays ? (reduced ? length : loop) : 0;
  const still = !plays || live !== undefined;
  const late = (children: ReactNode) => (
    <DrawnFade clock={clock} from={PEN.marks[0]} to={PEN.marks[1]}>
      {children}
    </DrawnFade>
  );
  const react = fig.react ?? 0;
  const think = react > 0 ? thinkingDistance(brakingOf(fig, moving[0].u)) : 0;
  const brakesOn = react > 0 && (plays || live !== undefined) && clipT >= react;
  const top = 20;

  return (
    <Group>
      {/* one road per car */}
      {fig.cars.map((c) => (
        <Hatch key={c.id} x1={6} x2={334} y={laneOf(fig, c.id)} color={p.draw} clock={clock} from={PEN.road[0]} to={PEN.road[1]} />
      ))}

      <Ruler span={fig.span} clock={clock} />

      {/* where the clock starts: the brakes come on, or the driver first sees the hazard */}
      <DrawnPath clock={clock} len={RULER_Y - top} from={PEN.start[0]} to={PEN.start[1]} d={`M${X0},${top} V${RULER_Y}`} stroke={p.lineStrong} strokeWidth={1.2} strokeDasharray="3 4" fill="none" />
      {late(<MonoLabel x={X0 + 4} y={13} text={react > 0 ? 'SEES IT' : 'BRAKES ON'} color={p.label} size={8.5} anchor="start" />)}
      {/* with a reaction time the brakes come on later, further along the road */}
      {brakesOn && (
        <Group>
          <Line x1={X(think)} y1={top} x2={X(think)} y2={RULER_Y} stroke={p.lineStrong} strokeWidth={1.2} strokeDasharray="3 4" />
          <MonoLabel x={X(think) + 4} y={13} text="BRAKES ON" color={p.label} size={8.5} anchor="start" />
        </Group>
      )}

      {fig.tree !== undefined && late(<Tree x={X(fig.tree)} y={laneOf(fig, moving[0].id)} from={X0} text={`${fixed(fig.tree, 1)} m`} />)}

      {fig.ask && late(<Ask fig={fig} x={X(fig.ask.at)} />)}

      {fig.trail && live !== undefined && late(<Trail fig={fig} t={live} X={X} />)}

      {fig.cars.map((c) => {
        const b = brakingOf(fig, c.u);
        const parked = fig.parkedA === true && c.id === 'A';
        const tEnd = endTime(fig, c.u);
        const t = parked ? tEnd : Math.min(clipT, tEnd);
        const s = brakingPosition(t, b);
        const v = brakingVelocity(t, b);
        const y = laneOf(fig, c.id);
        const stopped = v < 1e-6;
        const ended = !still && clipT >= tEnd - 1e-9;
        const braking = t >= react - 1e-9 && !stopped;
        const xc = X(s) - CAR_MID; // the middle of the car
        const len = KV * v;
        const thinkHere = react > 0 ? thinkingDistance(b) : 0;
        return (
          <Group key={c.id}>
            <Car front={X(s)} y={y} id={c.id} roll={(s * k) / WHEEL_R} clock={clock} />
            {len > 2 && late(<VelocityArrow x={xc} y={y + ARROW_DY} len={len} color={p.draw} />)}
            {fig.showAcc && braking && late(<AccMark x={xc - 8} y={y + ARROW_DY} />)}
            {fig.values && !stopped && (still || ended) && late(<Tag x={Math.max(36, xc + len / 2)} y={y + SPEED_DY} text={`${fixed(v, 1)} m s⁻¹`} />)}
            {stopped && live !== undefined && late(<Tag x={xc} y={y + ARROW_DY + 3} text="v = 0" />)}
            {/* how far it went, once it stands still: thinking and braking apart when there is a reaction time */}
            {fig.values && stopped && live === undefined && fig.tree === undefined && (
              <Group>
                {thinkHere > 0 && <Dim x1={X0} x2={X(thinkHere)} y={y + DIM_DY} text={`${fixed(thinkHere, 1)} m`} />}
                <Dim x1={X(thinkHere)} x2={X(s)} y={y + DIM_DY} text={`${fixed(s - thinkHere, 1)} m`} />
              </Group>
            )}
          </Group>
        );
      })}
    </Group>
  );
}

/**
 * The axis along the bottom: metres from where the clock starts, forward is positive.
 * A short road has a tick every 2 m and a number every 10 m; a long one a tick every 10 m and a number every 20 m.
 */
export function Ruler({ span, clock }: { span: number; clock: DrawClock }) {
  const { palette: p } = useTheme();
  const k = roadScale(span);
  const end = X0 + span * k;
  const long = span > 60;
  const tick = long ? 10 : 2;
  const numbered = long ? 20 : 10;
  const ticks: number[] = [];
  for (let s = 0; s <= span + 1e-9; s += tick) ticks.push(s);
  const last = Math.floor(span / numbered) * numbered;
  return (
    <Group>
      <DrawnPath clock={clock} len={end + 4 - X0} from={PEN.ruler[0]} to={PEN.ruler[1]} d={`M${X0},${RULER_Y} H${end + 4}`} stroke={p.draw} strokeWidth={1.6} fill="none" />
      <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
        <Path d={`M${end + 2},${RULER_Y - 4.5} L${end + 10},${RULER_Y} L${end + 2},${RULER_Y + 4.5} Z`} fill={p.draw} />
        {ticks.map((s) => (
          <Line key={s} x1={X0 + s * k} y1={RULER_Y} x2={X0 + s * k} y2={RULER_Y - (s % numbered === 0 ? 6 : 3.5)} stroke={p.draw} strokeWidth={1.2} />
        ))}
        {ticks
          .filter((s) => s % numbered === 0)
          .map((s) => (
            <MonoLabel key={s} x={X0 + s * k} y={RULER_Y + 13} text={s === last ? `${s} m` : String(s)} color={p.label} size={9} />
          ))}
        <ForceLetter x={end + 5} y={RULER_Y - 9} text="+" color={p.label} size={14} />
      </DrawnFade>
    </Group>
  );
}

// the outline of the car, front bumper at x = 0, road at y = 0, pointing right
const BODY = polyPath([
  [-64, -5],
  [-64, -13],
  [-58, -15.5],
  [-47, -25],
  [-27, -25],
  [-15, -15.5],
  [-3, -13.5],
  [0, -10],
  [0, -5],
]);
const WINDOW = 'M-45.5,-22.5 L-28,-22.5 L-19.5,-15.5 L-53,-15.5 Z';
const WHEELS = [-49, -15];

/** One car with its front bumper at `front`, standing on the road at `y`. `roll`: how far its wheels have turned, rad. */
export function Car({ front, y, id, roll, clock }: { front: number; y: number; id: string; roll: number; clock: DrawClock }) {
  const { palette: p } = useTheme();
  const rim = WHEEL_R - 2.6;
  const dx = rim * Math.sin(roll);
  const dy = rim * Math.cos(roll);
  return (
    <Group transform={`translate(${front}, ${y})`}>
      <DrawnShape clock={clock} pen={PEN.car} d={BODY.d} len={BODY.len} fill={p.drawFill} stroke={p.draw} strokeWidth={1.7} strokeLinejoin="round" />
      <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
        <Path d={WINDOW} fill={p.drawFillDark} />
        {/* the pillar between the windows, and the door below it */}
        <Path d="M-36.5,-22.5 V-15.5" stroke={p.drawFill} strokeWidth={2} fill="none" />
        <Path d="M-36.5,-15.5 V-7" stroke={p.draw} strokeWidth={0.9} opacity={0.45} fill="none" />
        {WHEELS.map((x) => (
          <Group key={x}>
            <Circle cx={x} cy={-WHEEL_R} r={WHEEL_R} fill={p.draw} />
            <Circle cx={x} cy={-WHEEL_R} r={rim} fill={p.drawFill} />
            {/* one spoke across the rim, so the wheel is seen to roll */}
            <Line x1={x - dx} y1={-WHEEL_R + dy} x2={x + dx} y2={-WHEEL_R - dy} stroke={p.draw} strokeWidth={1.3} />
          </Group>
        ))}
        <ForceLetter x={-32} y={-7} text={id} color={p.ink} size={10} />
      </DrawnFade>
    </Group>
  );
}

/** A hollow arrow pointing forward, its tail at x, its length ∝ v. */
export function VelocityArrow({ x, y, len, color }: { x: number; y: number; len: number; color: string }) {
  const tip = x + len;
  const head = Math.min(9, len * 0.55);
  const neck = tip - head;
  const d = `M${x},${y - 2.6} L${neck},${y - 2.6} L${neck},${y - 6.5} L${tip},${y} L${neck},${y + 6.5} L${neck},${y + 2.6} L${x},${y + 2.6} Z`;
  return <Path d={d} fill="none" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />;
}

/** The acceleration: two chevrons, pointing backward while braking (their tips left of x) or forward when `forward`. */
export function AccMark({ x, y, forward }: { x: number; y: number; forward?: boolean }) {
  const { palette: p } = useTheme();
  const d = forward ? 7 : -7;
  const one = (cx: number) => `M${cx - d},${y - 6} L${cx},${y} L${cx - d},${y + 6}`;
  return (
    <Group>
      <Path d={one(forward ? x : x - 7)} fill="none" stroke={p.draw} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      <Path d={one(forward ? x - 8 : x - 15)} fill="none" stroke={p.draw} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      <MonoLabel x={x - 21} y={y + 3.2} text="a" color={p.label} size={9.5} />
    </Group>
  );
}

/** A dimension line from x1 to x2 with its value on the line (below it when the line is too short to hold it). */
export function Dim({ x1, x2, y, text }: { x1: number; x2: number; y: number; text: string }) {
  const { palette: p } = useTheme();
  const mid = (x1 + x2) / 2;
  const w = text.length * 5.4 + 6;
  const narrow = x2 - x1 < w + 10;
  return (
    <Group>
      <Path d={`M${x1},${y - 4} V${y + 4} M${x2},${y - 4} V${y + 4} M${x1},${y} H${x2}`} stroke={p.label} strokeWidth={1.1} fill="none" />
      {!narrow && <Rect x={mid - w / 2} y={y - 6} width={w} height={12} fill={p.paper} />}
      <MonoLabel x={mid} y={narrow ? y + 14 : y + 3.2} text={text} color={p.ink} size={9} />
    </Group>
  );
}

/** A mono label on a patch of drawing paper, so a line behind it never runs through the text. */
export function Tag({ x, y, text }: { x: number; y: number; text: string }) {
  const { palette: p } = useTheme();
  const w = text.length * 5.4 + 8;
  return (
    <Group>
      <Rect x={x - w / 2} y={y - 9} width={w} height={13} rx={2} fill={p.paper} />
      <MonoLabel x={x} y={y} text={text} color={p.ink} size={9} />
    </Group>
  );
}

/**
 * The marker where the question asks for car B's speed: a dashed line down from car A's lane (the spot where car A
 * stopped) to car B's road, with "v = ?" on it, or the speed once the question is answered.
 */
function Ask({ fig, x }: { fig: RoadFig; x: number }) {
  const { palette: p } = useTheme();
  if (!fig.ask) return null;
  const yB = laneOf(fig, 'B');
  const yTop = fig.cars.length > 1 ? laneOf(fig, 'A') : yB - 60;
  const b = brakingOf(fig, fig.cars.find((c) => c.id === 'B')!.u);
  const tAt = brakingTimeAt(fig.ask.at, b);
  const text = fig.ask.shown && tAt !== null ? `${fixed(brakingVelocity(tAt, b), 1)} m s⁻¹` : 'v = ?';
  return (
    <Group>
      <Line x1={x} y1={yTop} x2={x} y2={yB} stroke={p.label} strokeWidth={1.2} strokeDasharray="3 4" />
      <Circle cx={x} cy={yB} r={3} fill={p.ink} />
      <Tag x={x} y={yB - 52} text={text} />
    </Group>
  );
}

/**
 * Where the car's front was at each whole second so far, like a strobe photo, and how far it went in each second:
 * the gaps shrink as the car slows.
 */
function Trail({ fig, t, X }: { fig: RoadFig; t: number; X: (s: number) => number }) {
  const { palette: p } = useTheme();
  const car = fig.cars[fig.cars.length - 1];
  const b = brakingOf(fig, car.u);
  const y = laneOf(fig, car.id);
  const marks: number[] = [];
  for (let k = 0; k <= t + 1e-9; k++) marks.push(k);
  return (
    <Group>
      {marks.map((k) => {
        const s = brakingPosition(k, b);
        const before = k > 0 ? brakingPosition(k - 1, b) : 0;
        return (
          <Group key={k}>
            <Line x1={X(s)} y1={y} x2={X(s)} y2={y + 36} stroke={p.label} strokeWidth={1.1} />
            {k > 0 && <Dim x1={X(before)} x2={X(s)} y={y + 31} text={`${fixed(s - before, 1)} m`} />}
          </Group>
        );
      })}
      {marks.map((k) => (
        <Tag key={k} x={X(brakingPosition(k, b))} y={y + 19} text={`${k} s`} />
      ))}
    </Group>
  );
}

/** A fallen tree across the road, seen end-on: the trunk's rings and a broken branch. The distance to it is given. */
function Tree({ x, y, from, text }: { x: number; y: number; from: number; text: string }) {
  const { palette: p } = useTheme();
  const r = 12;
  const cx = x + r;
  const cy = y - r;
  return (
    <Group>
      {/* a branch still on the trunk, with its leaves */}
      <Path d={`M${cx + 7},${cy - 8} L${cx + 17},${cy - 21}`} stroke={p.draw} strokeWidth={2.2} strokeLinecap="round" fill="none" />
      <Circle cx={cx + 19} cy={cy - 25} r={5} fill={p.drawFillDark} />
      <Circle cx={cx + 25} cy={cy - 19} r={3.8} fill={p.drawFillDark} />
      <Circle cx={cx} cy={cy} r={r} fill={p.drawFill} stroke={p.draw} strokeWidth={1.8} />
      <Circle cx={cx} cy={cy} r={7.5} fill="none" stroke={p.draw} strokeWidth={1} opacity={0.55} />
      <Circle cx={cx} cy={cy} r={3.2} fill="none" stroke={p.draw} strokeWidth={1} opacity={0.55} />
      <MonoLabel x={cx - 5} y={y - 2 * r - 7} text="TREE" color={p.label} size={8.5} />
      <Dim x1={from} x2={x} y={y + DIM_DY} text={text} />
    </Group>
  );
}
