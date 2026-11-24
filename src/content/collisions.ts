// Lesson "Collisions" — conservation of linear momentum in one dimension (WPH11 point 14).
// The puzzle (the teaser of "Momentum"): trolley A, 0.80 kg at +1.5 m s⁻¹, and trolley C, 1.20 kg at −1.0 m s⁻¹, hit and
// stick. Which way does the pair move? Neither: their momenta are equal and opposite, so they stop dead. Right is positive.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { momentum, stickVelocity, totalMomentum, velocityAfter } from '../physics/momentum.ts';
import { fixed, signed } from '../physics/format.ts';
import type { Trip } from '../physics/kinematics.ts';
import type { CollideBody, CollideFig, GraphFig, Lesson } from './types.ts';

const NB = '\u00A0';
/** "+1.5 m s⁻¹", "−1.0 m s⁻¹": a velocity with its sign, as a chip. */
const vel = (x: number, dp = 1): string => `${signed(x, dp)}${NB}m${NB}s⁻¹`;
const ms = (x: number, dp = 2): string => `${fixed(x, dp)}${NB}m${NB}s⁻¹`;
const kgms = (x: number, dp = 2): string => `${fixed(x, dp)}${NB}kg${NB}m${NB}s⁻¹`;
/** "0.50 m s⁻¹ to the right" / "… to the left" from a signed velocity. */
const way = (v: number, dp = 2): string => `${ms(Math.abs(v), dp)} to the ${v < 0 ? 'left' : 'right'}`;

// The trolleys: A (the lab trolley of "Momentum"), B its twin, C from the teaser, D a light one.
export const A = { m: 0.8, u: 1.5 }; // kg, m s⁻¹
export const B = { m: 0.8 }; // at rest
export const C = { m: 1.2, u: -1.0 };
export const D = { m: 0.4, u: -1.5 };
export const MASS_RANGE: [number, number] = [0.2, 2.4]; // kg, B's mass on the explore slider
export const APART = { vA: -0.9 }; // A after the spring pushes A and C apart from rest
export const BOUNCE = { vA: -0.3 }; // A after it bounces off C (at rest)
export const WAGONS = { m1: 25000, u: 3.0, m2: 15000 }; // kg, m s⁻¹, kg at rest
export const ASTRONAUT = { m: 80, wrench: 2.0, v: 6.0 }; // kg, kg, m s⁻¹
export const GLIDERS = { m1: 2.0, u1: 3.0, m2: 1.0, u2: -2.0, v2: 2.0 }; // right positive

const UNIT_P = `${NB}kg${NB}m${NB}s⁻¹`;
const pA = momentum(A.m, A.u);
const vStick = stickVelocity(A.m, A.u, B.m, 0);
const vHeadOn = stickVelocity(A.m, A.u, D.m, D.u);
const vPuzzle = stickVelocity(A.m, A.u, C.m, C.u);
const vApart = velocityAfter(A.m, 0, C.m, 0, APART.vA);
const vBounce = velocityAfter(A.m, A.u, C.m, 0, BOUNCE.vA);

/** Answers and named mistakes, used by the screens and re-checked by collisions.test.ts. */
export const ANSWERS = {
  stick: { right: vStick, oneMass: pA / A.m, momentum: pA },
  explore: { light: stickVelocity(A.m, A.u, MASS_RANGE[0], 0), heavy: stickVelocity(A.m, A.u, MASS_RANGE[1], 0), total: pA },
  headOn: { right: vHeadOn, sizes: (Math.abs(pA) + Math.abs(momentum(D.m, D.u))) / (A.m + D.m) },
  /** The puzzle. */
  puzzle: {
    right: vPuzzle,
    averaged: (A.u + C.u) / 2,
    sizes: (Math.abs(pA) + Math.abs(momentum(C.m, C.u))) / (A.m + C.m),
    pC: momentum(C.m, C.u),
  },
  apart: { right: vApart, sameSpeed: -APART.vA, swapped: (C.m * -APART.vA) / A.m },
  bounce: {
    right: vBounce,
    signDropped: (pA - momentum(A.m, -BOUNCE.vA)) / C.m,
    leftOut: pA / C.m,
    aSpeed: A.u,
  },
  wagons: {
    right: stickVelocity(WAGONS.m1, WAGONS.u, WAGONS.m2, 0),
    other: (WAGONS.m1 * WAGONS.u) / WAGONS.m2,
    half: WAGONS.u / 2,
    swapped: (WAGONS.m2 * WAGONS.u) / (WAGONS.m1 + WAGONS.m2),
  },
  astronaut: {
    right: velocityAfter(ASTRONAUT.wrench, 0, ASTRONAUT.m, 0, ASTRONAUT.v),
    both: -(ASTRONAUT.wrench * ASTRONAUT.v) / (ASTRONAUT.m + ASTRONAUT.wrench),
  },
  gliders: {
    total: totalMomentum([
      { m: GLIDERS.m1, v: GLIDERS.u1 },
      { m: GLIDERS.m2, v: GLIDERS.u2 },
    ]),
    right: velocityAfter(GLIDERS.m2, GLIDERS.u2, GLIDERS.m1, GLIDERS.u1, GLIDERS.v2),
    signsDropped: (GLIDERS.m1 * GLIDERS.u1 + GLIDERS.m2 * Math.abs(GLIDERS.u2) - GLIDERS.m2 * GLIDERS.v2) / GLIDERS.m1,
    leftOut: (GLIDERS.m1 * GLIDERS.u1 + GLIDERS.m2 * GLIDERS.u2) / GLIDERS.m1,
  },
};
const X = ANSWERS;

