// Lesson "The push from the floor" — normal reaction, WPH11 points 8, 9, 10, 12 (and 3 in the Skill check).
// The puzzle: bathroom scales in a lift stop showing your weight. Why?
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { G } from '../physics/kinematics.ts';
import { normalInLift, resultant, weight } from '../physics/dynamics.ts';
import { fixed } from '../physics/format.ts';
import type { Lesson, LiftFig, Option } from './types.ts';

/** "679 N": a force rounded to the newton, the way the lesson shows it. */
export const newtons = (x: number): string => `${fixed(x, 0)}\u00a0N`;

// The person in the story and the numbers of each question.
export const M = 60; // kg
export const CALC = { m: M, a: 1.5 }; // lift speeding up upward
export const DOWN_SLOW = { m: 75, a: 2.0 }; // lift moving down, slowing down → acceleration upward
export const TRIP = [
  { id: 'A', dt: 2, a: 1.2 }, // speeding up upward
  { id: 'B', dt: 4, a: 0 }, // steady speed
  { id: 'C', dt: 2, a: -1.2 }, // slowing down
];

/** Answers and named mistakes, used by the screens and re-checked by normal-reaction.test.ts. */
export const ANSWERS = {
  calc: {
    right: normalInLift(CALC.m, CALC.a), // N = m(g + a)
    forgotA: weight(CALC.m), // N = W
    subtractedA: normalInLift(CALC.m, -CALC.a), // N = m(g − a)
    onlyMa: resultant(CALC.m, CALC.a), // N = ma
  },
  freeFall: { right: normalInLift(M, -G), weight: weight(M), double: 2 * weight(M) },
  downSlow: {
    right: normalInLift(DOWN_SLOW.m, DOWN_SLOW.a), // acceleration upward
    wrongSign: normalInLift(DOWN_SLOW.m, -DOWN_SLOW.a), // took "going down" as a downward acceleration
    weight: weight(DOWN_SLOW.m),
  },
};

const lift = (over: Partial<LiftFig>): LiftFig => ({ kind: 'lift', m: M, a: 0, forces: [], ...over });

const hookOptions: Option[] = [
  { id: 'more', label: 'It goes up' },
  { id: 'less', label: 'It goes down' },
  { id: 'same', label: 'It stays the same' },
];

const c = ANSWERS.calc;
const d = ANSWERS.downSlow;

