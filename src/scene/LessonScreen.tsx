// The step screen: progress on top, the question, the big scene (most of the screen),
// a slim answer strip, and the bottom bar. The bar holds one chunky button; after a check
// it turns into a verdict banner (green or red, with an icon and words) and "Continue".
import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import type { Highlight, Playback, SceneSetup } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { touch } from '@/theme/tokens';
import { ChunkyButton, CloseIcon, Mark, type Tone } from '@/ui/parts';
import { BalloonScene, type SceneGeometry } from './BalloonScene';
import type { useClock } from './useClock';

export type Banner = { ok: boolean | null; title: string; text: string };
export type BarState = { label: string; onPress?: () => void; disabled?: boolean; tone?: Tone; banner?: Banner | null };

export type LessonScreenProps = {
  progress: { index: number; total: number; onClose: () => void };
  prompt: string;
  command?: string; // exam format: the bold command word in front of the prompt
  instruction?: string; // how to answer, named by its gesture ("Drag the arrow…"), under the prompt
  instructionHidden?: boolean; // after a check: the line keeps its room (so the scene does not jump) but is not shown
  note?: string; // one small line under the prompt ("up is +", a given fact)
  scene: SceneSetup;
  playback: Playback | null;
  clock: ReturnType<typeof useClock>;
  highlight?: Highlight;
  showBalloon?: boolean;
  showHeldSack?: boolean;
  overlay?: (g: SceneGeometry) => ReactNode; // interactions on the scene
  strip?: ReactNode; // the slim answer area under the scene
  bar: BarState;
};

export function LessonScreen(props: LessonScreenProps) {
  const { progress, prompt, command, instruction, instructionHidden, note, scene, playback, clock, highlight, showBalloon, showHeldSack, overlay, strip, bar } = props;
  const { palette: p } = useTheme();
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const caption = playback && clock.eventId ? (playback.captions[clock.eventId] ?? null) : null;
  const banner = bar.banner ?? null;

  // iOS has no live regions: say the verdict out loud
  useEffect(() => {
    if (banner) AccessibilityInfo.announceForAccessibility(`${banner.title}. ${banner.text}`);
  }, [banner?.title, banner?.text]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: p.page }]} edges={['top', 'bottom']}>
      {/* progress */}
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close the session" onPress={progress.onClose} hitSlop={8} style={styles.close}>
          <CloseIcon color={p.faint} />
        </Pressable>
        <View style={[styles.track, { backgroundColor: p.disabled }]} accessible accessibilityRole="progressbar" accessibilityLabel={`Step ${progress.index + 1} of ${progress.total}`}>
          <View style={[styles.fill, { backgroundColor: p.ok, width: `${Math.max(6, (progress.index / progress.total) * 100)}%` }]}>
            <View style={styles.shine} />
          </View>
        </View>
      </View>

      {/* the question */}
      <View style={styles.promptBox}>
        <Text style={[styles.prompt, { color: p.ink }]} accessibilityRole="header" maxFontSizeMultiplier={1.2}>
          {command ? <Text style={{ fontWeight: '800' }}>{command} </Text> : null}
          {prompt}
        </Text>
        {instruction ? (
          <View
            style={[styles.instructionRow, instructionHidden && { opacity: 0 }]}
            aria-hidden={instructionHidden}
          >
            <HandIcon color={p.select} />
            <Text style={[styles.instruction, { color: p.select }]} maxFontSizeMultiplier={1.2}>{instruction}</Text>
          </View>
        ) : null}
        {note ? <Text style={[styles.note, { color: p.muted }]} maxFontSizeMultiplier={1.2}>{note}</Text> : null}
      </View>

      {/* the scene: everything left over goes here */}
      <View style={styles.scene} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {size && (
          <View accessible={!overlay} accessibilityLabel={caption ?? scene.description} style={StyleSheet.absoluteFill}>
            <BalloonScene
              t={clock.t}
              width={size.w}
              height={size.h}
              scene={scene}
              playback={playback}
              highlight={highlight}
              showBalloon={showBalloon}
              showHeldSack={showHeldSack}
              viewOverlay={overlay}
            />
          </View>
        )}
        {caption && (
          <View pointerEvents="none" style={styles.captionWrap}>
            <View style={[styles.caption, { backgroundColor: p.ink }]}>
              <Text style={styles.captionText} maxFontSizeMultiplier={1.2}>{caption}</Text>
            </View>
          </View>
        )}
        {playback !== null && clock.status === 'ended' && (
          <Pressable accessibilityRole="button" accessibilityLabel="Replay" onPress={() => clock.play(playback.events)} style={[styles.replay, { backgroundColor: p.page, borderColor: p.line }]}>
            <Svg width={18} height={18} viewBox="0 0 20 20">
              <Path d="M16 10a6 6 0 1 1-2-4.5M16 3v4h-4" stroke={p.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </Pressable>
        )}
      </View>

      {/* the slim answer strip */}
      {/* always there, so the scene keeps its size and the verdict banner has room to slide over it */}
      <View style={styles.strip}>{strip}</View>

      {/* the bottom bar: one button, or the verdict banner with Continue */}
      <View
        style={[
          styles.bar,
          { borderTopColor: banner ? 'transparent' : p.line, backgroundColor: banner ? (banner.ok === true ? p.okBg : banner.ok === false ? p.badBg : p.selectBg) : p.page },
        ]}
      >
        {banner && (
          <View style={[styles.banner, { backgroundColor: banner.ok === true ? p.okBg : banner.ok === false ? p.badBg : p.selectBg }]} accessibilityLiveRegion="polite">
            {banner.ok !== null && (
              <View style={[styles.badge, { backgroundColor: p.page }]}>
                <Mark kind={banner.ok ? 'ok' : 'bad'} color={banner.ok ? p.ok : p.bad} size={18} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: banner.ok === true ? p.okText : banner.ok === false ? p.badText : p.ink }]} maxFontSizeMultiplier={1.2}>
                {banner.title}
              </Text>
              <Text style={[styles.bannerText, { color: banner.ok === true ? p.okText : banner.ok === false ? p.badText : p.ink }]} maxFontSizeMultiplier={1.25}>
                {banner.text}
              </Text>
            </View>
          </View>
        )}
        <ChunkyButton label={bar.label} onPress={bar.onPress} disabled={bar.disabled} tone={bar.tone} />
      </View>
    </SafeAreaView>
  );
}

