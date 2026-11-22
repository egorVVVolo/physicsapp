// Lesson "Kinetic and potential energy" — Ek = ½mv² and ΔEp = mgΔh (WPH11 points 18 and 19).
// The puzzle: an electric car speeds up from 0 to 10 m s⁻¹, then from 10 to 20 m s⁻¹. The same gain in speed costs
// 60.0 kJ, then 180 kJ: the energy is a square of side v. Then: at 20 m s⁻¹ the car holds as much energy as a 20.4 m
// lift would give it, and so does a van twice as heavy.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { heightForSpeed, kineticEnergy, potentialChange, speedFromKinetic } from '../physics/energy.ts';
import { G } from '../physics/kinematics.ts';
import { fixed, sig } from '../physics/format.ts';
import type { HeightFig, KineticFig, Lesson } from './types.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const J = (x: number): string => `${sig(x)}${NB}J`;
const KJ = (x: number): string => `${sig(x / 1000)}${NB}kJ`;
const MS = (x: number): string => `${sig(x)}${NB}m s⁻¹`;
const M = (x: number): string => `${sig(x)}${NB}m`;
const V = (x: number): string => `${x}${NB}m s⁻¹`; // the car's round speeds

// The puzzle: an electric car pulling away from traffic lights.
export const CAR = { m: 1200, v1: 10, v2: 20 }; // kg, m s⁻¹
// The car park: a floor 9.0 m higher, reached along 120 m of ramps.
export const PARK = { up: 9.0, along: 120 }; // m
// A van twice as heavy, at the same speed.
export const VAN = { m: 2400 }; // kg
// The washing machine of the lesson before: 40 kg lifted 1.2 m into a van.
export const MACHINE = { m: 40, h: 1.2 };
// Skill check.
export const CRICKET = { m: 0.16, v: 35 };
export const HIKER = { m: 62, path: 2400, up: 450 };
export const SERVE = { m: 0.058, E: 70 };
export const TROLLEYS = { mA: 0.6, vA: 2.4, mB: 1.5 };

const ek1 = kineticEnergy(CAR.m, CAR.v1);
const ek2 = kineticEnergy(CAR.m, CAR.v2);
const match = heightForSpeed(CAR.v2);
const trolleyE = kineticEnergy(TROLLEYS.mA, TROLLEYS.vA);

/** Answers and named mistakes, used by the screens and re-checked by kinetic-and-potential-energy.test.ts. */
export const ANSWERS = {
  ke10: { right: ek1, halfMv: 0.5 * CAR.m * CAR.v1, momentum: CAR.m * CAR.v1, noHalf: CAR.m * CAR.v1 ** 2 },
  explore: { at10: ek1, at20: ek2 },
  /** The puzzle: the work done in each stage is the gain in kinetic energy. */
  puzzle: { first: ek1, second: ek2 - ek1, end: ek2, noHalf1: 2 * ek1, noHalf2: 2 * (ek2 - ek1) },
  park: { right: potentialChange(CAR.m, PARK.up), along: potentialChange(CAR.m, PARK.along), noG: CAR.m * PARK.up, half: 0.5 * potentialChange(CAR.m, PARK.up) },
  crane: { ek: ek2, height: match },
  van: { right: heightForSpeed(CAR.v2), heavier: match / 2, double: 2 * match, vOverG: CAR.v2 / G },
  machine: potentialChange(MACHINE.m, MACHINE.h),
  cricket: { right: kineticEnergy(CRICKET.m, CRICKET.v), momentum: CRICKET.m * CRICKET.v, noHalf: CRICKET.m * CRICKET.v ** 2, notSquared: 0.5 * CRICKET.m * CRICKET.v },
  hiker: { right: potentialChange(HIKER.m, HIKER.up), path: potentialChange(HIKER.m, HIKER.path), noG: HIKER.m * HIKER.up, half: 0.5 * potentialChange(HIKER.m, HIKER.up) },
  serve: { right: speedFromKinetic(SERVE.m, SERVE.E), noTwo: Math.sqrt(SERVE.E / SERVE.m), noRoot: (2 * SERVE.E) / SERVE.m, divided: SERVE.E / SERVE.m },
  trolleys: { right: speedFromKinetic(TROLLEYS.mB, trolleyE), momentum: (TROLLEYS.mA * TROLLEYS.vA) / TROLLEYS.mB, flipped: TROLLEYS.vA * Math.sqrt(TROLLEYS.mB / TROLLEYS.mA), ratio: (TROLLEYS.vA * TROLLEYS.mB) / TROLLEYS.mA, energy: trolleyE },
};
const X = ANSWERS;

