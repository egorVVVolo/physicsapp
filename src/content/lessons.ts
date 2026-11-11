// All lessons that can be played, by id. The course map (course.ts) lists the rest as "Soon".
import { normalReaction } from './normal-reaction.ts';
import type { Lesson } from './types.ts';

export const lessons: Record<string, Lesson> = {
  [normalReaction.id]: normalReaction,
};
