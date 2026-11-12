// Lesson "The push from the floor" — normal reaction, WPH11 points 8, 9, 10, 12 (and 3 in the Skill check).
// The puzzle: at home the scales say 60.0 kg; in a lift that starts moving up they say 69.2 kg. Did you gain 9 kg?
// The answer: scales measure the push N (and show N ÷ g), not your weight.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { G } from '../physics/kinematics.ts';
import { normalInLift, resultant, scaleKg, weight } from '../physics/dynamics.ts';
import { fixed } from '../physics/format.ts';
import type { Lesson, LiftFig, Option } from './types.ts';

/** "679 N": a force rounded to the newton, the way the lesson shows it. */
export const newtons = (x: number): string => `${fixed(x, 0)} N`;
/** "69.2 kg": what bathroom scales show for a push N (they divide by g). */
export const kilos = (n: number): string => `${fixed(scaleKg(n), 1)} kg`;
/** "+1.5 m s⁻²" with no-break spaces. */
const acc = (a: number) => `${a > 0 ? '+' : ''}${fixed(a, 1)} m s⁻²`;

// The person in the story and the numbers of each question.
export const M = 60; // kg
export const PUZZLE = { m: M, a: 1.5 }; // the lift starting up in the puzzle
export const CALC = { m: 80, a: 1.2 }; // a friend in a lift speeding up upward
export const STEADY_V = 2; // m s⁻¹, the lift moving up at a steady speed
export const SLOW = { u: 2, a: -1.2 }; // moving up and slowing down
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
  /** The puzzle: what the scales show at home and in the lift starting up (they show N ÷ g). */
  scales: {
    home: kilos(weight(M)),
    startingUp: kilos(normalInLift(PUZZLE.m, PUZZLE.a)), // right
    subtractedA: kilos(normalInLift(PUZZLE.m, -PUZZLE.a)), // m(g − a) ÷ g
    addedToKg: `${fixed(PUZZLE.m + PUZZLE.a, 1)} kg`, // added a straight to the kilograms
    n: normalInLift(PUZZLE.m, PUZZLE.a),
  },
  weight: weight(M),
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
const k = ANSWERS.scales;

