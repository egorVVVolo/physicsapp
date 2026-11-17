// Lesson "Force and acceleration" — ΣF = ma and Newton's first law (WPH11 point 9), g = F/m and W = mg (point 10).
// The puzzle: Rose drags her 40 kg crate with a flat rope, 150 N against 100 N of friction. She pulls twice as hard.
// The acceleration is four times bigger, not twice: the resultant goes from 50 N to 200 N (1.25 → 5.00 m s⁻²).
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { G } from '../physics/kinematics.ts';
import { acceleration, connectedAcceleration, fieldStrength, pulleyRun, stringTension, weight } from '../physics/dynamics.ts';
import { fixed } from '../physics/format.ts';
import type { CrateFig, Lesson, PulleyFig } from './types.ts';

const NB = ' ';
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
  },
  tow: { right: TOW.trailer * towA, whole: TOW.drive, ratio: (TOW.drive * TOW.trailer) / TOW.car, car: TOW.car * towA },
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

export const forceAndAcceleration: Lesson = {
  id: 'f-ma',
  title: 'Force and acceleration',
  spec: [9, 10],
  minutes: 12,
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
        { id: 'more', label: 'It more than doubles' },
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
      kind: 'choice',
      prompt: `The crate has a mass of ${M} kg. What is its acceleration while Rose pulls with ${PULL} N?`,
      fig: crate({ forces: ALL, values: true, accel: 'afterCheck' }),
      options: [
        { id: 'pull-only', label: ms2(A1.pullOnly), hint: 'That is the pull alone. Friction pulls back, so use the resultant.' },
        { id: 'added', label: ms2(A1.added), hint: 'Friction points backward: take it away, do not add it.' },
        { id: 'right', label: ms2(A1.right), correct: true },
        { id: 'by-weight', label: ms2(A1.byWeight, 3), hint: `You divided by the weight, ${n(W)}. Divide by the mass in kg.` },
      ],
      why: `a = ΣF / m = ${n(sum1)} / ${M} kg = ${ms2(A1.right)}. Only the ${n(sum1)} left over after friction speeds the crate up.`,
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
      prompt: `Back to the puzzle. Rose pulls with ${PULL2} N, and friction is still ${FRICTION} N. What is the acceleration now?`,
      fig: crate({ force: PULL2, forces: ALL, values: true, accel: 'afterCheck' }),
      options: [
        { id: 'doubled', label: ms2(A2.doubled), hint: `The pull doubles, but ΣF goes from ${n(sum1)} to ${n(sum2)}.` },
        { id: 'pull-only', label: ms2(A2.pullOnly), hint: 'That is the pull alone. Friction still takes 100 N away.' },
        { id: 'same', label: ms2(A2.same), hint: 'A bigger resultant force gives a bigger acceleration, not just more speed.' },
        { id: 'right', label: ms2(A2.right), correct: true },
      ],
      why: `ΣF = ${PULL2} − ${FRICTION} = ${n(sum2)}, four times ${n(sum1)}. So a = ${n(sum2)} / ${M} kg = ${ms2(A2.right)}: four times bigger.`,
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
      id: 'moon',
      kind: 'choice',
      prompt: `On the Moon, g = ${MOON_G} N kg⁻¹. The ${M} kg crate slides on smooth ice there with a resultant force of ${n(sum1)}. What is its acceleration?`,
      options: [
        { id: 'smaller-mass', label: ms2(X.moon.smallerMass), hint: 'The mass does not change on the Moon. Only the weight does.' },
        { id: 'moon-weight', label: ms2(X.moon.byMoonWeight, 3), hint: 'You divided by the Moon weight. ΣF = ma uses the mass.' },
        { id: 'right', label: ms2(X.moon.right), correct: true },
      ],
      why: `a = ${n(sum1)} / ${M} kg = ${ms2(X.moon.right)}, the same as on Earth. Mass, not weight, sets how hard it is to speed up.`,
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
      id: 'tension',
      kind: 'choice',
      prompt: 'How hard does the string pull on the trolley while they accelerate?',
      fig: lab({ forces: true, tension: 'afterCheck' }),
      options: [
        { id: 'weight', label: n(X.lab.T.weight, 2), hint: 'Then the forces on the hanging mass would balance, and it could not speed up.' },
        { id: 'ma', label: n(X.lab.T.ma, 3), hint: "That is the hanging mass's own ΣF. The trolley needs M × a." },
        { id: 'right', label: n(X.lab.T.right, 2), correct: true },
        { id: 'sum', label: n(X.lab.T.sum, 2), hint: 'The mass accelerates down, so T is less than W, not more.' },
      ],
      why: `T is the only force along the bench, so T = Ma = ${fixed(LAB.trolley, 2)} × ${fixed(labA, 2)} = ${n(labT, 2)}, less than the ${n(labW, 2)} weight.`,
    },
    {
      id: 'heavier',
      kind: 'explore',
      instruction: 'Drag the slider to change the hanging mass.',
      fig: lab({ play: true }),
      slider: { min: 0.1, max: 2.0, step: 0.05, tick: 0.5, label: 'Hanging mass', unit: 'kg', symbol: 'm', dp: 2, start: LAB.hanging },
      question: {
        prompt: 'As the hanging mass gets bigger, what happens to the acceleration?',
        options: [
          { id: 'step', label: 'It grows in step: twice the mass, twice the a', hint: 'Compare 0.20 kg with 0.40 kg in the header.' },
          { id: 'right', label: `It grows, but stays below ${G} m s⁻²`, correct: true },
          { id: 'same', label: 'It stays the same', hint: 'Drag the slider and watch a in the header.' },
        ],
        right: 'Right: a bigger weight pulls, but it also has more mass to speed up. It never reaches free fall.',
      },
    },
    {
      id: 'slack',
      kind: 'choice',
      prompt: `After falling ${fixed(LAB.drop, 2)} m the mass lands and the string goes slack. What does the trolley do next?`,
      fig: lab({ at: 'landed', play: 'afterCheck' }),
      options: [
        { id: 'slows', label: 'It slows down and stops', hint: 'The bench is smooth. What force would slow it down?' },
        { id: 'faster', label: 'It keeps speeding up', hint: 'Nothing pulls it any more, so nothing speeds it up.' },
        { id: 'right', label: `It rolls on at a steady ${fixed(X.lab.vLand, 2)} m s⁻¹`, correct: true },
        { id: 'stops', label: 'It stops at once', hint: 'Stopping at once would need a huge force backward.' },
      ],
      why: "No resultant force acts along the bench now, so the trolley's velocity does not change: Newton's first law. The marks stay evenly spaced.",
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
      id: 'tow',
      kind: 'choice',
      prompt: `A ${TOW.car} kg car tows a ${TOW.trailer} kg trailer. The driving force is ${TOW.drive} N; resistive forces are negligible. What is the tension in the tow bar?`,
      options: [
        { id: 'whole', label: n(X.tow.whole) },
        { id: 'ratio', label: n(X.tow.ratio) },
        { id: 'right', label: n(X.tow.right), correct: true },
        { id: 'car', label: n(X.tow.car) },
      ],
      why: `Both speed up together: a = ${TOW.drive} / ${TOW.car + TOW.trailer} = ${ms2(towA)}. The tow bar alone pulls the trailer: T = ${TOW.trailer} × ${fixed(towA, 2)} = ${n(X.tow.right)}.`,
    },
    {
      id: 'rocket',
      kind: 'choice',
      prompt: `A ${fixed(ROCKET.m, 2)} kg model rocket lifts off with a thrust of ${fixed(ROCKET.thrust, 1)} N. Air resistance is negligible; g = ${G} N kg⁻¹. What is its acceleration?`,
      options: [
        { id: 'no-weight', label: ms2(X.rocket.noWeight, 1) },
        { id: 'right', label: ms2(X.rocket.right), correct: true },
        { id: 'added', label: ms2(X.rocket.added, 1) },
        { id: 'by-weight', label: ms2(X.rocket.byWeight, 3) },
      ],
      why: `ΣF = thrust − weight = ${fixed(ROCKET.thrust, 1)} − ${n(rocketW, 2)} = ${n(ROCKET.thrust - rocketW, 2)}, so a = ${fixed(ROCKET.thrust - rocketW, 2)} / ${fixed(ROCKET.m, 2)} = ${ms2(X.rocket.right)}.`,
    },
    {
      id: 'mars',
      kind: 'choice',
      prompt: `On Mars a ${fixed(MARS.m, 2)} kg rock hangs still from a spring balance reading ${fixed(MARS.reading, 2)} N. A probe's arm then lifts it with ${fixed(MARS.lift, 1)} N. What is its acceleration?`,
      options: [
        { id: 'no-weight', label: `${ms2(X.mars.noWeight)} upward` },
        { id: 'earth', label: `None: its weight is ${n(X.mars.earthWeight, 1)}, so it does not rise` },
        { id: 'right', label: `${ms2(X.mars.right)} upward`, correct: true },
        { id: 'added', label: `${ms2(X.mars.added)} upward` },
      ],
      why: `Hanging still, the balance reads its weight on Mars: ${fixed(MARS.reading, 2)} N (g = ${fixed(marsG, 2)} N kg⁻¹). a = (${fixed(MARS.lift, 1)} − ${fixed(MARS.reading, 2)}) / ${fixed(MARS.m, 2)} = ${ms2(X.mars.right)}.`,
    },
    {
      id: 'car',
      kind: 'choice',
      prompt: `A ${CAR.m} kg car speeds up from rest to ${fixed(CAR.v, 1)} m s⁻¹ in ${fixed(CAR.t, 1)} s. The resistive forces are ${CAR.resist} N. What is the driving force?`,
      options: [
        { id: 'forgot', label: n(X.car.forgot) },
        { id: 'subtracted', label: n(X.car.subtracted) },
        { id: 'mv', label: n(X.car.mv) },
        { id: 'right', label: n(X.car.right), correct: true },
      ],
      why: `a = ${fixed(CAR.v, 1)} / ${fixed(CAR.t, 1)} = ${ms2(carA, 1)}, so ΣF = ${CAR.m} × ${fixed(carA, 1)} = ${n(X.car.forgot)}. The engine must also beat ${CAR.resist} N: ${n(X.car.right)}.`,
    },
  ],
  youCanNow: [
    'Find the resultant force and use ΣF = ma',
    'Tell mass from weight, and use W = mg on any planet',
    'Find the acceleration and tension for bodies joined by a string',
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
