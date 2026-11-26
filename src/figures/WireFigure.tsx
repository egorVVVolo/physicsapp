// FIG: steel wires under a load (src/physics/young), Young modulus.
// view 'hang': one wire, or two side by side, hanging from a beam with a weight each. The length is drawn to scale;
// the stretch is magnified ×300 (the sheet says so) with a dashed line where the end was with no load, and it comes in
// (eased) once the question is answered. On the right: the cross-sections to scale, the readings (a column per wire),
// or a stress–strain graph traced by the explore's point (the slider = the load).
// view 'rig': the lab (Core Practical 2): a long thin wire from a clamp, a marker against a mm scale, a micrometer, weights.
// view 'plot': the lab's force–extension plot with a gradient triangle.
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { fixed, sci, sig } from '@/physics/format';
import { circleArea, strain, stress, wireExtension } from '@/physics/young';
import type { WireFig, WireSpec } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, useTween, type DrawClock } from './anim';
import { DrawnFade, Hatch, MonoLabel } from './draw';
import { stage, Rows } from './kit';

export const WIRE_VB = { w: 340, h: 230 };

const PEN = { top: [0, 0.25], wires: [0.2, 0.65], labels: [0.6, 0.98] } as const;
const BEAM = { y: 8, h: 8, x1: 8, x2: 186 };
const TOP = BEAM.y + BEAM.h; // the top of every wire
const S = 44; // viewBox units per metre of wire
const MAGNIFY = 300; // the stretch is drawn this many times too big
const BLOCK = { w: 36, h: 18, ring: 5 }; // wide enough for its load written on it
const PX = 206; // the panel's left edge (clear of wire B's length)
const PR = 334; // … and right edge
const SECTION = 48000; // viewBox units per metre of diameter, in the cross-sections

export function wireParams(fig: WireFig): string {
  if (fig.view === 'rig') return 'steel wire · Core Practical 2';
  if (fig.view === 'plot') return `L = ${fixed(fig.wires[0].L, 2)} m · d = ${fixed(fig.wires[0].d * 1e3, 2)} mm`;
  return `stretch drawn × ${MAGNIFY}`;
}

/** What each wire carries and how it stretches under the load F: area, stress, strain, extension. */
function wireNumbers(fig: WireFig, w: WireSpec, F: number) {
  const A = circleArea(w.d);
  const sigma = stress(F, A);
  const dx = wireExtension(F, w.L, A, fig.E);
  return { A, sigma, dx, epsilon: strain(dx, w.L) };
}

type Props = { fig: WireFig; live?: number; clock?: DrawClock };

export function WireFigure({ fig, live, clock = STILL }: Props) {
  if (fig.view === 'rig') return <Rig fig={fig} clock={clock} />;
  if (fig.view === 'plot') return <Plot fig={fig} clock={clock} />;
  return <Hanging fig={fig} F={live ?? fig.F} clock={clock} />;
}

