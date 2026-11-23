// FIG: two trolleys collide on one track (right positive). The left one (A) carries putty (they stick), a spring buffer
// (it bounces) or a spring plunger (both at rest, pushed apart). Every position and velocity comes from collisionRun
// (src/physics/momentum): steady speeds, a short contact in which both velocities change with the total momentum the same
// at every instant, then steady speeds again. Velocities are hollow arrows over the trolleys. Under the track an optional
// momentum line with two rows, BEFORE and AFTER: A's momentum, then the other body's from its tip, and the total Σp; a
// dashed line joins the two Σ marks, so the total visibly never moves.
import { Circle, G as Group, Line, Path } from 'react-native-svg';
import { collisionRun, collisionSquash, collisionTimes, momentum, stickVelocity, type Collision } from '@/physics/momentum';
import { fixed, signed } from '@/physics/format';
import type { CollideBody, CollideFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, useLoopTime, type DrawClock } from './anim';
import { ForceArrow, Hatch, MonoLabel } from './draw';
import { HollowArrow, stage, TROLLEY, Trolley } from './kit';

export const COLLIDE_VB = { w: 340, h: 230 };

const APPROACH = 1.0; // s from the start of the clip to the first touch
const HOLD = 0.6; // s two trolleys sit at rest before the spring pushes them apart
const TAIL = 1.0; // s the clip runs on after the contact
const SQUASH = 8; // viewBox units, the deepest a buffer squashes
const KV = 24; // viewBox units per m s⁻¹ of velocity
const SPAN = { x0: 12, x1: 328 }; // where the trolleys may go
const AXIS = { x0: 74, x1: 330 };
const PEN = { track: [0, 0.35], trolleys: [0.3, 0.7], labels: [0.7, 0.95] } as const;

/** The two bodies, with the right one's mass from the explore slider (it starts at rest and they stick). */
function bodiesOf(fig: CollideFig, live?: number): [CollideBody, CollideBody] {
  const [a, b] = fig.bodies;
  if (live === undefined || fig.massRange === undefined) return fig.bodies;
  const v = stickVelocity(a.m, a.u, live, b.u);
  return [
    { ...a, v },
    { ...b, m: live, v },
  ];
}

/** The collision in metres, with the buffer squash chosen so it shows as SQUASH viewBox units at scale k. */
function collisionOf(bodies: [CollideBody, CollideBody], k: number): Collision {
  const [a, b] = bodies;
  const closing = a.u - b.u > 0;
  return { a, b, gap: closing ? (a.u - b.u) * APPROACH : HOLD, squash: SQUASH / k };
}

/** Where the right body's front face sits relative to A's unsquashed buffer tip at the start, in metres. */
const offsetOf = (c: Collision) => (c.a.u - c.b.u > 0 ? c.gap : -c.squash);

/** The scale (viewBox units per metre) and A's starting tip, so both trolleys stay on the sheet for the whole clip. */
function fit(cases: [CollideBody, CollideBody][]): { k: number; x0: number } {
  let lo = 0;
  let hi = 0;
  for (const bodies of cases) {
    const c = collisionOf(bodies, 60);
    const { tEnd } = collisionTimes(c);
    for (let t = 0; t <= tEnd + TAIL; t += 0.02) {
      const r = collisionRun(t, c);
      lo = Math.min(lo, r.sA);
      hi = Math.max(hi, offsetOf(c) + r.sB);
    }
  }
  const room = SPAN.x1 - SPAN.x0 - (TROLLEY.w + TROLLEY.buf) - TROLLEY.w;
  const k = Math.min(200, room / Math.max(hi - lo, 1e-6));
  return { k, x0: SPAN.x0 + TROLLEY.w + TROLLEY.buf - k * lo };
}

/** The given values in the sheet header; on the explore screen the velocity after and the total momentum. */
export function collideParams(fig: CollideFig, live?: number): string {
  if (live === undefined) return fig.header;
  const [a, b] = bodiesOf(fig, live);
  return `v after ${signed(a.v, 2)} m s⁻¹ · Σp ${signed(momentum(a.m, a.u) + momentum(b.m, b.u), 2)}`;
}

export const collidePlays = (fig: CollideFig): boolean => fig.play !== undefined && !(fig.join === 'apart' && fig.play !== true);

type Props = { fig: CollideFig; live?: number; playing: boolean; clock?: DrawClock };

