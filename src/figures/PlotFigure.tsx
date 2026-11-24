// FIG: one curve on plain axes, alone (for "which graph?"). The points come from the lesson, computed with src/physics;
// the three graphs of one question share their axes, so only the shape tells them apart.
import { G as Group } from 'react-native-svg';
import type { PlotFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, type DrawClock } from './anim';
import { DrawnPath } from './draw';
import { Axes } from './kit';

export const PLOT_VB = { w: 340, h: 220 };

const BOX = { x: 52, top: 26, w: 258, h: 164 };

export function PlotFigure({ fig, clock = STILL }: { fig: PlotFig; clock?: DrawClock }) {
  const { palette: p } = useTheme();
  const X = (v: number) => BOX.x + (v / fig.x.max) * BOX.w;
  const Y = (v: number) => BOX.top + BOX.h - (v / fig.y.max) * BOX.h;
  const d = `M${fig.points.map((r) => `${X(r.x).toFixed(1)},${Y(r.y).toFixed(1)}`).join(' L')}`;
  const xTicks: { x: number; label: string }[] = [];
  for (let k = fig.x.tick; k <= fig.x.max + 1e-9; k += fig.x.tick) xTicks.push({ x: X(k), label: `${+k.toFixed(6)}` });
  const yTicks: { y: number; label: string }[] = [];
  for (let k = fig.y.tick; k <= fig.y.max + 1e-9; k += fig.y.tick) yTicks.push({ y: Y(k), label: `${+k.toFixed(6)}` });
  return (
    <Group>
      <Axes
        x0={BOX.x}
        y0={BOX.top + BOX.h}
        xEnd={BOX.x + BOX.w + 10}
        yTop={BOX.top - 8}
        xTicks={xTicks}
        yTicks={yTicks}
        xTitle={{ x: BOX.x + BOX.w + 10, y: BOX.top + BOX.h + 30, text: fig.x.label, anchor: 'end' }}
        yTitle={{ x: BOX.x + 6, y: BOX.top - 6, text: fig.y.label, anchor: 'start' }}
        clock={clock}
        pen={[0, 0.3]}
      />
      <DrawnPath clock={clock} len={900} from={0.4} to={0.9} d={d} fill="none" stroke={p.ink} strokeWidth={stroke.body} strokeLinejoin="round" strokeLinecap="round" />
    </Group>
  );
}
