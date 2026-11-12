// Plays one lesson: the top bar (close, progress, Skill check dots) and the current screen.
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Lesson, Screen } from '@/content/types';
import { itemsOf, next, progressOf, recordOutcome, recordPick, type LessonState } from '@/session/logic';
import { useTheme } from '@/theme/ThemeContext';
import { courseBlue } from '@/theme/tokens';
import { CloseIcon } from '@/ui/parts';
import { CONTENT_MAX } from './Frame';
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
  const insets = useSafeAreaInsets();
  const items = itemsOf(lesson);
  const item = items[state.index];
  const figs = figNumbers(lesson);
  const prog = progressOf(state, lesson);
  const go = () => onChange(next(state, lesson));

  let body = null;
  if (item?.kind === 'checkIntro') body = <CheckIntroView count={lesson.skillCheck.length} onNext={go} />;
  else if (item) {
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
        <Pressable accessibilityRole="button" accessibilityLabel="Close the lesson" onPress={onClose} hitSlop={8} style={styles.close}>
          <CloseIcon color={p.muted} size={20} />
        </Pressable>
        <View style={[styles.track, { backgroundColor: p.disabled }]} accessible accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(prog.story * 100) }}>
          <View style={[styles.fill, { width: `${Math.max(3, prog.story * 100)}%`, backgroundColor: courseBlue.main }]} />
        </View>
        <View style={styles.dots} accessible accessibilityLabel={`Skill check: ${prog.checkDone} of ${prog.checkTotal} answered`}>
          {Array.from({ length: prog.checkTotal }, (_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i < prog.checkDone ? courseBlue.main : p.disabled }]} />
          ))}
        </View>
      </View>
      {/* key: every screen starts with fresh local state */}
      <View style={{ flex: 1 }} key={state.index}>
        {body}
      </View>
    </View>
  );
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
