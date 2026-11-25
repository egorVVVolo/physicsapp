// /lesson/<id>: loads saved progress, plays the lesson, then shows Lesson complete.
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { course } from '@/content/course';
import { lessons } from '@/content/lessons';
import { runOf, startState, type LessonState } from '@/session/logic';
import { addFinishedLesson, clearProgress, loadProgress, recordFinishedDay, saveProgress, saveRun } from '@/session/storage';
import { currentRun, dayKey } from '@/session/streak';
import { LessonPlayer } from '@/lesson/LessonPlayer';
import { Breakdown } from '@/lesson/Breakdown';
import { LessonComplete, type FinishInfo } from '@/lesson/LessonComplete';
import { LessonCover } from '@/lesson/LessonCover';
import { useTheme } from '@/theme/ThemeContext';

export default function LessonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = lessons[id ?? ''];
  const { palette: p } = useTheme();
  const [state, setState] = useState<LessonState | null>(null);
  const [finish, setFinish] = useState<FinishInfo | null>(null); // filled in once the finish is recorded
  const [started, setStarted] = useState(false); // the cover comes first on every visit, until Start
  const [breakdown, setBreakdown] = useState(false); // after the celebration comes the breakdown, with no way back

  useEffect(() => {
    if (!lesson) return;
    setStarted(false);
    setBreakdown(false);
    // timing starts now: time away from the app since the last save does not count
    loadProgress(lesson).then((saved) => setState({ ...(saved && !saved.state.finished ? saved.state : startState), lastAt: Date.now() }));
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
      saveRun(lesson.id, runOf(lesson, s, Date.now()));
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

  if (!started && !state.finished) {
    return (
      <LessonCover
        lesson={lesson}
        index={state.index}
        onClose={back}
        onStart={() => {
          setState({ ...state, lastAt: Date.now() }); // time on the cover does not count
          setStarted(true);
        }}
      />
    );
  }

  if (state.finished) {
    // the next lesson in course order that can be played, if any
    const order = course.levels.flatMap((l) => l.lessons);
    const next = order.slice(order.findIndex((r) => r.id === lesson.id) + 1).find((r) => r.ready && lessons[r.id]);
    const replay = () => {
      clearProgress(lesson.id);
      setBreakdown(false);
      setState({ ...startState, lastAt: Date.now() });
    };
    const onNext = next ? () => router.replace(`/lesson/${next.id}`) : undefined;
    if (!breakdown) return <LessonComplete lesson={lesson} state={state} finish={finish} onContinue={() => setBreakdown(true)} />;
    return <Breakdown lesson={lesson} state={state} onNext={onNext} onDone={back} onReplay={replay} />;
  }
  return <LessonPlayer lesson={lesson} state={state} onChange={update} onClose={back} />;
}
