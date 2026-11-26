// FIG: a graph of motion against time. Displacement, velocity or acceleration of one or two trips, drawn from the
// model (tripPosition, tripVelocity, tripAcceleration in src/physics/kinematics), so the line, the areas and every
// number written on it always agree. What a screen needs is switched on in the figure: areas under a line with
// their size (hatched below the axis), the regions between two lines, a gradient triangle, a tangent, a ring at a
// point, lettered parts to tap, and for the explore screen a time cursor with the areas so far.
// The first graph of a lesson draws itself: the axes, the lines, then the areas and the marks.
import type { ReactNode } from 'react';
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { tripAcceleration, tripDisplacement, tripDuration, tripPosition, tripVelocity, type Trip } from '@/physics/kinematics';
import { fixed } from '@/physics/format';
import type { GraphFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, type DrawClock } from './anim';
import { DrawnFade, DrawnPath, FILLS, ForceLetter, MonoLabel } from './draw';
import type { TapProps, TapTarget } from './Sheet';
import { Axes, stage } from './kit';

export const GRAPH_VB = { w: 340, h: 224 };

const PLOT = { x: 50, top: 26, w: 266, bottom: 188 };
const AXES: readonly [number, number] = [0, 0.36];
const LETTER_GAP = 18; // the least distance between the letters of two lines, viewBox units
const LINES: readonly [number, number] = [0.36, 0.7];
const MARKS: readonly [number, number] = [0.8, 0.95];
const TITLE = { s: 's / m', v: 'v / m s⁻¹', a: 'a / m s⁻²' } as const;
const UNIT = { s: 'm', v: 'm s⁻¹', a: 'm s⁻²' } as const;

type Pt = { x: number; y: number };

/** The scales of a graph and the value of each line at a time. */
function frame(fig: GraphFig) {
  const yMin = fig.yMin ?? 0;
  const X = (t: number) => PLOT.x + (t / fig.tMax) * PLOT.w;
  const Y = (y: number) => PLOT.bottom - ((y - yMin) / (fig.yMax - yMin)) * (PLOT.bottom - PLOT.top);
  const value = (trip: Trip, t: number) => (fig.y === 's' ? tripPosition(t, trip) : fig.y === 'v' ? tripVelocity(t, trip) : tripAcceleration(t, trip));
  const lineOf = (id: string) => fig.lines.find((l) => l.id === id) ?? fig.lines[0];
  const untilOf = (line: GraphFig['lines'][number]) => Math.min(line.until ?? fig.tMax, tripDuration(line.trip));
  return { yMin, X, Y, value, lineOf, untilOf };
}

/**
 * Points of a line between two times, phase by phase, so a step in velocity is drawn as a step.
 * The first point of each phase is taken just inside it.
 */
function samples(fig: GraphFig, trip: Trip, from: number, to: number): Pt[] {
  const { X, Y, value } = frame(fig);
  const pts: Pt[] = [];
  let t0 = 0;
  for (const ph of trip.phases) {
    const a = Math.max(from, t0);
    const b = Math.min(to, t0 + ph.dt);
    if (b > a + 1e-9) {
      const n = 14;
      for (let i = 0; i <= n; i++) {
        const t = a + ((b - a) * i) / n;
        pts.push({ x: X(t), y: Y(value(trip, i === 0 ? t + 1e-9 : t)) });
      }
    }
    t0 += ph.dt;
  }
  return pts;
}

const pathOf = (pts: Pt[]) => 'M' + pts.map((q) => `${q.x.toFixed(2)},${q.y.toFixed(2)}`).join(' L');
const lengthOf = (pts: Pt[]) => pts.reduce((sum, q, i) => (i ? sum + Math.hypot(q.x - pts[i - 1].x, q.y - pts[i - 1].y) : 0), 0);

/** The centre of a closed polygon (shoelace formula); the middle of its points if it has no area. */
function centreOf(pts: Pt[]): Pt {
  let a = 0;
  let cx = 0;
  let cy = 0;
  pts.forEach((q, i) => {
    const n = pts[(i + 1) % pts.length];
    const w = q.x * n.y - n.x * q.y;
    a += w;
    cx += (q.x + n.x) * w;
    cy += (q.y + n.y) * w;
  });
  if (Math.abs(a) < 1e-6) return { x: pts.reduce((s, q) => s + q.x, 0) / pts.length, y: pts.reduce((s, q) => s + q.y, 0) / pts.length };
  return { x: cx / (3 * a), y: cy / (3 * a) };
}

