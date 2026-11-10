// Session player: one step on screen at a time, progress saved on the device after every step.
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { l4 } from '@/content/l4';
import { currentStep, nextStep, recordOutcome, startState, type Outcome, type SessionState, type Survey } from '@/session/logic';
import { loadProgress, saveProgress } from '@/session/storage';
import { BuildStepView } from '@/steps/BuildStepView';
import { PredictStepView } from '@/steps/PredictStepView';
import { SpotErrorStepView } from '@/steps/SpotErrorStepView';
import { WrapUp } from '@/steps/WrapUp';
import { useTheme } from '@/theme/ThemeContext';
import { touch } from '@/theme/tokens';

const lesson = l4;
const session = lesson.sessions[0];

export default function SessionPlayer() {
  const { palette: p } = useTheme();
  const router = useRouter();
  const [state, setState] = useState<SessionState | null>(null); // null while saved progress loads
  const [survey, setSurvey] = useState<Survey>({});

  useEffect(() => {
    let alive = true;
    loadProgress(lesson.id, session).then((saved) => {
      if (!alive) return;
      setState(saved?.state ?? startState);
      setSurvey(saved?.survey ?? {});
    });
    return () => {
      alive = false;
    };
  }, []);

  function update(next: SessionState, nextSurvey: Survey = survey) {
    setState(next);
    setSurvey(nextSurvey);
    saveProgress(lesson.id, session.id, next, nextSurvey);
  }
  const close = () => router.replace('/');

  if (!state) return <SafeAreaView style={[styles.screen, { backgroundColor: p.bg }]} />;

  const step = currentStep(state, session);
  const isLast = state.index === session.steps.length - 1 && !(step?.type === 'build' && step.retry && state.outcomes[step.id] === 'revealed');
  const common = {
    isLast,
    onDone: (outcome: Outcome) => update(recordOutcome(state, session, outcome)),
    onNext: () => update(nextStep(state, session)),
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: p.bg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close the session" onPress={close} style={styles.close} hitSlop={6}>
          <Text style={[styles.closeText, { color: p.ink }]}>✕</Text>
        </Pressable>
        <View
          style={styles.progress}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={step ? `Step ${state.index + 1} of ${session.steps.length}` : 'Session complete'}
        >
          {session.steps.map((st, i) => {
            const isDone = state.outcomes[st.id] !== undefined && (i < state.index || state.finished);
            const current = i === state.index && !state.finished;
            return <View key={st.id} style={[styles.segment, { backgroundColor: isDone ? p.ink : current ? p.primary : p.line, height: current ? 8 : 4 }]} />;
          })}
        </View>
        <Text style={[styles.counter, { color: p.muted }]}>{Math.min(state.index + 1, session.steps.length)}/{session.steps.length}</Text>
      </View>

      {step === null ? (
        <WrapUp session={session} state={state} survey={survey} onSurvey={(s) => update(state, s)} onClose={close} />
      ) : step.type === 'predict' ? (
        <PredictStepView key={step.id} step={step} {...common} />
      ) : step.type === 'build' ? (
        <BuildStepView key={step.id} step={step} {...common} />
      ) : (
        <SpotErrorStepView key={step.id} step={step} {...common} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 16, paddingBottom: 8, gap: 4 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, height: touch },
  close: { width: touch, height: touch, marginLeft: -12, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 20, fontWeight: '600' },
  progress: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  segment: { flex: 1, borderRadius: 4 },
  counter: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
