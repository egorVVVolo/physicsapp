// A scale along one axis of a drawing: the line (traced by the pen), an arrowhead at its far end, ticks and numbers.
// The caller says where every tick goes, how long it is and what it reads; extras (a "+" sign, "UP", a unit) go in
// `children` and fade in with the ticks.
import type { ReactNode } from 'react';
import { G as Group, Line, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { STILL, type DrawClock } from '../anim';
import { DrawnFade, DrawnPath, FILLS, MonoLabel, type Pen } from '../draw';

export type RulerTick = { at: number; len: number; label?: string; dy?: number; color?: string };

type Props = {
  /** 'x': a horizontal scale at y = `at`, from `from` rightwards to `to`. 'y': a vertical one at x = `at`, from `from` up to `to`. */
  axis: 'x' | 'y';
  at: number;
  from: number;
  to: number;
  /** Draw the line itself (a scale on a wall may be only ticks). */
  line?: boolean;
  /** An arrowhead past one end (x scales only point either way): the positive direction. */
  arrow?: 'end' | 'start';
  ticks: RulerTick[];
  /** Which side the ticks stand on: +1 down (x) or right (y), −1 up or left. */
  side: 1 | -1;
  /** Where the numbers go, across the line from it; and, along it, a shift (y scales: +3.5 centres the text). */
  labelAt: number;
  labelDy?: number;
  labelSize?: number;
  labelAnchor?: 'start' | 'middle' | 'end';
  color?: string;
  width?: number;
  tickColor?: string;
  tickWidth?: number;
  clock?: DrawClock;
  pen?: Pen;
  children?: ReactNode;
};

export function Ruler({ axis, at, from, to, line = true, arrow, ticks, side, labelAt, labelDy = 0, labelSize = 9, labelAnchor = 'middle', color, width = 1.6, tickColor, tickWidth = 1.2, clock = STILL, pen = [0, 1], children }: Props) {
  const { palette: p } = useTheme();
  const c = color ?? p.draw;
  const tc = tickColor ?? p.draw;
  const x = axis === 'x';
  const d = x ? `M${from},${at} H${to}` : `M${at},${from} V${to}`;
  const head = !x
    ? `M${at - 5},${to + 2} L${at},${to - 8} L${at + 5},${to + 2} Z`
    : arrow === 'start'
      ? `M${from + 2},${at - 4.5} L${from - 6},${at} L${from + 2},${at + 4.5} Z`
      : `M${to - 2},${at - 4.5} L${to + 6},${at} L${to - 2},${at + 4.5} Z`;
  return (
    <Group>
      {line && <DrawnPath clock={clock} len={Math.abs(to - from)} from={pen[0]} to={pen[1]} d={d} stroke={c} strokeWidth={width} fill="none" />}
      <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
        {arrow && <Path d={head} fill={c} />}
        {ticks.map((t) => (x ? <Line key={t.at} x1={t.at} y1={at} x2={t.at} y2={at + side * t.len} stroke={tc} strokeWidth={tickWidth} /> : <Line key={t.at} x1={at} y1={t.at} x2={at + side * t.len} y2={t.at} stroke={tc} strokeWidth={tickWidth} />))}
        {ticks
          .filter((t) => t.label !== undefined)
          .map((t) => (
            <MonoLabel key={t.at} x={x ? t.at : at + labelAt} y={x ? at + labelAt + (t.dy ?? 0) : t.at + labelDy + (t.dy ?? 0)} text={t.label!} color={t.color ?? p.label} size={labelSize} anchor={labelAnchor} />
          ))}
        {children}
      </DrawnFade>
    </Group>
  );
}
