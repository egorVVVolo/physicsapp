// FIG: steel balls sinking through a tall tube of glycerol (src/physics/viscosity), the falling-ball lab.
// The tube has a cm ruler from the surface down and two rubber bands 10.0 cm apart. Each ball is let go at the surface
// and falls by stokesFall in real time: it reaches its terminal velocity within milliseconds, so it sinks at a steady
// speed, the big one four times as fast. The balls are drawn five times too large (the sheet says so).
// The panel on the right: the speeds; the small ball magnified with W, U and the viscous drag F to one scale (U and F
// both push up through the centre, so F is stacked on U and the two together match W); the two balls side by side with
// their weights; a stopwatch that runs while the ball is between the bands; or, on the explore screen (the slider =
// temperature), a thermometer with η and the ball's speed, the ball drifting down at that speed.
import { useEffect, useRef, useState } from 'react';
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { fixed, sci, sig } from '@/physics/format';
import { glycerolViscosity, RHO_GLYCEROL, sphereUpthrust, sphereWeight, stokesDrag, stokesFall, stokesTerminal } from '@/physics/viscosity';
import type { TubeFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { useReducedMotionPref } from '@/ui/parts';
import { STILL, useLoopTime, type DrawClock } from './anim';
import { ForceArrow, ForceLetter, Hatch, MonoLabel } from './draw';
import { Ball, stage, Rows as KitRows } from './kit';

export const TUBE_VB = { w: 340, h: 230 };

const PEN = { ground: [0, 0.25], tube: [0.1, 0.5], liquid: [0.3, 0.6], balls: [0.5, 0.75], labels: [0.72, 0.98] } as const;
const BENCH = 214;
const TUBE = { x1: 56, x2: 112, top: 10, bottom: 206 };
const SURFACE = 24;
const K = 6; // viewBox units per cm of the tube
const DEPTH = (TUBE.bottom - SURFACE) / K; // cm of glycerol
export const BANDS = [8, 18] as const; // cm below the surface: 10.0 cm apart
const DRAW_R = 3.2; // viewBox units per mm of a ball's radius: five times too large
const LW = 92; // viewBox units for the small ball's weight in the magnified view

/** One ball: its radius, its speed and how far it has fallen at time t (s after the drop), from the model. */
function ballAt(r: number, rho: number, eta: number, t: number) {
  const f = stokesFall(t, r, rho, RHO_GLYCEROL, eta);
  return { r, vt: f.vt, s: Math.min(f.s * 100, DEPTH - (r * 1000 * DRAW_R) / K - 0.2) /* cm */ };
}

/** How long a played drop lasts: the last ball across the lower band (the timing), or the big ball near the bottom. */
function clipLength(fig: TubeFig): number {
  const eta = glycerolViscosity(fig.T);
  const vMax = Math.max(...fig.balls.map((r) => stokesTerminal(r, fig.rho, RHO_GLYCEROL, eta))) * 100;
  if (fig.panel === 'timing') return BANDS[1] / vMax + 0.4;
  return Math.min(10, (DEPTH - 3.5) / vMax);
}

export const tubePlays = (fig: TubeFig): boolean => fig.play === true;

export function tubeParams(fig: TubeFig, live?: number): string {
  if (live !== undefined) return `glycerol, ${RHO_GLYCEROL} kg m⁻³`;
  return `glycerol ${RHO_GLYCEROL} kg m⁻³, ${fig.T} °C`;
}

/** The explore screen: the ball drifts down at its speed now (cm s⁻¹), starting again at the top near the bottom. */
function useDrift(v: number, running: boolean, length: number): number {
  const [s, setS] = useState(length * 0.3);
  const speed = useRef(v);
  speed.current = v;
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    let pos = length * 0.3;
    const step = (now: number) => {
      pos += speed.current * Math.min(0.05, (now - last) / 1000);
      last = now;
      if (pos > length) pos = 0;
      setS(pos);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [running, length]);
  return s;
}

type Props = { fig: TubeFig; live?: number; playing: boolean; clock?: DrawClock };

export function TubeFigure({ fig, live, playing, clock = STILL }: Props) {
  const { palette: p, material: m } = useTheme();
  const reduced = useReducedMotionPref();
  const T = live ?? fig.T;
  const eta = glycerolViscosity(T);
  const length = clipLength(fig);
  const plays = tubePlays(fig);
  const loop = useLoopTime(plays && playing && !clock.on && !reduced && live === undefined, length, `${fig.play}${fig.panel}`, 1.2);
  const t = plays ? (reduced ? length : loop) : (fig.at ?? 0);
  const vNow = stokesTerminal(fig.balls[0], fig.rho, RHO_GLYCEROL, eta) * 100;
  const drift = useDrift(vNow, live !== undefined && playing && !reduced && !clock.on, DEPTH - 4);
  const balls = fig.balls.map((r) => (live !== undefined ? { ...ballAt(r, fig.rho, eta, 0), s: drift } : ballAt(r, fig.rho, eta, t)));
  const lanes = balls.length === 1 ? [84] : [74, 96];
  const dashes: string[] = [];
  for (let y = SURFACE + 9; y < TUBE.bottom - 3; y += 9) for (let x = TUBE.x1 + 4 + ((y / 9) % 2) * 6; x < TUBE.x2 - 6; x += 12) dashes.push(`M${x},${y} h5`);
  const ticks: string[] = [];
  for (let cm = 0; cm <= DEPTH; cm++) ticks.push(`M40,${SURFACE + cm * K} h${cm % 10 === 0 ? 7 : cm % 5 === 0 ? 5 : 3}`);
  const Y = (cm: number) => SURFACE + cm * K;

  return (
    <Group>
      {stage(clock, PEN.ground, <Hatch x1={8} x2={150} y={BENCH} color={p.draw} clock={clock} from={PEN.ground[0]} to={PEN.ground[1]} />)}

      {stage(clock, 
        PEN.liquid,
        <Group>
          <Rect x={TUBE.x1} y={SURFACE} width={TUBE.x2 - TUBE.x1} height={TUBE.bottom - SURFACE} fill={m.water} />
          <Path d={dashes.join(' ')} stroke={p.label} strokeWidth={stroke.hair} opacity={0.35} />
          <Line x1={TUBE.x1} y1={SURFACE} x2={TUBE.x2} y2={SURFACE} stroke={p.draw} strokeWidth={stroke.thin} />
        </Group>,
      )}

      {stage(clock, 
        PEN.balls,
        <Group>
          {balls.map((b, i) => {
            const rr = b.r * 1000 * DRAW_R;
            return <Ball key={i} look="steel" x={lanes[i]} y={SURFACE + rr + b.s * K} r={rr} />;
          })}
        </Group>,
      )}

      {stage(clock, 
        PEN.tube,
        <Group>
          {/* the glass: walls, a rounded bottom, a foot; the rubber bands round it; the ruler beside it */}
          <Path d={`M${TUBE.x1 - 2},${TUBE.top} V${TUBE.bottom + 2} H${TUBE.x2 + 2} V${TUBE.top}`} stroke={p.draw} strokeWidth={stroke.force} fill="none" strokeLinejoin="round" />
          <Rect x={TUBE.x1 - 12} y={TUBE.bottom + 2} width={TUBE.x2 - TUBE.x1 + 24} height={6} rx={1.5} fill={m.metalSide} stroke={p.draw} strokeWidth={stroke.thin} />
          {BANDS.map((cm) => (
            <Rect key={cm} x={TUBE.x1 - 5} y={Y(cm) - 2.5} width={TUBE.x2 - TUBE.x1 + 10} height={5} rx={1.5} fill={p.draw} />
          ))}
          <Line x1={40} y1={SURFACE} x2={40} y2={Y(DEPTH)} stroke={p.draw} strokeWidth={stroke.thin} />
          <Path d={ticks.join(' ')} stroke={p.label} strokeWidth={stroke.hair} />
          {[0, 10, 20, 30].map((cm) => (
            <MonoLabel key={cm} x={36} y={Y(cm) + 3} text={cm === 0 ? '0 cm' : `${cm}`} color={p.label} size={8} anchor="end" />
          ))}
          <MonoLabel x={TUBE.x2 + 8} y={(Y(BANDS[0]) + Y(BANDS[1])) / 2 + 3} text="10.0" color={p.label} size={8} anchor="start" />
          <Path d={`M${TUBE.x2 + 12},${Y(BANDS[0]) + 4} V${(Y(BANDS[0]) + Y(BANDS[1])) / 2 - 8} M${TUBE.x2 + 12},${(Y(BANDS[0]) + Y(BANDS[1])) / 2 + 8} V${Y(BANDS[1]) - 4}`} stroke={p.label} strokeWidth={stroke.hair} />
          <MonoLabel x={PX} y={BENCH + 8} text="BALLS × 5" color={p.label} size={7.5} anchor="start" />
        </Group>,
      )}

      {stage(clock, PEN.labels, <Panel fig={fig} eta={eta} T={T} t={t} vLive={live !== undefined ? vNow : undefined} />)}
    </Group>
  );
}


const PX = 156; // the panel's left edge
const PR = 334; // … and right edge

/** Label–value rows like a lab notebook, in the panel on the right. */
function PanelRows({ rows, y0 = 64, x = PX }: { rows: [string, string, string?][]; y0?: number; x?: number }) {
  return <KitRows rows={rows} x={x} right={PR} y0={y0} step={24} />;
}

const mm = (r: number) => `${fixed(r * 2000, 1)} mm`;
const cms = (v: number) => `${sig(v * 100)} cm s⁻¹`;
const newtons = (x: number) => `${sci(x)} N`;

function Panel({ fig, eta, T, t, vLive }: { fig: TubeFig; eta: number; T: number; t: number; vLive?: number }) {
  const { palette: p, material: m } = useTheme();
  const asked = fig.ask !== undefined;
  const last = fig.balls.length - 1;
  if (fig.panel === 'speeds') {
    return (
      <Group>
        <MonoLabel x={PX} y={40} text="TERMINAL VELOCITY" color={p.label} size={8.5} anchor="start" />
        <PanelRows rows={fig.balls.map((r, i): [string, string] => [`${mm(r)} ball`, asked && i === last ? '? cm s⁻¹' : cms(stokesTerminal(r, fig.rho, RHO_GLYCEROL, eta))])} />
        <MonoLabel x={PX} y={64 + fig.balls.length * 24 + 4} text={`steel, ${fig.rho} kg m⁻³`} color={p.label} size={8.5} anchor="start" />
      </Group>
    );
  }
  if (fig.panel === 'timing') {
    const r = fig.balls[0];
    const v = stokesTerminal(r, fig.rho, RHO_GLYCEROL, eta);
    const total = (BANDS[1] - BANDS[0]) / 100 / v;
    const f = stokesFall(t, r, fig.rho, RHO_GLYCEROL, eta);
    // the stopwatch starts as the ball passes the upper band and stops at the lower one
    const tUpper = BANDS[0] / 100 / v + f.tau;
    const shown = fig.play === true ? Math.max(0, Math.min(total, t - tUpper)) : total;
    return (
      <Group>
        <Stopwatch x={186} y={56} t={shown} />
        <MonoLabel x={214} y={60} text={`${fixed(shown, 2)} s`} color={p.ink} size={13} anchor="start" />
        <PanelRows
          y0={112}
          rows={[
            ['radius r', `${fixed(r * 1000, 1)} mm`],
            ['weight W', newtons(sphereWeight(r, fig.rho))],
            ['upthrust U', newtons(sphereUpthrust(r, RHO_GLYCEROL))],
            ['bands', '10.0 cm apart'],
          ]}
        />
      </Group>
    );
  }
  if (fig.panel === 'warm') {
    return (
      <Group>
        <Thermometer x={176} T={T} />
        <MonoLabel x={206} y={40} text="GLYCEROL" color={p.label} size={8.5} anchor="start" />
        <PanelRows
          x={206}
          rows={[
            ['T', `${fixed(T, 0)} °C`],
            ['η', `${sig(eta)} Pa s`],
            ['v', `${sig(vLive ?? 0)} cm s⁻¹`],
          ]}
        />
        <MonoLabel x={206} y={150} text={`ball ${mm(fig.balls[0])}`} color={p.label} size={8.5} anchor="start" />
      </Group>
    );
  }
  if (fig.panel === 'weights') return <Weights fig={fig} />;
  return <Forces fig={fig} eta={eta} />;
}

/** The small ball magnified (× 20, at the tube's scale): W down from its centre; U, then F stacked on it, up. To one scale. */
function Forces({ fig, eta }: { fig: TubeFig; eta: number }) {
  const { palette: p, material: m } = useTheme();
  const r = fig.balls[0];
  const W = sphereWeight(r, fig.rho);
  const U = sphereUpthrust(r, RHO_GLYCEROL);
  const v = stokesTerminal(r, fig.rho, RHO_GLYCEROL, eta);
  const F = stokesDrag(eta, r, v);
  const asked = fig.ask !== undefined;
  const k = LW / W;
  const cx = 200;
  const cy = 110;
  const uTop = cy - U * k;
  const fTop = uTop - 3 - (asked ? 24 : F * k - 3);
  return (
    <Group>
      <MonoLabel x={PX} y={22} text="× 20" color={p.label} size={8.5} anchor="start" />
      <Ball look="steel" x={cx} y={cy} r={r * 1000 * 12} />
      <ForceArrow x1={cx} y1={cy} x2={cx} y2={cy + W * k} color={p.force} width={3} />
      <ForceLetter x={cx + 9} y={cy + W * k - 2} text="W" color={p.force} size={13} anchor="start" />
      <ForceArrow x1={cx} y1={cy} x2={cx} y2={uTop} color={p.force} width={3} />
      <ForceLetter x={cx - 16} y={uTop + 6} text="U" color={p.force} size={13} anchor="end" />
      {/* F starts a hair above U's tip, so the two arrows stay apart */}
      <ForceArrow x1={cx} y1={uTop - 3} x2={cx} y2={fTop} color={p.force} width={3} dashed={asked} />
      <ForceLetter x={cx + 9} y={fTop + 12} text={asked ? 'F ?' : 'F'} color={p.force} size={13} anchor="start" />
      <Circle cx={cx} cy={cy} r={2.6} fill={p.force} />
      <MonoLabel x={238} y={40} text="STEADY SPEED" color={p.label} size={8.5} anchor="start" />
      <PanelRows
        x={238}
        rows={[
          ['W', newtons(W), p.forceText],
          ['U', newtons(U), p.forceText],
          ['F', asked ? '? N' : newtons(F), p.forceText],
        ]}
      />
    </Group>
  );
}

/** The two balls magnified (× 10) side by side, with their weights; the big one's "?" until the question is answered. */
function Weights({ fig }: { fig: TubeFig }) {
  const { palette: p, material: m } = useTheme();
  return (
    <Group>
      <MonoLabel x={PX} y={22} text="× 10" color={p.label} size={8.5} anchor="start" />
      {fig.balls.map((r, i) => {
        const x = i === 0 ? 198 : 292;
        const rr = r * 1000 * 10;
        const W = sphereWeight(r, fig.rho);
        const asked = fig.ask !== undefined && i === fig.balls.length - 1;
        return (
          <Group key={i}>
            <Ball look="steel" x={x} y={96} r={rr} />
            <Line x1={x - rr} y1={96 + 30} x2={x + rr} y2={96 + 30} stroke={p.label} strokeWidth={stroke.hair} />
            <Path d={`M${x - rr},${126 - 4} v8 M${x + rr},${126 - 4} v8`} stroke={p.label} strokeWidth={stroke.hair} />
            <MonoLabel x={x} y={142} text={mm(r)} color={p.label} size={8.5} />
            <MonoLabel x={x} y={170} text="W" color={p.forceText} size={8.5} />
            <MonoLabel x={x} y={186} text={asked ? '? N' : newtons(W)} color={p.forceText} size={9} />
          </Group>
        );
      })}
    </Group>
  );
}

/** A stopwatch whose hand goes round once every 10 s. */
function Stopwatch({ x, y, t }: { x: number; y: number; t: number }) {
  const { palette: p, material: m } = useTheme();
  const a = (t / 10) * 2 * Math.PI;
  const r = 15;
  const ticks: string[] = [];
  for (let i = 0; i < 10; i++) {
    const b = (i / 10) * 2 * Math.PI;
    ticks.push(`M${x + Math.sin(b) * (r - 2)},${y - Math.cos(b) * (r - 2)} L${x + Math.sin(b) * (r - 5)},${y - Math.cos(b) * (r - 5)}`);
  }
  return (
    <Group>
      <Rect x={x - 3} y={y - r - 6} width={6} height={5} fill={p.draw} />
      <Circle cx={x} cy={y} r={r} fill={p.paper} stroke={p.draw} strokeWidth={stroke.body} />
      <Path d={ticks.join(' ')} stroke={p.label} strokeWidth={stroke.hair} />
      <Line x1={x} y1={y} x2={x + Math.sin(a) * (r - 4)} y2={y - Math.cos(a) * (r - 4)} stroke={p.ink} strokeWidth={stroke.body} strokeLinecap="round" />
      <Circle cx={x} cy={y} r={1.6} fill={p.ink} />
    </Group>
  );
}

/** A thermometer from 0 to 50 °C, its column at T. */
function Thermometer({ x, T }: { x: number; T: number }) {
  const { palette: p, material: m } = useTheme();
  const top = 46;
  const bottom = 176;
  const yT = bottom - ((bottom - top) * T) / 50;
  const marks: string[] = [];
  for (let c = 0; c <= 50; c += 10) marks.push(`M${x + 6},${bottom - ((bottom - top) * c) / 50} h5`);
  return (
    <Group>
      <Rect x={x - 5} y={top - 6} width={10} height={bottom - top + 10} rx={5} fill={p.paper} stroke={p.draw} strokeWidth={stroke.thin} />
      <Rect x={x - 2.2} y={yT} width={4.4} height={bottom - yT + 6} fill={p.draw} />
      <Circle cx={x} cy={bottom + 12} r={9} fill={p.draw} />
      <Path d={marks.join(' ')} stroke={p.label} strokeWidth={stroke.hair} />
      {[0, 20, 40].map((c) => (
        <MonoLabel key={c} x={x - 9} y={bottom - ((bottom - top) * c) / 50 + 3} text={`${c}`} color={p.label} size={7.5} anchor="end" />
      ))}
    </Group>
  );
}
