// Prototype lesson step built on the agreed rules: big scene, one object in focus,
// graph as a separate view, one screen, auto-continuing playback, ghost of a wrong answer.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useAnimatedReaction } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { SafeAreaView } from 'react-native-safe-area-context';
import { condition, options, playbackFor, question, realBag, tLandReal, type Option } from '@/content/balloon';
import { position, velocity } from '@/physics/kinematics';
import { BalloonScene } from '@/scene/BalloonScene';
import { HeightGraph } from '@/scene/HeightGraph';
import { useClock } from '@/scene/useClock';
import { useTheme } from '@/theme/ThemeContext';
import { palettes, radius, touch, type PaletteId } from '@/theme/tokens';

export default function LessonStep() {
  const { palette: p, paletteId, setPaletteId } = useTheme();
  const clock = useClock();
  const [choice, setChoice] = useState<Option | null>(null);
  const [checked, setChecked] = useState(false);
  const [view, setView] = useState<'scene' | 'graph'>('scene');
  const [endT, setEndT] = useState(0);
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [shownT, setShownT] = useState(0);

  useAnimatedReaction(
    () => Math.round(clock.t.value * 100) / 100,
    (now, prev) => {
      if (now !== prev) scheduleOnRN(setShownT, now);
    },
  );

  const ghostU = checked && choice && !choice.correct ? choice.u : null;
  const ended = clock.status === 'ended';

  function check() {
    if (!choice) return;
    const plan = playbackFor(choice);
    setCaptions(plan.captions);
    setEndT(plan.endT);
    setChecked(true);
    clock.play(plan.events);
  }
  function restart() {
    clock.reset();
    setChecked(false);
    setChoice(null);
    setView('scene');
  }

  const t = clock.t;
  const tap = Gesture.Tap().onEnd(() => {
    scheduleOnRN(clock.togglePause);
  });
  const scrub = Gesture.Pan()
    .enabled(ended)
    .minDistance(4)
    .onChange((e) => {
      t.value = Math.max(0, Math.min(endT, t.value + (e.changeX / 280) * endT));
    })
    .onBegin(() => {
      scheduleOnRN(clock.setEventId, null);
    });
  const gestures = Gesture.Race(scrub, tap);

  const tt = Math.min(shownT, tLandReal);
  const h = position(tt, realBag);
  const v = velocity(tt, realBag);
  const caption = clock.eventId ? captions[clock.eventId] ?? null : null;

  const primary = !checked
    ? { label: 'Check', disabled: !choice, onPress: check }
    : ended
      ? { label: 'Start again', disabled: false, onPress: restart }
      : { label: 'Watch', disabled: true, onPress: () => {} };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: p.bg }]} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <View style={styles.progress}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.bar, { backgroundColor: i < 1 ? p.ink : p.line }]} />
          ))}
        </View>
        <View style={[styles.segment, { borderColor: p.line }]}>
          {(Object.keys(palettes) as PaletteId[]).map((id) => (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityState={{ selected: paletteId === id }}
              onPress={() => setPaletteId(id)}
              style={[styles.segBtn, paletteId === id && { backgroundColor: p.ink }]}
            >
              <Text style={[styles.segText, { color: paletteId === id ? p.surface : p.ink }]}>{palettes[id].name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Text style={[styles.condition, { color: p.ink }]}>{condition}</Text>

      <View style={styles.sceneHeader}>
        <Text style={[styles.readout, { color: p.muted }]}>
          t <Text style={[styles.readoutValue, { color: p.ink }]}>{checked ? shownT.toFixed(2) : '0.00'} s</Text>
          {'   '}h <Text style={[styles.readoutValue, { color: p.ink }]}>{checked ? Math.max(0, h).toFixed(1) : '30.0'} m</Text>
          {'   '}v <Text style={[styles.readoutValue, { color: p.velText }]}>{checked ? `${v < 0 ? '−' : '+'}${Math.abs(v).toFixed(1)}` : '?'} m s⁻¹</Text>
        </Text>
      </View>

      <GestureDetector gesture={gestures}>
        <View
          style={[styles.scene, { borderColor: p.line, backgroundColor: p.sky }]}
          accessible
          accessibilityLabel="A balloon rises at 4.0 metres per second; a sandbag hangs below it, 30 metres above the ground."
        >
          {view === 'scene' ? (
            <BalloonScene t={clock.t} palette={p} revealed={checked} ghostU={ghostU} caption={caption} />
          ) : (
            <HeightGraph t={clock.t} palette={p} ghostU={ghostU} />
          )}
        {checked && (
            <View style={[styles.segment, styles.viewSwitch, { borderColor: p.line, backgroundColor: p.surface }]}>
              {(['scene', 'graph'] as const).map((k) => (
                <Pressable
                  key={k}
                  accessibilityRole="button"
                  accessibilityState={{ selected: view === k }}
                  onPress={() => setView(k)}
                  style={[styles.segBtn, view === k && { backgroundColor: p.ink }]}
                >
                  <Text style={[styles.segText, { color: view === k ? p.surface : p.ink }]}>{k === 'scene' ? 'Scene' : 'Graph'}</Text>
                </Pressable>
              ))}
            </View>
          )}
          {ended && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Replay"
              onPress={() => clock.play(playbackFor(choice!).events)}
              style={[styles.replay, { backgroundColor: p.surface, borderColor: p.line }]}
            >
              <Text style={[styles.replayText, { color: p.ink }]}>↻</Text>
            </Pressable>
          )}
        </View>
      </GestureDetector>

      <Text style={[styles.question, { color: p.ink }]}>{question}</Text>
      <View style={styles.options} accessibilityRole="radiogroup">
        {options.map((o) => {
          const selected = choice?.id === o.id;
          const state = checked ? (o.correct ? 'right' : selected ? 'wrong' : 'dim') : selected ? 'selected' : 'idle';
          const border = state === 'right' ? p.ok : state === 'wrong' ? p.bad : state === 'selected' ? p.ink : p.line;
          return (
            <Pressable
              key={o.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled: checked }}
              disabled={checked}
              onPress={() => setChoice(o)}
              style={[styles.option, { borderColor: border, borderWidth: state === 'idle' || state === 'dim' ? 1.5 : 3, backgroundColor: p.surface }]}
            >
              <Text style={[styles.optionText, { color: state === 'dim' ? p.muted : p.ink }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.feedbackSlot}>
        {checked && choice && (
          <Text style={[styles.feedback, { color: p.ink }]}>
            <Text style={{ color: choice.correct ? p.ok : p.bad, fontWeight: '700' }}>{choice.correct ? '✓ Correct. ' : '✕ Not quite. '}</Text>
            {choice.feedback}
          </Text>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={primary.disabled}
        onPress={primary.onPress}
        style={[styles.primary, { backgroundColor: primary.disabled ? p.line : p.primary }]}
      >
        <Text style={[styles.primaryText, { color: primary.disabled ? p.muted : p.onPrimary }]}>{primary.label}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: touch },
  progress: { flex: 1, flexDirection: 'row', gap: 4 },
  bar: { flex: 1, height: 6, borderRadius: 3 },
  segment: { flexDirection: 'row', borderWidth: 1.5, borderRadius: 999, overflow: 'hidden' },
  segBtn: { minHeight: 36, minWidth: 56, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  segText: { fontSize: 14, fontWeight: '700' },
  condition: { fontSize: 15, lineHeight: 20 },
  sceneHeader: { flexDirection: 'row', alignItems: 'center', minHeight: 24 },
  readout: { fontSize: 14, fontVariant: ['tabular-nums'] },
  viewSwitch: { position: 'absolute', left: 8, bottom: 8 },
  readoutValue: { fontSize: 16, fontWeight: '700' },
  scene: { flex: 1, minHeight: 260, borderWidth: 1.5, borderRadius: radius.l, overflow: 'hidden' },
  replay: { position: 'absolute', right: 8, bottom: 8, width: touch, height: touch, borderRadius: touch / 2, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  replayText: { fontSize: 22, fontWeight: '700' },
  question: { fontSize: 17, fontWeight: '700', lineHeight: 22 },
  options: { flexDirection: 'row', gap: 8 },
  option: { flex: 1, minHeight: 50, borderRadius: radius.m, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  optionText: { fontSize: 15.5, fontWeight: '700', textAlign: 'center' },
  feedbackSlot: { minHeight: 40, justifyContent: 'center' },
  feedback: { fontSize: 15, lineHeight: 20 },
  primary: { minHeight: 52, borderRadius: radius.m, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontSize: 17, fontWeight: '700' },
});
