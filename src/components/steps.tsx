import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, FadeInDown, ZoomIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Line, Path } from 'react-native-svg';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { A, BuildQuestion, GAME, SQUARE, tapWarmup } from '../content/brakingDemo';
import { evaluate, hasOperator } from '../lib/expression';
import { useTween } from '../lib/useTween';
import { stoppingDistance, stoppingTime } from '../physics/braking';
import { colors } from '../theme/tokens';
import { fonts } from '../theme/fonts';
import { BrakingScene } from './BrakingScene';
import { ExplainGraph } from './ExplainGraph';
import { HeroScene } from './HeroScene';
import { StopGame } from './StopGame';
import { CheckIcon, ChunkyButton, CrossIcon, Footer, OptionFrame, resultHaptic, tapHaptic } from './stepParts';

const tidy = (n: number) => Number(n.toFixed(2));

function ProgressBar({ index, total }: { index: number; total: number }) {
  const w = useSharedValue(index / total);
  useEffect(() => {
    w.value = withTiming((index + 1) / total, { duration: 650, easing: Easing.out(Easing.cubic) });
  }, [index, total, w]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.surfaceRaised, overflow: 'hidden', marginRight: 16 }}>
      <Animated.View style={[{ height: 10, borderRadius: 5, backgroundColor: colors.accent }, fill]} />
    </View>
  );
}

// Common frame: close + progress, then tag, title, body and content that glide in one after another.
export function Shell({
  tag,
  index,
  total,
  title,
  body,
  children,
  footer,
  onClose,
}: {
  tag: string;
  index: number;
  total: number;
  title: string;
  body?: string;
  children?: React.ReactNode;
  footer: React.ReactNode;
  onClose?: () => void;
}) {
  const enter = (delay: number) => FadeInDown.duration(420).delay(delay);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 4, height: 52, gap: 4 }}>
        <Pressable onPress={onClose ?? (() => router.replace('/demo'))} accessibilityRole="button" accessibilityLabel="Close lesson" style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
          <CrossIcon color={colors.inkMuted} size={22} />
        </Pressable>
        <ProgressBar index={index} total={total} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <Animated.Text entering={enter(0)} style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.accent }}>
          {tag}
        </Animated.Text>
        <Animated.Text entering={enter(70)} style={{ fontFamily: fonts.display, fontSize: 30, lineHeight: 34, color: colors.ink, letterSpacing: -0.5, marginTop: 2 }}>
          {title}
        </Animated.Text>
        {body && (
          <Animated.Text entering={enter(140)} style={{ fontFamily: fonts.body, fontSize: 17, lineHeight: 24, color: colors.inkMuted, marginTop: 6 }}>
            {body}
          </Animated.Text>
        )}
        <Animated.View entering={enter(220)} style={{ marginTop: 14, gap: 12 }}>
          {children}
        </Animated.View>
      </ScrollView>
      {footer}
    </SafeAreaView>
  );
}

export function SceneCard({ children }: { children: React.ReactNode }) {
  return <View style={{ backgroundColor: colors.surface, borderRadius: 20, overflow: 'hidden' }}>{children}</View>;
}

// Share of the screen height the scene takes; screens with more controls give it less.
export function useSceneHeight(share: number) {
  const { height } = useWindowDimensions();
  return Math.min(Math.max(height * share, 240), 540);
}

export type Nav = { index: number; total: number; onNext: () => void };

// A step with several small beats: the main button reveals the next one.
function useBeats(count: number) {
  const [k, setK] = useState(0);
  return { k, last: k >= count - 1, advance: () => setK((n) => Math.min(n + 1, count - 1)) };
}

