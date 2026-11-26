// FIG: stress–strain graphs of a ductile wire (src/physics/materials), WPH11 points 29–30.
// view 'loop': the copper wire at a real scale (strain in 10⁻³, stress in MPa): the loading curve to the strain reached,
// and the load taken off along a line PARALLEL to the straight part (slope E), with brackets under the axis for the
// part that springs back and the permanent strain left, and their values written in.
// view 'sketch': the whole curve of a ductile metal, not to scale, with the points P E Y U B: a legend names them,
// or, as tap targets, they stay unnamed. view 'compare': three sketched curves A B C, tap targets.
import { Circle, G as Group, Path } from 'react-native-svg';
import { fixed, sci } from '@/physics/format';
import { COPPER, loadingStress, permanentStrain } from '@/physics/materials';
import type { MaterialFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, useLoopTime, type DrawClock } from './anim';
import { useReducedMotionPref } from '@/ui/parts';
import { MonoLabel, useLineStep } from './draw';
import type { TapProps, TapTarget } from './Sheet';
import { stage, TapBoxes } from './kit';

export const MATERIAL_VB = { w: 340, h: 230 };

const PEN = { axes: [0, 0.3], curves: [0.25, 0.8], labels: [0.7, 0.98] } as const;

export function materialParams(fig: MaterialFig): string {
  if (fig.view === 'loop') return `copper wire · E = ${sci(fig.E)} Pa`;
  if (fig.view === 'sketch') return 'a sketch, not to scale';
  return 'sketches, not to scale';
}

type Props = { fig: MaterialFig; live?: number; tap?: TapProps; playing?: boolean; clock?: DrawClock };

/** Whether the figure plays (the sheet shows its pause button): the loop, once the load comes off. */
export const materialPlays = (fig: MaterialFig, live?: number): boolean => fig.view === 'loop' && fig.play === true && fig.unload === true && live === undefined;

export function MaterialFigure({ fig, live, tap, playing = false, clock = STILL }: Props) {
  if (fig.view === 'loop') return <Loop fig={fig} live={live} playing={playing} clock={clock} />;
  return <Sketch fig={fig} tap={tap} clock={clock} />;
}


// ── view: 'loop' ──

const LB = { x1: 56, x2: 318, y1: 22, y2: 166, eMax: 6, sMax: 300 };
const lx = (e: number) => LB.x1 + (e / LB.eMax) * (LB.x2 - LB.x1); // e in 10⁻³
const ly = (mpa: number) => LB.y2 - (mpa / LB.sMax) * (LB.y2 - LB.y1);

/** Played: the load goes on (up the curve), then comes off (down the unloading line); the trail stays. */
const LOAD_S = 1.8;
const UNLOAD_S = 1.0;
const HOLD_S = 1.6;
const START_S = 0.4;

/** The first `share` (0…1) of a polyline, by length: the points up to there, and the last one is where the pen is. */
function partOf(pts: [number, number][], share: number): [number, number][] {
  const lens = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  let left = lens.reduce((a, b) => a + b, 0) * Math.max(0, Math.min(1, share));
  const out: [number, number][] = [pts[0]];
  for (let i = 0; i < lens.length; i++) {
    if (left >= lens[i]) {
      out.push(pts[i + 1]);
      left -= lens[i];
    } else {
      const k = lens[i] > 0 ? left / lens[i] : 0;
      out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]);
      break;
    }
  }
  return out;
}
const pathOf = (pts: [number, number][]) => 'M' + pts.map((q) => `${q[0]},${q[1]}`).join(' L');

