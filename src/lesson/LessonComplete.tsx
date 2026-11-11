// End of a lesson: the honest tally (on your own / with a hint / answer shown) and what you can do now.
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Lesson } from '@/content/types';
import { countOutcomes, type LessonState } from '@/session/logic';
import { Puck } from '@/figures/Puck';
import { useTheme } from '@/theme/ThemeContext';
import { font, levelColors } from '@/theme/tokens';
import { MainButton } from '@/ui/parts';
import { Frame } from './Frame';
import { Title } from './text';

export function LessonComplete({ lesson, state, onDone, onReplay }: { lesson: Lesson; state: LessonState; onDone: () => void; onReplay: () => void }) {
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  const n = countOutcomes(state);
  const check = lesson.skillCheck.filter((q) => state.outcomes[q.id] === 'independent').length;
  const rows: [string, number][] = [
    ['On your own', n.independent],
    ['After a hint', n.assisted],
    ['Answer shown', n.revealed],
  ];
  return (
    <View style={{ flex: 1, paddingTop: insets.top + 12, paddingBottom: insets.bottom, backgroundColor: p.page }}>
      <Frame footer={<MainButton label="Back to the map" onPress={onDone} />}>
        <View style={{ alignItems: 'center', gap: 12, marginTop: 12 }}>
          <Puck size={150} state="done" color={levelColors.forces} />
          <Title>Lesson complete</Title>
          <Text style={[styles.sub, { color: p.muted }]}>
            Skill check: {check} of {lesson.skillCheck.length} right first time
          </Text>
        </View>
        <View style={[styles.table, { borderColor: p.line }]}>
          {rows.map(([label, v], i) => (
            <View key={label} style={[styles.row, i > 0 && { borderTopWidth: 1, borderColor: p.line }]}>
              <Text style={[styles.rowLabel, { color: p.ink }]}>{label}</Text>
              <Text style={[styles.rowValue, { color: p.ink }]}>{v}</Text>
            </View>
          ))}
        </View>
        <View style={{ gap: 8 }}>
          <Text style={[styles.h, { color: p.ink }]}>You can now</Text>
          {lesson.youCanNow.map((s) => (
            <Text key={s} style={[styles.item, { color: p.ink }]}>
              {'•  '}
              {s}
            </Text>
          ))}
        </View>
        <Text accessibilityRole="button" onPress={onReplay} style={[styles.replay, { color: p.muted }]}>
          Play the lesson again
        </Text>
      </Frame>
    </View>
  );
}

const styles = StyleSheet.create({
  sub: { fontFamily: font.bodyMedium, fontSize: 17 },
  table: { borderWidth: 1, borderRadius: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14 },
  rowLabel: { fontFamily: font.bodyMedium, fontSize: 17 },
  rowValue: { fontFamily: font.display, fontSize: 20, fontVariant: ['tabular-nums'] },
  h: { fontFamily: font.display, fontSize: 19 },
  item: { fontFamily: font.body, fontSize: 17, lineHeight: 25 },
  replay: { fontFamily: font.bodyMedium, fontSize: 16, textAlign: 'center', textDecorationLine: 'underline', paddingVertical: 12 },
});
