// FIG: a glass tank of water with a toy boat and a steel block (src/physics/fluids), seen from the side.
// The boat is a flat-topped pontoon: its draft is the water it displaces ÷ its footprint, its own mass plus the block's
// while the block is on deck, ÷ ρ(water). The level is (the water + everything displaced) ÷ the tank's base.
// After the revisit's Check the block is lifted off the deck (the boat rises), dropped over the side and sinks to the
// bottom; every frame the level is solved from the volume under the surface, so it falls by the model.
// On the explore screen the slider sets the block's density: the same mass, so its size follows V = m ÷ ρ; the level
// while it was on board is dashed and the fall is written. The recap shows two tanks side by side.
import type { ReactNode } from 'react';
import { G as Group, Line, Path, Rect } from 'react-native-svg';
import { floatingDisplacement, RHO_WATER, volumeOf } from '@/physics/fluids';
import { fixed, sig } from '@/physics/format';
import type { TankFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { useReducedMotionPref } from '@/ui/parts';
import { phaseOf, STILL, useLoopTime, type DrawClock } from './anim';
import { DrawnFade, Hatch, MonoLabel } from './draw';
import { AlignedDim } from './turning';

export const TANK_VB = { w: 340, h: 230 };

const PEN = { ground: [0, 0.25], tank: [0.1, 0.5], water: [0.35, 0.65], boat: [0.5, 0.8], labels: [0.75, 0.98] } as const;
const FLOOR = 204; // the tank's inside bottom
const TANK_H = 20; // cm
const HULL = { len: 14, foot: 168, h: 8 }; // the pontoon: length cm, footprint cm², height cm
const BLOCK0 = { w: 5, h: 4, V: 100 }; // the steel block: width and height cm at 100 cm³
const DROP = { lift: [0.3, 0.6], fall: [0.95, 1.1], end: 2.05 } as const; // s: lifted off the deck, then into the water
const HOLD = 1.8;

/** The block's place: on the deck (it rides on the boat), or in cm from the tank's inside left wall and above its floor. */
type Spot = 'deck' | { x: number; y: number };
type State = { carried: number; block: Spot }; // carried: 0 to 1, how much of the block's weight the boat holds

/** Water, block and boat in cm, from the figure's numbers (the block's density from the slider, if any). */
export function tankNumbers(fig: TankFig, live?: number) {
  const rho = live ?? fig.block.rho;
  const V = volumeOf(fig.block.m, rho) * 1e6; // cm³
  const k = Math.cbrt(V / BLOCK0.V);
  const area = fig.area * 1e4; // cm²
  const water = fig.water * 1e6; // cm³
  const boatOnly = floatingDisplacement(fig.boat, RHO_WATER) * 1e6;
  const withBlock = floatingDisplacement(fig.boat + fig.block.m, RHO_WATER) * 1e6;
  const width = Math.sqrt(area / 0.8); // the tank is 25 cm × 20 cm for 500 cm²: 5 : 4
  const bw = BLOCK0.w * k;
  return { rho, V, bw, bh: BLOCK0.h * k, area, water, boatOnly, withBlock, width, boatX: width * 0.34, floorX: width - 2.5 - bw / 2, onBoard: (water + withBlock) / area, onBottom: (water + boatOnly + V) / area };
}
type Num = ReturnType<typeof tankNumbers>;

/** The level (cm) with the boat carrying `carried` of the block and the block's bottom at `yb` cm above the floor. */
function levelOf(n: Num, carried: number, yb: number): number {
  const base = n.water + n.boatOnly + carried * (n.withBlock - n.boatOnly);
  const ab = n.V / n.bh; // the block's footprint, cm²
  const dry = base / n.area;
  if (dry <= yb) return dry;
  const wet = (base + n.V) / n.area;
  if (wet - yb >= n.bh) return wet;
  return (base - ab * yb) / (n.area - ab); // partly under: (base + ab(L − yb)) ÷ area = L
}

/** The boat's draft (cm) and the height of its deck above the floor (cm) for a level L. */
function boatAt(n: Num, carried: number, L: number) {
  const draft = (n.boatOnly + carried * (n.withBlock - n.boatOnly)) / HULL.foot;
  return { draft, deck: L - draft + HULL.h };
}

export const tankPlays = (fig: TankFig): boolean => fig.drop === true;

export function tankParams(fig: TankFig, live?: number): string {
  if (fig.compare) return `base ${fig.area} m², block ${fig.block.m} kg`;
  if (live !== undefined) return `block ${fig.block.m} kg, boat ${fixed(fig.boat, 2)} kg`;
  return `steel ${fig.block.m} kg, ${fig.block.rho} kg m⁻³`;
}

type Props = { fig: TankFig; live?: number; playing: boolean; clock?: DrawClock };

export function TankFigure({ fig, live, playing, clock = STILL }: Props) {
  const reduced = useReducedMotionPref();
  const n = tankNumbers(fig, live);
  const plays = tankPlays(fig) && !reduced;
  const t = useLoopTime(plays && playing && !clock.on, DROP.end, fig.drop, HOLD);
  const stage = (pen: readonly [number, number], children: ReactNode) => (
    <DrawnFade clock={clock} from={pen[0]} to={pen[1]}>
      {children}
    </DrawnFade>
  );
  if (fig.compare) {
    const k = 5.4;
    return (
      <Group>
        <TankScene n={n} k={k} x0={22} state={{ carried: 1, block: 'deck' }} clock={clock} title="ON BOARD" note={`${sig(n.withBlock - n.boatOnly)} cm³ for the block`} />
        <TankScene n={n} k={k} x0={190} state={{ carried: 0, block: { x: n.floorX, y: 0 } }} clock={clock} title="ON THE BOTTOM" note={`${sig(n.V)} cm³ for the block`} levels />
      </Group>
    );
  }
  // the drop: lifted off the deck (the boat lets go of its weight and rises), then over the side and down to the floor
  let state: State = fig.at === 'bottom' ? { carried: 0, block: { x: n.floorX, y: 0 } } : { carried: 1, block: 'deck' };
  const dropped = fig.drop === true && (reduced || t >= DROP.end - 0.01);
  if (dropped) state = { carried: 0, block: { x: n.floorX, y: 0 } };
  else if (fig.drop === true && t > DROP.lift[0]) {
    const lift = phaseOf(t, DROP.lift[0], DROP.lift[1]);
    const start = boatAt(n, 1, n.onBoard).deck;
    const up = { x: n.boatX + 1.2 + (n.floorX - n.boatX - 1.2) * lift, y: start + 6 * lift };
    // through the air and the water at a steady, eased pace
    const k = Math.max(0, Math.min(1, (t - DROP.fall[0]) / DROP.fall[1]));
    state = { carried: 1 - lift, block: { x: up.x, y: up.y * (1 - k * k * (3 - 2 * k)) } };
  }
  return (
    <Group>
      <TankScene n={n} k={7} x0={34} state={state} clock={clock} levels={fig.levels || dropped} ruler />
      {stage(PEN.labels, <Panel fig={fig} n={n} dropped={dropped} level={levelOf(n, state.carried, state.block === 'deck' ? Infinity : state.block.y)} />)}
    </Group>
  );
}

/** One tank at `k` viewBox units per cm, its inside left wall at `x0`. */
function TankScene({ n, k, x0, state, clock, levels, ruler, title, note }: { n: Num; k: number; x0: number; state: State; clock: DrawClock; levels?: boolean; ruler?: boolean; title?: string; note?: string }) {
  const { palette: p } = useTheme();
  const X = (cm: number) => x0 + cm * k;
  const Y = (cm: number) => FLOOR - cm * k;
  const w = n.width * k;
  const top = Y(TANK_H);
  const deck = state.block === 'deck';
  const L = levelOf(n, state.carried, deck ? Infinity : (state.block as { y: number }).y);
  const boat = boatAt(n, state.carried, L);
  const hullBottom = L - boat.draft;
  const bx = deck ? n.boatX + 1.2 : (state.block as { x: number }).x;
  const by = deck ? boat.deck : (state.block as { y: number }).y;
  // water: a pale fill below the surface, short dashes, a firm surface line
  const dashes: string[] = [];
  for (let yy = Y(L) + 9; yy < FLOOR - 3; yy += 9) for (let xx = x0 + 6 + ((yy / 9) % 2) * 8; xx < x0 + w - 10; xx += 16) dashes.push(`M${xx},${yy} h7`);
  const hull = hullPath(X(n.boatX), Y(hullBottom), HULL.len * k, HULL.h * k);
  const stage = (pen: readonly [number, number], children: ReactNode) => (
    <DrawnFade clock={clock} from={pen[0]} to={pen[1]}>
      {children}
    </DrawnFade>
  );
  const oldLevel = n.onBoard;
  return (
    <Group>
      {stage(PEN.ground, <Hatch x1={x0 - 12} x2={x0 + w + 12} y={FLOOR + 4} color={p.draw} clock={clock} from={PEN.ground[0]} to={PEN.ground[1]} />)}
      {stage(PEN.water, <Rect x={x0} y={Y(L)} width={w} height={FLOOR - Y(L)} fill={p.drawFill} />)}
      {stage(PEN.boat, <Block x={X(bx)} yb={Y(by)} w={n.bw * k} h={n.bh * k} />)}
      {stage(
        PEN.boat,
        <Group>
          <Path d={hull} fill={p.drawFillDark} stroke={p.draw} strokeWidth={1.5} strokeLinejoin="round" />
          <Line x1={X(n.boatX) - (HULL.len * k) / 2 + 4} y1={Y(hullBottom + HULL.h) + 3} x2={X(n.boatX) + (HULL.len * k) / 2 - 2} y2={Y(hullBottom + HULL.h) + 3} stroke={p.draw} strokeWidth={0.8} opacity={0.5} />
          {/* a bollard at the stern */}
          <Rect x={X(n.boatX) - (HULL.len * k) / 2 + 5} y={Y(hullBottom + HULL.h) - 5} width={4} height={5} fill={p.draw} />
        </Group>,
      )}
      {/* the water's dashes and surface over the boat and the block, then the glass */}
      {stage(
        PEN.water,
        <Group>
          <Path d={dashes.join(' ')} stroke={p.label} strokeWidth={0.9} opacity={0.4} />
          <Line x1={x0} y1={Y(L)} x2={x0 + w} y2={Y(L)} stroke={p.draw} strokeWidth={1.4} />
        </Group>,
      )}
      {stage(
        PEN.tank,
        <Group>
          <Path d={`M${x0 - 2},${top} V${FLOOR + 2} H${x0 + w + 2} V${top}`} stroke={p.draw} strokeWidth={2.4} fill="none" strokeLinejoin="round" />
          <Path d={`M${x0 + 3},${top + 6} V${top + 30} M${x0 + w - 3},${top + 6} V${top + 18}`} stroke={p.label} strokeWidth={1} opacity={0.5} />
          {ruler && <Ruler x={x0 - 6} k={k} />}
        </Group>,
      )}
      {levels &&
        stage(
          PEN.labels,
          <Group>
            <Line x1={x0 - 2} y1={Y(oldLevel)} x2={x0 + w + 2} y2={Y(oldLevel)} stroke={p.ink} strokeWidth={1.1} strokeDasharray="5 3" />
            <AlignedDim a={[x0 + w + 9, Y(oldLevel)]} b={[x0 + w + 9, Y(L)]} />
          </Group>,
        )}
      {title &&
        stage(
          PEN.labels,
          <Group>
            <MonoLabel x={x0 + w / 2} y={top - 26} text={title} color={p.label} size={8.5} />
            <MonoLabel x={x0 + w / 2} y={top - 12} text={note ?? ''} color={p.ink} size={9} />
            <MonoLabel x={x0 + w / 2} y={FLOOR + 22} text={`level ${fixed(L, 2)} cm`} color={p.ink} size={9} />
          </Group>,
        )}
    </Group>
  );
}

/** A pontoon boat seen from the side: flat deck, a raked bow on the right, a square stern. `x`: its middle, `yb`: its bottom. */
function hullPath(x: number, yb: number, len: number, h: number): string {
  const l = x - len / 2;
  const r = x + len / 2;
  return `M${l},${yb - h} H${r + 4} L${r - 8},${yb} H${l + 2} L${l},${yb - 3} Z`;
}

/** The steel block in flat 3D: a front face and a lighter top face. `x`: its middle, `yb`: its bottom. */
function Block({ x, yb, w, h }: { x: number; yb: number; w: number; h: number }) {
  const { palette: p } = useTheme();
  const d = Math.min(6, w * 0.18);
  return (
    <Group>
      <Path d={`M${x - w / 2},${yb - h} l${d},${-d} h${w} l${-d},${d} Z`} fill={p.drawFill} stroke={p.draw} strokeWidth={1.2} strokeLinejoin="round" />
      <Path d={`M${x + w / 2},${yb} l${d},${-d} v${-h} l${-d},${d} Z`} fill={p.label} stroke={p.draw} strokeWidth={1.2} strokeLinejoin="round" />
      <Rect x={x - w / 2} y={yb - h} width={w} height={h} fill={p.drawFillDark} stroke={p.draw} strokeWidth={1.3} />
    </Group>
  );
}

/** A cm scale on the outside of the tank's left wall, 0 to 20. */
function Ruler({ x, k }: { x: number; k: number }) {
  const { palette: p } = useTheme();
  const ticks: string[] = [];
  for (let c = 0; c <= TANK_H; c++) ticks.push(`M${x},${FLOOR - c * k} h${c % 5 === 0 ? -6 : -3}`);
  return (
    <Group>
      <Path d={ticks.join(' ')} stroke={p.label} strokeWidth={0.9} />
      {[0, 10, 20].map((c) => (
        <MonoLabel key={c} x={x - 8} y={FLOOR - c * k + 3} text={String(c)} color={p.label} size={7} anchor="end" />
      ))}
      <MonoLabel x={x - 8} y={FLOOR - TANK_H * k - 8} text="cm" color={p.label} size={7} anchor="end" />
    </Group>
  );
}

/** The numbers beside the tank: what the boat displaces, or the two levels. */
function Panel({ fig, n, dropped, level }: { fig: TankFig; n: Num; dropped: boolean; level: number }) {
  const { palette: p } = useTheme();
  const x = 232;
  const right = 334;
  const rows: [string, string, boolean?][] = [];
  if (fig.pushed) {
    rows.push(['boat', `${sig(n.boatOnly)} cm³`]);
    rows.push(['block', fig.pushed === 'shown' ? `${sig(n.withBlock - n.boatOnly)} cm³` : '? cm³', true]);
    rows.push(['total', fig.pushed === 'shown' ? `${sig(n.withBlock)} cm³` : '?']);
  } else if (fig.levels || dropped) {
    rows.push(['before', `${fixed(n.onBoard, 2)} cm`]);
    rows.push(['after', `${fixed(n.onBottom, 2)} cm`]);
    rows.push(['fall', `${fixed(n.onBoard - n.onBottom, 2)} cm`, true]);
    if (fig.levels) rows.push(['block', `${sig(n.V)} cm³`]);
  } else {
    rows.push(['level', `${fixed(level, 2)} cm`]);
    rows.push(['boat', `${fixed(fig.boat, 2)} kg`]);
    rows.push(['base', `${sig(n.area)} cm²`]);
  }
  const title = fig.pushed ? 'DISPLACED' : fig.levels || dropped ? 'LEVEL' : 'TANK';
  return (
    <Group>
      <MonoLabel x={x} y={58} text={title} color={p.label} size={9} anchor="start" />
      {rows.map(([k, val, strong], i) => (
        <Group key={k}>
          <MonoLabel x={x} y={84 + i * 26} text={k} color={p.label} size={8.5} anchor="start" />
          <MonoLabel x={right} y={84 + i * 26} text={val} color={p.ink} size={strong ? 11 : 10} anchor="end" />
          <Line x1={x} y1={91 + i * 26} x2={right} y2={91 + i * 26} stroke={p.paperLine} strokeWidth={0.8} />
        </Group>
      ))}
    </Group>
  );
}
