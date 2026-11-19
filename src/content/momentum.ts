// Lesson "Momentum" — p = mv (WPH11 point 13), a vector with a sign, the change in momentum and the total momentum.
// The puzzle: two 0.80 kg trolleys hit a wall at 1.5 m s⁻¹. A bounces back at 1.0 m s⁻¹, B stops dead. Which has the
// bigger change in momentum? A, by a lot: −2.00 against −1.20 kg m s⁻¹. Towards the wall is positive.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { G } from '../physics/kinematics.ts';
import { momentum, momentumChange, speedFromMomentum, totalMomentum } from '../physics/momentum.ts';
import { fixed, signed } from '../physics/format.ts';
import type { BodiesFig, Lesson, WallFig } from './types.ts';

const NB = '\u00A0';
const UNIT = `${NB}kg${NB}m${NB}s⁻¹`;
/** "1.20 kg m s⁻¹". */
export const kgms = (x: number, dp = 2): string => `${fixed(x, dp)}${UNIT}`;
/** "−0.80 kg m s⁻¹", "+0.80 kg m s⁻¹", and "0 kg m s⁻¹" for zero. */
export const sgn = (x: number, dp = 2): string => (Math.abs(x) < 1e-9 ? `0${UNIT}` : `${signed(x, dp)}${UNIT}`);
const ms = (x: number, dp = 1): string => `${fixed(x, dp)}${NB}m${NB}s⁻¹`;
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** "4.05 × 10⁷": standard form to 3 significant figures. */
export const sci = (x: number): string => {
  const e = Math.floor(Math.log10(Math.abs(x)));
  return `${fixed(x / 10 ** e, 2)} × 10${[...String(e)].map((d) => SUP[Number(d)]).join('')}`;
};

// The story and the numbers of each question.
export const M = 0.8; // kg, each trolley (the lab trolley of "Force and acceleration")
export const U = 1.5; // m s⁻¹, towards the wall
export const BACK = 1.0; // m s⁻¹, A's speed after the bounce
export const CRICKET = { m: 0.16, v: 35 }; // kg, m s⁻¹
export const BOWLING = { m: 5.0, v: 1.2 }; // kg, m s⁻¹
export const C = { m: 1.2, v: -1.0 }; // trolley C heading at A
export const CAR = { m: 1500, p: 27000 }; // kg, kg m s⁻¹
export const TENNIS = { m: 0.058, u: 30, v: 22 }; // kg, m s⁻¹ in, m s⁻¹ out
export const DROP = { m: 0.5, t: 1.2 }; // kg, s
export const SKATERS = { a: { m: 70, v: 3.0 }, b: { m: 50, v: -4.0 } }; // east positive

const p0 = momentum(M, U);
const pBack = momentum(M, -BACK);
const dpA = momentumChange(M, U, -BACK);
const dpB = momentumChange(M, U, 0);
const vDrop = G * DROP.t;

/** Answers and named mistakes, used by the screens and re-checked by momentum.test.ts. */
export const ANSWERS = {
  first: { right: p0, mOverV: M / U, vOverM: U / M },
  back: { right: pBack, plus: -pBack, zero: 0, before: -p0 },
  stop: { right: dpB, reversed: -dpB, final: 0 },
  /** The puzzle: A's change in momentum. */
  bounce: { right: dpA, sizes: -(Math.abs(p0) - Math.abs(pBack)), reversed: -dpA, likeB: dpB },
  /** The explore slider at its ends: a dead stop and a bounce back at full speed. */
  explore: { stop: dpB, full: momentumChange(M, U, -U) },
  balls: { cricket: momentum(CRICKET.m, CRICKET.v), bowling: momentum(BOWLING.m, BOWLING.v) },
  headOn: { right: totalMomentum([{ m: M, v: U }, C]), sizes: Math.abs(p0) + Math.abs(momentum(C.m, C.v)), aOnly: p0 },
  car: { right: speedFromMomentum(CAR.p, CAR.m), mOverP: CAR.m / CAR.p, times: CAR.m * CAR.p, twice: (2 * CAR.p) / CAR.m },
  tennis: {
    right: Math.abs(momentumChange(TENNIS.m, TENNIS.u, -TENNIS.v)),
    speeds: TENNIS.m * (TENNIS.u - TENNIS.v),
    before: momentum(TENNIS.m, TENNIS.u),
    after: momentum(TENNIS.m, TENNIS.v),
  },
  drop: { v: vDrop, right: momentum(DROP.m, vDrop), mt: DROP.m * DROP.t, weight: DROP.m * G, average: momentum(DROP.m, vDrop / 2) },
  skaters: {
    right: totalMomentum([SKATERS.a, SKATERS.b]),
    sizes: Math.abs(momentum(SKATERS.a.m, SKATERS.a.v)) + Math.abs(momentum(SKATERS.b.m, SKATERS.b.v)),
  },
};

