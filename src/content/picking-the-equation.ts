// Lesson "Picking the equation" — the four suvat equations and how to choose one, WPH11 point 1.
// The puzzle: two identical cars brake as hard as they can; car B is twice as fast as car A. How much farther does it go?
// The answer: four times as far (9.0 m and 36.0 m), because u is squared in v² = u² + 2as. And where car A has
// stopped, car B has lost only 3.2 m s⁻¹ of its 24.0. Spec: docs/lessons/picking-the-equation.md.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import {
  RELATIONS,
  brakingDistance,
  brakingPosition,
  distanceFromAverage,
  position,
  speedAfter,
  stoppingDistance,
  stoppingTime,
  thinkingDistance,
  timesForDisplacement,
  type Braking,
  type RelationId,
} from '../physics/kinematics.ts';
import { fixed } from '../physics/format.ts';
import { EQUATION_IDS, type Lesson, type Option, type RoadFig } from './types.ts';

const NB = '\u00A0'; // numbers never break from their units
/** "24.0 m s⁻¹" */
const speed = (v: number) => `${fixed(v, 1)}${NB}m${NB}s⁻¹`;
/** "36.0 m" */
const metres = (x: number) => `${fixed(x, 1)}${NB}m`;
/** "500 m": a distance of three figures or more */
const wholeMetres = (x: number) => `${fixed(x, 0)}${NB}m`;
/** "0.50 s", "3.00 s"; with dp = 1: "25.0 s" */
const secs = (t: number, dp = 2) => `${fixed(t, dp)}${NB}s`;
/** "−8.0 m s⁻²" */
const acc = (a: number) => `${fixed(a, 1)}${NB}m${NB}s⁻²`;
/** An equation that never breaks across lines: "v² = u² + 2as". */
const whole = (equation: string) => equation.replaceAll(' ', NB);
/** "a = −8.0 m s⁻²" that never breaks: a line may only break between two of these. */
const is = (name: string, value: string) => `${name}${NB}=${NB}${value}`;

// The road: both cars slow at A once the brakes are on. Car B is twice as fast as car A. Forward is positive.
export const UA = 12; // m s⁻¹
export const UB = 24; // m s⁻¹
export const A = -8; // m s⁻²
export const REACT = 0.5; // s, the reaction time of car B's driver
export const TREE = 40; // m, the fallen tree ahead of car B
const SPAN = 40; // m of road on the ruler
const SPAN_REACT = 52; // with a reaction time the car needs more road

const carA: Braking = { u: UA, a: A, react: 0 };
const carB: Braking = { u: UB, a: A, react: 0 };
const carBReacting: Braking = { u: UB, a: A, react: REACT };

// Skill check numbers
export const TRAIN = { u: 30, v: 10, t: 25 }; // a train slowing steadily
export const WET_A = -4; // m s⁻², car B on a wet road
export const CYCLIST = { u: 6, a: 0.5, t: 8 }; // a cyclist speeding up (older Skill check)
export const RIDER = { u: 4, a: 2, s: 12 }; // a rider speeding up: how long to cover 12.0 m? (a quadratic, one root is negative)
export const DRIVER = { u: 20, a: -5, react: 0.5 }; // the exam card: thinking and braking distance

