// A mono label on a patch of drawing paper, so a line behind it never runs through the text.
import { G as Group, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { MonoLabel, useMonoSize } from '../draw';

export function Tag({ x, y, text, color, size = 9, anchor = 'middle' }: { x: number; y: number; text: string; color?: string; size?: number; anchor?: 'start' | 'middle' | 'end' }) {
  const { palette: p } = useTheme();
  const shown = useMonoSize(size); // the patch fits the text as it is drawn
  const w = text.length * shown * 0.66 + 8;
  const left = anchor === 'start' ? x - 4 : anchor === 'end' ? x - w + 4 : x - w / 2;
  return (
    <Group>
      <Rect x={left} y={y - shown} width={w} height={shown + 4} rx={2} fill={p.paper} />
      <MonoLabel x={x} y={y} text={text} color={color ?? p.ink} size={size} anchor={anchor} />
    </Group>
  );
}
