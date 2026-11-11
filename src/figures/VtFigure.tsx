// FIG: velocity–time graph of a lift trip, split into lettered parts of constant acceleration.
// The line is built from the phases (v = u + at), so it always matches the content.
import { G as Group, Line, Polyline, Rect } from 'react-native-svg';
import type { VtFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { ForceLetter, MonoLabel } from './draw';
import type { TapProps, TapTarget } from './Sheet';

export const VT_VB = { w: 340, h: 220 };
const O = { x: 46, y: 176 }; // origin
const PLOT_W = 270;
const PLOT_H = 130;

function layout(fig: VtFig) {
  const total = fig.phases.reduce((s, ph) => s + ph.dt, 0);
  let t = 0;
  let v = 0;
  const pts = [{ t: 0, v: 0 }];
  for (const ph of fig.phases) {
    t += ph.dt;
    v += ph.a * ph.dt;
    pts.push({ t, v });
  }
  const vMax = Math.max(...pts.map((q) => q.v), 0.1);
  const X = (tt: number) => O.x + (tt / total) * PLOT_W;
  const Y = (vv: number) => O.y - (vv / vMax) * PLOT_H;
  return { total, pts, X, Y };
}

export function vtTargets(fig: VtFig): TapTarget[] {
  const { pts, X } = layout(fig);
  return fig.phases.map((ph, i) => ({ id: ph.id, x: X(pts[i].t), y: O.y - PLOT_H - 26, w: X(pts[i + 1].t) - X(pts[i].t), h: PLOT_H + 26, label: `Part ${ph.id}` }));
}

export function VtFigure({ fig, tap }: { fig: VtFig; tap?: TapProps }) {
  const { palette: p } = useTheme();
  const { total, pts, X, Y } = layout(fig);
  const ticks: number[] = [];
  for (let t = 0; t <= total; t += 2) ticks.push(t);
  return (
    <Group>
      {fig.phases.map((ph, i) => {
        const m = tap?.marks?.[ph.id];
        const on = tap?.selected === ph.id;
        const fill = m === 'right' ? p.okBg : m === 'wrong' ? p.badBg : on ? '#FFFFFF' : 'none';
        const x1 = X(pts[i].t);
        const x2 = X(pts[i + 1].t);
        return (
          <Group key={ph.id}>
            <Rect x={x1 + 1} y={O.y - PLOT_H - 24} width={x2 - x1 - 2} height={PLOT_H + 24} rx={6} fill={fill} stroke={on || m ? (m === 'right' ? p.ok : m === 'wrong' ? p.bad : p.ink) : 'none'} strokeWidth={2} />
            <ForceLetter x={(x1 + x2) / 2} y={O.y - PLOT_H - 6} text={ph.id} color={p.ink} size={16} />
            {i > 0 && <Line x1={x1} y1={O.y} x2={x1} y2={O.y - PLOT_H - 24} stroke={p.lineStrong} strokeWidth={1} strokeDasharray="3 4" />}
          </Group>
        );
      })}
      {/* axes */}
      <Line x1={O.x} y1={O.y} x2={O.x + PLOT_W + 8} y2={O.y} stroke={p.draw} strokeWidth={1.8} />
      <Line x1={O.x} y1={O.y} x2={O.x} y2={O.y - PLOT_H - 26} stroke={p.draw} strokeWidth={1.8} />
      {ticks.map((t) => (
        <Group key={t}>
          <Line x1={X(t)} y1={O.y} x2={X(t)} y2={O.y + 5} stroke={p.draw} strokeWidth={1.4} />
          <MonoLabel x={X(t)} y={O.y + 17} text={String(t)} color={p.label} />
        </Group>
      ))}
      <MonoLabel x={O.x + PLOT_W + 4} y={O.y + 32} text="t / s" color={p.label} anchor="end" />
      <MonoLabel x={O.x - 6} y={O.y - PLOT_H - 30} text="v / m s⁻¹" color={p.label} anchor="start" />
      <Polyline points={pts.map((q) => `${X(q.t)},${Y(q.v)}`).join(' ')} fill="none" stroke={p.ink} strokeWidth={3} strokeLinejoin="round" />
    </Group>
  );
}
