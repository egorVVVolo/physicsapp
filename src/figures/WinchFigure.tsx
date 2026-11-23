// FIG: an electric winch lifts a pallet of bricks (src/physics/power). The winch stands on the top platform of a
// scaffold; its cable runs up over a pulley at the end of a jib and down to the pallet, which rises at a steady speed
// by the model, v = h ÷ t, and starts again from the ground. Beside it, the motor's power flow drawn to one scale:
// the power taken from the mains splits into the useful power (mgh ÷ t, lifting the bricks) and the rest, which heats
// the motor; "?" until the question is answered.
// On the explore screen the slider sets the load and the useful power stays the same, so the pallet rises at
// v = P ÷ mg: the cable's pull T (= mg at a steady speed) grows and the speed falls. A panel works out P = Tv.
import { useEffect, useRef, useState } from 'react';
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { weight } from '@/physics/dynamics';
import { potentialChange } from '@/physics/energy';
import { efficiency, liftSpeed, power } from '@/physics/power';
import { fixed, sig } from '@/physics/format';
import type { WinchFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { useReducedMotionPref } from '@/ui/parts';
import { STILL, useTween, type DrawClock } from './anim';
import { ForceArrow, ForceLetter, Hatch, MonoLabel } from './draw';
import { Dim, HollowArrow, stage } from './kit';

export const WINCH_VB = { w: 340, h: 230 };

const PEN = { ground: [0, 0.25], frame: [0.15, 0.5], load: [0.4, 0.65], flow: [0.6, 0.85], labels: [0.8, 0.98] } as const;
const GROUND = 206;
const K = 16; // viewBox units per metre of height
const TOWER = { x1: 30, x2: 114, top: 74 }; // the scaffold and its top platform
const JIB_Y = 18;
const PULLEY: Pt = [154, 31];
const PR = 6;
const CABLE_X = PULLEY[0] + PR; // the pallet hangs under the pulley's right side
const KT = 0.015; // viewBox units per newton of the cable's pull
const HOLD = 0.9; // s the pallet rests at the top before it starts again
const FLOW = { x0: 206, split: 252, x1: 318, y: 112, k: 40 / 1200 }; // the power-flow diagram: viewBox units per watt of band
const HEAT_R = 10; // inner radius of the heating band's turn

type Pt = [number, number];

/** The numbers of the lift: the load (the slider's, on the explore screen), the useful power and the speed. */
export function winchNumbers(fig: WinchFig, live?: number) {
  const useful = power(potentialChange(fig.m, fig.h), fig.t);
  const m = live ?? fig.m;
  return { m, useful, v: liftSpeed(useful, m), T: weight(m), eff: efficiency(useful, fig.input), heat: fig.input - useful };
}

export const winchPlays = (fig: WinchFig): boolean => fig.play === true;

const watts = (P: number) => (P >= 1000 ? `${sig(P / 1000)} kW` : `${sig(P)} W`);

export function winchParams(fig: WinchFig, live?: number): string {
  if (live !== undefined) return `useful power ${watts(winchNumbers(fig, live).useful)}, steady speed`;
  return `${fig.m} kg up ${fixed(fig.h, 1)} m in ${fig.t} s`;
}

/** Height (m) of the pallet: it rises at v from the ground to h, rests, and starts again, while `running`. */
function useRise(v: number, h: number, running: boolean): number {
  const [s, setS] = useState(0);
  const pos = useRef(0);
  const rest = useRef(0);
  const speed = useRef(v);
  speed.current = v;
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (pos.current >= h) {
        rest.current += dt;
        if (rest.current > HOLD) {
          pos.current = 0;
          rest.current = 0;
        }
      } else pos.current = Math.min(h, pos.current + speed.current * dt);
      setS(pos.current);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [running, h]);
  return s;
}

type Props = { fig: WinchFig; live?: number; playing: boolean; clock?: DrawClock };

