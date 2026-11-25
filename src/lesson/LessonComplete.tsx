// End of a lesson. One orchestrated moment: the lesson's puck drops in and a ring of force arrows bursts out of it.
// The stamp hits next to it (gold: every Skill check answer right first try; otherwise the level's colour).
// Then, quietly: the puzzle solved as a figure, the lesson's card going into the notebook (the first time only),
// the momentum top (it wobbles up if this is the day's first lesson), and one button: Continue, to the breakdown.
// The honest numbers (the tally, what tripped you up) live on the breakdown, Breakdown.tsx.
import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';
import Svg, { Path, Polygon } from 'react-native-svg';
import { stamp } from '@/art/brand';
import { object } from '@/art/objects';
import type { Lesson } from '@/content/types';
import { stampKind } from '@/session/breakdown';
import { figNumbers, type LessonState } from '@/session/logic';
import { LessonTile } from '@/figures/LessonIcon';
import { Puck } from '@/figures/Puck';
import { Sheet } from '@/figures/Sheet';
import { useTheme } from '@/theme/ThemeContext';
import { levelIdOf } from '@/content/course';
import { colorOfLesson } from '@/theme/levelColor';
import { courseBlue, font, motion, reward, soonGrey } from '@/theme/tokens';
import { Art } from '@/ui/Art';
import { feedback } from '@/ui/feedback';
import { MainButton, useReducedMotionPref } from '@/ui/parts';
import { Frame } from './Frame';

const PUCK = 132;
const LAND_MS = 170; // the Drop spring first reaches the floor after ~0.17 s (damping 9, stiffness 140, mass 0.8)
const BURST = 12; // arrows in the burst
const STAMP = 84;
const STAMP_AT = LAND_MS + 420; // the stamp starts falling a beat after the puck lands
const STAMP_MS = 200;
const CARD_AT = 1300; // ms: the notebook card tips up after the puzzle has risen
const MOMENTUM_AT = 1900; // ms: the momentum row, a beat after the card

/** What finishing this lesson changed: a new notebook card or not, and the day streak before and after. */
export type FinishInfo = { firstTime: boolean; runBefore: number; runAfter: number; newDay: boolean };

type Props = { lesson: Lesson; state: LessonState; finish: FinishInfo | null; onContinue: () => void };

export function LessonComplete({ lesson, state, finish, onContinue }: Props) {
  const { palette: p } = useTheme();
  const c = colorOfLesson(lesson.id);
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotionPref();
  const figCount = figNumbers(lesson).count; // the recap is the next FIG
  // gold: every Skill check answer on the first try · the level's colour: with some help · grey: most answers were shown
  const kind = stampKind(lesson, state);
  const stampLabel = kind === 'independent' ? 'On your own' : kind === 'assisted' ? 'With some help' : 'Answers shown';
  // the whole screen jolts down a little when the stamp hits
  const jolt = useSharedValue(0);
  const joltStyle = useAnimatedStyle(() => ({ transform: [{ translateY: jolt.get() }] }));

  return (
    <Animated.View style={[{ flex: 1, paddingTop: insets.top + 8, paddingBottom: insets.bottom, backgroundColor: p.page }, joltStyle]}>
      <Frame footer={<MainButton label="Continue" onPress={onContinue} tone="level" color={c} />}>
        {/* the moment: puck + burst */}
        <View style={styles.hero}>
          <Burst reduced={reduced} />
          <Drop reduced={reduced}>
            <Puck size={PUCK} state="done" color={c} />
          </Drop>
          <Stamp xml={stamp(kind, c, reward, soonGrey)} label={stampLabel} reduced={reduced} jolt={jolt} />
        </View>
        <Rise delay={350} reduced={reduced}>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text accessibilityRole="header" style={[styles.title, { color: p.ink }]}>
              Lesson complete
            </Text>
            <Text style={[styles.stampLabel, { color: p.ink }]}>{stampLabel}</Text>
            <Text style={[styles.lessonName, { color: p.muted }]}>{lesson.title}</Text>
          </View>
        </Rise>

        {/* the puzzle, solved */}
        <Rise delay={600} reduced={reduced}>
          <View style={{ gap: 12 }}>
            <Sheet fig={lesson.recap.fig} n={figCount + 1} caption="the puzzle, solved" />
            <Text style={[styles.recap, { color: p.ink }]}>{lesson.recap.text}</Text>
          </View>
        </Rise>

        {finish?.firstTime && <NotebookCard lesson={lesson} reduced={reduced} />}
        {finish && (
          <Rise delay={MOMENTUM_AT} reduced={reduced}>
            <MomentumRow finish={finish} reduced={reduced} />
          </Rise>
        )}

      </Frame>
    </Animated.View>
  );
}