function Hanging({ fig, F, clock }: { fig: WireFig; F: number; clock: DrawClock }) {
  const { palette: p, soft } = useTheme();
  const two = fig.wires.length > 1;
  const xs = two ? [56, 140] : [92];
  // the stretch comes in once the question is answered
  const grow = useTween(fig.stretch ? 0 : 1, undefined, 900, 250);
  const dp = 1;

  return (
    <Group>
      {stage(clock, 
        PEN.top,
        <Group>
          <Rect x={BEAM.x1} y={BEAM.y} width={BEAM.x2 - BEAM.x1} height={BEAM.h} rx={3} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.thin} />
        </Group>,
      )}

      {stage(clock, 
        PEN.wires,
        <Group>
          {fig.wires.map((w, i) => {
            const n = wireNumbers(fig, w, F);
            const cx = xs[i];
            const natural = TOP + w.L * S;
            const drawn = natural + n.dx * MAGNIFY * S * grow;
            const blockTop = drawn + BLOCK.ring + 3;
            const width = Math.min(4.5, Math.max(1.5, w.d * 4000));
            return (
              <Group key={i}>
                {/* the length, to scale */}
                <Line x1={cx + 14} y1={TOP} x2={cx + 14} y2={natural} stroke={p.label} strokeWidth={stroke.hair} />
                <Line x1={cx + 11} y1={TOP} x2={cx + 17} y2={TOP} stroke={p.label} strokeWidth={stroke.hair} />
                <Line x1={cx + 11} y1={natural} x2={cx + 17} y2={natural} stroke={p.label} strokeWidth={stroke.hair} />
                <MonoLabel x={cx + 20} y={(TOP + natural) / 2 + 3} text={`${fixed(w.L, dp)} m`} color={p.label} size={8} anchor="start" />
                {/* where the end was with no load */}
                {grow > 0.02 && n.dx > 0 && <Line x1={cx - 15} y1={natural} x2={cx + 11} y2={natural} stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="3 3" />}
                <Line x1={cx} y1={TOP} x2={cx} y2={drawn} stroke={p.ink} strokeWidth={width} />
                <Circle cx={cx} cy={drawn + 3} r={BLOCK.ring - 1.5} fill="none" stroke={p.draw} strokeWidth={stroke.thin} />
                <Rect x={cx - BLOCK.w / 2} y={blockTop} width={BLOCK.w} height={BLOCK.h} rx={5} fill={soft[i === 0 ? 'A' : 'B'].fill} stroke={soft[i === 0 ? 'A' : 'B'].edge} strokeWidth={2} />
                <MonoLabel x={cx} y={blockTop + 12.5} text={`${fixed(F, 0)} N`} color={p.ink} size={8.5} />
                <MonoLabel x={cx - 12} y={TOP + 14} text={w.name} color={p.ink} size={9} anchor="end" />
              </Group>
            );
          })}
        </Group>,
      )}

      {stage(clock, PEN.labels, <Panel fig={fig} F={F} />)}
    </Group>
  );
}

/** The numbers on the right: cross-sections to scale, the readings, or the stress–strain graph. */
function Panel({ fig, F }: { fig: WireFig; F: number }) {
  const { palette: p, soft } = useTheme();
  const nums = fig.wires.map((w) => wireNumbers(fig, w, F));
  if (fig.panel === 'graph') return <TraceGraph fig={fig} F={F} />;
  const two = fig.wires.length > 1;
  if (fig.panel === 'section') {
    const cxs = two ? [232, 304] : [266];
    return (
      <Group>
        <MonoLabel x={PX} y={34} text="To scale" color={p.label} size={8} anchor="start" />
        {fig.wires.map((w, i) => (
          <Group key={i}>
            <Circle cx={cxs[i]} cy={96} r={(w.d / 2) * SECTION} fill={soft[i === 0 ? 'A' : 'B'].fill} stroke={soft[i === 0 ? 'A' : 'B'].edge} strokeWidth={2} />
            <MonoLabel x={cxs[i]} y={146} text={w.name} color={p.ink} size={9.5} />
            <MonoLabel x={cxs[i]} y={162} text={`d ${fixed(w.d * 1e3, 2)}`} color={p.label} size={8} />
            <MonoLabel x={cxs[i]} y={176} text={`A ${sig(nums[i].A * 1e6)}`} color={p.ink} size={8} />
          </Group>
        ))}
        <MonoLabel x={(PX + PR) / 2} y={198} text="A = πd² ÷ 4" color={p.label} size={8} />
        <MonoLabel x={(PX + PR) / 2} y={213} text="d in mm, A in mm²" color={p.label} size={8} />
      </Group>
    );
  }
  const rows = fig.rows ?? ['L', 'd'];
  const cols = two ? [266, PR] : [PR];
  const names = { L: 'length, m', d: 'width, mm', A: 'area, mm²', stress: 'σ, MPa', strain: 'ε, 10⁻³', ext: 'Δx, mm', E: 'E, Pa' } as const;
  const asked = (row: string, col: number) => fig.ask && fig.ask.row === row && fig.ask.col === col;
  const value = (row: (typeof rows)[number], i: number): string => {
    const w = fig.wires[i];
    const n = nums[i];
    if (asked(row, i)) return '?';
    switch (row) {
      case 'L':
        return fixed(w.L, 1);
      case 'd':
        return fixed(w.d * 1e3, 2);
      case 'A':
        return sig(n.A * 1e6);
      case 'stress':
        return sig(n.sigma / 1e6);
      case 'strain':
        return fixed(n.epsilon * 1e3, 2);
      case 'ext':
        return fixed(n.dx * 1e3, 2);
      case 'E':
        return sci(fig.E);
    }
  };
  return (
    <Group>
      {fig.wires.map((w, i) => (
        <MonoLabel key={i} x={cols[i]} y={34} text={w.name} color={p.label} size={8} anchor="end" />
      ))}
      {/* one wire: name and value side by side; two wires: the name on its own line, the two values under it */}
      {!two && <Rows rows={rows.map((row) => [names[row], value(row, 0)] as [string, string])} x={PX} right={PR} y0={62} step={26} />}
      {two &&
        rows.map((row, r) => (
          <Group key={row}>
            <MonoLabel x={PX} y={56 + r * 32} text={names[row]} color={p.label} size={8.5} anchor="start" />
            {fig.wires.map((_, i) => (
              <MonoLabel key={i} x={cols[i]} y={70 + r * 32} text={value(row, i)} color={p.ink} size={8.5} anchor="end" />
            ))}
            <Line x1={PX} y1={75 + r * 32} x2={PR} y2={75 + r * 32} stroke={p.paperLine} strokeWidth={stroke.hair} />
          </Group>
        ))}
    </Group>
  );
}

