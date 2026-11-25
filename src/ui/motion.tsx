// Small entrance animations shared by lesson screens. All run on the UI thread (Reanimated) and once only;
// with reduced motion everything is simply shown.
import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { motion } from '@/theme/tokens';

/** True when the device asks for reduced motion (checked once). */
export function useReducedMotionPref(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
  }, []);
  return reduced;
}

const out = Easing.out(Easing.cubic);

/**
 * Slides in from the right and fades in: a whole screen, or only its text when the figure stays in place.
 * `still`: shown as it is, without moving (decided when it mounts).
 */
export function ScreenEnter({ children, still = false, from = 36, style }: { children: ReactNode; still?: boolean; /** Where it starts, in pt to the right of its place (negative: from the left). */ from?: number; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotionPref();
  const k = useSharedValue(still ? 1 : 0);
  useEffect(() => {
    if (!still) k.set(reduced ? 1 : withTiming(1, { duration: motion.screen, easing: out }));
  }, [k, reduced, still]);
  const anim = useAnimatedStyle(() => ({ opacity: k.get(), transform: [{ translateX: (1 - k.get()) * from }] }));
  return <Animated.View style={[style ?? styles.fill, anim]}>{children}</Animated.View>;
}

/** Further than this the block was off the screen anyway: it glides in from just above the edge. */
const GLIDE_MAX = 320;

/**
 * A block that was already on the screen before (the figure sheet kept from the screen before) glides back
 * from where it was, `fromY` pt higher, into its place: it moves, so it eases in and out.
 */
export function Glide({ children, fromY }: { children: ReactNode; fromY: number }) {
  const reduced = useReducedMotionPref();
  const y = useSharedValue(-Math.min(Math.max(0, fromY), GLIDE_MAX));
  useEffect(() => {
    y.set(reduced ? 0 : withTiming(0, { duration: motion.screen, easing: Easing.inOut(Easing.cubic) }));
  }, [y, reduced]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
  return <Animated.View style={anim}>{children}</Animated.View>;
}

/** One block of a screen rises into place after `delay` ms. */
export function Rise({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotionPref();
  const k = useSharedValue(0);
  useEffect(() => {
    k.set(reduced ? 1 : withDelay(delay, withTiming(1, { duration: 380, easing: out })));
  }, [k, delay, reduced]);
  const anim = useAnimatedStyle(() => ({ opacity: k.get(), transform: [{ translateY: (1 - k.get()) * 12 }] }));
  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
}

/** A quick "pop": scale up a little and ease back (no overshoot), each time `trigger` becomes true. */
export function Pop({ children, trigger, style }: { children: ReactNode; trigger: boolean; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotionPref();
  const s = useSharedValue(1);
  useEffect(() => {
    if (!trigger || reduced) return;
    s.set(withSequence(withTiming(1.05, { duration: 140, easing: out }), withTiming(1, { duration: 260, easing: Easing.inOut(Easing.cubic) })));
  }, [trigger, reduced, s]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.get() }] }));
  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
}

/** A "no" shake of the head: a short sideways wobble, each time `trigger` becomes true (a wrong card). */
export function Shake({ children, trigger, style }: { children: ReactNode; trigger: boolean; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotionPref();
  const x = useSharedValue(0);
  useEffect(() => {
    if (!trigger || reduced) return;
    const step = (to: number) => withTiming(to, { duration: 95, easing: out }); // 4 × 95 = 380 ms
    x.set(withSequence(step(-7), step(6), step(-4), step(0)));
  }, [trigger, reduced, x]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
}

const SPARKS = 8;

/** Short strokes shooting out from a point once (a right answer). Place it over the spot it bursts from. */
export function Sparks({ color, size = 64 }: { color: string; size?: number }) {
  const reduced = useReducedMotionPref();
  const t = useSharedValue(0);
  useEffect(() => {
    if (!reduced) t.set(withTiming(1, { duration: 620, easing: Easing.out(Easing.quad) }));
  }, [t, reduced]);
  if (reduced) return null;
  return (
    <View pointerEvents="none" style={[styles.sparks, { width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }]}>
      {Array.from({ length: SPARKS }, (_, i) => (
        <Spark key={i} i={i} t={t} color={color} reach={size / 2} />
      ))}
    </View>
  );
}

function Spark({ i, t, color, reach }: { i: number; t: { get: () => number }; color: string; reach: number }) {
  const angle = (i / SPARKS) * 2 * Math.PI - Math.PI / 2;
  const len = i % 2 ? 7 : 10;
  const style = useAnimatedStyle(() => {
    const k = t.get();
    const r = reach * (0.35 + 0.65 * k);
    return {
      opacity: k < 0.1 ? k * 10 : Math.max(0, 1 - (k - 0.4) / 0.6),
      transform: [{ translateX: Math.cos(angle) * r }, { translateY: Math.sin(angle) * r }, { rotate: `${angle + Math.PI / 2}rad` }, { scaleY: 1 - 0.5 * k }],
    };
  });
  return <Animated.View style={[styles.spark, { height: len, marginTop: -len / 2, backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  sparks: { position: 'absolute', left: '50%', top: '50%' },
  spark: { position: 'absolute', left: '50%', top: '50%', width: 2.6, marginLeft: -1.3, borderRadius: 1.3 },
});
