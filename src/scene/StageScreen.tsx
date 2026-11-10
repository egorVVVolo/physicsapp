// The whole step screen: a dark stage (progress, centred question, the balloon scene, caption)
// on top and a light sheet below with the step's controls and ONE primary button.
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import type { Highlight, Playback, SceneSetup } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { radius, touch } from '@/theme/tokens';
import { BalloonScene } from './BalloonScene';
import type { useClock } from './useClock';

export type StageScreenProps = {
  scene: SceneSetup;
  playback: Playback | null; // null = only the setup is shown (before release)
  clock: ReturnType<typeof useClock>;
  title: string; // the question or idea title, centred on the stage
  line?: string; // idea cards: one sentence under the title
  tag?: boolean; // show the small "up is +  g = 9.81 m s⁻²" tag
  facts?: string[]; // extra given facts as small pills next to the tag
  compact?: boolean; // shorter stage (title + a small scene) so a tall sheet fits, e.g. spot-the-error
  highlight?: Highlight; // point out s, u or a on the scene
  /** Velocity (m s⁻¹, up positive) of the learner's chosen answer, shown as an arrow on the held sandbag before release. */
  previewValue?: number | null;
  progress: { index: number; total: number; onClose: () => void };
  /** Content of the light sheet (answers, tray, feedback). */
  children: ReactNode;
  /** The one main button. Omit it when a tap on an answer already commits it (build steps). */
  primary?: { label: string; disabled?: boolean; onPress: () => void };
};

const OVERLAP = 18; // how far the sheet covers the bottom of the stage, pt
const CAPTION_ROW = 32; // reserved so the scene does not jump when a caption appears

export function StageScreen(props: StageScreenProps) {
  const { scene, playback, clock, title, line, tag, facts, compact, highlight, previewValue, progress, children, primary } = props;
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  const win = useWindowDimensions();
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [headBottom, setHeadBottom] = useState(150); // bottom edge of the title area, measured

  const W = size?.w ?? win.width;
  const H = size?.h ?? win.height;
  // an idea card has no controls, only a button: give the scene most of the screen
  const noControls = children === null || children === undefined || children === false;
  const stageH = Math.round(H * (compact ? 0.5 : noControls ? 0.74 : 0.58));

  const caption = playback && clock.eventId ? (playback.captions[clock.eventId] ?? null) : null;
  const stageLabel = caption ?? scene.description;
  const pills = [...(tag ? ['up is +   g = 9.81 m s⁻²'] : []), ...(facts ?? [])];
  const canReplay = playback !== null && clock.status === 'ended';

  return (
    <View style={[styles.root, { backgroundColor: p.sheet }]} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {/* ---- the dark stage ---- */}
      <View style={{ height: stageH, backgroundColor: p.stage }}>
        <View style={StyleSheet.absoluteFill} accessible accessibilityLabel={stageLabel}>
          <BalloonScene
            t={clock.t}
            width={W}
            height={stageH}
            topInset={headBottom}
            bottomInset={OVERLAP}
            compact={compact}
            scene={scene}
            playback={playback}
            highlight={highlight}
            previewValue={previewValue}
          />
        </View>

        <View
          style={[styles.head, { paddingTop: insets.top + 4 }]}
          pointerEvents="box-none"
          onLayout={(e) => setHeadBottom(e.nativeEvent.layout.y + e.nativeEvent.layout.height)}
        >
          <View style={styles.progressRow}>
            <Pressable onPress={progress.onClose} accessibilityRole="button" accessibilityLabel="Close the session" hitSlop={4} style={styles.close}>
              <Svg width={14} height={14} viewBox="0 0 12 12">
                <Path d="M2 2l8 8M10 2l-8 8" stroke={p.stageText} strokeOpacity={0.85} strokeWidth={1.8} strokeLinecap="round" />
              </Svg>
            </Pressable>
            <View style={styles.segments} accessible accessibilityLabel={`Step ${progress.index + 1} of ${progress.total}`}>
              {Array.from({ length: progress.total }, (_, i) => (
                <View key={i} style={[styles.segment, { backgroundColor: p.stageText, opacity: i <= progress.index ? 1 : 0.22 }]} />
              ))}
            </View>
          </View>

          <Text style={[styles.title, { color: p.stageText }]} accessibilityRole="header">{title}</Text>
          {line ? <Text style={[styles.line, { color: p.stageMuted }]}>{line}</Text> : null}

          {/* one info row: the given facts, or the event caption while one is showing (never both) */}
          <View style={styles.infoRow} pointerEvents="none">
            {caption ? (
              <View style={[styles.pill, { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'transparent' }]}>
                <Text style={[styles.pillText, { color: p.stageText }]}>{caption}</Text>
              </View>
            ) : (
              pills.map((f) => (
                <View key={f} style={styles.pill}>
                  <Text style={[styles.pillText, { color: p.stageMuted }]}>{f}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {canReplay && (
          <Pressable
            onPress={() => playback && clock.play(playback.events)}
            accessibilityRole="button"
            accessibilityLabel="Replay"
            style={[styles.replay, { bottom: OVERLAP + 4, borderColor: p.stageDim }]}
          >
            <Svg width={20} height={20} viewBox="0 0 20 20">
              <Path d="M16 10a6 6 0 1 1-2-4.5M16 3v4h-4" stroke={p.stageText} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </Pressable>
        )}
      </View>

      {/* ---- the light sheet ---- */}
      <View style={[styles.sheet, { backgroundColor: p.sheet, marginTop: -OVERLAP, paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
          {children}
        </ScrollView>
        {primary && (
          <Pressable
            onPress={primary.disabled ? undefined : primary.onPress}
            accessibilityRole="button"
            accessibilityState={{ disabled: !!primary.disabled }}
            style={({ pressed }) => [
              styles.primary,
              { backgroundColor: primary.disabled ? p.disabled : p.primary, opacity: pressed && !primary.disabled ? 0.88 : 1 },
            ]}
          >
            <Text style={[styles.primaryText, { color: primary.disabled ? p.onDisabled : p.onPrimary }]}>{primary.label}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  head: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16, alignItems: 'center' },
  progressRow: { flexDirection: 'row', alignItems: 'center', height: touch, alignSelf: 'stretch' },
  close: { width: touch, height: touch, marginLeft: -16, alignItems: 'center', justifyContent: 'center' },
  segments: { flex: 1, flexDirection: 'row', gap: 4, marginRight: 12 },
  segment: { flex: 1, height: 3, borderRadius: 2 },
  title: { marginTop: 8, fontSize: 23, lineHeight: 28, fontWeight: '600', textAlign: 'center', maxWidth: 270 },
  line: { marginTop: 8, fontSize: 15, lineHeight: 20, textAlign: 'center', maxWidth: 300 },
  infoRow: { marginTop: 10, minHeight: CAPTION_ROW, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8 },
  pill: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontSize: 13, lineHeight: 17 },
  replay: {
    position: 'absolute',
    right: 12,
    width: touch,
    height: touch,
    borderRadius: touch / 2,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: { flex: 1, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, paddingTop: 16, paddingHorizontal: 16 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, gap: 12 },
  primary: { height: 54, borderRadius: 16, marginTop: 12, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontSize: 17, fontWeight: '600' },
});
