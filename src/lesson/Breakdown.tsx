// "Your breakdown": the screen after the celebration. Three honest numbers on a drawing-sheet table, a ribbon with a
// square for every graded question, what tripped you up (what you picked and why it was wrong), the prediction,
// what comes back in review, and "How was it?". Everything is counted from the finished lesson (src/session/breakdown.ts).
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Lesson } from '@/content/types';
import { minutesOf, onYourOwn, predictionMarks, predictionOf, reviewLine, ribbonLabel, ribbonOf, trippedUp } from '@/session/breakdown';
import type { LessonState, Outcome, Run } from '@/session/logic';
import { setLastRunFeel } from '@/session/storage';
import { bankOf } from '@/practice/bank';
import { useTheme } from '@/theme/ThemeContext';
import { colorOfLesson } from '@/theme/levelColor';
import { font, reward } from '@/theme/tokens';
import { MainButton, Mark } from '@/ui/parts';
import { Frame } from './Frame';

type Props = { lesson: Lesson; state: LessonState; onNext?: () => void; /** The main button's words when there is a next step (default: Next lesson). */ nextLabel?: string; onDone: () => void; onReplay: () => void };

const CELL = 18; // a square of the ribbon

const FEELS: { id: NonNullable<Run['feel']>; label: string }[] = [
  { id: 'easy', label: 'Too easy' },
  { id: 'right', label: 'Just right' },
  { id: 'hard', label: 'Too hard' },
];

