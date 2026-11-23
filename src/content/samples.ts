// Sample content for the hidden step gallery (/gallery/steps): one live example of every kind of step.
// Built on the "Work done" lesson; every number comes from src/physics.
import { weight } from '../physics/dynamics.ts';
import { fixed, sig } from '../physics/format.ts';
import { liftWork, rampPush, workDone } from '../physics/work.ts';
import { tripVelocity, type Trip } from '../physics/kinematics.ts';
import { AB, TRIP_A, TRIP_B, VA } from './reading-motion-graphs.ts';
import type { GraphFig, Screen } from './types.ts';
import { OMAR, TRIP, VAN } from './work-done.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const push = rampPush(VAN.m, VAN.h, VAN.L);

// The chase of "Reading motion graphs": car A cruises at VA, car B sets off from rest beside it at AB.
const T_END = 9;
const SLOWING: Trip = { u: tripVelocity(T_END, TRIP_B), phases: [{ dt: T_END, a: -AB }] }; // the same line, mirrored in time
const vtOf = (id: string, trip: Trip): GraphFig => ({ kind: 'graph', y: 'v', header: `graph ${id}`, lines: [{ id: '', trip }], tMax: T_END, tTick: 2, yMax: 25, yTick: 5 });

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
  {
    title: 'estimate · Estimate',
    screen: {
      id: 'sample-estimate',
      kind: 'estimate',
      prompt: `Movers push a ${VAN.m}${NB}kg washing machine up a ${fixed(VAN.L, 1)}${NB}m ramp into a van, ${fixed(VAN.h, 1)}${NB}m up. Roughly how much work does the push do?`,
      fig: { kind: 'ramp', m: VAN.m, h: VAN.h, L: VAN.L, push: 'unknown' },
      after: { kind: 'ramp', m: VAN.m, h: VAN.h, L: VAN.L, push: 'shown', work: true },
      scale: { min: 0, max: 1000, step: 10, tick: 100, unit: 'J', symbol: 'W', dp: 0, label: 'Work done by the push' },
      answer: liftWork(VAN.m, VAN.h),
      tolerance: 50,
      why: `On a smooth ramp all the work goes into raising the machine: W = mgh = ${VAN.m} × 9.81 × ${fixed(VAN.h, 1)} = ${sig(liftWork(VAN.m, VAN.h))}${NB}J, however long the ramp.`,
    },
  },
  {
    title: 'worked · Worked example',
    screen: {
      id: 'sample-worked',
      kind: 'worked',
      title: 'Worked example',
      fig: { kind: 'ramp', m: VAN.m, h: VAN.h, L: VAN.L, push: 'shown' },
      steps: [
        { text: `The ramp is smooth, so the push only has to match the part of the weight down the slope. sin θ = h ÷ L.`, math: `F = mg × h ÷ L = ${sig(push)}${NB}N` },
        { text: 'Work is force times distance along the force. The push acts along the ramp, so the distance is its length.', math: 'W = F × L' },
        { text: 'Put in the numbers, with their units.', math: `W = ${sig(push)}${NB}N × ${fixed(VAN.L, 1)}${NB}m` },
      ],
      last: {
        prompt: 'So what is the last line?',
        options: [
          { id: 'right', label: `W = ${sig(push * VAN.L)}${NB}J`, correct: true },
          { id: 'height', label: `W = ${sig(push * VAN.h)}${NB}J` },
          { id: 'weight', label: `W = ${sig(weight(VAN.m) * VAN.L)}${NB}J` },
        ],
      },
    },
  },
  {
    title: 'graphPick · Which graph',
    screen: {
      id: 'sample-graph',
      kind: 'graphPick',
      prompt: `Car A passes car B at a steady ${fixed(VA, 1)}${NB}m${NB}s⁻¹. At that moment car B sets off from rest at ${fixed(AB, 1)}${NB}m${NB}s⁻². Which v–t graph is car B's?`,
      scene: { kind: 'chase', cars: [{ id: 'A', u: VA, a: 0 }, { id: 'B', u: 0, a: AB }], span: 90, until: 4, values: true },
      graphs: [
        { id: 'A', fig: vtOf('A', TRIP_A), hint: `A flat line is a steady velocity: that is car A at ${fixed(VA, 1)}${NB}m${NB}s⁻¹.` },
        { id: 'B', fig: vtOf('B', SLOWING), hint: 'This line slopes down: the car is slowing. Car B starts from rest and speeds up.' },
        { id: 'C', fig: vtOf('C', TRIP_B), correct: true },
      ],
      why: `From rest, steady acceleration: a straight line from zero. Its gradient is the acceleration, ${fixed(AB, 1)}${NB}m${NB}s⁻², so it reaches ${fixed(tripVelocity(T_END, TRIP_B), 1)}${NB}m${NB}s⁻¹ at ${T_END}${NB}s.`,
    },
  },
];
