// Lesson "Where the energy goes" — conservation of energy, with work done, GPE and kinetic energy (WPH11 point 20).
// The puzzle: three stones thrown at 12 m s⁻¹ from a 20 m cliff, up at 45°, level and down at 45°. All three hit the
// sea at 23.2 m s⁻¹: each starts with the same ½mu² + mgh, and energy has no direction. Then friction: a child on a
// slide arrives at 4.0 m s⁻¹, not 7.00; friction took 413 J (82.6 N over 5.0 m), and a longer slide is slower.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
// Format v3 (V2 task D9): build, sort, estimate, spotError; the Skill check ends on an exam-style card.
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
const G9 = `9.81${NB}N${NB}kg⁻¹`;

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
export const CYCLIST = { m: 80, drop: 12, road: 300, u: 4.0, v: 13 }; // kg, m, m, m s⁻¹, m s⁻¹

const land = speedAfterDrop(CLIFF.u, CLIFF.h);
const dropV = speedAfterDrop(0, CLIFF.h);
const stoneEp = potentialChange(CLIFF.m, CLIFF.h);
const stoneEk = kineticEnergy(CLIFF.m, CLIFF.u);
const total = stoneEp + stoneEk;
const slideEp = potentialChange(SLIDE.m, SLIDE.h);
const slideEk = kineticEnergy(SLIDE.m, SLIDE.v);
const heat = energyToFriction(SLIDE.m, SLIDE.h, 0, SLIDE.v);
const friction = forceFromWork(heat, SLIDE.L);
const cycEp = potentialChange(CYCLIST.m, CYCLIST.drop);
const cycHeat = energyToFriction(CYCLIST.m, CYCLIST.drop, CYCLIST.u, CYCLIST.v);

/** Answers and named mistakes, used by the screens and re-checked by where-the-energy-goes.test.ts. */
export const ANSWERS = {
  drop: { right: dropV, noHalf: Math.sqrt(G * CLIFF.h), noRoot: 2 * G * CLIFF.h, gh: G * CLIFF.h },
  flight: { total, ep0: stoneEp, ek0: stoneEk },
  /** The puzzle: the same speed at the sea for every throw. */
  puzzle: { right: land, noStart: dropV },
  /** The spotError's slip: the starting Ek left out, so a thrown stone looks like a dropped one. */
  forgot: { ep: stoneEp, ek0: stoneEk, wrongSpeed: Math.sqrt((2 * stoneEp) / CLIFF.m) },
  slide: { right: heat, ek: slideEk, ep: slideEp, friction, still: speedAfterDrop(0, SLIDE.h), L: SLIDE.L },
  longer: {
    short: slideSpeed(SLIDE.m, SLIDE.h, LONGER.min, friction),
    long: slideSpeed(SLIDE.m, SLIDE.h, LONGER.max, friction),
    heatLong: workDone(friction, LONGER.max),
    ekLong: slideEp - workDone(friction, LONGER.max),
  },
  coaster: { right: speedAfterDrop(0, COASTER.drop - COASTER.hill), below: COASTER.drop - COASTER.hill },
  skater: { right: heightForSpeed(SKATER.v), noHalf: (SKATER.v * SKATER.v) / G },
  cyclist: { heat: cycHeat, ep: cycEp, force: forceFromWork(cycHeat, CYCLIST.road), wholeGpe: forceFromWork(cycEp, CYCLIST.road), overHeight: forceFromWork(cycHeat, CYCLIST.drop) },
};
const X = ANSWERS;

const cliff = (over: Partial<CliffFig>): CliffFig => ({ kind: 'cliff', ...CLIFF, stones: STONES, ...over });
const slide = (over: Partial<SlideFig>): SlideFig => ({ kind: 'slide', m: SLIDE.m, h: SLIDE.h, L: SLIDE.L, F: friction, ...over });

