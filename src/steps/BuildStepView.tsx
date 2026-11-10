// Build the solution, one stage per screen: pick the equation, fill it in one value at a time, read the result.
// A tap on a card commits at once (no Check button). The equation on top fills in as the learner commits values.
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BuildStep, Playback } from '@/content/types';
import { StageScreen } from '@/scene/StageScreen';
import { useClock } from '@/scene/useClock';
import {
  buildOutcome,
  chooseChip,
  chooseFinal,
  chooseRelation,
  currentHighlight,
  currentPrompt,
  initialBuild,
  marksEarned,
  relationText,
  type Answered,
  type BuildState,
  type Verdict,
} from '@/session/build';
import { useTheme } from '@/theme/ThemeContext';
import { Choice, ChoiceRow, FeedbackRow, type ChoiceState } from '@/ui/parts';
import { nextLabel, stepStyles, type StepViewProps } from './stepStyles';

const FLASH_MS = 450; // how long a tapped card shows right / wrong before the next screen appears

/** "+8.0 m s⁻¹" becomes "+8.0": inside an equation only the number is shown. */
const numberOf = (label: string) => label.split(' ')[0];

export function BuildStepView({ step, isLast, progress, onDone, onNext }: StepViewProps<BuildStep>) {
  const { palette: p } = useTheme();
  const clock = useClock();
  const [s, setS] = useState<BuildState>(initialBuild);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [wrongKeys, setWrongKeys] = useState<string[]>([]); // cards tapped wrong on the current screen
  const [flash, setFlash] = useState<{ key: string; ok: boolean } | null>(null); // the card shown right / wrong for a moment
  const [locked, setLocked] = useState(false); // taps are ignored while the flash runs
  const doneSent = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const done = s.stage === 'done';
  const playing = playback !== null && clock.status !== 'ended';
  const exam = step.exam;

  /** Put the answer's new state on screen: the next stage, the verdict, the scene. */
  function show(r: Answered) {
    setS(r.state);
    setVerdict(r.verdict);
    setFlash(null);
    setLocked(false);
    if (r.playback) {
      setPlayback(r.playback);
      clock.play(r.playback.events);
    } else if (playback) {
      clock.reset(); // back to the setup
      setPlayback(null);
    }
    if (r.state.stage === 'done' && !doneSent.current) {
      doneSent.current = true;
      onDone(buildOutcome(step, r.state));
    }
  }

  /** `key` identifies the tapped card on the current screen. */
  function commit(r: Answered, key: string) {
    if (r.correct || exam) {
      // show the card right (or, in the exam, wrong) for a moment, then move on
      setVerdict(null);
      setFlash({ key, ok: r.correct });
      setLocked(true);
      timer.current = setTimeout(() => show(r), FLASH_MS);
      return;
    }
    // a wrong answer outside the exam: stay on this screen, the learner picks again
    setWrongKeys((k) => [...k, key]);
    show(r);
  }

  const keyOf = (id: string | number) => `${s.stage}:${s.slotIndex}:${id}`;
  const stateOf = (key: string): ChoiceState => (flash?.key === key ? (flash.ok ? 'right' : 'wrong') : wrongKeys.includes(key) ? 'wrong' : 'idle');
  const cardsOff = locked || playing;

  const slot = s.stage === 'slot' ? step.slots[s.slotIndex] : undefined;
  const examFirst = exam && s.stage === 'relation' && s.wrong === 0 && s.lost === 0 && verdict === null;
  const title = examFirst ? `${exam.command} ${step.question} (${exam.marks})` : currentPrompt(step, s);
  const facts = step.facts;

  // which cards to show on this screen
  let cards: { id: string | number; label: string; onPress: () => void }[] = [];
  if (s.stage === 'relation') {
    cards = step.relations.map((r) => ({ id: r.id, label: relationText(r.id), onPress: () => commit(chooseRelation(step, s, r.id), keyOf(r.id)) }));
  } else if (slot) {
    cards = slot.chips.map((c) => ({ id: c.value, label: c.label, onPress: () => commit(chooseChip(step, s, c.value), keyOf(c.value)) }));
  } else if (s.stage === 'final') {
    cards = step.final.choices.map((c) => ({ id: c.id, label: c.label, onPress: () => commit(chooseFinal(step, s, c.id), keyOf(c.id)) }));
  }
  // long labels get full-width cards; short ones share a row
  const longest = Math.max(0, ...cards.map((c) => c.label.length));
  const columns = longest > 14 ? 1 : cards.length <= 3 ? cards.length : 2;

  const marks = exam ? `${marksEarned(step, s)} / ${exam.marks} marks` : null;
  const showWorked = s.revealed || (done && exam !== undefined && s.lost > 0);

  const primary = done ? (playing ? { label: 'Watch', disabled: true, onPress: () => {} } : { label: nextLabel(isLast), onPress: onNext }) : undefined;

  return (
    <StageScreen
      scene={step.scene}
      playback={playback}
      clock={clock}
      title={title}
      tag={step.sign}
      facts={facts}
      highlight={currentHighlight(step, s)}
      progress={progress}
      primary={primary}
    >
      <View style={stepStyles.sheet}>
        {s.stage !== 'relation' && !showWorked && <Equation step={step} s={s} activeQuantity={slot?.quantity} />}
        {(s.stage === 'final' || done) && !showWorked && (
          <Text style={[styles.solved, { color: p.velText }]} maxFontSizeMultiplier={1.3}>
            {step.solved}
          </Text>
        )}

        {showWorked ? (
          <View style={styles.worked}>
            {step.worked.map((line, i) => (
              <Text key={i} style={[styles.workedLine, { color: p.ink }]} maxFontSizeMultiplier={1.3}>
                {line}
              </Text>
            ))}
          </View>
        ) : !done ? (
          <ChoiceRow columns={columns}>
            {cards.map((c) => {
              const key = keyOf(c.id);
              const state = stateOf(key);
              return <Choice key={key} label={c.label} state={state} disabled={cardsOff || state === 'wrong'} onPress={c.onPress} />;
            })}
          </ChoiceRow>
        ) : null}

        <FeedbackRow reserve verdict={done && marks ? { ok: s.lost === 0 ? true : null, text: marks } : verdict} />
      </View>
    </StageScreen>
  );
}

