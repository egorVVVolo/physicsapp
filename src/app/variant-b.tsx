import React from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrakingScene } from '../components/BrakingScene';
import { CheckIcon, CrossIcon, OptionFrame, PhoneFrame, StepFooter, useDemoStep } from '../components/stepParts';
import { brakingDemo } from '../content/brakingDemo';
import { colors } from '../theme/tokens';
import { fonts } from '../theme/fonts';

const STAGE = '#E9EFFF';

// B. Big stage: the scene fills the top half, the question lives in a sheet below it.
export default function VariantB() {
  const step = useDemoStep();
  const { height } = useWindowDimensions();
  const sceneH = Math.min(Math.max(height * 0.5, 320), 440);
  const revealed = step.status === 'correct';

  return (
    <PhoneFrame background={colors.surface}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: STAGE }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 16, height: 52 }}>
          <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i === 0 ? colors.velocity : '#C5D2F5' }} />
            ))}
          </View>
          <Pressable onPress={() => router.replace('/')} accessibilityRole="button" accessibilityLabel="Close lesson" style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}>
            <CrossIcon color={colors.ink} size={22} />
          </Pressable>
        </View>

        <BrakingScene height={sceneH} mode={revealed ? 'compare' : 'known'} />

        <View style={{ flex: 1, backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -4, overflow: 'hidden' }}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 12 }}>
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.velocity }}>Predict</Text>
            <Text style={{ fontFamily: fonts.display, fontSize: 22, lineHeight: 28, color: colors.ink, marginTop: 4 }}>
              From {brakingDemo.u2} m/s, how far to stop?
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.inkMuted, marginTop: 6 }}>
              Same car, same braking ({brakingDemo.a} m/s²). From {brakingDemo.u1} m/s it stops in {brakingDemo.base} m.
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
              {brakingDemo.options.map((o, i) => {
                const st = step.optionState(i);
                const bg = st === 'correct' ? colors.correct : st === 'wrong' ? colors.incorrect : st === 'selected' ? colors.velocity : colors.surface;
                const fg = st === 'idle' ? colors.ink : '#FFFFFF';
                return (
                  <View key={i} style={{ flex: 1 }}>
                    <OptionFrame
                      wrong={st === 'wrong'}
                      selected={st !== 'idle'}
                      label={`${o.metres} metres`}
                      onPress={() => step.select(i)}
                      style={{ minHeight: 76, borderRadius: 18, borderWidth: 2, borderColor: st === 'idle' ? colors.line : bg, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Text style={{ fontFamily: fonts.display, fontSize: 24, color: fg, fontVariant: ['tabular-nums'] }}>{o.metres}</Text>
                      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: st === 'idle' ? colors.inkMuted : '#FFFFFF' }}>m</Text>
                      {st === 'correct' && <View style={{ position: 'absolute', top: 6, right: 6 }}><CheckIcon color="#FFFFFF" size={16} /></View>}
                      {st === 'wrong' && <View style={{ position: 'absolute', top: 6, right: 6 }}><CrossIcon color="#FFFFFF" size={16} /></View>}
                    </OptionFrame>
                  </View>
                );
              })}
            </View>
          </ScrollView>
          <StepFooter step={step} accent={colors.velocity} radius={28} />
        </View>
      </SafeAreaView>
    </PhoneFrame>
  );
}
