// Lesson "Work done" — ΔW = FΔs, including a force at an angle to the motion (WPH11 point 17).
// The puzzle: Nadia carries her suitcase 30 m along a platform, Omar pulls his on its wheels. Omar's 40 N pull does
// 600 J; Nadia's 147 N lift does no work at all: it is at right angles to the motion.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { weight } from '../physics/dynamics.ts';
import { fixed, sig } from '../physics/format.ts';
import { forceFromWork, liftWork, rampPush, workDone } from '../physics/work.ts';
import type { Lesson, PlatformFig, PlatformLane, RampFig } from './types.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const J = (x: number): string => `${sig(x)}${NB}J`;
const N = (x: number): string => `${sig(x)}${NB}N`;

// The puzzle: identical suitcases taken along a level platform at a steady speed.
export const TRIP = { m: 15, s: 30 }; // kg, m
export const OMAR = { F: 40, angle: 60 }; // N, degrees to the floor
// The mover: a box pushed at a steady speed, her push balancing the friction.
export const MOVER = { m: 40, s: 6.0, friction: 150 };
// The van: a washing machine raised into a van, up a smooth ramp or straight up.
export const VAN = { m: 40, h: 1.2, L: 3.0 };
// Skill check.
export const MOWER = { F: 60, s: 25, angle: 40 };
export const STAIRS = { m: 55, up: 3.6, across: 4.8 };
export const SLIDE = { s: 2.5, friction: 24 };

const caseWeight = weight(TRIP.m);
const omarWork = workDone(OMAR.F, TRIP.s, OMAR.angle);
const nadiaWork = workDone(caseWeight, TRIP.s, 90);
const lift = liftWork(VAN.m, VAN.h);
const stairsAlong = Math.hypot(STAIRS.up, STAIRS.across);
const sinRamp = VAN.h / VAN.L;

/** Answers and named mistakes, used by the screens and re-checked by work-done.test.ts. */
export const ANSWERS = {
  mover: { right: workDone(MOVER.friction, MOVER.s), weight: workDone(weight(MOVER.m), MOVER.s), divided: MOVER.friction / MOVER.s },
  explore: { flat: workDone(OMAR.F, TRIP.s, 0), steep: workDone(OMAR.F, TRIP.s, 90) },
  /** The puzzle. */
  puzzle: { nadia: nadiaWork, omar: omarWork, nadiaWhole: workDone(caseWeight, TRIP.s), omarWhole: workDone(OMAR.F, TRIP.s), weight: caseWeight, resistance: OMAR.F * Math.cos((OMAR.angle * Math.PI) / 180) },
  ramp: { work: lift, weight: weight(VAN.m), short: rampPush(VAN.m, VAN.h, 1.6), long: rampPush(VAN.m, VAN.h, 4.0) },
  rampPush: { right: forceFromWork(lift, VAN.L), weight: weight(VAN.m), into: weight(VAN.m) * Math.sqrt(1 - sinRamp * sinRamp), times: lift * VAN.L },
  mower: { right: workDone(MOWER.F, MOWER.s, MOWER.angle), whole: workDone(MOWER.F, MOWER.s), sin: MOWER.F * MOWER.s * Math.sin((MOWER.angle * Math.PI) / 180), noDistance: workDone(MOWER.F, 1, MOWER.angle) },
  stairs: { right: liftWork(STAIRS.m, STAIRS.up), across: liftWork(STAIRS.m, STAIRS.across), along: liftWork(STAIRS.m, stairsAlong), mass: STAIRS.m * STAIRS.up },
  slide: { right: workDone(SLIDE.friction, SLIDE.s), divided: SLIDE.friction / SLIDE.s },
};
const X = ANSWERS;

const nadia: PlatformLane = { name: 'NADIA', how: 'carry', load: 'suitcase', F: caseWeight, angle: 90 };
const omar: PlatformLane = { name: 'OMAR', how: 'pull', load: 'suitcase', F: OMAR.F, angle: OMAR.angle };
const platform = (over: Partial<PlatformFig>): PlatformFig => ({ kind: 'platform', header: `suitcases ${TRIP.m} kg, steady speed`, lanes: [nadia, omar], dist: TRIP.s, ...over });
const van = (over: Partial<RampFig>): RampFig => ({ kind: 'ramp', m: VAN.m, h: VAN.h, L: VAN.L, push: 'shown', work: true, ...over });

