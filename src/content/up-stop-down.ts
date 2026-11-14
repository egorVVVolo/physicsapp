// Lesson "Up, stop, down" — free fall with one sign convention, WPH11 points 1 and 11 (Core Practical 1).
// The puzzle: from a balcony 12.0 m up you throw ball A up and ball B down, both at 8.0 m s⁻¹. Which lands faster?
// The answer: the same, 17.3 m s⁻¹. Ball A comes back past your hand at −8.0 m s⁻¹ and then moves exactly like
// ball B; in v² = u² + 2as the sign of u drops out. Spec: docs/lessons/up-stop-down.md.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { G, gFromGradient, riseHeight, speedAfter, timeAtRest, timesForDisplacement, timeToReach } from '../physics/kinematics.ts';
import { fixed, signed } from '../physics/format.ts';
import type { Lesson, ThrowFig } from './types.ts';

const NB = ' '; // numbers never break from their units
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

export const upStopDown: Lesson = {
  id: 'up-stop-down',
  title: 'Up, stop, down',
  spec: [1, 11],
  minutes: 12,
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
        { id: 'same', label: 'Both the same' },
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
      id: 'free-fall',
      kind: 'text',
      body: [`Up, stop and down are **one motion** with one acceleration. v falls by ${fixed(G, 2)}${NB}m${NB}s⁻¹ every second, straight through zero.`],
      card: { term: 'Free fall', text: 'Moving under gravity alone: a = g downward the whole time, even at the top where v = 0.' },
    },
    {
      id: 'back',
      kind: 'choice',
      prompt: 'Ball A falls back past your hand. What is its velocity now?',
      fig: throwFig({ balls: ['A'], at: 'back', unknownV: true, values: true, trail: true }),
      options: [
        { id: 'plus', label: vel(U), hint: "That's the right speed, but the ball is moving down now. Up is positive." },
        { id: 'minus', label: vel(-U), correct: true },
        { id: 'slower', label: `Between 0 and ${vel(-U)}`, hint: 'Going down it gains speed at the same rate it lost it going up.' },
        { id: 'faster', label: `Faster than ${speed(U)}, downward`, hint: 'Up and back down take the same time, with the same a.' },
      ],
      why: `v² = u² + 2as with s = 0 gives v = ±${speed(U)}. The ball is moving down, so v = ${vel(-U)}: the same speed, the other way.`,
    },
    {
      id: 'vt',
      kind: 'text',
      body: [`On a v–t graph the flight is **one straight line**, with gradient ${acc(-G)}.`],
      fig: { kind: 'throwVt', u: U, tEnd: x.tBack },
    },
    {
      id: 'alike',
      kind: 'text',
      body: [`Back at your hand, ball A moves exactly like ball B at the start: ${vel(-U)}, down.`],
      fig: throwFig({ at: 'back', play: true }),
    },
    {
      id: 'v2',
      kind: 'text',
      body: [`To find a speed without the time, use **v² = u² + 2as**. Keep every sign: down to the ground, s = ${metres(-H)} and a = ${acc(-G)}.`],
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: 'Back to the puzzle. How fast do the balls hit the ground?',
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
      id: 'values',
      kind: 'choice',
      prompt: 'Now the time. Which values go into s = ut + ½at² for ball A, down to the ground?',
      options: [
        { id: 's-plus', label: `${is('s', metres(H))}, ${is('u', vel(U))}, ${is('a', acc(-G))}`, hint: 'The ground is below your hand. With up positive, s is negative.' },
        { id: 'right', label: `${is('s', metres(-H))}, ${is('u', vel(U))}, ${is('a', acc(-G))}`, correct: true },
        { id: 'a-plus', label: `${is('s', metres(-H))}, ${is('u', vel(U))}, ${is('a', '+' + acc(G))}`, hint: 'Gravity pulls down. With up positive, a is negative.' },
        { id: 'rest', label: `${is('s', metres(-H))}, ${is('u', '0')}, ${is('a', acc(-G))}`, hint: `The ball leaves your hand at ${speed(U)}, not from rest.` },
      ],
      why: `Measure from your hand with up positive: the ground is ${metres(H)} below (s = ${metres(-H)}), the throw is up (u = ${vel(U)}), gravity is down.`,
    },
    {
      id: 'roots',
      kind: 'choice',
      prompt: `The equation gives ${is('t', secs(x.tA))} or ${is('t', secs(x.tNeg))}. When does ball A hit the ground?`,
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
    {
      id: 'gradient',
      kind: 'choice',
      prompt: `A student's graph of h against t² has a gradient of ${acc(GRADIENT)}. What value of g do they get?`,
      fig: { kind: 'fallGraph', gradient: GRADIENT },
      options: [
        { id: 'half', label: acc(x.g.half), hint: 'The gradient is g ÷ 2, so g is twice the gradient, not half of it.' },
        { id: 'gradient', label: acc(x.g.gradient), hint: 'The gradient is not g itself. Compare h = ½gt² with y = mx.' },
        { id: 'right', label: acc(x.g.right), correct: true },
        { id: 'book', label: acc(x.g.book), hint: "That's the accepted value. What does this student's graph give?" },
      ],
      why: `Compare h = ½gt² with y = mx: the gradient is ½g. So g = 2 × ${fixed(GRADIENT, 2)} = ${acc(x.g.right)}.`,
    },
  ],
  skillCheck: [
    {
      id: 'later',
      kind: 'choice',
      prompt: 'Ball A lands later than ball B. How much later?',
      fig: throwFig({}),
      options: [
        { id: 'only-up', label: secs(x.later.onlyUp) },
        { id: 'right', label: secs(x.later.right), correct: true },
        { id: 'whole', label: secs(x.later.whole) },
      ],
      why: `First ball A goes up and falls back to your hand: 2u/g = ${secs(x.later.right)}. From there it moves exactly like ball B.`,
    },
    {
      id: 'cliff',
      kind: 'choice',
      prompt: `A stone is thrown straight up at ${speed(CLIFF.u)} from a cliff ${metres(CLIFF.h)} above the sea. How high above the sea does it rise?`,
      options: [
        { id: 'no-cliff', label: metres(x.cliff.noCliff) },
        { id: 'right', label: metres(x.cliff.right), correct: true },
        { id: 'lost-half', label: metres(x.cliff.lostHalf) },
      ],
      why: `At the top v = 0, so 0 = ${fixed(CLIFF.u, 1)}² + 2 × (${fixed(-G, 2)}) × s: s = ${fixed(x.cliff.noCliff, 2)}${NB}m above the cliff, ${metres(x.cliff.right)} above the sea.`,
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
      id: 'timer',
      kind: 'choice',
      prompt: 'In Core Practical 1 a student times each fall with a stopwatch. Which change improves their value of g most?',
      options: [
        { id: 'heavier', label: 'Use a heavier ball' },
        { id: 'smaller', label: 'Drop the ball from smaller heights' },
        { id: 'gate', label: 'Use a light gate and an electronic timer', correct: true },
        { id: 'plot-t', label: 'Plot h against t instead of t²' },
      ],
      why: "Every stopwatch time includes the student's reaction time. A timer started and stopped by the falling ball removes that error.",
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
