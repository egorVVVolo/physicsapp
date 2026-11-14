// An on/off switch: the knob slides across in 160 ms and stops, no bounce (the interface never bounces).
// On is the course blue (blue means "your choice"); off is a grey track. The whole row it sits in is the
// touch target, so the switch itself only draws; `accessibilityRole="switch"` goes on that row.
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeContext';
import { motion } from '@/theme/tokens';
import { useReducedMotionPref } from './motion';

const W = 52;
const H = 32;
const KNOB = 26;
const PAD = (H - KNOB) / 2;

export function Switch({ value }: { value: boolean }) {
  const { palette: p } = useTheme();
  const reduced = useReducedMotionPref();
  const k = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    k.set(reduced ? (value ? 1 : 0) : withTiming(value ? 1 : 0, { duration: motion.fast, easing: Easing.out(Easing.cubic) }));
  }, [value, reduced, k]);
  const off = p.lineStrong;
  const on = p.select;
  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(k.get(), [0, 1], [off, on]) }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: k.get() * (W - KNOB - 2 * PAD) }] }));
  return (
    <Animated.View style={[styles.track, track]}>
      <Animated.View style={[styles.knob, knob]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: { width: W, height: H, borderRadius: H / 2, padding: PAD },
  knob: { width: KNOB, height: KNOB, borderRadius: KNOB / 2, backgroundColor: '#FFFFFF' },
});
