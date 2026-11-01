import React, { useEffect } from 'react';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { fonts } from '../theme/fonts';

const safe = (p: Promise<unknown>) => p.catch(() => {});
export const tapHaptic = () => safe(Haptics.selectionAsync());
export const resultHaptic = (ok: boolean) =>
  safe(Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error));

export function CheckIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Path d="M4 10.5 L8.5 15 L16 5.5" stroke={color} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CrossIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Path d="M5 5 L15 15 M15 5 L5 15" stroke={color} strokeWidth={2.6} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

// Pressable that shakes once when `wrong` turns true.
export function OptionFrame({
  wrong,
  onPress,
  label,
  selected,
  style,
  children,
}: {
  wrong: boolean;
  onPress: () => void;
  label: string;
  selected: boolean;
  style: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const x = useSharedValue(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (wrong && !reduce) {
      x.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 80 }),
        withTiming(-5, { duration: 70 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [wrong, reduce, x]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <Animated.View style={[anim, { flex: 1 }]}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }} style={style}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

// Bottom bar: optional feedback or note, then the one main button.
export function Footer({
  label,
  onPress,
  disabled,
  feedback,
  note,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  feedback?: { ok: boolean; text: string } | null;
  note?: string | null;
}) {
  const text = { flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.ink } as const;
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line }}>
      {feedback && (
        <Animated.View key={feedback.text} entering={FadeInDown.duration(220)} style={{ flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
          <View style={{ marginTop: 2 }}>{feedback.ok ? <CheckIcon color={colors.correct} /> : <CrossIcon color={colors.incorrect} />}</View>
          <Text style={text}>
            <Text style={{ fontFamily: fonts.bodySemi, color: feedback.ok ? colors.correct : colors.incorrect }}>{feedback.ok ? 'Correct. ' : 'Not quite. '}</Text>
            {feedback.text}
          </Text>
        </Animated.View>
      )}
      {!feedback && note && (
        <Animated.View key={note} entering={FadeInDown.duration(220)} style={{ marginBottom: 10 }}>
          <Text style={text}>{note}</Text>
        </Animated.View>
      )}
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        style={{ minHeight: 56, borderRadius: 4, backgroundColor: disabled ? colors.line : colors.ink, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ fontFamily: fonts.display, fontSize: 18, color: disabled ? colors.inkMuted : '#FFFFFF' }}>{label}</Text>
      </Pressable>
    </View>
  );
}

// Keeps the design phone-sized on a wide web window.
export function PhoneFrame({ background, children }: { background: string; children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#E4E6EB' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 430, alignSelf: 'center', backgroundColor: background }}>{children}</View>
    </View>
  );
}
