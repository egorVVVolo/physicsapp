// Pure session logic: which step is on screen, what each step's honest outcome is. No React.
import type { Session, Step } from '../content/types.ts';

/** independent: first try, no help · assisted: needed help or a second try · revealed: the answer was shown. */
export type Outcome = 'independent' | 'assisted' | 'revealed';

/** Outcome of a step with help levels, from the number of wrong attempts (the third one reveals). */
export function laddered(wrong: number): Outcome {
  return wrong === 0 ? 'independent' : wrong >= 3 ? 'revealed' : 'assisted';
}

export type SessionState = {
  index: number; // position in session.steps
  retry: boolean; // showing the "same problem, new values" step after a reveal
  outcomes: Record<string, Outcome>;
  finished: boolean;
};

export const startState: SessionState = { index: 0, retry: false, outcomes: {}, finished: false };

export function currentStep(s: SessionState, session: Session): Step | null {
  const step = session.steps[s.index];
  if (!step || s.finished) return null;
  return s.retry && step.type === 'build' && step.retry ? step.retry : step;
}

/** Record a step's outcome. The retry step is practice: it never improves a "revealed". */
export function recordOutcome(s: SessionState, session: Session, outcome: Outcome): SessionState {
  const step = session.steps[s.index];
  if (!step || s.retry) return s;
  return { ...s, outcomes: { ...s.outcomes, [step.id]: outcome } };
}

export function nextStep(s: SessionState, session: Session): SessionState {
  const step = session.steps[s.index];
  if (!step) return { ...s, finished: true };
  if (!s.retry && step.type === 'build' && step.retry && s.outcomes[step.id] === 'revealed') return { ...s, retry: true };
  const index = s.index + 1;
  return { ...s, index, retry: false, finished: index >= session.steps.length };
}

export function countOutcomes(s: SessionState): Record<Outcome, number> {
  const n = { independent: 0, assisted: 0, revealed: 0 };
  for (const o of Object.values(s.outcomes)) n[o] += 1;
  return n;
}

/** "Done on your own" only if every exam-format step was answered first time. */
export function onYourOwn(s: SessionState, session: Session): boolean {
  const exams = session.steps.filter((st) => st.type === 'build' && st.exam);
  return exams.length > 0 && exams.every((st) => s.outcomes[st.id] === 'independent');
}

// ── What is saved on the device ──────────────────────────────────────────────────────────

export type Survey = { difficulty?: string; wouldUse?: string };
export type SavedProgress = { v: 1; lessonId: string; sessionId: string; state: SessionState; survey: Survey; updatedAt: number };

/** Read saved progress; anything unexpected (old version, other content) means "start from the beginning". */
export function parseProgress(json: string | null, lessonId: string, session: Session): SavedProgress | null {
  if (!json) return null;
  try {
    const p = JSON.parse(json) as SavedProgress;
    const st = p.state;
    const ids = new Set(session.steps.map((x) => x.id));
    const outcomesOk = st && typeof st.outcomes === 'object' && Object.entries(st.outcomes).every(([id, o]) => ids.has(id) && ['independent', 'assisted', 'revealed'].includes(o));
    if (p.v !== 1 || p.lessonId !== lessonId || p.sessionId !== session.id || !outcomesOk) return null;
    if (!Number.isInteger(st.index) || st.index < 0 || st.index > session.steps.length) return null;
    return { ...p, state: { index: st.index, retry: st.retry === true, outcomes: st.outcomes, finished: st.finished === true }, survey: p.survey ?? {} };
  } catch {
    return null;
  }
}
