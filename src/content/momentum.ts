// Lesson "Momentum" — p = mv (WPH11 point 13), a vector with a sign, the change in momentum and the total momentum.
// The puzzle: two 0.80 kg trolleys hit a wall at 1.5 m s⁻¹. A bounces back at 1.0 m s⁻¹, B stops dead. Which has the
// bigger change in momentum? A, by a lot: −2.00 against −1.20 kg m s⁻¹. Towards the wall is positive.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { G } from '../physics/kinematics.ts';
import { momentum, momentumChange, totalMomentum } from '../physics/momentum.ts';
import { fixed, signed } from '../physics/format.ts';
import type { BodiesFig, Lesson, WallFig } from './types.ts';

const NB = '\u00A0';
const UNIT = `${NB}kg${NB}m${NB}s⁻¹`;
/** "1.20 kg m s⁻¹". */
export const kgms = (x: number, dp = 2): string => `${fixed(x, dp)}${UNIT}`;
/** "−0.80 kg m s⁻¹", "+0.80 kg m s⁻¹", and "0 kg m s⁻¹" for zero. */
export const sgn = (x: number, dp = 2): string => (Math.abs(x) < 1e-9 ? `0${UNIT}` : `${signed(x, dp)}${UNIT}`);
const ms = (x: number, dp = 1): string => `${fixed(x, dp)}${NB}m${NB}s⁻¹`;
// The story and the numbers of each question.
export const M = 0.8; // kg, each trolley (the lab trolley of "Force and acceleration")
export const U = 1.5; // m s⁻¹, towards the wall
export const BACK = 1.0; // m s⁻¹, A's speed after the bounce
export const CRICKET = { m: 0.16, v: 35 }; // kg, m s⁻¹
export const BOWLING = { m: 5.0, v: 1.2 }; // kg, m s⁻¹
export const C = { m: 1.2, v: -1.0 }; // trolley C heading at A
export const REBOUND = { m: 0.5, u: 1.4, back: 0.6 }; // kg, m s⁻¹ towards the wall, m s⁻¹ after the rebound (exam card)
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
  rebound: {
    p0: momentum(REBOUND.m, REBOUND.u),
    pf: momentum(REBOUND.m, -REBOUND.back),
    right: momentumChange(REBOUND.m, REBOUND.u, -REBOUND.back),
    forgot: momentumChange(REBOUND.m, REBOUND.u, REBOUND.back),
  },
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


/** "+1.5 m s⁻¹", "−1.0 m s⁻¹": a velocity with its sign, as a chip. */
const vel = (x: number, dp = 1): string => (x === 0 ? `0${NB}m${NB}s⁻¹` : `${signed(x, dp)}${NB}m${NB}s⁻¹`);

