// FIG: a cyclist on a level road at a steady speed (src/physics/drag, src/physics/power). She stays put while the road,
// its posts and the air stream past at her speed; the wheels roll by the distance the road moves and the cranks turn
// with them. Air resistance D = kv² acts back from the centre of gravity of her and the bike; at a steady speed the
// road pushes the back wheel forward with F = D (the resultant is zero). Both forces are drawn to one scale.
// With `perSecond` the posts stand v × 1 s apart, so she passes one each second; with `power` her power P = Dv is
// written in (or "P = ?"); with `compare` two lanes ride at two speeds, one above the other.
// On the explore screen the slider sets the speed: D grows as v², so twice the speed draws four times the arrow.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { dragForce } from '@/physics/drag';
import { powerFromForce } from '@/physics/power';
import { fixed, sig } from '@/physics/format';
import type { RideFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { useReducedMotionPref } from '@/ui/parts';
import { STILL, useTween, type DrawClock } from './anim';
import { DrawnFade, ForceArrow, MonoLabel } from './draw';
import { Dim, HollowArrow, stage, Tag } from './kit';

export const RIDE_VB = { w: 340, h: 230 };

const PEN = { road: [0, 0.3], bike: [0.2, 0.55], rider: [0.4, 0.7], labels: [0.72, 0.97] } as const;
const KM = 12; // viewBox units per metre of road: the road slides past at v × KM per second
const KF = 2.6; // viewBox units per newton, both forces
const KV = 4; // viewBox units per m s⁻¹ of the velocity arrow
const POST = 84; // gap between posts when they do not mark the seconds
const HATCH = 9;
const R = 15; // wheel radius in the bike's own units
const GEAR = 2.6; // wheel turns per turn of the cranks
const CG: Pt = [-4, -40]; // centre of gravity of rider and bike, in the bike's own units
const LANES = {
  one: [{ ground: 188, scale: 1.75, cx: 204 }],
  two: [
    { ground: 96, scale: 0.95, cx: 206 },
    { ground: 205, scale: 0.95, cx: 206 },
  ],
};

type Pt = [number, number];

const speedText = (v: number) => (v >= 10 && Number.isInteger(v) ? String(v) : fixed(v, 1));

/** The rider's speed: the explore slider's, or the figure's. */
export const rideSpeed = (fig: RideFig, live?: number) => live ?? fig.v;

/** The road always streams past a moving cyclist, so the figure always has a pause button. */
export const ridePlays = (fig: RideFig): boolean => fig.v > 0;

export function rideParams(fig: RideFig, live?: number): string {
  if (fig.compare !== undefined) return `D = kv², k = ${fixed(fig.k, 2)} N s² m⁻², steady speeds`;
  const v = rideSpeed(fig, live);
  const D = dragForce(fig.k, v);
  if (live !== undefined) return `steady speed · D = ${fixed(D, 1)} N`;
  return `steady ${speedText(v)} m s⁻¹, D = ${fixed(D, 1)} N`;
}

/** Distance (viewBox units) the road has slid, at a speed that may change, while `running`. */
function useScroll(speed: number, running: boolean): number {
  const [x, setX] = useState(0);
  const pos = useRef(0);
  const v = useRef(speed);
  v.current = speed;
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      pos.current += v.current * Math.min(0.05, (now - last) / 1000);
      last = now;
      setX(pos.current);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [running]);
  return x;
}

type Props = { fig: RideFig; live?: number; playing: boolean; clock?: DrawClock };

export function RideFigure({ fig, live, playing, clock = STILL }: Props) {
  const reduced = useReducedMotionPref();
  const run = playing && !reduced && !clock.on;
  const staged = (pen: readonly [number, number], children: ReactNode) => stage(clock, pen, children);
  const v1 = useTween(rideSpeed(fig, live), undefined, live !== undefined ? 160 : 420);
  const v2 = fig.compare ?? 0;
  const s1 = useScroll(v1 * KM, run);
  const s2 = useScroll(v2 * KM, run && fig.compare !== undefined);
  if (fig.compare !== undefined) {
    const [a, b] = LANES.two;
    return (
      <Group>
        <Lane fig={fig} v={v1} scroll={s1} lane={a} clock={clock} stage={staged} compact />
        <Lane fig={fig} v={v2} scroll={s2} lane={b} clock={clock} stage={staged} compact />
      </Group>
    );
  }
  return <Lane fig={fig} v={v1} scroll={s1} lane={LANES.one[0]} clock={clock} stage={staged} />;
}

