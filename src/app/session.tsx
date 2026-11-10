// Session player: one step on screen at a time, progress saved on the device after every step.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { l4 } from '@/content/l4';
import { currentStep, nextStep, recordOutcome, startState, type Outcome, type SessionState, type Survey } from '@/session/logic';
import { loadProgress, saveProgress } from '@/session/storage';
import { BuildStepView } from '@/steps/BuildStepView';
import { IdeaStepView } from '@/steps/IdeaStepView';
import { PredictStepView } from '@/steps/PredictStepView';
import { SpotErrorStepView } from '@/steps/SpotErrorStepView';
import { WrapUp } from '@/steps/WrapUp';
import { useTheme } from '@/theme/ThemeContext';

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

  if (!state) return <View style={{ flex: 1, backgroundColor: p.stage }} />;

  const step = currentStep(state, session);
  const isLast = state.index === session.steps.length - 1 && !(step?.type === 'build' && step.retry && state.outcomes[step.id] === 'revealed');
  const common = {
    isLast,
    progress: { index: state.index, total: session.steps.length, onClose: close },
    onDone: (outcome: Outcome) => update(recordOutcome(state, session, outcome)),
    onNext: () => update(nextStep(state, session)),
  };

  // the wrap-up draws its own header; every step screen draws its own (progress is passed down)
  if (step === null) return <WrapUp session={session} state={state} survey={survey} onSurvey={(s) => update(state, s)} onClose={close} />;
  return step.type === 'idea' ? (
    <IdeaStepView key={step.id} step={step} {...common} />
  ) : step.type === 'predict' ? (
    <PredictStepView key={step.id} step={step} {...common} />
  ) : step.type === 'build' ? (
    <BuildStepView key={step.id} step={step} {...common} />
  ) : (
    <SpotErrorStepView key={step.id} step={step} {...common} />
  );
}
