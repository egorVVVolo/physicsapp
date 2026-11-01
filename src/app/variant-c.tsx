import React from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrakingScene } from '../components/BrakingScene';
import { CheckIcon, CrossIcon, OptionFrame, PhoneFrame, StepFooter, useDemoStep } from '../components/stepParts';
import { brakingDemo } from '../content/brakingDemo';
import { colors } from '../theme/tokens';
import { fonts } from '../theme/fonts';

// C. Colour panel: a solid blue question band, a clean scene, heavy answer bars with big numbers.
export default function VariantC() {
  const step = useDemoStep();
  const { height } = useWindowDimensions();
  const sceneH = Math.min(Math.max(height * 0.37, 260), 340);
  const revealed = step.status === 'correct';

  return (
    <PhoneFrame background={colors.surface}>
      <View style={{ backgroundColor: colors.velocity }}>
        <SafeAreaView edges={['top']}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 20, height: 52 }}>
            <Text style={{ flex: 1, fontFamily: fonts.bodySemi, fontSize: 14, color: '#FFFFFF' }}>Predict · step 1 of 7</Text>
            <Pressable onPress={() => router.replace('/')} accessibilityRole="button" accessibilityLabel="Close lesson" style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}>
              <CrossIcon color="#FFFFFF" size={22} />
            </Pressable>
          </View>
          <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 27, lineHeight: 32, color: '#FFFFFF', letterSpacing: -0.4 }}>
              Twice the speed. How far does it take to stop?
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: '#FFFFFF', marginTop: 8 }}>
              Same car, same braking ({brakingDemo.a} m/s²). From {brakingDemo.u1} m/s it stops in {brakingDemo.base} m. Now {brakingDemo.u2} m/s.
            </Text>
          </View>
        </SafeAreaView>
      </View>

      <BrakingScene height={sceneH} mode={revealed ? 'compare' : 'known'} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4, gap: 8 }}>
        {brakingDemo.options.map((o, i) => {
          const st = step.optionState(i);
          const bg = st === 'correct' ? colors.correct : st === 'wrong' ? colors.incorrect : st === 'selected' ? colors.ink : '#EEF0F4';
          const fg = st === 'idle' ? colors.ink : '#FFFFFF';
          return (
            <OptionFrame
              key={i}
              wrong={st === 'wrong'}
              selected={st !== 'idle'}
              label={`${o.metres} metres`}
              onPress={() => step.select(i)}
              style={{ minHeight: 56, borderRadius: 12, backgroundColor: bg, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 }}
            >
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: st === 'idle' ? colors.inkMuted : '#FFFFFF', width: 18 }}>{'ABCD'[i]}</Text>
              <View style={{ flex: 1 }}>
                {st === 'correct' && <CheckIcon color="#FFFFFF" />}
                {st === 'wrong' && <CrossIcon color="#FFFFFF" />}
              </View>
              <Text style={{ fontFamily: fonts.display, fontSize: 30, color: fg, fontVariant: ['tabular-nums'] }}>
                {o.metres}
                <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 16 }}> m</Text>
              </Text>
            </OptionFrame>
          );
        })}
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.surface }}>
        <StepFooter step={step} accent={colors.ink} radius={12} />
      </SafeAreaView>
    </PhoneFrame>
  );
}
