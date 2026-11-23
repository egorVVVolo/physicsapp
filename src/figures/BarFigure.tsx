// FIG: a light bar on a pivot at its middle, loads hanging from it. Each load turns the bar its own way about the pivot:
// on the left anticlockwise, on the right clockwise (loadMoment, src/physics/moments). Once shown, every load gets its
// turning arc and moment, and the resultant is written on top.
import { Circle, G as Group, Path } from 'react-native-svg';
import { loadMoment, resultantMoment } from '@/physics/moments';
import { fixed } from '@/physics/format';
import type { BarFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { STILL, type DrawClock } from './anim';
import { ForceArrow, Hatch, MonoLabel, polyPath, rectPath } from './draw';
import { TurnArc } from './turning';
import { Dim, stage } from './kit';

export const BAR_VB = { w: 340, h: 230 };

const PEN = { ground: [0, 0.3], bar: [0.25, 0.5], loads: [0.5, 0.72], marks: [0.7, 0.95] } as const;
const MID: [number, number] = [170, 112]; // the middle of the bar
const HALF = 130; // half the bar, viewBox units
const THICK = 10;
const PIVOT_H = 26;
const KW = 1.2; // viewBox units per newton
const DIM_Y = 208;

export function barParams(fig: BarFig): string {
  return `light bar, ${fixed(fig.half * 2, 1)} m long`;
}

/** "5.0 N m anticlockwise" from a signed moment (anticlockwise +). */
export const senseText = (m: number): string => `${fixed(Math.abs(m), 1)} N m ${m >= 0 ? 'anticlockwise' : 'clockwise'}`;

export function BarFigure({ fig, clock = STILL }: { fig: BarFig; clock?: DrawClock }) {
  const { palette: p } = useTheme();
  const k = HALF / fig.half;
  const shown = fig.moments === 'shown';
  const bar = rectPath(MID[0] - HALF, MID[1] - THICK / 2, HALF * 2, THICK, 2);
  const base = MID[1] + THICK / 2 + PIVOT_H;
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
          <Hatch x1={MID[0] - 44} x2={MID[0] + 44} y={base} color={p.draw} clock={clock} from={PEN.ground[0]} to={PEN.ground[1]} />
        </Group>,
      )}

      {stage(clock, 
        PEN.bar,
        <Group>
          <Path d={pivot.d} fill={p.drawFillDark} stroke={p.draw} strokeWidth={1.6} strokeLinejoin="round" />
          <Path d={bar.d} fill={p.drawFill} stroke={p.draw} strokeWidth={1.8} />
          <Circle cx={MID[0]} cy={MID[1]} r={2.4} fill={p.draw} />
        </Group>,
      )}

      {stage(clock, 
        PEN.loads,
        <Group>
          {fig.loads.map((l) => {
            const x = MID[0] + l.at * k;
            const tip = MID[1] + THICK / 2 + l.W * KW;
            return (
              <Group key={l.at}>
                <Path d={`M${x},${tip + 4} V${DIM_Y - 4}`} stroke={p.label} strokeWidth={1} strokeDasharray="2 3" />
                <ForceArrow x1={x} y1={MID[1] + THICK / 2} x2={x} y2={tip} color={p.force} />
                <Circle cx={x} cy={MID[1] + THICK / 2} r={3} fill={p.force} />
                <MonoLabel x={x + (l.at < 0 ? -8 : 8)} y={tip - 4} text={`${fixed(l.W, 0)} N`} color={p.forceText} size={10} anchor={l.at < 0 ? 'end' : 'start'} />
              </Group>
            );
          })}
        </Group>,
      )}

      {stage(clock, 
        PEN.marks,
        <Group>
          <Path d={`M${MID[0]},${base + 10} V${DIM_Y - 4}`} stroke={p.label} strokeWidth={1} strokeDasharray="2 3" />
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
          {shown && <MonoLabel x={MID[0]} y={24} text={`resultant ${senseText(total)}`} color={p.ink} size={10} />}
        </Group>,
      )}
    </Group>
  );
}
