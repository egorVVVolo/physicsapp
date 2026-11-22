// All lessons that can be played, by id. The course map (course.ts) lists the rest as "Soon".
// Every string passes through keepUnitsIn, so a number never parts from its unit at a line end (units.ts).
import { collisions } from './collisions.ts';
import { densityAndUpthrust } from './density-and-upthrust.ts';
import { drawingTheForces } from './drawing-the-forces.ts';
import { forceAndAcceleration } from './force-and-acceleration.ts';
import { fallingThroughAir } from './falling-through-air.ts';
import { hookesLaw } from './hookes-law.ts';
import { keepingBalance } from './keeping-balance.ts';
import { kineticAndPotentialEnergy } from './kinetic-and-potential-energy.ts';
import { momentumLesson } from './momentum.ts';
import { normalReaction } from './normal-reaction.ts';
import { powerAndEfficiency } from './power-and-efficiency.ts';
import { pickingTheEquation } from './picking-the-equation.ts';
import { readingMotionGraphs } from './reading-motion-graphs.ts';
import { stressStrainYoung } from './stress-strain-young.ts';
import { readingMaterialGraphs } from './reading-material-graphs.ts';
import { elasticStrainEnergy } from './elastic-strain-energy.ts';
import { splittingAVector } from './splitting-a-vector.ts';
import { turningForces } from './turning-forces.ts';
import { twoMotionsAtOnce } from './two-motions-at-once.ts';
import { upStopDown } from './up-stop-down.ts';
import { viscousDrag } from './viscous-drag.ts';
import { whichWayIsPositive } from './which-way-is-positive.ts';
import { whereTheEnergyGoes } from './where-the-energy-goes.ts';
import { workDoneLesson } from './work-done.ts';
import type { Lesson } from './types.ts';
import { keepUnitsIn } from './units.ts';

export const lessons: Record<string, Lesson> = {
  [whichWayIsPositive.id]: keepUnitsIn(whichWayIsPositive),
  [readingMotionGraphs.id]: keepUnitsIn(readingMotionGraphs),
  [pickingTheEquation.id]: keepUnitsIn(pickingTheEquation),
  [upStopDown.id]: keepUnitsIn(upStopDown),
  [splittingAVector.id]: keepUnitsIn(splittingAVector),
  [twoMotionsAtOnce.id]: keepUnitsIn(twoMotionsAtOnce),
  [drawingTheForces.id]: keepUnitsIn(drawingTheForces),
  [forceAndAcceleration.id]: keepUnitsIn(forceAndAcceleration),
  [normalReaction.id]: keepUnitsIn(normalReaction),
  [fallingThroughAir.id]: keepUnitsIn(fallingThroughAir),
  [momentumLesson.id]: keepUnitsIn(momentumLesson),
  [collisions.id]: keepUnitsIn(collisions),
  [turningForces.id]: keepUnitsIn(turningForces),
  [keepingBalance.id]: keepUnitsIn(keepingBalance),
  [workDoneLesson.id]: keepUnitsIn(workDoneLesson),
  [kineticAndPotentialEnergy.id]: keepUnitsIn(kineticAndPotentialEnergy),
  [whereTheEnergyGoes.id]: keepUnitsIn(whereTheEnergyGoes),
  [powerAndEfficiency.id]: keepUnitsIn(powerAndEfficiency),
  [densityAndUpthrust.id]: keepUnitsIn(densityAndUpthrust),
  [viscousDrag.id]: keepUnitsIn(viscousDrag),
  [hookesLaw.id]: keepUnitsIn(hookesLaw),
  [stressStrainYoung.id]: keepUnitsIn(stressStrainYoung),
  [readingMaterialGraphs.id]: keepUnitsIn(readingMaterialGraphs),
  [elasticStrainEnergy.id]: keepUnitsIn(elasticStrainEnergy),
};
