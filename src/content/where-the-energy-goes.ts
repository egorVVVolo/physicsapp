// Lesson "Where the energy goes" — conservation of energy, with work done, GPE and kinetic energy (WPH11 point 20).
// The puzzle: three stones thrown at 12 m s⁻¹ from a 20 m cliff, up at 45°, level and down at 45°. All three hit the
// sea at 23.2 m s⁻¹: each starts with the same ½mu² + mgh, and energy has no direction. Then friction: a child on a
// slide arrives at 4.0 m s⁻¹, not 7.00; friction took 413 J (82.6 N over 5.0 m), and a longer slide is slower.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { energyToFriction, heightForSpeed, kineticEnergy, potentialChange, slideSpeed, speedAfterDrop } from '../physics/energy.ts';
import { forceFromWork, workDone } from '../physics/work.ts';
import { G } from '../physics/kinematics.ts';
import { fixed, sig } from '../physics/format.ts';
import type { CliffFig, Lesson, SlideFig } from './types.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const J = (x: number): string => `${sig(x)}${NB}J`;
const KJ = (x: number): string => `${sig(x / 1000)}${NB}kJ`;
const N = (x: number): string => `${sig(x)}${NB}N`;
const MS = (x: number): string => `${sig(x)}${NB}m s⁻¹`;
const M = (x: number): string => `${sig(x)}${NB}m`;

// The puzzle: three identical stones thrown from a sea cliff.
export const CLIFF = { h: 20, u: 12, m: 0.4 }; // m, m s⁻¹, kg
export const STONES = [
  { id: 'A', angle: 45 },
  { id: 'B', angle: 0 },
  { id: 'C', angle: -45 },
];
// The playground slide: Ella, from rest, reaches the foot at 4.0 m s⁻¹.
export const SLIDE = { m: 25, h: 2.5, L: 5.0, v: 4.0 }; // kg, m, m, m s⁻¹
export const LONGER = { min: 3.0, max: 7.0 }; // m, the explore's slide lengths
// Skill check.
export const COASTER = { drop: 32, hill: 14 }; // m
export const SKATER = { v: 6.0 };
export const CYCLIST = { m: 80, drop: 12, u: 4.0, v: 13 };
export const BALL = { m: 0.2, u: 15, rise: 10.0 };

const land = speedAfterDrop(CLIFF.u, CLIFF.h);
const dropV = speedAfterDrop(0, CLIFF.h);
const total = potentialChange(CLIFF.m, CLIFF.h) + kineticEnergy(CLIFF.m, CLIFF.u);
const slideEp = potentialChange(SLIDE.m, SLIDE.h);
const slideEk = kineticEnergy(SLIDE.m, SLIDE.v);
const heat = energyToFriction(SLIDE.m, SLIDE.h, 0, SLIDE.v);
const friction = forceFromWork(heat, SLIDE.L);
const cycEp = potentialChange(CYCLIST.m, CYCLIST.drop);
const cycEk = kineticEnergy(CYCLIST.m, CYCLIST.v) - kineticEnergy(CYCLIST.m, CYCLIST.u);
const ballEk = kineticEnergy(BALL.m, BALL.u);
const ballEp = potentialChange(BALL.m, BALL.rise);

/** Answers and named mistakes, used by the screens and re-checked by where-the-energy-goes.test.ts. */
export const ANSWERS = {
  drop: { right: dropV, noHalf: Math.sqrt(G * CLIFF.h), noRoot: 2 * G * CLIFF.h, gh: G * CLIFF.h },
  flight: { total, ep0: potentialChange(CLIFF.m, CLIFF.h), ek0: kineticEnergy(CLIFF.m, CLIFF.u) },
  /** The puzzle: the same speed at the sea for every throw. */
  puzzle: { right: land, added: CLIFF.u + dropV, noStart: dropV },
  slide: { right: heat, ek: slideEk, ep: slideEp, sum: slideEp + slideEk, still: speedAfterDrop(0, SLIDE.h) },
  friction: { right: friction, ep: forceFromWork(slideEp, SLIDE.L), ek: forceFromWork(slideEk, SLIDE.L), height: forceFromWork(heat, SLIDE.h) },
  longer: {
    short: slideSpeed(SLIDE.m, SLIDE.h, LONGER.min, friction),
    long: slideSpeed(SLIDE.m, SLIDE.h, LONGER.max, friction),
    heatLong: workDone(friction, LONGER.max),
    ekLong: slideEp - workDone(friction, LONGER.max),
  },
  coaster: { right: speedAfterDrop(0, COASTER.drop - COASTER.hill), first: speedAfterDrop(0, COASTER.drop), second: speedAfterDrop(0, COASTER.hill), noHalf: Math.sqrt(G * (COASTER.drop - COASTER.hill)) },
  skater: { right: heightForSpeed(SKATER.v), noHalf: (SKATER.v * SKATER.v) / G, vOverG: SKATER.v / G },
  cyclist: { right: energyToFriction(CYCLIST.m, CYCLIST.drop, CYCLIST.u, CYCLIST.v), noStart: cycEp - kineticEnergy(CYCLIST.m, CYCLIST.v), dEk: cycEk, ep: cycEp },
  ball: { right: forceFromWork(ballEk - ballEp, BALL.rise), ek: forceFromWork(ballEk, BALL.rise), weight: forceFromWork(ballEp, BALL.rise), added: forceFromWork(ballEk + ballEp, BALL.rise), ek0: ballEk, ep: ballEp },
};
const X = ANSWERS;

