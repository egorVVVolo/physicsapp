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
  wrong: Record<string, string[]>; // question id → option ids picked wrongly, in order
  activeMs: number; // time on screens, each gap capped at 3 minutes
  lastAt: number | null; // when the last screen was opened
};

export const startState: LessonState = { index: 0, outcomes: {}, picks: {}, finished: false, wrong: {}, activeMs: 0, lastAt: null };

/** Longest stretch on one screen that still counts as working (longer means the learner was away). */
export const MAX_GAP_MS = 180_000;

/** The first outcome of a question stays, even if it is replayed after a resume. */
export function recordOutcome(s: LessonState, id: string, outcome: Outcome): LessonState {
  if (s.outcomes[id] !== undefined) return s;
  return { ...s, outcomes: { ...s.outcomes, [id]: outcome } };
}

export function recordPick(s: LessonState, predictId: string, optionId: string): LessonState {
  return { ...s, picks: { ...s.picks, [predictId]: optionId } };
}

export function recordWrong(s: LessonState, questionId: string, optionId: string): LessonState {
  return { ...s, wrong: { ...s.wrong, [questionId]: [...(s.wrong[questionId] ?? []), optionId] } };
}

/** Counts the time since the last screen was opened (at most MAX_GAP_MS) and starts timing from now. */
export function tick(s: LessonState, now: number): LessonState {
  const gap = s.lastAt === null ? 0 : Math.min(Math.max(0, now - s.lastAt), MAX_GAP_MS);
  return { ...s, activeMs: s.activeMs + gap, lastAt: now };
}

export function next(s: LessonState, lesson: Lesson, now = Date.now()): LessonState {
  const index = s.index + 1;
  return { ...tick(s, now), index, finished: index >= itemsOf(lesson).length };
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

// ── A finished run ───────────────────────────────────────────────────────────────────────

/** One finished pass through a lesson, kept for the lesson-end breakdown and for review. */
export type Run = {
  at: number;
  ms: number;
  outcomes: Record<string, Outcome>;
  wrong: Record<string, string[]>;
  /** The lesson's first prediction: what was picked and whether the puzzle bore it out. */
  prediction: { id: string; pick: string; right: boolean } | null;
  feel: 'easy' | 'right' | 'hard' | null;
};

export function runOf(lesson: Lesson, s: LessonState, now: number): Run {
  const predict = lesson.story.find((x) => x.kind === 'predict');
  const pick = predict ? s.picks[predict.id] : undefined;
  return {
    at: now,
    ms: s.activeMs,
    outcomes: s.outcomes,
    wrong: s.wrong,
    prediction: predict && pick ? { id: predict.id, pick, right: predict.options.some((o) => o.id === pick && o.correct === true) } : null,
    feel: null,
  };
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
    // saves from before the run record have no wrong / activeMs / lastAt: start those afresh
    const wrongOk = st.wrong && typeof st.wrong === 'object' && Object.values(st.wrong).every((v) => Array.isArray(v) && v.every((x) => typeof x === 'string'));
    const state: LessonState = {
      index: st.index,
      outcomes: st.outcomes,
      picks: st.picks,
      finished: st.finished === true,
      wrong: wrongOk ? st.wrong : {},
      activeMs: Number.isFinite(st.activeMs) && st.activeMs >= 0 ? st.activeMs : 0,
      lastAt: Number.isFinite(st.lastAt) ? st.lastAt : null,
    };
    return { ...p, state };
  } catch {
    return null;
  }
}
