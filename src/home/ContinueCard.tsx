// The biggest card on Home: the next lesson. The course picture (moving) on drawing paper, the lesson tile, the level,
// the title, where you are ("Chapter 2 of 3 · ~6 min left" or "Up next"), and one button in the level's colour.
// When every lesson is done: the all-done picture and a pointer to Revise.
import { StyleSheet, Text, View } from 'react-native';
import { darkNeutral, illustration, lightNeutral } from '@/art/illustrations';
import { course, levelIdOf } from '@/content/course';
import { lessons } from '@/content/lessons';
import { LessonTile } from '@/figures/LessonIcon';
import { SceneBox } from '@/map/CourseScene';
import { continueLine, type Saved } from '@/session/progress';
import { useTheme } from '@/theme/ThemeContext';
import { courseBlue, font, levelColors, reward } from '@/theme/tokens';
import { Art } from '@/ui/Art';
import { MainButton } from '@/ui/parts';

export function ContinueCard({ lessonId, saved, onStart }: { lessonId: string | undefined; saved: Saved | undefined; onStart: () => void }) {
  const { palette: p, dark, level } = useTheme();
  if (!lessonId) {
    return (
      <View style={[styles.card, { borderColor: p.line, backgroundColor: p.page }]}>
        <View style={{ alignItems: 'center', gap: 12, padding: 16 }}>
          <Art xml={illustration('allDone', { ...courseBlue, soft: dark ? p.selectBg : courseBlue.soft }, reward, dark ? darkNeutral : lightNeutral)} width={240} />
          <Text style={[styles.title, { color: p.ink, textAlign: 'center' }]}>Every lesson done.</Text>
          <Text style={[styles.line, { color: p.muted, textAlign: 'center' }]}>Keep them fresh in Revise.</Text>
        </View>
      </View>
    );
  }
  const lesson = lessons[lessonId];
  const levelId = levelIdOf(lessonId);
  const c = levelColors[levelId];
  const lc = level(c);
  const li = course.levels.findIndex((l) => l.id === levelId);
  const started = !!saved && !saved.finished && saved.index > 0;
  return (
    <View style={[styles.lipWrap, { backgroundColor: lc.main }]}>
      <View style={[styles.card, { borderColor: lc.main, backgroundColor: p.page }]}>
        <View style={[styles.scene, { backgroundColor: p.paper, borderBottomColor: p.paperLine }]} pointerEvents="none">
          <SceneBox />
        </View>
        <View style={styles.body}>
          <View style={styles.row}>
            <LessonTile lessonId={lessonId} levelId={levelId} color={c} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.level, { color: lc.text }]}>
                LEVEL {li + 1} · {course.levels[li].title.toUpperCase()}
              </Text>
              <Text style={[styles.title, { color: p.ink }]}>{lesson.title}</Text>
            </View>
          </View>
          <Text style={[styles.line, { color: p.muted }]}>{continueLine(lesson, saved)}</Text>
          <MainButton label={started ? 'Continue' : 'Start'} onPress={onStart} tone="level" color={c} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lipWrap: { borderRadius: 20, paddingBottom: 5 },
  card: { borderWidth: 2, borderRadius: 20, overflow: 'hidden' },
  scene: { borderBottomWidth: 1 },
  body: { padding: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  level: { fontFamily: font.mono, fontSize: 11, letterSpacing: 0.8 },
  title: { fontFamily: font.display, fontSize: 20, lineHeight: 25, marginTop: 2 },
  line: { fontFamily: font.bodyMedium, fontSize: 15 },
});
