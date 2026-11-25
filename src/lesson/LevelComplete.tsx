// "Level complete": shown once, after the breakdown of the lesson that finishes a level. The level's object drops from
// the top by a model (constant g, e = 0.42: it bounces twice, each bounce shorter and quicker), then the level stamp
// lands on its corner. "4 lessons · 3 on your own" counts the gold stamps. A tap goes to the next level's first lesson.
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { object, levelObject } from '@/art/objects';
import { stamp } from '@/art/brand';
import type { LevelFinish } from '@/session/levels';
import { useTheme } from '@/theme/ThemeContext';
import { levelColors, font, reward, soonGrey, courseBlue } from '@/theme/tokens';
import { Art } from '@/ui/Art';
import { feedback } from '@/ui/feedback';
import { MainButton, useReducedMotionPref } from '@/ui/parts';
import { CONTENT_MAX } from './Frame';

const OBJECT = 180; // pt, the object's width
const STAMP = 84;
const FALL = 300; // pt the object falls
const G = 2600; // pt s⁻²: the same g as the launch animation
const E = 0.42; // each bounce keeps this share of the speed
const T = Math.sqrt((2 * FALL) / G); // s, the first fall
const STAMP_AT = (T + 2 * E * T + 2 * E * E * T) * 1000 + 160; // ms: a beat after the object has settled

type Props = { finish: LevelFinish; onNext?: () => void; onDone: () => void };

export function LevelComplete({ finish, onNext, onDone }: Props) {
  const { palette: p, level } = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotionPref();
  const c = levelColors[finish.levelId] ?? courseBlue;
  const lvl = level(c);
  const nextColor = finish.next ? (levelColors[finish.next.levelId] ?? courseBlue) : c;

  const y = useSharedValue(reduced ? 0 : -FALL);
  const k = useSharedValue(reduced ? 1 : 0); // the stamp: 0 falling in … 1 landed
  useEffect(() => {
    const ms = (s: number) => s * 1000;
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (reduced) {
      timers.push(setTimeout(feedback.levelUp, 0));
    } else {
      // the model: a fall of height FALL, then bounces of height E²·FALL and E⁴·FALL (ease in = falling, ease out = rising)
      const fall = withTiming(0, { duration: ms(T), easing: Easing.in(Easing.quad) });
      const up = (h: number, t: number) => withTiming(-h, { duration: ms(t), easing: Easing.out(Easing.quad) });
      const down = (t: number) => withTiming(0, { duration: ms(t), easing: Easing.in(Easing.quad) });
      y.set(withSequence(fall, up(E * E * FALL, E * T), down(E * T), up(E ** 4 * FALL, E * E * T), down(E * E * T)));
      timers.push(setTimeout(feedback.levelUp, ms(T)));
      timers.push(setTimeout(() => feedback.bounce(2), ms(T + 2 * E * T)));
      timers.push(setTimeout(() => feedback.bounce(3), ms(T + 2 * E * T + 2 * E * E * T)));
      k.set(withDelay(STAMP_AT, withTiming(1, { duration: 200, easing: Easing.in(Easing.cubic) })));
      timers.push(setTimeout(feedback.stamp, STAMP_AT + 200));
    }
    return () => timers.forEach(clearTimeout);
  }, [y, k, reduced]);

  const objectStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
  const stampStyle = useAnimatedStyle(() => ({ opacity: k.get(), transform: [{ scale: 2.3 - 1.3 * k.get() }, { rotate: `${-22 + 13 * k.get()}deg` }] }));

  const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const summary = `${count(finish.lessons, 'lesson', 'lessons')} · ${finish.gold} on your own`;

  return (
    <View style={[styles.root, { backgroundColor: lvl.soft, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.column}>
        <View style={styles.top}>
          <Text style={[styles.no, { color: lvl.text }]}>LEVEL {finish.number}</Text>
          <Text accessibilityRole="header" style={[styles.title, { color: p.ink }]}>
            {finish.title}
          </Text>
          <Text style={[styles.sub, { color: p.muted }]}>Level complete</Text>
        </View>
      </View>

      <View style={[styles.column, styles.middle]}>
        <View style={styles.hero} accessible accessibilityRole="image" accessibilityLabel={`Level complete: ${finish.title}`}>
          <Animated.View style={objectStyle}>
            <Art xml={object(levelObject[finish.levelId], c, reward)} width={OBJECT} />
          </Animated.View>
          <Animated.View pointerEvents="none" style={[styles.stamp, stampStyle]}>
            <Art xml={stamp('level', c, reward, soonGrey)} width={STAMP} />
          </Animated.View>
        </View>

        <Text style={[styles.summary, { color: p.ink }]} accessibilityLabel={`${count(finish.lessons, 'lesson', 'lessons')}, ${finish.gold} on your own`}>
          {summary}
        </Text>
      </View>
      <View style={styles.column}>
        <MainButton label={finish.next ? `Start ${finish.next.title}` : 'Back to the map'} onPress={finish.next ? onNext : onDone} tone="level" color={nextColor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, justifyContent: 'space-between' },
  column: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center', gap: 28 },
  top: { alignItems: 'center', gap: 4 },
  middle: { flex: 1, justifyContent: 'center' },
  no: { fontFamily: font.mono, fontSize: 13, letterSpacing: 1.5 },
  title: { fontFamily: font.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.4, textAlign: 'center' },
  sub: { fontFamily: font.bodyMedium, fontSize: 17 },
  hero: { height: OBJECT + 24, alignItems: 'center', justifyContent: 'center' },
  stamp: { position: 'absolute', left: '50%', marginLeft: OBJECT / 2 - STAMP / 2 - 6, top: OBJECT - STAMP / 2 - 6, width: STAMP, height: STAMP },
  summary: { fontFamily: font.displaySemi, fontSize: 20, textAlign: 'center' },
});
