// FIG: vectors added tip to tail on squared paper (north up when there is a compass). Each leg starts where the one before it ends; the
// resultant runs from the first tail to the last tip. Its size and the angle from the first leg come from
// src/physics/vectors (Pythagoras and tan θ), so the numbers written on the sheet are the model's.
// The drawing is fitted to the sheet: one square of paper is `grid` of the figure's unit.
// The first vectors figure of a lesson draws itself: paper → the legs one by one → the resultant → the labels.
import { Circle, G as Group, Line, Path } from 'react-native-svg';
import { angleFromFirst, sizeAtRightAngles } from '@/physics/vectors';
import { fixed } from '@/physics/format';
import type { VectorsFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { STILL, type DrawClock } from './anim';
import { DrawnFade, ForceArrow, ForceLetter, MonoLabel } from './draw';
import { Tag } from './kit';

export const VECTORS_VB = { w: 340, h: 230 };

// the area the drawing is fitted into
const AL = 52;
const AR = 316;
const AT = 24;
const AB = 206;
const ARC_R = 30;

/** The size of the resultant and its angle from the first leg, from the model. */
export function vectorsResult(fig: VectorsFig): { size: number; angle: number } {
  const east = fig.legs.reduce((sum, leg) => sum + leg.east, 0);
  const north = fig.legs.reduce((sum, leg) => sum + leg.north, 0);
  const first = fig.legs[0];
  // the part of the resultant along the first leg, and the part across it
  const len = Math.hypot(first.east, first.north);
  const along = (east * first.east + north * first.north) / len;
  const across = (north * first.east - east * first.north) / len;
  return { size: sizeAtRightAngles(east, north), angle: angleFromFirst(along, across) };
}

export function VectorsFigure({ fig, clock = STILL }: { fig: VectorsFig; clock?: DrawClock }) {
  const { palette: p } = useTheme();
  // the corners of the path, in the figure's unit: the start, then the tip of each leg
  const pts: [number, number][] = [[0, 0]];
  for (const leg of fig.legs) {
    const [e, n] = pts[pts.length - 1];
    pts.push([e + leg.east, n + leg.north]);
  }
  const es = pts.map((q) => q[0]);
  const ns = pts.map((q) => q[1]);
  const [eMin, eMax, nMin, nMax] = [Math.min(...es), Math.max(...es), Math.min(...ns), Math.max(...ns)];
  const k = Math.min((AR - AL) / Math.max(eMax - eMin, 1e-6), (AB - AT) / Math.max(nMax - nMin, 1e-6));
  // centre the drawing in its area
  const ox = (AL + AR) / 2 - ((eMin + eMax) / 2) * k;
  const oy = (AT + AB) / 2 + ((nMin + nMax) / 2) * k;
  const P = ([e, n]: [number, number]): [number, number] => [ox + e * k, oy - n * k];
  const screen = pts.map(P);
  const [cx, cy] = [screen.reduce((s, q) => s + q[0], 0) / screen.length, screen.reduce((s, q) => s + q[1], 0) / screen.length];
  const result = vectorsResult(fig);
  const start = screen[0];
  const end = screen[screen.length - 1];

  // squared paper over the whole sheet, lined up with the start
  const step = fig.grid * k;
  const xs: number[] = [];
  for (let x = ox - Math.floor((ox - 4) / step) * step; x <= 336; x += step) xs.push(x);
  const ys: number[] = [];
  for (let y = oy - Math.floor((oy - 4) / step) * step; y <= 226; y += step) ys.push(y);

  /** A label beside the segment from a to b, pushed away from (or towards) the middle of the drawing. */
  const beside = (a: [number, number], b: [number, number], away: boolean, text: string): [number, number] => {
    const [mx, my] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    let [nx, ny] = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
    const outward = (mx - cx) * nx + (my - cy) * ny > 0;
    if (outward !== away) [nx, ny] = [-nx, -ny];
    // clear of the line: half the tag's width sideways, half its height up or down (a Tag is text × 5.4 + 8 wide, 13 high)
    const gap = 8 + Math.abs(nx) * ((text.length * 5.4 + 8) / 2) + Math.abs(ny) * 7;
    return [mx + nx * gap, my + ny * gap + 3];
  };

  const legs = fig.legs.map((leg, i) => ({ leg, a: screen[i], b: screen[i + 1] }));
  const resLabel = fig.resultant === 'shown' ? `${fixed(result.size, 1)} ${fig.unit}` : '?';
  const resAt = beside(start, end, true, resLabel);

  // the angle arc at the start, from the first leg round to the resultant
  const u1 = norm(screen[1][0] - start[0], screen[1][1] - start[1]);
  const uR = norm(end[0] - start[0], end[1] - start[1]);
  const sweep = u1[0] * uR[1] - u1[1] * uR[0] > 0 ? 1 : 0;
  const arc = `M${start[0] + u1[0] * ARC_R},${start[1] + u1[1] * ARC_R} A${ARC_R},${ARC_R} 0 0 ${sweep} ${start[0] + uR[0] * ARC_R},${start[1] + uR[1] * ARC_R}`;
  const bis = norm(u1[0] + uR[0], u1[1] + uR[1]);
  const angleText = fig.angle === 'shown' ? `${fixed(result.angle, 0)}°` : 'θ = ?';

  return (
    <Group>
      <DrawnFade clock={clock} from={0} to={0.3}>
        {xs.map((x) => (
          <Line key={`x${x}`} x1={x} y1={4} x2={x} y2={226} stroke={p.paperLine} strokeWidth={0.8} />
        ))}
        {ys.map((y) => (
          <Line key={`y${y}`} x1={4} y1={y} x2={336} y2={y} stroke={p.paperLine} strokeWidth={0.8} />
        ))}
        {/* north is up */}
        {fig.compass && (
          <Group>
            <Path d="M22,50 V22" stroke={p.draw} strokeWidth={1.6} />
            <Path d="M17,29 L22,19 L27,29 Z" fill={p.draw} />
            <ForceLetter x={22} y={64} text="N" color={p.ink} size={12} />
          </Group>
        )}
        <MonoLabel x={332} y={222} text={`GRID ${fixed(fig.grid, fig.grid < 1 ? 1 : 0)} ${fig.unit}`} color={p.label} size={8} anchor="end" />
      </DrawnFade>

      {legs.map(({ a, b }, i) => (
        <DrawnFade key={i} clock={clock} from={0.3 + i * 0.16} to={0.46 + i * 0.16}>
          <ForceArrow x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} color={p.draw} width={2.4} />
        </DrawnFade>
      ))}

      <DrawnFade clock={clock} from={0.66} to={0.82}>
        <ForceArrow x1={start[0]} y1={start[1]} x2={end[0]} y2={end[1]} color={p.ink} width={3.2} dashed={fig.resultant !== 'shown'} />
        {fig.angle !== undefined && <Path d={arc} fill="none" stroke={p.label} strokeWidth={1.3} />}
      </DrawnFade>

      <DrawnFade clock={clock} from={0.8} to={0.95}>
        <Circle cx={start[0]} cy={start[1]} r={3.5} fill={p.ink} />
        {legs.map(({ leg, a, b }, i) => {
          const [x, y] = beside(a, b, true, leg.label);
          return <Tag key={i} x={x} y={y} text={leg.label} />;
        })}
        <Tag x={resAt[0]} y={resAt[1]} text={resLabel} />
        {fig.angle !== undefined && <Tag x={start[0] + bis[0] * (ARC_R + 16)} y={start[1] + bis[1] * (ARC_R + 16) + 3} text={angleText} />}
      </DrawnFade>
    </Group>
  );
}

function norm(x: number, y: number): [number, number] {
  const len = Math.hypot(x, y) || 1;
  return [x / len, y / len];
}
