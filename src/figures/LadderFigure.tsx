// FIG: a uniform ladder leaning on a smooth wall, on a rough floor: an extended body, so every force is drawn where it
// acts. W from the middle (centre of gravity), S, the wall's push, at the top (at right angles to the wall: a smooth
// surface cannot pull along itself), N and F at the foot. S comes from ladderWallPush (src/physics/dynamics); the ladder
// stays put, so F balances S and N balances W. With `candidates` three dashed arrows at the top can be tapped.
import { Circle, G as Group, Path } from 'react-native-svg';
import { ladderWallPush, weight } from '@/physics/dynamics';
import { fixed } from '@/physics/format';
import { LADDER_IDS, type LadderFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, type DrawClock } from './anim';
import { CgMark, ForceArrow, ForceLetter, Hatch, MonoLabel, useLineStep } from './draw';
import type { TapProps, TapTarget } from './Sheet';
import { stage, Tag, TapBoxes } from './kit';

export const LADDER_VB = { w: 340, h: 230 };

const PEN = { walls: [0, 0.3], ladder: [0.25, 0.55], forces: [0.55, 0.78], labels: [0.75, 0.95] } as const;
const RAD = Math.PI / 180;
const WALL = 236; // the wall's face
const FLOOR = 210;
const L = 170; // the ladder's length along its middle line
const HALF = 4; // half the ladder's width
const KL = 0.75; // viewBox units per newton
const CAND = 52; // length of a candidate arrow
const BOX = 40; // side of a tap box

/** The forces on the ladder, from the model. */
export function ladderForces(fig: LadderFig) {
  const w = weight(fig.m);
  const s = ladderWallPush(w, fig.angle);
  return { W: w, S: s, N: w, F: s };
}

export function ladderParams(fig: LadderFig): string {
  return `m = ${fig.m} kg, at ${fixed(fig.angle, 0)}° to the floor`;
}

function geometry(fig: LadderFig) {
  const u: [number, number] = [Math.cos(fig.angle * RAD), -Math.sin(fig.angle * RAD)]; // from the foot to the top
  const n: [number, number] = [-u[1], u[0]]; // across the ladder, towards the wall and down
  // the rail nearer the wall touches it
  const top: [number, number] = [WALL - n[0] * HALF, FLOOR - L * Math.sin(fig.angle * RAD)];
  const foot: [number, number] = [top[0] - u[0] * L, FLOOR];
  const cg: [number, number] = [(top[0] + foot[0]) / 2, (top[1] + foot[1]) / 2];
  const contact: [number, number] = [WALL, top[1]];
  return { u, n, top, foot, cg, contact };
}

export function ladderTargets(fig: LadderFig): TapTarget[] {
  if (!fig.candidates) return [];
  const { contact } = geometry(fig);
  const centres: Record<(typeof LADDER_IDS)[number], [number, number]> = {
    normal: [contact[0] - 52, contact[1] + 16],
    perp: [contact[0] - 47, contact[1] - 26],
    up: [contact[0] + 8, contact[1] - 30],
  };
  const names = { normal: 'at right angles to the wall, away from it', perp: 'at right angles to the ladder', up: 'straight up the wall' };
  return LADDER_IDS.map((id) => ({ id, x: centres[id][0] - BOX / 2, y: centres[id][1] - BOX / 2, w: BOX, h: BOX, label: names[id] }));
}

