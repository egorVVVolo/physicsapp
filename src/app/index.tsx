// Start screen for the first lesson: the balloon scene, the lesson title, one button.
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_NAME } from '@/config';
import { l4, W } from '@/content/l4';
import { BalloonScene } from '@/scene/BalloonScene';
import { useClock } from '@/scene/useClock';
import { countOutcomes, questionCount, type SavedProgress } from '@/session/logic';
import { clearProgress, loadProgress } from '@/session/storage';
import { useTheme } from '@/theme/ThemeContext';
import { radius, touch } from '@/theme/tokens';
import { ChunkyButton } from '@/ui/parts';

const lesson = l4;
const session = lesson.sessions[0];

export default function Start() {
  const { palette: p } = useTheme();
  const router = useRouter();
  const clock = useClock(); // never played: the scene just shows the balloon, swaying
  const [saved, setSaved] = useState<SavedProgress | null>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      loadProgress(lesson.id, session).then((s) => alive && setSaved(s));
      return () => {
        alive = false;
      };
    }, []),
  );

  const finished = saved?.state.finished === true;
  const started = saved !== null && !finished && (saved.state.index > 0 || Object.keys(saved.state.outcomes).length > 0);
  const n = saved ? countOutcomes(saved.state) : null;
  const status =
    finished && n
      ? `Done: ${n.independent} of ${questionCount(session)} questions on your own`
      : started
        ? `Step ${saved!.state.index + 1} of ${session.steps.length}`
        : `${session.steps.length} steps, about ${session.minutes} minutes`;

  async function startAgain() {
    await clearProgress(lesson.id, session.id);
    router.push('/session');
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: p.page }]} edges={['top', 'bottom']}>
      <Text style={[styles.app, { color: p.muted }]}>{APP_NAME}</Text>
      <View style={[styles.scene, { borderColor: p.line }]} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {box && <BalloonScene t={clock.t} width={box.w} height={box.h} scene={W.scene} playback={null} />}
      </View>
      <View style={styles.body}>
        <Text style={[styles.kicker, { color: p.velText }]}>Kinematics, lesson 4</Text>
        <Text style={[styles.title, { color: p.ink }]} accessibilityRole="header">{lesson.title}</Text>
        <Text style={[styles.idea, { color: p.muted }]}>A sandbag is let go from a rising balloon. Which way does it move first?</Text>
      </View>
      <Text style={[styles.status, { color: p.muted }]}>{status}</Text>
      <ChunkyButton label={finished ? 'Play again' : started ? 'Continue' : 'Start'} onPress={finished ? startAgain : () => router.push('/session')} />
      {started ? (
        <Pressable accessibilityRole="button" onPress={startAgain} style={styles.secondary}>
          <Text style={[styles.secondaryText, { color: p.ink }]}>Start from the beginning</Text>
        </Pressable>
      ) : (
        <View style={{ height: 8 }} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, paddingBottom: 8, gap: 10 },
  app: { fontSize: 15, fontWeight: '700', marginTop: 8 },
  scene: { flex: 1, minHeight: 260, borderRadius: radius.l, overflow: 'hidden', borderWidth: 2 },
  body: { gap: 4, paddingTop: 6 },
  kicker: { fontSize: 14, fontWeight: '700' },
  title: { fontSize: 36, lineHeight: 40, fontWeight: '800', letterSpacing: -0.8 },
  idea: { fontSize: 16, lineHeight: 22 },
  status: { fontSize: 14, textAlign: 'center', marginTop: 4 },
  secondary: { minHeight: touch, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: 15, fontWeight: '700' },
});
