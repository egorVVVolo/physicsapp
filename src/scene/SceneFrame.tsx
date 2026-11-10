// The view area of a step: the scene or the graph (one at a time), with the readout, event
// captions, pause on tap, scrubbing after the end, the view switch and the replay button.
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useAnimatedReaction, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import type { Playback, SceneSetup } from '@/content/types';
import { fixed, signed } from '@/physics/format';
import { trackPosition, trackVelocity, type Track } from '@/physics/kinematics';
import { useTheme } from '@/theme/ThemeContext';
import { radius, touch, type Palette } from '@/theme/tokens';
import { GRAPH_LEFT, GRAPH_RIGHT_PAD, HeightGraph } from './HeightGraph';
import { VerticalScene } from './VerticalScene';
import type { ClockStatus, useClock } from './useClock';

export type FrameView = 'scene' | 'graph' | 'solution';

type Props = {
  scene: SceneSetup;
  playback: Playback | null;
  clock: ReturnType<typeof useClock>;
  view: FrameView;
  onView: (v: FrameView) => void;
  /** Worked solution, offered as a third view when the answer has been revealed. */
  solution?: string[];
  /** The velocity readout shows "?" until the step is answered. */
  hideVelocity?: boolean;
};

export function SceneFrame({ scene, playback, clock, view, onView, solution, hideVelocity }: Props) {
  const { palette: p } = useTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const ended = clock.status === 'ended';
  const paused = clock.status === 'paused';
  const caption = playback && clock.eventId ? playback.captions[clock.eventId] ?? null : null;
  const real: Track = playback?.real ?? { motion: scene.body, from: 0, end: 0 };

  function onLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    if (Math.abs(width - size.width) > 0.5 || Math.abs(height - size.height) > 0.5) setSize({ width, height });
  }

  // Tap: pause / resume. After the end: drag sideways to move through time.
  const t = clock.t;
  const endT = playback?.endT ?? 0;
  const pxPerSecond =
    view === 'graph' && playback ? (size.width - GRAPH_LEFT - GRAPH_RIGHT_PAD) / playback.graph.tMax : endT > 0 ? size.width / endT : 1;
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

  const views: FrameView[] = playback ? (solution ? ['scene', 'graph', 'solution'] : ['scene', 'graph']) : solution ? ['scene', 'solution'] : [];
  const names: Record<FrameView, string> = { scene: 'Scene', graph: 'Graph', solution: 'Solution' };

  return (
    <View style={styles.outer}>
      <View style={styles.readoutRow}>
        <Readout t={clock.t} status={clock.status} real={real} active={playback !== null} hideVelocity={hideVelocity === true && playback === null} palette={p} />
      </View>
    <View style={[styles.frame, { borderColor: p.line, backgroundColor: view === 'scene' ? p.sky : p.surface }]} onLayout={onLayout}>
      {view === 'solution' && solution ? (
        <View style={styles.solution} accessible accessibilityLabel={`Worked solution. ${solution.join(' ')}`}>
          {solution.map((line, i) => (
            <Text key={i} style={[styles.solutionLine, { color: p.ink }]} maxFontSizeMultiplier={1.2}>
              <Text style={{ color: p.muted }}>{i + 1}  </Text>
              {line}
            </Text>
          ))}
        </View>
      ) : (
        <GestureDetector gesture={gestures}>
          <View
            style={StyleSheet.absoluteFill}
            accessible
            accessibilityRole="image"
            accessibilityLabel={caption ?? scene.description}
            accessibilityHint={playback && !ended ? 'Double tap to pause or resume' : undefined}
            accessibilityActions={[{ name: 'activate' }]}
            onAccessibilityAction={() => clock.togglePause()}
          >
            {size.width > 0 &&
              (view === 'graph' && playback ? (
                <HeightGraph t={clock.t} palette={p} width={size.width} height={size.height} real={playback.real} companion={playback.companion} tMax={playback.graph.tMax} hMax={playback.graph.hMax} />
              ) : (
                <VerticalScene t={clock.t} palette={p} width={size.width} height={size.height} scene={scene} playback={playback} />
              ))}
          </View>
        </GestureDetector>
      )}

      {view !== 'solution' && (caption || paused) && (
        <View pointerEvents="none" style={[styles.caption, { backgroundColor: p.eventText }]} accessibilityLiveRegion="polite">
          <Text style={styles.captionText} maxFontSizeMultiplier={1.3}>{paused ? 'Paused. Tap the scene to carry on.' : caption}</Text>
        </View>
      )}

      {views.length > 0 && (
        <View style={[styles.segment, { borderColor: p.line, backgroundColor: p.surface }]}>
          {views.map((k) => (
            <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: view === k }} onPress={() => onView(k)} style={[styles.segBtn, view === k && { backgroundColor: p.ink }]}>
              <Text style={[styles.segText, { color: view === k ? p.surface : p.ink }]}>{names[k]}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {ended && playback && view !== 'solution' && (
        <Pressable accessibilityRole="button" accessibilityLabel="Replay" onPress={() => clock.play(playback.events)} style={[styles.replay, { backgroundColor: p.surface, borderColor: p.line }]}>
          <Text style={[styles.replayText, { color: p.ink }]}>↻</Text>
        </Pressable>
      )}
    </View>
    </View>
  );
}

/** Live t / h / v of the real body. Owns its own state so the rest of the screen does not re-render while playing. */
function Readout({ t, status, real, active, hideVelocity, palette: p }: { t: SharedValue<number>; status: ClockStatus; real: Track; active: boolean; hideVelocity: boolean; palette: Palette }) {
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
  }, [status, t, real]);

  const shown = active ? now : 0;
  const h = Math.max(0, trackPosition(shown, real));
  const v = trackVelocity(shown, real);
  const vText = hideVelocity ? '?' : signed(v, 1);
  return (
    <Text
      style={[styles.readout, { color: p.muted }]}
      maxFontSizeMultiplier={1.2}
      accessibilityLabel={`Time ${fixed(shown, 2)} seconds, height ${fixed(h, 1)} metres, velocity ${hideVelocity ? 'hidden' : `${vText} metres per second`}`}
    >
      t <Text style={[styles.readoutValue, { color: p.ink }]}>{fixed(shown, 2)} s</Text>
      {'   '}h <Text style={[styles.readoutValue, { color: p.ink }]}>{fixed(h, 1)} m</Text>
      {'   '}v <Text style={[styles.readoutValue, { color: p.velText }]}>{vText} m s⁻¹</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, minHeight: 170, gap: 4 },
  readoutRow: { height: 20, alignItems: 'center', justifyContent: 'center' },
  frame: { flex: 1, borderWidth: 1.5, borderRadius: radius.l, overflow: 'hidden' },
  readout: { fontSize: 13, fontVariant: ['tabular-nums'] },
  readoutValue: { fontSize: 14, fontWeight: '700' },
  caption: { position: 'absolute', top: 6, left: 8, right: 8, borderRadius: radius.s, paddingVertical: 5, paddingHorizontal: 10 },
  captionText: { color: '#FFFFFF', fontSize: 14, lineHeight: 18, fontWeight: '700', textAlign: 'center' },
  segment: { position: 'absolute', left: 8, bottom: 8, flexDirection: 'row', borderWidth: 1.5, borderRadius: 999, overflow: 'hidden' },
  segBtn: { minHeight: touch, minWidth: 52, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  segText: { fontSize: 14, fontWeight: '700' },
  replay: { position: 'absolute', right: 8, bottom: 8, width: touch, height: touch, borderRadius: touch / 2, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  replayText: { fontSize: 22, fontWeight: '700' },
  solution: { flex: 1, padding: 14, paddingBottom: touch + 20, gap: 8, justifyContent: 'center' },
  solutionLine: { fontSize: 15, lineHeight: 21 },
});
