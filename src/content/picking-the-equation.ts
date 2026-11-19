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
export const CYCLIST = { u: 6, a: 0.5, t: 8 }; // a cyclist speeding up

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

export const pickingTheEquation: Lesson = {
  id: 'suvat',
  title: 'Picking the equation',
  spec: [1],
  minutes: 12,
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
        { id: 'four', label: 'Four times as far' },
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
      id: 'knowns',
      kind: 'choice',
      prompt: 'Car A brakes until it stops. You are given u and a. What else do you know?',
      fig: road({ cars: ONLY_A, values: true, showAcc: true }),
      options: [
        { id: 'nothing', label: 'Nothing else', hint: 'Read it again: the car stops. That word fixes one more quantity.' },
        { id: 't', label: 'The time: t = 0', hint: 't = 0 is only when the braking starts. How long it lasts is not given.' },
        { id: 'v', label: 'The final velocity: v = 0', correct: true },
        { id: 's', label: 'The displacement: s = 0', hint: 's is how far the car travels while braking. That is what we want.' },
      ],
      why: `"Stops" means ${is('v', '0')}. Words like "stops", "from rest" and "dropped" hide a known value, so read for them first.`,
    },
    {
      id: 'pick',
      kind: 'tapFig',
      prompt: 'You know u, v and a, and you want s. Which equation fits?',
      instruction: 'Tap the equation you would use.',
      fig: { kind: 'equations', list: { known: { u: speed(UA), v: '0', a: acc(A) }, want: 's' }, leftOut: 'shown' },
      options: equations('v2as', { vuat: 'It has no s in it, and s is what you want.', sut: NEEDS_T, suvt: NEEDS_T }),
      why: 'Time is the quantity nobody mentions, so use the equation without t. v² = u² + 2as has exactly u, v, a and s.',
    },
    {
      id: 'brake-a',
      kind: 'choice',
      prompt: `Put the numbers in: ${whole(`0 = ${fixed(UA, 1)}² + 2 × (${fixed(A, 1)}) × s`)}. How far does car A travel before it stops?`,
      fig: road({ cars: ONLY_A, values: true, showAcc: true, play: 'afterCheck' }),
      options: [
        { id: 'time', label: metres(x.brakeA.time), hint: `${fixed(UA, 1)} ÷ ${fixed(-A, 1)} = ${fixed(x.brakeA.time, 1)} is the braking time in seconds. u has to be squared.` },
        { id: 'right', label: metres(x.brakeA.right), correct: true },
        { id: 'lost-two', label: metres(x.brakeA.lostTwo), hint: "That's u² ÷ a. Don't lose the 2 in 2as." },
      ],
      why: `0 = ${fixed(UA * UA, 0)} − ${fixed(-2 * A, 1)}s, so s = ${metres(x.brakeA.right)}. From ${speed(UA)}, car A needs ${metres(x.brakeA.right)} of road to stop.`,
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Back to the puzzle. Car B brakes from ${speed(UB)} at the same rate. How far does it travel?`,
      fig: road({ values: true, showAcc: true, play: 'afterCheck' }),
      options: [
        { id: 'doubled', label: metres(x.brakeB.doubled), hint: `That is twice car A's ${metres(x.brakeA.right)}. But u is squared in the equation.` },
        { id: 'tripled', label: metres(x.brakeB.tripled), hint: 'Double u and u² becomes four times as large, not three times.' },
        { id: 'right', label: metres(x.brakeB.right), correct: true },
        { id: 'lost-two', label: metres(x.brakeB.lostTwo), hint: "That's u² ÷ a. Don't lose the 2 in 2as." },
      ],
      why: `0 = ${fixed(UB, 1)}² + 2 × (${fixed(A, 1)}) × s gives s = ${metres(x.brakeB.right)}: four times car A's ${metres(x.brakeA.right)}. u is squared, so twice the speed needs four times the road.`,
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
      id: 'still-fast',
      kind: 'choice',
      prompt: `Car B passes the spot where car A stopped, ${metres(x.brakeA.right)} after braking began. How fast is car B moving there?`,
      fig: road({ values: true, showAcc: true, parkedA: true, ask: { at: x.brakeA.right }, play: 'afterCheck' }),
      options: [
        { id: 'half', label: speed(x.passing.half), hint: `It has not lost half its speed yet. Use v² = u² + 2as with s = ${metres(x.brakeA.right)}.` },
        { id: 'even', label: speed(x.passing.evenWithDistance), hint: 'Speed does not fall evenly with distance. Use v² = u² + 2as.' },
        { id: 'right', label: speed(x.passing.right), correct: true },
        { id: 'lost-two', label: speed(x.passing.lostTwo), hint: `Keep the 2 in 2as: 2 × (${fixed(A, 1)}) × ${fixed(x.brakeA.right, 1)}.` },
      ],
      why: `v² = ${fixed(UB, 1)}² + 2 × (${fixed(A, 1)}) × ${fixed(x.brakeA.right, 1)}, so v = ${speed(x.passing.right)}. Where car A has stopped, car B has lost only ${speed(x.passing.lost)}.`,
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
      kind: 'choice',
      prompt: `A fallen tree lies ${metres(TREE)} ahead when car B's driver first sees it. What happens?`,
      fig: road({ cars: ONLY_B, span: SPAN_REACT, react: REACT, tree: TREE, values: true, showAcc: true, play: 'afterCheck' }),
      options: [
        { id: 'stops-short', label: `The car stops ${metres(x.tree.shortBy)} before the tree`, hint: `Braking needs ${metres(x.stopping.brakingOnly)}, but ${metres(x.stopping.thinking)} are gone before the brakes come on.` },
        { id: 'right', label: `It hits the tree at ${speed(x.tree.right)}`, correct: true },
        { id: 'lost-two', label: `It hits the tree at ${speed(x.tree.lostTwo)}`, hint: 'Keep the 2 in v² = u² + 2as.' },
        { id: 'wrong-sign', label: `It hits the tree at ${speed(x.tree.wrongSign)}`, hint: 'Faster than it started? While the car brakes, a is negative.' },
      ],
      why: `After ${metres(x.stopping.thinking)} of thinking only ${metres(x.tree.left)} are left. v² = ${fixed(UB, 1)}² + 2 × (${fixed(A, 1)}) × ${fixed(x.tree.left, 1)} gives v = ${speed(x.tree.right)}.`,
    },
  ],
  skillCheck: [
    {
      id: 'train',
      kind: 'tapFig',
      prompt: `A train slows steadily from ${speed(TRAIN.u)} to ${speed(TRAIN.v)} in ${secs(TRAIN.t, 1)}. Which equation gives the distance it travels in one step?`,
      instruction: 'Tap the equation you would use.',
      fig: { kind: 'equations' },
      options: equations('suvt'),
      why: `You know u, v and t and want s. Nobody mentions a, so use s = ½(u + v)t = ½ × ${fixed(TRAIN.u + TRAIN.v, 1)} × ${fixed(TRAIN.t, 1)} = ${wholeMetres(x.train)}.`,
    },
    {
      id: 'wet',
      kind: 'choice',
      prompt: `On a wet road car B can only slow at ${acc(-WET_A)}, half as hard. From the same ${speed(UB)}, what happens to its braking distance?`,
      options: [
        { id: 'same', label: `It stays ${metres(x.wet.same)}` },
        { id: 'right', label: `It doubles to ${metres(x.wet.right)}`, correct: true },
        { id: 'quadrupled', label: `It becomes four times as long: ${wholeMetres(x.wet.quadrupled)}` },
      ],
      why: `0 = u² + 2as gives s = u² ÷ (−2a). Halve the size of a and s doubles: ${metres(x.wet.right)}. Only u is squared, not a.`,
    },
    {
      id: 'cyclist',
      kind: 'choice',
      prompt: `A cyclist moving at ${speed(CYCLIST.u)} speeds up at ${fixed(CYCLIST.a, 2)}${NB}m${NB}s⁻² for ${secs(CYCLIST.t, 1)}. How far does the cyclist travel in that time?`,
      options: [
        { id: 'only-at2', label: metres(x.cyclist.onlyAt2) },
        { id: 'only-ut', label: metres(x.cyclist.onlyUt) },
        { id: 'right', label: metres(x.cyclist.right), correct: true },
        { id: 'lost-half', label: metres(x.cyclist.lostHalf) },
      ],
      why: `v is not needed, so s = ut + ½at² = ${fixed(CYCLIST.u, 1)} × ${fixed(CYCLIST.t, 1)} + ½ × ${fixed(CYCLIST.a, 2)} × ${fixed(CYCLIST.t, 1)}² = ${metres(x.cyclist.onlyUt)} + ${metres(x.cyclist.onlyAt2)} = ${metres(x.cyclist.right)}.`,
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