export const momentumLesson: Lesson = {
  id: 'momentum',
  title: 'Momentum',
  spec: [13],
  minutes: 11,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'What momentum is', from: 'p' },
    { title: 'Changes and totals', from: 'change' },
  ],
  cast: ['Ravi'],
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
        { id: 'A', label: 'Trolley A, which bounces back', correct: true },
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
      id: 'change',
      kind: 'text',
      body: [
        "Choose a positive direction: here **towards the wall is +**. A's bounce reverses its velocity, so its momentum turns negative.",
        'The **change in momentum** is final minus initial: **Δp = mv − mu**, each momentum with its sign.',
      ],
      card: { term: 'Change in momentum', text: 'Δp = mv − mu: final momentum minus initial momentum, each with its sign.' },
    },
    {
      id: 'stop-build',
      kind: 'build',
      prompt: `Trolley B hits the wall at ${ms(U)} and stops dead. Towards the wall is positive. Build its change in momentum.`,
      fig: wall({ trolleys: ['B'], at: 'after', ledger: 'afterCheck' }),
      equation: 'Δp = {m} × ({v} − {u})',
      boxes: { m: 'mass', v: 'final', u: 'initial' },
      chips: [
        { id: 'mass', label: `${fixed(M, 2)}${NB}kg` },
        { id: 'final', label: vel(0) },
        { id: 'initial', label: vel(U) },
        { id: 'wrongway', label: vel(-U), hint: 'B rolled towards the wall, the positive way: u = +1.5.' },
        { id: 'p', label: kgms(p0), hint: 'That is a momentum. The equation multiplies the mass by the velocities itself.' },
      ],
      result: { symbol: 'Δp', value: dpB, unit: 'kg m s⁻¹' },
      why: `Δp = ${fixed(M, 2)} × (0 − (+${fixed(U, 1)})) = ${sgn(dpB)}. The change points away from the wall: the wall pushed B back.`,
    },
    {
      id: 'bounce',
      kind: 'explore',
      instruction: 'Drag the slider to change how fast trolley A bounces back. Watch Δp on the momentum line.',
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
      kind: 'estimate',
      prompt: `Back to the puzzle. A hits at ${ms(U)} and bounces back at ${ms(BACK)}. Drag to A's change in momentum.`,
      fig: wall({ at: 'after' }),
      after: wall({ at: 'after', ledger: 'shown' }),
      scale: { min: -3, max: 1, step: 0.1, tick: 1, unit: 'kg m s⁻¹', symbol: 'Δp', dp: 1, label: "Change in A's momentum" },
      answer: dpA,
      tolerance: 0.2,
      why: `Δp = (${signed(pBack, 2)}) − (+${fixed(p0, 2)}) = ${sgn(dpA)}, bigger than B's ${sgn(dpB)}. The wall stops A, then pushes it back.`,
    },
    {
      id: 'dropped-sign',
      kind: 'spotError',
      prompt: "Ravi works out A's change in momentum. His working has one mistake. Which line?",
      lines: [
        { id: 'u', text: `Towards the wall is +, so u = ${vel(U)}.`, hint: 'A rolled towards the wall: that line is right.' },
        { id: 'v', text: `After the bounce A moves at ${vel(BACK).replace('+', '')}.`, wrong: true, fix: `It moves away from the wall: v = ${vel(-BACK)}.` },
        { id: 'calc', text: `Δp = ${fixed(M, 2)} × (${fixed(BACK, 1)} − ${fixed(U, 1)}) = ${sgn(X.bounce.sizes)}`, hint: 'This follows from the line above. Check the number put in for v.' },
        { id: 'end', text: `So A's momentum changes by ${sgn(X.bounce.sizes)}.`, hint: 'This only repeats the line above. Look further up for the slip.' },
      ],
      why: `With v = ${signed(-BACK, 1)} the change is ${sgn(dpA)}. With the sign dropped, ${sgn(X.bounce.sizes)} makes the bounce look gentler than B's dead stop.`,
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
      kind: 'build',
      prompt: `Trolley A (${fixed(M, 2)} kg) rolls right at ${ms(U)}. Trolley C (${fixed(C.m, 2)} kg) rolls left at ${ms(-C.v)}. Right is positive. Build their total momentum.`,
      fig: headOn,
      equation: 'Σp = {m₁} × {u₁} + {m₂} × {u₂}',
      boxes: { 'm₁': 'mA', 'u₁': 'uA', 'm₂': 'mC', 'u₂': 'uC' },
      chips: [
        { id: 'mA', label: `${fixed(M, 2)}${NB}kg` },
        { id: 'uA', label: vel(U) },
        { id: 'mC', label: `${fixed(C.m, 2)}${NB}kg` },
        { id: 'uC', label: vel(C.v) },
        { id: 'plusC', label: vel(-C.v), hint: 'C rolls left, the negative way: its velocity is −1.0.' },
      ],
      result: { symbol: 'Σp', value: X.headOn.right, unit: 'kg m s⁻¹' },
      why: `A: +${fixed(p0, 2)}. C: ${fixed(C.m, 2)} × (${signed(C.v, 1)}) = ${signed(momentum(C.m, C.v), 2)}. They cancel: two moving trolleys, zero total. More on that next lesson.`,
    },
    {
      id: 'rules',
      kind: 'text',
      body: ["A bounce changes momentum more than a dead stop: the wall stops A, then pushes it back."],
      fig: wall({ trolleys: ['A', 'B'], at: 'after', ledger: 'shown' }),
    },
  ],
  skillCheck: [
    {
      id: 'skaters',
      kind: 'build',
      prompt: `A ${SKATERS.a.m} kg skater glides east at ${fixed(SKATERS.a.v, 1)} m s⁻¹. A ${SKATERS.b.m} kg skater glides west at ${fixed(-SKATERS.b.v, 1)} m s⁻¹. East is positive. Build their total momentum.`,
      equation: 'Σp = {m₁} × {u₁} + {m₂} × {u₂}',
      boxes: { 'm₁': 'mA', 'u₁': 'uA', 'm₂': 'mB', 'u₂': 'uB' },
      chips: [
        { id: 'mA', label: `${SKATERS.a.m}${NB}kg` },
        { id: 'uA', label: vel(SKATERS.a.v) },
        { id: 'mB', label: `${SKATERS.b.m}${NB}kg` },
        { id: 'uB', label: vel(SKATERS.b.v) },
        { id: 'plusB', label: vel(-SKATERS.b.v), hint: 'The second skater glides west, the negative way: −4.0.' },
      ],
      result: { symbol: 'Σp', value: X.skaters.right, unit: 'kg m s⁻¹' },
      why: `East +: ${SKATERS.a.m} × ${fixed(SKATERS.a.v, 1)} + ${SKATERS.b.m} × (${signed(SKATERS.b.v, 1)}) = ${momentum(SKATERS.a.m, SKATERS.a.v)} − ${-momentum(SKATERS.b.m, SKATERS.b.v)} = +${fixed(X.skaters.right, 0)} kg m s⁻¹, east.`,
    },
    {
      id: 'drop-error',
      kind: 'spotError',
      prompt: `A ${fixed(DROP.m, 2)} kg ball is dropped from rest and falls for ${fixed(DROP.t, 1)} s. Which line of this working is wrong?`,
      lines: [
        { id: 'data', text: `u = 0, a = ${G} m s⁻², t = ${fixed(DROP.t, 1)} s, m = ${fixed(DROP.m, 2)} kg`, hint: 'That line only copies the data.' },
        { id: 'v', text: `v = u + at = 0 + ${G} × ${fixed(DROP.t, 1)} = ${ms(X.drop.v, 1)}`, hint: 'That is right: the speed just before it lands.' },
        { id: 'p', text: `p = m × t = ${fixed(DROP.m, 2)} × ${fixed(DROP.t, 1)} = ${kgms(X.drop.mt)}`, wrong: true, fix: `p = m × v = ${fixed(DROP.m, 2)} × ${fixed(X.drop.v, 1)} = ${kgms(X.drop.right)}` },
        { id: 'end', text: `So its momentum on landing is ${kgms(X.drop.mt)} downward.`, hint: 'This follows from the line above. Check the formula used there.' },
      ],
      why: `Momentum is mass times velocity, not mass times time. The ball lands at ${ms(X.drop.v, 1)}, so p = ${kgms(X.drop.right)}, downward.`,
    },
    {
      id: 'tennis',
      kind: 'choice',
      prompt: `A ${fixed(TENNIS.m, 3)} kg tennis ball hits a wall at ${TENNIS.u} m s⁻¹ and rebounds at ${TENNIS.v} m s⁻¹. What is the change in its momentum?`,
      options: [
        { id: 'speeds', label: `${kgms(X.tennis.speeds, 3)} away from the wall` },
        { id: 'before', label: `${kgms(X.tennis.before)} away from the wall` },
        { id: 'right', label: `${kgms(X.tennis.right)} away from the wall`, correct: true },
        { id: 'toward', label: `${kgms(X.tennis.right)} towards the wall` },
      ],
      why: `Towards the wall +: Δp = ${fixed(TENNIS.m, 3)} × (−${TENNIS.v}) − ${fixed(TENNIS.m, 3)} × ${TENNIS.u} = −${fixed(X.tennis.right, 2)}: ${kgms(X.tennis.right)}, away from the wall.`,
    },
    {
      id: 'rebound',
      kind: 'examCard',
      context: `A ${fixed(REBOUND.m, 2)} kg trolley rolls towards a wall at ${ms(REBOUND.u)} and rebounds at ${ms(REBOUND.back)}. Towards the wall is positive.`,
      parts: [
        {
          id: 'a',
          command: 'Calculate',
          text: "the change in the trolley's momentum.",
          marks: 2,
          kind: 'build',
          build: {
            equation: 'Δp = {m} × ({v} − {u})',
            boxes: { m: 'mass', v: 'final', u: 'initial' },
            chips: [
              { id: 'mass', label: `${fixed(REBOUND.m, 2)}${NB}kg` },
              { id: 'final', label: vel(-REBOUND.back) },
              { id: 'initial', label: vel(REBOUND.u) },
              { id: 'plus', label: vel(REBOUND.back), hint: 'It rebounds, so it moves the negative way: −0.6.' },
              { id: 'minus', label: vel(-REBOUND.u), hint: 'It starts towards the wall, the positive way: +1.4.' },
            ],
            result: { symbol: 'Δp', value: X.rebound.right, unit: 'kg m s⁻¹' },
          },
          why: `Δp = ${fixed(REBOUND.m, 2)} × (−${fixed(REBOUND.back, 1)} − ${fixed(REBOUND.u, 1)}) = ${sgn(X.rebound.right)}. One mark for the signs, one for the answer.`,
        },
        {
          id: 'b',
          command: 'Explain',
          text: 'why the change is bigger than its momentum before the hit.',
          marks: 2,
          kind: 'order',
          steps: [
            { id: 'before', text: `Before, p = +${fixed(X.rebound.p0, 2)} ${UNIT.trim()}.` },
            { id: 'after', text: `After, it moves the other way: p = ${signed(X.rebound.pf, 2)} ${UNIT.trim()}.` },
            { id: 'diff', text: `Δp = final − initial = ${signed(X.rebound.pf, 2)} − (+${fixed(X.rebound.p0, 2)}).` },
            { id: 'big', text: `The size, ${fixed(Math.abs(X.rebound.right), 2)}, is more than ${fixed(X.rebound.p0, 2)}: the momentum reversed.` },
          ],
          why: 'The wall first stops the trolley (−0.70) and then pushes it back (a further −0.30), so the change is the sum of both.',
        },
      ],
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
