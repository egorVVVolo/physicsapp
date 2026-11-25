// Home: what to do today. A greeting with the momentum chip, the exam countdown, the next lesson (the biggest card),
// today's review, the week, the levels at a glance and a card from the notebook. Each block is a different shape.
// The blocks rise in once per app start; the launch animation plays here, once per app start too.
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { levelIdOf } from '@/content/course';
import { lessons } from '@/content/lessons';
import { ContinueCard } from '@/home/ContinueCard';
import { CourseBars, ExamStrip, Greeting, SectionTitle, WeekRow } from '@/home/parts';
import { ReviewCard } from '@/home/ReviewCard';
import { bankOf } from '@/practice/bank';
import { nextDue, pickReview, whenText } from '@/practice/review';
import { CONTENT_MAX } from '@/lesson/Frame';
import { Launch } from '@/map/Launch';
import { MomentumSheet } from '@/map/Momentum';
import { NoteCard } from '@/notebook/NoteCard';
import { levelCounts, nextLessonId, pickOfDay, readyRefs } from '@/session/progress';
import { dayKey } from '@/session/streak';
import { useCourseState } from '@/session/useCourseState';
import { useTheme } from '@/theme/ThemeContext';
import { courseBlue, levelColors } from '@/theme/tokens';
import { Rise } from '@/ui/motion';

let risen = false; // the blocks rise in only the first time Home is shown after the app starts

export default function Home() {
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useCourseState();
  const [momentum, setMomentum] = useState(false);
  const [rise] = useState(() => !risen);
  if (s.loaded) risen = true;
  const now = new Date();
  const next = nextLessonId(s.finished);
  const cards = readyRefs.filter((x) => s.finished.has(x.r.id));
  const pick = pickOfDay(cards, dayKey(now));
  // what today's review would play: the due questions, or new ones from finished lessons not yet in the queue
  const due = pickReview(s.review, bankOf(s.finished), dayKey(now)).length;
  const nd = nextDue(s.review, dayKey(now));
  const blocks = [
    <Greeting key="greet" now={now} streak={s.streak} onMomentum={() => setMomentum(true)} />,
    s.profile.exam ? <ExamStrip key="exam" exam={s.profile.exam} now={now} /> : null,
    <ContinueCard key="next" lessonId={next} saved={next ? s.saved[next] : undefined} onStart={() => next && router.push(`/lesson/${next}`)} />,
    <ReviewCard key="review" due={due} minutes={Math.max(1, Math.ceil(Math.min(due, 5) * 0.6))} next={nd ? whenText(nd, dayKey(now)) : null} empty={s.finished.size === 0} onStart={() => router.push('/practice/review')} />,
    <View key="week" style={{ gap: 12 }}>
      <SectionTitle>This week</SectionTitle>
      <WeekRow streak={s.streak} now={now} />
    </View>,
    <View key="course" style={{ gap: 8 }}>
      <SectionTitle right={`${s.finished.size} of ${readyRefs.length}`}>The course</SectionTitle>
      <CourseBars levels={levelCounts(s.finished)} onLevel={(level) => router.navigate({ pathname: '/learn', params: { level } })} />
    </View>,
    pick ? (
      <View key="note" style={{ gap: 12 }}>
        <SectionTitle>From your notebook</SectionTitle>
        <NoteCard lessonId={pick.r.id} levelId={pick.levelId} title={pick.r.title} card={lessons[pick.r.id].card} color={levelColors[levelIdOf(pick.r.id)] ?? courseBlue} onReplay={() => router.push(`/lesson/${pick.r.id}`)} />
      </View>
    ) : null,
  ].filter(Boolean);

  return (
    <View style={{ flex: 1, backgroundColor: p.page }}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
        <View style={styles.column}>
          {s.loaded &&
            blocks.map((b, i) =>
              rise ? (
                <Rise key={i} delay={i * 70}>
                  {b}
                </Rise>
              ) : (
                <View key={i}>{b}</View>
              ),
            )}
        </View>
      </ScrollView>
      {momentum && <MomentumSheet streak={s.streak} onClose={() => setMomentum(false)} />}
      <Launch target={() => undefined} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  column: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center', gap: 24 },
});
