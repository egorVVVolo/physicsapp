// The card at the bottom of the map for the picked lesson: its tile, title, one line on what it is
// about, and the one main button. Picking another lesson swaps the contents with a short slide.
import { useEffect } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { LessonRef } from '@/content/types';
import { LessonTile } from '@/figures/LessonIcon';
import type { LevelColor } from '@/figures/Puck';
import { useTheme } from '@/theme/ThemeContext';
import { font } from '@/theme/tokens';
import { MainButton } from '@/ui/parts';
import { CONTENT_MAX } from '@/lesson/Frame';

type Props = {
  r: LessonRef;
  levelId: string;
  color: LevelColor;
  minutes?: number;
  status: 'new' | 'started' | 'done';
  bottomInset: number;
  onStart: () => void;
  onHeight: (h: number) => void;
};

export function Dock({ r, levelId, color, minutes, status, bottomInset, onStart, onHeight }: Props) {
  const { palette: p } = useTheme();
  const reduced = useReducedMotion();
  const rise = useSharedValue(reduced ? 1 : 0);
  const swap = useSharedValue(1);

  useEffect(() => {
    if (!reduced) rise.set(withSpring(1, { damping: 16, stiffness: 120 }));
  }, [rise, reduced]);
  useEffect(() => {
    if (reduced) return;
    swap.set(0);
    swap.set(withTiming(1, { duration: 220 }));
  }, [r.id, swap, reduced]);

  const card = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - rise.get()) * 220 }] }));
  const body = useAnimatedStyle(() => ({ opacity: swap.get(), transform: [{ translateX: (1 - swap.get()) * 18 }] }));

  const label = !r.ready ? 'Coming soon' : status === 'started' ? 'Continue' : status === 'done' ? 'Play again' : 'Start';
  const spec = `spec ${r.spec.length > 1 ? 'points' : 'point'} ${r.spec.join(', ')}`;
  const meta = r.ready && minutes ? `${minutes} min, ${spec}` : spec.charAt(0).toUpperCase() + spec.slice(1);

  return (
    <View pointerEvents="box-none" style={styles.dock} onLayout={(e: LayoutChangeEvent) => onHeight(e.nativeEvent.layout.height)}>
      {/* a soft wash of the level colour behind the card, fading up into the page */}
      <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="dock-wash" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color.soft} stopOpacity={0} />
            <Stop offset="0.35" stopColor={color.soft} stopOpacity={0.75} />
            <Stop offset="1" stopColor={color.soft} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#dock-wash)" />
      </Svg>

      <Animated.View style={[styles.column, { paddingBottom: bottomInset + 14 }, card]}>
        <View style={[styles.lip, { backgroundColor: p.lineStrong, bottom: bottomInset + 14 - 5 }]} />
        <View style={[styles.card, { backgroundColor: p.page, borderColor: p.line }]}>
          <Animated.View style={[styles.head, body]}>
            <LessonTile lessonId={r.id} levelId={levelId} color={r.ready ? color : GREY} size={48} id={`dock-${r.id}`} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: p.ink }]} accessibilityRole="header" numberOfLines={2} maxFontSizeMultiplier={1.3}>
                {r.title}
              </Text>
              <Text style={[styles.meta, { color: p.faint }]}>{meta}</Text>
            </View>
          </Animated.View>
          <Animated.Text style={[styles.about, { color: p.muted }, body]} maxFontSizeMultiplier={1.3}>
            {r.about}
          </Animated.Text>
          <MainButton tone="level" color={color} label={label} disabled={!r.ready} onPress={r.ready ? onStart : undefined} />
        </View>
      </Animated.View>
    </View>
  );
}

const GREY: LevelColor = { main: '#8A94A1', lip: '#66707C', soft: '#E9ECF0' };

const styles = StyleSheet.create({
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 56, paddingHorizontal: 16 },
  column: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center' },
  lip: { position: 'absolute', left: 0, right: 0, top: 6, borderRadius: 26 },
  card: { borderWidth: 2, borderRadius: 26, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 18, gap: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  title: { fontFamily: font.display, fontSize: 21, lineHeight: 26 },
  meta: { fontFamily: font.bodyMedium, fontSize: 14, marginTop: 2 },
  about: { fontFamily: font.body, fontSize: 16, lineHeight: 22 },
});
