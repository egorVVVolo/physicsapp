// FIG: velocity against time for cars braking at the same rate. Each car is one straight line from its speed down
// to zero (v = u + at), and the distance it travels is the area of the triangle under its line.
// When one car is twice as fast as the other, its triangle is cut into four copies of the small one,
// each labelled with its area: the braking distance of the slow car (src/physics/kinematics).
// The first graph of a lesson draws itself: the axes, the lines, then the areas.
import { Circle, G as Group, Line, Path } from 'react-native-svg';
import { brakingDistance } from '@/physics/kinematics';
import { fixed } from '@/physics/format';
import type { BrakeVtFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { STILL, type DrawClock } from './anim';
import { DrawnFade, DrawnPath, FILLS, ForceLetter, MonoLabel } from './draw';

export const BRAKE_VT_VB = { w: 340, h: 220 };

const PLOT = { x: 52, y: 186, w: 244, h: 148 }; // origin and the size of the largest triangle
const AXES: readonly [number, number] = [0, 0.36];
const LINES: readonly [number, number] = [0.36, 0.62];
const MARKS: readonly [number, number] = [0.8, 0.95];

export function BrakeVtFigure({ fig, clock = STILL }: { fig: BrakeVtFig; clock?: DrawClock }) {
  const { palette: p } = useTheme();
  const cars = [...fig.cars].sort((m, n) => m.u - n.u); // slowest first
  const fast = cars[cars.length - 1];
  const slow = cars[0];
  const tMax = fast.u / -fig.a;
  const X = (t: number) => PLOT.x + (t / tMax) * PLOT.w;
  const Y = (v: number) => PLOT.y - (v / fast.u) * PLOT.h;
  const tOf = (u: number) => u / -fig.a; // when a car stops
  const tri = (t0: number, v0: number, t1: number, v1: number, t2: number, v2: number) => `M${X(t0)},${Y(v0)} L${X(t1)},${Y(v1)} L${X(t2)},${Y(v2)} Z`;
  // twice the speed: the big triangle is four copies of the small one (cut through the middles of its sides)
  const four = cars.length === 2 && Math.abs(fast.u - 2 * slow.u) < 1e-9;
  const tS = tOf(slow.u);
  const area = `${fixed(brakingDistance(slow.u, fig.a), 1)} m`;
  const ticks: number[] = [];
  for (let t = 1; t <= tMax + 1e-9; t++) ticks.push(t);
  return (
    <Group>
      {/* the areas: the distance each car travels */}
      <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
        <Path d={tri(0, 0, tMax, 0, 0, fast.u)} fill={p.drawFill} />
        {cars.length > 1 && <Path d={tri(0, 0, tS, 0, 0, slow.u)} fill={p.drawFillDark} />}
      </DrawnFade>

      {/* axes: v up the left, t along the bottom */}
      <DrawnPath clock={clock} len={PLOT.h + 16} from={AXES[0]} to={AXES[1]} d={`M${PLOT.x},${PLOT.y} V${PLOT.y - PLOT.h - 16}`} stroke={p.draw} strokeWidth={1.8} fill="none" />
      <DrawnPath clock={clock} len={PLOT.w + 22} from={AXES[0] + 0.08} to={AXES[1]} d={`M${PLOT.x},${PLOT.y} H${PLOT.x + PLOT.w + 22}`} stroke={p.draw} strokeWidth={1.8} fill="none" />
      <DrawnFade clock={clock} from={AXES[1] - 0.1} to={AXES[1] + 0.1}>
        {ticks.map((t) => (
          <Group key={t}>
            <Line x1={X(t)} y1={PLOT.y} x2={X(t)} y2={PLOT.y + 5} stroke={p.draw} strokeWidth={1.4} />
            <MonoLabel x={X(t)} y={PLOT.y + 17} text={fixed(t, 1)} color={p.label} />
          </Group>
        ))}
        {cars.map((c) => (
          <Group key={c.id}>
            <Line x1={PLOT.x - 5} y1={Y(c.u)} x2={PLOT.x} y2={Y(c.u)} stroke={p.draw} strokeWidth={1.4} />
            <MonoLabel x={PLOT.x - 8} y={Y(c.u) + 3.5} text={fixed(c.u, 1)} color={p.label} anchor="end" />
          </Group>
        ))}
        <MonoLabel x={PLOT.x - 8} y={PLOT.y + 3.5} text="0" color={p.label} anchor="end" />
        <MonoLabel x={PLOT.x + PLOT.w + 22} y={PLOT.y + 30} text="t / s" color={p.label} anchor="end" />
        <MonoLabel x={PLOT.x + 8} y={PLOT.y - PLOT.h - 10} text="v / m s⁻¹" color={p.label} anchor="start" />
      </DrawnFade>

      {/* each car: one straight line, gradient a */}
      {[...cars].reverse().map((c, i) => {
        const len = Math.hypot(X(tOf(c.u)) - X(0), Y(0) - Y(c.u));
        return (
          <DrawnPath
            key={c.id}
            clock={clock}
            len={len}
            from={LINES[0] + i * 0.12}
            to={LINES[1] + i * 0.12}
            d={`M${X(0)},${Y(c.u)} L${X(tOf(c.u))},${Y(0)}`}
            stroke={p.ink}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
        );
      })}

      <DrawnFade clock={clock} from={MARKS[0]} to={MARKS[1]}>
        {four && (
          <Group>
            <Path d={`M${X(tS)},${Y(0)} V${Y(slow.u)} H${X(0)}`} fill="none" stroke={p.label} strokeWidth={1.3} strokeDasharray="4 3" />
            {[
              [tS / 3, slow.u / 3],
              [tS + tS / 3, slow.u / 3],
              [tS / 3, slow.u + slow.u / 3],
              [(2 * tS) / 3, (2 * slow.u) / 3],
            ].map(([t, v], i) => (
              <MonoLabel key={i} x={X(t)} y={Y(v) + 3.5} text={area} color={p.ink} size={9.5} />
            ))}
          </Group>
        )}
        {cars.map((c) => (
          <Group key={c.id}>
            <Circle cx={X(0)} cy={Y(c.u)} r={3.6} fill={p.ink} />
            {/* the car's letter, just above its line, a little way along it */}
            <ForceLetter x={X(tOf(c.u) * 0.3) + 7} y={Y(c.u * 0.7) - 5} text={c.id} color={p.ink} size={15} anchor="start" />
          </Group>
        ))}
      </DrawnFade>
    </Group>
  );
}
