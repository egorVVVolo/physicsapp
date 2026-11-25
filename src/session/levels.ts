// A level is done when every lesson of it has been finished. Pure: what the Level complete screen shows.
import { course } from '../content/course.ts';
import { lessons } from '../content/lessons.ts';
import { questionIds } from '../content/types.ts';
import type { Run } from './logic.ts';

export type LevelFinish = {
  levelId: string;
  title: string;
  /** 1-based, as on the map ("LEVEL 2"). */
  number: number;
  /** How many lessons the level has, and in how many the Skill check was all right first time (the gold stamp). */
  lessons: number;
  gold: number;
  /** The level after it, and the lesson that opens it; null for the last level. */
  next: { levelId: string; title: string; firstLessonId: string } | null;
};

/** The gold stamp: every Skill check answer of the run was right on the first try. */
export function isGold(lessonId: string, run: Run | undefined): boolean {
  const lesson = lessons[lessonId];
  if (!lesson || !run) return false;
  return lesson.skillCheck.flatMap(questionIds).every((id) => run.outcomes[id] === 'independent');
}

/**
 * Just finished `lessonId`: if that completes its level for the first time, what to celebrate; otherwise null.
 * `finished`: lessons finished at least once (including this one); `shown`: levels already celebrated;
 * `lastRuns`: the latest run of each lesson of the level.
 */
export function levelFinishOf(lessonId: string, finished: Set<string>, shown: Set<string>, lastRuns: Record<string, Run | undefined>): LevelFinish | null {
  const at = course.levels.findIndex((lv) => lv.lessons.some((x) => x.id === lessonId));
  if (at < 0) return null;
  const level = course.levels[at];
  if (shown.has(level.id)) return null;
  const ready = level.lessons.filter((x) => x.ready);
  if (ready.length === 0 || !ready.every((x) => finished.has(x.id))) return null;
  const after = course.levels[at + 1];
  const first = after?.lessons.find((x) => x.ready && lessons[x.id]);
  return {
    levelId: level.id,
    title: level.title,
    number: at + 1,
    lessons: ready.length,
    gold: ready.filter((x) => isGold(x.id, lastRuns[x.id])).length,
    next: after && first ? { levelId: after.id, title: after.title, firstLessonId: first.id } : null,
  };
}
