// Lesson "Up, stop, down" — free fall with one sign convention, WPH11 points 1 and 11 (Core Practical 1).
// The puzzle: from a balcony 12.0 m up you throw ball A up and ball B down, both at 8.0 m s⁻¹. Which lands faster?
// The answer: the same, 17.3 m s⁻¹. Ball A comes back past your hand at −8.0 m s⁻¹ and then moves exactly like
// ball B; in v² = u² + 2as the sign of u drops out. Spec: docs/lessons/up-stop-down.md.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { G, gFromGradient, riseHeight, speedAfter, timeAtRest, timesForDisplacement, timeToReach, type Trip } from '../physics/kinematics.ts';
import { fixed, signed } from '../physics/format.ts';
import type { GraphFig, Lesson, ThrowFig } from './types.ts';

const NB = '\u00A0'; // numbers never break from their units
/** "8.0 m s⁻¹" */
const speed = (v: number) => `${fixed(v, 1)}${NB}m${NB}s⁻¹`;
/** "+8.0 m s⁻¹", "−8.0 m s⁻¹" */
const vel = (v: number) => `${signed(v, 1)}${NB}m${NB}s⁻¹`;
/** "2.58 s" */
const secs = (t: number) => `${fixed(t, 2)}${NB}s`;
/** "12.0 m" */
const metres = (x: number) => `${fixed(x, 1)}${NB}m`;
/** "−9.81 m s⁻²", "4.87 m s⁻²" */
const acc = (a: number) => `${fixed(a, 2)}${NB}m${NB}s⁻²`;
/** "a = −9.81 m s⁻²" that never breaks: a line may only break between two of these. */
const is = (name: string, value: string) => `${name}${NB}=${NB}${value}`;

// The balcony: your hand is H above the ground; ball A goes up at +U, ball B down at −U. Up is positive.
export const H = 12; // m
export const U = 8; // m s⁻¹
const A_MOTION = { s0: 0, u: U, a: -G }; // measured from your hand
const B_MOTION = { s0: 0, u: -U, a: -G };

/** The slider of the explore screen moves in these steps; it starts on the step nearest the top. */
const T_STEP = 0.02;

// Skill check numbers
export const CLIFF = { u: 6, h: 20 }; // a stone thrown up from a cliff top above the sea
export const DRONE_V = 3; // m s⁻¹, a drone rising steadily lets go of a parcel
export const GRADIENT = 4.87; // m s⁻², a student's gradient of h against t² (Core Practical 1)

/** Times, speeds and named mistakes, used by the screens and re-checked by up-stop-down.test.ts. */
export const ANSWERS = (() => {
  const tTop = timeAtRest(A_MOTION)!; // u / g
  const [tA, tNeg] = timesForDisplacement(-H, U, -G); // the two roots for ball A, largest first
  const tB = timeToReach(-H, B_MOTION)!;
  const impact = speedAfter(U, -G, -H)!; // the same for ball B: u is squared
  const fromRest = speedAfter(0, -G, -H)!;
  return {
    tTop,
    tBack: 2 * tTop, // up and back to the hand
    rise: riseHeight(U),
    tA,
    tNeg,
    tB,
    impact: {
      right: impact,
      ballB: speedAfter(-U, -G, -H)!,
      fromRest, // forgot that the balls leave your hand at 8.0 m s⁻¹
      added: U + fromRest, // added the speeds instead of using v² = u² + 2as
      minusU2: Math.sqrt(2 * G * H - U * U), // subtracted u² because ball A starts upward
    },
    roots: { right: tA, unsigned: -tNeg, sum: tA - tNeg },
    later: { right: tA - tB, onlyUp: tTop, whole: tA },
    cliff: { right: CLIFF.h + riseHeight(CLIFF.u), noCliff: riseHeight(CLIFF.u), lostHalf: CLIFF.h + (CLIFF.u * CLIFF.u) / G },
    g: { right: gFromGradient(GRADIENT), half: GRADIENT / 2, gradient: GRADIENT, book: G },
    sliderStart: Math.round(tTop / T_STEP) * T_STEP,
  };
})();

const throwFig = (over: Partial<ThrowFig>): ThrowFig => ({ kind: 'throw', h: H, u: U, balls: ['A', 'B'], ...over });

const x = ANSWERS;

/** Wrong graphs of the v–t pick: the speed (no sign), and a flat line. Up is positive, ball A flies for tBack. */
const SPEED_ONLY: Trip = { u: U, phases: [{ dt: x.tTop, a: -G }, { dt: x.tTop, a: G }] };
const STEADY_UP: Trip = { u: U, phases: [{ dt: x.tBack, a: 0 }] };
const vtOf = (id: string, trip: Trip): GraphFig => ({ kind: 'graph', y: 'v', header: `graph ${id}`, lines: [{ id: '', trip }], tMax: 1.8, tTick: 0.4, yMin: -10, yMax: 10, yTick: 5 });
/** "0 m s⁻¹": the velocity at the top */
const zero = `0${NB}m${NB}s⁻¹`;

