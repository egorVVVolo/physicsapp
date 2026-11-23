// A ball, flat: `shaded` (a plain ball, one flat fill and an outline), `steel` (a dark disc with a paper highlight),
// `cricket` (pale, with a seam) or `bowling` (dark, three finger holes).
import { Circle, G as Group, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';

export function Ball({ x, y, r, look = 'shaded' }: { x: number; y: number; r: number; look?: 'shaded' | 'steel' | 'cricket' | 'bowling' }) {
  const { palette: p, material: m, stroke } = useTheme();
  if (look === 'shaded') return <Circle cx={x} cy={y} r={r} fill={m.ball} stroke={p.draw} strokeWidth={stroke.body} />;
  if (look === 'steel')
    return (
      <Group>
        <Circle cx={x} cy={y} r={r} fill={p.drawFillDark} stroke={p.draw} strokeWidth={r > 8 ? 1.5 : 1.1} />
        <Path d={`M${x - r * 0.55},${y - r * 0.35} A${r * 0.62},${r * 0.62} 0 0 1 ${x + r * 0.2},${y - r * 0.68}`} stroke={p.paper} strokeWidth={Math.max(1, r * 0.16)} fill="none" strokeLinecap="round" />
      </Group>
    );
  return (
    <Group>
      <Circle cx={x} cy={y} r={r} fill={look === 'bowling' ? p.drawFillDark : p.drawFill} stroke={p.draw} strokeWidth={stroke.body} />
      {look === 'cricket' ? (
        <Path d={`M${x - r * 0.35},${y - r * 0.9} Q${x + r * 0.25},${y} ${x - r * 0.35},${y + r * 0.9}`} fill="none" stroke={p.draw} strokeWidth={stroke.thin} />
      ) : (
        <Group>
          <Circle cx={x - 6} cy={y - 8} r={2.6} fill={p.draw} />
          <Circle cx={x + 2} cy={y - 10} r={2.6} fill={p.draw} />
          <Circle cx={x - 1} cy={y - 1} r={3} fill={p.draw} />
        </Group>
      )}
    </Group>
  );
}
