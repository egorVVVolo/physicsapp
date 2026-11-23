// A hidden page for the owner: figure style 2.0 (V2 plan 3.1) on the four pilot figures, before and after,
// in the light and the dark theme. Open /gallery/style in the web version. Nothing in the app links here.
// "Before" is drawn by the same code in the old style (`classic`); the page goes once every level has the new style.
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { lessons } from '@/content/lessons';
import type { Fig } from '@/content/types';
import { Sheet } from '@/figures/Sheet';
import { ThemeOverride, useTheme } from '@/theme/ThemeContext';
import { font, radius } from '@/theme/tokens';

/** The first figure in the course that matches, with the lesson it comes from. */
function find(test: (f: Fig) => boolean): { fig: Fig; where: string } {
  for (const lesson of Object.values(lessons))
    for (const s of [...lesson.story, ...lesson.skillCheck]) if ('fig' in s && s.fig && test(s.fig)) return { fig: s.fig, where: `${lesson.title} · ${s.id}` };
  throw new Error('no such figure');
}

const PILOT = [
  { title: 'Lift: person, scales, cabin', ...find((f) => f.kind === 'lift' && f.forces.length === 2 && !f.unknownN) },
  { title: 'Crate on the floor, rope', ...find((f) => f.kind === 'crate' && f.by === 'rope' && f.forces.length > 0) },
  { title: 'Trolleys', ...find((f) => f.kind === 'collide') },
  { title: 'Two cars', ...find((f) => f.kind === 'road' && f.cars.length === 2) },
];

export default function StyleGallery() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      {[false, true].map((dark) => (
        <ThemeOverride key={String(dark)} dark={dark}>
          <Section dark={dark} />
        </ThemeOverride>
      ))}
    </ScrollView>
  );
}

function Section({ dark }: { dark: boolean }) {
  const { palette: p } = useTheme();
  return (
    <View style={[styles.section, { backgroundColor: p.page }]}>
      <Text style={[styles.h1, { color: p.ink }]}>{dark ? 'Dark theme' : 'Light theme'}</Text>
      {PILOT.map((item, i) => (
        <View key={item.title} style={styles.item}>
          <Text style={[styles.h2, { color: p.ink }]}>{item.title}</Text>
          <Text style={[styles.where, { color: p.muted }]}>{item.where}</Text>
          <View style={styles.pair}>
            <Text style={[styles.tag, { color: p.muted, borderColor: p.lineStrong }]}>BEFORE</Text>
            <ThemeOverride dark={dark} classic>
              <Sheet fig={item.fig} n={i + 1} still />
            </ThemeOverride>
            <Text style={[styles.tag, { color: p.ink, borderColor: p.ink }]}>AFTER</Text>
            <Sheet fig={item.fig} n={i + 1} still />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { maxWidth: 560, width: '100%', alignSelf: 'center' },
  section: { padding: 16, gap: 24 },
  h1: { fontFamily: font.display, fontSize: 24 },
  h2: { fontFamily: font.displaySemi, fontSize: 18 },
  where: { fontFamily: font.mono, fontSize: 11 },
  item: { gap: 6 },
  pair: { gap: 8 },
  tag: { alignSelf: 'flex-start', fontFamily: font.mono, fontSize: 11, letterSpacing: 1.2, borderWidth: 1, borderRadius: radius.s, paddingHorizontal: 8, paddingVertical: 2, marginTop: 6 },
});
