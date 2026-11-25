// The shared practice player: review, a level's practice, your mistakes, the mock set. It plays a list of questions
// with the same screens as a lesson, one try each (phase 'check'), the options shuffled again each day. No chapters,
// no cover, no celebration: × to leave, "3 of 5" and a segment per question on top.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ExamCardScreen, Question } from '@/content/types';
import { CONTENT_MAX } from '@/lesson/Frame';
import { BuildView } from '@/lesson/screens/BuildView';
import { EstimateView } from '@/lesson/screens/EstimateView';
import { ExamCardView } from '@/lesson/screens/ExamCardView';
import { GraphPickView } from '@/lesson/screens/GraphPickView';
import { OrderView } from '@/lesson/screens/OrderView';
import { QuestionView } from '@/lesson/screens/QuestionView';
import { SortView } from '@/lesson/screens/SortView';
import { SpotErrorView } from '@/lesson/screens/SpotErrorView';
import type { Outcome } from '@/session/logic';
import { colorOfLesson } from '@/theme/levelColor';
import { useTheme } from '@/theme/ThemeContext';
import { font } from '@/theme/tokens';
import { ScreenEnter } from '@/ui/motion';
import { CloseIcon } from '@/ui/parts';

export type PracticeItem = { key: string; lessonId: string; screen: Question | ExamCardScreen };
/** What the learner did: an outcome per question (per part for an exam card, 'key.part'), marks per exam part. */
export type PracticeResult = { outcomes: Record<string, Outcome>; marks: Record<string, [number, number]> };

type Props = { items: PracticeItem[]; salt: string; onClose: () => void; onFinish: (r: PracticeResult) => void };

export function PracticePlayer({ items, salt, onClose, onFinish }: Props) {
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const [result] = useState<PracticeResult>({ outcomes: {}, marks: {} });
  const item = items[index];
  const c = colorOfLesson(item.lessonId);
  const next = () => (index + 1 >= items.length ? onFinish(result) : setIndex(index + 1));
  const record = (key: string, o: Outcome) => {
    if (result.outcomes[key] === undefined) result.outcomes[key] = o;
  };
  // the same screen as in the lesson, its options shuffled with the day as salt
  const s = { ...item.screen, id: `${item.screen.id}|${salt}` };
  const graded = { figN: index + 1, phase: 'check' as const, onOutcome: (o: Outcome) => record(item.key, o), onWrong: () => {}, onNext: next };
  let body = null;
  if (s.kind === 'choice' || s.kind === 'tapFig') body = <QuestionView screen={s} {...graded} />;
  if (s.kind === 'build') body = <BuildView screen={s} {...graded} />;
  if (s.kind === 'order') body = <OrderView screen={s} {...graded} />;
  if (s.kind === 'spotError') body = <SpotErrorView screen={s} {...graded} />;
  if (s.kind === 'sort') body = <SortView screen={s} {...graded} />;
  if (s.kind === 'graphPick') body = <GraphPickView screen={s} {...graded} />;
  if (s.kind === 'estimate') body = <EstimateView screen={s} {...graded} />;
  if (s.kind === 'examCard')
    body = (
      <ExamCardView
        screen={s}
        figN={index + 1}
        onPart={(part, o, marks) => {
          record(`${item.key}.${part}`, o);
          result.marks[`${item.key}.${part}`] = marks;
        }}
        onWrong={() => {}}
        onNext={next}
      />
    );

  return (
    <View style={[styles.root, { paddingTop: insets.top + 6, paddingBottom: insets.bottom, backgroundColor: p.page }]}>
      <View style={styles.bar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Leave the practice" onPress={onClose} hitSlop={8} style={styles.close}>
          <CloseIcon color={p.muted} size={20} />
        </Pressable>
        <View style={styles.segments} accessible accessibilityRole="progressbar" accessibilityLabel={`Question ${index + 1} of ${items.length}`}>
          {items.map((it, i) => (
            <View key={it.key} style={[styles.segment, { backgroundColor: i <= index ? c.main : p.disabled }]} />
          ))}
        </View>
        <Text style={[styles.count, { color: p.muted }]}>
          {index + 1} of {items.length}
        </Text>
      </View>
      <View style={{ flex: 1 }} key={index}>
        <ScreenEnter>{body}</ScreenEnter>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, width: '100%', maxWidth: CONTENT_MAX + 40, alignSelf: 'center' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  segments: { flex: 1, flexDirection: 'row', gap: 4 },
  segment: { flex: 1, height: 10, borderRadius: 5 },
  count: { fontFamily: font.mono, fontSize: 13, paddingRight: 6 },
});