const body = (id: string, m: number, u: number, v: number): CollideBody => ({ id, m, u, v });
const aC = (v: number): [CollideBody, CollideBody] => [body('A', A.m, A.u, v), body('C', C.m, C.u, v)];

/** The puzzle: A and C roll at each other, putty on A's front. */
const puzzle = (over: Partial<CollideFig>): CollideFig => ({
  kind: 'collide',
  header: 'putty on A · + →',
  bodies: aC(vPuzzle),
  join: 'stick',
  play: 'approach',
  ...over,
});

const stickFig: CollideFig = {
  kind: 'collide',
  header: 'putty on A · + →',
  bodies: [body('A', A.m, A.u, vStick), body('B', B.m, 0, vStick)],
  join: 'stick',
  play: 'afterCheck',
  ledger: 'afterCheck',
};


/** The v–t graphs of A (0.80 kg, 1.5 m s⁻¹) hitting B at rest and sticking: the right one, and two named mistakes. All three share one axis. */
const HIT = { at: 0.2, dt: 0.1, end: 0.6 }; // s: the trolleys touch at 0.2 s, the contact lasts 0.1 s, the graph ends at 0.6 s
const trip = (u: number, v: number): Trip => ({ u, phases: [{ dt: HIT.at, a: 0 }, { dt: HIT.dt, a: (v - u) / HIT.dt }, { dt: HIT.end - HIT.at - HIT.dt, a: 0 }] });
const stickGraph = (id: string, vA: number, vB: number): GraphFig => ({
  kind: 'graph',
  y: 'v',
  header: `graph ${id}`,
  lines: [
    { id: 'A', trip: trip(A.u, vA) },
    { id: 'B', trip: trip(0, vB) },
  ],
  tMax: HIT.end,
  tTick: 0.1,
  yMax: 2,
  yTick: 1,
});
export const STICK_GRAPHS = {
  right: { vA: vStick, vB: vStick },
  /** Equal masses that bounce: A stops dead and B takes all its speed. */
  swap: { vA: 0, vB: A.u },
  /** B gets more than A loses: the total momentum would grow. */
  grows: { vA: vStick, vB: A.u },
};

const springFig = (over: Partial<CollideFig>): CollideFig => ({
  kind: 'collide',
  header: 'spring between A and C · + →',
  bodies: [body('A', A.m, 0, APART.vA), body('C', C.m, 0, vApart)],
  join: 'apart',
  ...over,
});
const headOnFig: CollideFig = {
  kind: 'collide',
  header: 'putty on A · + →',
  bodies: [body('A', A.m, A.u, vHeadOn), body('D', D.m, D.u, vHeadOn)],
  join: 'stick',
  play: 'afterCheck',
  ledger: 'afterCheck',
};

