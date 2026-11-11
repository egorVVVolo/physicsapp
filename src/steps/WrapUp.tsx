// End of a session: what you can do now, an honest count of how the questions went, two quick questions.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Session } from '@/content/types';
import { countOutcomes, onYourOwn, questionCount, type SessionState, type Survey } from '@/session/logic';
import { useTheme } from '@/theme/ThemeContext';
import { font, radius, touch } from '@/theme/tokens';
import { MainButton, CloseIcon, Mark } from '@/ui/parts';

const QUESTIONS: { id: keyof Survey; question: string; options: string[] }[] = [
  { id: 'difficulty', question: 'How was the level?', options: ['Too easy', 'About right', 'Too hard'] },
  { id: 'wouldUse', question: 'Would you use this before a test?', options: ['Yes', 'Maybe', 'No'] },
];

type Props = { session: Session; state: SessionState; survey: Survey; onSurvey: (s: Survey) => void; onClose: () => void };

export function WrapUp({ session, state, survey, onSurvey, onClose }: Props) {
  const { palette: p } = useTheme();
  const n = countOutcomes(state);
  const rows = [
    { mark: 'ok' as const, color: p.ok, count: n.independent, label: 'on your own, first try' },
    { mark: null, color: p.ink, count: n.assisted, label: 'with a second try or a hint' },
    { mark: 'bad' as const, color: p.bad, count: n.revealed, label: 'answer shown' },
  ];
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: p.page }]} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={styles.close} hitSlop={8}>
          <CloseIcon color={p.faint} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: p.ink }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
          Lesson done
        </Text>
        <Text style={[styles.heading, { color: p.ink }]}>You can now</Text>
        {session.youCanNow.map((line) => (
          <View key={line} style={styles.can}>
            <View style={[styles.bar, { backgroundColor: p.vel }]} />
            <Text style={[styles.canText, { color: p.ink }]} maxFontSizeMultiplier={1.3}>{line}</Text>
          </View>
        ))}

        <Text style={[styles.heading, { color: p.ink }]} accessibilityRole="header">
          How the {questionCount(session)} questions went
        </Text>
        <View style={[styles.card, { borderColor: p.line, borderBottomColor: p.lineStrong }]}>
          {rows.map((r) => (
            <View key={r.label} style={styles.countRow} accessible accessibilityLabel={`${r.count} ${r.label}`}>
              <Text style={[styles.count, { color: p.ink }]}>{r.count}</Text>
              <View style={styles.markBox}>{r.mark ? <Mark kind={r.mark} color={r.color} size={16} /> : <Text style={{ color: p.ink, fontFamily: font.bodyBold }}>2×</Text>}</View>
              <Text style={[styles.countLabel, { color: p.ink }]}>{r.label}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.note, { color: p.muted }]}>
          {onYourOwn(state, session) ? 'The exam question was all yours: full marks, no help.' : 'The exam question lost marks. Play again to go for full marks.'}
        </Text>

        {QUESTIONS.map((q) => (
          <View key={q.id} style={{ gap: 8 }}>
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
                    style={[styles.option, { backgroundColor: on ? p.selectBg : '#FFFFFF', borderColor: on ? p.select : p.line, borderBottomColor: on ? p.select : p.lineStrong }]}
                  >
                    <Text style={[styles.optionText, { color: p.ink }]}>{o}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <MainButton label="Done" onPress={onClose} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: { height: 48, paddingHorizontal: 16, justifyContent: 'center' },
  close: { width: touch, height: touch, marginLeft: -14, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 16, gap: 10 },
  title: { fontSize: 28, fontFamily: font.display, letterSpacing: -0.4 },
  heading: { fontSize: 16, fontFamily: font.displaySemi, marginTop: 10 },
  can: { flexDirection: 'row', gap: 10 },
  bar: { width: 4, borderRadius: 2 },
  canText: { flex: 1, fontSize: 15, lineHeight: 21, fontFamily: font.body },
  card: { borderWidth: 2, backgroundColor: '#FFFFFF', borderRadius: radius.m, paddingVertical: 6, paddingHorizontal: 14 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 36 },
  count: { width: 20, fontSize: 20, fontFamily: font.display, fontVariant: ['tabular-nums'], textAlign: 'right' },
  markBox: { width: 22, alignItems: 'center' },
  countLabel: { fontSize: 15, fontFamily: font.body },
  note: { fontSize: 14, lineHeight: 19, fontFamily: font.body },
  options: { flexDirection: 'row', gap: 8 },
  option: { flex: 1, minHeight: touch, borderWidth: 2, borderRadius: radius.m, alignItems: 'center', justifyContent: 'center' },
  optionText: { fontSize: 15, fontFamily: font.bodySemi },
  footer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
});
