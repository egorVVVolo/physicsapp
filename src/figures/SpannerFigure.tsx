// FIG: a stuck wheel nut and a spanner, one panel per pull (PRIYA / TOM). Every pull has the same size and turns the nut
// anticlockwise; it acts a distance r from the nut at an angle to the handle. Its line of action is drawn dashed and the
// perpendicular from the nut meets it at a right angle: that perpendicular, x, is the distance that counts
// (moment = Fx, src/physics/moments). On the explore screen the slider turns the first pull.
import { Circle, G as Group, Line, Path } from 'react-native-svg';
import { footOfPerpendicular, momentAtAngle, perpendicularDistance } from '@/physics/moments';
import { fixed } from '@/physics/format';
import type { SpannerFig, SpannerPull } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, useLoopTime, type DrawClock } from './anim';
import { useReducedMotionPref } from '@/ui/parts';
import { ForceArrow, ForceLetter, MonoLabel, polyPath, rectPath } from './draw';
import { AngleArc, cm, RightAngle, TurnArc } from './turning';
import { Dim, stage, Tag } from './kit';

export const SPANNER_VB = { w: 340, h: 230 };

const PEN = { tool: [0, 0.4], pulls: [0.38, 0.62], marks: [0.6, 0.95] } as const;
const RAD = Math.PI / 180;

type Panel = { x0: number; w: number; nut: [number, number]; k: number; arrow: number; head: number; arcR: number };

/** One big panel, or two side by side. k: viewBox units per metre of spanner. */
function panelsFor(n: number): Panel[] {
  if (n === 1) return [{ x0: 0, w: 340, nut: [58, 164], k: 780, arrow: 76, head: 21, arcR: 35 }];
  return [0, 1].map((i) => ({ x0: i * 170, w: 170, nut: [i * 170 + 40, 154], k: 400, arrow: 62, head: 15, arcR: 26 }));
}

export function spannerParams(fig: SpannerFig): string {
  return fig.pulls.length > 1 ? `F = ${fixed(fig.F, 0)} N each` : `F = ${fixed(fig.F, 0)} N`;
}

/** The pulls as drawn: on an explore screen the slider sets the first pull's angle. */
function pullsOf(fig: SpannerFig, live?: number): SpannerPull[] {
  return fig.pulls.map((pull, i) => (i === 0 && live !== undefined ? { ...pull, angle: live } : pull));
}

/** Played: the spanner with the biggest moment turns the nut TURN degrees in TURN_S seconds; the others turn slower, ∝ their moment. */
const TURN = 30;
const TURN_S = 1.2;
const REST_S = 0.8; // still at the start of each turn, so the marks can be read
const HOLD_S = 0.6;
const BACK_S = 0.5;

/** Whether the figure plays (the sheet shows its pause button). */
export const spannerPlays = (fig: SpannerFig, live?: number): boolean => fig.play === true && live === undefined;

/**
 * The angle (degrees, anticlockwise) each spanner has turned at time t of the loop. Angular speed ∝ moment: the biggest
 * moment reaches TURN at TURN_S, a moment half as big has turned half as far by then. All hold, then glide back together.
 */
export function spannerTurns(moments: number[], t: number): number[] {
  const top = Math.max(...moments.map(Math.abs), 1e-9);
  const back = 1 - Math.min(1, Math.max(0, (t - REST_S - TURN_S - HOLD_S) / BACK_S));
  const eased = back * back * (3 - 2 * back);
  return moments.map((M) => {
    const turned = Math.min(TURN, (TURN / TURN_S) * (Math.abs(M) / top) * Math.max(0, Math.min(t - REST_S, TURN_S)));
    return turned * eased;
  });
}
export const SPANNER_LOOP_S = REST_S + TURN_S + HOLD_S + BACK_S;

type FigProps = { fig: SpannerFig; live?: number; playing?: boolean; clock?: DrawClock };