export function CollideFigure({ fig, live, playing, clock = STILL }: Props) {
  const { palette: p, material: m } = useTheme();
  const bodies = bodiesOf(fig, live);
  const { k, x0 } = fit(fig.massRange ? [bodiesOf(fig, fig.massRange[0]), bodiesOf(fig, fig.massRange[1])] : [fig.bodies]);
  const c = collisionOf(bodies, k);
  const { tHit, tEnd } = collisionTimes(c);
  const whole = fig.play === true;
  // the approach stops a moment before the touch, so the question is never answered by the motion
  const length = whole ? tEnd + TAIL : Math.max(0.3, tHit - 0.12);
  const loop = useLoopTime(playing && collidePlays(fig), length, `${live ?? ''}${fig.play}`, whole ? 0.9 : 0.5);
  const t = collidePlays(fig) ? loop : fig.at === 'after' ? tEnd + TAIL : c.a.u - c.b.u > 0 ? tHit * 0.45 : 0;
  const run = collisionRun(t, c);
  const squashed = collisionSquash(t, c) * k;
  const ledger = fig.ledger !== undefined;
  const floor = ledger ? 96 : 140;
  const rows = [150, 202];

  // A: its unsquashed buffer tip; B: its front face
  const tipA = x0 + run.sA * k;
  const faceB = x0 + (offsetOf(c) + run.sB) * k;
  const rearA = tipA - TROLLEY.buf - TROLLEY.w;
  const rearB = faceB + TROLLEY.w;
  const mids = [rearA + TROLLEY.w / 2, faceB + TROLLEY.w / 2];
  const vs = [run.vA, run.vB];
  const buffer = fig.join === 'stick' ? 'putty' : 'spring';

  // the momentum line: one scale for both rows, from every arrow's tail and tip
  const before = bodies.map((b) => momentum(b.m, b.u));
  const after = [momentum(bodies[0].m, run.vA), momentum(bodies[1].m, run.vB)];
  const ends = (ps: number[]) => [0, ps[0], ps[0] + ps[1]];
  const scaleCases = fig.massRange ? [bodiesOf(fig, fig.massRange[0]), bodiesOf(fig, fig.massRange[1])] : [bodies];
  const extents = scaleCases.flatMap((bs) => [...ends(bs.map((b) => momentum(b.m, b.u))), ...ends(bs.map((b) => momentum(b.m, b.v)))]);
  const axis = axisOf(Math.min(...extents), Math.max(...extents));
  const hit = t >= tHit; // the after row fills in from the first touch (with motion: live, as the momenta change)

  return (
    <Group>
      {stage(clock, PEN.track, <Hatch x1={8} x2={332} y={floor} color={p.draw} />)}
      {bodies.map((b, i) => (
        <Group key={b.id}>
          {stage(clock, 
            PEN.trolleys,
            i === 0 ? (
              <Trolley rear={rearA} floor={floor} facing={1} text={`${b.id} ${fixed(b.m, 2)} kg`} buffer={buffer} squashed={squashed} />
            ) : (
              <Trolley rear={rearB} floor={floor} facing={-1} text={`${b.id} ${fixed(b.m, 2)} kg`} buffer="none" />
            ),
          )}
          {stage(clock, PEN.labels, <Velocity x={mids[i]} y={floor - 54} v={vs[i]} dp={t < tHit ? 1 : 2} />)}
        </Group>
      ))}
      {ledger &&
        stage(clock, 
          PEN.labels,
          <Group>
            <LedgerRow y={rows[0]} title="BEFORE" ids={[bodies[0].id, bodies[1].id]} ps={before} axis={axis} show={fig.ledger === 'shown'} unknown={fig.ledger !== 'shown'} />
            <LedgerRow y={rows[1]} title="AFTER" ids={[bodies[0].id, bodies[1].id]} ps={after} axis={axis} show={fig.ledger === 'shown' && hit} unknown={fig.ledger !== 'shown'} />
            {fig.ledger === 'shown' && hit && (
              <Line x1={axis.X(before[0] + before[1])} y1={rows[0] + 18} x2={axis.X(after[0] + after[1])} y2={rows[1] - 4} stroke={p.ink} strokeWidth={stroke.thin} strokeDasharray="3 3" opacity={0.7} />
            )}
          </Group>,
        )}
    </Group>
  );
}

/** A hollow velocity arrow over a trolley with its value (as given: 1 decimal before the hit, 2 after); "at rest" when still. */
function Velocity({ x, y, v, dp }: { x: number; y: number; v: number; dp: number }) {
  const { palette: p, material: m } = useTheme();
  const still = Math.abs(v) < 0.005;
  const len = Math.sign(v) * Math.max(14, Math.abs(v) * KV); // a slow trolley still gets an arrow you can read
  return (
    <Group>
      {!still && <HollowArrow from={[x - len / 2, y]} to={[x - len / 2 + len, y]} color={p.label} weight="track" minLen={4} />}
      <MonoLabel x={x} y={y - 13} text={still ? 'at rest' : `${signed(v, dp)} m s⁻¹`} color={p.ink} size={9} />
    </Group>
  );
}