/** Tap targets in viewBox units: the lettered parts, as bands over the plot. */
export function graphTargets(fig: GraphFig): TapTarget[] {
  const { X } = frame(fig);
  return (fig.parts ?? []).map((part) => ({ id: part.id, x: X(part.from), y: PLOT.top - 4, w: X(part.to) - X(part.from), h: PLOT.bottom - PLOT.top + 4, label: `Part ${part.id}` }));
}

type Props = { fig: GraphFig; live?: number; tap?: TapProps; clock?: DrawClock };

export function GraphFigure({ fig, live, tap, clock = STILL }: Props) {
  const { palette: p, soft } = useTheme();
  // each line has its body's tone; the areas under it are filled with the same tone
  const toneOf = (id: string) => (fig.lines.findIndex((l) => l.id === id) === 1 ? soft.B : soft.A);
  const { yMin, X, Y, value, lineOf, untilOf } = frame(fig);
  const fills = (children: ReactNode) => (
    <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
      {children}
    </DrawnFade>
  );
  const tTicks: number[] = [];
  for (let t = fig.tTick; t <= fig.tMax + 1e-9; t += fig.tTick) tTicks.push(Number(t.toFixed(6)));
  const yTicks: number[] = [];
  for (let y = Math.ceil(yMin / fig.yTick) * fig.yTick; y <= fig.yMax + 1e-9; y += fig.yTick) yTicks.push(Number(y.toFixed(6)));
  const axisY = Y(0);
  const tLabelY = yMin < 0 ? PLOT.bottom + 15 : axisY + 17;
  const cursor = fig.cursor ? Math.min(live ?? 0, fig.tMax) : null;

  /** A second area under the same line is a little paler, so the two read apart. */
  const fillOf = (i: number) => {
    const line = fig.areas?.[i].line;
    return (fig.areas?.slice(0, i).filter((a) => a.line === line).length ?? 0) % 2 === 0 ? 0.65 : 0.35;
  };

  /** The area between a line and the time axis from → to, as a closed polygon. */
  const under = (trip: Trip, from: number, to: number): Pt[] => [...samples(fig, trip, from, to), { x: X(to), y: axisY }, { x: X(from), y: axisY }];

  // where each line's letter goes: just past its end, and at least LETTER_GAP from the other line's letter
  const letters = fig.lines.map((line) => {
    const pts = samples(fig, line.trip, 0, untilOf(line));
    const end = pts[pts.length - 1];
    const edge = end.x + 5 > GRAPH_VB.w - 12;
    // a line ending on the time axis keeps its letter above the axis numbers
    const onAxis = Math.abs(end.y - Y(0)) < 1;
    return { x: Math.min(end.x + 5, GRAPH_VB.w - 12), y: end.y + (edge || onAxis ? -8 : 5) };
  });
  if (letters.length === 2 && Math.abs(letters[0].x - letters[1].x) < 24) {
    const gap = Math.abs(letters[0].y - letters[1].y);
    if (gap < LETTER_GAP) {
      const [hi, lo] = letters[0].y < letters[1].y ? [0, 1] : [1, 0];
      letters[hi].y -= (LETTER_GAP - gap) / 2;
      letters[lo].y += (LETTER_GAP - gap) / 2;
    }
  }

  return (
    <Group>
      {/* lettered parts to tap: bands behind everything */}
      {fig.parts?.map((part, i) => {
        const mark = tap?.marks?.[part.id];
        const on = tap?.selected === part.id;
        const fill = mark === 'right' ? p.okBg : mark === 'wrong' ? p.badBg : on ? p.selectBg : 'none';
        const x1 = X(part.from);
        const x2 = X(part.to);
        return (
          <Group key={part.id}>
            <Rect x={x1 + 1} y={PLOT.top - 4} width={x2 - x1 - 2} height={PLOT.bottom - PLOT.top + 4} rx={6} fill={fill} stroke={on || mark ? (mark === 'right' ? p.ok : mark === 'wrong' ? p.bad : p.select) : 'none'} strokeWidth={stroke.body} />
            {fills(<ForceLetter x={(x1 + x2) / 2} y={PLOT.top + 13} text={part.id} color={p.ink} size={15} />)}
            {i > 0 && fills(<Line x1={x1} y1={PLOT.bottom} x2={x1} y2={PLOT.top - 4} stroke={p.lineStrong} strokeWidth={stroke.thin} strokeDasharray="3 4" />)}
          </Group>
        );
      })}

      {/* areas under a line: the displacement; below the axis they are hatched */}
      {fills(
        fig.areas?.map((area, i) => {
          const trip = lineOf(area.line).trip;
          const poly = under(trip, area.from, area.to);
          const size = tripDisplacement(area.from, area.to, trip);
          const hatch: string[] = [];
          if (size < 0) for (let x = X(area.from) + 4; x < X(area.to); x += 6) hatch.push(`M${x},${axisY} V${Y(value(trip, ((x - PLOT.x) / PLOT.w) * fig.tMax))}`);
          return (
            <Group key={i}>
              <Path d={pathOf(poly) + ' Z'} fill={toneOf(area.line).fill} fillOpacity={fillOf(i)} />
              {hatch.length > 0 && <Path d={hatch.join(' ')} stroke={toneOf(area.line).edge} strokeWidth={stroke.thin} opacity={0.5} fill="none" />}
            </Group>
          );
        }),
      )}
      {/* the regions between two lines: how much one body gains on the other */}
      {fills(
        fig.between?.map((reg, i) => {
          const a = samples(fig, fig.lines[0].trip, reg.from, reg.to);
          const b = samples(fig, fig.lines[1].trip, reg.from, reg.to).reverse();
          return <Path key={i} d={pathOf([...a, ...b]) + ' Z'} fill={(i % 2 === 0 ? soft.A : soft.B).fill} fillOpacity={0.55} />;
        }),
      )}
      {/* explore: the area under each line up to the cursor */}
      {cursor !== null &&
        cursor > 0 &&
        fig.lines.map((line) => <Path key={line.id} d={pathOf(under(line.trip, 0, Math.min(cursor, untilOf(line)))) + ' Z'} fill={toneOf(line.id).fill} fillOpacity={0.55} />)}

      {/* axes */}
      <Axes
        x0={PLOT.x}
        y0={axisY}
        xEnd={PLOT.x + PLOT.w + 12}
        yTop={PLOT.top - 12}
        yBottom={PLOT.bottom}
        xTicks={tTicks.map((t) => ({ x: X(t), label: String(t) }))}
        xLabelY={tLabelY}
        yTicks={yTicks.map((y) => ({ y: Y(y), label: fixed(y, 0) }))}
        xTitle={{ x: PLOT.x + PLOT.w + 14, y: PLOT.bottom + 34, text: 't / s', anchor: 'end' }}
        yTitle={{ x: PLOT.x + 7, y: PLOT.top - 9, text: TITLE[fig.y], anchor: 'start' }}
        clock={clock}
        pen={AXES}
      />

      {/* the lines themselves, each with its letter at its end (two letters close together are moved apart) */}
      {fig.lines.map((line, i) => {
        const pts = samples(fig, line.trip, 0, untilOf(line));
        return (
          <Group key={line.id || i}>
            <DrawnPath clock={clock} len={lengthOf(pts)} from={LINES[0] + i * 0.1} to={LINES[1] + i * 0.1} d={pathOf(pts)} stroke={toneOf(line.id).edge} strokeWidth={stroke.force} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {line.id !== '' && stage(clock, MARKS, <ForceLetter x={letters[i].x} y={letters[i].y} text={line.id} color={p.ink} size={15} anchor="start" />)}
          </Group>
        );
      })}

      {stage(clock, MARKS, 
        <Group>
          {/* the size of each area, in metres */}
          {fig.areas?.map((area, i) => {
            const trip = lineOf(area.line).trip;
            const c = area.at ? { x: X(area.at[0]), y: Y(area.at[1]) } : centreOf(under(trip, area.from, area.to));
            // with several areas on one graph each number carries the letter of its line
            const name = (fig.areas?.length ?? 0) > 1 && area.line !== '' ? `${area.line}: ` : '';
            const text = area.value === 'shown' ? `${name}${fixed(Math.abs(tripDisplacement(area.from, area.to, trip)), 1)} m` : '?';
            const hatched = tripDisplacement(area.from, area.to, trip) < 0;
            return (
              <Group key={i}>
                {/* on a hatched area the number stands on a clear patch */}
                {hatched && <Rect x={c.x - text.length * 2.9 - 3} y={c.y - 6} width={text.length * 5.8 + 6} height={13} rx={2} fill={p.paper} />}
                <MonoLabel x={c.x} y={c.y + 3.5} text={text} color={p.ink} size={area.value === 'shown' ? 9.5 : 13} />
              </Group>
            );
          })}
          {fig.between?.map((reg, i) => {
            const a = samples(fig, fig.lines[0].trip, reg.from, reg.to);
            const b = samples(fig, fig.lines[1].trip, reg.from, reg.to).reverse();
            const c = centreOf([...a, ...b]);
            const gain = Math.abs(tripDisplacement(reg.from, reg.to, fig.lines[0].trip) - tripDisplacement(reg.from, reg.to, fig.lines[1].trip));
            return <MonoLabel key={i} x={c.x} y={c.y + 3.5} text={`${fixed(gain, 1)} m`} color={p.ink} size={9.5} />;
          })}
          {fig.gradient && <Gradient fig={fig} />}
          {fig.tangent && <Tangent fig={fig} />}
          {fig.ring && <Circle cx={X(fig.ring.at)} cy={Y(value(lineOf(fig.ring.line).trip, fig.ring.at))} r={7.5} fill="none" stroke={p.ink} strokeWidth={stroke.body} />}
        </Group>,
      )}

      {/* explore: the time cursor, and the area under each line so far */}
      {cursor !== null && (
        <Group>
          <Line x1={X(cursor)} y1={PLOT.top - 6} x2={X(cursor)} y2={PLOT.bottom} stroke={p.ink} strokeWidth={stroke.thin} strokeDasharray="4 3" />
          {fig.lines.map((line, i) => (
            <Group key={line.id}>
              <Rect x={PLOT.x + 12} y={PLOT.top + 2 + i * 18} width={10} height={10} rx={3} fill={toneOf(line.id).fill} stroke={toneOf(line.id).edge} strokeWidth={stroke.body} />
              <MonoLabel x={PLOT.x + 27} y={PLOT.top + 11 + i * 18} text={`${line.id}: ${fixed(tripPosition(Math.min(cursor, untilOf(line)), line.trip), 1)} m`} color={p.ink} size={10} anchor="start" />
            </Group>
          ))}
        </Group>
      )}
    </Group>
  );
}

