// "Leave the lesson?" — slides up over the lesson when × (or Android back) is pressed mid-lesson.
// Staying is the dark main button; leaving is the quiet text button. Tapping the dimmed lesson also stays.
// Progress is already saved after every step, so leaving loses nothing.
import { useEffect } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeContext';
import { font, touch } from '@/theme/tokens';
import { MainButton, useReducedMotionPref } from '@/ui/parts';
import { CONTENT_MAX } from './Frame';

/** How long the sheet takes to slide away before it is removed (ms). */
export const LEAVE_SHEET_OUT = 200;

type Props = { closing: boolean; onStay: () => void; onLeave: () => void };

export function LeaveSheet({ closing, onStay, onLeave }: Props) {
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotionPref();
  const k = useSharedValue(0); // 0 hidden, 1 shown

  useEffect(() => {
    if (reduced) k.set(closing ? 0 : 1);
    else if (closing) k.set(withTiming(0, { duration: LEAVE_SHEET_OUT, easing: Easing.in(Easing.cubic) }));
    else k.set(withSpring(1, { damping: 18, stiffness: 220, mass: 0.9 }));
  }, [closing, reduced, k]);

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility('Leave the lesson? Your progress is saved.');
  }, []);

  const scrim = useAnimatedStyle(() => ({ opacity: Math.min(1, k.get()) }));
  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - k.get()) * 320 }] }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: p.scrim }, scrim]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onStay} accessibilityLabel="Keep going with the lesson" accessibilityRole="button" />
      </Animated.View>
      <Animated.View accessibilityViewIsModal style={[styles.sheet, { backgroundColor: p.page, paddingBottom: insets.bottom + 16 }, sheet]}>
        <View style={styles.inner}>
          <Text style={[styles.title, { color: p.ink }]} accessibilityRole="header">
            Leave the lesson?
          </Text>
          <Text style={[styles.text, { color: p.muted }]}>Your progress is saved. Next time you'll pick up on this screen.</Text>
          <View style={styles.buttons}>
            <MainButton label="Keep going" onPress={onStay} />
            <Pressable accessibilityRole="button" onPress={onLeave} style={({ pressed }) => [styles.leave, { opacity: pressed ? 0.6 : 1 }]}>
              <Text style={[styles.leaveText, { color: p.ink }]}>Leave</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 24, paddingHorizontal: 20 },
  inner: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center' },
  title: { fontSize: 24, fontFamily: font.display },
  text: { fontSize: 16, lineHeight: 23, fontFamily: font.bodyMedium, marginTop: 8 },
  buttons: { marginTop: 22, gap: 6 },
  leave: { minHeight: touch + 4, alignItems: 'center', justifyContent: 'center' },
  leaveText: { fontSize: 17, fontFamily: font.displaySemi },
});
