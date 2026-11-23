// A hidden page for checks: every figure of the course, still (compact sheets: no pen, no motion, no taps).
// Open /gallery/figs in the web version. Used to compare drawings before and after a change to the figure kit,
// and to look over a style change level by level. Nothing in the app links here.
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { lessons } from '@/content/lessons';
import type { Fig } from '@/content/types';
import { Sheet } from '@/figures/Sheet';
import { useTheme } from '@/theme/ThemeContext';
import { font } from '@/theme/tokens';

/** Every distinct figure, in course order, with where it comes from. */
function allFigs(): { where: string; fig: Fig }[] {
  const seen = new Set<string>();
  const out: { where: string; fig: Fig }[] = [];
  const add = (where: string, fig: Fig | undefined) => {
    if (!fig) return;
    const key = JSON.stringify(fig);
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ where, fig });
  };
  for (const lesson of Object.values(lessons)) {
    for (const s of [...lesson.story, ...lesson.skillCheck]) {
      if ('fig' in s) add(`${lesson.id}/${s.id}`, s.fig);
      if (s.kind === 'estimate') add(`${lesson.id}/${s.id} after`, s.after);
      if (s.kind === 'graphPick') s.graphs.forEach((g) => add(`${lesson.id}/${s.id} ${g.id}`, g.fig));
    }
    add(`${lesson.id}/recap`, lesson.recap.fig);
  }
  return out;
}

const FIGS = allFigs();

export default function FigGallery() {
  const { palette: p } = useTheme();
  return (
    <ScrollView style={{ backgroundColor: p.page }} contentContainerStyle={styles.list}>
      <Text style={[styles.title, { color: p.ink }]}>{`${FIGS.length} figures`}</Text>
      {FIGS.map(({ where, fig }, i) => (
        <View key={where} style={styles.item} testID={`fig-${i}`}>
          <Text style={[styles.where, { color: p.muted }]}>{`${i + 1} · ${fig.kind} · ${where}`}</Text>
          <Sheet fig={fig} n={i + 1} compact />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 18, maxWidth: 560, width: '100%', alignSelf: 'center' },
  title: { fontFamily: font.display, fontSize: 22 },
  item: { gap: 6 },
  where: { fontFamily: font.mono, fontSize: 11 },
});
