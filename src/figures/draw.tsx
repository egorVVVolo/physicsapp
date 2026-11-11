// Drawing-sheet primitives: arrows (force = solid, motion = outline, acceleration = double chevron),
// a centre-of-gravity mark and mono labels. Coordinates are in each figure's viewBox units.
import { Circle, G, Line, Path, Polygon, Text as SvgText } from 'react-native-svg';
import { svgLetter, svgMono } from '@/theme/svgFont';

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
export function MotionArrow({ x, y, dir, length, color }: { x: number; y: number; dir: 'up' | 'down'; length: number; color: string }) {
  const s = dir === 'up' ? -1 : 1;
  const tip = y + (s * length) / 2;
  const tail = y - (s * length) / 2;
  const neck = tip - s * 14;
  const d = `M${x - 4},${tail} L${x - 4},${neck} L${x - 10},${neck} L${x},${tip} L${x + 10},${neck} L${x + 4},${neck} L${x + 4},${tail} Z`;
  return <Path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />;
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
  return (
    <G>
      <Circle cx={x} cy={y} r={5} fill="#FFFFFF" stroke={color} strokeWidth={1.6} />
      <Path d={`M${x},${y - 5} L${x},${y + 5} M${x - 5},${y} L${x + 5},${y}`} stroke={color} strokeWidth={1.2} />
    </G>
  );
}

/** A small label in the drawing-sheet voice (IBM Plex Mono). */
export function MonoLabel({ x, y, text, color, size = 10, anchor = 'middle' }: { x: number; y: number; text: string; color: string; size?: number; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <SvgText x={x} y={y} fontSize={size} fill={color} fontFamily={svgMono} textAnchor={anchor} letterSpacing={0.6}>
      {text}
    </SvgText>
  );
}

/** The letter naming a force (W, N, P, E), in Space Grotesk. */
export function ForceLetter({ x, y, text, color, size = 17, anchor = 'middle' }: { x: number; y: number; text: string; color: string; size?: number; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <SvgText x={x} y={y} fontSize={size} fill={color} fontFamily={svgLetter} textAnchor={anchor}>
      {text}
    </SvgText>
  );
}

/** Ground hatching under a floor line, as on a drawing. */
export function Hatch({ x1, x2, y, color }: { x1: number; x2: number; y: number; color: string }) {
  const lines = [];
  for (let x = x1; x < x2; x += 9) lines.push(`M${x},${y + 8} L${x + 8},${y}`);
  return (
    <G>
      <Line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={2} />
      <Path d={lines.join(' ')} stroke={color} strokeWidth={1} opacity={0.55} />
    </G>
  );
}
