// FIG: a block on a newtonmeter, lowered into a displacement can (src/physics/fluids). The can is filled to its spout,
// so every cm³ of block that goes under the surface pushes one cm³ of water out of the spout into a measuring cylinder.
// The upthrust is the weight of that water, U = ρVg, and the newtonmeter reads W − U. On the explore screen the slider
// sets how deep the block's bottom is: the stand's clamp, the newtonmeter and the block move down together, and the
// reading, the overflow and U follow the volume under the surface; once the block is under, nothing changes any more.
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { weight } from '@/physics/dynamics';
import { apparentWeight, RHO_WATER, submergedVolume, upthrust, volumeOf } from '@/physics/fluids';
import { fixed, sig } from '@/physics/format';
import type { DunkFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, type DrawClock } from './anim';
import { ForceArrow, ForceLetter, Hatch, MonoLabel } from './draw';
import { stage, Rows } from './kit';

export const DUNK_VB = { w: 340, h: 230 };

const PEN = { ground: [0, 0.25], stand: [0.1, 0.45], can: [0.3, 0.6], hang: [0.5, 0.8], labels: [0.75, 0.98] } as const;
const BENCH = 210;
const K = 8; // viewBox units per cm
const CAN = { x1: 92, x2: 172, bottom: 206, top: 114 };
const SURFACE = 128; // the water stands at the spout
const CX = 132; // the block, the string and the newtonmeter hang on this line
const CYL = { x1: 196, x2: 216, bottom: 206, top: 136, perCm3: 0.44 }; // the measuring cylinder: viewBox units per cm³
const METER = { h: 40, w: 16, string: 40 }; // the newtonmeter stays above the can even with the block at the bottom
const KF = 30; // viewBox units per newton of the upthrust

/** The numbers of the dunk: the block's size, how much of it is under, the upthrust and the reading. */
export function dunkNumbers(fig: DunkFig, live?: number) {
  const depth = live !== undefined ? live / 100 : fig.depth; // m
  const V = volumeOf(fig.m, fig.rho);
  const base = V / fig.h;
  const under = submergedVolume(base, fig.h, depth);
  const W = weight(fig.m);
  const U = upthrust(RHO_WATER, under);
  return { depth, V, base, under, W, U, reading: apparentWeight(W, U), side: Math.sqrt(base) * 100 /* cm */ };
}

export function dunkParams(fig: DunkFig, live?: number): string {
  if (live !== undefined) return 'can filled to the spout';
  return `steel ${fig.m} kg, ${fig.rho} kg m⁻³`;
}

type Props = { fig: DunkFig; live?: number; clock?: DrawClock };