const cliff = (over: Partial<CliffFig>): CliffFig => ({ kind: 'cliff', ...CLIFF, stones: STONES, ...over });
const slide = (over: Partial<SlideFig>): SlideFig => ({ kind: 'slide', m: SLIDE.m, h: SLIDE.h, L: SLIDE.L, F: friction, ...over });

export const whereTheEnergyGoes: Lesson = {
  id: 'conservation',
  title: 'Where the energy goes',
  spec: [20],
  minutes: 11,
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Where the energy goes',
      body: `From a ${CLIFF.h}${NB}m sea cliff, three stones are thrown at ${CLIFF.u}${NB}m s⁻¹: A at 45° up, B level, C at 45° down.`,
      fig: cliff({ play: true }),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: 'Ignore air resistance. Which stone hits the sea fastest?',
      fig: cliff({ play: true }),
      options: [
        { id: 'A', label: 'A: it goes up first, so it falls from higher' },
        { id: 'C', label: 'C: it is thrown straight at the sea' },
        { id: 'same', label: 'All three at the same speed' },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'conserve',
      kind: 'text',
      body: [
        '**The principle of conservation of energy**: energy cannot be created or destroyed. It is only transferred from one store to another, so the total stays the same.',
        'With no air resistance, a falling stone moves energy from its gravitational store to its kinetic store: the GPE it loses is the Ek it gains.',
      ],
      card: { term: 'Conservation of energy', text: 'The total energy stays the same. With no friction or air, the GPE lost, mgΔh, equals the Ek gained.' },
    },
    {
      id: 'drop',
      kind: 'choice',
      prompt: `A stone is simply dropped from the top of the ${CLIFF.h}${NB}m cliff. How fast is it moving when it hits the sea?`,
      fig: cliff({ u: 0, stones: [{ id: '', angle: -90 }], landing: 'afterCheck' }),
      options: [
        { id: 'noHalf', label: MS(X.drop.noHalf), hint: 'mgΔh = ½mv²: keep the ½, so v = √(2gΔh).' },
        { id: 'right', label: MS(X.drop.right), correct: true },
        { id: 'noRoot', label: MS(X.drop.noRoot), hint: 'That is v². Take the square root.' },
        { id: 'gh', label: MS(X.drop.gh), hint: 'That is gΔh. Set mgΔh = ½mv² and solve for v.' },
      ],
      why: `mgΔh = ½mv², and the mass cancels: v = √(2gΔh) = √(2 × ${G} × ${CLIFF.h}) = ${MS(X.drop.right)}.`,
    },
    {
      id: 'flight',
      kind: 'explore',
      instruction: 'Drag the slider to move stone A along its path. The column stacks its kinetic energy on its GPE.',
      fig: cliff({ follow: 'A' }),
      slider: { min: 0, max: 3.05, step: 0.05, tick: 0.5, label: 'Time since the throw', unit: 's', symbol: 't', dp: 2, start: 0 },
      question: {
        prompt: 'What happens to the total, Ek + Ep, while stone A flies?',
        options: [
          { id: 'top', label: 'It is biggest at the top, where A is highest', hint: 'Look at the column at the top: Ep has grown, and Ek has shrunk just as much.' },
          { id: 'right', label: `It stays at ${J(X.flight.total)}`, correct: true },
          { id: 'slows', label: 'It drops while A slows down, then grows again', hint: 'Ek shrinks as A rises, but Ep grows by the same amount.' },
        ],
        right: 'Right: what Ek loses on the way up, Ep gains, and back again. Ek is smallest at the top, but not zero: A still moves sideways.',
      },
    },
    {
      id: 'start-speed',
      kind: 'text',
      body: [
        'A thrown stone starts with kinetic energy as well as GPE. At the sea, all of it is kinetic: **½mv² = ½mu² + mgΔh**.',
        'Divide by ½m and the mass is gone: v² = u² + 2gΔh. It looks like the suvat equation v² = u² + 2as.',
      ],
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Back to the cliff. How fast does each stone hit the sea?`,
      fig: cliff({ landing: 'afterCheck' }),
      options: [
        { id: 'added', label: `All three at ${MS(X.puzzle.added)}`, hint: `Energies add, not speeds: ½mv² = ½mu² + mgΔh.` },
        { id: 'direction', label: 'C fastest, A slowest', hint: 'Ek = ½mv² has no direction: all three start with the same energy.' },
        { id: 'right', label: `All three at ${MS(X.puzzle.right)}`, correct: true },
        { id: 'noStart', label: `All three at ${MS(X.puzzle.noStart)}`, hint: 'That is a stone dropped from rest. These start with ½mu² too.' },
      ],
      why: `Each starts with ½mu² + mgΔh and ends at sea level: v² = ${CLIFF.u}² + 2 × ${G} × ${CLIFF.h}, so v = ${MS(X.puzzle.right)}, whichever way it was thrown.`,
    },
    {
      id: 'losses',
      kind: 'text',
      body: [
        'In real life, friction and air resistance do work against the motion. That energy is not destroyed: it **heats** the body and its surroundings.',
        'So the GPE lost = the Ek gained + the work done against friction, F × Δs, where Δs is the distance moved against it.',
      ],
      card: { term: 'Work against friction', text: 'Work done = FΔs. It is the energy that heats things: the energy "missing" from the kinetic store.' },
    },
    {
      id: 'slide',
      kind: 'choice',
      prompt: `Ella, ${SLIDE.m}${NB}kg, slides from rest down a slide ${fixed(SLIDE.h, 1)}${NB}m high and reaches the foot at ${fixed(SLIDE.v, 1)}${NB}m s⁻¹. How much energy did friction transfer?`,
      fig: slide({ play: true, heat: 'afterCheck' }),
      options: [
        { id: 'ek', label: J(X.slide.ek), hint: 'That is her Ek at the foot. Friction took the rest of the GPE.' },
        { id: 'right', label: J(X.slide.right), correct: true },
        { id: 'ep', label: J(X.slide.ep), hint: 'That is all the GPE she lost, and some of it became Ek.' },
        { id: 'sum', label: J(X.slide.sum), hint: 'The GPE is shared out, not added to: GPE lost = Ek + work against friction.' },
      ],
      why: `GPE lost = ${SLIDE.m} × ${G} × ${fixed(SLIDE.h, 1)} = ${J(slideEp)}, Ek = ½ × ${SLIDE.m} × ${fixed(SLIDE.v, 1)}² = ${J(slideEk)}. Friction took ${J(X.slide.right)}; without it: ${MS(X.slide.still)}.`,
    },
    {
      id: 'friction',
      kind: 'choice',
      prompt: `The slide is ${fixed(SLIDE.L, 1)}${NB}m long. What is the average friction force on Ella?`,
      fig: slide({ heat: 'shown', friction: 'afterCheck' }),
      options: [
        { id: 'ep', label: N(X.friction.ep), hint: `That spreads all the GPE over the slide. Friction took only ${J(heat)}.` },
        { id: 'ek', label: N(X.friction.ek), hint: `Use the energy friction took, ${J(heat)}, not the Ek.` },
        { id: 'right', label: N(X.friction.right), correct: true },
        { id: 'height', label: N(X.friction.height), hint: `Friction acts along the slide: divide by the ${fixed(SLIDE.L, 1)}${NB}m she slides, not the height.` },
      ],
      why: `Work against friction = F × Δs, so F = ${sig(heat)} ÷ ${fixed(SLIDE.L, 1)} = ${N(X.friction.right)}.`,
    },
    {
      id: 'longer',
      kind: 'explore',
      instruction: "Drag the slider to change the slide's length. Its height and the friction force stay the same.",
      fig: slide({ heat: 'shown', friction: 'shown' }),
      slider: { min: LONGER.min, max: LONGER.max, step: 0.1, tick: 1, label: 'Length of the slide', unit: 'm', symbol: 'L', dp: 1, start: SLIDE.L },
      question: {
        prompt: 'On a longer, gentler slide of the same height, how fast does Ella reach the foot?',
        options: [
          { id: 'faster', label: 'Faster: a gentle slope is easier', hint: 'Watch the bottom bar: the heating part grows as the slide gets longer.' },
          { id: 'same', label: 'The same: only the height counts, like the stones', hint: 'Only with no friction. Friction does work over every metre of the slide.' },
          { id: 'right', label: 'Slower', correct: true },
        ],
        right: `Right: at ${fixed(LONGER.max, 1)}${NB}m friction takes ${J(X.longer.heatLong)}, leaving ${J(X.longer.ekLong)}: only ${MS(X.longer.long)}. With friction, the path matters.`,
      },
    },
    {
      id: 'rules',
      kind: 'text',
      body: [
        'Energy is conserved. With no friction or air, **GPE lost = Ek gained**: the speed depends on the drop, not on the path or the direction.',
        'With friction, **GPE lost = Ek gained + FΔs**, and a longer path loses more. Next: how fast energy is transferred.',
      ],
    },
  ],
  skillCheck: [
    {
      id: 'coaster',
      kind: 'choice',
      prompt: `A coaster car starts from rest at the top of a ${COASTER.drop}${NB}m drop, then climbs over a ${COASTER.hill}${NB}m hill. With no friction, how fast is it at the top?`,
      options: [
        { id: 'first', label: MS(X.coaster.first) },
        { id: 'right', label: MS(X.coaster.right), correct: true },
        { id: 'second', label: MS(X.coaster.second) },
        { id: 'noHalf', label: MS(X.coaster.noHalf) },
      ],
      why: `The car is ${COASTER.drop} − ${COASTER.hill} = ${COASTER.drop - COASTER.hill}${NB}m below its start: v = √(2 × ${G} × ${COASTER.drop - COASTER.hill}) = ${MS(X.coaster.right)}, whatever the track's shape.`,
    },
    {
      id: 'skater',
      kind: 'choice',
      prompt: `A skateboarder rolls onto a ramp at ${MS(SKATER.v)}. Ignoring friction, how high up the ramp can she rise?`,
      options: [
        { id: 'noHalf', label: M(X.skater.noHalf) },
        { id: 'vOverG', label: M(X.skater.vOverG) },
        { id: 'right', label: M(X.skater.right), correct: true },
        { id: 'mass', label: 'It depends on her mass' },
      ],
      why: `½mv² = mgh, and m cancels: h = v² ÷ 2g = ${fixed(SKATER.v, 1)}² ÷ (2 × ${G}) = ${M(X.skater.right)}, for any mass.`,
    },
    {
      id: 'cyclist',
      kind: 'choice',
      prompt: `A cyclist (${CYCLIST.m}${NB}kg with the bike) freewheels ${CYCLIST.drop}${NB}m down a hill, from ${fixed(CYCLIST.u, 1)} to ${MS(CYCLIST.v)}. How much work is done against resistive forces?`,
      options: [
        { id: 'noStart', label: KJ(X.cyclist.noStart) },
        { id: 'right', label: KJ(X.cyclist.right), correct: true },
        { id: 'dEk', label: KJ(X.cyclist.dEk) },
        { id: 'ep', label: KJ(X.cyclist.ep) },
      ],
      why: `GPE lost ${KJ(cycEp)}. Ek gained ½ × ${CYCLIST.m} × (${CYCLIST.v}² − ${fixed(CYCLIST.u, 1)}²) = ${KJ(cycEk)}. Work against resistance = ${KJ(X.cyclist.right)}.`,
    },
    {
      id: 'ball',
      kind: 'choice',
      prompt: `A ${fixed(BALL.m, 2)}${NB}kg ball is thrown straight up at ${MS(BALL.u)} and rises only ${fixed(BALL.rise, 1)}${NB}m. What is the average air resistance on it?`,
      options: [
        { id: 'ek', label: N(X.ball.ek) },
        { id: 'right', label: N(X.ball.right), correct: true },
        { id: 'weight', label: N(X.ball.weight) },
        { id: 'added', label: N(X.ball.added) },
      ],
      why: `Ek at the start ${J(X.ball.ek0)}, GPE at the top ${J(X.ball.ep)}. Air took ${J(X.ball.ek0 - X.ball.ep)} over ${fixed(BALL.rise, 1)}${NB}m: F = ${N(X.ball.right)}.`,
    },
  ],
  youCanNow: [
    'State the principle of conservation of energy',
    'Use GPE lost = Ek gained to find a speed or a height',
    'Find the energy transferred by friction or air resistance',
    'Find an average resistive force from the energy it takes',
  ],
  recap: {
    fig: cliff({ landing: 'shown' }),
    text: `Thrown up, level or down at ${MS(CLIFF.u)}, every stone hits the sea at ${MS(X.puzzle.right)}: energy has no direction.`,
  },
  card: {
    formula: 'mgΔh = ΔEk + FΔs',
    idea: 'Energy is never lost: the GPE a body gives up becomes kinetic energy, or heats things through friction.',
  },
};
