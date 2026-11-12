// FIG: a person on bathroom scales in a lift (left) and the free-body diagram of the person (right).
// Arrow lengths and the scales reading come from src/physics/dynamics (normalInLift, weight, scaleKg).
// A moving lift is shown by the shaft sliding past the car (ShaftMarks), driven on the UI thread by
// s = ut + ½at² from src/physics/kinematics, so it stays smooth even while React is busy.
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { G as Group, Line, Rect, Path, Circle, Polygon } from 'react-native-svg';
import { G, position, velocity } from '@/physics/kinematics';
import { normalInLift, scaleKg, weight } from '@/physics/dynamics';
import { fixed, signed } from '@/physics/format';
import { CANDIDATE_IDS, type LiftFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { useTween, useWave } from './anim';
import { AccChevrons, ForceArrow, ForceLetter, Hatch, MonoLabel, MotionArrow } from './draw';
import { Person, Scales, SCALES_H } from './people';
import { type TapProps, type TapTarget } from './Sheet';

export const LIFT_VB = { w: 340, h: 260 };

const DOT = { x: 272, y: 138 }; // the particle of the free-body diagram
const MID_X = 206; // motion / acceleration marks, between the lift and the diagram
const CAND_X: Record<(typeof CANDIDATE_IDS)[number], number> = { shorter: 238, equal: 272, longer: 306 };
const CAND_K: Record<(typeof CANDIDATE_IDS)[number], number> = { shorter: 0.6, equal: 1, longer: 1.4 };
const STUB = 34; // length of the dashed "N = ?" stub

// The car and what stands in it
const CAR = { x: 24, y: 30, w: 142, h: 212 }; // floor at y = 242
const FLOOR = CAR.y + CAR.h;
const CX = CAR.x + CAR.w / 2;
const SOLES = FLOOR - SCALES_H + 3; // the soles stand on the middle of the top face

/** Pixels per newton: the longest N the slider can make (a = +3 m s⁻²) fits above the dot. */
const scaleFor = (m: number) => 100 / (m * (G + 3));

/** True when the figure shows a moving lift (the shaft slides, a pause button appears). */
export function liftMoves(fig: LiftFig, a: number): boolean {
  return !!fig.motion || Math.abs(a) > 1e-9;
}

/** With nothing drawn to the right, the lift sits in the middle of the sheet. */
export function liftShiftX(fig: LiftFig): number {
  const hasRight = fig.forces.length > 0 || !!fig.candidates || !!fig.motion || !!fig.showAcc;
  return hasRight ? 0 : 75;
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

export function LiftFigure({ fig, a, tap }: { fig: LiftFig; a: number; tap?: TapProps }) {
  const { palette: p } = useTheme();
  const k = scaleFor(fig.m);
  const W = weight(fig.m);
  const N = normalInLift(fig.m, a);
  const showW = fig.forces.includes('W');
  const showN = fig.forces.includes('N');
  const motionDir = fig.motion ? ((fig.motion.u !== 0 ? fig.motion.u : a) > 0 ? 'up' : 'down') : null;
  const shift = liftShiftX(fig);

  return (
    <Group>
      <Group transform={shift ? `translate(${shift} 0)` : undefined}>
        {/* shaft walls; their marks slide in ShaftMarks, drawn over the SVG */}
        <Line x1={10} y1={0} x2={10} y2={LIFT_VB.h} stroke={p.lineStrong} strokeWidth={1.4} />
        <Line x1={180} y1={0} x2={180} y2={LIFT_VB.h} stroke={p.lineStrong} strokeWidth={1.4} />
        {/* cable, or its frayed end when it has snapped */}
        {a <= -G + 1e-9 ? (
          <Path d={`M${CX},${CAR.y} L${CX},20 L${CX - 4},16 M${CX},20 L${CX + 4},15`} stroke={p.draw} strokeWidth={2} fill="none" strokeLinecap="round" />
        ) : (
          <Line x1={CX} y1={0} x2={CX} y2={CAR.y} stroke={p.draw} strokeWidth={2} />
        )}
        {/* the car: white box, a ceiling strip, the floor indicator and a handrail on the back wall */}
        <Rect x={CAR.x} y={CAR.y} width={CAR.w} height={CAR.h} fill="#FFFFFF" stroke={p.draw} strokeWidth={2.4} />
        <Rect x={CAR.x} y={CAR.y} width={CAR.w} height={6} fill={p.drawFill} stroke={p.draw} strokeWidth={1.2} />
        <Rect x={CX - 14} y={CAR.y + 12} width={28} height={13} rx={3} fill={p.ink} />
        {motionDir ? (
          <Polygon points={motionDir === 'up' ? `${CX - 5},${CAR.y + 22} ${CX + 5},${CAR.y + 22} ${CX},${CAR.y + 15}` : `${CX - 5},${CAR.y + 15} ${CX + 5},${CAR.y + 15} ${CX},${CAR.y + 22}`} fill="#FFFFFF" />
        ) : (
          <Line x1={CX - 5} y1={CAR.y + 18.5} x2={CX + 5} y2={CAR.y + 18.5} stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
        )}
        <Line x1={CAR.x + 8} y1={148} x2={CAR.x + CAR.w - 8} y2={148} stroke={p.lineStrong} strokeWidth={3} strokeLinecap="round" />
        <Line x1={CAR.x + 14} y1={148} x2={CAR.x + 14} y2={155} stroke={p.lineStrong} strokeWidth={2} />
        <Line x1={CAR.x + CAR.w - 14} y1={148} x2={CAR.x + CAR.w - 14} y2={155} stroke={p.lineStrong} strokeWidth={2} />
        <Hatch x1={CAR.x} x2={CAR.x + CAR.w} y={FLOOR} color={p.draw} />
        <Display fig={fig} n={N} />
        <Person x={CX} y={SOLES} />
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
          <DriftingChevrons x={MID_X} y={118} dir={a > 0 ? 'up' : 'down'} color={p.draw} />
          <MonoLabel x={MID_X} y={150} text="a" color={p.label} size={11} />
        </Group>
      )}

      {/* ── free-body diagram of the person ── */}
      {(showW || showN || fig.candidates) && (
        <Group>
          <MonoLabel x={DOT.x} y={252} text="FREE-BODY" color={p.label} size={9} />
          {showW && <WForce len={W * k} w={W} values={!!fig.values} />}
          {showN && !fig.unknownN && <NForce n={N} k={k} values={!!fig.values} />}
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

/** The acceleration chevrons drift a little in the direction of a, endlessly: the acceleration does not stop. */
function DriftingChevrons({ x, y, dir, color }: { x: number; y: number; dir: 'up' | 'down'; color: string }) {
  const w = useWave(1.4);
  const shift = (dir === 'up' ? -1 : 1) * 2.5 * w;
  return <AccChevrons x={x} y={y + shift} dir={dir} color={color} />;
}

/** The scales with their display. The number counts smoothly to a new value (its own component, so only it re-renders). */
function Display({ fig, n }: { fig: LiftFig; n: number }) {
  const shown = useTween(n, undefined, 360);
  const reading = fig.reading === 'shown' ? `${fixed(scaleKg(shown), 1)} kg` : '- - -';
  return <Scales x={CX} y={FLOOR} reading={reading} />;
}

/** The W arrow of the free-body diagram: grows out of the dot when the figure appears. */
function WForce({ len: full, w, values }: { len: number; w: number; values: boolean }) {
  const { palette: p } = useTheme();
  const len = useTween(full, 0, 560, 380);
  if (len < 1) return null;
  return (
    <Group>
      <ForceArrow x1={DOT.x} y1={DOT.y} x2={DOT.x} y2={DOT.y + len} color={p.force} />
      <ForceLetter x={DOT.x - 12} y={DOT.y + len - 2} text="W" color={p.forceText} anchor="end" />
      {values && <MonoLabel x={DOT.x + 12} y={DOT.y + len - 4} text={`${fixed(w, 0)} N`} color={p.forceText} anchor="start" />}
    </Group>
  );
}

/** The N arrow of the free-body diagram: grows out of the "?" stub, then follows N smoothly. */
function NForce({ n, k, values }: { n: number; k: number; values: boolean }) {
  const { palette: p } = useTheme();
  const len = useTween(n * k, STUB, 520, 520);
  const shown = useTween(n, undefined, 360);
  if (len <= 0.5) return values ? <MonoLabel x={DOT.x + 12} y={DOT.y - 6} text="N = 0" color={p.forceText} anchor="start" /> : null;
  return (
    <Group>
      <ForceArrow x1={DOT.x} y1={DOT.y} x2={DOT.x} y2={DOT.y - len} color={p.force} />
      <ForceLetter x={DOT.x - 12} y={DOT.y - len + 14} text="N" color={p.forceText} anchor="end" />
      {values && <MonoLabel x={DOT.x + 12} y={DOT.y - len + 10} text={`${fixed(shown, 0)} N`} color={p.forceText} anchor="start" />}
    </Group>
  );
}

// ── The sliding shaft ─────────────────────────────────────────────────────────────────────
const PX_PER_M = 20; // viewBox units per metre of travel
const PERIOD = 60; // one floor = 3 m: a slab every 60 units, a tick every metre
const V_CAP = 3; // m s⁻¹: above this the marks would blur into a flicker, so the shaft speed stops growing here
const HOLD = 0.6; // s a braking lift waits at rest before it moves off again
const RAMP = 0.45; // s it takes to get back up to its starting speed
const STRIP_W = 12;

/**
 * The marks on both shaft walls, laid over the SVG. They never fade or jump: the motion is continuous.
 * Each frame (on the UI thread) the velocity changes by a·dt and the marks move by s = ut + ½at² (exact for constant a).
 * A speeding-up lift gains speed until V_CAP and then keeps it (a cartoon limit, the chevrons still show a).
 * A braking lift (a against u) stops exactly where v = 0, rests, then eases back up to u and brakes again.
 * On an explore screen `a` eases to the slider value; with a = 0 the lift keeps the speed it has (steady motion).
 */
export function ShaftMarks({ fig, a, scale, playing }: { fig: LiftFig; a: number; scale: number; playing: boolean }) {
  const { palette: p } = useTheme();
  const u0 = fig.motion?.u ?? 0;
  const brakes = u0 !== 0 && a * u0 < 0; // e.g. moving up and slowing down
  const cap = Math.max(V_CAP, Math.abs(u0));
  const accel = useSharedValue(a);
  const s = useSharedValue(0);
  const v = useSharedValue(u0);
  const phase = useSharedValue(0); // 0 moving, 1 resting (braking lift), 2 easing back up to u0
  const phaseT = useSharedValue(0);

  useEffect(() => {
    accel.set(withTiming(a, { duration: 260 }));
  }, [a, accel]);

  const frame = useFrameCallback((info) => {
    'worklet';
    const dt = Math.min(0.05, (info.timeSincePreviousFrame ?? 16) / 1000);
    const acc = accel.get();
    const ph = phase.get();
    const vv = v.get();
    phaseT.set(phaseT.get() + dt);
    if (ph === 1) {
      if (phaseT.get() >= HOLD) {
        phase.set(2);
        phaseT.set(0);
      }
      return;
    }
    if (ph === 2) {
      // ease from rest back to u0 (smoothstep), the marks keep their place: no jump
      const k = Math.min(1, phaseT.get() / RAMP);
      const vn = u0 * k * k * (3 - 2 * k);
      s.set(s.get() + ((vv + vn) / 2) * dt);
      v.set(vn);
      if (k >= 1) {
        phase.set(0);
        phaseT.set(0);
      }
      return;
    }
    let vn = velocity(dt, { s0: 0, u: vv, a: acc });
    if (brakes && vn * u0 <= 0) {
      // the braking lift reaches rest inside this frame: stop exactly where v = 0
      s.set(s.get() + (acc !== 0 ? (-vv * vv) / (2 * acc) : 0));
      v.set(0);
      phase.set(1);
      phaseT.set(0);
      return;
    }
    if (Math.abs(vn) > cap) {
      vn = Math.sign(vn) * cap;
      s.set(s.get() + ((vv + vn) / 2) * dt);
    } else {
      s.set(s.get() + position(dt, { s0: 0, u: vv, a: acc }));
    }
    v.set(vn);
  }, false);

  useEffect(() => {
    frame.setActive(playing);
  }, [playing, frame]);

  const slide = useAnimatedStyle(() => {
    const off = (((s.get() * PX_PER_M) % PERIOD) + PERIOD) % PERIOD; // the car goes up → the walls pass downward
    return { transform: [{ translateY: off * scale }] };
  });

  const H = LIFT_VB.h + PERIOD;
  const shift = liftShiftX(fig);
  const strip = (x0: number, inward: 1 | -1) => {
    const edge = inward === 1 ? 0 : STRIP_W; // the wall side of the strip
    const marks = [];
    for (let y = 0; y <= H; y += PX_PER_M) {
      marks.push(
        y % PERIOD === 0 ? (
          <Rect key={y} x={0} y={y - 1.5} width={STRIP_W} height={3} fill={p.lineStrong} />
        ) : (
          <Line key={y} x1={edge} y1={y} x2={edge + inward * 5} y2={y} stroke={p.lineStrong} strokeWidth={1.4} />
        ),
      );
    }
    return (
      <View key={x0} pointerEvents="none" style={[styles.strip, { left: (x0 + shift) * scale, width: STRIP_W * scale, height: LIFT_VB.h * scale }]}>
        <Animated.View style={[{ position: 'absolute', left: 0, top: -PERIOD * scale, width: STRIP_W * scale, height: H * scale }, slide]}>
          <Svg width={STRIP_W * scale} height={H * scale} viewBox={`0 0 ${STRIP_W} ${H}`}>
            {marks}
          </Svg>
        </Animated.View>
      </View>
    );
  };
  // left strip from the left wall (x 10) inward; right strip ends at the right wall (x 180)
  return (
    <>
      {strip(10, 1)}
      {strip(180 - STRIP_W, -1)}
    </>
  );
}

const styles = StyleSheet.create({
  strip: { position: 'absolute', top: 0, overflow: 'hidden' },
});

/** "slowing down" → ["slowing", "down"]: two short lines fit between the lift and the diagram. */
function splitLabel(text: string): string[] {
  const i = text.indexOf(' ');
  return i < 0 ? [text] : [text.slice(0, i), text.slice(i + 1)];
}
