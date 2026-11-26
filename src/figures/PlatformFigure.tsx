// FIG: loads moved along a level floor by a hand, in one panel or two side by side. A suitcase carried by its handle
// (the hand holds it up), a suitcase pulled on its wheels by a handle at θ to the floor, or a box pushed from behind.
// Each hand's force starts where the hand acts, all to one scale per figure; split, the part along the motion is a
// thinner arrow along the floor and the part across it a dashed line. The motion is an outline arrow under the floor
// with Δs. ΔW at the top of each panel comes from workDone (src/physics/work): F Δs cos θ, zero at right angles.
// Played, the floor slides past at a steady speed.
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { workDone } from '@/physics/work';
import { components } from '@/physics/vectors';
import { fixed } from '@/physics/format';
import type { PlatformFig, PlatformLane } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, useLoopTime, type DrawClock } from './anim';
import { ForceArrow, ForceLetter, MonoLabel } from './draw';
import { Mitten } from './SledgeFigure';
import { AngleArc, RightAngle } from './turning';
import { stage } from './kit';

export const PLATFORM_VB = { w: 340, h: 230 };

const PEN = { floor: [0, 0.3], loads: [0.25, 0.6], hands: [0.5, 0.72], forces: [0.7, 0.88], labels: [0.85, 0.98] } as const;
const RAD = Math.PI / 180;
const FLOOR = 188;
const MOTION_Y = 214;
const WORK_Y = 18;
const MAX_LEN = 84; // the biggest force in a figure, viewBox units
const MAX_K = 1.6; // viewBox units per newton, at most (one small force alone is not drawn huge)
const CASE = { w: 40, h: 56, lift: 10 }; // a suitcase: carried, its bottom is `lift` above the floor
const WHEEL = 4;
const BOX = { w: 68, h: 50 };
const ROD = 54; // a pulled suitcase's handle, from the hitch to the hand
const TICK = 24; // gap between the marks under the floor: they show it sliding past
const PX_PER_M = 40; // how fast the floor slides past while played
const V = 1; // m s⁻¹

/** Each lane's force at its angle (the explore slider sets the first lane's) and the work it does over `dist`. */
export function platformLanes(fig: PlatformFig, live?: number): (PlatformLane & { work: number; along: number; across: number })[] {
  return fig.lanes.map((l, i) => {
    const angle = i === 0 && live !== undefined ? live : l.angle;
    const c = components(l.F, angle);
    return { ...l, angle, work: workDone(l.F, fig.dist, angle), along: Math.abs(c.along) < 1e-9 ? 0 : c.along, across: c.across };
  });
}

/** The given values in the sheet header; on the explore screen the forward part and the work. */
export function platformParams(fig: PlatformFig, live?: number): string {
  if (live === undefined) return fig.header;
  const l = platformLanes(fig, live)[0];
  return `forward ${fixed(l.along, 1)} N · ΔW ${fixed(l.work, 0)} J`;
}

export const platformPlays = (fig: PlatformFig): boolean => fig.play === true;

type Props = { fig: PlatformFig; live?: number; playing: boolean; clock?: DrawClock };

