import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { A, BuildQuestion, INTRO_SPEEDS, tapWarmup } from '../content/brakingDemo';
import { evaluate, hasOperator } from '../lib/expression';
import { stoppingDistance, stoppingTime } from '../physics/braking';
import { colors } from '../theme/tokens';
import { fonts } from '../theme/fonts';
import { BrakingScene } from './BrakingScene';
import { HeroScene } from './HeroScene';
import { BackspaceIcon, CheckIcon, ChunkyButton, CrossIcon, Footer, OptionFrame, resultHaptic, tapHaptic } from './stepParts';

const tidy = (n: number) => Number(n.toFixed(2));

// Common frame: close + progress, title, content, footer.
function Shell({
  tag,
  index,
  total,
  title,
  body,
  children,
  footer,
}: {
  tag: string;
  index: number;
  total: number;
  title: string;
  body?: string;
  children?: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 4, height: 52, gap: 4 }}>
        <Pressable onPress={() => router.replace('/')} accessibilityRole="button" accessibilityLabel="Restart demo" style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
          <CrossIcon color={colors.inkMuted} size={22} />
        </Pressable>
        <View style={{ flex: 1, flexDirection: 'row', gap: 4, marginRight: 16 }}>
          {Array.from({ length: total }, (_, i) => (
            <View key={i} style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: i <= index ? colors.accent : colors.surfaceRaised }} />
          ))}
        </View>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.accent }}>{tag}</Text>
        <Text style={{ fontFamily: fonts.display, fontSize: 30, lineHeight: 34, color: colors.ink, letterSpacing: -0.5, marginTop: 2 }}>{title}</Text>
        {body && <Text style={{ fontFamily: fonts.body, fontSize: 17, lineHeight: 24, color: colors.inkMuted, marginTop: 6 }}>{body}</Text>}
        <View style={{ marginTop: 14, gap: 12 }}>{children}</View>
      </ScrollView>
      {footer}
    </SafeAreaView>
  );
}

function SceneCard({ children }: { children: React.ReactNode }) {
  return <View style={{ backgroundColor: colors.surface, borderRadius: 20, overflow: 'hidden' }}>{children}</View>;
}

// Share of the screen height the scene takes; screens with more controls give it less.
function useSceneHeight(share: number) {
  const { height } = useWindowDimensions();
  return Math.min(Math.max(height * share, 240), 540);
}

type Nav = { index: number; total: number; onNext: () => void };

// 1. Intro: one hero object, two sentences.
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

// 2a. Example: watch one braking run.
export function ExampleBrake({ index, total, onNext }: Nav) {
  const [playKey, setPlayKey] = useState(0);
  const [done, setDone] = useState(false);
  const u = 20;
  const running = playKey > 0 && !done;
  const h = useSceneHeight(0.56);

  return (
    <Shell
      tag="Watch"
      index={index}
      total={total}
      title="Brake from 20 m/s"
      body={`The car brakes at a steady ${A} m/s².`}
      footer={
        <Footer
          label={done ? 'Next' : running ? 'Braking…' : 'Brake'}
          disabled={running}
          note={done ? `It stops after ${stoppingTime(u, A)} s and ${stoppingDistance(u, A)} m. The distance is the area under the graph.` : null}
          onPress={() => {
            tapHaptic();
            if (done) onNext();
            else setPlayKey(1);
          }}
        />
      }
    >
      <SceneCard>
        <BrakingScene height={h} u={u} playKey={playKey} range={60} xMax={5} yMax={24} onDone={() => setDone(true)} />
      </SceneCard>
    </Shell>
  );
}

