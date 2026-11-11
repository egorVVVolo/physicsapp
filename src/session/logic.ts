// Pure session logic: which step is on screen, what each step's honest outcome is. No React.
import type { AccDir, MisconceptionId, Session, Step, StrobeStep } from '../content/types.ts';

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

/** Idea steps only teach: they have no answer, no outcome and are not counted. */
export const isQuestion = (step: Step): boolean => step.type !== 'idea';

export const questionCount = (session: Session): number => session.steps.filter(isQuestion).length;

/** Record a step's outcome. The retry step is practice: it never improves a "revealed". Idea steps are ignored. */
export function recordOutcome(s: SessionState, session: Session, outcome: Outcome): SessionState {
  const step = session.steps[s.index];
  if (!step || s.retry || !isQuestion(step)) return s;
  if (s.outcomes[step.id] !== undefined) return s; // the first honest outcome stays, even if the step is replayed after a resume
  return { ...s, outcomes: { ...s.outcomes, [step.id]: outcome } };
}

export function nextStep(s: SessionState, session: Session): SessionState {
  const step = session.steps[s.index];
  if (!step) return { ...s, finished: true };
  if (!s.retry && step.type === 'build' && step.retry && s.outcomes[step.id] === 'revealed') return { ...s, retry: true };
  const index = s.index + 1;
  return { ...s, index, retry: false, finished: index >= session.steps.length };
}

/** Counts the saved outcomes. Only question steps ever get one (see recordOutcome). */
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
    const ids = new Set(session.steps.filter(isQuestion).map((x) => x.id)); // an idea step never has an outcome
    const outcomesOk = st && typeof st.outcomes === 'object' && Object.entries(st.outcomes).every(([id, o]) => ids.has(id) && ['independent', 'assisted', 'revealed'].includes(o));
    if (p.v !== 1 || p.lessonId !== lessonId || p.sessionId !== session.id || !outcomesOk) return null;
    if (!Number.isInteger(st.index) || st.index < 0 || st.index > session.steps.length) return null;
    return { ...p, state: { index: st.index, retry: st.retry === true, outcomes: st.outcomes, finished: st.finished === true }, survey: p.survey ?? {} };
  } catch {
    return null;
  }
}

// ── Strobe step: one acceleration arrow per frozen frame ─────────────────────────────────

/** Right only if every frame has a pointing down. Otherwise name the most telling mistake. */
export function judgeStrobe(step: StrobeStep, answers: Record<string, AccDir>): { ok: boolean; text: string; misconception?: MisconceptionId } {
  if (step.frames.every((f) => answers[f.id] === 'down')) return { ok: true, text: step.feedback.right };
  if (answers.top === 'zero') return { ok: false, text: step.feedback.zeroTop, misconception: step.misconceptions.zeroTop };
  if (answers.rise === 'up') return { ok: false, text: step.feedback.followsMotion, misconception: step.misconceptions.followsMotion };
  return { ok: false, text: step.feedback.other };
}
