// Build the solution, one stage per screen: pick the equation (cards), then enter each value the way
// it is best understood — drag s from the release point, drag the velocity arrow, turn the acceleration
// arrow, or tap number tiles — and finally pick the root on a time line (or read the sign on cards).
// Check commits a stage. A wrong value plays as a ghost (the motion those numbers describe).
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { AccDir, BuildStep, Playback } from '@/content/types';
import type { Quantity, RelationId } from '@/physics/kinematics';
import { fixed, signed } from '@/physics/format';
import { speedLabel, type SceneGeometry } from '@/scene/BalloonScene';
import { AccFlip, DisplacementDrag, nextDir, VelocityDrag } from '@/scene/interactions';
import { LessonScreen, type Banner, type BarState } from '@/scene/LessonScreen';
import { useClock } from '@/scene/useClock';
import {
  buildOutcome,
  chooseChip,
  chooseFinal,
  chooseRelation,
  currentHighlight,
  currentInstruction,
  currentPrompt,
  initialBuild,
  marksEarned,
  relationText,
  type Answered,
  type BuildState,
} from '@/session/build';
import { useTheme } from '@/theme/ThemeContext';
import { Card, CardRow, TileBank, Timeline } from '@/ui/parts';
import { nextLabel, noteFor, text, type StepViewProps } from './stepStyles';

type Pending = { relation?: RelationId; value?: number; final?: string };
/** After a check: what the bar shows and what Continue / Try again does. */
type Result = { answered: Answered; banner: Banner; action: 'continue' | 'retry' | 'finish' };