export const workDoneLesson: Lesson = {
  id: 'work',
  title: 'Work done',
  spec: [17],
  minutes: 11,
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Work done',
      body: `Nadia and Omar take identical ${TRIP.m}${NB}kg suitcases ${TRIP.s}${NB}m along a platform. Nadia carries hers; Omar wheels his.`,
      fig: platform({ play: true }),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: `Both walk at a steady speed. Over the ${TRIP.s}${NB}m, who does more work on their suitcase?`,
      fig: platform({ forces: true }),
      options: [
        { id: 'nadia', label: `Nadia: she holds up all ${N(caseWeight)}` },
        { id: 'omar', label: 'Omar: his pull moves the suitcase along', correct: true },
        { id: 'same', label: `The same: both suitcases go ${TRIP.s}${NB}m` },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'work',
      kind: 'text',
      body: [
        'A force does **work** when the thing it acts on moves in the direction of the force. Work done is the force times the distance moved that way.',
        'Work is measured in **joules**. One joule is the work done when a force of 1 N moves its point 1 m along its own direction.',
      ],
      card: { term: 'Work done', text: 'ΔW = FΔs: force × distance moved in the direction of the force. 1 J = 1 N m.' },
    },
    {
      id: 'mover',
      kind: 'choice',
      prompt: `A mover pushes a ${MOVER.m}${NB}kg box ${fixed(MOVER.s, 1)}${NB}m at a steady speed. Her flat push balances ${MOVER.friction}${NB}N of friction. How much work does her push do?`,
      fig: { kind: 'platform', header: `box ${MOVER.m} kg, steady speed`, lanes: [{ name: 'MOVER', how: 'push', load: 'box', F: MOVER.friction, angle: 0, friction: MOVER.friction }], dist: MOVER.s, forces: true, work: 'afterCheck' },
      options: [
        { id: 'zero', label: `0${NB}J`, hint: 'Steady speed means no resultant force, not no work. Her push moves the box.' },
        { id: 'divided', label: J(X.mover.divided), hint: 'Work is force times distance, not force divided by it.' },
        { id: 'right', label: J(X.mover.right), correct: true },
        { id: 'weight', label: J(X.mover.weight), hint: 'The weight acts down and the box moves sideways. Use her push.' },
      ],
      why: `ΔW = FΔs = ${MOVER.friction} × ${fixed(MOVER.s, 1)} = ${J(X.mover.right)}. At a steady speed her push equals the friction, and it still moves the box ${fixed(MOVER.s, 1)}${NB}m.`,
    },
    {
      id: 'angle',
      kind: 'text',
      body: [
        'Only the part of a force **along the motion** does work. Split the force in two: the part along the motion moves with the body, the part across it does not.',
        'A force at θ to the motion does work FΔs cos θ. At 90°, cos θ = 0: a force at right angles to the motion does **no work**.',
      ],
      card: { term: 'Force at an angle', text: 'ΔW = FΔs cos θ, where θ is the angle between the force and the motion.' },
    },
    {
      id: 'handle',
      kind: 'explore',
      instruction: `Drag the slider to tilt Omar's handle. Watch the work his ${OMAR.F}${NB}N pull does over ${TRIP.s}${NB}m.`,
      fig: { kind: 'platform', header: `pull ${OMAR.F} N`, lanes: [{ ...omar, angle: 0 }], dist: TRIP.s, forces: true, split: true, work: 'shown' },
      slider: { min: 0, max: 90, step: 5, tick: 15, label: 'Angle of the handle to the floor', unit: '°', symbol: 'θ', dp: 0, start: 0 },
      question: {
        prompt: 'What happens to the work as the handle gets steeper?',
        options: [
          { id: 'grows', label: 'It grows: a steeper pull lifts as well', hint: 'The suitcase never goes up, so lifting does no work. Watch ΔW.' },
          { id: 'right', label: 'It falls, down to zero at 90°', correct: true },
          { id: 'same', label: `It stays ${J(X.explore.flat)}: the pull is always ${OMAR.F}${NB}N`, hint: 'Only the forward part counts, and it shrinks as the handle tilts.' },
        ],
        right: `Right: ΔW = ${OMAR.F} × ${TRIP.s} × cos θ. Straight up, the pull is at right angles to the motion and does no work.`,
      },
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Back to the platform: Omar pulls ${OMAR.F}${NB}N at ${OMAR.angle}°, Nadia holds her ${N(caseWeight)} suitcase up. How much work does each do?`,
      fig: platform({ forces: true, split: true, work: 'afterCheck' }),
      options: [
        { id: 'whole', label: `Nadia ${J(X.puzzle.nadiaWhole)}, Omar ${J(X.puzzle.omarWhole)}`, hint: 'Only the part of each force along the motion does work.' },
        { id: 'carry', label: `Nadia ${J(X.puzzle.nadiaWhole)}, Omar ${J(omarWork)}`, hint: 'Nadia’s force is straight up and her suitcase moves sideways: θ = 90°.' },
        { id: 'omarWhole', label: `Nadia 0${NB}J, Omar ${J(X.puzzle.omarWhole)}`, hint: 'Only the forward part of Omar’s pull moves along: use cos 60°.' },
        { id: 'right', label: `Nadia 0${NB}J, Omar ${J(omarWork)}`, correct: true },
      ],
      why: `Omar: ${OMAR.F} × ${TRIP.s} × cos ${OMAR.angle}° = ${J(omarWork)}. Nadia’s ${N(caseWeight)} is at 90° to the motion: cos 90° = 0, so she does no work on the suitcase.`,
    },
    {
      id: 'energy',
      kind: 'text',
      body: [
        `Work done is **energy transferred**. Omar's suitcase never speeds up, so his ${J(omarWork)} heats its wheels: work done against a ${N(X.puzzle.resistance)} resistance.`,
        "Nadia's arms still ache. Muscles use energy just to hold a load up, but none of that energy goes into the suitcase.",
      ],
    },
    {
      id: 'which',
      kind: 'choice',
      prompt: 'Which of these forces does work?',
      options: [
        { id: 'wall', label: 'Your hard push on a wall that does not move', hint: 'The wall moves 0 m, so ΔW = F × 0 = 0.' },
        { id: 'tray', label: "A waiter's push up on a tray as he walks across a room", hint: 'The push is up, the motion sideways: at 90° it does no work.' },
        { id: 'right', label: 'A crane cable pulling a load straight up', correct: true },
        { id: 'floor', label: "The floor's push up on a box sliding across it", hint: 'At right angles to the motion again: no work.' },
      ],
      why: 'The cable pulls along the motion, so it does work: force × height. The others move nothing, or act at right angles to the motion.',
    },
    {
      id: 'ramp',
      kind: 'explore',
      instruction: `Drag the slider to make the ramp longer. Movers push a ${VAN.m}${NB}kg washing machine up it into a van.`,
      fig: van({}),
      slider: { min: 1.6, max: 4.0, step: 0.4, tick: 0.8, label: 'Length of the ramp', unit: 'm', symbol: 'L', dp: 1, start: 1.6 },
      question: {
        prompt: 'What happens to the work needed to get the machine into the van?',
        options: [
          { id: 'less', label: 'Less with a longer ramp: the push is smaller', hint: 'The push shrinks, but the distance grows just as fast. Watch the sums.' },
          { id: 'more', label: 'More with a longer ramp: it goes further', hint: 'It goes further, but with a smaller push. Watch the sums.' },
          { id: 'right', label: `The same, ${J(lift)}, whatever the ramp`, correct: true },
        ],
        right: `Right: a smaller push over a longer distance. Push × length is ${J(lift)} every time, the same as lifting it straight up.`,
      },
    },
    {
      id: 'ramp-push',
      kind: 'choice',
      prompt: `The movers use a ${fixed(VAN.L, 1)}${NB}m ramp. Using the work done, what steady push along the ramp do they need?`,
      fig: van({ push: 'afterCheck' }),
      options: [
        { id: 'weight', label: N(X.rampPush.weight), hint: 'That is the whole weight, for a straight lift. The ramp spreads the work out.' },
        { id: 'right', label: N(X.rampPush.right), correct: true },
        { id: 'into', label: N(X.rampPush.into), hint: 'That is the part of the weight into the ramp. Use F = ΔW ÷ Δs.' },
        { id: 'times', label: N(X.rampPush.times), hint: 'Divide the work by the distance: F = ΔW ÷ Δs.' },
      ],
      why: `The work up the ramp equals the work to lift it: F × ${fixed(VAN.L, 1)} = ${J(lift)}, so F = ${sig(lift)} ÷ ${fixed(VAN.L, 1)} = ${N(X.rampPush.right)}.`,
    },
    {
      id: 'rules',
      kind: 'text',
      body: [
        'Work done = force × distance moved in the direction of the force: ΔW = FΔs, or FΔs cos θ at an angle. A force at right angles to the motion does **no work**.',
        `Work done is energy transferred, in joules. Lifting the machine gave it ${J(lift)}: the next lesson names that energy.`,
      ],
    },
  ],
  skillCheck: [
    {
      id: 'mower',
      kind: 'choice',
      prompt: `Ella pushes a lawnmower ${MOWER.s}${NB}m with a ${MOWER.F}${NB}N force along its handle, at ${MOWER.angle}° below the horizontal. How much work does her push do?`,
      options: [
        { id: 'sin', label: J(X.mower.sin) },
        { id: 'right', label: J(X.mower.right), correct: true },
        { id: 'whole', label: J(X.mower.whole) },
        { id: 'noDistance', label: J(X.mower.noDistance) },
      ],
      why: `Only the part along the lawn does work: ${MOWER.F} × cos ${MOWER.angle}° = ${N(MOWER.F * Math.cos((MOWER.angle * Math.PI) / 180))}, times ${MOWER.s}${NB}m gives ${J(X.mower.right)}.`,
    },
    {
      id: 'stairs',
      kind: 'choice',
      prompt: `A ${STAIRS.m}${NB}kg student climbs a flight of stairs that rises ${fixed(STAIRS.up, 1)}${NB}m over ${fixed(STAIRS.across, 1)}${NB}m across. How much work does she do against gravity?`,
      options: [
        { id: 'across', label: J(X.stairs.across) },
        { id: 'mass', label: J(X.stairs.mass) },
        { id: 'right', label: J(X.stairs.right), correct: true },
        { id: 'along', label: J(X.stairs.along) },
      ],
      why: `Her weight, ${N(weight(STAIRS.m))}, acts straight down, so only the height counts: ${sig(weight(STAIRS.m))} × ${fixed(STAIRS.up, 1)} = ${J(X.stairs.right)}.`,
    },
    {
      id: 'joule',
      kind: 'choice',
      prompt: 'What is the joule in SI base units?',
      options: [
        { id: 'newton', label: 'kg m s⁻²' },
        { id: 'right', label: 'kg m² s⁻²', correct: true },
        { id: 'momentum', label: 'kg m s⁻¹' },
        { id: 'other', label: 'kg m² s⁻¹' },
      ],
      why: '1 J = 1 N × 1 m, and 1 N = 1 kg m s⁻². So 1 J = 1 kg m² s⁻². (kg m s⁻² is the newton; kg m s⁻¹ is momentum.)',
    },
    {
      id: 'slide',
      kind: 'choice',
      prompt: `A box slides ${fixed(SLIDE.s, 1)}${NB}m across a floor and stops; the friction on it is ${SLIDE.friction}${NB}N. What work is done against friction, and where does the energy go?`,
      options: [
        { id: 'stored', label: `${J(X.slide.right)}, stored in the box` },
        { id: 'divided', label: `${J(X.slide.divided)}, heating the box and the floor` },
        { id: 'zero', label: `0${NB}J: the box ends at rest` },
        { id: 'right', label: `${J(X.slide.right)}, heating the box and the floor`, correct: true },
      ],
      why: `ΔW = ${SLIDE.friction} × ${fixed(SLIDE.s, 1)} = ${J(X.slide.right)}. Work done against friction is energy transferred by heating the box and the floor.`,
    },
  ],
  youCanNow: [
    'Calculate work as force × distance in the direction of the force',
    'Use ΔW = FΔs cos θ for a force at an angle',
    'Spot forces that do no work',
    'Treat work done as energy transferred',
  ],
  recap: {
    fig: platform({ forces: true, work: 'shown' }),
    text: `Nadia's ${N(caseWeight)} lift is at right angles to the motion and does no work. Omar's ${OMAR.F}${NB}N pull does ${J(omarWork)}.`,
  },
  card: {
    formula: 'ΔW = FΔs cos θ',
    idea: 'Work = force × distance moved along the force: energy transferred. A force at 90° to the motion does none.',
  },
};
