import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';
import { PhoneFrame } from '../components/stepParts';
import {
  AreaExplain,
  BuildStep,
  DoneStep,
  ExampleBrake,
  NumbersExplain,
  RuleExplain,
  SquaresExplain,
  Story,
  WarmGraph,
  WarmTap,
} from '../components/steps';
import { buildQuestions } from '../content/brakingDemo';
import { colors } from '../theme/tokens';

// Temporary demo lesson for the visual-direction stage, in small portions:
// intro, watch, 3 short explain screens, 2 warm-ups, 2 build questions, done.
const TOTAL = 10;

export default function Demo() {
  // ?step=N jumps to a screen, handy while designing.
  const { step } = useLocalSearchParams<{ step?: string }>();
  const [i, setI] = useState(Number(step) || 0);
  const next = () => setI((n) => n + 1);
  const p = { index: i, total: TOTAL, onNext: next };

  return (
    <PhoneFrame>
      <View style={{ flex: 1, overflow: 'hidden' }}>
        {/* Each screen slides in from the right while the old one slides out to the left. */}
        <Animated.View
          key={i}
          entering={SlideInRight.duration(380)}
          exiting={SlideOutLeft.duration(300)}
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}
        >
          {i === 0 && <Story {...p} />}
          {i === 1 && <ExampleBrake {...p} />}
          {i === 2 && <AreaExplain {...p} />}
          {i === 3 && <RuleExplain {...p} />}
          {i === 4 && <NumbersExplain {...p} />}
          {i === 5 && <SquaresExplain {...p} />}
          {i === 6 && <WarmGraph {...p} />}
          {i === 7 && <WarmTap {...p} />}
          {i === 8 && <BuildStep {...p} q={buildQuestions[0]} />}
          {i === 9 && <BuildStep {...p} q={buildQuestions[1]} />}
          {i >= 10 && <DoneStep index={TOTAL - 1} total={TOTAL} onRestart={() => setI(0)} />}
        </Animated.View>
      </View>
    </PhoneFrame>
  );
}
