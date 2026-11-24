// Lesson "Force and acceleration" — ΣF = ma and Newton's first law (WPH11 point 9), g = F/m and W = mg (point 10).
// The puzzle: Rose drags her 40 kg crate with a flat rope, 150 N against 100 N of friction. She pulls twice as hard.
// The acceleration is four times bigger, not twice: the resultant goes from 50 N to 200 N (1.25 → 5.00 m s⁻²).
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { G } from '../physics/kinematics.ts';
import { acceleration, connectedAcceleration, fieldStrength, pulleyRun, stringTension, weight } from '../physics/dynamics.ts';
import { fixed } from '../physics/format.ts';
import type { CrateFig, GraphFig, Lesson, PulleyFig } from './types.ts';
import type { Trip } from '../physics/kinematics.ts';

const NB = '\u00A0';
/** "1.25 m s⁻²": an acceleration to 3 significant figures. */
export const ms2 = (x: number, dp = 2): string => `${fixed(x, dp)}${NB}m${NB}s⁻²`;
/** "1.57 N", "750 N". */
export const n = (x: number, dp = 0): string => `${fixed(x, dp)}${NB}N`;

// The story and the numbers of each question.
export const M = 40; // kg, Rose's crate from "Drawing the forces"
export const PULL = 150; // N, her rope, flat this time
export const PULL2 = 300; // N, twice as hard
export const FRICTION = 100; // N, sliding friction on the floor, the same at any speed
export const MOON_G = 1.62; // N kg⁻¹
export const LAB = { trolley: 0.8, hanging: 0.2, drop: 0.5 }; // kg, kg, m
export const TOW = { car: 1100, trailer: 500, drive: 2400 }; // kg, kg, N
export const ROCKET = { m: 0.5, thrust: 8.0 }; // kg, N
export const MARS = { m: 2.0, reading: 7.42, lift: 10.0 }; // kg, N, N
export const CAR = { m: 1500, v: 24.0, t: 15.0, resist: 600 }; // kg, m s⁻¹, s, N

const W = weight(M);
const sum1 = PULL - FRICTION;
const sum2 = PULL2 - FRICTION;
const labA = connectedAcceleration(LAB.trolley, LAB.hanging);
const labT = stringTension(LAB.trolley, LAB.hanging);
const labW = weight(LAB.hanging);
const towA = acceleration(TOW.drive, TOW.car + TOW.trailer);
const rocketW = weight(ROCKET.m);
const marsG = fieldStrength(MARS.reading, MARS.m);
const carA = CAR.v / CAR.t;

/** Answers and named mistakes, used by the screens and re-checked by force-and-acceleration.test.ts. */
export const ANSWERS = {
  weight: W,
  sum1,
  sum2,
  /** Screen "first-a": 150 N against 100 N of friction. */
  first: { right: acceleration(sum1, M), pullOnly: acceleration(PULL, M), added: acceleration(PULL + FRICTION, M), byWeight: acceleration(sum1, W) },
  /** The puzzle: 300 N. */
  second: { right: acceleration(sum2, M), doubled: 2 * acceleration(sum1, M), pullOnly: acceleration(PULL2, M), same: acceleration(sum1, M) },
  /** On the Moon, the same crate on smooth ice with a resultant of 50 N. */
  moon: { right: acceleration(sum1, M), smallerMass: acceleration(sum1, (M * MOON_G) / G), byMoonWeight: acceleration(sum1, weight(M, MOON_G)) },
  lab: {
    a: { right: labA, trolleyOnly: acceleration(labW, LAB.trolley), free: G, byWeight: acceleration(labW, weight(LAB.trolley + LAB.hanging)) },
    T: { right: labT, weight: labW, ma: LAB.hanging * labA, sum: labW + LAB.hanging * labA },
    vLand: pulleyRun(10, LAB.trolley, LAB.hanging, LAB.drop).v,
    tLand: Math.sqrt((2 * LAB.drop) / labA),
  },
  tow: { a: towA, total: TOW.car + TOW.trailer, right: TOW.trailer * towA, whole: TOW.drive, ratio: (TOW.drive * TOW.trailer) / TOW.car, car: TOW.car * towA },
  rocket: { right: acceleration(ROCKET.thrust - rocketW, ROCKET.m), noWeight: acceleration(ROCKET.thrust, ROCKET.m), added: acceleration(ROCKET.thrust + rocketW, ROCKET.m), byWeight: acceleration(ROCKET.thrust - rocketW, rocketW) },
  mars: {
    g: marsG,
    right: acceleration(MARS.lift - MARS.reading, MARS.m),
    noWeight: acceleration(MARS.lift, MARS.m),
    added: acceleration(MARS.lift + MARS.reading, MARS.m),
    earthWeight: weight(MARS.m),
  },
  car: { a: carA, right: CAR.m * carA + CAR.resist, forgot: CAR.m * carA, subtracted: CAR.m * carA - CAR.resist, mv: CAR.m * CAR.v },
};

