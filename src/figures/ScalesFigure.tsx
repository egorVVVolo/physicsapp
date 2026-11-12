// FIG: bathroom scales cut open under a person's feet. The top plate sinks, the springs squash, the push N on the
// feet grows and the display counts up to N ÷ g. Then the person steps off and it starts again.
// The final squash, N and the reading come from src/physics/dynamics (weight, scaleKg).
import { G as Group, Line, Path, Rect } from 'react-native-svg';
import { scaleKg, weight } from '@/physics/dynamics';
import { fixed } from '@/physics/format';
import type { ScalesFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { useLoopTime } from './anim';
import { ForceArrow, ForceLetter, Hatch, MonoLabel } from './draw';

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

/** 0 = nobody on the scales, 1 = standing still. Eased so the plate settles like a real spring. */
function squashAt(t: number): number {
  const ease = (x: number) => 1 - (1 - x) ** 3;
  if (t < T_ON) return ease(t / T_ON);
  if (t < T_ON + T_STAND) return 1;
  if (t < T_ON + T_STAND + T_OFF) return 1 - ease((t - T_ON - T_STAND) / T_OFF);
  return 0;
}

export function ScalesFigure({ fig, playing }: { fig: ScalesFig; playing: boolean }) {
  const { palette: p } = useTheme();
  const t = useLoopTime(playing, CYCLE, fig.m, 0);
  const k = playing ? squashAt(t) : 1; // paused or reduced motion: standing still, the answer to "what does it show"
  const plate = PLATE_UP + SINK * k;
  const reading = fixed(scaleKg(weight(fig.m) * k), 1);
  const soles = plate - 1;

  // a spring between the plate and the floor of the case, as a zigzag of 7 coils
  const spring = (x: number) => {
    const top = plate + 10;
    const n = 14;
    const step = (BASE - top) / n;
    let d = `M${x},${top}`;
    for (let i = 1; i < n; i++) d += ` L${x + (i % 2 ? 13 : -13)},${top + i * step}`;
    d += ` L${x},${BASE}`;
    return <Path d={d} fill="none" stroke={p.draw} strokeWidth={2.2} strokeLinejoin="round" />;
  };

  return (
    <Group>
      {/* the case, cut open at the front */}
      <Rect x={CX - 88} y={BASE} width={176} height={8} fill={p.scalesFront} stroke={p.draw} strokeWidth={1.8} />
      <Rect x={CX - 88} y={136} width={8} height={BASE - 136} fill={p.scalesFront} stroke={p.draw} strokeWidth={1.8} />
      <Rect x={CX + 80} y={136} width={8} height={BASE - 136} fill={p.scalesFront} stroke={p.draw} strokeWidth={1.8} />
      <Hatch x1={CX - 110} x2={CX + 110} y={BASE + 8} color={p.draw} />
      {spring(CX - 42)}
      {spring(CX + 42)}
      {/* the top plate the feet stand on */}
      <Rect x={CX - 92} y={plate} width={184} height={10} rx={2} fill={p.scalesTop} stroke={p.draw} strokeWidth={1.8} />
      {/* the lower legs and shoes of the person (cut off by the sheet), riding down with the plate */}
      <Group opacity={0.25 + 0.75 * Math.min(1, k * 3)}>
        <Rect x={CX - 26} y={-2} width={20} height={soles - 9} fill={p.trousers} stroke={p.draw} strokeWidth={1.8} />
        <Rect x={CX + 6} y={-2} width={20} height={soles - 9} fill={p.trousers} stroke={p.draw} strokeWidth={1.8} />
        <Rect x={CX - 32} y={soles - 12} width={28} height={12} rx={6} fill={p.shoe} />
        <Rect x={CX + 4} y={soles - 12} width={28} height={12} rx={6} fill={p.shoe} />
      </Group>
      {/* N: the push of the plate up on the feet */}
      {k > 0.02 && (
        <Group>
          <ForceArrow x1={CX + 52} y1={soles} x2={CX + 52} y2={soles - N_LEN * k} color={p.force} />
          <ForceLetter x={CX + 64} y={soles - N_LEN * k + 16} text="N" color={p.forceText} anchor="start" />
        </Group>
      )}
      {/* labels with leader lines */}
      <Line x1={CX - 52} y1={196} x2={CX - 98} y2={196} stroke={p.label} strokeWidth={1} />
      <MonoLabel x={CX - 101} y={199} text="SPRING" color={p.label} size={9} anchor="end" />
      {/* the display, wired to the plate */}
      <Line x1={CX + 92} y1={plate + 5} x2={262} y2={plate + 5} stroke={p.lineStrong} strokeWidth={1.2} strokeDasharray="3 3" />
      <Line x1={262} y1={plate + 5} x2={262} y2={92} stroke={p.lineStrong} strokeWidth={1.2} strokeDasharray="3 3" />
      <Rect x={226} y={56} width={104} height={36} rx={6} fill={p.ink} />
      <MonoLabel x={278} y={80} text={`${reading} kg`} color="#FFFFFF" size={15} />
      <MonoLabel x={278} y={48} text="DISPLAY" color={p.label} size={9} />
    </Group>
  );
}
