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

export function BackspaceIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 5 H20 V19 H9 L3 12 Z" stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" />
      <Path d="M12.5 9.5 L16.5 14.5 M16.5 9.5 L12.5 14.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

// Raised, chunky button: a darker edge at the bottom. Used for the main button and tiles.
export function ChunkyButton({
  onPress,
  label,
  disabled,
  fill,
  edge,
  textColor,
  style,
  children,
  accessibilityLabel,
}: {
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  fill: string;
  edge: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        {
          minHeight: 52,
          borderRadius: 16,
          backgroundColor: fill,
          borderBottomWidth: pressed ? 1 : 4,
          borderBottomColor: edge,
          marginTop: pressed ? 3 : 0,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {label ? <Text style={{ fontFamily: fonts.display, fontSize: 18, color: textColor }}>{label}</Text> : children}
    </Pressable>
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

// Bottom bar: hint, feedback panel (green / red) or a note, then the one main button.
// An optional secondary button (Hint, Show me) sits beside it, quieter.
export function Footer({
  label,
  onPress,
  disabled,
  feedback,
  note,
  hint,
  secondary,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  feedback?: { ok: boolean; text: string } | null;
  note?: string | null;
  hint?: string | null;
  secondary?: { label: string; onPress: () => void } | null;
}) {
  const text = { flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.ink } as const;
  const ok = feedback?.ok;
  const bg = feedback ? (ok ? colors.correctBg : colors.incorrectBg) : colors.background;
  const fill = disabled ? colors.surfaceRaised : ok ? colors.correct : colors.accent;
  const edge = disabled ? colors.surfaceEdge : ok ? colors.correctEdge : colors.accentEdge;
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, backgroundColor: bg, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
      {hint && (
        <Animated.View key={hint} entering={FadeInDown.duration(220)} style={{ marginBottom: 12, borderLeftWidth: 3, borderLeftColor: colors.accent, paddingLeft: 12 }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.ink }}>
            <Text style={{ fontFamily: fonts.bodySemi, color: colors.accent }}>Hint </Text>
            {hint}
          </Text>
        </Animated.View>
      )}
      {feedback && (
        <Animated.View key={feedback.text} entering={FadeInDown.duration(220)} style={{ flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
          <View style={{ marginTop: 2 }}>{ok ? <CheckIcon color={colors.correct} /> : <CrossIcon color={colors.incorrect} />}</View>
          <Text style={text}>
            <Text style={{ fontFamily: fonts.bodySemi, color: ok ? colors.correct : colors.incorrect }}>{ok ? 'Correct. ' : 'Not quite. '}</Text>
            {feedback.text}
          </Text>
        </Animated.View>
      )}
      {!feedback && note && (
        <Animated.View key={note} entering={FadeInDown.duration(220)} style={{ marginBottom: 12 }}>
          <Text style={text}>{note}</Text>
        </Animated.View>
      )}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {secondary && (
          <Pressable
            onPress={secondary.onPress}
            accessibilityRole="button"
            style={({ pressed }) => ({ minHeight: 56, minWidth: 96, paddingHorizontal: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? colors.surfaceRaised : colors.surface })}
          >
            <Text style={{ fontFamily: fonts.display, fontSize: 17, color: colors.ink }}>{secondary.label}</Text>
          </Pressable>
        )}
        <ChunkyButton label={label} onPress={onPress} disabled={disabled} fill={fill} edge={edge} textColor={disabled ? colors.inkMuted : colors.onAccent} style={{ minHeight: 56, flex: 1 }} />
      </View>
    </View>
  );
}

// Keeps the design phone-sized on a wide web window.
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#07080B' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 430, alignSelf: 'center', backgroundColor: colors.background }}>{children}</View>
    </View>
  );
}
