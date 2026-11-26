// FIG: falling through air. The body stays in place on the sheet while the air streams up past it at a speed ∝ v; its
// weight W and the drag D are drawn to one scale from the centre of gravity, so you see D grow until it matches W.
// Paper cake cases fall from rest by the exact solution (fallFromRest); a skydive (parachute opening over a few seconds)
// is integrated step by step (skydiveSamples). Both come from src/physics/drag, so the drawing never disagrees with the
// numbers. With `graph`, the v–t graph of the fall is drawn on the right up to the current time, with its terminal
// velocities dashed.
import { useMemo, type ReactNode } from 'react';
import { Circle, G as Group, Line, Path } from 'react-native-svg';
import { dragConstantFor, fallFromRest, skydiveSamples, terminalVelocity, type Skydive } from '@/physics/drag';
import { fixed } from '@/physics/format';
import type { FallFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, useLoopTime, type DrawClock } from './anim';
import { ForceArrow, ForceLetter, MonoLabel } from './draw';
import { stage, Tag } from './kit';

export const AIR_FALL_VB = { w: 340, h: 230 };

const PEN = { air: [0, 0.3], body: [0.2, 0.6], graph: [0.4, 0.8], labels: [0.75, 0.95] } as const;
const STEP = 0.05; // s between the samples of a skydive
const SKY_SPEEDUP = 5; // a played skydive runs this many times faster than real time
const GRAPH = { x0: 172, y0: 196, w: 154, h: 156 }; // the v–t graph: origin and size
const LW_CASE = 60; // viewBox units for the weight of one cake case (forces are drawn only with one lane)
const LW_SKY = 40; // … for the skydiver's weight
const LW_CHUTE = 22; // … when a parachute will open (its drag reaches 5 W, which must fit on the sheet)
const DASH = { len: 9, gap: 26 }; // the air streaks
const AIR_PX = { cases: 60, skydiver: 0.6 }; // viewBox units of streak per metre fallen

/** One sample of the fall at time t: speed, distance fallen and drag ÷ weight, for each lane (cases) or the skydiver. */
type State = { v: number; s: number; dOverW: number };

/** The skydive of the figure (a chute that never opens if there is none). */
function skydiveOf(fig: FallFig): Skydive {
  const chute = 'skydiver' in fig.body ? fig.body.skydiver.chute : undefined;
  return chute ? { vt1: fig.vt, vt2: chute.vt, open: chute.open, inflate: chute.inflate } : { vt1: fig.vt, vt2: fig.vt, open: 1e9, inflate: 1 };
}

/** The terminal velocity of each lane of cake cases: the same shape (same k), n times the weight of one case. */
export function laneTerminal(fig: FallFig, n: number): number {
  const k = dragConstantFor(1, fig.vt); // per kilogram of one case: only the ratio matters
  return terminalVelocity(n, k);
}

function caseState(t: number, vt: number): State {
  const r = fallFromRest(t, vt);
  return { v: r.v, s: r.s, dOverW: (r.v * r.v) / (vt * vt) };
}

function sample(table: { t: number; v: number; s: number; dOverW: number }[], t: number): State {
  const i = Math.max(0, Math.min(table.length - 2, Math.floor(t / STEP)));
  const a = table[i];
  const b = table[i + 1] ?? a;
  const f = Math.max(0, Math.min(1, (t - a.t) / STEP));
  return { v: a.v + (b.v - a.v) * f, s: a.s + (b.s - a.s) * f, dOverW: a.dOverW + (b.dOverW - a.dOverW) * f };
}

const stillTime = (fig: FallFig) => (fig.at === 'end' ? fig.tEnd : (fig.at ?? 0));

/** The given values in the sheet header; on the explore screen (t from the slider) the speed and acceleration. */
export function fallParams(fig: FallFig, t?: number): string {
  if ('skydiver' in fig.body) {
    if (t !== undefined) {
      const table = skydiveSamples(skydiveOf(fig), fig.tEnd, STEP);
      const st = sample(table, t);
      const a = 9.81 * (1 - st.dOverW);
      return `v ${fixed(st.v, 1)} m s⁻¹ · a ${fixed(a, 2)} m s⁻²`;
    }
    return `skydiver ${fig.body.skydiver.m} kg, W = ${fixed(fig.body.skydiver.m * 9.81, 0)} N`;
  }
  return fig.body.cases.length > 1 ? 'paper cake cases, same shape' : 'paper cake case, still air';
}

