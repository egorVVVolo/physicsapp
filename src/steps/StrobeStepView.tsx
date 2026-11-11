// Strobe: the sandbag frozen at three moments. The learner sets the acceleration arrow on each
// (tap to turn it), then the real flight plays with its acceleration arrow. One attempt.
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import type { AccDir, Playback, StrobeStep } from '@/content/types';
import { position, velocity } from '@/physics/kinematics';
import { nextDir, StrobeFrames } from '@/scene/interactions';
import { LessonScreen, type BarState } from '@/scene/LessonScreen';
import { useClock } from '@/scene/useClock';
import { judgeStrobe } from '@/session/logic';
import { useTheme } from '@/theme/ThemeContext';
import { nextLabel, noteFor, text, type StepViewProps } from './stepStyles';

export function StrobeStepView({ step, isLast, progress, onDone, onNext }: StepViewProps<StrobeStep>) {
  const { palette: p } = useTheme();
  const clock = useClock();
  const [answers, setAnswers] = useState<Record<string, AccDir | undefined>>({});
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [showVerdict, setShowVerdict] = useState(false);
  const checked = playback !== null;
  const complete = step.frames.every((f) => answers[f.id]);
  const verdict = complete ? judgeStrobe(step, answers as Record<string, AccDir>) : null;

  useEffect(() => {
    if (checked && clock.status === 'ended') setShowVerdict(true);
  }, [checked, clock.status]);

  function check() {
    if (!complete || !verdict) return;
    const next = step.playbackFor(answers as Record<string, AccDir>);
    setPlayback(next);
    clock.play(next.events);
    onDone(verdict.ok ? 'independent' : 'revealed');
  }

  const frames = step.frames.map((f) => ({ id: f.id, label: f.label, h: position(f.t, step.scene.body), v: velocity(f.t, step.scene.body) }));
  const bar: BarState = !checked
    ? { label: 'Check', disabled: !complete, onPress: check }
    : !showVerdict
      ? { label: 'Watch', disabled: true }
      : { label: nextLabel(isLast), onPress: onNext, tone: verdict?.ok ? 'ok' : 'bad', banner: { ok: verdict?.ok === true, title: verdict?.ok ? 'Right' : 'Not quite', text: verdict?.text ?? '' } };

  return (
    <LessonScreen
      progress={progress}
      prompt={step.question}
      instruction={step.instruction}
      instructionHidden={checked}
      note={noteFor(step)}
      scene={step.scene}
      playback={playback}
      clock={clock}
      showBalloon={checked}
      showHeldSack={false}
      overlay={
        !checked
          ? (g) => <StrobeFrames g={g} frames={frames} answers={answers} onTap={(id) => setAnswers((a) => ({ ...a, [id]: nextDir(a[id] ?? null) }))} />
          : undefined
      }
      strip={
        !checked ? (
          <Text style={[text.hint, { color: p.muted }]} maxFontSizeMultiplier={1.25}>
            Blue arrows show its velocity at each moment.
          </Text>
        ) : null
      }
      bar={bar}
    />
  );
}
