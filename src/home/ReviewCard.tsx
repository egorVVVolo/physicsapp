// Today's review, the big card at the top of Revise: how many questions are due, a row of small pucks, one main button.
// Empty until the first lesson is finished; "all caught up" says when the next questions come back.
import { StyleSheet, Text, View } from 'react-native';
import { Puck } from '@/figures/Puck';
import { useTheme } from '@/theme/ThemeContext';
import { courseBlue, font } from '@/theme/tokens';
import { MainButton } from '@/ui/parts';

type Props = { due: number; minutes: number; next?: string | null; empty: boolean; onStart: () => void };

export function ReviewCard({ due, minutes, next, empty, onStart }: Props) {
  const { palette: p, level } = useTheme();
  const c = level(courseBlue);
  const open = !empty && due > 0;
  return (
    <View style={[styles.lipWrap, { backgroundColor: open ? c.main : p.lineStrong }]}>
      <View style={[styles.card, { backgroundColor: p.page, borderColor: open ? c.main : p.line }]}>
        <Text style={[styles.label, { color: open ? c.text : p.label }]}>TODAY'S REVIEW</Text>
        {empty ? (
          <>
            <Text style={[styles.big, { color: p.ink }]}>Nothing to review yet</Text>
            <Text style={[styles.line, { color: p.muted }]}>Finish a lesson and its questions come back here to keep them fresh.</Text>
          </>
        ) : due === 0 ? (
          <>
            <Text style={[styles.big, { color: p.ink }]}>All caught up</Text>
            <Text style={[styles.line, { color: p.muted }]}>{next ? `Next questions: ${next}.` : 'New questions appear as you finish lessons.'}</Text>
          </>
        ) : (
          <>
            <Text style={[styles.big, { color: p.ink }]}>
              {due} {due === 1 ? 'question' : 'questions'} due
            </Text>
            <View style={styles.pucks} accessible accessibilityLabel={`${Math.min(due, 5)} questions in this review`}>
              {Array.from({ length: Math.min(due, 5) }, (_, i) => (
                <Puck key={i} size={22} state="open" color={courseBlue} />
              ))}
              <Text style={[styles.line, { color: p.muted, marginLeft: 6 }]}>About {minutes} min</Text>
            </View>
            <MainButton label="Start review" onPress={onStart} tone="level" color={courseBlue} />
            {next && <Text style={[styles.next, { color: p.muted }]}>After that: {next}</Text>}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lipWrap: { borderRadius: 22, paddingBottom: 5 },
  card: { borderWidth: 2, borderRadius: 22, padding: 18, gap: 10 },
  label: { fontFamily: font.mono, fontSize: 11, letterSpacing: 0.8 },
  big: { fontFamily: font.display, fontSize: 26, lineHeight: 32 },
  line: { fontFamily: font.bodyMedium, fontSize: 15, lineHeight: 21 },
  pucks: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  next: { fontFamily: font.body, fontSize: 14 },
});
