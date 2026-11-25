// Today's review: how many questions from finished lessons are due, a row of small pucks, and a quiet button.
// Empty until the first lesson is finished. Revise shows the same card with the next review date.
import { StyleSheet, Text, View } from 'react-native';
import { Puck } from '@/figures/Puck';
import { useTheme } from '@/theme/ThemeContext';
import { courseBlue, font } from '@/theme/tokens';
import { OutlineButton } from './parts';

type Props = { due: number; minutes: number; next?: string | null; empty: boolean; onStart: () => void };

export function ReviewCard({ due, minutes, next, empty, onStart }: Props) {
  const { palette: p } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: p.paper, borderColor: p.paperLine }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: p.ink }]}>
        Today's review
      </Text>
      {empty ? (
        <Text style={[styles.line, { color: p.muted }]}>Finish a lesson and its questions come back here to keep them fresh.</Text>
      ) : due === 0 ? (
        <Text style={[styles.line, { color: p.muted }]}>All caught up.{next ? ` Next: ${next}.` : ''}</Text>
      ) : (
        <>
          <Text style={[styles.line, { color: p.ink }]}>
            {due} {due === 1 ? 'question' : 'questions'} · ~{minutes} min
          </Text>
          <View style={styles.pucks} accessible accessibilityLabel={`${Math.min(due, 5)} questions in this review`}>
            {Array.from({ length: Math.min(due, 5) }, (_, i) => (
              <Puck key={i} size={22} state="open" color={courseBlue} />
            ))}
          </View>
          <OutlineButton label="Start review" onPress={onStart} />
          {next && <Text style={[styles.next, { color: p.muted }]}>Next: {next}</Text>}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 10 },
  title: { fontFamily: font.display, fontSize: 19 },
  line: { fontFamily: font.bodyMedium, fontSize: 15, lineHeight: 21 },
  pucks: { flexDirection: 'row', gap: 6 },
  next: { fontFamily: font.body, fontSize: 14 },
});