type LaneProps = {
  fig: RideFig;
  v: number;
  scroll: number;
  lane: { ground: number; scale: number; cx: number };
  clock: DrawClock;
  stage: (pen: readonly [number, number], children: ReactNode) => ReactNode;
  compact?: true;
};

/** One road with one rider: the air and the road stream past, the forces, and the speed and power written in. */
function Lane({ fig, v, scroll, lane, clock, stage, compact }: LaneProps) {
  const { palette: p } = useTheme();
  const { ground: GY, scale: S, cx: CX } = lane;
  const D = dragForce(fig.k, v);
  const P = powerFromForce(D, v);
  const gap = fig.perSecond ? Math.max(24, v * KM) : POST;
  const ticks: string[] = [];
  for (let x = 6 - (scroll % HATCH); x < 334; x += HATCH) if (x >= 6) ticks.push(`M${x},${GY + 8} L${x + 8},${GY}`);
  const posts: number[] = [];
  for (let x = 30 - (scroll % gap); x < 334; x += gap) if (x >= 8) posts.push(x);
  // the air streams past as fast as the road: dashes in a few rows above it
  const top = GY - 78 * S;
  const air: string[] = [];
  const AIR = { dash: 16, gap: 52 };
  const rows = compact ? [GY - 62 * S, GY - 34 * S] : [GY - 122, GY - 94, GY - 66, GY - 38];
  rows.forEach((y, i) => {
    const off = (scroll + i * 19) % AIR.gap;
    for (let x = 8 - off; x < 332; x += AIR.gap) {
      const x1 = Math.max(8, x);
      const x2 = Math.min(332, x + AIR.dash);
      if (x2 > x1) air.push(`M${x1.toFixed(1)},${y.toFixed(1)} H${x2.toFixed(1)}`);
    }
  });
  const roll = scroll / (R * S);
  const at = (q: Pt): Pt => [CX + q[0] * S, GY + q[1] * S];
  const cg = at(CG);
  const rear = at([-27, 0]);
  const dLen = D * KF;
  const known = fig.power === 'shown';
  // the first two posts on the sheet: the distance covered in one second, measured under the road
  const pair = fig.perSecond ? posts[0] : undefined;

  return (
    <Group>
      {stage(
        PEN.road,
        <Group>
          <Path d={air.join(' ')} stroke={p.paperLine} strokeWidth={1.4} strokeLinecap="round" />
          <Line x1={6} y1={GY} x2={334} y2={GY} stroke={p.draw} strokeWidth={compact ? 1.6 : 2} />
          <Path d={ticks.join(' ')} stroke={p.draw} strokeWidth={1} opacity={0.55} />
          {posts.map((x) => (
            <Path key={x} d={`M${x},${GY} V${GY - 16} M${x - 3},${GY - 16} H${x + 3}`} stroke={p.label} strokeWidth={1.5} />
          ))}
        </Group>,
      )}

      <Group transform={`translate(${CX} ${GY}) scale(${S})`}>
        <Cyclist roll={roll} clock={clock} />
      </Group>

      {stage(
        PEN.labels,
        <Group>
          {/* air resistance back from the centre of gravity; the road's push forward at the back wheel: one scale */}
          {dLen > 1 && (
            <Group>
              <ForceArrow x1={cg[0]} y1={cg[1]} x2={cg[0] - dLen} y2={cg[1]} color={p.force} width={3} />
              <ForceArrow x1={rear[0]} y1={GY - 1.5} x2={rear[0] + dLen} y2={GY - 1.5} color={p.force} width={3} />
            </Group>
          )}
          <Circle cx={cg[0]} cy={cg[1]} r={2.8} fill={p.force} />
          <Circle cx={rear[0]} cy={GY - 1.5} r={2.8} fill={p.force} />
          <ForceText x={cg[0] - dLen - 6} y={cg[1] + 3.5} text={`D = ${fixed(D, 1)} N`} anchor="end" />
          <ForceText x={rear[0] + Math.max(dLen, 18) / 2} y={GY + (compact ? 18 : 20)} text={`F = ${fixed(D, 1)} N`} />
          {pair !== undefined && (
            <Group>
              <Path d={`M${pair},${GY + 10} V${GY + 38} M${pair + gap},${GY + 10} V${GY + 38}`} stroke={p.label} strokeWidth={0.8} strokeDasharray="2 2" />
              <Dim a={[pair, GY + 34]} b={[pair + gap, GY + 34]} text={`${speedText(v)} m`} fit="below" />
            </Group>
          )}
          {compact ? (
            <Group>
              <MonoLabel x={12} y={top + 10} text={`v = ${speedText(v)} m s⁻¹`} color={p.ink} size={10} anchor="start" />
              <MonoLabel x={330} y={top + 10} text={`P = ${sig(P)} W`} color={p.ink} size={11} anchor="end" />
            </Group>
          ) : (
            <Group>
              {v > 0.05 && <HollowArrow from={[CX - (KV * v) / 2, top - 12]} to={[CX - (KV * v) / 2 + KV * v, top - 12]} color={p.draw} weight="track" />}
              <Tag x={CX} y={top - 26} text={`v = ${speedText(v)} m s⁻¹`} />
              {fig.power && (
                <Group>
                  <Rect x={8} y={16} width={96} height={22} rx={3} fill={p.paper} />
                  <MonoLabel x={12} y={32} text={known ? `P = ${sig(P)} W` : 'P = ?'} color={p.ink} size={13} anchor="start" />
                </Group>
              )}
            </Group>
          )}
        </Group>,
      )}
    </Group>
  );
}

