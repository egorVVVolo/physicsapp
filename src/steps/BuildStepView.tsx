// Build the solution: pick the equation, fill it with signed values, then read the result.
// The app does the arithmetic. A wrong set of values plays as a ghost next to the real flight.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BuildStep, Playback } from '@/content/types';
import type { Quantity } from '@/physics/kinematics';
import { SceneFrame, type FrameView } from '@/scene/SceneFrame';
import { useClock } from '@/scene/useClock';
import { buildOutcome, canCheck, check, initialBuild, marksEarned, pickChip, pickFinal, pickRelation, pickSlot, relationText, type BuildState } from '@/session/build';
import { useTheme } from '@/theme/ThemeContext';
import { radius, touch } from '@/theme/tokens';
import { Choice, ChoiceRow, Condition, PrimaryButton, PromptSlot, type Verdict } from '@/ui/parts';
import type { StepViewProps } from './PredictStepView';
import { stepStyles } from './stepStyles';

export function BuildStepView({ step, isLast, onDone, onNext }: StepViewProps<BuildStep>) {
  const { palette: p } = useTheme();
  const clock = useClock();
  const [s, setS] = useState<BuildState>(initialBuild);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [view, setView] = useState<FrameView>('scene');
  const done = s.stage === 'done';
  const playing = playback !== null && clock.status !== 'ended';

  /** Any new choice clears the last verdict and puts the scene back to the setup. */
  function edit(next: BuildState) {
    if (next === s) return;
    setS(next);
    setVerdict(null);
    if (playback) {
      clock.reset();
      setPlayback(null);
      setView('scene');
    }
  }

  function onCheck() {
    const r = check(step, s);
    setS(r.state);
    setVerdict(r.verdict);
    if (r.state.revealed) {
      // the answer is shown as a worked solution; the flight is played in the retry step
      clock.reset();
      setPlayback(null);
      setView('solution');
    } else if (r.playback) {
      setPlayback(r.playback);
      setView('scene');
      clock.play(r.playback.events);
    } else if (playback) {
      clock.reset();
      setPlayback(null);
    }
    if (r.state.stage === 'done') onDone(buildOutcome(step, r.state));
  }

  const question = step.exam ? (
    <Text>
      <Text style={{ fontWeight: '900' }}>{step.exam.command}</Text> {step.question} ({step.exam.marks})
    </Text>
  ) : (
    step.question
  );
  const prompt = s.stage === 'final' ? step.final.prompt : question;
  const slotOf = (q: Quantity) => step.slots.find((sl) => sl.quantity === q);
  const active = s.active ? slotOf(s.active) : undefined;
  const short = (label: string) => label.split(' ')[0]; // "+8.0 m s⁻¹" → "+8.0"

  return (
    <View style={stepStyles.step}>
      <Condition text={step.condition} />
      <SceneFrame scene={step.scene} playback={playback} clock={clock} view={view} onView={setView} solution={s.revealed || (done && s.lost > 0) ? step.worked : undefined} hideVelocity={step.unknown === 'u'} />
      <PromptSlot question={prompt} verdict={verdict} />

      <View style={styles.tray}>
        {s.stage === 'relation' ? (
          <>
            <ChoiceRow>
              {step.relations.map((r) => (
                <Choice key={r.id} label={relationText(r.id)} compact state={s.relation === r.id ? 'selected' : 'idle'} onPress={() => edit(pickRelation(s, r.id))} />
              ))}
            </ChoiceRow>
            <View style={styles.rowTwo}>
              <Text style={[styles.hint, { color: p.muted }]} maxFontSizeMultiplier={1.2}>{step.hint} Pick the equation.</Text>
            </View>
          </>
        ) : (
          <>
            {/* the equation itself is the form: tap a box, then choose its value below */}
            <View style={styles.equation} accessibilityLabel="Equation">
              {step.template.map((piece, i) => {
                if (typeof piece === 'string') return <Text key={i} style={[styles.eqText, { color: p.ink }]}>{piece}</Text>;
                const slot = slotOf(piece.q);
                if (!slot) {
                  const given = step.given?.quantity === piece.q ? step.given.label : piece.q;
                  return <Text key={i} style={[styles.eqText, styles.eqSymbol, { color: p.ink }]}>{given}</Text>;
                }
                const value = s.values[piece.q];
                const chip = slot.chips.find((c) => c.value === value);
                const isActive = s.stage === 'slots' && s.active === piece.q;
                const marked = s.marked === piece.q;
                return (
                  <Pressable
                    key={i}
                    accessibilityRole="button"
                    accessibilityLabel={`${piece.q}: ${chip ? chip.label : 'empty'}${marked ? ', check this one' : ''}`}
                    accessibilityState={{ selected: isActive, disabled: s.stage !== 'slots' }}
                    disabled={s.stage !== 'slots'}
                    onPress={() => edit(pickSlot(s, piece.q))}
                    hitSlop={{ top: 4, bottom: 4 }}
                    style={[
                      styles.slot,
                      { backgroundColor: p.surface, borderColor: marked ? p.bad : isActive ? p.ink : p.line, borderWidth: marked || isActive ? 3 : 1.5, borderStyle: chip ? 'solid' : 'dashed' },
                    ]}
                  >
                    <Text style={[styles.slotText, !chip && styles.eqSymbol, { color: marked ? p.bad : chip ? p.ink : p.muted }]} maxFontSizeMultiplier={1.2}>
                      {marked ? '✕ ' : ''}
                      {chip ? short(chip.label) : piece.q}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {s.stage === 'slots' && active && (
              <ChoiceRow>
                {active.chips.map((c) => (
                  <Choice key={c.value} label={c.label} compact state={s.values[active.quantity] === c.value ? 'selected' : 'idle'} onPress={() => edit(pickChip(step, s, c.value))} />
                ))}
              </ChoiceRow>
            )}
            {s.stage === 'final' && (
              <ChoiceRow>
                {step.final.choices.map((c) => (
                  <Choice key={c.id} label={c.label} state={s.finalId === c.id ? 'selected' : 'idle'} onPress={() => edit(pickFinal(s, c.id))} />
                ))}
              </ChoiceRow>
            )}
            {done && (
              <View style={styles.rowTwo}>
                <Text style={[styles.result, { color: p.ink }]} maxFontSizeMultiplier={1.2}>
                  {step.exam ? `${step.solved}     ${marksEarned(step, s)} / ${step.exam.marks} marks` : `t = ${step.final.choices.find((c) => c.correct)!.label}`}
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {done ? (
        playing ? (
          <PrimaryButton label="Watch" disabled onPress={() => {}} />
        ) : (
          <PrimaryButton label={isLast ? 'Finish' : 'Next'} onPress={onNext} />
        )
      ) : playing ? (
        <PrimaryButton label="Watch" disabled onPress={() => {}} />
      ) : (
        <PrimaryButton label="Check" disabled={!canCheck(step, s) || verdict?.ok === false} onPress={onCheck} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tray: { height: 108, gap: 8 },
  rowTwo: { height: 50, justifyContent: 'center', alignItems: 'center' },
  hint: { fontSize: 14, textAlign: 'center' },
  equation: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  eqText: { fontSize: 19, fontWeight: '600' },
  eqSymbol: { fontStyle: 'italic' },
  slot: { minWidth: 58, height: touch, borderRadius: radius.s, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, marginHorizontal: 2 },
  slotText: { fontSize: 17, fontWeight: '700', fontVariant: ['tabular-nums'] },
  result: { fontSize: 17, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