export function WinchFigure({ fig, live, playing, clock = STILL }: Props) {
  const { palette: p, material: m } = useTheme();
  const reduced = useReducedMotionPref();
  const n = winchNumbers(fig, live);
  const explore = live !== undefined;
  const moves = (winchPlays(fig) || explore) && !reduced;
  const rise = useRise(n.v, fig.h, moves && playing && !clock.on);
  const s = moves ? rise : explore ? fig.h * 0.5 : fig.h * 0.62;
  const yb = GROUND - s * K; // the bottom of the pallet
  const hook = yb - 31;
  const tLen = useTween(n.T * KT, undefined, 160);
  const braces: string[] = [];
  const bays = [GROUND, 160, 117, TOWER.top];
  for (let i = 0; i < bays.length - 1; i++) {
    const [y1, y2] = [bays[i], bays[i + 1]];
    braces.push(`M${TOWER.x1 + 4},${y1} L${TOWER.x2 - 4},${y2} M${TOWER.x1},${y2} H${TOWER.x2}`);
  }
  const drum: Pt = [74, 60];

  return (
    <Group>
      {stage(clock, PEN.ground, <Hatch x1={8} x2={188} y={GROUND} color={p.draw} clock={clock} from={PEN.ground[0]} to={PEN.ground[1]} />)}

      {stage(clock, 
        PEN.frame,
        <Group>
          {/* the scaffold: two standards, ledgers and braces, the top platform */}
          <Path d={`M${TOWER.x1 + 4},${GROUND} V${TOWER.top} M${TOWER.x2 - 4},${GROUND} V${TOWER.top}`} stroke={p.draw} strokeWidth={stroke.body} fill="none" />
          <Path d={braces.join(' ')} stroke={p.draw} strokeWidth={stroke.thin} opacity={0.7} fill="none" />
          <Rect x={TOWER.x1 - 2} y={TOWER.top - 4} width={TOWER.x2 - TOWER.x1 + 4} height={5} fill={m.metalSide} stroke={p.draw} strokeWidth={stroke.thin} />
          {/* the mast and the jib (a small truss), the pulley under its end */}
          <Path d={`M${TOWER.x1 + 8},${TOWER.top - 4} V${JIB_Y}`} stroke={p.draw} strokeWidth={stroke.force} />
          <Path d={`M${TOWER.x1 + 4},${JIB_Y} H${PULLEY[0] + 10} M${TOWER.x1 + 4},${JIB_Y + 6} H${PULLEY[0] + 10} V${JIB_Y}`} stroke={p.draw} strokeWidth={stroke.body} fill="none" />
          <Path d={Array.from({ length: 9 }, (_, i) => `M${TOWER.x1 + 8 + i * 13},${JIB_Y + 6} L${TOWER.x1 + 14.5 + i * 13},${JIB_Y}`).join(' ')} stroke={p.draw} strokeWidth={stroke.thin} opacity={0.7} />
          <Line x1={PULLEY[0]} y1={JIB_Y + 6} x2={PULLEY[0]} y2={PULLEY[1]} stroke={p.draw} strokeWidth={stroke.body} />
          <Circle cx={PULLEY[0]} cy={PULLEY[1]} r={PR} fill={m.metal} stroke={p.draw} strokeWidth={stroke.body} />
          <Circle cx={PULLEY[0]} cy={PULLEY[1]} r={1.6} fill={p.draw} />
          {/* the winch: a motor box with its drum */}
          <Rect x={50} y={52} width={24} height={18} rx={2} fill={m.metalSide} stroke={p.draw} strokeWidth={stroke.body} />
          <Path d="M54,57 H70 M54,61 H70 M54,65 H70" stroke={p.draw} strokeWidth={stroke.hair} opacity={0.5} />
          <Circle cx={drum[0] + 6} cy={drum[1]} r={7} fill={m.metal} stroke={p.draw} strokeWidth={stroke.body} />
          <MonoLabel x={62} y={84} text="WINCH" color={p.label} size={7.5} />
          {/* the cable: from the drum up over the pulley, down to the hook */}
          <Path d={`M${drum[0] + 6},${drum[1] - 7} L${PULLEY[0] - 1},${PULLEY[1] - PR} M${CABLE_X},${PULLEY[1]} V${hook}`} stroke={p.draw} strokeWidth={stroke.thin} fill="none" />
        </Group>,
      )}

      {stage(clock, PEN.load, <Pallet x={CABLE_X} yb={yb} />)}

      {stage(clock, PEN.flow, explore ? <Panel fig={fig} n={n} /> : <Flow fig={fig} n={n} />)}

      {stage(clock, 
        PEN.labels,
        <Group>
          <Dim a={[124, GROUND]} b={[124, GROUND - fig.h * K]} text={`${fixed(fig.h, 1)} m`} />
          {explore && (
            <Group>
              {/* the cable's pull up from the bricks' middle, and the pallet's velocity beside it */}
              <ForceArrow x1={CABLE_X} y1={yb - 11} x2={CABLE_X} y2={yb - 11 - tLen} color={p.force} width={3} />
              <Circle cx={CABLE_X} cy={yb - 11} r={2.6} fill={p.force} />
              <ForceLetter x={CABLE_X + 8} y={yb - 18 - tLen / 2} text="T" color={p.force} size={13} anchor="start" />
              <HollowArrow from={[CABLE_X - 30, yb - 2]} to={[CABLE_X - 30, yb - 2 - Math.max(8, n.v * 14)]} color={p.draw} weight="thin" />
            </Group>
          )}
        </Group>,
      )}
    </Group>
  );
}

