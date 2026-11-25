// The question bank: every graded question of the finished lessons that makes sense on its own, without the story.
// Left out: the question that solves the lesson's puzzle ("Back to the …" needs the story), estimates (one slider,
// a feel for size), and exam-style cards (only in the mock set, whole).
import { lessons } from '../content/lessons.ts';
import { isQuestion, type ExamCardScreen, type Question } from '../content/types.ts';
import { puzzleQuestionId } from '../session/puzzle.ts';

/** One question in practice. `key` is 'lessonId/screenId'. */
export type Item = { key: string; lessonId: string; screen: Question };

export function bankOf(lessonIds: Iterable<string>): Item[] {
  const out: Item[] = [];
  for (const lessonId of lessonIds) {
    const lesson = lessons[lessonId];
    if (!lesson) continue;
    const puzzle = puzzleQuestionId(lesson);
    for (const s of [...lesson.story, ...lesson.skillCheck]) {
      if (!isQuestion(s) || s.id === puzzle || s.kind === 'estimate' || (s.kind === 'choice' && s.revisitOf)) continue;
      out.push({ key: `${lessonId}/${s.id}`, lessonId, screen: s });
    }
  }
  return out;
}

/** The exam-style cards of the finished lessons, for the end of a mock set. */
export function examCardsOf(lessonIds: Iterable<string>): { key: string; lessonId: string; screen: ExamCardScreen }[] {
  const out: { key: string; lessonId: string; screen: ExamCardScreen }[] = [];
  for (const lessonId of lessonIds) {
    for (const s of lessons[lessonId]?.skillCheck ?? []) if (s.kind === 'examCard') out.push({ key: `${lessonId}/${s.id}`, lessonId, screen: s });
  }
  return out;
}