const car = (over: Partial<KineticFig>): KineticFig => ({ kind: 'kinetic', m: CAR.m, v: CAR.v2, ...over });
const crane: HeightFig = { kind: 'height', m: CAR.m, h: 5, match: CAR.v2 };

export const kineticAndPotentialEnergy: Lesson = {
  id: 'ke-gpe',
  title: 'Kinetic and potential energy',
  spec: [18, 19],
  minutes: 11,
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Kinetic and potential energy',
      body: `An electric car of ${CAR.m}${NB}kg pulls away from traffic lights. It speeds up to ${V(CAR.v1)}, then on to ${V(CAR.v2)}.`,
      fig: car({ play: true }),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: `Ignore friction and air. Which stage needs more work from the motor: 0 to ${CAR.v1}${NB}m s⁻¹, or ${CAR.v1} to ${CAR.v2}${NB}m s⁻¹?`,
      fig: car({ play: true }),
      options: [
        { id: 'first', label: `0 to ${CAR.v1}: getting going is the hard part` },
        { id: 'same', label: `The same: each stage adds ${CAR.v1}${NB}m s⁻¹` },
        { id: 'second', label: `${CAR.v1} to ${CAR.v2}: it is already going fast`, correct: true },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'kinetic',
      kind: 'text',
      body: [
        'A moving body has **kinetic energy**. It equals the work done to bring the body from rest up to its speed.',
        'For a mass m at speed v, Ek = ½mv², in joules. The mass counts once; the speed counts twice, because it is squared.',
      ],
      card: { term: 'Kinetic energy', text: 'Ek = ½mv²: the work needed to bring a mass m from rest to speed v.' },
    },
    {
      id: 'ke10',
      kind: 'choice',
      prompt: `How much kinetic energy does the ${CAR.m}${NB}kg car have at ${V(CAR.v1)}?`,
      fig: car({ v: CAR.v1, energy: 'afterCheck' }),
      options: [
        { id: 'halfMv', label: KJ(X.ke10.halfMv), hint: 'Square the speed: ½ × m × v × v.' },
        { id: 'momentum', label: KJ(X.ke10.momentum), hint: 'That is mv, the momentum. Kinetic energy is ½mv².' },
        { id: 'right', label: KJ(X.ke10.right), correct: true },
        { id: 'noHalf', label: KJ(X.ke10.noHalf), hint: 'Ek = ½mv²: don’t forget the ½.' },
      ],
      why: `Ek = ½mv² = ½ × ${CAR.m} × ${CAR.v1}² = ${J(X.ke10.right)} = ${KJ(X.ke10.right)}.`,
    },
    {
      id: 'why-square',
      kind: 'text',
      body: [
        'Why ½mv²? Push a body from rest with a steady resultant force F. The work done is FΔs, with F = ma and v² = 2aΔs.',
        'So FΔs = ma × v²/2a = ½mv². With the same force, twice the speed takes four times the distance: four times the work.',
      ],
    },
    {
      id: 'square',
      kind: 'explore',
      instruction: "Drag the slider to change the car's speed. Its kinetic energy is drawn as a square of side v.",
      fig: car({ v: CAR.v1, square: 'shown' }),
      slider: { min: 0, max: CAR.v2, step: 1, tick: 5, label: 'Speed of the car', unit: 'm s⁻¹', symbol: 'v', dp: 0, start: CAR.v1 },
      question: {
        prompt: `What happens to Ek when the speed doubles from ${CAR.v1} to ${V(CAR.v2)}?`,
        options: [
          { id: 'doubles', label: 'It doubles: twice the speed, twice the energy', hint: 'Count the cells: the square gets twice as wide and twice as tall.' },
          { id: 'right', label: 'It goes up four times', correct: true },
          { id: 'again', label: `It goes up by another ${KJ(ek1)}`, hint: 'Watch the cells: the band around the old square is bigger than the square.' },
        ],
        right: `Right: ${KJ(ek1)} becomes ${KJ(ek2)}. The side doubles, so the square holds four times as many cells.`,
      },
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Back to the car. How much work does the motor do from 0 to ${CAR.v1}${NB}m s⁻¹, and then from ${CAR.v1} to ${V(CAR.v2)}?`,
      fig: car({ stages: [CAR.v1, CAR.v2], square: 'afterCheck' }),
      options: [
        { id: 'linear', label: `${KJ(X.puzzle.first)}, then ${KJ(X.puzzle.first)}`, hint: `Ek grows with v², not v. Compare Ek at ${CAR.v1} and at ${V(CAR.v2)}.` },
        { id: 'end', label: `${KJ(X.puzzle.first)}, then ${KJ(X.puzzle.end)}`, hint: `${KJ(X.puzzle.end)} is all its energy at ${V(CAR.v2)}, and the car already had ${KJ(ek1)}.` },
        { id: 'right', label: `${KJ(X.puzzle.first)}, then ${KJ(X.puzzle.second)}`, correct: true },
        { id: 'noHalf', label: `${KJ(X.puzzle.noHalf1)}, then ${KJ(X.puzzle.noHalf2)}`, hint: 'Ek = ½mv²: don’t forget the ½.' },
      ],
      why: `Work done = gain in Ek. 0 to ${CAR.v1}: ${KJ(ek1)}. ${CAR.v1} to ${CAR.v2}: ${sig(ek2 / 1000)} − ${sig(ek1 / 1000)} = ${KJ(X.puzzle.second)}, three times as much for the same ${V(CAR.v1)}.`,
    },
    {
      id: 'gpe',
      kind: 'text',
      body: [
        'Lift a body at a steady speed and you do work against its weight: mg × Δh. That energy is stored as **gravitational potential energy**.',
        'Only the change in height counts: not the path taken, and not where you measure the height from.',
      ],
      card: { term: 'Gravitational potential energy', text: `ΔEp = mgΔh. The ${MACHINE.m}${NB}kg washing machine lifted ${fixed(MACHINE.h, 1)}${NB}m into the van gained ${J(X.machine)}.` },
    },
    {
      id: 'car-park',
      kind: 'choice',
      prompt: `The car drives up a car park to a floor ${fixed(PARK.up, 1)}${NB}m higher, along ${PARK.along}${NB}m of ramps. How much GPE does it gain?`,
      options: [
        { id: 'along', label: KJ(X.park.along), hint: `Gravity acts straight down: use the ${fixed(PARK.up, 1)}${NB}m rise, not the ramps.` },
        { id: 'right', label: KJ(X.park.right), correct: true },
        { id: 'noG', label: KJ(X.park.noG), hint: 'Use the weight, mg, not the mass.' },
        { id: 'half', label: KJ(X.park.half), hint: 'There is no ½ in mgΔh: that belongs to ½mv².' },
      ],
      why: `ΔEp = mgΔh = ${CAR.m} × ${G} × ${fixed(PARK.up, 1)} = ${KJ(X.park.right)}. The ${PARK.along}${NB}m of ramps do not matter: only the rise does.`,
    },
    {
      id: 'crane',
      kind: 'explore',
      instruction: `Drag the slider to raise the car on a crane. Compare its GPE with its kinetic energy at ${V(CAR.v2)}.`,
      fig: crane,
      slider: { min: 0, max: 25, step: 0.5, tick: 5, label: 'Height of the car', unit: 'm', symbol: 'h', dp: 1, start: 5 },
      question: {
        prompt: `About how high must the car go to store as much GPE as its kinetic energy at ${V(CAR.v2)}?`,
        options: [
          { id: 'two', label: 'About 2 m', hint: 'At 2 m the GPE bar is far below the Ek bar.' },
          { id: 'right', label: 'About 20 m', correct: true },
          { id: 'forty', label: 'About 40 m', hint: 'That is off the top of the ruler: the bars meet lower down.' },
        ],
        right: `Right: the bars meet at ${M(match)}. At ${V(CAR.v2)} the car carries the energy of a fall from ${M(match)}.`,
      },
    },
    {
      id: 'van',
      kind: 'choice',
      prompt: `A ${VAN.m}${NB}kg van also drives at ${V(CAR.v2)}. How high must a crane lift it to store as much GPE as its kinetic energy?`,
      options: [
        { id: 'heavier', label: `${M(X.van.heavier)}: it is twice as heavy`, hint: 'Its kinetic energy doubles too. Write mgh = ½mv² and look at m.' },
        { id: 'right', label: `${M(X.van.right)}, the same as the car`, correct: true },
        { id: 'double', label: `${M(X.van.double)}: it has twice the energy`, hint: 'Twice the energy, but its weight is twice as big too.' },
        { id: 'vOverG', label: M(X.van.vOverG), hint: 'That is v ÷ g. Set mgh = ½mv² and solve for h.' },
      ],
      why: `mgh = ½mv², and m is on both sides: h = v² ÷ 2g = ${CAR.v2}² ÷ (2 × ${G}) = ${M(X.van.right)}, for any mass.`,
    },
    {
      id: 'rules',
      kind: 'text',
      body: [
        '**Kinetic energy** Ek = ½mv² is the work needed to reach speed v from rest. Twice the speed, four times the energy.',
        '**Gravitational potential energy** changes by mgΔh: only the height counts. Next: energy that changes from one form to another.',
      ],
    },
  ],
  skillCheck: [
    {
      id: 'cricket',
      kind: 'choice',
      prompt: `A bowler releases a ${CRICKET.m}${NB}kg cricket ball at ${MS(CRICKET.v)}. What is its kinetic energy?`,
      options: [
        { id: 'momentum', label: J(X.cricket.momentum) },
        { id: 'right', label: J(X.cricket.right), correct: true },
        { id: 'noHalf', label: J(X.cricket.noHalf) },
        { id: 'notSquared', label: J(X.cricket.notSquared) },
      ],
      why: `Ek = ½ × ${CRICKET.m} × ${CRICKET.v}² = ${J(X.cricket.right)}. (${sig(X.cricket.momentum)} is mv, the momentum, in kg m s⁻¹.)`,
    },
    {
      id: 'hiker',
      kind: 'choice',
      prompt: `A ${HIKER.m}${NB}kg walker follows a ${fixed(HIKER.path / 1000, 1)}${NB}km path that climbs ${HIKER.up}${NB}m. What is her gain in gravitational potential energy?`,
      options: [
        { id: 'path', label: KJ(X.hiker.path) },
        { id: 'noG', label: KJ(X.hiker.noG) },
        { id: 'right', label: KJ(X.hiker.right), correct: true },
        { id: 'half', label: KJ(X.hiker.half) },
      ],
      why: `ΔEp = mgΔh = ${HIKER.m} × ${G} × ${HIKER.up} = ${KJ(X.hiker.right)}. Only the ${HIKER.up}${NB}m climb counts, not the length of the path.`,
    },
    {
      id: 'serve',
      kind: 'choice',
      prompt: `A ${SERVE.m}${NB}kg tennis ball leaves the racket with ${SERVE.E}${NB}J of kinetic energy. How fast is it moving?`,
      options: [
        { id: 'noTwo', label: MS(X.serve.noTwo) },
        { id: 'right', label: MS(X.serve.right), correct: true },
        { id: 'noRoot', label: MS(X.serve.noRoot) },
        { id: 'divided', label: MS(X.serve.divided) },
      ],
      why: `v = √(2Ek ÷ m) = √(2 × ${SERVE.E} ÷ ${SERVE.m}) = ${MS(X.serve.right)}.`,
    },
    {
      id: 'trolleys',
      kind: 'choice',
      prompt: `Trolley A, ${fixed(TROLLEYS.mA, 2)}${NB}kg, moves at ${MS(TROLLEYS.vA)}. Trolley B, ${fixed(TROLLEYS.mB, 1)}${NB}kg, has the same kinetic energy. How fast does B move?`,
      options: [
        { id: 'momentum', label: MS(X.trolleys.momentum) },
        { id: 'right', label: MS(X.trolleys.right), correct: true },
        { id: 'flipped', label: MS(X.trolleys.flipped) },
        { id: 'ratio', label: MS(X.trolleys.ratio) },
      ],
      why: `A has ½ × ${fixed(TROLLEYS.mA, 2)} × ${TROLLEYS.vA}² = ${J(X.trolleys.energy)}. B: v = √(2 × ${sig(X.trolleys.energy)} ÷ ${fixed(TROLLEYS.mB, 1)}) = ${MS(X.trolleys.right)}. (${sig(X.trolleys.momentum)} would give B the same momentum.)`,
    },
  ],
  youCanNow: [
    'Calculate kinetic energy with Ek = ½mv²',
    'Find a speed from a kinetic energy',
    'Calculate a change in GPE with ΔEp = mgΔh',
    'Explain why each extra m s⁻¹ costs more energy at speed',
  ],
  recap: {
    fig: car({ stages: [CAR.v1, CAR.v2], square: 'shown' }),
    text: `The same ${V(CAR.v1)} costs ${KJ(ek1)} from rest and ${KJ(ek2 - ek1)} from ${V(CAR.v1)}: kinetic energy grows with v².`,
  },
  card: {
    formula: 'Ek = ½mv²  ΔEp = mgΔh',
    idea: 'Kinetic energy grows with the square of the speed; GPE changes by weight × change in height.',
  },
};
