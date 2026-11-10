// The scene: a hot-air balloon, the sandbag, and the numbers that belong on the picture.
// Everything is drawn with react-native-svg on a dark stage. The balloon always sways a little and
// its flame flickers (unless the phone asks for reduced motion). Model time comes in as `t`.
//
// Units: the picture is in screen points. "Origin" of the balloon = the bottom of the hanging sandbag,
// so the sandbag's height in metres is also the balloon's origin height.
import { useState } from 'react';
import { Platform } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedReaction,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Ellipse, G, Line, Path, Rect, Text } from 'react-native-svg';
import type { Highlight, Playback, SceneSetup } from '@/content/types';
import { fixed } from '@/physics/format';
import { position, trackPosition, trackVelocity, type Track } from '@/physics/kinematics';
import { useTheme } from '@/theme/ThemeContext';
import type { Palette } from '@/theme/tokens';
import { svgFont } from '@/theme/svgFont';

/** Outline of the balloon envelope, in balloon units (origin: bottom of the sandbag, up is negative). */
const ENVELOPE = 'M0,-238 C56,-238 64,-186 56,-154 C50,-130 24,-118 12,-110 L-12,-110 C-24,-118 -50,-130 -56,-154 C-64,-186 -56,-238 0,-238Z';

// Animated props write the native `matrix` prop of <G> directly (a JS `transform` array is only converted in G.setNativeProps,
// which Reanimated bypasses on native). The G typings do not list `matrix`, so the component is typed loosely.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AG = Animated.createAnimatedComponent(G) as unknown as React.ComponentType<any>;
/** Which prop carries the animated transform: web renders `transform` (a `matrix` prop is ignored there), phones need `matrix`. */
const MK = Platform.OS === 'web' ? 'transform' : 'matrix';
const APath = Animated.createAnimatedComponent(Path);
const AText = Animated.createAnimatedComponent(Text);

/** Height of the ground band under the ground line, pt. */
export const GROUND_BAND = 44;
const V_SCALE = 2.6; // arrow length, pt per m s⁻¹
const DIM_X = 24; // x of the "20 m" dimension line

type Matrix = [number, number, number, number, number, number];

/** A 2D transform as a matrix: rotate by `deg` around (px, py), then move by (tx, ty). */
function rot(deg: number, px: number, py: number, tx = 0, ty = 0): Matrix {
  'worklet';
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [c, s, -s, c, tx + px - c * px + s * py, ty + py - s * px - c * py];
}

/** A vertical arrow starting at (x, y0); len > 0 points up. Very short = a dot (zero velocity). */
function arrowD(x: number, y0: number, len: number) {
  'worklet';
  if (Math.abs(len) < 5) return `M${x - 2.4},${y0} a2.4,2.4 0 1,0 4.8,0 a2.4,2.4 0 1,0 -4.8,0`;
  const tip = y0 - len;
  const h = len > 0 ? 9 : -9;
  return `M${x},${y0} L${x},${tip} M${x - 6},${tip + h} L${x},${tip} L${x + 6},${tip + h}`;
}

const clamp = (x: number, lo: number, hi: number) => {
  'worklet';
  return Math.min(hi, Math.max(lo, x));
};

/** "−11.8 m/s", and "0 m/s" for a rounded zero. `tenths` is the value times ten, already rounded. */
function speedLabel(tenths: number) {
  return tenths === 0 ? '0 m/s' : `${fixed(tenths / 10, 1)} m/s`;
}

export type BalloonSceneProps = {
  t: SharedValue<number>;
  width: number;
  height: number; // the whole stage, including the strip the sheet covers
  topInset: number; // bottom edge of the title area: the balloon fades out above this line
  bottomInset: number; // strip at the bottom covered by the sheet
  compact?: boolean;
  scene: SceneSetup;
  playback: Playback | null; // null = before release
  highlight?: Highlight;
  previewValue?: number | null;
};

