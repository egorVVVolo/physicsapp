// FIG: a person on bathroom scales in a lift (left) and the free-body diagram of the person (right). Style 3: big, with
// only what the physics needs (cable, car, floor, scales, person).
// Arrow lengths and the scales reading come from src/physics/dynamics (normalInLift, weight, scaleKg).
// A moving lift is shown by the shaft sliding past the car (ShaftMarks), driven on the UI thread by
// s = ut + ½at² from src/physics/kinematics, so it stays smooth even while React is busy.
// The first lift of a lesson draws itself: shaft → car → floor → scales → person → fills; the forces grow after that.
// A lift kept from the screen before (`prev`) changes state instead: arrows already there stay, new ones grow,
// N and the scales count from their old values to the new ones.
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { G as Group, Line, Rect, Circle, Text as SvgText } from 'react-native-svg';
import { svgLetter } from '@/theme/svgFont';
import { G, position, velocity } from '@/physics/kinematics';
import { normalInLift, scaleKg, weight } from '@/physics/dynamics';
import { fixed, signed } from '@/physics/format';
import { CANDIDATE_IDS, type LiftFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { CHANGE_DELAY, DRAWN_MS, STILL, useTween, useWave, type DrawClock } from './anim';
import { AccChevrons, DrawnFade, DrawnPath, ForceArrow, ForceLetter, MonoLabel, MotionArrow, rectPath, useLineStep } from './draw';
import { Person } from './people';
import { type TapProps, type TapTarget } from './Sheet';
import { stage } from './kit';

export const LIFT_VB = { w: 340, h: 300 };

const DOT = { x: 272, y: 158 }; // the particle of the free-body diagram
const MID_X = 206; // motion / acceleration marks, between the lift and the diagram
const CAND_X: Record<(typeof CANDIDATE_IDS)[number], number> = { shorter: 238, equal: 272, longer: 306 };
const CAND_K: Record<(typeof CANDIDATE_IDS)[number], number> = { shorter: 0.6, equal: 1, longer: 1.4 };
const STUB = 34; // length of the dashed "N = ?" stub

// The car and what stands in it
const CAR = { x: 22, y: 34, w: 146, h: 252 }; // floor at y = 286
const FLOOR = CAR.y + CAR.h;
const CX = CAR.x + CAR.w / 2;
const PAD = { w: 122, h: 38 }; // the scales: one block with its display
const SOLES = FLOOR - PAD.h;
const PERSON_S = 1.48;

// when the pen draws each part, as shares of the draw-in
const PEN = {
  wallL: [0, 0.14],
  wallR: [0.04, 0.18],
  cable: [0.1, 0.2],
  car: [0.14, 0.34],
  ceiling: [0.3, 0.38],
  floor: [0.3, 0.44],
  rail: [0.34, 0.42],
  scales: [0.4, 0.52],
  person: [0.46, 0.64],
  motion: [0.6, 0.7],
  marks: [0.8, 0.95], // acceleration chevrons, the dot of the diagram, the dashed candidates
} as const;

/** Pixels per newton: the longest N the slider can make (a = +3 m s⁻²) fits above the dot. */
const scaleFor = (m: number) => 114 / (m * (G + 3));

/** True when the figure shows a moving lift (the shaft slides, a pause button appears). */
export function liftMoves(fig: LiftFig, a: number): boolean {
  return !!fig.motion || Math.abs(a) > 1e-9;
}

/** With nothing drawn to the right, the lift sits in the middle of the sheet. */
export function liftShiftX(fig: LiftFig): number {
  if (fig.forces.length > 0 || fig.candidates) return 0;
  // with only an arrow and its words beside the car, the two stand in the middle together
  return fig.motion || fig.showAcc ? 42 : 75;
}

/** The values written in the sheet header. On an explore screen `a` is on the slider, so it is left out. */
export function liftParams(fig: LiftFig, a: number, live: boolean): string {
  return `m = ${fig.m} kg` + (fig.showG ? `, g = ${G} N kg⁻¹` : '') + (fig.showAcc && !live ? `, a = ${signed(a, 1)} m s⁻²` : '');
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

type LiftProps = {
  fig: LiftFig;
  a: number;
  tap?: TapProps;
  clock?: DrawClock;
  /** The lift the screen before showed (with its live a), when this sheet is kept from it. */
  prev?: LiftFig;
  /** How far the lift stands right of its usual place (eased by the sheet); defaults to liftShiftX(fig). */
  shift?: number;
};

export function LiftFigure({ fig, a, tap, clock = STILL, prev, shift: shiftNow }: LiftProps) {
  const { palette: p, stroke, pick } = useTheme();
  const step9 = useLineStep(9); // two-line labels: the distance between their lines
  const drawing = clock.on;
  const line = (d: string, len: number, pen: readonly [number, number], color: string, width: number, cap?: 'round') => (
    <DrawnPath clock={clock} len={len} from={pen[0]} to={pen[1]} d={d} stroke={color} strokeWidth={width} strokeLinecap={cap} fill="none" />
  );
  const k = scaleFor(fig.m);
  const W = weight(fig.m);
  const N = normalInLift(fig.m, a);
  const showW = fig.forces.includes('W');
  const showN = fig.forces.includes('N');
  const motionDir = fig.motion ? ((fig.motion.u !== 0 ? fig.motion.u : a) > 0 ? 'up' : 'down') : null;
  const shift = shiftNow ?? liftShiftX(fig);
  // while a kept lift glides aside, what appears beside it fades in as the room opens up
  const room = Math.max(0, Math.min(1, 1 - (shift - liftShiftX(fig)) / 30));
  // where the arrows and the reading start: grown already if the screen before showed them
  const prevK = prev ? scaleFor(prev.m) : 0;
  const wFrom = prev?.forces.includes('W') ? weight(prev.m) * prevK : 0;
  const nPrev = prev?.forces.includes('N') && !prev.unknownN ? normalInLift(prev.m, prev.a) : undefined;
  const readingFrom = prev?.reading === 'shown' ? normalInLift(prev.m, prev.a) : undefined;

  return (
    <Group>
      <Group transform={shift ? `translate(${shift} 0)` : undefined}>
        {/* shaft walls; their marks slide in ShaftMarks, drawn over the SVG */}
        {line(`M10,0 V${LIFT_VB.h}`, LIFT_VB.h, PEN.wallL, p.lineStrong, pick(stroke.thin, 1.4))}
        {line(`M180,0 V${LIFT_VB.h}`, LIFT_VB.h, PEN.wallR, p.lineStrong, pick(stroke.thin, 1.4))}
        {/* cable, or its frayed end when it has snapped */}
        {a <= -G + 1e-9
          ? line(`M${CX},${CAR.y} L${CX},20 L${CX - 4},16 M${CX},20 L${CX + 4},15`, 24, PEN.cable, p.draw, pick(stroke.body, 2), 'round')
          : line(`M${CX},0 V${CAR.y}`, CAR.y, PEN.cable, p.draw, pick(stroke.body, 2))}
        {/* the car: a plain outline, a heavier floor line */}
        <DrawnPath clock={clock} len={2 * (CAR.w + CAR.h)} from={PEN.car[0]} to={PEN.car[1]} d={rectPath(CAR.x, CAR.y, CAR.w, CAR.h, 12).d} fill="none" stroke={p.ink} strokeWidth={1.8} />
        <Display fig={fig} n={N} clock={clock} from={readingFrom} />
        <Person x={CX} y={SOLES} scale={PERSON_S} clock={clock} pen={PEN.person} />
        {fig.nOnPerson && <NOnPerson drawing={drawing} />}
      </Group>

      {/* ── motion or acceleration, between the lift and the diagram ── */}
      {/* the arrow stands beside the car, so it moves aside with it */}
      {fig.motion && motionDir && (
        <Group opacity={room} transform={`translate(${shift} 0)`}>
          <MotionArrow x={MID_X} y={134} dir={motionDir} length={72} color={p.draw} clock={clock} pen={PEN.motion} />
          {splitLabel(fig.motion.text).map((line, i) => (
            <MonoLabel key={i} x={MID_X} y={192 + i * step9} text={line} color={p.label} size={9} />
          ))}
        </Group>
      )}
      {fig.showAcc && !fig.motion && Math.abs(a) > 1e-9 && (
        <Group opacity={room} transform={`translate(${shift} 0)`}>
          {stage(clock, PEN.marks, <DriftingChevrons x={MID_X} y={134} dir={a > 0 ? 'up' : 'down'} color={p.draw} />)}
          <MonoLabel x={MID_X} y={170} text="a" color={p.label} size={11} />
        </Group>
      )}

      {/* ── free-body diagram of the person ── */}
      {(showW || showN || fig.candidates) && (
        <Group opacity={room}>
          <MonoLabel x={DOT.x} y={292} text="forces on you" color={p.label} size={9} />
          {showW && <WForce len={W * k} w={W} values={!!fig.values} drawing={drawing} from={wFrom} kept={!!prev} />}
          {showN && !fig.unknownN && <NForce n={N} k={k} values={!!fig.values} drawing={drawing} from={nPrev} fromK={prevK} kept={!!prev} />}
          {showN && fig.unknownN && (
            <DrawnFade clock={clock} from={PEN.marks[0]} to={PEN.marks[1]}>
              <Line x1={DOT.x} y1={DOT.y} x2={DOT.x} y2={DOT.y - STUB} stroke={p.force} strokeWidth={stroke.force} strokeDasharray="4 4" />
              <ForceLetter x={DOT.x - 12} y={DOT.y - 20} text="N" color={p.forceText} anchor="end" />
              <ForceLetter x={DOT.x} y={DOT.y - 42} text="?" color={p.forceText} size={20} />
            </DrawnFade>
          )}
          {fig.candidates &&
            CANDIDATE_IDS.map((id) => {
              const len = W * k * CAND_K[id];
              const mark = tap?.marks?.[id];
              const on = tap?.selected === id;
              const color = mark === 'right' ? p.ok : mark === 'wrong' ? p.bad : on ? p.force : p.faint;
              return (
                <DrawnFade key={id} clock={clock} from={PEN.marks[0]} to={PEN.marks[1]}>
                  <ForceArrow x1={CAND_X[id]} y1={DOT.y} x2={CAND_X[id]} y2={DOT.y - len} color={color} dashed={!on && !mark} width={on || mark ? 3.2 : 2} />
                  <ForceLetter x={CAND_X[id]} y={DOT.y - len - 8} text="N" color={on || mark ? color : p.faint} size={13} />
                </DrawnFade>
              );
            })}
          {fig.candidates && stage(clock, PEN.marks, <Line x1={222} y1={DOT.y} x2={322} y2={DOT.y} stroke={p.lineStrong} strokeWidth={stroke.thin} strokeDasharray="2 3" />)}
          {stage(clock, PEN.marks, <Circle cx={DOT.x} cy={DOT.y} r={5} fill={p.draw} />)}
        </Group>
      )}
    </Group>
  );
}

/**
 * Where N acts: a dot in the middle of the soles (where the scales touch you) and a short N arrow up from it.
 * It only marks the point and the direction: its length is fixed, and W is not drawn on the person to compare with,
 * so it gives nothing away about the size of N.
 */
function NOnPerson({ drawing }: { drawing: boolean }) {
  const { palette: p, material: m } = useTheme();
  // on a lift that draws itself it grows out of the soles once the drawing is done; otherwise it is simply there
  const [from] = useState(drawing ? 0 : 34); // decided once: it must not jump when the drawing ends
  const len = useTween(34, from, 420, DRAWN_MS);
  if (len < 1) return null;
  return (
    <Group>
      <ForceArrow x1={CX} y1={SOLES} x2={CX} y2={SOLES - len} color={p.page} width={8} />
      <ForceArrow x1={CX} y1={SOLES} x2={CX} y2={SOLES - len} color={p.force} />
      <Circle cx={CX} cy={SOLES} r={3.6} fill={p.force} stroke={p.page} strokeWidth={stroke.thin} />
      <ForceLetter x={CX + 30} y={SOLES - 12} text="N" color={p.forceText} size={15} />
      <Line x1={CX + 24} y1={SOLES - 16} x2={CX + 5} y2={SOLES - 18} stroke={p.forceText} strokeWidth={stroke.thin} />
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
function Display({ fig, n, clock, from }: { fig: LiftFig; n: number; clock: DrawClock; from?: number }) {
  const shown = useTween(n, from, 360, from !== undefined ? CHANGE_DELAY : 0);
  const reading = fig.reading === 'shown' ? `${fixed(scaleKg(shown), 1)} kg` : '– – –';
  return <Pad reading={reading} clock={clock} />;
}

/** The scales as one soft block with a white display. */
function Pad({ reading, clock }: { reading: string; clock: DrawClock }) {
  const { palette: p, soft } = useTheme();
  return (
    <DrawnFade clock={clock} from={PEN.scales[0]} to={PEN.scales[1]}>
      <Rect x={CX - PAD.w / 2} y={SOLES} width={PAD.w} height={PAD.h} rx={9} fill={soft.metal.fill} stroke={soft.metal.edge} strokeWidth={1.8} />
      <Rect x={CX - 40} y={SOLES + 7} width={80} height={24} rx={7} fill={soft.paper} />
      <SvgText x={CX} y={SOLES + 24.5} fontSize={16} fontFamily={svgLetter} fill={p.ink} textAnchor="middle">
        {reading}
      </SvgText>
    </DrawnFade>
  );
}

/** The W arrow of the free-body diagram: grows out of the dot when the figure appears (from `from` on a kept sheet). */
function WForce({ len: full, w, values, drawing, from, kept }: { len: number; w: number; values: boolean; drawing: boolean; from: number; kept: boolean }) {
  const { palette: p, material: m } = useTheme();
  const [delay] = useState(drawing ? DRAWN_MS : kept ? CHANGE_DELAY : 380); // decided once, when the arrow appears
  const len = useTween(full, from, 560, delay);
  if (len < 1) return null;
  return (
    <Group>
      <ForceArrow x1={DOT.x} y1={DOT.y} x2={DOT.x} y2={DOT.y + len} color={p.force} />
      <ForceLetter x={DOT.x - 12} y={DOT.y + len - 2} text="W" color={p.forceText} anchor="end" />
      {values && <MonoLabel x={DOT.x + 12} y={DOT.y + len - 4} text={`${fixed(w, 0)} N`} color={p.forceText} anchor="start" />}
    </Group>
  );
}

/**
 * The N arrow of the free-body diagram: grows out of the "?" stub, then follows N smoothly.
 * On a kept sheet that already showed N (`from`, drawn at scale `fromK`) it changes from that length instead.
 */
type NProps = { n: number; k: number; values: boolean; drawing: boolean; from?: number; fromK: number; kept: boolean };
function NForce({ n, k, values, drawing, from, fromK, kept }: NProps) {
  const { palette: p, material: m } = useTheme();
  const [delay] = useState(drawing ? DRAWN_MS + 140 : kept ? CHANGE_DELAY : 520); // decided once, when the arrow appears
  const len = useTween(n * k, from !== undefined ? from * fromK : STUB, 520, delay);
  const shown = useTween(n, from, 360, from !== undefined ? CHANGE_DELAY : 0);
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
type ShaftProps = { fig: LiftFig; a: number; scale: number; playing: boolean; clock?: DrawClock; shift?: number };
export function ShaftMarks({ fig, a, scale, playing, clock = STILL, shift: shiftNow }: ShaftProps) {
  const { palette: p, material: m } = useTheme();
  // while the lift draws itself the marks fade in with the walls and the shaft stays still
  const full = useSharedValue(1);
  const pen = clock.on ? clock.t : full;
  const fade = useAnimatedStyle(() => ({ opacity: Math.min(1, Math.max(0, (pen.get() - 0.12) / 0.18)) }));
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
    frame.setActive(playing && !clock.on);
  }, [playing, clock.on, frame]);

  const slide = useAnimatedStyle(() => {
    const off = (((s.get() * PX_PER_M) % PERIOD) + PERIOD) % PERIOD; // the car goes up → the walls pass downward
    return { transform: [{ translateY: off * scale }] };
  });

  const H = LIFT_VB.h + PERIOD;
  const shift = shiftNow ?? liftShiftX(fig);
  const strip = (x0: number, inward: 1 | -1) => {
    const edge = inward === 1 ? 0 : STRIP_W; // the wall side of the strip
    const marks = [];
    for (let y = 0; y <= H; y += PX_PER_M) {
      marks.push(
        y % PERIOD === 0 ? (
          <Rect key={y} x={0} y={y - 1.5} width={STRIP_W} height={3} fill={p.lineStrong} />
        ) : (
          <Line key={y} x1={edge} y1={y} x2={edge + inward * 5} y2={y} stroke={p.lineStrong} strokeWidth={stroke.thin} />
        ),
      );
    }
    return (
      <Animated.View key={x0} pointerEvents="none" style={[styles.strip, { left: (x0 + shift) * scale, width: STRIP_W * scale, height: LIFT_VB.h * scale }, fade]}>
        <Animated.View style={[{ position: 'absolute', left: 0, top: -PERIOD * scale, width: STRIP_W * scale, height: H * scale }, slide]}>
          <Svg width={STRIP_W * scale} height={H * scale} viewBox={`0 0 ${STRIP_W} ${H}`}>
            {marks}
          </Svg>
        </Animated.View>
      </Animated.View>
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
