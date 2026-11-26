// FIG: stones thrown from the top of a sea cliff (src/physics/projectile, src/physics/energy). Every point of every
// path comes from projectilePosition; the launch arrows are all the same length (the same speed), only their angles
// differ. Played, the stones fly together in real time and splash. With `landing`, each stone's velocity just before
// it hits the sea is an outline arrow and the speeds are listed: all the same, because energy has no direction.
// With `follow` (the explore), one stone sits at the slider's time with its velocity, and a column on the right stacks
// its kinetic energy on its GPE above the sea: the column's top never moves.
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { flightTime, projectilePosition, projectileVelocity, type Launch } from '@/physics/projectile';
import { kineticEnergy, potentialChange, speedAfterDrop } from '@/physics/energy';
import { fixed, sig } from '@/physics/format';
import type { CliffFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { useReducedMotionPref } from '@/ui/parts';
import { STILL, useLoopTime, type DrawClock } from './anim';
import { DrawnFade, DrawnPath, FILLS, MonoLabel } from './draw';
import { HollowArrow, stage } from './kit';

export const CLIFF_VB = { w: 340, h: 230 };

const PEN = { cliff: [0, 0.3], launch: [0.28, 0.5], path: [0.45, 0.78], labels: [0.78, 0.97] } as const;
const SEA = 196;
const K = 6.8; // viewBox units per metre
const EDGE = 54; // the stones leave from here, just beyond the cliff's edge
const R = 6;
const KV = 2; // viewBox units per m s⁻¹ of every velocity arrow: the throws, the speeds at the sea, the followed stone
const COL = { x: 252, w: 26, k: 1.25 }; // the energy column: x, width, viewBox units per joule
const HOLD = 1.3;

const launchOf = (fig: CliffFig, angle: number): Launch => ({ u: fig.u, angle, h: fig.h });
const top = (fig: CliffFig) => SEA - fig.h * K;

/** Where a stone is drawn at time t (it rests where it landed). */
function pointAt(fig: CliffFig, l: Launch, t: number): [number, number] {
  const pos = projectilePosition(Math.min(t, flightTime(l)), l);
  return [EDGE + pos.x * K, SEA - Math.max(0, pos.y) * K];
}

export const cliffPlays = (fig: CliffFig): boolean => fig.play === true;

export function cliffParams(fig: CliffFig, live?: number): string {
  if (fig.follow !== undefined) {
    const s = fig.stones.find((x) => x.id === fig.follow)!;
    const l = launchOf(fig, s.angle);
    const t = Math.min(live ?? 0, flightTime(l));
    const v = projectileVelocity(t, l);
    return `stone ${s.id}, ${fixed(fig.m, 2)} kg · v = ${fixed(Math.hypot(v.vx, v.vy), 1)} m s⁻¹`;
  }
  return fig.u > 0 ? `u = ${fig.u} m s⁻¹, h = ${fig.h} m, no air` : `dropped from rest, h = ${fig.h} m, no air`;
}

type Props = { fig: CliffFig; live?: number; playing: boolean; clock?: DrawClock };

export function CliffFigure({ fig, live, playing, clock = STILL }: Props) {
  const { palette: p, soft } = useTheme();
  const reduced = useReducedMotionPref();
  const plays = cliffPlays(fig) && live === undefined;
  const length = Math.max(...fig.stones.map((s) => flightTime(launchOf(fig, s.angle))));
  const loop = useLoopTime(plays && playing && !reduced && !clock.on, length, fig.stones.map((s) => s.id).join(''), HOLD);
  const followed = fig.stones.find((s) => s.id === fig.follow);
  const timeOf = (id: string) => (plays ? (reduced ? length : loop) : id === fig.follow ? (live ?? 0) : 0);
  const showLanding = fig.landing === 'shown';
  const T = top(fig);
  // the cliff: a flat top, a rough face down to the sea, a few strata lines
  const face = `M6,${T} H${EDGE - 5} L${EDGE - 6},${T + 26} L${EDGE - 12},${T + 52} L${EDGE - 8},${T + 84} L${EDGE - 15},${T + 112} L${EDGE - 12},${SEA}`;
  const waves: string[] = [];
  for (let x = EDGE - 12; x < 334; x += 12) waves.push(`M${x},${SEA} q3,-3 6,0 q3,3 6,0`);

  return (
    <Group>
      {/* the cliff and the sea */}
      <DrawnFade clock={clock} from={PEN.cliff[0]} to={PEN.cliff[1]}>
        <Path d={`${face} L6,${SEA} Z`} fill={soft.metal.fill} />
        <Path d={face} stroke={p.draw} strokeWidth={stroke.body} fill="none" strokeLinejoin="round" />
        <Path d={waves.join(' ')} stroke={p.draw} strokeWidth={stroke.thin} fill="none" />
        {/* the height of the cliff */}
        <Path d={`M16,${T + 4} V${SEA - 4} M12,${T + 4} H20 M12,${SEA - 4} H20`} stroke={p.label} strokeWidth={stroke.thin} fill="none" />
        <Rect x={9} y={(T + SEA) / 2 - 8} width={34} height={13} rx={2} fill={soft.metal.fill} />
        <MonoLabel x={26} y={(T + SEA) / 2 + 2} text={`${fig.h} m`} color={p.ink} size={9} />
      </DrawnFade>

      {/* the paths: whole, or as far as each stone has got while it plays */}
      {fig.stones.map((s) => {
        const l = launchOf(fig, s.angle);
        const until = plays ? Math.min(timeOf(s.id), flightTime(l)) : flightTime(l);
        if (until <= 0 || (fig.u === 0 && !plays && fig.landing === undefined)) return null;
        const { d, len } = pathOf(fig, l, until);
        const faint = followed && s.id !== followed.id;
        return <DrawnPath key={`p${s.id}`} clock={clock} len={len} from={PEN.path[0]} to={PEN.path[1]} d={d} fill="none" stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="4 4" opacity={faint ? 0.4 : 1} />;
      })}

      {/* the throw: the same speed every way */}
      {fig.u > 0 && !followed && !plays && (
        <DrawnFade clock={clock} from={PEN.launch[0]} to={PEN.launch[1]}>
          {fig.stones.map((s) => {
            const a = (s.angle * Math.PI) / 180;
            // from the edge of the stone, so the three arrows do not crowd its centre
            const from: [number, number] = [EDGE + (R + 1) * Math.cos(a), T - (R + 1) * Math.sin(a)];
            const tip: [number, number] = [from[0] + fig.u * KV * Math.cos(a), from[1] - fig.u * KV * Math.sin(a)];
            return (
              <Group key={`a${s.id}`}>
                <HollowArrow from={from} to={tip} color={p.draw} weight="thin" />
                <MonoLabel x={tip[0] + 8 * Math.cos(a) + 3} y={tip[1] - 8 * Math.sin(a) + 3.5} text={s.id} color={p.ink} size={10} />
              </Group>
            );
          })}
        </DrawnFade>
      )}

      {/* the stones, and a splash where each has landed */}
      {fig.stones.map((s) => {
        const l = launchOf(fig, s.angle);
        const t = timeOf(s.id);
        const [x, y] = pointAt(fig, l, t);
        const landed = plays && t >= flightTime(l) - 1e-6;
        if (s.id !== fig.follow && followed) return null;
        if (!plays && !followed && s !== fig.stones[0]) return null; // all at the throw: one stone
        return (
          <DrawnFade key={`s${s.id}`} clock={clock} from={FILLS[0]} to={FILLS[1]}>
            {landed ? (
              <Path d={`M${x - 9},${SEA - 2} q4,-7 6,-11 M${x + 9},${SEA - 2} q-4,-7 -6,-11 M${x},${SEA - 4} v-12`} stroke={p.draw} strokeWidth={stroke.thin} fill="none" strokeLinecap="round" />
            ) : (
              <Group>
                <Circle cx={x} cy={y} r={R} fill={soft.A.fill} stroke={soft.A.edge} strokeWidth={2} />
                {/* the letters wait until the stones have parted: at the throw all three are in one place */}
                {plays && fig.stones.length > 1 && t > 0.25 && <MonoLabel x={x} y={y - 8} text={s.id} color={p.label} size={8} />}
              </Group>
            )}
          </DrawnFade>
        );
      })}

      {followed && stage(clock, PEN.labels, <Followed fig={fig} angle={followed.angle} t={live ?? 0} />)}
      {fig.landing && stage(clock, PEN.labels, <SpeedTable fig={fig} shown={showLanding} />)}
      {plays && stage(clock, PEN.labels, <MonoLabel x={330} y={18} text={`t = ${fixed(Math.min(loop, length), 2)} s`} color={p.label} size={9} anchor="end" />)}
    </Group>
  );
}

/** The path from the throw to time `until`, as a smooth polyline, with its length. */
function pathOf(fig: CliffFig, l: Launch, until: number): { d: string; len: number } {
  const n = 48;
  let d = '';
  let len = 0;
  let prev: [number, number] | null = null;
  for (let i = 0; i <= n; i++) {
    const pt = pointAt(fig, l, (until * i) / n);
    d += `${i === 0 ? 'M' : ' L'}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`;
    if (prev) len += Math.hypot(pt[0] - prev[0], pt[1] - prev[1]);
    prev = pt;
  }
  return { d, len };
}

/** At the sea: once shown, every stone's velocity just before it lands, to the throws' scale; the speeds, "?" until answered. */
function SpeedTable({ fig, shown }: { fig: CliffFig; shown: boolean }) {
  const { palette: p } = useTheme();
  const x = 246;
  const v = speedAfterDrop(fig.u, fig.h);
  const many = fig.stones.length > 1;
  const listY = 132;
  return (
    <Group>
      <MonoLabel x={x} y={44} text="At the sea" color={p.label} size={8.5} anchor="start" />
      {/* each stone's velocity just before it lands, side by side, to the throws' scale */}
      {shown &&
        fig.stones.map((s, i) => {
          const l = launchOf(fig, s.angle);
          const vel = projectileVelocity(flightTime(l), l);
          const o: [number, number] = [x + 10 + i * 28, 66];
          return (
            <Group key={s.id}>
              {many && <MonoLabel x={o[0]} y={o[1] - 7} text={s.id} color={p.ink} size={9} />}
              <HollowArrow from={o} to={[o[0] + vel.vx * KV, o[1] - vel.vy * KV]} color={p.draw} weight="thin" />
            </Group>
          );
        })}
      {fig.stones.map((s, i) => (
        <MonoLabel key={s.id} x={x} y={listY + i * 15} text={`${many ? `${s.id}  ` : 'v = '}${shown ? `${fixed(v, 1)} m s⁻¹` : '?'}`} color={p.ink} size={9.5} anchor="start" />
      ))}
    </Group>
  );
}

/** The followed stone's velocity, and its energy column: GPE above the sea, kinetic energy stacked on it. */
function Followed({ fig, angle, t }: { fig: CliffFig; angle: number; t: number }) {
  const { palette: p, soft } = useTheme();
  const l = launchOf(fig, angle);
  const tt = Math.min(t, flightTime(l));
  const pos = projectilePosition(tt, l);
  const vel = projectileVelocity(tt, l);
  const [x, y] = pointAt(fig, l, tt);
  const ep = potentialChange(fig.m, Math.max(0, pos.y));
  const ek = kineticEnergy(fig.m, Math.hypot(vel.vx, vel.vy));
  const total = potentialChange(fig.m, fig.h) + kineticEnergy(fig.m, fig.u);
  const hEp = ep * COL.k;
  const hEk = ek * COL.k;
  const yTotal = SEA - total * COL.k;
  // the labels sit by the middle of their parts, never closer than one line apart
  const yEp = SEA - hEp / 2 + 3;
  const yEk = Math.min(SEA - hEp - hEk / 2 + 3, yEp - 13);
  const lx = COL.x - 6; // the labels go left of the column: on its right they would run off the sheet
  return (
    <Group>
      <HollowArrow from={[x, y]} to={[x + vel.vx * KV, y - vel.vy * KV]} color={p.draw} weight="thin" />
      <Circle cx={x} cy={y} r={R} fill={soft.A.fill} stroke={soft.A.edge} strokeWidth={2} />
      <Rect x={COL.x} y={SEA - hEp} width={COL.w} height={hEp} fill={soft.B.fill} stroke={soft.B.edge} strokeWidth={1.6} />
      <Rect x={COL.x} y={SEA - hEp - hEk} width={COL.w} height={hEk} fill={soft.A.fill} stroke={soft.A.edge} strokeWidth={1.6} />
      <Line x1={COL.x - 6} y1={yTotal} x2={COL.x + COL.w + 6} y2={yTotal} stroke={p.lineStrong} strokeWidth={stroke.thin} strokeDasharray="3 3" />
      <MonoLabel x={COL.x + COL.w / 2} y={yTotal - 7} text={`total ${sig(total)} J`} color={p.ink} size={9} />
      {hEp > 1 && <MonoLabel x={lx} y={yEp} text={`Ep ${sig(ep)} J`} color={p.label} size={8.5} anchor="end" />}
      <MonoLabel x={lx} y={yEk} text={`Ek ${sig(ek)} J`} color={p.label} size={8.5} anchor="end" />
    </Group>
  );
}