/** Distances, speeds and named mistakes, used by the screens and re-checked by picking-the-equation.test.ts. */
export const ANSWERS = (() => {
  const sA = brakingDistance(UA, A);
  const sB = brakingDistance(UB, A);
  const passing = speedAfter(UB, A, sA)!; // car B where car A has stopped
  const thinking = thinkingDistance(carBReacting);
  const left = TREE - thinking; // road left for braking before the tree
  return {
    brakeA: {
      right: sA,
      time: UA / -A, // u ÷ a: that is the braking time, not a distance
      lostTwo: (UA * UA) / -A, // u² ÷ a: lost the 2 of 2as
    },
    brakeB: {
      right: sB,
      doubled: 2 * sA, // twice the speed, twice the distance
      tripled: 3 * sA,
      lostTwo: (UB * UB) / -A,
    },
    tA: stoppingTime(carA),
    tB: stoppingTime(carB),
    passing: {
      right: passing,
      half: UB / 2, // "a quarter of the way, so... half the speed"
      evenWithDistance: UB * (1 - sA / sB), // speed falling evenly with distance: a quarter of the road, a quarter of the speed
      lostTwo: Math.sqrt(UB * UB + A * sA), // v² = u² + as
      lost: UB - passing,
    },
    /** How far car B travels in each second of its braking. */
    perSecond: [1, 2, 3].map((k) => brakingPosition(k, carB) - brakingPosition(k - 1, carB)),
    stopping: {
      thinking,
      right: stoppingDistance(carBReacting),
      brakingOnly: sB, // forgot the thinking distance
      halfThinking: sB + distanceFromAverage(UB, 0, REACT), // treated the reaction time as if the car were already slowing
    },
    tree: {
      left,
      right: speedAfter(UB, A, left)!,
      shortBy: TREE - sB, // forgot the thinking distance: "it stops before the tree"
      lostTwo: Math.sqrt(UB * UB + A * left),
      wrongSign: speedAfter(UB, -A, left)!, // a taken as positive: faster than it started
    },
    train: distanceFromAverage(TRAIN.u, TRAIN.v, TRAIN.t),
    trainA: (TRAIN.v - TRAIN.u) / TRAIN.t, // the acceleration, not needed
    trainAverage: (TRAIN.u + TRAIN.v) / 2,
    rider: (() => {
      const [late, early] = timesForDisplacement(RIDER.s, RIDER.u, RIDER.a); // largest first
      return { right: late, negative: early };
    })(),
    driver: {
      thinking: thinkingDistance({ u: DRIVER.u, a: DRIVER.a, react: DRIVER.react }),
      braking: brakingDistance(DRIVER.u, DRIVER.a),
    },
    wet: { right: brakingDistance(UB, WET_A), same: sB, quadrupled: 4 * sB },
    cyclist: {
      right: position(CYCLIST.t, { s0: 0, u: CYCLIST.u, a: CYCLIST.a }),
      onlyUt: CYCLIST.u * CYCLIST.t, // forgot the ½at² term
      onlyAt2: 0.5 * CYCLIST.a * CYCLIST.t ** 2, // forgot the ut term: "from rest"
      lostHalf: CYCLIST.u * CYCLIST.t + CYCLIST.a * CYCLIST.t ** 2,
    },
    /** Halving the speed (car A's speed, same reaction time): the stopping distance as a share of car B's. */
    halfSpeedShare: stoppingDistance({ ...carBReacting, u: UA }) / stoppingDistance(carBReacting),
  };
})();

const x = ANSWERS;

const BOTH: RoadFig['cars'] = [
  { id: 'A', u: UA },
  { id: 'B', u: UB },
];
const ONLY_A: RoadFig['cars'] = [{ id: 'A', u: UA }];
const ONLY_B: RoadFig['cars'] = [{ id: 'B', u: UB }];
const road = (over: Partial<RoadFig>): RoadFig => ({ kind: 'road', a: A, cars: BOTH, span: SPAN, ...over });

/** The four equations as answers: one is right, the others carry a hint (story) or nothing (Skill check). */
const equations = (right: RelationId, hints: Partial<Record<RelationId, string>> = {}): Option[] =>
  EQUATION_IDS.map((id) => {
    const label = RELATIONS[id].text;
    if (id === right) return { id, label, correct: true };
    return hints[id] ? { id, label, hint: hints[id] } : { id, label };
  });

const NEEDS_T = 'It needs t, and the problem never mentions the time.';
const NEEDS_S = 'It needs s too. Prefer given values: a calculated one can carry a mistake.';
const NEEDS_A = 'It needs a, and the problem never gives the acceleration.';
const NO_S = 'It has no s in it, and s is what you want.';
/** "0 m s⁻¹": the hidden known of a body that stops */
const zero = `0${NB}m${NB}s⁻¹`;