// 2b. Example: try different speeds and see why distance grows with v squared.
export function ExampleSpeed({ index, total, onNext }: Nav) {
  const [u, setU] = useState(20);
  const [playKey, setPlayKey] = useState(0);
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const running = playKey > 0 && !done;
  const enough = history.length >= 2;
  const h = useSceneHeight(0.5);

  // Compare the last two speeds tried: ratio r in speed gives r in time and in average speed, so r² in distance.
  const [lo, hi] = history.slice(-2).sort((x, y) => x - y);
  const r = enough ? tidy(hi / lo) : 1;
  const label = running ? 'Braking…' : done ? (enough ? 'Next' : 'Pick another speed') : 'Brake';
  const note = !done
    ? null
    : enough
      ? `${r}× the speed gives ${r}× the stopping time and ${r}× the average speed, so ${tidy(r * r)}× the distance. s = u² ÷ 2a.`
      : `${u} m/s: ${stoppingTime(u, A)} s and ${stoppingDistance(u, A)} m.`;

  return (
    <Shell
      tag="Try it"
      index={index}
      total={total}
      title="Faster, much further"
      body="Pick a speed and brake. Try two."
      footer={
        <Footer
          label={label}
          disabled={running || (done && !enough)}
          note={note}
          onPress={() => {
            tapHaptic();
            if (done) onNext();
            else {
              setHistory((hs) => (hs.includes(u) ? hs : [...hs, u]));
              setPlayKey((k) => k + 1);
            }
          }}
        />
      }
    >
      <SceneCard>
        <BrakingScene height={h} u={u} playKey={playKey} range={180} xMax={9} yMax={48} history={history} onDone={() => setDone(true)} />
      </SceneCard>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {INTRO_SPEEDS.map((s) => {
          const on = s === u;
          return (
            <ChunkyButton
              key={s}
              disabled={running}
              accessibilityLabel={`${s} metres per second`}
              fill={on ? colors.velocity : colors.surfaceRaised}
              edge={on ? '#2A62C9' : colors.surfaceEdge}
              style={{ flex: 1, minHeight: 56, opacity: running && !on ? 0.5 : 1 }}
              onPress={() => {
                tapHaptic();
                setU(s);
                setPlayKey(0);
                setDone(false);
              }}
            >
              <Text style={{ fontFamily: fonts.display, fontSize: 22, color: on ? colors.onAccent : colors.ink, fontVariant: ['tabular-nums'] }}>{s}</Text>
              <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 12, color: on ? colors.onAccent : colors.inkMuted }}>m/s</Text>
            </ChunkyButton>
          );
        })}
      </View>
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

// 3a. Warm-up: pick the graph.
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

// 3b. Warm-up: tap the road where the car stops. The run plays only after a correct check.
export function WarmTap({ index, total, onNext }: Nav) {
  const [marker, setMarker] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [playKey, setPlayKey] = useState(0);
  const correct = status === 'correct';
  const h = useSceneHeight(0.5);
  const { u, answer, tolerance, scene } = tapWarmup;
  const sceneH = correct ? h : 270; // road only until the answer is in

  const onPress = () => {
    if (correct) return onNext();
    if (status === 'incorrect') {
      setStatus('selected');
      return;
    }
    const ok = Math.abs(marker! - answer) <= tolerance;
    resultHaptic(ok);
    setStatus(ok ? 'correct' : 'incorrect');
    if (ok) setPlayKey(1);
  };

  return (
    <Shell
      tag="Warm-up"
      index={index}
      total={total}
      title="Where does it stop?"
      body={`Braking from ${u} m/s. Tap the road to plant a flag.`}
      footer={
        <Footer
          label={correct ? 'Continue' : status === 'incorrect' ? 'Move the flag' : 'Check'}
          disabled={status === 'idle'}
          feedback={
            correct
              ? { ok: true, text: `${u}² ÷ (2 × ${A}) = ${answer} m. The flag is within ${tolerance} m.` }
              : status === 'incorrect'
                ? { ok: false, text: `${marker! > answer ? 'The car stops sooner than that.' : 'The car goes further than that.'} Distance is the area under the graph.` }
                : null
          }
          onPress={onPress}
        />
      }
    >
      <SceneCard>
        <BrakingScene
          height={sceneH}
          graph={correct}
          u={u}
          playKey={playKey}
          {...scene}
          marker={marker}
          onRoadTap={
            correct
              ? undefined
              : (m) => {
                  tapHaptic();
                  setMarker(m);
                  setStatus('selected');
                }
          }
        />
      </SceneCard>
      {!correct && (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { k: 'Start speed', v: `${u} m/s`, c: colors.velocity },
            { k: 'Braking', v: `${A} m/s²`, c: colors.acceleration },
          ].map((f) => (
            <View key={f.k} style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 14 }}>
              <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.inkMuted }}>{f.k}</Text>
              <Text style={{ fontFamily: fonts.display, fontSize: 24, color: f.c, fontVariant: ['tabular-nums'] }}>{f.v}</Text>
            </View>
          ))}
        </View>
      )}
    </Shell>
  );
}