export function PlatformFigure({ fig, live, playing, clock = STILL }: Props) {
  const { palette: p, soft } = useTheme();
  const lanes = platformLanes(fig, live);
  const n = lanes.length;
  const pw = PLATFORM_VB.w / n;
  const k = Math.min(MAX_K, MAX_LEN / Math.max(...lanes.map((l) => Math.max(l.F, l.friction ?? 0))));
  const t = useLoopTime(playing && fig.play === true, TICK / (V * PX_PER_M), 'floor', 0);
  const scroll = t * V * PX_PER_M;

  return (
    <Group>
      {lanes.map((l, i) => {
        const x0 = i * pw;
        const ticks: string[] = [];
        const off = scroll % TICK;
        for (let x = x0 + 8 - off; x + 8 < x0 + pw - 8; x += TICK) if (x >= x0 + 8) ticks.push(`M${x},${FLOOR + 7} L${x + 7},${FLOOR}`);
        // where the load stands: a pulled suitcase to the left (its handle runs up to the right), the rest in the middle
        const cx = x0 + pw * (l.how === 'pull' ? (n === 1 ? 0.3 : 0.32) : l.how === 'push' ? 0.5 : 0.5);
        const geo = loadGeometry(l, cx);
        const d: [number, number] = [Math.cos(l.angle * RAD), -Math.sin(l.angle * RAD)];
        const len = l.F * k;
        const tip: [number, number] = [geo.hitch[0] + d[0] * len, geo.hitch[1] + d[1] * len];
        const rod = Math.max(ROD, len + 22); // the handle runs on past the arrow's head to the hand
        const hand: [number, number] = l.how === 'pull' ? [geo.hitch[0] + d[0] * rod, geo.hitch[1] + d[1] * rod] : l.how === 'push' ? [cx - BOX.w / 2, geo.hitch[1]] : geo.hitch;
        const along = l.along * k;
        const showSplit = fig.split && l.how === 'pull' && l.angle >= 8; // nearly flat, the forward part is the whole pull
        const workText = fig.work === 'shown' ? `ΔW = ${fixed(l.work, 0)} J` : fig.work ? 'ΔW = ?' : null;
        // the force's size: beyond the tip, clear of the arrow
        const sizeAt: [number, number] = l.how === 'carry' ? [tip[0] + 8, tip[1] + 10] : l.how === 'push' ? [tip[0] + 4, geo.hitch[1] - 9] : [tip[0] + d[1] * 11, tip[1] - d[0] * 11 + 3];
        return (
          <Group key={l.name}>
            {stage(clock, 
              PEN.floor,
              <Group>
                {i > 0 && <Line x1={x0} y1={12} x2={x0} y2={222} stroke={p.paperLine} strokeWidth={stroke.thin} strokeDasharray="4 4" />}
                <Line x1={x0 + 8} y1={FLOOR} x2={x0 + pw - 8} y2={FLOOR} stroke={p.draw} strokeWidth={stroke.body} />
                <Path d={ticks.join(' ')} stroke={p.draw} strokeWidth={stroke.thin} opacity={0.4} />
                <MotionArrow x={x0 + 14} y={MOTION_Y} length={46} />
                <MonoLabel x={x0 + 68} y={MOTION_Y + 3.5} text={`Δs = ${fixed(fig.dist, fig.dist < 10 ? 1 : 0)} m`} color={p.ink} size={9} anchor="start" />
              </Group>,
            )}

            {stage(clock, PEN.loads, <Load lane={l} cx={cx} tone={i === 1 ? 'B' : 'A'} />)}

            {stage(clock, 
              PEN.hands,
              <Group>
                {l.how === 'pull' && <Line x1={geo.hitch[0]} y1={geo.hitch[1]} x2={hand[0]} y2={hand[1]} stroke={p.draw} strokeWidth={stroke.force} strokeLinecap="round" />}
                {l.how === 'carry' && <Mitten x={hand[0]} y={hand[1]} dx={0.5} dy={-0.87} who={i === 1 ? 'B' : 'A'} />}
                {l.how === 'pull' && <Mitten x={hand[0]} y={hand[1]} dx={d[0]} dy={d[1]} who={i === 1 ? 'B' : 'A'} />}
                {l.how === 'push' && <Mitten x={hand[0]} y={hand[1]} dx={-0.71} dy={-0.71} who={i === 1 ? 'B' : 'A'} />}
                <MonoLabel {...nameAt(l, hand, d)} text={l.name[0] + l.name.slice(1).toLowerCase()} color={p.label} size={9} />
              </Group>,
            )}

            {fig.forces &&
              stage(clock, 
                PEN.forces,
                <Group>
                  {showSplit && (
                    <Group>
                      <Path d={`M${tip[0]},${tip[1]} V${geo.hitch[1]}`} stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="3 3" />
                      {along > 2 && <ForceArrow x1={geo.hitch[0]} y1={geo.hitch[1]} x2={geo.hitch[0] + along} y2={geo.hitch[1]} color={p.force} width={2.2} />}
                    </Group>
                  )}
                  <ForceArrow x1={geo.hitch[0]} y1={geo.hitch[1]} x2={tip[0]} y2={tip[1]} color={p.force} />
                  <Circle cx={geo.hitch[0]} cy={geo.hitch[1]} r={3} fill={p.force} />
                  {l.friction !== undefined && (
                    <Group>
                      <ForceArrow x1={cx} y1={FLOOR - 3} x2={cx - l.friction * k} y2={FLOOR - 3} color={p.force} />
                      <Circle cx={cx} cy={FLOOR - 3} r={3} fill={p.force} />
                    </Group>
                  )}
                </Group>,
              )}

            {stage(clock, 
              PEN.labels,
              <Group>
                {workText && <MonoLabel x={x0 + pw / 2} y={WORK_Y} text={workText} color={p.ink} size={11} />}
                {fig.forces && (
                  <Group>
                    <MonoLabel x={sizeAt[0]} y={sizeAt[1]} text={`${fixed(l.F, 0)} N`} color={p.forceText} size={9} anchor={l.how !== 'pull' ? 'start' : l.angle > 40 ? 'end' : 'middle'} />
                    {l.friction !== undefined && (
                      <Group>
                        <ForceLetter x={cx - l.friction * k - 4} y={FLOOR - 8} text="F" color={p.force} size={13} anchor="end" />
                        <MonoLabel x={(cx - BOX.w / 2 + cx - l.friction * k) / 2} y={FLOOR - 9} text={`${fixed(l.friction, 0)} N`} color={p.forceText} size={9} />
                      </Group>
                    )}
                    {l.how === 'carry' && <RightAngle at={geo.hitch} u={[1, 0]} v={[0, -1]} size={8} color={p.ink} />}
                    {l.how === 'pull' && l.angle > 4 && (
                      <Group>
                        <Path d={`M${geo.hitch[0]},${geo.hitch[1]} H${geo.hitch[0] + 30}`} stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="2 3" />
                        <AngleArc at={geo.hitch} r={18} from={0} sweep={-l.angle} color={p.ink} />
                        <MonoLabel x={geo.hitch[0] + 22 * Math.cos((l.angle / 2) * RAD) + 3} y={geo.hitch[1] - 22 * Math.sin((l.angle / 2) * RAD) + 3} text={`${fixed(l.angle, 0)}°`} color={p.ink} size={9} anchor="start" />
                      </Group>
                    )}
                    {showSplit && along > 2 && (
                      <MonoLabel x={geo.hitch[0] + 4} y={geo.hitch[1] + 13} text={`${fixed(l.along, 1)} N`} color={p.forceText} size={9} anchor="start" />
                    )}
                    {showSplit && n === 1 && l.across > 1 && (
                      <MonoLabel x={tip[0] + 6} y={(tip[1] + geo.hitch[1]) / 2 + 3} text={`up ${fixed(l.across, 1)} N`} color={p.label} size={9} anchor="start" />
                    )}
                  </Group>
                )}
              </Group>,
            )}
          </Group>
        );
      })}
    </Group>
  );
}