/** A force's size in the force colour, on a patch of paper so the air and the road never run through it. */
function ForceText({ x, y, text, anchor = 'middle' }: { x: number; y: number; text: string; anchor?: 'middle' | 'end' }) {
  const { palette: p } = useTheme();
  const w = text.length * 5.4 + 8;
  const left = anchor === 'end' ? x - w + 4 : x - w / 2;
  return (
    <Group>
      <Rect x={left} y={y - 9} width={w} height={13} rx={2} fill={p.paper} />
      <MonoLabel x={x} y={y} text={text} color={p.forceText} size={9} anchor={anchor} />
    </Group>
  );
}

/** Where the knee goes for a hip, a foot and two leg bones of length l: in front of the line from hip to foot. */
function knee(hip: Pt, foot: Pt, l: number): Pt {
  const dx = foot[0] - hip[0];
  const dy = foot[1] - hip[1];
  const d = Math.min(Math.hypot(dx, dy), 2 * l - 0.01);
  const a = d / 2;
  const h = Math.sqrt(Math.max(0, l * l - a * a));
  const ux = dx / Math.hypot(dx, dy);
  const uy = dy / Math.hypot(dx, dy);
  // the perpendicular that points forward (+x) for a foot below the hip
  return [hip[0] + ux * a - uy * h, hip[1] + uy * a + ux * h];
}

/**
 * The cyclist and the bike in their own units: the ground at y = 0 under the middle of the bike, facing +x.
 * `roll`: how far the wheels have turned (rad); the cranks turn GEAR times slower.
 */
