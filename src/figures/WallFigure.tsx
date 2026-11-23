// FIG: trolleys run into a wall. Towards the wall is positive. Trolley A has a spring buffer and bounces back; trolley B
// has a putty pad and stops dead. Every position and velocity comes from wallRun (src/physics/momentum): steady speed,
// then the buffer squashes with a constant deceleration until the trolley leaves at its bounce speed (or stops).
// Each trolley carries its momentum as a solid ink arrow (blue is kept for forces) that shrinks through zero and flips
// during a bounce. Under the track an optional momentum line per trolley: p before (○), p after (●) and Δp between them.
import { Circle, G as Group, Line, Path, Rect } from 'react-native-svg';
import { momentum, momentumChange, wallContact, wallRun, type WallHit } from '@/physics/momentum';
import { fixed, signed } from '@/physics/format';
import type { WallFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, useLoopTime, useTween, type DrawClock } from './anim';
import { ForceArrow, ForceLetter, MonoLabel } from './draw';
import { HollowArrow, stage, TROLLEY, Trolley } from './kit';

export const WALL_VB = { w: 340, h: 230 };

const WALL_X = 318; // the face of the wall
const K = 170; // viewBox units per metre
const GAP = 1.1; // m from the buffer's tip to the wall when the clip starts
const SQUASH = 0.05; // m, the deepest a buffer squashes
const TAIL = 0.8; // s the clip runs on after the hit
const KP = 50; // viewBox units per kg m s⁻¹ of momentum
const KV = 26; // viewBox units per m s⁻¹ of velocity
const LINE = { x0: 40, x1: 324, zero: 182, range: 1.6 }; // the momentum line: from −range to +range
const KL = (LINE.x1 - LINE.zero) / LINE.range;
const PEN = { track: [0, 0.35], trolleys: [0.3, 0.7], labels: [0.7, 0.95] } as const;

const hitOf = (fig: WallFig, id: 'A' | 'B', live?: number): WallHit => ({ u: fig.u, back: id === 'A' ? (live ?? fig.back) : 0, gap: GAP, squash: SQUASH });

/** The lanes (floor of each trolley) and the rows of the momentum line. */
function layout(n: number, ledger: boolean): { floors: number[]; rows: number[] } {
  if (!ledger) return n === 1 ? { floors: [128], rows: [] } : { floors: [92, 180], rows: [] };
  return n === 1 ? { floors: [92], rows: [176] } : { floors: [52, 106], rows: [162, 208] };
}

/** The given values in the sheet header; on the explore screen (bounce speed from the slider) A's change in momentum. */
export function wallParams(fig: WallFig, live?: number): string {
  if (live !== undefined) return `Δp ${signed(momentumChange(fig.m, fig.u, -live), 2)} kg m s⁻¹ · + →`;
  return `${fixed(fig.m, 2)} kg · u ${fixed(fig.u, 1)} m s⁻¹ · + →`;
}

export const wallPlays = (fig: WallFig): boolean => fig.play === true;

type Props = { fig: WallFig; live?: number; playing: boolean; clock?: DrawClock };

