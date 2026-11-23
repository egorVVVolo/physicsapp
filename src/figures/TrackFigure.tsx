// FIG: a straight east–west track seen from the side, with a lamp post at 0 m. Each runner has its own lane and a run
// made of parts of steady velocity (a Trip, east positive); every position and velocity comes from tripPosition and
// tripVelocity (src/physics/kinematics). The ruler along the bottom is the axis: its + end is the direction the
// lesson calls positive, so choosing west flips the numbers, never the motion.
// Runner A's legs can be drawn as arrows above its lane, each runner's displacement as a solid arrow below it.
// On the explore screen the sheet header reads out runner A's distance and displacement (trackParams).
// The velocity is an outline arrow over the runner's head; it flips when the runner turns.
// A played figure runs the race sped up (the sheet says how much), holds the last frame and starts again.
// The first track figure of a lesson draws itself: track → ruler → lamp post → runners; arrows and labels come last.
import { G as Group, Line, Path, Rect } from 'react-native-svg';
import { tripDistance, tripDuration, tripPosition, tripVelocity, type Trip } from '@/physics/kinematics';
import { fixed, signed } from '@/physics/format';
import type { TrackFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { useReducedMotionPref } from '@/ui/parts';
import { STILL, useLoopTime, type DrawClock } from './anim';
import { DrawnFade, DrawnPath, FILLS, ForceArrow, ForceLetter, Hatch, MonoLabel } from './draw';
import { Person } from './people';
import { HollowArrow, Ruler, stage, Tag, type RulerTick } from './kit';

export const TRACK_VB = { w: 340, h: 230 };

/** The race is played this many times faster than real time. */
export const TRACK_SPEEDUP = 20;
const HOLD = 1.6; // s the played figure waits on its last frame
const XL = 22; // the ruler runs from XL to XR
const XR = 318;
const RULER_Y = 216;
const SCALE = 0.42; // of the shared person: 57 units tall
const HEAD = 60; // from the ground to just above the head
const KV = 8; // viewBox units per m s⁻¹ of velocity
const MARGIN = 50; // m of track beyond the farthest point of any run

const PEN = {
  track: [0, 0.3],
  ruler: [0.1, 0.34],
  post: [0.26, 0.42],
  runner: [0.36, 0.64],
  marks: [0.8, 0.95],
} as const;

/** y of the ground of each runner's lane: two lanes, or one in the middle when a runner is alone. */
function groundOf(fig: TrackFig, id: 'A' | 'B'): number {
  if (fig.runners.length === 1) return 150;
  return id === 'A' ? 92 : 176;
}

/** The times where a run changes part, and its end. */
function corners(trip: Trip, tEnd: number): number[] {
  const out = [0];
  let t = 0;
  for (const ph of trip.phases) {
    t += ph.dt;
    if (t < tEnd) out.push(t);
  }
  out.push(tEnd);
  return out;
}

/** The stretch of track shown, in metres east of the lamp post: every run, plus a margin, rounded out to 50 m. */
function extent(fig: TrackFig): [number, number] {
  const at = fig.runners.flatMap((r) => corners(r.trip, fig.tEnd).map((t) => tripPosition(t, r.trip)));
  const lo = Math.floor((Math.min(0, ...at) - MARGIN) / 50) * 50;
  const hi = Math.ceil((Math.max(0, ...at) + MARGIN) / 50) * 50;
  return [lo, hi];
}

/** True when the figure plays the race (and so gets a pause button). */
export function trackPlays(fig: TrackFig): boolean {
  return fig.play === true;
}

/**
 * The given values in the sheet header. On the explore screen (`t` from the slider) the header becomes the readout:
 * how far runner A has run so far, and its displacement.
 */
export function trackParams(fig: TrackFig, t?: number): string {
  const a = fig.runners.find((r) => r.id === 'A');
  if (t !== undefined && a) {
    const sign = fig.plus === 'east' ? 1 : -1;
    return `A: distance ${fixed(tripDistance(0, t, a.trip), 0)} m, s = ${signedMetres(sign * tripPosition(t, a.trip))}`;
  }
  return `${fig.runners.length > 1 ? 'both in ' : ''}${fixed(fig.tEnd, 0)} s, ${fig.plus} is +`;
}

type Props = {
  fig: TrackFig;
  /** Time since the runners left the lamp post, from the explore slider: they are drawn there, with readouts. */
  live?: number;
  playing: boolean;
  clock?: DrawClock;
};

export function TrackFigure({ fig, live, playing, clock = STILL }: Props) {
  const { palette: p, material: m } = useTheme();
  const reduced = useReducedMotionPref();
  const [lo, hi] = extent(fig);
  const k = (XR - XL) / (hi - lo);
  const X = (s: number) => XL + (s - lo) * k;
  const x0 = X(0);
  const sign = fig.plus === 'east' ? 1 : -1; // a position east of the lamp post, as the lesson writes it
  const plays = trackPlays(fig);
  const clip = fig.tEnd / TRACK_SPEEDUP;
  const loop = useLoopTime(plays && playing && !reduced && !clock.on && live === undefined, clip, clip, HOLD);
  const still = fig.at === 'end' ? fig.tEnd : typeof fig.at === 'number' ? fig.at : 0;
  const t = live ?? (plays ? (reduced ? fig.tEnd : loop * TRACK_SPEEDUP) : still);
  const ended = t >= fig.tEnd - 1e-9;
  const moving = t > 1e-9 && !ended;
  const topGround = Math.min(...fig.runners.map((r) => groundOf(fig, r.id)));
  const runnerA = fig.runners.find((r) => r.id === 'A');

  return (
    <Group>
      {fig.runners.map((r) => (
        <Hatch key={r.id} x1={6} x2={334} y={groundOf(fig, r.id)} color={p.draw} clock={clock} from={PEN.track[0]} to={PEN.track[1]} />
      ))}
      <TrackRuler lo={lo} hi={hi} X={X} plus={fig.plus} numbers={fig.numbers === true} clock={clock} />
      {/* the lamp post on the top lane, and a dashed line down from it through every lane to the 0 of the ruler */}
      <DrawnPath clock={clock} len={RULER_Y - topGround} from={PEN.post[0]} to={PEN.post[1]} d={`M${x0},${topGround} V${RULER_Y}`} stroke={p.lineStrong} strokeWidth={stroke.thin} strokeDasharray="3 4" fill="none" />
      <LampPost x={x0} y={topGround} clock={clock} />

      {/* runner A's legs: one arrow per part of its run, stacked above its lane, joined where it turns */}
      {fig.legs && runnerA && stage(clock, PEN.marks, <Legs trip={runnerA.trip} tEnd={fig.tEnd} top={groundOf(fig, 'A') - 104} X={X} />)}

      {plays && !reduced && <MonoLabel x={332} y={11} text={`t = ${fixed(t, 0)} s   × ${TRACK_SPEEDUP}`} color={p.label} size={9} anchor="end" />}

      {fig.runners.map((r) => {
        const y = groundOf(fig, r.id);
        const s = tripPosition(t, r.trip);
        const v = tripVelocity(t, r.trip);
        const showDisp = fig.disp !== undefined && (!plays || ended || reduced);
        const arrowY = y - HEAD - 10;
        const dx = Math.sign(v) * (KV * Math.abs(v) + 8);
        const vText = `${signed(sign * v, 1)} m s⁻¹`;
        // the value sits above the arrow in the top lane; in the lower lane (the top lane's ground is just above)
        // it sits beyond the arrow's tip
        const vAt: [number, number] = groundOf(fig, r.id) === Math.min(...fig.runners.map((q) => groundOf(fig, q.id))) ? [X(s) + dx * 0.5, arrowY - 11] : [X(s) + dx + Math.sign(v) * ((vText.length * 5.4 + 8) / 2 + 4), arrowY + 3];
        return (
          <Group key={r.id}>
            <Person x={X(s)} y={y} scale={SCALE} cg={false} who={r.id} clock={clock} pen={PEN.runner} />
            {stage(clock, PEN.marks, <ForceLetter x={X(s) + 14} y={y - 40} text={r.id} color={p.ink} size={13} anchor="start" />)}
            {moving && Math.abs(v) > 1e-9 && stage(clock, PEN.marks, <HollowArrow from={[X(s), arrowY]} to={[X(s) + dx, arrowY]} color={p.draw} weight="track" />)}
            {moving && fig.values && stage(clock, PEN.marks, <Tag x={vAt[0]} y={vAt[1]} text={vText} />)}
            {showDisp && stage(clock, PEN.marks, <Displacement x1={x0} x2={X(tripPosition(fig.tEnd, r.trip))} y={y + 17} text={fig.disp === 'shown' ? `s = ${signedMetres(sign * tripPosition(fig.tEnd, r.trip))}` : 's = ?'} unknown={fig.disp !== 'shown'} />)}
          </Group>
        );
      })}
    </Group>
  );
}

/** "+300 m", "−200 m", "0 m". */
function signedMetres(s: number): string {
  const text = signed(s, 0);
  return `${text === '0' ? '0' : text} m`;
}

/**
 * The axis along the bottom: metres from the lamp post. Ticks every 50 m; numbers every 100 m (or only the 0).
 * Its arrowhead and + sit at the end the lesson calls positive; W and E mark the two ends.
 */
function TrackRuler({ lo, hi, X, plus, numbers, clock }: { lo: number; hi: number; X: (s: number) => number; plus: 'east' | 'west'; numbers: boolean; clock: DrawClock }) {
  const { palette: p, material: m } = useTheme();
  const sign = plus === 'east' ? 1 : -1;
  const ticks: RulerTick[] = [];
  for (let s = lo; s <= hi + 1e-9; s += 50) {
    const numbered = s % 100 === 0 && (numbers || s === 0);
    ticks.push({ at: X(s), len: s % 100 === 0 ? 6 : 3.5, label: numbered ? (s === 0 ? '0 m' : fixed(sign * s, 0)) : undefined, color: s === 0 ? p.ink : undefined });
  }
  const tipX = plus === 'east' ? XR + 10 : XL - 10;
  return (
    <Ruler axis="x" at={RULER_Y} from={XL - 4} to={XR + 4} arrow={plus === 'east' ? 'end' : 'start'} ticks={ticks} side={-1} labelAt={12} clock={clock} pen={PEN.ruler}>
      <ForceLetter x={tipX - sign * 5} y={RULER_Y - 9} text="+" color={p.label} size={14} />
      <MonoLabel x={XL - 6} y={RULER_Y + 12} text="W" color={p.ink} size={9.5} anchor="start" />
      <MonoLabel x={XR + 6} y={RULER_Y + 12} text="E" color={p.ink} size={9.5} anchor="end" />
    </Ruler>
  );
}

/** A street lamp standing on the ground at (x, y): a pole, an arm and a lamp head. */
function LampPost({ x, y, clock }: { x: number; y: number; clock: DrawClock }) {
  const { palette: p, material: m } = useTheme();
  const top = y - 60;
  return (
    <Group>
      <DrawnPath clock={clock} len={60 + 14} from={PEN.post[0]} to={PEN.post[1]} d={`M${x},${y} V${top} H${x + 14}`} stroke={p.draw} strokeWidth={stroke.force} strokeLinejoin="round" fill="none" />
      <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
        <Rect x={x - 5} y={y - 4} width={10} height={4} fill={p.draw} />
        <Path d={`M${x + 8},${top + 1} H${x + 22} L${x + 19},${top + 7} H${x + 11} Z`} fill={m.metalSide} stroke={p.draw} strokeWidth={stroke.thin} strokeLinejoin="round" />
      </DrawnFade>
    </Group>
  );
}

/** Each part of a run as an arrow, stacked one under the next and joined where the runner turns, with its length. */
function Legs({ trip, tEnd, top, X }: { trip: Trip; tEnd: number; top: number; X: (s: number) => number }) {
  const { palette: p, material: m } = useTheme();
  const ts = corners(trip, Math.min(tEnd, tripDuration(trip)));
  const parts = ts.slice(1).map((t, i) => ({ from: tripPosition(ts[i], trip), to: tripPosition(t, trip) }));
  return (
    <Group>
      {parts.map((part, i) => {
        const y = top + i * 20;
        const east = part.to > part.from;
        const len = Math.abs(part.to - part.from);
        return (
          <Group key={i}>
            {i > 0 && <Line x1={X(part.from)} y1={y - 20} x2={X(part.from)} y2={y} stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="2 3" />}
            <ForceArrow x1={X(part.from)} y1={y} x2={X(part.to)} y2={y} color={p.draw} width={1.8} />
            <Tag x={(X(part.from) + X(part.to)) / 2} y={y - 5} text={`${fixed(len, 0)} m ${east ? 'E' : 'W'}`} />
          </Group>
        );
      })}
    </Group>
  );
}

/** The displacement: a solid ink arrow from the lamp post to where the run ends, dashed while it is asked for. */
function Displacement({ x1, x2, y, text, unknown }: { x1: number; x2: number; y: number; text: string; unknown: boolean }) {
  const { palette: p, material: m } = useTheme();
  if (Math.abs(x2 - x1) < 1) return <Tag x={x1} y={y + 4} text={text} />;
  return (
    <Group>
      <ForceArrow x1={x1} y1={y} x2={x2} y2={y} color={p.ink} width={stroke.force} dashed={unknown} />
      {/* the size on the arrow's own line, past its tail, so it never drops into the lane below */}
      <Tag x={x2 < x1 ? x1 + 8 : x1 - 8} y={y + 3.5} text={text} anchor={x2 < x1 ? 'start' : 'end'} />
    </Group>
  );
}

