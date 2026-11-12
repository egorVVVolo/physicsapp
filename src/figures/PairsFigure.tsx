// FIG: an "exploded" view for Newton's third law. Three bodies, pulled apart and stacked as they really are:
// you, the scales, the Earth. Each body sits in its own white zone labelled "FORCES ON …", and every arrow
// starts on the body it acts on, so it is obvious which object each force is on:
//   on you: W (the Earth's pull, from the centre of gravity) and N (the scales' push, from the soles);
//   on the scales: P (your push, from the top face);  on the Earth: E (your pull, from its surface).
// With `explode` the bodies start stacked together and move apart, then the arrows grow one by one.
// Once the pair N–P is found, a bracket joins them: same size, opposite direction.
import { G as Group, Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import type { PairsFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { svgLetter } from '@/theme/svgFont';
import { phaseOf, useOnceTime } from './anim';
import { ForceArrow, MonoLabel } from './draw';
import { Person, Scales, SCALES_H } from './people';
import type { TapProps, TapTarget } from './Sheet';

export const PAIRS_VB = { w: 340, h: 292 };
const L = 36; // every arrow has the same length: the lift is at rest, and every force here equals mg

const PX = 118; // centre line of the person, the scales and E
const LINE_X = 158; // N and P act at the contact between soles and scales: they share this line
const PERSON_S = 0.8;

// The three zones, top to bottom
const ZONE = {
  you: { y: 6, h: 126, tag: 'FORCES ON YOU' },
  scales: { y: 140, h: 70, tag: 'FORCES ON THE SCALES' },
  earth: { y: 218, h: 68, tag: 'FORCES ON THE EARTH' },
} as const;
const Z_X = 10;
const Z_W = 320;

const SOLES = 124;
const SCALES_BASE = 184; // bottom of the scales
const SCALES_TOP = SCALES_BASE - SCALES_H;
const CG_Y = SOLES - 80 * PERSON_S;
// The Earth's surface: a gentle arc, y(x) for a quadratic from (10, 274) through a peak at the middle
const EARTH_EDGE = 274;
const EARTH_CTRL = 252;
const earthY = (x: number) => {
  const t = (x - Z_X) / Z_W;
  return EARTH_EDGE - 2 * (EARTH_EDGE - EARTH_CTRL) * t * (1 - t);
};

type Id = 'W' | 'N' | 'P' | 'E';
// Where each force starts, its direction (+1 down, −1 up) and where its letter badge sits
const F: Record<Id, { x: number; y: number; dir: 1 | -1; bx: number; by: number }> = {
  W: { x: PX, y: CG_Y, dir: 1, bx: PX - 24, by: CG_Y + L - 4 },
  N: { x: LINE_X, y: SOLES, dir: -1, bx: LINE_X + 14, by: SOLES - L / 2 },
  P: { x: LINE_X, y: SCALES_TOP, dir: 1, bx: LINE_X + 14, by: SCALES_TOP + L + 6 },
  E: { x: PX, y: earthY(PX), dir: -1, bx: PX + 14, by: earthY(PX) - L / 2 },
};
const ORDER: Id[] = ['W', 'N', 'P', 'E'];

export function pairsTargets(): TapTarget[] {
  const box = (id: 'W' | 'P' | 'E', label: string) => {
    const f = F[id];
    const top = f.dir > 0 ? f.y : f.y - L;
    return { id, x: f.x - 22, y: top - 6, w: 56, h: L + 12, label };
  };
  return [box('W', 'W, the force on you from the Earth'), box('P', 'P, the force on the scales from you'), box('E', 'E, the force on the Earth from you')];
}

export function PairsFigure({ fig, tap }: { fig: PairsFig; tap?: TapProps }) {
  const { palette: p } = useTheme();
  // the timeline (seconds): bodies move apart, zones appear, arrows grow one by one
  const explode = !!fig.explode;
  const t = useOnceTime(explode ? 3.2 : 1.4);
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
    const on = tap?.selected === id && !tap?.marks?.[id]; // the ring goes once the answer is marked
    const c = colorOf(id);
    const len = L * k;
    const y2 = f.y + f.dir * len;
    const given = id === 'N'; // the force the question is about: a filled badge
    const dy = id === 'N' || id === 'W' ? personDy : id === 'P' ? scalesDy : 0;
    return (
      <Group key={id} transform={dy ? `translate(0 ${dy})` : undefined} opacity={Math.min(1, k * 2)}>
        {on && <Rect x={f.x - 18} y={Math.min(f.y, y2) - 5} width={52} height={L + 10} rx={10} fill="none" stroke={p.ink} strokeWidth={2} />}
        {/* the point where the force acts */}
        <Circle cx={f.x} cy={f.y} r={3.4} fill={c} />
        {/* a white halo keeps the arrow readable where it crosses the drawing */}
        <ForceArrow x1={f.x} y1={f.y} x2={f.x} y2={y2} color="#FFFFFF" width={7} />
        <ForceArrow x1={f.x} y1={f.y} x2={f.x} y2={y2} color={c} />
        {k > 0.6 && (
          <Group>
            <Circle cx={f.bx} cy={f.by} r={9.5} fill={given ? c : '#FFFFFF'} stroke={c} strokeWidth={1.6} />
            <SvgText x={f.bx} y={f.by + 5} fontSize={14} fill={given ? '#FFFFFF' : textOf(c)} fontFamily={svgLetter} textAnchor="middle">
              {id}
            </SvgText>
          </Group>
        )}
      </Group>
    );
  };

  const zone = (z: (typeof ZONE)[keyof typeof ZONE]) => (
    <Group key={z.tag} opacity={zones}>
      <Rect x={Z_X} y={z.y} width={Z_W} height={z.h} rx={10} fill="#FFFFFF" stroke={p.paperLine} strokeWidth={1.2} />
      <MonoLabel x={Z_X + Z_W - 10} y={z.y + 16} text={z.tag} color={p.label} size={9} anchor="end" />
    </Group>
  );

  return (
    <Group>
      {zone(ZONE.you)}
      {zone(ZONE.scales)}
      {zone(ZONE.earth)}

      {/* the Earth: a large arc filling the bottom of its zone, with rounded corners to match it */}
      <Path
        d={`M${Z_X + 1},${EARTH_EDGE} Q${Z_X + Z_W / 2},${EARTH_CTRL} ${Z_X + Z_W - 1},${EARTH_EDGE} L${Z_X + Z_W - 1},${ZONE.earth.y + ZONE.earth.h - 10} A9,9 0 0 1 ${Z_X + Z_W - 10},${ZONE.earth.y + ZONE.earth.h - 1} L${Z_X + 10},${ZONE.earth.y + ZONE.earth.h - 1} A9,9 0 0 1 ${Z_X + 1},${ZONE.earth.y + ZONE.earth.h - 10} Z`}
        fill={p.drawFill}
      />
      <Path d={`M${Z_X + 1},${EARTH_EDGE} Q${Z_X + Z_W / 2},${EARTH_CTRL} ${Z_X + Z_W - 1},${EARTH_EDGE}`} fill="none" stroke={p.draw} strokeWidth={2} />

      {/* the scales, floating in their zone */}
      <Group transform={scalesDy ? `translate(0 ${scalesDy})` : undefined}>
        <Scales x={PX} y={SCALES_BASE} reading="- - -" width={112} />
      </Group>

      {/* you, with a short line along the soles: where the scales touched you */}
      <Group transform={personDy ? `translate(0 ${personDy})` : undefined}>
        <Person x={PX} y={SOLES} scale={PERSON_S} />
        <Line x1={PX - 16} y1={SOLES + 0.8} x2={LINE_X + 4} y2={SOLES + 0.8} stroke={p.lineStrong} strokeWidth={1.4} strokeDasharray="3 3" opacity={apart} />
      </Group>

      {ORDER.map(arrow)}

      {found && <PairBracket color={p.ok} text={p.okText} />}
    </Group>
  );
}

/** Joins N and P once the pair is found: one bracket and two short lines of text. */
function PairBracket({ color, text }: { color: string; text: string }) {
  const t = useOnceTime(0.6);
  const k = phaseOf(t, 0, 0.5);
  const x = LINE_X + 34;
  const y1 = F.N.y - L / 2;
  const y2 = F.P.y + L / 2;
  const mid = (y1 + y2) / 2;
  const h = ((y2 - y1) / 2) * k;
  return (
    <Group opacity={k}>
      <Path d={`M${x - 8},${mid - h} L${x},${mid - h} L${x},${mid + h} L${x - 8},${mid + h}`} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {/* the words sit above the bracket, in the empty corner of your zone */}
      <MonoLabel x={x - 6} y={y1 - 32} text="THIRD-LAW PAIR" color={text} size={9} anchor="start" />
      <MonoLabel x={x - 6} y={y1 - 19} text="same size," color={text} size={9} anchor="start" />
      <MonoLabel x={x - 6} y={y1 - 6} text="opposite direction" color={text} size={9} anchor="start" />
    </Group>
  );
}