/** A small pointing finger: marks the line that says how to answer. */
function HandIcon({ color }: { color: string }) {
  return (
    <View aria-hidden>
      <Svg width={16} height={16} viewBox="0 0 20 20">
        <Path
          d="M7.5 10V3.8a1.5 1.5 0 0 1 3 0V9m0-1.2a1.5 1.5 0 0 1 3 0V9.5m0-.7a1.5 1.5 0 0 1 3 0v3.4c0 3-2.2 5.3-5.2 5.3h-.6c-1.8 0-3.2-.8-4.2-2.2L3.7 12a1.4 1.4 0 0 1 2.3-1.6l1.5 1.8"
          stroke={color}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  close: { width: touch, height: touch, marginLeft: -14, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 12, borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
  shine: { position: 'absolute', left: 6, right: 6, top: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)' },
  promptBox: { paddingHorizontal: 22, paddingBottom: 10, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  prompt: { fontSize: 19, lineHeight: 24, fontWeight: '700', textAlign: 'center' },
  instructionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  instruction: { fontSize: 14, fontWeight: '700', textAlign: 'center', flexShrink: 1 },
  note: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  scene: { flex: 1, minHeight: 240, overflow: 'hidden' },
  captionWrap: { position: 'absolute', top: 10, left: 60, right: 60, alignItems: 'center' },
  caption: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, opacity: 0.92 },
  captionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  replay: { position: 'absolute', right: 10, top: 8, width: touch, height: touch, borderRadius: touch / 2, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  strip: { minHeight: 84, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, alignItems: 'center', justifyContent: 'center' },
  bar: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, borderTopWidth: 2 },
  // the verdict slides over the answer strip (it is positioned above the bar), so the scene never changes size
  banner: { position: 'absolute', left: 0, right: 0, bottom: '100%', flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4, minHeight: 72 },
  badge: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { fontSize: 17, fontWeight: '800' },
  bannerText: { fontSize: 14, fontWeight: '600', marginTop: 2, lineHeight: 19 },
});
