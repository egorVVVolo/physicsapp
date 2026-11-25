// Me: your momentum (the top spins while it lasts), 12 weeks of activity, a stamp for every lesson, and the honest status
// of each point of the specification — in words, never a percentage. Settings and About at the bottom.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { darkNeutral, illustration, lightNeutral } from '@/art/illustrations';
import { object } from '@/art/objects';
import { uiIcon } from '@/art/uiIcons';
import { APP_NAME } from '@/config';
import { course } from '@/content/course';
import { SPEC } from '@/content/spec';
import { Puck } from '@/figures/Puck';
import { SectionTitle } from '@/home/parts';
import { CONTENT_MAX } from '@/lesson/Frame';
import { momentumOf } from '@/map/Momentum';
import { lastOutcomes } from '@/practice/review';
import { levelOfPoint, specStatus, stampOf, weeksGrid, type SpecStatus } from '@/session/progress';
import { dayKey } from '@/session/streak';
import { useCourseState } from '@/session/useCourseState';
import { useTheme } from '@/theme/ThemeContext';
import { courseBlue, font, levelColors, reward, soonGrey, type LevelColor } from '@/theme/tokens';
import { Art } from '@/ui/Art';
import { Mark } from '@/ui/parts';

const days = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`;
const GOLD: LevelColor = { main: reward.face, lip: reward.lip, soft: reward.soft, face: reward.face, side: reward.side, inner: reward.pale, text: reward.text };

export default function Me() {
  const { palette: p, dark, level } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useCourseState();
  const today = dayKey(new Date());
  const m = momentumOf(s.streak, today);
  const grid = weeksGrid(s.streak.days, today);
  const review = lastOutcomes(s.review);
  const empty = s.loaded && s.finished.size === 0 && s.started.size === 0;

  return (
    <ScrollView style={{ backgroundColor: p.page }} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
      <View style={styles.column}>
        <Text accessibilityRole="header" style={[styles.title, { color: p.ink }]}>
          Me
        </Text>
        {s.loaded && empty && (
          <View style={{ alignItems: 'center', gap: 12 }}>
            <Art xml={illustration('emptyProgress', { ...courseBlue, soft: dark ? p.selectBg : courseBlue.soft }, reward, dark ? darkNeutral : lightNeutral)} width={260} />
            <Text style={[styles.emptyText, { color: p.ink }]}>Finish your first lesson to see progress here.</Text>
          </View>
        )}
        {s.loaded && !empty && (
          <>
            {/* momentum */}
            <View style={styles.momentum} accessible accessibilityLabel={m.paused ? `Momentum paused. Longest: ${days(m.longest)}` : `${days(m.count)} of momentum. Longest: ${days(m.longest)}`}>
              <Art xml={object(m.spinning || m.count > 0 ? 'top' : 'topResting', courseBlue, reward)} width={72} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.big, { color: p.ink }]}>{m.paused ? 'Momentum paused' : `${days(m.count)} of momentum`}</Text>
                <Text style={[styles.sub, { color: p.muted }]}>Longest: {days(m.longest)}</Text>
              </View>
            </View>

            {/* 12 weeks */}
            <View style={{ gap: 8 }}>
              <SectionTitle>12 weeks</SectionTitle>
              <View style={styles.grid} accessible accessibilityLabel={`${grid.flatMap((w) => w.cells).filter((c) => c.done).length} active days in the last 12 weeks`}>
                {grid.map((w, i) => (
                  <View key={i} style={styles.week}>
                    <Text style={[styles.month, { color: p.muted }]}>{w.month ?? ' '}</Text>
                    {w.cells.map((c) => (
                      <View key={c.key} style={[styles.cell, { backgroundColor: c.done ? reward.face : c.future ? 'transparent' : p.disabled }, c.key === today && { borderWidth: 1.5, borderColor: p.ink }]} />
                    ))}
                  </View>
                ))}
              </View>
            </View>

            {/* lesson stamps */}
            <View style={{ gap: 10 }}>
              <SectionTitle>Lessons</SectionTitle>
              {course.levels.map((l) => (
                <View key={l.id} style={{ gap: 6 }}>
                  <Text style={[styles.levelName, { color: level(levelColors[l.id]).text }]}>{l.title.toUpperCase()}</Text>
                  <View style={styles.pucks}>
                    {l.lessons.map((r) => {
                      // finished long ago, before runs were kept: the level's colour
                      const st = !s.finished.has(r.id) ? 'none' : stampOf(r.id, s.lastRuns[r.id]) === 'none' ? 'assisted' : stampOf(r.id, s.lastRuns[r.id]);
                      const label = st === 'independent' ? 'on your own' : st === 'assisted' ? 'with some help' : st === 'revealed' ? 'answers shown' : 'not done yet';
                      return (
                        <View key={r.id} accessible accessibilityLabel={`${r.title}: ${label}`}>
                          {st === 'none' ? (
                            <View style={[styles.outline, { borderColor: p.lineStrong }]} />
                          ) : (
                            <Puck size={32} state="done" color={st === 'independent' ? GOLD : st === 'assisted' ? levelColors[l.id] : soonGrey} />
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>

            {/* the specification */}
            <View style={{ gap: 6 }}>
              <SectionTitle>Specification</SectionTitle>
              {course.levels.map((l) => (
                <View key={l.id} style={{ gap: 2, marginTop: 8 }}>
                  <Text style={[styles.levelName, { color: level(levelColors[l.id]).text }]}>{l.title.toUpperCase()}</Text>
                  {SPEC.filter((pt) => levelOfPoint(pt.n) === l.id).map((pt) => (
                    <SpecRow key={pt.n} n={pt.n} name={pt.name} status={specStatus(pt.n, { finished: s.finished, started: s.started, lastRuns: s.lastRuns, lastReview: review })} color={levelColors[l.id]} />
                  ))}
                </View>
              ))}
            </View>
          </>
        )}

        <View style={[styles.rows, { borderColor: p.line }]}>
          <Pressable accessibilityRole="button" onPress={() => router.push('/settings')} style={[styles.row, { borderBottomWidth: 1, borderBottomColor: p.line }]}>
            <Art xml={uiIcon('settings')} width={24} color={p.ink} />
            <Text style={[styles.rowText, { color: p.ink }]}>Settings</Text>
            <Art xml={uiIcon('forward')} width={20} color={p.muted} />
          </Pressable>
          <View style={styles.row}>
            <Art xml={uiIcon('info')} width={24} color={p.ink} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowText, { color: p.ink }]}>
                {APP_NAME} {Constants.expoConfig?.version ?? ''}
              </Text>
              <Text style={[styles.sub, { color: p.muted }]}>Not affiliated with Pearson Edexcel.</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function SpecRow({ n, name, status, color }: { n: number; name: string; status: SpecStatus; color: LevelColor }) {
  const { palette: p, level } = useTheme();
  const word = status === 'secure' ? 'Secure' : status === 'learning' ? 'Learning' : 'Not started';
  return (
    <View style={[styles.spec, { borderBottomColor: p.line }]} accessible accessibilityLabel={`Point ${n}, ${name}: ${word}`}>
      <Text style={[styles.specN, { color: p.muted }]}>{n}</Text>
      <Text style={[styles.specName, { color: p.ink }]}>{name}</Text>
      <View style={styles.status}>
        {status === 'secure' && <Mark kind="ok" color={p.ok} size={16} />}
        <Text style={[styles.statusText, { color: status === 'secure' ? p.okText : status === 'learning' ? level(color).text : p.muted }]}>{word}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  column: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center', gap: 24 },
  title: { fontFamily: font.display, fontSize: 30, lineHeight: 36 },
  emptyText: { fontFamily: font.display, fontSize: 20, lineHeight: 26, textAlign: 'center' },
  momentum: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  big: { fontFamily: font.display, fontSize: 22, lineHeight: 28 },
  sub: { fontFamily: font.body, fontSize: 14, marginTop: 2 },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  week: { alignItems: 'center', gap: 4 },
  month: { fontFamily: font.mono, fontSize: 9, height: 12 },
  cell: { width: 12, height: 12, borderRadius: 6 },
  levelName: { fontFamily: font.mono, fontSize: 11, letterSpacing: 0.8 },
  pucks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  outline: { width: 32, height: 24, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', marginTop: 0 },
  spec: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40, borderBottomWidth: 1 },
  specN: { fontFamily: font.mono, fontSize: 12, width: 20 },
  specName: { flex: 1, fontFamily: font.body, fontSize: 15 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontFamily: font.bodySemi, fontSize: 14 },
  rows: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 56, paddingVertical: 10 },
  rowText: { flex: 1, fontFamily: font.bodyMedium, fontSize: 17 },
});
