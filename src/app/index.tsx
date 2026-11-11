// Home: the course map. Levels follow the WPH11 specification; each lesson is a puck on a path.
// Tap a ready puck to pick it; the card at the bottom starts it. Lessons not built yet say "Soon".
import { useCallback, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { course } from '@/content/course';
import { lessons } from '@/content/lessons';
import type { LessonRef } from '@/content/types';
import { Puck } from '@/figures/Puck';
import { loadProgress } from '@/session/storage';
import { useTheme } from '@/theme/ThemeContext';
import { font, levelColors, radius } from '@/theme/tokens';
import { MainButton } from '@/ui/parts';
import { CONTENT_MAX } from '@/lesson/Frame';

type Status = 'new' | 'started' | 'done';
const ZIGZAG = [0, 32, 48, 32, 0, -32, -48, -32];

export default function CourseMap() {
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<Record<string, Status>>({});
  const ready = useMemo(() => course.levels.flatMap((l) => l.lessons.map((r) => ({ r, level: l.id }))).filter((x) => x.r.ready), []);
  const [picked, setPicked] = useState<string>(ready[0]?.r.id ?? '');
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const levelY = useRef<Record<string, number>>({});
  const scrolled = useRef(false);
  /** Once the levels are laid out, bring the picked lesson's level into view. */
  const scrollToPicked = () => {
    const level = ready.find((x) => x.r.id === picked)?.level;
    const y = level ? levelY.current[level] : undefined;
    if (scrolled.current || y === undefined) return;
    scrolled.current = true;
    scroll.current?.scrollTo({ y: Math.max(0, y - 12), animated: false });
  };

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      Promise.all(
        ready.map(async ({ r }) => {
          const saved = await loadProgress(lessons[r.id]);
          return [r.id, !saved ? 'new' : saved.state.finished ? 'done' : 'started'] as const;
        }),
      ).then((pairs) => alive && setStatus(Object.fromEntries(pairs)));
      return () => {
        alive = false;
      };
    }, [ready]),
  );

  const pickedRef = ready.find((x) => x.r.id === picked);
  const pickedStatus = status[picked] ?? 'new';
  const color = levelColors[pickedRef?.level ?? 'forces'];

  return (
    <View style={{ flex: 1, backgroundColor: p.page, paddingTop: insets.top }}>
      <ScrollView ref={scroll} contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Text accessibilityRole="header" style={[styles.title, { color: p.ink }]}>{course.title}</Text>
          <Text style={[styles.subtitle, { color: p.muted }]}>Edexcel IAL Unit 1 (WPH11)</Text>
          {course.levels.map((level, li) => {
            const c = levelColors[level.id];
            return (
              <View
                key={level.id}
                style={{ marginTop: 28 }}
                onLayout={(e) => {
                  levelY.current[level.id] = e.nativeEvent.layout.y;
                  scrollToPicked();
                }}
              >
                <View style={[styles.levelCard, { borderColor: c.main, backgroundColor: c.soft }]}>
                  <Text style={[styles.levelNo, { color: c.lip }]}>Level {li + 1}</Text>
                  <Text accessibilityRole="header" style={[styles.levelTitle, { color: p.ink }]}>{level.title}</Text>
                </View>
                <View style={styles.path}>
                  {level.lessons.map((r, i) => (
                    <PuckRow key={r.id} r={r} offset={ZIGZAG[i % ZIGZAG.length]} color={c} status={status[r.id]} picked={picked === r.id} onPick={() => setPicked(r.id)} />
                  ))}
                </View>
              </View>
            );
          })}
          <View style={{ height: 200 }} />
        </View>
      </ScrollView>

      {pickedRef && (
        <View style={[styles.dock, { paddingBottom: insets.bottom + 14 }]}>
          <View style={[styles.dockCard, { borderColor: p.line, backgroundColor: p.page }]}>
            <Text style={[styles.dockTitle, { color: p.ink }]}>{pickedRef.r.title}</Text>
            <Text style={[styles.dockMeta, { color: p.muted }]}>
              Spec points {pickedRef.r.spec.join(', ')}. About {lessons[pickedRef.r.id].minutes} minutes.
            </Text>
            <MainButton
              tone="level"
              color={color}
              label={pickedStatus === 'started' ? 'Continue' : pickedStatus === 'done' ? 'Play again' : 'Start'}
              onPress={() => router.push(`/lesson/${pickedRef.r.id}`)}
            />
          </View>
        </View>
      )}
    </View>
  );
}

function PuckRow({ r, offset, color, status, picked, onPick }: { r: LessonRef; offset: number; color: { main: string; lip: string; soft: string }; status?: Status; picked: boolean; onPick: () => void }) {
  const { palette: p } = useTheme();
  const state = !r.ready ? 'soon' : status === 'done' ? 'done' : picked ? 'current' : 'open';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${r.title}${r.ready ? (status === 'done' ? ', done' : '') : ', coming soon'}`}
      accessibilityState={{ disabled: !r.ready, selected: picked }}
      disabled={!r.ready}
      onPress={onPick}
      style={[styles.row, { transform: [{ translateX: offset }] }]}
    >
      <Puck size={84} state={state} color={color} />
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: r.ready ? p.ink : p.faint }]} numberOfLines={2}>
          {r.title}
        </Text>
        {!r.ready && <Text style={[styles.soon, { color: p.faint }]}>Soon</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  column: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center' },
  title: { fontFamily: font.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.3 },
  subtitle: { fontFamily: font.bodyMedium, fontSize: 16, marginTop: 4 },
  levelCard: { borderWidth: 2, borderBottomWidth: 5, borderRadius: radius.m, paddingVertical: 12, alignItems: 'center' },
  levelNo: { fontFamily: font.displaySemi, fontSize: 14 },
  levelTitle: { fontFamily: font.display, fontSize: 22, marginTop: 2 },
  path: { marginTop: 16, gap: 10, alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, width: 220 },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: font.bodySemi, fontSize: 16, lineHeight: 21 },
  soon: { fontFamily: font.bodyMedium, fontSize: 13, marginTop: 2 },
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16 },
  dockCard: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center', borderWidth: 2, borderRadius: 24, padding: 18, gap: 8, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  dockTitle: { fontFamily: font.display, fontSize: 22 },
  dockMeta: { fontFamily: font.bodyMedium, fontSize: 15, marginBottom: 6 },
});
