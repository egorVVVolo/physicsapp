// A lab trolley with a buffer on its front: one soft body with an edge of the same hue, two wheels.
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { MonoLabel } from '../draw';

export const TROLLEY = { w: 90, h: 34, wheel: 7, buf: 15 };

/**
 * A lab trolley with a buffer on its front: a spring with a plate, or a putty pad. `rear`: x of its back end;
 * `facing` 1 points the front right, −1 left. `squashed`: how far the buffer is pushed in. `tone`: the body's colour.
 */
export function Trolley({ rear, floor, facing, text, buffer, squashed = 0, tone = 'A' }: { rear: number; floor: number; facing: 1 | -1; text: string; buffer: 'spring' | 'putty' | 'none'; squashed?: number; tone?: 'A' | 'B' }) {
  const { palette: p, soft, stroke } = useTheme();
  const { w, h, wheel, buf } = TROLLEY;
  const X = (dx: number) => rear + facing * dx;
  const top = floor - wheel * 2 - h + 2;
  const x1 = Math.min(X(0), X(w));
  const midY = top + h / 2;
  const bl = Math.max(2, buf - squashed); // the buffer's length now
  const zig = Array.from({ length: 6 }, (_, i) => `L${X(w + ((i + 1) * (bl - 2)) / 7)},${midY + (i % 2 === 0 ? -5 : 5)}`).join(' ');
  return (
    <Group>
      <Rect x={x1} y={top} width={w} height={h} rx={7} fill={soft[tone].fill} stroke={soft[tone].edge} strokeWidth={2} />
      {[17, w - 17].map((dx) => (
        <Group key={dx}>
          <Circle cx={X(dx)} cy={floor - wheel} r={wheel} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.body} />
          <Circle cx={X(dx)} cy={floor - wheel} r={1.8} fill={p.draw} />
        </Group>
      ))}
      <MonoLabel x={x1 + w / 2} y={midY + 4.5} text={text} color={p.ink} size={9} />
      {buffer === 'spring' && (
        <Group>
          <Path d={`M${X(w)},${midY} ${zig} L${X(w + bl - 1)},${midY}`} fill="none" stroke={p.draw} strokeWidth={stroke.thin} strokeLinejoin="round" />
          <Line x1={X(w + bl)} y1={midY - 9} x2={X(w + bl)} y2={midY + 9} stroke={p.draw} strokeWidth={stroke.force} strokeLinecap="round" />
        </Group>
      )}
      {buffer === 'putty' && (
        <Rect x={Math.min(X(w), X(w + bl))} y={midY - 7 - squashed * 0.35} width={bl} height={14 + squashed * 0.7} rx={5} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.thin} />
      )}
    </Group>
  );
}
