// Spot the error: tap the line of a worked solution where it first goes wrong. Three tries, then the solution.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Playback, SpotErrorStep } from '@/content/types';
import { StageScreen } from '@/scene/StageScreen';
import { useClock } from '@/scene/useClock';
import { laddered } from '@/session/logic';
import { useTheme } from '@/theme/ThemeContext';
import { radius } from '@/theme/tokens';
import { FeedbackRow, Mark, type FeedbackVerdict } from '@/ui/parts';
import { nextLabel, stepStyles, type StepViewProps } from './stepStyles';

export function SpotErrorStepView({ step, isLast, progress, onDone, onNext }: StepViewProps<SpotErrorStep>) {
  const { palette: p } = useTheme();
  const clock = useClock();
  const [selected, setSelected] = useState<string | null>(null);
  const [cleared, setCleared] = useState<string[]>([]); // lines the learner tapped that are actually fine
  const [done, setDone] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [verdict, setVerdict] = useState<FeedbackVerdict | null>(null);
  const [playback, setPlayback] = useState<Playback | null>(null);

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
      const at = step.lines.findIndex((l) => l.wrong) + 1;
      setDone(true);
      setRevealed(true);
      setVerdict({ ok: false, text: `Line ${at} is the error.` });
      onDone('revealed');
    } else {
      setVerdict({ ok: false, text: wrong === 2 ? step.methodHint : line.feedback });
    }
  }

  const playing = playback !== null && clock.status !== 'ended';
  const primary = !done
    ? { label: 'Check', disabled: !selected, onPress: check }
    : playing
      ? { label: 'Watch', disabled: true, onPress: () => {} }
      : { label: nextLabel(isLast), onPress: onNext };

  return (
    <StageScreen
      scene={step.scene}
      playback={playback}
      clock={clock}
      title={step.question}
      tag={step.sign}
      facts={step.facts}
      compact
      progress={progress}
      primary={primary}
    >
      <View style={stepStyles.sheet}>
        {revealed ? (
          <View style={styles.worked}>
            {step.worked.map((line, i) => (
              <Text key={i} style={[styles.workedLine, { color: p.ink }]} maxFontSizeMultiplier={1.3}>
                {line}
              </Text>
            ))}
          </View>
        ) : (
          <View style={styles.lines} accessibilityRole="radiogroup">
            {step.lines.map((l, i) => {
              const isCleared = cleared.includes(l.id);
              const isError = done && l.wrong === true;
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
                  style={[
                    styles.line,
                    { backgroundColor: isError ? p.badBg : p.card, borderColor: border, borderWidth: isError || isSelected ? 2.5 : 1.5, opacity: isCleared ? 0.65 : 1 },
                  ]}
                >
                  <View style={styles.mark}>
                    {isError ? (
                      <Mark kind="bad" color={p.bad} />
                    ) : isCleared ? (
                      <Mark kind="ok" color={p.muted} />
                    ) : (
                      <Text style={[styles.number, { color: p.muted }]}>{i + 1}</Text>
                    )}
                  </View>
                  <Text style={[styles.lineText, { color: isCleared ? p.muted : p.ink }]} maxFontSizeMultiplier={1.15} numberOfLines={2}>
                    {l.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
        <FeedbackRow reserve verdict={verdict} />
      </View>
    </StageScreen>
  );
}

const styles = StyleSheet.create({
  lines: { gap: 8 },
  line: { minHeight: 48, borderRadius: radius.m, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 12 },
  mark: { width: 20, alignItems: 'center', justifyContent: 'center' },
  number: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  lineText: { flex: 1, fontSize: 16, lineHeight: 22, fontWeight: '600', fontVariant: ['tabular-nums'] },
  worked: { gap: 6 },
  workedLine: { fontSize: 17, lineHeight: 24, fontWeight: '500', textAlign: 'center', fontVariant: ['tabular-nums'] },
});