function Loop({ fig, live, playing, clock }: { fig: MaterialFig; live?: number; playing: boolean; clock: DrawClock }) {
  const { palette: p, soft } = useTheme();
  const reduced = useReducedMotionPref();
  const plays = materialPlays(fig, live);
  const t = useLoopTime(plays && playing && !reduced, START_S + LOAD_S + UNLOAD_S + HOLD_S, fig, 0);
  const loadShare = !plays || reduced ? 1 : Math.min(1, Math.max(0, (t - START_S) / LOAD_S));
  const unloadShare = !plays || reduced ? 1 : Math.min(1, Math.max(0, (t - START_S - LOAD_S) / UNLOAD_S));
  const reach = live ?? fig.reach ?? 5; // 10⁻³
  const unloading = live !== undefined || fig.unload === true;
  const yieldE = COPPER.yieldStrain * 1e3;
  const sigmaAt = (e: number) => loadingStress(e * 1e-3, fig.E) / 1e6; // MPa
  const sReach = sigmaAt(reach);
  const perm = permanentStrain(reach * 1e-3, fig.E) * 1e3; // 10⁻³
  const back = reach - perm;
  const grid: string[] = [];
  for (let s = 100; s <= LB.sMax; s += 100) grid.push(`M${LB.x1},${ly(s)} H${LB.x2}`);
  for (let e = 1; e <= LB.eMax; e++) grid.push(`M${lx(e)},${LB.y1} V${LB.y2}`);
  // the loading curve: straight to the yield, then on to the strain reached
  const bend = Math.min(reach, yieldE);
  const loadPts: [number, number][] = [[lx(0), ly(0)], [lx(bend), ly(sigmaAt(bend))], ...(reach > yieldE ? [[lx(reach), ly(sReach)] as [number, number]] : [])];
  const loaded = partOf(loadPts, loadShare);
  const load = pathOf(loaded);
  const unloaded = partOf([[lx(reach), ly(sReach)], [lx(perm), ly(0)]], unloadShare);
  const pen = unloadShare > 0 ? unloaded[unloaded.length - 1] : loaded[loaded.length - 1]; // where the wire's state is now
  const done = unloadShare >= 1;
  const bracket = (e1: number, e2: number) => `M${lx(e1)},${LB.y2 + 28} V${LB.y2 + 33} H${lx(e2)} V${LB.y2 + 28}`;
  return (
    <Group>
      {stage(
        clock,
        PEN.axes,
        <Group>
          <Path d={grid.join(' ')} stroke={p.paperLine} strokeWidth={stroke.hair} />
          <Path d={`M${LB.x1},${LB.y1 - 6} V${LB.y2} H${LB.x2 + 4}`} stroke={p.draw} strokeWidth={stroke.thin} fill="none" />
          {[0, 100, 200, 300].map((s) => (
            <MonoLabel key={s} x={LB.x1 - 5} y={ly(s) + 3} text={`${s}`} color={p.label} size={7.5} anchor="end" />
          ))}
          {[0, 1, 2, 3, 4, 5, 6].map((e) => (
            <MonoLabel key={e} x={lx(e)} y={LB.y2 + 12} text={`${e}`} color={p.label} size={7.5} />
          ))}
          <MonoLabel x={LB.x1 - 4} y={LB.y1 - 9} text="σ / MPa" color={p.label} size={7.5} anchor="start" />
          <MonoLabel x={LB.x2} y={LB.y2 + 29} text="ε / 10⁻³" color={p.label} size={7.5} anchor="end" />
        </Group>,
      )}
      {stage(
        clock,
        PEN.curves,
        <Group>
          <Path d={load} stroke={soft.A.edge} strokeWidth={stroke.force} fill="none" strokeLinejoin="round" />
          {unloading && perm > 0.001 && (
            <Group>
              {unloadShare > 0 && <Path d={pathOf(unloaded)} stroke={soft.A.edge} strokeWidth={stroke.force} strokeDasharray="5 4" fill="none" />}
              {done && <Circle cx={lx(perm)} cy={ly(0)} r={3} fill={p.ink} />}
              {done && <Path d={bracket(0, perm) + ' ' + bracket(perm, reach)} stroke={p.label} strokeWidth={stroke.thin} fill="none" />}
            </Group>
          )}
          {(!plays || loadShare >= 1) && <Circle cx={lx(reach)} cy={ly(sReach)} r={4} fill={p.paper} stroke={p.ink} strokeWidth={stroke.body} />}
          {plays && !done && <Circle cx={pen[0]} cy={pen[1]} r={4.5} fill={p.ink} />}
        </Group>,
      )}
      {stage(
        clock,
        PEN.labels,
        <Group>
          {unloading && done && (
            <Group>
              <MonoLabel x={LB.x2} y={LB.y1 + 8} text={perm > 0.001 ? `permanent ${fixed(perm, 1)} × 10⁻³` : 'permanent 0'} color={p.ink} size={8.5} anchor="end" />
              <MonoLabel x={LB.x2} y={LB.y1 + 22} text={perm > 0.001 ? `springs back ${fixed(back, 1)} × 10⁻³` : 'springs back fully'} color={p.label} size={8.5} anchor="end" />
            </Group>
          )}
        </Group>,
      )}
    </Group>
  );
}

