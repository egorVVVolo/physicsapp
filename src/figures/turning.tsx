// Shared drawing for the moments figures: the turning arc (the sense of a moment), a dimension between any two
// points (dashed when it is only a candidate) and a right-angle mark. Coordinates are viewBox units, y down.
import { G as Group, Path, Polygon } from 'react-native-svg';

const RAD = Math.PI / 180;
type Pt = readonly [number, number];

/**
 * A curved arrow around (cx, cy): it starts at screen angle `from` (degrees, 0 = right, growing clockwise on screen)
 * and sweeps `sweep` degrees, the head at its end. Negative sweep = anticlockwise.
 */
export function TurnArc({ cx, cy, r, from, sweep, color, width = 2 }: { cx: number; cy: number; r: number; from: number; sweep: number; color: string; width?: number }) {
  const s = Math.sign(sweep);
  const head = 9; // length of the head along the arc
  const endA = (from + sweep) * RAD;
  const stopA = endA - s * (head / r); // the line stops where the head begins
  const at = (a: number): [number, number] => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const p0 = at(from * RAD);
  const p1 = at(stopA);
  const tip = at(endA);
  const large = Math.abs(sweep) - (head / r) / RAD > 180 ? 1 : 0;
  const d = `M${p0[0]},${p0[1]} A${r},${r} 0 ${large} ${s > 0 ? 1 : 0} ${p1[0]},${p1[1]}`;
  // the head's base is across the arc at p1
  const nx = Math.cos(stopA);
  const ny = Math.sin(stopA);
  const base1 = [p1[0] + nx * 5, p1[1] + ny * 5];
  const base2 = [p1[0] - nx * 5, p1[1] - ny * 5];
  return (
    <Group>
      <Path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
      <Polygon points={`${tip[0]},${tip[1]} ${base1[0]},${base1[1]} ${base2[0]},${base2[1]}`} fill={color} />
    </Group>
  );
}


/** A right-angle mark at `at` between the unit directions u and v. */
export function RightAngle({ at, u, v, size = 7, color }: { at: Pt; u: Pt; v: Pt; size?: number; color: string }) {
  const p1 = [at[0] + u[0] * size, at[1] + u[1] * size];
  const p2 = [p1[0] + v[0] * size, p1[1] + v[1] * size];
  const p3 = [at[0] + v[0] * size, at[1] + v[1] * size];
  return <Path d={`M${p1[0]},${p1[1]} L${p2[0]},${p2[1]} L${p3[0]},${p3[1]}`} fill="none" stroke={color} strokeWidth={1.1} />;
}

/** An angle mark: an arc of radius r at `at` from screen angle `from` sweeping `sweep` degrees. */
export function AngleArc({ at, r, from, sweep, color }: { at: Pt; r: number; from: number; sweep: number; color: string }) {
  const a0 = from * RAD;
  const a1 = (from + sweep) * RAD;
  const p0 = [at[0] + r * Math.cos(a0), at[1] + r * Math.sin(a0)];
  const p1 = [at[0] + r * Math.cos(a1), at[1] + r * Math.sin(a1)];
  return <Path d={`M${p0[0]},${p0[1]} A${r},${r} 0 0 ${sweep > 0 ? 1 : 0} ${p1[0]},${p1[1]}`} fill="none" stroke={color} strokeWidth={1.2} />;
}

/** "15 cm", "30 cm": a length in metres written in whole centimetres (lengths of a hand tool). */
export const cm = (m: number): string => `${Math.round(m * 100)} cm`;
