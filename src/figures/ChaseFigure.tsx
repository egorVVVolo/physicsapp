// FIG: two cars on the road of the braking figure, side by side at the 0 m line when the clock starts, each with
// its own steady acceleration. Positions and velocities come from s = ut + ½at² and v = u + at
// (src/physics/kinematics). The clip runs from 0 to `until` in real time; its last frame shows the gap between
// the cars, or that they are level. The first chase figure of a lesson draws itself.
import { G as Group, Line } from 'react-native-svg';
import { position, velocity } from '@/physics/kinematics';
import { fixed } from '@/physics/format';
import type { ChaseFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { useReducedMotionPref } from '@/ui/parts';
import { STILL, useLoopTime, type DrawClock } from './anim';
import { DrawnPath, Hatch, MonoLabel } from './draw';
import { AccMark, ARROW_DY, CAR_MID, KV, LANES, PEN, RULER_Y, RoadRuler, SPEED_DY, X0, roadScale } from './RoadFigure';
import { Car, WHEEL_R, Dim, HollowArrow, stage, Tag } from './kit';

export { ROAD_VB as CHASE_VB } from './RoadFigure';

const HOLD = 1.6; // s the played figure waits on its last frame before it starts again
const GAP_Y = 112; // the gap is written between the two lanes

/** True when the figure plays (and so gets a pause button). */
export function chasePlays(fig: ChaseFig): boolean {
  return fig.play === true;
}

/** The given values in the sheet header: what each car does. */
export function chaseParams(fig: ChaseFig): string {
  return fig.cars.map((c) => `${c.id}: ${c.a === 0 ? `${fixed(c.u, 1)} m s⁻¹` : `${fixed(c.a, 1)} m s⁻²`}`).join(', ');
}

export function ChaseFigure({ fig, playing, clock = STILL }: { fig: ChaseFig; playing: boolean; clock?: DrawClock }) {
  const { palette: p } = useTheme();
  const reduced = useReducedMotionPref();
  const k = roadScale(fig.span);
  const X = (s: number) => X0 + s * k;
  const plays = chasePlays(fig);
  const loop = useLoopTime(plays && playing && !reduced && !clock.on, fig.until, fig.until, HOLD);
  const t = plays ? (reduced ? fig.until : loop) : 0;
  const ended = plays && t >= fig.until - 1e-9;
  const at = fig.cars.map((c) => {
    const m = { s0: 0, u: c.u, a: c.a };
    return { ...c, s: position(t, m), v: velocity(t, m), y: LANES[c.id] };
  });
  const front = Math.max(...at.map((c) => c.s));
  const back = Math.min(...at.map((c) => c.s));
  const leader = at.find((c) => c.s === front)!;
  const chaser = at.find((c) => c.s === back)!;
  const gap = front - back;

  return (
    <Group>
      {at.map((c) => (
        <Hatch key={c.id} x1={6} x2={334} y={c.y} color={p.draw} clock={clock} from={PEN.road[0]} to={PEN.road[1]} />
      ))}
      <RoadRuler span={fig.span} clock={clock} />
      <DrawnPath clock={clock} len={RULER_Y - 20} from={PEN.start[0]} to={PEN.start[1]} d={`M${X0},20 V${RULER_Y}`} stroke={p.lineStrong} strokeWidth={1.2} strokeDasharray="3 4" fill="none" />
      {stage(clock, PEN.marks, <MonoLabel x={X0 + 4} y={13} text="SIDE BY SIDE" color={p.label} size={8.5} anchor="start" />)}

      {/* the last frame: how far apart the cars are, or that they are level */}
      {ended && gap > 0.05 && (
        <Group>
          <Line x1={X(front)} y1={leader.y} x2={X(front)} y2={leader.y < GAP_Y ? GAP_Y + 4 : GAP_Y - 4} stroke={p.label} strokeWidth={1.1} strokeDasharray="3 4" />
          <Line x1={X(back)} y1={chaser.y} x2={X(back)} y2={chaser.y < GAP_Y ? GAP_Y + 4 : GAP_Y - 4} stroke={p.label} strokeWidth={1.1} strokeDasharray="3 4" />
          <Dim a={[X(back), GAP_Y]} b={[X(front), GAP_Y]} text={`${fixed(gap, 1)} m`} fit="below" />
        </Group>
      )}
      {ended && gap <= 0.05 && (
        <Group>
          <Line x1={X(front)} y1={30} x2={X(front)} y2={RULER_Y} stroke={p.label} strokeWidth={1.1} strokeDasharray="3 4" />
          <Tag x={X(front)} y={26} text={`LEVEL AT ${fixed(front, 1)} m`} />
        </Group>
      )}

      {at.map((c) => {
        const xc = X(c.s) - CAR_MID;
        const len = KV * c.v;
        return (
          <Group key={c.id}>
            <Car front={X(c.s)} y={c.y} id={c.id} roll={(c.s * k) / WHEEL_R} clock={clock} />
            {len > 5 && stage(clock, PEN.marks, <HollowArrow from={[xc, c.y + ARROW_DY]} to={[xc + len, c.y + ARROW_DY]} color={p.draw} weight="track" />)}
            {c.a !== 0 && stage(clock, PEN.marks, <AccMark x={xc - 8} y={c.y + ARROW_DY} forward={c.a > 0} />)}
            {fig.values && !plays && stage(clock, PEN.marks, <Tag x={Math.max(40, xc + Math.max(len, 30) / 2)} y={c.y + SPEED_DY} text={c.v > 0.05 ? `${fixed(c.v, 1)} m s⁻¹` : 'from rest'} />)}
          </Group>
        );
      })}
    </Group>
  );
}