export const fallPlays = (fig: FallFig): boolean => fig.play === true;

type Props = { fig: FallFig; live?: number; playing: boolean; clock?: DrawClock };

export function FallFigure({ fig, live, playing, clock = STILL }: Props) {
  const { palette: p, soft } = useTheme();
  const sky = 'skydiver' in fig.body;
  const sd = skydiveOf(fig);
  const table = useMemo(() => (sky ? skydiveSamples(skydiveOf(fig), fig.tEnd, STEP) : []), [sky, fig]);
  const speedup = sky ? SKY_SPEEDUP : 1;
  const loop = useLoopTime(playing && fig.play === true && live === undefined, fig.tEnd / speedup, `${fig.tEnd}`, 1.0);
  const t = live ?? (fig.play === true ? loop * speedup : stillTime(fig));

  // the lanes: where each body is drawn, and its state now
  const lanes: { x: number; n: number; vt: number; st: State }[] = sky
    ? [{ x: fig.graph ? 74 : 170, n: 1, vt: fig.vt, st: sample(table, t) }]
    : ('cases' in fig.body ? fig.body.cases : [1]).map((n, i, all) => {
        const vt = laneTerminal(fig, n);
        const x = fig.graph ? 74 : all.length === 1 ? 170 : i === 0 ? 112 : 228;
        return { x, n, vt, st: caseState(t, vt) };
      });
  const bodyY = sky ? 140 : 124;
  const chuteF = sky && sd.open < 1e8 ? Math.max(0, Math.min(1, (t - sd.open) / sd.inflate)) : 0;

  return (
    <Group>
      {/* the air streaming up past each body */}
      {stage(clock, 
        PEN.air,
        <Group>
          {lanes.map((ln) => {
            const off = (ln.st.s * (sky ? AIR_PX.skydiver : AIR_PX.cases)) % DASH.gap;
            const d: string[] = [];
            for (const dx of sky ? [-44, -30, 30, 44] : lanes.length > 1 ? [-46, 46] : [-52, -38, 38, 52]) {
              const x = ln.x + dx;
              for (let y = 20 - DASH.gap + (DASH.gap - off); y < 214; y += DASH.gap) {
                const y1 = Math.max(18, y);
                const y2 = Math.min(214, y + DASH.len);
                if (y2 > y1) d.push(`M${x},${y2} V${y1}`);
              }
            }
            return <Path key={ln.x} d={d.join(' ')} stroke={soft.metal.edge} strokeOpacity={0.4} strokeWidth={stroke.body} strokeLinecap="round" />;
          })}
        </Group>,
      )}

      {stage(clock, 
        PEN.body,
        <Group>
          {lanes.map((ln) => (sky ? <Skydiver key={ln.x} x={ln.x} y={bodyY} chute={chuteF} /> : <CakeCases key={ln.x} x={ln.x} y={bodyY} n={ln.n} />))}
        </Group>,
      )}

      {fig.graph && stage(clock, PEN.graph, <VtGraph fig={fig} table={table} t={t} />)}

      {stage(clock, 
        PEN.labels,
        <Group>
          {lanes.map((ln, i) => {
            const lw = (sky ? (sd.open < 1e8 ? LW_CHUTE : LW_SKY) : LW_CASE) * ln.n;
            const asked = fig.askD !== undefined;
            const dLen = asked ? 22 : lw * ln.st.dOverW;
            const last = i === lanes.length - 1;
            const speedText = fig.speeds === 'shown' || (fig.speeds !== undefined && !last) ? `${fixed(ln.st.v, 2)} m s⁻¹` : fig.speeds ? 'v = ?' : null;
            return (
              <Group key={ln.x}>
                {fig.forces && lanes.length === 1 && (
                  <Group>
                    <ForceArrow x1={ln.x} y1={bodyY} x2={ln.x} y2={bodyY + lw} color={p.force} width={3} />
                    <ForceLetter x={ln.x + 10} y={bodyY + lw - 1} text="W" color={p.force} size={13} anchor="start" />
                    {dLen > 1 && <ForceArrow x1={ln.x} y1={bodyY} x2={ln.x} y2={bodyY - dLen} color={p.force} width={3} dashed={asked} />}
                    {(dLen > 6 || asked) && <ForceLetter x={ln.x + 8} y={sky && chuteF > 0 ? bodyY - dLen - 4 : Math.min(bodyY - dLen + 11, sky ? bodyY - 26 : bodyY)} text={asked ? 'D ?' : 'D'} color={p.force} size={13} anchor="start" />}
                    <Circle cx={ln.x} cy={bodyY} r={2.8} fill={p.force} />
                  </Group>
                )}
                {speedText && <Tag x={ln.x} y={30} text={speedText} />}
                {!sky && lanes.length > 1 && <MonoLabel x={ln.x} y={222} text={ln.n === 1 ? '1 case' : `${ln.n} cases`} color={p.label} size={9} />}
              </Group>
            );
          })}
          {sky && fig.play === true && live === undefined && <MonoLabel x={12} y={222} text={`× ${SKY_SPEEDUP} speed`} color={p.label} size={8} anchor="start" />}
        </Group>,
      )}
    </Group>
  );
}

