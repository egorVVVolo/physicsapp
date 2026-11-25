// The Notebook: one formula card per finished lesson, in course order — a cheat sheet you built yourself.
// A card is there once its lesson is finished (the saved progress says so); nothing else is stored.
// After the cards comes one closed card naming the lesson that adds the next one.
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { darkNeutral, illustration, lightNeutral } from '@/art/illustrations';
import { object } from '@/art/objects';
import { uiIcon } from '@/art/uiIcons';
import { course } from '@/content/course';
import { lessons } from '@/content/lessons';
import { CONTENT_MAX } from '@/lesson/Frame';
import { NoteCard } from '@/notebook/NoteCard';
import { loadFinishedLessons, loadProgress } from '@/session/storage';
import { useTheme } from '@/theme/ThemeContext';
import { courseBlue, font, levelColors, reward, soonGrey } from '@/theme/tokens';
import { Art } from '@/ui/Art';
import { MainButton } from '@/ui/parts';

const allRefs = course.levels.flatMap((l) => l.lessons.map((r) => ({ r, levelId: l.id })));

export default function Notebook() {
  const { palette: p, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const [finished, setFinished] = useState<Set<string> | null>(null);
  const [turned, setTurned] = useState(false); // a card was turned: the hint goes away

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      // finished now, or finished once and being replayed: the card stays either way
      Promise.all([loadFinishedLessons(), ...Object.values(lessons).map(async (l) => [l.id, (await loadProgress(l))?.state.finished === true] as const)]).then(
        ([ever, ...pairs]) => alive && setFinished(new Set([...ever, ...pairs.filter(([, done]) => done).map(([id]) => id)])),
      );
      return () => {
        alive = false;
      };
    }, []),
  );

  const back = () => (router.canGoBack() ? router.back() : router.replace('/revise'));
  const cards = finished ? allRefs.filter((x) => finished.has(x.r.id) && lessons[x.r.id]) : [];
  /** The lesson that adds the next card: the first one you can play and have not finished. */
  const nextRef = finished ? allRefs.find((x) => x.r.ready && !finished.has(x.r.id)) : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: p.page, paddingTop: insets.top }}>
      <View style={styles.column}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back to the map" onPress={back} hitSlop={4} style={styles.backButton}>
            <Art xml={uiIcon('back')} width={24} color={p.ink} />
          </Pressable>
          <Text accessibilityRole="header" style={[styles.heading, { color: p.ink }]}>
            Notebook
          </Text>
          {finished && (
            <Text style={[styles.count, { color: p.muted }]} accessibilityLabel={`${cards.length} of ${allRefs.length} cards`}>
              {cards.length} of {allRefs.length}
            </Text>
          )}
        </View>
      </View>

      {finished && cards.length === 0 && (
        <View style={[styles.column, styles.empty, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.emptyMiddle}>
            <Art xml={illustration('notebookEmpty', { ...courseBlue, soft: dark ? p.selectBg : courseBlue.soft }, reward, dark ? darkNeutral : lightNeutral)} width={260} />
            <Text style={[styles.emptyText, { color: p.ink }]}>Finish a lesson to get its card.</Text>
          </View>
          <MainButton label="Go to the map" onPress={back} />
        </View>
      )}

      {cards.length > 0 && (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: insets.bottom + 32 }}>
          <View style={styles.list}>
            {cards.map(({ r, levelId }) => (
              <NoteCard
                key={r.id}
                lessonId={r.id}
                levelId={levelId}
                title={r.title}
                card={lessons[r.id].card}
                color={levelColors[levelId] ?? courseBlue}
                onFlip={() => setTurned(true)}
                onReplay={() => router.push(`/lesson/${r.id}`)}
              />
            ))}
            <View style={[styles.locked, { borderColor: p.lineStrong }]}>
              <Art xml={object('lock', soonGrey, reward)} width={44} />
              <Text style={[styles.lockedText, { color: p.muted }]} maxFontSizeMultiplier={1.3}>
                {nextRef ? (
                  <>
                    Finish <Text style={{ color: p.ink, fontFamily: font.bodySemi }}>{nextRef.r.title}</Text> to add its card.
                  </>
                ) : (
                  'New lessons will add more cards.'
                )}
              </Text>
            </View>
            {!turned && (
              <View style={styles.hint}>
                <Art xml={uiIcon('tap')} width={18} color={p.faint} />
                <Text style={[styles.hintText, { color: p.faint }]}>Tap a card to turn it over</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  column: { width: '100%', maxWidth: CONTENT_MAX + 40, alignSelf: 'center', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 8, paddingBottom: 12 },
  backButton: { width: 44, height: 44, marginLeft: -10, alignItems: 'center', justifyContent: 'center' },
  heading: { flex: 1, fontFamily: font.display, fontSize: 26, lineHeight: 32 },
  count: { fontFamily: font.mono, fontSize: 14 },
  list: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center', gap: 16 },
  locked: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderStyle: 'dashed', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, minHeight: 86 },
  lockedText: { flex: 1, fontFamily: font.body, fontSize: 15, lineHeight: 21 },
  hint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 },
  hintText: { fontFamily: font.bodySemi, fontSize: 14 },
  empty: { flex: 1, justifyContent: 'space-between' },
  emptyMiddle: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
  emptyText: { fontFamily: font.display, fontSize: 20, lineHeight: 26, textAlign: 'center' },
});
