// FIG: kinetic and gravitational potential energy (src/physics/energy).
// KineticFigure: an electric car on a level road, seen from the side. The car stays put and the road slides past at
// its speed. Played, it speeds up from rest at a steady 5 m s⁻² (v = at, the road moves ½at²) and holds. With the
// square, the road moves up and Ek = ½mv² is drawn under it as a square of side v, one cell per 2 m s⁻¹, so twice the
// speed is four times the cells. With two stages, the square of the first speed and the band around it carry their
// own energies.
// HeightFigure: a tower crane holds the car over the road by a height ruler; two bars to one scale compare its gain in
// GPE, mgh, with its kinetic energy at a given speed.
import { useState } from 'react';
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { kineticEnergy, potentialChange } from '@/physics/energy';
import { fixed, sig } from '@/physics/format';
import type { HeightFig, KineticFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { useReducedMotionPref } from '@/ui/parts';
import { STILL, useFrame, useLoopTime, useTween, type DrawClock } from './anim';
import { Hatch, MonoLabel } from './draw';
import { Car, WHEEL_R, HollowArrow, stage, Tag } from './kit';

export const KINETIC_VB = { w: 340, h: 230 };
export const HEIGHT_VB = { w: 340, h: 230 };

const PEN = { road: [0, 0.3], car: [0.2, 0.6], square: [0.5, 0.8], labels: [0.78, 0.98] } as const;
const ACC = 5; // m s⁻², a brisk electric car pulling away
const PX_PER_M = 3; // how fast the road slides past
const KV = 1.9; // viewBox units per m s⁻¹ of the velocity arrow
const HATCH = 9;
const POST = 64; // roadside posts
const CELL = 2; // m s⁻¹ per cell of the energy square
const SQ = { x: 54, y: 212, k: 5.8, max: 20 }; // the square's corner, viewBox units per m s⁻¹, the axes' length

const kJ = (E: number) => `${sig(E / 1000)} kJ`;

/** The car's speed: the explore slider's, or the figure's. */
export const kineticSpeed = (fig: KineticFig, live?: number) => live ?? fig.v;

export function kineticParams(fig: KineticFig, live?: number): string {
  return live !== undefined ? `car ${fig.m} kg` : `car ${fig.m} kg, no friction or air`;
}

/** The road always slides past a moving car, so the figure always has a pause button. */
export const kineticPlays = (fig: KineticFig): boolean => fig.v > 0;

/** Distance (viewBox units) the road has slid, at a speed that may change, while `running`. */
function useScroll(speed: number, running: boolean): number {
  const [x, setX] = useState(0);
  const [road] = useState(() => ({ pos: 0 }));
  useFrame(running, (dt) => {
    road.pos += speed * dt;
    setX(road.pos);
  });
  return x;
}

type KProps = { fig: KineticFig; live?: number; playing: boolean; clock?: DrawClock };

export function KineticFigure({ fig, live, playing, clock = STILL }: KProps) {
  const { palette: p, material: m } = useTheme();
  const reduced = useReducedMotionPref();
  const vTop = kineticSpeed(fig, live);
  const plays = fig.play === true && live === undefined;
  const run = playing && !reduced && !clock.on;
  const t = useLoopTime(plays && run, vTop / ACC, 'pull-away', 1.4);
  const v = plays && !reduced ? Math.min(vTop, ACC * t) : vTop;
  const steady = useScroll(vTop * PX_PER_M, run && !plays);
  const scroll = plays ? 0.5 * ACC * t * t * PX_PER_M : steady;
  const sq = useTween(fig.square === 'shown' ? 1 : 0, undefined, 520);
  const roadY = 166 - 100 * sq;
  const scale = 1.7 - 0.7 * sq;
  const front = 222;
  const mid = front - 32 * scale;
  const ticks: string[] = [];
  for (let x = 6 - (scroll % HATCH); x < 334; x += HATCH) if (x >= 6) ticks.push(`M${x},${roadY + 8} L${x + 8},${roadY}`);
  const posts: number[] = [];
  for (let x = 20 - (scroll % POST); x < 334; x += POST) if (x >= 8) posts.push(x);
  const arrowY = roadY - 40 * scale;
  const len = KV * v * scale;
  const E = kineticEnergy(fig.m, v);

  return (
    <Group>
      {stage(clock, 
        PEN.road,
        <Group>
          <Line x1={6} y1={roadY} x2={334} y2={roadY} stroke={p.draw} strokeWidth={stroke.body} />
          <Path d={ticks.join(' ')} stroke={p.draw} strokeWidth={stroke.thin} opacity={0.55} />
          {posts.map((x) => (
            <Path key={x} d={`M${x},${roadY} V${roadY - 14} M${x - 2.5},${roadY - 14} H${x + 2.5}`} stroke={p.label} strokeWidth={stroke.thin} />
          ))}
        </Group>,
      )}
      <Group transform={`translate(${front}, ${roadY}) scale(${scale}) translate(${-front}, ${-roadY})`}>
        <Car front={front} y={roadY} id="" roll={scroll / (WHEEL_R * scale)} clock={clock} />
      </Group>
      {stage(clock, 
        PEN.labels,
        <Group>
          {len > 2 && <HollowArrow from={[mid - len / 2, arrowY]} to={[mid - len / 2 + len, arrowY]} color={p.draw} weight="track" />}
          <Tag x={mid} y={arrowY - 13} text={v < 0.05 ? 'v = 0' : `v = ${fixed(v, 1)} m s⁻¹`} />
          {fig.energy && sq < 0.5 && <MonoLabel x={mid} y={52} text={fig.energy === 'shown' ? `Ek = ${kJ(E)}` : 'Ek = ?'} color={p.ink} size={12} />}
        </Group>,
      )}
      {sq > 0.01 && (
        <Group opacity={sq}>
          <EnergySquare fig={fig} v={v} />
        </Group>
      )}
    </Group>
  );
}

/** Ek as a square of side v (one cell per 2 m s⁻¹), with its energy; with stages, the first square and the band. */
function EnergySquare({ fig, v }: { fig: KineticFig; v: number }) {
  const { palette: p, material: m } = useTheme();
  const { x: X0, y: Y0, k } = SQ;
  const side = v * k;
  const cellE = kineticEnergy(fig.m, CELL);
  const grid: string[] = [];
  for (let s = CELL; s < v - 1e-9; s += CELL) grid.push(`M${X0 + s * k},${Y0} V${Y0 - side} M${X0},${Y0 - s * k} H${X0 + side}`);
  const axis = SQ.max * k + 8;
  const u = fig.stages?.[0];
  const top = fig.stages?.[1] ?? v;
  const cx = 214;
  return (
    <Group>
      <Rect x={X0} y={Y0 - side} width={side} height={side} fill={p.drawFill} />
      {u !== undefined && <Rect x={X0} y={Y0 - u * k} width={u * k} height={u * k} fill={p.drawFillDark} />}
      <Path d={grid.join(' ')} stroke={p.draw} strokeWidth={stroke.hair} opacity={0.3} />
      <Rect x={X0} y={Y0 - side} width={side} height={side} fill="none" stroke={p.draw} strokeWidth={stroke.body} />
      {u !== undefined && <Path d={`M${X0},${Y0 - u * k} H${X0 + u * k} V${Y0}`} fill="none" stroke={p.draw} strokeWidth={stroke.body} />}
      {/* the axes: speed along both sides */}
      <Path d={`M${X0},${Y0} H${X0 + axis} M${X0},${Y0} V${Y0 - axis}`} stroke={p.label} strokeWidth={stroke.thin} />
      {[0, 10, 20].map((s) => (
        <Group key={s}>
          <Line x1={X0 + s * k} y1={Y0} x2={X0 + s * k} y2={Y0 + 4} stroke={p.label} strokeWidth={stroke.thin} />
          <MonoLabel x={X0 + s * k} y={Y0 + 14} text={s === 20 ? '20 m s⁻¹' : String(s)} color={p.label} size={8.5} />
          {s > 0 && <MonoLabel x={X0 - 6} y={Y0 - s * k + 3} text={String(s)} color={p.label} size={8.5} anchor="end" />}
        </Group>
      ))}
      <MonoLabel x={X0} y={Y0 - axis - 3} text="v" color={p.label} size={9} />
      {u !== undefined ? (
        <Group>
          <Tag x={X0 + (u * k) / 2} y={Y0 - (u * k) / 2 + 3} text={kJ(kineticEnergy(fig.m, u))} />
          {v > u + 2 && <Tag x={X0 + side / 2} y={Y0 - (u * k + side) / 2 + 3} text={`+${kJ(kineticEnergy(fig.m, top) - kineticEnergy(fig.m, u))}`} />}
          <MonoLabel x={cx} y={110} text={`0 → ${u}: ${kJ(kineticEnergy(fig.m, u))}`} color={p.ink} size={10.5} anchor="start" />
          <MonoLabel x={cx} y={128} text={`${u} → ${top}: ${kJ(kineticEnergy(fig.m, top) - kineticEnergy(fig.m, u))}`} color={p.ink} size={10.5} anchor="start" />
        </Group>
      ) : (
        <Group>
          <MonoLabel x={cx} y={110} text="Ek = ½mv²" color={p.ink} size={11} anchor="start" />
          <MonoLabel x={cx} y={127} text={`= ½×${fig.m}×${fixed(v, 1)}²`} color={p.label} size={9.5} anchor="start" />
          <MonoLabel x={cx} y={145} text={`= ${kJ(kineticEnergy(fig.m, v))}`} color={p.ink} size={11} anchor="start" />
        </Group>
      )}
      <Rect x={cx} y={168} width={9} height={9} fill={p.drawFill} stroke={p.paperLine} strokeWidth={stroke.hair} />
      <MonoLabel x={cx + 14} y={176} text={`= ${kJ(cellE)}`} color={p.label} size={9} anchor="start" />
    </Group>
  );
}

// ── The crane ──

const GROUND = 196;
const KH = 5.3; // viewBox units per metre of height
const RULER_X = 30;
const HOOK_X = 112;
const MAST_X = 196;
const JIB_Y = 14;
const CAR_SCALE = 0.85;
const BAR = { w: 30, ep: 238, ek: 288, k: 140 / 300000 }; // bars: x of each, viewBox units per joule

export const heightNow = (fig: HeightFig, live?: number) => live ?? fig.h;

export function heightParams(fig: HeightFig): string {
  return fig.match !== undefined ? `car ${fig.m} kg, Ek at ${fig.match} m s⁻¹` : `car ${fig.m} kg`;
}

export function HeightFigure({ fig, live, clock = STILL }: { fig: HeightFig; live?: number; clock?: DrawClock }) {
  const { palette: p, material: m } = useTheme();
  const h = useTween(heightNow(fig, live), undefined, live !== undefined ? 160 : 420);
  const carY = GROUND - h * KH; // the car's wheels
  const carTop = carY - 26 * CAR_SCALE;
  const ep = potentialChange(fig.m, h);
  const ek = fig.match !== undefined ? kineticEnergy(fig.m, fig.match) : undefined;
  const rungs: string[] = [];
  for (let y = GROUND; y > JIB_Y + 8; y -= 12) rungs.push(`M${MAST_X - 5},${y} L${MAST_X + 5},${y - 12}`);
  for (let x = 60; x < MAST_X; x += 12) rungs.push(`M${x},${JIB_Y + 8} L${x + 6},${JIB_Y} L${x + 12},${JIB_Y + 8}`);
  const ticks = [0, 5, 10, 15, 20, 25];

  return (
    <Group>
      {stage(clock, PEN.road, <Hatch x1={8} x2={332} y={GROUND} color={p.draw} clock={clock} from={PEN.road[0]} to={PEN.road[1]} />)}
      {stage(clock, 
        PEN.car,
        <Group>
          {/* the tower crane: a lattice mast and a jib reaching out over the car */}
          <Path d={`M${MAST_X - 5},${GROUND} V${JIB_Y} M${MAST_X + 5},${GROUND} V${JIB_Y} M60,${JIB_Y} H${MAST_X + 22} M60,${JIB_Y + 8} H${MAST_X + 22}`} stroke={p.draw} strokeWidth={stroke.body} fill="none" />
          <Path d={rungs.join(' ')} stroke={p.draw} strokeWidth={stroke.hair} opacity={0.6} fill="none" />
          <Rect x={HOOK_X - 7} y={JIB_Y + 8} width={14} height={6} fill={m.metalSide} stroke={p.draw} strokeWidth={stroke.thin} />
          {/* the cable, the hook and two slings to the car's roof */}
          <Line x1={HOOK_X} y1={JIB_Y + 14} x2={HOOK_X} y2={carTop - 12} stroke={p.draw} strokeWidth={stroke.thin} />
          <Circle cx={HOOK_X} cy={carTop - 12} r={2.4} fill={p.draw} />
          <Path d={`M${HOOK_X},${carTop - 12} L${HOOK_X - 12},${carTop + 2} M${HOOK_X},${carTop - 12} L${HOOK_X + 12},${carTop + 2}`} stroke={p.draw} strokeWidth={stroke.thin} fill="none" />
          <Group transform={`translate(${HOOK_X + 27}, ${carY}) scale(${CAR_SCALE}) translate(${-(HOOK_X + 27)}, ${-carY})`}>
            <Car front={HOOK_X + 27} y={carY} id="" roll={0} clock={clock} />
          </Group>
        </Group>,
      )}
      {stage(clock, 
        PEN.labels,
        <Group>
          {/* the height ruler */}
          <Line x1={RULER_X} y1={GROUND} x2={RULER_X} y2={GROUND - 25 * KH - 6} stroke={p.draw} strokeWidth={stroke.thin} />
          {/* the unit once, over the top of the ruler (written by each number it would run off the sheet) */}
          <MonoLabel x={RULER_X} y={GROUND - 25 * KH - 12} text="m" color={p.label} size={8.5} />
          {ticks.map((m) => (
            <Group key={m}>
              <Line x1={RULER_X} y1={GROUND - m * KH} x2={RULER_X + 5} y2={GROUND - m * KH} stroke={p.draw} strokeWidth={stroke.thin} />
              <MonoLabel x={RULER_X - 4} y={GROUND - m * KH + 3} text={m === 0 ? '' : String(m)} color={p.label} size={8.5} anchor="end" />
            </Group>
          ))}
          {h > 0.3 && (
            <Group>
              <Line x1={RULER_X + 6} y1={carY} x2={HOOK_X - 28} y2={carY} stroke={p.lineStrong} strokeWidth={stroke.thin} strokeDasharray="3 3" />
              <Tag x={50} y={carY - 5} text={`h = ${fixed(h, 1)} m`} />
            </Group>
          )}
          {/* the energy bars, one scale */}
          <EnergyBar x={BAR.ep} E={ep} name="ΔEp" fill={p.drawFillDark} />
          {ek !== undefined && (
            <Group>
              <EnergyBar x={BAR.ek} E={ek} name="Ek" fill={p.paper} />
              <Line x1={BAR.ep - 6} y1={GROUND - ek * BAR.k} x2={BAR.ek + BAR.w + 4} y2={GROUND - ek * BAR.k} stroke={p.lineStrong} strokeWidth={stroke.thin} strokeDasharray="3 3" />
            </Group>
          )}
        </Group>,
      )}
    </Group>
  );
}

function EnergyBar({ x, E, name, fill }: { x: number; E: number; name: string; fill: string }) {
  const { palette: p, material: m } = useTheme();
  const hBar = Math.max(0, E * BAR.k);
  return (
    <Group>
      <Rect x={x} y={GROUND - hBar} width={BAR.w} height={hBar} fill={fill} stroke={p.draw} strokeWidth={stroke.body} />
      <MonoLabel x={x + BAR.w / 2} y={GROUND - hBar - 6} text={kJ(E)} color={p.ink} size={9} />
      <MonoLabel x={x + BAR.w / 2} y={GROUND + 22} text={name} color={p.label} size={9.5} />
    </Group>
  );
}
