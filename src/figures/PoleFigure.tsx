// FIG: a pole fixed to a wall, rising at an angle, with a sign hanging from its end. The sign's weight acts straight
// down, so its line of action is vertical and the perpendicular distance from the fixing is the horizontal one,
// L cos θ (src/physics/moments). With `candidates` three dashed distances can be tapped.
import { Circle, G as Group, Path, Rect } from 'react-native-svg';
import { momentAtAngle } from '@/physics/moments';
import { fixed } from '@/physics/format';
import { POLE_IDS, type PoleFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { STILL, type DrawClock } from './anim';
import { ForceArrow, ForceLetter, Hatch, MonoLabel } from './draw';
import type { TapProps, TapTarget } from './Sheet';
import { AngleArc, RightAngle, TurnArc } from './turning';
import { Dim, stage, TapBoxes } from './kit';

export const POLE_VB = { w: 340, h: 230 };

const PEN = { wall: [0, 0.3], pole: [0.25, 0.55], forces: [0.55, 0.75], marks: [0.72, 0.95] } as const;
const RAD = Math.PI / 180;
const WALL = 44; // the wall's face
const FIX: [number, number] = [WALL, 190]; // where the pole is fixed
const K = 125; // viewBox units per metre
const KW = 1; // viewBox units per newton
const HEIGHT_X = 306; // where the dashed height is drawn
const BOX = 40;

/** The pole's far end, the sign's centre and the moment of its weight about the fixing (clockwise). */
function geometry(fig: PoleFig) {
  const end: [number, number] = [FIX[0] + fig.L * Math.cos(fig.angle * RAD) * K, FIX[1] - fig.L * Math.sin(fig.angle * RAD) * K];
  const sign: [number, number] = [end[0], end[1] + 30];
  return { end, sign, across: fig.L * Math.cos(fig.angle * RAD), M: momentAtAngle(fig.W, fig.L, 90 - fig.angle) };
}

export function poleParams(fig: PoleFig): string {
  return `L = ${fixed(fig.L, 1)} m, W = ${fixed(fig.W, 0)} N`;
}

export function poleTargets(fig: PoleFig): TapTarget[] {
  if (!fig.candidates) return [];
  const { end } = geometry(fig);
  const n: [number, number] = [-Math.sin(fig.angle * RAD), -Math.cos(fig.angle * RAD)]; // across the pole, upwards
  const centres: Record<(typeof POLE_IDS)[number], [number, number]> = {
    along: [(FIX[0] + end[0]) / 2 + n[0] * 18, (FIX[1] + end[1]) / 2 + n[1] * 18],
    height: [HEIGHT_X, (FIX[1] + end[1]) / 2],
    across: [(FIX[0] + end[0]) / 2, FIX[1]],
  };
  const names = { along: 'the length of the pole', height: 'the height of its end above the fixing', across: 'the horizontal distance' };
  return POLE_IDS.map((id) => ({ id, x: centres[id][0] - BOX / 2, y: centres[id][1] - BOX / 2, w: BOX, h: BOX, label: names[id] }));
}

export function PoleFigure({ fig, tap, clock = STILL }: { fig: PoleFig; tap?: TapProps; clock?: DrawClock }) {
  const { palette: p } = useTheme();
  const { end, sign, across, M } = geometry(fig);
  const shown = fig.moment === 'shown';
  const wTip: [number, number] = [sign[0], sign[1] + 14 + fig.W * KW];
  const lineX = end[0];

  return (
    <Group>
      {stage(clock, 
        PEN.wall,
        <Group>
          <Group transform={`translate(${WALL} 10) rotate(90)`}>
            <Hatch x1={0} x2={212} y={0} color={p.draw} clock={clock} from={PEN.wall[0]} to={PEN.wall[1]} />
          </Group>
          <Rect x={WALL} y={FIX[1] - 9} width={7} height={18} fill={p.drawFillDark} stroke={p.draw} strokeWidth={1.2} />
        </Group>,
      )}

      {fig.candidates && <TapBoxes targets={poleTargets(fig)} tap={tap} />}

      {stage(clock, 
        PEN.pole,
        <Group>
          <Path d={`M${FIX[0]},${FIX[1]} L${end[0]},${end[1]}`} stroke={p.draw} strokeWidth={6} strokeLinecap="round" />
          <Path d={`M${FIX[0]},${FIX[1]} L${end[0]},${end[1]}`} stroke={p.drawFill} strokeWidth={2.4} strokeLinecap="round" />
          <Path d={`M${end[0]},${end[1]} L${sign[0] - 18},${sign[1] - 14} M${end[0]},${end[1]} L${sign[0] + 18},${sign[1] - 14}`} stroke={p.draw} strokeWidth={1.2} />
          <Rect x={sign[0] - 28} y={sign[1] - 14} width={56} height={28} rx={3} fill={p.drawFill} stroke={p.draw} strokeWidth={1.8} />
          <MonoLabel x={sign[0]} y={sign[1] + 3.5} text="CAFÉ" color={p.draw} size={10} />
          <Circle cx={FIX[0]} cy={FIX[1]} r={2.4} fill={p.draw} />
          <AngleArc at={FIX} r={30} from={0} sweep={-fig.angle} color={p.label} />
          <MonoLabel x={FIX[0] + Math.cos((-fig.angle / 2) * RAD) * 42} y={FIX[1] + Math.sin((-fig.angle / 2) * RAD) * 42 + 3} text={`${fixed(fig.angle, 0)}°`} color={p.ink} size={9} />
          <Path d={`M${FIX[0]},${FIX[1]} H${FIX[0] + 48}`} stroke={p.label} strokeWidth={1} strokeDasharray="2 3" />
        </Group>,
      )}

      {stage(clock, 
        PEN.forces,
        <Group>
          {/* the line of action of the weight, straight down through the end */}
          {(shown || fig.candidates) && <Path d={`M${lineX},${end[1] - 10} V${FIX[1] + 12}`} stroke={p.force} strokeWidth={1.2} strokeDasharray="4 4" opacity={0.75} />}
          <ForceArrow x1={sign[0]} y1={sign[1] + 14} x2={wTip[0]} y2={wTip[1]} color={p.force} />
          <ForceLetter x={sign[0] + 9} y={wTip[1] - 8} text="W" color={p.force} size={14} anchor="start" />
          <MonoLabel x={sign[0] + 9} y={wTip[1] + 4} text={`${fixed(fig.W, 0)} N`} color={p.ink} size={9} anchor="start" />
        </Group>,
      )}

      {stage(clock, 
        PEN.marks,
        <Group>
          {fig.candidates ? (
            <Group>
              <Dim a={FIX} b={end} offset={18} dashed />
              <Dim a={[HEIGHT_X, FIX[1]]} b={[HEIGHT_X, end[1]]} dashed />
              <Path d={`M${end[0] + 6},${end[1]} H${HEIGHT_X + 6}`} stroke={p.label} strokeWidth={1} strokeDasharray="2 3" />
              <Dim a={FIX} b={[lineX, FIX[1]]} dashed />
            </Group>
          ) : (
            <Dim a={FIX} b={end} offset={18} text={`${fixed(fig.L, 1)} m`} />
          )}
          {shown && (
            <Group>
              <Dim a={FIX} b={[lineX, FIX[1]]} text={`x = ${fixed(across, 2)} m`} strong />
              <RightAngle at={[lineX, FIX[1]]} u={[-1, 0]} v={[0, -1]} color={p.ink} />
              <TurnArc cx={FIX[0]} cy={FIX[1]} r={17} from={-80} sweep={150} color={p.ink} />
            </Group>
          )}
          {fig.moment !== undefined && <MonoLabel x={WALL + 16} y={22} text={shown ? `M = ${fixed(M, 1)} N m` : 'M = ?'} color={p.ink} size={10} anchor="start" />}
        </Group>,
      )}
    </Group>
  );
}
