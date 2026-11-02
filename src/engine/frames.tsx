import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MotionLab } from '../components/MotionLab';
import { Footer, resultHaptic, tapHaptic } from '../components/stepParts';
import { SceneCard, Shell, useSceneHeight } from '../components/steps';
import { colors } from '../theme/tokens';
import { fonts } from '../theme/fonts';
import { Answer, gradeAnswer, stepOutcome, Verdict } from './grade';
import type { StepRecord } from './progress';
import { BuildSurface, GoalSurface, NumericSurface, Phase, PickSurface } from './surfaces';
import { BeatsStep, GradedStep, Lesson, PlayStep, PredictStep } from './types';

export type FrameProps = { index: number; total: number; onClose: () => void; onFinish: (record: StepRecord) => void };

// A graded step: Check, Hint (twice), Show me, feedback. The surface only holds the learner's answer.
export function GradedFrame({ step, index, total, onClose, onFinish }: FrameProps & { step: GradedStep }) {
  const [phase, setPhase] = useState<Phase>('answering');
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [hints, setHints] = useState(0);
  const finished = phase === 'correct' || phase === 'revealed';

  const onAnswer = (a: Answer | null) => {
    setAnswer(a);
    setPhase((p) => (p === 'wrong' ? 'answering' : p));
    setVerdict((v) => (v && !v.ok ? null : v));
  };

  const primary = () => {
    tapHaptic();
    if (finished) return onFinish({ outcome: stepOutcome(hints, phase === 'revealed'), hintsUsed: hints, revealed: phase === 'revealed' });
    if (phase === 'wrong') {
      setPhase('answering');
      setVerdict(null);
      return;
    }
    const v = gradeAnswer(step, answer!);
    resultHaptic(v.ok);
    setVerdict(v);
    setPhase(v.ok ? 'correct' : 'wrong');
  };

  const secondary = finished
    ? null
    : hints < 2
      ? { label: 'Hint', onPress: () => { tapHaptic(); setHints((h) => h + 1); } }
      : { label: 'Show me', onPress: () => { tapHaptic(); setPhase('revealed'); setVerdict(null); } };

  const label = finished ? 'Continue' : phase === 'wrong' ? 'Try again' : 'Check';
  const feedback = phase === 'correct' || phase === 'wrong' ? verdict && { ok: verdict.ok, text: verdict.message } : null;
  const note = phase === 'revealed' ? `Here is how it works. ${step.explanation}` : null;

  return (
    <Shell
      tag={step.tag}
      index={index}
      total={total}
      title={step.kind === 'goal' ? step.goalText : step.title}
      body={step.body}
      onClose={onClose}
      footer={<Footer label={label} disabled={!finished && phase === 'answering' && !answer} feedback={feedback} note={note} hint={!finished && hints > 0 ? step.hints[hints - 1] : null} secondary={secondary} onPress={primary} />}
    >
      {step.kind === 'goal' && <GoalSurface step={step} phase={phase} onAnswer={onAnswer} />}
      {step.kind === 'pick' && <PickSurface step={step} phase={phase} onAnswer={onAnswer} />}
      {step.kind === 'build' && <BuildSurface step={step} phase={phase} onAnswer={onAnswer} />}
      {step.kind === 'numeric' && <NumericSurface step={step} phase={phase} onAnswer={onAnswer} />}
    </Shell>
  );
}

// Hook: guess where the car ends up by tapping the track. The run only plays after the guess.
export function PredictFrame({ step, index, total, onClose, onFinish }: FrameProps & { step: PredictStep }) {
  const [marker, setMarker] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const h = useSceneHeight(0.62);

  // The run has finished once it was started and is no longer playing.
  useEffect(() => {
    if (revealed && !playing) setDone(true);
  }, [revealed, playing]);

  const label = done ? 'Continue' : revealed ? 'Watching…' : 'Check';
  const press = () => {
    tapHaptic();
    if (done) return onFinish({ outcome: null, hintsUsed: 0, revealed: false });
    setRevealed(true);
    setPlaying(true);
  };

  return (
    <Shell
      tag={step.tag}
      index={index}
      total={total}
      title={step.title}
      body={step.body}
      onClose={onClose}
      footer={<Footer label={label} disabled={(!done && marker === null) || (revealed && !done)} note={done ? step.revealNote(marker!, step.answer) : null} onPress={press} />}
    >
      <SceneCard>
        <MotionLab {...step.lab} hideRun revealed={revealed} playing={playing} onPlayingChange={setPlaying} marker={marker} onTrackTap={(m) => { tapHaptic(); setMarker(m); }} height={h} />
      </SceneCard>
    </Shell>
  );
}

