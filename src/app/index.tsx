// Prototype lesson step built on the agreed rules: big scene, one object in focus,
// graph as a separate view, one screen, auto-continuing playback, ghost of a wrong answer.
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useAnimatedReaction, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { SafeAreaView } from 'react-native-safe-area-context';
import { condition, H0, options, playbackFor, question, realBody, sceneDescription, tLandReal, type Option, type Playback } from '@/content/drop';
import { fixed, signed } from '@/physics/format';
import { position, velocity } from '@/physics/kinematics';
import { DropScene } from '@/scene/DropScene';
import { GRAPH_LEFT, GRAPH_RIGHT_PAD, HeightGraph } from '@/scene/HeightGraph';
import { useClock, type ClockStatus } from '@/scene/useClock';
import { useTheme } from '@/theme/ThemeContext';
import { palettes, radius, touch, type Palette, type PaletteId } from '@/theme/tokens';

export default function LessonStep() {
  const { palette: p, paletteId, setPaletteId } = useTheme();
  const clock = useClock();
  const [choice, setChoice] = useState<Option | null>(null);
  const [plan, setPlan] = useState<Playback | null>(null);
  const [view, setView] = useState<'scene' | 'graph'>('scene');
  const [size, setSize] = useState({ width: 0, height: 0 });

  const checked = plan !== null;
  const ended = clock.status === 'ended';
  const paused = clock.status === 'paused';
  const caption = plan && clock.eventId ? plan.captions[clock.eventId] ?? null : null;

  function check() {
    if (!choice) return;
    const next = playbackFor(choice);
    setPlan(next);
    clock.play(next.events);
  }
  function restart() {
    clock.reset();
    setPlan(null);
    setChoice(null);
    setView('scene');
  }
  function onLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    if (Math.abs(width - size.width) > 0.5 || Math.abs(height - size.height) > 0.5) setSize({ width, height });
  }

  // Tap the scene: pause / resume. After the end: drag sideways to move through time.
  const t = clock.t;
  const endT = plan?.endT ?? 0;
  const pxPerSecond =
    view === 'graph' && plan ? (size.width - GRAPH_LEFT - GRAPH_RIGHT_PAD) / plan.graph.tMax : endT > 0 ? size.width / endT : 1;
  const { togglePause, setEventId } = clock;
  const gestures = useMemo(() => {
    const tap = Gesture.Tap().onEnd(() => {
      scheduleOnRN(togglePause);
    });
    const scrub = Gesture.Pan()
      .enabled(ended)
      .minDistance(6)
      .onStart(() => {
        scheduleOnRN(setEventId, null);
      })
      .onChange((e) => {
        t.value = Math.max(0, Math.min(endT, t.value + e.changeX / pxPerSecond));
      });
    return Gesture.Race(scrub, tap);
  }, [ended, endT, pxPerSecond, t, togglePause, setEventId]);

  const primary = !checked
    ? { label: 'Check', disabled: !choice, onPress: check }
    : ended
      ? { label: 'Start again', disabled: false, onPress: restart }
      : { label: 'Watch', disabled: true, onPress: () => {} };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: p.bg }]} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <Readout t={clock.t} status={clock.status} active={checked} palette={p} />
        <View style={[styles.segment, { borderColor: p.line }]}>
          {(Object.keys(palettes) as PaletteId[]).map((id) => (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityLabel={`Palette ${palettes[id].name}`}
              accessibilityState={{ selected: paletteId === id }}
              onPress={() => setPaletteId(id)}
              style={[styles.segBtn, paletteId === id && { backgroundColor: p.ink }]}
            >
              <Text style={[styles.segText, { color: paletteId === id ? p.surface : p.ink }]}>{palettes[id].name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Text style={[styles.condition, { color: p.ink }]} maxFontSizeMultiplier={1.3}>{condition}</Text>

      <View style={[styles.scene, { borderColor: p.line, backgroundColor: view === 'scene' ? p.sky : p.surface }]} onLayout={onLayout}>
        <GestureDetector gesture={gestures}>
          <View
            style={StyleSheet.absoluteFill}
            accessible
            accessibilityRole="image"
            accessibilityLabel={caption ?? sceneDescription}
            accessibilityHint={checked && !ended ? 'Double tap to pause or resume' : undefined}
            accessibilityActions={[{ name: 'activate' }]}
            onAccessibilityAction={() => clock.togglePause()}
          >
            {size.width > 0 &&
              (view === 'scene' ? (
                <DropScene t={clock.t} palette={p} width={size.width} height={size.height} revealed={checked} ghostU={plan?.ghostU ?? null} ghostLabel={plan?.ghostLabel ?? ''} />
              ) : (
                <HeightGraph
                  t={clock.t}
                  palette={p}
                  width={size.width}
                  height={size.height}
                  ghostU={plan?.ghostU ?? null}
                  ghostLabel={plan?.ghostLabel ?? ''}
                  tMax={plan?.graph.tMax ?? 3}
                  hMax={plan?.graph.hMax ?? 30}
                />
              ))}
          </View>
        </GestureDetector>

        {(caption || paused) && (
          <View pointerEvents="none" style={[styles.caption, { backgroundColor: p.eventText }]} accessibilityLiveRegion="polite">
            <Text style={styles.captionText} maxFontSizeMultiplier={1.3}>{paused ? 'Paused. Tap the scene to carry on.' : caption}</Text>
          </View>
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
        {ended && plan && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Replay"
            onPress={() => clock.play(plan.events)}
            style={[styles.replay, { backgroundColor: p.surface, borderColor: p.line }]}
          >
            <Text style={[styles.replayText, { color: p.ink }]}>↻</Text>
          </Pressable>
        )}
      </View>

      {/* One fixed-height slot: the question before Check, the feedback after it. No layout jump. */}
      <View style={styles.prompt} accessibilityLiveRegion="polite">
        {checked && choice ? (
          <Text style={[styles.feedback, { color: p.ink }]} maxFontSizeMultiplier={1.3}>
            <Text style={{ color: choice.correct ? p.ok : p.bad, fontWeight: '700' }}>{choice.correct ? '✓ Correct. ' : '✕ Not quite. '}</Text>
            {choice.feedback}
          </Text>
        ) : (
          <Text style={[styles.question, { color: p.ink }]} maxFontSizeMultiplier={1.3}>{question}</Text>
        )}
      </View>

      <View style={styles.options} accessibilityRole="radiogroup">
        {options.map((o) => {
          const selected = choice?.id === o.id;
          const state = checked ? (o.correct ? 'right' : selected ? 'wrong' : 'dim') : selected ? 'selected' : 'idle';
          const border = state === 'right' ? p.ok : state === 'wrong' ? p.bad : state === 'selected' ? p.ink : p.line;
          const mark = state === 'right' ? '✓ ' : state === 'wrong' ? '✕ ' : '';
          const result = state === 'right' ? ', correct answer' : state === 'wrong' ? ', your answer, incorrect' : '';
          return (
            <Pressable
              key={o.id}
              accessibilityRole="radio"
              accessibilityLabel={o.label + result}
              accessibilityState={{ checked: selected, disabled: checked }}
              disabled={checked}
              onPress={() => setChoice(o)}
              style={[styles.option, { borderColor: border, borderWidth: state === 'idle' || state === 'dim' ? 1.5 : 3, backgroundColor: p.surface }]}
            >
              <Text style={[styles.optionText, { color: state === 'dim' ? p.muted : state === 'right' ? p.ok : state === 'wrong' ? p.bad : p.ink }]} maxFontSizeMultiplier={1.2}>
                {mark}
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: primary.disabled }}
        disabled={primary.disabled}
        onPress={primary.onPress}
        style={[styles.primary, { backgroundColor: primary.disabled ? p.line : p.primary }]}
      >
        <Text style={[styles.primaryText, { color: primary.disabled ? p.muted : p.onPrimary }]}>{primary.label}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

/** Live t / h / v. Owns its own state so the rest of the screen does not re-render while playing. */
function Readout({ t, status, active, palette: p }: { t: SharedValue<number>; status: ClockStatus; active: boolean; palette: Palette }) {
  const [now, setNow] = useState(0);
  // about 10 updates a second while moving...
  useAnimatedReaction(
    () => Math.round(t.value * 10),
    (key, prev) => {
      if (key !== prev) scheduleOnRN(setNow, t.value);
    },
  );
  // ...and the exact value whenever the clock stops at an event, pauses or ends
  useEffect(() => {
    setNow(t.value);
  }, [status, t]);

  const tt = Math.min(now, tLandReal);
  const h = Math.max(0, position(tt, realBody));
  const v = velocity(tt, realBody);
  return (
    <Text style={[styles.readout, { color: p.muted }]} maxFontSizeMultiplier={1.2} accessibilityLabel={active ? `Time ${fixed(now, 2)} seconds, height ${fixed(h, 1)} metres, velocity ${signed(v, 1)} metres per second` : 'Readouts start after you answer'}>
      t <Text style={[styles.readoutValue, { color: p.ink }]}>{fixed(active ? now : 0, 2)} s</Text>
      {'  '}h <Text style={[styles.readoutValue, { color: p.ink }]}>{fixed(active ? h : H0, 1)} m</Text>
      {'  '}v <Text style={[styles.readoutValue, { color: p.velText }]}>{active ? signed(v, 1) : '?'} m s⁻¹</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: touch },
  segment: { flexDirection: 'row', borderWidth: 1.5, borderRadius: 999, overflow: 'hidden' },
  segBtn: { minHeight: touch, minWidth: 52, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  segText: { fontSize: 14, fontWeight: '700' },
  readout: { flexShrink: 1, fontSize: 13, fontVariant: ['tabular-nums'] },
  readoutValue: { fontSize: 15, fontWeight: '700' },
  condition: { fontSize: 15, lineHeight: 20 },
  scene: { flex: 1, minHeight: 220, borderWidth: 1.5, borderRadius: radius.l, overflow: 'hidden' },
  caption: { position: 'absolute', top: 8, left: 8, right: 8, borderRadius: radius.s, paddingVertical: 8, paddingHorizontal: 12 },
  captionText: { color: '#FFFFFF', fontSize: 15, lineHeight: 20, fontWeight: '700', textAlign: 'center' },
  viewSwitch: { position: 'absolute', left: 8, bottom: 8 },
  replay: { position: 'absolute', right: 8, bottom: 8, width: touch, height: touch, borderRadius: touch / 2, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  replayText: { fontSize: 22, fontWeight: '700' },
  prompt: { height: 64, justifyContent: 'center' },
  question: { fontSize: 17, fontWeight: '700', lineHeight: 22 },
  feedback: { fontSize: 15, lineHeight: 20 },
  options: { flexDirection: 'row', gap: 8 },
  option: { flex: 1, minHeight: 50, borderRadius: radius.m, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  optionText: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  primary: { minHeight: 52, borderRadius: radius.m, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontSize: 17, fontWeight: '700' },
});
