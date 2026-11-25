// The first screen of Learn: the courses. The built course is a big card with a moving picture, how far you are and
// one tap to its map; the others are quiet "Coming soon" cards with a still line drawing.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { uiIcon } from '@/art/uiIcons';
import { courses, type CourseArt, type CourseEntry } from '@/content/courses';
import { CONTENT_MAX } from '@/lesson/Frame';
import { readyRefs } from '@/session/progress';
import { useCourseState } from '@/session/useCourseState';
import { useTheme } from '@/theme/ThemeContext';
import { courseBlue, font } from '@/theme/tokens';
import { Art } from '@/ui/Art';
import { Rise } from '@/ui/motion';
import { SceneBox } from './CourseScene';

export function CoursePicker({ onOpen }: { onOpen: (id: string) => void }) {
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useCourseState();
  const total = readyRefs.length;
  return (
    <ScrollView style={{ backgroundColor: p.page }} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
      <View style={styles.column}>
        <Rise>
          <Text accessibilityRole="header" style={[styles.title, { color: p.ink }]}>
            Courses
          </Text>
          <Text style={[styles.sub, { color: p.muted }]}>Edexcel International A Level Physics</Text>
        </Rise>
        {courses.map((c, i) => (
          <Rise key={c.id} delay={90 + i * 90}>
            {c.ready ? <ReadyCard c={c} done={s.finished.size} total={total} loaded={s.loaded} onOpen={() => onOpen(c.id)} /> : <SoonCard c={c} />}
          </Rise>
        ))}
      </View>
    </ScrollView>
  );
}

function ReadyCard({ c, done, total, loaded, onOpen }: { c: CourseEntry; done: number; total: number; loaded: boolean; onOpen: () => void }) {
  const { palette: p } = useTheme();
  const line = !loaded ? ' ' : done === 0 ? `${total} lessons · not started` : done >= total ? `All ${total} lessons done` : `${done} of ${total} lessons`;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${c.title}, ${c.unit}. ${line}. Open`} onPress={onOpen} style={[styles.lip, { backgroundColor: p.lineStrong }]}>
      {({ pressed }) => (
        <View style={[styles.card, { backgroundColor: p.page, borderColor: p.line, transform: [{ translateY: pressed ? 4 : 0 }] }]}>
          <View style={[styles.scene, { backgroundColor: p.paper, borderBottomColor: p.paperLine }]} pointerEvents="none">
            <SceneBox />
          </View>
          <View style={styles.body}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.unit, { color: p.label }]}>{c.unit.toUpperCase()}</Text>
              <Text style={[styles.cardTitle, { color: p.ink }]}>{c.title}</Text>
              <Text style={[styles.line, { color: p.muted }]}>{line}</Text>
              <View style={[styles.track, { backgroundColor: p.disabled }]}>
                <View style={[styles.fill, { backgroundColor: courseBlue.main, width: `${total ? Math.min(100, (done / total) * 100) : 0}%` }]} />
              </View>
            </View>
            <View style={[styles.go, { backgroundColor: courseBlue.main }]}>
              <Art xml={uiIcon('forward')} width={22} color="#FFFFFF" />
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}

function SoonCard({ c }: { c: CourseEntry }) {
  const { palette: p } = useTheme();
  return (
    <View accessible accessibilityLabel={`${c.title}, ${c.unit}. Coming soon`} style={[styles.soon, { borderColor: p.line }]}>
      <View style={[styles.soonArt, { backgroundColor: p.paper }]}>
        <SoonArt kind={c.art} color={p.lineStrong} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={[styles.unit, { color: p.faint }]}>{c.unit.toUpperCase()}</Text>
        <Text style={[styles.soonTitle, { color: p.muted }]}>{c.title}</Text>
      </View>
      <View style={[styles.tag, { borderColor: p.line }]}>
        <Text style={[styles.tagText, { color: p.faint }]}>SOON</Text>
      </View>
    </View>
  );
}

/** A small still line drawing for a course that is not built yet. */
function SoonArt({ kind, color }: { kind: CourseArt; color: string }) {
  const s = { stroke: color, strokeWidth: 2.2, fill: 'none', strokeLinecap: 'round' as const };
  return (
    <Svg width={56} height={56} viewBox="0 0 56 56">
      {kind === 'waves' && (
        <>
          <Path d="M6 22 Q13 8 20 22 T34 22 T48 22" {...s} />
          <Path d="M6 36 Q13 22 20 36 T34 36 T48 36" {...s} />
        </>
      )}
      {kind === 'fields' && (
        <>
          <Circle cx={28} cy={28} r={4} fill={color} />
          <Circle cx={28} cy={28} r={11} {...s} strokeDasharray="1 6" />
          <Circle cx={28} cy={28} r={19} {...s} strokeDasharray="1 7" />
        </>
      )}
      {kind === 'mechanics' && <Path d="M8 44 H48 M12 44 L44 24" {...s} />}
    </Svg>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  column: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center', gap: 20 },
  title: { fontFamily: font.display, fontSize: 30, lineHeight: 36 },
  sub: { fontFamily: font.bodyMedium, fontSize: 15, marginTop: 2 },
  lip: { borderRadius: 24, paddingBottom: 5 },
  card: { borderWidth: 2, borderRadius: 24, overflow: 'hidden' },
  scene: { borderBottomWidth: 1 },
  body: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  unit: { fontFamily: font.mono, fontSize: 11, letterSpacing: 0.8 },
  cardTitle: { fontFamily: font.display, fontSize: 22, lineHeight: 27 },
  line: { fontFamily: font.bodyMedium, fontSize: 15 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 6 },
  fill: { height: '100%', borderRadius: 3 },
  go: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  soon: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderStyle: 'dashed', borderRadius: 20, padding: 12 },
  soonArt: { width: 72, height: 72, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  soonTitle: { fontFamily: font.bodySemi, fontSize: 16, lineHeight: 21 },
  tag: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.8 },
});