/** "New in your notebook": the lesson's card tips up towards you (rotateX −70° → 0) with the unlock sound. */
function NotebookCard({ lesson, reduced }: { lesson: Lesson; reduced: boolean }) {
  const { palette: p } = useTheme();
  const k = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    k.set(withDelay(CARD_AT, withTiming(1, { duration: 460, easing: Easing.out(Easing.cubic) })));
    const id = setTimeout(feedback.unlock, CARD_AT);
    return () => clearTimeout(id);
  }, [k, reduced]);
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, k.get() * 1.6),
    transform: [{ perspective: 700 }, { rotateX: `${-70 * (1 - k.get())}deg` }, { translateY: 20 * (1 - k.get()) }],
  }));
  return (
    <Animated.View
      accessible
      accessibilityLabel={`New in your notebook: ${lesson.card.formula}`}
      style={[styles.nbCard, { backgroundColor: p.page, borderColor: p.line }, style]}
    >
      <LessonTile lessonId={lesson.id} levelId={levelIdOf(lesson.id)} color={colorOfLesson(lesson.id)} size={64} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.nbLabel, { color: p.muted }]}>NEW IN YOUR NOTEBOOK</Text>
        <Text style={[styles.nbFormula, { color: p.ink }]}>{lesson.card.formula}</Text>
      </View>
    </Animated.View>
  );
}

const daysOf = (n: number) => `${n} ${n === 1 ? 'day' : 'days'} of momentum`;

/**
 * The momentum top and the run of days. If this was the day's first finished lesson the top wobbles as it
 * spins up (−9° → 7° → −4° → 2° → 0 in 900 ms) and the number steps from the old run to the new one.
 */
