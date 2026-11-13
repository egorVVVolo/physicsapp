// Plays one lesson: the top bar (close, progress, Skill check dots) and the current screen.
// Each new screen slides in; the progress fill glides, a Skill check dot pops when answered.
import { useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Lesson, Screen } from '@/content/types';
import { itemsOf, next, progressOf, recordOutcome, recordPick, type LessonState } from '@/session/logic';
import { useTheme } from '@/theme/ThemeContext';
import { colorOfLesson } from '@/theme/levelColor';
import { CloseIcon } from '@/ui/parts';
import { ScreenEnter, useReducedMotionPref } from '@/ui/motion';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { CONTENT_MAX } from './Frame';
import { LEAVE_SHEET_OUT, LeaveSheet } from './LeaveSheet';
import { ExploreView } from './screens/ExploreView';
import { QuestionView } from './screens/QuestionView';
import { CheckIntroView, IntroView, PredictView, TextView } from './screens/Simple';

type Props = { lesson: Lesson; state: LessonState; onChange: (s: LessonState) => void; onClose: () => void };

/** FIG numbers run through the lesson in order of appearance. */
function figNumbers(lesson: Lesson): Record<string, number> {
  const out: Record<string, number> = {};
  let n = 0;
  for (const s of [...lesson.story, ...lesson.skillCheck] as Screen[]) if ('fig' in s && s.fig) out[s.id] = ++n;
  return out;
}

export function LessonPlayer({ lesson, state, onChange, onClose }: Props) {
  const { palette: p } = useTheme();
  const c = colorOfLesson(lesson.id);
  const insets = useSafeAreaInsets();
  const items = itemsOf(lesson);
  const item = items[state.index];
  const figs = figNumbers(lesson);
  const prog = progressOf(state, lesson);
  const go = () => onChange(next(state, lesson));

  // × asks "Leave the lesson?" — except on the very first screen, where there is nothing to lose.
  const [leave, setLeave] = useState<'closed' | 'open' | 'closing'>('closed');
  const stayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (stayTimer.current) clearTimeout(stayTimer.current);
  }, []);
  const askToLeave = () => (state.index === 0 ? onClose() : setLeave('open'));
  const stay = () => {
    if (leave !== 'open') return;
    setLeave('closing');
    stayTimer.current = setTimeout(() => setLeave('closed'), LEAVE_SHEET_OUT);
  };

  // Android back button: the same question; with the sheet open it means "stay".
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (leave === 'open') stay();
      else if (leave === 'closed' && state.index > 0) setLeave('open');
      else return leave === 'closing';
      return true;
    });
    return () => sub.remove();
  });

  let body = null;
  if (item && item.kind !== 'checkIntro') {
    const s = item.screen;
    const n = figs[s.id] ?? 0;
    if (s.kind === 'intro') body = <IntroView screen={s} figN={n} onNext={go} />;
    if (s.kind === 'text') body = <TextView screen={s} figN={n} onNext={go} />;
    if (s.kind === 'predict') body = <PredictView screen={s} figN={n} picked={state.picks[s.id]} onPick={(id) => onChange(recordPick(state, s.id, id))} onNext={go} />;
    if (s.kind === 'explore') body = <ExploreView screen={s} figN={n} onNext={go} />;
    if (s.kind === 'choice' || s.kind === 'tapFig') {
      const earlier = s.kind === 'choice' && s.revisitOf ? lesson.story.find((x) => x.id === s.revisitOf) : undefined;
      const earlierPick = earlier?.kind === 'predict' ? earlier.options.find((o) => o.id === state.picks[earlier.id]) : undefined;
      body = <QuestionView screen={s} figN={n} phase={item.phase} earlierPick={earlierPick} onOutcome={(o) => onChange(recordOutcome(state, s.id, o))} onNext={go} />;
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6, paddingBottom: insets.bottom, backgroundColor: p.page }]}>
      <View style={styles.bar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close the lesson" onPress={askToLeave} hitSlop={8} style={styles.close}>
          <CloseIcon color={p.muted} size={20} />
        </Pressable>
        <View style={[styles.track, { backgroundColor: p.disabled }]} accessible accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(prog.story * 100) }}>
          <ProgressFill share={Math.max(0.03, prog.story)} color={c.main} />
        </View>
        <View style={styles.dots} accessible accessibilityLabel={`Skill check: ${prog.checkDone} of ${prog.checkTotal} answered`}>
          {Array.from({ length: prog.checkTotal }, (_, i) => (
            <CheckDot key={i} done={i < prog.checkDone} color={c.main} />
          ))}
        </View>
      </View>
      {/* key: every screen starts with fresh local state */}
      <View style={{ flex: 1 }} key={state.index}>
        <ScreenEnter>{body}</ScreenEnter>
      </View>
      {/* the Skill check splash floods the whole player, the top bar included */}
      {item?.kind === 'checkIntro' && (
        <View style={StyleSheet.absoluteFill} key={`check-${state.index}`}>
          <CheckIntroView count={lesson.skillCheck.length} color={c} onNext={go} onClose={askToLeave} />
        </View>
      )}
      {leave !== 'closed' && <LeaveSheet closing={leave === 'closing'} onStay={stay} onLeave={onClose} />}
    </View>
  );
}

/** The progress fill glides to its new length. */
function ProgressFill({ share, color }: { share: number; color: string }) {
  const reduced = useReducedMotionPref();
  const w = useSharedValue(share);
  useEffect(() => {
    w.set(reduced ? share : withTiming(share, { duration: 520, easing: Easing.out(Easing.cubic) }));
  }, [share, reduced, w]);
  const style = useAnimatedStyle(() => ({ width: `${w.get() * 100}%` }));
  return <Animated.View style={[styles.fill, { backgroundColor: color }, style]} />;
}

/** A Skill check dot: fills in with a small pop when its question is answered. */
function CheckDot({ done, color }: { done: boolean; color: string }) {
  const { palette: p } = useTheme();
  const reduced = useReducedMotionPref();
  const s = useSharedValue(1);
  useEffect(() => {
    if (done && !reduced) s.set(withSequence(withTiming(1.5, { duration: 140 }), withSpring(1, { damping: 7, stiffness: 200 })));
  }, [done, reduced, s]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.get() }] }));
  return <Animated.View style={[styles.dot, { backgroundColor: done ? color : p.disabled }, style]} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, width: '100%', maxWidth: CONTENT_MAX + 40, alignSelf: 'center' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 12, borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
  dots: { flexDirection: 'row', gap: 6, paddingRight: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
});