function Cyclist({ roll, clock }: { roll: number; clock: DrawClock }) {
  const { palette: p } = useTheme();
  const crank = roll / GEAR;
  const BB: Pt = [-4, -13];
  const pedal = (k: number): Pt => [BB[0] + 6.5 * Math.cos(crank + k * Math.PI), BB[1] + 6.5 * Math.sin(crank + k * Math.PI)];
  const hip: Pt = [-12, -45];
  const shoulder: Pt = [10, -62];
  const head: Pt = [18, -69];
  const LEG = 21;
  const poly = (pts: Pt[]) => pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ');
  const limb = (pts: Pt[], color: string, w: number) => (
    <Group>
      <Path d={poly(pts)} stroke={p.draw} strokeWidth={w + 2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d={poly(pts)} stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Group>
  );
  const leg = (k: number, color: string) => {
    const f = pedal(k);
    return (
      <Group>
        {limb([hip, knee(hip, f, LEG), f], color, 5.2)}
        <Path d={`M${f[0] - 2.5},${f[1] + 0.5} H${f[0] + 4.5}`} stroke={p.shoe} strokeWidth={3.2} strokeLinecap="round" />
      </Group>
    );
  };
  const wheel = (x: number) => {
    const spokes: string[] = [];
    for (let i = 0; i < 3; i++) {
      const a = roll + (i * Math.PI) / 3;
      spokes.push(`M${(x - (R - 2) * Math.cos(a)).toFixed(1)},${(-R - (R - 2) * Math.sin(a)).toFixed(1)} L${(x + (R - 2) * Math.cos(a)).toFixed(1)},${(-R + (R - 2) * Math.sin(a)).toFixed(1)}`);
    }
    return (
      <Group key={x}>
        <Circle cx={x} cy={-R} r={R} fill="none" stroke={p.draw} strokeWidth={2.6} />
        <Path d={spokes.join(' ')} stroke={p.draw} strokeWidth={0.8} opacity={0.6} />
        <Circle cx={x} cy={-R} r={1.8} fill={p.draw} />
      </Group>
    );
  };
  return (
    <Group>
      <DrawnFade clock={clock} from={PEN.rider[0]} to={PEN.rider[1]}>
        {/* the far leg, behind the bike */}
        <Group opacity={0.75}>{leg(1, p.drawFillDark)}</Group>
      </DrawnFade>
      <DrawnFade clock={clock} from={PEN.bike[0]} to={PEN.bike[1]}>
        {wheel(-27)}
        {wheel(27)}
        {/* the frame: chain stay, seat tube, seat stay, top tube, down tube, fork */}
        <Path d="M-27,-15 L-4,-13 L-11,-38 Z M-11,-38 L19,-37 L21,-31 L-4,-13 M21,-31 L27,-15" fill="none" stroke={p.draw} strokeWidth={2} strokeLinejoin="round" />
        <Path d="M-17,-41 H-7" stroke={p.draw} strokeWidth={3} strokeLinecap="round" />
        <Path d="M-11,-38 L-12,-41 M19,-37 L21,-42 H25 Q29,-42 27,-37" fill="none" stroke={p.draw} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={BB[0]} cy={BB[1]} r={3.2} fill={p.drawFill} stroke={p.draw} strokeWidth={1.4} />
        <Line x1={pedal(0)[0]} y1={pedal(0)[1]} x2={pedal(1)[0]} y2={pedal(1)[1]} stroke={p.draw} strokeWidth={1.8} />
      </DrawnFade>
      <DrawnFade clock={clock} from={PEN.rider[0]} to={PEN.rider[1]}>
        {limb([hip, shoulder], p.shirt, 9)}
        {leg(0, p.trousers)}
        {limb([[shoulder[0] + 1, shoulder[1] + 2], [20, -52], [25, -42]], p.shirt, 3.6)}
        <Circle cx={25} cy={-42} r={2.3} fill={p.skin} stroke={p.draw} strokeWidth={1.1} />
        <Circle cx={head[0]} cy={head[1]} r={6.5} fill={p.skin} stroke={p.draw} strokeWidth={1.5} />
        {/* the helmet */}
        <Path d={`M${head[0] - 7.5},${head[1] - 0.5} A7.5,7.5 0 0 1 ${head[0] + 7},${head[1] - 2.5} L${head[0] - 7.5},${head[1] - 0.5} Z`} fill={p.drawFillDark} stroke={p.draw} strokeWidth={1.3} strokeLinejoin="round" />
      </DrawnFade>
    </Group>
  );
}
