// FIG: the lab. A trolley on a smooth level bench is pulled by a string over a pulley at the end of the bench to a
// hanging mass. Let go from rest, both move with a = mg / (M + m) until the mass lands on the floor; then the string goes
// slack and the trolley rolls on at a steady speed. Every position and speed comes from pulleyRun, the forces from
// connectedAcceleration and stringTension (src/physics/dynamics), so the drawing never disagrees with the numbers.
// Played at half speed with a strobe mark under the trolley's front every 0.1 s: the gaps grow, then stay equal.
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { connectedAcceleration, pulleyRun, stringTension, weight } from '@/physics/dynamics';
import { fixed } from '@/physics/format';
import type { PulleyFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, useLoopTime, type DrawClock } from './anim';
import { ForceArrow, ForceLetter, Hatch, MonoLabel } from './draw';
import { HollowArrow, stage, Tag } from './kit';

export const PULLEY_VB = { w: 340, h: 230 };

const FLOOR = 214;
const BENCH = { x1: 10, x2: 262, top: 98, slab: 8, legs: [26, 242] };
const PULLEY = { x: 271, y: 83, r: 9 }; // its top is level with the middle of the trolley
const TROLLEY = { w: 84, h: 30, back: 14, wheel: 6 }; // `back`: where the back of the trolley starts
const HOOK_Y = PULLEY.y - PULLEY.r; // the string runs level from the trolley to the top of the pulley
const DROP_X = PULLEY.x + PULLEY.r; // the hanging part of the string
const K = 150; // viewBox units per metre
const FRONT_MAX = 248; // the clip ends before the trolley reaches the pulley
const SLOW = 2; // played at half speed
const STROBE = 0.1; // s between strobe marks
const KT = 18; // viewBox units per newton
const LEGEND = { x: 14, y: 22, step: 13 };

const PEN = { floor: [0, 0.25], bench: [0.15, 0.5], bodies: [0.4, 0.7], string: [0.6, 0.8], labels: [0.78, 0.95] } as const;

/** The hanging block: heavier masses are drawn taller. */
const blockH = (m: number) => 18 + 22 * Math.sqrt(Math.min(m, 2) / 2);
const BLOCK_W = 30;

/** The model of this set-up, with the slider's hanging mass if there is one. */
function model(fig: PulleyFig, live?: number) {
  const m = live ?? fig.hanging;
  const a = connectedAcceleration(fig.trolley, m);
  const T = stringTension(fig.trolley, m);
  const tLand = Math.sqrt((2 * fig.drop) / a);
  const vLand = a * tLand;
  const sMax = (FRONT_MAX - (TROLLEY.back + TROLLEY.w)) / K;
  const tEnd = tLand + Math.max(0, sMax - fig.drop) / vLand;
  return { m, a, T, W: weight(m), tLand, vLand, tEnd };
}

/** The given values in the sheet header; on the explore screen the acceleration and the tension it gives. */
export function pulleyParams(fig: PulleyFig, live?: number): string {
  if (live !== undefined) {
    const x = model(fig, live);
    return `a ${fixed(x.a, 2)} m s⁻² · T ${fixed(x.T, 2)} N`;
  }
  return `trolley ${fixed(fig.trolley, 2)} kg, hanging ${fixed(fig.hanging, 2)} kg`;
}

export const pulleyPlays = (fig: PulleyFig): boolean => fig.play === true;

type Props = { fig: PulleyFig; live?: number; playing: boolean; clock?: DrawClock };

