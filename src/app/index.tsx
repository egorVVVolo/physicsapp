// Start screen for the first lesson. The real Home (three lessons) comes with the next stage.
// Same two-tone look as the lesson: a dark stage with the lesson in one picture, a light sheet with the button.
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Svg, { ClipPath, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import { APP_NAME } from '@/config';
import { l4 } from '@/content/l4';
import { countOutcomes, questionCount, type SavedProgress } from '@/session/logic';
import { clearProgress, loadProgress } from '@/session/storage';
import { useTheme } from '@/theme/ThemeContext';
import { touch, type Palette } from '@/theme/tokens';
import { PrimaryButton, StageSheetLayout } from '@/ui/parts';

const lesson = l4;
const session = lesson.sessions[0];

export default function Start() {
  const { palette: p } = useTheme();
  const router = useRouter();
  const [saved, setSaved] = useState<SavedProgress | null>(null);

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

  const stage = (
    <View style={styles.stage}>
      <Text style={[styles.app, { color: p.stageMuted }]}>{APP_NAME}</Text>
      <View style={styles.picture} accessible accessibilityLabel="A sandbag leaves a rising balloon, climbs a little, then falls to the ground.">
        <Flight palette={p} />
      </View>
      <View style={styles.words}>
        <Text style={[styles.kicker, { color: p.vel }]}>Kinematics, lesson 4</Text>
        <Text style={[styles.title, { color: p.stageText }]} accessibilityRole="header">
          {lesson.title}
        </Text>
        <Text style={[styles.idea, { color: p.stageMuted }]}>A sandbag drops from a rising balloon. What happens next?</Text>
      </View>
    </View>
  );

  return (
    <StageSheetLayout stage={stage} grow="stage">
      <Text style={[styles.status, { color: p.muted }]}>{status}</Text>
      <PrimaryButton label={finished ? 'Play again' : started ? 'Continue' : 'Start'} onPress={finished ? startAgain : () => router.push('/session')} />
      {started && (
        <Pressable accessibilityRole="button" onPress={startAgain} style={styles.secondary}>
          <Text style={[styles.secondaryText, { color: p.ink }]}>Start from the beginning</Text>
        </Pressable>
      )}
    </StageSheetLayout>
  );
}

/**
 * The lesson in one flat picture: the balloon, and the dashed path of the sandbag.
 * The path is drawn from the real motion (release at 20 m, 12 m/s up), spread sideways so up and down can be told apart.
 */
function Flight({ palette: p }: { palette: Palette }) {
  const W_PX = 320;
  const H_PX = 230;
  const ground = 214;
  const release = 134; // y of the release point
  const k = 3.9; // pixels per metre
  const tEnd = (12 + Math.sqrt(144 + 4 * 4.905 * 20)) / 9.81; // lands after about 3.6 s
  const points = Array.from({ length: 25 }, (_, i) => {
    const t = (i / 24) * tEnd;
    const h = 12 * t - 4.905 * t * t; // height above the release point
    return `${i ? 'L' : 'M'}${(112 + (t / tEnd) * 150).toFixed(1)},${(release - h * k).toFixed(1)}`;
  }).join(' ');
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W_PX} ${H_PX}`}>
      <Defs>
        <ClipPath id="envelope">
          <Path d="M0,-238 C56,-238 64,-186 56,-154 C50,-130 24,-118 12,-110 L-12,-110 C-24,-118 -50,-130 -56,-154 C-64,-186 -56,-238 0,-238Z" />
        </ClipPath>
      </Defs>
      <Line x1={0} y1={ground} x2={W_PX} y2={ground} stroke={p.stageGroundLine} strokeWidth={2} />
      <Path d={points} stroke={p.vel} strokeWidth={2.5} strokeDasharray="2 7" strokeLinecap="round" fill="none" />
      <Rect x={256} y={ground - 12} width={14} height={12} rx={4} fill={p.sack} />
      {/* the balloon: origin at the bottom of the basket */}
      <G transform={`translate(96 ${release + 22}) scale(0.5)`}>
        <Path d="M-13,-30 L-11,-110 M13,-30 L11,-110" stroke={p.rope} strokeWidth={2.5} strokeLinecap="round" />
        <Path d="M0,-238 C56,-238 64,-186 56,-154 C50,-130 24,-118 12,-110 L-12,-110 C-24,-118 -50,-130 -56,-154 C-64,-186 -56,-238 0,-238Z" fill={p.balloon} />
        <G clipPath="url(#envelope)">
          <Ellipse cx={50} cy={-172} rx={30} ry={82} fill={p.balloonShade} opacity={0.75} />
          <Path d="M0,-238 C-14,-206 -16,-170 -9,-146 Q0,-140 9,-146 C16,-170 14,-206 0,-238Z" fill={p.acc} />
        </G>
        <Rect x={-18} y={-30} width={36} height={28} rx={5} fill={p.kraft} />
        <Rect x={-18} y={-30} width={36} height={8} rx={4} fill={p.kraftDark} />
      </G>
      {/* the sandbag at the moment of release */}
      <Rect x={105} y={release - 6} width={14} height={12} rx={4} fill={p.sack} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, paddingHorizontal: 20, paddingTop: 12, gap: 8 },
  app: { fontSize: 15, fontWeight: '700' },
  picture: { flex: 1, minHeight: 160 },
  words: { gap: 6 },
  kicker: { fontSize: 15, fontWeight: '700' },
  title: { fontSize: 40, lineHeight: 44, fontWeight: '800', letterSpacing: -1 },
  idea: { fontSize: 17, lineHeight: 24 },
  status: { fontSize: 14, textAlign: 'center' },
  secondary: { minHeight: touch, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: 15, fontWeight: '700' },
});
