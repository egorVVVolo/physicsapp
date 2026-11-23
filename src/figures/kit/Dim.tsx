// A dimension line between two points at any angle: end ticks and the size on a patch of paper in the middle.
import { G as Group, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { Tag } from './Tag';

type Pt = readonly [number, number];

/**
 * From a to b, moved `offset` units to the left of the direction a → b (on screen). `dashed`: only a candidate, no
 * ticks. `strong`: ink instead of the label grey. `fit="below"`: when the line is too short for its text, the text
 * goes under it instead of over it. `text` may be left out.
 */
export function Dim({ a, b, offset = 0, text, dashed, strong, fit }: { a: Pt; b: Pt; offset?: number; text?: string; dashed?: boolean; strong?: boolean; fit?: 'below' }) {
  const { palette: p } = useTheme();
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (len < 1) return null;
  const ux = (b[0] - a[0]) / len;
  const uy = (b[1] - a[1]) / len;
  const nx = uy * offset;
  const ny = -ux * offset;
  const a2 = [a[0] + nx, a[1] + ny];
  const b2 = [b[0] + nx, b[1] + ny];
  const tick = (q: number[]) => `M${q[0] + uy * 4},${q[1] - ux * 4} L${q[0] - uy * 4},${q[1] + ux * 4}`;
  const color = strong ? p.ink : p.label;
  const narrow = fit === 'below' && text !== undefined && len < text.length * 5.4 + 16;
  const mid = [(a2[0] + b2[0]) / 2, (a2[1] + b2[1]) / 2];
  return (
    <Group>
      <Path d={`M${a2[0]},${a2[1]} L${b2[0]},${b2[1]}`} stroke={color} strokeWidth={dashed ? 1.6 : strong ? 1.6 : 1.1} strokeDasharray={dashed ? '5 4' : undefined} />
      {!dashed && <Path d={`${tick(a2)} ${tick(b2)}`} stroke={color} strokeWidth={1.1} />}
      {text && <Tag x={mid[0]} y={mid[1] + (narrow ? 14 : 3.5)} text={text} />}
    </Group>
  );
}