// Coloured symbols: u = speed (blue), a = braking (coral), t = time (yellow).
const LETTER: Record<string, string> = { u: colors.velocity, a: colors.acceleration, t: colors.accent };
export function Eq({ parts, size = 30 }: { parts: (string | [string, string])[]; size?: number }) {
  return (
    <Text style={{ fontFamily: fonts.display, fontSize: size, lineHeight: size * 1.3, color: colors.ink, fontVariant: ['tabular-nums'] }}>
      {parts.map((p, i) =>
        typeof p === 'string' ? (
          [...p].map((c, j) => (
            <Text key={`${i}-${j}`} style={{ color: LETTER[c] ?? colors.ink }}>
              {c}
            </Text>
          ))
        ) : (
          <Text key={i} style={{ color: p[1] }}>
            {p[0]}
          </Text>
        ),
      )}
    </Text>
  );
}

export function FormulaRow({ label, children, strong }: { label: string; children: React.ReactNode; strong?: boolean }) {
  return (
    <Animated.View entering={FadeInDown.duration(450)} style={{ backgroundColor: colors.surface, borderRadius: 18, padding: 16, borderWidth: strong ? 2 : 0, borderColor: colors.accent }}>
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.inkMuted, marginBottom: 4 }}>{label}</Text>
      {children}
    </Animated.View>
  );
}

// Intro: one hero object, two sentences.
export function Story({ index, total, onNext }: Nav) {
  const h = useSceneHeight(0.6);
  return (
    <Shell
      tag="Intro"
      index={index}
      total={total}
      title="Stopping takes room"
      body="Brakes slow a car at a steady rate. But how far does it roll before it stops?"
      footer={<Footer label="Continue" onPress={() => { tapHaptic(); onNext(); }} />}
    >
      <SceneCard>
        <HeroScene height={h} />
      </SceneCard>
    </Shell>
  );
}

// Where u² ÷ 2a comes from, built line by line.
export function RuleExplain({ index, total, onNext }: Nav) {
  const { k, last, advance } = useBeats(3);
  const notes = [
    "The triangle's area is the distance. But how long is t?",
    'The speed falls by a every second, so reaching zero takes u ÷ a seconds.',
    'Swap t for u ÷ a. The distance depends on u², not u.',
  ];
  const labels = ['Find t', 'Put it together', 'Next'];

  return (
    <Shell
      tag="Idea"
      index={index}
      total={total}
      title="Where does u² come from?"
      footer={<Footer label={labels[k]} note={notes[k]} onPress={() => { tapHaptic(); if (last) onNext(); else advance(); }} />}
    >
      <FormulaRow label="Area of the triangle">
        <Eq parts={['s = ½ × u × t']} />
      </FormulaRow>
      {k >= 1 && (
        <FormulaRow label="Speed drops a every second">
          <Eq parts={['t = u ÷ a']} />
        </FormulaRow>
      )}
      {k >= 2 && (
        <FormulaRow label="Put t into s" strong>
          <Eq parts={['s = ½ × u × (u ÷ a)']} size={24} />
          <View style={{ height: 6 }} />
          <Eq parts={['s = u² ÷ 2a']} size={36} />
        </FormulaRow>
      )}
    </Shell>
  );
}

// Why squared: twice the speed fills four times the squares.
export function SquaresExplain({ index, total, onNext }: Nav) {
  const { k, last, advance } = useBeats(2);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const first = useTween(mounted ? 1 : 0, 1600);
  const second = useTween(k >= 1 ? 1 : 0, 2000);
  const h = useSceneHeight(0.58);
  const cells = k >= 1 ? second : first;
  const u = k >= 1 ? 40 : 20;
  const notes = [
    `20 m/s: the box is 2 × 2 = 4 squares. One square is ${SQUARE.dt * SQUARE.dv} m and the triangle is half the box: 40 m.`,
    '40 m/s: twice as wide and twice as tall, 4 × 4 = 16 squares. Twice the speed, four times the distance.',
  ];

  return (
    <Shell
      tag="Idea"
      index={index}
      total={total}
      title="Double the speed"
      footer={<Footer label={last ? 'Next' : 'Double the speed'} note={notes[k]} onPress={() => { tapHaptic(); if (last) onNext(); else advance(); }} />}
    >
      <SceneCard>
        <ExplainGraph height={h} u={u} xMax={9} yMax={48} cells={cells} cell={SQUARE} area={1} ghostU={k >= 1 ? 20 : undefined} />
      </SceneCard>
    </Shell>
  );
}

