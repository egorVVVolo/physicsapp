// FIG: an "exploded" view for Newton's third law. Three bodies, pulled apart and stacked as they really are:
// you, the scales, the Earth. Each body sits in its own white zone labelled "FORCES ON …", and every arrow
// starts exactly where the force acts, on the centre line of the bodies:
//   on you: W (the Earth's pull, from the centre of gravity, down) and N (the scales' push, from the middle of the soles, up);
//   on the scales: P (your push, from the middle of the top face, down);  on the Earth: E (your pull, from its surface, up).
// The person is drawn large and pale so the arrows read clearly over the body; W and N do not meet.
// With `explode` the bodies start stacked together and move apart, then the arrows grow one by one.
// Once the pair N–P is found, a bracket joins them: same size, opposite direction.
// The first time it appears in a lesson it draws itself first (the Earth, the scales, the person, as they stand stacked),
// and only then do the bodies move apart and the arrows grow.
import { G as Group, Circle, Path, Rect, Text as SvgText } from 'react-native-svg';
import type { PairsFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { svgLetter } from '@/theme/svgFont';
import { phaseOf, STILL, useOnceTime, type DrawClock } from './anim';
import { CgMark, DrawnFade, DrawnPath, DrawnShape, FILLS, ForceArrow, MonoLabel, rectPath } from './draw';
import { CG_MARK, Person, PERSON_CG, Scales, SCALES_H } from './people';
import type { TapProps, TapTarget } from './Sheet';

export const PAIRS_VB = { w: 320, h: 362 };
/** This figure is taller than the others, so it may be drawn taller on the sheet. */
export const PAIRS_MAX_H = 390;
const L = 34; // every arrow has the same length: the lift is at rest, and every force here equals mg

const PX = 150; // centre line of the person, the scales and E: every force acts on it
const PERSON_S = 1.1;
const SCALES_S = 1.3; // the scales are drawn larger so P fits inside their height
const SCALES_W = 100;

// The three zones, top to bottom. The labels sit in the top-left corner, clear of the bodies.
const Z_X = 10;
const Z_W = 300;
const ZONE = {
  you: { y: 6, h: 180, tag: 'FORCES ON YOU' },
  scales: { y: 194, h: 80, tag: 'FORCES ON THE SCALES' },
  earth: { y: 282, h: 74, tag: 'FORCES ON THE EARTH' },
} as const;

const SOLES = 176;
const CG_Y = SOLES - PERSON_CG * PERSON_S;
const SCALES_BASE = 264; // bottom of the scales
const SCALES_TOP = SCALES_BASE - (SCALES_H - 3) * SCALES_S; // the middle of the top face, where the soles stand
// The Earth's surface: a gentle arc, y(x) for a quadratic from the zone's lower corners through a peak at the middle
const EARTH_EDGE = 350;
const EARTH_CTRL = 318;
const earthY = (x: number) => {
  const t = (x - Z_X) / Z_W;
  return EARTH_EDGE - 2 * (EARTH_EDGE - EARTH_CTRL) * t * (1 - t);
};

type Id = 'W' | 'N' | 'P' | 'E';
// Where each force starts, its direction (+1 down, −1 up) and where its letter badge sits (all to the right)
const F: Record<Id, { x: number; y: number; dir: 1 | -1; bx: number; by: number }> = {
  W: { x: PX, y: CG_Y, dir: 1, bx: PX + 42, by: CG_Y + L - 6 },
  N: { x: PX, y: SOLES, dir: -1, bx: PX + 40, by: SOLES - L / 2 },
  P: { x: PX, y: SCALES_TOP, dir: 1, bx: PX + 24, by: SCALES_TOP + L / 2 + 2 },
  E: { x: PX, y: earthY(PX), dir: -1, bx: PX + 22, by: earthY(PX) - L / 2 },
};
const ORDER: Id[] = ['W', 'N', 'P', 'E'];

// when the pen draws each part, as shares of the draw-in
const PEN = {
  zones: [0, 0.24], // only when the zones are not part of the "explode" (then they appear as the bodies move apart)
  earth: [0.06, 0.3],
  scales: [0.26, 0.42],
  person: [0.38, 0.62],
} as const;

/** The box around an arrow and its badge: the tap target and the soft highlight when it is chosen. */
const boxOf = (id: Id) => {
  const f = F[id];
  const top = f.dir > 0 ? f.y : f.y - L;
  return { x: f.x - 20, y: top - 6, w: f.bx - f.x + 34, h: L + 12 };
};

export function pairsTargets(): TapTarget[] {
  const box = (id: 'W' | 'P' | 'E', label: string) => ({ id, ...boxOf(id), label });
  return [box('W', 'W, the force on you from the Earth'), box('P', 'P, the force on the scales from you'), box('E', 'E, the force on the Earth from you')];
}

/** `kept`: the screen before showed these bodies and arrows already, so they are simply there. */
export function PairsFigure({ fig, tap, clock = STILL, kept = false }: { fig: PairsFig; tap?: TapProps; clock?: DrawClock; kept?: boolean }) {
  const { palette: p, material: m } = useTheme();
  // the timeline (seconds): bodies move apart, zones appear, arrows grow one by one. It waits while the figure draws itself.
  const explode = !!fig.explode;
  const t = useOnceTime(explode ? 3.2 : 1.4, !clock.on, kept);
  const apart = explode ? phaseOf(t, 0.35, 1.0) : 1;
  const zones = explode ? phaseOf(t, 0.9, 0.6) : 1;
  const grow = (i: number) => phaseOf(t, (explode ? 1.5 : 0.15) + i * 0.28, 0.45);
  // stacked together at the start: soles on the scales, scales on the Earth
  const scalesDy = (1 - apart) * (earthY(PX) - SCALES_BASE);
  const personDy = scalesDy + (1 - apart) * (SCALES_TOP - SOLES);

  const found = tap?.marks?.P === 'right';
  const colorOf = (id: Id) => {
    const m = tap?.marks?.[id];
    if (m === 'right' || (found && id === 'N')) return p.ok;
    if (m === 'wrong') return p.bad;
    return p.force;
  };
  const textOf = (c: string) => (c === p.force ? p.forceText : c);

  const arrow = (id: Id, i: number) => {
    const f = F[id];
    const k = grow(i);
    if (k <= 0) return null;
    const on = tap?.selected === id && !tap?.marks?.[id]; // the highlight goes once the answer is marked
    const c = colorOf(id);
    const len = L * k;
    const y2 = f.y + f.dir * len;
    const given = id === 'N'; // the force the question is about: a filled badge
    const dy = id === 'N' || id === 'W' ? personDy : id === 'P' ? scalesDy : 0;
    const b = boxOf(id);
    return (
      <Group key={id} transform={dy ? `translate(0 ${dy})` : undefined} opacity={Math.min(1, k * 2)}>
        {/* chosen: a soft blue box, like a chosen answer card */}
        {on && <Rect x={b.x} y={b.y} width={b.w} height={b.h} rx={10} fill={p.selectBg} fillOpacity={0.85} stroke={p.select} strokeWidth={stroke.body} />}
        {/* a white halo keeps the arrow readable over the drawing */}
        <ForceArrow x1={f.x} y1={f.y} x2={f.x} y2={y2} color={p.page} width={on ? 8.5 : 7} />
        <ForceArrow x1={f.x} y1={f.y} x2={f.x} y2={y2} color={c} width={on ? 4.4 : 3.2} />
        {/* the point where the force acts */}
        <Circle cx={f.x} cy={f.y} r={3.6} fill={c} stroke={p.page} strokeWidth={stroke.thin} />
        {k > 0.6 && (
          <Group>
            <Circle cx={f.bx} cy={f.by} r={10} fill={given ? c : p.page} stroke={c} strokeWidth={stroke.body} />
            <SvgText x={f.bx} y={f.by + 5} fontSize={14} fill={given ? p.page : textOf(c)} fontFamily={svgLetter} textAnchor="middle">
              {id}
            </SvgText>
          </Group>
        )}
      </Group>
    );
  };

  const zone = (z: (typeof ZONE)[keyof typeof ZONE]) => (
    <Group key={z.tag} opacity={zones}>
      <DrawnShape clock={explode ? STILL : clock} pen={PEN.zones} {...rectPath(Z_X, z.y, Z_W, z.h, 10)} fill={p.page} stroke={p.paperLine} strokeWidth={stroke.thin} />
      <MonoLabel x={Z_X + 10} y={z.y + 16} text={z.tag} color={p.label} size={9} anchor="start" />
    </Group>
  );

  const zb = ZONE.earth.y + ZONE.earth.h; // bottom of the Earth's zone
  return (
    <Group>
      {zone(ZONE.you)}
      {zone(ZONE.scales)}
      {zone(ZONE.earth)}

      {/* the Earth: a large arc filling the bottom of its zone, with rounded corners to match it */}
      <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
        <Path
          d={`M${Z_X + 1},${EARTH_EDGE} Q${Z_X + Z_W / 2},${EARTH_CTRL} ${Z_X + Z_W - 1},${EARTH_EDGE} L${Z_X + Z_W - 1},${zb - 10} A9,9 0 0 1 ${Z_X + Z_W - 10},${zb - 1} L${Z_X + 10},${zb - 1} A9,9 0 0 1 ${Z_X + 1},${zb - 10} Z`}
          fill={p.drawFill}
        />
      </DrawnFade>
      {/* the arc is a little longer than its chord of 298 */}
      <DrawnPath clock={clock} len={306} from={PEN.earth[0]} to={PEN.earth[1]} d={`M${Z_X + 1},${EARTH_EDGE} Q${Z_X + Z_W / 2},${EARTH_CTRL} ${Z_X + Z_W - 1},${EARTH_EDGE}`} fill="none" stroke={p.draw} strokeWidth={stroke.body} />

      {/* the scales, floating in their zone (no display: here only the push on them matters) */}
      <Group transform={`translate(${PX} ${SCALES_BASE + scalesDy}) scale(${SCALES_S})`}>
        <Scales x={0} y={0} reading={null} width={SCALES_W} clock={clock} pen={PEN.scales} />
      </Group>

      {/* you: large and pale, so the force arrows read clearly over the body; the CG mark stays sharp */}
      <Group transform={personDy ? `translate(0 ${personDy})` : undefined}>
        <Group opacity={0.42}>
          <Person x={PX} y={SOLES} scale={PERSON_S} cg={false} clock={clock} pen={PEN.person} />
        </Group>
        <DrawnFade clock={clock} from={CG_MARK[0]} to={CG_MARK[1]}>
          <CgMark x={PX} y={CG_Y} color={p.draw} />
        </DrawnFade>
      </Group>

      {ORDER.map(arrow)}

      {found && <PairBracket color={p.ok} text={p.okText} />}
    </Group>
  );
}

/** Joins N and P once the pair is found: one bracket to their right, and four short lines of text above it. */
function PairBracket({ color, text }: { color: string; text: string }) {
  const t = useOnceTime(0.6);
  const k = phaseOf(t, 0, 0.5);
  const x = PX + 74;
  const y1 = F.N.y - L / 2;
  const y2 = F.P.y + L / 2;
  const mid = (y1 + y2) / 2;
  const h = ((y2 - y1) / 2) * k;
  const lines = ['THIRD-LAW PAIR', 'same size,', 'opposite', 'direction'];
  return (
    <Group opacity={k}>
      <Path d={`M${x - 8},${mid - h} L${x},${mid - h} L${x},${mid + h} L${x - 8},${mid + h}`} fill="none" stroke={color} strokeWidth={stroke.body} strokeLinejoin="round" />
      {lines.map((s, i) => (
        <MonoLabel key={s} x={x - 8} y={y1 - 12 - (lines.length - 1 - i) * 13} text={s} color={text} size={9} anchor="start" />
      ))}
    </Group>
  );
}
