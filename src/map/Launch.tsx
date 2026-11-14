// The launch animation, once per app launch (not when coming back from a lesson).
// A white screen with a short hatched floor; the mark drops onto it by a model: constant g, and each
// bounce keeps e of the speed (g = 2600 pt/s², e = 0.42, fixed 4 ms steps so the heights do not depend on
// the frame rate). When a bounce is slower than 110 pt/s the mark rests, then flies to the puck of the
// lesson the map opens at and shrinks to its size while the white clears; the mark fades over the puck.
// A tap anywhere skips it. With reduced motion it is not shown at all.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useFrameCallback, useReducedMotion, useSharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';
import { mark } from '@/art/brand';
import { useTheme } from '@/theme/ThemeContext';
import { courseBlue } from '@/theme/tokens';
import { Art } from '@/ui/Art';
import { feedback } from '@/ui/feedback';

/** Where the mark ends: the box of the puck on screen (the mark is drawn in the puck's 100 × 76 box). */
export type LaunchTarget = { x: number; y: number; w: number };

const W0 = 120; // the mark's width while it falls, pt
const H0 = (W0 * 76) / 100;
const BOTTOM = (W0 * 66) / 100; // the lowest point of the drawing, from its top
const G = 2600; // pt/s²
const E = 0.42; // restitution
const STEP = 0.004; // s
const REST = 110; // pt/s: slower than this after a bounce, the mark stays down
const PAUSE = 0.26; // s, resting on the floor
const MOVE = 0.52; // s, the flight to the puck
const FADE = 0.22; // s, the mark fades over the puck
const FLOOR_W = 160;
const easeInOut = Easing.inOut(Easing.cubic);

let played = false; // module state: survives navigation, resets when the app starts again

export function Launch({ target }: { target: () => LaunchTarget | undefined }) {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(() => !played && !reduced);
  useEffect(() => {
    played = true;
  }, []);
  const finish = useCallback(() => setShow(false), []);
  if (!show) return null;
  return <Drop target={target} onDone={finish} />;
}

function Drop({ target, onDone }: { target: () => LaunchTarget | undefined; onDone: () => void }) {
  const { palette: p } = useTheme();
  const { width: sw, height: sh } = useWindowDimensions();
  const floorY = Math.round(sh / 2);
  const land = floorY - BOTTOM; // the mark's top when it rests on the floor
  const x0 = sw / 2; // centre of the mark while it falls

  // the latest map layout, read when the flight starts
  const targetRef = useRef(target);
  useEffect(() => {
    targetRef.current = target;
  });

  const y = useSharedValue(-H0 - 20); // the mark's top
  const v = useSharedValue(0);
  const hits = useSharedValue(0);
  const phase = useSharedValue(0); // 0 falling · 1 resting · 2 flying · 3 fading · 4 done
  const t = useSharedValue(0); // time inside the phase
  const acc = useSharedValue(0); // physics time not yet stepped
  const tx = useSharedValue(x0); // the flight's end: centre and scale
  const ty = useSharedValue(land + H0 / 2);
  const tk = useSharedValue(1);

  const onHit = (n: number) => feedback.bounce(n);
  const aim = () => {
    const box = targetRef.current();
    if (!box) return;
    const k = box.w / W0;
    tx.set(box.x + box.w / 2);
    ty.set(box.y + (H0 * k) / 2);
    tk.set(k);
  };

  useFrameCallback((info) => {
    'worklet';
    const dt = Math.min(0.05, (info.timeSincePreviousFrame ?? 16) / 1000);
    const ph = phase.get();
    if (ph === 4) return;
    if (ph === 0) {
      let left = acc.get() + dt;
      let yy = y.get();
      let vv = v.get();
      while (left >= STEP) {
        left -= STEP;
        vv += G * STEP;
        yy += vv * STEP;
        if (yy >= land) {
          yy = land;
          vv = -vv * E;
          const n = hits.get() + 1;
          hits.set(n);
          if (n <= 3) scheduleOnRN(onHit, n);
          if (Math.abs(vv) < REST) {
            vv = 0;
            phase.set(1);
            t.set(0);
            scheduleOnRN(aim);
            break;
          }
        }
      }
      acc.set(left);
      y.set(yy);
      v.set(vv);
      return;
    }
    const tt = t.get() + dt;
    t.set(tt);
    if (ph === 1 && tt >= PAUSE) {
      phase.set(2);
      t.set(0);
    } else if (ph === 2 && tt >= MOVE) {
      phase.set(3);
      t.set(0);
    } else if (ph === 3 && tt >= FADE) {
      phase.set(4);
      scheduleOnRN(onDone);
    }
  });

  // the whole thing never takes longer than 2.5 s
  useEffect(() => {
    const id = setTimeout(onDone, 2500);
    return () => clearTimeout(id);
  }, [onDone]);

  const markStyle = useAnimatedStyle(() => {
    const ph = phase.get();
    const k = ph < 2 ? 0 : ph === 2 ? easeInOut(Math.min(1, t.get() / MOVE)) : 1;
    const cx = x0 + (tx.get() - x0) * k;
    const cy = y.get() + H0 / 2 + (ty.get() - (y.get() + H0 / 2)) * k;
    const scale = 1 + (tk.get() - 1) * k;
    const opacity = ph < 3 ? 1 : Math.max(0, 1 - t.get() / FADE);
    return { opacity, transform: [{ translateX: cx - W0 / 2 }, { translateY: cy - H0 / 2 }, { scale }] };
  });
  // the white clears while the mark flies, so it lands on the real map
  const paperStyle = useAnimatedStyle(() => {
    const ph = phase.get();
    return { opacity: ph < 2 ? 1 : ph === 2 ? 1 - easeInOut(Math.min(1, t.get() / MOVE)) : 0 };
  });
  const floorStyle = useAnimatedStyle(() => {
    const ph = phase.get();
    return { opacity: ph < 2 ? 1 : ph === 2 ? Math.max(0, 1 - t.get() / 0.2) : 0 };
  });

  return (
    <Pressable accessibilityLabel="Skip the opening animation" onPress={onDone} style={StyleSheet.absoluteFill}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: p.page }, paperStyle]} />
      <Animated.View pointerEvents="none" style={[styles.abs, { left: sw / 2 - FLOOR_W / 2, top: floorY - 1.5 }, floorStyle]}>
        <Svg width={FLOOR_W} height={14} viewBox={`0 0 ${FLOOR_W} 14`}>
          <Path d={`M0,1.5 H${FLOOR_W}`} stroke={p.draw} strokeWidth={2.4} strokeLinecap="round" />
          <Path d="M14,2 l-8,10 M34,2 l-8,10 M54,2 l-8,10 M74,2 l-8,10 M94,2 l-8,10 M114,2 l-8,10 M134,2 l-8,10 M154,2 l-8,10" stroke={p.draw} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.abs, { left: 0, top: 0, width: W0, height: H0 }, markStyle]}>
        <Art xml={mark(courseBlue)} width={W0} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
});
