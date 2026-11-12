// FIG: the person lifted off the scales ("exploded" view) to show which object each force acts on.
// N and W act on the person, P (the person's push) on the scales, E (the person's pull) on the Earth.
// N and P sit on one vertical line, so the pair reads at a glance once it is found.
import { G as Group, Circle, Path, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { svgLetter } from '@/theme/svgFont';
import { Text as SvgText } from 'react-native-svg';
import { ForceArrow, Hatch, MonoLabel } from './draw';
import { Person, PERSON_CG, Scales, SCALES_H } from './people';
import type { TapProps, TapTarget } from './Sheet';

export const PAIRS_VB = { w: 340, h: 270 };
const L = 46; // every arrow has the same length: the lift is at rest, and pairs are equal

const PX = 104; // the person and the scales
const FLOOR = 236;
const SCALES_TOP = FLOOR - SCALES_H;
const SOLES = SCALES_TOP - 24; // lifted off the scales
const PAIR_X = PX + 40; // N and P share this line

// Where each force is drawn: start point, direction (+1 down, −1 up), where its letter badge sits.
const F = {
  W: { x: PX, y: SOLES - PERSON_CG, dir: 1, bx: PX + 13, by: SOLES - PERSON_CG + L - 4 },
  N: { x: PAIR_X, y: SOLES, dir: -1, bx: PAIR_X + 14, by: SOLES - L / 2 },
  P: { x: PAIR_X, y: SCALES_TOP + 3, dir: 1, bx: PAIR_X + 14, by: SCALES_TOP + 3 + L - 6 },
  E: { x: 282, y: 254, dir: -1, bx: 296, by: 254 - L / 2 },
} as const;

export function pairsTargets(): TapTarget[] {
  const box = (id: 'W' | 'P' | 'E', label: string) => {
    const f = F[id];
    const top = f.dir > 0 ? f.y : f.y - L;
    return { id, x: f.x - 22, y: top - 6, w: 56, h: L + 12, label };
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
    const c = colorOf(id);
    const y2 = f.y + f.dir * L;
    const given = id === 'N'; // the force the question is about: a filled badge
    return (
      <Group key={id}>
        {on && <Rect x={f.x - 18} y={Math.min(f.y, y2) - 5} width={52} height={L + 10} rx={10} fill="none" stroke={p.ink} strokeWidth={2} />}
        {/* a white halo keeps the arrow readable where it crosses the drawing */}
        <ForceArrow x1={f.x} y1={f.y} x2={f.x} y2={y2} color="#FFFFFF" width={7} />
        <ForceArrow x1={f.x} y1={f.y} x2={f.x} y2={y2} color={c} />
        <Circle cx={f.bx} cy={f.by} r={9.5} fill={given ? c : '#FFFFFF'} stroke={c} strokeWidth={1.6} />
        <SvgText x={f.bx} y={f.by + 5} fontSize={14} fill={given ? '#FFFFFF' : c === p.force ? p.forceText : c} fontFamily={svgLetter} textAnchor="middle">
          {id}
        </SvgText>
      </Group>
    );
  };

  return (
    <Group>
      {/* the Earth, as a large arc in the corner */}
      <Path d="M196,270 Q268,246 340,238 L340,270 Z" fill={p.drawFill} />
      <Path d="M196,270 Q268,246 340,238" fill="none" stroke={p.draw} strokeWidth={2} />
      <MonoLabel x={318} y={264} text="EARTH" color={p.label} size={9} />
      {/* the scales on the floor, the person lifted just above them */}
      <Hatch x1={24} x2={190} y={FLOOR} color={p.draw} />
      <Scales x={PX} y={FLOOR} reading="- - -" />
      <MonoLabel x={PX - 56} y={FLOOR - 8} text="SCALES" color={p.label} size={9} anchor="end" />
      <Person x={PX} y={SOLES} />
      <MonoLabel x={PX - 34} y={SOLES - 118} text="YOU" color={p.label} size={9} anchor="end" />
      {/* the gap between soles and scales: two short dashes show they were in contact */}
      <Path d={`M${PX - 30},${SOLES + 12} L${PX - 20},${SOLES + 12} M${PX + 20},${SOLES + 12} L${PX + 30},${SOLES + 12}`} stroke={p.lineStrong} strokeWidth={1.4} />
      {(['W', 'N', 'P', 'E'] as const).map(arrow)}
    </Group>
  );
}
