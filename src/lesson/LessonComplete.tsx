// End of a lesson. One orchestrated moment: the lesson's puck drops in and a ring of force arrows bursts out of it.
// Then, quietly: the puzzle solved as a figure (the reading counts up), the honest tally, what you can do now.
// Every number is real: the tally counts outcomes, the figure comes from src/physics.
import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';
import Svg, { Path, Polygon } from 'react-native-svg';
import type { Lesson } from '@/content/types';
import { countOutcomes, type LessonState } from '@/session/logic';
import { Puck } from '@/figures/Puck';
import { Sheet } from '@/figures/Sheet';
import { useTween } from '@/figures/anim';
import { useTheme } from '@/theme/ThemeContext';
import { courseBlue, font, levelColors } from '@/theme/tokens';
import { MainButton, useReducedMotionPref } from '@/ui/parts';
import { Frame } from './Frame';

const PUCK = 132;
const BURST = 12; // arrows in the burst

export function LessonComplete({ lesson, state, onDone, onReplay }: { lesson: Lesson; state: LessonState; onDone: () => void; onReplay: () => void }) {
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotionPref();
  const n = countOutcomes(state);
  const firstTime = lesson.skillCheck.filter((q) => state.outcomes[q.id] === 'independent').length;
  const counting = useAfter(reduced ? 0 : 1100);
  const figCount = [...lesson.story, ...lesson.skillCheck].filter((x) => 'fig' in x && x.fig).length; // the recap is the next FIG

  return (
    <View style={{ flex: 1, paddingTop: insets.top + 8, paddingBottom: insets.bottom, backgroundColor: p.page }}>
      <Frame footer={<MainButton label="Back to the map" onPress={onDone} tone="level" color={courseBlue} />}>
        {/* the moment: puck + burst */}
        <View style={styles.hero}>
          <Burst reduced={reduced} />
          <Drop reduced={reduced}>
            <Puck size={PUCK} state="done" color={levelColors.forces} />
          </Drop>
        </View>
        <Rise delay={350} reduced={reduced}>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text accessibilityRole="header" style={[styles.title, { color: p.ink }]}>
              Lesson complete
            </Text>
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

        {/* the honest tally */}
        <Rise delay={850} reduced={reduced}>
          <View style={{ gap: 14 }}>
            <View style={styles.checkRow}>
              <View style={styles.dots}>
                {lesson.skillCheck.map((q, i) => (
                  <CheckDot key={q.id} ok={state.outcomes[q.id] === 'independent'} delay={1100 + i * 140} reduced={reduced} />
                ))}
              </View>
              <Text style={[styles.checkText, { color: p.ink }]}>
                Skill check: {firstTime} of {lesson.skillCheck.length} right first time
              </Text>
            </View>
            <View style={[styles.tally, { borderColor: p.line }]}>
              <Count label="On your own" value={counting ? n.independent : 0} />
              <View style={[styles.divider, { backgroundColor: p.line }]} />
              <Count label="After a hint" value={counting ? n.assisted : 0} />
              <View style={[styles.divider, { backgroundColor: p.line }]} />
              <Count label="Answer shown" value={counting ? n.revealed : 0} />
            </View>
          </View>
        </Rise>

        <Rise delay={1050} reduced={reduced}>
          <View style={{ gap: 10 }}>
            <Text style={[styles.h, { color: p.ink }]}>You can now</Text>
            {lesson.youCanNow.map((s) => (
              <View key={s} style={styles.item}>
                <Svg width={20} height={20} viewBox="0 0 20 20" style={{ marginTop: 3 }}>
                  <Path d="M4,10.5 L8.2,14.5 L16,6" fill="none" stroke={courseBlue.main} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={[styles.itemText, { color: p.ink }]}>{s}</Text>
              </View>
            ))}
          </View>
        </Rise>
        <Text accessibilityRole="button" onPress={onReplay} style={[styles.replay, { color: p.muted }]}>
          Play the lesson again
        </Text>
      </Frame>
    </View>
  );
}

/** True once `ms` have passed since the screen appeared. */
function useAfter(ms: number): boolean {
  const [on, setOn] = useState(ms === 0);
  useEffect(() => {
    if (ms === 0) return;
    const id = setTimeout(() => setOn(true), ms);
    return () => clearTimeout(id);
  }, [ms]);
  return on;
}

/** The puck drops in and settles with a small bounce. */
function Drop({ children, reduced }: { children: ReactNode; reduced: boolean }) {
  const k = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) k.set(withSpring(1, { damping: 9, stiffness: 140, mass: 0.8 }));
  }, [k, reduced]);
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, k.get() * 2),
    transform: [{ translateY: (1 - k.get()) * -40 }, { scale: 0.7 + 0.3 * k.get() }],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
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

/** One Skill check question: a filled blue disc with a check when right first time, an empty ring otherwise. */
function CheckDot({ ok, delay, reduced }: { ok: boolean; delay: number; reduced: boolean }) {
  const { palette: p } = useTheme();
  const k = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) k.set(withDelay(delay, withSpring(1, { damping: 10, stiffness: 180 })));
  }, [k, delay, reduced]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: 0.4 + 0.6 * k.get() }], opacity: Math.min(1, k.get() * 1.5) }));
  return (
    <Animated.View
      accessible
      accessibilityLabel={ok ? 'right first time' : 'missed'}
      style={[styles.dot, ok ? { backgroundColor: courseBlue.main } : { borderWidth: 2.5, borderColor: p.lineStrong }, style]}
    >
      {ok && (
        <Svg width={14} height={14} viewBox="0 0 14 14">
          <Path d="M3,7.5 L6,10.2 L11,4.2" fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      )}
    </Animated.View>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  const { palette: p } = useTheme();
  const shown = useTween(value, 0, 700);
  return (
    <View style={styles.count} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={[styles.countValue, { color: p.ink }]}>{Math.round(shown)}</Text>
      <Text style={[styles.countLabel, { color: p.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 190, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  arrow: { position: 'absolute', left: '50%', top: '50%', marginLeft: -6, marginTop: -15 },
  title: { fontFamily: font.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.4, textAlign: 'center' },
  lessonName: { fontFamily: font.bodyMedium, fontSize: 17, textAlign: 'center' },
  recap: { fontFamily: font.body, fontSize: 17, lineHeight: 25 },
  checkRow: { gap: 10 },
  dots: { flexDirection: 'row', gap: 10 },
  dot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  checkText: { fontFamily: font.bodyMedium, fontSize: 17 },
  tally: { flexDirection: 'row', borderWidth: 1, borderRadius: 14, paddingVertical: 14 },
  divider: { width: 1, marginVertical: 4 },
  count: { flex: 1, alignItems: 'center', gap: 2 },
  countValue: { fontFamily: font.display, fontSize: 30, lineHeight: 36, fontVariant: ['tabular-nums'] },
  countLabel: { fontFamily: font.bodyMedium, fontSize: 13, textAlign: 'center' },
  h: { fontFamily: font.display, fontSize: 19 },
  item: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  itemText: { flex: 1, fontFamily: font.body, fontSize: 17, lineHeight: 25 },
  replay: { fontFamily: font.bodyMedium, fontSize: 16, textAlign: 'center', textDecorationLine: 'underline', paddingVertical: 12 },
});
