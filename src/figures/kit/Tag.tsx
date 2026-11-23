// A mono label on a patch of drawing paper, so a line behind it never runs through the text.
import { G as Group, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { MonoLabel } from '../draw';

export function Tag({ x, y, text, color, size = 9, anchor = 'middle' }: { x: number; y: number; text: string; color?: string; size?: number; anchor?: 'start' | 'middle' | 'end' }) {
  const { palette: p } = useTheme();
  const w = text.length * size * 0.6 + 8;
  const left = anchor === 'start' ? x - 4 : anchor === 'end' ? x - w + 4 : x - w / 2;
  return (
    <Group>
      <Rect x={left} y={y - size} width={w} height={size + 4} rx={2} fill={p.paper} />
      <MonoLabel x={x} y={y} text={text} color={color ?? p.ink} size={size} anchor={anchor} />
    </Group>
  );
}
