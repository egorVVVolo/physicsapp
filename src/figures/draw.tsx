// Drawing-sheet primitives: arrows (force = solid, motion = outline, acceleration = double chevron),
// a centre-of-gravity mark and mono labels. Coordinates are in each figure's viewBox units.
import { createContext, useContext, type ReactNode } from 'react';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import { Circle, G, Line, Path, Polygon, Text as SvgText, type PathProps } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { svgLetter, svgMono } from '@/theme/svgFont';
import { STILL, type DrawClock } from './anim';

// ── Drawing itself: a line is traced by the pen, a fill fades in ──

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

/** The share of the pen's clock `t` inside the stretch [from, to], from 0 to 1. */
function shareOf(t: number, from: number, to: number): number {
  'worklet';
  return Math.min(1, Math.max(0, (t - from) / (to - from)));
}

type DrawnPathProps = PathProps & {
  clock: DrawClock;
  /** The length of the path in viewBox units: a figure from above is fine, a figure from below leaves a gap. */
  len: number;
  /** When the pen draws this line, as shares of the whole draw-in (0…1). */
  from: number;
  to: number;
};

/** A path the pen traces from its start to its end while the clock runs. Otherwise a plain path. */
export function DrawnPath({ clock, len, from, to, ...rest }: DrawnPathProps) {
  if (!clock.on) return <Path {...rest} />;
  return <TracingPath t={clock.t} len={len} from={from} to={to} {...rest} />;
}

function TracingPath({ t, len, from, to, ...rest }: PathProps & { t: SharedValue<number>; len: number; from: number; to: number }) {
  const animatedProps = useAnimatedProps(() => {
    const k = shareOf(t.get(), from, to);
    return { strokeDashoffset: len * (1 - k), opacity: k > 0 ? 1 : 0 };
  });
  return <AnimatedPath {...rest} strokeDasharray={[len, len]} animatedProps={animatedProps} />;
}

/** Fills (and anything else that is not a line) fade in over [from, to] while the clock runs. */
export function DrawnFade({ clock, from, to, children }: { clock: DrawClock; from: number; to: number; children: ReactNode }) {
  if (!clock.on) return <G>{children}</G>;
  return (
    <FadingGroup t={clock.t} from={from} to={to}>
      {children}
    </FadingGroup>
  );
}

function FadingGroup({ t, from, to, children }: { t: SharedValue<number>; from: number; to: number; children: ReactNode }) {
  const animatedProps = useAnimatedProps(() => ({ opacity: shareOf(t.get(), from, to) }));
  return <AnimatedG animatedProps={animatedProps}>{children}</AnimatedG>;
}

/** All fills fade in over this stretch of the draw-in, after the lines. */
export const FILLS = [0.62, 0.8] as const;

/** A stretch of the draw-in, as shares of it. */
export type Pen = readonly [number, number];

/** Part i of n of a stretch: the parts overlap a little, so the pen never stops. */
export function penPart(pen: Pen, i: number, n: number): Pen {
  const step = (pen[1] - pen[0]) / n;
  return [pen[0] + step * i, Math.min(pen[1], pen[0] + step * (i + 1.8))];
}

/** A filled shape with an outline: the pen draws the outline, the fill fades in with all fills. Otherwise one plain path. */
export function DrawnShape({ clock, d, len, pen, fill, ...stroke }: Omit<PathProps, 'd' | 'fill'> & { clock: DrawClock; d: string; len: number; pen: Pen; fill: string }) {
  if (!clock.on) return <Path d={d} fill={fill} {...stroke} />;
  return (
    <G>
      <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
        <Path d={d} fill={fill} />
      </DrawnFade>
      <DrawnPath clock={clock} len={len} from={pen[0]} to={pen[1]} d={d} fill="none" {...stroke} />
    </G>
  );
}

/** A circle as a path (from its left point, clockwise over the top), with its length. */
export function circlePath(cx: number, cy: number, r: number): { d: string; len: number } {
  return { d: `M${cx - r},${cy} a${r},${r} 0 1 1 ${2 * r},0 a${r},${r} 0 1 1 ${-2 * r},0 Z`, len: 2 * Math.PI * r };
}

/** A closed polygon as a path, with its length. */
export function polyPath(points: readonly (readonly [number, number])[]): { d: string; len: number } {
  let len = 0;
  points.forEach(([x, y], i) => {
    const [nx, ny] = points[(i + 1) % points.length];
    len += Math.hypot(nx - x, ny - y);
  });
  return { d: 'M' + points.map(([x, y]) => `${x},${y}`).join(' L') + ' Z', len };
}

/** The outline of a rectangle as a path (clockwise from the top left), with its length. */
export function rectPath(x: number, y: number, w: number, h: number, r = 0): { d: string; len: number } {
  const a = (dx: number, dy: number) => (r ? ` a${r},${r} 0 0 1 ${dx},${dy}` : '');
  const d = `M${x + r},${y} H${x + w - r}${a(r, r)} V${y + h - r}${a(-r, r)} H${x + r}${a(-r, -r)} V${y + r}${a(r, -r)} Z`;
  return { d, len: 2 * (w + h) };
}