/** A wooden pallet with three courses of bricks, slung from a hook. `yb`: the pallet's bottom. */
function Pallet({ x, yb }: { x: number; yb: number }) {
  const { palette: p, material: m } = useTheme();
  const w = 36;
  const joints: string[] = [];
  for (let r = 0; r < 3; r++) {
    const y = yb - 4 - (r + 1) * 5;
    joints.push(`M${x - w / 2 + 1},${y} H${x + w / 2 - 1}`);
    for (let c = r % 2 ? 6 : 0; c < w; c += 12) if (c > 0) joints.push(`M${x - w / 2 + c},${y} V${y + 5}`);
  }
  return (
    <Group>
      <Path d={`M${x - w / 2 + 2},${yb - 19} L${x},${yb - 31} L${x + w / 2 - 2},${yb - 19}`} stroke={p.draw} strokeWidth={stroke.thin} fill="none" />
      <Circle cx={x} cy={yb - 31} r={2.4} fill="none" stroke={p.draw} strokeWidth={stroke.thin} />
      <Rect x={x - w / 2 + 1} y={yb - 19} width={w - 2} height={15} fill={m.carB} stroke={p.draw} strokeWidth={stroke.thin} />
      <Path d={joints.join(' ')} stroke={p.draw} strokeWidth={stroke.hair} opacity={0.6} />
      <Rect x={x - w / 2 - 2} y={yb - 4} width={w + 4} height={4} fill={m.wood} stroke={p.draw} strokeWidth={stroke.thin} />
    </Group>
  );
}