/** The explore's graph: stress up, strain along; the point at the load now, the line traced from the origin. */
function TraceGraph({ fig, F }: { fig: WireFig; F: number }) {
  const { palette: p, soft } = useTheme();
  const box = { x1: 214, x2: 330, y1: 46, y2: 180 };
  const sMax = 400; // MPa
  const eMax = 2.0; // × 10⁻³
  const gx = (e: number) => box.x1 + (e / eMax) * (box.x2 - box.x1);
  const gy = (s: number) => box.y2 - (s / sMax) * (box.y2 - box.y1);
  const n = wireNumbers(fig, fig.wires[0], F);
  const s = n.sigma / 1e6;
  const e = n.epsilon * 1e3;
  const grid: string[] = [];
  for (let v = 100; v <= sMax; v += 100) grid.push(`M${box.x1},${gy(v)} H${box.x2}`);
  for (let v = 0.5; v <= eMax + 0.01; v += 0.5) grid.push(`M${gx(v)},${box.y1} V${box.y2}`);
  return (
    <Group>
      {/* two lines, so the readout never reaches back to the beam */}
      <MonoLabel x={PR} y={10} text={`σ ${sig(s)} MPa`} color={p.ink} size={8.5} anchor="end" />
      <MonoLabel x={PR} y={22} text={`ε ${fixed(e, 2)} × 10⁻³`} color={p.ink} size={8.5} anchor="end" />
      <Path d={grid.join(' ')} stroke={p.paperLine} strokeWidth={stroke.hair} />
      <Path d={`M${box.x1},${box.y1 - 6} V${box.y2} H${box.x2 + 4}`} stroke={p.draw} strokeWidth={stroke.thin} fill="none" />
      {[0, 100, 200, 300, 400].map((v) => (
        <MonoLabel key={v} x={box.x1 - 5} y={gy(v) + 3} text={`${v}`} color={p.label} size={7.5} anchor="end" />
      ))}
      {[0, 0.5, 1, 1.5, 2].map((v) => (
        <MonoLabel key={v} x={gx(v)} y={box.y2 + 12} text={`${v}`} color={p.label} size={7.5} />
      ))}
      <MonoLabel x={box.x1 - 4} y={box.y1 - 9} text="σ / MPa" color={p.label} size={7.5} anchor="start" />
      <MonoLabel x={box.x2} y={box.y2 + 26} text="ε / 10⁻³" color={p.label} size={7.5} anchor="end" />
      {F > 0 && <Line x1={gx(0)} y1={gy(0)} x2={gx(e)} y2={gy(s)} stroke={soft.A.edge} strokeWidth={stroke.force} />}
      <Circle cx={gx(e)} cy={gy(s)} r={4} fill={p.paper} stroke={p.ink} strokeWidth={stroke.body} />
    </Group>
  );
}

// ── view: 'rig' ──

const WIRE_X = 96;

