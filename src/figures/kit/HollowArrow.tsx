// The outline arrow of a velocity (forces are solid, accelerations double chevrons), from its tail to its tip at any
// angle. Three weights: `normal`, `thin` (components, small panels) and `track` (along a road or a track, beside a body).
import { Path } from 'react-native-svg';

type Pt = readonly [number, number];
const WEIGHTS = {
  normal: { half: 3, headW: 7.5, head: 12, share: 0.5, stroke: 1.8 },
  thin: { half: 2.2, headW: 6, head: 10, share: 0.5, stroke: 1.4 },
  track: { half: 2.6, headW: 6.5, head: 9, share: 0.55, stroke: 1.7 },
} as const;

export function HollowArrow({ from, to, color, weight = 'normal', minLen = 1 }: { from: Pt; to: Pt; color: string; weight?: keyof typeof WEIGHTS; minLen?: number }) {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  if (len < minLen) return null;
  const w = WEIGHTS[weight];
  const ux = (to[0] - from[0]) / len;
  const uy = (to[1] - from[1]) / len;
  const neck = len - Math.min(w.head, len * w.share);
  // a point `a` along the arrow and `n` across it
  const at = (a: number, n: number) => `${from[0] + ux * a - uy * n},${from[1] + uy * a + ux * n}`;
  const d = `M${at(0, -w.half)} L${at(neck, -w.half)} L${at(neck, -w.headW)} L${at(len, 0)} L${at(neck, w.headW)} L${at(neck, w.half)} L${at(0, w.half)} Z`;
  return <Path d={d} fill="none" stroke={color} strokeWidth={w.stroke} strokeLinejoin="round" />;
}