/**
 * Where the hand's force is drawn from: the top of a carried suitcase's handle, a pulled one's top front corner (where
 * the hand acts), a pushed box's centre (as on a free-body diagram: an arrow from the back face would run into the box).
 */
function loadGeometry(l: PlatformLane, cx: number): { hitch: [number, number] } {
  if (l.how === 'carry') return { hitch: [cx, FLOOR - CASE.lift - CASE.h - 9] };
  if (l.how === 'pull') return { hitch: [cx + CASE.w / 2, FLOOR - 2 * WHEEL - CASE.h] };
  return { hitch: [cx, FLOOR - BOX.h / 2] };
}

/** The name sits beyond the hand's arm. */
function nameAt(l: PlatformLane, hand: [number, number], d: [number, number]) {
  if (l.how === 'carry') return { x: hand[0] + 16, y: hand[1] - 22, anchor: 'start' as const };
  if (l.how === 'push') return { x: hand[0] - 18, y: hand[1] - 20, anchor: 'end' as const };
  // a pulled handle: above the arm when it is low, beside it when it is steep
  return d[1] > -0.5 ? { x: hand[0] + 4, y: hand[1] - 28, anchor: 'middle' as const } : { x: hand[0] + 16, y: hand[1] + 4, anchor: 'start' as const };
}

function Load({ lane, cx, tone }: { lane: PlatformLane; cx: number; tone: 'A' | 'B' }) {
  const { palette: p, soft } = useTheme();
  const body = { fill: soft[tone].fill, stroke: soft[tone].edge, strokeWidth: 2 };
  if (lane.load === 'box') {
    const x = cx - BOX.w / 2;
    const y = FLOOR - BOX.h;
    return (
      <Group>
        <Rect x={x} y={y} width={BOX.w} height={BOX.h} rx={6} {...body} />
      </Group>
    );
  }
  const bottom = lane.how === 'carry' ? FLOOR - CASE.lift : FLOOR - 2 * WHEEL;
  const x = cx - CASE.w / 2;
  const y = bottom - CASE.h;
  return (
    <Group>
      <Rect x={x} y={y} width={CASE.w} height={CASE.h} rx={7} {...body} />
      {lane.how === 'carry' && <Path d={`M${cx - 8},${y} V${y - 6} Q${cx - 8},${y - 9} ${cx - 5},${y - 9} H${cx + 5} Q${cx + 8},${y - 9} ${cx + 8},${y - 6} V${y}`} fill="none" stroke={p.draw} strokeWidth={stroke.body} />}
      {lane.how === 'pull' && (
        <Group>
          <Circle cx={x + 7} cy={FLOOR - WHEEL} r={WHEEL} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.thin} />
          <Circle cx={x + CASE.w - 7} cy={FLOOR - WHEEL} r={WHEEL} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.thin} />
        </Group>
      )}
    </Group>
  );
}

/** The direction of motion: an outline arrow pointing right. */
function MotionArrow({ x, y, length }: { x: number; y: number; length: number }) {
  const { palette: p, soft } = useTheme();
  const b = x + length;
  const d = `M${x},${y - 3} H${b - 10} V${y - 8} L${b},${y} L${b - 10},${y + 8} V${y + 3} H${x} Z`;
  return <Path d={d} fill="none" stroke={p.label} strokeWidth={stroke.body} strokeLinejoin="round" />;
}
