// Revise: one main thing, today's review, and a list under it: practise a level (opens a sheet with the levels),
// your mistakes, the mock set and the notebook. A row that is not open yet is grey, has no arrow and says why.
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { uiIcon, type UiIconName } from '@/art/uiIcons';
import { ReviewCard } from '@/home/ReviewCard';
import { CONTENT_MAX } from '@/lesson/Frame';
import { bankOf } from '@/practice/bank';
import { LevelSheet } from '@/practice/LevelSheet';
import { pickReview, whenText } from '@/practice/review';
import { MOCK_AFTER, MOCK_SET, mistakeCount, nextReview } from '@/practice/reviseRows';
import { readyRefs } from '@/session/progress';
import { dayKey } from '@/session/streak';
import { useCourseState } from '@/session/useCourseState';
import { useTheme } from '@/theme/ThemeContext';
import { font } from '@/theme/tokens';
import { Art } from '@/ui/Art';
import { Rise } from '@/ui/motion';

export default function Revise() {
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useCourseState();
  const [levels, setLevels] = useState(false);
  const today = dayKey(new Date());
  const due = pickReview(s.review, bankOf(s.finished), today).length;
  const nr = nextReview(s.review, today);
  const nextText = nr ? `${whenText(nr.day, today)}, ${nr.count} ${nr.count === 1 ? 'question' : 'questions'}` : null;
  const wrong = mistakeCount(s.review, s.finished);
  const mockOpen = s.finished.size >= MOCK_AFTER;
  const anyDone = s.finished.size > 0;

  return (
    <View style={{ flex: 1, backgroundColor: p.page }}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
        <View style={styles.column}>
          <Text accessibilityRole="header" style={[styles.title, { color: p.ink }]}>
            Revise
          </Text>
          {s.loaded && (
            <>
              <Rise>
                <ReviewCard due={due} minutes={Math.max(1, Math.ceil(Math.min(due, 5) * 0.6))} next={nextText} empty={!anyDone} onStart={() => router.push('/practice/review')} />
              </Rise>
              <Rise delay={80}>
                <View style={[styles.rows, { borderColor: p.line }]}>
                  <Row icon="practice" label="Practise a level" sub={anyDone ? 'Pick a topic' : 'After your first lesson'} onPress={anyDone ? () => setLevels(true) : undefined} />
                  <Row icon="why" label="Your mistakes" sub={wrong > 0 ? `${wrong} to fix` : 'Nothing to fix'} to={wrong > 0 ? '/practice/mistakes' : undefined} />
                  <Row
                    icon="progress"
                    label="Mock set"
                    sub={mockOpen ? `${MOCK_SET} questions` : `Opens after ${MOCK_AFTER} lessons (${s.finished.size} of ${MOCK_AFTER})`}
                    to={mockOpen ? '/practice/mock' : undefined}
                  />
                  <Row icon="notebook" label="Notebook" sub={`${s.finished.size} of ${readyRefs.length} cards`} to="/notebook" last />
                </View>
              </Rise>
            </>
          )}
        </View>
      </ScrollView>
      {levels && <LevelSheet finished={s.finished} onClose={() => setLevels(false)} />}
    </View>
  );
}

/** One way in. A row that is not open yet is grey, has no arrow and says why. */
function Row({ icon, label, sub, to, onPress, last = false }: { icon: UiIconName; label: string; sub: string; to?: Href; onPress?: () => void; last?: boolean }) {
  const { palette: p } = useTheme();
  const open = !!to || !!onPress;
  return (
    <Pressable
      accessibilityRole={open ? 'button' : 'text'}
      accessibilityLabel={`${label}. ${sub}`}
      disabled={!open}
      onPress={() => (onPress ? onPress() : to && router.push(to))}
      style={({ pressed }) => [styles.row, !last && { borderBottomWidth: 1, borderBottomColor: p.line }, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Art xml={uiIcon(icon)} width={24} color={open ? p.ink : p.muted} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.rowLabel, { color: open ? p.ink : p.muted }]}>{label}</Text>
        <Text style={[styles.rowSub, { color: p.muted }]}>{sub}</Text>
      </View>
      {open ? <Art xml={uiIcon('forward')} width={20} color={p.muted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  column: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center', gap: 20 },
  title: { fontFamily: font.display, fontSize: 30, lineHeight: 36 },
  rows: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 64, paddingVertical: 12 },
  rowLabel: { fontFamily: font.bodyMedium, fontSize: 17, lineHeight: 22 },
  rowSub: { fontFamily: font.body, fontSize: 14, lineHeight: 18 },
});
