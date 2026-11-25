// Small pieces of the Home screen: the greeting, the exam strip, the week of momentum, the levels at a glance,
// a section title and the quiet outline button.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { examLine } from '@/session/exam';
import { greeting, longDate, type levelCounts } from '@/session/progress';
import { addDays, dayKey, type Streak } from '@/session/streak';
import { MomentumChip } from '@/map/Momentum';
import { useTheme } from '@/theme/ThemeContext';
import { font, levelColors, reward } from '@/theme/tokens';

export function Greeting({ now, streak, onMomentum }: { now: Date; streak: Streak; onMomentum: () => void }) {
  const { palette: p } = useTheme();
  return (
    <View style={styles.greetRow}>
      <View style={{ flex: 1 }}>
        <Text accessibilityRole="header" style={[styles.greet, { color: p.ink }]}>
          {greeting(now.getHours())}
        </Text>
        <Text style={[styles.date, { color: p.muted }]}>{longDate(now)}</Text>
      </View>
      <MomentumChip streak={streak} onPress={onMomentum} />
    </View>
  );
}

export function ExamStrip({ exam, now }: { exam: string; now: Date }) {
  const { palette: p } = useTheme();
  const line = examLine(exam, now);
  return (
    <View style={[styles.exam, { backgroundColor: p.paper }]} accessible accessibilityLabel={line.replaceAll('·', ',').toLowerCase()}>
      <Text style={[styles.examText, { color: p.label }]}>{line}</Text>
    </View>
  );
}

export function SectionTitle({ children, right }: { children: string; right?: string }) {
  const { palette: p } = useTheme();
  return (
    <View style={styles.sectionRow}>
      <Text accessibilityRole="header" style={[styles.section, { color: p.ink }]}>
        {children}
      </Text>
      {right && <Text style={[styles.sectionRight, { color: p.muted }]}>{right}</Text>}
    </View>
  );
}

/** A quiet button: an ink outline, no fill. For the second action on a screen (the main one is MainButton). */
export function OutlineButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { palette: p } = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.outline, { borderColor: p.ink, opacity: pressed ? 0.7 : 1 }]}>
      <Text style={[styles.outlineText, { color: p.ink }]}>{label}</Text>
    </Pressable>
  );
}

/** The last seven days, oldest first, today last: a gold disc on a day with a lesson or a review. */
export function weekOf(streak: Streak, today: Date): { key: string; letter: string; done: boolean; today: boolean }[] {
  const t = dayKey(today);
  return Array.from({ length: 7 }, (_, i) => {
    const key = addDays(t, i - 6);
    const [y, m, d] = key.split('-').map(Number);
    return { key, letter: 'SMTWTFS'[new Date(y, m - 1, d).getDay()], done: streak.days.includes(key), today: i === 6 };
  });
}

export function WeekRow({ streak, now }: { streak: Streak; now: Date }) {
  const { palette: p } = useTheme();
  const week = weekOf(streak, now);
  const n = week.filter((d) => d.done).length;
  return (
    <View style={styles.week} accessible accessibilityLabel={`This week: ${n} of 7 days`}>
      {week.map((d) => (
        <View key={d.key} style={styles.day}>
          <View style={[styles.dot, d.done ? { backgroundColor: reward.face, borderColor: reward.side } : { borderColor: p.line }, d.today && { borderColor: p.ink, borderWidth: 3 }]} />
          <Text style={[styles.letter, { color: d.today ? p.ink : p.faint }]}>{d.letter}</Text>
        </View>
      ))}
    </View>
  );
}

export function CourseBars({ levels, onLevel }: { levels: ReturnType<typeof levelCounts>; onLevel: (levelId: string) => void }) {
  const { palette: p, level } = useTheme();
  return (
    <View style={{ gap: 4 }}>
      {levels.map((l) => {
        const c = level(levelColors[l.levelId]);
        return (
          <Pressable key={l.levelId} accessibilityRole="button" accessibilityLabel={`${l.title}: ${l.done} of ${l.total} lessons. Open on the map`} onPress={() => onLevel(l.levelId)} style={styles.bar}>
            <View style={styles.barHead}>
              <View style={[styles.barDot, { backgroundColor: c.main }]} />
              <Text style={[styles.barTitle, { color: p.ink }]}>{l.title}</Text>
              <Text style={[styles.barCount, { color: p.muted }]}>
                {l.done} of {l.total}
              </Text>
            </View>
            <View style={[styles.track, { backgroundColor: p.disabled }]}>
              <View style={[styles.fill, { backgroundColor: c.main, width: `${(l.done / Math.max(1, l.total)) * 100}%` }]} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  greetRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  greet: { fontFamily: font.display, fontSize: 26, lineHeight: 32 },
  date: { fontFamily: font.bodyMedium, fontSize: 14, marginTop: 2 },
  exam: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  examText: { fontFamily: font.mono, fontSize: 11, letterSpacing: 1 },
  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  section: { fontFamily: font.display, fontSize: 19, lineHeight: 24 },
  sectionRight: { fontFamily: font.bodyMedium, fontSize: 14 },
  outline: { minHeight: 48, borderWidth: 2, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { fontFamily: font.displaySemi, fontSize: 16 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 6 },
  dot: { width: 30, height: 30, borderRadius: 15, borderWidth: 2.5 },
  letter: { fontFamily: font.mono, fontSize: 13 },
  bar: { minHeight: 44, justifyContent: 'center', gap: 6, paddingVertical: 4 },
  barHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barDot: { width: 10, height: 10, borderRadius: 5 },
  barTitle: { flex: 1, fontFamily: font.bodySemi, fontSize: 16 },
  barCount: { fontFamily: font.mono, fontSize: 13 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', marginLeft: 20 },
  fill: { height: '100%', borderRadius: 3 },
});