// Chips that list earlier attempts: speed, then distance.
export function AttemptChips({ items }: { items: { u: number; d: number; ok?: boolean }[] }) {
  if (items.length === 0) return null;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {items.map((a, i) => (
        <Animated.View
          key={i}
          entering={ZoomIn.duration(260)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1.5, borderColor: a.ok ? colors.correct : colors.line }}
        >
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.velocity }}>{a.u} m/s</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkMuted }}>stops in</Text>
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink }}>{tidy(a.d)} m</Text>
        </Animated.View>
      ))}
    </View>
  );
}

// Predict: watch 20 m/s, then guess where a car at twice the speed stops. The surprise is the lesson.
export function PredictStep({ index, total, onNext }: Nav) {
  const first = 20;
  const second = 40;
  const [beat, setBeat] = useState(0);
  const [done1, setDone1] = useState(false);
  const [run1, setRun1] = useState(0);
  const [marker, setMarker] = useState<number | null>(null);
  const [run2, setRun2] = useState(0);
  const [done2, setDone2] = useState(false);
  const h = useSceneHeight(0.62);
  const d1 = stoppingDistance(first, A);
  const d2 = stoppingDistance(second, A);
  const range = 180;
  const scene = { range, xMax: 9, yMax: 48 };

  let label = 'Brake';
  let disabled = false;
  let note: string | null = null;
  if (beat === 0) {
    if (run1 > 0 && !done1) {
      label = 'Braking…';
      disabled = true;
    }
    if (done1) {
      label = 'Next';
      note = `It stops after ${d1} m.`;
    }
  } else {
    if (run2 === 0) {
      disabled = marker === null;
    } else if (!done2) {
      label = 'Braking…';
      disabled = true;
    } else {
      label = 'Continue';
      note =
        Math.abs(marker! - d2) <= 20
          ? `${d2} m. Good guess. Twice the speed, four times the distance.`
          : `${d2} m, not ${d1 * 2} m. Twice the speed, four times the distance.`;
    }
  }

  const onPress = () => {
    tapHaptic();
    if (beat === 0) {
      if (done1) setBeat(1);
      else setRun1(1);
      return;
    }
    if (done2) return onNext();
    setRun2(1);
  };

  return (
    <Shell
      tag="Predict"
      index={index}
      total={total}
      title={beat === 0 ? `Brake from ${first} m/s` : 'Now twice as fast'}
      body={beat === 0 ? `The brakes slow the car at a steady ${A} m/s².` : `${second} m/s. Tap the road where you think it stops.`}
      footer={<Footer label={label} disabled={disabled} note={note} onPress={onPress} />}
    >
      <SceneCard>
        {beat === 0 ? (
          <BrakingScene key="a" height={h} u={first} playKey={run1} {...scene} onDone={() => setDone1(true)} />
        ) : (
          <BrakingScene
            key="b"
            height={run2 > 0 ? h : Math.min(h, 340)}
            graph={run2 > 0}
            u={second}
            playKey={run2}
            {...scene}
            marker={marker}
            history={[first]}
            onDone={() => setDone2(true)}
            onRoadTap={
              run2 > 0
                ? undefined
                : (m) => {
                    tapHaptic();
                    setMarker(m);
                  }
            }
          />
        )}
      </SceneCard>
      {beat === 1 && run2 === 0 && <AttemptChips items={[{ u: first, d: d1 }]} />}
    </Shell>
  );
}

