// FIG: a person on bathroom scales in a lift (left) and the free-body diagram of the person (right).
// Arrow lengths and the scales reading come from src/physics/dynamics (normalInLift, weight, scaleKg).
// A moving lift is shown by the shaft sliding past the car, with s = ut + ½at² from src/physics/kinematics.
import { G as Group, Line, Rect, Circle, Path } from 'react-native-svg';
import { G, position, timeAtRest } from '@/physics/kinematics';
import { normalInLift, scaleKg, weight } from '@/physics/dynamics';
import { fixed, signed } from '@/physics/format';
import { CANDIDATE_IDS, type LiftFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { useLoopTime, useTween } from './anim';
import { AccChevrons, CgMark, ForceArrow, ForceLetter, Hatch, MonoLabel, MotionArrow } from './draw';
import { type TapProps, type TapTarget } from './Sheet';

export const LIFT_VB = { w: 340, h: 260 };

const DOT = { x: 272, y: 138 }; // the particle of the free-body diagram
const MID_X = 206; // motion / acceleration marks, between the lift and the diagram
const CAND_X: Record<(typeof CANDIDATE_IDS)[number], number> = { shorter: 238, equal: 272, longer: 306 };
const CAND_K: Record<(typeof CANDIDATE_IDS)[number], number> = { shorter: 0.6, equal: 1, longer: 1.4 };
const STUB = 34; // length of the dashed "N = ?" stub

/** Pixels per newton: the longest N the slider can make (a = +3 m s⁻²) fits above the dot. */
const scaleFor = (m: number) => 100 / (m * (G + 3));

/** Shaft drawing: pixels per metre of travel, and the gap between the marks on the shaft walls. */
const PX_PER_M = 20;
const MARK_GAP = 24;
const CLIP = 1.8; // seconds of motion shown before the clip starts again

/** True when the figure shows a moving lift (the shaft slides, a pause button appears). */
export function liftMoves(fig: LiftFig, a: number): boolean {
  return !!fig.motion || Math.abs(a) > 1e-9;
}

/** The values written in the sheet header. On an explore screen `a` is on the slider, so it is left out. */
export function liftParams(fig: LiftFig, a: number, live: boolean): string {
  return `m = ${fig.m} kg` + (fig.showAcc && !live ? `, a = ${signed(a, 1)} m s⁻²` : '');
}

/** Tap targets in viewBox units (the candidate N arrows). */
export function liftTargets(fig: LiftFig): TapTarget[] {
  if (!fig.candidates) return [];
  const w = weight(fig.m) * scaleFor(fig.m);
  return CANDIDATE_IDS.map((id) => {
    const len = w * CAND_K[id];
    return { id, x: CAND_X[id] - 16, y: DOT.y - len - 12, w: 32, h: len + 16, label: `${id} N arrow` };
  });
}

export function LiftFigure({ fig, a, tap, playing }: { fig: LiftFig; a: number; tap?: TapProps; playing: boolean }) {
  const { palette: p } = useTheme();
  const k = scaleFor(fig.m);
  const W = weight(fig.m);
  const N = normalInLift(fig.m, a);
  const nLen = useTween(N * k, STUB); // N grows out of the "?" stub, and follows the slider smoothly
  const nShown = useTween(N); // the number on the display counts to its new value
  const showW = fig.forces.includes('W');
  const showN = fig.forces.includes('N');
  const reading = fig.reading === 'shown' ? `${fixed(scaleKg(nShown), 1)} kg` : '- - -';
  const hasRight = showW || showN || !!fig.candidates || !!fig.motion || !!fig.showAcc;
  const motionDir = fig.motion ? (fig.motion.u !== 0 ? fig.motion.u : a) > 0 ? 'up' : 'down' : null;

  return (
    <Group>
      {/* with nothing to the right, the lift moves to the middle of the sheet */}
      <Group transform={hasRight ? undefined : 'translate(75 0)'}>
        <Shaft fig={fig} a={a} playing={playing} />
        {/* ── the lift ── */}
        {a <= -G + 1e-9 ? (
          // the cable has snapped: a short frayed end hangs from the roof
          <Path d="M95,30 L95,20 L91,16 M95,20 L99,15" stroke={p.draw} strokeWidth={2} fill="none" strokeLinecap="round" />
        ) : (
          <Line x1={95} y1={0} x2={95} y2={30} stroke={p.draw} strokeWidth={2} />
        )}
        <Rect x={24} y={30} width={142} height={212} fill="#FFFFFF" stroke={p.draw} strokeWidth={2.4} />
        <Line x1={24} y1={36} x2={166} y2={36} stroke={p.draw} strokeWidth={1} />
        <Hatch x1={24} x2={166} y={242} color={p.draw} />
        {/* scales with their display (kg, like real bathroom scales) */}
        <Rect x={50} y={212} width={90} height={30} rx={5} fill={p.drawFill} stroke={p.draw} strokeWidth={2} />
        <Rect x={60} y={217} width={70} height={20} rx={3} fill="#FFFFFF" stroke={p.draw} strokeWidth={1.2} />
        <MonoLabel x={95} y={231} text={reading} color={p.ink} size={11.5} />
        {/* the person, flat shapes with an ink outline */}
        <Circle cx={95} cy={84} r={14} fill={p.drawFill} stroke={p.draw} strokeWidth={2} />
        <Path d="M78,106 Q78,100 84,100 L106,100 Q112,100 112,106 L112,158 L78,158 Z" fill={p.drawFill} stroke={p.draw} strokeWidth={2} strokeLinejoin="round" />
        <Rect x={81} y={158} width={11} height={54} fill={p.drawFillDark} stroke={p.draw} strokeWidth={2} />
        <Rect x={98} y={158} width={11} height={54} fill={p.drawFillDark} stroke={p.draw} strokeWidth={2} />
        <CgMark x={95} y={134} color={p.draw} />
      </Group>

      {/* ── motion or acceleration, between the lift and the diagram ── */}
      {fig.motion && motionDir && (
        <Group>
          <MotionArrow x={MID_X} y={118} dir={motionDir} length={62} color={p.draw} />
          {splitLabel(fig.motion.text).map((line, i) => (
            <MonoLabel key={i} x={MID_X} y={168 + i * 12} text={line} color={p.label} size={9} />
          ))}
        </Group>
      )}
      {fig.showAcc && !fig.motion && Math.abs(a) > 1e-9 && (
        <Group>
          <AccChevrons x={MID_X} y={118} dir={a > 0 ? 'up' : 'down'} color={p.draw} />
          <MonoLabel x={MID_X} y={150} text="a" color={p.label} size={11} />
        </Group>
      )}

      {/* ── free-body diagram of the person ── */}
      {(showW || showN || fig.candidates) && (
        <Group>
          <MonoLabel x={DOT.x} y={252} text="FREE-BODY" color={p.label} size={9} />
          {showW && (
            <Group>
              <ForceArrow x1={DOT.x} y1={DOT.y} x2={DOT.x} y2={DOT.y + W * k} color={p.force} />
              <ForceLetter x={DOT.x - 12} y={DOT.y + W * k - 2} text="W" color={p.forceText} anchor="end" />
              {fig.values && <MonoLabel x={DOT.x + 12} y={DOT.y + W * k - 4} text={`${fixed(W, 0)} N`} color={p.forceText} anchor="start" />}
            </Group>
          )}
          {showN && !fig.unknownN && nLen > 0.5 && (
            <Group>
              <ForceArrow x1={DOT.x} y1={DOT.y} x2={DOT.x} y2={DOT.y - nLen} color={p.force} />
              <ForceLetter x={DOT.x - 12} y={DOT.y - nLen + 14} text="N" color={p.forceText} anchor="end" />
              {fig.values && <MonoLabel x={DOT.x + 12} y={DOT.y - nLen + 10} text={`${fixed(nShown, 0)} N`} color={p.forceText} anchor="start" />}
            </Group>
          )}
          {showN && !fig.unknownN && nLen <= 0.5 && fig.values && <MonoLabel x={DOT.x + 12} y={DOT.y - 6} text="N = 0" color={p.forceText} anchor="start" />}
          {showN && fig.unknownN && (
            <Group>
              <Line x1={DOT.x} y1={DOT.y} x2={DOT.x} y2={DOT.y - STUB} stroke={p.force} strokeWidth={2.6} strokeDasharray="4 4" />
              <ForceLetter x={DOT.x - 12} y={DOT.y - 20} text="N" color={p.forceText} anchor="end" />
              <ForceLetter x={DOT.x} y={DOT.y - 42} text="?" color={p.forceText} size={20} />
            </Group>
          )}
          {fig.candidates &&
            CANDIDATE_IDS.map((id) => {
              const len = W * k * CAND_K[id];
              const mark = tap?.marks?.[id];
              const on = tap?.selected === id;
              const color = mark === 'right' ? p.ok : mark === 'wrong' ? p.bad : on ? p.force : p.faint;
              return (
                <Group key={id}>
                  <ForceArrow x1={CAND_X[id]} y1={DOT.y} x2={CAND_X[id]} y2={DOT.y - len} color={color} dashed={!on && !mark} width={on || mark ? 3.2 : 2} />
                  <ForceLetter x={CAND_X[id]} y={DOT.y - len - 8} text="N" color={on || mark ? color : p.faint} size={13} />
                </Group>
              );
            })}
          {fig.candidates && <Line x1={222} y1={DOT.y} x2={322} y2={DOT.y} stroke={p.lineStrong} strokeWidth={1} strokeDasharray="2 3" />}
          <Circle cx={DOT.x} cy={DOT.y} r={5} fill={p.draw} />
        </Group>
      )}
    </Group>
  );
}

/**
 * The shaft walls on both sides of the car, with marks every MARK_GAP. When the lift moves, the marks slide
 * the other way by s(t) = ut + ½at² (the car stays in the middle of the drawing, like a camera riding with it).
 * The clip ends early if the lift would stop and turn back, so a "slowing down" lift never reverses.
 */
function Shaft({ fig, a, playing }: { fig: LiftFig; a: number; playing: boolean }) {
  const { palette: p } = useTheme();
  const u = fig.motion?.u ?? 0;
  const moves = liftMoves(fig, a);
  const stop = timeAtRest({ s0: 0, u, a });
  const length = moves ? Math.min(CLIP, stop !== null && stop > 0 ? stop : CLIP) : 0;
  const t = useLoopTime(playing && moves, length, `${u}/${a}`);
  const s = position(t, { s0: 0, u, a }); // metres travelled, up positive
  // the car goes up → the walls pass downward
  const offset = (((s * PX_PER_M) % MARK_GAP) + MARK_GAP) % MARK_GAP;
  const marks: number[] = [];
  for (let y = offset - MARK_GAP; y < LIFT_VB.h; y += MARK_GAP) if (y > -2) marks.push(y);
  return (
    <Group>
      {/* marks point inward, into the gap between wall and car, so labels outside stay clear */}
      {[{ x: 12, d: 7 }, { x: 178, d: -7 }].map(({ x, d }) => (
        <Group key={x}>
          <Line x1={x} y1={0} x2={x} y2={LIFT_VB.h} stroke={p.lineStrong} strokeWidth={1.2} />
          {marks.map((y, i) => (
            <Line key={i} x1={x} y1={y} x2={x + d} y2={y} stroke={p.lineStrong} strokeWidth={1.6} />
          ))}
        </Group>
      ))}
    </Group>
  );
}

/** "slowing down" → ["slowing", "down"]: two short lines fit between the lift and the diagram. */
function splitLabel(text: string): string[] {
  const i = text.indexOf(' ');
  return i < 0 ? [text] : [text.slice(0, i), text.slice(i + 1)];
}
