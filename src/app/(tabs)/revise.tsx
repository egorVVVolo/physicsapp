// Revise: keep what you learned fresh. Today's review (with what is due next), practice by level (each level's object,
// grey until a lesson of it is finished), your mistakes, the mock set and the notebook. Different shapes on purpose:
// the review is a card, the levels a list with their objects, the rest rows with icons.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { levelObject, object } from '@/art/objects';
import { uiIcon, type UiIconName } from '@/art/uiIcons';
import { SectionTitle } from '@/home/parts';
import { ReviewCard } from '@/home/ReviewCard';
import { CONTENT_MAX } from '@/lesson/Frame';
import { bankOf } from '@/practice/bank';
import { pickReview, whenText } from '@/practice/review';
import { MOCK_AFTER, MOCK_SET, levelLine, levelRows, mistakeCount, nextReview } from '@/practice/reviseRows';
import { readyRefs } from '@/session/progress';
import { dayKey } from '@/session/streak';
import { useCourseState } from '@/session/useCourseState';
import { useTheme } from '@/theme/ThemeContext';
import { font, levelColors, reward, soonGrey, soonReward } from '@/theme/tokens';
import { Art } from '@/ui/Art';

export default function Revise() {
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useCourseState();
  const today = dayKey(new Date());
  const due = pickReview(s.review, bankOf(s.finished), today).length;
  const nr = nextReview(s.review, today);
  const nextText = nr ? `${whenText(nr.day, today)}, ${nr.count} ${nr.count === 1 ? 'question' : 'questions'}` : null;
  const wrong = mistakeCount(s.review, s.finished);
  const mockOpen = s.finished.size >= MOCK_AFTER;

  return (
    <ScrollView style={{ backgroundColor: p.page }} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
      <View style={styles.column}>
        <Text accessibilityRole="header" style={[styles.title, { color: p.ink }]}>
          Revise
        </Text>
        {s.loaded && (
          <>
            <ReviewCard detail due={due} minutes={Math.max(1, Math.ceil(Math.min(due, 5) * 0.6))} next={nextText} empty={s.finished.size === 0} onStart={() => router.push('/practice/review')} />

            <View style={{ gap: 4 }}>
              <SectionTitle>Practise a level</SectionTitle>
              {levelRows(s.finished).map((r) => (
                <Pressable
                  key={r.levelId}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !r.open }}
                  disabled={!r.open}
                  accessibilityLabel={`${r.title}. ${levelLine(r)}`}
                  onPress={() => router.push(`/practice/level-${r.levelId}` as Href)}
                  style={({ pressed }) => [styles.level, { borderBottomColor: p.line, opacity: pressed ? 0.7 : 1 }]}
                >
                  <Art xml={object(levelObject[r.levelId], r.open ? levelColors[r.levelId] : soonGrey, r.open ? reward : soonReward)} width={40} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.levelTitle, { color: r.open ? p.ink : p.muted }]}>{r.title}</Text>
                    <Text style={[styles.levelLine, { color: p.muted }]}>{levelLine(r)}</Text>
                  </View>
                  <Art xml={uiIcon(r.open ? 'forward' : 'lock')} width={r.open ? 20 : 18} color={p.muted} />
                </Pressable>
              ))}
            </View>

            <View style={[styles.rows, { borderColor: p.line }]}>
              <Row icon="why" label={wrong > 0 ? `Your mistakes · ${wrong}` : 'No mistakes to fix right now'} to={wrong > 0 ? '/practice/mistakes' : undefined} />
              <Row icon="practice" label={`Mock set · ${MOCK_SET} questions`} sub={mockOpen ? 'One try each, an exam card at the end' : `Opens after ${MOCK_AFTER} lessons (${s.finished.size} of ${MOCK_AFTER})`} to={mockOpen ? '/practice/mock' : undefined} />
              <Row icon="notebook" label={`Notebook · ${s.finished.size} of ${readyRefs.length}`} to="/notebook" last />
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

function Row({ icon, label, sub, to, last }: { icon: UiIconName; label: string; sub?: string; to?: Href; last?: boolean }) {
  const { palette: p } = useTheme();
  return (
    <Pressable
      accessibilityRole={to ? 'button' : 'text'}
      disabled={!to}
      onPress={() => to && router.push(to)}
      style={({ pressed }) => [styles.row, !last && { borderBottomWidth: 1, borderBottomColor: p.line }, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Art xml={uiIcon(icon)} width={24} color={to ? p.ink : p.muted} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowText, { color: to ? p.ink : p.muted }]}>{label}</Text>
        {sub && <Text style={[styles.rowSub, { color: p.muted }]}>{sub}</Text>}
      </View>
      {to && <Art xml={uiIcon('forward')} width={20} color={p.muted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  column: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center', gap: 24 },
  title: { fontFamily: font.display, fontSize: 30, lineHeight: 36 },
  level: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 64, borderBottomWidth: 1 },
  levelTitle: { fontFamily: font.bodySemi, fontSize: 17 },
  levelLine: { fontFamily: font.body, fontSize: 14, marginTop: 2 },
  rows: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 56, paddingVertical: 10 },
  rowText: { fontFamily: font.bodyMedium, fontSize: 17 },
  rowSub: { fontFamily: font.body, fontSize: 14, marginTop: 2 },
});
