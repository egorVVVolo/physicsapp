// The lesson-end breakdown, as pure functions: the ribbon of questions, what tripped you up, the prediction, the
// numbers in the table. No React. Everything is counted from what the learner really did (LessonState).
import { isQuestion, type ExamPart, type Lesson, type Screen } from '../content/types.ts';
import { chapterOf, screenOutcome, type LessonState, type Outcome } from './logic.ts';

/** What a wrong pick was, in words, and the hint the lesson gave for it (if it has one of its own). */
export type Picked = { text: string; hint?: string };

/** One graded question, story or Skill check; an exam-style card gives one entry per part. */
export type Entry = {
  id: string;
  phase: 'story' | 'check';
  /** The chapter of a story question (0, 1, 2); null in the Skill check. */
  chapter: number | null;
  prompt: string;
  why: string;
  /** Turns an id kept in `wrong` into words. */
  picked: (wrongId: string) => Picked;
};

const optionPick = (options: { id: string; label: string; hint?: string }[]) => (id: string): Picked => {
  const o = options.find((x) => x.id === id);
  return o ? { text: o.label, hint: o.hint } : { text: id };
};

function pickerOf(s: Screen): (id: string) => Picked {
  switch (s.kind) {
    case 'choice':
    case 'tapFig':
      return optionPick(s.options);
    case 'build':
      return optionPick([...(s.choose?.options ?? []), ...s.chips]);
    case 'order':
      return (id) => ({ text: s.steps.find((x) => x.id === id)?.text ?? id, hint: s.hint });
    case 'spotError':
      return (id) => {
        const l = s.lines.find((x) => x.id === id);
        return l ? { text: l.text, hint: l.hint } : { text: id };
      };
    case 'sort':
      return (id) => {
        const it = s.items.find((x) => x.id === id);
        return it ? { text: it.label, hint: it.hint } : { text: id };
      };
    case 'graphPick':
      return (id) => ({ text: `Graph ${id}`, hint: s.graphs.find((g) => g.id === id)?.hint });
    case 'estimate':
      return (id) => ({ text: `${id} ${s.scale.unit}` });
    default:
      return (id) => ({ text: id });
  }
}

function partPicker(part: ExamPart): (id: string) => Picked {
  if (part.kind === 'choice') return optionPick(part.options);
  if (part.kind === 'build') return optionPick(part.build.chips);
  return (id) => ({ text: part.steps.find((x) => x.id === id)?.text ?? id });
}

/** Every graded question of the lesson in the order it is met: the story first, then the Skill check. */
export function entriesOf(lesson: Lesson): Entry[] {
  const out: Entry[] = [];
  const add = (s: Screen, phase: 'story' | 'check', chapter: number | null) => {
    if (s.kind === 'examCard') {
      for (const part of s.parts) {
        out.push({ id: `${s.id}.${part.id}`, phase, chapter, prompt: `${part.command} ${part.text}`, why: part.why, picked: partPicker(part) });
      }
    } else if (isQuestion(s)) {
      out.push({ id: s.id, phase, chapter, prompt: s.prompt, why: s.why, picked: pickerOf(s) });
    }
  };
  lesson.story.forEach((s, i) => add(s, 'story', chapterOf(lesson, i)));
  lesson.skillCheck.forEach((s) => add(s, 'check', null));
  return out;
}

/** The outcome kept for a question; a question somehow left unanswered counts as shown. */
const outcomeFor = (state: LessonState, id: string): Outcome => state.outcomes[id] ?? 'revealed';

/** The ribbon: a group of squares per chapter that has questions, then the Skill check. */
export type Ribbon = { groups: { label: string; cells: { id: string; outcome: Outcome }[] }[]; counts: Record<Outcome, number> };

