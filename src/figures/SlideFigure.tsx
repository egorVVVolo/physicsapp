// FIG: a child on a playground slide (src/physics/energy). The slide is a straight chute of height h and length L,
// with a ladder up to a deck. Played, the child slides down from rest by the model, a = g h ÷ L − F ÷ m, and rests
// at the foot. Two bars at the top to one scale: the GPE the child gives up (TOP) and where it went (BOTTOM): the
// kinetic energy at the foot, ½mv² = mgh − FL, and the work done against friction, FL, which heats the child and the
// chute. The friction force acts up the chute from where the child touches it.
// On the explore screen the slider sets L at the same height and friction: a longer slide takes more energy.
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { kineticEnergy, potentialChange, slideAcceleration, slideSpeed } from '@/physics/energy';
import { workDone } from '@/physics/work';
import { fixed, sig } from '@/physics/format';
import type { SlideFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { useReducedMotionPref } from '@/ui/parts';
import { STILL, useLoopTime, useTween, type DrawClock } from './anim';
import { ForceArrow, Hatch, MonoLabel } from './draw';
import { Dim, HollowArrow, stage, Tag } from './kit';

export const SLIDE_VB = { w: 340, h: 230 };

const PEN = { ground: [0, 0.25], slide: [0.2, 0.55], child: [0.5, 0.7], bars: [0.66, 0.86], labels: [0.82, 0.98] } as const;
const GROUND = 204;
const K = 34; // viewBox units per metre: a 7.0 m slide just fits
const XT = 74; // where the chute starts, at the deck
const KF = 0.32; // viewBox units per newton
const KV = 3.2; // viewBox units per m s⁻¹
const BAR = { x: 74, y1: 20, y2: 46, h: 15, w: 250 }; // the energy bars: x, rows, height, the length of the GPE bar
const HOLD = 1.2;
const LEG = 30; // viewBox units from the child's hips to its feet

type Pt = [number, number];

/** The slide's length (the slider's, on the explore screen), and the energies at its foot. */
export function slideNumbers(fig: SlideFig, live?: number) {
  const L = live ?? fig.L;
  const ep = potentialChange(fig.m, fig.h);
  const heat = Math.min(ep, workDone(fig.F, L));
  const v = slideSpeed(fig.m, fig.h, L, fig.F);
  return { L, ep, heat, ek: kineticEnergy(fig.m, v), v };
}

export const slidePlays = (fig: SlideFig): boolean => fig.play === true;

export function slideParams(fig: SlideFig, live?: number): string {
  if (live !== undefined) return `at the foot v = ${fixed(slideNumbers(fig, live).v, 2)} m s⁻¹`;
  return `m = ${fig.m} kg, h = ${fixed(fig.h, 1)} m, L = ${fixed(fig.L, 1)} m`;
}

type Props = { fig: SlideFig; live?: number; playing: boolean; clock?: DrawClock };

export function SlideFigure({ fig, live, playing, clock = STILL }: Props) {
  const { palette: p, soft } = useTheme();
  const reduced = useReducedMotionPref();
  const n = slideNumbers(fig, live);
  const L = useTween(n.L, undefined, live !== undefined ? 160 : 420);
  const plays = slidePlays(fig) && live === undefined;
  const a = slideAcceleration(fig.m, fig.h, fig.L, fig.F);
  const tDown = Math.sqrt((2 * fig.L) / a);
  const loop = useLoopTime(plays && playing && !reduced && !clock.on, tDown, 'slide', HOLD);
  const t = plays && !reduced ? loop : tDown;
  const s = plays ? Math.min(fig.L, 0.5 * a * t * t) : L; // how far down the chute the child has gone (the model)
  const v = plays ? Math.min(n.v, a * t) : n.v;
  const atFoot = s >= L - 1e-6;

  const deckY = GROUND - fig.h * K;
  const run = Math.sqrt(Math.max(0, L * L - fig.h * fig.h)) * K;
  const top: Pt = [XT, deckY];
  const foot: Pt = [XT + run, GROUND - 6];
  const len = Math.hypot(foot[0] - top[0], foot[1] - top[1]);
  const u: Pt = [(foot[0] - top[0]) / len, (foot[1] - top[1]) / len]; // down the chute
  const nrm: Pt = [u[1], -u[0]]; // out of the chute, upwards
  // the child is drawn by the hips, so its legs end on the run-out: the model's distance is scaled onto the chute less a leg
  const along = (s / (plays ? fig.L : L)) * (len - LEG);
  const contact: Pt = [top[0] + u[0] * along, top[1] + u[1] * along];
  const rungs: string[] = [];
  for (let y = GROUND - 14; y > deckY + 4; y -= 13) rungs.push(`M${XT - 30},${y} H${XT - 14}`);
  const mid: Pt = [(top[0] + foot[0]) / 2, (top[1] + foot[1]) / 2];
  const frictionKnown = fig.friction === 'shown';
  const fLen = frictionKnown ? fig.F * KF : 22;
  const fTip: Pt = [contact[0] - u[0] * fLen, contact[1] - u[1] * fLen];

  return (
    <Group>
      {stage(clock, PEN.ground, <Hatch x1={8} x2={332} y={GROUND} color={p.draw} clock={clock} from={PEN.ground[0]} to={PEN.ground[1]} />)}

      {stage(clock, 
        PEN.slide,
        <Group>
          {/* the ladder and the deck with its handrail */}
          <Path d={`M${XT - 32},${GROUND} V${deckY - 22} M${XT - 12},${GROUND} V${deckY}`} stroke={p.draw} strokeWidth={stroke.body} fill="none" />
          <Path d={rungs.join(' ')} stroke={p.draw} strokeWidth={stroke.thin} fill="none" />
          <Rect x={XT - 34} y={deckY} width={34} height={5} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.thin} />
          <Path d={`M${XT - 32},${deckY - 22} H${XT - 12} L${XT - 2},${deckY - 8}`} stroke={p.draw} strokeWidth={stroke.body} fill="none" strokeLinejoin="round" />
          {/* the chute: a surface with a side wall, a post under its middle, a short run-out at the foot */}
          <Path d={`M${top[0]},${top[1]} L${foot[0]},${foot[1]} L${foot[0] + 16},${foot[1]} L${foot[0] + 16},${foot[1] + 5} L${foot[0]},${foot[1] + 5} L${top[0]},${top[1] + 6} Z`} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.body} strokeLinejoin="round" />
          <Line x1={mid[0]} y1={mid[1] + 5} x2={mid[0]} y2={GROUND} stroke={p.draw} strokeWidth={stroke.body} />
        </Group>,
      )}

      {stage(clock, 
        PEN.child,
        <Group transform={`translate(${contact[0]} ${contact[1]}) scale(1.25) translate(${-contact[0]} ${-contact[1]})`}>
          <Child at={contact} u={u} />
        </Group>,
      )}

      {stage(clock, 
        PEN.labels,
        <Group>
          {/* friction up the chute, from where the child touches it */}
          {fig.friction && (
            <Group>
              <ForceArrow x1={contact[0]} y1={contact[1]} x2={fTip[0]} y2={fTip[1]} color={p.force} dashed={!frictionKnown} />
              <Circle cx={contact[0]} cy={contact[1]} r={2.8} fill={p.force} />
              <FrictionTag at={[fTip[0] - nrm[0] * 13, fTip[1] - nrm[1] * 13 + 3]} text={frictionKnown ? `F = ${sig(fig.F)} N` : 'F = ?'} />
            </Group>
          )}
          {/* the child's velocity: down the chute while sliding */}
          {v > 0.05 && (
            <Group>
              <HollowArrow from={[contact[0] + nrm[0] * 50, contact[1] + nrm[1] * 50]} to={[contact[0] + nrm[0] * 50 + u[0] * v * KV, contact[1] + nrm[1] * 50 + u[1] * v * KV]} color={p.draw} weight="thin" />
              {(atFoot || !plays) && <Tag x={contact[0] + nrm[0] * 50 + u[0] * v * KV * 0.5} y={contact[1] + nrm[1] * 50 - 10} text={`v = ${fixed(v, 1)} m s⁻¹`} />}
            </Group>
          )}
          <Dim a={[XT - 50, GROUND]} b={[XT - 50, deckY]} text={`${fixed(fig.h, 1)} m`} />
          {/* the length along the chute, its value near the top so it never meets the friction label by the child */}
          <Dim a={top} b={foot} offset={-25} />
          <Tag x={top[0] + (foot[0] - top[0]) * 0.3 - nrm[0] * 25} y={top[1] + (foot[1] - top[1]) * 0.3 - nrm[1] * 25 + 3.5} text={`${fixed(L, 1)} m`} />
        </Group>,
      )}

      {stage(clock, PEN.bars, <Bars n={n} heat={fig.heat} />)}
    </Group>
  );
}