export const normalReaction: Lesson = {
  id: 'normal-reaction',
  title: 'The push from the floor',
  spec: [8, 9, 10, 12],
  minutes: 10,
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'The push from the floor',
      body: 'Bathroom scales are meant to show your weight. Take them into a lift, and they start to disagree.',
      fig: lift({}),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: 'You stand on scales in a lift. The lift starts moving up. What happens to the reading?',
      fig: lift({}),
      options: [...hookOptions, { id: 'unsure', label: "I'm not sure" }],
      after: "Let's find out.",
    },
    {
      id: 'two-forces',
      kind: 'text',
      body: ['Two forces act on you: your weight W pulls down, and the scales push up with N.'],
      fig: lift({ forces: ['W', 'N'], unknownN: true }),
    },
    {
      id: 'at-rest',
      kind: 'choice',
      prompt: 'The lift is at rest. How does N compare with W?',
      fig: lift({ forces: ['W', 'N'], unknownN: true }),
      options: [
        { id: 'bigger', label: 'N is bigger than W', hint: 'Then there would be a resultant force upward. Are you accelerating?' },
        { id: 'equal', label: 'N is equal to W', correct: true },
        { id: 'smaller', label: 'N is smaller than W', hint: 'Then you would accelerate downward, through the floor.' },
      ],
      why: "You are not accelerating, so the resultant force on you is zero (Newton's first law). N and W must be equal.",
    },
    {
      id: 'what-scales-read',
      kind: 'text',
      body: ["Scales can't feel your weight. They measure how hard they push on you.", 'So the reading is N, not W.'],
      card: { term: 'Normal reaction', text: 'The push of a surface on an object, at right angles to the surface.' },
    },
    {
      id: 'slider',
      kind: 'explore',
      instruction: "Drag the slider to change the lift's acceleration.",
      fig: lift({ forces: ['W', 'N'], showAcc: true, showReading: true }),
      slider: { min: -3, max: 3, step: 0.5, label: 'Acceleration of the lift', unit: 'm s⁻²' },
      question: {
        prompt: 'When is N bigger than W?',
        options: [
          { id: 'acc-up', label: 'When the lift accelerates upward', correct: true },
          { id: 'acc-down', label: 'When the lift accelerates downward', hint: 'Try the slider below zero. Which arrow is longer?' },
          { id: 'never', label: 'Never: N always equals W', hint: 'Move the slider away from zero and watch N.' },
        ],
        right: "That's right.",
      },
    },
    {
      id: 'steady',
      kind: 'choice',
      prompt: 'The lift moves up at a steady 2\u00a0m\u00a0s⁻¹. What do the scales read?',
      fig: lift({ forces: ['W', 'N'], unknownN: true, motion: { dir: 'up', text: 'steady 2\u00a0m\u00a0s⁻¹' } }),
      options: [
        { id: 'more', label: 'More than W', hint: 'Moving up is not enough. Is the speed changing?' },
        { id: 'same', label: 'Exactly W', correct: true },
        { id: 'less', label: 'Less than W', hint: 'A smaller N needs a downward acceleration. Is the lift slowing?' },
      ],
      why: 'Steady speed means a = 0. With no acceleration the resultant force is zero, so N = W, however fast the lift goes.',
    },
    {
      id: 'second-law',
      kind: 'text',
      body: [
        "Take up as positive. The resultant force on you is N − W, and Newton's second law says it equals ma.",
        'So N = W + ma = m(g + a), where a is the acceleration of the lift.',
      ],
      card: { term: 'N = m(g + a)', text: 'Up is positive. If the lift accelerates downward, a is negative.' },
    },
    {
      id: 'calc',
      kind: 'choice',
      prompt: `Your mass is ${CALC.m}\u00a0kg and g = ${G}\u00a0N\u00a0kg⁻¹. The lift accelerates upward at ${fixed(CALC.a, 1)}\u00a0m\u00a0s⁻². What is N?`,
      fig: lift({ m: CALC.m, a: CALC.a, forces: ['W', 'N'], unknownN: true, showAcc: true }),
      options: [
        { id: 'only-ma', label: newtons(c.onlyMa), hint: "That's only the resultant force ma. N = W + ma." },
        { id: 'subtracted-a', label: newtons(c.subtractedA), hint: 'Check the sign: the acceleration is upward, so add ma.' },
        { id: 'forgot-a', label: newtons(c.forgotA), hint: "That's W. The lift is accelerating, so N is not W." },
        { id: 'right', label: newtons(c.right), correct: true },
      ],
      why: `N = m(g + a) = ${CALC.m} × (${G} + ${fixed(CALC.a, 1)}) = ${newtons(c.right)}.`,
    },
    {
      id: 'slowing',
      kind: 'tapFig',
      prompt: 'The lift is moving up but slowing down. How long is the N arrow?',
      instruction: 'Tap the N arrow you expect.',
      fig: lift({ forces: ['W'], candidates: true, motion: { dir: 'up', text: 'slowing down' } }),
      options: [
        { id: 'shorter', label: 'Shorter than W', correct: true },
        { id: 'equal', label: 'Equal to W', hint: 'Equal arrows mean no acceleration. Is the speed changing?' },
        { id: 'longer', label: 'Longer than W', hint: 'That would speed the lift up. This one is slowing down.' },
      ],
      why: 'Slowing down while moving up means the acceleration is downward. So the resultant force is downward: N is smaller than W.',
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: 'Back to the start. The lift starts moving up. What happens to the reading?',
      fig: lift({}),
      options: [
        { ...hookOptions[0], correct: true },
        { ...hookOptions[1], hint: 'Starting to move means the speed is changing. Which way is a?' },
        { ...hookOptions[2], hint: 'The lift is speeding up, so a is not zero.' },
      ],
      why: 'Starting to move up means speeding up upward: a points up, so N = m(g + a) is bigger than W. The scales show more.',
    },
    {
      id: 'pairs',
      kind: 'text',
      body: ["N and W both act on you. A Newton's third law pair always acts on two different objects."],
      fig: { kind: 'pairs', m: M },
    },
    {
      id: 'partner',
      kind: 'tapFig',
      prompt: "Which force is the Newton's third law partner of N?",
      instruction: 'Tap a force on the drawing.',
      fig: { kind: 'pairs', m: M },
      options: [
        { id: 'P', label: 'P, your push on the scales', correct: true },
        { id: 'W', label: 'W, your weight', hint: 'W acts on you too. A pair acts on two different objects.' },
        { id: 'E', label: 'E, your pull on the Earth', hint: "E is W's partner: you pull the Earth up." },
      ],
      why: 'The scales push up on you (N), so you push down on the scales (P): same size, opposite direction, on different objects, both contact forces.',
    },
  ],
  skillCheck: [
    {
      id: 'free-fall',
      kind: 'choice',
      prompt: `The lift cable snaps and the lift falls freely. What do the scales under a ${M}\u00a0kg person read?`,
      fig: lift({ a: -G, motion: { dir: 'down', text: 'falling freely' } }),
      options: [
        { id: 'zero', label: newtons(ANSWERS.freeFall.right), correct: true },
        { id: 'weight', label: newtons(ANSWERS.freeFall.weight) },
        { id: 'double', label: newtons(ANSWERS.freeFall.double) },
      ],
      why: "In free fall a = −g, so N = m(g + a) = 0. You and the scales fall together: the scales don't push at all.",
    },
    {
      id: 'down-slow',
      kind: 'choice',
      prompt: `A ${DOWN_SLOW.m}\u00a0kg person rides a lift going down. The lift slows down at ${fixed(DOWN_SLOW.a, 1)}\u00a0m\u00a0s⁻². What is the normal reaction on the person?`,
      options: [
        { id: 'wrong-sign', label: newtons(d.wrongSign) },
        { id: 'weight', label: newtons(d.weight) },
        { id: 'right', label: newtons(d.right), correct: true },
      ],
      why: `Moving down and slowing down means the acceleration is upward (+${fixed(DOWN_SLOW.a, 1)}\u00a0m\u00a0s⁻²). N = ${DOWN_SLOW.m} × (${G} + ${fixed(DOWN_SLOW.a, 1)}) = ${newtons(d.right)}.`,
    },
    {
      id: 'trip',
      kind: 'tapFig',
      prompt: 'The graph shows a lift trip upward. In which part do the scales read the most?',
      instruction: 'Tap a part of the graph.',
      fig: { kind: 'vt', phases: TRIP },
      options: [
        { id: 'A', label: 'Part A', correct: true },
        { id: 'B', label: 'Part B' },
        { id: 'C', label: 'Part C' },
      ],
      why: 'The scales read most where the acceleration is upward. That is where the gradient of the v–t graph is positive: part A.',
    },
    {
      id: 'explain',
      kind: 'choice',
      prompt: "Why are N and W on a person not a Newton's third law pair?",
      options: [
        { id: 'opposite', label: 'They point in opposite directions.' },
        { id: 'same-object', label: 'They both act on the person, and are different types of force.', correct: true },
        { id: 'no-partner', label: 'W comes from the Earth, so it has no partner.' },
      ],
      why: 'A third law pair acts on two different objects and is the same type of force. N and W both act on the person; N is a contact force, W is gravitational.',
    },
  ],
  youCanNow: [
    'Explain why scales in a lift read more or less than your weight',
    'Use N = m(g + a) with up as positive',
    "Pick out a Newton's third law pair",
  ],
};
