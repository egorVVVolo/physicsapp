// FIG: a plank on one pivot (it can tip) or on two trestles, with people and boxes standing on it.
// Every force is drawn where it acts: a person's or a box's weight from its centre of gravity, a uniform plank's weight
// from its middle (with the centre-of-gravity mark), a support's push up from where it touches the plank. One scale
// per figure. On a single pivot the totals of the clockwise and anticlockwise moments come from src/physics/moments;
// if they differ the plank tips until its low end rests on the ground, and it lies level once they match.
import { Circle, G as Group, Path, Rect } from 'react-native-svg';
import { momentsAbout, senseTotals, type Load } from '@/physics/moments';
import { fixed } from '@/physics/format';
import { BEAM_IDS, type BeamFig, type BeamLoad } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, useTween, type DrawClock } from './anim';
import { CgMark, ForceArrow, ForceLetter, Hatch, MonoLabel, polyPath } from './draw';
import { Person } from './people';
import type { TapProps, TapTarget } from './Sheet';
import { TurnArc } from './turning';
import { Dim, stage, TapBoxes } from './kit';

export const BEAM_VB = { w: 340, h: 252 };

const PEN = { ground: [0, 0.25], beam: [0.2, 0.45], loads: [0.4, 0.75], forces: [0.72, 0.88], marks: [0.85, 0.98] } as const;
const X0 = 26; // the plank's left end
const X1 = 314; // its right end
const APEX = 166; // the top of the pivot or trestles: the underside of the plank
const THICK = 8;
const MID_Y = APEX - THICK / 2; // the plank's centre line
const TOP_Y = APEX - THICK; // where feet and boxes stand
const PERSON_S = 0.6;
const PERSON_CG_UP = 80 * PERSON_S; // the centre of gravity above the soles
const PERSON_TOP = 136 * PERSON_S;
const BOX = { w: 30, h: 24 };
const MAX_ARROW = 44; // the biggest force in a figure, viewBox units
const STUB = 22; // an unknown force: a dashed stub of this length

/**
 * Where the ground is. A plank whose weight and pushes are drawn under it stands on tall supports; a light plank sits
 * on a low pivot, so it tips only a little before its end rests on the ground (the moments hardly change: cos 5°).
 */
const groundOf = (fig: BeamFig) => APEX + (fig.weight !== undefined || fig.pushes ? 42 : 14);
const BOXT = 40; // tap boxes

const kOf = (fig: BeamFig) => (X1 - X0) / fig.L;

/** The loads as the model sees them (the explore slider moves the one with `slide`), the plank's weight included. */
function loadsOf(fig: BeamFig, live?: number): { loads: BeamLoad[]; all: Load[] } {
  const pivot = fig.supports[0];
  const loads = fig.loads.map((l) => (l.slide && live !== undefined ? { ...l, at: pivot + live } : l));
  const all: Load[] = loads.map((l) => ({ W: l.W, at: l.at }));
  if (fig.weight) all.push({ W: fig.weight, at: fig.L / 2 });
  return { loads, all };
}

/** The pushes of the supports (two trestles), from the moments about each. */
function pushesOf(fig: BeamFig, all: Load[]): number[] {
  if (fig.supports.length === 1) return [all.reduce((s, l) => s + l.W, 0)];
  const [a, b] = fig.supports;
  const atB = -momentsAbout(all, a) / (b - a);
  return [all.reduce((s, l) => s + l.W, 0) - atB, atB];
}

/** The angle the plank rests at (screen anticlockwise +): level when the moments about the pivot match. */
function tiltOf(fig: BeamFig, all: Load[]): number {
  if (fig.supports.length !== 1) return 0;
  const pivot = fig.supports[0];
  const m = momentsAbout(all, pivot);
  if (Math.abs(m) < 1e-6) return 0;
  // anticlockwise: the left end goes down until it rests on the ground
  const reach = (m > 0 ? pivot : fig.L - pivot) * kOf(fig);
  return Math.sign(m) * Math.asin(Math.min(1, (groundOf(fig) - APEX) / reach));
}