export function DunkFigure({ fig, live, clock = STILL }: Props) {
  const { palette: p, soft, material: m } = useTheme();
  const n = dunkNumbers(fig, live);
  const bw = n.side * K;
  const bh = fig.h * 100 * K;
  const yb = SURFACE + n.depth * 100 * K; // the block's bottom
  const ytop = yb - bh;
  const meterTop = ytop - METER.string - METER.h;
  const armY = meterTop - 6;
  // the newtonmeter's pointer: 0 to 10 N down its window
  const win = { y1: meterTop + 7, y2: meterTop + METER.h - 7 };
  const showReading = fig.reading === 'shown';
  const pointer = win.y1 + ((win.y2 - win.y1) * (fig.reading ? n.reading : n.W)) / 10; // hidden while the reading is asked for
  const ticks: string[] = [];
  for (let i = 0; i <= 10; i++) ticks.push(`M${CX - 4},${win.y1 + ((win.y2 - win.y1) * i) / 10} h${i % 5 === 0 ? 5 : 3}`);
  // water in the can (below the spout), the overflow in the cylinder
  const cm3 = n.under * 1e6;
  const cylWater = cm3 * CYL.perCm3;
  const overflowShown = fig.overflow === 'shown';
  const cylTicks: string[] = [];
  for (let v = 10; v * CYL.perCm3 < CYL.bottom - CYL.top - 4; v += 10) cylTicks.push(`M${CYL.x1},${CYL.bottom - v * CYL.perCm3} h${v % 50 === 0 ? 7 : 4}`);
  const uLen = n.U * KF;
  const uFrom = yb - Math.min(bh, n.depth * 100 * K) / 2; // the middle of the part under the surface

  return (
    <Group>
      {stage(clock, PEN.ground, <Hatch x1={8} x2={226} y={BENCH} color={p.draw} clock={clock} from={PEN.ground[0]} to={PEN.ground[1]} />)}

      {stage(clock, 
        PEN.stand,
        <Group>
          {/* the stand: a base, a rod, a clamp at the newtonmeter's height */}
          <Rect x={14} y={BENCH - 6} width={56} height={6} rx={2} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.thin} />
          <Line x1={30} y1={BENCH - 6} x2={30} y2={6} stroke={p.draw} strokeWidth={stroke.force} />
          <Rect x={25} y={armY - 5} width={10} height={10} rx={2} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.thin} />
          <Line x1={35} y1={armY} x2={CX + 4} y2={armY} stroke={p.draw} strokeWidth={stroke.body} />
          <Path d={`M${CX},${armY} V${meterTop}`} stroke={p.draw} strokeWidth={stroke.thin} />
        </Group>,
      )}

      {stage(clock, 
        PEN.can,
        <Group>
          {/* the can's water up to the spout, the overflow in the cylinder */}
          <Rect x={CAN.x1} y={SURFACE} width={CAN.x2 - CAN.x1} height={CAN.bottom - SURFACE} fill={m.water} />
          <Rect x={CYL.x1} y={CYL.bottom - cylWater} width={CYL.x2 - CYL.x1} height={cylWater} fill={m.water} />
        </Group>,
      )}

      {stage(clock, 
        PEN.hang,
        <Group>
          {/* the newtonmeter: a body with a window, a scale and a pointer; the string down to the block */}
          <Rect x={CX - METER.w / 2} y={meterTop} width={METER.w} height={METER.h} rx={5} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.thin} />
          <Rect x={CX - 4} y={win.y1 - 2} width={8} height={win.y2 - win.y1 + 4} fill={p.paper} stroke={p.draw} strokeWidth={stroke.hair} />
          <Path d={ticks.join(' ')} stroke={p.label} strokeWidth={stroke.hair} />
          {fig.reading !== 'afterCheck' && <Line x1={CX - 6} y1={pointer} x2={CX + 6} y2={pointer} stroke={p.ink} strokeWidth={stroke.body} />}
          <Line x1={CX} y1={meterTop + METER.h} x2={CX} y2={ytop} stroke={p.draw} strokeWidth={stroke.thin} />
          <Circle cx={CX} cy={ytop} r={1.6} fill={p.draw} />
          <Rect x={CX - bw / 2} y={ytop} width={bw} height={bh} rx={3} fill={soft.B.fill} stroke={soft.B.edge} strokeWidth={2} />
          {/* the reading, beside the newtonmeter */}
          {fig.reading && (
            <Group>
              <Rect x={CX - 70} y={meterTop + METER.h / 2 - 11} width={52} height={20} rx={3} fill={p.paper} stroke={p.paperLine} strokeWidth={stroke.thin} />
              <MonoLabel x={CX - 44} y={meterTop + METER.h / 2 + 3} text={showReading ? `${sig(n.reading)} N` : '? N'} color={p.ink} size={10.5} />
            </Group>
          )}
        </Group>,
      )}

      {stage(clock, 
        PEN.can,
        <Group>
          {/* the water's surface over the block, then the can and its spout, the cylinder and its scale */}
          <Line x1={CAN.x1} y1={SURFACE} x2={CAN.x2} y2={SURFACE} stroke={p.draw} strokeWidth={stroke.thin} />
          <Path d={`M${CAN.x1 - 2},${CAN.top} V${CAN.bottom + 2} H${CAN.x2 + 2} V${CAN.top}`} stroke={p.draw} strokeWidth={stroke.force} fill="none" strokeLinejoin="round" />
          <Path d={`M${CAN.x2 + 2},${SURFACE - 3} L${CYL.x1 + 8},${SURFACE + 3} M${CAN.x2 + 2},${SURFACE + 3} L${CYL.x1 + 6},${SURFACE + 9}`} stroke={p.draw} strokeWidth={stroke.body} fill="none" />
          {cm3 > 0.5 && <Path d={`M${CYL.x1 + 7},${SURFACE + 6} Q${CYL.x1 + 9},${SURFACE + 12} ${CYL.x1 + 9},${CYL.bottom - cylWater}`} stroke={p.label} strokeWidth={stroke.thin} fill="none" opacity={n.depth * 100 * K < bh ? 0.7 : 0} />}
          {cylWater > 0.5 && <Line x1={CYL.x1} y1={CYL.bottom - cylWater} x2={CYL.x2} y2={CYL.bottom - cylWater} stroke={p.draw} strokeWidth={stroke.thin} />}
          <Path d={`M${CYL.x1},${CYL.top} V${CYL.bottom} H${CYL.x2} V${CYL.top}`} stroke={p.draw} strokeWidth={stroke.body} fill="none" />
          <Rect x={CYL.x1 - 5} y={CYL.bottom} width={CYL.x2 - CYL.x1 + 10} height={3} fill={p.draw} />
          {overflowShown && <Path d={cylTicks.join(' ')} stroke={p.label} strokeWidth={stroke.hair} />}
        </Group>,
      )}

      {fig.forces &&
        n.U > 0.01 &&
        stage(clock, 
          PEN.labels,
          <Group>
            {/* the upthrust, from the middle of the part under the surface (the centre of the water it displaced) */}
            <ForceArrow x1={CX} y1={uFrom} x2={CX} y2={uFrom - uLen} color={p.force} width={3} />
            <Circle cx={CX} cy={uFrom} r={2.6} fill={p.force} />
            <ForceLetter x={CX + 9} y={uFrom - uLen / 2 + 2} text="U" color={p.force} size={13} anchor="start" />
          </Group>,
        )}

      {stage(clock, PEN.labels, <Panel fig={fig} n={n} cm3={cm3} />)}
    </Group>
  );
}

