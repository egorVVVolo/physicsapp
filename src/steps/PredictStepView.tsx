// Predict: pick an outcome, then watch it play. One attempt.
import { useState } from 'react';
import { View } from 'react-native';
import type { Playback, PredictStep } from '@/content/types';
import { SceneFrame, type FrameView } from '@/scene/SceneFrame';
import { useClock } from '@/scene/useClock';
import type { Outcome } from '@/session/logic';
import { Choice, ChoiceRow, Condition, PrimaryButton, PromptSlot } from '@/ui/parts';
import { stepStyles } from './stepStyles';

export type StepViewProps<S> = { step: S; isLast: boolean; onDone: (outcome: Outcome) => void; onNext: () => void };

export function PredictStepView({ step, isLast, onDone, onNext }: StepViewProps<PredictStep>) {
  const clock = useClock();
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [view, setView] = useState<FrameView>('scene');
  const checked = playback !== null;
  const choice = step.options.find((o) => o.id === choiceId) ?? null;

  function check() {
    if (!choice) return;
    const next = step.playbackFor(choice.id);
    setPlayback(next);
    clock.play(next.events);
    onDone(choice.correct ? 'independent' : 'revealed');
  }

  const long = step.options.some((o) => o.label.length > 14);
  return (
    <View style={stepStyles.step}>
      <Condition text={step.condition} />
      <SceneFrame scene={step.scene} playback={playback} clock={clock} view={view} onView={setView} hideVelocity />
      <PromptSlot question={step.question} verdict={checked && choice ? { ok: choice.correct === true, text: choice.feedback } : null} />
      <ChoiceRow>
        {step.options.map((o) => (
          <Choice
            key={o.id}
            label={o.label}
            compact={long}
            disabled={checked}
            onPress={() => setChoiceId(o.id)}
            state={checked ? (o.correct ? 'right' : o.id === choiceId ? 'wrong' : 'dim') : o.id === choiceId ? 'selected' : 'idle'}
          />
        ))}
      </ChoiceRow>
      {!checked ? (
        <PrimaryButton label="Check" disabled={!choice} onPress={check} />
      ) : clock.status === 'ended' ? (
        <PrimaryButton label={isLast ? 'Finish' : 'Next'} onPress={onNext} />
      ) : (
        <PrimaryButton label="Watch" disabled onPress={() => {}} />
      )}
    </View>
  );
}