// Game: set the starting speed on the graph so the car stops in the parking spot before the wall.
export function StopStep({ index, total, onNext }: Nav) {
  const [u, setU] = useState(15);
  const [playKey, setPlayKey] = useState(0);
  const [touched, setTouched] = useState(false);
  const [attempts, setAttempts] = useState<{ u: number; d: number; ok?: boolean }[]>([]);
  const [result, setResult] = useState<{ u: number; distance: number; crashed: boolean } | null>(null);
  const h = useSceneHeight(0.6);
  const running = playKey > 0 && !result;
  const inSpot = result && !result.crashed && result.distance >= GAME.wall - GAME.spot;

  let feedback: { ok: boolean; text: string } | null = null;
  if (result) {
    const d = tidy(result.distance);
    feedback = inSpot
      ? { ok: true, text: `${result.u} m/s stops in ${d} m. Parked.` }
      : result.crashed
        ? { ok: false, text: `${result.u} m/s needs ${d} m. The wall is at ${GAME.wall} m. Go slower.` }
        : { ok: false, text: `${result.u} m/s stops in ${d} m, ${tidy(GAME.wall - GAME.spot - result.distance)} m before the spot. Go faster.` };
  }

  const onPress = () => {
    tapHaptic();
    if (inSpot) return onNext();
    if (result) {
      setResult(null);
      setPlayKey(0);
      return;
    }
    setPlayKey((k) => k + 1);
  };

  return (
    <Shell
      tag="Try it"
      index={index}
      total={total}
      title="Park by the wall"
      body="Drag the dot to set the speed. The car should stop in the green spot."
      footer={
        <Footer
          label={inSpot ? 'Continue' : result ? 'Try again' : running ? 'Braking…' : 'Brake'}
          disabled={running}
          feedback={feedback}
          onPress={onPress}
        />
      }
    >
      <SceneCard>
        <StopGame
          height={h}
          u={u}
          onChangeU={(next) => {
            setTouched(true);
            setU(next);
          }}
          playKey={playKey}
          locked={playKey > 0}
          touched={touched}
          onDone={(r) => {
            setResult(r);
            setAttempts((a) => [...a, { u: r.u, d: r.distance, ok: !r.crashed && r.distance >= GAME.wall - GAME.spot }]);
            resultHaptic(!r.crashed && r.distance >= GAME.wall - GAME.spot);
          }}
        />
      </SceneCard>
      <AttemptChips items={attempts.slice(-4)} />
    </Shell>
  );
}

type Status = 'idle' | 'selected' | 'correct' | 'incorrect';

// Small v-t graph cards for the "which graph" warm-up.
const graphs: { d: string; correct: boolean; name: string }[] = [
  { d: 'M30 20 L270 104', correct: true, name: 'a straight line sloping down' },
  { d: 'M30 20 L120 20 L270 104', correct: false, name: 'flat, then a straight drop' },
  { d: 'M30 20 Q60 92 270 104', correct: false, name: 'a curve dropping fast then levelling' },
];

