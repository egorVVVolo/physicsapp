// A hidden page for the owner and for checks: one live example of every kind of lesson step (format v3, B1–B8),
// with the numbered list of kinds at the top.
// Open /gallery/steps in the web version. Nothing in the app links here. The content is in src/content/samples.ts.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { samples } from '@/content/samples';
import type { Screen } from '@/content/types';
import { BuildView } from '@/lesson/screens/BuildView';
import { ExamCardView } from '@/lesson/screens/ExamCardView';
import { EstimateView } from '@/lesson/screens/EstimateView';
import { GraphPickView } from '@/lesson/screens/GraphPickView';
import { OrderView } from '@/lesson/screens/OrderView';
import { SortView } from '@/lesson/screens/SortView';
import { SpotErrorView } from '@/lesson/screens/SpotErrorView';
import { WorkedView } from '@/lesson/screens/WorkedView';
import { useTheme } from '@/theme/ThemeContext';
import { font, radius, touch } from '@/theme/tokens';

export default function StepGallery() {
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  const [at, setAt] = useState(0);
  const [run, setRun] = useState(0); // Continue starts the sample again
  const [log, setLog] = useState<string[]>([]);
  const sample = samples[at];
  const restart = () => {
    setRun(run + 1);
    setLog([]);
  };
  return (
    <View style={[styles.root, { paddingTop: insets.top + 6, paddingBottom: insets.bottom, backgroundColor: p.page }]}>
      <View style={styles.tabs} accessibilityRole="tablist" accessibilityLabel="Kinds of step">
        {samples.map((s, i) => (
          <Pressable
            key={s.screen.id}
            accessibilityRole="button"
            accessibilityState={{ selected: i === at }}
            onPress={() => {
              setAt(i);
              restart();
            }}
            style={[styles.tab, { borderColor: i === at ? p.select : p.line, backgroundColor: i === at ? p.selectBg : p.page }]}
          >
            <Text style={[styles.tabText, { color: p.ink }]}>{`${i + 1} ${s.title.split(' · ')[0]}`}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.log, { color: p.muted, backgroundColor: p.page }]}>{`${at + 1}/${samples.length} · ${sample.title} · ${log.length ? log.join(' · ') : 'story phase · 2 tries'}`}</Text>
      <View style={styles.screen} key={`${at}-${run}`}>
        <Live screen={sample.screen} onLog={(line) => setLog((l) => [...l, line])} onNext={restart} />
      </View>
    </View>
  );
}

function Live({ screen, onLog, onNext }: { screen: Screen; onLog: (line: string) => void; onNext: () => void }) {
  const graded = { figN: 1, phase: 'story' as const, onOutcome: (o: string) => onLog(`outcome: ${o}`), onWrong: (id: string) => onLog(`wrong: ${id}`), onNext };
  if (screen.kind === 'build') return <BuildView screen={screen} {...graded} />;
  if (screen.kind === 'order') return <OrderView screen={screen} {...graded} />;
  if (screen.kind === 'spotError') return <SpotErrorView screen={screen} {...graded} />;
  if (screen.kind === 'sort') return <SortView screen={screen} {...graded} />;
  if (screen.kind === 'estimate') return <EstimateView screen={screen} {...graded} />;
  if (screen.kind === 'graphPick') return <GraphPickView screen={screen} {...graded} />;
  if (screen.kind === 'examCard')
    return <ExamCardView screen={screen} figN={1} onPart={(id, o, m) => onLog(`${id}: ${o} ${m[0]}/${m[1]}`)} onWrong={(id, w) => onLog(`wrong ${id}: ${w}`)} onNext={onNext} />;
  if (screen.kind === 'worked') return <WorkedView screen={screen} figN={1} onNext={onNext} />;
  return null;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 16, paddingVertical: 4 },
  tab: { minHeight: touch, borderWidth: 2, borderRadius: radius.pill, paddingHorizontal: 11, justifyContent: 'center' },
  tabText: { fontFamily: font.bodyMedium, fontSize: 14 },
  log: { fontFamily: font.mono, fontSize: 11, paddingHorizontal: 16, paddingVertical: 6, zIndex: 1 },
  screen: { flex: 1, overflow: 'hidden' },
});