export function PulleyFigure({ fig, live, playing, clock = STILL }: Props) {
  const { palette: p, material: m } = useTheme();
  const x = model(fig, live);
  // the clip stops where the mass lands, so it never answers what the trolley does next; only the screen that asks
  // about it (`at: 'landed'`) plays on, once answered, to show the trolley rolling on
  const coast = fig.at === 'landed';
  const loop = useLoopTime(playing && fig.play === true, (coast ? x.tEnd : x.tLand) * SLOW, `${x.m}`, 1.1);
  const t = fig.play === true ? loop / SLOW : fig.at === 'landed' ? x.tLand + 1e-6 : 0;
  const run = pulleyRun(t, fig.trolley, x.m, fig.drop);

  const back = TROLLEY.back + run.s * K;
  const front = back + TROLLEY.w;
  const top = BENCH.top - TROLLEY.wheel * 2 - TROLLEY.h + 3; // the body sits on its wheels
  const hb = blockH(x.m);
  const blockTop0 = FLOOR - hb - fig.drop * K;
  const blockTop = blockTop0 + Math.min(run.s, fig.drop) * K;
  const blockMid = blockTop + hb / 2;
  const slack = run.landed;

  // the string: level to the pulley, round it, down to the block; once slack it sags on both sides
  const sag = Math.min(14, (run.s - fig.drop) * K * 0.5 + 4);
  const level = slack ? `M${front},${HOOK_Y} Q${(front + PULLEY.x) / 2},${HOOK_Y + sag} ${PULLEY.x},${HOOK_Y}` : `M${front},${HOOK_Y} H${PULLEY.x}`;
  const down = slack
    ? `M${DROP_X},${PULLEY.y} C${DROP_X + 2},${blockTop - 30} ${DROP_X + 16},${blockTop - 6} ${DROP_X},${blockTop}`
    : `M${DROP_X},${PULLEY.y} V${blockTop}`;

  // strobe marks under the trolley's front, every 0.1 s so far (only while it plays)
  const marks: number[] = [];
  if (fig.play === true) for (let k = 0; k * STROBE <= t + 1e-9; k++) marks.push(TROLLEY.back + TROLLEY.w + pulleyRun(k * STROBE, fig.trolley, x.m, fig.drop).s * K);

  const tensionText = fig.tension === 'shown' ? `${fixed(x.T, 2)} N` : '?';
  const accText = fig.accel === 'shown' ? `${fixed(x.a, 2)} m s⁻²` : '?';
  const legend: string[] = [];
  if (fig.forces) legend.push(`T ${fig.tension ? tensionText : ''}`.trim(), `W ${fixed(x.W, 2)} N`);
  if (fig.accel) legend.push(`a ${accText}`);
  const showSpeed = !fig.accel && (fig.play !== undefined || fig.at === 'landed');
  const tAsked = fig.tension !== undefined && fig.tension !== 'shown';

  return (
    <Group>
      {stage(clock, PEN.floor, <Hatch x1={10} x2={330} y={FLOOR} color={p.draw} />)}

      {/* the bench, its legs, and the pulley clamped to its end */}
      {stage(clock, 
        PEN.bench,
        <Group>
          {BENCH.legs.map((lx) => (
            <Rect key={lx} x={lx} y={BENCH.top + BENCH.slab} width={6} height={FLOOR - BENCH.top - BENCH.slab} fill={m.metalSide} stroke={p.draw} strokeWidth={stroke.thin} />
          ))}
          <Rect x={BENCH.x1} y={BENCH.top} width={BENCH.x2 - BENCH.x1} height={BENCH.slab} fill={m.wood} stroke={p.draw} strokeWidth={stroke.body} />
          <Path d={`M${BENCH.x2},${BENCH.top + 1} L${PULLEY.x},${PULLEY.y} L${BENCH.x2},${BENCH.top + BENCH.slab - 1}`} fill={m.metalSide} stroke={p.draw} strokeWidth={stroke.thin} strokeLinejoin="round" />
          <Circle cx={PULLEY.x} cy={PULLEY.y} r={PULLEY.r} fill={m.metal} stroke={p.draw} strokeWidth={stroke.body} />
          <Circle cx={PULLEY.x} cy={PULLEY.y} r={2} fill={p.draw} />
          {marks.map((mx, i) => (
            <Line key={i} x1={mx} y1={BENCH.top + 1.5} x2={mx} y2={BENCH.top + BENCH.slab - 1.5} stroke={p.ink} strokeWidth={stroke.thin} />
          ))}
        </Group>,
      )}

      {/* the trolley (flat 3D: a top facet, the side, two wheels) and the hanging block */}
      {stage(clock, 
        PEN.bodies,
        <Group>
          <Path d={`M${back},${top} L${back + 6},${top - 5} H${front + 6} L${front},${top} Z`} fill={m.plasticSide} stroke={p.draw} strokeWidth={stroke.thin} strokeLinejoin="round" />
          <Rect x={back} y={top} width={TROLLEY.w} height={TROLLEY.h} rx={2} fill={m.plastic} stroke={p.draw} strokeWidth={stroke.body} />
          <Line x1={back + 4} y1={top + 17} x2={front - 4} y2={top + 17} stroke={p.draw} strokeWidth={stroke.thin} opacity={0.45} />
          {[back + 16, front - 16].map((wx) => (
            <Group key={wx}>
              <Circle cx={wx} cy={BENCH.top - TROLLEY.wheel} r={TROLLEY.wheel} fill={m.rubber} stroke={p.draw} strokeWidth={stroke.thin} />
              <Circle cx={wx} cy={BENCH.top - TROLLEY.wheel} r={1.8} fill={m.metal} />
            </Group>
          ))}
          <MonoLabel x={back + TROLLEY.w / 2} y={top + 12} text={`${fixed(fig.trolley, 2)} kg`} color={p.label} size={9} />
          <Path d={`M${DROP_X - BLOCK_W / 2},${blockTop} L${DROP_X - BLOCK_W / 2 + 5},${blockTop - 4} H${DROP_X + BLOCK_W / 2 + 5} L${DROP_X + BLOCK_W / 2},${blockTop} Z`} fill={m.metalSide} stroke={p.draw} strokeWidth={stroke.thin} strokeLinejoin="round" />
          <Rect x={DROP_X - BLOCK_W / 2} y={blockTop} width={BLOCK_W} height={hb} rx={1.5} fill={m.metal} stroke={p.draw} strokeWidth={stroke.body} />
          {/* with the forces drawn the block's W arrow takes this place; its mass is in the sheet header */}
          {!fig.forces && <MonoLabel x={DROP_X} y={blockTop + hb + 13} text={`${fixed(x.m, 2)} kg`} color={p.label} size={8} />}
        </Group>,
      )}

      {stage(clock, 
        PEN.string,
        <Group>
          <Path d={level} fill="none" stroke={p.draw} strokeWidth={stroke.thin} />
          <Path d={down} fill="none" stroke={p.draw} strokeWidth={stroke.thin} />
          <Path d={`M${PULLEY.x},${HOOK_Y} A${PULLEY.r},${PULLEY.r} 0 0 1 ${DROP_X},${PULLEY.y}`} fill="none" stroke={p.draw} strokeWidth={stroke.thin} />
          <Circle cx={front} cy={HOOK_Y} r={2.2} fill={p.draw} />
        </Group>,
      )}

      {stage(clock, 
        PEN.labels,
        <Group>
          {fig.forces && !slack && (
            <Group>
              {/* T on the trolley, at the hook; T and W on the hanging block */}
              <ForceArrow x1={front} y1={HOOK_Y} x2={front + (tAsked ? 26 : x.T * KT)} y2={HOOK_Y} color={p.force} width={3} dashed={tAsked} />
              <ForceLetter x={front + (tAsked ? 26 : x.T * KT) - 4} y={HOOK_Y - 9} text={tAsked ? 'T ?' : 'T'} color={p.force} size={13} />
              <ForceArrow x1={DROP_X} y1={blockTop} x2={DROP_X} y2={blockTop - (tAsked ? 22 : x.T * KT)} color={p.force} width={3} dashed={tAsked} />
              <ForceLetter x={DROP_X + 8} y={blockTop - (tAsked ? 22 : x.T * KT) + 4} text={tAsked ? 'T ?' : 'T'} color={p.force} size={13} anchor="start" />
              <ForceArrow x1={DROP_X} y1={blockMid} x2={DROP_X} y2={blockMid + x.W * KT} color={p.force} width={3} />
              <Circle cx={DROP_X} cy={blockMid} r={3} fill={p.force} />
              <ForceLetter x={DROP_X + 8} y={blockMid + x.W * KT - 2} text="W" color={p.force} size={13} anchor="start" />
            </Group>
          )}
          {fig.accel && (
            <Group>
              <Chevrons x={(back + front) / 2 - 8} y={top - 22} color={p.draw} />
              <MonoLabel x={(back + front) / 2 + 6} y={top - 18.5} text={`a = ${accText}`} color={p.ink} size={9.5} anchor="start" />
            </Group>
          )}
          {showSpeed && (
            <Group>
              <HollowArrow from={[(back + front) / 2 - (16 + run.v * 14) / 2, top - 12]} to={[(back + front) / 2 - (16 + run.v * 14) / 2 + 16 + run.v * 14, top - 12]} color={p.label} weight="track" />
              <Tag x={Math.max((back + front) / 2, slack ? 84 : 52)} y={top - 25} text={`v = ${fixed(run.v, 2)} m s⁻¹${slack ? ', string slack' : ''}`} />
            </Group>
          )}
          {legend.map((line, i) => (
            <MonoLabel key={line} x={LEGEND.x} y={LEGEND.y + i * LEGEND.step} text={line} color={p.ink} size={9} anchor="start" />
          ))}
          {fig.play !== undefined && marks.length > 0 && (
            <MonoLabel x={(BENCH.legs[0] + BENCH.legs[1]) / 2} y={FLOOR - 8} text="½ SPEED · MARK EVERY 0.1 s" color={p.label} size={8} />
          )}
        </Group>,
      )}
    </Group>
  );
}

/** Two chevrons pointing forward: the trolley's acceleration. */
function Chevrons({ x, y, color }: { x: number; y: number; color: string }) {
  const one = (cx: number) => `M${cx - 4},${y - 6} L${cx + 4},${y} L${cx - 4},${y + 6}`;
  return (
    <Group>
      <Path d={one(x - 5)} fill="none" stroke={color} strokeWidth={stroke.force} strokeLinecap="round" strokeLinejoin="round" />
      <Path d={one(x + 4)} fill="none" stroke={color} strokeWidth={stroke.force} strokeLinecap="round" strokeLinejoin="round" />
    </Group>
  );
}
