// Idea: one short thought, shown on the scene. The scene plays by itself and repeats. No answer, no outcome.
import { useEffect } from 'react';
import type { IdeaStep } from '@/content/types';
import { StageScreen } from '@/scene/StageScreen';
import { useClock } from '@/scene/useClock';
import { nextLabel, type StepViewProps } from './stepStyles';

const REPEAT_AFTER_MS = 1600;

export function IdeaStepView({ step, isLast, progress, onNext }: StepViewProps<IdeaStep>) {
  const clock = useClock();
  const { play, status } = clock;

  // play once when the screen opens
  useEffect(() => {
    play(step.playback.events);
  }, [play, step]);

  // when it ends, wait a moment and play again
  useEffect(() => {
    if (status !== 'ended') return;
    const id = setTimeout(() => play(step.playback.events), REPEAT_AFTER_MS);
    return () => clearTimeout(id);
  }, [status, play, step]);

  return (
    <StageScreen
      scene={step.scene}
      playback={step.playback}
      clock={clock}
      title={step.question}
      line={step.line}
      tag={step.sign}
      facts={step.facts}
      highlight={step.highlight}
      progress={progress}
      primary={{ label: nextLabel(isLast), onPress: onNext }}
    >
      {null}
    </StageScreen>
  );
}
