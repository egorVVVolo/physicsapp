// Sample content for the hidden step gallery (/gallery/steps): one live example of every kind of step.
// Built on the "Work done" lesson; every number comes from src/physics.
import { weight } from '../physics/dynamics.ts';
import { sig } from '../physics/format.ts';
import { workDone } from '../physics/work.ts';
import type { Screen } from './types.ts';
import { OMAR, TRIP } from './work-done.ts';

const NB = ' '; // a no-break space: a number never parts from its unit

export const samples: { title: string; screen: Screen }[] = [
  {
    title: 'build · Build the solution',
    screen: {
      id: 'sample-build',
      kind: 'build',
      prompt: `Omar pulls his ${TRIP.m}${NB}kg suitcase ${TRIP.s}${NB}m along the platform with a force of ${OMAR.F}${NB}N at ${OMAR.angle}° to the floor. How much work does his pull do?`,
      choose: {
        prompt: 'Which equation gives the work done by the pull?',
        options: [
          { id: 'cos', label: 'W = F × s × cos θ', correct: true },
          { id: 'sin', label: 'W = F × s × sin θ', hint: 'sin θ gives the upward part of the pull. Only the part along the motion does work.' },
          { id: 'plain', label: 'W = F × s', hint: 'That is for a force along the motion. Omar pulls at an angle.' },
        ],
      },
      equation: 'W = {F} × {s} × cos {θ}',
      boxes: { F: 'pull', s: 'dist', θ: 'angle' },
      chips: [
        { id: 'pull', label: `${OMAR.F}${NB}N` },
        { id: 'dist', label: `${TRIP.s}${NB}m` },
        { id: 'angle', label: `${OMAR.angle}°` },
        { id: 'weight', label: `${sig(weight(TRIP.m))}${NB}N`, hint: "That is the suitcase's weight. F is Omar's pull." },
        { id: 'comp', label: `${90 - OMAR.angle}°`, hint: 'θ is the angle between the pull and the motion, along the floor.' },
      ],
      result: { symbol: 'W', value: workDone(OMAR.F, TRIP.s, OMAR.angle), unit: 'J' },
      why: `Only the part of the pull along the floor, ${OMAR.F} cos ${OMAR.angle}° = ${sig(OMAR.F * Math.cos((OMAR.angle * Math.PI) / 180))}${NB}N, moves the suitcase. Times ${TRIP.s}${NB}m gives the work.`,
    },
  },
];
