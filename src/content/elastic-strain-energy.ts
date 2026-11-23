// Lesson "Elastic strain energy" — the work done squashing or stretching is the area under the force–extension graph,
// ½FΔx = ½kΔx² on a straight line (WPH11 point 32). The puzzle: a 12 N push squashes a toy launcher's spring 3.0 cm.
// Squash it twice as far: how much energy does it store? Four times: the push doubles too, so the triangle under the
// graph is twice as wide and twice as tall. The ball leaves only twice as fast.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { elasticEnergy, energyForForce, launchSpeed, riseHeight, springEnergy } from '../physics/elastic.ts';
import { sig } from '../physics/format.ts';
import type { LauncherFig, Lesson } from './types.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const J = (E: number): string => `${sig(E, 2)}${NB}J`;
const MS = (v: number): string => `${sig(v)}${NB}m${NB}s⁻¹`;

export const LAUNCHER = { k: 400, x: 0.03, m: 0.02 }; // N m⁻¹, m, kg
export const DOUBLE = 0.06; // m, the squash in the puzzle
export const STIFFER = 800; // N m⁻¹, spring B
export const EXPLORE = { max: 6 }; // cm, the slider
// Skill check.
export const SPRING = { k: 50, x: 0.06 }; // N m⁻¹, m
export const WIRE = { F: 60, x: 2.2e-3 }; // N, m
export const BAND = { x1: 0.02, x2: 0.04, k: 50 }; // m, m, N m⁻¹

const F1 = LAUNCHER.k * LAUNCHER.x;
const F2 = LAUNCHER.k * DOUBLE;
const E1 = elasticEnergy(F1, LAUNCHER.x);
const E2 = elasticEnergy(F2, DOUBLE);

/** Answers and named mistakes, used by the screens and re-checked by elastic-strain-energy.test.ts. */
export const ANSWERS = {
  /** 3.0 cm: ½FΔx; the whole force; Δx in cm. */
  energy: { right: E1, noHalf: F1 * LAUNCHER.x, cm: elasticEnergy(F1, LAUNCHER.x * 100) },
  /** The puzzle at 6.0 cm. */
  stored: { right: E2, same: E1, doubled: 2 * E1, noHalf: F2 * DOUBLE, ratio: E2 / E1 },
  /** The ball's speed from 0.72 J: √(2E ÷ m); no ½; no root; grams. */
  speed: { right: launchSpeed(E2, LAUNCHER.m), noHalf: Math.sqrt(E2 / LAUNCHER.m), noRoot: (2 * E2) / LAUNCHER.m, grams: launchSpeed(E2, LAUNCHER.m * 1000), first: launchSpeed(E1, LAUNCHER.m) },
  /** The same 12 N on A and on B, twice as stiff. */
  softer: { A: energyForForce(F1, LAUNCHER.k), B: energyForForce(F1, STIFFER) },
  stretch: { right: springEnergy(SPRING.k, SPRING.x), noSquare: 0.5 * SPRING.k * SPRING.x, noHalf: SPRING.k * SPRING.x ** 2, cm: springEnergy(SPRING.k, SPRING.x * 100) },
  wire: { right: elasticEnergy(WIRE.F, WIRE.x), noHalf: WIRE.F * WIRE.x, mm: elasticEnergy(WIRE.F, WIRE.x * 1000), mmNoHalf: WIRE.F * WIRE.x * 1000 },
  height: { right: riseHeight(E1, LAUNCHER.m), noG: E1 / LAUNCHER.m, half: riseHeight(E1, LAUNCHER.m) / 2, grams: riseHeight(E1, LAUNCHER.m * 1000) },
  band: { ratio: (springEnergy(BAND.k, BAND.x2) - springEnergy(BAND.k, BAND.x1)) / springEnergy(BAND.k, BAND.x1) },
};
const X = ANSWERS;

const launcher = (over: Partial<LauncherFig> = {}): LauncherFig => ({ kind: 'launcher', k: LAUNCHER.k, x: LAUNCHER.x, m: LAUNCHER.m, panel: 'readings', ...over });

