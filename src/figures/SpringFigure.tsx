// FIG: a spring hanging from a clamp stand beside a cm ruler (src/physics/springs), Hooke's law.
// One spring, or two side by side: the whole spring and one half cut from the same spring. A weight hangs on each,
// or waits on the bench under it; once it is hung, the spring stretches and the weight bobs and settles by the model
// (a damped load on a spring, bobStep), never by eye. A dashed line marks where the end was with no load.
// On the right: the readings (one column per spring), the halves (a paint mark on the middle coil, read on the ruler
// with no load and loaded), or a force–extension graph traced by the explore's point (the slider = the load).
// `view: 'lines'`: only a large force–extension graph, one line per stiffness; the letters at the line ends are tap targets.
import { useEffect, useRef, useState } from 'react';
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { fixed, sig } from '@/physics/format';
import { bobOmega, bobStep, cutStiffness, extensionFor, type Bob } from '@/physics/springs';
import type { SpringFig, SpringHang } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { useReducedMotionPref } from '@/ui/parts';
import { STILL, type DrawClock } from './anim';
import { DrawnFade, ForceArrow, ForceLetter, Hatch, MonoLabel } from './draw';
import type { TapProps, TapTarget } from './Sheet';
import { stage, TapBoxes } from './kit';

export const SPRING_VB = { w: 340, h: 230 };

const PEN = { ground: [0, 0.25], stand: [0.1, 0.45], springs: [0.35, 0.7], labels: [0.65, 0.98] } as const;
const BENCH = 214;
const BAR = 13; // the stand's arm
const TOP = 20; // the top of every spring
const K = 7; // viewBox units per cm
const COILS = 14; // coils in the whole spring
const BLOCK = { w: 34, h: 20, hook: 6 };
const KF = 10; // viewBox units per newton (T and W)
const ZETA = 0.1;
const PX = 196; // the panel's left edge
const PR = 334; // … and right edge

const Y = (cm: number) => TOP + cm * K;

export function springParams(fig: SpringFig): string {
  if (fig.view === 'lines') return 'force against extension';
  return `no load: ${fixed(fig.L0 * 100, 1)} cm`;
}

/** The stiffness and the resting extension (m) of each spring: its load ÷ k when hung, none when not. */
function springNumbers(fig: SpringFig, s: SpringHang, live?: number) {
  const k = cutStiffness(fig.k, s.part);
  const load = live ?? s.load;
  const hung = s.hung === true && load > 0;
  return { k, load, hung, rest: hung ? extensionFor(load, k) : 0, L0: fig.L0 * s.part };
}

