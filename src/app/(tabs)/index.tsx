// Home: what to do today, and nothing else. A greeting with the momentum chip, one big card with the next lesson
// (the course picture moves on it) and a quiet row with today's review. The week, the levels and the exam
// countdown are in Me; the notebook is in Revise. The blocks rise in once per app start, and so does the launch animation.
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContinueCard } from '@/home/ContinueCard';
import { Greeting } from '@/home/parts';
import { ReviewRow } from '@/home/ReviewRow';
import { bankOf } from '@/practice/bank';
import { nextDue, pickReview, whenText } from '@/practice/review';
import { CONTENT_MAX } from '@/lesson/Frame';
import { Launch } from '@/map/Launch';
import { MomentumSheet } from '@/map/Momentum';
import { nextLessonId } from '@/session/progress';
import { dayKey } from '@/session/streak';
import { useCourseState } from '@/session/useCourseState';
import { useTheme } from '@/theme/ThemeContext';
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
  // what today's review would play: the due questions, or new ones from finished lessons not yet in the queue
  const due = pickReview(s.review, bankOf(s.finished), dayKey(now)).length;
  const nd = nextDue(s.review, dayKey(now));
  const blocks = [
    <Greeting key="greet" now={now} streak={s.streak} onMomentum={() => setMomentum(true)} />,
    <ContinueCard key="next" lessonId={next} saved={next ? s.saved[next] : undefined} onStart={() => next && router.push(`/lesson/${next}`)} />,
    <ReviewRow key="review" due={due} minutes={Math.max(1, Math.ceil(Math.min(due, 5) * 0.6))} next={nd ? whenText(nd, dayKey(now)) : null} empty={s.finished.size === 0} onStart={() => router.push('/practice/review')} />,
  ];

  return (
    <View style={{ flex: 1, backgroundColor: p.page }}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
        <View style={styles.column}>
          {s.loaded &&
            blocks.map((b, i) =>
              rise ? (
                <Rise key={i} delay={i * 90}>
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
  column: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center', gap: 20 },
});