/** A rise-over-run triangle under a line, with both sides labelled. */
function Gradient({ fig }: { fig: GraphFig }) {
  const { palette: p } = useTheme();
  const { X, Y, value, lineOf } = frame(fig);
  if (!fig.gradient) return null;
  const { from, to } = fig.gradient;
  const trip = lineOf(fig.gradient.line).trip;
  const y1 = value(trip, from);
  const y2 = value(trip, to);
  return (
    <Group>
      <Path d={`M${X(from)},${Y(y1)} H${X(to)} V${Y(y2)}`} fill="none" stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="4 3" />
      <MonoLabel x={(X(from) + X(to)) / 2} y={Y(y1) + 13} text={`${fixed(to - from, 1)} s`} color={p.ink} size={9.5} />
      {/* a third of the way up, clear of a line that may cross the middle */}
      <MonoLabel x={X(to) + 6} y={Y(y1 + (y2 - y1) * 0.3) + 3.5} text={`${fixed(y2 - y1, 1)} ${UNIT[fig.y]}`} color={p.ink} size={9.5} anchor="start" />
    </Group>
  );
}

/** The tangent to a line at one time: a straight line with the gradient the curve has there. */
function Tangent({ fig }: { fig: GraphFig }) {
  const { palette: p } = useTheme();
  const { yMin, X, Y, value, lineOf } = frame(fig);
  if (!fig.tangent) return null;
  const { at } = fig.tangent;
  const trip = lineOf(fig.tangent.line).trip;
  const y0 = value(trip, at);
  const slope = fig.y === 's' ? tripVelocity(at, trip) : tripAcceleration(at, trip);
  // from where it meets the bottom of the plot (or 2.4 s before the point) to 2.4 s after it
  const t1 = Math.max(0, at - 2.4, slope > 0 ? at - (y0 - yMin) / slope : 0);
  const t2 = Math.min(fig.tMax, at + 2.4);
  const yAt = (t: number) => y0 + slope * (t - at);
  return (
    <Group>
      <Line x1={X(t1)} y1={Y(yAt(t1))} x2={X(t2)} y2={Y(yAt(t2))} stroke={p.label} strokeWidth={stroke.body} />
      <Circle cx={X(at)} cy={Y(y0)} r={4} fill={p.page} stroke={p.ink} strokeWidth={stroke.body} />
      <MonoLabel x={X(t2) + 5} y={Y(yAt(t2)) + 3} text="tangent" color={p.label} size={8.5} anchor="start" />
    </Group>
  );
}
