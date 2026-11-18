// All lessons that can be played, by id. The course map (course.ts) lists the rest as "Soon".
import { drawingTheForces } from './drawing-the-forces.ts';
import { forceAndAcceleration } from './force-and-acceleration.ts';
import { fallingThroughAir } from './falling-through-air.ts';
import { momentumLesson } from './momentum.ts';
import { normalReaction } from './normal-reaction.ts';
import { pickingTheEquation } from './picking-the-equation.ts';
import { readingMotionGraphs } from './reading-motion-graphs.ts';
import { splittingAVector } from './splitting-a-vector.ts';
import { twoMotionsAtOnce } from './two-motions-at-once.ts';
import { upStopDown } from './up-stop-down.ts';
import { whichWayIsPositive } from './which-way-is-positive.ts';
import type { Lesson } from './types.ts';

export const lessons: Record<string, Lesson> = {
  [whichWayIsPositive.id]: whichWayIsPositive,
  [readingMotionGraphs.id]: readingMotionGraphs,
  [pickingTheEquation.id]: pickingTheEquation,
  [upStopDown.id]: upStopDown,
  [splittingAVector.id]: splittingAVector,
  [twoMotionsAtOnce.id]: twoMotionsAtOnce,
  [drawingTheForces.id]: drawingTheForces,
  [forceAndAcceleration.id]: forceAndAcceleration,
  [normalReaction.id]: normalReaction,
  [fallingThroughAir.id]: fallingThroughAir,
  [momentumLesson.id]: momentumLesson,
};
