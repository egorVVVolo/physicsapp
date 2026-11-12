// FIG: the puzzle, solved. Two lifts side by side: at rest, and starting up with acceleration a.
// Same person, same mass; the N arrows and the readings come from src/physics/dynamics.
// The right display counts up from the at-rest reading once the figure appears.
import { G as Group, Line, Rect } from 'react-native-svg';
import { normalInLift, scaleKg } from '@/physics/dynamics';
import { fixed } from '@/physics/format';
import type { LiftPairFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { useTween } from './anim';
import { AccChevrons, ForceArrow, ForceLetter, Hatch, MonoLabel } from './draw';
import { Person, Scales, SCALES_H } from './people';

export const LIFT_PAIR_VB = { w: 340, h: 236 };

const S = 0.74; // the cars are drawn smaller than in the lesson
const CAR = { w: 142 * S, h: 212 * S };
const TOP = 14;
const FLOOR = TOP + CAR.h;
const K = 0.13; // viewBox units per newton for the N arrows

export function LiftPairFigure({ fig, playing }: { fig: LiftPairFig; playing: boolean }) {
  const rest = normalInLift(fig.m, 0);
  const up = normalInLift(fig.m, fig.a);
  // the right car starts at the at-rest value and climbs to the real one (reduced motion: straight to it)
  const nUp = useTween(up, playing ? rest : up, 1600);
  return (
    <Group>
      <MiniLift x={14} n={rest} caption="at rest" />
      <MiniLift x={180} n={nUp} caption={`a = +${fixed(fig.a, 1)} m s⁻²`} acc />
    </Group>
  );
}

function MiniLift({ x, n, caption, acc }: { x: number; n: number; caption: string; acc?: boolean }) {
  const { palette: p } = useTheme();
  const cx = x + CAR.w / 2;
  const kg = `${fixed(scaleKg(n), 1)} kg`;
  const arrowX = x + CAR.w + 18;
  const soles = FLOOR - (SCALES_H - 3) * S;
  return (
    <Group>
      <Line x1={cx} y1={0} x2={cx} y2={TOP} stroke={p.draw} strokeWidth={1.6} />
      <Rect x={x} y={TOP} width={CAR.w} height={CAR.h} fill="#FFFFFF" stroke={p.draw} strokeWidth={2} />
      <Hatch x1={x} x2={x + CAR.w} y={FLOOR} color={p.draw} />
      <Group transform={`translate(${cx} ${FLOOR}) scale(${S}) translate(${-cx} ${-FLOOR})`}>
        <Scales x={cx} y={FLOOR} reading={kg} />
        <Person x={cx} y={FLOOR - SCALES_H + 3} cg={false} />
      </Group>
      {/* N on the person, drawn beside the car at the height of the soles */}
      <ForceArrow x1={arrowX} y1={soles} x2={arrowX} y2={soles - n * K} color={p.force} />
      <ForceLetter x={arrowX + 9} y={soles - n * K + 12} text="N" color={p.forceText} anchor="start" />
      {acc && <AccChevrons x={arrowX} y={TOP + 12} dir="up" color={p.draw} />}
      <MonoLabel x={cx} y={FLOOR + 20} text={caption} color={p.label} size={9.5} />
      <ForceLetter x={cx} y={FLOOR + 46} text={kg} color={p.ink} size={22} />
    </Group>
  );
}