export function BalloonScene({ t, width, height, topInset, bottomInset, compact, scene, playback, highlight, previewValue }: BalloonSceneProps) {
  const { palette: p } = useTheme();
  const reduced = useReducedMotion();

  // gentle always-on time for the sway and the flame
  const sw = useSharedValue(0);
  useFrameCallback((info) => {
    'worklet';
    if (!reduced) sw.value = (info.timeSinceFirstFrame ?? 0) / 1000;
  });

  // ---- geometry ----
  const bs = compact ? 0.34 : 0.5; // balloon drawing scale (the balloon has a fixed size in points)
  const bagK = 1.54 * bs; // sandbag scale
  const balloonH = 238 * bs; // envelope top above the origin
  const ground = height - bottomInset - GROUND_BAND;
  const h0 = scene.body.s0;
  const body = scene.body;
  const peak = body.a < 0 && body.u > 0 ? h0 + (body.u * body.u) / (-2 * body.a) : h0; // highest point of the sandbag
  // metre scale: at the release height the balloon's top is just below the title area, and the top of the throw stays visible
  const raw = (ground - topInset - balloonH - 4) / h0;
  // the floor is low on purpose: on a short phone or with large fonts the scale must shrink so the balloon never rises into the title
  const pxm = Math.max(0.8, Math.min(clamp(raw, 0.8, 7), (ground - topInset - 34) / peak));
  const px = Math.round(width * 0.48); // x of the balloon and the sandbag
  const gx = Math.min(Math.round(width * 0.8), width - 104); // ghost lane: keeps its label clear of the replay button
  const yOf = (m: number) => {
    'worklet';
    return ground - m * pxm;
  };
  const yRelease = yOf(h0);
  const fadeFrom = Math.min(topInset, yRelease - balloonH); // the balloon is fully visible below this line
  const carrier = scene.carrier;
  const real: Track = playback?.real ?? { motion: scene.body, from: 0, end: 0 };
  const comp = playback?.companion ?? null;
  const showBalloonArrow = !scene.secretCarrierSpeed || playback !== null;
  const showAcc = (playback?.showAcc ?? false) || highlight === 'a';

  // ---- animated props: the balloon ----
  const balloonProps = useAnimatedProps(() => {
    const time = playback ? t.value : 0;
    const yb = yOf(position(time, carrier));
    return { [MK]: [1, 0, 0, 1, px, yb] as Matrix, opacity: clamp((yb - balloonH - (fadeFrom - 36)) / 36, 0, 1) };
  });
  const envelopeSway = useAnimatedProps(() => ({
    [MK]: rot(1.5 * Math.sin(sw.value * 1.9) + 0.6 * Math.sin(sw.value * 3.1 + 1), 0, -81 * bs),
  }));
  const basketSway = useAnimatedProps(() => ({ [MK]: rot(2.6 * Math.sin(sw.value * 2.4 + 0.8), 0, -103 * bs) }));
  const flameProps = useAnimatedProps(() => {
    const flicker = 1 + 0.22 * Math.sin(sw.value * 23) + 0.16 * Math.sin(sw.value * 37 + 2);
    return { [MK]: [1 - 0.05 * Math.sin(sw.value * 29), 0, 0, flicker, 0, -110] as Matrix };
  });

  const dimLabel = `${fixed(h0, 0)} m`;
  const dimColor = highlight === 's' ? p.vel : p.stageDim;
  const grid: number[] = [];
  for (let m = 10; m <= scene.worldTop; m += 10) grid.push(m);
  const bagMid = 15 * bagK; // from the bag's bottom to its middle
  const carrierLabel = `${highlight === 'u' ? 'u = ' : ''}${fixed(carrier.u, 1)} m/s`;
  const carrierLen = carrier.u * V_SCALE;
  const cx = 72 * bs; // x of the balloon's own speed arrow, from the balloon's centre
  const cy = -69 * bs; // its base: the middle of the basket

  return (
    <Svg width={width} height={height} fontFamily={svgFont}>
      {/* background: faint grid every 10 m, the release level, the ground */}
      <Rect x={0} y={0} width={width} height={height} fill={p.stage} />
      {grid.map((m) => (
        <Line key={m} x1={0} y1={yOf(m)} x2={width} y2={yOf(m)} stroke="#FFFFFF" strokeOpacity={0.05} strokeWidth={1} />
      ))}
      <Line x1={DIM_X + 14} y1={yRelease} x2={width - 24} y2={yRelease} stroke="#FFFFFF" strokeOpacity={0.16} strokeWidth={1} strokeDasharray="3 6" />
      <Rect x={0} y={ground} width={width} height={GROUND_BAND + bottomInset} fill={p.stageGround} />
      <Line x1={0} y1={ground} x2={width} y2={ground} stroke={p.stageGroundLine} strokeWidth={2} />

      {/* the "20 m" dimension: ground to release height */}
      <Path
        d={`M${DIM_X},${ground} V${yRelease} M${DIM_X - 6},${ground} h12 M${DIM_X - 6},${yRelease} h12`}
        stroke={dimColor}
        strokeWidth={highlight === 's' ? 2.4 : 1.5}
        strokeLinecap="round"
        fill="none"
      />
      <Text x={DIM_X + 12} y={(ground + yRelease) / 2 + 5} fontSize={14} fontWeight="500" fill={highlight === 's' ? p.vel : p.stageMuted}>
        {dimLabel}
      </Text>
      {highlight === 's' && playback === null && <DisplacementArrow x={px - 40} top={yRelease} ground={ground} color={p.vel} />}

      {/* labels under the ground line when two bodies are compared */}
      {playback && comp && (
        <>
          <Text x={px} y={ground + 24} fontSize={13} fontWeight="500" fill={p.stageText} textAnchor="middle">{playback.realLabel}</Text>
          <Text x={gx} y={ground + 24} fontSize={13} fontWeight="500" fill={p.stageDim} textAnchor="middle">{comp.label}</Text>
        </>
      )}

      {/* the companion: the learner's answer (dashed) or a real comparison */}
      {playback && comp && <Companion t={t} track={comp.track} kind={comp.kind} x={gx} yOf={yOf} bagK={bagK} p={p} />}

      {/* the balloon, with its steady-speed arrow */}
      <AG animatedProps={balloonProps}>
        <AG animatedProps={envelopeSway}>
          <G transform={[bs, 0, 0, bs, 0, 0] as Matrix}>
            {/* the envelope is drawn as plain shapes that stay inside its outline (no clipping: it is unreliable on web) */}
            <Path d={ENVELOPE} fill={p.balloon} />
            <Path d="M12,-110 C34,-136 50,-170 40,-204 C34,-224 18,-236 0,-238 C56,-238 64,-186 56,-154 C50,-130 24,-118 12,-110Z" fill={p.balloonShade} opacity={0.8} />
            <Path d="M0,-238 C-14,-206 -16,-170 -9,-146 Q0,-140 9,-146 C16,-170 14,-206 0,-238Z" fill={p.acc} />
            <Ellipse cx={-31} cy={-192} rx={10} ry={28} fill="#FFFFFF" opacity={0.55} />
            <AG animatedProps={flameProps}>
              <Path d="M0,0 C-8,-9 -5,-18 0,-27 C5,-18 8,-9 0,0Z" fill={p.flame} />
              <Path d="M0,0 C-4,-5 -2.5,-10 0,-15 C2.5,-10 4,-5 0,0Z" fill={p.flameCore} />
            </AG>
            <Rect x={-12} y={-110} width={24} height={8} rx={3} fill={p.burner} />
            <Path d="M-13,-81L-10,-103M13,-81L10,-103" stroke={p.rope} strokeWidth={1.8} strokeLinecap="round" />
          </G>
          <AG animatedProps={basketSway}>
            <G transform={[bs, 0, 0, bs, 0, 0] as Matrix}>
              <Rect x={-20} y={-81} width={40} height={24} rx={5} fill={p.kraft} />
              <Rect x={-20} y={-81} width={40} height={7} rx={3} fill={p.kraftLight} />
              <Path d="M-7,-73V-57M7,-73V-57" stroke={p.kraftDark} strokeWidth={1.2} opacity={0.6} />
              {playback === null && (
                <>
                  <Path d="M0,-45V-57" stroke={p.rope} strokeWidth={1.8} />
                  <G transform={[1.54, 0, 0, 1.54, 0, 0] as Matrix}>
                    <Sack p={p} />
                  </G>
                </>
              )}
            </G>
          </AG>
        </AG>
        {showBalloonArrow && (
          <>
            {highlight === 'u' && <Path d={arrowD(cx, cy, carrierLen)} stroke={p.vel} strokeOpacity={0.28} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
            <Path d={arrowD(cx, cy, carrierLen)} stroke={p.vel} strokeWidth={highlight === 'u' ? 4.2 : 3.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Text x={cx + 11} y={cy - carrierLen / 2 + 5} fontSize={13} fontWeight="600" fill={p.vel}>{carrierLabel}</Text>
          </>
        )}
      </AG>

      {/* before release: the learner's chosen answer as an arrow on the held sandbag */}
      {playback === null && previewValue != null && (
        <StaticVelocity x={px - 26} y0={yRelease - bagMid} value={previewValue} color={p.vel} />
      )}
      {/* the acceleration arrow on the held sandbag (highlight 'a') */}
      {playback === null && highlight === 'a' && <StaticAcc x={px + 24} y0={yRelease - bagMid} color={p.acc} />}

      {/* the falling sandbag with its live velocity and acceleration arrows */}
      {playback && (
        <FallingBag t={t} real={real} yOf={yOf} px={px} ground={ground} bagK={bagK} bagMid={bagMid} showAcc={showAcc} reduced={reduced} p={p} />
      )}
    </Svg>
  );
}

/** The sandbag, drawn about its bottom-centre (bottom at y = 0). */
function Sack({ p }: { p: Palette }) {
  return (
    <>
      <Path d="M-5,-26 C-15,-23 -16,-9 -12,-4 C-9,1 9,1 12,-4 C16,-9 15,-23 5,-26Z" fill={p.sack} />
      <Path d="M-12,-4 C-9,1 9,1 12,-4 C8,-1 -8,-1 -12,-4Z" fill={p.kraftDark} />
      <Rect x={-7} y={-29} width={14} height={5} rx={2.5} fill={p.kraftDark} />
      <Ellipse cx={-6} cy={-14} rx={3} ry={6} fill="#FFFFFF" opacity={0.28} />
    </>
  );
}

/** Highlight 's': a downward arrow from the release point to the ground, marked "s = ?". */
function DisplacementArrow({ x, top, ground, color }: { x: number; top: number; ground: number; color: string }) {
  return (
    <>
      <Path
        d={`M${x},${top + 4} L${x},${ground - 2} M${x - 6},${ground - 11} L${x},${ground - 2} L${x + 6},${ground - 11}`}
        stroke={color}
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Text x={x + 9} y={(top + ground) / 2 + 5} fontSize={15} fontWeight="700" fill={color}>s = ?</Text>
    </>
  );
}

/** A fixed velocity arrow with its label, to the left of x (used for the preview). */
function StaticVelocity({ x, y0, value, color }: { x: number; y0: number; value: number; color: string }) {
  const len = clamp(value * V_SCALE, -80, 80);
  return (
    <>
      <Path d={arrowD(x, y0, len)} stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Text x={x - 9} y={y0 - len / 2 + 5} fontSize={13} fontWeight="600" fill={color} textAnchor="end">
        {speedLabel(Math.round(value * 10))}
      </Text>
    </>
  );
}

/** A fixed acceleration arrow (points down) with the letter a. */
function StaticAcc({ x, y0, color }: { x: number; y0: number; color: string }) {
  return (
    <>
      <Path d={arrowD(x, y0, -34)} stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Text x={x + 10} y={y0 + 22} fontSize={16} fontWeight="700" fontStyle="italic" fill={color}>a</Text>
    </>
  );
}

type FallingProps = {
  t: SharedValue<number>;
  real: Track;
  yOf: (m: number) => number;
  px: number;
  ground: number;
  bagK: number;
  bagMid: number;
  showAcc: boolean;
  reduced: boolean;
  p: Palette;
};

/** The sandbag during playback: it tumbles a little, with a live velocity arrow (left) and an optional acceleration arrow (right). */
function FallingBag({ t, real, yOf, px, ground, bagK, bagMid, showAcc, reduced, p }: FallingProps) {
  // the label text changes with time, so it lives in React state, updated only when the shown value changes
  const [tenths, setTenths] = useState(() => Math.round(trackVelocity(0, real) * 10));
  useAnimatedReaction(
    () => Math.round(trackVelocity(t.value, real) * 10),
    (now, before) => {
      if (now !== before) scheduleOnRN(setTenths, now);
    },
  );

  const bagProps = useAnimatedProps(() => {
    const time = t.value;
    const y = yOf(Math.max(0, trackPosition(time, real)));
    const landing = clamp((real.end - time) / 0.15, 0, 1); // the tumble stops as it lands
    const deg = reduced ? 0 : 9 * Math.sin(time * 3.2) * Math.min(1, time * 2) * landing;
    return { [MK]: rot(deg, 0, -bagMid, px, y) };
  });
  const midY = (time: number) => {
    'worklet';
    return yOf(Math.max(0, trackPosition(time, real))) - bagMid;
  };
  const arrowLen = (time: number, y0: number) => {
    'worklet';
    return clamp(trackVelocity(time, real) * V_SCALE, -(ground + GROUND_BAND - 4 - y0), 80);
  };
  const arrowProps = useAnimatedProps(() => {
    const y0 = midY(t.value);
    return { d: arrowD(px - 26, y0, arrowLen(t.value, y0)) };
  });
  const labelProps = useAnimatedProps(() => {
    const y0 = midY(t.value);
    return { y: y0 - arrowLen(t.value, y0) / 2 + 5 };
  });
  const accProps = useAnimatedProps(() => ({ d: arrowD(px + 24, midY(t.value), -34) }));
  const accLabelProps = useAnimatedProps(() => ({ y: midY(t.value) + 22 }));

  return (
    <>
      <APath animatedProps={arrowProps} stroke={p.vel} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <AText animatedProps={labelProps} x={px - 35} fontSize={13} fontWeight="600" fill={p.vel} textAnchor="end">
        {speedLabel(tenths)}
      </AText>
      {showAcc && (
        <>
          <APath animatedProps={accProps} stroke={p.acc} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <AText animatedProps={accLabelProps} x={px + 34} fontSize={16} fontWeight="700" fontStyle="italic" fill={p.acc}>a</AText>
        </>
      )}
      <AG animatedProps={bagProps}>
        <G transform={[bagK, 0, 0, bagK, 0, 0] as Matrix}>
          <Sack p={p} />
        </G>
      </AG>
    </>
  );
}

type CompanionProps = {
  t: SharedValue<number>;
  track: Track;
  kind: 'ghost' | 'solid';
  x: number;
  yOf: (m: number) => number;
  bagK: number;
  p: Palette;
};

/** The second body on the right lane: a dashed outline for the learner's answer, a real sandbag for a comparison. */
function Companion({ t, track, kind, x, yOf, bagK, p }: CompanionProps) {
  const props = useAnimatedProps(() => {
    const y = yOf(Math.max(0, trackPosition(t.value, track)));
    return { [MK]: [1, 0, 0, 1, x, y] as Matrix, opacity: t.value >= track.from ? 1 : 0 };
  });
  return (
    <AG animatedProps={props}>
      {kind === 'ghost' ? (
        <Rect x={-12} y={-32 * (bagK / 0.77)} width={24} height={32 * (bagK / 0.77)} rx={9} fill="#FFFFFF" fillOpacity={0.05} stroke={p.ghost} strokeWidth={1.8} strokeDasharray="4 3" />
      ) : (
        <G transform={[bagK, 0, 0, bagK, 0, 0] as Matrix}>
          <Sack p={p} />
        </G>
      )}
    </AG>
  );
}
