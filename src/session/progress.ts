// Progress over the whole course, as pure functions for the tabs (Home, Revise, Me): the next lesson, how far into it,
// the levels at a glance, the lesson stamps and the honest status of each point of the specification.
import { course } from '../content/course.ts';
import { lessons } from '../content/lessons.ts';
import { questionIds, type Lesson } from '../content/types.ts';
import { chapterOf, itemsOf, type Outcome, type Run } from './logic.ts';
import { dayNumber } from './streak.ts';

/** What is saved for one lesson: where the learner is, and whether it is finished now. */
export type Saved = { index: number; finished: boolean };

export const readyRefs = course.levels.flatMap((l) => l.lessons.map((r) => ({ r, levelId: l.id }))).filter((x) => x.r.ready && lessons[x.r.id]);

/** The next lesson to do: the first in course order that was never finished. Undefined when all are done. */
export function nextLessonId(finished: Set<string>): string | undefined {
  return readyRefs.find((x) => !finished.has(x.r.id))?.r.id;
}

/** Where a learner stands in a lesson: "Chapter 2 of 3 · ~6 min left" or not started. */
export function continueInfo(lesson: Lesson, saved: Saved | undefined): { started: boolean; chapter: number; chapters: number; minutesLeft: number } {
  const total = itemsOf(lesson).length;
  const index = saved && !saved.finished ? saved.index : 0;
  const chapter = chapterOf(lesson, Math.min(index, lesson.story.length - 1)) ?? lesson.chapters.length - 1;
  const left = Math.max(1, Math.round(lesson.minutes * (1 - index / total)));
  return { started: index > 0, chapter: chapter + 1, chapters: lesson.chapters.length, minutesLeft: left };
}

/** The line under the lesson's title on the Continue card. */
export function continueLine(lesson: Lesson, saved: Saved | undefined): string {
  const c = continueInfo(lesson, saved);
  return c.started ? `Chapter ${c.chapter} of ${c.chapters} · ~${c.minutesLeft} min left` : `Up next · ~${lesson.minutes} min`;
}

/** Each level with how many of its lessons are finished. */
export function levelCounts(finished: Set<string>): { levelId: string; title: string; done: number; total: number }[] {
  return course.levels.map((l) => {
    const ready = l.lessons.filter((r) => r.ready);
    return { levelId: l.id, title: l.title, done: ready.filter((r) => finished.has(r.id)).length, total: ready.length };
  });
}

/** "Good morning" 5–12 h, "Good afternoon" 12–18 h, "Good evening" otherwise. */
export function greeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** "Sunday, 22 November". */
export function longDate(d: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

/** One of the items, the same one all day long and another the next day. */
export function pickOfDay<T>(items: T[], today: string): T | undefined {
  if (items.length === 0) return undefined;
  return items[((dayNumber(today) % items.length) + items.length) % items.length];
}

// ── Stamps and the specification ────────────────────────────────────────────────────────────

export type Stamp = 'independent' | 'assisted' | 'revealed' | 'none';

/** The stamp a run earned: gold when every Skill check answer was right first time, grey when most were shown. */
export function stampOf(lessonId: string, run: Run | undefined): Stamp {
  const lesson = lessons[lessonId];
  if (!lesson || !run) return 'none';
  const outcomes = lesson.skillCheck.flatMap(questionIds).map((id) => run.outcomes[id]);
  if (outcomes.every((o) => o === 'independent')) return 'independent';
  return outcomes.filter((o) => o === 'revealed').length * 2 > outcomes.length ? 'revealed' : 'assisted';
}

export type SpecStatus = 'not-started' | 'learning' | 'secure';

/**
 * The honest status of a point of the specification. Secure: every lesson with the point is finished, its latest run
 * had the whole Skill check right first time, and the latest review of each of its questions (if any) was right.
 * Learning: at least one of its lessons is started or finished. Otherwise not started.
 */
export function specStatus(point: number, state: { finished: Set<string>; started: Set<string>; lastRuns: Record<string, Run | undefined>; lastReview: Record<string, Outcome | undefined> }): SpecStatus {
  const ids = readyRefs.filter((x) => x.r.spec.includes(point)).map((x) => x.r.id);
  if (ids.length === 0) return 'not-started';
  const secure = ids.every((id) => {
    if (!state.finished.has(id) || stampOf(id, state.lastRuns[id]) !== 'independent') return false;
    return Object.entries(state.lastReview).every(([key, o]) => !key.startsWith(`${id}/`) || o === 'independent');
  });
  if (secure) return 'secure';
  return ids.some((id) => state.finished.has(id) || state.started.has(id)) ? 'learning' : 'not-started';
}

// ── The 12 weeks of activity ───────────────────────────────────────────────────────────────

/**
 * 12 weeks of days as columns (Monday at the top, the current week last): each day says whether it had a lesson or a
 * review, and whether it is still to come. A month's short name heads the column where that month begins.
 */
export function weeksGrid(days: string[], today: string, weeks = 12): { month: string | null; cells: { key: string; done: boolean; future: boolean }[] }[] {
  const done = new Set(days);
  const t = dayNumber(today);
  const [y, m, d] = today.split('-').map(Number);
  const monday = (new Date(y, m - 1, d).getDay() + 6) % 7; // 0 = Monday
  const start = t - monday - 7 * (weeks - 1);
  const names = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  let lastMonth = -1;
  return Array.from({ length: weeks }, (_, w) => {
    const cells = Array.from({ length: 7 }, (_, i) => {
      const n = start + w * 7 + i;
      const date = new Date(n * 86_400_000);
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
      return { key, done: done.has(key), future: n > t };
    });
    const month = Number(cells[0].key.slice(5, 7)) - 1;
    const label = month !== lastMonth ? names[month] : null;
    lastMonth = month;
    return { month: label, cells };
  });
}

/** The level a point of the specification is listed under on the Me tab: the level of its first lesson. */
export function levelOfPoint(point: number): string {
  return readyRefs.find((x) => x.r.spec.includes(point))?.levelId ?? course.levels[0].id;
}
