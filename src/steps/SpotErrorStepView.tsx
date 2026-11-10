// Spot the error: tap the line of a worked solution where it first goes wrong.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Playback, SpotErrorStep } from '@/content/types';
import { SceneFrame, type FrameView } from '@/scene/SceneFrame';
import { useClock } from '@/scene/useClock';
import { laddered } from '@/session/logic';
import { useTheme } from '@/theme/ThemeContext';
import { radius, touch } from '@/theme/tokens';
import { Condition, PrimaryButton, PromptSlot, type Verdict } from '@/ui/parts';
import type { StepViewProps } from './PredictStepView';
import { stepStyles } from './stepStyles';

export function SpotErrorStepView({ step, isLast, onDone, onNext }: StepViewProps<SpotErrorStep>) {
  const { palette: p } = useTheme();
  const clock = useClock();
  const [selected, setSelected] = useState<string | null>(null);
  const [cleared, setCleared] = useState<string[]>([]); // lines the learner tapped that are actually fine
  const [done, setDone] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [view, setView] = useState<FrameView>('scene');

  function check() {
    const line = step.lines.find((l) => l.id === selected);
    if (!line) return;
    if (line.wrong) {
      const next = step.playback();
      setDone(true);
      setVerdict({ ok: true, text: line.feedback });
      setPlayback(next);
      clock.play(next.events);
      onDone(laddered(cleared.length));
      return;
    }
    const wrong = cleared.length + 1;
    setCleared([...cleared, line.id]);
    setSelected(null);
    if (wrong >= 3) {
      setDone(true);
      setRevealed(true);
      setVerdict({ ok: false, text: 'It is the line that is left. The solution shows the fix.' });
      setView('solution');
      onDone('revealed');
    } else {
      setVerdict({ ok: false, text: wrong === 2 ? step.methodHint : line.feedback });
    }
  }

  const playing = playback !== null && clock.status !== 'ended';
  return (
    <View style={stepStyles.step}>
      <Condition text={step.condition} />
      <SceneFrame scene={step.scene} playback={playback} clock={clock} view={view} onView={setView} solution={revealed ? step.worked : undefined} />
      <PromptSlot question={step.question} verdict={verdict} />
      <View style={styles.lines} accessibilityRole="radiogroup">
        {step.lines.map((l, i) => {
          const isCleared = cleared.includes(l.id);
          const isError = done && l.wrong;
          const isSelected = selected === l.id;
          const border = isError ? p.bad : isSelected ? p.ink : p.line;
          return (
            <Pressable
              key={l.id}
              accessibilityRole="radio"
              accessibilityLabel={`Line ${i + 1}: ${l.text}${isCleared ? ', this line is fine' : isError ? ', this is the error' : ''}`}
              accessibilityState={{ checked: isSelected, disabled: done || isCleared }}
              disabled={done || isCleared}
              onPress={() => {
                setSelected(l.id);
                setVerdict(null);
              }}
              style={[styles.line, { backgroundColor: p.surface, borderColor: border, borderWidth: isError || isSelected ? 3 : 1.5 }]}
            >
              <Text style={[styles.mark, { color: isError ? p.bad : isCleared ? p.ok : p.muted }]}>{isError ? '✕' : isCleared ? '✓' : i + 1}</Text>
              <Text style={[styles.lineText, { color: isCleared ? p.muted : p.ink }]} maxFontSizeMultiplier={1.15} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
                {l.text}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {!done ? (
        <PrimaryButton label="Check" disabled={!selected} onPress={check} />
      ) : playing ? (
        <PrimaryButton label="Watch" disabled onPress={() => {}} />
      ) : (
        <PrimaryButton label={isLast ? 'Finish' : 'Next'} onPress={onNext} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  lines: { gap: 6 },
  line: { minHeight: touch, borderRadius: radius.s, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, gap: 10 },
  mark: { width: 14, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  lineText: { flex: 1, fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },
});
