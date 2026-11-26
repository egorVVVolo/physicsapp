// Label–value rows like a lab notebook: the name on the left, the value on the right, a hairline under each.
// When a name and its value do not fit side by side (labels grow to stay readable), the value drops under its name.
import { useContext } from 'react';
import { G as Group, Line } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { MonoLabel, SheetClean, useMonoSize } from '../draw';

export type Row = [name: string, value: string, color?: string, strong?: boolean];

/** `x`–`right`: the panel's edges; `y0`: the first row's text line; `step`: one row; `note`: a line under the last row. */
export function Rows({ rows, x, right, y0, step, note }: { rows: Row[]; x: number; right: number; y0: number; step: number; note?: { text: string; color: string } }) {
  const { palette: p } = useTheme();
  const nameSize = useMonoSize(8.5);
  const valueSize = useMonoSize(10);
  // how wide a character is, in sizes: the style-3 face is narrower than the mono one
  const wide = useContext(SheetClean) ? 0.54 : 0.64;
  let y = y0;
  const placed = rows.map(([name, value, color, strong]) => {
    const fits = name.length * nameSize * wide + value.length * valueSize * wide + 8 <= right - x;
    const at = { name, value, color, strong, y, vy: fits ? y : y + valueSize * 1.2 };
    y = at.vy + step;
    return at;
  });
  return (
    <Group>
      {placed.map((r) => (
        <Group key={r.name}>
          <MonoLabel x={x} y={r.y} text={r.name} color={p.label} size={8.5} anchor="start" />
          <MonoLabel x={right} y={r.vy} text={r.value} color={r.color ?? p.ink} size={r.strong ? 11 : 10} anchor="end" />
          <Line x1={x} y1={r.vy + 7} x2={right} y2={r.vy + 7} stroke={p.paperLine} strokeWidth={stroke.hair} />
        </Group>
      ))}
      {note && <MonoLabel x={x} y={y - step + 6 + valueSize * 1.3} text={note.text} color={note.color} size={8.5} anchor="start" />}
    </Group>
  );
}