/** The friction force's size in the force colour, on a patch of paper so the chute and the post never run through it. */
function FrictionTag({ at, text }: { at: Pt; text: string }) {
  const { palette: p } = useTheme();
  return <Tag x={at[0]} y={at[1]} text={text} color={p.forceText} />;
}

/** TOP: the GPE given up. BOTTOM: the kinetic energy at the foot and, once shown, the energy friction took. */
function Bars({ n, heat }: { n: ReturnType<typeof slideNumbers>; heat: SlideFig['heat'] }) {
  const { palette: p, soft } = useTheme();
  const k = BAR.w / n.ep;
  const wEk = useTween(n.ek * k, undefined, 160);
  const wHeat = n.ep * k - wEk;
  const showHeat = heat === 'shown';
  const hatch: string[] = [];
  for (let x = BAR.x + wEk + 3; x + 5 < BAR.x + BAR.w; x += 6) hatch.push(`M${x},${BAR.y2 + BAR.h - 2} L${x + 5},${BAR.y2 + 2}`);
  const inside = (x: number, w: number, y: number, text: string, color: string) =>
    w >= text.length * 5.2 + 8 ? <MonoLabel x={x + w / 2} y={y + BAR.h / 2 + 3.2} text={text} color={color} size={8.5} /> : null;
  return (
    <Group>
      <MonoLabel x={BAR.x - 6} y={BAR.y1 + BAR.h / 2 + 3} text="Top" color={p.label} size={8.5} anchor="end" />
      <MonoLabel x={BAR.x - 6} y={BAR.y2 + BAR.h / 2 + 3} text="Foot" color={p.label} size={8.5} anchor="end" />
      <Rect x={BAR.x} y={BAR.y1} width={BAR.w} height={BAR.h} fill={soft.B.fill} stroke={soft.B.edge} strokeWidth={1.6} />
      {inside(BAR.x, BAR.w, BAR.y1, `Ep lost ${sig(n.ep)} J`, p.ink)}
      {wEk > 0.5 && <Rect x={BAR.x} y={BAR.y2} width={wEk} height={BAR.h} fill={soft.A.fill} stroke={soft.A.edge} strokeWidth={1.6} />}
      {inside(BAR.x, wEk, BAR.y2, `Ek ${sig(n.ek)} J`, p.ink)}
      {showHeat && wHeat > 0.5 && (
        <Group>
          <Rect x={BAR.x + wEk} y={BAR.y2} width={wHeat} height={BAR.h} fill={soft.metal.fill} />
          <Path d={hatch.join(' ')} stroke={p.draw} strokeWidth={stroke.hair} opacity={0.35} />
          <Rect x={BAR.x + wEk} y={BAR.y2} width={wHeat} height={BAR.h} fill="none" stroke={p.draw} strokeWidth={stroke.thin} />
          {wHeat >= 92 ? (
            <Group>
              <Rect x={BAR.x + wEk + wHeat / 2 - 44} y={BAR.y2 + 2} width={88} height={BAR.h - 4} rx={2} fill={soft.metal.fill} />
              <MonoLabel x={BAR.x + wEk + wHeat / 2} y={BAR.y2 + BAR.h / 2 + 3.2} text={`heating ${sig(n.heat)} J`} color={p.ink} size={8.5} />
            </Group>
          ) : null}
        </Group>
      )}
    </Group>
  );
}

