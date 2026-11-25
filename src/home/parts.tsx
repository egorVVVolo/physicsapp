// Small pieces shared by the tabs: the greeting, the exam strip (Me), a section title and the quiet outline button.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { examLine } from '@/session/exam';
import { greeting, longDate } from '@/session/progress';
import type { Streak } from '@/session/streak';
import { MomentumChip } from '@/map/Momentum';
import { useTheme } from '@/theme/ThemeContext';
import { font } from '@/theme/tokens';

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
});
