import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { MiniGraph } from '../components/MiniGraph';
import { MotionLab } from '../components/MotionLab';
import { CheckIcon, ChunkyButton, CrossIcon, OptionFrame, tapHaptic } from '../components/stepParts';
import { SceneCard, useSceneHeight } from '../components/steps';
import { evaluate } from '../lib/expression';
import { displacementAt, duration, Graph, positionRange } from '../physics/motion';
import { fonts } from '../theme/fonts';
import { colors } from '../theme/tokens';
import type { Answer } from './grade';
import type { BuildStep, GoalStep, NumericStep, PickStep } from './types';

// The part of a graded step that the learner works on. The frame around it handles
// Check / Hint / Show me and the feedback panel; a surface only reports its answer.
export type Phase = 'answering' | 'wrong' | 'correct' | 'revealed';
type Props<S> = { step: S; phase: Phase; onAnswer: (a: Answer | null) => void };

const tidy = (n: number) => Number(n.toFixed(2));
const open = (phase: Phase) => phase === 'answering' || phase === 'wrong';

function Chip({ text, done }: { text: string; done?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, borderWidth: 2, borderColor: done ? colors.correct : colors.accent, backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 12 }}>
      {done && <CheckIcon color={colors.correct} size={20} />}
      <Text style={{ flex: 1, fontFamily: fonts.bodySemi, fontSize: 16, lineHeight: 22, color: colors.ink }}>{text}</Text>
    </View>
  );
}

// Move points of the v-t graph until the goal holds.
export function GoalSurface({ step, phase, onAnswer }: Props<GoalStep>) {
  const [speeds, setSpeeds] = useState(step.lab.graph.v);
  const [playing, setPlaying] = useState(false);
  const h = useSceneHeight(0.68);
  const graph: Graph = { t: step.lab.graph.t, v: speeds };

  useEffect(() => {
    if (phase === 'revealed') setSpeeds(step.solution);
    if (phase === 'correct' || phase === 'revealed') setPlaying(true);
  }, [phase, step.solution]);

  return (
    <>
      <Chip text={step.goalText} done={phase === 'correct'} />
      <SceneCard>
        <MotionLab
          {...step.lab}
          graph={graph}
          editable={open(phase) ? step.lab.editable : []}
          onChange={(v) => {
            setSpeeds(v);
            onAnswer({ kind: 'goal', speeds: v });
          }}
          playing={playing}
          onPlayingChange={setPlaying}
          height={h}
        />
      </SceneCard>
    </>
  );
}

// Which v-t graph matches the position-time curve?
export function PickSurface({ step, phase, onAnswer }: Props<PickStep>) {
  const [selected, setSelected] = useState<number | null>(null);
  const stRange = useMemo(() => {
    const r = positionRange(step.shown);
    return [Math.min(r.min, 0), Math.max(r.max, 1)] as [number, number];
  }, [step.shown]);
  const vRange = useMemo(() => {
    const all = step.options.flatMap((o) => o.v);
    return [Math.min(0, ...all) - 1, Math.max(0, ...all) + 1] as [number, number];
  }, [step.options]);

  return (
    <>
      <SceneCard>
        <View style={{ padding: 12 }}>
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.inkMuted, marginBottom: 4 }}>Position–time graph</Text>
          <MiniGraph graph={step.shown} kind="st" height={150} range={stRange} />
        </View>
      </SceneCard>
      <Text style={{ fontFamily: fonts.bodySemi, fontSize: 15, color: colors.inkMuted }}>Which velocity–time graph goes with it?</Text>
      <View style={{ gap: 10 }}>
        {step.options.map((g, i) => {
          const isSel = selected === i;
          const st = phase === 'revealed' || phase === 'correct' ? (i === step.correct ? 'correct' : 'idle') : !isSel ? 'idle' : phase === 'wrong' ? 'wrong' : 'selected';
          const border = st === 'correct' ? colors.correct : st === 'wrong' ? colors.incorrect : st === 'selected' ? colors.accent : colors.line;
          return (
            <OptionFrame
              key={i}
              wrong={st === 'wrong'}
              selected={st !== 'idle'}
              label={`Velocity–time graph ${'ABC'[i]}`}
              onPress={() => {
                if (!open(phase)) return;
                tapHaptic();
                setSelected(i);
                onAnswer({ kind: 'pick', index: i });
              }}
              style={{ borderRadius: 18, borderWidth: st === 'idle' ? 1.5 : 3, borderColor: border, backgroundColor: colors.surface, padding: 10 }}
            >
              <MiniGraph graph={g} kind="vt" height={110} range={vRange} />
              <Text style={{ position: 'absolute', top: 10, left: 14, fontFamily: fonts.display, fontSize: 20, color: colors.ink }}>{'ABC'[i]}</Text>
              {st === 'correct' && (
                <View style={{ position: 'absolute', top: 10, right: 12 }}>
                  <CheckIcon color={colors.correct} size={22} />
                </View>
              )}
              {st === 'wrong' && (
                <View style={{ position: 'absolute', top: 10, right: 12 }}>
                  <CrossIcon color={colors.incorrect} size={22} />
                </View>
              )}
            </OptionFrame>
          );
        })}
      </View>
    </>
  );
}

