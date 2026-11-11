// The scene: a hot-air balloon, the sandbag, and the numbers that belong on the picture.
// Drawn with react-native-svg on the dark-blue blueprint stage. The balloon always sways a little and its flame
// flickers (unless the phone asks for reduced motion). Model time comes in as `t`.
//
// Interactions (drag an arrow, tap a frame...) are drawn on top through two slots that get the
// scene geometry: `svgOverlay` (drawn inside the same Svg) and `viewOverlay` (touch areas above it).
import { useState, type ReactNode } from 'react';
import { Platform, View } from 'react-native';
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
import { svgFont, svgItalic } from '@/theme/svgFont';
import { GRID } from '@/theme/tokens';

// Animated props write the native `matrix` prop of <G> on phones (a JS `transform` array is only converted in
// G.setNativeProps, which Reanimated bypasses); web renders `transform`. The G typings do not list `matrix`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AG = Animated.createAnimatedComponent(G) as unknown as React.ComponentType<any>;
const MK = Platform.OS === 'web' ? 'transform' : 'matrix';
const APath = Animated.createAnimatedComponent(Path);
const AText = Animated.createAnimatedComponent(Text);

type Matrix = [number, number, number, number, number, number];

export const GROUND_BAND = 30; // pt under the ground line
const BS = 0.72; // balloon drawing scale (its outline is drawn in units about 180 tall)
const BAG_K = 1.2; // sandbag drawing scale: about 36 pt tall
const BAG_H = 30 * BAG_K; // sandbag height, pt
const ROPE = 12; // pt between the basket and the hanging sandbag
const BALLOON_H = 182 * BS; // envelope top above the basket bottom, pt
export const V_SCALE = 4; // arrow length, pt per m s⁻¹
const DIM_X = 22; // x of the "20 m" dimension line

/** Where things are on this scene. Overlays use it to put handles exactly on the picture. */
export type SceneGeometry = {
  width: number;
  height: number;
  ground: number; // y of the ground line
  pxm: number; // pt per metre
  px: number; // x of the balloon and the sandbag
  gx: number; // x of the comparison (ghost) lane
  yOf: (m: number) => number;
  yRelease: number;
  bagH: number;
  velX: number; // x of velocity arrows on the sandbag
  accX: number; // x of acceleration arrows on the sandbag
  sX: number; // x of the displacement arrow
};

export function sceneGeometry(width: number, height: number, scene: SceneSetup): SceneGeometry {
  const ground = height - GROUND_BAND;
  const h0 = scene.body.s0;
  const b = scene.body;
  const peak = b.a < 0 && b.u > 0 ? h0 + (b.u * b.u) / (-2 * b.a) : h0;
  const total = BAG_H + ROPE + BALLOON_H; // from the sandbag's bottom to the envelope top
  // the balloon fits above the release point, and the top of the throw stays inside the scene
  const pxm = Math.max(1.5, Math.min(10, (ground - total - 8) / h0, (ground - 24) / peak));
  const px = Math.round(width * 0.46);
  const yOf = (m: number) => {
    'worklet';
    return ground - m * pxm;
  };
  return {
    width,
    height,
    ground,
    pxm,
    px,
    gx: Math.min(Math.round(width * 0.8), width - 56),
    yOf,
    yRelease: ground - h0 * pxm,
    bagH: BAG_H,
    velX: px + 32,
    accX: px - 32,
    sX: px + 44,
  };
}

/** A 2D transform as a matrix: rotate by `deg` around (px, py), then move by (tx, ty). */
function rot(deg: number, px: number, py: number, tx = 0, ty = 0): Matrix {
  'worklet';
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [c, s, -s, c, tx + px - c * px + s * py, ty + py - s * px - c * py];
}

/** A vertical arrow starting at (x, y0); len > 0 points up. Very short = a dot (zero). */
export function arrowD(x: number, y0: number, len: number) {
  'worklet';
  if (Math.abs(len) < 5) return `M${x - 3},${y0} a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0`;
  const tip = y0 - len;
  const h = len > 0 ? 10 : -10;
  return `M${x},${y0} L${x},${tip} M${x - 7},${tip + h} L${x},${tip} L${x + 7},${tip + h}`;
}

const clamp = (x: number, lo: number, hi: number) => {
  'worklet';
  return Math.min(hi, Math.max(lo, x));
};

/** "−11.8 m/s", "+12.0 m/s", and "0 m/s" for a rounded zero. `tenths` is the value times ten, already rounded. */
export function speedLabel(tenths: number) {
  return tenths === 0 ? '0 m/s' : `${tenths > 0 ? '+' : ''}${fixed(tenths / 10, 1)} m/s`;
}

