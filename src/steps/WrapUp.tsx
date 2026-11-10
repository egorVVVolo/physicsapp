// End of a session: what you can do now, an honest count of how the questions went, two quick questions.
// A dark block on top (what you can do) and a light sheet below, like the step screens.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Session } from '@/content/types';
import { countOutcomes, onYourOwn, questionCount, type SessionState, type Survey } from '@/session/logic';
import { useTheme } from '@/theme/ThemeContext';
import { radius, touch } from '@/theme/tokens';
import { CloseIcon, Mark, PrimaryButton, StageSheetLayout } from '@/ui/parts';

const QUESTIONS: { id: keyof Survey; question: string; options: string[] }[] = [
  { id: 'difficulty', question: 'How was the level?', options: ['Too easy', 'About right', 'Too hard'] },
  { id: 'wouldUse', question: 'Would you use this before a test?', options: ['Yes', 'Maybe', 'No'] },
];

type Props = { session: Session; state: SessionState; survey: Survey; onSurvey: (s: Survey) => void; onClose: () => void };

export function WrapUp({ session, state, survey, onSurvey, onClose }: Props) {
  const { palette: p } = useTheme();
  const n = countOutcomes(state);
  const rows = [
    { kind: 'ok' as const, color: p.ok, count: n.independent, label: 'on your own, first try' },
    { kind: 'redo' as const, color: p.ink, count: n.assisted, label: 'with a second try or a hint' },
    { kind: 'bad' as const, color: p.bad, count: n.revealed, label: 'answer shown' },
  ];

  const stage = (
    <View style={styles.stage}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={styles.close} hitSlop={6}>
        <CloseIcon color={p.stageText} />
      </Pressable>
      <Text style={[styles.title, { color: p.stageText }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
        You can now
      </Text>
      {session.youCanNow.map((line) => (
        <View key={line} style={styles.can}>
          <View style={[styles.bar, { backgroundColor: p.vel }]} />
          <Text style={[styles.canText, { color: p.stageText }]} maxFontSizeMultiplier={1.3}>
            {line}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <StageSheetLayout stage={stage} grow="sheet">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: p.ink }]} accessibilityRole="header">
          How the {questionCount(session)} questions went
        </Text>
        <View style={[styles.card, { backgroundColor: p.card, borderColor: p.line }]}>
          {rows.map((r) => (
            <View key={r.label} style={styles.countRow} accessible accessibilityLabel={`${r.count} ${r.label}`}>
              <Text style={[styles.count, { color: p.ink }]}>{r.count}</Text>
              <Mark kind={r.kind} color={r.color} size={16} />
              <Text style={[styles.countLabel, { color: p.ink }]}>{r.label}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.note, { color: p.muted }]}>
          {onYourOwn(state, session) ? 'The exam question was all yours: full marks.' : 'The exam question lost marks. Play again to go for full marks.'}
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
                    style={[styles.option, { backgroundColor: on ? p.ink : p.card, borderColor: on ? p.ink : p.line }]}
                  >
                    <Text style={[styles.optionText, { color: on ? p.onPrimary : p.ink }]}>{o}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
      <PrimaryButton label="Done" onPress={onClose} />
    </StageSheetLayout>
  );
}

const styles = StyleSheet.create({
  stage: { paddingHorizontal: 20, paddingTop: 4, gap: 12 },
  close: { width: touch, height: touch, marginLeft: -14, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.5 },
  can: { flexDirection: 'row', gap: 12 },
  bar: { width: 4, borderRadius: 2 },
  canText: { flex: 1, fontSize: 17, lineHeight: 24 },
  content: { gap: 12, paddingBottom: 8 },
  heading: { fontSize: 16, fontWeight: '700' },
  card: { borderWidth: 1.5, borderRadius: radius.m, paddingVertical: 6, paddingHorizontal: 14 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 36 },
  count: { width: 24, fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'], textAlign: 'right' },
  countLabel: { flex: 1, fontSize: 15 },
  note: { fontSize: 14, lineHeight: 20 },
  questionBlock: { gap: 8 },
  options: { flexDirection: 'row', gap: 8 },
  option: { flex: 1, minHeight: touch, borderWidth: 1.5, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  optionText: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