/** A child sitting on the chute, legs out along it, back upright: a pictogram in one soft tone with an edge. */
function Child({ at, u }: { at: Pt; u: Pt }) {
  const { soft } = useTheme();
  const nrm: Pt = [u[1], -u[0]];
  const hip: Pt = [at[0] + nrm[0] * 5.5, at[1] + nrm[1] * 5.5];
  const knee: Pt = [hip[0] + u[0] * 12 + nrm[0] * 3, hip[1] + u[1] * 12 + nrm[1] * 3];
  const ankle: Pt = [hip[0] + u[0] * 23, hip[1] + u[1] * 23];
  const shoulder: Pt = [hip[0] - 3, hip[1] - 17];
  const head: Pt = [shoulder[0] - 1, shoulder[1] - 10];
  const hand: Pt = [knee[0] - 2, knee[1] - 3];
  const limb = (pts: Pt[], w: number) => {
    const d = pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ');
    return (
      <Group>
        <Path d={d} stroke={soft.A.edge} strokeWidth={w + 2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d={d} stroke={soft.A.fill} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Group>
    );
  };
  return (
    <Group>
      {limb([hip, knee, ankle], 5.5)}
      {limb([hip, shoulder], 9)}
      {limb([[shoulder[0] + 1, shoulder[1] + 2], hand], 3.6)}
      <Circle cx={head[0]} cy={head[1]} r={7} fill={soft.A.fill} stroke={soft.A.edge} strokeWidth={1.4} />
    </Group>
  );
}