const wall = (over: Partial<WallFig>): WallFig => ({ kind: 'wall', m: M, u: U, back: BACK, trolleys: ['A'], ...over });
const X = ANSWERS;

const balls: BodiesFig = {
  kind: 'bodies',
  header: 'right is +',
  bodies: [
    { id: 'cricket', look: 'cricket', ...CRICKET },
    { id: 'bowling', look: 'bowling', ...BOWLING },
  ],
  p: 'afterCheck',
};
const headOn: BodiesFig = {
  kind: 'bodies',
  header: 'A and C head at each other',
  shared: true,
  bodies: [
    { id: 'A', look: 'trolley', m: M, v: U },
    { id: 'C', look: 'trolley', ...C },
  ],
  p: 'afterCheck',
  total: 'afterCheck',
};

export const momentumLesson: Lesson = {
  id: 'momentum',
  title: 'Momentum',
  spec: [13],
  minutes: 11,
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Momentum',
      body: `Two ${fixed(M, 2)} kg trolleys roll into a wall at ${ms(U)}. A has a spring buffer, B a lump of putty.`,
      fig: wall({ trolleys: ['A', 'B'], play: true }),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: `A bounces back at ${ms(BACK)}. B stops dead. Which trolley has the bigger change in momentum?`,
      fig: wall({ trolleys: ['A', 'B'], play: true }),
      options: [
        { id: 'A', label: 'Trolley A, which bounces back' },
        { id: 'B', label: 'Trolley B, which stops dead' },
        { id: 'same', label: 'Both the same' },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'p',
      kind: 'text',
      body: [
        "A moving body's **momentum** is its mass times its velocity: **p = mv**. Its unit is kg m s⁻¹.",
        'A heavy, fast body has a lot of it. Momentum is a **vector**: it points the same way as the velocity.',
      ],
      card: { term: 'Momentum', text: 'p = mv, mass × velocity, in kg m s⁻¹. A vector, in the direction of the velocity.' },
    },
    {
      id: 'first-p',
      kind: 'choice',
      prompt: `Trolley A, ${fixed(M, 2)} kg, rolls towards the wall at ${ms(U)}. What is its momentum?`,
      fig: wall({ p: 'afterCheck' }),
      options: [
        { id: 'm-over-v', label: kgms(X.first.mOverV, 3), hint: 'That is m ÷ v. Momentum is mass times velocity.' },
        { id: 'right', label: kgms(X.first.right), correct: true },
        { id: 'newton', label: `${fixed(X.first.right, 2)}${NB}N`, hint: 'The newton is a unit of force. Momentum is in kg m s⁻¹.' },
        { id: 'v-over-m', label: kgms(X.first.vOverM), hint: 'That is v ÷ m. Multiply the mass by the velocity.' },
      ],
      why: `p = mv = ${fixed(M, 2)} kg × ${ms(U)} = ${kgms(p0)}, pointing towards the wall.`,
    },
    {
      id: 'signs',
      kind: 'text',
      body: [
        'Choose a positive direction, as you do for velocity. Here **towards the wall is +**.',
        'After the bounce, trolley A moves the other way. Its velocity is negative, so its **momentum is negative** too.',
      ],
    },
    {
      id: 'back-p',
      kind: 'choice',
      prompt: `A bounces back at ${ms(BACK)}. Towards the wall is positive. What is A's momentum now?`,
      fig: wall({ at: 'after', p: 'afterCheck' }),
      options: [
        { id: 'plus', label: sgn(X.back.plus), hint: 'A now moves away from the wall, the negative way.' },
        { id: 'zero', label: sgn(X.back.zero), hint: 'A is still moving, so it still has momentum.' },
        { id: 'right', label: sgn(X.back.right), correct: true },
        { id: 'before', label: sgn(X.back.before), hint: `Use its new speed, ${ms(BACK)}, not the old one.` },
      ],
      why: `p = ${fixed(M, 2)} × (${signed(-BACK, 1)}) = ${sgn(pBack)}. The minus sign says it points away from the wall.`,
    },
    {
      id: 'change',
      kind: 'text',
      body: [
        'The **change in momentum** is final minus initial: **Δp = mv − mu**. Put each momentum in with its sign.',
        'A trolley that ends with less momentum in the + direction has a negative Δp.',
      ],
      card: { term: 'Change in momentum', text: 'Δp = mv − mu: final momentum minus initial momentum, each with its sign.' },
    },
    {
      id: 'stop-dp',
      kind: 'choice',
      prompt: `Trolley B hits the wall at ${ms(U)} and stops dead. What is its change in momentum?`,
      fig: wall({ trolleys: ['B'], at: 'after', ledger: 'afterCheck' }),
      options: [
        { id: 'reversed', label: sgn(X.stop.reversed), hint: 'Final minus initial: 0 − (+1.20).' },
        { id: 'right', label: sgn(X.stop.right), correct: true },
        { id: 'final', label: sgn(X.stop.final), hint: 'Zero is its final momentum, not the change.' },
      ],
      why: `Δp = 0 − (+${fixed(p0, 2)}) = ${sgn(dpB)}. The change points away from the wall: the wall pushed B back.`,
    },
    {
      id: 'bounce',
      kind: 'explore',
      instruction: "Drag the slider to change how fast trolley A bounces back. Watch Δp on the momentum line.",
      fig: wall({ p: 'shown', ledger: 'shown', play: true }),
      slider: { min: 0, max: U, step: 0.1, tick: 0.5, label: 'Bounce speed', unit: 'm s⁻¹', symbol: 'v', dp: 1, start: BACK },
      question: {
        prompt: 'Which landing changes the momentum the most?',
        options: [
          { id: 'stop', label: 'Stopping dead', hint: 'Set the slider to 0, then to 1.5, and compare Δp.' },
          { id: 'right', label: 'Bouncing back as fast as it came', correct: true },
          { id: 'same', label: 'They all change it the same', hint: 'Watch the Δp arrow as you drag: its length changes.' },
        ],
        right: `Right: ${sgn(X.explore.full)} for a full bounce, twice the ${sgn(X.explore.stop)} of a dead stop.`,
      },
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Back to the puzzle. A hits at ${ms(U)} and bounces back at ${ms(BACK)}. What is A's change in momentum?`,
      fig: wall({ ledger: 'afterCheck', at: 'after' }),
      options: [
        { id: 'sizes', label: sgn(X.bounce.sizes), hint: 'You dropped the signs. Coming back, p is negative: −0.80.' },
        { id: 'reversed', label: sgn(X.bounce.reversed), hint: 'Final minus initial, not initial minus final.' },
        { id: 'like-b', label: sgn(X.bounce.likeB), hint: 'That only takes its momentum to zero. A goes on, the other way.' },
        { id: 'right', label: sgn(X.bounce.right), correct: true },
      ],
      why: `Δp = (${signed(pBack, 2)}) − (+${fixed(p0, 2)}) = ${sgn(dpA)}, bigger than B's ${sgn(dpB)}. The wall stops A, then pushes it back.`,
    },
    {
      id: 'heavy-fast',
      kind: 'choice',
      prompt: `Which has more momentum: a ${fixed(CRICKET.m, 2)} kg cricket ball at ${CRICKET.v} m s⁻¹, or a ${fixed(BOWLING.m, 1)} kg bowling ball rolling at ${fixed(BOWLING.v, 1)} m s⁻¹?`,
      fig: balls,
      options: [
        { id: 'cricket', label: 'The cricket ball', hint: 'Fast, but very light. Multiply each mass by its speed.' },
        { id: 'right', label: 'The bowling ball', correct: true },
        { id: 'same', label: 'They have the same', hint: 'Close, but not equal. Multiply each mass by its speed.' },
      ],
      why: `Cricket ball: ${fixed(CRICKET.m, 2)} × ${CRICKET.v} = ${kgms(X.balls.cricket)}. Bowling ball: ${fixed(BOWLING.m, 1)} × ${fixed(BOWLING.v, 1)} = ${kgms(X.balls.bowling)}. Mass counts as much as speed.`,
    },
    {
      id: 'total',
      kind: 'text',
      body: [
        'Several bodies have a **total momentum**: add each momentum with its sign.',
        'Momenta that point opposite ways partly cancel, like velocities do.',
      ],
      card: { term: 'Total momentum', text: 'The sum of the momentum of every body, each with its sign. Opposite momenta can cancel.' },
    },
    {
      id: 'head-on',
      kind: 'choice',
      prompt: `Trolley A (${fixed(M, 2)} kg) rolls right at ${ms(U)}. Trolley C (${fixed(C.m, 2)} kg) rolls left at ${ms(-C.v)}. What is their total momentum?`,
      fig: headOn,
      options: [
        { id: 'sizes', label: kgms(X.headOn.sizes), hint: 'They move opposite ways, so one momentum is negative.' },
        { id: 'right', label: sgn(X.headOn.right), correct: true },
        { id: 'a-only', label: kgms(X.headOn.aOnly), hint: "That is A alone. Add C's momentum, with its sign." },
      ],
      why: `A: +${fixed(p0, 2)}. C: ${fixed(C.m, 2)} × (${signed(C.v, 1)}) = ${signed(momentum(C.m, C.v), 2)}. They cancel: two moving trolleys, zero total. More on that next lesson.`,
    },
    {
      id: 'rules',
      kind: 'text',
      body: [
        'Momentum is **p = mv**, a vector: choose a positive direction and give every momentum its sign.',
        '**Δp = mv − mu**. A bounce changes momentum more than a dead stop: the wall stops the body, then pushes it back.',
      ],
    },
  ],
  skillCheck: [
    {
      id: 'car',
      kind: 'choice',
      prompt: `A ${CAR.m} kg car has a momentum of 27${NB}000 kg m s⁻¹. How fast is it moving?`,
      options: [
        { id: 'm-over-p', label: ms(X.car.mOverP, 4) },
        { id: 'right', label: ms(X.car.right), correct: true },
        { id: 'twice', label: ms(X.car.twice) },
        { id: 'times', label: `${sci(X.car.times)}${NB}m${NB}s⁻¹` },
      ],
      why: `v = p / m = 27${NB}000 / ${CAR.m} = ${ms(X.car.right)}.`,
    },
    {
      id: 'tennis',
      kind: 'choice',
      prompt: `A ${fixed(TENNIS.m, 3)} kg tennis ball hits a wall at ${TENNIS.u} m s⁻¹ and rebounds at ${TENNIS.v} m s⁻¹. What is the size of the change in its momentum?`,
      options: [
        { id: 'speeds', label: kgms(X.tennis.speeds, 3) },
        { id: 'before', label: kgms(X.tennis.before) },
        { id: 'right', label: kgms(X.tennis.right), correct: true },
        { id: 'after', label: kgms(X.tennis.after) },
      ],
      why: `Towards the wall +: Δp = ${fixed(TENNIS.m, 3)} × (−${TENNIS.v}) − ${fixed(TENNIS.m, 3)} × ${TENNIS.u} = −${fixed(X.tennis.right, 2)}. Its size is ${kgms(X.tennis.right)}.`,
    },
    {
      id: 'drop',
      kind: 'choice',
      prompt: `A ${fixed(DROP.m, 2)} kg ball is dropped from rest and falls for ${fixed(DROP.t, 1)} s. Air resistance is negligible. What is its momentum just before it lands?`,
      options: [
        { id: 'mt', label: `${kgms(X.drop.mt, 3)} downward` },
        { id: 'weight', label: `${kgms(X.drop.weight)} downward` },
        { id: 'average', label: `${kgms(X.drop.average)} downward` },
        { id: 'right', label: `${kgms(X.drop.right)} downward`, correct: true },
      ],
      why: `v = u + at = 0 + ${G} × ${fixed(DROP.t, 1)} = ${ms(vDrop, 2)}, so p = ${fixed(DROP.m, 2)} × ${fixed(vDrop, 2)} = ${kgms(X.drop.right)}, downward.`,
    },
    {
      id: 'skaters',
      kind: 'choice',
      prompt: `A ${SKATERS.a.m} kg skater glides east at ${fixed(SKATERS.a.v, 1)} m s⁻¹. A ${SKATERS.b.m} kg skater glides west at ${fixed(-SKATERS.b.v, 1)} m s⁻¹. What is their total momentum?`,
      options: [
        { id: 'sizes', label: `${kgms(X.skaters.sizes, 0)} east` },
        { id: 'right', label: `${kgms(X.skaters.right, 0)} east`, correct: true },
        { id: 'west', label: `${kgms(X.skaters.right, 0)} west` },
        { id: 'zero', label: 'Zero' },
      ],
      why: `East +: ${SKATERS.a.m} × ${fixed(SKATERS.a.v, 1)} + ${SKATERS.b.m} × (${signed(SKATERS.b.v, 1)}) = ${momentum(SKATERS.a.m, SKATERS.a.v)} − ${-momentum(SKATERS.b.m, SKATERS.b.v)} = +${fixed(X.skaters.right, 0)}, so ${kgms(X.skaters.right, 0)} east.`,
    },
  ],
  youCanNow: [
    'Calculate momentum with p = mv, in kg m s⁻¹',
    'Give momentum a sign from a chosen positive direction',
    'Find a change in momentum for a stop or a bounce',
    'Add momenta with their signs to find a total',
  ],
  recap: {
    fig: wall({ trolleys: ['A', 'B'], at: 'after', ledger: 'shown' }),
    text: `A bounce changes momentum more than a dead stop: ${sgn(dpA)} against ${sgn(dpB)}.`,
  },
  card: {
    formula: 'p = mv',
    idea: 'Momentum is mass times velocity, a vector: a bounce changes it more than a dead stop.',
  },
};