export const elasticStrainEnergy: Lesson = {
  id: 'strain-energy',
  title: 'Elastic strain energy',
  spec: [32],
  minutes: 10,
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Elastic strain energy',
      body: 'A toy launcher: a 12 N push squashes its spring 3.0 cm. Let go, and the spring fires a 20 g ball.',
      fig: launcher({ rows: ['x', 'F'] }),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: 'Squash the spring twice as far, 6.0 cm. How much energy does it store, compared with 3.0 cm?',
      fig: launcher({ x: DOUBLE, rows: ['x', 'F'] }),
      options: [
        { id: 'same', label: 'The same' },
        { id: 'twice', label: 'Twice as much' },
        { id: 'four', label: '4 times as much', correct: true },
        { id: 'eight', label: '8 times as much' },
      ],
      after: "Let's find out",
    },
    {
      id: 'work',
      kind: 'text',
      body: [
        'Squashing the spring takes work, and the spring stores it as **elastic strain energy**. Let go, and it gives the energy back.',
        'The push grows from 0 to F as the spring is squashed, so the work is the **area under the force–compression graph**: ½FΔx for a straight line.',
      ],
      card: { term: 'Elastic strain energy', text: 'E = ½FΔx: the area under the force–extension graph, while Hooke’s law holds.' },
    },
    {
      id: 'energy',
      kind: 'choice',
      prompt: 'The push grows from 0 to 12 N as the spring is squashed 3.0 cm. How much energy does the spring store?',
      fig: launcher({ rows: ['x', 'F', 'E'], ask: 'afterCheck' }),
      options: [
        { id: 'noHalf', label: J(X.energy.noHalf), hint: 'That uses the full 12 N all the way. The push grows from 0: take half.' },
        { id: 'right', label: J(X.energy.right), correct: true },
        { id: 'cm', label: J(X.energy.cm), hint: 'That uses 3.0 for the squash. In joules Δx is 0.030 m.' },
      ],
      why: `E = ½FΔx = ½ × 12 × 0.030 = ${J(X.energy.right)}: the area of the triangle under the graph.`,
    },
    {
      id: 'graph',
      kind: 'explore',
      instruction: 'Drag the slider to squash the spring. Watch the shaded triangle.',
      fig: launcher({ panel: 'graph' }),
      slider: { min: 0, max: EXPLORE.max, step: 0.5, tick: 1, label: 'Squash of the spring', unit: 'cm', symbol: 'Δx', dp: 1, start: 3 },
      question: {
        prompt: 'When the squash doubles, what happens to the shaded triangle?',
        options: [
          { id: 'right', label: 'It has 4 times the area: twice as wide and twice as tall', correct: true },
          { id: 'twice', label: 'It doubles: twice as wide', hint: 'The push doubles too, so the triangle is twice as tall as well.' },
          { id: 'same', label: 'It stays the same', hint: 'Watch the triangle grow as the squash grows.' },
        ],
        right: 'Right: the area is ½FΔx, and F grows with Δx. Twice the squash, 4 times the energy.',
      },
    },
    {
      id: 'formula',
      kind: 'text',
      body: [
        'With Hooke’s law, F = kΔx, so the energy is **½kΔx²**. It grows with the square of the squash.',
        'The same holds for stretching: a spring or a wire stretched by Δx stores ½FΔx, up to the limit of proportionality.',
      ],
      card: { term: 'Energy in a spring', text: 'E = ½FΔx = ½kΔx². Twice the extension, 4 times the energy.' },
    },
    {
      id: 'stored',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: 'Back to the launcher, squashed 6.0 cm by a push that grows to 24 N. How much energy does it store now?',
      fig: launcher({ x: DOUBLE, rows: ['x', 'F', 'E'], ask: 'afterCheck' }),
      options: [
        { id: 'same', label: `${J(X.stored.same)}, the same`, hint: 'The spring is squashed further, by a bigger push: more energy.' },
        { id: 'doubled', label: J(X.stored.doubled), hint: 'That doubles it. The push doubled too: ½ × 24 × 0.060.' },
        { id: 'right', label: J(X.stored.right), correct: true },
        { id: 'noHalf', label: J(X.stored.noHalf), hint: 'That forgets the ½: the push grows from 0 to 24 N.' },
      ],
      why: `E = ½FΔx = ½ × 24 × 0.060 = ${J(X.stored.right)}: 4 times the ${J(X.stored.same)}. Twice the force over twice the distance.`,
    },
    {
      id: 'speed',
      kind: 'choice',
      prompt: 'All 0.72 J goes to the 20 g ball as kinetic energy. How fast does it leave the launcher?',
      fig: launcher({ x: DOUBLE, rows: ['x', 'F', 'E'], speed: 'afterCheck', play: 'afterCheck' }),
      options: [
        { id: 'noHalf', label: MS(X.speed.noHalf), hint: 'That leaves out the ½ in ½mv².' },
        { id: 'right', label: MS(X.speed.right), correct: true },
        { id: 'noRoot', label: MS(X.speed.noRoot), hint: 'That is v². Take the square root.' },
        { id: 'grams', label: MS(X.speed.grams), hint: 'That puts the mass in grams. 20 g is 0.020 kg.' },
      ],
      why: `½mv² = 0.72 J, so v = √(2 × 0.72 ÷ 0.020) = ${MS(X.speed.right)}: only twice the ${MS(X.speed.first)} from 3.0 cm.`,
    },
    {
      id: 'curve',
      kind: 'choice',
      prompt: 'A rubber band’s force–extension graph curves. How do you find the energy it stores when stretched 20 cm?',
      fig: { kind: 'launcher', view: 'curve', k: LAUNCHER.k, x: LAUNCHER.x, m: LAUNCHER.m, panel: 'readings' },
      options: [
        { id: 'half', label: '½ × the final force × the extension', hint: 'That is the area of a triangle: right only for a straight line.' },
        { id: 'right', label: 'The area under the curve, by counting squares', correct: true },
        { id: 'full', label: 'The final force × the extension', hint: 'That is a whole rectangle: too big, the force grows from 0.' },
        { id: 'gradient', label: 'The gradient × the extension', hint: 'The gradient is the stiffness. The energy is the area.' },
      ],
      why: 'The work done is always the area under the force–extension graph. Only a straight line gives the triangle ½FΔx.',
    },
    {
      id: 'softer',
      kind: 'choice',
      prompt: 'Spring B is twice as stiff as spring A. Both are squashed by the same 12 N push. Which stores more energy?',
      fig: launcher({ panel: 'pair', k2: STIFFER, ask: 'afterCheck' }),
      options: [
        { id: 'right', label: 'A, the softer one: twice as much', correct: true },
        { id: 'B', label: 'B, the stiffer one', hint: 'B squashes only half as far under the same push.' },
        { id: 'same', label: 'Both the same: the same push', hint: 'E = ½FΔx: the same F, but A moves twice as far.' },
      ],
      why: `The same 12 N, but A squashes 3.0 cm and B 1.5 cm. E = ½FΔx: A stores ${J(X.softer.A)}, B ${J(X.softer.B)}.`,
    },
    {
      id: 'rules',
      kind: 'text',
      body: [
        'The energy stored is the **area under the force–extension graph**: ½FΔx = ½kΔx² on a straight line.',
        'Twice the extension, 4 times the energy. For the same force, the softer spring stores more.',
      ],
    },
  ],
  skillCheck: [
    {
      id: 'stretch',
      kind: 'choice',
      prompt: 'A spring of stiffness 50 N m⁻¹ is stretched 6.0 cm. How much elastic strain energy does it store?',
      options: [
        { id: 'noSquare', label: J(X.stretch.noSquare) },
        { id: 'noHalf', label: J(X.stretch.noHalf) },
        { id: 'right', label: J(X.stretch.right), correct: true },
        { id: 'cm', label: J(X.stretch.cm) },
      ],
      why: `E = ½kΔx² = ½ × 50 × 0.060² = ${J(X.stretch.right)}.`,
    },
    {
      id: 'wire',
      kind: 'choice',
      prompt: 'A steel wire stretches 2.2 mm under a load of 60 N, within its limit of proportionality. How much energy does it store?',
      options: [
        { id: 'right', label: J(X.wire.right), correct: true },
        { id: 'noHalf', label: J(X.wire.noHalf) },
        { id: 'mm', label: J(X.wire.mm) },
        { id: 'mmNoHalf', label: J(X.wire.mmNoHalf) },
      ],
      why: `E = ½FΔx = ½ × 60 × 2.2 × 10⁻³ = ${J(X.wire.right)}.`,
    },
    {
      id: 'height',
      kind: 'choice',
      prompt: 'The launcher squashed 3.0 cm stores 0.18 J and fires the 20 g ball straight up. How high can the ball rise?',
      options: [
        { id: 'noG', label: `${sig(X.height.noG, 2)}${NB}m` },
        { id: 'half', label: `${sig(X.height.half, 2)}${NB}m` },
        { id: 'grams', label: `${sig(X.height.grams * 1000, 2)}${NB}mm` },
        { id: 'right', label: `${sig(X.height.right, 2)}${NB}m`, correct: true },
      ],
      why: `mgΔh = 0.18 J, so Δh = 0.18 ÷ (0.020 × 9.81) = ${sig(X.height.right, 2)} m.`,
    },
    {
      id: 'band',
      kind: 'choice',
      prompt: 'A spring is stretched 2.0 cm, then on to 4.0 cm. Compared with the first 2.0 cm, how much energy does the second 2.0 cm add?',
      options: [
        { id: 'same', label: 'The same' },
        { id: 'twice', label: 'Twice as much' },
        { id: 'right', label: '3 times as much', correct: true },
        { id: 'four', label: '4 times as much' },
      ],
      why: 'E grows as Δx²: 4 units at 4.0 cm, 1 unit at 2.0 cm. The second 2.0 cm adds 4 − 1 = 3 units.',
    },
  ],
  youCanNow: [
    'Find the energy stored as the area under a force–extension graph',
    'Use ½FΔx and ½kΔx²',
    'Turn stored energy into a launch speed or a height',
  ],
  recap: {
    fig: launcher({ x: DOUBLE, panel: 'graph', inner: LAUNCHER.x }),
    text: `Twice the squash, twice the push: the triangle holds four of the small ones. ${J(E1)} at 3.0 cm, ${J(E2)} at 6.0 cm.`,
  },
  card: {
    formula: 'E = ½FΔx',
    idea: 'The energy stored is the area under the force–extension graph. Twice the stretch, 4 times the energy.',
  },
};
