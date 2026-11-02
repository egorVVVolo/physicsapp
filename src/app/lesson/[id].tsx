import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChunkyButton, PhoneFrame } from '../../components/stepParts';
import { findLesson } from '../../content/lessons';
import { Player } from '../../engine/Player';
import { LessonProgress, loadProgress, newProgress, resetProgress } from '../../engine/progress';
import { fonts } from '../../theme/fonts';
import { colors } from '../../theme/tokens';

// Opens a lesson: resumes where the learner stopped, or starts fresh. ?step=N jumps to a step while designing.
export default function LessonRoute() {
  const { id, step } = useLocalSearchParams<{ id: string; step?: string }>();
  const lesson = findLesson(id);
  const [progress, setProgress] = useState<LessonProgress | 'loading'>('loading');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!lesson) return;
    loadProgress(lesson.id).then((p) => {
      const base = p && p.status === 'in-progress' ? p : newProgress(lesson.id);
      setProgress(step ? { ...base, stepIndex: Number(step) || 0 } : base);
      if (step || !p || p.status !== 'in-progress' || p.stepIndex === 0) setStarted(true);
    });
  }, [lesson, step]);

  const exit = () => router.replace('/');
  if (!lesson) return null;
  if (progress === 'loading') return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  if (started) return <Player lesson={lesson} initial={progress} onExit={exit} />;

  // A lesson was left half-way: offer to continue.
  return (
    <PhoneFrame>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 16, justifyContent: 'center', gap: 16 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 28, color: colors.ink }}>Welcome back</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 17, lineHeight: 24, color: colors.inkMuted }}>
          You stopped at step {progress.stepIndex + 1} of {lesson.steps.length}.
        </Text>
        <ChunkyButton label="Continue" onPress={() => setStarted(true)} fill={colors.accent} edge={colors.accentEdge} textColor={colors.onAccent} />
        <ChunkyButton
          label="Start over"
          onPress={async () => {
            await resetProgress(lesson.id);
            setProgress(newProgress(lesson.id));
            setStarted(true);
          }}
          fill={colors.surfaceRaised}
          edge={colors.surfaceEdge}
          textColor={colors.ink}
        />
      </SafeAreaView>
    </PhoneFrame>
  );
}