export const collisions: Lesson = {
  id: 'collisions',
  title: 'Collisions',
  spec: [14],
  minutes: 12,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'Conservation', from: 'conserved' },
    { title: 'Pushing apart', from: 'apart' },
  ],
  cast: ['Dev'],
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Collisions',
      body: `Trolley A rolls right at ${ms(A.u, 1)}. Trolley C, heavier but slower, rolls left at ${ms(-C.u, 1)}. Putty on A's front.`,
      fig: puzzle({}),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: 'They hit and stick together. Which way does the joined pair move?',
      fig: puzzle({}),
      options: [
        { id: 'right', label: "Right, A's way: A is faster" },
        { id: 'left', label: "Left, C's way: C is heavier" },
        { id: 'stop', label: 'Neither: they stop dead', correct: true },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'conserved',
      kind: 'text',
      body: [
        'In a collision the two bodies push on each other. By **Newton’s third law** the pushes are equal and opposite, and they last the same time.',
        'So whatever momentum one body loses, the other gains. The **total momentum** does not change.',
      ],
      card: { term: 'Conservation of momentum', text: 'If no external force acts, the total momentum before a collision equals the total momentum after.' },
    },
    {
      id: 'stick',
      kind: 'estimate',
      prompt: `A (${fixed(A.m, 2)} kg) hits B (${fixed(B.m, 2)} kg), which is at rest, at ${ms(A.u, 1)}. They stick. Drag to the speed they move off at.`,
      fig: { ...stickFig, play: 'approach', ledger: undefined },
      after: { ...stickFig, play: true, ledger: 'shown' },
      scale: { min: 0, max: 2, step: 0.05, tick: 0.5, unit: 'm s⁻¹', symbol: 'v', dp: 2, label: 'Speed of A and B together' },
      answer: vStick,
      tolerance: 0.1,
      why: `Before: ${fixed(A.m, 2)} × ${fixed(A.u, 1)} + 0 = ${kgms(pA)}. After: (${fixed(A.m, 2)} + ${fixed(B.m, 2)}) v = ${fixed(pA, 2)}, so v = ${ms(vStick)}. Twice the mass, half the speed.`,
    },
    {
      id: 'stick-graph',
      kind: 'graphPick',
      prompt: 'A hits B and they stick. Which v–t graph shows both trolleys?',
      graphs: [
        { id: 'A', fig: stickGraph('A', STICK_GRAPHS.swap.vA, STICK_GRAPHS.swap.vB), hint: 'A stops and B takes all its speed: a bounce. Stuck trolleys end together.' },
        { id: 'B', fig: stickGraph('B', STICK_GRAPHS.grows.vA, STICK_GRAPHS.grows.vB), hint: 'B gains 1.5 but A loses only 0.75: the total momentum would grow.' },
        { id: 'C', fig: stickGraph('C', STICK_GRAPHS.right.vA, STICK_GRAPHS.right.vB), correct: true },
      ],
      why: `Both lines meet at ${ms(vStick)}: A loses ${fixed(A.u - vStick, 2)} m s⁻¹, B gains ${fixed(vStick, 2)} m s⁻¹, and with equal masses the momentum lost is the momentum gained.`,
    },
    {
      id: 'heavier',
      kind: 'explore',
      instruction: "Drag the slider to change B's mass. Watch the Σp marks on the momentum line.",
      fig: { ...stickFig, play: true, ledger: 'shown', massRange: MASS_RANGE },
      slider: { min: MASS_RANGE[0], max: MASS_RANGE[1], step: 0.2, tick: 0.4, label: "B's mass", unit: 'kg', symbol: 'm', dp: 1, start: B.m },
      question: {
        prompt: 'As B gets heavier, what happens to the total momentum after the hit?',
        options: [
          { id: 'less', label: 'It gets smaller: the pair moves off slower', hint: 'Slower, but heavier. Watch the AFTER row: Σp stays put.' },
          { id: 'right', label: `It stays ${kgms(pA)}`, correct: true },
          { id: 'more', label: 'It gets bigger: more mass is moving', hint: 'More mass, but slower. Watch the AFTER row: Σp stays put.' },
        ],
        right: `Right: the speed after falls from ${ms(X.explore.light)} to ${ms(X.explore.heavy, 3)}, but Σp stays ${kgms(pA)}.`,
      },
    },
    {
      id: 'method',
      kind: 'text',
      body: [
        'Choose a **positive direction** first. Add the momenta before, each with its sign: a body moving the other way has a negative momentum.',
        'The total after is the same. Write it out with the one unknown velocity, and solve.',
      ],
      card: { term: 'Using it', text: 'm₁u₁ + m₂u₂ = m₁v₁ + m₂v₂, with every velocity signed. Bodies that stick share one v.' },
    },
    {
      id: 'head-on',
      kind: 'build',
      prompt: `A (${fixed(A.m, 2)} kg) rolls right at ${ms(A.u, 1)}. D (${fixed(D.m, 2)} kg) rolls left at ${ms(-D.u, 1)}. They stick. Build their velocity after.`,
      fig: headOnFig,
      equation: 'v = ({m₁} × {u₁} + {m₂} × {u₂}) ÷ {M}',
      boxes: { 'm₁': 'mA', 'u₁': 'uA', 'm₂': 'mD', 'u₂': 'uD', M: 'total' },
      chips: [
        { id: 'mA', label: `${fixed(A.m, 2)}${NB}kg` },
        { id: 'uA', label: vel(A.u) },
        { id: 'mD', label: `${fixed(D.m, 2)}${NB}kg` },
        { id: 'uD', label: vel(D.u) },
        { id: 'total', label: `${fixed(A.m + D.m, 2)}${NB}kg` },
        { id: 'p', label: kgms(pA), hint: "That is A's momentum, not a mass. The last box needs the total mass." },
      ],
      result: { symbol: 'v', value: vHeadOn, unit: 'm s⁻¹' },
      why: `Before: ${fixed(pA, 2)} + ${fixed(D.m, 2)} × (${signed(D.u, 1)}) = ${signed(pA + momentum(D.m, D.u), 2)}. After: ${fixed(A.m + D.m, 2)} v = ${fixed(pA + momentum(D.m, D.u), 2)}, so v = ${signed(vHeadOn, 2)} m s⁻¹.`,
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Back to the puzzle. A (${fixed(A.m, 2)} kg) at ${signed(A.u, 1)} m s⁻¹ and C (${fixed(C.m, 2)} kg) at ${signed(C.u, 1)} m s⁻¹ stick. What is their velocity after?`,
      fig: puzzle({ play: 'afterCheck', ledger: 'afterCheck' }),
      options: [
        { id: 'averaged', label: way(X.puzzle.averaged), hint: 'That averages the speeds and ignores the masses. Use the momenta.' },
        { id: 'right', label: 'Zero: they stop dead', correct: true },
        { id: 'sizes', label: way(X.puzzle.sizes), hint: "C moves left: its momentum is negative, −1.20." },
      ],
      why: `A: ${fixed(A.m, 2)} × ${fixed(A.u, 1)} = +${fixed(pA, 2)}. C: ${fixed(C.m, 2)} × (${signed(C.u, 1)}) = ${signed(X.puzzle.pC, 2)}. The total is 0 before, so 0 after: two moving trolleys stop dead.`,
    },
    {
      id: 'apart',
      kind: 'text',
      body: ['At rest, bodies can push apart: a spring, a jump. Their total momentum starts at zero.'],
      fig: springFig({ play: 'approach' }),
    },
    {
      id: 'recoil',
      kind: 'order',
      prompt: `A spring pushes A and C apart from rest. Why do they move off in opposite directions? Put the reasoning in order.`,
      fig: springFig({ play: 'afterCheck', ledger: 'afterCheck' }),
      steps: [
        { id: 'rest', text: 'Before the push both trolleys are at rest: the total momentum is zero.' },
        { id: 'forces', text: 'The spring pushes each with a force of the same size, for the same time.' },
        { id: 'equal', text: 'So A gains as much momentum one way as C gains the other way.' },
        { id: 'zero', text: 'The total is still zero: the two momenta are equal and opposite.' },
        { id: 'fast', text: 'The lighter trolley has less mass, so it moves off faster.' },
      ],
      hint: 'Start from the total before, then the forces, then the two momenta.',
      why: `A: ${fixed(A.m, 2)} × (${signed(APART.vA, 2)}) = ${signed(momentum(A.m, APART.vA), 2)}. C: ${fixed(C.m, 2)} × ${fixed(vApart, 2)} = +${fixed(momentum(C.m, vApart), 2)}. Equal and opposite.`,
    },
    {
      id: 'bounce',
      kind: 'choice',
      prompt: `Now A has a spring buffer. It hits C, at rest, at ${ms(A.u, 1)} and bounces back at ${ms(-BOUNCE.vA)}. What is C's velocity?`,
      fig: {
        kind: 'collide',
        header: 'spring buffer on A · + →',
        bodies: [body('A', A.m, A.u, BOUNCE.vA), body('C', C.m, 0, vBounce)],
        join: 'bounce',
        play: 'afterCheck',
        ledger: 'afterCheck',
      },
      options: [
        { id: 'sign', label: way(X.bounce.signDropped), hint: "A comes back, so its momentum after is negative: −0.24." },
        { id: 'left-out', label: way(X.bounce.leftOut), hint: 'A still moves after the hit. Put its momentum into the total after.' },
        { id: 'a-speed', label: way(X.bounce.aSpeed, 1), hint: 'Speed is not passed on. Momentum is shared: use the masses.' },
        { id: 'right', label: way(vBounce), correct: true },
      ],
      why: `${fixed(pA, 2)} = ${fixed(A.m, 2)} × (${signed(BOUNCE.vA, 2)}) + ${fixed(C.m, 2)} v, so ${fixed(C.m, 2)} v = ${fixed(pA - momentum(A.m, BOUNCE.vA), 2)} and v = ${signed(vBounce, 2)} m s⁻¹.`,
    },
    {
      id: 'outside',
      kind: 'text',
      body: [
        'Momentum is conserved only if **no external force** acts: a force from something outside the bodies that collide.',
        'A ball falling on its own gains momentum. Its weight comes from outside, from the Earth, so its momentum is not conserved.',
      ],
      card: { term: 'External force', text: 'A force on the bodies from something else. Friction, or a weight that is not balanced, changes the total momentum.' },
    },
    {
      id: 'ramp',
      kind: 'choice',
      prompt: 'A trolley rolls up a ramp and slows down. Nothing hits it. Is its momentum conserved?',
      options: [
        { id: 'always', label: 'Yes: momentum is always conserved', hint: 'Only with no external force. Something outside slows it down.' },
        { id: 'right', label: 'No: part of its weight acts down the ramp', correct: true },
        { id: 'nothing', label: 'Yes: nothing collides with it', hint: 'No collision, but a force from outside: the pull of the Earth.' },
      ],
      why: 'Along the ramp, part of its weight pulls it back. That is an external force, so its momentum falls.',
    },
    {
      id: 'rules',
      kind: 'text',
      body: ['No external force: total momentum before = total after. Give every momentum its sign.'],
      fig: puzzle({ play: undefined, at: 'after', ledger: 'shown' }),
    },
  ],
  skillCheck: [
    {
      id: 'wagons',
      kind: 'build',
      prompt: `A 25${NB}000 kg railway wagon moving at ${ms(WAGONS.u, 1)} hits a 15${NB}000 kg wagon at rest. They couple together. Build their velocity after.`,
      equation: 'v = ({m₁} × {u}) ÷ {M}',
      boxes: { 'm₁': 'moving', u: 'speed', M: 'total' },
      chips: [
        { id: 'moving', label: `25${NB}000${NB}kg` },
        { id: 'speed', label: vel(WAGONS.u) },
        { id: 'total', label: `40${NB}000${NB}kg` },
        { id: 'rest', label: `15${NB}000${NB}kg`, hint: 'That wagon is at rest: it has no momentum before. The moving one is 25 000 kg.' },
      ],
      result: { symbol: 'v', value: X.wagons.right, unit: 'm s⁻¹' },
      why: `25${NB}000 × ${fixed(WAGONS.u, 1)} = (25${NB}000 + 15${NB}000) v, so v = 75${NB}000 / 40${NB}000 = ${ms(X.wagons.right)}.`,
    },
    {
      id: 'gliders',
      kind: 'spotError',
      prompt: `Air track: P (${fixed(GLIDERS.m1, 1)} kg) goes right at ${ms(GLIDERS.u1, 1)}, Q (${fixed(GLIDERS.m2, 1)} kg) left at ${ms(-GLIDERS.u2, 1)}. Q rebounds right at ${ms(GLIDERS.v2, 1)}. Dev's working has one mistake. Which line?`,
      lines: [
        { id: 'signs', text: `Right is +: P is ${fixed(GLIDERS.m1, 1)} kg at +${fixed(GLIDERS.u1, 1)}, Q is ${fixed(GLIDERS.m2, 1)} kg at ${signed(GLIDERS.u2, 1)}.`, hint: 'That line only sets the signs, and they are right.' },
        {
          id: 'before',
          text: `Total before = ${fixed(GLIDERS.m1, 1)} × ${fixed(GLIDERS.u1, 1)} + ${fixed(GLIDERS.m2, 1)} × ${fixed(-GLIDERS.u2, 1)} = ${fixed(GLIDERS.m1 * GLIDERS.u1 + GLIDERS.m2 * -GLIDERS.u2, 1)}${UNIT_P}`,
          wrong: true,
          fix: `Total before = ${fixed(GLIDERS.m1, 1)} × ${fixed(GLIDERS.u1, 1)} + ${fixed(GLIDERS.m2, 1)} × (${signed(GLIDERS.u2, 1)}) = ${fixed(X.gliders.total, 1)}${UNIT_P}`,
        },
        { id: 'after', text: `${fixed(GLIDERS.m1 * GLIDERS.u1 + GLIDERS.m2 * -GLIDERS.u2, 1)} = ${fixed(GLIDERS.m1, 1)} v + ${fixed(GLIDERS.m2, 1)} × ${fixed(GLIDERS.v2, 1)}, so v = +${fixed(X.gliders.signsDropped, 1)}${NB}m${NB}s⁻¹`, hint: 'This follows from the line above. Check the total before.' },
        { id: 'end', text: `So P goes right at ${ms(X.gliders.signsDropped, 1)}.`, hint: 'This repeats the line above. Look further up for the slip.' },
      ],
      why: `Q moves left, so its momentum is negative: total before = ${fixed(X.gliders.total, 1)}, not ${fixed(GLIDERS.m1 * GLIDERS.u1 + GLIDERS.m2 * -GLIDERS.u2, 1)}. Then v = ${signed(X.gliders.right, 1)} m s⁻¹.`,
    },
    {
      id: 'falling',
      kind: 'choice',
      prompt: 'A ball falls freely and speeds up. Which statement about its momentum is correct?',
      options: [
        { id: 'conserved', label: 'It is conserved: nothing touches the ball' },
        { id: 'collisions', label: 'Momentum is only ever conserved in collisions' },
        { id: 'right', label: 'It is not conserved: its weight is an external force', correct: true },
        { id: 'speed', label: 'It stays the same: only the speed grows' },
      ],
      why: 'The ball’s weight is a force from outside, from the Earth. It gives the ball more momentum every second.',
    },
    {
      id: 'release',
      kind: 'examCard',
      context: `Two trolleys, ${fixed(A.m, 2)} kg (A) and ${fixed(C.m, 2)} kg (C), rest together with a compressed spring between them. When released, A moves left at ${ms(-APART.vA)}. Right is positive.`,
      parts: [
        {
          id: 'a',
          command: 'Calculate',
          text: "C's velocity.",
          marks: 2,
          kind: 'build',
          build: {
            equation: 'v = −({m₁} × {v₁}) ÷ {m₂}',
            boxes: { 'm₁': 'mA', 'v₁': 'vA', 'm₂': 'mC' },
            chips: [
              { id: 'mA', label: `${fixed(A.m, 2)}${NB}kg` },
              { id: 'vA', label: vel(APART.vA, 2) },
              { id: 'mC', label: `${fixed(C.m, 2)}${NB}kg` },
              { id: 'plus', label: vel(-APART.vA, 2), hint: 'A moves left, the negative way: −0.90.' },
              { id: 'total', label: `${fixed(A.m + C.m, 2)}${NB}kg`, hint: 'C moves alone after the push: divide by its own mass.' },
            ],
            result: { symbol: 'v', value: vApart, unit: 'm s⁻¹' },
          },
          why: `Total 0 before, so 0 after: ${fixed(A.m, 2)} × (${signed(APART.vA, 2)}) + ${fixed(C.m, 2)} v = 0, so v = +${fixed(vApart, 2)} m s⁻¹. One mark for the sign, one for the value.`,
        },
        {
          id: 'b',
          command: 'State',
          text: 'the total momentum of the two trolleys just after the release.',
          marks: 1,
          kind: 'choice',
          options: [
            { id: 'zero', label: 'Zero', correct: true },
            { id: 'right', label: `${kgms(momentum(C.m, vApart))} to the right` },
            { id: 'left', label: `${kgms(-momentum(A.m, APART.vA))} to the left` },
            { id: 'both', label: `${kgms(momentum(C.m, vApart) - momentum(A.m, APART.vA))} to the right` },
          ],
          why: 'The spring is an internal force and they started at rest, so the total stays zero: +0.72 and −0.72 cancel.',
        },
      ],
    },
  ],
  youCanNow: [
    'State when momentum is conserved',
    'Find the velocity of bodies that stick after a collision',
    'Find an unknown velocity after a bounce or a push apart',
    'Use signs for bodies moving opposite ways',
  ],
  recap: {
    fig: puzzle({ play: undefined, at: 'after', ledger: 'shown' }),
    text: 'Two moving trolleys, total momentum zero: they stop dead.',
  },
  card: {
    formula: 'Σp before = Σp after',
    idea: 'With no external force, the total momentum before a collision equals the total after.',
  },
};