// ── views: 'sketch' and 'compare' ──

const SB = { x1: 36, y1: 24, y2: 190 };
type Pt = { x: number; y: number }; // 0…1 across and up the box

/** The ductile curve and where the lettered points sit on it. */
const DUCTILE = { P: { x: 0.2, y: 0.46 }, E: { x: 0.26, y: 0.52 }, Y: { x: 0.31, y: 0.56 }, D: { x: 0.36, y: 0.52 }, F: { x: 0.46, y: 0.53 }, U: { x: 0.78, y: 0.84 }, B: { x: 0.93, y: 0.68 } };
/** Where each letter's badge sits, in viewBox units from its point. */
const BADGE: Record<string, [number, number]> = { P: [10, 14], E: [-12, -11], Y: [2, -15], U: [0, -15], B: [13, 3] };

const COMPARE = {
  A: { path: [[0, 0], [0.18, 0.55], [0.3, 0.62], [0.62, 0.88], [0.72, 0.78]], badge: [12, -6] },
  B: { path: [[0, 0], [0.3, 0.8]], badge: [-12, -6] },
  C: { path: [[0, 0], [0.08, 0.14], [0.5, 0.3], [0.95, 0.4], [0.98, 0.34]], badge: [-2, -14] },
} as const;

function geometry(fig: MaterialFig) {
  const x2 = fig.view === 'sketch' && !fig.targets ? 186 : 318; // the sketch leaves room on the right for its legend
  const X = (u: number) => SB.x1 + u * (x2 - SB.x1);
  const Y = (v: number) => SB.y2 - v * (SB.y2 - SB.y1);
  return { x2, X, Y };
}

/** The letter badges' centres, by id. */
function badges(fig: MaterialFig): Record<string, Pt> {
  const { X, Y } = geometry(fig);
  const out: Record<string, Pt> = {};
  if (fig.view === 'sketch') {
    for (const id of ['P', 'E', 'Y', 'U', 'B'] as const) {
      const pt = DUCTILE[id];
      out[id] = { x: X(pt.x) + BADGE[id][0], y: Y(pt.y) + BADGE[id][1] };
    }
  } else if (fig.view === 'compare') {
    for (const id of ['A', 'B', 'C'] as const) {
      const c = COMPARE[id];
      const end = c.path[c.path.length - 1];
      out[id] = { x: X(end[0]) + c.badge[0], y: Y(end[1]) + c.badge[1] };
    }
  }
  return out;
}

export function materialTargets(fig: MaterialFig): TapTarget[] {
  if (fig.view === 'loop' || (fig.view === 'sketch' && !fig.targets)) return [];
  const names: Record<string, string> = { P: 'point P', E: 'point E', Y: 'point Y', U: 'point U', B: 'point B', A: 'curve A', C: 'curve C' };
  return Object.entries(badges(fig)).map(([id, c]) => ({ id, x: c.x - 20, y: c.y - 20, w: 40, h: 40, label: fig.view === 'compare' ? `curve ${id}` : (names[id] ?? id) }));
}

const LEGEND: [string, string, string?][] = [
  ['P', 'limit of', 'proportionality'],
  ['E', 'elastic limit'],
  ['Y', 'yield point'],
  ['U', 'ultimate', 'tensile stress'],
  ['B', 'breaking point'],
];

