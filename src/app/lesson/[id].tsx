// /lesson/<id>: loads saved progress, plays the lesson, then shows Lesson complete.
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { lessons } from '@/content/lessons';
import { startState, type LessonState } from '@/session/logic';
import { clearProgress, loadProgress, saveProgress } from '@/session/storage';
import { LessonPlayer } from '@/lesson/LessonPlayer';
import { LessonComplete } from '@/lesson/LessonComplete';
import { useTheme } from '@/theme/ThemeContext';

export default function LessonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = lessons[id ?? ''];
  const { palette: p } = useTheme();
  const [state, setState] = useState<LessonState | null>(null);

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
    setState(s);
    saveProgress(lesson.id, s);
  };

  if (state.finished) {
    return (
      <LessonComplete
        lesson={lesson}
        state={state}
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