type Axis = { lo: number; hi: number; step: number; X: (v: number) => number };

/** A round scale from lo to hi (always through 0) with about five steps. */
function axisOf(min: number, max: number): Axis {
  const span = Math.max(max - min, 0.4);
  const step = [0.2, 0.4, 0.5, 1, 2, 5].find((s) => span / s <= 6) ?? 10;
  const lo = Math.floor(min / step + 1e-9) * step;
  const hi = Math.ceil(max / step - 1e-9) * step;
  return { lo, hi, step, X: (v: number) => AXIS.x0 + ((v - lo) / (hi - lo)) * (AXIS.x1 - AXIS.x0) };
}

/** One row of the momentum line: A's arrow from 0, the other body's from A's tip, the total marked under the axis. */
function LedgerRow({ y, title, ids, ps, axis, show, unknown }: { y: number; title: string; ids: [string, string]; ps: number[]; axis: Axis; show: boolean; unknown?: boolean }) {
  const { palette: p, material: m } = useTheme();
  const { X } = axis;
  const total = ps[0] + ps[1];
  const ticks: number[] = [];
  for (let v = axis.lo; v <= axis.hi + 1e-9; v += axis.step) ticks.push(Math.round(v * 100) / 100);
  const sum = Math.abs(total) < 0.005 ? '0' : signed(total, 2);
  return (
    <Group>
      <MonoLabel x={8} y={y - 6} text={title} color={p.label} size={8} anchor="start" />
      <MonoLabel x={8} y={y + 8} text={show ? `Σp ${sum}` : unknown ? 'Σp ?' : ''} color={p.ink} size={9} anchor="start" />
      <Line x1={AXIS.x0} y1={y} x2={AXIS.x1} y2={y} stroke={p.draw} strokeWidth={stroke.thin} />
      {ticks.map((v, i) => (
        <Group key={v}>
          <Line x1={X(v)} y1={y - (v === 0 ? 5 : 3)} x2={X(v)} y2={y + (v === 0 ? 5 : 3)} stroke={p.draw} strokeWidth={v === 0 ? stroke.thin : stroke.hair} />
          {/* the end numbers lean inwards so they stay on the sheet */}
          <MonoLabel x={X(v) + (i === ticks.length - 1 ? 3 : i === 0 ? -3 : 0)} anchor={i === ticks.length - 1 ? 'end' : i === 0 ? 'start' : 'middle'} y={y + 15} text={v === 0 ? '0' : signed(v, axis.step < 0.5 ? 1 : axis.step < 1 ? 1 : 0)} color={p.label} size={7.5} />
        </Group>
      ))}
      {show && (
        <Group>
          <Segment x1={X(0)} x2={X(ps[0])} y={y - 7} id={ids[0]} />
          {Math.abs(ps[1]) > 0.005 && <Line x1={X(ps[0])} y1={y - 7} x2={X(ps[0])} y2={y - 21} stroke={p.ink} strokeWidth={stroke.hair} strokeDasharray="2 2" />}
          <Segment x1={X(ps[0])} x2={X(total)} y={y - 21} id={ids[1]} />
          <Circle cx={X(total)} cy={y} r={3.8} fill={p.paper} stroke={p.ink} strokeWidth={stroke.body} />
        </Group>
      )}
      {unknown && <MonoLabel x={(AXIS.x0 + AXIS.x1) / 2} y={y - 9} text="?" color={p.ink} size={11} />}
    </Group>
  );
}

/** One body's momentum on the line: a solid ink arrow with its letter over the middle (a dot when it is zero). */
function Segment({ x1, x2, y, id }: { x1: number; x2: number; y: number; id: string }) {
  const { palette: p, material: m } = useTheme();
  if (Math.abs(x2 - x1) < 1.5) return <Path d={`M${x1 - 2.4},${y} a2.4,2.4 0 1 0 4.8,0 a2.4,2.4 0 1 0 -4.8,0`} fill={p.ink} />;
  return (
    <Group>
      <ForceArrow x1={x1} y1={y} x2={x2} y2={y} color={p.ink} width={2.6} />
      <MonoLabel x={(x1 + x2) / 2} y={y - 5} text={id} color={p.ink} size={8} />
    </Group>
  );
}