function MomentumRow({ finish, reduced }: { finish: FinishInfo; reduced: boolean }) {
  const { palette: p } = useTheme();
  const grows = finish.newDay && !reduced;
  const [shown, setShown] = useState(grows ? finish.runBefore : finish.runAfter);
  const tilt = useSharedValue(0);
  const bump = useSharedValue(1);
  useEffect(() => {
    if (!grows) return;
    const spinAt = MOMENTUM_AT + 300;
    const step = (to: number, ms: number) => withTiming(to, { duration: ms, easing: Easing.out(Easing.cubic) });
    tilt.set(withDelay(spinAt, withSequence(step(-9, 180), step(7, 200), step(-4, 180), step(2, 170), step(0, 170))));
    const spin = setTimeout(feedback.spin, spinAt);
    const count = setTimeout(() => {
      setShown(finish.runAfter);
      bump.set(withSequence(withTiming(1.06, { duration: 105 }), withTiming(1, { duration: 195 })));
    }, spinAt + 460);
    return () => {
      clearTimeout(spin);
      clearTimeout(count);
    };
  }, [grows, finish.runAfter, tilt, bump]);
  const topStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${tilt.get()}deg` }] }));
  const textStyle = useAnimatedStyle(() => ({ transform: [{ scale: bump.get() }] }));
  return (
    <View style={styles.momentum} accessible accessibilityLabel={daysOf(finish.runAfter)}>
      <Animated.View style={topStyle}>
        <Art xml={object('top', courseBlue, reward)} width={54} />
      </Animated.View>
      <View style={{ flex: 1 }}>
        <Animated.Text style={[styles.momentumTitle, { color: p.ink }, textStyle]}>{daysOf(shown)}</Animated.Text>
        <Text style={[styles.momentumText, { color: p.muted }]}>It stays up while it spins.</Text>
      </View>
    </View>
  );
}

/** The puck drops in and settles with a small bounce. */
function Drop({ children, reduced }: { children: ReactNode; reduced: boolean }) {
  const k = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) k.set(withSpring(1, { damping: 9, stiffness: 140, mass: 0.8 }));
    // the sound and the buzz come when the puck lands; with reduced motion it is already there
    const id = setTimeout(feedback.complete, reduced ? 0 : LAND_MS);
    return () => clearTimeout(id);
  }, [k, reduced]);
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, k.get() * 2),
    transform: [{ translateY: (1 - k.get()) * -40 }, { scale: 0.7 + 0.3 * k.get() }],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

/**
 * The stamp: it falls from big and tilted, speeding up (ease-in) so the hit feels heavy. On the hit: the stamp sound,
 * the screen jolts 4 pt down and back, a yellow ring spreads out. Reduced motion: it is already there, only the sound.
 */
function Stamp({ xml, label, reduced, jolt }: { xml: string; label: string; reduced: boolean; jolt: SharedValue<number> }) {
  const k = useSharedValue(reduced ? 1 : 0);
  const ring = useSharedValue(0);
  useEffect(() => {
    if (reduced) {
      const id = setTimeout(feedback.stamp, 420); // after the "complete" sound, not on top of it
      return () => clearTimeout(id);
    }
    const hit = STAMP_AT + STAMP_MS;
    k.set(withDelay(STAMP_AT, withTiming(1, { duration: STAMP_MS, easing: Easing.in(Easing.cubic) })));
    const half = motion.fast / 2;
    jolt.set(withDelay(hit, withSequence(withTiming(4, { duration: half }), withTiming(0, { duration: half }))));
    ring.set(withDelay(hit, withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) })));
    const id = setTimeout(feedback.stamp, hit);
    return () => clearTimeout(id);
  }, [k, ring, jolt, reduced]);
  const stampStyle = useAnimatedStyle(() => ({
    opacity: k.get(),
    transform: [{ scale: 2.3 - 1.3 * k.get() }, { rotate: `${-22 + 13 * k.get()}deg` }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.get() === 0 ? 0 : 0.9 * (1 - ring.get()),
    transform: [{ scale: 0.7 + 0.8 * ring.get() }],
  }));
  return (
    <>
      {!reduced && <Animated.View pointerEvents="none" style={[styles.ring, { borderColor: reward.face }, ringStyle]} />}
      <Animated.View accessible accessibilityRole="image" accessibilityLabel={label} style={[styles.stamp, stampStyle]}>
        <Art xml={xml} width={STAMP} />
      </Animated.View>
    </>
  );
}

/** A section fades in after `delay` ms (one sequence for the whole screen, nothing moves after that). */
function Rise({ children, delay, reduced }: { children: ReactNode; delay: number; reduced: boolean }) {
  const k = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) k.set(withDelay(delay, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) })));
  }, [k, delay, reduced]);
  const style = useAnimatedStyle(() => ({ opacity: k.get(), transform: [{ translateY: (1 - k.get()) * 10 }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

/** A ring of small force arrows shooting out of the puck once, in the course blue and ink. */
function Burst({ reduced }: { reduced: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (!reduced) t.set(withDelay(180, withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) })));
  }, [t, reduced]);
  if (reduced) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: BURST }, (_, i) => (
        <BurstArrow key={i} i={i} t={t} />
      ))}
    </View>
  );
}

function BurstArrow({ i, t }: { i: number; t: SharedValue<number> }) {
  const { palette: p } = useTheme();
  const angle = (i / BURST) * 2 * Math.PI + (i % 2 ? 0.12 : -0.08);
  const far = i % 3 === 0 ? 128 : i % 3 === 1 ? 104 : 116; // not a perfect ring: it reads as a burst
  const len = i % 2 ? 22 : 16;
  const color = i % 3 === 2 ? p.draw : courseBlue.main;
  const style = useAnimatedStyle(() => {
    const k = t.get();
    const r = 46 + (far - 46) * k;
    const fade = k < 0.15 ? k / 0.15 : k > 0.6 ? Math.max(0, 1 - (k - 0.6) / 0.4) : 1;
    return {
      opacity: fade,
      transform: [{ translateX: Math.cos(angle) * r }, { translateY: Math.sin(angle) * r * 0.82 }, { rotate: `${angle + Math.PI / 2}rad` }],
    };
  });
  return (
    <Animated.View style={[styles.arrow, style]}>
      <Svg width={12} height={len + 8} viewBox={`0 0 12 ${len + 8}`}>
        <Path d={`M6,${len + 8} L6,8`} stroke={color} strokeWidth={2.6} strokeLinecap="round" />
        <Polygon points="6,0 11,9 1,9" fill={color} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 190, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  // right of and below the puck's centre (95), inside the hero so it never covers the title
  stamp: { position: 'absolute', left: '50%', marginLeft: 24, top: 93, width: STAMP, height: STAMP },
  ring: { position: 'absolute', left: '50%', marginLeft: 24 + STAMP / 2 - 50, top: 93 + STAMP / 2 - 50, width: 100, height: 100, borderRadius: 50, borderWidth: 3 },
  stampLabel: { fontFamily: font.display, fontSize: 19, textAlign: 'center' },
  arrow: { position: 'absolute', left: '50%', top: '50%', marginLeft: -6, marginTop: -15 },
  title: { fontFamily: font.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.4, textAlign: 'center' },
  lessonName: { fontFamily: font.bodyMedium, fontSize: 17, textAlign: 'center' },
  recap: { fontFamily: font.body, fontSize: 17, lineHeight: 25 },
  nbCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderBottomWidth: 4, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14 },
  nbLabel: { fontFamily: font.mono, fontSize: 11, letterSpacing: 0.5 },
  nbFormula: { fontFamily: font.display, fontSize: 22, lineHeight: 28, marginTop: 6 },
  momentum: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  momentumTitle: { fontFamily: font.display, fontSize: 17, lineHeight: 22, alignSelf: 'flex-start' },
  momentumText: { fontFamily: font.body, fontSize: 14, lineHeight: 19, marginTop: 2 },
});