/** Each spring's extension now: it follows its resting extension like a load on a spring, bobbing and settling. */
function useBobs(targets: number[], omegas: number[], running: boolean): number[] {
  const reduced = useReducedMotionPref();
  const bobs = useRef<Bob[]>(targets.map((x) => ({ x, v: 0 })));
  const goal = useRef({ targets, omegas });
  goal.current = { targets, omegas };
  const [xs, setXs] = useState(targets);
  const key = targets.map((x) => x.toFixed(5)).join(',');
  useEffect(() => {
    if (reduced || !running) {
      bobs.current = goal.current.targets.map((x) => ({ x, v: 0 }));
      setXs(goal.current.targets);
      return;
    }
    let raf = 0;
    let last = performance.now();
    let calm = 0;
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { targets: tg, omegas: om } = goal.current;
      bobs.current = tg.map((x, i) => bobStep(bobs.current[i] ?? { x, v: 0 }, x, om[i], ZETA, dt));
      setXs(bobs.current.map((b) => b.x));
      const still = bobs.current.every((b, i) => Math.abs(b.x - tg[i]) < 1e-5 && Math.abs(b.v) < 1e-4);
      calm = still ? calm + 1 : 0;
      if (calm > 10) return; // settled: stop until the target moves again
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [key, reduced, running]);
  return reduced || !running ? targets : xs;
}

type Props = { fig: SpringFig; live?: number; playing: boolean; tap?: TapProps; clock?: DrawClock };

export function SpringFigure({ fig, live, playing, tap, clock = STILL }: Props) {
  if (fig.view === 'lines') return <LinesGraph fig={fig} tap={tap} clock={clock} />;
  return <Hanging fig={fig} live={live} playing={playing} clock={clock} />;
}

function Hanging({ fig, live, playing, clock }: { fig: SpringFig; live?: number; playing: boolean; clock: DrawClock }) {
  const { palette: p } = useTheme();
  const nums = fig.springs.map((s) => springNumbers(fig, s, live));
  const xs = useBobs(
    nums.map((n) => n.rest),
    nums.map((n) => bobOmega(n.k, Math.max(0.5, n.load))),
    playing && !clock.on,
  );
  const lanes = fig.springs.length === 1 ? [104] : [92, 150];
  const ticks: string[] = [];
  for (let cm = 0; cm <= 22; cm++) ticks.push(`M50,${Y(cm)} h${cm % 5 === 0 ? -5 : -3}`);
  const armEnd = lanes[lanes.length - 1] + 16;

  return (
    <Group>
      {stage(clock, PEN.ground, <Hatch x1={8} x2={186} y={BENCH} color={p.draw} clock={clock} from={PEN.ground[0]} to={PEN.ground[1]} />)}

      {stage(clock, 
        PEN.stand,
        <Group>
          {/* the stand: a base, a rod and an arm; the ruler hangs from the arm with its 0 at the springs' tops */}
          <Rect x={8} y={BENCH - 6} width={40} height={6} fill={p.drawFillDark} stroke={p.draw} strokeWidth={1.3} />
          <Line x1={18} y1={BENCH - 6} x2={18} y2={4} stroke={p.draw} strokeWidth={3} />
          <Rect x={13} y={BAR - 5} width={10} height={10} rx={1.5} fill={p.drawFillDark} stroke={p.draw} strokeWidth={1.2} />
          <Line x1={23} y1={BAR} x2={armEnd} y2={BAR} stroke={p.draw} strokeWidth={2.4} />
          <Rect x={32} y={TOP - 4} width={18} height={22 * K + 8} fill={p.paper} stroke={p.draw} strokeWidth={1.1} />
          <Path d={ticks.join(' ')} stroke={p.label} strokeWidth={0.9} />
          {[0, 5, 10, 15, 20].map((cm) => (
            <MonoLabel key={cm} x={38} y={Y(cm) + 2.5} text={`${cm}`} color={p.label} size={7} />
          ))}
          <MonoLabel x={41} y={Y(22) + 16} text="cm" color={p.label} size={7.5} />
        </Group>,
      )}

      {stage(clock, 
        PEN.springs,
        <Group>
          {fig.springs.map((s, i) => (
            <OneSpring key={i} s={s} cx={lanes[i]} n={nums[i]} x={xs[i]} live={live} />
          ))}
        </Group>,
      )}

      {stage(clock, PEN.labels, <Panel fig={fig} nums={nums} live={live} />)}
    </Group>
  );
}

/** A spring from the arm, its coils stretched to its length now, and its weight (hung, or on the bench under it). */
function OneSpring({ s, cx, n, x, live }: { s: SpringHang; cx: number; n: ReturnType<typeof springNumbers>; x: number; live?: number }) {
  const { palette: p } = useTheme();
  const L = (n.L0 + x) * 100; // cm, now
  const bottom = Y(L);
  const coils = Math.max(2, Math.round(COILS * s.part));
  const lead = 3;
  const pitch = (bottom - TOP - 2 * lead) / coils;
  const front: string[] = [];
  const back: string[] = [];
  for (let c = 0; c < coils; c++) {
    const y0 = TOP + lead + c * pitch;
    front.push(`M${cx - 7},${y0} L${cx + 7},${y0 + pitch / 2}`);
    back.push(`M${cx + 7},${y0 + pitch / 2} L${cx - 7},${y0 + pitch}`);
  }
  const showBlock = n.load > 0;
  const blockTop = n.hung ? bottom + BLOCK.hook : BENCH - BLOCK.h;
  const markY = Y(n.L0 * 50 + x * 50); // the middle coil: half the spring, half the extension
  const naturalEnd = Y(n.L0 * 100);
  const naturalMark = Y(n.L0 * 50);
  const loadText = `${fixed(live ?? s.load, 1)} N`;
  const pullShown = s.pull === 'shown';
  const W = n.load;
  return (
    <Group>
      {/* where the end (and the mark) were with no load */}
      {(n.hung || x > 0.001) && <Line x1={cx - 15} y1={naturalEnd} x2={cx + 15} y2={naturalEnd} stroke={p.label} strokeWidth={1} strokeDasharray="3 3" />}
      {s.mark && <Line x1={cx - 15} y1={naturalMark} x2={cx + 15} y2={naturalMark} stroke={p.label} strokeWidth={1} strokeDasharray="3 3" />}
      <Line x1={cx} y1={BAR} x2={cx} y2={TOP + lead} stroke={p.draw} strokeWidth={1.6} />
      <Path d={back.join(' ')} stroke={p.label} strokeWidth={1.1} opacity={0.7} />
      <Path d={front.join(' ')} stroke={p.draw} strokeWidth={1.7} strokeLinecap="round" />
      <Line x1={cx} y1={bottom - lead} x2={cx} y2={bottom} stroke={p.draw} strokeWidth={1.6} />
      <Circle cx={cx} cy={bottom + 2} r={2.2} fill="none" stroke={p.draw} strokeWidth={1.3} />
      {s.mark && (
        <Group>
          <Rect x={cx - 9} y={markY - 2} width={18} height={4} rx={1} fill={p.ink} />
          <MonoLabel x={cx - 18} y={markY + 3} text="MARK" color={p.ink} size={7} anchor="end" />
        </Group>
      )}
      {showBlock && (
        <Group>
          {n.hung && <Line x1={cx} y1={bottom + 4} x2={cx} y2={blockTop} stroke={p.draw} strokeWidth={1.3} />}
          <Path d={`M${cx - BLOCK.w / 2},${blockTop} l4,-4 h${BLOCK.w} l-4,4 Z`} fill={p.drawFill} stroke={p.draw} strokeWidth={1.1} strokeLinejoin="round" />
          <Path d={`M${cx + BLOCK.w / 2},${blockTop + BLOCK.h} l4,-4 v${-BLOCK.h} l-4,4 Z`} fill={p.label} stroke={p.draw} strokeWidth={1.1} strokeLinejoin="round" />
          <Rect x={cx - BLOCK.w / 2} y={blockTop} width={BLOCK.w} height={BLOCK.h} fill={p.drawFillDark} stroke={p.draw} strokeWidth={1.3} />
          {!(s.pull && n.hung) && <MonoLabel x={cx} y={blockTop + 13.5} text={loadText} color={p.ink} size={8.5} />}
        </Group>
      )}
      {s.pull && n.hung && (
        <Group>
          {/* the bottom half and the weight: T from the top half at the mark, W on the weight */}
          {pullShown ? (
            <ForceArrow x1={cx} y1={markY} x2={cx} y2={markY - W * KF} color={p.force} width={3} />
          ) : (
            <ForceArrow x1={cx} y1={markY} x2={cx} y2={markY - 18} color={p.force} width={2} dashed />
          )}
          <Circle cx={cx} cy={markY} r={2.6} fill={p.force} />
          <ForceLetter x={cx + 12} y={markY - (pullShown ? (W * KF) / 2 : 9) + 4} text={pullShown ? `T = ${fixed(W, 1)} N` : 'T ?'} color={p.forceText} size={11} anchor="start" />
          <ForceArrow x1={cx} y1={blockTop + BLOCK.h / 2} x2={cx} y2={blockTop + BLOCK.h / 2 + W * KF} color={p.force} width={3} />
          <ForceLetter x={cx + 12} y={blockTop + BLOCK.h / 2 + (W * KF) / 2 + 12} text={`W = ${fixed(W, 1)} N`} color={p.forceText} size={11} anchor="start" />
        </Group>
      )}
      <MonoLabel x={cx} y={BAR - 4} text={s.name} color={p.label} size={7} />
    </Group>
  );
}

/** The numbers on the right: readings, the halves, or the force–extension graph. */
function Panel({ fig, nums, live }: { fig: SpringFig; nums: ReturnType<typeof springNumbers>[]; live?: number }) {
  const { palette: p } = useTheme();
  if (fig.panel === 'graph') return <TraceGraph fig={fig} n={nums[0]} live={live} />;
  const hidden = (row: string, col: number) => fig.ask && fig.ask.row === row && fig.ask.col === col;
  if (fig.panel === 'halves') {
    const n = nums[0];
    const L0 = n.L0 * 100;
    const ext = n.rest * 100;
    const rows: [string, string][] = [
      ['mark', `${fixed(L0 / 2, 1)} → ${fixed((L0 + ext) / 2, 1)}`],
      ['end', `${fixed(L0, 1)} → ${fixed(L0 + ext, 1)}`],
    ];
    return (
      <Group>
        <MonoLabel x={PX} y={34} text="ON THE RULER, cm" color={p.label} size={8} anchor="start" />
        <MonoLabel x={PR} y={50} text={`0 N → ${fixed(n.load, 1)} N`} color={p.label} size={8} anchor="end" />
        {rows.map(([k, v], i) => (
          <Group key={k}>
            <MonoLabel x={PX} y={74 + i * 26} text={k} color={p.label} size={8.5} anchor="start" />
            <MonoLabel x={PR} y={74 + i * 26} text={v} color={p.ink} size={10} anchor="end" />
            <Line x1={PX} y1={81 + i * 26} x2={PR} y2={81 + i * 26} stroke={p.paperLine} strokeWidth={0.8} />
          </Group>
        ))}
        <MonoLabel x={PX} y={136} text="bottom half Δx" color={p.label} size={8.5} anchor="start" />
        <MonoLabel x={PR} y={136} text={hidden('half', 0) ? '? cm' : `${fixed(ext / 2, 1)} cm`} color={p.ink} size={10} anchor="end" />
        <Line x1={PX} y1={143} x2={PR} y2={143} stroke={p.paperLine} strokeWidth={0.8} />
      </Group>
    );
  }
  const rows = fig.rows ?? ['load', 'length'];
  const cols = fig.springs.length === 1 ? [PR] : [282, PR];
  const two = fig.springs.length > 1;
  const names = { load: 'load', length: 'length', ext: 'Δx', k: two ? 'k, N m⁻¹' : 'k' } as const;
  const value = (row: (typeof rows)[number], i: number): string => {
    const s = fig.springs[i];
    const n = nums[i];
    if (row === 'load') return `${fixed(n.load, 1)} N`;
    if (hidden(row, i) || (s.hung === 'afterCheck' && n.load > 0)) return '?';
    if (row === 'length') return `${fixed((n.L0 + n.rest) * 100, 1)} cm`;
    if (row === 'ext') return `${fixed(n.rest * 100, 1)} cm`;
    if (n.load === 0) return '—'; // with no load there is nothing to measure k from
    return two ? sig(n.k) : `${sig(n.k)} N m⁻¹`;
  };
  return (
    <Group>
      {fig.springs.map((s, i) => (
        <MonoLabel key={i} x={cols[i]} y={34} text={s.name} color={p.label} size={8} anchor="end" />
      ))}
      {rows.map((row, r) => (
        <Group key={row}>
          <MonoLabel x={PX} y={62 + r * 26} text={names[row]} color={p.label} size={8.5} anchor="start" />
          {fig.springs.map((_, i) => (
            <MonoLabel key={i} x={cols[i]} y={62 + r * 26} text={value(row, i)} color={p.ink} size={fig.springs.length === 1 ? 10 : 9} anchor="end" />
          ))}
          <Line x1={PX} y1={69 + r * 26} x2={PR} y2={69 + r * 26} stroke={p.paperLine} strokeWidth={0.8} />
        </Group>
      ))}
    </Group>
  );
}

/** The explore's graph: force up, extension along; the point at the load now, the line traced from the origin. */
function TraceGraph({ fig, n, live }: { fig: SpringFig; n: ReturnType<typeof springNumbers>; live?: number }) {
  const { palette: p } = useTheme();
  const box = { x1: 214, x2: 330, y1: 46, y2: 180 };
  const fMax = 6;
  const xMax = (fMax / n.k) * 100; // cm at the top of the force axis
  const gx = (cm: number) => box.x1 + (cm / xMax) * (box.x2 - box.x1);
  const gy = (F: number) => box.y2 - (F / fMax) * (box.y2 - box.y1);
  const F = live ?? n.load;
  const ext = n.rest * 100;
  const grid: string[] = [];
  for (let f = 1; f <= fMax; f++) grid.push(`M${box.x1},${gy(f)} H${box.x2}`);
  for (let c = 2; c <= xMax + 0.01; c += 2) grid.push(`M${gx(c)},${box.y1} V${box.y2}`);
  return (
    <Group>
      <MonoLabel x={PR} y={18} text={`F ${fixed(F, 1)} N · Δx ${fixed(ext, 1)} cm`} color={p.ink} size={8.5} anchor="end" />
      <Path d={grid.join(' ')} stroke={p.paperLine} strokeWidth={0.7} />
      <Path d={`M${box.x1},${box.y1 - 6} V${box.y2} H${box.x2 + 4}`} stroke={p.draw} strokeWidth={1.3} fill="none" />
      {[0, 2, 4, 6].map((f) => (
        <MonoLabel key={f} x={box.x1 - 5} y={gy(f) + 3} text={`${f}`} color={p.label} size={7.5} anchor="end" />
      ))}
      {[0, 4, 8, 12].filter((c) => c <= xMax + 0.01).map((c) => (
        <MonoLabel key={c} x={gx(c)} y={box.y2 + 12} text={`${c}`} color={p.label} size={7.5} />
      ))}
      <MonoLabel x={box.x1 - 4} y={box.y1 - 9} text="F / N" color={p.label} size={7.5} anchor="start" />
      <MonoLabel x={box.x2} y={box.y2 + 26} text="Δx / cm" color={p.label} size={7.5} anchor="end" />
      {F > 0 && <Line x1={gx(0)} y1={gy(0)} x2={gx(ext)} y2={gy(F)} stroke={p.ink} strokeWidth={2} />}
      <Circle cx={gx(ext)} cy={gy(F)} r={4} fill={p.paper} stroke={p.ink} strokeWidth={2} />
    </Group>
  );
}

// ── view: 'lines' ──

const LG = { x1: 56, x2: 318, y1: 18, y2: 196, xMax: 14, fMax: 7 };
const lx = (cm: number) => LG.x1 + (cm / LG.xMax) * (LG.x2 - LG.x1);
const ly = (F: number) => LG.y2 - (F / LG.fMax) * (LG.y2 - LG.y1);

/** Where a line of stiffness k ends (at 6 N or at 12 cm, whichever first) and where its letter sits, just beyond. */
function lineEnd(k: number) {
  const cm = Math.min(12, (6 / k) * 100);
  const F = (k * cm) / 100;
  const ex = lx(cm);
  const ey = ly(F);
  const len = Math.hypot(ex - lx(0), ey - ly(0));
  return { ex, ey, tx: ex + ((ex - lx(0)) / len) * 16, ty: ey + ((ey - ly(0)) / len) * 16 };
}

export function springTargets(fig: SpringFig): TapTarget[] {
  if (fig.view !== 'lines') return [];
  return (fig.lines ?? []).map((l) => {
    const e = lineEnd(l.k);
    return { id: l.id, x: e.tx - 20, y: e.ty - 20, w: 40, h: 40, label: `line ${l.id}` };
  });
}

function LinesGraph({ fig, tap, clock }: { fig: SpringFig; tap?: TapProps; clock: DrawClock }) {
  const { palette: p } = useTheme();
  const grid: string[] = [];
  for (let f = 1; f <= LG.fMax; f++) grid.push(`M${LG.x1},${ly(f)} H${LG.x2}`);
  for (let c = 2; c <= LG.xMax; c += 2) grid.push(`M${lx(c)},${LG.y1} V${LG.y2}`);
  return (
    <Group>
      <DrawnFade clock={clock} from={0} to={0.4}>
        <Path d={grid.join(' ')} stroke={p.paperLine} strokeWidth={0.7} />
        <Path d={`M${LG.x1},${LG.y1 - 4} V${LG.y2} H${LG.x2 + 4}`} stroke={p.draw} strokeWidth={1.4} fill="none" />
        {[0, 2, 4, 6].map((f) => (
          <MonoLabel key={f} x={LG.x1 - 6} y={ly(f) + 3} text={`${f}`} color={p.label} size={8} anchor="end" />
        ))}
        {[0, 4, 8, 12].map((c) => (
          <MonoLabel key={c} x={lx(c)} y={LG.y2 + 13} text={`${c}`} color={p.label} size={8} />
        ))}
        <MonoLabel x={LG.x1 - 30} y={LG.y1 + 4} text="F / N" color={p.label} size={8} anchor="start" />
        <MonoLabel x={LG.x2} y={LG.y2 + 27} text="Δx / cm" color={p.label} size={8} anchor="end" />
      </DrawnFade>
      {tap && <TapBoxes targets={springTargets(fig)} tap={tap} />}
      <DrawnFade clock={clock} from={0.4} to={0.95}>
        {(fig.lines ?? []).map((l) => {
          const e = lineEnd(l.k);
          return (
            <Group key={l.id}>
              <Line x1={lx(0)} y1={ly(0)} x2={e.ex} y2={e.ey} stroke={p.ink} strokeWidth={2} />
              <MonoLabel x={e.tx} y={e.ty + 4} text={l.id} color={p.ink} size={12} />
            </Group>
          );
        })}
      </DrawnFade>
    </Group>
  );
}
