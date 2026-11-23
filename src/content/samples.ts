// Sample content for the hidden step gallery (/gallery/steps): one live example of every kind of step.
// Built on the "Work done" lesson; every number comes from src/physics.
import { weight } from '../physics/dynamics.ts';
import { fixed, sig } from '../physics/format.ts';
import { liftWork, rampPush, workDone } from '../physics/work.ts';
import type { Screen } from './types.ts';
import { OMAR, TRIP, VAN } from './work-done.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const push = rampPush(VAN.m, VAN.h, VAN.L);

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
  {
    title: 'order · In order',
    screen: {
      id: 'sample-order',
      kind: 'order',
      prompt: 'Why does Nadia do no work on her suitcase? Put the reasons in order.',
      steps: [
        { id: 'force', text: `Nadia's force on the suitcase is upward: she holds up its ${sig(weight(TRIP.m))}${NB}N weight.` },
        { id: 'motion', text: 'The suitcase moves horizontally, along the platform.' },
        { id: 'angle', text: 'So her force is at 90° to the motion.' },
        { id: 'zero', text: 'cos 90° = 0, so W = F × s × cos 90° = 0.' },
      ],
      hint: 'Start with the force, then the motion, then the angle between them.',
      why: 'Work needs movement along the force. Nadia pushes up while the suitcase moves sideways, so none of her force does work.',
    },
  },
  {
    title: 'spotError · Find the mistake',
    screen: {
      id: 'sample-spot',
      kind: 'spotError',
      prompt: `Sam pushes a ${VAN.m}${NB}kg washing machine up a ${fixed(VAN.L, 1)}${NB}m ramp into a van, ${fixed(VAN.h, 1)}${NB}m high. His working has one mistake. Which line?`,
      lines: [
        { id: 'push', text: `Push along the ramp: F = ${sig(push)}${NB}N`, hint: `That line is right: F = mg sin θ = ${sig(push)}${NB}N.` },
        { id: 'data', text: `The ramp is ${fixed(VAN.L, 1)}${NB}m long and ${fixed(VAN.h, 1)}${NB}m high.`, hint: 'That line only copies the data.' },
        { id: 'work', text: `W = F × h = ${sig(push)} × ${fixed(VAN.h, 1)} = ${sig(push * VAN.h)}${NB}J`, wrong: true, fix: `W = F × L = ${sig(push)} × ${fixed(VAN.L, 1)} = ${sig(liftWork(VAN.m, VAN.h))}${NB}J` },
        { id: 'end', text: `So the push does ${sig(push * VAN.h)}${NB}J of work.`, hint: `This follows from the line above. Where did ${sig(push * VAN.h)} come from?` },
      ],
      why: `Work is force × distance along the force. The push acts along the ramp, so use its ${fixed(VAN.L, 1)}${NB}m length, not the height. ${sig(liftWork(VAN.m, VAN.h))}${NB}J = mgh, as it must be.`,
    },
  },
  {
    title: 'sort · Sort',
    screen: {
      id: 'sample-sort',
      kind: 'sort',
      prompt: 'Omar and Nadia cross the platform. Which of these forces do work on a suitcase?',
      bins: [
        { id: 'work', label: 'Does work' },
        { id: 'none', label: 'No work' },
      ],
      items: [
        { id: 'pull', label: "Omar's pull", bin: 'work', hint: 'Part of the pull, F cos θ, points along the motion, so it does work.' },
        { id: 'hold', label: "Nadia's upward push", bin: 'none', hint: "Nadia's push is up, at 90° to the motion: cos 90° = 0, no work." },
        { id: 'friction', label: 'Friction on the wheels', bin: 'work', hint: 'Friction acts along the line of motion, backwards. It does work: negative work.' },
        { id: 'weight', label: "The suitcase's weight on the flat platform", bin: 'none', hint: 'The weight is down, the motion is sideways. The suitcase does not go up or down.' },
      ],
      why: 'A force does work only when the object moves along it. Forces at 90° to the motion do none; a force against the motion does negative work.',
    },
  },
];