export const upStopDown: Lesson = {
  id: 'up-stop-down',
  title: 'Up, stop, down',
  spec: [1, 11],
  minutes: 12,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'One motion, one sign', from: 'top' },
    { title: 'Back to the balls', from: 'hook-again' },
  ],
  cast: ['Zara'],
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Up, stop, down',
      body: `From a balcony ${metres(H)} up, you throw two balls at ${speed(U)}: ball A straight up, ball B straight down.`,
      fig: throwFig({}),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: 'Which ball hits the ground moving faster?',
      fig: throwFig({}),
      options: [
        { id: 'a', label: 'Ball A, thrown up' },
        { id: 'b', label: 'Ball B, thrown down' },
        { id: 'same', label: 'Both the same', correct: true },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'signs',
      kind: 'text',
      body: [`Take **up as positive**. Ball A starts with ${is('u', vel(U))}, ball B with ${is('u', vel(-U))}.`],
      fig: throwFig({ signs: true, values: true }),
    },
    {
      id: 'weight',
      kind: 'text',
      body: [
        'Once a ball leaves your hand, the only force on it is its **weight**, pulling down. (We ignore air resistance.)',
        'Ball A slows down on the way up, stops at the top for an instant, then falls back.',
      ],
    },
    {
      id: 'top',
      kind: 'tapFig',
      prompt: 'At the top, ball A stops for an instant. Which way does its acceleration point there?',
      instruction: 'Tap the acceleration you expect.',
      fig: throwFig({ balls: ['A'], at: 'top', candidates: true, trail: true }),
      options: [
        { id: 'up', label: 'Upward', hint: 'Only the weight acts on the ball, and weight points down.' },
        { id: 'zero', label: 'Nowhere: a = 0', hint: 'If a were zero at the top, v would stay zero and the ball would hang there.' },
        { id: 'down', label: 'Downward', correct: true },
      ],
      why: `The weight still acts at the top, so a = ${acc(-G)}. v is zero for an instant, but it keeps changing: from + to −.`,
    },
    {
      id: 'scrub',
      kind: 'explore',
      instruction: 'Drag the slider to move ball A through time.',
      fig: throwFig({ balls: ['A'], at: 'top', showAcc: true, values: true, trail: true }),
      slider: { min: 0, max: 1.2, step: T_STEP, tick: 0.2, label: 'Time since the throw', unit: 's', symbol: 't', dp: 2, start: x.sliderStart },
      question: {
        prompt: 'When is the acceleration of ball A zero?',
        options: [
          { id: 'top', label: 'At the top', hint: 'Stop the slider at the top and look at a.' },
          { id: 'down', label: 'On the way down', hint: 'Move past the top and watch a.' },
          { id: 'never', label: 'Never', correct: true },
        ],
        right: "That's right.",
      },
    },
    {
      id: 'at-top',
      kind: 'order',
      prompt: 'Why does ball A turn round at the top? Put the reasoning in order.',
      steps: [
        { id: 'v0', text: 'At the top the ball stops for an instant: v = 0.' },
        { id: 'weight', text: `The weight still pulls down, so a = ${acc(-G)}.` },
        { id: 'keeps', text: 'So v keeps changing: from positive, through zero, to negative.' },
        { id: 'back', text: 'The ball turns round and falls back down.' },
      ],
      hint: 'Start with v at the top, then the force, then what v does next.',
      why: `v = 0 is only an instant. The acceleration is ${acc(-G)} all the time, so v does not stay at zero.`,
    },
    {
      id: 'free-fall',
      kind: 'text',
      body: [`Up, stop and down are **one motion** with one acceleration. v falls by ${fixed(G, 2)}${NB}m${NB}s⁻¹ every second, straight through zero.`],
      card: { term: 'Free fall', text: 'Moving under gravity alone: a = g downward the whole time, even at the top where v = 0.' },
    },
    {
      id: 'rise',
      kind: 'estimate',
      prompt: `You throw ball A up at ${speed(U)}. Drag to how high above your hand it rises.`,
      fig: throwFig({ balls: ['A'] }),
      after: throwFig({ balls: ['A'], at: 'top', trail: true, values: true }),
      scale: { min: 0, max: 8, step: 0.1, tick: 1, unit: 'm', symbol: 's', dp: 1, label: 'Height above your hand' },
      answer: x.rise,
      tolerance: 0.5,
      why: `At the top v = 0, so 0 = ${fixed(U, 1)}² + 2 × (${fixed(-G, 2)}) × s gives s = ${metres(x.rise)}. Lower than most people guess.`,
    },
    {
      id: 'height',
      kind: 'build',
      prompt: 'Now build it. Up is positive. What goes into the equation?',
      fig: throwFig({ balls: ['A'], at: 'top', trail: true }),
      equation: 's = ({v}² − {u}²) ÷ (2 × {a})',
      boxes: { v: 'v0', u: 'uUp', a: 'aDown' },
      chips: [
        { id: 'v0', label: zero },
        { id: 'uUp', label: vel(U) },
        { id: 'aDown', label: `${signed(-G, 2)}${NB}m${NB}s⁻²` },
        { id: 'aUp', label: `${signed(G, 2)}${NB}m${NB}s⁻²`, hint: 'Gravity pulls down. With up positive, a is negative.' },
        { id: 'uDown', label: vel(-U), hint: 'Ball A is thrown up. With up positive, u is positive.' },
        { id: 'height', label: metres(H), hint: 'That is the balcony. The rise is measured from your hand.' },
      ],
      result: { symbol: 's', value: x.rise, unit: 'm' },
      why: `At the top v = 0: s = (0 − ${fixed(U * U, 0)}) ÷ (2 × (${fixed(-G, 2)})) = ${metres(x.rise)} above your hand.`,
    },
    {
      id: 'vt',
      kind: 'graphPick',
      prompt: "Which v–t graph shows ball A's whole flight, up and back to your hand? Up is positive.",
      scene: throwFig({ balls: ['A'], at: 'top', trail: true }),
      graphs: [
        { id: 'A', fig: vtOf('A', SPEED_ONLY), hint: 'That V is the speed. Velocity goes negative on the way down.' },
        { id: 'B', fig: { kind: 'throwVt', u: U, tEnd: x.tBack }, correct: true },
        { id: 'C', fig: vtOf('C', STEADY_UP), hint: 'A flat line is a steady velocity. Gravity changes v all the time.' },
      ],
      why: `v falls by ${fixed(G, 2)}${NB}m${NB}s⁻¹ every second, so v–t is one straight line of gradient ${acc(-G)}, through zero at the top.`,
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: 'Back to the two balls. How fast do they hit the ground?',
      fig: throwFig({ values: true, play: 'afterCheck' }),
      options: [
        { id: 'minus-u2', label: speed(x.impact.minusU2), hint: `u is squared, so its sign drops out: ${vel(U)} or ${vel(-U)} gives the same u².` },
        { id: 'from-rest', label: speed(x.impact.fromRest), hint: `That's a ball dropped from rest. These leave your hand at ${speed(U)}.` },
        { id: 'right', label: speed(x.impact.right), correct: true },
        { id: 'added', label: speed(x.impact.added), hint: "Speeds don't simply add. Put u² into v² = u² + 2as." },
      ],
      why: `v² = ${fixed(U, 1)}² + 2 × (${fixed(-G, 2)}) × (${fixed(-H, 1)}), so v = ${speed(x.impact.right)} for both. u is squared, so up or down makes no difference.`,
    },
    {
      id: 'roots',
      kind: 'choice',
      prompt: `For ball A the equation gives ${is('t', secs(x.tA))} or ${is('t', secs(x.tNeg))}. When does ball A hit the ground?`,
      options: [
        { id: 'unsigned', label: `${secs(x.roots.unsigned)} after the throw`, hint: "That's the negative root without its sign. A negative time is before the throw." },
        { id: 'back', label: `${secs(x.tBack)} after the throw`, hint: `That's when ball A passes your hand. It still has ${metres(H)} to fall.` },
        { id: 'right', label: `${secs(x.roots.right)} after the throw`, correct: true },
        { id: 'sum', label: `${secs(x.roots.sum)} after the throw`, hint: 'Only one root is the landing. The other one is before the throw.' },
      ],
      why: `t = ${secs(x.tNeg)} would be before the throw, so it is not the answer. Ball A lands ${secs(x.tA)} after you throw it.`,
    },
    {
      id: 'cp1',
      kind: 'text',
      body: [
        'In Core Practical 1 you measure g. Drop a ball **from rest** through a height h and time the fall: s = ut + ½at² becomes **h = ½gt²**.',
        'So a graph of h against t² is a straight line through the origin.',
      ],
    },
  ],
  skillCheck: [
    {
      id: 'cliff',
      kind: 'build',
      prompt: `A stone is thrown straight up at ${speed(CLIFF.u)} from a cliff ${metres(CLIFF.h)} above the sea. Build how high above the sea it rises.`,
      equation: 'h = {H} + (0² − {u}²) ÷ (2 × {a})',
      boxes: { H: 'cliff', u: 'speed', a: 'aDown' },
      chips: [
        { id: 'cliff', label: metres(CLIFF.h) },
        { id: 'speed', label: speed(CLIFF.u) },
        { id: 'aDown', label: `${signed(-G, 2)}${NB}m${NB}s⁻²` },
        { id: 'aUp', label: `${signed(G, 2)}${NB}m${NB}s⁻²`, hint: 'Gravity pulls down. With up positive, a is negative.' },
        { id: 'zero', label: zero, hint: `The stone leaves the hand at ${speed(CLIFF.u)}, not from rest.` },
      ],
      result: { symbol: 'h', value: x.cliff.right, unit: 'm' },
      why: `At the top v = 0: the rise is ${fixed(x.cliff.noCliff, 2)}${NB}m above the cliff, so ${metres(x.cliff.right)} above the sea.`,
    },
    {
      id: 'sign',
      kind: 'spotError',
      prompt: 'Zara finds how long ball A takes to reach the top. Her working has one mistake. Which line?',
      lines: [
        { id: 'signs', text: `Up is positive. At the top v = 0, and u = ${vel(U)}.`, hint: 'That line is right: v is zero for an instant at the top.' },
        { id: 'a', text: `Gravity acts on the ball, so a = ${signed(G, 2)}${NB}m${NB}s⁻².`, wrong: true, fix: `a = ${signed(-G, 2)}${NB}m${NB}s⁻²: gravity points down, and up is positive.` },
        { id: 'calc', text: `0 = ${fixed(U, 1)} + ${fixed(G, 2)}t, so t = ${signed(-x.tTop, 2)}${NB}s`, hint: 'This follows from the line above. A negative time is a warning sign.' },
      ],
      why: `With up positive, a = ${acc(-G)}. Then 0 = ${fixed(U, 1)} − ${fixed(G, 2)}t gives t = ${secs(x.tTop)}, a time after the throw.`,
    },
    {
      id: 'drone',
      kind: 'choice',
      prompt: `A drone rising at a steady ${speed(DRONE_V)} lets go of a parcel. Just after release, what are the parcel's v and a?`,
      options: [
        { id: 'rest', label: `${is('v', '0')}, ${is('a', acc(-G))}` },
        { id: 'right', label: `${is('v', vel(DRONE_V))}, ${is('a', acc(-G))}`, correct: true },
        { id: 'no-a', label: `${is('v', vel(DRONE_V))}, ${is('a', '0')}` },
      ],
      why: `Letting go changes the forces at once, not the velocity: the parcel still moves up at ${speed(DRONE_V)}, but only its weight acts now.`,
    },
    {
      id: 'cp1-card',
      kind: 'examCard',
      context: `A student drops a ball from rest through a height h and times the fall. Her graph of h against t² is a straight line through the origin with a gradient of ${acc(GRADIENT)}.`,
      fig: { kind: 'fallGraph', gradient: GRADIENT },
      parts: [
        {
          id: 'a',
          command: 'State',
          text: 'what the gradient of the graph represents.',
          marks: 1,
          kind: 'choice',
          options: [
            { id: 'right', label: 'Half of g, because h = ½gt²', correct: true },
            { id: 'g', label: 'g itself' },
            { id: 'two-g', label: 'Twice g' },
            { id: 'speed', label: 'The speed of the ball when it lands' },
          ],
          why: 'Compare h = ½gt² with y = mx: the gradient is ½g.',
        },
        {
          id: 'b',
          command: 'Determine',
          text: 'the value of g from her graph.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'g = {k} × {m}',
            boxes: { k: 'two', m: 'gradient' },
            chips: [
              { id: 'two', label: '2' },
              { id: 'gradient', label: acc(GRADIENT) },
              { id: 'half', label: '0.5', hint: 'g is twice the gradient, not half of it.' },
              { id: 'book', label: acc(G), hint: "That is the accepted value. Use this student's gradient." },
            ],
            result: { symbol: 'g', value: x.g.right, unit: 'm s⁻²' },
          },
          why: `The gradient is ½g, so g = 2 × ${fixed(GRADIENT, 2)} = ${acc(x.g.right)}. One mark for the factor 2, one for the answer.`,
        },
      ],
    },
  ],
  youCanNow: [
    `Explain why a = ${acc(-G)} even at the top, where v = 0`,
    'Solve up-and-down motion with one sign convention',
    'Pick the right root, and find g from an h–t² graph',
  ],
  recap: {
    fig: throwFig({ values: true, play: true }),
    text: `Up or down at ${speed(U)}, both balls land at ${speed(x.impact.right)}. Ball A just gets there ${secs(x.later.right)} later.`,
  },
  card: {
    formula: 'v² = u² + 2as',
    idea: `With up positive, a = ${acc(-G)} the whole flight: on the way up, at the top where v = 0, and down.`,
  },
};
