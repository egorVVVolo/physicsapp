// A hidden page for the owner and for checks: one live example of every kind of lesson step.
// Open /gallery/steps in the web version. Nothing in the app links here. The content is in src/content/samples.ts.
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { samples } from '@/content/samples';
import type { Screen } from '@/content/types';
import { BuildView } from '@/lesson/screens/BuildView';
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
      <ScrollView horizontal style={styles.tabsWrap} contentContainerStyle={styles.tabs} showsHorizontalScrollIndicator={false}>
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
            <Text style={[styles.tabText, { color: p.ink }]}>{s.title}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={[styles.log, { color: p.muted }]}>{log.length ? log.join(' · ') : 'story phase · 2 tries'}</Text>
      <View style={styles.screen} key={`${at}-${run}`}>
        <Live screen={sample.screen} onLog={(line) => setLog((l) => [...l, line])} onNext={restart} />
      </View>
    </View>
  );
}

function Live({ screen, onLog, onNext }: { screen: Screen; onLog: (line: string) => void; onNext: () => void }) {
  if (screen.kind === 'build') return <BuildView screen={screen} figN={1} phase="story" onOutcome={(o) => onLog(`outcome: ${o}`)} onWrong={(id) => onLog(`wrong: ${id}`)} onNext={onNext} />;
  return null;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabsWrap: { flexGrow: 0 },
  tabs: { gap: 8, paddingHorizontal: 16, paddingVertical: 4 },
  tab: { minHeight: touch, borderWidth: 2, borderRadius: radius.pill, paddingHorizontal: 14, justifyContent: 'center' },
  tabText: { fontFamily: font.bodyMedium, fontSize: 14 },
  log: { fontFamily: font.mono, fontSize: 11, paddingHorizontal: 16, paddingTop: 6 },
  screen: { flex: 1, overflow: 'hidden' },
});
