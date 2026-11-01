import React, { useEffect, useState } from 'react';
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
import { brakingDemo } from '../content/brakingDemo';
import { colors } from '../theme/tokens';
import { fonts } from '../theme/fonts';

export type Status = 'idle' | 'selected' | 'correct' | 'incorrect';
export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong';

const safe = (p: Promise<unknown>) => p.catch(() => {});

export function useDemoStep() {
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  return {
    selected,
    status,
    select(i: number) {
      if (status === 'correct') return;
      setSelected(i);
      setStatus('selected');
      safe(Haptics.selectionAsync());
    },
    check() {
      if (selected === null) return;
      const ok = brakingDemo.options[selected].isCorrect;
      setStatus(ok ? 'correct' : 'incorrect');
      safe(Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error));
    },
    retry() {
      setSelected(null);
      setStatus('idle');
    },
    optionState(i: number): OptionState {
      if (i !== selected) return 'idle';
      if (status === 'correct') return 'correct';
      if (status === 'incorrect') return 'wrong';
      return 'selected';
    },
  };
}

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
    <Animated.View style={anim}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }} style={style}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

// Feedback line + the one main button. Check -> Continue / Try again.
export function StepFooter({
  step,
  accent = colors.ink,
  radius = 14,
}: {
  step: ReturnType<typeof useDemoStep>;
  accent?: string;
  radius?: number;
}) {
  const { status } = step;
  const answered = status === 'correct' || status === 'incorrect';
  const ok = status === 'correct';
  const disabled = status === 'idle';
  const label = status === 'correct' ? 'Continue' : status === 'incorrect' ? 'Try again' : 'Check';
  const onPress = status === 'correct' ? () => {} : status === 'incorrect' ? step.retry : step.check;

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line }}>
      {answered && (
        <Animated.View
          key={status}
          entering={FadeInDown.duration(220)}
          style={{ flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}
        >
          <View style={{ marginTop: 2 }}>
            {ok ? <CheckIcon color={colors.correct} /> : <CrossIcon color={colors.incorrect} />}
          </View>
          <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.ink }}>
            <Text style={{ fontFamily: fonts.bodySemi, color: ok ? colors.correct : colors.incorrect }}>{ok ? 'Correct. ' : 'Not quite. '}</Text>
            {(ok ? brakingDemo.correctText : brakingDemo.incorrectText).replace(/^(Right\.|Not quite\.) /, '')}
          </Text>
        </Animated.View>
      )}
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        style={{
          minHeight: 56,
          borderRadius: radius,
          backgroundColor: disabled ? colors.line : accent,
          alignItems: 'center',
          justifyContent: 'center',
        }}
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
