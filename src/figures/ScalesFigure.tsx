// FIG: bathroom scales cut open under a person's feet. The top plate sinks, the springs squash, the push N on the
// feet grows and the display counts up to N ÷ g. Then the person steps off and it starts again.
// The final squash, N and the reading come from src/physics/dynamics (weight, scaleKg).
// The first time it appears in a lesson it draws itself (floor → case → springs → plate → legs → fills), with nobody
// on the scales; the person steps on once the drawing is done.
import { G as Group, Line, Rect } from 'react-native-svg';
import { scaleKg, weight } from '@/physics/dynamics';
import { fixed } from '@/physics/format';
import type { ScalesFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, useLoopTime, type DrawClock } from './anim';
import { DrawnFade, DrawnPath, DrawnShape, FILLS, ForceArrow, ForceLetter, MonoLabel, rectPath, type Pen } from './draw';

export const SCALES_VB = { w: 340, h: 260 };

const CX = 140;
const BASE = 228; // inside floor of the case
const PLATE_UP = 128; // top of the plate with nobody on it
const SINK = 16; // how far the plate sinks under the person
const N_LEN = 74; // N arrow at full squash

// one cycle: step on (squash), stand, step off, empty
const T_ON = 1.1;
const T_STAND = 2.2;
const T_OFF = 0.6;
const T_EMPTY = 0.7;
const CYCLE = T_ON + T_STAND + T_OFF + T_EMPTY;

// when the pen draws each part, as shares of the draw-in
const PEN = {
  floor: [0, 0.2],
  base: [0.12, 0.26],
  wallL: [0.18, 0.32],
  wallR: [0.24, 0.38],
  springL: [0.3, 0.48],
  springR: [0.34, 0.52],
  plate: [0.46, 0.6],
  legs: [0.52, 0.66],
  leader: [0.56, 0.64],
} as const;

/** 0 = nobody on the scales, 1 = standing still. Eased so the plate settles like a real spring. */
function squashAt(t: number): number {
  const ease = (x: number) => 1 - (1 - x) ** 3;
  if (t < T_ON) return ease(t / T_ON);
  if (t < T_ON + T_STAND) return 1;
  if (t < T_ON + T_STAND + T_OFF) return 1 - ease((t - T_ON - T_STAND) / T_OFF);
  return 0;
}

export function ScalesFigure({ fig, playing, clock = STILL }: { fig: ScalesFig; playing: boolean; clock?: DrawClock }) {
  const { palette: p, soft } = useTheme();
  const drawing = clock.on;
  const t = useLoopTime(playing && !drawing, CYCLE, fig.m, 0);
  // while the drawing draws itself: nobody on the scales yet. Paused or reduced motion: standing still, the answer to "what does it show"
  const k = drawing ? 0 : playing ? squashAt(t) : 1;
  const plate = PLATE_UP + SINK * k;
  const reading = fixed(scaleKg(weight(fig.m) * k), 1);
  const soles = plate - 1;

  // a spring between the plate and the floor of the case, as a zigzag of 7 coils
  const spring = (x: number, pen: Pen) => {
    const top = plate + 10;
    const n = 14;
    const step = (BASE - top) / n;
    let d = `M${x},${top}`;
    for (let i = 1; i < n; i++) d += ` L${x + (i % 2 ? 13 : -13)},${top + i * step}`;
    d += ` L${x},${BASE}`;
    // 2 half-coils of 13 sideways, the rest full coils of 26 sideways, each `step` down
    const len = 2 * Math.hypot(13, step) + (n - 2) * Math.hypot(26, step);
    return <DrawnPath clock={clock} len={len} from={pen[0]} to={pen[1]} d={d} fill="none" stroke={p.draw} strokeWidth={stroke.body} strokeLinejoin="round" />;
  };
  // a filled box with an outline: the outline is drawn by the pen, the fill fades in afterwards
  const box = (x: number, y: number, w: number, h: number, look: { fill: string; edge: string }, pen: Pen, r = 0) => (
    <DrawnShape clock={clock} pen={pen} {...rectPath(x, y, w, h, r)} fill={look.fill} stroke={look.edge} strokeWidth={stroke.body} />
  );

  return (
    <Group>
      {/* the case, cut open at the front */}
      {box(CX - 88, BASE, 176, 10, soft.metal, PEN.base, 4)}
      {box(CX - 88, 136, 10, BASE - 136, soft.metal, PEN.wallL, 4)}
      {box(CX + 78, 136, 10, BASE - 136, soft.metal, PEN.wallR, 4)}
      <DrawnPath clock={clock} len={240} from={PEN.floor[0]} to={PEN.floor[1]} d={`M${CX - 120},${BASE + 10} H${CX + 120}`} stroke={p.ink} strokeWidth={1.8} fill="none" />
      {spring(CX - 42, PEN.springL)}
      {spring(CX + 42, PEN.springR)}
      {/* the top plate the feet stand on */}
      {box(CX - 94, plate, 188, 12, soft.metal, PEN.plate, 6)}
      {/* the lower legs of the person (cut off by the sheet), riding down with the plate */}
      <Group opacity={0.25 + 0.75 * Math.min(1, k * 3)}>
        {box(CX - 30, -14, 24, soles + 14, soft.A, PEN.legs, 12)}
        {box(CX + 6, -14, 24, soles + 14, soft.A, PEN.legs, 12)}
      </Group>
      {/* N: the push of the plate up on the feet */}
      {k > 0.02 && (
        <Group>
          <ForceArrow x1={CX + 52} y1={soles} x2={CX + 52} y2={soles - N_LEN * k} color={p.force} />
          <ForceLetter x={CX + 64} y={soles - N_LEN * k + 16} text="N" color={p.forceText} anchor="start" />
        </Group>
      )}
      {/* labels with leader lines */}
      <DrawnPath clock={clock} len={46} from={PEN.leader[0]} to={PEN.leader[1]} d={`M${CX - 52},196 H${CX - 98}`} stroke={p.label} strokeWidth={stroke.thin} />
      <MonoLabel x={CX - 96} y={199} text="spring" color={p.label} size={9} anchor="end" />
      {/* the display, wired to the plate (dashed wires cannot be traced by the pen: they fade in with the fills) */}
      <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
        <Line x1={CX + 92} y1={plate + 5} x2={262} y2={plate + 5} stroke={p.lineStrong} strokeWidth={stroke.thin} strokeDasharray="3 3" />
        <Line x1={262} y1={plate + 5} x2={262} y2={92} stroke={p.lineStrong} strokeWidth={stroke.thin} strokeDasharray="3 3" />
        <Rect x={222} y={54} width={112} height={42} rx={10} fill={soft.paper} stroke={soft.metal.edge} strokeWidth={1.8} />
        <MonoLabel x={278} y={82} text={`${reading} kg`} color={p.ink} size={19} />
      </DrawnFade>
      <MonoLabel x={278} y={48} text="display" color={p.label} size={9} />
    </Group>
  );
}
