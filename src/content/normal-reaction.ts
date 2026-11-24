// Lesson "The push from the floor" — normal reaction, WPH11 points 8, 9, 10, 12 (and 3 in the Skill check).
// The puzzle: at home the scales say 60.0 kg; in a lift that starts moving up they say 69.2 kg. Did you gain 9 kg?
// The answer: scales measure the push N (and show N ÷ g), not your weight.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { G } from '../physics/kinematics.ts';
import { normalInLift, resultant, scaleKg, weight } from '../physics/dynamics.ts';
import { fixed } from '../physics/format.ts';
const NB = '\u00A0';
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
export const EXAM = { m: 55, a: -1.0 }; // a passenger in a lift starting downward (the exam card)
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
  exam: { right: normalInLift(EXAM.m, EXAM.a), wrongSign: normalInLift(EXAM.m, -EXAM.a), weight: weight(EXAM.m) },
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
  { id: 'more', label: 'It goes up', correct: true },
  { id: 'less', label: 'It goes down' },
  { id: 'same', label: 'It stays the same' },
];

const c = ANSWERS.calc;
const d = ANSWERS.downSlow;
const k = ANSWERS.scales;
const e = ANSWERS.exam;
/** "0 m s⁻²"-style chip for an acceleration with its sign */
const accChip = (a: number) => `${a > 0 ? '+' : a < 0 ? '−' : ''}${fixed(Math.abs(a), 1)}${NB}m${NB}s⁻²`;

