// Spot the error: the student's working is drawn on the scene as arrows (s, u, a at the release,
// v at the ground) and a clock tag (t). The learner taps the wrong item, then Check.
// Help: the first miss explains that item, the second gives the method hint, the third shows it.
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import type { Playback, SpotErrorStep } from '@/content/types';
import { WorkingPicture } from '@/scene/interactions';
import { LessonScreen, type Banner, type BarState } from '@/scene/LessonScreen';
import { useClock } from '@/scene/useClock';
import { laddered } from '@/session/logic';
import { useTheme } from '@/theme/ThemeContext';
import { nextLabel, noteFor, text, type StepViewProps } from './stepStyles';

export function SpotErrorStepView({ step, isLast, progress, onDone, onNext }: StepViewProps<SpotErrorStep>) {
  const { palette: p } = useTheme();
  const clock = useClock();
  const [selected, setSelected] = useState<string | null>(null);
  const [cleared, setCleared] = useState<string[]>([]); // items the learner tapped that are actually fine
  const [banner, setBanner] = useState<Banner | null>(null);
  const [finished, setFinished] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (waiting && clock.status === 'ended') setWaiting(false);
  }, [waiting, clock.status]);

  function finish(outcome: ReturnType<typeof laddered>, b: Banner) {
    const pb = step.playback();
    setPlayback(pb);
    clock.play(pb.events);
    setWaiting(true);
    setFinished(true);
    setBanner(b);
    onDone(outcome);
  }

  function check() {
    const item = step.items.find((i) => i.id === selected);
    if (!item) return;
    if (item.wrong) return finish(laddered(cleared.length), { ok: true, title: 'Found it', text: item.feedback });
    const misses = cleared.length + 1;
    setCleared([...cleared, item.id]);
    setSelected(null);
    if (misses >= 3) {
      setRevealed(true);
      const wrong = step.items.find((i) => i.wrong)!;
      return finish('revealed', { ok: false, title: `It was ${wrong.label}`, text: wrong.feedback });
    }
    setBanner({ ok: false, title: 'That one is fine', text: misses === 2 ? step.methodHint : item.feedback });
  }

  const bar: BarState = finished
    ? waiting
      ? { label: 'Watch', disabled: true }
      : { label: nextLabel(isLast), onPress: onNext, tone: banner?.ok ? 'ok' : 'bad', banner }
    : banner
      ? { label: 'Try again', onPress: () => setBanner(null), tone: 'bad', banner }
      : { label: 'Check', disabled: !selected, onPress: check };

  return (
    <LessonScreen
      progress={progress}
      prompt={step.question}
      note={noteFor(step)}
      scene={step.scene}
      playback={playback}
      clock={clock}
      overlay={
        !finished
          ? (g) => (
              <WorkingPicture
                g={g}
                items={step.items}
                selected={selected}
                cleared={cleared}
                revealed={revealed}
                disabled={banner !== null}
                onTap={setSelected}
              />
            )
          : undefined
      }
      strip={
        <Text style={[text.hint, { color: p.muted }]} maxFontSizeMultiplier={1.25}>
          {`Student: ${step.working}`}
        </Text>
      }
      bar={bar}
    />
  );
}
