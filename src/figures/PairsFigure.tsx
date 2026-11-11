// FIG: the person lifted off the scales ("exploded" view) to show which object each force acts on.
// N and W act on the person, P (the person's push) on the scales, E (the person's pull) on the Earth.
import { G as Group, Circle, Path, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { CgMark, ForceArrow, ForceLetter, Hatch, MonoLabel } from './draw';
import type { TapProps, TapTarget } from './Sheet';

export const PAIRS_VB = { w: 340, h: 270 };
const L = 50; // every arrow has the same length: the lift is at rest, and pairs are equal

// Where each force is drawn: start point, direction (+1 down, −1 up), letter side.
const F = {
  W: { x: 110, y: 104, dir: 1, side: 'end' as const }, // on the person, from the centre of gravity, down (between the legs)
  N: { x: 138, y: 168, dir: -1, side: 'start' as const }, // on the person, at the feet, up (beside the body)
  P: { x: 110, y: 194, dir: 1, side: 'start' as const }, // on the scales, at the top, down
  E: { x: 272, y: 262, dir: -1, side: 'start' as const }, // on the Earth, up
};

export function pairsTargets(): TapTarget[] {
  const box = (id: 'W' | 'P' | 'E', label: string) => {
    const f = F[id];
    const top = f.dir > 0 ? f.y : f.y - L;
    return { id, x: f.x - 22, y: top - 6, w: 44, h: L + 12, label };
  };
  return [box('W', 'W, your weight'), box('P', 'P, your push on the scales'), box('E', 'E, your pull on the Earth')];
}

export function PairsFigure({ tap }: { tap?: TapProps }) {
  const { palette: p } = useTheme();
  const colorOf = (id: string) => {
    const m = tap?.marks?.[id];
    if (m === 'right') return p.ok;
    if (m === 'wrong') return p.bad;
    return p.force;
  };
  const arrow = (id: keyof typeof F) => {
    const f = F[id];
    const on = tap?.selected === id;
    const c = id === 'N' ? p.force : colorOf(id);
    const y2 = f.y + f.dir * L;
    const lx = f.side === 'end' ? f.x - 22 : f.x + 10;
    const ly = id === 'P' ? y2 - 4 : (f.y + y2) / 2 + 6; // P is labelled below the floor, clear of the scales
    return (
      <Group key={id}>
        {on && <Rect x={f.x - 18} y={Math.min(f.y, y2) - 4} width={36} height={L + 8} rx={8} fill="none" stroke={p.ink} strokeWidth={2} />}
        <ForceArrow x1={f.x} y1={f.y} x2={f.x} y2={y2} color={c} />
        <ForceLetter x={lx} y={ly} text={id} color={id === 'N' ? p.forceText : c === p.force ? p.forceText : c} anchor={f.side} />
      </Group>
    );
  };

  return (
    <Group>
      {/* the person, floating just above the scales */}
      <Circle cx={110} cy={36} r={15} fill={p.drawFill} stroke={p.draw} strokeWidth={2} />
      <Path d="M92,62 Q92,55 99,55 L121,55 Q128,55 128,62 L128,120 L92,120 Z" fill={p.drawFill} stroke={p.draw} strokeWidth={2} strokeLinejoin="round" />
      <Rect x={95} y={120} width={11} height={48} fill={p.drawFillDark} stroke={p.draw} strokeWidth={2} />
      <Rect x={114} y={120} width={11} height={48} fill={p.drawFillDark} stroke={p.draw} strokeWidth={2} />
      <CgMark x={110} y={104} color={p.draw} />
      <MonoLabel x={160} y={42} text="YOU" color={p.label} anchor="start" />
      {/* the scales on the floor */}
      <Rect x={66} y={194} width={88} height={24} rx={5} fill={p.drawFill} stroke={p.draw} strokeWidth={2} />
      <MonoLabel x={164} y={210} text="SCALES" color={p.label} anchor="start" />
      <Hatch x1={24} x2={214} y={218} color={p.draw} />
      {/* the Earth, as a large arc */}
      <Path d="M206,270 Q275,248 340,240 L340,270 Z" fill={p.drawFill} />
      <Path d="M206,270 Q275,248 340,240" fill="none" stroke={p.draw} strokeWidth={2} />
      <MonoLabel x={312} y={264} text="EARTH" color={p.label} />
      {(['N', 'W', 'P', 'E'] as const).map(arrow)}
    </Group>
  );
}
