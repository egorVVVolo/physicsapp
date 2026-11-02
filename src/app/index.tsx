import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PhoneFrame, tapHaptic } from '../components/stepParts';
import { APP_NAME } from '../constants';
import { lessons } from '../content/lessons';
import { LessonProgress, loadProgress } from '../engine/progress';
import { fonts } from '../theme/fonts';
import { colors } from '../theme/tokens';

// Temporary home until the course map (stage 4): the lessons that exist, plus the older demos.
function Row({ title, sub, status, onPress }: { title: string; sub: string; status?: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        tapHaptic();
        onPress();
      }}
      accessibilityRole="button"
      style={({ pressed }) => ({ backgroundColor: pressed ? colors.surfaceRaised : colors.surface, borderRadius: 18, padding: 18, gap: 4 })}
    >
      <Text style={{ fontFamily: fonts.display, fontSize: 20, color: colors.ink }}>{title}</Text>
      <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.inkMuted }}>{sub}</Text>
      {status && <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.accent, marginTop: 4 }}>{status}</Text>}
    </Pressable>
  );
}

export default function Home() {
  const [progress, setProgress] = useState<Record<string, LessonProgress | null>>({});
  useFocusEffect(
    useCallback(() => {
      Promise.all(lessons.map(async (l) => [l.id, await loadProgress(l.id)] as const)).then((list) => setProgress(Object.fromEntries(list)));
    }, []),
  );

  const statusOf = (id: string, total: number) => {
    const p = progress[id];
    if (!p) return undefined;
    if (p.status === 'done') return p.outcome === 'independent' ? 'Done on your own' : 'Done with some help';
    return `In progress: step ${Math.min(p.stepIndex + 1, total)} of ${total}`;
  };

  return (
    <PhoneFrame>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 32, color: colors.ink, marginTop: 12 }}>{APP_NAME}</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 16, color: colors.inkMuted, marginBottom: 8 }}>Kinematics</Text>
          {lessons.map((l) => (
            <Row key={l.id} title={`Lesson ${l.number}: ${l.title}`} sub={`${l.spec} · about ${l.minutes} min`} status={statusOf(l.id, l.steps.length)} onPress={() => router.push(`/lesson/${l.id}`)} />
          ))}
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.inkMuted, marginTop: 16 }}>Early prototypes</Text>
          <Row title="Stopping distance" sub="The first demo lesson" onPress={() => router.push('/demo')} />
          <Row title="Motion Lab" sub="Drag the graph, watch the car" onPress={() => router.push('/lab')} />
        </ScrollView>
      </SafeAreaView>
    </PhoneFrame>
  );
}
