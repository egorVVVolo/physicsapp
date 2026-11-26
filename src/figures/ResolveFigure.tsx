// FIG: one vector on squared paper, split into a horizontal and a vertical component from its tail (with a dashed
// rectangle). Its angle is measured from the horizontal or from the vertical, as the question gives it, so the learner
// has to see which side is next to the angle. The sizes come from `components` in src/physics/vectors.
// A force is a solid arrow in the force colour; a velocity is an outline arrow.
// The first resolve figure of a lesson draws itself: paper → vector → components → labels.
import { Circle, G as Group, Line, Path } from 'react-native-svg';
import { components } from '@/physics/vectors';
import { fixed } from '@/physics/format';
import type { ResolveFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { phaseOf, STILL, useOnceTime, type DrawClock } from './anim';
import { ForceArrow, MonoLabel, useMonoSize } from './draw';
import { HollowArrow, stage, Tag } from './kit';

export const RESOLVE_VB = { w: 340, h: 230 };

const RAD = Math.PI / 180;
const O: [number, number] = [118, 196]; // the tail
const L = 164; // drawn length of the vector
const GRID = 20;
/** Played: dashed lines drop from the tip to the axes, then the components slide out from the tail along them. */
const DROP = [0.3, 0.5] as const;
const SLIDE = [0.7, 0.9] as const;
const CLIP_S = SLIDE[0] + SLIDE[1];

/** The size of each component, from the model: x along the horizontal, y up the vertical. */
export function resolveParts(fig: ResolveFig): { x: number; y: number } {
  const c = components(fig.size, fig.angle);
  // the side next to the angle is size × cos θ: horizontal when the angle is from the horizontal
  return fig.from === 'horizontal' ? { x: c.along, y: c.across } : { x: c.across, y: c.along };
}

export function ResolveFigure({ fig, clock = STILL }: { fig: ResolveFig; clock?: DrawClock }) {
  const { palette: p } = useTheme();
  const phi = (fig.from === 'horizontal' ? fig.angle : 90 - fig.angle) * RAD; // above the horizontal
  const d: [number, number] = [Math.cos(phi), -Math.sin(phi)];
  const tip: [number, number] = [O[0] + d[0] * L, O[1] + d[1] * L];
  const xTip: [number, number] = [tip[0], O[1]];
  const yTip: [number, number] = [O[0], tip[1]];
  const parts = resolveParts(fig);
  const value = fig.ask === 'x' ? parts.x : parts.y;
  const askText = fig.answer === 'shown' ? `${fixed(value, 1)} ${fig.unit}` : '?';
  const name = `${fig.name} ${fixed(fig.size, 0)} ${fig.unit}`;
  const mono = useMonoSize(9); // labels may have grown: widths are measured at the size they are drawn
  const w = (text: string) => text.length * mono * 0.66 + 8;
  // the vector's label sits just above its tip, outside the rectangle
  const nameAt: [number, number] = [tip[0], tip[1] - 10];
  // the angle arc, from the reference line round to the vector
  const r = 34;
  const ref: [number, number] = fig.from === 'horizontal' ? [1, 0] : [0, -1];
  const sweep = fig.from === 'horizontal' ? 0 : 1;
  const arc = `M${O[0] + ref[0] * r},${O[1] + ref[1] * r} A${r},${r} 0 0 ${sweep} ${O[0] + d[0] * r},${O[1] + d[1] * r}`;
  const bisAngle = fig.from === 'horizontal' ? phi / 2 : (phi + Math.PI / 2) / 2;
  const bis: [number, number] = [Math.cos(bisAngle), -Math.sin(bisAngle)];
  const color = fig.velocity ? p.draw : p.force;
  const plays = fig.play === true;
  const t = useOnceTime(CLIP_S, plays);
  const drop = plays ? phaseOf(t, DROP[0], DROP[1]) : 1;
  const slide = plays ? phaseOf(t, SLIDE[0], SLIDE[1]) : 1;
  const xEnd: [number, number] = [O[0] + (xTip[0] - O[0]) * slide, O[1]];
  const yEnd: [number, number] = [O[0], O[1] + (yTip[1] - O[1]) * slide];

  const xs: number[] = [];
  for (let x = O[0] - Math.floor((O[0] - 4) / GRID) * GRID; x <= 336; x += GRID) xs.push(x);
  const ys: number[] = [];
  for (let y = O[1] - Math.floor((O[1] - 4) / GRID) * GRID; y <= 226; y += GRID) ys.push(y);

  return (
    <Group>
      {stage(
        clock,
        [0, 0.3],
        <Group>
          {xs.map((x) => (
            <Line key={`x${x}`} x1={x} y1={4} x2={x} y2={226} stroke={p.paperLine} strokeWidth={stroke.hair} />
          ))}
          {ys.map((y) => (
            <Line key={`y${y}`} x1={4} y1={y} x2={336} y2={y} stroke={p.paperLine} strokeWidth={stroke.hair} />
          ))}
          {/* the reference lines through the tail */}
          <Path d={`M${O[0] - 30},${O[1]} H${O[0] + L + 30} M${O[0]},${O[1] + 24} V${O[1] - L - 20}`} stroke={p.label} strokeWidth={stroke.thin} />
        </Group>,
      )}
      {stage(
        clock,
        [0.62, 0.8],
        <Group>
          {/* from the tip, straight down to the horizontal and straight across to the vertical */}
          <Path d={`M${tip[0]},${tip[1]} V${tip[1] + (xTip[1] - tip[1]) * drop} M${tip[0]},${tip[1]} H${tip[0] + (yTip[0] - tip[0]) * drop}`} fill="none" stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="4 3" />
          {slide > 0.06 &&
            (fig.velocity ? (
              <Group>
                <HollowArrow from={O} to={xEnd} color={color} weight="thin" />
                <HollowArrow from={O} to={yEnd} color={color} weight="thin" />
              </Group>
            ) : (
              <Group>
                <ForceArrow x1={O[0]} y1={O[1]} x2={xEnd[0]} y2={xEnd[1]} color={color} width={2.4} />
                <ForceArrow x1={O[0]} y1={O[1]} x2={yEnd[0]} y2={yEnd[1]} color={color} width={2.4} />
              </Group>
            ))}
        </Group>,
      )}
      {stage(
        clock,
        [0.3, 0.62],
        <Group>
          {fig.velocity ? <HollowArrow from={O} to={tip} color={color} /> : <ForceArrow x1={O[0]} y1={O[1]} x2={tip[0]} y2={tip[1]} color={color} width={3.4} />}
          <Circle cx={O[0]} cy={O[1]} r={3.2} fill={color} />
          <Path d={arc} fill="none" stroke={p.label} strokeWidth={stroke.thin} />
        </Group>,
      )}
      {stage(
        clock,
        [0.8, 0.95],
        <Group>
          <Tag x={nameAt[0]} y={nameAt[1]} text={name} />
          <MonoLabel x={O[0] + bis[0] * (r + 13)} y={O[1] + bis[1] * (r + 13) + 3} text={`${fixed(fig.angle, 0)}°`} color={p.ink} size={9} />
          {fig.ask === 'x' && slide > 0.98 && <Tag x={(O[0] + xTip[0]) / 2} y={O[1] + 17} text={askText} />}
          {fig.ask === 'y' && slide > 0.98 && <Tag x={O[0] - 8 - w(askText) / 2} y={(O[1] + yTip[1]) / 2 + 3} text={askText} />}
        </Group>,
      )}
    </Group>
  );
}