export function BuildStepView({ step, isLast, progress, onDone, onNext }: StepViewProps<BuildStep>) {
  const { palette: p } = useTheme();
  const clock = useClock();
  const [s, setS] = useState<BuildState>(initialBuild);
  const [pending, setPending] = useState<Pending>({});
  const [drag, setDrag] = useState<number | null>(null); // live value of a dragged arrow
  const [dir, setDir] = useState<AccDir | null>(null); // the acceleration arrow being turned
  const [result, setResult] = useState<Result | null>(null);
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [stripW, setStripW] = useState(340);
  const exam = step.exam;
  const slot = s.stage === 'slot' ? step.slots[s.slotIndex] : undefined;
  const playing = playback !== null && clock.status !== 'ended';

  // the motion after the last stage plays first; the verdict waits for it
  const [waitForPlay, setWaitForPlay] = useState(false);
  useEffect(() => {
    if (waitForPlay && clock.status === 'ended') setWaitForPlay(false);
  }, [waitForPlay, clock.status]);

  function play(pb: Playback | null) {
    setPlayback(pb);
    if (pb) clock.play(pb.events);
    else clock.reset();
  }

  function check() {
    let a: Answered | null = null;
    if (s.stage === 'relation' && pending.relation) a = chooseRelation(step, s, pending.relation);
    if (s.stage === 'slot' && pending.value !== undefined) a = chooseChip(step, s, pending.value);
    if (s.stage === 'final' && pending.final) a = chooseFinal(step, s, pending.final);
    if (!a) return;
    const done = a.state.stage === 'done';
    if (done) onDone(buildOutcome(step, a.state));
    if (a.playback) {
      play(a.playback);
      setWaitForPlay(true);
    }
    if (a.correct) {
      const what = s.stage === 'relation' ? relationText(pending.relation!) : s.stage === 'slot' ? `${slot!.quantity} = ${chipLabel(step, slot!.quantity, pending.value!)}` : '';
      setResult({ answered: a, action: done ? 'finish' : 'continue', banner: { ok: true, title: 'Right', text: done ? (a.verdict?.text ?? '') : what } });
    } else if (a.state.revealed) {
      setResult({ answered: a, action: 'finish', banner: { ok: false, title: 'Here is the solution', text: 'Read it through, then watch the flight.' } });
    } else if (exam) {
      setResult({ answered: a, action: done ? 'finish' : 'continue', banner: { ok: false, title: 'Mark lost', text: a.verdict?.text ?? '' } });
    } else {
      setResult({ answered: a, action: 'retry', banner: { ok: false, title: 'Not quite', text: a.verdict?.text ?? '' } });
    }
  }

  function afterResult() {
    if (!result) return;
    if (result.action === 'finish') return onNext();
    setS(result.answered.state);
    setResult(null);
    setPending({});
    setDrag(null);
    setDir(null);
    play(null);
  }

  // ---- what the bar shows ----
  const hasPending = s.stage === 'relation' ? !!pending.relation : s.stage === 'slot' ? pending.value !== undefined : !!pending.final;
  let bar: BarState;
  if (result && (playing || waitForPlay)) bar = { label: 'Watch', disabled: true };
  else if (result) {
    const tone = result.banner.ok ? 'ok' : 'bad';
    const label = result.action === 'retry' ? 'Try again' : result.action === 'finish' ? nextLabel(isLast) : 'Continue';
    const banner = exam && result.action === 'finish' ? { ...result.banner, text: `${result.banner.text} ${marksEarned(step, result.answered.state)} / ${exam.marks} marks.`.trim() } : result.banner;
    bar = { label, onPress: afterResult, tone, banner };
  } else bar = { label: 'Check', disabled: !hasPending, onPress: check };

  // ---- the strip ----
  const answering = !result;
  const shownState = result ? result.answered.state : s;
  const values = { ...shownState.values };
  if (answering && slot && pending.value !== undefined) values[slot.quantity] = pending.value;
  if (answering && slot && pending.value === undefined && drag !== null && slot.input !== 'flip') values[slot.quantity] = drag;

  let strip: React.ReactNode = null;
  if (shownState.revealed) {
    strip = (
      <ScrollView style={{ maxHeight: 132 }} contentContainerStyle={{ gap: 4 }}>
        {step.worked.map((l, i) => (
          <Text key={i} style={{ color: p.ink, fontSize: 14, lineHeight: 19 }} maxFontSizeMultiplier={1.2}>{`${i + 1}. ${l}`}</Text>
        ))}
      </ScrollView>
    );
  } else if (s.stage === 'relation' && !result) {
    strip = (
      <CardRow>
        {step.relations.map((r) => (
          <Card key={r.id} label={relationText(r.id)} italic state={pending.relation === r.id ? 'selected' : 'idle'} onPress={() => setPending({ relation: r.id })} />
        ))}
      </CardRow>
    );
  } else if (s.stage === 'final' && !result && step.final.input === 'cards') {
    strip = (
      <View style={{ alignSelf: 'stretch', gap: 10 }}>
        <Equation step={step} values={values} active={null} />
        <CardRow>
          {step.final.choices.map((c) => (
            <Card key={c.id} label={c.label} state={pending.final === c.id ? 'selected' : 'idle'} onPress={() => setPending({ final: c.id })} />
          ))}
        </CardRow>
      </View>
    );
  } else if (s.stage === 'final' && !result) {
    strip = (
      <View style={{ alignSelf: 'stretch', alignItems: 'center' }} onLayout={(e) => setStripW(e.nativeEvent.layout.width)}>
        <Equation step={step} values={values} active={null} small />
        <Timeline width={stripW} choices={step.final.choices.map((c) => ({ id: c.id, label: c.label, value: c.value ?? 0 }))} selected={pending.final ?? null} onSelect={(id) => setPending({ final: id })} />
      </View>
    );
  } else if (slot && slot.input === 'tiles' && !result) {
    const tiles = uniqueTiles(step);
    strip = (
      <View style={{ alignSelf: 'stretch', gap: 12 }}>
        <Equation step={step} values={values} active={slot.quantity} />
        <TileBank tiles={tiles} selected={pending.value ?? null} used={Object.values(s.values)} onSelect={(v) => setPending({ value: v })} />
      </View>
    );
  } else if (slot && slot.input === 'cards' && !result) {
    strip = (
      <View style={{ alignSelf: 'stretch', gap: 10 }}>
        <Equation step={step} values={values} active={slot.quantity} />
        <CardRow>
          {slot.chips.map((c) => (
            <Card key={c.value} label={c.label} state={pending.value === c.value ? 'selected' : 'idle'} onPress={() => setPending({ value: c.value })} />
          ))}
        </CardRow>
      </View>
    );
  } else {
    strip = <Equation step={step} values={values} active={answering && slot ? slot.quantity : null} />;
  }

  // ---- interactions on the scene ----
  const overlay =
    answering && slot && !shownState.revealed
      ? slot.input === 'displacement'
        ? (g: SceneGeometry) => (
            <DisplacementDrag
              g={g}
              value={drag}
              snaps={slot.chips.map((c) => c.value)}
              onChange={setDrag}
              onRelease={(v) => {
                setDrag(v);
                setPending({ value: v });
              }}
              label={(v) => (v === null ? 's = ?' : `s = ${signed(v, 0)} m`)}
            />
          )
        : slot.input === 'vector'
          ? (g: SceneGeometry) => (
              <VelocityDrag
                g={g}
                value={drag}
                snaps={slot.chips.map((c) => c.value)}
                onChange={setDrag}
                onRelease={(v) => {
                  setDrag(v);
                  setPending({ value: v });
                }}
                label={(v) => (v === null ? 'u = ?' : `u = ${speedLabel(Math.round(v * 10))}`)}
              />
            )
          : slot.input === 'flip'
            ? (g: SceneGeometry) => (
                <AccFlip
                  g={g}
                  dir={dir}
                  label={dir === null ? 'a = ?' : `a = ${chipLabel(step, 'a', flipValue(step, s.slotIndex, dir))}`}
                  onTap={() => {
                    const d = nextDir(dir);
                    setDir(d);
                    setPending({ value: flipValue(step, s.slotIndex, d) });
                  }}
                />
              )
            : undefined
      : undefined;

  const examFirst = exam && s.stage === 'relation' && !result;
  return (
    <LessonScreen
      progress={progress}
      command={examFirst ? exam.command : undefined}
      prompt={examFirst ? `${step.question} (${exam.marks})` : currentPrompt(step, result && result.action !== 'finish' ? s : shownState)}
      instruction={currentInstruction(step, s)}
      instructionHidden={!answering || shownState.revealed}
      // the stage asks one small question; the goal keeps the whole task in view (the exam's first screen states it in full)
      note={noteFor(step, !examFirst && shownState.stage !== 'done')}
      scene={step.scene}
      playback={playback}
      clock={clock}
      // the exam never points at the quantity: a drawn s arrow would give its sign away
      highlight={answering && !exam && slot?.input !== 'displacement' && slot?.input !== 'vector' && slot?.input !== 'flip' ? currentHighlight(step, s) : null}
      overlay={overlay}
      strip={strip}
      bar={bar}
    />
  );
}

