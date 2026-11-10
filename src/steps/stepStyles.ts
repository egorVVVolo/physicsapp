// Shared bits of the step views: their props, the sheet layout, the label of the "go on" button.
import { StyleSheet } from 'react-native';
import type { StageScreenProps } from '@/scene/StageScreen';
import type { Outcome } from '@/session/logic';

export type StepViewProps<S> = {
  step: S;
  isLast: boolean;
  progress: StageScreenProps['progress'];
  onDone: (outcome: Outcome) => void;
  onNext: () => void;
};

export const nextLabel = (isLast: boolean) => (isLast ? 'Finish' : 'Next');

export const stepStyles = StyleSheet.create({
  // what goes inside the light sheet of a step
  sheet: { gap: 12 },
});
