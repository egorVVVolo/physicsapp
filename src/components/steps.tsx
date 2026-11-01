import React, { useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { A, INTRO_SPEEDS, Question } from '../content/brakingDemo';
import { stoppingDistance, stoppingTime } from '../physics/braking';
import { colors } from '../theme/tokens';
import { fonts } from '../theme/fonts';
import { BrakingScene } from './BrakingScene';
import { CheckIcon, CrossIcon, Footer, OptionFrame, resultHaptic, tapHaptic } from './stepParts';

// Common frame: progress, one-line title, the scene, then the step's own controls and footer.
function Shell({
  tag,
  index,
  total,
  title,
  body,
  scene,
  controls,
  footer,
}: {
  tag: string;
  index: number;
  total: number;
  title: string;
  body?: string;
  scene?: React.ReactNode;
  controls?: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 16, height: 52, gap: 12 }}>
        <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.inkMuted, width: 56 }}>{tag}</Text>
        <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
          {Array.from({ length: total }, (_, i) => (
            <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= index ? colors.ink : colors.line }} />
          ))}
        </View>
        <Pressable onPress={() => router.replace('/')} accessibilityRole="button" accessibilityLabel="Restart demo" style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}>
          <CrossIcon color={colors.ink} size={22} />
        </Pressable>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 30, lineHeight: 34, color: colors.ink, letterSpacing: -0.6 }}>{title}</Text>
        {body && <Text style={{ fontFamily: fonts.body, fontSize: 16, lineHeight: 22, color: colors.inkMuted, marginTop: 4 }}>{body}</Text>}
        {scene && <View style={{ marginTop: 12, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.ink, borderRadius: 4, overflow: 'hidden' }}>{scene}</View>}
        <View style={{ marginTop: 12 }}>{controls}</View>
      </View>
      {footer}
    </SafeAreaView>
  );
}

// Share of the screen height the scene takes; screens with more controls give it less.
function useSceneHeight(share = 0.5) {
  const { height } = useWindowDimensions();
  return Math.min(Math.max(height * share, 300), 540);
}

type Nav = { index: number; total: number; onNext: () => void };

// 1. Watch one braking run.
export function IntroBrake({ index, total, onNext }: Nav) {
  const [playKey, setPlayKey] = useState(0);
  const [done, setDone] = useState(false);
  const u = 20;
  const running = playKey > 0 && !done;

  return (
    <Shell
      tag="Watch"
      index={index}
      total={total}
      title="Braking takes room"
      body={`A car brakes at a steady ${A} m/s².`}
      scene={<BrakingScene height={useSceneHeight(0.62)} u={u} playKey={playKey} range={60} xMax={5} yMax={24} onDone={() => setDone(true)} />}
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
    />
  );
}

// 2. Try different speeds and see why distance grows with v squared.
export function IntroSpeed({ index, total, onNext }: Nav) {
  const [u, setU] = useState(20);
  const [playKey, setPlayKey] = useState(0);
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const running = playKey > 0 && !done;
  const enough = history.length >= 2;

  // Compare the last two speeds tried: ratio r in speed gives r in time and in average speed, so r² in distance.
  const [lo, hi] = history.slice(-2).sort((x, y) => x - y);
  const r = enough ? Number((hi / lo).toFixed(2)) : 1;
  const label = running ? 'Braking…' : done ? (enough ? 'Next' : 'Pick another speed') : 'Brake';
  const note = !done
    ? null
    : enough
      ? `${r}× the speed gives ${r}× the stopping time and ${r}× the average speed, so ${Number((r * r).toFixed(2))}× the distance. s = u² ÷ 2a.`
      : `${u} m/s: ${stoppingTime(u, A)} s and ${stoppingDistance(u, A)} m.`;

  return (
    <Shell
      tag="Try it"
      index={index}
      total={total}
      title="Faster, much further"
      body="Pick a speed and brake. Try two."
      scene={<BrakingScene height={useSceneHeight(0.54)} u={u} playKey={playKey} range={180} xMax={9} yMax={48} history={history} onDone={() => setDone(true)} />}
      controls={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {INTRO_SPEEDS.map((s) => {
            const on = s === u;
            return (
              <Pressable
                key={s}
                disabled={running}
                accessibilityRole="button"
                accessibilityLabel={`${s} metres per second`}
                accessibilityState={{ selected: on }}
                onPress={() => {
                  tapHaptic();
                  setU(s);
                  setPlayKey(0);
                  setDone(false);
                }}
                style={{ flex: 1, minHeight: 56, borderRadius: 4, borderWidth: on ? 2.5 : 1.5, borderColor: on ? colors.ink : colors.line, backgroundColor: on ? '#EAF0FF' : colors.surface, alignItems: 'center', justifyContent: 'center', opacity: running && !on ? 0.5 : 1 }}
              >
                <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.ink, fontVariant: ['tabular-nums'] }}>{s}</Text>
                <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.inkMuted }}>m/s</Text>
              </Pressable>
            );
          })}
        </View>
      }
      footer={
        <Footer
          label={label}
          disabled={running || (done && !enough)}
          note={note}
          onPress={() => {
            tapHaptic();
            if (done) onNext();
            else {
              setHistory((h) => (h.includes(u) ? h : [...h, u]));
              setPlayKey((k) => k + 1);
            }
          }}
        />
      }
    />
  );
}