export type BalloonSceneProps = {
  t: SharedValue<number>;
  width: number;
  height: number;
  scene: SceneSetup;
  playback: Playback | null; // null = before release
  highlight?: Highlight;
  showBalloon?: boolean; // false: only the sandbag (strobe frames, worked pictures)
  showHeldSack?: boolean; // false: the hanging sandbag is drawn by an overlay instead
  bare?: boolean; // true: no background or grid (the screen draws one stage behind the question and the scene)
  svgOverlay?: (g: SceneGeometry) => ReactNode;
  viewOverlay?: (g: SceneGeometry) => ReactNode;
};

export function BalloonScene(props: BalloonSceneProps) {
  const { t, width, height, scene, playback, highlight, showBalloon = true, showHeldSack = true, bare = false, svgOverlay, viewOverlay } = props;
  const { stage: p } = useTheme();
  const reduced = useReducedMotion();

  // gentle always-on time for the sway and the flame
  const sw = useSharedValue(0);
  useFrameCallback((info) => {
    'worklet';
    if (!reduced) sw.value = (info.timeSinceFirstFrame ?? 0) / 1000;
  });

  const g = sceneGeometry(width, height, scene);
  const { ground, px, gx, yOf, yRelease } = g;
  const carrier = scene.carrier;
  const real: Track = playback?.real ?? { motion: scene.body, from: 0, end: 0 };
  const comp = playback?.companion ?? null;
  const showCarrierArrow = !scene.secretCarrierSpeed || playback !== null;
  const showAcc = (playback?.showAcc ?? false) || highlight === 'a';

  // ---- the balloon: its group origin is the basket bottom ----
  const balloonProps = useAnimatedProps(() => {
    const time = playback ? t.value : 0;
    const yb = yOf(position(time, carrier)) - BAG_H - ROPE;
    return { [MK]: [1, 0, 0, 1, px, yb] as Matrix, opacity: clamp((yb - BALLOON_H + 30) / 40, 0, 1) };
  });
  const sway = useAnimatedProps(() => ({ [MK]: rot(1.3 * Math.sin(sw.value * 1.9) + 0.5 * Math.sin(sw.value * 3.1 + 1), 0, 0) }));
  const flameProps = useAnimatedProps(() => {
    const flicker = 1 + 0.22 * Math.sin(sw.value * 23) + 0.16 * Math.sin(sw.value * 37 + 2);
    return { [MK]: [1 - 0.05 * Math.sin(sw.value * 29), 0, 0, flicker, 0, -54] as Matrix };
  });

  const carrierLen = carrier.u * V_SCALE;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} fontFamily={svgFont}>
        {!bare && <Rect x={0} y={0} width={width} height={height} fill={p.sky} />}
        {!bare && <BlueprintGrid width={width} height={height} color={p.grid} />}
        <Line x1={DIM_X + 14} y1={yRelease} x2={width - 16} y2={yRelease} stroke={p.ink} strokeOpacity={0.2} strokeWidth={1} strokeDasharray="3 6" />
        <Rect x={0} y={ground} width={width} height={GROUND_BAND} fill={p.ground} />
        <Line x1={0} y1={ground} x2={width} y2={ground} stroke={p.groundLine} strokeWidth={2} />

        {/* the release height: ground to the release point */}
        <Path d={`M${DIM_X},${ground} V${yRelease} M${DIM_X - 6},${ground} h12 M${DIM_X - 6},${yRelease} h12`} stroke={p.muted} strokeWidth={1.5} strokeLinecap="round" fill="none" />
        <Text x={DIM_X + 10} y={(ground + yRelease) / 2 + 5} fontSize={13} fill={p.muted}>
          {`${fixed(scene.body.s0, 0)} m`}
        </Text>
        {highlight === 's' && playback === null && <StaticDisplacement x={g.sX} top={yRelease} ground={ground} color={p.vel} textColor={p.velText} />}

        {/* labels under the ground line when two bodies are compared */}
        {playback && comp && (
          <>
            <Text x={px} y={ground + 20} fontSize={12} fill={p.ink} textAnchor="middle">{playback.realLabel}</Text>
            <Text x={gx} y={ground + 20} fontSize={12} fill={p.muted} textAnchor="middle">{comp.label}</Text>
          </>
        )}
        {playback && comp && <Companion t={t} track={comp.track} kind={comp.kind} x={gx} yOf={yOf} p={p} />}

        {showBalloon && (
          <AG animatedProps={balloonProps}>
            <AG animatedProps={sway}>
              <G transform={[BS, 0, 0, BS, 0, 0] as Matrix}>
                <Path d="M0,-182 C56,-182 64,-130 56,-98 C50,-74 24,-62 12,-54 L-12,-54 C-24,-62 -50,-74 -56,-98 C-64,-130 -56,-182 0,-182Z" fill={p.balloon} stroke={p.balloonLine} strokeWidth={2.4} />
                <Path d="M12,-54 C34,-80 50,-114 40,-148 C34,-168 18,-180 0,-182 C56,-182 64,-130 56,-98 C50,-74 24,-62 12,-54Z" fill={p.balloonShade} />
                <Path d="M0,-182 C-14,-150 -16,-114 -9,-90 Q0,-84 9,-90 C16,-114 14,-150 0,-182Z" fill={p.gore} />
                <Ellipse cx={-31} cy={-136} rx={10} ry={26} fill="#FFFFFF" opacity={0.9} />
                <AG animatedProps={flameProps}>
                  <Path d="M0,0 C-8,-9 -5,-18 0,-27 C5,-18 8,-9 0,0Z" fill={p.flame} />
                  <Path d="M0,0 C-4,-5 -2.5,-10 0,-15 C2.5,-10 4,-5 0,0Z" fill={p.flameCore} />
                </AG>
                <Rect x={-12} y={-54} width={24} height={8} rx={3} fill={p.burner} />
                <Path d="M-13,-24L-10,-46M13,-24L10,-46" stroke={p.rope} strokeWidth={2} strokeLinecap="round" />
                <Rect x={-20} y={-24} width={40} height={24} rx={5} fill={p.kraft} />
                <Rect x={-20} y={-24} width={40} height={7} rx={3} fill={p.kraftLight} />
                <Path d="M-7,-16V0M7,-16V0" stroke={p.kraftDark} strokeWidth={1.2} opacity={0.5} />
              </G>
              {playback === null && showHeldSack && (
                <>
                  <Line x1={0} y1={0} x2={0} y2={ROPE} stroke={p.rope} strokeWidth={1.5} />
                  <G transform={[BAG_K, 0, 0, BAG_K, 0, ROPE + BAG_H] as Matrix}>
                    <Sack p={p} />
                  </G>
                </>
              )}
            </AG>
            {/* the balloon's own steady speed, on its left so it never meets the sandbag's arrows */}
            {showCarrierArrow && (
              <>
                {highlight === 'u' && <Path d={arrowD(-44, -6, carrierLen)} stroke={p.vel} strokeOpacity={0.22} strokeWidth={12} strokeLinecap="round" fill="none" />}
                <Path d={arrowD(-44, -6, carrierLen)} stroke={p.vel} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <Text x={-54} y={-6 - carrierLen / 2 + 5} fontSize={13} fill={p.velText} textAnchor="end">
                  {`${fixed(carrier.u, 1)} m/s`}
                </Text>
              </>
            )}
          </AG>
        )}

        {/* the acceleration arrow on the held sandbag (idea about gravity) */}
        {playback === null && highlight === 'a' && <StaticAcc x={g.accX} y0={yRelease - BAG_H / 2} p={p} />}

        {playback && <FallingBag t={t} real={real} g={g} showAcc={showAcc} reduced={reduced} p={p} />}

        {svgOverlay?.(g)}
      </Svg>
      {viewOverlay?.(g)}
    </View>
  );
}

