// Lesson "Kinetic and potential energy" — Ek = ½mv² and ΔEp = mgΔh (WPH11 points 18 and 19).
// The puzzle: an electric car speeds up from 0 to 10 m s⁻¹, then from 10 to 20 m s⁻¹. The same gain in speed costs
// 60.0 kJ, then 180 kJ: the energy is a square of side v. Then: at 20 m s⁻¹ the car holds as much energy as a 20.4 m
// lift would give it, and so does a van twice as heavy.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
// Format v3 (V2 task D9): order, build, estimate, graphPick; the Skill check ends on an exam-style card.
import { heightForSpeed, kineticEnergy, potentialChange, speedFromKinetic } from '../physics/energy.ts';
import { G } from '../physics/kinematics.ts';
import { fixed, sig } from '../physics/format.ts';
import type { HeightFig, KineticFig, Lesson, PlotFig } from './types.ts';

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
export const SERVE = { m: 0.058, E: 70 };
export const PLOT = { vMax: CAR.v2, step: 1 }; // the Ek–v graphs: v from 0 to 20 m s⁻¹

const ek1 = kineticEnergy(CAR.m, CAR.v1);
const ek2 = kineticEnergy(CAR.m, CAR.v2);
const match = heightForSpeed(CAR.v2);
const parkEp = potentialChange(CAR.m, PARK.up);
const serveV = speedFromKinetic(SERVE.m, SERVE.E);
const serveH = SERVE.E / potentialChange(SERVE.m, 1);

/** Answers and named mistakes, used by the screens and re-checked by kinetic-and-potential-energy.test.ts. */
export const ANSWERS = {
  ke10: { right: ek1, halfMv: 0.5 * CAR.m * CAR.v1, momentum: CAR.m * CAR.v1, noHalf: CAR.m * CAR.v1 ** 2 },
  explore: { at10: ek1, at20: ek2 },
  /** The puzzle: the work done in each stage is the gain in kinetic energy. */
  puzzle: { first: ek1, second: ek2 - ek1, end: ek2, ratio: (ek2 - ek1) / ek1 },
  park: { right: parkEp, along: potentialChange(CAR.m, PARK.along), weight: potentialChange(CAR.m, 1) },
  crane: { ek: ek2, height: match },
  van: { right: heightForSpeed(CAR.v2), heavier: match / 2, double: 2 * match, vOverG: CAR.v2 / G },
  machine: potentialChange(MACHINE.m, MACHINE.h),
  cricket: { right: kineticEnergy(CRICKET.m, CRICKET.v), momentum: CRICKET.m * CRICKET.v },
  /** The Skill check's choice: a van twice as heavy at half the speed has half the car's energy. */
  vanHalf: { ratio: kineticEnergy(2 * CAR.m, CAR.v2 / 2) / kineticEnergy(CAR.m, CAR.v2) },
  serve: { speed: serveV, height: serveH, grams: SERVE.m * 1000 },
};
const X = ANSWERS;

const car = (over: Partial<KineticFig>): KineticFig => ({ kind: 'kinetic', m: CAR.m, v: CAR.v2, ...over });
const crane: HeightFig = { kind: 'height', m: CAR.m, h: 5, match: CAR.v2 };

/** One Ek–v curve for "which graph?": the model (½mv²) or a named mistake. All three end at the same point. */
const ekGraph = (shape: 'square' | 'line' | 'root'): PlotFig => ({
  kind: 'plot',
  header: `car ${CAR.m} kg, Ek against speed`,
  x: { label: 'v / m s⁻¹', max: PLOT.vMax, tick: 5 },
  y: { label: 'Ek / kJ', max: 250, tick: 50 },
  points: Array.from({ length: PLOT.vMax / PLOT.step + 1 }, (_, k) => {
    const v = k * PLOT.step;
    const share = v / PLOT.vMax;
    const y = shape === 'square' ? kineticEnergy(CAR.m, v) : shape === 'line' ? ek2 * share : ek2 * Math.sqrt(share);
    return { x: v, y: y / 1000 };
  }),
});

const G9 = `9.81${NB}N${NB}kg⁻¹`;