const SIGNS = ['×', '÷', '+', '−'];

// Build a calculation: number tiles go into ready slots, signs are fixed or chosen.
export function BuildSurface({ step, phase, onAnswer }: Props<BuildStep>) {
  const { template } = step;
  const [vals, setVals] = useState<(string | null)[]>(() => template.map(() => null));
  const [shown, setShown] = useState(false);
  const hasOpSlots = template.some((c) => c.kind === 'opSlot');
  const locked = !open(phase);
  const labHeight = useSceneHeight(0.34);

  // "Show me" fills every slot with the solution.
  useEffect(() => {
    if (phase !== 'revealed') return;
    let k = 0;
    setVals(template.map((c) => (c.kind === 'slot' || c.kind === 'opSlot' ? step.solution[k++] : null)));
  }, [phase, template, step.solution]);

  const tokensFor = (v: (string | null)[]) =>
    template.flatMap((c, i) => (c.kind === 'break' ? [] : c.kind === 'slot' ? [v[i] ?? ''] : c.kind === 'opSlot' ? [v[i] === '−' ? '-' : (v[i] ?? '')] : [c.sym]));
  const complete = (v: (string | null)[]) => template.every((c, i) => (c.kind !== 'slot' && c.kind !== 'opSlot') || v[i] !== null);
  const value = complete(vals) ? evaluate(tokensFor(vals)) : null;

  const report = (v: (string | null)[]) => {
    const r = complete(v) ? evaluate(tokensFor(v)) : null;
    onAnswer(r === null ? null : { kind: 'build', value: r });
  };
  const set = (i: number, x: string | null) => {
    const next = vals.map((y, j) => (j === i ? x : y));
    setVals(next);
    setShown(true);
    report(next);
  };
  const nextSlot = vals.findIndex((v, i) => template[i].kind === 'slot' && v === null);
  const border = phase === 'correct' || phase === 'revealed' ? colors.correct : phase === 'wrong' ? colors.incorrect : colors.line;

  return (
    <>
      {step.lab && (
        <SceneCard>
          <MotionLab {...step.lab} playing={false} onPlayingChange={() => {}} height={labHeight} />
        </SceneCard>
      )}
      <View style={{ minHeight: hasOpSlots ? 150 : 96, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 2, borderColor: border, paddingVertical: 14, paddingHorizontal: 10, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', rowGap: 8 }}>
          {template.map((c, i) => {
            if (c.kind === 'break') return <View key={i} style={{ width: '100%', height: 0 }} />;
            if (c.kind === 'op' || c.kind === 'paren') {
              return (
                <Text key={i} style={{ width: c.kind === 'op' ? 22 : 14, textAlign: 'center', fontFamily: fonts.display, fontSize: 26, color: c.kind === 'op' ? colors.accent : colors.inkMuted }}>
                  {c.sym}
                </Text>
              );
            }
            const filled = vals[i] !== null;
            const active = c.kind === 'slot' && i === nextSlot && !locked;
            const isOp = c.kind === 'opSlot';
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={isOp ? `Sign ${filled ? vals[i] : 'empty'}. Tap to change.` : filled ? `Number ${vals[i]}. Tap to remove.` : 'Empty slot'}
                onPress={() => {
                  if (locked) return;
                  tapHaptic();
                  if (isOp) set(i, SIGNS[(SIGNS.indexOf(vals[i] ?? '') + 1) % SIGNS.length]);
                  else if (filled) set(i, null);
                }}
                style={{
                  width: isOp ? 40 : 46,
                  height: 54,
                  marginHorizontal: 2,
                  borderRadius: 14,
                  borderWidth: filled ? 0 : 2,
                  borderStyle: 'dashed',
                  borderColor: active || (isOp && !filled) ? colors.accent : colors.axis,
                  backgroundColor: filled ? colors.surfaceRaised : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {filled ? (
                  <Animated.Text key={vals[i]} entering={ZoomIn.duration(220)} style={{ fontFamily: fonts.display, fontSize: isOp ? 24 : 22, color: isOp ? colors.accent : colors.ink, fontVariant: ['tabular-nums'] }}>
                    {vals[i]}
                  </Animated.Text>
                ) : isOp ? (
                  <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.accent }}>?</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
        {(phase === 'correct' || phase === 'revealed') && (
          <Text style={{ textAlign: 'center', fontFamily: fonts.display, fontSize: 26, color: colors.correct, marginTop: 8 }}>{`= ${tidy(step.answer)} ${step.unit}`}</Text>
        )}
        {phase === 'wrong' && value !== null && shown && (
          <Text style={{ textAlign: 'center', fontFamily: fonts.display, fontSize: 24, color: colors.incorrect, marginTop: 8 }}>{`= ${tidy(value)} ${step.unit}`}</Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {step.tiles.map((n, i) => (
          <ChunkyButton
            key={`${n}-${i}`}
            disabled={locked || nextSlot < 0}
            onPress={() => {
              tapHaptic();
              if (nextSlot >= 0) set(nextSlot, String(n));
            }}
            accessibilityLabel={String(n)}
            fill={colors.surfaceRaised}
            edge={colors.surfaceEdge}
            style={{ flex: 1, minHeight: 56 }}
          >
            <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.ink, fontVariant: ['tabular-nums'] }}>{n}</Text>
          </ChunkyButton>
        ))}
      </View>
      <Text style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.inkMuted }}>
        <Text style={{ fontFamily: fonts.bodySemi, color: colors.accent }}>Idea </Text>
        {step.structureHint}
        {hasOpSlots ? ' Tap a ? to pick a sign.' : ''}
      </Text>
    </>
  );
}

// Read a value off the graph, then pick the number and its unit.
export function NumericSurface({ step, phase, onAnswer }: Props<NumericStep>) {
  const [value, setValue] = useState<number | null>(null);
  const [unit, setUnit] = useState<string | null>(null);
  const h = useSceneHeight(0.36);
  const report = (v: number | null, u: string | null) => onAnswer(v !== null && u !== null ? { kind: 'numeric', value: v, unit: u } : null);

  return (
    <>
      <SceneCard>
        <MotionLab {...step.lab} playing={false} onPlayingChange={() => {}} height={h} />
      </SceneCard>
      <Text style={{ fontFamily: fonts.bodySemi, fontSize: 17, lineHeight: 24, color: colors.ink }}>{step.question}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {step.options.map((o) => {
          const sel = value === o.value;
          const shownRight = (phase === 'correct' || phase === 'revealed') && o.value === step.answer;
          const wrong = phase === 'wrong' && sel;
          return (
            <OptionFrame
              key={o.value}
              wrong={wrong}
              selected={sel}
              label={`${o.value}`}
              onPress={() => {
                if (!open(phase)) return;
                tapHaptic();
                setValue(o.value);
                report(o.value, unit);
              }}
              style={{ minWidth: 78, borderRadius: 14, borderWidth: sel || shownRight ? 3 : 1.5, borderColor: shownRight ? colors.correct : wrong ? colors.incorrect : sel ? colors.accent : colors.line, backgroundColor: colors.surface, paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.ink, fontVariant: ['tabular-nums'] }}>{tidy(o.value)}</Text>
            </OptionFrame>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {step.units.map((u) => {
          const sel = unit === u;
          return (
            <ChunkyButton
              key={u}
              disabled={!open(phase)}
              onPress={() => {
                tapHaptic();
                setUnit(u);
                report(value, u);
              }}
              accessibilityLabel={`unit ${u}`}
              fill={sel ? colors.accent : colors.surfaceRaised}
              edge={sel ? colors.accentEdge : colors.surfaceEdge}
              style={{ flex: 1, minHeight: 52 }}
            >
              <Text style={{ fontFamily: fonts.display, fontSize: 18, color: sel ? colors.onAccent : colors.ink }}>{u}</Text>
            </ChunkyButton>
          );
        })}
      </View>
    </>
  );
}