/** The sandbag, drawn about its bottom-centre (bottom at y = 0), about 30 units tall. */
export function Sack({ p, ghost }: { p: Palette; ghost?: boolean }) {
  if (ghost) {
    return <Path d="M-5,-26 C-15,-23 -16,-9 -12,-4 C-9,1 9,1 12,-4 C16,-9 15,-23 5,-26Z" fill="#FFFFFF" fillOpacity={0.12} stroke={p.ghost} strokeWidth={1.6} strokeDasharray="4 3" />;
  }
  return (
    <>
      <Path d="M-5,-26 C-15,-23 -16,-9 -12,-4 C-9,1 9,1 12,-4 C16,-9 15,-23 5,-26Z" fill={p.sack} />
      <Path d="M-12,-4 C-9,1 9,1 12,-4 C8,-1 -8,-1 -12,-4Z" fill={p.kraftDark} />
      <Rect x={-7} y={-29} width={14} height={5} rx={2.5} fill={p.kraftDark} />
      <Ellipse cx={-6} cy={-14} rx={3} ry={6} fill="#FFFFFF" opacity={0.3} />
    </>
  );
}

/** A still sandbag with its bottom at (x, y), for overlays that draw frozen frames. */
export function StillSack({ x, y, p, ghost }: { x: number; y: number; p: Palette; ghost?: boolean }) {
  return (
    <G transform={[BAG_K, 0, 0, BAG_K, x, y] as Matrix}>
      <Sack p={p} ghost={ghost} />
    </G>
  );
}

