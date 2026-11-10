// Predict: pick an answer card (the scene shows it as an arrow on the held sandbag), press "Let go", watch. One attempt.
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';
import type { Playback, PredictStep } from '@/content/types';
import { StageScreen } from '@/scene/StageScreen';
import { useClock } from '@/scene/useClock';
import { ArrowGlyph, Choice, ChoiceRow, FeedbackRow } from '@/ui/parts';
import { nextLabel, stepStyles, type StepViewProps } from './stepStyles';

export type { StepViewProps };

export function PredictStepView({ step, isLast, progress, onDone, onNext }: StepViewProps<PredictStep>) {
  const clock = useClock();
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const [playback, setPlayback] = useState<Playback | null>(null);
  const released = playback !== null;
  const choice = step.options.find((o) => o.id === choiceId) ?? null;

  function letGo() {
    if (!choice) return;
    const next = step.playbackFor(choice.id);
    setPlayback(next);
    clock.play(next.events);
    onDone(choice.correct ? 'independent' : 'revealed');
  }

  /** The glyph on a card follows the sign of the velocity the answer stands for. */
  function glyphFor(id: string): ((color: string) => ReactNode) | undefined {
    const v = step.preview(id);
    if (v === null) return undefined;
    const kind = v > 0 ? 'up' : v < 0 ? 'down' : 'dot';
    return (color) => <ArrowGlyph kind={kind} color={color} />;
  }

  const primary = !released
    ? { label: 'Let go', disabled: !choice, onPress: letGo }
    : clock.status === 'ended'
      ? { label: nextLabel(isLast), onPress: onNext }
      : { label: 'Watch', disabled: true, onPress: () => {} };

  return (
    <StageScreen
      scene={step.scene}
      playback={playback}
      clock={clock}
      title={step.question}
      tag={step.sign}
      facts={step.facts}
      previewValue={!released && choice ? step.preview(choice.id) : null}
      progress={progress}
      primary={primary}
    >
      <View style={stepStyles.sheet}>
        {!released ? (
          <ChoiceRow>
            {step.options.map((o) => (
              <Choice
                key={o.id}
                label={o.label}
                minHeight={78}
                glyph={glyphFor(o.id)}
                state={o.id === choiceId ? 'selected' : 'idle'}
                onPress={() => setChoiceId(o.id)}
              />
            ))}
          </ChoiceRow>
        ) : (
          choice && <FeedbackRow verdict={{ ok: choice.correct === true, text: choice.feedback }} reserve />
        )}
      </View>
    </StageScreen>
  );
}
