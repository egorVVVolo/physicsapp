// Pure lesson logic: which screen is on, the honest outcome of each question, what is saved. No React.
import { isQuestion, type Fig, type Lesson, type Screen } from '../content/types.ts';

/** independent: right first time · assisted: right after a hint · revealed: the answer was shown. */
export type Outcome = 'independent' | 'assisted' | 'revealed';

/** Story questions allow one more try after a hint; the second miss shows the answer. */
export const STORY_TRIES = 2;

export function outcomeOf(wrong: number, phase: Phase): Outcome {
  if (wrong === 0) return 'independent';
  if (phase === 'check' || wrong >= STORY_TRIES) return 'revealed';
  return 'assisted';
}

export type Phase = 'story' | 'check';

/** What the player shows, in order: the story, the "Skill check" splash, the Skill check questions. */
export type Item = { kind: 'screen'; screen: Screen; phase: Phase } | { kind: 'checkIntro' };

export function itemsOf(lesson: Lesson): Item[] {
  return [
    ...lesson.story.map((screen) => ({ kind: 'screen' as const, screen, phase: 'story' as const })),
    { kind: 'checkIntro' },
    ...lesson.skillCheck.map((screen) => ({ kind: 'screen' as const, screen, phase: 'check' as const })),
  ];
}

/** The figure an item shows, if any (the Skill check splash shows none). */
export function figOf(item: Item | undefined): Fig | undefined {
  return item?.kind === 'screen' && 'fig' in item.screen ? item.screen.fig : undefined;
}

/**
 * FIG numbers, in order of appearance. Neighbouring screens with the same kind of figure show one figure
 * changing state (its sheet stays in place), so they keep one number. `count` is the last number used.
 */
export function figNumbers(lesson: Lesson): { of: Record<string, number>; count: number } {
  const of: Record<string, number> = {};
  let n = 0;
  let last: Fig['kind'] | undefined;
  for (const item of itemsOf(lesson)) {
    const fig = figOf(item);
    if (fig && fig.kind !== last) n += 1;
    if (fig && item.kind === 'screen') of[item.screen.id] = n;
    last = fig?.kind;
  }
  return { of, count: n };
}

export type LessonState = {
  index: number; // position in itemsOf(lesson)
  outcomes: Record<string, Outcome>; // question id → first honest outcome
  picks: Record<string, string>; // predict screen id → the option the learner picked
  finished: boolean;
};

export const startState: LessonState = { index: 0, outcomes: {}, picks: {}, finished: false };

/** The first outcome of a question stays, even if it is replayed after a resume. */
export function recordOutcome(s: LessonState, id: string, outcome: Outcome): LessonState {
  if (s.outcomes[id] !== undefined) return s;
  return { ...s, outcomes: { ...s.outcomes, [id]: outcome } };
}

export function recordPick(s: LessonState, predictId: string, optionId: string): LessonState {
  return { ...s, picks: { ...s.picks, [predictId]: optionId } };
}

export function next(s: LessonState, lesson: Lesson): LessonState {
  const index = s.index + 1;
  return { ...s, index, finished: index >= itemsOf(lesson).length };
}

export function countOutcomes(s: LessonState): Record<Outcome, number> {
  const n = { independent: 0, assisted: 0, revealed: 0 };
  for (const o of Object.values(s.outcomes)) n[o] += 1;
  return n;
}

/** Progress bar: share of the story done, and how many Skill check questions are answered. */
export function progressOf(s: LessonState, lesson: Lesson): { story: number; checkDone: number; checkTotal: number } {
  const n = lesson.story.length;
  const story = Math.min(1, s.index / n);
  const checkDone = lesson.skillCheck.filter((q) => s.outcomes[q.id] !== undefined).length;
  return { story, checkDone, checkTotal: lesson.skillCheck.length };
}

// ── What is saved on the device ──────────────────────────────────────────────────────────

export type SavedProgress = { v: 2; lessonId: string; state: LessonState; updatedAt: number };

/** Read saved progress; anything unexpected (old version, changed content) means "start from the beginning". */
export function parseProgress(json: string | null, lesson: Lesson): SavedProgress | null {
  if (!json) return null;
  try {
    const p = JSON.parse(json) as SavedProgress;
    const st = p.state;
    const all = [...lesson.story, ...lesson.skillCheck];
    const questions = new Set(all.filter(isQuestion).map((q) => q.id));
    const predicts = new Set(all.filter((x) => x.kind === 'predict').map((x) => x.id));
    if (p.v !== 2 || p.lessonId !== lesson.id || !st || typeof st.outcomes !== 'object' || typeof st.picks !== 'object') return null;
    const outcomesOk = Object.entries(st.outcomes).every(([id, o]) => questions.has(id) && ['independent', 'assisted', 'revealed'].includes(o));
    const picksOk = Object.keys(st.picks).every((id) => predicts.has(id));
    const total = itemsOf(lesson).length;
    if (!outcomesOk || !picksOk || !Number.isInteger(st.index) || st.index < 0 || st.index > total) return null;
    return { ...p, state: { index: st.index, outcomes: st.outcomes, picks: st.picks, finished: st.finished === true } };
  } catch {
    return null;
  }
}
