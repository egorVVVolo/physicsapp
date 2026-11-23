// FIG: a broom lying flat, balanced on a fingertip at its centre of gravity. Sawn there, each piece's weight acts at
// its own centre of gravity: the brush piece's close to the cut, the handle piece's far out. Their moments about the
// cut are equal, so their weights are not (piecesAtBalance, src/physics/moments).
import { Circle, G as Group, Path, Rect } from 'react-native-svg';
import { piecesAtBalance } from '@/physics/moments';
import { fixed } from '@/physics/format';
import type { BroomFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { phaseOf, STILL, useOnceTime, type DrawClock } from './anim';
import { CgMark, ForceArrow, MonoLabel, polyPath, rectPath } from './draw';
import { Dim, stage } from './kit';

export const BROOM_VB = { w: 340, h: 230 };

const PEN = { finger: [0, 0.3], broom: [0.25, 0.6], marks: [0.6, 0.8], forces: [0.75, 0.95] } as const;
const K = 240; // viewBox units per metre
const CUT_X = 246; // the balance point
const Y = 122; // the handle's centre line
const ROD = 7; // the handle's thickness
const HANDLE_END = 0.9; // m, the handle runs this far left of the cut
const KW = 10; // viewBox units per newton
const STUB = 26;
const DIM_Y = 88;

const xAt = (m: number) => CUT_X + m * K;

export function broomParams(fig: BroomFig): string {
  return `broom, W = ${fixed(fig.total, 1)} N`;
}

/** Played: the finger goes, the pieces part at the cut and hang from newtonmeters; the readings then grow. */
const PART_S = 0.5;
const GROW_S = 1.2;
const GAP = 4; // each piece moves this far from the cut
const NM_TOP = 8; // the newtonmeter's body
const NM_H = 44;
const NM_K = 4.5; // viewBox units of pointer travel per newton

export function BroomFigure({ fig, clock = STILL }: { fig: BroomFig; clock?: DrawClock }) {
  const { palette: p, material: m } = useTheme();
  const [brushW, handleW] = piecesAtBalance(fig.total, fig.brush, fig.handle);
  const plays = fig.play === true && fig.pieces === 'shown';
  const t = useOnceTime(PART_S + GROW_S, plays);
  const part = plays ? phaseOf(t, 0, PART_S) : 0; // the finger goes, the pieces part
  const grow = plays ? phaseOf(t, PART_S, GROW_S) : 1; // the readings (and the weights) grow
  const dx = part * GAP;
  const handle = rectPath(xAt(-HANDLE_END), Y - ROD / 2, (HANDLE_END + 0.07) * K, ROD, ROD / 2);
  const ferrule = rectPath(xAt(0.06), Y - 11, 0.06 * K, 22, 3);
  const bristles = polyPath([
    [xAt(0.12), Y - 12],
    [xAt(0.26), Y - 18],
    [xAt(0.26), Y + 18],
    [xAt(0.12), Y + 12],
  ]);
  const strands = [-12, -6, 0, 6, 12].map((dy) => `M${xAt(0.13)},${Y + dy} L${xAt(0.255)},${Y + dy * 1.45}`).join(' ');
  const pieces = fig.pieces;
  const known = pieces === 'shown';
  const piece = (at: number, W: number, name: string) => {
    const x = xAt(at) + (at < 0 ? -dx : dx);
    const len = known ? W * KW * grow : STUB;
    const reading = W * grow;
    return (
      <Group key={name}>
        {plays && (
          <Group opacity={part}>
            {/* the newtonmeter the piece hangs from, at its centre of gravity, so it hangs level */}
            <Circle cx={x} cy={NM_TOP - 3} r={3} fill="none" stroke={p.draw} strokeWidth={stroke.thin} />
            <Rect x={x - 7} y={NM_TOP} width={14} height={NM_H} rx={3} fill={m.metal} stroke={p.draw} strokeWidth={stroke.body} />
            <Path d={[0, 2, 4, 6, 8].map((n) => `M${x - 4},${NM_TOP + 7 + n * NM_K} h3`).join(' ')} stroke={p.draw} strokeWidth={stroke.hair} />
            <Path d={`M${x - 1},${NM_TOP + 7 + reading * NM_K} h6`} stroke={p.ink} strokeWidth={stroke.force} />
            {/* the string, broken where it crosses the dimension line's numbers */}
            <Path d={`M${x},${NM_TOP + NM_H} V${DIM_Y - 12} M${x},${DIM_Y + 5} V${Y - ROD / 2}`} stroke={p.draw} strokeWidth={stroke.thin} />
            <MonoLabel x={x + 11} y={NM_TOP + 26} text={`${fixed(reading, 1)} N`} color={p.ink} size={10} anchor="start" />
          </Group>
        )}
        {len > 1 && <ForceArrow x1={x} y1={Y} x2={x} y2={Y + 9 + len} color={p.force} dashed={!known} />}
        <CgMark x={x} y={Y} color={p.draw} />
        {(!plays || grow > 0.98) && <MonoLabel x={x + 9} y={Y + 9 + len - 2} text={known ? `${fixed(W, 1)} N` : 'W = ?'} color={p.forceText} size={9} anchor="start" />}
      </Group>
    );
  };

  return (
    <Group>
      {stage(clock, 
        PEN.finger,
        <Group opacity={1 - part}>
          {/* a hand from below, one finger up under the balance point */}
          <Rect x={CUT_X - 26} y={196} width={52} height={44} rx={14} fill={p.skin} stroke={p.draw} strokeWidth={stroke.body} />
          <Rect x={CUT_X - 7} y={Y + ROD / 2} width={14} height={90} rx={7} fill={p.skin} stroke={p.draw} strokeWidth={stroke.body} />
          <Path d={`M${CUT_X - 4},${Y + 16} Q${CUT_X},${Y + 19} ${CUT_X + 4},${Y + 16}`} fill="none" stroke={p.draw} strokeWidth={stroke.thin} opacity={0.6} />
        </Group>,
      )}

      {stage(clock, 
        PEN.broom,
        <Group>
          {dx > 0 ? (
            <Group>
              {/* sawn: the handle piece ends at the cut, the brush piece starts there */}
              <Path d={rectPath(xAt(-HANDLE_END) - dx, Y - ROD / 2, HANDLE_END * K, ROD, ROD / 2).d} fill={m.wood} stroke={p.draw} strokeWidth={stroke.body} />
              <Circle cx={xAt(-HANDLE_END) + 6 - dx} cy={Y} r={1.6} fill={p.draw} />
              <Group transform={`translate(${dx} 0)`}>
                <Path d={rectPath(CUT_X, Y - ROD / 2, 0.07 * K, ROD, 1).d} fill={m.wood} stroke={p.draw} strokeWidth={stroke.body} />
                <Path d={bristles.d} fill={m.plasticSide} stroke={p.draw} strokeWidth={stroke.body} strokeLinejoin="round" />
                <Path d={strands} stroke={p.draw} strokeWidth={stroke.thin} opacity={0.55} />
                <Path d={ferrule.d} fill={m.metal} stroke={p.draw} strokeWidth={stroke.body} />
              </Group>
            </Group>
          ) : (
            <Group>
              <Path d={handle.d} fill={m.wood} stroke={p.draw} strokeWidth={stroke.body} />
              <Circle cx={xAt(-HANDLE_END) + 6} cy={Y} r={1.6} fill={p.draw} />
              <Path d={bristles.d} fill={m.plasticSide} stroke={p.draw} strokeWidth={stroke.body} strokeLinejoin="round" />
              <Path d={strands} stroke={p.draw} strokeWidth={stroke.thin} opacity={0.55} />
              <Path d={ferrule.d} fill={m.metal} stroke={p.draw} strokeWidth={stroke.body} />
            </Group>
          )}
          {!pieces && <CgMark x={CUT_X} y={Y} color={p.draw} />}
        </Group>,
      )}

      {stage(clock, 
        PEN.marks,
        <Group>
          {fig.cut && (
            <Group>
              <Path d={`M${CUT_X},${Y - 40} V${Y + 14}`} stroke={p.ink} strokeWidth={stroke.thin} strokeDasharray="5 4" />
              <MonoLabel x={CUT_X - 6} y={Y - 18} text="CUT" color={p.ink} size={9} anchor="end" />
            </Group>
          )}
          {pieces && (
            <Group>
              {!plays && <MonoLabel x={xAt(-HANDLE_END / 2)} y={DIM_Y - 22} text="HANDLE PIECE" color={p.label} size={9} />}
              {!plays && <MonoLabel x={xAt(0.17)} y={DIM_Y - 22} text="BRUSH PIECE" color={p.label} size={9} />}
              <Dim a={[xAt(-fig.handle), DIM_Y]} b={[CUT_X, DIM_Y]} text={`${fixed(fig.handle, 2)} m`} />
              <Dim a={[CUT_X, DIM_Y]} b={[xAt(fig.brush), DIM_Y]} text={`${fixed(fig.brush, 2)} m`} />
              {!plays && <Path d={`M${xAt(-fig.handle)},${DIM_Y + 4} V${Y - 8} M${xAt(fig.brush)},${DIM_Y + 4} V${Y - 14}`} stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="2 3" />}
            </Group>
          )}
        </Group>,
      )}

      {pieces &&
        stage(clock, 
          PEN.forces,
          <Group>
            {piece(-fig.handle, handleW, 'handle')}
            {piece(fig.brush, brushW, 'brush')}
          </Group>,
        )}
    </Group>
  );
}