type Status = 'idle' | 'selected' | 'correct' | 'incorrect';

// 3. Short questions. The answer plays out in the scene only after a correct check.
export function QuestionStep({ q, index, total, onNext }: Nav & { q: Question }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [playKey, setPlayKey] = useState(0);
  const correct = status === 'correct';

  const optionState = (i: number) => {
    if (i !== selected) return 'idle';
    return status === 'correct' ? 'correct' : status === 'incorrect' ? 'wrong' : 'selected';
  };

  const onPress = () => {
    if (correct) return onNext();
    if (status === 'incorrect') {
      setSelected(null);
      setStatus('idle');
      return;
    }
    const ok = q.options[selected!].isCorrect;
    resultHaptic(ok);
    setStatus(ok ? 'correct' : 'incorrect');
    if (ok) setPlayKey(1);
  };

  return (
    <Shell
      tag="Predict"
      index={index}
      total={total}
      title={q.title}
      body={q.prompt}
      scene={<BrakingScene height={useSceneHeight()} u={correct ? q.caseU : null} playKey={playKey} {...q.scene} />}
      controls={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {q.options.map((o, i) => {
            const st = optionState(i);
            const border = st === 'correct' ? colors.correct : st === 'wrong' ? colors.incorrect : st === 'selected' ? colors.ink : colors.line;
            const bg = st === 'correct' ? '#E3F4EC' : st === 'wrong' ? '#FBE7E7' : st === 'selected' ? '#EAF0FF' : colors.surface;
            return (
              <OptionFrame
                key={i}
                wrong={st === 'wrong'}
                selected={st !== 'idle'}
                label={`${o.value} ${q.unit}`}
                onPress={() => {
                  if (correct) return;
                  tapHaptic();
                  setSelected(i);
                  setStatus('selected');
                }}
                style={{ minHeight: 72, borderRadius: 4, borderWidth: st === 'idle' ? 1.5 : 2.5, borderColor: border, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontFamily: fonts.display, fontSize: 26, color: colors.ink, fontVariant: ['tabular-nums'] }}>{o.value}</Text>
                <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.inkMuted }}>{q.unit}</Text>
                {st === 'correct' && <View style={{ position: 'absolute', top: 5, right: 5 }}><CheckIcon color={colors.correct} size={16} /></View>}
                {st === 'wrong' && <View style={{ position: 'absolute', top: 5, right: 5 }}><CrossIcon color={colors.incorrect} size={16} /></View>}
              </OptionFrame>
            );
          })}
        </View>
      }
      footer={
        <Footer
          label={correct ? 'Continue' : status === 'incorrect' ? 'Try again' : 'Check'}
          disabled={status === 'idle'}
          feedback={correct ? { ok: true, text: q.correctText } : status === 'incorrect' ? { ok: false, text: q.hint } : null}
          onPress={onPress}
        />
      }
    />
  );
}

export function DoneStep({ onRestart }: { onRestart: () => void }) {
  return (
    <Shell
      tag="Done"
      index={4}
      total={5}
      title="That is the idea"
      body="Stopping distance grows with the square of the speed: s = u² ÷ 2a."
      footer={<Footer label="Restart demo" onPress={onRestart} />}
    />
  );
}
