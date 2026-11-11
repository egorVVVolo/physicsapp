// One lesson on the map: the puck (sinks when pressed), its title, a pulsing halo when picked,
// and for the next lesson to do a tile hovering above the puck.
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Ellipse } from 'react-native-svg';
import type { LessonRef } from '@/content/types';
import { LessonTile } from '@/figures/LessonIcon';
import { Puck, type LevelColor, type PuckState } from '@/figures/Puck';
import { useTheme } from '@/theme/ThemeContext';
import { font } from '@/theme/tokens';
import { PUCK } from './layout';

const K = PUCK / 100; // puck viewBox → pt
const PUCK_H = 84 * K;
const FACE_Y = 34 * K; // centre of the face inside the puck drawing
const TILE = 56;
const TILE_H = (TILE * 66) / 60;

type Props = {
  r: LessonRef;
  levelId: string;
  color: LevelColor;
  state: PuckState;
  picked: boolean;
  next: boolean; // the next lesson to do: gets the hovering tile
  /** Where the puck's face centre is inside this row, and where the title column starts. */
  cx: number;
  cy: number;
  labelLeft: number;
  order: number; // position on the whole map, for the opening stagger
  onPick: () => void;
};

export function PuckRow({ r, levelId, color, state, picked, next, cx, cy, labelLeft, order, onPick }: Props) {
  const { palette: p } = useTheme();
  const reduced = useReducedMotion();
  const press = useSharedValue(0);
  const appear = useSharedValue(reduced ? 1 : 0);
  const pulse = useSharedValue(0);
  const bob = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    appear.set(withDelay(Math.min(order, 12) * 45, withSpring(1, { damping: 13, stiffness: 140 })));
  }, [appear, order, reduced]);

  useEffect(() => {
    if (!picked || reduced) {
      pulse.set(0);
      return;
    }
    pulse.set(withRepeat(withSequence(withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 900, easing: Easing.in(Easing.quad) })), -1));
  }, [picked, pulse, reduced]);

  useEffect(() => {
    if (!next || reduced) return;
    bob.set(withRepeat(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [next, bob, reduced]);

  const puckStyle = useAnimatedStyle(() => ({
    opacity: appear.get(),
    transform: [{ translateY: (1 - appear.get()) * 14 }, { scale: 0.7 + 0.3 * appear.get() }],
  }));
  const labelStyle = useAnimatedStyle(() => ({ opacity: appear.get() }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: appear.get() * (0.95 - 0.45 * pulse.get()),
    transform: [{ scale: 1 + 0.07 * pulse.get() - 0.04 * press.get() }],
  }));
  const tileStyle = useAnimatedStyle(() => ({
    opacity: appear.get(),
    transform: [{ translateY: -7 * bob.get() + (1 - appear.get()) * 20 + press.get() * 5 }],
  }));
  const tileShadow = useAnimatedStyle(() => ({ opacity: appear.get() * (0.28 - 0.12 * bob.get()), transform: [{ scale: 1 - 0.18 * bob.get() }] }));

  const top = cy - FACE_Y;
  const left = cx - PUCK / 2;
  const titleColor = state === 'soon' ? p.faint : state === 'done' ? p.muted : p.ink;
  const status = state === 'done' ? ', done' : state === 'soon' ? ', coming soon' : next ? ', up next' : '';

  return (
    <>
      {picked && (
        <Animated.View pointerEvents="none" style={[styles.abs, { left: cx - PUCK / 2 - 14, top: top + 6, width: PUCK + 28, height: PUCK_H }, haloStyle]}>
          <Svg width={PUCK + 28} height={PUCK_H} viewBox={`0 0 ${PUCK + 28} ${PUCK_H}`}>
            {/* a glow ring on the floor around the picked puck */}
            <Ellipse cx={(PUCK + 28) / 2} cy={PUCK_H * 0.5} rx={(PUCK + 28) / 2 - 7} ry={PUCK_H * 0.38} fill="none" stroke={color.main} strokeOpacity={0.16} strokeWidth={10} />
            <Ellipse cx={(PUCK + 28) / 2} cy={PUCK_H * 0.5} rx={(PUCK + 28) / 2 - 7} ry={PUCK_H * 0.38} fill="none" stroke={color.main} strokeOpacity={0.7} strokeWidth={3} />
          </Svg>
        </Animated.View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${r.title}${status}`}
        accessibilityState={{ selected: picked }}
        onPress={onPick}
        onPressIn={() => {
          press.set(withTiming(1, { duration: 80 }));
        }}
        onPressOut={() => {
          press.set(withSpring(0, { damping: 9, stiffness: 260 }));
        }}
        style={[styles.abs, { left, top: top - 8, right: 0, height: PUCK_H + 16 }]}
      >
        <Animated.View style={[{ marginTop: 8 }, puckStyle]}>
          <Puck size={PUCK} state={state} color={color} press={press} id={r.id} />
        </Animated.View>
      </Pressable>

      <Animated.View pointerEvents="none" style={[styles.abs, styles.label, { left: labelLeft, top, height: PUCK_H * 0.82 }, labelStyle]}>
        <Text style={[styles.title, { color: titleColor }, next && styles.titleNext]} numberOfLines={2} maxFontSizeMultiplier={1.3}>
          {r.title}
        </Text>
        {state === 'soon' && <Text style={[styles.soon, { color: p.faint }]}>Soon</Text>}
        {next && <Text style={[styles.soon, { color: color.lip }]}>Up next</Text>}
      </Animated.View>

      {next && (
        <>
          <Animated.View pointerEvents="none" style={[styles.abs, styles.tileShadow, { left: cx - 22, top: cy - 6 }, tileShadow]} />
          <Animated.View pointerEvents="none" style={[styles.abs, { left: cx - TILE / 2, top: cy - TILE_H - 12 }, tileStyle]}>
            <LessonTile lessonId={r.id} levelId={levelId} color={color} size={TILE} id={`map-${r.id}`} />
          </Animated.View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  label: { right: 0, justifyContent: 'center' },
  title: { fontFamily: font.bodySemi, fontSize: 17, lineHeight: 22 },
  titleNext: { fontFamily: font.bodyBold },
  soon: { fontFamily: font.bodyMedium, fontSize: 14, marginTop: 2 },
  tileShadow: { width: 44, height: 13, borderRadius: 22, backgroundColor: '#1A1E25' },
});
