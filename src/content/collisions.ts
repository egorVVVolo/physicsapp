// Lesson "Collisions" — conservation of linear momentum in one dimension (WPH11 point 14).
// The puzzle (the teaser of "Momentum"): trolley A, 0.80 kg at +1.5 m s⁻¹, and trolley C, 1.20 kg at −1.0 m s⁻¹, hit and
// stick. Which way does the pair move? Neither: their momenta are equal and opposite, so they stop dead. Right is positive.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { momentum, stickVelocity, totalMomentum, velocityAfter } from '../physics/momentum.ts';
import { fixed, signed } from '../physics/format.ts';
import type { CollideBody, CollideFig, Lesson } from './types.ts';

const NB = '\u00A0';
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

export const collisions: Lesson = {
  id: 'collisions',
  title: 'Collisions',
  spec: [14],
  minutes: 12,
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
        { id: 'stop', label: 'Neither: they stop dead' },
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
      kind: 'choice',
      prompt: `A (${fixed(A.m, 2)} kg) hits B (${fixed(B.m, 2)} kg), which is at rest, at ${ms(A.u, 1)}. They stick. How fast do they move off?`,
      fig: stickFig,
      options: [
        { id: 'one-mass', label: ms(X.stick.oneMass), hint: 'After the hit A and B move together: share the momentum over both masses.' },
        { id: 'right', label: ms(X.stick.right), correct: true },
        { id: 'momentum', label: ms(X.stick.momentum), hint: 'That is the total momentum, in kg m s⁻¹. Divide it by the mass that moves.' },
      ],
      why: `Before: ${fixed(A.m, 2)} × ${fixed(A.u, 1)} + 0 = ${kgms(pA)}. After: (${fixed(A.m, 2)} + ${fixed(B.m, 2)}) v = ${fixed(pA, 2)}, so v = ${ms(vStick)}. Twice the mass, half the speed.`,
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
      kind: 'choice',
      prompt: `A (${fixed(A.m, 2)} kg) rolls right at ${ms(A.u, 1)}. D (${fixed(D.m, 2)} kg) rolls left at ${ms(-D.u, 1)}. They stick. What is their velocity after?`,
      fig: {
        kind: 'collide',
        header: 'putty on A · + →',
        bodies: [body('A', A.m, A.u, vHeadOn), body('D', D.m, D.u, vHeadOn)],
        join: 'stick',
        play: 'afterCheck',
        ledger: 'afterCheck',
      },
      options: [
        { id: 'zero', label: 'Zero: same speeds, so they cancel', hint: 'Speeds do not cancel, momenta do. A has twice the mass of D.' },
        { id: 'right', label: way(vHeadOn), correct: true },
        { id: 'left', label: way(-vHeadOn), hint: "A's momentum is bigger, so the total points A's way." },
        { id: 'sizes', label: way(X.headOn.sizes), hint: "D moves left, so its momentum is negative: −0.60." },
      ],
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
      body: [
        'Bodies at rest can also **push apart**: a spring, a jump, an explosion. The total momentum before is zero.',
        'So it is zero after too. The two momenta are **equal and opposite**: the lighter body moves off faster.',
      ],
    },
    {
      id: 'spring',
      kind: 'choice',
      prompt: `A (${fixed(A.m, 2)} kg) and C (${fixed(C.m, 2)} kg) rest together. A spring pushes them apart and A moves left at ${ms(-APART.vA)}. What is C's velocity?`,
      fig: {
        kind: 'collide',
        header: 'spring between A and C · + →',
        bodies: [body('A', A.m, 0, APART.vA), body('C', C.m, 0, vApart)],
        join: 'apart',
        play: 'afterCheck',
        ledger: 'afterCheck',
      },
      options: [
        { id: 'same', label: way(X.apart.sameSpeed), hint: 'Same momentum, not same speed. C is heavier, so it is slower.' },
        { id: 'swapped', label: way(X.apart.swapped), hint: 'The masses are swapped. The heavier trolley moves off slower.' },
        { id: 'right', label: way(vApart), correct: true },
        { id: 'left', label: way(-vApart), hint: 'The total stays zero: C must go the opposite way to A.' },
      ],
      why: `Total 0 before, so 0 after: ${fixed(A.m, 2)} × (${signed(APART.vA, 2)}) + ${fixed(C.m, 2)} v = 0, so v = ${signed(vApart, 2)} m s⁻¹, to the right.`,
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
      body: [
        'With no external force, **total momentum before = total momentum after**. Choose + and give every momentum its sign.',
        'Bodies that stick share one velocity. Bodies that push apart from rest get equal and opposite momenta.',
      ],
    },
  ],
  skillCheck: [
    {
      id: 'wagons',
      kind: 'choice',
      prompt: `A 25${NB}000 kg railway wagon moving at ${ms(WAGONS.u, 1)} hits a 15${NB}000 kg wagon at rest. They couple together. How fast do they move off?`,
      options: [
        { id: 'other', label: ms(X.wagons.other) },
        { id: 'half', label: ms(X.wagons.half) },
        { id: 'right', label: ms(X.wagons.right), correct: true },
        { id: 'swapped', label: ms(X.wagons.swapped) },
      ],
      why: `25${NB}000 × ${fixed(WAGONS.u, 1)} = (25${NB}000 + 15${NB}000) v, so v = 75${NB}000 / 40${NB}000 = ${ms(X.wagons.right)}.`,
    },
    {
      id: 'astronaut',
      kind: 'choice',
      prompt: `An ${ASTRONAUT.m} kg astronaut floats at rest. She throws a ${fixed(ASTRONAUT.wrench, 1)} kg wrench at ${ms(ASTRONAUT.v, 1)}. What is her velocity after?`,
      options: [
        { id: 'both', label: `${ms(-X.astronaut.both, 3)}, opposite to the wrench` },
        { id: 'right', label: `${ms(-X.astronaut.right, 3)}, opposite to the wrench`, correct: true },
        { id: 'with', label: `${ms(-X.astronaut.right, 3)}, the same way as the wrench` },
        { id: 'same', label: `${ms(ASTRONAUT.v, 1)}, opposite to the wrench` },
      ],
      why: `Total 0 before, so 0 after: ${fixed(ASTRONAUT.wrench, 1)} × ${fixed(ASTRONAUT.v, 1)} + ${ASTRONAUT.m} v = 0, so v = ${signed(X.astronaut.right, 3)} m s⁻¹: she moves away from the wrench.`,
    },
    {
      id: 'gliders',
      kind: 'choice',
      prompt: `Air track: P (${fixed(GLIDERS.m1, 1)} kg) goes right at ${ms(GLIDERS.u1, 1)}, Q (${fixed(GLIDERS.m2, 1)} kg) left at ${ms(-GLIDERS.u2, 1)}. They collide. Q goes right at ${ms(GLIDERS.v2, 1)}. What is P's velocity?`,
      options: [
        { id: 'right', label: way(X.gliders.right, 1), correct: true },
        { id: 'left', label: way(-X.gliders.right, 1) },
        { id: 'signs', label: way(X.gliders.signsDropped, 1) },
        { id: 'left-out', label: way(X.gliders.leftOut, 1) },
      ],
      why: `Right +: ${fixed(GLIDERS.m1, 1)} × ${fixed(GLIDERS.u1, 1)} + ${fixed(GLIDERS.m2, 1)} × (${signed(GLIDERS.u2, 1)}) = ${fixed(X.gliders.total, 1)} = ${fixed(GLIDERS.m1, 1)} v + ${fixed(GLIDERS.m2 * GLIDERS.v2, 1)}, so v = ${signed(X.gliders.right, 1)} m s⁻¹.`,
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
