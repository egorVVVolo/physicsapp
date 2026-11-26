// FIG: movers raise a washing machine into a van along a smooth ramp. The ramp runs from the van's floor, h above the
// road, down to the road; the machine sits halfway up with the movers' push along the ramp from its centre of gravity.
// The push is rampPush (mg h ÷ L) and its work over L is the same as lifting the machine straight up (src/physics/work):
// both sums are written at the top. On the explore screen the slider sets the ramp's length.
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { weight } from '@/physics/dynamics';
import { liftWork, rampPush, workDone } from '@/physics/work';
import { fixed, sig } from '@/physics/format';
import type { RampFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, useTween, type DrawClock } from './anim';
import { ForceArrow, Hatch, MonoLabel } from './draw';
import { Mitten } from './SledgeFigure';
import { Dim, stage } from './kit';

export const RAMP_VB = { w: 340, h: 230 };

const PEN = { ground: [0, 0.3], van: [0.2, 0.5], ramp: [0.45, 0.7], forces: [0.68, 0.86], labels: [0.82, 0.98] } as const;
const GROUND = 198;
const K = 64; // viewBox units per metre: a 4.0 m ramp just fits
const VX = 270; // the van's back edge
const SLAB = 6;
const MACHINE = 32;
const KF = 0.25; // viewBox units per newton
const STUB = 26;

/** The ramp's length (the slider's, on the explore screen), the push along it and its work. */
export function rampNumbers(fig: RampFig, live?: number) {
  const L = live ?? fig.L;
  const F = rampPush(fig.m, fig.h, L);
  return { L, F, work: workDone(F, L), lift: liftWork(fig.m, fig.h), W: weight(fig.m) };
}

export function rampParams(fig: RampFig, live?: number): string {
  if (live === undefined) return `m = ${fig.m} kg, h = ${fixed(fig.h, 1)} m, no friction`;
  const r = rampNumbers(fig, live);
  return `push ${sig(r.F)} N · ΔW ${sig(r.work)} J`;
}

export function RampFigure({ fig, live, clock = STILL }: { fig: RampFig; live?: number; clock?: DrawClock }) {
  const { palette: p, soft } = useTheme();
  const r = rampNumbers(fig, live);
  const L = useTween(r.L, undefined, live !== undefined ? 160 : 420);
  const floorY = GROUND - fig.h * K;
  const run = Math.sqrt(Math.max(0, L * L - fig.h * fig.h)) * K;
  const foot: [number, number] = [VX - run, GROUND];
  const top: [number, number] = [VX, floorY];
  const len = Math.hypot(top[0] - foot[0], top[1] - foot[1]);
  const u: [number, number] = [(top[0] - foot[0]) / len, (top[1] - foot[1]) / len]; // up the ramp
  const nrm: [number, number] = [u[1], -u[0]]; // out of the ramp, upwards
  const mid: [number, number] = [(foot[0] + top[0]) / 2, (foot[1] + top[1]) / 2];
  const cg: [number, number] = [mid[0] + nrm[0] * (MACHINE / 2 + 2), mid[1] + nrm[1] * (MACHINE / 2 + 2)];
  const angle = (Math.atan2(u[1], u[0]) * 180) / Math.PI;
  const back: [number, number] = [cg[0] - u[0] * (MACHINE / 2), cg[1] - u[1] * (MACHINE / 2)];
  const known = fig.push === 'shown';
  const arrow = known ? r.F * KF : STUB;
  const tip: [number, number] = [cg[0] + u[0] * arrow, cg[1] + u[1] * arrow];

  return (
    <Group>
      {stage(clock, PEN.ground, <Hatch x1={8} x2={332} y={GROUND} color={p.draw} clock={clock} from={PEN.ground[0]} to={PEN.ground[1]} />)}

      {stage(clock, 
        PEN.van,
        <Group>
          {/* the back of a van: its floor, the open body above it, a wheel */}
          <Rect x={VX} y={floorY} width={340 - VX} height={SLAB} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.body} />
          <Path d={`M${VX + 4},${floorY} V${floorY - 82} H340 M${VX + 4},${floorY - 82} V${floorY - 88} H340`} fill="none" stroke={p.draw} strokeWidth={stroke.body} />
          <Circle cx={VX + 30} cy={GROUND - 12} r={12} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.body} />
          <Circle cx={VX + 30} cy={GROUND - 12} r={2.4} fill={p.draw} />
          <MonoLabel x={VX + 16} y={floorY - 64} text="Van" color={p.label} size={9} anchor="start" />
        </Group>,
      )}

      {stage(clock, 
        PEN.ramp,
        <Group>
          <Line x1={foot[0]} y1={foot[1]} x2={top[0]} y2={top[1]} stroke={p.draw} strokeWidth={stroke.force} strokeLinecap="round" />
          {/* the washing machine, square on the ramp */}
          <Group transform={`rotate(${angle} ${cg[0]} ${cg[1]})`}>
            <Rect x={cg[0] - MACHINE / 2} y={cg[1] - MACHINE / 2} width={MACHINE} height={MACHINE} rx={6} fill={soft.A.fill} stroke={soft.A.edge} strokeWidth={2} />
            <Circle cx={cg[0]} cy={cg[1] + 2} r={9} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.thin} />
          </Group>
          <Mitten who="B" x={back[0]} y={back[1]} dx={-u[0] * 0.7 + nrm[0] * 0.7} dy={-u[1] * 0.7 + nrm[1] * 0.7} />
          <MonoLabel x={back[0] - 22} y={back[1] - 18} text="Movers" color={p.label} size={9} anchor="end" />
        </Group>,
      )}

      {stage(clock, 
        PEN.forces,
        <Group>
          <ForceArrow x1={cg[0]} y1={cg[1]} x2={tip[0]} y2={tip[1]} color={p.force} dashed={!known} />
          <Circle cx={cg[0]} cy={cg[1]} r={3} fill={p.force} />
        </Group>,
      )}

      {stage(clock, 
        PEN.labels,
        <Group>
          <MonoLabel x={tip[0] + nrm[0] * 12 - 2} y={tip[1] + nrm[1] * 12} text={known ? `F = ${sig(r.F)} N` : 'F = ?'} color={p.forceText} size={9} anchor="end" />
          <Dim a={foot} b={top} offset={-14} text={`L = ${fixed(L, 1)} m`} />
          <Dim a={[318, GROUND]} b={[318, floorY + SLAB]} text={`${fixed(fig.h, 1)} m`} />
          {fig.work && (
            <Group>
              <MonoLabel x={14} y={24} text={`ramp  ${known ? sig(r.F) : '?'} N × ${fixed(r.L, 1)} m = ${known ? `${sig(r.work)} J` : '?'}`} color={p.ink} size={10} anchor="start" />
              <MonoLabel x={14} y={40} text={`lift  ${sig(r.W)} N × ${fixed(fig.h, 1)} m = ${sig(r.lift)} J`} color={p.label} size={10} anchor="start" />
            </Group>
          )}
        </Group>,
      )}
    </Group>
  );
}
