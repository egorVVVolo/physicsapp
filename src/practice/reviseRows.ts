// What the Revise tab lists, as pure functions: each level's practice (open once a lesson of it is finished),
// the mistakes, the mock set (after three lessons) and the notebook count.
import { course } from '../content/course.ts';
import { bankOf } from './bank.ts';
import { mistakes, nextDue, type Queue } from './review.ts';

export const LEVEL_SET = 6; // questions in a level's practice
export const MOCK_SET = 10;
export const MOCK_AFTER = 3; // finished lessons before the mock set opens

export type LevelRow = { levelId: string; title: string; open: boolean; questions: number; lessonsDone: number };

export function levelRows(finished: Set<string>): LevelRow[] {
  return course.levels.map((l) => {
    const done = l.lessons.filter((r) => r.ready && finished.has(r.id)).map((r) => r.id);
    return { levelId: l.id, title: l.title, open: done.length > 0, questions: Math.min(LEVEL_SET, bankOf(done).length), lessonsDone: done.length };
  });
}

/** "6 questions · 2 lessons done" or "Finish a lesson in Motion first". */
export function levelLine(r: LevelRow): string {
  if (!r.open) return `Finish a lesson in ${r.title} first`;
  return `${r.questions} questions · ${r.lessonsDone} ${r.lessonsDone === 1 ? 'lesson' : 'lessons'} done`;
}

export function mistakeCount(queue: Queue, finished: Set<string>): number {
  return mistakes(queue, bankOf(finished), 99).length;
}

/** How many questions are due on the next review day after `today`, and which day. */
export function nextReview(queue: Queue, today: string): { day: string; count: number } | null {
  const day = nextDue(queue, today);
  return day ? { day, count: Object.values(queue).filter((e) => e.due === day).length } : null;
}
