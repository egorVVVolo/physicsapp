// FIG: the same small steel ball, seen from itself, sinking through glycerol (left) and through water (right). In the
// ball's frame the liquid streams up past it.
// Glycerol: laminar flow. The streamlines are lines of constant ψ of Stokes flow past a sphere (src/physics/viscosity),
// so they never cross, and dashes stream along them. Water: the ball drops about 60 times as fast (turbulentTerminal);
// the flow comes round the front smoothly, then breaks away and curls into eddies behind it, which spin and drift.
// That half is a sketch, not a model: no simple law gives turbulent flow. Both panels are tap targets.
import { useMemo } from 'react';
import { G as Group, Line, Path } from 'react-native-svg';
import { sig } from '@/physics/format';
import { glycerolViscosity, RHO_GLYCEROL, stokesTerminal, streamlineOffset, turbulentTerminal } from '@/physics/viscosity';
import { FLOW_IDS, type FlowFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { STILL, useLoopTime, type DrawClock } from './anim';
import { MonoLabel } from './draw';
import type { TapProps, TapTarget } from './Sheet';
import { stage, TapBoxes } from './kit';

export const FLOW_VB = { w: 340, h: 230 };

const PEN = { lines: [0, 0.6], ball: [0.3, 0.7], labels: [0.7, 0.98] } as const;
const A = 15; // the ball's radius in the drawing
const CY = 128; // the ball's centre
const TOP = 38;
const BOTTOM = 198;
const CX = { glycerol: 88, water: 252 } as const;
const OFFSETS = [0.3, 0.75, 1.3, 2.0, 2.9, 3.6]; // far upstream, in ball radii
const DASH = 14; // the dashes' period
const LOOP = 2.4; // s

export const flowParams = (fig: FlowFig): string => `one ${sig(fig.r * 2000, 2)} mm ball, seen from it`;

export function flowTargets(): TapTarget[] {
  const names = { glycerol: 'the ball in glycerol', water: 'the ball in water' };
  return FLOW_IDS.map((id) => ({ id, x: CX[id] - 80, y: 8, w: 160, h: 214, label: names[id] }));
}

/** A streamline of Stokes flow, `offset` radii from the axis far away, on one side (±1), from the bottom up. */
function stokesLine(cx: number, offset: number, side: 1 | -1): string {
  const pts: string[] = [];
  for (let y = BOTTOM; y >= TOP; y -= 4) {
    const along = (CY - y) / A; // upwards, in radii
    const x = cx + side * streamlineOffset(along, offset, 1) * A;
    pts.push(`${x.toFixed(1)},${y}`);
  }
  return `M${pts.join(' L')}`;
}

/** Ideal flow round the front of a sphere: ψ = ½ρ²(1 − a³/R³); the distance from the axis of the line that starts `offset` out. */
function frontOffset(along: number, offset: number): number {
  const psi = (d: number) => 0.5 * d * d * (1 - 1 / Math.max(1, Math.hypot(along, d)) ** 3);
  let lo = Math.abs(along) >= 1 ? 0 : Math.sqrt(1 - along * along);
  let hi = offset + 3;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (psi(mid) < 0.5 * offset * offset) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

const WAKE = 1.0; // lines that start closer to the axis than this (in radii) break away into the wake

/**
 * A sketch of turbulent flow: smooth round the front of the ball (ideal flow), then the line breaks away beside it. Lines
 * near the axis end at the ball's side; the outer ones are pushed out by the widening wake and waver more and more.
 */
function turbulentLine(cx: number, offset: number, side: 1 | -1, t: number): string {
  const pts: string[] = [];
  const atSide = frontOffset(0, offset);
  for (let y = BOTTOM; y >= TOP; y -= 4) {
    const along = (CY - y) / A;
    if (along > 0 && offset < WAKE) break;
    let d = along <= 0 ? frontOffset(along, offset) : atSide;
    if (along > 0) {
      const wake = 1.05 + 0.13 * along;
      d = Math.max(d - 0.2 * Math.min(1, along / 2), wake + (offset - WAKE) * 0.9);
      d += (Math.sin(along * 1.7 - t * 2.6 + offset * 2 + (side > 0 ? 0 : 1.6)) * Math.min(0.4, along * 0.11) * 1.4) / Math.max(1, offset);
    }
    pts.push(`${(cx + side * d * A).toFixed(1)},${y}`);
  }
  return `M${pts.join(' L')}`;
}

/** An eddy: a spiral of 1.6 turns, turned by `angle`, spinning one way or the other. */
function eddy(x: number, y: number, r: number, angle: number, sense: 1 | -1): string {
  const pts: string[] = [];
  for (let k = 0; k <= 40; k++) {
    const f = k / 40;
    const a = angle + sense * f * 1.6 * 2 * Math.PI;
    const rr = r * (0.15 + 0.85 * f);
    pts.push(`${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
}

type Props = { fig: FlowFig; playing: boolean; tap?: TapProps; clock?: DrawClock };

export function FlowFigure({ fig, playing, tap, clock = STILL }: Props) {
  const { palette: p } = useTheme();
  const t = useLoopTime(playing && !clock.on, LOOP, 'flow', 0);
  const vG = stokesTerminal(fig.r, fig.rho, RHO_GLYCEROL, glycerolViscosity(fig.T));
  const vW = turbulentTerminal(fig.r, fig.rho, 1000);
  const shift = -(t / LOOP) * DASH * 2; // the dashes stream upwards: each line is drawn from the bottom
  const laminar = useMemo(() => OFFSETS.flatMap((o) => ([1, -1] as const).map((side) => stokesLine(CX.glycerol, o, side))), []);
  const lines = (cx: number, turbulent: boolean) =>
    OFFSETS.flatMap((o, i) =>
      ([1, -1] as const).map((side, j) => {
        const d = turbulent ? turbulentLine(cx, o, side, t) : laminar[i * 2 + j];
        return (
          <Group key={`${o}${side}`}>
            <Path d={d} stroke={p.label} strokeWidth={1} fill="none" opacity={0.55} />
            {!turbulent && <Path d={d} stroke={p.ink} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeDasharray={`3 ${DASH * 2 - 3}`} strokeDashoffset={shift} />}
          </Group>
        );
      }),
    );
  const spin = (t / LOOP) * 2 * Math.PI;
  return (
    <Group>
      {/* the panels as tap targets, under the drawing: a picked panel gets its soft fill behind the lines */}
      {tap && <TapBoxes targets={flowTargets()} tap={tap} />}
      {stage(clock, 
        PEN.lines,
        <Group>
          {lines(CX.glycerol, false)}
          {/* the axis: up to the ball's front, on from its back */}
          <Path d={`M${CX.glycerol},${BOTTOM} V${CY + A} M${CX.glycerol},${CY - A} V${TOP}`} stroke={p.label} strokeWidth={1} opacity={0.55} />
          {lines(CX.water, true)}
          <Path d={`M${CX.water},${BOTTOM} V${CY + A}`} stroke={p.label} strokeWidth={1} opacity={0.55} />
          {/* the wake: eddies in pairs, spinning opposite ways, drifting off behind the ball */}
          {[0, 1, 2, 3].map((i) => {
            const y = CY - A * (1.6 + i * 1.25) - ((t / LOOP) * A * 1.25) % (A * 1.25);
            const side = i % 2 === 0 ? 1 : -1;
            const r = A * (0.55 + i * 0.07);
            return y > TOP + 6 ? <Path key={i} d={eddy(CX.water + side * A * 0.55, y, r, spin * side + i, side)} stroke={p.label} strokeWidth={1.3} fill="none" /> : null;
          })}
        </Group>,
      )}

      {stage(clock, 
        PEN.ball,
        <Group>
          {(['glycerol', 'water'] as const).map((id) => (
            <Group key={id}>
              <Path d={`M${CX[id] - A},${CY} a${A},${A} 0 1 0 ${2 * A},0 a${A},${A} 0 1 0 ${-2 * A},0 Z`} fill={p.drawFillDark} stroke={p.draw} strokeWidth={1.5} />
              <Path d={`M${CX[id] - A * 0.55},${CY - A * 0.35} A${A * 0.62},${A * 0.62} 0 0 1 ${CX[id] + A * 0.2},${CY - A * 0.68}`} stroke={p.paper} strokeWidth={2.2} fill="none" strokeLinecap="round" />
            </Group>
          ))}
          <Line x1={170} y1={20} x2={170} y2={214} stroke={p.paperLine} strokeWidth={1} />
        </Group>,
      )}

      {stage(clock, 
        PEN.labels,
        <Group>
          <MonoLabel x={CX.glycerol} y={24} text="GLYCEROL" color={p.label} size={9} />
          <MonoLabel x={CX.water} y={24} text="WATER" color={p.label} size={9} />
          <MonoLabel x={CX.glycerol} y={213} text={`ball at ${sig(vG * 100)} cm s⁻¹`} color={p.ink} size={9} />
          <MonoLabel x={CX.water} y={213} text={`ball at ${sig(vW * 100, 2)} cm s⁻¹`} color={p.ink} size={9} />
        </Group>,
      )}

    </Group>
  );
}