export const kineticAndPotentialEnergy: Lesson = {
  id: 'ke-gpe',
  title: 'Kinetic and potential energy',
  spec: [18, 19],
  minutes: 11,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'Kinetic energy', from: 'kinetic' },
    { title: 'Back to the car', from: 'hook-again' },
  ],
  cast: ['Arjun'],
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
      kind: 'order',
      prompt: 'Why is it ½mv²? Put the steps in order: a steady resultant force F pushes a body of mass m from rest up to speed v.',
      steps: [
        { id: 'work', text: 'The work done is W = FΔs.' },
        { id: 'newton', text: 'By Newton’s second law, F = ma.' },
        { id: 'suvat', text: 'From rest, v² = 2aΔs, so Δs = v² ÷ 2a.' },
        { id: 'sub', text: 'So W = ma × v² ÷ 2a = ½mv².' },
      ],
      hint: 'Start with work, bring in F = ma, then the speed: v² = 2aΔs.',
      why: 'W = FΔs, F = ma and Δs = v² ÷ 2a give W = ma × v² ÷ 2a = ½mv². With the same force, twice the speed takes four times the distance: four times the work.',
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
      id: 'ek-graph',
      kind: 'graphPick',
      prompt: `Which graph shows the car's kinetic energy against its speed, from 0 to ${V(CAR.v2)}?`,
      graphs: [
        { id: 'A', fig: ekGraph('line'), hint: 'A straight line: twice the speed, twice the energy. But Ek = ½mv² gives four times.' },
        { id: 'B', fig: ekGraph('root'), hint: 'This curve flattens: each extra m s⁻¹ would add less energy. At speed it adds more.' },
        { id: 'C', fig: ekGraph('square'), correct: true },
      ],
      why: `Ek = ½mv² is a parabola: it starts flat and gets steeper. At ${V(CAR.v1)} it is ${KJ(ek1)}, at ${V(CAR.v2)} four times that, ${KJ(ek2)}.`,
    },
    {
      id: 'ratio',
      kind: 'estimate',
      prompt: `The motor does ${KJ(ek1)} of work getting the car from rest to ${V(CAR.v1)}. Drag to how many times as much work it does from ${CAR.v1} to ${V(CAR.v2)}.`,
      fig: car({ v: CAR.v1 }),
      after: car({ stages: [CAR.v1, CAR.v2], square: 'shown' }),
      scale: { min: 1, max: 7, step: 0.5, tick: 1, unit: 'times', symbol: 'n', dp: 1, label: 'Stage 2 work ÷ stage 1 work' },
      answer: X.puzzle.ratio,
      tolerance: 0.5,
      why: `Ek at ${V(CAR.v2)} is four times Ek at ${V(CAR.v1)}. The car already had one share, so the second stage adds 4 − 1 = 3 shares: ${KJ(X.puzzle.second)}.`,
    },
    {
      id: 'hook-again',
      kind: 'build',
      prompt: `Back to the car. Build the work the motor does from ${CAR.v1} to ${V(CAR.v2)}.`,
      fig: car({ stages: [CAR.v1, CAR.v2], square: 'afterCheck' }),
      equation: 'W = ½ × {m} × ({v}² − {u}²)',
      boxes: { m: 'mass', v: 'fast', u: 'slow' },
      chips: [
        { id: 'mass', label: `${CAR.m}${NB}kg` },
        { id: 'fast', label: V(CAR.v2) },
        { id: 'slow', label: V(CAR.v1) },
        { id: 'first', label: KJ(X.puzzle.first), hint: `That is the first stage, 0 to ${V(CAR.v1)}.` },
        { id: 'g', label: G9, hint: 'g belongs to potential energy. A change in speed needs no g.' },
      ],
      result: { symbol: 'W', value: X.puzzle.second / 1000, unit: 'kJ' },
      why: `Work done = gain in Ek = ½ × ${CAR.m} × (${CAR.v2}² − ${CAR.v1}²) = ${KJ(X.puzzle.second)}: three times the ${KJ(ek1)} of the first stage, for the same ${V(CAR.v1)}.`,
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
      kind: 'build',
      prompt: `The car drives up a car park to a floor ${fixed(PARK.up, 1)}${NB}m higher, along ${PARK.along}${NB}m of ramps. Build its gain in GPE.`,
      equation: 'ΔEp = {m} × {g} × {Δh}',
      boxes: { m: 'mass', g: 'field', 'Δh': 'rise' },
      chips: [
        { id: 'mass', label: `${CAR.m}${NB}kg` },
        { id: 'field', label: G9 },
        { id: 'rise', label: `${fixed(PARK.up, 1)}${NB}m` },
        { id: 'ramps', label: `${PARK.along}${NB}m`, hint: `Gravity acts straight down: use the ${fixed(PARK.up, 1)}${NB}m rise, not the ramps.` },
        { id: 'weight', label: `${sig(X.park.weight / 1000)}${NB}kN`, hint: 'That is the weight, mg. The equation multiplies the mass by g itself.' },
      ],
      result: { symbol: 'ΔEp', value: X.park.right / 1000, unit: 'kJ' },
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
      body: ['Ek = ½mv²: twice the speed, four times the energy. ΔEp = mgΔh: only the height counts.'],
      fig: car({ stages: [CAR.v1, CAR.v2], square: 'shown' }),
    },
  ],
  skillCheck: [
    {
      id: 'cricket',
      kind: 'build',
      prompt: `Arjun bowls a ${CRICKET.m}${NB}kg cricket ball at ${MS(CRICKET.v)}. Build its kinetic energy.`,
      equation: 'Ek = ½ × {m} × {v}²',
      boxes: { m: 'mass', v: 'speed' },
      chips: [
        { id: 'mass', label: `${fixed(CRICKET.m, 2)}${NB}kg` },
        { id: 'speed', label: MS(CRICKET.v) },
        { id: 'p', label: `${sig(X.cricket.momentum)}${NB}kg${NB}m${NB}s⁻¹`, hint: 'That is mv, the momentum. Kinetic energy is built from m and v² separately.' },
        { id: 'g', label: G9, hint: 'g belongs to potential energy. The ball’s speed is all you need here.' },
      ],
      result: { symbol: 'Ek', value: X.cricket.right, unit: 'J' },
      why: `Ek = ½ × ${fixed(CRICKET.m, 2)} × ${CRICKET.v}² = ${J(X.cricket.right)}. (${sig(X.cricket.momentum)} is mv, the momentum, in kg m s⁻¹.)`,
    },
    {
      id: 'braking',
      kind: 'order',
      prompt: 'Why does a car going twice as fast need four times the braking distance? Put the steps in order.',
      steps: [
        { id: 'work', text: 'The brakes push back with a steady force F, doing work F × d on the car.' },
        { id: 'ek', text: 'That work must remove all the car’s kinetic energy, ½mv².' },
        { id: 'four', text: 'At twice the speed the car has four times the kinetic energy.' },
        { id: 'dist', text: 'The same force F needs four times the distance d to do four times the work.' },
      ],
      hint: 'What the brakes do, what they must remove, what doubling v does to it.',
      why: 'F × d = ½mv². Double v and the right side is four times as big, so for the same F the distance d is four times as big.',
    },
    {
      id: 'half-speed',
      kind: 'choice',
      prompt: `A van with twice the car’s mass drives at half the car’s speed. How does the van’s kinetic energy compare with the car’s?`,
      options: [
        { id: 'same', label: 'The same: twice the mass cancels half the speed' },
        { id: 'right', label: 'Half as much as the car’s', correct: true },
        { id: 'quarter', label: 'A quarter of the car’s' },
        { id: 'double', label: 'Twice the car’s: it is twice as heavy' },
      ],
      why: `Van: ½ × 2m × (v ÷ 2)² = ¼mv². Car: ½mv². The ratio is ${fixed(X.vanHalf.ratio, 1)}: the mass counts once, the speed twice.`,
    },
    {
      id: 'serve',
      kind: 'examCard',
      context: `A ${fixed(SERVE.m, 3)}${NB}kg tennis ball leaves a racket with ${SERVE.E}${NB}J of kinetic energy. Ignore air resistance. Take g = 9.81 N kg⁻¹.`,
      parts: [
        {
          id: 'a',
          command: 'Calculate',
          text: 'the speed of the ball as it leaves the racket.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'v = √(2 × {E} ÷ {m})',
            boxes: { E: 'energy', m: 'mass' },
            chips: [
              { id: 'energy', label: `${SERVE.E}${NB}J` },
              { id: 'mass', label: `${fixed(SERVE.m, 3)}${NB}kg` },
              { id: 'grams', label: `${X.serve.grams}${NB}kg`, hint: 'The mass is 58 g: that is 0.058 kg.' },
              { id: 'g', label: G9, hint: 'g is not needed for a speed.' },
            ],
            result: { symbol: 'v', value: X.serve.speed, unit: 'm s⁻¹' },
          },
          why: `Ek = ½mv², so v = √(2Ek ÷ m) = √(2 × ${SERVE.E} ÷ ${fixed(SERVE.m, 3)}) = ${MS(X.serve.speed)}. One mark for the rearranged equation, one for the answer.`,
        },
        {
          id: 'b',
          command: 'Calculate',
          text: 'the height the ball would reach if all of that energy became GPE.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'h = {E} ÷ ({m} × {g})',
            boxes: { E: 'energy', m: 'mass', g: 'field' },
            chips: [
              { id: 'energy', label: `${SERVE.E}${NB}J` },
              { id: 'mass', label: `${fixed(SERVE.m, 3)}${NB}kg` },
              { id: 'field', label: G9 },
              { id: 'speed', label: MS(X.serve.speed), hint: 'That is the ball’s speed. The height comes from its energy.' },
            ],
            result: { symbol: 'h', value: X.serve.height, unit: 'm' },
          },
          why: `ΔEp = mgh = Ek, so h = ${SERVE.E} ÷ (${fixed(SERVE.m, 3)} × ${G}) = ${M(X.serve.height)}. Air resistance would take much of that, but the energy argument gives the limit.`,
        },
      ],
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
