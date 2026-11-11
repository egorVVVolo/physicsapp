// FIG: a person on bathroom scales in a lift (left) and the free-body diagram of the person (right).
// Arrow lengths and the scales reading come from src/physics/dynamics (normalInLift, weight).
import { G as Group, Line, Rect, Circle, Path } from 'react-native-svg';
import { G } from '@/physics/kinematics';
import { normalInLift, weight } from '@/physics/dynamics';
import { fixed, signed } from '@/physics/format';
import { CANDIDATE_IDS, type LiftFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { AccChevrons, CgMark, ForceArrow, ForceLetter, Hatch, MonoLabel, MotionArrow } from './draw';
import { type TapProps, type TapTarget } from './Sheet';

export const LIFT_VB = { w: 340, h: 260 };

const DOT = { x: 272, y: 138 }; // the particle of the free-body diagram
const CAND_X: Record<(typeof CANDIDATE_IDS)[number], number> = { shorter: 238, equal: 272, longer: 306 };
const CAND_K: Record<(typeof CANDIDATE_IDS)[number], number> = { shorter: 0.6, equal: 1, longer: 1.4 };

/** Pixels per newton: the longest N the slider can make (a = +3 m s⁻²) fits above the dot. */
const scaleFor = (m: number) => 100 / (m * (G + 3));

export function liftParams(fig: LiftFig, a: number): string {
  return `m = ${fig.m} kg` + (fig.showAcc ? `, a = ${signed(a, 1)} m s⁻²` : '');
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

export function LiftFigure({ fig, a, tap }: { fig: LiftFig; a: number; tap?: TapProps }) {
  const { palette: p } = useTheme();
  const k = scaleFor(fig.m);
  const W = weight(fig.m);
  const N = normalInLift(fig.m, a);
  const showW = fig.forces.includes('W');
  const showN = fig.forces.includes('N');
  const reading = fig.showReading ? `${fixed(N, 0)} N` : '- - -';
  const hasRight = showW || showN || !!fig.candidates || !!fig.motion || !!fig.showAcc;

  return (
    <Group>
      {/* with nothing to the right, the lift moves to the middle of the sheet */}
      <Group transform={hasRight ? undefined : 'translate(75 0)'}>
      {/* ── the lift ── */}
      {a <= -G + 1e-9 ? (
        // the cable has snapped: a short frayed end hangs from the roof
        <Path d="M95,30 L95,20 L91,16 M95,20 L99,15" stroke={p.draw} strokeWidth={2} fill="none" strokeLinecap="round" />
      ) : (
        <Line x1={95} y1={0} x2={95} y2={30} stroke={p.draw} strokeWidth={2} />
      )}
      <Rect x={24} y={30} width={142} height={212} fill="#FFFFFF" stroke={p.draw} strokeWidth={2.4} />
      <Line x1={24} y1={36} x2={166} y2={36} stroke={p.draw} strokeWidth={1} />
      <MonoLabel x={30} y={52} text="LIFT" color={p.label} anchor="start" size={9} />
      <Hatch x1={24} x2={166} y={242} color={p.draw} />
      {/* scales with their display */}
      <Rect x={55} y={214} width={80} height={28} rx={5} fill={p.drawFill} stroke={p.draw} strokeWidth={2} />
      <Rect x={68} y={219} width={54} height={18} rx={3} fill="#FFFFFF" stroke={p.draw} strokeWidth={1.2} />
      <MonoLabel x={95} y={232} text={reading} color={p.ink} size={11} />
      {/* the person, flat shapes with an ink outline */}
      <Circle cx={95} cy={86} r={14} fill={p.drawFill} stroke={p.draw} strokeWidth={2} />
      <Path d="M78,108 Q78,102 84,102 L106,102 Q112,102 112,108 L112,160 L78,160 Z" fill={p.drawFill} stroke={p.draw} strokeWidth={2} strokeLinejoin="round" />
      <Rect x={81} y={160} width={11} height={54} fill={p.drawFillDark} stroke={p.draw} strokeWidth={2} />
      <Rect x={98} y={160} width={11} height={54} fill={p.drawFillDark} stroke={p.draw} strokeWidth={2} />
      <CgMark x={95} y={136} color={p.draw} />
      </Group>

      {/* ── motion or acceleration, between the lift and the diagram ── */}
      {fig.motion && (
        <Group>
          <MotionArrow x={196} y={118} dir={fig.motion.dir} length={62} color={p.draw} />
          {splitLabel(fig.motion.text).map((line, i) => (
            <MonoLabel key={i} x={196} y={168 + i * 12} text={line} color={p.label} size={9} />
          ))}
        </Group>
      )}
      {fig.showAcc && !fig.motion && (
        <Group>
          {Math.abs(a) > 1e-9 ? <AccChevrons x={196} y={118} dir={a > 0 ? 'up' : 'down'} color={p.draw} /> : <MonoLabel x={196} y={122} text="a = 0" color={p.label} size={10} />}
          {Math.abs(a) > 1e-9 && <MonoLabel x={196} y={150} text="a" color={p.label} size={11} />}
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
              {fig.showReading && <MonoLabel x={DOT.x + 12} y={DOT.y + W * k - 4} text={`${fixed(W, 0)} N`} color={p.forceText} anchor="start" />}
            </Group>
          )}
          {showN && !fig.unknownN && N > 0.5 && (
            <Group>
              <ForceArrow x1={DOT.x} y1={DOT.y} x2={DOT.x} y2={DOT.y - N * k} color={p.force} />
              <ForceLetter x={DOT.x - 12} y={DOT.y - N * k + 14} text="N" color={p.forceText} anchor="end" />
              {fig.showReading && <MonoLabel x={DOT.x + 12} y={DOT.y - N * k + 10} text={`${fixed(N, 0)} N`} color={p.forceText} anchor="start" />}
            </Group>
          )}
          {showN && fig.unknownN && (
            <Group>
              <Line x1={DOT.x} y1={DOT.y} x2={DOT.x} y2={DOT.y - 34} stroke={p.force} strokeWidth={2.6} strokeDasharray="4 4" />
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

/** "slowing down" → ["slowing", "down"]: two short lines fit between the lift and the diagram. */
function splitLabel(text: string): string[] {
  const i = text.indexOf(' ');
  return i < 0 ? [text] : [text.slice(0, i), text.slice(i + 1)];
}
