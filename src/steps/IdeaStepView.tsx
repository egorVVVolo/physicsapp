// Idea: one short thought, shown on the scene. The scene plays by itself and repeats. No answer, no outcome.
import { useEffect } from 'react';
import { Text } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import type { IdeaStep } from '@/content/types';
import { LessonScreen } from '@/scene/LessonScreen';
import { useClock } from '@/scene/useClock';
import { useTheme } from '@/theme/ThemeContext';
import { nextLabel, noteFor, text, type StepViewProps } from './stepStyles';

const REPEAT_AFTER_MS = 1600;

export function IdeaStepView({ step, isLast, progress, onNext }: StepViewProps<IdeaStep>) {
  const { palette: p } = useTheme();
  const clock = useClock();
  const { play, status } = clock;
  const reduced = useReducedMotion();

  useEffect(() => {
    play(step.playback.events);
  }, [play, step]);
  // when it ends, wait a moment and play again (once only with reduced motion; replay stays available)
  useEffect(() => {
    if (status !== 'ended' || reduced) return;
    const id = setTimeout(() => play(step.playback.events), REPEAT_AFTER_MS);
    return () => clearTimeout(id);
  }, [status, play, step, reduced]);

  return (
    <LessonScreen
      progress={progress}
      prompt={step.question}
      note={noteFor(step)}
      scene={step.scene}
      playback={step.playback}
      clock={clock}
      highlight={step.highlight}
      strip={<Text style={[text.line, { color: p.ink }]} maxFontSizeMultiplier={1.25}>{step.line}</Text>}
      bar={{ label: nextLabel(isLast), onPress: onNext }}
    />
  );
}