export function ribbonOf(lesson: Lesson, state: LessonState): Ribbon {
  const entries = entriesOf(lesson);
  const counts: Record<Outcome, number> = { independent: 0, assisted: 0, revealed: 0 };
  const groups: Ribbon['groups'] = [];
  const keys = [...lesson.chapters.map((c, i) => ({ chapter: i, label: c.title.toUpperCase() })), { chapter: null, label: 'SKILL CHECK' }];
  for (const key of keys) {
    const cells = entries
      .filter((e) => (key.chapter === null ? e.phase === 'check' : e.phase === 'story' && e.chapter === key.chapter))
      .map((e) => ({ id: e.id, outcome: outcomeFor(state, e.id) }));
    for (const cell of cells) counts[cell.outcome] += 1;
    if (cells.length > 0) groups.push({ label: key.label, cells });
  }
  return { groups, counts };
}

/** The ribbon in words, for a screen reader: "9 on your own, 2 after a hint, 1 shown". */
export const ribbonLabel = (c: Record<Outcome, number>): string => `${c.independent} on your own, ${c.assisted} after a hint, ${c.revealed} shown`;

/** "9/12": the questions answered right first time, out of all of them. */
export const onYourOwn = (c: Record<Outcome, number>): string => `${c.independent}/${c.independent + c.assisted + c.revealed}`;

/** The time on screens in whole minutes, at least one. */
export const minutesOf = (ms: number): number => Math.max(1, Math.round(ms / 60000));

/** Cuts a question to `n` characters at a word, adding an ellipsis. */
export function shorten(text: string, n = 80): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n - 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > n * 0.6 ? cut.slice(0, space) : cut).replace(/[,;:.\s]+$/, '')}…`;
}

/** A question that was not right first time, with what was picked and why it was wrong. */
export type Tripped = { id: string; prompt: string; picked: string | null; note: string };

export function trippedUp(lesson: Lesson, state: LessonState): Tripped[] {
  const out: Tripped[] = [];
  for (const e of entriesOf(lesson)) {
    if (outcomeFor(state, e.id) === 'independent') continue;
    const first = state.wrong[e.id]?.[0];
    const p = first === undefined ? null : e.picked(first);
    out.push({ id: e.id, prompt: shorten(e.prompt), picked: p ? shorten(p.text, 90) : null, note: p?.hint ?? e.why });
  }
  return out;
}

/** The lesson's first prediction: what was said, what the puzzle showed, whether the guess was right. */
export function predictionOf(lesson: Lesson, state: LessonState): { you: string; was: string; right: boolean } | null {
  const predict = lesson.story.find((s) => s.kind === 'predict');
  if (!predict || predict.kind !== 'predict') return null;
  const pick = predict.options.find((o) => o.id === state.picks[predict.id]);
  const correct = predict.options.find((o) => o.correct);
  if (!pick || !correct) return null;
  return { you: pick.label, was: correct.label, right: pick.correct === true };
}

/**
 * The table's prediction cell: ✓ when the guess was right; ✗ then ✓ when it was wrong but the puzzle
 * (the first question of the last chapter) was solved in the end; ✗ ✗ when it was not.
 */
export function predictionMarks(lesson: Lesson, state: LessonState): boolean[] | null {
  const prediction = predictionOf(lesson, state);
  if (!prediction) return null;
  if (prediction.right) return [true];
  const revisit = lesson.story.find((s) => s.id === lesson.chapters[2]?.from);
  const outcome = revisit ? screenOutcome(state, revisit) : undefined;
  return [false, outcome !== undefined && outcome !== 'revealed'];
}

/** "These 3 questions come back tomorrow." (the queue itself comes with the Revise tab). */
export function reviewLine(n: number): string {
  if (n === 0) return 'Nothing to review: every answer was right first time.';
  return n === 1 ? 'This question comes back tomorrow.' : `These ${n} questions come back tomorrow.`;
}

/** The stamp on the celebration: gold for all-right Skill check, grey when more than half of it was shown. */
export function stampKind(lesson: Lesson, state: LessonState): 'independent' | 'assisted' | 'revealed' {
  const outcomes = lesson.skillCheck.map((q) => screenOutcome(state, q));
  if (outcomes.every((o) => o === 'independent')) return 'independent';
  return outcomes.filter((o) => o === 'revealed').length * 2 > outcomes.length ? 'revealed' : 'assisted';
}
