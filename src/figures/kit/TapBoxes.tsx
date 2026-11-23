// Dashed boxes round the tap targets of a figure; the chosen one turns soft blue, a checked one green or red.
import { G as Group, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import type { TapProps, TapTarget } from '../Sheet';

export function TapBoxes({ targets, tap }: { targets: TapTarget[]; tap?: TapProps }) {
  const { palette: p } = useTheme();
  return (
    <Group>
      {targets.map((t) => {
        const mark = tap?.marks?.[t.id];
        const on = tap?.selected === t.id;
        const color = mark === 'right' ? p.ok : mark === 'wrong' ? p.bad : on ? p.select : p.lineStrong;
        const bg = mark === 'right' ? p.okBg : mark === 'wrong' ? p.badBg : on ? p.selectBg : 'none';
        return (
          <Rect
            key={t.id}
            x={t.x + 2}
            y={t.y + 2}
            width={t.w - 4}
            height={t.h - 4}
            rx={9}
            fill={bg}
            stroke={color}
            strokeWidth={on || mark ? 2 : 1.2}
            strokeDasharray={on || mark ? undefined : '4 3'}
          />
        );
      })}
    </Group>
  );
}