/** The equation, drawn from the step's template with the values filled so far. The active slot is underlined. */
function Equation({ step, values, active, small }: { step: BuildStep; values: Partial<Record<Quantity, number>>; active: Quantity | null; small?: boolean }) {
  const { palette: p } = useTheme();
  return (
    <Text style={[text.equation, { color: p.ink, fontSize: small ? 18 : 22 }]} maxFontSizeMultiplier={1.15}>
      {step.template.map((piece, i) => {
        if (typeof piece === 'string') return <Text key={i}>{piece}</Text>;
        if (step.given?.quantity === piece.q) return <Text key={i}>{step.given.label}</Text>;
        const v = values[piece.q];
        const isActive = active === piece.q;
        if (v === undefined || v === null) {
          return (
            <Text key={i} style={{ fontStyle: 'italic', color: isActive ? p.select : p.ink, textDecorationLine: isActive ? 'underline' : 'none' }}>
              {piece.q}
            </Text>
          );
        }
        return (
          <Text key={i} style={{ color: isActive ? p.select : p.velText }}>
            {piece.q === 's' ? signed(v, 0) : piece.q === 'u' ? signed(v, 1) : v === 0 ? '0' : `(${signed(v, 2)})`}
          </Text>
        );
      })}
    </Text>
  );
}

/** Label of a value for quantity q, taken from the chips (so units and signs match the content). */
function chipLabel(step: BuildStep, q: Quantity, v: number) {
  const chip = step.slots.find((sl) => sl.quantity === q)?.chips.find((c) => c.value === v);
  return chip?.label ?? fixed(v, 2);
}

/** The value an acceleration arrow direction stands for in this slot. */
function flipValue(step: BuildStep, slotIndex: number, d: AccDir) {
  const vals = step.slots[slotIndex].chips.map((c) => c.value);
  return d === 'up' ? Math.max(...vals) : d === 'down' ? Math.min(...vals) : 0;
}

/** Every value tile of every tiles slot, once each (so the wrong unit is a possible, and telling, choice). */
function uniqueTiles(step: BuildStep) {
  const seen = new Map<number, string>();
  for (const sl of step.slots) if (sl.input === 'tiles') for (const c of sl.chips) if (!seen.has(c.value)) seen.set(c.value, c.label);
  return [...seen.entries()].sort((a, b) => a[0] - b[0]).map(([value, label]) => ({ value, label }));
}
