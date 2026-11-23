// Two graphs for "Up, stop, down", both drawn from the model so they always match the content:
// · ThrowVtFigure — v against t for a ball thrown up at u: one straight line (v = u − gt) through v = 0 at the top.
// · FallGraphFigure — Core Practical 1: h against t² for a ball dropped from rest, a straight line of gradient g/2.
// Both draw themselves the first time they appear: the axes, then the line.
import { Circle, G as Group, Line, Path } from 'react-native-svg';
import { G, velocity } from '@/physics/kinematics';
import { fixed, signed } from '@/physics/format';
import type { FallGraphFig, ThrowVtFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, type DrawClock } from './anim';
import { DrawnFade, DrawnPath, MonoLabel } from './draw';

export const THROW_VT_VB = { w: 340, h: 220 };
export const FALL_VB = { w: 340, h: 220 };

const AXES: readonly [number, number] = [0, 0.4];
const LINE: readonly [number, number] = [0.42, 0.85];
const MARKS: readonly [number, number] = [0.8, 0.95];

// ── v against t ─────────────────────────────────────────────────────────────────────────────

const VT = { x: 52, top: 26, w: 260, h: 160 }; // plot area; v = 0 runs through the middle

export function ThrowVtFigure({ fig, clock = STILL }: { fig: ThrowVtFig; clock?: DrawClock }) {
  const { palette: p } = useTheme();
  const m = { s0: 0, u: fig.u, a: -G };
  const vMax = fig.u * 1.25;
  const X = (t: number) => VT.x + (t / fig.tEnd) * VT.w * 0.92;
  const Y = (v: number) => VT.top + VT.h / 2 - (v / vMax) * (VT.h / 2);
  const tTop = fig.u / G;
  const vEnd = velocity(fig.tEnd, m);
  const ticks: number[] = [];
  for (let t = 0.4; t < fig.tEnd + 1e-9; t += 0.4) ticks.push(Number(t.toFixed(1)));
  const x2 = X(fig.tEnd);
  const lineLen = Math.hypot(x2 - X(0), Y(vEnd) - Y(fig.u));
  return (
    <Group>
      {/* axes: v up the left, t along v = 0 */}
      <DrawnPath clock={clock} len={VT.h + 8} from={AXES[0]} to={AXES[1]} d={`M${VT.x},${VT.top + VT.h} V${VT.top - 8}`} stroke={p.draw} strokeWidth={stroke.body} />
      <DrawnPath clock={clock} len={VT.w + 10} from={AXES[0] + 0.1} to={AXES[1]} d={`M${VT.x},${Y(0)} H${VT.x + VT.w + 10}`} stroke={p.draw} strokeWidth={stroke.body} />
      <DrawnFade clock={clock} from={AXES[1] - 0.1} to={AXES[1] + 0.1}>
        {ticks.map((t) => (
          <Group key={t}>
            <Line x1={X(t)} y1={Y(0)} x2={X(t)} y2={Y(0) + 5} stroke={p.draw} strokeWidth={stroke.thin} />
            <MonoLabel x={X(t)} y={Y(0) + 17} text={fixed(t, 1)} color={p.label} />
          </Group>
        ))}
        {[fig.u, -fig.u].map((v) => (
          <Group key={v}>
            <Line x1={VT.x - 5} y1={Y(v)} x2={VT.x} y2={Y(v)} stroke={p.draw} strokeWidth={stroke.thin} />
            <Line x1={VT.x} y1={Y(v)} x2={VT.x + VT.w} y2={Y(v)} stroke={p.lineStrong} strokeWidth={stroke.thin} strokeDasharray="2 4" />
            <MonoLabel x={VT.x - 8} y={Y(v) + 3.5} text={signed(v, 1)} color={p.label} anchor="end" />
          </Group>
        ))}
        <MonoLabel x={VT.x - 8} y={Y(0) + 3.5} text="0" color={p.label} anchor="end" />
        <MonoLabel x={VT.x + VT.w + 10} y={Y(0) - 8} text="t / s" color={p.label} anchor="end" />
        <MonoLabel x={VT.x + 6} y={VT.top - 4} text="v / m s⁻¹" color={p.label} anchor="start" />
      </DrawnFade>
      {/* the flight: one straight line, gradient −g */}
      <DrawnPath clock={clock} len={lineLen} from={LINE[0]} to={LINE[1]} d={`M${X(0)},${Y(fig.u)} L${x2},${Y(vEnd)}`} stroke={p.ink} strokeWidth={stroke.force} strokeLinecap="round" />
      {/* the top: v = 0 for an instant, the line goes straight through */}
      <DrawnFade clock={clock} from={MARKS[0]} to={MARKS[1]}>
        <Circle cx={X(tTop)} cy={Y(0)} r={4.5} fill={p.page} stroke={p.ink} strokeWidth={stroke.body} />
        <MonoLabel x={X(tTop) + 8} y={Y(0) - 10} text="TOP: v = 0" color={p.ink} size={9.5} anchor="start" />
        {/* between the line and the axis: above it the ball moves up, below it the ball moves down */}
        <MonoLabel x={X(fig.tEnd * 0.05)} y={Y(0) - 8} text="MOVING UP" color={p.label} size={9} anchor="start" />
        <MonoLabel x={x2 - 14} y={Y(vEnd) + 14} text="MOVING DOWN" color={p.label} size={9} anchor="end" />
      </DrawnFade>
    </Group>
  );
}

