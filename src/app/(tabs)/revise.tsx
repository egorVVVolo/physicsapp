// Revise: one main thing, today's review, and four tiles under it: practise a level (opens a sheet with the levels),
// your mistakes, the mock set and the notebook. A tile that is not open yet is grey and says when it opens.
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
              <View style={styles.grid}>
                <Rise delay={80} style={styles.cell}>
                  <Tile icon="practice" label="Practise a level" sub={anyDone ? 'Pick a topic' : 'After your first lesson'} onPress={anyDone ? () => setLevels(true) : undefined} />
                </Rise>
                <Rise delay={140} style={styles.cell}>
                  <Tile icon="why" label="Your mistakes" sub={wrong > 0 ? `${wrong} to fix` : 'Nothing to fix'} to={wrong > 0 ? '/practice/mistakes' : undefined} />
                </Rise>
                <Rise delay={200} style={styles.cell}>
                  <Tile
                    icon="progress"
                    label="Mock set"
                    sub={mockOpen ? `${MOCK_SET} questions` : `Opens after ${MOCK_AFTER} lessons (${s.finished.size} of ${MOCK_AFTER})`}
                    to={mockOpen ? '/practice/mock' : undefined}
                  />
                </Rise>
                <Rise delay={260} style={styles.cell}>
                  <Tile icon="notebook" label="Notebook" sub={`${s.finished.size} of ${readyRefs.length} cards`} to="/notebook" />
                </Rise>
              </View>
            </>
          )}
        </View>
      </ScrollView>
      {levels && <LevelSheet finished={s.finished} onClose={() => setLevels(false)} />}
    </View>
  );
}

function Tile({ icon, label, sub, to, onPress }: { icon: UiIconName; label: string; sub: string; to?: Href; onPress?: () => void }) {
  const { palette: p } = useTheme();
  const open = !!to || !!onPress;
  return (
    <Pressable
      accessibilityRole={open ? 'button' : 'text'}
      accessibilityLabel={`${label}. ${sub}`}
      disabled={!open}
      onPress={() => (onPress ? onPress() : to && router.push(to))}
      style={({ pressed }) => [styles.tile, { borderColor: p.line, backgroundColor: open ? p.page : p.paper, opacity: pressed ? 0.7 : 1 }]}
    >
      <Art xml={uiIcon(icon)} width={28} color={open ? p.ink : p.muted} />
      <View style={{ gap: 2 }}>
        <Text style={[styles.tileLabel, { color: open ? p.ink : p.muted }]}>{label}</Text>
        <Text style={[styles.tileSub, { color: p.muted }]}>{sub}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  column: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center', gap: 20 },
  title: { fontFamily: font.display, fontSize: 30, lineHeight: 36 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { width: '47.5%', flexGrow: 1 },
  tile: { flex: 1, minHeight: 132, borderWidth: 2, borderRadius: 18, padding: 14, gap: 16 },
  tileLabel: { fontFamily: font.bodySemi, fontSize: 16, lineHeight: 21 },
  tileSub: { fontFamily: font.body, fontSize: 13.5, lineHeight: 18 },
});
