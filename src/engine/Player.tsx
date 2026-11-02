import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { PhoneFrame } from '../components/stepParts';
import { colors } from '../theme/tokens';
import { BeatsFrame, CompleteFrame, GradedFrame, PredictFrame } from './frames';
import { completeLesson, LessonProgress, recordStep, saveProgress, StepRecord } from './progress';
import { isGraded, Lesson } from './types';

// Plays any lesson: one step at a time, saving after each, sliding between steps.
export function Player({ lesson, initial, onExit }: { lesson: Lesson; initial: LessonProgress; onExit: () => void }) {
  const [i, setI] = useState(Math.min(initial.stepIndex, lesson.steps.length - 1));
  const progress = useRef(initial);
  const step = lesson.steps[i];
  const total = lesson.steps.length;
  const scoredIds = lesson.steps.filter(isGraded).map((s) => s.id);

  const finish = (record: StepRecord) => {
    const nextIndex = i + 1;
    let p = recordStep(progress.current, step.id, record, nextIndex);
    if (lesson.steps[nextIndex]?.kind === 'complete') p = completeLesson(p, scoredIds);
    progress.current = p;
    saveProgress(p);
    setI(nextIndex);
  };
  const frame = { index: i, total, onClose: onExit, onFinish: finish };

  return (
    <PhoneFrame>
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <Animated.View key={i} entering={SlideInRight.duration(380)} exiting={SlideOutLeft.duration(300)} style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}>
          {step.kind === 'beats' && <BeatsFrame {...frame} step={step} />}
          {step.kind === 'predict' && <PredictFrame {...frame} step={step} />}
          {isGraded(step) && <GradedFrame {...frame} step={step} />}
          {step.kind === 'complete' && <CompleteFrame lesson={lesson} step={step} records={progress.current.records} index={i} total={total} onClose={onExit} />}
        </Animated.View>
      </View>
    </PhoneFrame>
  );
}