export function Breakdown({ lesson, state, onNext, nextLabel, onDone, onReplay }: Props) {
  const { palette: p } = useTheme();
  const c = colorOfLesson(lesson.id);
  const insets = useSafeAreaInsets();
  const ribbon = ribbonOf(lesson, state);
  const tripped = trippedUp(lesson, state);
  const prediction = predictionOf(lesson, state);
  const marks = predictionMarks(lesson, state);
  const [feel, setFeel] = useState<Run['feel']>(null);

  return (
    <View style={{ flex: 1, paddingTop: insets.top + 8, paddingBottom: insets.bottom, backgroundColor: p.page }}>
      <Frame footer={<MainButton label={onNext ? (nextLabel ?? 'Next lesson') : 'Back to the map'} onPress={onNext ?? onDone} tone="level" color={c} />}>
        <View style={{ gap: 4 }}>
          <Text accessibilityRole="header" style={[styles.title, { color: p.ink }]}>
            Your breakdown
          </Text>
          <Text style={[styles.lessonName, { color: p.muted }]}>{lesson.title}</Text>
        </View>

        {/* three numbers on a drawing-sheet table */}
        <View style={[styles.table, { backgroundColor: p.paper, borderColor: p.paperLine }]}>
          <Cell label="ON YOUR OWN" a11y={`On your own: ${onYourOwn(ribbon.counts)}`}>
            <Text style={[styles.value, { color: p.ink }]}>{onYourOwn(ribbon.counts)}</Text>
          </Cell>
          <View style={[styles.rule, { backgroundColor: p.paperLine }]} />
          <Cell label="TIME" a11y={`Time: ${minutesOf(state.activeMs)} minutes`}>
            <Text style={[styles.value, { color: p.ink }]}>{minutesOf(state.activeMs)} MIN</Text>
          </Cell>
          <View style={[styles.rule, { backgroundColor: p.paperLine }]} />
          <Cell label="PREDICTION" a11y={marks ? `Prediction: ${marks.map((m) => (m ? 'right' : 'wrong')).join(', then ')}` : 'No prediction'}>
            {marks ? (
              <View style={styles.marks}>
                {marks.map((ok, i) => (
                  <View key={i} style={styles.marks}>
                    {i > 0 && <Text style={[styles.arrow, { color: p.muted }]}>→</Text>}
                    <Mark kind={ok ? 'ok' : 'bad'} color={ok ? p.ok : p.bad} size={24} />
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.value, { color: p.muted }]}>—</Text>
            )}
          </Cell>
        </View>

        {/* a square for every graded question */}
        <View style={{ gap: 12 }}>
          <View accessible accessibilityLabel={ribbonLabel(ribbon.counts)} style={{ gap: 12 }}>
            {ribbon.groups.map((g) => (
              <View key={g.label} style={{ gap: 6 }}>
                <Text style={[styles.mono, { color: p.muted }]}>{g.label}</Text>
                <View style={styles.cells}>
                  {g.cells.map((cell) => (
                    <View key={cell.id} style={[styles.cell, cellStyle(cell.outcome, c.main, p)]} />
                  ))}
                </View>
              </View>
            ))}
          </View>
          <View style={styles.legend}>
            <Key outcome="independent" color={c.main} text={`on your own ${ribbon.counts.independent}`} />
            <Key outcome="assisted" color={c.main} text={`after a hint ${ribbon.counts.assisted}`} />
            <Key outcome="revealed" color={c.main} text={`answer shown ${ribbon.counts.revealed}`} />
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Text style={[styles.h, { color: p.ink }]}>What tripped you up</Text>
          {tripped.length === 0 ? (
            <Text style={[styles.body, { color: p.ink }]}>Nothing — every answer right first time.</Text>
          ) : (
            tripped.map((t) => (
              <View key={t.id} style={[styles.trip, { borderColor: p.line }]}>
                <Text style={[styles.tripQ, { color: p.ink }]}>{t.prompt}</Text>
                {t.picked && <Text style={[styles.body, { color: p.muted }]}>You picked: {t.picked}</Text>}
                <Text style={[styles.body, { color: p.ink }]}>{t.note}</Text>
              </View>
            ))
          )}
        </View>

        {prediction && (
          <View style={{ gap: 6 }}>
            <Text style={[styles.h, { color: p.ink }]}>Your prediction</Text>
            <Text style={[styles.body, { color: p.muted }]}>You said: {prediction.you}</Text>
            <Text style={[styles.body, { color: p.ink }]}>It was: {prediction.was}</Text>
          </View>
        )}

        <View style={{ gap: 6 }}>
          <Text style={[styles.h, { color: p.ink }]}>Coming back in review</Text>
          <Text style={[styles.body, { color: p.ink }]}>{reviewLine(bankOf([lesson.id]).filter((it) => (state.outcomes[it.screen.id] ?? 'revealed') !== 'independent').length)}</Text>
        </View>

        <View style={{ gap: 10 }}>
          <Text style={[styles.h, { color: p.ink }]}>How was it?</Text>
          <View style={styles.feels} accessibilityRole="radiogroup">
            {FEELS.map((f) => {
              const on = feel === f.id;
              return (
                <Pressable
                  key={f.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  onPress={() => {
                    setFeel(f.id);
                    setLastRunFeel(lesson.id, f.id);
                  }}
                  style={[styles.pill, { borderColor: on ? p.select : p.line, backgroundColor: on ? p.selectBg : p.page }]}
                >
                  <Text style={[styles.pillText, { color: on ? p.forceText : p.ink }]}>{f.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          {onNext && (
            <Text accessibilityRole="button" onPress={onDone} style={[styles.link, { color: p.muted }]}>
              Back to the map
            </Text>
          )}
          <Text accessibilityRole="button" onPress={onReplay} style={[styles.link, { color: p.muted }]}>
            Play the lesson again
          </Text>
        </View>
      </Frame>
    </View>
  );
}

/** The look of a square: yellow when earned alone, a level-coloured outline with a hint, grey when the answer was shown. */
function cellStyle(o: Outcome, level: string, p: { disabled: string; lineStrong: string }) {
  if (o === 'independent') return { backgroundColor: reward.face };
  if (o === 'assisted') return { borderWidth: 2, borderColor: level };
  return { backgroundColor: p.disabled, borderWidth: 1.5, borderColor: p.lineStrong };
}

function Cell({ label, a11y, children }: { label: string; a11y: string; children: React.ReactNode }) {
  const { palette: p } = useTheme();
  return (
    <View style={styles.cellBox} accessible accessibilityLabel={a11y}>
      <Text style={[styles.mono, { color: p.muted }]}>{label}</Text>
      <View style={{ minHeight: 32, justifyContent: 'center' }}>{children}</View>
    </View>
  );
}

function Key({ outcome, color, text }: { outcome: Outcome; color: string; text: string }) {
  const { palette: p } = useTheme();
  return (
    <View style={styles.key}>
      <View style={[styles.keyCell, cellStyle(outcome, color, p)]} />
      <Text style={[styles.keyText, { color: p.muted }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.4 },
  lessonName: { fontFamily: font.bodyMedium, fontSize: 17 },
  table: { flexDirection: 'row', borderWidth: 1, borderRadius: 4, paddingVertical: 14 },
  cellBox: { flex: 1, paddingHorizontal: 12, gap: 6 },
  rule: { width: 1, marginVertical: 2 },
  mono: { fontFamily: font.mono, fontSize: 11, letterSpacing: 0.6 },
  value: { fontFamily: font.display, fontSize: 24, lineHeight: 30, fontVariant: ['tabular-nums'] },
  marks: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  arrow: { fontFamily: font.display, fontSize: 18 },
  cells: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: { width: CELL, height: CELL, borderRadius: 4 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 6 },
  key: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  keyCell: { width: 12, height: 12, borderRadius: 3 },
  keyText: { fontFamily: font.body, fontSize: 14 },
  h: { fontFamily: font.display, fontSize: 19 },
  body: { fontFamily: font.body, fontSize: 16, lineHeight: 23 },
  trip: { borderLeftWidth: 3, paddingLeft: 12, gap: 4 },
  tripQ: { fontFamily: font.bodyMedium, fontSize: 16, lineHeight: 23 },
  feels: { flexDirection: 'row', gap: 8 },
  pill: { flex: 1, minHeight: 44, borderWidth: 2, borderRadius: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  pillText: { fontFamily: font.bodyMedium, fontSize: 15, textAlign: 'center' },
  link: { fontFamily: font.bodyMedium, fontSize: 16, textAlign: 'center', textDecorationLine: 'underline', paddingVertical: 12 },
});