export const whereTheEnergyGoes: Lesson = {
  id: 'conservation',
  title: 'Where the energy goes',
  spec: [20],
  minutes: 11,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'Energy in a fall', from: 'conserve' },
    { title: 'Back to the cliff', from: 'hook-again' },
  ],
  cast: ['Ella', 'Chen', 'Marco', 'Petra'],
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
        { id: 'same', label: 'All three at the same speed', correct: true },
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
      id: 'sea-speed',
      kind: 'estimate',
      prompt: `Stone B is thrown level at ${CLIFF.u}${NB}m s⁻¹ from the ${CLIFF.h}${NB}m cliff. Drag to how fast it hits the sea.`,
      fig: cliff({ stones: [{ id: 'B', angle: 0 }] }),
      after: cliff({ stones: [{ id: 'B', angle: 0 }], play: true, landing: 'shown' }),
      scale: { min: 0, max: 40, step: 1, tick: 10, unit: 'm s⁻¹', symbol: 'v', dp: 0, label: 'Speed at the sea' },
      answer: X.puzzle.right,
      tolerance: 2,
      why: `Its energy at the sea is ½mu² + mgΔh. So v² = ${CLIFF.u}² + 2 × ${G} × ${CLIFF.h}, and v = ${MS(X.puzzle.right)}.`,
    },
    {
      id: 'hook-again',
      kind: 'build',
      prompt: 'Back to the cliff. Build the speed at which a stone hits the sea, whichever way it was thrown.',
      fig: cliff({ landing: 'afterCheck' }),
      equation: 'v = √({u}² + 2 × {g} × {h})',
      boxes: { u: 'start', g: 'field', h: 'drop' },
      chips: [
        { id: 'start', label: MS(CLIFF.u) },
        { id: 'field', label: G9 },
        { id: 'drop', label: `${CLIFF.h}${NB}m` },
        { id: 'angle', label: '45°', hint: 'There is no angle in the equation: energy has no direction.' },
        { id: 'mass', label: `${fixed(CLIFF.m, 2)}${NB}kg`, hint: 'The mass cancels from both sides, so it is not in the equation.' },
      ],
      result: { symbol: 'v', value: X.puzzle.right, unit: 'm s⁻¹' },
      why: `½mv² = ½mu² + mgΔh, so v² = ${CLIFF.u}² + 2 × ${G} × ${CLIFF.h} and v = ${MS(X.puzzle.right)} for A, B and C. A stone simply dropped would reach only ${MS(X.puzzle.noStart)}.`,
    },
    {
      id: 'forgot',
      kind: 'spotError',
      prompt: 'Chen works out how fast stone A hits the sea. One line is wrong. Which?',
      fig: cliff({ stones: [{ id: 'A', angle: 45 }], landing: 'afterCheck' }),
      lines: [
        { id: 'gpe', text: `GPE lost = mgΔh = ${fixed(CLIFF.m, 2)} × ${G} × ${CLIFF.h} = ${J(X.forgot.ep)}`, hint: 'That line is right: the stone drops 20 m.' },
        { id: 'all', text: `All of it becomes kinetic energy: ½mv² = ${J(X.forgot.ep)}`, wrong: true, fix: `It starts with ½mu² = ${J(X.forgot.ek0)} too: ½mv² = ${sig(X.forgot.ep)} + ${sig(X.forgot.ek0)} = ${J(total)}` },
        { id: 'v', text: `v = √(2 × ${sig(X.forgot.ep)} ÷ ${fixed(CLIFF.m, 2)}) = ${MS(X.forgot.wrongSpeed)}`, hint: 'This follows from the line above. Check what went into it.' },
        { id: 'same', text: 'So A hits the sea no faster than a stone simply dropped', hint: 'This is what the lines above say. But does A start from rest?' },
      ],
      why: `A starts with kinetic energy: ½mu² = ${J(X.forgot.ek0)}. The total at the sea is ${J(total)}, so v = ${MS(X.puzzle.right)}. ${MS(X.forgot.wrongSpeed)} is the speed of a stone dropped from rest.`,
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
      id: 'stores',
      kind: 'sort',
      prompt: 'Ella slides down a playground slide. Which store does each of these belong to?',
      bins: [
        { id: 'ke', label: 'Kinetic' },
        { id: 'gpe', label: 'Potential' },
        { id: 'heat', label: 'Thermal' },
      ],
      items: [
        { id: 'fall', label: 'The store that shrinks as she drops', bin: 'gpe', hint: 'She loses height, so her gravitational store shrinks.' },
        { id: 'speed', label: 'The store that grows as she speeds up', bin: 'ke', hint: 'Speed is kinetic energy: ½mv².' },
        { id: 'warm', label: 'The store that grows as the slide warms up', bin: 'heat', hint: 'Friction heats things: thermal energy.' },
        { id: 'half', label: '½mv²', bin: 'ke', hint: 'That is the kinetic energy formula.' },
        { id: 'mgh', label: 'mgΔh', bin: 'gpe', hint: 'That is the change in gravitational potential energy.' },
        { id: 'fs', label: 'Work done against friction, FΔs', bin: 'heat', hint: 'Work against friction ends up as thermal energy.' },
      ],
      why: 'Going down, the gravitational store shrinks. It is shared out between the kinetic store (her speed) and the thermal store (friction).',
    },
    {
      id: 'slide',
      kind: 'build',
      prompt: `Ella, ${SLIDE.m}${NB}kg, slides from rest down a slide ${fixed(SLIDE.h, 1)}${NB}m high and reaches the foot at ${fixed(SLIDE.v, 1)}${NB}m s⁻¹. Build the energy that friction transferred.`,
      fig: slide({ play: true, heat: 'afterCheck' }),
      equation: 'E = {m} × ({g} × {h} − ½ × {v}²)',
      boxes: { m: 'mass', g: 'field', h: 'height', v: 'speed' },
      chips: [
        { id: 'mass', label: `${SLIDE.m}${NB}kg` },
        { id: 'field', label: G9 },
        { id: 'height', label: `${fixed(SLIDE.h, 1)}${NB}m` },
        { id: 'speed', label: `${fixed(SLIDE.v, 1)}${NB}m s⁻¹` },
        { id: 'length', label: `${fixed(SLIDE.L, 1)}${NB}m`, hint: `GPE uses the height she falls, ${fixed(SLIDE.h, 1)}${NB}m, not the length of the slide.` },
        { id: 'still', label: `${fixed(X.slide.still, 2)}${NB}m s⁻¹`, hint: 'That is her speed with no friction. Use the speed she really reached.' },
      ],
      result: { symbol: 'E', value: X.slide.right, unit: 'J' },
      why: `GPE lost = ${SLIDE.m} × ${G} × ${fixed(SLIDE.h, 1)} = ${J(slideEp)}, Ek = ½ × ${SLIDE.m} × ${fixed(SLIDE.v, 1)}² = ${J(slideEk)}. Friction took ${J(X.slide.right)}: over the ${fixed(SLIDE.L, 1)}${NB}m of slide, ${N(X.slide.friction)}.`,
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
      body: ['GPE lost = Ek gained + FΔs: with no friction, only the drop matters.'],
      fig: cliff({ landing: 'shown' }),
    },
  ],
  skillCheck: [
    {
      id: 'coaster',
      kind: 'build',
      prompt: `A coaster car starts from rest at the top of a ${COASTER.drop}${NB}m drop, then climbs over a ${COASTER.hill}${NB}m hill. With no friction, build its speed at the top of the hill.`,
      equation: 'v = √(2 × {g} × {h})',
      boxes: { g: 'field', h: 'below' },
      chips: [
        { id: 'field', label: G9 },
        { id: 'below', label: `${X.coaster.below}${NB}m` },
        { id: 'whole', label: `${COASTER.drop}${NB}m`, hint: `That is the whole drop. The hill takes back ${COASTER.hill}${NB}m of height.` },
        { id: 'hill', label: `${COASTER.hill}${NB}m`, hint: 'That is the height of the hill. Use how far the car is below its start.' },
      ],
      result: { symbol: 'v', value: X.coaster.right, unit: 'm s⁻¹' },
      why: `At the top of the hill the car is ${COASTER.drop} − ${COASTER.hill} = ${X.coaster.below}${NB}m below its start: v = √(2 × ${G} × ${X.coaster.below}) = ${MS(X.coaster.right)}, whatever the track's shape.`,
    },
    {
      id: 'skater',
      kind: 'spotError',
      prompt: `Marco works out how high a skateboarder rises on a ramp when she rolls onto it at ${fixed(SKATER.v, 1)}${NB}m s⁻¹. One line is wrong. Which?`,
      lines: [
        { id: 'balance', text: 'At the top she stops: all her Ek has become GPE, mgh = ½mv²', hint: 'That line is right: the energy changes store.' },
        { id: 'cancel', text: 'The mass cancels from both sides: gh = v²', wrong: true, fix: 'The mass cancels from both sides: gh = ½v²' },
        { id: 'h', text: `h = v² ÷ g = ${fixed(SKATER.v, 1)}² ÷ ${G} = ${M(X.skater.noHalf)}`, hint: 'This follows from the line above. Check what went into it.' },
        { id: 'mass', text: 'Her mass does not matter', hint: 'That is true: m cancelled. The mistake is in how.' },
      ],
      why: `½mv² = mgh leaves ½v² = gh, so h = v² ÷ 2g = ${fixed(SKATER.v, 1)}² ÷ (2 × ${G}) = ${M(X.skater.right)}. Without the ½ the answer doubles to ${M(X.skater.noHalf)}.`,
    },
    {
      id: 'ramps',
      kind: 'choice',
      prompt: 'Identical trolleys start from rest at the top of a steep and a gentle frictionless ramp of equal height. How do they compare at the bottom?',
      options: [
        { id: 'steep', label: 'The steep one is faster: it falls more quickly' },
        { id: 'gentle', label: 'The gentle one is faster: the slope is longer' },
        { id: 'right', label: 'Both have the same speed', correct: true },
        { id: 'force', label: 'The steep one is faster: gravity pulls harder along it' },
      ],
      why: 'Both lose the same GPE, mgΔh, so both gain the same Ek: ½mv² = mgΔh. The steep trolley gets there sooner, but not faster. With friction the longer ramp would lose more.',
    },
    {
      id: 'freewheel',
      kind: 'examCard',
      context: `Petra and her bike, ${CYCLIST.m}${NB}kg together, freewheel down a ${CYCLIST.road}${NB}m road that drops ${CYCLIST.drop}${NB}m. She speeds up from ${fixed(CYCLIST.u, 1)} to ${MS(CYCLIST.v)}. Take g = 9.81 N kg⁻¹.`,
      parts: [
        {
          id: 'a',
          command: 'Calculate',
          text: 'the energy transferred to the surroundings.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'E = {m} × ({g} × {h} − ½ × ({v}² − {u}²))',
            boxes: { m: 'mass', g: 'field', h: 'drop', v: 'fast', u: 'slow' },
            chips: [
              { id: 'mass', label: `${CYCLIST.m}${NB}kg` },
              { id: 'field', label: G9 },
              { id: 'drop', label: `${CYCLIST.drop}${NB}m` },
              { id: 'fast', label: MS(CYCLIST.v) },
              { id: 'slow', label: `${fixed(CYCLIST.u, 1)}${NB}m s⁻¹` },
              { id: 'road', label: `${CYCLIST.road}${NB}m`, hint: 'GPE uses the vertical drop, not the length of the road.' },
            ],
            result: { symbol: 'E', value: X.cyclist.heat / 1000, unit: 'kJ' },
          },
          why: `GPE lost ${KJ(cycEp)}, Ek gained ½ × ${CYCLIST.m} × (${CYCLIST.v}² − ${fixed(CYCLIST.u, 1)}²) = ${KJ(cycEp - cycHeat)}. The rest, ${KJ(X.cyclist.heat)}, went to the surroundings. One mark for each energy.`,
        },
        {
          id: 'b',
          command: 'Calculate',
          text: 'the average resistive force along the road.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'F = {E} ÷ {s}',
            boxes: { E: 'energy', s: 'road' },
            chips: [
              { id: 'energy', label: KJ(X.cyclist.heat) },
              { id: 'road', label: `${CYCLIST.road}${NB}m` },
              { id: 'height', label: `${CYCLIST.drop}${NB}m`, hint: `The resistive force acts along the road: divide by ${CYCLIST.road}${NB}m, not the drop.` },
              { id: 'gpe', label: KJ(X.cyclist.ep), hint: 'That is all the GPE she lost. Some of it became kinetic energy.' },
            ],
            result: { symbol: 'F', value: X.cyclist.force, unit: 'N' },
          },
          why: `Work against resistance = F × Δs, so F = ${KJ(X.cyclist.heat)} ÷ ${CYCLIST.road}${NB}m = ${N(X.cyclist.force)}.`,
        },
      ],
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