export const pickingTheEquation: Lesson = {
  id: 'suvat',
  title: 'Picking the equation',
  spec: [1],
  minutes: 12,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'Picking an equation', from: 'five' },
    { title: 'Back to the cars', from: 'hook-again' },
  ],
  cast: ['Tariq'],
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Picking the equation',
      body: `Two identical cars brake as hard as they can. Car A is doing ${speed(UA)}. Car B is doing twice that.`,
      fig: road({ values: true }),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: 'Car B is twice as fast. How much farther does it travel before it stops?',
      fig: road({ values: true }),
      options: [
        { id: 'twice', label: 'Twice as far' },
        { id: 'three', label: 'Three times as far' },
        { id: 'four', label: 'Four times as far', correct: true },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'five',
      kind: 'text',
      body: [
        `Both cars slow down at the same steady rate: ${is('a', acc(A))}. While the acceleration is **constant**, five quantities describe the motion.`,
        'Four equations link them. But look closely: none of the four uses all five.',
      ],
      card: { term: 's, u, v, a, t', text: 'Displacement s, initial velocity u, final velocity v, acceleration a and time t.' },
    },
    {
      id: 'missing',
      kind: 'choice',
      prompt: `Which of the five quantities is missing from ${whole('v² = u² + 2as')}?`,
      fig: { kind: 'equations', focus: 'v2as', leftOut: 'afterCheck' },
      options: [
        { id: 's', label: 's, the displacement', hint: 'Look at the last term, 2as: the s is there.' },
        { id: 'u', label: 'u, the initial velocity', hint: 'u is there, squared: u².' },
        { id: 't', label: 't, the time', correct: true },
        { id: 'none', label: 'None: it uses all five', hint: 'Count them: v, u, a and s. One of the five is not there.' },
      ],
      why: 'v² = u² + 2as has v, u, a and s, but no t. Each of the four equations leaves out a different quantity.',
    },
    {
      id: 'method',
      kind: 'text',
      body: [
        'In the exam all four equations are on the formula sheet. The skill is **picking** one: list what you **know** and what you **want**.',
        'Three knowns and one unknown make four quantities. The fifth, the one the problem never mentions, picks the equation: use the one **without it**.',
      ],
    },
    {
      id: 'brake-a',
      kind: 'build',
      prompt: `Car A slows at ${acc(-A)} from ${speed(UA)} until it stops. Pick the equation, then build how far it travels.`,
      fig: road({ cars: ONLY_A, values: true, showAcc: true, play: 'afterCheck' }),
      choose: {
        prompt: 'You know u and a, and "stops" gives you v. You want s. Which equation fits?',
        options: equations('v2as', { vuat: NO_S, sut: NEEDS_T, suvt: NEEDS_T }),
      },
      equation: 's = ({v}² − {u}²) ÷ (2 × {a})',
      boxes: { v: 'v0', u: 'uA', a: 'aSigned' },
      chips: [
        { id: 'v0', label: zero },
        { id: 'uA', label: speed(UA) },
        { id: 'aSigned', label: `${fixed(A, 1)}${NB}m${NB}s⁻²` },
        { id: 'aPlus', label: acc(-A), hint: 'The car is slowing down, so a is negative.' },
        { id: 'uB', label: speed(UB), hint: `That is car B's speed. Car A does ${speed(UA)}.` },
        { id: 'time', label: secs(x.tA), hint: 'That is the braking time. The equation needs speeds and a.' },
      ],
      result: { symbol: 's', value: x.brakeA.right, unit: 'm', sf: 2 },
      why: `"Stops" means v = 0. Then s = (0 − ${fixed(UA * UA, 0)}) ÷ (2 × (${fixed(A, 1)})) = ${metres(x.brakeA.right)}. From ${speed(UA)}, car A needs ${metres(x.brakeA.right)} of road.`,
    },
    {
      id: 'guess',
      kind: 'estimate',
      prompt: `Car A stops in ${metres(x.brakeA.right)}. Car B is twice as fast. Drag to where car B stops.`,
      fig: road({ values: true, showAcc: true }),
      after: road({ values: true, showAcc: true, play: true }),
      scale: { min: 0, max: 50, step: 1, tick: 10, unit: 'm', symbol: 's', dp: 0, label: 'Where car B stops' },
      answer: x.brakeB.right,
      tolerance: 3,
      why: `0 = ${fixed(UB, 1)}² + 2 × (${fixed(A, 1)}) × s gives s = ${metres(x.brakeB.right)}: four times car A's ${metres(x.brakeA.right)}.`,
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: 'Back to the two cars. Why does car B need four times the road, not twice?',
      fig: road({ values: true, showAcc: true }),
      options: [
        { id: 'twice', label: 'It has to lose twice the speed, so it needs twice the road', hint: 'It is also moving faster as it brakes. The road grows with u², not u.' },
        { id: 'brakes', label: "Car B's brakes work less well at high speed", hint: `Both cars slow at the same ${acc(-A)}. Only the speed differs.` },
        { id: 'square', label: 'u is squared: s = u² ÷ (−2a), so twice u gives four times s', correct: true },
      ],
      why: `s = u² ÷ (−2a) with the same a: double u and u² is four times as large. ${metres(x.brakeA.right)} becomes ${metres(x.brakeB.right)}.`,
    },
    {
      id: 'time',
      kind: 'tapFig',
      prompt: 'How long does car B take to stop? Use only the given values. Which equation fits?',
      instruction: 'Tap the equation you would use.',
      fig: { kind: 'equations', list: { known: { u: speed(UB), v: '0', a: acc(A) }, want: 't' } },
      options: equations('vuat', { sut: NEEDS_S, v2as: 'It has no t in it, and t is what you want.', suvt: NEEDS_S }),
      why: `s is not among the given values, so use the equation without it: 0 = ${fixed(UB, 1)} + (${fixed(A, 1)})t gives ${is('t', secs(x.tB))}. Twice the speed, twice the time.`,
    },
    {
      id: 'area',
      kind: 'text',
      body: ["Distance is the **area** under a v–t line. Car B's triangle holds four of car A's."],
      fig: { kind: 'brakeVt', a: A, cars: BOTH },
    },
    {
      id: 'scrub',
      kind: 'explore',
      instruction: 'Drag the slider to move car B through its braking.',
      fig: road({ cars: ONLY_B, values: true, showAcc: true, trail: true }),
      slider: { min: 0, max: x.tB, step: 0.05, tick: 0.5, label: 'Time since the brakes came on', unit: 's', symbol: 't', dp: 2 },
      question: {
        prompt: 'In which second does car B travel farthest?',
        options: [
          { id: 'first', label: 'The first second', correct: true },
          { id: 'last', label: 'The last second', hint: 'Compare the gaps between the marks on the road.' },
          { id: 'same', label: 'The same in every second', hint: 'Compare the gaps between the marks on the road.' },
        ],
        right: `Right: ${metres(x.perSecond[0])}, then ${metres(x.perSecond[1])}, then ${metres(x.perSecond[2])}. Speed falls evenly with time, not with distance.`,
      },
    },
    {
      id: 'reaction',
      kind: 'text',
      body: [
        'A real driver needs time to react. During the **reaction time** the car keeps its speed: a = 0, so s = ut.',
        'Then the brakes come on and a changes. One set of suvat values works only while a is **constant**, so treat each stage on its own.',
      ],
      card: { term: 'Stopping distance', text: 'Thinking distance at steady speed, plus braking distance while slowing down.' },
    },
    {
      id: 'stopping',
      kind: 'choice',
      prompt: `Car B's driver takes ${secs(REACT)} to react. How far does the car travel in total before it stops?`,
      fig: road({ cars: ONLY_B, span: SPAN_REACT, react: REACT, values: true, showAcc: true, play: 'afterCheck' }),
      options: [
        { id: 'braking-only', label: metres(x.stopping.brakingOnly), hint: `That is the braking alone. The car also moves during the ${secs(REACT)}.` },
        { id: 'half-thinking', label: metres(x.stopping.halfThinking), hint: 'While the driver reacts the car is not slowing yet: s = ut, with the full u.' },
        { id: 'right', label: metres(x.stopping.right), correct: true },
      ],
      why: `Thinking: s = ut = ${fixed(UB, 1)} × ${fixed(REACT, 2)} = ${metres(x.stopping.thinking)}. Braking: ${metres(x.stopping.brakingOnly)}, as before. In total ${metres(x.stopping.right)}.`,
    },
    {
      id: 'tree',
      kind: 'spotError',
      prompt: `Tariq says car B stops before a tree ${metres(TREE)} ahead. His working has one mistake. Which line?`,
      fig: road({ cars: ONLY_B, span: SPAN_REACT, react: REACT, tree: TREE, values: true, showAcc: true }),
      lines: [
        { id: 'data', text: `Car B: u = ${speed(UB)}, a = ${acc(A)}, reaction ${secs(REACT)}.`, hint: 'That line only copies the data.' },
        { id: 'braking', text: `Braking: s = (0 − ${fixed(UB, 1)}²) ÷ (2 × (${fixed(A, 1)})) = ${metres(x.brakeB.right)}`, hint: `That line is right: braking alone needs ${metres(x.brakeB.right)}.` },
        {
          id: 'compare',
          text: `${metres(x.brakeB.right)} is less than ${metres(TREE)}, so the car stops in time.`,
          wrong: true,
          fix: `${metres(x.stopping.thinking)} + ${metres(x.brakeB.right)} = ${metres(x.stopping.right)}, more than ${metres(TREE)}.`,
        },
        { id: 'end', text: `So the car stops ${metres(x.tree.shortBy)} before the tree.`, hint: 'This follows from the line above. It leaves out the thinking distance.' },
      ],
      why: `The car also travels ${metres(x.stopping.thinking)} while the driver reacts. In total ${metres(x.stopping.right)}: it reaches the tree at ${speed(x.tree.right)}.`,
    },
  ],
  skillCheck: [
    {
      id: 'train',
      kind: 'build',
      prompt: `A train slows steadily from ${speed(TRAIN.u)} to ${speed(TRAIN.v)} in ${secs(TRAIN.t, 1)}. Pick the equation, then build the distance it travels.`,
      choose: {
        prompt: 'You know u, v and t, and you want s. Which equation fits?',
        options: equations('suvt', { vuat: 'It has no s in it, and s is what you want.', sut: NEEDS_A, v2as: NEEDS_A }),
      },
      equation: 's = ½ × ({u} + {v}) × {t}',
      boxes: { u: 'u', v: 'v', t: 'time' },
      chips: [
        { id: 'u', label: speed(TRAIN.u) },
        { id: 'v', label: speed(TRAIN.v) },
        { id: 'time', label: secs(TRAIN.t, 1) },
        { id: 'average', label: speed(x.trainAverage), hint: 'That is the average velocity. The equation adds u and v itself.' },
        { id: 'a', label: `${fixed(-x.trainA, 2)}${NB}m${NB}s⁻²`, hint: 'That is the acceleration. It is not needed here.' },
      ],
      result: { symbol: 's', value: x.train, unit: 'm' },
      why: `You know u, v and t and want s. Nobody mentions a, so use s = ½(u + v)t = ½ × ${fixed(TRAIN.u + TRAIN.v, 1)} × ${fixed(TRAIN.t, 1)} = ${wholeMetres(x.train)}.`,
    },
    {
      id: 'root',
      kind: 'spotError',
      prompt: `A rider at ${speed(RIDER.u)} speeds up at ${acc(RIDER.a)}. How long does the rider take to cover ${metres(RIDER.s)}? Which line of this working is wrong?`,
      lines: [
        { id: 'sut', text: `s = ut + ½at²: ${fixed(RIDER.s, 1)} = ${fixed(RIDER.u, 1)}t + t²`, hint: `That line is right: ½ × ${fixed(RIDER.a, 1)} = 1.0.` },
        { id: 'factor', text: `t² + ${fixed(RIDER.u, 1)}t − ${fixed(RIDER.s, 1)} = 0, so (t − 2.0)(t + 6.0) = 0`, hint: 'The factorising is right: multiply it out to check.' },
        {
          id: 'pick',
          text: `t = ${secs(x.rider.right, 1)} or t = −${secs(-x.rider.negative, 1)}: the answer is −${secs(-x.rider.negative, 1)}`,
          wrong: true,
          fix: `t = ${secs(x.rider.right, 1)}: a time cannot be negative.`,
        },
      ],
      why: `The quadratic has two roots, but time only runs forwards: the negative one is thrown away. Check: ${fixed(RIDER.u, 1)} × ${fixed(x.rider.right, 1)} + ${fixed(x.rider.right, 1)}² = ${metres(RIDER.s)}.`,
    },
    {
      id: 'limit',
      kind: 'choice',
      prompt: "A town halves its speed limit. With the same brakes and the same reaction time, what happens to a car's stopping distance?",
      options: [
        { id: 'half', label: 'It halves' },
        { id: 'quarter', label: 'It falls to a quarter' },
        { id: 'between', label: 'It ends up between a quarter and a half', correct: true },
      ],
      why: 'Thinking distance is ut, so it halves. Braking distance depends on u², so it falls to a quarter. The total lands in between.',
    },
    {
      id: 'driver',
      kind: 'examCard',
      context: `A driver doing ${speed(DRIVER.u)} sees a hazard. The reaction time is ${secs(DRIVER.react, 2)}. Then the brakes slow the car at ${acc(-DRIVER.a)}.`,
      parts: [
        {
          id: 'a',
          command: 'Calculate',
          text: 'the thinking distance.',
          marks: 1,
          kind: 'build',
          build: {
            equation: 's = {u} × {t}',
            boxes: { u: 'speed', t: 'react' },
            chips: [
              { id: 'speed', label: speed(DRIVER.u) },
              { id: 'react', label: secs(DRIVER.react, 2) },
              { id: 'brake', label: acc(-DRIVER.a), hint: 'That is the braking acceleration. The car is not braking yet.' },
              { id: 'zero', label: zero, hint: 'The car is still at full speed during the reaction time.' },
            ],
            result: { symbol: 's', value: x.driver.thinking, unit: 'm' },
          },
          why: `During the reaction time a = 0, so s = ut = ${fixed(DRIVER.u, 1)} × ${fixed(DRIVER.react, 2)} = ${metres(x.driver.thinking)}.`,
        },
        {
          id: 'b',
          command: 'Calculate',
          text: 'the braking distance.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 's = ({v}² − {u}²) ÷ (2 × {a})',
            boxes: { v: 'v0', u: 'speed', a: 'aSigned' },
            chips: [
              { id: 'v0', label: zero },
              { id: 'speed', label: speed(DRIVER.u) },
              { id: 'aSigned', label: `${fixed(DRIVER.a, 1)}${NB}m${NB}s⁻²` },
              { id: 'aPlus', label: acc(-DRIVER.a), hint: 'The car is slowing down, so a is negative.' },
              { id: 'react', label: secs(DRIVER.react, 2), hint: 'That is the reaction time. It belongs to the thinking distance.' },
            ],
            result: { symbol: 's', value: x.driver.braking, unit: 'm' },
          },
          why: `The car stops, so v = 0: s = (0 − ${fixed(DRIVER.u * DRIVER.u, 0)}) ÷ (2 × (${fixed(DRIVER.a, 1)})) = ${metres(x.driver.braking)}. One mark for the values, one for the answer.`,
        },
      ],
    },
  ],
  youCanNow: [
    'Pick the suvat equation from what you know and what you want',
    'Spot hidden values, such as v = 0 when something stops',
    'Explain why twice the speed needs four times the braking distance',
  ],
  recap: {
    fig: road({ values: true, play: true }),
    text: `Twice the speed, four times the road: car A stops in ${metres(x.brakeA.right)}, car B needs ${metres(x.brakeB.right)}.`,
  },
  card: {
    formula: 's = ½(u + v)t',
    idea: 'Each suvat equation leaves one quantity out. Pick the one missing what you neither know nor want.',
  },
};
