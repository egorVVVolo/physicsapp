// Start screen for the first lesson: the course title, a blueprint card, the lesson title, one button.
// The card shows the balloon until the lesson is done; then the height–time graph (from the model).
// The graph is not shown earlier: it would answer the lesson's first question (which way it moves first).
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_NAME } from '@/config';
import { l4, W } from '@/content/l4';
import { BalloonScene, BlueprintGrid } from '@/scene/BalloonScene';
import { useClock } from '@/scene/useClock';
import { fixed } from '@/physics/format';
import { position } from '@/physics/kinematics';
import { countOutcomes, questionCount, type SavedProgress } from '@/session/logic';
import { clearProgress, loadProgress } from '@/session/storage';
import { useTheme } from '@/theme/ThemeContext';
import { font, radius, touch } from '@/theme/tokens';
import { svgFont } from '@/theme/svgFont';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import type { Palette } from '@/theme/tokens';
import { MainButton } from '@/ui/parts';

const lesson = l4;
const session = lesson.sessions[0];

export default function Start() {
  const { palette: p, stage: st } = useTheme();
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
      <View style={styles.head}>
        <Text style={[styles.app, { color: p.muted }]}>{APP_NAME}</Text>
        <Text style={[styles.course, { color: p.ink }]} accessibilityRole="header">Kinematics</Text>
        <Text style={[styles.unit, { color: p.muted }]}>Edexcel IAL Unit 1, WPH11</Text>
      </View>

      <View style={[styles.card, { backgroundColor: st.sky }]}>
        <View style={styles.graph} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
          {box && (finished ? <HeightGraph w={box.w} h={box.h} st={st} /> : <BalloonScene t={clock.t} width={box.w} height={box.h} scene={W.scene} playback={null} />)}
        </View>
        <View style={styles.cardText}>
          <Text style={[styles.lessonNo, { color: st.muted }]}>Lesson 4</Text>
          <Text style={[styles.title, { color: st.ink }]}>{lesson.title}</Text>
          <Text style={[styles.idea, { color: st.muted }]}>A sandbag is let go from a rising balloon. Which way does it move first?</Text>
        </View>
      </View>

      <Text style={[styles.status, { color: p.muted }]}>{status}</Text>
      <MainButton label={finished ? 'Play again' : started ? 'Continue' : 'Start'} onPress={finished ? startAgain : () => router.push('/session')} />
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

/** Height of the sandbag against time, from the release to the landing, drawn from the lesson's model. */
function HeightGraph({ w, h, st }: { w: number; h: number; st: Palette }) {
  const m = W.real;
  const L = 34;
  const R = w - 18;
  const T = 18;
  const B = h - 26;
  const sMax = W.hTop * 1.1;
  const X = (t: number) => L + (t / W.tLand) * (R - L);
  const Y = (s: number) => B - (s / sMax) * (B - T);
  const pts: string[] = [];
  for (let i = 0; i <= 48; i++) {
    const t = (W.tLand * i) / 48;
    pts.push(`${i === 0 ? 'M' : 'L'}${X(t).toFixed(1)},${Y(Math.max(0, position(t, m))).toFixed(1)}`);
  }
  return (
    <Svg width={w} height={h} fontFamily={svgFont} accessibilityLabel="Height against time: the sandbag rises, stops at the top, then falls to the ground.">
      <BlueprintGrid width={w} height={h} color={st.grid} />
      <Line x1={L} y1={B} x2={R} y2={B} stroke={st.groundLine} strokeWidth={1.5} />
      <Line x1={L} y1={T - 6} x2={L} y2={B} stroke={st.groundLine} strokeWidth={1.5} />
      <SvgText x={L - 8} y={T + 4} fontSize={12} fill={st.muted} textAnchor="end">s</SvgText>
      <SvgText x={R} y={B + 18} fontSize={12} fill={st.muted} textAnchor="end">t</SvgText>
      <Line x1={L} y1={Y(W.h0)} x2={X(W.tBack)} y2={Y(W.h0)} stroke={st.ink} strokeOpacity={0.35} strokeWidth={1} strokeDasharray="3 5" />
      <SvgText x={L - 8} y={Y(W.h0) + 4} fontSize={12} fill={st.muted} textAnchor="end">{`${fixed(W.h0, 0)}`}</SvgText>
      <Path d={pts.join(' ')} stroke={st.ink} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
      <Circle cx={X(W.tTop)} cy={Y(W.hTop)} r={5} fill={st.vel} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, paddingBottom: 8, gap: 12 },
  head: { marginTop: 8, gap: 2 },
  app: { fontSize: 14, fontFamily: font.bodySemi },
  course: { fontSize: 32, lineHeight: 38, fontFamily: font.display },
  unit: { fontSize: 14, fontFamily: font.body },
  card: { flex: 1, minHeight: 300, borderRadius: radius.l, overflow: 'hidden' },
  graph: { flex: 1, minHeight: 150 },
  cardText: { paddingHorizontal: 18, paddingBottom: 18, paddingTop: 4, gap: 4 },
  lessonNo: { fontSize: 14, fontFamily: font.bodySemi },
  title: { fontSize: 30, lineHeight: 34, fontFamily: font.display, letterSpacing: -0.4 },
  idea: { fontSize: 15, lineHeight: 21, fontFamily: font.body },
  status: { fontSize: 14, textAlign: 'center', fontFamily: font.bodyMedium },
  secondary: { minHeight: touch, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: 15, fontFamily: font.bodySemi },
});