function Rig({ fig, clock }: { fig: WireFig; clock: DrawClock }) {
  const { palette: p, soft } = useTheme();
  const w = fig.wires[0];
  const arm = 12;
  const marker = 148;
  const ticks: string[] = [];
  for (let i = 0; i <= 20; i++) ticks.push(`M118,${marker - 20 + i * 2} h${i % 5 === 0 ? 8 : 4}`);
  const rows: [string, string][] = [
    ['L', 'metre rule'],
    ['d', 'micrometer'],
    ['Δx', 'mm scale'],
    ['F', 'slotted weights'],
  ];
  return (
    <Group>
      <DrawnFade clock={clock} from={0} to={0.4}>
        <Hatch x1={8} x2={186} y={214} color={p.draw} clock={clock} from={0} to={0.3} />
        {/* the stand: a base, a rod and an arm; the wire hangs from a clamp on the arm */}
        <Rect x={8} y={208} width={40} height={6} rx={2} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.thin} />
        <Line x1={18} y1={208} x2={18} y2={4} stroke={p.draw} strokeWidth={stroke.force} />
        <Rect x={13} y={arm - 5} width={10} height={10} rx={2} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.thin} />
        <Line x1={23} y1={arm} x2={WIRE_X + 8} y2={arm} stroke={p.draw} strokeWidth={stroke.force} />
        <Rect x={WIRE_X - 5} y={arm + 1} width={10} height={9} rx={2} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.thin} />
      </DrawnFade>

      <DrawnFade clock={clock} from={0.3} to={0.75}>
        {/* the wire, with a break: it is far longer than the drawing */}
        <Line x1={WIRE_X} y1={arm + 10} x2={WIRE_X} y2={76} stroke={p.ink} strokeWidth={stroke.body} />
        <Line x1={WIRE_X - 5} y1={80} x2={WIRE_X + 5} y2={72} stroke={p.label} strokeWidth={stroke.thin} />
        <Line x1={WIRE_X - 5} y1={86} x2={WIRE_X + 5} y2={78} stroke={p.label} strokeWidth={stroke.thin} />
        <Line x1={WIRE_X} y1={82} x2={WIRE_X} y2={176} stroke={p.ink} strokeWidth={stroke.body} />
        {/* the length L, from the clamp to the marker */}
        <Line x1={62} y1={arm + 10} x2={62} y2={marker} stroke={p.label} strokeWidth={stroke.hair} />
        <Line x1={59} y1={arm + 10} x2={65} y2={arm + 10} stroke={p.label} strokeWidth={stroke.hair} />
        <Line x1={59} y1={marker} x2={65} y2={marker} stroke={p.label} strokeWidth={stroke.hair} />
        <MonoLabel x={57} y={(arm + marker) / 2 + 3} text={`${fixed(w.L, 2)} m`} color={p.label} size={8} anchor="end" />
        {/* the micrometer round the wire: a frame, an anvil, a spindle, a thimble */}
        <Path d={`M${WIRE_X - 16},44 h32 v26 h-32 Z`} fill="none" stroke={p.draw} strokeWidth={stroke.thin} />
        <Rect x={WIRE_X + 16} y={50} width={22} height={14} rx={3} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.thin} />
        <Path d={`M${WIRE_X + 20},50 v14 M${WIRE_X + 25},50 v14 M${WIRE_X + 30},50 v14 M${WIRE_X + 35},50 v14`} stroke={p.label} strokeWidth={stroke.hair} />
        <MonoLabel x={WIRE_X + 16} y={41} text={`d ${fixed(w.d * 1e3, 2)}`} color={p.label} size={8} anchor="start" />
        {/* the marker: a flag on the wire, against a mm scale */}
        <Rect x={118} y={marker - 24} width={14} height={48} fill={p.paper} stroke={p.draw} strokeWidth={stroke.thin} />
        <Path d={ticks.join(' ')} stroke={p.label} strokeWidth={stroke.hair} />
        <Path d={`M${WIRE_X},${marker} H116`} stroke={p.ink} strokeWidth={stroke.body} />
        <Rect x={WIRE_X - 3} y={marker - 3} width={6} height={6} fill={p.ink} />
        <MonoLabel x={140} y={marker + 3} text="mm" color={p.label} size={7.5} anchor="start" />
        {/* the hanger and its weights */}
        <Path d={`M${WIRE_X},176 v6`} stroke={p.draw} strokeWidth={stroke.thin} />
        {[0, 1, 2].map((i) => (
          <Rect key={i} x={WIRE_X - 14} y={182 + i * 7} width={28} height={6} rx={2} fill={soft.A.fill} stroke={soft.A.edge} strokeWidth={1.6} />
        ))}
      </DrawnFade>

      <DrawnFade clock={clock} from={0.65} to={0.98}>
        <MonoLabel x={PX} y={34} text="What is measured" color={p.label} size={8} anchor="start" />
        {rows.map(([k, v], r) => (
          <Group key={k}>
            <MonoLabel x={PX} y={62 + r * 30} text={k} color={p.ink} size={10} anchor="start" />
            <MonoLabel x={PX + 26} y={62 + r * 30} text={v} color={p.label} size={7.5} anchor="start" />
            <Line x1={PX} y1={70 + r * 30} x2={PR} y2={70 + r * 30} stroke={p.paperLine} strokeWidth={stroke.hair} />
          </Group>
        ))}
      </DrawnFade>
    </Group>
  );
}

