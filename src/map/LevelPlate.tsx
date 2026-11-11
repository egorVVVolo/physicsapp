// The level plate pinned under the header. When another level scrolls up under it, the plate
// blends to that level's colour and the title rolls in from the side you scrolled towards.
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import type { LevelColor } from '@/figures/Puck';
import { useTheme } from '@/theme/ThemeContext';
import { font, radius } from '@/theme/tokens';

type Shown = { index: number; title: string; color: LevelColor; done: number; total: number };

export function LevelPlate({ index, title, color, done, total }: Shown) {
  const { palette: p } = useTheme();
  const reduced = useReducedMotion();
  const t = useSharedValue(1);
  const prev = useRef<Shown>({ index, title, color, done, total });
  const [from, setFrom] = useState<LevelColor>(color);
  const dir = useSharedValue(1);

  useEffect(() => {
    if (prev.current.index === index) return;
    setFrom(prev.current.color);
    dir.set(index > prev.current.index ? 1 : -1);
    prev.current = { index, title, color, done, total };
    t.set(0);
    t.set(withTiming(1, { duration: reduced ? 0 : 260 }));
  }, [index, title, color, done, total, t, dir, reduced]);

  const plate = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(t.get(), [0, 1], [from.soft, color.soft]),
    borderColor: interpolateColor(t.get(), [0, 1], [from.main, color.main]),
    transform: [{ scale: 1 + 0.025 * Math.sin(Math.PI * t.get()) }],
  }));
  const lip = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(t.get(), [0, 1], [from.lip, color.lip]) }));
  const text = useAnimatedStyle(() => ({ opacity: t.get(), transform: [{ translateY: (1 - t.get()) * 14 * dir.get() }] }));

  return (
    <View accessibilityRole="header" accessibilityLabel={`Level ${index + 1}, ${title}. ${done} of ${total} lessons done.`}>
      <Animated.View style={[styles.lip, lip]} />
      <Animated.View style={[styles.plate, plate]}>
        <Animated.View style={[styles.inner, text]}>
          <Text style={[styles.no, { color: color.lip }]}>Level {index + 1}</Text>
          <Text style={[styles.title, { color: p.ink }]} numberOfLines={1}>
            {title}
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  lip: { position: 'absolute', left: 0, right: 0, top: 6, bottom: -5, borderRadius: radius.m + 2 },
  plate: { borderWidth: 2, borderRadius: radius.m + 2, overflow: 'hidden', minHeight: 70, justifyContent: 'center' },
  inner: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16 },
  no: { fontFamily: font.displaySemi, fontSize: 14, lineHeight: 18 },
  title: { fontFamily: font.display, fontSize: 22, lineHeight: 28 },
});