const OPS: { sym: string; label: string }[] = [
  { sym: '×', label: 'times' },
  { sym: '÷', label: 'divided by' },
  { sym: '+', label: 'plus' },
  { sym: '(', label: 'open bracket' },
  { sym: ')', label: 'close bracket' },
];

// 4. Build the calculation from tiles. The app does the arithmetic and compares with the physics.
export function BuildStep({ q, index, total, onNext }: Nav & { q: BuildQuestion }) {
  const [tokens, setTokens] = useState<string[]>([]);
  const [status, setStatus] = useState<'editing' | 'correct' | 'wrong' | 'invalid'>('editing');
  const [result, setResult] = useState<number | null>(null);
  const [playKey, setPlayKey] = useState(0);
  const h = useSceneHeight(0.34);
  const correct = status === 'correct';

  const add = (tok: string) => {
    if (correct) return;
    tapHaptic();
    setTokens((t) => [...t, tok]);
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
          ? { ok: false, text: 'That is not a complete calculation. Check the operators and brackets.' }
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
          disabled={status === 'editing' && tokens.length === 0}
          feedback={feedback}
          onPress={onPress}
        />
      }
    >
      <SceneCard>
        <BrakingScene height={h} u={correct ? q.scene.u : null} playKey={playKey} range={q.scene.range} xMax={q.scene.xMax} yMax={q.scene.yMax} reaction={q.scene.reaction} />
      </SceneCard>

      {/* Fixed height so the tiles never move while the expression grows. */}
      <View accessibilityLabel={`Your calculation: ${tokens.join(' ') || 'empty'}`} style={{ height: 108, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 2, borderColor: border, padding: 16, justifyContent: 'center' }}>
        {tokens.length === 0 ? (
          <Text style={{ fontFamily: fonts.body, fontSize: 16, color: colors.inkMuted }}>Tap the tiles to build the calculation. No calculator needed.</Text>
        ) : (
          <Text style={{ fontFamily: fonts.display, fontSize: 26, lineHeight: 34, color: colors.ink, fontVariant: ['tabular-nums'] }}>
            {tokens.join(' ')}
            {correct && <Text style={{ color: colors.correct }}>{`  = ${tidy(q.answer)} ${q.unit}`}</Text>}
          </Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {q.tiles.map((n) => (
          <ChunkyButton key={n} onPress={() => add(String(n))} accessibilityLabel={String(n)} fill={colors.surfaceRaised} edge={colors.surfaceEdge} style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.ink, fontVariant: ['tabular-nums'] }}>{n}</Text>
          </ChunkyButton>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {OPS.map((o) => (
          <ChunkyButton key={o.sym} onPress={() => add(o.sym)} accessibilityLabel={o.label} fill={colors.surfaceRaised} edge={colors.surfaceEdge} style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.accent }}>{o.sym}</Text>
          </ChunkyButton>
        ))}
        <ChunkyButton
          onPress={() => {
            if (correct) return;
            tapHaptic();
            setTokens((t) => t.slice(0, -1));
            setStatus('editing');
          }}
          accessibilityLabel="Delete last"
          fill={colors.surfaceRaised}
          edge={colors.surfaceEdge}
          style={{ flex: 1 }}
        >
          <BackspaceIcon color={colors.inkMuted} />
        </ChunkyButton>
      </View>
    </Shell>
  );
}

export function DoneStep({ index, total, onRestart }: { index: number; total: number; onRestart: () => void }) {
  return (
    <Shell
      tag="Done"
      index={index}
      total={total}
      title="That is the idea"
      body="Stopping distance grows with the square of the speed: s = u² ÷ 2a. A reaction time adds u × t on top."
      footer={<Footer label="Restart demo" onPress={onRestart} />}
    />
  );
}