/** The v–t graph of the skydive (down positive) from 0 to t, with each terminal velocity dashed and a dot at t. */
function VtGraph({ fig, table, t }: { fig: FallFig; table: { t: number; v: number }[]; t: number }) {
  const { palette: p, soft } = useTheme();
  const sd = skydiveOf(fig);
  const vMax = Math.ceil((fig.vt * 1.1) / 10) * 10;
  const X = (tt: number) => GRAPH.x0 + (tt / fig.tEnd) * GRAPH.w;
  const Y = (v: number) => GRAPH.y0 - (v / vMax) * GRAPH.h;
  const pts = table.filter((r) => r.t <= t + 1e-9).map((r) => `${X(r.t).toFixed(1)},${Y(r.v).toFixed(1)}`);
  const now = table.length ? sample(table as { t: number; v: number; s: number; dOverW: number }[], t) : { v: 0 };
  const tTicks: number[] = [];
  for (let k = 10; k <= fig.tEnd + 1e-9; k += 10) tTicks.push(k);
  const vTicks: number[] = [];
  for (let k = 10; k <= vMax + 1e-9; k += 10) vTicks.push(k);
  const terminals = [fig.vt, ...(sd.open < 1e8 ? [sd.vt2] : [])];
  return (
    <Group>
      <Path d={`M${GRAPH.x0},${GRAPH.y0 - GRAPH.h - 6} V${GRAPH.y0} H${GRAPH.x0 + GRAPH.w + 6}`} fill="none" stroke={p.draw} strokeWidth={stroke.body} />
      {tTicks.map((k) => (
        <Group key={`t${k}`}>
          <Line x1={X(k)} y1={GRAPH.y0} x2={X(k)} y2={GRAPH.y0 + 4} stroke={p.draw} strokeWidth={stroke.thin} />
          <MonoLabel x={X(k)} y={GRAPH.y0 + 14} text={`${k}`} color={p.label} size={8} />
        </Group>
      ))}
      {vTicks.map((k) => (
        <Group key={`v${k}`}>
          <Line x1={GRAPH.x0 - 4} y1={Y(k)} x2={GRAPH.x0} y2={Y(k)} stroke={p.draw} strokeWidth={stroke.thin} />
          <MonoLabel x={GRAPH.x0 - 6} y={Y(k) + 3} text={`${k}`} color={p.label} size={8} anchor="end" />
        </Group>
      ))}
      {terminals.map((vt) => (
        <Line key={vt} x1={GRAPH.x0} y1={Y(vt)} x2={GRAPH.x0 + GRAPH.w} y2={Y(vt)} stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="4 4" />
      ))}
      <MonoLabel x={GRAPH.x0 + 4} y={GRAPH.y0 - GRAPH.h - 2} text="v / m s⁻¹" color={p.label} size={8} anchor="start" />
      <MonoLabel x={GRAPH.x0 + GRAPH.w} y={GRAPH.y0 + 30} text="t / s" color={p.label} size={8} anchor="end" />
      {pts.length > 1 && <Path d={`M${pts.join(' L')}`} fill="none" stroke={soft.A.edge} strokeWidth={stroke.force} strokeLinejoin="round" />}
      <Circle cx={X(Math.min(t, fig.tEnd))} cy={Y(now.v)} r={4} fill={soft.A.edge} />
    </Group>
  );
}

