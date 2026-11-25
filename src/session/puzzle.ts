// The puzzle's answer moment: which question of a lesson solves the puzzle posed at the start. It is the first graded
// question of the last chapter ("Back to the …"); some lessons open that chapter with a text screen or a slider first.
import { isQuestion, type Lesson } from '../content/types.ts';

/** The id of the question that solves the lesson's puzzle, or undefined for a lesson without chapters. */
export function puzzleQuestionId(lesson: Lesson): string | undefined {
  const from = lesson.story.findIndex((s) => s.id === lesson.chapters[2]?.from);
  if (from < 0) return undefined;
  return lesson.story.slice(from).find(isQuestion)?.id;
}