export const normalReaction: Lesson = {
  id: 'normal-reaction',
  title: 'The push from the floor',
  spec: [8, 9, 10, 12],
  minutes: 12,
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'The push from the floor',
      body: `At home your scales say ${k.home}. Take them into a lift, and the number starts to change.`,
      fig: lift({ reading: 'shown' }),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: 'You stand on the scales in a lift. The lift starts moving up. What happens to the reading?',
      fig: lift({ a: PUZZLE.a, motion: { u: 0, text: 'starting up' } }),
      options: [...hookOptions, { id: 'unsure', label: "I'm not sure" }],
      after: "Let's find out.",
    },
    {
      id: 'weight',
      kind: 'text',
      body: [`Gravity pulls you down with your weight, W = mg. For you, that is ${newtons(ANSWERS.weight)}.`],
      fig: lift({ forces: ['W'], values: true }),
    },
    {
      id: 'fbd',
      kind: 'text',
      body: [
        'On the right of the drawing you are shrunk to a dot, with one arrow for each force on you. This is a free-body diagram.',
        'The longer the arrow, the bigger the force.',
      ],
    },
    {
      id: 'two-forces',
      kind: 'text',
      body: ['The scales push back up on your feet. This push is called the normal reaction, N.'],
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
      id: 'spring',
      kind: 'text',
      body: ['A spring inside the scales squashes. The harder it pushes on you, the bigger the number.'],
      fig: { kind: 'scales', m: M },
    },
    {
      id: 'what-scales-read',
      kind: 'text',
      body: [
        'So scales do not measure your weight. They measure N, the push on you, and show N ÷ g in kilograms.',
        'If N changes, the number changes, even though your mass stays the same.',
      ],
      card: { term: 'Normal reaction', text: 'The push of a surface on an object, at right angles to the surface.' },
    },
    {
      id: 'slider',
      kind: 'explore',
      instruction: "Drag the slider to change the lift's acceleration.",
      fig: lift({ forces: ['W', 'N'], showAcc: true, reading: 'shown', values: true }),
      slider: { min: -3, max: 3, step: 0.1, tick: 0.5, label: 'Acceleration of the lift', unit: 'm s⁻²' },
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
      prompt: `The lift moves up at a steady ${STEADY_V} m s⁻¹. What do the scales read?`,
      fig: lift({ forces: ['W', 'N'], unknownN: true, motion: { u: STEADY_V, text: `steady ${STEADY_V} m s⁻¹` } }),
      options: [
        { id: 'more', label: 'More than at rest', hint: 'Moving up is not enough. Is the speed changing?' },
        { id: 'same', label: 'The same as at rest', correct: true },
        { id: 'less', label: 'Less than at rest', hint: 'A smaller N needs a downward acceleration. Is the lift slowing?' },
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
      prompt: `Your friend has a mass of ${CALC.m} kg. The lift accelerates upward at ${fixed(CALC.a, 1)} m s⁻². Take g = ${G} N kg⁻¹. What is N?`,
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
      fig: lift({ a: SLOW.a, forces: ['W'], candidates: true, motion: { u: SLOW.u, text: 'slowing down' } }),
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
      prompt: `Back to the puzzle. The lift starts up at ${acc(PUZZLE.a)}. What number do your scales show now?`,
      fig: lift({ a: PUZZLE.a, motion: { u: 0, text: 'starting up' }, reading: 'afterCheck' }),
      options: [
        { id: 'home', label: k.home, hint: "That's the reading at rest. The lift is accelerating." },
        { id: 'right', label: k.startingUp, correct: true },
        { id: 'subtracted-a', label: k.subtractedA, hint: 'The acceleration is upward, so N is bigger than W, not smaller.' },
        { id: 'added-to-kg', label: k.addedToKg, hint: 'You added a to the kilograms. Find N = m(g + a) first, then N ÷ g.' },
      ],
      why: `N = ${M} × (${G} + ${fixed(PUZZLE.a, 1)}) = ${newtons(k.n)}, so the scales show N ÷ g = ${k.startingUp}. You did not gain weight: the floor pushes harder.`,
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
      prompt: `The lift cable snaps and the lift falls freely. What is the normal reaction on the ${M} kg person?`,
      fig: lift({ a: -G, motion: { u: 0, text: 'falling freely' } }),
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
      prompt: `A ${DOWN_SLOW.m} kg person rides a lift going down. The lift slows down at ${fixed(DOWN_SLOW.a, 1)} m s⁻². What is the normal reaction on the person?`,
      options: [
        { id: 'wrong-sign', label: newtons(d.wrongSign) },
        { id: 'weight', label: newtons(d.weight) },
        { id: 'right', label: newtons(d.right), correct: true },
      ],
      why: `Moving down and slowing down means the acceleration is upward (+${fixed(DOWN_SLOW.a, 1)} m s⁻²). N = ${DOWN_SLOW.m} × (${G} + ${fixed(DOWN_SLOW.a, 1)}) = ${newtons(d.right)}.`,
    },
    {
      id: 'trip',
      kind: 'tapFig',
      prompt: 'The graph shows a lift trip upward. In which part do the scales show the biggest number?',
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
      id: 'book',
      kind: 'choice',
      prompt: "A book rests on a table. Which force is the Newton's third law partner of the book's weight?",
      options: [
        { id: 'table-push', label: "The table's upward push on the book" },
        { id: 'earth-pull', label: "The book's upward pull on the Earth", correct: true },
        { id: 'book-push', label: "The book's downward push on the table" },
      ],
      why: "Weight is the Earth's pull on the book. Its partner is the book's pull on the Earth: the same type of force, on the other object.",
    },
  ],
  youCanNow: [
    'Explain why scales in a lift show more or less than at home',
    'Use N = m(g + a) with up as positive',
    "Pick out a Newton's third law pair",
  ],
  recap: {
    fig: { kind: 'liftPair', m: PUZZLE.m, a: PUZZLE.a },
    text: `Same person, same mass. Starting up at ${acc(PUZZLE.a)}, the floor pushes harder, so the scales show ${k.startingUp}.`,
  },
};
