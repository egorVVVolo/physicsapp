// The end of a practice: how many were right first time, a square per question (as in the lesson breakdown),
// the marks of an exam card, when the next review is, and Done.
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CONTENT_MAX } from '@/lesson/Frame';
import type { Outcome } from '@/session/logic';
import { useTheme } from '@/theme/ThemeContext';
import { courseBlue, font, reward } from '@/theme/tokens';
import { MainButton } from '@/ui/parts';

type Props = { title: string; outcomes: Outcome[]; marks: [number, number] | null; next: string | null; onDone: () => void };

export function PracticeSummary({ title, outcomes, marks, next, onDone }: Props) {
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  const right = outcomes.filter((o) => o === 'independent').length;
  return (
    <View style={[styles.root, { backgroundColor: p.page, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.column}>
        <Text style={[styles.label, { color: p.muted }]}>{title.toUpperCase()}</Text>
        <Text accessibilityRole="header" style={[styles.big, { color: p.ink }]}>
          {right} of {outcomes.length} right first time
        </Text>
        <View style={styles.cells} accessible accessibilityLabel={`${right} right first time, ${outcomes.length - right} not`}>
          {outcomes.map((o, i) => (
            <View key={i} style={[styles.cell, o === 'independent' ? { backgroundColor: reward.face } : { backgroundColor: p.disabled, borderWidth: 1.5, borderColor: p.lineStrong }]} />
          ))}
        </View>
        {marks && (
          <Text style={[styles.line, { color: p.ink }]}>
            Exam card: {marks[0]} of {marks[1]} marks
          </Text>
        )}
        <Text style={[styles.line, { color: p.muted }]}>{next ? `Next review: ${next}` : 'Nothing else due.'}</Text>
      </View>
      <View style={styles.column}>
        <MainButton label="Done" onPress={onDone} tone="level" color={courseBlue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, justifyContent: 'space-between' },
  column: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center', gap: 16 },
  label: { fontFamily: font.mono, fontSize: 12, letterSpacing: 1 },
  big: { fontFamily: font.display, fontSize: 30, lineHeight: 36 },
  cells: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: 22, height: 22, borderRadius: 5 },
  line: { fontFamily: font.bodyMedium, fontSize: 17 },
});