function Sketch({ fig, tap, clock }: { fig: MaterialFig; tap?: TapProps; clock: DrawClock }) {
  const { palette: p, soft } = useTheme();
  const step = useLineStep(7.5); // the legend's two-line names
  const { x2, X, Y } = geometry(fig);
  const c = badges(fig);
  const d = DUCTILE;
  const pt = (q: Pt) => `${X(q.x)},${Y(q.y)}`;
  const ductile =
    `M${X(0)},${Y(0)} L${pt(d.P)} Q${X(0.235)},${Y(0.5)} ${pt(d.E)} Q${X(0.29)},${Y(0.545)} ${pt(d.Y)} Q${X(0.335)},${Y(0.52)} ${pt(d.D)} ` +
    `L${pt(d.F)} C${X(0.58)},${Y(0.55)} ${X(0.62)},${Y(0.84)} ${pt(d.U)} Q${X(0.88)},${Y(0.84)} ${pt(d.B)}`;
  const poly = (pts: readonly (readonly [number, number])[]) => 'M' + pts.map(([u, v]) => `${X(u)},${Y(v)}`).join(' L');
  const cross = (u: number, v: number) => `M${X(u) - 4},${Y(v) - 4} l8,8 m0,-8 l-8,8`;
  return (
    <Group>
      {stage(
        clock,
        PEN.axes,
        <Group>
          <Path d={`M${SB.x1},${SB.y1 - 8} V${SB.y2} H${x2 + 4}`} stroke={p.draw} strokeWidth={stroke.thin} fill="none" />
          <MonoLabel x={SB.x1 + 6} y={SB.y1 - 8} text="stress" color={p.label} size={8} anchor="start" />
          <MonoLabel x={x2} y={SB.y2 + 14} text="strain" color={p.label} size={8} anchor="end" />
        </Group>,
      )}
      {tap && <TapBoxes targets={materialTargets(fig)} tap={tap} />}
      {stage(
        clock,
        PEN.curves,
        fig.view === 'sketch' ? (
          <Group>
            <Path d={ductile} stroke={soft.A.edge} strokeWidth={stroke.force} fill="none" strokeLinejoin="round" />
            {(['P', 'E', 'Y', 'U'] as const).map((id) => (
              <Circle key={id} cx={X(d[id].x)} cy={Y(d[id].y)} r={2.6} fill={p.ink} />
            ))}
            <Path d={cross(d.B.x, d.B.y)} stroke={p.ink} strokeWidth={stroke.body} />
          </Group>
        ) : (
          <Group>
            {(['A', 'B', 'C'] as const).map((id) => {
              const cv = COMPARE[id];
              const end = cv.path[cv.path.length - 1];
              return (
                <Group key={id}>
                  <Path d={poly(cv.path)} stroke={soft.A.edge} strokeWidth={stroke.force} fill="none" strokeLinejoin="round" />
                  <Path d={cross(end[0], end[1])} stroke={p.ink} strokeWidth={stroke.body} />
                </Group>
              );
            })}
          </Group>
        ),
      )}
      {stage(
        clock,
        PEN.labels,
        <Group>
          {Object.entries(c).map(([id, q]) => (
            <Group key={id}>
              <Circle cx={q.x} cy={q.y} r={8} fill={p.paper} stroke={p.ink} strokeWidth={stroke.thin} />
              <MonoLabel x={q.x} y={q.y + 3.3} text={id} color={p.ink} size={9.5} />
            </Group>
          ))}
          {fig.view === 'sketch' && !fig.targets && (
            <Group>
              {LEGEND.map(([id, a, b], i) => (
                <Group key={id}>
                  <Circle cx={214} cy={46 + i * 34} r={7} fill={p.paper} stroke={p.ink} strokeWidth={stroke.thin} />
                  <MonoLabel x={214} y={49 + i * 34} text={id} color={p.ink} size={8.5} />
                  <MonoLabel x={226} y={(b ? 49 - step / 2 : 49) + i * 34} text={a} color={p.label} size={7.5} anchor="start" />
                  {b && <MonoLabel x={226} y={49 + step / 2 + i * 34} text={b} color={p.label} size={7.5} anchor="start" />}
                </Group>
              ))}
            </Group>
          )}
        </Group>,
      )}
    </Group>
  );
}
