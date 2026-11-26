// FIG: a light bar on a pivot at its middle, loads hanging from it. Each load turns the bar its own way about the pivot:
// on the left anticlockwise, on the right clockwise (loadMoment, src/physics/moments). Once shown, every load gets its
// turning arc and moment, and the resultant is written on top.
import { Circle, G as Group, Path } from 'react-native-svg';
import { loadMoment, resultantMoment } from '@/physics/moments';
import { fixed } from '@/physics/format';
import type { BarFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, useLoopTime, type DrawClock } from './anim';
import { useReducedMotionPref } from '@/ui/parts';
import { ForceArrow, Hatch, MonoLabel, polyPath, rectPath } from './draw';
import { TurnArc } from './turning';
import { Dim, stage } from './kit';

export const BAR_VB = { w: 340, h: 230 };

const PEN = { ground: [0, 0.3], bar: [0.25, 0.5], loads: [0.5, 0.72], marks: [0.7, 0.95] } as const;
const MID: [number, number] = [170, 112]; // the middle of the bar
const HALF = 130; // half the bar, viewBox units
const THICK = 12;
const PIVOT_H = 26;
const KW = 1.2; // viewBox units per newton
const DIM_Y = 208;

export function barParams(fig: BarFig): string {
  return `light bar, ${fixed(fig.half * 2, 1)} m long`;
}

/** "5.0 N m anticlockwise" from a signed moment (anticlockwise +). */
export const senseText = (m: number): string => `${fixed(Math.abs(m), 1)} N m ${m >= 0 ? 'anticlockwise' : 'clockwise'}`;

/** The angle (degrees) at which the bar's lower end touches the ground. */
const STOP = (Math.asin((PIVOT_H) / HALF) * 180) / Math.PI;
/** Angular acceleration per newton metre of resultant moment, degrees s⁻²: the bar of the lesson (5.0 N m) lands in about 0.6 s. */
const ALPHA_PER_NM = 13;
const REST_S = 0.9;
const HOLD_S = 0.8;
const BACK_S = 0.7;

/** Whether the figure plays (the sheet shows its pause button): only a bar that is not balanced tips. */
export const barPlays = (fig: BarFig): boolean => fig.play === true && Math.abs(resultantMoment(fig.loads.map((l) => loadMoment(l.W, l.at)))) > 1e-9;

/** Seconds the bar takes to tip from level onto the ground: from rest, θ = ½αt² with α ∝ M (I·α = M). */
export const tipTime = (M: number): number => Math.sqrt((2 * STOP) / (ALPHA_PER_NM * Math.abs(M)));

/** The bar's tilt (degrees, anticlockwise +) at time t of the loop, for resultant moment M (anticlockwise +). */
export function barTilt(M: number, t: number): number {
  if (Math.abs(M) < 1e-9) return 0;
  const tTip = tipTime(M);
  const s = t - REST_S;
  let a: number;
  if (s <= 0) a = 0;
  else if (s <= tTip) a = 0.5 * ALPHA_PER_NM * Math.abs(M) * s * s;
  else if (s <= tTip + HOLD_S) a = STOP;
  else {
    const k = Math.min(1, (s - tTip - HOLD_S) / BACK_S);
    a = STOP * (1 - k * k * (3 - 2 * k)); // lifted back level, smoothly
  }
  return Math.sign(M) * Math.min(STOP, a);
}