export function SpannerFigure({ fig, live, playing = false, clock = STILL }: FigProps) {
  const { palette: p, soft } = useTheme();
  const pulls = pullsOf(fig, live);
  const panels = panelsFor(pulls.length);
  const perp = fig.perp === 'shown' || live !== undefined;
  const plays = spannerPlays(fig, live);
  const reduced = useReducedMotionPref();
  const t = useLoopTime(plays && playing && !reduced, SPANNER_LOOP_S, fig, 0);
  const turns = plays ? spannerTurns(pulls.map((pull) => momentAtAngle(fig.F, pull.r, pull.angle)), t) : pulls.map(() => 0);

  return (
    <Group>
      {pulls.length > 1 && <Line x1={170} y1={10} x2={170} y2={222} stroke={p.paperLine} strokeWidth={stroke.thin} strokeDasharray="3 4" />}
      {pulls.map((pull, i) => {
        const pn = panels[i];
        const [nx, ny] = pn.nut;
        const end = nx + fig.length * pn.k;
        const P: [number, number] = [nx + pull.r * pn.k, ny];
        const dir: [number, number] = [-Math.cos(pull.angle * RAD), -Math.sin(pull.angle * RAD)];
        const tip: [number, number] = [P[0] + dir[0] * pn.arrow, P[1] + dir[1] * pn.arrow];
        const { foot } = footOfPerpendicular(pn.nut, P, dir);
        const tFoot = (nx - P[0]) * dir[0] + (ny - P[1]) * dir[1];
        const tEnd = Math.max(pn.arrow, tFoot) + 16;
        const x = perpendicularDistance(pull.r, pull.angle);
        const alongHandle = Math.abs(Math.cos(pull.angle * RAD)) < 0.09; // the perpendicular lies along the handle
        const M = momentAtAngle(fig.F, pull.r, pull.angle);
        const hw = pn.head * 0.72; // handle width
        const hex = polyPath([0, 1, 2, 3, 4, 5].map((j) => [nx + Math.cos((j * 60 + 30) * RAD) * pn.head * 0.6, ny + Math.sin((j * 60 + 30) * RAD) * pn.head * 0.6] as const));
        const handle = rectPath(nx + pn.head * 0.5, ny - hw / 2, end - nx - pn.head * 0.5, hw, hw / 2);
        // the x label sits beside the perpendicular, on the side away from the pull
        const mid: [number, number] = [(nx + foot[0]) / 2 + dir[0] * 30, (ny + foot[1]) / 2 + dir[1] * 30];
        const dimY = ny + pn.head + 13;
        const toNut: [number, number] = (() => {
          const l = Math.hypot(nx - foot[0], ny - foot[1]);
          return l < 1 ? [-1, 0] : [(nx - foot[0]) / l, (ny - foot[1]) / l];
        })();
        const turn = turns[i];
        const tone = soft[i === 0 ? 'A' : 'B']; // each pull has its own spanner colour
        const marksOpacity = Math.max(0, 1 - turn / 4); // the measurements belong to the spanner at rest
        return (
          <Group key={pull.who}>
            <Group transform={`rotate(${-turn} ${nx} ${ny})`}>
            {stage(clock, 
              PEN.tool,
              <Group>
                <Path d={handle.d} fill={tone.fill} stroke={tone.edge} strokeWidth={2} />
                <Circle cx={nx} cy={ny} r={pn.head} fill={tone.fill} stroke={tone.edge} strokeWidth={2} />
                <Path d={hex.d} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.body} />
                <Circle cx={nx} cy={ny} r={2} fill={p.draw} />
              </Group>,
            )}

            {stage(clock, 
              PEN.pulls,
              <Group>
                {perp && <Path d={`M${P[0] - dir[0] * 16},${P[1] - dir[1] * 16} L${P[0] + dir[0] * tEnd},${P[1] + dir[1] * tEnd}`} stroke={p.force} strokeWidth={stroke.thin} strokeDasharray="4 4" opacity={0.75} />}
                <ForceArrow x1={P[0]} y1={P[1]} x2={tip[0]} y2={tip[1]} color={p.force} />
                <Circle cx={P[0]} cy={P[1]} r={3} fill={p.force} />
                <ForceLetter x={tip[0] - dir[1] * 12} y={tip[1] + dir[0] * 12 + 5} text="F" color={p.force} size={14} />
              </Group>,
            )}

            </Group>
            {stage(clock, PEN.tool, <MonoLabel x={pn.x0 + 12} y={20} text={pull.who[0] + pull.who.slice(1).toLowerCase()} color={p.label} size={10} anchor="start" />)}
            {stage(clock, 
              PEN.marks,
              <Group opacity={marksOpacity}>
                {/* where the pull acts, measured along the handle */}
                <Dim a={[nx, dimY]} b={[P[0], dimY]} text={perp && alongHandle ? `x = ${cm(x)}` : cm(pull.r)} strong={perp && alongHandle} within={[0, SPANNER_VB.w]} />
                {alongHandle ? (
                  <RightAngle at={[P[0], P[1] - hw / 2]} u={[0, -1]} v={[-1, 0]} size={8} color={p.label} />
                ) : pull.angle < 8 ? null : (
                  <Group>
                    <AngleArc at={P} r={22} from={180} sweep={pull.angle} color={p.label} />
                    <MonoLabel x={P[0] + Math.cos((180 + pull.angle / 2) * RAD) * 60} y={P[1] + Math.sin((180 + pull.angle / 2) * RAD) * 60 + 3} text={`${fixed(pull.angle, 0)}°`} color={p.ink} size={9} />
                  </Group>
                )}
                {perp && !alongHandle && x > 0.004 && (
                  <Group>
                    <Path d={`M${nx},${ny} L${foot[0]},${foot[1]}`} stroke={p.ink} strokeWidth={stroke.body} />
                    <RightAngle at={foot} u={toNut} v={[-dir[0], -dir[1]]} color={p.ink} />
                    <Tag x={Math.min(Math.max(mid[0], (`x = ${cm(x)}`.length * 7.2 + 8) / 2 + 2), SPANNER_VB.w - (`x = ${cm(x)}`.length * 7.2 + 8) / 2 - 2)} y={mid[1] + 3} text={`x = ${cm(x)}`} />
                  </Group>
                )}
                {perp && !alongHandle && x <= 0.004 && <Tag x={nx} y={ny - pn.head - 14} text="x = 0" />}
              </Group>,
            )}
            {stage(clock,
              PEN.marks,
              <Group>
                {fig.moment !== undefined && (
                  <MonoLabel x={pn.x0 + 12} y={39} text={fig.moment === 'shown' ? `M = ${fixed(M, 1)} N m` : 'M = ?'} color={p.ink} size={10} anchor="start" />
                )}
                {fig.moment === 'shown' && <TurnArc cx={nx} cy={ny} r={pn.arcR} from={-25} sweep={-205} color={p.ink} />}
              </Group>,
            )}
          </Group>
        );
      })}
    </Group>
  );
}
