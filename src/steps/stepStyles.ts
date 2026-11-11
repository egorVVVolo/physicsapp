// Shared bits of the step views: their props, small text styles, and the line under the prompt.
import { StyleSheet } from 'react-native';
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

/** The small line under the prompt: the sign convention and any given facts. */
export const noteFor = (step: Step) => [step.sign ? 'up is +' : null, ...(step.facts ?? [])].filter(Boolean).join(', ') || undefined;

export const text = StyleSheet.create({
  hint: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  line: { fontSize: 16, lineHeight: 22, fontWeight: '600', textAlign: 'center' },
  equation: { fontSize: 22, fontWeight: '700', textAlign: 'center', fontVariant: ['tabular-nums'] },
  small: { fontSize: 13, textAlign: 'center', marginTop: 4 },
});
