// End of a session: what you can do now, an honest count of how the steps went, two quick questions.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Session } from '@/content/types';
import { countOutcomes, onYourOwn, type SessionState, type Survey } from '@/session/logic';
import { useTheme } from '@/theme/ThemeContext';
import { radius, touch } from '@/theme/tokens';
import { PrimaryButton } from '@/ui/parts';

const QUESTIONS: { id: keyof Survey; question: string; options: string[] }[] = [
  { id: 'difficulty', question: 'How was the level?', options: ['Too easy', 'About right', 'Too hard'] },
  { id: 'wouldUse', question: 'Would you use this before a test?', options: ['Yes', 'Maybe', 'No'] },
];

type Props = { session: Session; state: SessionState; survey: Survey; onSurvey: (s: Survey) => void; onClose: () => void };

export function WrapUp({ session, state, survey, onSurvey, onClose }: Props) {
  const { palette: p } = useTheme();
  const n = countOutcomes(state);
  const rows = [
    { mark: '✓', color: p.ok, count: n.independent, label: 'on your own, first try' },
    { mark: '↺', color: p.ink, count: n.assisted, label: 'with a second try or a hint' },
    { mark: '✕', color: p.bad, count: n.revealed, label: 'answer shown' },
  ];
  return (
    <View style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: p.ink }]} accessibilityRole="header">You can now</Text>
        {session.youCanNow.map((line) => (
          <View key={line} style={styles.can}>
            <View style={[styles.bar, { backgroundColor: p.vel }]} />
            <Text style={[styles.canText, { color: p.ink }]}>{line}</Text>
          </View>
        ))}

        <Text style={[styles.heading, { color: p.ink }]} accessibilityRole="header">How the {session.steps.length} steps went</Text>
        <View style={[styles.card, { backgroundColor: p.surface, borderColor: p.line }]}>
          {rows.map((r) => (
            <View key={r.label} style={styles.countRow} accessible accessibilityLabel={`${r.count} ${r.label}`}>
              <Text style={[styles.count, { color: p.ink }]}>{r.count}</Text>
              <Text style={[styles.countMark, { color: r.color }]}>{r.mark}</Text>
              <Text style={[styles.countLabel, { color: p.ink }]}>{r.label}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.note, { color: p.muted }]}>
          {onYourOwn(state, session) ? 'The exam question was all yours: full marks, no help.' : 'The exam question lost marks. Play the session again to go for full marks.'}
        </Text>

        {QUESTIONS.map((q) => (
          <View key={q.id} style={styles.questionBlock}>
            <Text style={[styles.heading, { color: p.ink }]}>{q.question}</Text>
            <View style={styles.options} accessibilityRole="radiogroup">
              {q.options.map((o) => {
                const on = survey[q.id] === o;
                return (
                  <Pressable
                    key={o}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    onPress={() => onSurvey({ ...survey, [q.id]: o })}
                    style={[styles.option, { backgroundColor: on ? p.ink : p.surface, borderColor: on ? p.ink : p.line }]}
                  >
                    <Text style={[styles.optionText, { color: on ? p.surface : p.ink }]}>{o}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
      <PrimaryButton label="Done" onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: 8 },
  content: { gap: 10, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginTop: 4 },
  can: { flexDirection: 'row', gap: 10 },
  bar: { width: 4, borderRadius: 2 },
  canText: { flex: 1, fontSize: 16, lineHeight: 22 },
  heading: { fontSize: 16, fontWeight: '700', marginTop: 10 },
  card: { borderWidth: 1.5, borderRadius: radius.m, paddingVertical: 6, paddingHorizontal: 14 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 34 },
  count: { width: 20, fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'], textAlign: 'right' },
  countMark: { width: 18, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  countLabel: { fontSize: 15 },
  note: { fontSize: 14, lineHeight: 19 },
  questionBlock: { gap: 8 },
  options: { flexDirection: 'row', gap: 8 },
  option: { flex: 1, minHeight: touch, borderWidth: 1.5, borderRadius: radius.m, alignItems: 'center', justifyContent: 'center' },
  optionText: { fontSize: 15, fontWeight: '700' },
});
