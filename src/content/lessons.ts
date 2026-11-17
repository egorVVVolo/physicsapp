// All lessons that can be played, by id. The course map (course.ts) lists the rest as "Soon".
import { normalReaction } from './normal-reaction.ts';
import { pickingTheEquation } from './picking-the-equation.ts';
import { readingMotionGraphs } from './reading-motion-graphs.ts';
import { upStopDown } from './up-stop-down.ts';
import { whichWayIsPositive } from './which-way-is-positive.ts';
import type { Lesson } from './types.ts';

export const lessons: Record<string, Lesson> = {
  [whichWayIsPositive.id]: whichWayIsPositive,
  [readingMotionGraphs.id]: readingMotionGraphs,
  [pickingTheEquation.id]: pickingTheEquation,
  [upStopDown.id]: upStopDown,
  [normalReaction.id]: normalReaction,
};