const crate = (over: Partial<CrateFig>): CrateFig => ({ kind: 'crate', m: M, by: 'rope', force: PULL, angle: 0, friction: FRICTION, forces: [], ...over });
const ALL: CrateFig['forces'] = ['W', 'N', 'F', 'T'];
const lab = (over: Partial<PulleyFig>): PulleyFig => ({ kind: 'pulley', ...LAB, ...over });

const X = ANSWERS;
const A1 = X.first;
const A2 = X.second;

/** The lab's v–t graph: the trolley speeds up until the mass lands, then rolls on. Two wrong ones: it never stops speeding up, it slows. */
const AFTER_LAND = 0.6; // s drawn after the landing
const LAND_END = X.lab.tLand + AFTER_LAND;
const rollsOn: Trip = { u: 0, phases: [{ dt: X.lab.tLand, a: labA }, { dt: AFTER_LAND, a: 0 }] };
const keepsSpeeding: Trip = { u: 0, phases: [{ dt: LAND_END, a: labA }] };
const slows: Trip = { u: 0, phases: [{ dt: X.lab.tLand, a: labA }, { dt: AFTER_LAND, a: -X.lab.vLand / AFTER_LAND }] };
const labOf = (id: string, trip: Trip): GraphFig => ({ kind: 'graph', y: 'v', header: `graph ${id}`, lines: [{ id: '', trip }], tMax: 1.4, tTick: 0.2, yMax: 3, yTick: 1 });
/** Braking of a sliding book: steady friction only. */
const SLIDE = { u: 3, a: -1 };
const sliding: Trip = { u: SLIDE.u, phases: [{ dt: 3, a: SLIDE.a }] };
const steadyBook: Trip = { u: SLIDE.u, phases: [{ dt: 3, a: 0 }] };
const speedingBook: Trip = { u: 0, phases: [{ dt: 3, a: 1 }] };
const bookOf = (id: string, trip: Trip): GraphFig => ({ kind: 'graph', y: 'v', header: `graph ${id}`, lines: [{ id: '', trip }], tMax: 3.5, tTick: 0.5, yMax: 4, yTick: 1 });
const OVERALL_TOW = X.tow;