export function BarFigure({ fig, playing = false, clock = STILL }: { fig: BarFig; playing?: boolean; clock?: DrawClock }) {
  const { palette: p, soft } = useTheme();
  const k = HALF / fig.half;
  const shown = fig.moments === 'shown';
  const bar = rectPath(MID[0] - HALF, MID[1] - THICK / 2, HALF * 2, THICK, 2);
  const base = MID[1] + THICK / 2 + PIVOT_H;
  const reduced = useReducedMotionPref();
  const plays = barPlays(fig);
  const totalNow = resultantMoment(fig.loads.map((l) => loadMoment(l.W, l.at)));
  const loopS = REST_S + tipTime(totalNow || 1) + HOLD_S + BACK_S;
  const t = useLoopTime(plays && playing && !reduced, loopS, fig, 0);
  const tilt = plays ? barTilt(totalNow, t) : 0; // degrees anticlockwise
  const rad = (tilt * Math.PI) / 180;
  /** Where a point `d` units right of the middle along the bar is now (the bar turns about MID). */
  const along = (d: number): [number, number] => [MID[0] + d * Math.cos(rad), MID[1] - d * Math.sin(rad)];
  const still = Math.max(0, 1 - Math.abs(tilt) / 3); // measurements belong to the level bar
  const pivot = polyPath([
    [MID[0], MID[1] + THICK / 2],
    [MID[0] + 15, base],
    [MID[0] - 15, base],
  ]);
  const moments = fig.loads.map((l) => loadMoment(l.W, l.at));
  const total = resultantMoment(moments);

  return (
    <Group>
      {stage(clock, 
        PEN.ground,
        <Group>
          <Hatch x1={MID[0] - (plays ? HALF + 8 : 44)} x2={MID[0] + (plays ? HALF + 8 : 44)} y={base} color={p.draw} clock={clock} from={PEN.ground[0]} to={PEN.ground[1]} />
        </Group>,
      )}

      {stage(clock, 
        PEN.bar,
        <Group>
          <Path d={pivot.d} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.body} strokeLinejoin="round" />
          <Path d={bar.d} fill={soft.A.fill} stroke={soft.A.edge} strokeWidth={2} transform={`rotate(${-tilt} ${MID[0]} ${MID[1]})`} />
          <Circle cx={MID[0]} cy={MID[1]} r={2.4} fill={p.draw} />
        </Group>,
      )}

      {stage(clock, 
        PEN.loads,
        <Group>
          {fig.loads.map((l) => {
            // the load hangs from the bar's underside, wherever the bar has turned to; its weight stays straight down
            const [x, yBar] = along(l.at * k);
            const y0 = yBar + (THICK / 2) * Math.cos(rad);
            const tip = y0 + l.W * KW;
            return (
              <Group key={l.at}>
                <Path d={`M${x},${tip + 4} V${DIM_Y - 4}`} stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="2 3" opacity={still} />
                <ForceArrow x1={x} y1={y0} x2={x} y2={tip} color={p.force} />
                <Circle cx={x} cy={y0} r={3} fill={p.force} />
                <MonoLabel x={x + (l.at < 0 ? -8 : 8)} y={tip - 4} text={`${fixed(l.W, 0)} N`} color={p.forceText} size={10} anchor={l.at < 0 ? 'end' : 'start'} />
              </Group>
            );
          })}
        </Group>,
      )}

      {stage(clock, 
        PEN.marks,
        <Group opacity={still}>
          <Path d={`M${MID[0]},${base + 10} V${DIM_Y - 4}`} stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="2 3" />
          {fig.loads.map((l) => {
            const x = MID[0] + l.at * k;
            return <Dim key={l.at} a={[Math.min(x, MID[0]), DIM_Y]} b={[Math.max(x, MID[0]), DIM_Y]} text={`${fixed(Math.abs(l.at), 2)} m`} />;
          })}
          {shown &&
            fig.loads.map((l, i) => {
              const left = l.at < 0;
              return (
                <Group key={l.at}>
                  <TurnArc cx={MID[0]} cy={MID[1]} r={48} from={left ? -118 : -62} sweep={left ? -52 : 52} color={p.ink} />
                  <MonoLabel x={MID[0] + (left ? -40 : 40)} y={MID[1] - 56} text={`${fixed(Math.abs(moments[i]), 1)} N m`} color={p.ink} size={9} anchor={left ? 'end' : 'start'} />
                </Group>
              );
            })}
        </Group>,
      )}
      {shown && stage(clock, PEN.marks, <MonoLabel x={MID[0]} y={24} text={`resultant ${senseText(total)}`} color={p.ink} size={10} />)}
    </Group>
  );
}