export function beamTargets(fig: BeamFig): TapTarget[] {
  if (!fig.candidates) return [];
  const k = kOf(fig);
  const pivot = fig.supports[0];
  const longMid = pivot < fig.L / 2 ? (pivot + fig.L) / 2 : pivot / 2;
  const at: Record<(typeof BEAM_IDS)[number], number> = { pivot, middle: fig.L / 2, long: longMid };
  const names = { pivot: 'at the support', middle: 'at the middle', long: 'at the middle of the longer part' };
  return BEAM_IDS.map((id) => ({ id, x: X0 + at[id] * k - BOXT / 2, y: MID_Y - BOXT / 2, w: BOXT, h: BOXT, label: names[id] }));
}

export function BeamFigure({ fig, live, tap, clock = STILL }: { fig: BeamFig; live?: number; tap?: TapProps; clock?: DrawClock }) {
  const { palette: p, material: m } = useTheme();
  const k = kOf(fig);
  const { loads, all } = loadsOf(fig, live);
  // the asked distance, weight or push: "?" until the figure is told to show it
  const reveal = fig.answer === 'shown';
  const pushes = pushesOf(fig, all);
  const maxW = Math.max(...all.map((l) => l.W), ...(fig.pushes ? pushes : []));
  const KW = MAX_ARROW / maxW;
  const tilt = useTween(tiltOf(fig, all));
  const pivotX = X0 + fig.supports[0] * k;
  const pivot = fig.supports.length === 1;
  const GROUND = groundOf(fig);
  // a dimension between two points of the plank, level, under the ground (a tipped plank tips only ~5°)
  // with room under the ground, a size too long for its short dimension goes under its line, and the second row
  // moves down to leave it space; on the trestles (ground lower) the rows stay close
  const roomy = GROUND + 22 + 29 + 8 <= BEAM_VB.h;
  const dim = (from: number, to: number, text: string | undefined, row = 0, strong = false) => {
    const a = onPlank(Math.min(from, to));
    const b = onPlank(Math.max(from, to));
    const y = GROUND + 22 + row * (roomy ? 29 : 15);
    return <Dim key={`${from}-${to}`} a={[a[0], y]} b={[b[0], y]} text={text} strong={strong} fit={roomy ? 'below' : undefined} within={[0, BEAM_VB.w]} />;
  };

  // a point on the plank's centre line, `along` metres from its left end, with the plank at its tilt
  const c = Math.cos(tilt);
  const s = Math.sin(tilt);
  const onPlank = (along: number, up = 0): [number, number] => {
    if (!pivot) return [X0 + along * k, MID_Y - up];
    const d = (along - fig.supports[0]) * k;
    return [pivotX + d * c - up * s, MID_Y - d * s - up * c];
  };
  const corners = [onPlank(0, THICK / 2), onPlank(fig.L, THICK / 2), onPlank(fig.L, -THICK / 2), onPlank(0, -THICK / 2)];
  const plank = polyPath(corners);
  const totals = pivot ? senseTotals(all, fig.supports[0]) : null;
  const balanced = totals !== null && Math.abs(totals.clockwise - totals.anticlockwise) < 1e-6;
  const showTotals = fig.moments && fig.answer !== 'afterCheck' && totals !== null;

  const people = loads.filter((l) => l.look === 'person').map((l) => l.id);
  return (
    <Group>
      {stage(clock, 
        PEN.ground,
        <Group>
          <Hatch x1={X0 - 10} x2={X1 + 10} y={GROUND} color={p.draw} clock={clock} from={PEN.ground[0]} to={PEN.ground[1]} />
          {fig.supports.map((at) => {
            const x = X0 + at * k;
            return pivot ? (
              <Path key={at} d={polyPath([[x, APEX], [x + 20, GROUND], [x - 20, GROUND]]).d} fill={m.metalSide} stroke={p.draw} strokeWidth={stroke.body} strokeLinejoin="round" />
            ) : (
              <Group key={at}>
                <Path d={`M${x - 14},${GROUND} L${x - 4},${APEX + 4} M${x + 14},${GROUND} L${x + 4},${APEX + 4} M${x - 10},${GROUND - 16} H${x + 10}`} stroke={p.draw} strokeWidth={stroke.body} strokeLinecap="round" />
                <Rect x={x - 12} y={APEX} width={24} height={5} rx={1.5} fill={m.metalSide} stroke={p.draw} strokeWidth={stroke.thin} />
              </Group>
            );
          })}
        </Group>,
      )}

      {stage(clock, 
        PEN.beam,
        <Group>
          <Path d={plank.d} fill={m.wood} stroke={p.draw} strokeWidth={stroke.body} strokeLinejoin="round" />
          {pivot && <Circle cx={pivotX} cy={MID_Y} r={2.4} fill={p.draw} />}
        </Group>,
      )}

      {fig.candidates && <TapBoxes targets={beamTargets(fig)} tap={tap} />}

      {/* the people on the plank in order: the first is hero A, the second hero B */}
      {stage(clock, 
        PEN.loads,
        <Group>
          {loads.map((l) => {
            const [x, y] = onPlank(l.at, THICK / 2);
            return l.look === 'person' ? (
              <Group key={l.id}>
                <Person x={x} y={y} scale={PERSON_S} cg={false} who={people.indexOf(l.id) % 2 === 1 ? 'B' : 'A'} />
                {l.name && <MonoLabel x={x} y={y - PERSON_TOP - 7} text={l.name} color={p.label} size={9} />}
              </Group>
            ) : (
              <Group key={l.id} transform={`rotate(${(-tilt * 180) / Math.PI} ${x} ${y})`}>
                <Rect x={x - BOX.w / 2} y={y - BOX.h} width={BOX.w} height={BOX.h} rx={2} fill={m.woodSide} stroke={p.draw} strokeWidth={stroke.body} />
                <Path d={`M${x - BOX.w / 2},${y - BOX.h / 2} H${x + BOX.w / 2}`} stroke={p.draw} strokeWidth={stroke.thin} opacity={0.5} />
              </Group>
            );
          })}
        </Group>,
      )}

      {stage(clock, 
        PEN.forces,
        <Group>
          {/* the plank's own weight, from its middle */}
          {fig.weight !== undefined && !fig.candidates && (
            <Group>
              {(() => {
                const [x, y] = onPlank(fig.L / 2);
                const len = fig.weight * KW;
                return (
                  <Group>
                    <ForceArrow x1={x} y1={y} x2={x} y2={y + len} color={p.force} />
                    <CgMark x={x} y={y} color={p.draw} />
                    <MonoLabel x={x + 8} y={y + Math.max(len - 2, THICK + 12)} text={`${fixed(fig.weight, 0)} N`} color={p.forceText} size={9} anchor="start" />
                  </Group>
                );
              })()}
            </Group>
          )}
          {fig.candidates &&
            beamTargets(fig).map((t) => {
              const x = t.x + BOXT / 2;
              return (
                <Group key={t.id} opacity={0.85}>
                  <Circle cx={x} cy={MID_Y} r={6} fill={p.page} stroke={p.ink} strokeWidth={stroke.thin} strokeDasharray="2.5 2" />
                </Group>
              );
            })}
          {/* each load's weight, from its centre of gravity */}
          {loads.map((l) => {
            const up = l.look === 'person' ? PERSON_CG_UP : BOX.h / 2;
            const [x, y0] = onPlank(l.at, THICK / 2);
            const y = y0 - up;
            const unknown = l.asked === 'W' && !reveal;
            const len = unknown ? STUB : l.W * KW;
            // labels on the outer side, unless that is off the sheet
            const right = l.at <= fig.supports[0] && x - 18 > 34 ? -1 : 1;
            const lx = x + right * (l.look === 'person' ? 18 : BOX.w / 2 + 5);
            return (
              <Group key={l.id}>
                <ForceArrow x1={x} y1={y} x2={x} y2={y + len} color={p.force} dashed={unknown} />
                <Circle cx={x} cy={y} r={2.6} fill={p.force} />
                <MonoLabel x={lx} y={y + len / 2 + 3} text={unknown ? 'W = ?' : `${fixed(l.W, 0)} N`} color={p.forceText} size={9} anchor={right < 0 ? 'end' : 'start'} />
              </Group>
            );
          })}
          {/* the supports' pushes, up from where they touch the plank */}
          {fig.pushes &&
            fig.supports.map((at, i) => {
              // drawn up from the plank's top face, so the whole arrow shows above it
              const [x, y] = onPlank(at, THICK / 2);
              const asked = fig.pushes?.asked === i;
              const known = fig.pushes?.known.includes(i) || (asked && reveal);
              const unknown = asked && !reveal;
              const len = unknown ? STUB : pushes[i] * KW;
              const inner = at < fig.L / 2 ? 1 : -1;
              return (
                <Group key={at}>
                  <ForceArrow x1={x} y1={y} x2={x} y2={y - len} color={p.force} dashed={unknown} />
                  <ForceLetter x={x + inner * 8} y={y - len + 6} text="R" color={p.force} size={14} anchor={inner > 0 ? 'start' : 'end'} />
                  {(known || unknown) && <MonoLabel x={x + inner * 20} y={y - len + 5} text={unknown ? '= ?' : `${fixed(pushes[i], 0)} N`} color={p.forceText} size={9} anchor={inner > 0 ? 'start' : 'end'} />}
                </Group>
              );
            })}
        </Group>,
      )}

      {stage(clock, 
        PEN.marks,
        <Group>
          {/* distances along the plank: from the pivot on a pivot, from the left end on trestles */}
          {!fig.candidates && loads.map((l) => {
            const from = pivot ? fig.supports[0] : 0;
            const d = Math.abs(l.at - from);
            const text = l.asked === 'at' && !reveal ? 'x = ?' : `${fixed(d, 2)} m`;
            // a farther load on the same side gets its dimension a row lower
            const row = loads.filter((o) => o !== l && Math.sign(o.at - from) === Math.sign(l.at - from) && Math.abs(o.at - from) < d).length;
            return dim(from, l.at, d > 0.01 ? text : undefined, row, l.asked === 'at' && reveal);
          })}
          {!pivot && dim(0, fig.L, `${fixed(fig.L, 1)} m`, 1)}
          {pivot && fig.weight !== undefined && Math.abs(fig.L / 2 - fig.supports[0]) > 0.01 && !fig.candidates && (
            dim(fig.L / 2, fig.supports[0], `${fixed(Math.abs(fig.L / 2 - fig.supports[0]), 2)} m`)
          )}
          {pivot && fig.candidates && (
            <Group>
              {dim(0, fig.supports[0], `${fixed(fig.supports[0], 1)} m`)}
              {dim(fig.supports[0], fig.L, `${fixed(fig.L - fig.supports[0], 1)} m`)}
            </Group>
          )}
          {showTotals && totals && (
            <Group>
              <TurnArc cx={X0 + 9} cy={18} r={8} from={-30} sweep={-240} color={p.ink} width={1.6} />
              <MonoLabel x={X0 + 24} y={22} text={`anticlockwise ${fixed(totals.anticlockwise, 0)} N m`} color={p.ink} size={9} anchor="start" />
              {/* clockwise on a second row: with readable labels the two totals no longer fit side by side */}
              <TurnArc cx={X1 - 9} cy={36} r={8} from={-150} sweep={240} color={p.ink} width={1.6} />
              <MonoLabel x={X1 - 24} y={40} text={`clockwise ${fixed(totals.clockwise, 0)} N m`} color={p.ink} size={9} anchor="end" />
              {balanced && <MonoLabel x={(X0 + X1) / 2} y={58} text="BALANCED" color={p.ink} size={9} />}
            </Group>
          )}
        </Group>,
      )}
    </Group>
  );
}
