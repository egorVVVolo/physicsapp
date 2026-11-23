// FIG: sledges on snow, seen from the side, for resolving a force into components.
// "sledge": Ana pulls her sledge with a rope at θ above the snow; Ben pushes his straight forward. Every force starts at
// the point where it acts (a dot) and is drawn in the force colour; Ana's pull can be split into its forward and upward
// components (from the hitch with a dashed rectangle, tip to tail, or only the forward one). The sizes come from
// `components` in src/physics/vectors, so every number on the sheet is the model's. On the explore screen the slider
// is the rope's angle and the sheet header reads out both components.
// "hill": a sledge resting on a snowy hill; its weight acts down from the centre of gravity and is split along the
// slope and into it (`onSlope`), with the angle between W and the line into the slope marked: the hill's angle again.
// The first figure of each kind draws itself: snow → sledge → rope → forces → components → labels.
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { components, onSlope } from '@/physics/vectors';
import { fixed } from '@/physics/format';
import { SLEDGE_IDS, type HillFig, type PartLabel, type SledgeFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { STILL, type DrawClock } from './anim';
import { CgMark, ForceArrow, Hatch, MonoLabel } from './draw';
import type { TapProps, TapTarget } from './Sheet';
import { stage, Tag, TapBoxes } from './kit';

export const SLEDGE_VB = { w: 340, h: 230 };
export const HILL_VB = { w: 340, h: 230 };

const PEN = {
  snow: [0, 0.3],
  sledge: [0.2, 0.48],
  rope: [0.4, 0.58],
  forces: [0.55, 0.72],
  parts: [0.68, 0.84],
  labels: [0.8, 0.95],
} as const;

const RAD = Math.PI / 180;
const TARGET = 40; // side of a tap box, in viewBox units

// The sledge in its own units: runner on y = 0 from the back (x = 0) to the curl at the front (x ≈ 74).
const HITCH: [number, number] = [64, -11]; // where the rope is tied
const BACK: [number, number] = [4, -11]; // where Ben's hands push
const CG: [number, number] = [33, -11];
const SLEDGE_LEN = 74;

/** The layout of one view: where the snow is, how big the sledges are, and how long 1 N is drawn. */
type View = { snowY: number; s: number; kf: number; rope: number; anaBack: number; benBack: number };
const VIEW: Record<SledgeFig['who'], View> = {
  // Ana alone: large, room for the rope from flat to straight up
  A: { snowY: 212, s: 1.25, kf: 1.5, rope: 172, anaBack: 50, benBack: 0 },
  // both: Ben on the left, Ana on the right
  AB: { snowY: 204, s: 1.1, kf: 1.0, rope: 140, anaBack: 160, benBack: 34 },
};

/** "50.0 N", or the name, or "?" (the label of a component). */
function partText(label: PartLabel | undefined, name: string, size: number): string | null {
  if (label === undefined) return null;
  if (label === 'name') return name;
  if (label === 'shown') return `${fixed(size, 1)} N`;
  return '?';
}

/** The given values in the sheet header. On the explore screen (`angle` from the slider) it reads out both components. */
export function sledgeParams(fig: SledgeFig, angle?: number): string {
  if (angle !== undefined) {
    const c = components(fig.pull, angle);
    return `forward ${fixed(c.along, 1)} N · up ${fixed(c.across, 1)} N`;
  }
  const pull = `pull ${fixed(fig.pull, 0)} N at ${fixed(fig.angle, 0)}°`;
  return fig.who === 'AB' ? `${pull}, push ${fixed(fig.push, 0)} N` : pull;
}

/** Where things are drawn for this figure at this rope angle (shared by the drawing and its tap targets). */
function geometry(fig: SledgeFig, angle: number) {
  const v = VIEW[fig.who];
  const hitch: [number, number] = [v.anaBack + HITCH[0] * v.s, v.snowY + HITCH[1] * v.s];
  const d: [number, number] = [Math.cos(angle * RAD), -Math.sin(angle * RAD)]; // along the rope, up the page is −y
  const len = fig.pull * v.kf;
  const tip: [number, number] = [hitch[0] + d[0] * len, hitch[1] + d[1] * len];
  const c = components(fig.pull, angle);
  const fwd = c.along * v.kf;
  const up = c.across * v.kf;
  return { v, hitch, d, len, tip, c, fwd, up };
}

export function sledgeTargets(fig: SledgeFig, angle = fig.angle): TapTarget[] {
  if (!fig.targets) return [];
  const g = geometry(fig, angle);
  const centres: Record<(typeof SLEDGE_IDS)[number], [number, number]> = {
    pull: [g.hitch[0] + g.d[0] * g.len * 0.75, g.hitch[1] + g.d[1] * g.len * 0.75],
    forward: [g.hitch[0] + g.fwd * 0.72, g.hitch[1] + 4], // clear of the angle's label
    up: [g.hitch[0], g.hitch[1] - g.up * 0.55],
  };
  const names = { pull: "Ana's whole pull, along the rope", forward: 'the forward part, along the snow', up: 'the upward part' };
  return SLEDGE_IDS.map((id) => ({ id, x: centres[id][0] - TARGET / 2, y: centres[id][1] - TARGET / 2, w: TARGET, h: TARGET, label: names[id] }));
}

type Props = { fig: SledgeFig; live?: number; tap?: TapProps; clock?: DrawClock };

export function SledgeFigure({ fig, live, tap, clock = STILL }: Props) {
  const { palette: p } = useTheme();
  const angle = live ?? fig.angle;
  const g = geometry(fig, angle);
  const { v, hitch, d, tip, c, fwd, up } = g;
  const mitten: [number, number] = [hitch[0] + d[0] * v.rope, hitch[1] + d[1] * v.rope];
  const fwdTip: [number, number] = [hitch[0] + fwd, hitch[1]];
  const upTip: [number, number] = [hitch[0], hitch[1] - up];
  const split = fig.split;

  // Ben's sledge and push (both view only)
  const benPush: [number, number] = [v.benBack + BACK[0] * v.s, v.snowY + BACK[1] * v.s];
  const pushLen = fig.push * v.kf;

  // labels
  const pullText = fig.values ? `${fixed(fig.pull, 0)} N` : null;
  const fwdText = partText(fig.forward, 'forward', c.along);
  const upText = partText(fig.up, 'up', c.across);
  // the pull's label sits just above and left of the arrow's tip: outside the rectangle, clear of the rope
  const n: [number, number] = [-Math.sin(angle * RAD), -Math.cos(angle * RAD)];
  const pullW = (pullText?.length ?? 0) * 5.4 + 8;
  const pullAt: [number, number] = [tip[0] - 6 - pullW / 2, tip[1] - 9];
  const w = (text: string) => text.length * 5.4 + 8;
  const showArc = split !== 'chain' && angle > 4;
  const arcR = fig.who === 'A' ? 26 : 20;
  const arc = `M${hitch[0] + arcR},${hitch[1]} A${arcR},${arcR} 0 0 0 ${hitch[0] + d[0] * arcR},${hitch[1] + d[1] * arcR}`;
  const bis: [number, number] = [Math.cos((angle / 2) * RAD), -Math.sin((angle / 2) * RAD)];
  const arcLabelR = arcR + 14;

  return (
    <Group>
      {stage(clock, PEN.snow, <Hatch x1={8} x2={332} y={v.snowY} color={p.draw} clock={clock} from={PEN.snow[0]} to={PEN.snow[1]} />)}

      {/* tap boxes go under the arrows */}
      {fig.targets && <TapBoxes targets={sledgeTargets(fig, angle)} tap={tap} />}

      {stage(clock, PEN.sledge, <Sledge x={v.anaBack} y={v.snowY} s={v.s} />)}
      {fig.who === 'AB' && stage(clock, PEN.sledge, <Sledge x={v.benBack} y={v.snowY} s={v.s} />)}

      {/* Ana's rope and hand */}
      {stage(clock, 
        PEN.rope,
        <Group>
          <Line x1={hitch[0]} y1={hitch[1]} x2={mitten[0]} y2={mitten[1]} stroke={p.draw} strokeWidth={1.6} />
          <Mitten x={mitten[0]} y={mitten[1]} dx={d[0]} dy={d[1]} />
          <MonoLabel x={mitten[0] + n[0] * 17} y={mitten[1] + n[1] * 17 + 3} text="ANA" color={p.label} size={9} />
        </Group>,
      )}
      {fig.who === 'AB' &&
        stage(clock, 
          PEN.rope,
          <Group>
            <Mitten x={benPush[0] - 7} y={benPush[1]} dx={-1} dy={0} />
            <MonoLabel x={benPush[0] - 20} y={benPush[1] - 14} text="BEN" color={p.label} size={9} />
          </Group>,
        )}

      {/* components (dashed rectangle or tip to tail) */}
      {split &&
        stage(clock, 
          PEN.parts,
          <Group>
            {split === 'box' && (
              <Path d={`M${upTip[0]},${upTip[1]} H${tip[0]} V${fwdTip[1]}`} fill="none" stroke={p.label} strokeWidth={1.1} strokeDasharray="4 3" />
            )}
            {split === 'forward' && <Path d={`M${tip[0]},${tip[1]} V${fwdTip[1]}`} fill="none" stroke={p.label} strokeWidth={1.1} strokeDasharray="4 3" />}
            <ForceArrow x1={hitch[0]} y1={hitch[1]} x2={fwdTip[0]} y2={fwdTip[1]} color={p.force} width={2.4} />
            {split === 'box' && <ForceArrow x1={hitch[0]} y1={hitch[1]} x2={upTip[0]} y2={upTip[1]} color={p.force} width={2.4} />}
            {split === 'chain' && <ForceArrow x1={fwdTip[0]} y1={fwdTip[1]} x2={tip[0]} y2={tip[1]} color={p.force} width={2.4} />}
          </Group>,
        )}

      {/* the forces themselves, from the point where they act */}
      {stage(clock, 
        PEN.forces,
        <Group>
          <ForceArrow x1={hitch[0]} y1={hitch[1]} x2={tip[0]} y2={tip[1]} color={p.force} width={split ? 3.4 : 3.2} />
          <Circle cx={hitch[0]} cy={hitch[1]} r={3.2} fill={p.force} />
          {fig.who === 'AB' && (
            <Group>
              <ForceArrow x1={benPush[0]} y1={benPush[1]} x2={benPush[0] + pushLen} y2={benPush[1]} color={p.force} />
              <Circle cx={benPush[0]} cy={benPush[1]} r={3.2} fill={p.force} />
            </Group>
          )}
          {showArc && <Path d={arc} fill="none" stroke={p.label} strokeWidth={1.2} />}
        </Group>,
      )}

      {stage(clock, 
        PEN.labels,
        <Group>
          {showArc && <Tag x={hitch[0] + bis[0] * arcLabelR} y={hitch[1] + bis[1] * arcLabelR + 3} text={`${fixed(angle, 0)}°`} />}
          {pullText && <Tag x={pullAt[0]} y={pullAt[1]} text={pullText} />}
          {fig.who === 'AB' && fig.values && <Tag x={benPush[0] + pushLen / 2} y={benPush[1] - 14} text={`${fixed(fig.push, 0)} N`} />}
          {/* forward: right of its tip (above it, inside the triangle, when tip to tail) */}
          {fwdText && split === 'chain' && <Tag x={hitch[0] + fwd / 2} y={hitch[1] - 8} text={fwdText} />}
          {fwdText && split !== 'chain' && <Tag x={fwdTip[0] + 6 + w(fwdText) / 2} y={hitch[1] + 3} text={fwdText} />}
          {/* up: left of the arrow from the hitch, or right of the arrow tip to tail */}
          {upText && split === 'box' && <Tag x={hitch[0] - 6 - w(upText) / 2} y={hitch[1] - up / 2 + 3} text={upText} />}
          {upText && split === 'chain' && <Tag x={tip[0] + 6 + w(upText) / 2} y={hitch[1] - up / 2 + 3} text={upText} />}
        </Group>,
      )}
    </Group>
  );
}


/** A sledge: a flat deck on two struts and a runner that curls up at the front. Back of the runner at (x, y), facing right. */
function Sledge({ x, y, s, flip }: { x: number; y: number; s: number; flip?: boolean }) {
  const { palette: p } = useTheme();
  return (
    <Group transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <Path d="M14,-7 V0 M52,-7 V0" stroke={p.draw} strokeWidth={1.6} />
      <Rect x={4} y={-15} width={58} height={8} rx={2} fill={p.drawFillDark} stroke={p.draw} strokeWidth={1.6} />
      <Path d="M24,-15 V-7 M43,-15 V-7" stroke={p.draw} strokeWidth={1} opacity={0.6} />
      <Path d={`M0,0 H64 Q${SLEDGE_LEN},0 ${SLEDGE_LEN},-9 Q${SLEDGE_LEN},-15 68,-15`} fill="none" stroke={p.draw} strokeWidth={2.2} strokeLinecap="round" />
    </Group>
  );
}

/** A gloved hand at (x, y) with the sleeve going off along (dx, dy): the person is off the drawing. */
export function Mitten({ x, y, dx, dy, who = 'A' }: { x: number; y: number; dx: number; dy: number; who?: 'A' | 'B' }) {
  const { palette: p, material: m, stroke, pick } = useTheme();
  const [ex, ey] = [x + dx * 18, y + dy * 18];
  return (
    <Group>
      <Line x1={x} y1={y} x2={ex} y2={ey} stroke={p.draw} strokeWidth={10.5} strokeLinecap="round" />
      <Line x1={x} y1={y} x2={ex} y2={ey} stroke={pick(who === 'A' ? m.clothA : m.clothB, p.shirt)} strokeWidth={7.5} strokeLinecap="round" />
      <Circle cx={x} cy={y} r={5.5} fill={pick(who === 'A' ? m.skinA : m.skinB, p.skin)} stroke={p.draw} strokeWidth={pick(stroke.body, 1.6)} />
    </Group>
  );
}

// ── The hill ──

// The slope runs up to the right; its foot is off the sheet (so the forces can be drawn large), and its angle is marked
// against a dashed horizontal line at `mark`.
const HILL = { foot: -150, footY: 222, at: 212, mark: 36, kf: 0.56, cgUp: 9, s: 0.8 };

export function hillParams(fig: HillFig): string {
  return `W = ${fixed(fig.weight, 0)} N, hill at ${fixed(fig.angle, 0)}°`;
}

export function HillFigure({ fig, clock = STILL }: { fig: HillFig; clock?: DrawClock }) {
  const { palette: p } = useTheme();
  const th = fig.angle * RAD;
  const tan = Math.tan(th);
  const yAt = (x: number) => HILL.footY - (x - HILL.foot) * tan;
  // the point where the sledge rests, and its centre of gravity (straight out of the slope from there)
  const P: [number, number] = [HILL.at, yAt(HILL.at)];
  const cg: [number, number] = [P[0] - HILL.cgUp * Math.sin(th), P[1] - HILL.cgUp * Math.cos(th)];
  const parts = onSlope(fig.weight, fig.angle);
  const wLen = fig.weight * HILL.kf;
  const downSlope: [number, number] = [-Math.cos(th), Math.sin(th)];
  const into: [number, number] = [Math.sin(th), Math.cos(th)];
  const wTip: [number, number] = [cg[0], cg[1] + wLen];
  const aTip: [number, number] = [cg[0] + downSlope[0] * parts.along * HILL.kf, cg[1] + downSlope[1] * parts.along * HILL.kf];
  const iTip: [number, number] = [cg[0] + into[0] * parts.into * HILL.kf, cg[1] + into[1] * parts.into * HILL.kf];
  const alongText = partText(fig.along, 'along', parts.along);
  const intoText = partText(fig.into, 'into', parts.into);
  const w = (text: string) => text.length * 5.4 + 8;
  const wText = `W = ${fixed(fig.weight, 0)} N`;
  // the angle between W and the line into the slope
  const r = 30;
  const arcW = `M${cg[0]},${cg[1] + r} A${r},${r} 0 0 0 ${cg[0] + into[0] * r},${cg[1] + into[1] * r}`;
  const bis = [Math.sin(th / 2), Math.cos(th / 2)];
  // the hill's angle, against a dashed horizontal line
  const R = 46;
  const M: [number, number] = [HILL.mark, yAt(HILL.mark)];
  const arcFoot = `M${M[0] + R},${M[1]} A${R},${R} 0 0 0 ${M[0] + R * Math.cos(th)},${M[1] - R * Math.sin(th)}`;

  return (
    <Group>
      {stage(clock, 
        PEN.snow,
        <Group>
          {/* the snow surface, hatched underneath like ground on a drawing */}
          <Group transform={`translate(6 ${yAt(6)}) rotate(${-fig.angle})`}>
            <Hatch x1={0} x2={(334 - 6) / Math.cos(th)} y={0} color={p.draw} />
          </Group>
          <Path d={`M${M[0]},${M[1]} H${M[0] + R + 26}`} stroke={p.label} strokeWidth={1.1} strokeDasharray="4 3" />
          <Path d={arcFoot} fill="none" stroke={p.label} strokeWidth={1.2} />
          <MonoLabel x={M[0] + (R + 14) * Math.cos(th / 2)} y={M[1] - (R + 14) * Math.sin(th / 2) + 3} text={`${fixed(fig.angle, 0)}°`} color={p.ink} size={9} />
        </Group>,
      )}
      {/* the sledge points down the slope */}
      {stage(clock, 
        PEN.sledge,
        <Group transform={`translate(${P[0]} ${P[1]}) rotate(${-fig.angle})`} opacity={0.6}>
          <Sledge x={CG[0] * HILL.s} y={0} s={HILL.s} flip />
        </Group>,
      )}
      {stage(clock, 
        PEN.parts,
        <Group>
          <Path d={`M${aTip[0]},${aTip[1]} L${wTip[0]},${wTip[1]} L${iTip[0]},${iTip[1]}`} fill="none" stroke={p.label} strokeWidth={1.1} strokeDasharray="4 3" />
          <ForceArrow x1={cg[0]} y1={cg[1]} x2={aTip[0]} y2={aTip[1]} color={p.force} width={2.4} />
          <ForceArrow x1={cg[0]} y1={cg[1]} x2={iTip[0]} y2={iTip[1]} color={p.force} width={2.4} />
          <Path d={arcW} fill="none" stroke={p.label} strokeWidth={1.2} />
        </Group>,
      )}
      {stage(clock, 
        PEN.forces,
        <Group>
          <ForceArrow x1={cg[0]} y1={cg[1]} x2={wTip[0]} y2={wTip[1]} color={p.force} width={3.4} />
          <CgMark x={cg[0]} y={cg[1]} color={p.draw} />
        </Group>,
      )}
      {stage(clock, 
        PEN.labels,
        <Group>
          <Tag x={cg[0] - 6 - w(wText) / 2} y={cg[1] + wLen * 0.78} text={wText} />
          <MonoLabel x={cg[0] + bis[0] * (r + 26)} y={cg[1] + bis[1] * (r + 26) + 3} text={`${fixed(fig.angle, 0)}°`} color={p.ink} size={9} />
          {alongText && <Tag x={aTip[0] - 6 - w(alongText) / 2} y={aTip[1] - 6} text={alongText} />}
          {intoText && <Tag x={(cg[0] + iTip[0]) / 2 + 8 + w(intoText) / 2} y={(cg[1] + iTip[1]) / 2 + 3} text={intoText} />}
        </Group>,
      )}
    </Group>
  );
}
