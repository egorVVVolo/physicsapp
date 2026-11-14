// The day streak on the map: a chip in the top bar (the momentum top and the number of days) and,
// on a tap, a sheet with the top, the last seven days and the longest run.
// The top spins while the run lasts and lies down when a day was missed. No points, no freezes,
// and no words like "lost" or "broken": a missed day simply pauses it.
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { object } from '@/art/objects';
import { CONTENT_MAX } from '@/lesson/Frame';
import { currentRun, dayKey, longestRun, type Streak } from '@/session/streak';
import { useTheme } from '@/theme/ThemeContext';
import { courseBlue, font, reward } from '@/theme/tokens';
import { Art } from '@/ui/Art';
import { MainButton } from '@/ui/parts';
import { useReducedMotionPref } from '@/ui/motion';

const days = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`;

/** What the streak looks like today. */
export function momentumOf(s: Streak, today = dayKey(new Date())) {
  const { count, spinning } = currentRun(s, today);
  const paused = count === 0 && s.days.length > 0;
  return { count, spinning, paused, longest: longestRun(s) };
}

export function MomentumChip({ streak, onPress }: { streak: Streak; onPress: () => void }) {
  const { palette: p } = useTheme();
  const { count, paused } = momentumOf(streak);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={paused ? 'Momentum paused' : `${days(count)} of momentum`}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, { borderColor: p.chipLine, backgroundColor: p.page, transform: [{ translateY: pressed ? 2 : 0 }] }]}
    >
      <Art xml={object(paused ? 'topResting' : 'top', courseBlue, reward)} width={28} />
      {!paused && <Text style={[styles.chipText, { color: p.ink }]}>{count}</Text>}
    </Pressable>
  );
}

const OUT = 200; // ms, the sheet sliding away

export function MomentumSheet({ streak, onClose }: { streak: Streak; onClose: () => void }) {
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotionPref();
  const k = useSharedValue(reduced ? 1 : 0);
  const [closing, setClosing] = useState(false);
  const today = new Date();
  const { count, paused, longest } = momentumOf(streak, dayKey(today));
  const empty = streak.days.length === 0;

  useEffect(() => {
    if (!reduced) k.set(withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) }));
  }, [k, reduced]);
  const title = empty ? 'Start your momentum' : paused ? 'Momentum paused' : `${days(count)} of momentum`;
  const caption = empty ? 'Finish a lesson to set it spinning.' : paused ? 'Paused. Finish a lesson to spin it up again.' : 'It stays up while it spins.';
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`${title}. ${caption}`);
  }, [title, caption]);

  const close = () => {
    if (closing) return;
    setClosing(true);
    if (reduced) return onClose();
    k.set(withTiming(0, { duration: OUT, easing: Easing.in(Easing.cubic) }));
    setTimeout(onClose, OUT);
  };

  // the last seven days, oldest first; today is the last one
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - i));
    return { key: dayKey(d), letter: 'SMTWTFS'[d.getDay()], today: i === 6, done: streak.days.includes(dayKey(d)) };
  });
  const weekCount = week.filter((d) => d.done).length;

  const scrim = useAnimatedStyle(() => ({ opacity: k.get() }));
  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - k.get()) * 420 }] }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: p.scrim }, scrim]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close" accessibilityRole="button" />
      </Animated.View>
      <Animated.View accessibilityViewIsModal style={[styles.sheet, { backgroundColor: p.page, paddingBottom: insets.bottom + 16 }, sheet]}>
        <View style={styles.inner}>
          <Art xml={object(paused || empty ? 'topResting' : 'top', courseBlue, reward)} width={96} />
          <Text style={[styles.title, { color: p.ink }]} accessibilityRole="header">
            {title}
          </Text>
          <Text style={[styles.caption, { color: p.muted }]}>{caption}</Text>
          <View style={styles.week} accessible accessibilityLabel={`This week: ${weekCount} of 7 days`}>
            {week.map((d) => (
              <View key={d.key} style={styles.day}>
                <View
                  style={[
                    styles.dot,
                    d.done ? { backgroundColor: reward.face, borderColor: reward.side } : { borderColor: p.line },
                    d.today && { borderColor: p.ink, borderWidth: 3 },
                  ]}
                />
                <Text style={[styles.letter, { color: d.today ? p.ink : p.faint }]}>{d.letter}</Text>
              </View>
            ))}
          </View>
          {longest > 0 && <Text style={[styles.longest, { color: p.muted }]}>Longest: {days(longest)}</Text>}
          <View style={styles.button}>
            <MainButton label="Got it" onPress={close} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, minWidth: 44, paddingHorizontal: 10, borderWidth: 2, borderBottomWidth: 4, borderRadius: 999, justifyContent: 'center' },
  chipText: { fontFamily: font.displaySemi, fontSize: 16 },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingHorizontal: 20 },
  inner: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center', alignItems: 'center' },
  title: { fontFamily: font.display, fontSize: 24, lineHeight: 30, marginTop: 6, textAlign: 'center' },
  caption: { fontFamily: font.bodyMedium, fontSize: 16, lineHeight: 22, marginTop: 6, textAlign: 'center' },
  week: { flexDirection: 'row', gap: 10, marginTop: 20 },
  day: { alignItems: 'center', gap: 6 },
  dot: { width: 30, height: 30, borderRadius: 15, borderWidth: 2.5 },
  letter: { fontFamily: font.mono, fontSize: 13 },
  longest: { fontFamily: font.bodyMedium, fontSize: 15, marginTop: 16 },
  button: { alignSelf: 'stretch', marginTop: 20 },
});