/** The numbers beside the can. */
function Panel({ fig, n, cm3 }: { fig: DunkFig; n: ReturnType<typeof dunkNumbers>; cm3: number }) {
  const { palette: p } = useTheme();
  const x = 230;
  const right = 334;
  const over = fig.overflow === 'shown' ? `${sig(cm3, cm3 < 10 ? 2 : 3)} cm³` : '? cm³';
  const rows: [string, string, string?][] = [];
  if (fig.inAir) rows.push(['in air', `${sig(n.W)} N`]);
  else rows.push(['mass', `${fig.m} kg`]);
  if (fig.reading) rows.push(['reading', fig.reading === 'shown' ? `${sig(n.reading)} N` : '? N']);
  else rows.push(['ρ', `${fig.rho} kg m⁻³`]);
  rows.push(['overflow', cm3 < 0.5 && fig.overflow === 'shown' ? '0 cm³' : over]);
  if (fig.forces) rows.push(['weighs', `${n.U < 0.005 ? '0' : fixed(n.U, 3)} N`, p.forceText]);
  return (
    <Group>
      <MonoLabel x={x} y={40} text={fig.reading ? 'Newtonmeter' : 'Block'} color={p.label} size={8.5} anchor="start" />
      <Rows rows={rows} x={x} right={right} y0={64} step={26} note={fig.forces ? { text: '= U (upthrust)', color: p.forceText } : undefined} />
    </Group>
  );
}
