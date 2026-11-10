// Start screen for the first lesson. The real Home (three lessons) comes with the next stage.
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { APP_NAME } from '@/config';
import { l4, W } from '@/content/l4';
import { position } from '@/physics/kinematics';
import { countOutcomes, type SavedProgress } from '@/session/logic';
import { clearProgress, loadProgress } from '@/session/storage';
import { useTheme } from '@/theme/ThemeContext';
import { palettes, radius, touch, type Palette, type PaletteId } from '@/theme/tokens';
import { PrimaryButton } from '@/ui/parts';

const lesson = l4;
const session = lesson.sessions[0];

export default function Start() {
  const { palette: p, paletteId, setPaletteId } = useTheme();
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
  const status = finished && n ? `Done: ${n.independent} of ${session.steps.length} steps on your own` : started ? `Step ${saved!.state.index + 1} of ${session.steps.length}` : `${session.steps.length} steps, about ${session.minutes} minutes`;

  async function startAgain() {
    await clearProgress(lesson.id, session.id);
    router.push('/session');
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: p.bg }]} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <Text style={[styles.app, { color: p.muted }]}>{APP_NAME}</Text>
        <View style={[styles.segment, { borderColor: p.line }]}>
          {(Object.keys(palettes) as PaletteId[]).map((id) => (
            <Pressable key={id} accessibilityRole="button" accessibilityLabel={`Palette ${palettes[id].name}`} accessibilityState={{ selected: paletteId === id }} onPress={() => setPaletteId(id)} style={[styles.segBtn, paletteId === id && { backgroundColor: p.ink }]}>
              <Text style={[styles.segText, { color: paletteId === id ? p.surface : p.ink }]}>{palettes[id].name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.body}>
        <Text style={[styles.kicker, { color: p.velText }]}>Kinematics, lesson 4</Text>
        <Text style={[styles.title, { color: p.ink }]} accessibilityRole="header">{lesson.title}</Text>
        <Text style={[styles.idea, { color: p.ink }]}>A drone lets go of a package while it is still climbing. Where is the package a second later?</Text>
        <View style={[styles.figure, { backgroundColor: p.sky, borderColor: p.line }]}>
          <Flight palette={p} />
        </View>
      </View>

      <Text style={[styles.status, { color: p.muted }]}>{status}</Text>
      <PrimaryButton label={finished ? 'Play again' : started ? 'Continue' : 'Start'} onPress={finished ? startAgain : () => router.push('/session')} />
      {started && (
        <Pressable accessibilityRole="button" onPress={startAgain} style={styles.secondary}>
          <Text style={[styles.secondaryText, { color: p.ink }]}>Start from the beginning</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

/** The lesson in one picture: equal-time positions of the package, from the model. It rises before it falls. */
function Flight({ palette: p }: { palette: Palette }) {
  const W_PX = 300;
  const H_PX = 190;
  const times = Array.from({ length: 13 }, (_, i) => (i * W.tLand) / 12);
  const x = (t: number) => 24 + (t / W.tLand) * (W_PX - 48);
  const y = (h: number) => H_PX - 22 - (h / 26) * (H_PX - 40);
  const d = times.map((t, i) => `${i ? 'L' : 'M'}${x(t).toFixed(1)},${y(position(t, W.real)).toFixed(1)}`).join(' ');
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W_PX} ${H_PX}`}>
      <Line x1={12} y1={y(0)} x2={W_PX - 12} y2={y(0)} stroke={p.ink} strokeWidth={2.5} />
      <Line x1={12} y1={y(W.h0)} x2={W_PX - 12} y2={y(W.h0)} stroke={p.muted} strokeWidth={1} strokeDasharray="3 5" />
      <Path d={d} fill="none" stroke={p.vel} strokeWidth={2} opacity={0.45} />
      {times.map((t, i) => (
        <Circle key={i} cx={x(t)} cy={y(position(t, W.real))} r={i === 0 ? 7 : 4.5} fill={i === 0 ? p.ink : p.vel} />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20, paddingBottom: 12, gap: 10 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: touch },
  app: { fontSize: 15, fontWeight: '700' },
  segment: { flexDirection: 'row', borderWidth: 1.5, borderRadius: 999, overflow: 'hidden' },
  segBtn: { minHeight: touch, minWidth: 52, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  segText: { fontSize: 14, fontWeight: '700' },
  body: { flex: 1, justifyContent: 'center', gap: 8 },
  kicker: { fontSize: 15, fontWeight: '700' },
  title: { fontSize: 44, lineHeight: 46, fontWeight: '800', letterSpacing: -1.2 },
  idea: { fontSize: 17, lineHeight: 24, marginTop: 4 },
  figure: { height: 200, borderWidth: 1.5, borderRadius: radius.l, marginTop: 12, padding: 4 },
  status: { fontSize: 14, textAlign: 'center' },
  secondary: { minHeight: touch, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: 15, fontWeight: '700' },
});