/** Paper cake cases, base down: a fluted cup; a stack shows its rims nested one above another. */
function CakeCases({ x, y, n }: { x: number; y: number; n: number }) {
  const { soft } = useTheme();
  const top = 52; // drawn large: the case is the subject of its figure (the arrows keep their own scale)
  const base = 34;
  const h = 21;
  const rims: ReactNode[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const dy = -i * 3.5;
    const y0 = y - h / 2 + dy;
    const d = `M${x - top / 2},${y0} L${x - base / 2},${y0 + h} H${x + base / 2} L${x + top / 2},${y0} Z`;
    rims.push(<Path key={`c${i}`} d={d} fill={soft.A.fill} stroke={soft.A.edge} strokeWidth={1.8} strokeLinejoin="round" />);
  }
  const flutes: string[] = [];
  for (let k = -3; k <= 3; k++) flutes.push(`M${x + k * 7.2},${y - h / 2 + 1} L${x + k * 4.7},${y + h / 2 - 1}`);
  return (
    <Group>
      {rims}
      <Path d={flutes.join(' ')} stroke={soft.A.edge} strokeWidth={stroke.hair} opacity={0.55} />
    </Group>
  );
}

/**
 * A skydiver seen from the side, as a pictogram: belly down in free fall; under the parachute (chute > 0, how far it has
 * opened) upright below the canopy, which grows as it opens. The centre of gravity is at (x, y).
 */
function Skydiver({ x, y, chute }: { x: number; y: number; chute: number }) {
  const { palette: p, soft } = useTheme();
  const tone = soft.A;
  // every part is one rounded stroke in the body's tone over a slightly wider stroke of its edge
  const part = (d: string, width: number) => (
    <Group>
      <Path d={d} fill="none" stroke={tone.edge} strokeWidth={width + 3} strokeLinecap="round" strokeLinejoin="round" />
      <Path d={d} fill="none" stroke={tone.fill} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </Group>
  );
  const head = (cx: number, cy: number) => <Circle cx={cx} cy={cy} r={6.5} fill={tone.fill} stroke={tone.edge} strokeWidth={1.6} />;
  if (chute <= 0) {
    // drawn 1.4 times larger in free fall, about her centre of gravity
    return (
      <Group transform={`translate(${x} ${y}) scale(1.4) translate(${-x} ${-y})`}>
        {part(`M${x + 8},${y - 2} L${x + 18},${y - 13} L${x + 26},${y - 12}`, 3.4)}
        {part(`M${x - 14},${y - 2} L${x - 26},${y - 11} L${x - 34},${y - 6}`, 4)}
        {part(`M${x - 14},${y} H${x + 10}`, 8)}
        {head(x + 22, y - 1)}
      </Group>
    );
  }
  const w = 28 + 34 * chute; // half-width of the canopy (it must stay on the sheet, clear of the graph)
  const cy = y - 62;
  return (
    <Group>
      <Path d={`M${x - w},${cy} Q${x},${cy - 26 - 10 * chute} ${x + w},${cy} Q${x},${cy - 8} ${x - w},${cy} Z`} fill={soft.B.fill} stroke={soft.B.edge} strokeWidth={2} strokeLinejoin="round" />
      <Path d={`M${x - w},${cy} L${x - 4},${y - 14} M${x + w},${cy} L${x + 4},${y - 14} M${x - w * 0.45},${cy - 6} L${x - 3},${y - 14} M${x + w * 0.45},${cy - 6} L${x + 3},${y - 14}`} stroke={p.draw} strokeWidth={stroke.hair} opacity={0.7} />
      {part(`M${x - 2},${y + 8} L${x - 5},${y + 24}`, 3.4)}
      {part(`M${x + 2},${y + 8} L${x + 5},${y + 24}`, 3.4)}
      {part(`M${x},${y - 7} V${y + 6}`, 8)}
      {head(x, y - 19)}
    </Group>
  );
}