// Explanation in small portions; the main button reveals the next beat.
export function BeatsFrame({ step, index, total, onClose, onFinish }: FrameProps & { step: BeatsStep }) {
  const [k, setK] = useState(0);
  const [playing, setPlaying] = useState(false);
  const h = useSceneHeight(0.62);
  const beat = step.beats[k];
  const last = k >= step.beats.length - 1;

  // A beat can start the run by itself.
  useEffect(() => {
    if (beat.play) setPlaying(true);
  }, [k, beat.play]);

  return (
    <Shell
      tag={step.tag}
      index={index}
      total={total}
      title={step.title}
      body={step.body}
      onClose={onClose}
      footer={
        <Footer
          label={last ? 'Continue' : 'Next'}
          note={beat.note}
          onPress={() => {
            tapHaptic();
            if (last) onFinish({ outcome: null, hintsUsed: 0, revealed: false });
            else setK(k + 1);
          }}
        />
      }
    >
      <SceneCard>
        <MotionLab key={k} {...beat.lab} playing={playing} onPlayingChange={setPlaying} height={h} />
      </SceneCard>
    </Shell>
  );
}

// Free play: move the dots and watch the car; no checking.
export function PlayFrame({ step, index, total, onClose, onFinish }: FrameProps & { step: PlayStep }) {
  const [speeds, setSpeeds] = useState(step.lab.graph.v);
  const [moved, setMoved] = useState(false);
  const [playing, setPlaying] = useState(false);
  const h = useSceneHeight(0.7);
  return (
    <Shell
      tag={step.tag}
      index={index}
      total={total}
      title={step.title}
      body={step.body}
      onClose={onClose}
      footer={<Footer label="Next" disabled={!moved} note={moved ? step.note : null} onPress={() => { tapHaptic(); onFinish({ outcome: null, hintsUsed: 0, revealed: false }); }} />}
    >
      <SceneCard>
        <MotionLab {...step.lab} graph={{ t: step.lab.graph.t, v: speeds }} onChange={(v) => { setSpeeds(v); setMoved(true); }} playing={playing} onPlayingChange={setPlaying} height={h} />
      </SceneCard>
    </Shell>
  );
}

const OUTCOME_TEXT = { independent: 'On your own', assisted: 'With a hint', revealed: 'Shown' } as const;
const OUTCOME_COLOR = { independent: colors.correct, assisted: colors.accent, revealed: colors.inkMuted } as const;
const SURVEY = ['Too easy', 'Just right', 'Too hard'];

// Lesson complete: what you can do now, how each step went, and a one-tap survey.
export function CompleteFrame({ lesson, step, records, index, total, onClose }: Omit<FrameProps, 'onFinish'> & { lesson: Lesson; step: Extract<Lesson['steps'][number], { kind: 'complete' }>; records: Record<string, StepRecord> }) {
  const [vote, setVote] = useState<string | null>(null);
  // Only steps that were played are listed; skipped ones are never shown as done.
  const graded = lesson.steps.filter((s) => (s.kind === 'goal' || s.kind === 'pick' || s.kind === 'build' || s.kind === 'numeric') && records[s.id]?.outcome);
  const allIndependent = graded.every((s) => records[s.id]?.outcome === 'independent');

  return (
    <Shell
      tag={step.tag}
      index={index}
      total={total}
      title={step.title}
      body={allIndependent ? 'You did every scored step on your own.' : 'You finished with some help, which is how learning works. Try the last question again tomorrow.'}
      onClose={onClose}
      footer={<Footer label="Back to lessons" onPress={() => { tapHaptic(); onClose(); }} />}
    >
      <View style={{ gap: 8 }}>
        {step.summary.map((line) => (
          <View key={line} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 14 }}>
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 16, lineHeight: 22, color: colors.ink }}>{line}</Text>
          </View>
        ))}
      </View>
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 14, gap: 10 }}>
        {graded.map((s) => {
          const o = records[s.id].outcome!;
          return (
            <View key={s.id} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.ink }}>{s.title}</Text>
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 15, color: OUTCOME_COLOR[o] }}>{OUTCOME_TEXT[o]}</Text>
            </View>
          );
        })}
      </View>
      <Text style={{ fontFamily: fonts.bodySemi, fontSize: 15, color: colors.inkMuted }}>How was this lesson?</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {SURVEY.map((s) => (
          <Pressable
            key={s}
            accessibilityRole="button"
            accessibilityState={{ selected: vote === s }}
            onPress={() => { tapHaptic(); setVote(s); }}
            style={{ flex: 1, minHeight: 48, borderRadius: 14, borderWidth: 2, borderColor: vote === s ? colors.accent : colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink }}>{s}</Text>
          </Pressable>
        ))}
      </View>
    </Shell>
  );
}