/** A solid force arrow from (x1, y1) to (x2, y2), head at the end. Dashed when it is only a candidate. */
export function ForceArrow({ x1, y1, x2, y2, color, width = 3.2, dashed }: { x1: number; y1: number; x2: number; y2: number; color: string; width?: number; dashed?: boolean }) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 1) return null;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const h = Math.min(11, len * 0.6); // head length
  const bx = x2 - ux * h;
  const by = y2 - uy * h;
  const nx = -uy * 6;
  const ny = ux * 6;
  return (
    <G>
      <Line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeLinecap="butt" strokeDasharray={dashed ? '5 4' : undefined} />
      <Polygon points={`${x2},${y2} ${bx + nx},${by + ny} ${bx - nx},${by - ny}`} fill={dashed ? 'none' : color} stroke={color} strokeWidth={dashed ? 1.6 : 0} strokeLinejoin="round" />
    </G>
  );
}

/** A hollow (outline) vertical arrow: the direction of motion. */
export function MotionArrow({ x, y, dir, length, color, clock = STILL, pen = [0, 1] }: { x: number; y: number; dir: 'up' | 'down'; length: number; color: string; clock?: DrawClock; pen?: Pen }) {
  const s = dir === 'up' ? -1 : 1;
  const tip = y + (s * length) / 2;
  const tail = y - (s * length) / 2;
  const neck = tip - s * 14;
  const d = `M${x - 4},${tail} L${x - 4},${neck} L${x - 10},${neck} L${x},${tip} L${x + 10},${neck} L${x + 4},${neck} L${x + 4},${tail} Z`;
  // two shafts (length − 14 each), two shoulders of 6, two head edges of √(10² + 14²), the tail of 8
  const len = 2 * length + 28;
  return <DrawnPath clock={clock} len={len} from={pen[0]} to={pen[1]} d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />;
}

/** Two stacked chevrons: the direction of the acceleration. */
export function AccChevrons({ x, y, dir, color }: { x: number; y: number; dir: 'up' | 'down'; color: string }) {
  const s = dir === 'up' ? -1 : 1;
  const one = (cy: number) => `M${x - 9},${cy - s * 5} L${x},${cy + s * 5} L${x + 9},${cy - s * 5}`;
  return (
    <G>
      <Path d={one(y - 6)} fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      <Path d={one(y + 6)} fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </G>
  );
}

/** The centre-of-gravity mark used on engineering drawings: a ring with a cross. */
export function CgMark({ x, y, color }: { x: number; y: number; color: string }) {
  const { palette: p } = useTheme();
  return (
    <G>
      <Circle cx={x} cy={y} r={5} fill={p.page} stroke={color} strokeWidth={1.6} />
      <Path d={`M${x},${y - 5} L${x},${y + 5} M${x - 5},${y} L${x + 5},${y}`} stroke={color} strokeWidth={1.2} />
    </G>
  );
}

/**
 * How many screen points one viewBox unit takes on the sheet, for figures in the new style (0: leave sizes alone).
 * Labels use it so that on the screen they are never smaller than MONO_MIN / LETTER_MIN points.
 */
export const SheetScale = createContext(0);
const MONO_MIN = 10.5;
const LETTER_MIN = 13;
function useReadable(size: number, min: number): number {
  const k = useContext(SheetScale);
  return k > 0 ? Math.max(size, min / k) : size;
}

/** The distance from one line of a two-line mono label to the next, for labels of this size (they may have grown). */
export function useLineStep(size: number): number {
  return useReadable(size, MONO_MIN) * 1.25;
}

/** A small label in the drawing-sheet voice (IBM Plex Mono). */
export function MonoLabel({ x, y, text, color, size = 10, anchor = 'middle' }: { x: number; y: number; text: string; color: string; size?: number; anchor?: 'start' | 'middle' | 'end' }) {
  const fontSize = useReadable(size, MONO_MIN);
  return (
    <SvgText x={x} y={y} fontSize={fontSize} fill={color} fontFamily={svgMono} textAnchor={anchor} letterSpacing={0.6}>
      {text}
    </SvgText>
  );
}

/** The letter naming a force (W, N, P, E), in Space Grotesk. */
export function ForceLetter({ x, y, text, color, size = 17, anchor = 'middle' }: { x: number; y: number; text: string; color: string; size?: number; anchor?: 'start' | 'middle' | 'end' }) {
  const fontSize = useReadable(size, LETTER_MIN);
  return (
    <SvgText x={x} y={y} fontSize={fontSize} fill={color} fontFamily={svgLetter} textAnchor={anchor}>
      {text}
    </SvgText>
  );
}

/** Ground hatching under a floor line, as on a drawing. With a running clock the line is drawn first, then the ticks one by one. */
export function Hatch({ x1, x2, y, color, clock = STILL, from = 0, to = 1 }: { x1: number; x2: number; y: number; color: string; clock?: DrawClock; from?: number; to?: number }) {
  const ticks: string[] = [];
  for (let x = x1; x < x2; x += 9) ticks.push(`M${x},${y + 8} L${x + 8},${y}`);
  const mid = from + (to - from) * 0.5;
  const rest = to - mid; // tick i starts a little after tick i − 1; the last one ends exactly at `to`
  const start = (i: number) => mid + (rest * 0.7 * i) / ticks.length;
  return (
    <G>
      <DrawnPath clock={clock} len={x2 - x1} from={from} to={mid} d={`M${x1},${y} H${x2}`} stroke={color} strokeWidth={2} />
      {clock.on ? (
        ticks.map((d, i) => <DrawnPath key={i} clock={clock} len={12} from={start(i)} to={start(i) + rest * 0.3} d={d} stroke={color} strokeWidth={1} strokeOpacity={0.55} />)
      ) : (
        <Path d={ticks.join(' ')} stroke={color} strokeWidth={1} opacity={0.55} />
      )}
    </G>
  );
}
