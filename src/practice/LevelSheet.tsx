// "Practise a level": a sheet that slides up over Revise with the six levels, each with its object. A level opens once
// a lesson of it is finished (grey with a lock before that). It eases in and out, with no bounce.
import { useEffect } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { levelObject, object } from '@/art/objects';
import { uiIcon } from '@/art/uiIcons';
import { CONTENT_MAX } from '@/lesson/Frame';
import { useTheme } from '@/theme/ThemeContext';
import { font, levelColors, reward, soonGrey, soonReward } from '@/theme/tokens';
import { Art } from '@/ui/Art';
import { MainButton, useReducedMotionPref } from '@/ui/parts';
import { levelLine, levelRows } from './reviseRows';

const IN = 300;
const OUT = 220;

export function LevelSheet({ finished, onClose }: { finished: Set<string>; onClose: () => void }) {
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotionPref();
  const k = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (!reduced) k.set(withTiming(1, { duration: IN, easing: Easing.out(Easing.cubic) }));
    AccessibilityInfo.announceForAccessibility('Practise a level');
  }, [k, reduced]);

  const close = (then?: () => void) => {
    if (reduced) {
      onClose();
      then?.();
      return;
    }
    k.set(withTiming(0, { duration: OUT, easing: Easing.in(Easing.cubic) }));
    setTimeout(() => {
      onClose();
      then?.();
    }, OUT);
  };

  const scrim = useAnimatedStyle(() => ({ opacity: k.get() }));
  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - k.get()) * 520 }] }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: p.scrim }, scrim]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => close()} accessibilityLabel="Close" accessibilityRole="button" />
      </Animated.View>
      <Animated.View accessibilityViewIsModal style={[styles.sheet, { backgroundColor: p.page, paddingBottom: insets.bottom + 16 }, sheet]}>
        <View style={styles.inner}>
          <Text accessibilityRole="header" style={[styles.title, { color: p.ink }]}>
            Practise a level
          </Text>
          <Text style={[styles.hint, { color: p.muted }]}>Six questions from the lessons you have finished.</Text>
          {levelRows(finished).map((r) => (
            <Pressable
              key={r.levelId}
              accessibilityRole="button"
              accessibilityState={{ disabled: !r.open }}
              disabled={!r.open}
              accessibilityLabel={`${r.title}. ${levelLine(r)}`}
              onPress={() => close(() => router.push(`/practice/level-${r.levelId}` as Href))}
              style={({ pressed }) => [styles.level, { borderBottomColor: p.line, opacity: pressed ? 0.7 : 1 }]}
            >
              <Art xml={object(levelObject[r.levelId], r.open ? levelColors[r.levelId] : soonGrey, r.open ? reward : soonReward)} width={40} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.levelTitle, { color: r.open ? p.ink : p.muted }]}>{r.title}</Text>
                <Text style={[styles.levelLine, { color: p.muted }]}>{levelLine(r)}</Text>
              </View>
              <Art xml={uiIcon(r.open ? 'forward' : 'lock')} width={r.open ? 20 : 18} color={p.muted} />
            </Pressable>
          ))}
          <View style={styles.button}>
            <MainButton label="Close" onPress={() => close()} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingHorizontal: 20 },
  inner: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center' },
  title: { fontFamily: font.display, fontSize: 24, lineHeight: 30 },
  hint: { fontFamily: font.bodyMedium, fontSize: 15, lineHeight: 21, marginTop: 4, marginBottom: 6 },
  level: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 60, borderBottomWidth: 1 },
  levelTitle: { fontFamily: font.bodySemi, fontSize: 17 },
  levelLine: { fontFamily: font.body, fontSize: 14, marginTop: 2 },
  button: { marginTop: 16 },
});
