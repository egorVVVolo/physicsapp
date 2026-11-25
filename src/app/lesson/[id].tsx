// /lesson/<id>: loads saved progress, plays the lesson, then shows Lesson complete.
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { course } from '@/content/course';
import { lessons } from '@/content/lessons';
import { runOf, startState, type LessonState, type Run } from '@/session/logic';
import { levelFinishOf, type LevelFinish } from '@/session/levels';
import { addFinishedLesson, clearProgress, loadFinishedLessons, loadLevelsDone, loadProgress, loadRuns, markLevelDone, recordFinishedDay, saveProgress, saveRun } from '@/session/storage';
import { currentRun, dayKey } from '@/session/streak';
import { LessonPlayer } from '@/lesson/LessonPlayer';
import { Breakdown } from '@/lesson/Breakdown';
import { LevelComplete } from '@/lesson/LevelComplete';
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
  const [stage, setStage] = useState<'celebrate' | 'breakdown' | 'level'>('celebrate'); // celebration, then the breakdown (no way back), then Level complete if this finished a level
  const [levelFinish, setLevelFinish] = useState<LevelFinish | null>(null); // set once the finish is recorded, if it completes a level for the first time

  useEffect(() => {
    if (!lesson) return;
    setStarted(false);
    setStage('celebrate');
    setLevelFinish(null);
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
      const run = runOf(lesson, s, Date.now());
      const saved = saveRun(lesson.id, run);
      Promise.all([recordFinishedDay(), addFinishedLesson(lesson.id)]).then(([streak, firstTime]) =>
        setFinish({
          firstTime,
          runBefore: currentRun(streak.before, today).count,
          runAfter: currentRun(streak.after, today).count,
          newDay: !streak.before.days.includes(today),
        }),
      );
      // does this finish a level? (the first time only: a replay does not celebrate again)
      saved.then(async () => {
        const [finished, shown] = await Promise.all([loadFinishedLessons(), loadLevelsDone()]);
        const level = course.levels.find((l) => l.lessons.some((x) => x.id === lesson.id));
        const lastRuns: Record<string, Run | undefined> = {};
        for (const x of level?.lessons ?? []) lastRuns[x.id] = (await loadRuns(x.id)).slice(-1)[0];
        const done = levelFinishOf(lesson.id, finished, shown, lastRuns);
        if (done) {
          await markLevelDone(done.levelId);
          setLevelFinish(done);
        }
      });
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
      setStage('celebrate');
      setLevelFinish(null);
      setState({ ...startState, lastAt: Date.now() });
    };
    const onNext = next ? () => router.replace(`/lesson/${next.id}`) : undefined;
    if (stage === 'celebrate') return <LessonComplete lesson={lesson} state={state} finish={finish} onContinue={() => setStage('breakdown')} />;
    if (stage === 'level' && levelFinish) {
      const first = levelFinish.next?.firstLessonId;
      return <LevelComplete finish={levelFinish} onNext={first ? () => router.replace(`/lesson/${first}`) : undefined} onDone={back} />;
    }
    return (
      <Breakdown
        lesson={lesson}
        state={state}
        // the lesson finished a level: the main button goes to Level complete
        onNext={levelFinish ? () => setStage('level') : onNext}
        nextLabel={levelFinish ? 'Continue' : undefined}
        onDone={back}
        onReplay={replay}
      />
    );
  }
  return <LessonPlayer lesson={lesson} state={state} onChange={update} onClose={back} />;
}