// ── h against t² (Core Practical 1) ─────────────────────────────────────────────────────────

const FG = { x: 52, top: 22, w: 262, h: 160 };
const H_MAX = 1.2; // m
const T2_MAX = 0.26; // s²
/** The heights the student dropped the ball from, m. */
const HEIGHTS = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2];
/**
 * Small scatter in each measured t², s², as in a real experiment. It sums to zero, so the best-fit line
 * through the origin keeps (very nearly) the gradient the question gives.
 */
const SCATTER = [0.002, -0.003, 0.003, -0.002, 0.002, -0.002];

export function FallGraphFigure({ fig, clock = STILL }: { fig: FallGraphFig; clock?: DrawClock }) {
  const { palette: p, material: m } = useTheme();
  const X = (t2: number) => FG.x + (t2 / T2_MAX) * FG.w;
  const Y = (h: number) => FG.top + FG.h - (h / H_MAX) * FG.h;
  const t2End = Math.min(T2_MAX, (H_MAX * 1.04) / fig.gradient);
  const lineLen = Math.hypot(X(t2End) - X(0), Y(fig.gradient * t2End) - Y(0));
  // the gradient triangle, between two points on the line
  const a = 0.06;
  const b = 0.2;
  const tri = `M${X(a)},${Y(fig.gradient * a)} H${X(b)} V${Y(fig.gradient * b)}`;
  return (
    <Group>
      <DrawnPath clock={clock} len={FG.h + 8} from={AXES[0]} to={AXES[1]} d={`M${FG.x},${FG.top + FG.h} V${FG.top - 8}`} stroke={p.draw} strokeWidth={stroke.body} />
      <DrawnPath clock={clock} len={FG.w + 8} from={AXES[0] + 0.1} to={AXES[1]} d={`M${FG.x},${FG.top + FG.h} H${FG.x + FG.w + 8}`} stroke={p.draw} strokeWidth={stroke.body} />
      <DrawnFade clock={clock} from={AXES[1] - 0.1} to={AXES[1] + 0.1}>
        {[0.05, 0.1, 0.15, 0.2, 0.25].map((t2) => (
          <Group key={t2}>
            <Line x1={X(t2)} y1={FG.top + FG.h} x2={X(t2)} y2={FG.top + FG.h + 5} stroke={p.draw} strokeWidth={stroke.thin} />
            <MonoLabel x={X(t2)} y={FG.top + FG.h + 17} text={fixed(t2, 2)} color={p.label} />
          </Group>
        ))}
        {[0.4, 0.8, 1.2].map((h) => (
          <Group key={h}>
            <Line x1={FG.x - 5} y1={Y(h)} x2={FG.x} y2={Y(h)} stroke={p.draw} strokeWidth={stroke.thin} />
            <MonoLabel x={FG.x - 8} y={Y(h) + 3.5} text={fixed(h, 1)} color={p.label} anchor="end" />
          </Group>
        ))}
        <MonoLabel x={FG.x - 8} y={FG.top + FG.h + 3.5} text="0" color={p.label} anchor="end" />
        <MonoLabel x={FG.x + FG.w + 8} y={FG.top + FG.h + 32} text="t² / s²" color={p.label} anchor="end" />
        <MonoLabel x={FG.x + 6} y={FG.top - 2} text="h / m" color={p.label} anchor="start" />
        {/* the measurements, as crosses */}
        {HEIGHTS.map((h, i) => {
          const cx = X(h / fig.gradient + SCATTER[i]);
          const cy = Y(h);
          return <Path key={h} d={`M${cx - 4},${cy - 4} L${cx + 4},${cy + 4} M${cx - 4},${cy + 4} L${cx + 4},${cy - 4}`} stroke={p.draw} strokeWidth={stroke.body} />;
        })}
      </DrawnFade>
      {/* best-fit line through the origin */}
      <DrawnPath clock={clock} len={lineLen} from={LINE[0]} to={LINE[1]} d={`M${X(0)},${Y(0)} L${X(t2End)},${Y(fig.gradient * t2End)}`} stroke={p.ink} strokeWidth={stroke.force} strokeLinecap="round" />
      <DrawnFade clock={clock} from={MARKS[0]} to={MARKS[1]}>
        <Path d={tri} fill="none" stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="4 3" />
        <MonoLabel x={(X(a) + X(b)) / 2} y={Y(fig.gradient * a) + 14} text="Δt²" color={p.label} size={9.5} />
        <MonoLabel x={X(b) + 6} y={(Y(fig.gradient * a) + Y(fig.gradient * b)) / 2 + 3} text="Δh" color={p.label} size={9.5} anchor="start" />
      </DrawnFade>
    </Group>
  );
}
