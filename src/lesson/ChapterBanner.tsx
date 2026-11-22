// A small plate under the top bar when the lesson moves into a new chapter: "2 · BUILD THE IDEA".
// It slides down, stays 1.4 s and slides back up. With reduced motion it just appears and goes.
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeContext';
import { font, LIP, motion, radius, type LevelColor } from '@/theme/tokens';
import { useReducedMotionPref } from '@/ui/motion';

/** How long the plate stays in place. */
export const BANNER_HOLD = 1400;

export function ChapterBanner({ n, title, color }: { n: number; title: string; color: LevelColor }) {
  const { palette: p, level } = useTheme();
  const c = level(color);
  const reduced = useReducedMotionPref();
  const k = useSharedValue(0);
  useEffect(() => {
    const d = reduced ? 0 : motion.base;
    k.set(
      withSequence(
        withTiming(1, { duration: d, easing: Easing.out(Easing.cubic) }),
        withDelay(BANNER_HOLD, withTiming(0, { duration: d, easing: Easing.in(Easing.cubic) })),
      ),
    );
  }, [k, reduced]);
  const anim = useAnimatedStyle(() => ({ opacity: k.get(), transform: [{ translateY: reduced ? 0 : (k.get() - 1) * 24 }] }));
  const label = `${n + 1} · ${title.toUpperCase()}`;
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.plate, { backgroundColor: p.paper, borderColor: p.lineStrong, borderBottomColor: c.main }, anim]} accessibilityLiveRegion="polite" accessibilityLabel={`Chapter ${n + 1}: ${title}`}>
        <Text style={[styles.text, { color: p.ink }]}>{label}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 6, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  plate: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.s, borderWidth: 1, borderBottomWidth: LIP },
  text: { fontFamily: font.mono, fontSize: 12, letterSpacing: 1.2 },
});