// Warm-up: pick the graph.
export function WarmGraph({ index, total, onNext }: Nav) {
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const correct = status === 'correct';

  const onPress = () => {
    if (correct) return onNext();
    if (status === 'incorrect') {
      setSelected(null);
      setStatus('idle');
      return;
    }
    const ok = graphs[selected!].correct;
    resultHaptic(ok);
    setStatus(ok ? 'correct' : 'incorrect');
  };

  return (
    <Shell
      tag="Warm-up"
      index={index}
      total={total}
      title="Which graph?"
      body="Tap the v–t graph of a car braking at a steady rate."
      footer={
        <Footer
          label={correct ? 'Continue' : status === 'incorrect' ? 'Try again' : 'Check'}
          disabled={status === 'idle'}
          feedback={
            correct
              ? { ok: true, text: `Steady braking is a straight line down. Its slope is −a = −${A} m/s².` }
              : status === 'incorrect'
                ? { ok: false, text: 'Steady means the same change in speed every second. What shape does that make?' }
                : null
          }
          onPress={onPress}
        />
      }
    >
      <View style={{ gap: 10, marginTop: 4 }}>
        {graphs.map((g, i) => {
          const st = i !== selected ? 'idle' : status === 'correct' ? 'correct' : status === 'incorrect' ? 'wrong' : 'selected';
          const border = st === 'correct' ? colors.correct : st === 'wrong' ? colors.incorrect : st === 'selected' ? colors.accent : colors.line;
          return (
            <OptionFrame
              key={i}
              wrong={st === 'wrong'}
              selected={st !== 'idle'}
              label={`Graph ${'ABC'[i]}: ${g.name}`}
              onPress={() => {
                if (correct) return;
                tapHaptic();
                setSelected(i);
                setStatus('selected');
              }}
              style={{ borderRadius: 18, borderWidth: st === 'idle' ? 1.5 : 3, borderColor: border, backgroundColor: colors.surface, padding: 10 }}
            >
              <Svg width="100%" height={128} viewBox="0 0 300 120" preserveAspectRatio="xMidYMid meet">
                <Line x1={24} y1={8} x2={24} y2={110} stroke={colors.axis} strokeWidth={1.5} />
                <Line x1={24} y1={110} x2={292} y2={110} stroke={colors.axis} strokeWidth={1.5} />
                <Path d={g.d} stroke={colors.velocity} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={{ position: 'absolute', top: 10, left: 14, fontFamily: fonts.display, fontSize: 20, color: colors.ink }}>{'ABC'[i]}</Text>
              {st === 'correct' && <View style={{ position: 'absolute', top: 10, right: 12 }}><CheckIcon color={colors.correct} size={22} /></View>}
              {st === 'wrong' && <View style={{ position: 'absolute', top: 10, right: 12 }}><CrossIcon color={colors.incorrect} size={22} /></View>}
            </OptionFrame>
          );
        })}
      </View>
    </Shell>
  );
}

const SIGNS = ['×', '÷', '+', '−'];