export function LadderFigure({ fig, tap, clock = STILL }: { fig: LadderFig; tap?: TapProps; clock?: DrawClock }) {
  const { palette: p, soft } = useTheme();
  const step9 = useLineStep(9); // two-line labels: the distance between their lines
  const { u, n, top, foot, cg, contact } = geometry(fig);
  const f = ladderForces(fig);
  const has = (k: 'W' | 'S' | 'N' | 'F') => fig.forces.includes(k);
  const value = (x: number) => `${fixed(x, x < 100 ? 1 : 0)} N`;

  const rails = [-HALF, HALF].map((o) => {
    const a: [number, number] = [foot[0] + n[0] * o, foot[1] + n[1] * o];
    return `M${a[0]},${a[1]} L${a[0] + u[0] * L},${a[1] + u[1] * L}`;
  });
  const rungs: string[] = [];
  for (let s = 16; s < L - 6; s += 18) {
    const m: [number, number] = [foot[0] + u[0] * s, foot[1] + u[1] * s];
    rungs.push(`M${m[0] - n[0] * HALF},${m[1] - n[1] * HALF} L${m[0] + n[0] * HALF},${m[1] + n[1] * HALF}`);
  }

  const wTip: [number, number] = [cg[0], cg[1] + f.W * KL];
  const sTip: [number, number] = [contact[0] - f.S * KL, contact[1]];
  const nTip: [number, number] = [foot[0], foot[1] - f.N * KL];
  const fTip: [number, number] = [foot[0] + f.F * KL, foot[1]];
  const showF = has('F') && fig.askF === undefined;
  const arc = 34;
  const arcPath = `M${foot[0] + arc},${foot[1]} A${arc},${arc} 0 0 0 ${foot[0] + u[0] * arc},${foot[1] + u[1] * arc}`;
  const bis: [number, number] = [Math.cos((fig.angle / 2) * RAD), -Math.sin((fig.angle / 2) * RAD)];

  const candidates: Record<(typeof LADDER_IDS)[number], [number, number]> = {
    normal: [contact[0] - CAND, contact[1]],
    perp: [contact[0] - n[0] * CAND, contact[1] - n[1] * CAND], // away from the wall, at right angles to the ladder
    up: [contact[0], contact[1] - CAND * 0.8],
  };

  return (
    <Group>
      {stage(clock, 
        PEN.walls,
        <Group>
          <Hatch x1={16} x2={WALL} y={FLOOR} color={p.draw} clock={clock} from={PEN.walls[0]} to={PEN.walls[1]} />
          <Group transform={`translate(${WALL} ${FLOOR}) rotate(-90)`}>
            <Hatch x1={0} x2={FLOOR - 10} y={0} color={p.draw} clock={clock} from={PEN.walls[0]} to={PEN.walls[1]} />
          </Group>
          <MonoLabel x={WALL + 40} y={129 - step9} text="smooth" color={p.label} size={9} />
          <MonoLabel x={WALL + 40} y={129} text="wall" color={p.label} size={9} />
          <MonoLabel x={60} y={FLOOR + 16} text="rough floor" color={p.label} size={9} />
        </Group>,
      )}

      {fig.candidates && <TapBoxes targets={ladderTargets(fig)} tap={tap} />}

      {stage(clock, 
        PEN.ladder,
        <Group>
          {/* rails and rungs in the body's tone, each with an edge of the same hue */}
          <Path d={rungs.join(' ')} stroke={soft.A.edge} strokeWidth={2.2} />
          <Path d={rails.join(' ')} stroke={soft.A.edge} strokeWidth={5.6} strokeLinecap="round" />
          <Path d={rails.join(' ')} stroke={soft.A.fill} strokeWidth={2.4} strokeLinecap="round" />
          <Path d={arcPath} fill="none" stroke={p.label} strokeWidth={stroke.thin} />
          <MonoLabel x={foot[0] + bis[0] * (arc - 13)} y={foot[1] + bis[1] * (arc - 13) + 3} text={`${fixed(fig.angle, 0)}°`} color={p.ink} size={9} />
          <CgMark x={cg[0]} y={cg[1]} color={p.draw} />
        </Group>,
      )}

      {stage(clock, 
        PEN.forces,
        <Group>
          {has('W') && <ForceArrow x1={cg[0]} y1={cg[1]} x2={wTip[0]} y2={wTip[1]} color={p.force} />}
          {has('S') && <ForceArrow x1={contact[0]} y1={contact[1]} x2={sTip[0]} y2={sTip[1]} color={p.force} />}
          {has('N') && <ForceArrow x1={foot[0]} y1={foot[1]} x2={nTip[0]} y2={nTip[1]} color={p.force} />}
          {showF && <ForceArrow x1={foot[0]} y1={foot[1]} x2={fTip[0]} y2={fTip[1]} color={p.force} />}
          {fig.candidates &&
            LADDER_IDS.map((id) => (
              <ForceArrow key={id} x1={contact[0]} y1={contact[1]} x2={candidates[id][0]} y2={candidates[id][1]} color={p.force} width={2.4} dashed />
            ))}
          {(has('S') || fig.candidates) && <Circle cx={contact[0]} cy={contact[1]} r={3} fill={p.force} />}
          {(has('N') || has('F')) && <Circle cx={foot[0]} cy={foot[1]} r={3} fill={p.force} />}
        </Group>,
      )}

      {stage(clock, 
        PEN.labels,
        <Group>
          {has('W') && <ForceLetter x={cg[0] + 8} y={cg[1] + f.W * KL * 0.4} text="W" color={p.force} size={14} anchor="start" />}
          {has('W') && fig.values && <MonoLabel x={cg[0] + 7} y={cg[1] + f.W * KL * 0.4 + step9 + 3} text={value(f.W)} color={p.ink} size={9} anchor="start" />}
          {has('S') && <ForceLetter x={sTip[0] + 4} y={contact[1] - 8} text="S" color={p.force} size={14} />}
          {has('S') && fig.values && <MonoLabel x={sTip[0] - 6} y={contact[1] + 3} text={value(f.S)} color={p.ink} size={9} anchor="end" />}
          {has('N') && <ForceLetter x={foot[0] - 8} y={nTip[1] + 11} text="N" color={p.force} size={14} anchor="end" />}
          {has('N') && fig.values && <MonoLabel x={foot[0] - 8} y={nTip[1] + 11 + step9 + 3} text={value(f.N)} color={p.ink} size={9} anchor="end" />}
          {showF && <Tag x={foot[0] + 22} y={FLOOR + 16} text={fig.values ? `F ${value(f.F)}` : 'F'} />}
          {has('F') && fig.askF !== undefined && <Tag x={foot[0] + 14} y={FLOOR + 16} text="F = ?" />}
        </Group>,
      )}
    </Group>
  );
}
