// A lab trolley in flat 3D with a buffer on its front.
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { MonoLabel } from '../draw';

export const TROLLEY = { w: 80, h: 30, wheel: 6, buf: 14 };

/**
 * A lab trolley in flat 3D (a top facet, the side, two wheels) with a buffer on its front: a spring with a plate, or a
 * putty pad. `rear`: x of its back end; `facing` 1 points the front right, −1 left. `squashed`: how far the buffer is pushed in.
 */
export function Trolley({ rear, floor, facing, text, buffer, squashed = 0 }: { rear: number; floor: number; facing: 1 | -1; text: string; buffer: 'spring' | 'putty' | 'none'; squashed?: number }) {
  const { palette: p, material: m, stroke, pick } = useTheme();
  const { w, h, wheel, buf } = TROLLEY;
  const X = (dx: number) => rear + facing * dx;
  const top = floor - wheel * 2 - h + 3;
  const x1 = Math.min(X(0), X(w));
  const midY = top + h / 2 + 1;
  const bl = Math.max(2, buf - squashed); // the buffer's length now
  const zig = Array.from({ length: 6 }, (_, i) => `L${X(w + ((i + 1) * (bl - 2)) / 7)},${midY + (i % 2 === 0 ? -4 : 4)}`).join(' ');
  return (
    <Group>
      <Path d={`M${x1},${top} L${x1 + 6},${top - 5} H${x1 + w + 6} L${x1 + w},${top} Z`} fill={pick(m.plasticSide, p.drawFillDark)} stroke={p.draw} strokeWidth={pick(stroke.thin, 1.3)} strokeLinejoin="round" />
      <Rect x={x1} y={top} width={w} height={h} rx={2} fill={pick(m.plastic, p.drawFill)} stroke={p.draw} strokeWidth={pick(stroke.body, 1.6)} />
      {[14, w - 14].map((dx) => (
        <Group key={dx}>
          <Circle cx={X(dx)} cy={floor - wheel} r={wheel} fill={pick(m.rubber, p.drawFillDark)} stroke={p.draw} strokeWidth={pick(stroke.thin, 1.3)} />
          <Circle cx={X(dx)} cy={floor - wheel} r={pick(1.8, 1.3)} fill={pick(m.metal, p.draw)} />
        </Group>
      ))}
      <MonoLabel x={x1 + w / 2} y={top + 18} text={text} color={p.ink} size={9} />
      {buffer === 'spring' && (
        <Group>
          <Path d={`M${X(w)},${midY} ${zig} L${X(w + bl - 1)},${midY}`} fill="none" stroke={p.draw} strokeWidth={pick(stroke.thin, 1.4)} strokeLinejoin="round" />
          <Line x1={X(w + bl)} y1={midY - 7} x2={X(w + bl)} y2={midY + 7} stroke={p.draw} strokeWidth={pick(stroke.force, 2.4)} strokeLinecap="round" />
        </Group>
      )}
      {buffer === 'putty' && (
        <Rect x={Math.min(X(w), X(w + bl))} y={midY - 6 - squashed * 0.35} width={bl} height={12 + squashed * 0.7} rx={4} fill={p.drawFillDark} stroke={p.draw} strokeWidth={pick(stroke.thin, 1.3)} />
      )}
    </Group>
  );
}
