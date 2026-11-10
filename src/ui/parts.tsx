// Small pieces every step screen shares: the prompt slot, the answer buttons, the main button.
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radius } from '@/theme/tokens';

/** ok: true = right, false = wrong, null = a neutral note. */
export type Verdict = { ok: boolean | null; text: string };

/** The full problem statement, always visible. Fixed height so steps do not jump. */
export function Condition({ text }: { text: string }) {
  const { palette: p } = useTheme();
  return (
    <Text style={[styles.condition, { color: p.ink }]} maxFontSizeMultiplier={1.3}>{text}</Text>
  );
}

/** One fixed-height slot: the question before Check, the feedback after it. No layout jump. */
export function PromptSlot({ question, verdict }: { question: ReactNode; verdict: Verdict | null }) {
  const { palette: p } = useTheme();
  return (
    <View style={styles.prompt} accessibilityLiveRegion="polite">
      {verdict ? (
        <Text style={[styles.feedback, { color: p.ink }]} maxFontSizeMultiplier={1.3}>
          {verdict.ok !== null && (
            <Text style={{ color: verdict.ok ? p.ok : p.bad, fontWeight: '700' }}>{verdict.ok ? '✓ Correct. ' : '✕ Not quite. '}</Text>
          )}
          {verdict.text}
        </Text>
      ) : (
        <Text style={[styles.question, { color: p.ink }]} maxFontSizeMultiplier={1.3}>{question}</Text>
      )}
    </View>
  );
}

export type ChoiceState = 'idle' | 'selected' | 'right' | 'wrong' | 'dim';

/** One answer button. Right and wrong are marked with an icon and words for screen readers, not colour alone. */
export function Choice({ label, state, disabled, onPress, compact }: { label: string; state: ChoiceState; disabled?: boolean; onPress: () => void; compact?: boolean }) {
  const { palette: p } = useTheme();
  const border = state === 'right' ? p.ok : state === 'wrong' ? p.bad : state === 'selected' ? p.ink : p.line;
  const color = state === 'dim' ? p.muted : state === 'right' ? p.ok : state === 'wrong' ? p.bad : p.ink;
  const mark = state === 'right' ? '✓ ' : state === 'wrong' ? '✕ ' : '';
  const result = state === 'right' ? ', correct' : state === 'wrong' ? ', incorrect' : '';
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label + result}
      accessibilityState={{ checked: state === 'selected', disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.choice, { borderColor: border, borderWidth: state === 'idle' || state === 'dim' ? 1.5 : 3, backgroundColor: p.surface }]}
    >
      <Text style={[compact ? styles.choiceTextCompact : styles.choiceText, { color }]} maxFontSizeMultiplier={1.2}>
        {mark}
        {label}
      </Text>
    </Pressable>
  );
}

/** A row of answers; exactly one can be selected. */
export function ChoiceRow({ children }: { children: ReactNode }) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">{children}</View>
  );
}

/** The one main button of the screen. */
export function PrimaryButton({ label, disabled, onPress }: { label: string; disabled?: boolean; onPress: () => void }) {
  const { palette: p } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.primary, { backgroundColor: disabled ? p.line : p.primary }]}
    >
      <Text style={[styles.primaryText, { color: disabled ? p.muted : p.onPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  condition: { fontSize: 15, lineHeight: 20, minHeight: 60 },
  prompt: { height: 64, justifyContent: 'center' },
  question: { fontSize: 17, fontWeight: '700', lineHeight: 22 },
  feedback: { fontSize: 15, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 8 },
  choice: { flex: 1, minHeight: 50, borderRadius: radius.m, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, paddingVertical: 4 },
  choiceText: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  choiceTextCompact: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  primary: { minHeight: 52, borderRadius: radius.m, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontSize: 17, fontWeight: '700' },
});