export function WallFigure({ fig, live, playing, clock = STILL }: Props) {
  const { palette: p, material: m } = useTheme();
  const { floors, rows } = layout(fig.trolleys.length, fig.ledger !== undefined);
  // the clip lasts until the slower of the two has had TAIL seconds after its hit
  const ends = fig.trolleys.map((id) => wallContact(hitOf(fig, id, live)).tEnd);
  const length = Math.max(...ends) + TAIL;
  const loop = useLoopTime(playing && fig.play === true, length, `${live ?? fig.back}`, 0.8);
  // revealed after Check, a momentum arrow grows and the Δp arrow runs from p before to p after; shown from the start, they are just there
  const grow = useTween(fig.p === 'shown' ? 1 : 0, fig.p === 'shown' ? 1 : 0, 420);
  const rowsGrow = useTween(fig.ledger === 'shown' ? 1 : 0, fig.ledger === 'shown' ? 1 : 0, 520);
  // two trolleys over two rows of the momentum line: no room for arrows over the trolleys, the rows tell the story
  const compact = rows.length > 1;
  const top = floors[0] - (compact ? 48 : 60);
  const last = floors[floors.length - 1];

  return (
    <Group>
      {stage(clock, 
        PEN.track,
        <Group>
          {floors.map((y) => (
            <Group key={y}>
              <Line x1={8} y1={y} x2={WALL_X} y2={y} stroke={p.draw} strokeWidth={stroke.body} />
              {Array.from({ length: 34 }, (_, i) => 10 + i * 9).map((x) => (
                <Line key={x} x1={x} y1={y + 7} x2={x + 7} y2={y} stroke={p.draw} strokeWidth={stroke.hair} opacity={0.5} />
              ))}
            </Group>
          ))}
          <Rect x={WALL_X} y={top} width={8} height={last - top} fill={p.drawFillDark} stroke={p.draw} strokeWidth={stroke.body} />
          {Array.from({ length: Math.floor((last - top) / 9) }, (_, i) => top + 4 + i * 9).map((y) => (
            <Line key={y} x1={WALL_X + 8} y1={y + 7} x2={WALL_X + 14} y2={y} stroke={p.draw} strokeWidth={stroke.hair} opacity={0.55} />
          ))}
          {rows.length === 0 && (
            <Group>
              <Path d={`M14,${last + 24} H40`} stroke={p.label} strokeWidth={stroke.thin} />
              <Path d={`M35,${last + 20} L41,${last + 24} L35,${last + 28}`} stroke={p.label} strokeWidth={stroke.thin} fill="none" />
              <MonoLabel x={46} y={last + 27} text="+ towards the wall" color={p.label} size={8.5} anchor="start" />
            </Group>
          )}
        </Group>,
      )}

      {fig.trolleys.map((id, i) => {
        const hit = hitOf(fig, id, live);
        const { tHit, tEnd } = wallContact(hit);
        const t = fig.play === true ? loop : fig.at === 'after' ? tEnd + 0.5 : tHit * 0.45;
        const run = wallRun(t, hit);
        const y = floors[i];
        const tipFree = WALL_X - GAP * K + run.s * K; // where the buffer's tip would be if it did not squash
        const squashed = Math.max(0, tipFree - WALL_X);
        const front = tipFree - TROLLEY.buf;
        const back = front - TROLLEY.w;
        const mid = (back + front) / 2;
        const pNow = momentum(fig.m, run.v);
        const arrowY = y - 50;
        return (
          <Group key={id}>
            {stage(clock, PEN.trolleys, <Trolley rear={back} floor={y} facing={1} text={`${id} ${fixed(fig.m, 2)} kg`} buffer={id === 'A' ? 'spring' : 'putty'} squashed={squashed} />)}
            {!compact && stage(clock, 
              PEN.labels,
              fig.p === undefined ? (
                <Arrowed x={mid} y={arrowY} len={run.v * KV} hollow text={Math.abs(run.v) < 0.05 ? 'at rest' : `v = ${signed(run.v, 1)} m s⁻¹`} />
              ) : fig.p === 'shown' ? (
                <Arrowed x={mid} y={arrowY} len={pNow * KP * grow} text={`p = ${signed(pNow, 2)} kg m s⁻¹`} />
              ) : (
                <Arrowed x={mid} y={arrowY} len={Math.sign(run.v || 1) * 26} dashed text="p = ?" />
              ),
            )}
            {rows.length > 0 && stage(clock, PEN.labels, <LedgerRow y={rows[i]} id={id} before={momentum(fig.m, fig.u)} after={momentum(fig.m, -hit.back)} k={rowsGrow} show={fig.ledger === 'shown'} />)}
          </Group>
        );
      })}

      {rows.length > 0 &&
        stage(clock, 
          PEN.labels,
          <Group>
            <MonoLabel x={LINE.x0} y={rows[0] - 30} text="MOMENTUM LINE · kg m s⁻¹" color={p.label} size={8} anchor="start" />
            <Circle cx={LINE.x1 - 84} cy={rows[0] - 33} r={3} fill={p.paper} stroke={p.ink} strokeWidth={stroke.thin} />
            <MonoLabel x={LINE.x1 - 78} y={rows[0] - 30} text="before" color={p.label} size={8} anchor="start" />
            <Circle cx={LINE.x1 - 30} cy={rows[0] - 33} r={3} fill={p.ink} />
            <MonoLabel x={LINE.x1 - 24} y={rows[0] - 30} text="after" color={p.label} size={8} anchor="start" />
          </Group>,
        )}
    </Group>
  );
}

