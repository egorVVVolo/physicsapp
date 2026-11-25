// /practice/<mode>: review (today's due questions), level-<id> (6 from that level), mistakes (up to 8 whose last answer
// was not right first time), mock (10 from finished lessons and an exam card at the end). The answers update the
// review queue, and the day counts for the momentum streak.
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { course } from '@/content/course';
import { bankOf, examCardsOf } from '@/practice/bank';
import { PracticePlayer, type PracticeItem, type PracticeResult } from '@/practice/PracticePlayer';
import { PracticeSummary } from '@/practice/PracticeSummary';
import { mistakes, nextDue, pickReview, schedule, whenText, type Queue } from '@/practice/review';
import type { Outcome } from '@/session/logic';
import { readyRefs } from '@/session/progress';
import { loadFinishedLessons, loadReview, recordFinishedDay, saveReview } from '@/session/storage';
import { dayKey } from '@/session/streak';
import { useTheme } from '@/theme/ThemeContext';
import { font } from '@/theme/tokens';
import { MainButton } from '@/ui/parts';

const shuffle = <T,>(xs: T[]): T[] => xs.map((x) => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map(([, x]) => x);

function titleOf(mode: string): string {
  if (mode === 'review') return "Today's review";
  if (mode === 'mistakes') return 'Your mistakes';
  if (mode === 'mock') return 'Mock set';
  const level = course.levels.find((l) => `level-${l.id}` === mode);
  return level ? `Practise ${level.title}` : 'Practice';
}

export default function PracticeRoute() {
  const { mode = 'review' } = useLocalSearchParams<{ mode: string }>();
  const { palette: p } = useTheme();
  const today = dayKey(new Date());
  const [items, setItems] = useState<PracticeItem[] | null>(null);
  const [summary, setSummary] = useState<{ outcomes: Outcome[]; marks: [number, number] | null; next: string | null } | null>(null);

  useEffect(() => {
    (async () => {
      const [finished, queue] = await Promise.all([loadFinishedLessons(), loadReview()]);
      const done = readyRefs.filter((x) => finished.has(x.r.id)).map((x) => x.r.id);
      const bank = bankOf(done);
      if (mode === 'review') return setItems(pickReview(queue, bank, today, 5));
      if (mode === 'mistakes') return setItems(mistakes(queue, bank, 8));
      if (mode === 'mock') {
        const cards = shuffle(examCardsOf(done));
        return setItems([...shuffle(bank).slice(0, 10), ...cards.slice(0, 1)]);
      }
      const level = course.levels.find((l) => `level-${l.id}` === mode);
      const ids = new Set(level?.lessons.map((r) => r.id) ?? []);
      setItems(shuffle(bank.filter((it) => ids.has(it.lessonId))).slice(0, 6));
    })();
  }, [mode, today]);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/revise'));

  const finish = async (r: PracticeResult) => {
    const queue: Queue = await loadReview();
    for (const it of items ?? []) {
      const o = r.outcomes[it.key];
      if (o && it.screen.kind !== 'examCard') queue[it.key] = schedule(queue[it.key], it.key, o, today);
    }
    await Promise.all([saveReview(queue), recordFinishedDay()]);
    const marks = Object.values(r.marks);
    const outcomes = (items ?? []).flatMap((it) => (it.screen.kind === 'examCard' ? it.screen.parts.map((part) => r.outcomes[`${it.key}.${part.id}`] ?? 'revealed') : [r.outcomes[it.key] ?? 'revealed']));
    const nd = nextDue(queue, today);
    setSummary({ outcomes, marks: marks.length ? [marks.reduce((a, m) => a + m[0], 0), marks.reduce((a, m) => a + m[1], 0)] : null, next: nd ? whenText(nd, today) : null });
  };

  if (!items) return <View style={{ flex: 1, backgroundColor: p.page }} />;
  if (summary) return <PracticeSummary title={titleOf(mode)} {...summary} onDone={back} />;
  if (items.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: p.page }]}>
        <Text style={[styles.emptyTitle, { color: p.ink }]}>Nothing to practise here yet</Text>
        <Text style={[styles.emptyText, { color: p.muted }]}>Finish a lesson and its questions come here.</Text>
        <MainButton label="Back" onPress={back} />
      </View>
    );
  }
  return <PracticePlayer items={items} salt={today} onClose={back} onFinish={finish} />;
}

const styles = StyleSheet.create({
  empty: { flex: 1, padding: 24, justifyContent: 'center', gap: 14 },
  emptyTitle: { fontFamily: font.display, fontSize: 24, lineHeight: 30 },
  emptyText: { fontFamily: font.body, fontSize: 16, lineHeight: 23 },
});
