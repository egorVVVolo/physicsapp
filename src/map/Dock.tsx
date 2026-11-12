// The card at the bottom of the map for the picked lesson: its title and the one main button.
// A lesson that is not built yet also says in one line what it will cover, with a disabled button.
// Picking another lesson swaps the contents with a short slide.
import { useEffect } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { LessonRef } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { font, type LevelColor } from '@/theme/tokens';
import { MainButton } from '@/ui/parts';
import { CONTENT_MAX } from '@/lesson/Frame';

type Props = {
  r: LessonRef;
  color: LevelColor;
  status: 'new' | 'started' | 'done';
  bottomInset: number;
  onStart: () => void;
  /** Height of the card itself (without the wash above it). */
  onHeight: (h: number) => void;
};

const WASH = 120; // how far the colour wash reaches above the card

export function Dock({ r, color, status, bottomInset, onStart, onHeight }: Props) {
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
  const body = useAnimatedStyle(() => ({ opacity: swap.get(), transform: [{ translateY: (1 - swap.get()) * 8 }] }));

  const label = !r.ready ? 'Coming soon' : status === 'started' ? 'Continue' : status === 'done' ? 'Play again' : 'Start';

  return (
    <View pointerEvents="box-none" style={styles.dock} onLayout={(e: LayoutChangeEvent) => onHeight(e.nativeEvent.layout.height - WASH)}>
      {/* a soft wash of the course colour behind the card, fading up into the page */}
      <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="dock-wash" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color.soft} stopOpacity={0} />
            <Stop offset="1" stopColor={color.soft} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#dock-wash)" />
      </Svg>

      <Animated.View style={[styles.column, { paddingBottom: bottomInset + 16 }, card]}>
        <View style={[styles.lip, { backgroundColor: '#D5DAE0', bottom: bottomInset + 16 - 5 }]} />
        <View style={[styles.card, { backgroundColor: p.page, borderColor: '#E3E6EA' }]}>
          <Animated.View style={body}>
            <Text style={[styles.title, { color: p.ink }]} accessibilityRole="header" numberOfLines={2} maxFontSizeMultiplier={1.3}>
              {r.title}
            </Text>
            {!r.ready && (
              <Text style={[styles.about, { color: p.muted }]} maxFontSizeMultiplier={1.3}>
                {r.about}
              </Text>
            )}
          </Animated.View>
          <MainButton tone="level" color={color} label={label} disabled={!r.ready} onPress={r.ready ? onStart : undefined} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: WASH, paddingHorizontal: 16 },
  column: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center' },
  lip: { position: 'absolute', left: 0, right: 0, top: 6, borderRadius: 26 },
  card: { borderWidth: 2, borderRadius: 26, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 18, gap: 16 },
  title: { fontFamily: font.display, fontSize: 22, lineHeight: 28, textAlign: 'center' },
  about: { fontFamily: font.body, fontSize: 16, lineHeight: 22, textAlign: 'center', marginTop: 6 },
});
