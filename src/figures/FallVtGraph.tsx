// FIG: the v–t graph of a skydiver, on its own. Three curves are drawn for "which graph?": the model of the fall
// (skydiveSamples, src/physics/drag) and two named mistakes — the parachute stops her dead, and a = g until the speed
// suddenly stops changing. All three share the same axes, so only the shape tells them apart.
import { G as Group, Line } from 'react-native-svg';
import { fallVtCurve } from '@/physics/drag';
import type { FallVtFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, type DrawClock } from './anim';
import { DrawnFade, DrawnPath, MonoLabel } from './draw';

export const FALL_VT_VB = { w: 340, h: 220 };

const PLOT = { x: 52, top: 26, w: 258, h: 164 };
const STEP = 0.25; // s between the points of a curve

/** The points (t, v) of the curve of this figure. */
export const fallVtPoints = (fig: FallVtFig) => fallVtCurve(fig.curve, fig.vt, fig.chute, fig.tEnd, STEP);

export function FallVtFigure({ fig, clock = STILL }: { fig: FallVtFig; clock?: DrawClock }) {
  const { palette: p } = useTheme();
  const vMax = Math.ceil((Math.max(fig.vt, fig.chute.vt) * 1.15) / 10) * 10;
  const X = (t: number) => PLOT.x + (t / fig.tEnd) * PLOT.w;
  const Y = (v: number) => PLOT.top + PLOT.h - (v / vMax) * PLOT.h;
  const pts = fallVtPoints(fig);
  const d = `M${pts.map((r) => `${X(r.t).toFixed(1)},${Y(r.v).toFixed(1)}`).join(' L')}`;
  const tTicks: number[] = [];
  for (let k = 5; k <= fig.tEnd + 1e-9; k += 5) tTicks.push(k);
  const vTicks: number[] = [];
  for (let k = 10; k <= vMax + 1e-9; k += 10) vTicks.push(k);
  return (
    <Group>
      <DrawnPath clock={clock} len={PLOT.h + 10} from={0} to={0.3} d={`M${PLOT.x},${PLOT.top + PLOT.h} V${PLOT.top - 8}`} stroke={p.draw} strokeWidth={stroke.body} />
      <DrawnPath clock={clock} len={PLOT.w + 14} from={0.1} to={0.3} d={`M${PLOT.x},${PLOT.top + PLOT.h} H${PLOT.x + PLOT.w + 10}`} stroke={p.draw} strokeWidth={stroke.body} />
      <DrawnFade clock={clock} from={0.25} to={0.4}>
        {tTicks.map((k) => (
          <Group key={`t${k}`}>
            <Line x1={X(k)} y1={Y(0)} x2={X(k)} y2={Y(0) + 5} stroke={p.draw} strokeWidth={stroke.thin} />
            <MonoLabel x={X(k)} y={Y(0) + 17} text={`${k}`} color={p.label} />
          </Group>
        ))}
        {vTicks.map((k) => (
          <Group key={`v${k}`}>
            <Line x1={PLOT.x - 5} y1={Y(k)} x2={PLOT.x} y2={Y(k)} stroke={p.draw} strokeWidth={stroke.thin} />
            <MonoLabel x={PLOT.x - 8} y={Y(k) + 3.5} text={`${k}`} color={p.label} anchor="end" />
          </Group>
        ))}
        <MonoLabel x={PLOT.x + PLOT.w + 10} y={Y(0) + 30} text="t / s" color={p.label} anchor="end" />
        <MonoLabel x={PLOT.x + 6} y={PLOT.top - 6} text="v / m s⁻¹" color={p.label} anchor="start" />
      </DrawnFade>
      <DrawnPath clock={clock} len={900} from={0.4} to={0.9} d={d} fill="none" stroke={p.ink} strokeWidth={stroke.body} strokeLinejoin="round" strokeLinecap="round" />
    </Group>
  );
}
