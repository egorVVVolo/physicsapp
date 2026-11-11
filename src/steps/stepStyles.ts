// Shared bits of the step views: their props, small text styles, and the line under the prompt.
import { StyleSheet } from 'react-native';
import { font } from '@/theme/tokens';
import type { LessonScreenProps } from '@/scene/LessonScreen';
import type { Step } from '@/content/types';
import type { Outcome } from '@/session/logic';

export type StepViewProps<S> = {
  step: S;
  isLast: boolean;
  progress: LessonScreenProps['progress'];
  onDone: (outcome: Outcome) => void;
  onNext: () => void;
};

export const nextLabel = (isLast: boolean) => (isLast ? 'Finish' : 'Continue');

/** The small line under the prompt: the goal of a multi-stage task, the sign convention and any given facts. */
export const noteFor = (step: Step, withGoal = false) => {
  const rest = [step.sign ? 'up is +' : null, ...(step.facts ?? [])].filter(Boolean).join(', ');
  const goal = withGoal && step.type === 'build' ? step.goal : '';
  return [goal, rest].filter(Boolean).join('  ·  ') || undefined;
};

export const text = StyleSheet.create({
  hint: { fontSize: 14, fontFamily: font.bodySemi, textAlign: 'center' },
  line: { fontSize: 16, lineHeight: 22, fontFamily: font.bodySemi, textAlign: 'center' },
  equation: { fontSize: 22, fontFamily: font.bodyBold, textAlign: 'center', fontVariant: ['tabular-nums'] },
  small: { fontSize: 13, fontFamily: font.body, textAlign: 'center', marginTop: 4 },
});
