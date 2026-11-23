// The axes of a graph: the vertical axis and the time axis (traced by the pen when the figure draws itself),
// ticks with their numbers, and the two axis titles.
import { G as Group, Line } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { STILL, type DrawClock } from '../anim';
import { DrawnFade, DrawnPath, MonoLabel, type Pen } from '../draw';

type Title = { x: number; y: number; text: string; anchor: 'start' | 'end' };

type Props = {
  /** Where the vertical axis stands. */
  x0: number;
  /** Where the horizontal axis runs (zero on the vertical scale). */
  y0: number;
  /** The horizontal axis runs to here; the vertical one from `yBottom` (defaults to y0) up to `yTop`. */
  xEnd: number;
  yTop: number;
  yBottom?: number;
  xTicks: { x: number; label: string }[];
  /** Where the time numbers go (defaults to 17 under the axis). */
  xLabelY?: number;
  yTicks?: { y: number; label: string }[];
  xTitle: Title;
  yTitle: Title;
  clock?: DrawClock;
  /** The pen draws the vertical axis over this stretch, the horizontal one a little later; ticks fade in at its end. */
  pen?: Pen;
};

export function Axes({ x0, y0, xEnd, yTop, yBottom = y0, xTicks, xLabelY = y0 + 17, yTicks = [], xTitle, yTitle, clock = STILL, pen = [0, 1] }: Props) {
  const { palette: p } = useTheme();
  return (
    <Group>
      <DrawnPath clock={clock} len={yBottom - yTop} from={pen[0]} to={pen[1]} d={`M${x0},${yBottom} V${yTop}`} stroke={p.draw} strokeWidth={1.8} fill="none" />
      <DrawnPath clock={clock} len={xEnd - x0} from={pen[0] + 0.08} to={pen[1]} d={`M${x0},${y0} H${xEnd}`} stroke={p.draw} strokeWidth={1.8} fill="none" />
      <DrawnFade clock={clock} from={pen[1] - 0.1} to={pen[1] + 0.1}>
        {xTicks.map((t) => (
          <Group key={t.x}>
            <Line x1={t.x} y1={y0} x2={t.x} y2={y0 + 5} stroke={p.draw} strokeWidth={1.4} />
            <MonoLabel x={t.x} y={xLabelY} text={t.label} color={p.label} />
          </Group>
        ))}
        {yTicks.map((t) => (
          <Group key={t.y}>
            <Line x1={x0 - 5} y1={t.y} x2={x0} y2={t.y} stroke={p.draw} strokeWidth={1.4} />
            <MonoLabel x={x0 - 8} y={t.y + 3.5} text={t.label} color={p.label} anchor="end" />
          </Group>
        ))}
        <MonoLabel x={xTitle.x} y={xTitle.y} text={xTitle.text} color={p.label} anchor={xTitle.anchor} />
        <MonoLabel x={yTitle.x} y={yTitle.y} text={yTitle.text} color={p.label} anchor={yTitle.anchor} />
      </DrawnFade>
    </Group>
  );
}