export const forceAndAcceleration: Lesson = {
  id: 'f-ma',
  title: 'Force and acceleration',
  spec: [9, 10],
  minutes: 12,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'The resultant force', from: 'law' },
    { title: 'Back to the crate', from: 'hook-again' },
  ],
  cast: ['Rose'],
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Force and acceleration',
      body: `Rose drags her ${M} kg crate again, with the rope flat: ${PULL} N against ${FRICTION} N of friction. The crate speeds up.`,
      fig: crate({ play: true }),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: `Rose pulls twice as hard, ${PULL2} N. Friction stays ${FRICTION} N. What happens to the crate's acceleration?`,
      fig: crate({ play: true }),
      options: [
        { id: 'twice', label: 'It doubles' },
        { id: 'more', label: 'It more than doubles', correct: true },
        { id: 'less', label: 'It less than doubles' },
        { id: 'same', label: 'It stays the same: only the speed is bigger' },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'law',
      kind: 'text',
      body: [
        "Newton's second law: **ΣF = ma**. The acceleration of a body is set by the resultant force on it and by its mass.",
        'To find ΣF, add **every force** on the body, each with its sign: forward forces positive, backward ones negative.',
      ],
      card: { term: 'Resultant force', text: 'The one force that would have the same effect as all the forces on the body together.' },
    },
    {
      id: 'fbd',
      kind: 'text',
      body: [`Forward ${PULL} N, back ${FRICTION} N: the **resultant** is ${n(sum1)} forward.`],
      fig: crate({ forces: ALL, values: true }),
    },
    {
      id: 'first-a',
      kind: 'build',
      prompt: `The crate has a mass of ${M} kg. Build its acceleration while Rose pulls with ${PULL} N.`,
      fig: crate({ forces: ALL, values: true, accel: 'afterCheck' }),
      equation: 'a = ({pull} − {friction}) ÷ {mass}',
      boxes: { pull: 'pull', friction: 'friction', mass: 'mass' },
      chips: [
        { id: 'pull', label: n(PULL) },
        { id: 'friction', label: n(FRICTION) },
        { id: 'mass', label: `${M}${NB}kg` },
        { id: 'weight', label: n(W), hint: `That is the weight. a = ΣF ÷ m uses the mass, ${M} kg.` },
        { id: 'sum', label: n(PULL + FRICTION), hint: 'Friction points backward: take it away, do not add it.' },
      ],
      result: { symbol: 'a', value: A1.right, unit: 'm s⁻²' },
      why: `a = ΣF / m = ${n(sum1)} / ${M} kg = ${ms2(A1.right)}. Only the ${n(sum1)} left over after friction speeds the crate up.`,
    },
    {
      id: 'double',
      kind: 'estimate',
      prompt: `Rose now pulls with ${PULL2} N. Friction is still ${FRICTION} N. Drag to the crate's acceleration.`,
      fig: crate({ force: PULL2, forces: ALL, values: true }),
      after: crate({ force: PULL2, forces: ALL, values: true, accel: 'shown' }),
      scale: { min: 0, max: 8, step: 0.1, tick: 1, unit: 'm s⁻²', symbol: 'a', dp: 1, label: 'Acceleration of the crate' },
      answer: A2.right,
      tolerance: 0.3,
      why: `ΣF = ${PULL2} − ${FRICTION} = ${n(sum2)}, so a = ${n(sum2)} / ${M} kg = ${ms2(A2.right)}.`,
    },
    {
      id: 'pull',
      kind: 'explore',
      instruction: `Drag the slider to change Rose's pull. Friction stays ${FRICTION} N.`,
      fig: crate({ forces: ALL, values: true, accel: 'shown', slider: 'force', play: true }),
      slider: { min: 0, max: PULL2, step: 10, tick: 50, label: "Rose's pull", unit: 'N', symbol: 'T', dp: 0, start: PULL },
      question: {
        prompt: `What does the crate do while Rose pulls with exactly ${FRICTION} N?`,
        options: [
          { id: 'slows', label: 'It slows down and stops', hint: 'Set the slider to 100 N and look at ΣF and a.' },
          { id: 'steady', label: 'It keeps moving at a steady speed', correct: true },
          { id: 'faster', label: 'It speeds up slowly', hint: 'ΣF is zero there, so a is zero. Nothing changes its speed.' },
        ],
        right: "Right: ΣF = 0, so a = 0. The crate keeps the speed it has: Newton's first law.",
      },
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: 'Back to the crate. Why does doubling the pull more than double the acceleration?',
      fig: crate({ force: PULL2, forces: ALL, values: true, accel: 'shown' }),
      options: [
        { id: 'mass', label: 'The crate gets lighter as it speeds up', hint: 'Its mass is 40 kg whatever its speed. Only ΣF changed.' },
        { id: 'friction', label: 'Friction disappears at a higher pull', hint: `Friction is still ${FRICTION} N. Look at the backward arrow.` },
        { id: 'resultant', label: `Friction stays ${FRICTION} N, so ΣF goes from ${n(sum1)} to ${n(sum2)}: four times`, correct: true },
      ],
      why: `a depends on ΣF, not on the pull alone. ΣF = ${n(sum1)} → ${n(sum2)}, four times bigger, so a goes from ${ms2(A1.right)} to ${ms2(A2.right)}.`,
    },
    {
      id: 'mass',
      kind: 'text',
      body: [
        '**Mass**, in kg, tells you how hard a body is to accelerate. **Weight** is a force, in N: the pull of gravity, W = mg.',
        `Take the crate to the Moon: its weight falls from ${n(W)} to ${n(weight(M, MOON_G))}, but its mass stays ${M} kg.`,
      ],
      card: { term: 'Gravitational field strength', text: `g = F / m, the force of gravity on each kilogram: ${G} N kg⁻¹ on Earth, ${MOON_G} N kg⁻¹ on the Moon.` },
    },
    {
      id: 'lab',
      kind: 'text',
      body: [`A falling ${fixed(LAB.hanging, 2)} kg mass pulls a ${fixed(LAB.trolley, 2)} kg trolley along a **smooth** bench.`],
      fig: lab({ play: true }),
    },
    {
      id: 'lab-a',
      kind: 'choice',
      prompt: `The hanging mass weighs ${n(labW, 2)}. What is the acceleration of the trolley and the mass?`,
      fig: lab({ accel: 'afterCheck' }),
      options: [
        { id: 'trolley-only', label: ms2(X.lab.a.trolleyOnly), hint: 'The weight has to speed up the hanging mass too, not just the trolley.' },
        { id: 'free', label: ms2(X.lab.a.free), hint: 'That is free fall. The string holds the mass back.' },
        { id: 'right', label: ms2(X.lab.a.right), correct: true },
        { id: 'by-weight', label: ms2(X.lab.a.byWeight, 3), hint: 'You divided by a weight. Divide by the total mass, in kg.' },
      ],
      why: `The weight ${n(labW, 2)} accelerates both bodies, ${fixed(LAB.trolley + LAB.hanging, 2)} kg in all: a = ${n(labW, 2)} / ${fixed(LAB.trolley + LAB.hanging, 2)} kg = ${ms2(labA)}.`,
    },
    {
      id: 'lab-graph',
      kind: 'graphPick',
      prompt: `After falling ${fixed(LAB.drop, 2)} m the mass lands and the string goes slack. Which v–t graph shows the trolley?`,
      scene: lab({}),
      graphs: [
        { id: 'A', fig: labOf('A', keepsSpeeding), hint: 'This line keeps rising. After the landing nothing pulls the trolley.' },
        { id: 'B', fig: labOf('B', rollsOn), correct: true },
        { id: 'C', fig: labOf('C', slows), hint: 'The bench is smooth. Nothing slows the trolley down.' },
      ],
      why: `The line rises at ${ms2(labA)} until the landing, then goes flat: no resultant force, so the velocity stays ${fixed(X.lab.vLand, 2)} m s⁻¹.`,
    },
    {
      id: 'slack',
      kind: 'order',
      prompt: 'Why does the trolley roll on at a steady speed once the mass has landed? Put the reasoning in order.',
      steps: [
        { id: 'lands', text: 'The mass lands, so the string goes slack.' },
        { id: 'nothing', text: 'Nothing pulls the trolley any more, and the bench is smooth.' },
        { id: 'zero', text: 'So there is no resultant force: ΣF = 0, a = 0.' },
        { id: 'steady', text: `The velocity cannot change: it rolls on at ${fixed(X.lab.vLand, 2)}${NB}m${NB}s⁻¹.` },
      ],
      hint: 'Start with the string, then the force, then the acceleration.',
      why: "No resultant force means no change in velocity: Newton's first law. The marks on the bench stay evenly spaced.",
    },
    {
      id: 'rules',
      kind: 'text',
      body: [
        'Find the **resultant force** first: every force, with its sign. Then a = ΣF / m, with m the mass of everything that force moves.',
        'Weight is a force, W = mg. Mass is the same on any planet. No resultant force means **no change in velocity**.',
      ],
      card: { term: "Newton's first law", text: 'With no resultant force, a body stays at rest or keeps moving at a steady velocity.' },
    },
  ],
  skillCheck: [
    {
      id: 'rocket',
      kind: 'build',
      prompt: `A ${fixed(ROCKET.m, 2)} kg model rocket lifts off with a thrust of ${fixed(ROCKET.thrust, 1)} N. Air resistance is negligible. Build its acceleration.`,
      equation: 'a = ({thrust} − {weight}) ÷ {mass}',
      boxes: { thrust: 'thrust', weight: 'weight', mass: 'mass' },
      chips: [
        { id: 'thrust', label: n(ROCKET.thrust, 1) },
        { id: 'weight', label: n(rocketW, 2) },
        { id: 'mass', label: `${fixed(ROCKET.m, 2)}${NB}kg` },
        { id: 'sum', label: n(ROCKET.thrust + rocketW, 1), hint: 'The weight pulls down while the thrust pushes up: take it away.' },
        { id: 'half', label: `${fixed(rocketW, 2)}${NB}kg`, hint: 'That is the weight in newtons, not a mass. The mass is 0.50 kg.' },
      ],
      result: { symbol: 'a', value: X.rocket.right, unit: 'm s⁻²' },
      why: `ΣF = thrust − weight = ${fixed(ROCKET.thrust, 1)} − ${n(rocketW, 2)} = ${n(ROCKET.thrust - rocketW, 2)}, so a = ${fixed(ROCKET.thrust - rocketW, 2)} / ${fixed(ROCKET.m, 2)} = ${ms2(X.rocket.right)}.`,
    },
    {
      id: 'book-graph',
      kind: 'graphPick',
      prompt: 'A book slides across a rough table and comes to rest. Which v–t graph shows it?',
      graphs: [
        { id: 'A', fig: bookOf('A', steadyBook), hint: 'A flat line is a steady velocity: that needs no resultant force.' },
        { id: 'B', fig: bookOf('B', sliding), correct: true },
        { id: 'C', fig: bookOf('C', speedingBook), hint: 'This line rises: the book is speeding up from rest.' },
      ],
      why: `Friction is the only horizontal force and it points backward, so a is steady and negative: the line slopes down to zero.`,
    },
    {
      id: 'puck',
      kind: 'choice',
      prompt: 'A hockey puck slides across smooth ice at a steady speed. Which statement about the forces on it is true?',
      options: [
        { id: 'right', label: 'The forces on it balance: there is no resultant force', correct: true },
        { id: 'forward', label: 'A forward force from the stick keeps it moving' },
        { id: 'weight', label: 'Its weight is the only force on it' },
        { id: 'friction', label: 'Friction balances a forward force of the same size' },
      ],
      why: "Steady velocity means no resultant force. Weight and the push of the ice balance up and down; sideways nothing acts. No force is needed to keep it moving.",
    },
    {
      id: 'tow',
      kind: 'examCard',
      context: `A ${TOW.car} kg car tows a ${TOW.trailer} kg trailer along a level road. The driving force is ${TOW.drive} N. Resistive forces are negligible.`,
      parts: [
        {
          id: 'a',
          command: 'Calculate',
          text: 'the acceleration of the car and trailer.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'a = {F} ÷ ({car} + {trailer})',
            boxes: { F: 'drive', car: 'car', trailer: 'trailer' },
            chips: [
              { id: 'drive', label: n(TOW.drive) },
              { id: 'car', label: `${TOW.car}${NB}kg` },
              { id: 'trailer', label: `${TOW.trailer}${NB}kg` },
              { id: 'total', label: `${OVERALL_TOW.total}${NB}kg`, hint: 'That is the total mass. The equation adds the two masses itself.' },
              { id: 'tension', label: n(OVERALL_TOW.right), hint: 'That is the tension in the tow bar, not the driving force.' },
            ],
            result: { symbol: 'a', value: OVERALL_TOW.a, unit: 'm s⁻²' },
          },
          why: `Both move together: a = ΣF / m = ${TOW.drive} / (${TOW.car} + ${TOW.trailer}) = ${ms2(OVERALL_TOW.a)}. One mark for the masses added, one for the answer.`,
        },
        {
          id: 'b',
          command: 'Explain',
          text: 'why the tension in the tow bar is less than the driving force.',
          marks: 2,
          kind: 'order',
          steps: [
            { id: 'both', text: 'The driving force has to accelerate the car and the trailer.' },
            { id: 'bar', text: 'The tow bar only has to accelerate the trailer.' },
            { id: 'tension', text: `So T = ${TOW.trailer} × ${fixed(OVERALL_TOW.a, 2)} = ${n(OVERALL_TOW.right)}.` },
            { id: 'less', text: `That is less than ${TOW.drive} N: the car needs the rest.` },
          ],
          why: 'The driving force moves 1600 kg, the tow bar only the 500 kg trailer. So its pull is about a third of the driving force.',
        },
      ],
    },
  ],
  youCanNow: [
    'Find the resultant force and use ΣF = ma',
    'Tell mass from weight, and use W = mg',
    'Find the acceleration of bodies joined by a string',
    "Use Newton's first law: no resultant force, no change in velocity",
  ],
  recap: {
    fig: crate({ force: PULL2, forces: ALL, values: true, accel: 'shown' }),
    text: `Twice the pull, but four times the resultant: ${n(sum1)} → ${n(sum2)}, so a goes from ${ms2(A1.right)} to ${ms2(A2.right)}.`,
  },
  card: {
    formula: 'ΣF = ma',
    idea: 'Only the resultant force accelerates a body, and it has to accelerate all the mass it moves.',
  },
};
