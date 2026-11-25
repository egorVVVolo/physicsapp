// One lesson on the map: the puck (sinks when pressed), its title, a pulsing halo when picked,
// and for the next lesson to do a tile hovering above the puck. When a lesson becomes the next one while
// the map is open (a ball rolled to it), the tile drops into place.
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Ellipse } from 'react-native-svg';
import type { LessonRef } from '@/content/types';
import { LessonTile } from '@/figures/LessonIcon';
import { Puck, PUCK_FACE_Y, PUCK_VB_H, PUCK_VB_W, type LevelColor, type PuckState } from '@/figures/Puck';
import { useTheme } from '@/theme/ThemeContext';
import { mix } from '@/theme/levelColor';
import { font } from '@/theme/tokens';
import { feedback } from '@/ui/feedback';
import { Pop } from '@/ui/motion';
import { PUCK } from './layout';

const K = PUCK / PUCK_VB_W; // puck viewBox → pt
const PUCK_H = PUCK_VB_H * K;
const FACE_Y = PUCK_FACE_Y * K; // centre of the top face inside the puck drawing
const HALO_W = PUCK + 34;
const HALO_H = PUCK_H + 16;
const TILE = 60;

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
  /** The puck pops once when this turns true (its check just appeared, or it just opened). */
  pop?: boolean;
  onPick: () => void;
};

export function PuckRow({ r, levelId, color, state, picked, next, cx, cy, labelLeft, order, pop = false, onPick }: Props) {
  const { palette: p, level } = useTheme();
  const reduced = useReducedMotion();
  const press = useSharedValue(0);
  const appear = useSharedValue(reduced ? 1 : 0);
  const pulse = useSharedValue(0);
  const bob = useSharedValue(0);
  const tileIn = useSharedValue(1); // the tile dropping in when this lesson becomes the next one
  const wasNext = useRef(next);

  useEffect(() => {
    if (reduced) return;
    appear.set(withDelay(Math.min(order, 12) * 45, withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) })));
  }, [appear, order, reduced]);

  useEffect(() => {
    if (!picked || reduced) {
      pulse.set(0);
      return;
    }
    pulse.set(withRepeat(withSequence(withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 900, easing: Easing.in(Easing.quad) })), -1));
  }, [picked, pulse, reduced]);

  useEffect(() => {
    if (next && !wasNext.current && !reduced) {
      tileIn.set(0);
      tileIn.set(withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }));
    }
    wasNext.current = next;
  }, [next, reduced, tileIn]);

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
    opacity: appear.get() * (1 - 0.35 * pulse.get()),
    transform: [{ scale: 1 + 0.05 * pulse.get() - 0.04 * press.get() }],
  }));
  const tileStyle = useAnimatedStyle(() => ({
    opacity: appear.get() * tileIn.get(),
    transform: [{ translateY: -7 * bob.get() + (1 - appear.get()) * 20 - (1 - tileIn.get()) * 14 + press.get() * 5 }],
  }));
  const tileShadow = useAnimatedStyle(() => ({ opacity: appear.get() * tileIn.get() * (0.22 - 0.1 * bob.get()), transform: [{ scale: 1 - 0.18 * bob.get() }] }));

  const top = cy - FACE_Y;
  const left = cx - PUCK / 2;
  const titleColor = state === 'soon' ? p.faint : state === 'done' ? p.muted : p.ink;
  const status = state === 'done' ? ', done' : state === 'soon' ? ', coming soon' : next ? ', up next' : '';

  return (
    <>
      {picked && (
        <Animated.View pointerEvents="none" style={[styles.abs, { left: cx - HALO_W / 2, top: top + PUCK_H / 2 - HALO_H / 2, width: HALO_W, height: HALO_H }, haloStyle]}>
          {/* a flat ring on the floor around the picked puck */}
          <Svg width={HALO_W} height={HALO_H} viewBox={`0 0 ${HALO_W} ${HALO_H}`}>
            <Ellipse cx={HALO_W / 2} cy={HALO_H / 2} rx={HALO_W / 2 - 5} ry={HALO_H / 2 - 5} fill="none" stroke={mix(color.face, p.page, 0.75)} strokeWidth={8} />
          </Svg>
        </Animated.View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${r.title}${status}`}
        accessibilityState={{ selected: picked }}
        onPress={() => {
          feedback.pick();
          onPick();
        }}
        onPressIn={() => {
          press.set(withTiming(1, { duration: 80 }));
        }}
        onPressOut={() => {
          press.set(withTiming(0, { duration: 160, easing: Easing.out(Easing.cubic) }));
        }}
        style={[styles.abs, { left, top: top - 8, right: 0, height: PUCK_H + 16 }]}
      >
        <Animated.View style={[{ marginTop: 8 }, puckStyle]}>
          <Pop trigger={pop}>
            <Puck size={PUCK} state={state} color={color} press={press} />
          </Pop>
        </Animated.View>
      </Pressable>

      <Animated.View pointerEvents="none" style={[styles.abs, styles.label, { left: labelLeft, top, height: PUCK_H * 0.82 }, labelStyle]}>
        <Text style={[styles.title, { color: titleColor }, next && styles.titleNext]} numberOfLines={2} maxFontSizeMultiplier={1.3}>
          {r.title}
        </Text>
        {state === 'soon' && <Text style={[styles.soon, { color: p.faint }]}>Soon</Text>}
        {next && <Text style={[styles.soon, { color: level(color).text }]}>Up next</Text>}
      </Animated.View>

      {next && (
        <>
          <Animated.View pointerEvents="none" style={[styles.abs, styles.tileShadow, { left: cx - 22, top: cy - 6 }, tileShadow]} />
          <Animated.View pointerEvents="none" style={[styles.abs, { left: cx - TILE / 2, top: cy - TILE_H - 12 }, tileStyle]}>
            <LessonTile lessonId={r.id} levelId={levelId} color={color} size={TILE} />
          </Animated.View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  label: { right: 0, justifyContent: 'center' },
  title: { fontFamily: font.bodySemi, fontSize: 18, lineHeight: 23 },
  titleNext: { fontFamily: font.bodyBold },
  soon: { fontFamily: font.bodyMedium, fontSize: 14, marginTop: 2 },
  tileShadow: { width: 44, height: 13, borderRadius: 22, backgroundColor: '#1A1E25' },
});