export const normalReaction: Lesson = {
  id: 'normal-reaction',
  title: 'The push from the floor',
  spec: [8, 9, 10, 12],
  minutes: 12,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'Weight and the push', from: 'weight' },
    { title: 'Back to the lift', from: 'slider' },
  ],
  cast: ['Imran'],
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
      after: "Let's find out",
    },
    {
      id: 'weight',
      kind: 'text',
      body: [`Gravity pulls you down with your **weight**, W = mg. For you, that is ${newtons(ANSWERS.weight)}.`],
      fig: lift({ forces: ['W'], values: true, showG: true }),
    },
    {
      id: 'fbd',
      kind: 'text',
      body: [
        'On the right of the drawing you are shrunk to a dot, with one arrow for each force on you. This is a **free-body diagram**.',
        'The longer the arrow, the bigger the force.',
      ],
    },
    {
      id: 'at-rest',
      kind: 'choice',
      prompt: 'The scales push up on your feet with N, the normal reaction. The lift is at rest. How does N compare with W?',
      fig: lift({ forces: ['W', 'N'], unknownN: true, nOnPerson: true }),
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
        'So scales do not measure your weight. They measure **N**, the push on you, and show N ÷ g in kilograms.',
        'If N changes, the number changes, even though your mass stays the same.',
      ],
      card: { term: 'Normal reaction', text: 'The push of a surface on an object, at right angles to the surface.' },
    },
    {
      id: 'slider',
      kind: 'explore',
      instruction: "Drag the slider to change the lift's acceleration.",
      fig: lift({ forces: ['W', 'N'], showAcc: true, reading: 'shown', values: true }),
      slider: { min: -3, max: 3, step: 0.1, tick: 0.5, label: 'Acceleration of the lift', unit: 'm s⁻²', symbol: 'a', dp: 1, signed: true },
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
      id: 'second-law',
      kind: 'text',
      body: [
        "Take up as positive. The resultant force on you is N − W, and Newton's second law says it equals ma.",
        'So **N = W + ma = m(g + a)**, where a is the acceleration of the lift.',
      ],
      card: { term: 'N = m(g + a)', text: 'Up is positive. If the lift accelerates downward, a is negative.' },
    },
    {
      id: 'calc',
      kind: 'build',
      prompt: `Your friend Imran has a mass of ${CALC.m} kg. The lift accelerates upward at ${fixed(CALC.a, 1)} m s⁻². Build the push of the floor on him.`,
      fig: lift({ m: CALC.m, a: CALC.a, forces: ['W', 'N'], unknownN: true, showAcc: true }),
      equation: 'N = {m} × ({g} + {a})',
      boxes: { m: 'mass', g: 'field', a: 'acc' },
      chips: [
        { id: 'mass', label: `${CALC.m}${NB}kg` },
        { id: 'field', label: `${G}${NB}N${NB}kg⁻¹` },
        { id: 'acc', label: accChip(CALC.a) },
        { id: 'down', label: accChip(-CALC.a), hint: 'The acceleration is upward, so a is positive.' },
        { id: 'zero', label: accChip(0), hint: 'The lift is accelerating, so a is not zero.' },
      ],
      result: { symbol: 'N', value: c.right, unit: 'N' },
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
      id: 'reading',
      kind: 'estimate',
      prompt: `You stand on the scales as the lift starts up at ${acc(PUZZLE.a)}. Drag to the number they show.`,
      fig: lift({ a: PUZZLE.a, motion: { u: 0, text: 'starting up' } }),
      after: lift({ a: PUZZLE.a, motion: { u: 0, text: 'starting up' }, reading: 'shown' }),
      scale: { min: 40, max: 90, step: 0.5, tick: 10, unit: 'kg', symbol: 'reading', dp: 1, label: 'Reading of the scales' },
      answer: scaleKg(k.n),
      tolerance: 1.5,
      why: `N = ${M} × (${G} + ${fixed(PUZZLE.a, 1)}) = ${newtons(k.n)}, and the scales show N ÷ g = ${k.startingUp}.`,
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: 'Back to the lift. Why do the scales show more than at home while it starts up?',
      fig: lift({ a: PUZZLE.a, motion: { u: 0, text: 'starting up' }, reading: 'shown' }),
      options: [
        { id: 'mass', label: 'Your mass has gone up', hint: 'Your mass is 60 kg anywhere. The lift does not change it.' },
        { id: 'gravity', label: 'Gravity is stronger in a moving lift', hint: 'g is the same inside the lift. The floor is what changes.' },
        { id: 'push', label: 'The floor pushes harder: N is bigger than W', correct: true },
      ],
      why: `Starting up, you accelerate upward, so the resultant force is upward: N > W. N = ${newtons(k.n)} against W = ${newtons(ANSWERS.weight)}. You did not gain weight.`,
    },
    {
      id: 'pairs',
      kind: 'text',
      body: ["N and W both act on you. A **Newton's third law pair** always acts on two different objects."],
      fig: { kind: 'pairs', m: M, explode: true },
    },
    {
      id: 'pair-sort',
      kind: 'sort',
      prompt: 'Sort these pairs of forces: a third-law pair, or two balanced forces on one body?',
      bins: [
        { id: 'pair', label: 'Third-law pair' },
        { id: 'balanced', label: 'Balanced forces' },
      ],
      items: [
        { id: 'floor', label: "Floor's push on you, your push on the floor", bin: 'pair', hint: 'Two bodies, each pushing the other: a third-law pair.' },
        { id: 'earth', label: 'Your weight, your pull on the Earth', bin: 'pair', hint: 'Each acts on a different body: you and the Earth. A third-law pair.' },
        { id: 'rest', label: "Your weight, the floor's push (at rest)", bin: 'balanced', hint: 'Both act on you and cancel: balanced forces, not a pair.' },
        { id: 'lamp', label: "A lamp's weight, the cable's pull (at rest)", bin: 'balanced', hint: 'Both act on the lamp and cancel: balanced forces on one body.' },
        { id: 'book', label: "Table's push on book, book's push on table", bin: 'pair', hint: 'Two bodies pushing each other: a third-law pair.' },
      ],
      why: 'A third-law pair acts on two different bodies, one on each. Balanced forces act on the same body and make its resultant zero.',
    },
  ],
  skillCheck: [
    {
      id: 'down-slow',
      kind: 'build',
      prompt: `A ${DOWN_SLOW.m} kg person rides a lift going down. The lift slows down at ${fixed(DOWN_SLOW.a, 1)} m s⁻². Build the push of the floor on the person.`,
      equation: 'N = {m} × ({g} + {a})',
      boxes: { m: 'mass', g: 'field', a: 'acc' },
      chips: [
        { id: 'mass', label: `${DOWN_SLOW.m}${NB}kg` },
        { id: 'field', label: `${G}${NB}N${NB}kg⁻¹` },
        { id: 'acc', label: accChip(DOWN_SLOW.a) },
        { id: 'down', label: accChip(-DOWN_SLOW.a), hint: 'Moving down and slowing down: the acceleration points up, so it is positive.' },
        { id: 'zero', label: accChip(0), hint: 'The lift is slowing down, so a is not zero.' },
      ],
      result: { symbol: 'N', value: d.right, unit: 'N' },
      why: `Moving down and slowing down means the acceleration is upward (+${fixed(DOWN_SLOW.a, 1)} m s⁻²). N = ${DOWN_SLOW.m} × (${G} + ${fixed(DOWN_SLOW.a, 1)}) = ${newtons(d.right)}.`,
    },
    {
      id: 'scales-sort',
      kind: 'sort',
      prompt: 'A person stands on scales. Sort these forces by the body they act on.',
      bins: [
        { id: 'person', label: 'On the person' },
        { id: 'scales', label: 'On the scales' },
      ],
      items: [
        { id: 'weight', label: "The person's weight", bin: 'person' },
        { id: 'push', label: "The scales' push on the person", bin: 'person' },
        { id: 'press', label: "The person's push on the scales", bin: 'scales' },
        { id: 'own', label: "The scales' own weight", bin: 'scales' },
      ],
      why: "The weight and the scales' push act on the person. The person's push and the scales' own weight act on the scales.",
    },
    {
      id: 'free-fall',
      kind: 'choice',
      prompt: `The lift cable snaps and the lift falls freely. What is the normal reaction on the ${M} kg person?`,
      fig: lift({ a: -G, motion: { u: 0, text: 'falling freely' } }),
      options: [
        { id: 'zero', label: newtons(ANSWERS.freeFall.right), correct: true },
        { id: 'weight', label: newtons(ANSWERS.freeFall.weight) },
        { id: 'double', label: newtons(ANSWERS.freeFall.double) },
      ],
      why: "In free fall a = −g, so N = m(g + a) = 0. You and the scales fall together: the scales don't push at all.",
    },
    {
      id: 'passenger',
      kind: 'examCard',
      context: `A ${EXAM.m} kg passenger stands on the floor of a lift. The lift starts moving down with an acceleration of ${fixed(-EXAM.a, 1)} m s⁻². g = ${G} N kg⁻¹.`,
      parts: [
        {
          id: 'a',
          command: 'State',
          text: 'the direction of the resultant force on the passenger.',
          marks: 1,
          kind: 'choice',
          options: [
            { id: 'down', label: 'Downward', correct: true },
            { id: 'up', label: 'Upward' },
            { id: 'zero', label: 'There is no resultant force' },
            { id: 'sideways', label: 'Horizontal' },
          ],
          why: 'The lift accelerates downward, so the resultant force on the passenger points downward: W is bigger than N.',
        },
        {
          id: 'b',
          command: 'Calculate',
          text: 'the normal reaction on the passenger.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'N = {m} × ({g} + {a})',
            boxes: { m: 'mass', g: 'field', a: 'acc' },
            chips: [
              { id: 'mass', label: `${EXAM.m}${NB}kg` },
              { id: 'field', label: `${G}${NB}N${NB}kg⁻¹` },
              { id: 'acc', label: accChip(EXAM.a) },
              { id: 'up', label: accChip(-EXAM.a), hint: 'The lift accelerates downward, so a is negative with up positive.' },
              { id: 'weight', label: newtons(e.weight), hint: 'That is the weight. The lift is accelerating, so N is not W.' },
            ],
            result: { symbol: 'N', value: e.right, unit: 'N' },
          },
          why: `With up positive, a = ${fixed(EXAM.a, 1)} m s⁻². N = ${EXAM.m} × (${G} − ${fixed(-EXAM.a, 1)}) = ${newtons(e.right)}, less than the weight ${newtons(e.weight)}.`,
        },
      ],
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
  card: {
    formula: 'N = m(g + a)',
    idea: 'The scales read the push of the floor, not your weight. Speed up upwards and the push grows.',
  },
};
