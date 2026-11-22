// The cover before a lesson's first screen: its tile, level, title, time, chapters and what you will be able to do.
// One main button in the level colour: Start, or Continue · chapter N when the lesson was left part-way.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { course, levelIdOf } from '@/content/course';
import type { Lesson } from '@/content/types';
import { LessonTile } from '@/figures/LessonIcon';
import { chapterOf } from '@/session/logic';
import { useTheme } from '@/theme/ThemeContext';
import { colorOfLesson } from '@/theme/levelColor';
import { font, motion } from '@/theme/tokens';
import { CloseIcon, MainButton } from '@/ui/parts';
import { Rise } from '@/ui/motion';
import { CONTENT_MAX } from './Frame';

type Props = { lesson: Lesson; /** where saved progress stands (0: not started) */ index: number; onStart: () => void; onClose: () => void };

/** The cover's button: Start, or where the learner left off. */
export function coverButtonLabel(lesson: Lesson, index: number): string {
  if (index <= 0) return 'Start';
  if (index >= lesson.story.length) return 'Continue · Skill check';
  const ch = chapterOf(lesson, index);
  return ch === null ? 'Continue' : `Continue · chapter ${ch + 1}`;
}

export function LessonCover({ lesson, index, onStart, onClose }: Props) {
  const { palette: p, level } = useTheme();
  const c = colorOfLesson(lesson.id);
  const lc = level(c);
  const insets = useSafeAreaInsets();
  const levelId = levelIdOf(lesson.id);
  const levelNo = course.levels.findIndex((lv) => lv.id === levelId) + 1;
  const levelTitle = course.levels[levelNo - 1]?.title ?? '';
  const chapters = lesson.chapters ?? [];
  const meta = [`~${lesson.minutes} min`, chapters.length > 0 ? `${chapters.length} chapters` : null].filter(Boolean).join(' · ');

  const blocks = [
    <LessonTile key="tile" lessonId={lesson.id} levelId={levelId} color={c} size={72} />,
    <View key="head" style={styles.head}>
      <Text style={[styles.level, { color: lc.text }]}>{`LEVEL ${levelNo} · ${levelTitle.toUpperCase()}`}</Text>
      <Text accessibilityRole="header" style={[styles.title, { color: p.ink }]}>
        {lesson.title}
      </Text>
      <Text style={[styles.meta, { color: p.muted }]}>{meta}</Text>
    </View>,
    chapters.length > 0 ? (
      <View key="chapters" style={styles.list}>
        {chapters.map((ch, i) => (
          <View key={ch.from} style={styles.row}>
            <View style={[styles.num, { backgroundColor: c.main }]}>
              <Text style={styles.numText}>{i + 1}</Text>
            </View>
            <Text style={[styles.rowText, { color: p.ink }]}>{ch.title}</Text>
          </View>
        ))}
      </View>
    ) : null,
    <View key="can" style={styles.list}>
      <Text style={[styles.subhead, { color: p.ink }]}>You'll be able to</Text>
      {lesson.youCanNow.map((line) => (
        <View key={line} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: c.main }]} />
          <Text style={[styles.canText, { color: p.ink }]}>{line}</Text>
        </View>
      ))}
    </View>,
  ].filter((b) => b !== null);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6, paddingBottom: insets.bottom, backgroundColor: p.page }]}>
      <View style={styles.bar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close the lesson" onPress={onClose} hitSlop={8} style={styles.close}>
          <CloseIcon color={p.muted} size={20} />
        </Pressable>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.column}>
          {blocks.map((b, i) => (
            <Rise key={i} delay={i * motion.stagger}>
              {b}
            </Rise>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.column}>
          <MainButton label={coverButtonLabel(lesson, index)} onPress={onStart} tone="level" color={c} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bar: { flexDirection: 'row', paddingHorizontal: 12, width: '100%', maxWidth: CONTENT_MAX + 40, alignSelf: 'center' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  column: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center', gap: 24 },
  head: { gap: 8 },
  level: { fontFamily: font.mono, fontSize: 12, letterSpacing: 1.2 },
  title: { fontFamily: font.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.3 },
  meta: { fontFamily: font.bodyMedium, fontSize: 15 },
  list: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  num: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  numText: { fontFamily: font.display, fontSize: 14, color: '#FFFFFF' },
  rowText: { fontFamily: font.bodyMedium, fontSize: 17, flex: 1 },
  subhead: { fontFamily: font.displaySemi, fontSize: 19 },
  dot: { width: 8, height: 8, borderRadius: 4, alignSelf: 'flex-start', marginTop: 9 },
  canText: { fontFamily: font.body, fontSize: 17, lineHeight: 25, flex: 1 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
});