/** The motor's power flow to one scale: in from the mains, then useful (lifting) and heating, or "?" until shown. */
function Flow({ fig, n }: { fig: WinchFig; n: ReturnType<typeof winchNumbers> }) {
  const { palette: p, material: m } = useTheme();
  const { x0, split, x1, y, k } = FLOW;
  const tIn = fig.input * k;
  const tUse = n.useful * k;
  const tHeat = tIn - tUse;
  const shown = fig.useful === 'shown';
  const head = (yTop: number, th: number) => `L${x1},${yTop - 4} L${x1 + 14},${yTop + th / 2} L${x1},${yTop + th + 4}`;
  // useful: straight on; heating: the bottom of the band turns down (clockwise about a centre below it) to an arrow
  const useful = `M${split},${y} H${x1} ${head(y, tUse)} L${x1},${y + tUse} H${split} Z`;
  const rIn = HEAT_R;
  const rOut = rIn + tHeat;
  const xL = split + rIn;
  const xR = split + rOut;
  const yDown = y + tIn + rIn; // where the turn ends and the band runs straight down
  const heat = `M${split},${y + tUse} A${rOut},${rOut} 0 0 1 ${xR},${yDown} V178 L${xR + 4},178 L${(xL + xR) / 2},192 L${xL - 4},178 L${xL},178 V${yDown} A${rIn},${rIn} 0 0 0 ${split},${y + tIn} Z`;
  const hatch: string[] = [];
  for (let yy = yDown + 2; yy + 5 < 178; yy += 6) hatch.push(`M${xL + 1.5},${yy + 5} L${xR - 1.5},${yy}`);
  return (
    <Group>
      <MonoLabel x={x0} y={y - 46} text="POWER FLOW" color={p.label} size={8} anchor="start" />
      <MonoLabel x={x0} y={y - 21} text="IN" color={p.label} size={8} anchor="start" />
      <MonoLabel x={x0} y={y - 8} text={watts(fig.input)} color={p.ink} size={10} anchor="start" />
      <Rect x={x0} y={y} width={split - x0} height={tIn} fill={p.drawFillDark} />
      <Path d={`M${x0},${y} H${split} M${x0},${y + tIn} H${split} M${x0},${y} V${y + tIn}`} stroke={p.draw} strokeWidth={stroke.thin} fill="none" />
      {shown ? (
        <Group>
          <Path d={useful} fill={p.drawFillDark} stroke={p.draw} strokeWidth={stroke.thin} strokeLinejoin="round" />
          <Path d={heat} fill={p.drawFill} stroke="none" />
          <Path d={hatch.join(' ')} stroke={p.draw} strokeWidth={stroke.hair} opacity={0.35} />
          <Path d={heat} fill="none" stroke={p.draw} strokeWidth={stroke.thin} strokeLinejoin="round" />
          <MonoLabel x={x1 + 14} y={y - 21} text="USEFUL" color={p.label} size={8} anchor="end" />
          <MonoLabel x={x1 + 14} y={y - 8} text={watts(n.useful)} color={p.ink} size={10} anchor="end" />
          <MonoLabel x={xR + 8} y={165} text="HEATING" color={p.label} size={8} anchor="start" />
          <MonoLabel x={xR + 8} y={182} text={watts(n.heat)} color={p.ink} size={9.5} anchor="start" />
        </Group>
      ) : (
        <Group>
          <Path d={`M${split},${y} H${x1} ${head(y, tIn)} L${x1},${y + tIn} H${split}`} fill="none" stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="4 3" strokeLinejoin="round" />
          <MonoLabel x={(split + x1) / 2 + 4} y={y + tIn / 2 + 4} text="?" color={p.ink} size={13} />
          <MonoLabel x={x1 + 14} y={y - 21} text="USEFUL" color={p.label} size={8} anchor="end" />
        </Group>
      )}
      {fig.efficiency && (
        <MonoLabel x={x0} y={214} text={fig.efficiency === 'shown' ? `efficiency = ${sig(n.eff * 100)}%` : 'efficiency = ?'} color={p.ink} size={11} anchor="start" />
      )}
    </Group>
  );
}

/** The explore: the same useful power, P = Tv worked out for the slider's load. */
function Panel({ fig, n }: { fig: WinchFig; n: ReturnType<typeof winchNumbers> }) {
  const { palette: p, material: m } = useTheme();
  const x = 198;
  const rows: [string, string][] = [
    ['load', `${n.m} kg`],
    ['T = mg', `${sig(n.T)} N`],
    ['P', watts(n.useful)],
    ['v = P ÷ T', `${fixed(n.v, n.v < 1 ? 3 : 2)} m s⁻¹`],
  ];
  return (
    <Group>
      <MonoLabel x={x} y={62} text="P = Tv" color={p.label} size={9} anchor="start" />
      {rows.map(([k, val], i) => (
        <Group key={k}>
          <MonoLabel x={x} y={88 + i * 26} text={k} color={p.label} size={8.5} anchor="start" />
          <MonoLabel x={332} y={88 + i * 26} text={val} color={i === 1 ? p.forceText : p.ink} size={10} anchor="end" />
          <Line x1={x} y1={95 + i * 26} x2={332} y2={95 + i * 26} stroke={p.paperLine} strokeWidth={stroke.hair} />
        </Group>
      ))}
      <MonoLabel x={x} y={204} text={`${fixed(fig.h, 1)} m up in ${sig(fig.h / n.v)} s`} color={p.label} size={9} anchor="start" />
    </Group>
  );
}
