// Predict: commit to an answer, then watch it play. One attempt. A wrong answer plays as a ghost.
// Answered by dragging the velocity arrow on the sandbag (input 'vector') or by tapping a card.
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import type { PredictStep, Playback } from '@/content/types';
import { speedLabel } from '@/scene/BalloonScene';
import { VelocityDrag } from '@/scene/interactions';
import { LessonScreen, type BarState } from '@/scene/LessonScreen';
import { useClock } from '@/scene/useClock';
import { useTheme } from '@/theme/ThemeContext';
import { Card, CardRow } from '@/ui/parts';
import { nextLabel, noteFor, text, type StepViewProps } from './stepStyles';

export function PredictStepView({ step, isLast, progress, onDone, onNext }: StepViewProps<PredictStep>) {
  const { palette: p } = useTheme();
  const clock = useClock();
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const [drag, setDrag] = useState<number | null>(null); // live arrow value while dragging
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [showVerdict, setShowVerdict] = useState(false);
  const choice = step.options.find((o) => o.id === choiceId) ?? null;
  const checked = playback !== null;

  // the verdict appears once the motion has played: the animation is the explanation
  useEffect(() => {
    if (checked && clock.status === 'ended') setShowVerdict(true);
  }, [checked, clock.status]);

  function check() {
    if (!choice) return;
    const next = step.playbackFor(choice.id);
    setPlayback(next);
    clock.play(next.events);
    onDone(choice.correct ? 'independent' : 'revealed');
  }

  const snaps = step.options.map((o) => step.preview(o.id)).filter((v): v is number => v !== null);
  const optionFor = (v: number) => step.options.find((o) => step.preview(o.id) === v) ?? null;

  const bar: BarState = !checked
    ? { label: 'Check', disabled: !choice, onPress: check }
    : !showVerdict
      ? { label: 'Watch', disabled: true }
      : {
          label: nextLabel(isLast),
          onPress: onNext,
          tone: choice?.correct ? 'ok' : 'bad',
          banner: { ok: choice?.correct === true, title: choice?.correct ? 'Right' : 'Not quite', text: choice?.feedback ?? '' },
        };

  const strip =
    step.input === 'cards' ? (
      <CardRow>
        {step.options.map((o) => (
          <Card
            key={o.id}
            label={o.label}
            disabled={checked}
            onPress={() => setChoiceId(o.id)}
            state={checked ? (o.correct ? 'right' : o.id === choiceId ? 'wrong' : 'dim') : o.id === choiceId ? 'selected' : 'idle'}
          />
        ))}
      </CardRow>
    ) : !checked ? (
      <Text style={[text.hint, { color: p.muted }]} maxFontSizeMultiplier={1.25}>
        Drag the arrow on the sandbag up or down
      </Text>
    ) : null;

  return (
    <LessonScreen
      progress={progress}
      prompt={step.question}
      note={noteFor(step)}
      scene={step.scene}
      playback={playback}
      clock={clock}
      overlay={
        step.input === 'vector' && !checked
          ? (g) => (
              <VelocityDrag
                g={g}
                value={drag}
                snaps={snaps}
                onChange={setDrag}
                onRelease={(v) => {
                  setDrag(v);
                  setChoiceId(optionFor(v)?.id ?? null);
                }}
                label={(v) => (v === null ? 'v = ?' : speedLabel(Math.round(v * 10)))}
              />
            )
          : undefined
      }
      strip={strip}
      bar={bar}
    />
  );
}
