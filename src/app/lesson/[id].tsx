// /lesson/<id>: loads saved progress, plays the lesson, then shows Lesson complete.
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { course } from '@/content/course';
import { lessons } from '@/content/lessons';
import { startState, type LessonState } from '@/session/logic';
import { addFinishedLesson, clearProgress, loadProgress, recordFinishedDay, saveProgress } from '@/session/storage';
import { currentRun, dayKey } from '@/session/streak';
import { LessonPlayer } from '@/lesson/LessonPlayer';
import { LessonComplete, type FinishInfo } from '@/lesson/LessonComplete';
import { useTheme } from '@/theme/ThemeContext';

export default function LessonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = lessons[id ?? ''];
  const { palette: p } = useTheme();
  const [state, setState] = useState<LessonState | null>(null);
  const [finish, setFinish] = useState<FinishInfo | null>(null); // filled in once the finish is recorded

  useEffect(() => {
    if (!lesson) return;
    loadProgress(lesson).then((saved) => setState(saved && !saved.state.finished ? saved.state : startState));
  }, [lesson]);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!lesson) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: p.page }}>
        <Text style={{ color: p.ink }} onPress={back}>
          This lesson is not ready yet. Back to the map
        </Text>
      </View>
    );
  }
  if (!state) return <View style={{ flex: 1, backgroundColor: p.page }} />;

  const update = (s: LessonState) => {
    if (s.finished && !state.finished) {
      // a finished lesson makes today count for the streak, and its card goes to the notebook (the first time)
      const today = dayKey(new Date());
      Promise.all([recordFinishedDay(), addFinishedLesson(lesson.id)]).then(([streak, firstTime]) =>
        setFinish({
          firstTime,
          runBefore: currentRun(streak.before, today).count,
          runAfter: currentRun(streak.after, today).count,
          newDay: !streak.before.days.includes(today),
        }),
      );
    }
    setState(s);
    saveProgress(lesson.id, s);
  };

  if (state.finished) {
    // the next lesson in course order that can be played, if any
    const order = course.levels.flatMap((l) => l.lessons);
    const next = order.slice(order.findIndex((r) => r.id === lesson.id) + 1).find((r) => r.ready && lessons[r.id]);
    return (
      <LessonComplete
        lesson={lesson}
        state={state}
        finish={finish}
        onNext={next ? () => router.replace(`/lesson/${next.id}`) : undefined}
        onDone={back}
        onReplay={() => {
          clearProgress(lesson.id);
          setState(startState);
        }}
      />
    );
  }
  return <LessonPlayer lesson={lesson} state={state} onChange={update} onClose={back} />;
}