// Build the calculation: number tiles go into ready slots between the signs.
export function BuildStep({ q, index, total, onNext }: Nav & { q: BuildQuestion }) {
  const [vals, setVals] = useState<(string | null)[]>(() => q.template.map(() => null));
  const [status, setStatus] = useState<'editing' | 'correct' | 'wrong' | 'invalid'>('editing');
  const [result, setResult] = useState<number | null>(null);
  const [playKey, setPlayKey] = useState(0);
  const full = useSceneHeight(0.4);
  const correct = status === 'correct';
  const h = correct ? full : 200; // road only until the answer is in
  const hasOpSlots = q.template.some((c) => c.kind === 'opSlot');

  const nextSlot = vals.findIndex((v, i) => q.template[i].kind === 'slot' && v === null);
  const complete = q.template.every((c, i) => (c.kind !== 'slot' && c.kind !== 'opSlot') || vals[i] !== null);
  const tokens = q.template.flatMap((c, i) =>
    c.kind === 'break' ? [] : c.kind === 'slot' ? [vals[i] ?? ''] : c.kind === 'opSlot' ? [vals[i] === '−' ? '-' : vals[i] ?? ''] : [c.sym],
  );

  const set = (i: number, v: string | null) => {
    setVals((arr) => arr.map((x, j) => (j === i ? v : x)));
    setStatus('editing');
  };

  const check = () => {
    const value = evaluate(tokens);
    setResult(value);
    if (value === null) {
      resultHaptic(false);
      setStatus('invalid');
      return;
    }
    const ok = Math.abs(value - q.answer) < 1e-9 && hasOperator(tokens);
    resultHaptic(ok);
    setStatus(ok ? 'correct' : 'wrong');
    if (ok) setPlayKey(1);
  };

  const onPress = () => {
    if (correct) return onNext();
    if (status === 'wrong' || status === 'invalid') return setStatus('editing');
    check();
  };

  const border = correct ? colors.correct : status === 'wrong' || status === 'invalid' ? colors.incorrect : colors.line;
  const feedback =
    status === 'correct'
      ? { ok: true, text: q.correctText }
      : status === 'wrong'
        ? { ok: false, text: `That gives ${tidy(result!)} ${q.unit}. ${q.hint}` }
        : status === 'invalid'
          ? { ok: false, text: 'That does not work out. Check the signs.' }
          : null;

  return (
    <Shell
      tag="Build"
      index={index}
      total={total}
      title={q.title}
      body={q.prompt}
      footer={
        <Footer
          label={correct ? 'Continue' : status === 'wrong' || status === 'invalid' ? 'Edit' : 'Check'}
          disabled={status === 'editing' && !complete}
          feedback={feedback}
          onPress={onPress}
        />
      }
    >
      <SceneCard>
        <BrakingScene height={h} graph={correct} u={correct ? q.scene.u : null} playKey={playKey} range={q.scene.range} xMax={q.scene.xMax} yMax={q.scene.yMax} reaction={q.scene.reaction} />
      </SceneCard>

      {/* The answer template. Fixed height so the tiles never move while it fills up. */}
      <View style={{ minHeight: hasOpSlots ? 150 : 96, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 2, borderColor: border, paddingVertical: 14, paddingHorizontal: 10, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', rowGap: 8 }}>
          {q.template.map((c, i) => {
            if (c.kind === 'break') return <View key={i} style={{ width: '100%', height: 0 }} />;
            if (c.kind === 'op' || c.kind === 'paren') {
              return (
                <Text key={i} style={{ width: c.kind === 'op' ? 22 : 14, textAlign: 'center', fontFamily: fonts.display, fontSize: 26, color: c.kind === 'op' ? colors.accent : colors.inkMuted }}>
                  {c.sym}
                </Text>
              );
            }
            const filled = vals[i] !== null;
            const active = c.kind === 'slot' && i === nextSlot && !correct;
            const isOp = c.kind === 'opSlot';
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={isOp ? `Sign ${filled ? vals[i] : 'empty'}. Tap to change.` : filled ? `Number ${vals[i]}. Tap to remove.` : 'Empty slot'}
                onPress={() => {
                  if (correct) return;
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
        {correct && <Text style={{ textAlign: 'center', fontFamily: fonts.display, fontSize: 26, color: colors.correct, marginTop: 8 }}>{`= ${tidy(q.answer)} ${q.unit}`}</Text>}
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {q.tiles.map((n) => (
          <ChunkyButton
            key={n}
            disabled={correct || nextSlot < 0}
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
        <Text style={{ fontFamily: fonts.bodySemi, color: colors.accent }}>Hint </Text>
        {q.structureHint}
        {hasOpSlots ? ' Tap a ? to pick a sign.' : ''}
      </Text>
    </Shell>
  );
}

export function DoneStep({ index, total, onRestart }: { index: number; total: number; onRestart: () => void }) {
  return (
    <Shell
      tag="Lesson complete"
      index={index}
      total={total}
      title="Stopping distance depends on u²"
      body="You saw it, parked with it and built it."
      footer={<Footer label="Restart demo" onPress={onRestart} />}
    >
      <FormulaRow label="Braking at a steady a" strong>
        <Eq parts={['s = u² ÷ 2a']} size={36} />
      </FormulaRow>
      <FormulaRow label="Twice the speed">
        <Text style={{ fontFamily: fonts.display, fontSize: 26, color: colors.ink }}>
          <Text style={{ color: colors.accent }}>4×</Text> the distance
        </Text>
      </FormulaRow>
      <FormulaRow label="Reaction time before braking">
        <Eq parts={['s = u × t']} size={26} />
      </FormulaRow>
    </Shell>
  );
}