/** Highlight 's': a downward arrow from the release point to the ground, marked "s". */
function StaticDisplacement({ x, top, ground, color, textColor }: { x: number; top: number; ground: number; color: string; textColor: string }) {
  return (
    <>
      <Path d={arrowD(x, top, -(ground - top - 2))} stroke={color} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Text x={x + 10} y={(top + ground) / 2 + 5} fontSize={15} fill={textColor}>s</Text>
    </>
  );
}

/** A fixed acceleration arrow with the letter a, to the left of the sandbag. */
export function StaticAcc({ x, y0, p, dir = 'down' }: { x: number; y0: number; p: Palette; dir?: 'down' | 'up' | 'zero' }) {
  const len = dir === 'down' ? -36 : dir === 'up' ? 36 : 0;
  return (
    <>
      <Path d={arrowD(x, y0, len)} stroke={p.acc} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill={dir === 'zero' ? p.acc : 'none'} />
      <Text x={x - 10} y={y0 + (dir === 'up' ? -14 : 22)} fontSize={15} fontFamily={svgItalic} fill={p.accText} textAnchor="end">a</Text>
    </>
  );
}

/** The sandbag during playback: it tumbles a little, with a live velocity arrow and an optional acceleration arrow. */
function FallingBag({ t, real, g, showAcc, reduced, p }: { t: SharedValue<number>; real: Track; g: SceneGeometry; showAcc: boolean; reduced: boolean; p: Palette }) {
  const { yOf, px, ground, velX, accX } = g;
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
    const deg = reduced ? 0 : 8 * Math.sin(time * 3.2) * Math.min(1, time * 2) * landing;
    return { [MK]: rot(deg, 0, -BAG_H / 2, px, y) };
  });
  const midY = (time: number) => {
    'worklet';
    return yOf(Math.max(0, trackPosition(time, real))) - BAG_H / 2;
  };
  const arrowLen = (time: number, y0: number) => {
    'worklet';
    return clamp(trackVelocity(time, real) * V_SCALE, -(ground + GROUND_BAND - 4 - y0), 90);
  };
  const arrowProps = useAnimatedProps(() => {
    const y0 = midY(t.value);
    return { d: arrowD(velX, y0, arrowLen(t.value, y0)) };
  });
  const labelProps = useAnimatedProps(() => {
    const y0 = midY(t.value);
    return { y: y0 - arrowLen(t.value, y0) / 2 + 5 };
  });
  const accProps = useAnimatedProps(() => ({ d: arrowD(accX, midY(t.value), -36) }));
  const accLabelProps = useAnimatedProps(() => ({ y: midY(t.value) + 22 }));
  return (
    <>
      <APath animatedProps={arrowProps} stroke={p.vel} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <AText animatedProps={labelProps} x={velX + 12} fontSize={14} fill={p.velText}>
        {speedLabel(tenths)}
      </AText>
      {showAcc && (
        <>
          <APath animatedProps={accProps} stroke={p.acc} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <AText animatedProps={accLabelProps} x={accX - 10} fontSize={15} fontFamily={svgItalic} fill={p.accText} textAnchor="end">a</AText>
        </>
      )}
      <AG animatedProps={bagProps}>
        <G transform={[BAG_K, 0, 0, BAG_K, 0, 0] as Matrix}>
          <Sack p={p} />
        </G>
      </AG>
    </>
  );
}

/** The second body on the right lane: a dashed outline for the learner's answer, a real sandbag for a comparison. */
function Companion({ t, track, kind, x, yOf, p }: { t: SharedValue<number>; track: Track; kind: 'ghost' | 'solid'; x: number; yOf: (m: number) => number; p: Palette }) {
  const props = useAnimatedProps(() => {
    const y = yOf(Math.max(0, trackPosition(t.value, track)));
    return { [MK]: [1, 0, 0, 1, x, y] as Matrix, opacity: t.value >= track.from ? 1 : 0 };
  });
  return (
    <AG animatedProps={props}>
      <G transform={[BAG_K, 0, 0, BAG_K, 0, 0] as Matrix}>
        <Sack p={p} ghost={kind === 'ghost'} />
      </G>
    </AG>
  );
}

/** The blueprint grid: thin lines every GRID pt, starting at the top-left corner. */
export function BlueprintGrid({ width, height, color }: { width: number; height: number; color: string }) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let x = GRID; x < width; x += GRID) xs.push(x);
  for (let y = GRID; y < height; y += GRID) ys.push(y);
  return (
    <G>
      {xs.map((x) => (
        <Line key={'x' + x} x1={x} y1={0} x2={x} y2={height} stroke={color} strokeWidth={1} />
      ))}
      {ys.map((y) => (
        <Line key={'y' + y} x1={0} y1={y} x2={width} y2={y} stroke={color} strokeWidth={1} />
      ))}
    </G>
  );
}