/**
 * An arrow from x along the track (len signed, right positive) with its text beside it: a solid ink arrow (momentum),
 * a hollow one (velocity) or a dashed stub ("?"). The text sits left of the arrow if there is room, otherwise right.
 */
function Arrowed({ x, y, len, text, hollow, dashed }: { x: number; y: number; len: number; text: string; hollow?: boolean; dashed?: boolean }) {
  const { palette: p, material: m } = useTheme();
  const lo = Math.min(x, x + len);
  const hi = Math.max(x, x + len);
  const w = text.length * 5.4;
  const left = lo - 6 - w >= 4;
  return (
    <Group>
      {hollow ? <HollowArrow from={[x, y]} to={[x + len, y]} color={p.label} weight="track" minLen={4} /> : <ForceArrow x1={x} y1={y} x2={x + len} y2={y} color={p.ink} width={3} dashed={dashed} />}
      {Math.abs(len) < 1 && !hollow && <Circle cx={x} cy={y} r={2.4} fill={p.ink} />}
      <MonoLabel x={left ? lo - 6 : hi + 6} y={y + 3.2} text={text} color={p.ink} size={9} anchor={left ? 'end' : 'start'} />
    </Group>
  );
}


/** One row of the momentum line: the axis with its numbers, p before (○), p after (●) and the Δp arrow from one to the other. */
function LedgerRow({ y, id, before, after, k, show }: { y: number; id: string; before: number; after: number; k: number; show: boolean }) {
  const { palette: p, material: m } = useTheme();
  const X = (v: number) => LINE.zero + v * KL;
  const ticks: number[] = [];
  for (let v = -LINE.range; v <= LINE.range + 1e-9; v += 0.4) ticks.push(Math.round(v * 10) / 10);
  const dp = after - before;
  const xB = X(before);
  const xA = X(before + dp * k);
  return (
    <Group>
      <ForceLetter x={18} y={y + 5} text={id} color={p.ink} size={14} />
      <Line x1={LINE.x0} y1={y} x2={LINE.x1} y2={y} stroke={p.draw} strokeWidth={stroke.thin} />
      {ticks.map((v) => (
        <Group key={v}>
          <Line x1={X(v)} y1={y - (v === 0 ? 5 : 3)} x2={X(v)} y2={y + (v === 0 ? 5 : 3)} stroke={p.draw} strokeWidth={v === 0 ? 1.4 : 1} />
          <MonoLabel x={X(v)} y={y + 13} text={v === 0 ? '0' : signed(v, 1)} color={p.label} size={7.5} />
        </Group>
      ))}
      {show ? (
        <Group>
          {Math.abs(xA - xB) > 2 && <ForceArrow x1={xB} y1={y - 9} x2={xA} y2={y - 9} color={p.ink} width={2.6} />}
          <Circle cx={xB} cy={y} r={3.6} fill={p.paper} stroke={p.ink} strokeWidth={stroke.body} />
          {k > 0.98 && <Circle cx={X(after)} cy={y} r={3.6} fill={p.ink} />}
          {k > 0.98 && <MonoLabel x={(xB + X(after)) / 2} y={y - 16} text={`Δp = ${signed(dp, 2)}`} color={p.ink} size={9} />}
        </Group>
      ) : (
        <MonoLabel x={LINE.zero} y={y - 10} text="Δp = ?" color={p.ink} size={9} />
      )}
    </Group>
  );
}

