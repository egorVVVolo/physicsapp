import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';
import { PhoneFrame } from '../components/stepParts';
import {
  BuildStep,
  DoneStep,
  RuleExplain,
  SquaresExplain,
  Story,
  WarmGraph,
  PredictStep,
  StopStep,
} from '../components/steps';
import { buildQuestions } from '../content/brakingDemo';
import { colors } from '../theme/tokens';

// Demo lesson, interaction first: intro, predict (surprise), park-the-car game,
// then the idea (squares, rule), a graph warm-up, 2 build questions, done.
const TOTAL = 9;

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
          {i === 1 && <PredictStep {...p} />}
          {i === 2 && <StopStep {...p} />}
          {i === 3 && <SquaresExplain {...p} />}
          {i === 4 && <RuleExplain {...p} />}
          {i === 5 && <WarmGraph {...p} />}
          {i === 6 && <BuildStep {...p} q={buildQuestions[0]} />}
          {i === 7 && <BuildStep {...p} q={buildQuestions[1]} />}
          {i >= 8 && <DoneStep index={TOTAL - 1} total={TOTAL} onRestart={() => setI(0)} />}
        </Animated.View>
      </View>
    </PhoneFrame>
  );
}