// ── view: 'plot' ──

const PG = { x1: 62, x2: 318, y1: 22, y2: 186, xMax: 0.6, fMax: 8 };
const px = (mm: number) => PG.x1 + (mm / PG.xMax) * (PG.x2 - PG.x1);
const py = (F: number) => PG.y2 - (F / PG.fMax) * (PG.y2 - PG.y1);
const SCATTER = [0.012, -0.01, 0.008, -0.012, 0.006, 0.01, -0.008, 0.004]; // mm, a few readings off the line

function Plot({ fig, clock }: { fig: WireFig; clock: DrawClock }) {
  const { palette: p, soft } = useTheme();
  const k = fig.k ?? 1.6e4;
  const mmAt = (F: number) => (F / k) * 1e3;
  const grid: string[] = [];
  for (let f = 2; f <= PG.fMax; f += 2) grid.push(`M${PG.x1},${py(f)} H${PG.x2}`);
  for (let i = 1; i <= 6; i++) grid.push(`M${px(i / 10)},${PG.y1} V${PG.y2}`);
  const p1 = { x: mmAt(1.6), y: 1.6 };
  const p2 = { x: mmAt(8), y: 8 };
  return (
    <Group>
      <DrawnFade clock={clock} from={0} to={0.4}>
        <Path d={grid.join(' ')} stroke={p.paperLine} strokeWidth={stroke.hair} />
        <Path d={`M${PG.x1},${PG.y1 - 6} V${PG.y2} H${PG.x2 + 4}`} stroke={p.draw} strokeWidth={stroke.thin} fill="none" />
        {/* the origin is numbered once, on the extension axis */}
        {[2, 4, 6, 8].map((f) => (
          <MonoLabel key={f} x={PG.x1 - 6} y={py(f) + 3} text={`${f}`} color={p.label} size={8} anchor="end" />
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <MonoLabel key={i} x={px(i / 10)} y={PG.y2 + 13} text={fixed(i / 10, 1)} color={p.label} size={8} />
        ))}
        <MonoLabel x={PG.x1 - 30} y={PG.y1 - 10} text="F / N" color={p.label} size={8} anchor="start" />
        <MonoLabel x={PG.x2} y={PG.y2 + 27} text="Δx / mm" color={p.label} size={8} anchor="end" />
      </DrawnFade>
      <DrawnFade clock={clock} from={0.4} to={0.95}>
        <Line x1={px(0)} y1={py(0)} x2={px(p2.x)} y2={py(p2.y)} stroke={soft.A.edge} strokeWidth={stroke.force} />
        {SCATTER.map((off, i) => (
          <Circle key={i} cx={px(mmAt(i + 1) + off)} cy={py(i + 1)} r={2.6} fill={p.paper} stroke={p.ink} strokeWidth={stroke.thin} />
        ))}
        {/* the gradient triangle, large, on the line */}
        <Path d={`M${px(p1.x)},${py(p1.y)} H${px(p2.x)} V${py(p2.y)}`} fill="none" stroke={p.ink} strokeWidth={stroke.body} strokeDasharray="4 3" />
        <MonoLabel x={(px(p1.x) + px(p2.x)) / 2} y={py(p1.y) + 14} text={`Δx = ${fixed(p2.x - p1.x, 2)} mm`} color={p.ink} size={8.5} />
        <MonoLabel x={px(p2.x) - 6} y={(py(p1.y) + py(p2.y)) / 2 + 3} text={`ΔF = ${fixed(p2.y - p1.y, 1)} N`} color={p.ink} size={8.5} anchor="end" />
      </DrawnFade>
    </Group>
  );
}