/**
 * The chosen equation, drawn live from the template. Committed values replace their symbols,
 * the symbol being filled now is underlined. Negative numbers get brackets when they follow something.
 */
function Equation({ step, s, activeQuantity }: { step: BuildStep; s: BuildState; activeQuantity?: string }) {
  const { palette: p } = useTheme();
  const parts = step.template.map((piece, i) => {
    if (typeof piece === 'string') return <Text key={i}>{piece}</Text>;
    const q = piece.q;
    const slot = step.slots.find((sl) => sl.quantity === q);
    let value: string | null = null;
    if (slot) {
      const v = s.values[q];
      const chip = slot.chips.find((c) => c.value === v);
      value = chip ? numberOf(chip.label) : null;
    } else if (step.given?.quantity === q) {
      value = numberOf(step.given.label);
    }
    if (value === null) {
      const active = q === activeQuantity;
      return (
        <Text key={i} style={[styles.symbol, active && { color: p.velText, textDecorationLine: 'underline' }]}>
          {q}
        </Text>
      );
    }
    const before = typeof step.template[i - 1] === 'string' ? (step.template[i - 1] as string).trim() : '';
    const wrap = value.startsWith('−') && before !== '' && !before.endsWith('=');
    return (
      <Text key={i} style={styles.value}>
        {wrap ? `(${value})` : value}
      </Text>
    );
  });
  return (
    <Text style={[styles.equation, { color: p.ink }]} maxFontSizeMultiplier={1.2}>
      {parts}
    </Text>
  );
}

const styles = StyleSheet.create({
  equation: { fontSize: 24, lineHeight: 32, fontWeight: '500', textAlign: 'center', fontVariant: ['tabular-nums'] },
  symbol: { fontStyle: 'italic' },
  value: { fontWeight: '800' },
  solved: { fontSize: 18, lineHeight: 24, fontWeight: '700', textAlign: 'center', fontVariant: ['tabular-nums'] },
  worked: { gap: 6 },
  workedLine: { fontSize: 17, lineHeight: 24, fontWeight: '500', textAlign: 'center', fontVariant: ['tabular-nums'] },
});
