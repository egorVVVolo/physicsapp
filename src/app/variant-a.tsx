import React from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrakingScene } from '../components/BrakingScene';
import { CheckIcon, CrossIcon, OptionFrame, PhoneFrame, StepFooter, useDemoStep } from '../components/stepParts';
import { brakingDemo } from '../content/brakingDemo';
import { colors } from '../theme/tokens';
import { fonts } from '../theme/fonts';

// A. Engineer's notebook: paper, hairline grid, the scene drawn like a diagram.
export default function VariantA() {
  const step = useDemoStep();
  const { height } = useWindowDimensions();
  const sceneH = Math.min(Math.max(height * 0.33, 240), 320);
  const revealed = step.status === 'correct';

  return (
    <PhoneFrame background={colors.background}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 16, height: 52, gap: 12 }}>
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.inkMuted }}>Predict</Text>
          <View style={{ flex: 1, height: 3, backgroundColor: colors.line, borderRadius: 2 }}>
            <View style={{ width: '14%', height: 3, backgroundColor: colors.ink, borderRadius: 2 }} />
          </View>
          <Pressable onPress={() => router.replace('/')} accessibilityRole="button" accessibilityLabel="Close lesson" style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}>
            <CrossIcon color={colors.ink} size={22} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 32, lineHeight: 36, color: colors.ink, letterSpacing: -0.8 }}>{brakingDemo.title}</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.ink, marginTop: 6 }}>{brakingDemo.prompt}</Text>

          <View style={{ marginTop: 12, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.ink, borderRadius: 4, overflow: 'hidden' }}>
            <BrakingScene height={sceneH} mode={revealed ? 'compare' : 'known'} grid />
          </View>
          <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted, marginTop: 6 }}>Car drawn larger than scale; distances and graph are exact.</Text>

          <View style={{ marginTop: 12, gap: 8 }}>
            {brakingDemo.options.map((o, i) => {
              const st = step.optionState(i);
              const border = st === 'correct' ? colors.correct : st === 'wrong' ? colors.incorrect : st === 'selected' ? colors.ink : colors.line;
              const bg = st === 'correct' ? '#E3F4EC' : st === 'wrong' ? '#FBE7E7' : st === 'selected' ? '#EAF0FF' : colors.surface;
              return (
                <OptionFrame
                  key={i}
                  wrong={st === 'wrong'}
                  selected={st !== 'idle'}
                  label={`${o.metres} metres`}
                  onPress={() => step.select(i)}
                  style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 14, borderWidth: st === 'idle' ? 1.5 : 2.5, borderColor: border, backgroundColor: bg, borderRadius: 4 }}
                >
                  <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.inkMuted, width: 18 }}>{'ABCD'[i]}</Text>
                  <Text style={{ flex: 1, fontFamily: fonts.display, fontSize: 24, color: colors.ink, fontVariant: ['tabular-nums'] }}>
                    {o.metres} <Text style={{ fontFamily: fonts.body, fontSize: 16, color: colors.inkMuted }}>m</Text>
                  </Text>
                  {st === 'correct' && <CheckIcon color={colors.correct} />}
                  {st === 'wrong' && <CrossIcon color={colors.incorrect} />}
                </OptionFrame>
              );
            })}
          </View>
        </ScrollView>
        <StepFooter step={step} accent={colors.ink} radius={4} />
      </SafeAreaView>
    </PhoneFrame>
  );
}
