// Lesson "Elastic strain energy" — the work done squashing or stretching is the area under the force–extension graph,
// ½FΔx = ½kΔx² on a straight line (WPH11 point 32). The puzzle: a 12 N push squashes a toy launcher's spring 3.0 cm.
// Squash it twice as far: how much energy does it store? Four times: the push doubles too, so the triangle under the
// graph is twice as wide and twice as tall. The ball leaves only twice as fast.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
// Format v3 (V2 task D13): build, estimate, spotError, order; the Skill check ends on an exam-style card.
import { elasticEnergy, energyForForce, launchSpeed, riseHeight, springEnergy } from '../physics/elastic.ts';
import { fixed, sig } from '../physics/format.ts';
import type { LauncherFig, Lesson } from './types.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const J = (E: number): string => `${sig(E, 2)}${NB}J`;
const MS = (v: number): string => `${sig(v)}${NB}m${NB}s⁻¹`;
const M = (x: number): string => `${fixed(x, 3)}${NB}m`; // a chip: plain decimals, at most 14 characters
const NEWTON = (F: number): string => `${sig(F, 2)}${NB}N`;
const KM = (k: number): string => `${k}${NB}N${NB}m⁻¹`;
const G9 = `9.81${NB}N${NB}kg⁻¹`;

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
  energy: { right: E1, noHalf: F1 * LAUNCHER.x, cm: elasticEnergy(F1, LAUNCHER.x * 100), F: F1 },
  /** The puzzle at 6.0 cm. */
  stored: { right: E2, same: E1, doubled: 2 * E1, noHalf: F2 * DOUBLE, ratio: E2 / E1, F: F2 },
  /** The ball's speed from 0.72 J: √(2E ÷ m). The spotError's slip: the ½ left out, 1.44 J. */
  speed: { right: launchSpeed(E2, LAUNCHER.m), first: launchSpeed(E1, LAUNCHER.m), wrongE: F2 * DOUBLE, wrong: launchSpeed(F2 * DOUBLE, LAUNCHER.m) },
  /** The same 12 N on A and on B, twice as stiff. */
  softer: { A: energyForForce(F1, LAUNCHER.k), B: energyForForce(F1, STIFFER) },
  stretch: { right: springEnergy(SPRING.k, SPRING.x), cm: springEnergy(SPRING.k, SPRING.x * 100) },
  wire: { right: elasticEnergy(WIRE.F, WIRE.x), mm: elasticEnergy(WIRE.F, WIRE.x * 1000) },
  height: { right: riseHeight(E1, LAUNCHER.m) },
  band: { ratio: (springEnergy(BAND.k, BAND.x2) - springEnergy(BAND.k, BAND.x1)) / springEnergy(BAND.k, BAND.x1) },
};
const X = ANSWERS;

const launcher = (over: Partial<LauncherFig> = {}): LauncherFig => ({ kind: 'launcher', k: LAUNCHER.k, x: LAUNCHER.x, m: LAUNCHER.m, panel: 'readings', ...over });

export const elasticStrainEnergy: Lesson = {
  id: 'strain-energy',
  title: 'Elastic strain energy',
  spec: [32],
  minutes: 10,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'Energy in a spring', from: 'work' },
    { title: 'Back to the launcher', from: 'hook-again' },
  ],
  cast: ['Yusuf', 'Lucia'],
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
        { id: 'unsure', label: "I'm not sure" },
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
      kind: 'build',
      prompt: 'The push grows from 0 to 12 N as the spring is squashed 3.0 cm. Build the energy the spring stores.',
      fig: launcher({ rows: ['x', 'F', 'E'], ask: 'afterCheck' }),
      equation: 'E = ½ × {F} × {Δx}',
      boxes: { F: 'force', 'Δx': 'squash' },
      chips: [
        { id: 'force', label: NEWTON(F1) },
        { id: 'squash', label: M(LAUNCHER.x) },
        { id: 'cm', label: `${fixed(LAUNCHER.x * 100, 1)}${NB}cm`, hint: 'In joules the squash is in metres: 0.030 m.' },
        { id: 'double', label: NEWTON(F2), hint: 'That is the push at 6.0 cm. Here the squash is 3.0 cm.' },
      ],
      result: { symbol: 'E', value: X.energy.right, unit: 'J' },
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
      id: 'times',
      kind: 'estimate',
      prompt: `Squashed 3.0 cm, the spring stores ${J(E1)}. Drag to how many times as much it stores when squashed 6.0 cm.`,
      fig: launcher({ x: DOUBLE, rows: ['x', 'F'] }),
      after: launcher({ x: DOUBLE, panel: 'graph', inner: LAUNCHER.x }),
      scale: { min: 0, max: 10, step: 0.5, tick: 1, unit: 'times', symbol: 'n', dp: 1, label: 'Energy at 6.0 cm ÷ at 3.0 cm' },
      answer: X.stored.ratio,
      tolerance: 0.5,
      why: 'The push doubles with the squash: the triangle is twice as wide and twice as tall, so it holds 4 of the small ones.',
    },
    {
      id: 'hook-again',
      kind: 'build',
      prompt: 'Back to the launcher, squashed 6.0 cm by a push that grows to 24 N. Build the energy it stores now.',
      fig: launcher({ x: DOUBLE, rows: ['x', 'F', 'E'], ask: 'afterCheck' }),
      equation: 'E = ½ × {F} × {Δx}',
      boxes: { F: 'force', 'Δx': 'squash' },
      chips: [
        { id: 'force', label: NEWTON(F2) },
        { id: 'squash', label: M(DOUBLE) },
        { id: 'oldF', label: NEWTON(F1), hint: 'That is the push at 3.0 cm. At 6.0 cm it has grown to 24 N.' },
        { id: 'oldE', label: J(E1), hint: 'That is the energy at 3.0 cm. Build the new one.' },
      ],
      result: { symbol: 'E', value: X.stored.right, unit: 'J' },
      why: `E = ½FΔx = ½ × 24 × 0.060 = ${J(X.stored.right)}: 4 times the ${J(X.stored.same)}. Twice the force over twice the distance.`,
    },
    {
      id: 'error',
      kind: 'spotError',
      prompt: 'Yusuf works out how fast the 6.0 cm squash fires the 20 g ball. One line is wrong. Which?',
      fig: launcher({ x: DOUBLE, rows: ['x', 'F'] }),
      lines: [
        { id: 'push', text: 'The push grows from 0 to 24 N as the spring is squashed 0.060 m', hint: 'That line is right: it grows from 0.' },
        { id: 'energy', text: `The spring stores E = FΔx = 24 × 0.060 = ${sig(X.speed.wrongE, 3)}${NB}J`, wrong: true, fix: `The spring stores E = ½FΔx = ½ × 24 × 0.060 = ${sig(E2, 3)}${NB}J` },
        { id: 'ball', text: 'All of it goes to the ball: ½mv² = E', hint: 'That line is right: the energy becomes kinetic.' },
        { id: 'v', text: `v = √(2E ÷ m) = √(2 × ${sig(X.speed.wrongE, 3)} ÷ 0.020) = ${MS(X.speed.wrong)}`, hint: 'This follows from the lines above. Check the E put in.' },
      ],
      why: `The push grows from 0, so the work is half of F × Δx: ${J(E2)}, not ${sig(X.speed.wrongE, 3)}${NB}J. v = ${MS(X.speed.right)}.`,
    },
    {
      id: 'chain',
      kind: 'order',
      prompt: 'Put the energy chain in order, from the push to the ball’s speed.',
      fig: launcher({ x: DOUBLE, rows: ['x', 'F', 'E'], speed: 'afterCheck', play: 'afterCheck' }),
      steps: [
        { id: 'stored', text: `The push squashes the spring 6.0 cm: the work done is stored, ${J(E2)}.` },
        { id: 'release', text: 'Let go: the spring pushes the ball and gives the energy back.' },
        { id: 'kinetic', text: `The energy is now the ball’s kinetic energy: ½mv² = ${J(E2)}.` },
        { id: 'speed', text: `So v = √(2E ÷ m) = ${MS(X.speed.right)}: only twice the ${MS(X.speed.first)} from 3.0 cm.` },
      ],
      hint: 'First the energy goes in, then the spring lets go, then the ball moves.',
      why: `Elastic strain energy becomes kinetic energy: ½mv² = ${J(E2)}, so v = ${MS(X.speed.right)}. Four times the energy gives only twice the speed.`,
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
      body: ['E = ½FΔx = ½kΔx²: twice the extension, 4 times the energy.'],
      fig: launcher({ x: DOUBLE, panel: 'graph', inner: LAUNCHER.x }),
    },
  ],
  skillCheck: [
    {
      id: 'stretch',
      kind: 'build',
      prompt: 'A spring of stiffness 50 N m⁻¹ is stretched 6.0 cm. Build the elastic strain energy it stores.',
      equation: 'E = ½ × {k} × {Δx}²',
      boxes: { k: 'stiff', 'Δx': 'ext' },
      chips: [
        { id: 'stiff', label: KM(SPRING.k) },
        { id: 'ext', label: M(SPRING.x) },
        { id: 'cm', label: `${fixed(SPRING.x * 100, 1)}${NB}cm`, hint: 'In joules the extension is in metres: 0.060 m.' },
        { id: 'force', label: NEWTON(SPRING.k * SPRING.x), hint: 'That is the force at the end. The equation uses k and Δx.' },
      ],
      result: { symbol: 'E', value: X.stretch.right, unit: 'J' },
      why: `E = ½kΔx² = ½ × 50 × 0.060² = ${J(X.stretch.right)}.`,
    },
    {
      id: 'wire-error',
      kind: 'spotError',
      prompt: 'Lucia works out the energy stored in a steel wire that stretches 2.2 mm under 60 N. One line is wrong. Which?',
      lines: [
        { id: 'read', text: 'F = 60 N and Δx = 2.2 mm', hint: 'That line is right: the readings.' },
        { id: 'law', text: 'Within the limit, E = ½FΔx', hint: 'That is the right formula for a straight line.' },
        { id: 'sum', text: `E = ½ × 60 × 2.2 = ${sig(X.wire.mm, 2)}${NB}J`, wrong: true, fix: `Δx = 2.2 × 10⁻³ m, so E = ½ × 60 × 0.0022 = ${J(X.wire.right)}` },
        { id: 'big', text: `So the wire stores ${sig(X.wire.mm, 2)}${NB}J`, hint: 'This follows from the line above. Check the unit of Δx.' },
      ],
      why: `For joules the extension must be in metres: 2.2 mm = 0.0022 m. E = ½FΔx = ½ × 60 × 0.0022 = ${J(X.wire.right)}.`,
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
    {
      id: 'ball-up',
      kind: 'examCard',
      context: 'Yusuf squashes the launcher’s spring, stiffness 400 N m⁻¹, by 3.0 cm and fires the 20 g ball straight up. Take g = 9.81 N kg⁻¹.',
      parts: [
        {
          id: 'a',
          command: 'Calculate',
          text: 'the energy stored in the spring.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'E = ½ × {k} × {Δx}²',
            boxes: { k: 'stiff', 'Δx': 'squash' },
            chips: [
              { id: 'stiff', label: KM(LAUNCHER.k) },
              { id: 'squash', label: M(LAUNCHER.x) },
              { id: 'cm', label: `${fixed(LAUNCHER.x * 100, 1)}${NB}cm`, hint: 'In joules the squash is in metres: 0.030 m.' },
            ],
            result: { symbol: 'E', value: E1, unit: 'J' },
          },
          why: `E = ½kΔx² = ½ × 400 × 0.030² = ${J(E1)}. One mark for the formula, one for the answer.`,
        },
        {
          id: 'b',
          command: 'Calculate',
          text: 'the greatest height the ball can rise.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'h = {E} ÷ ({m} × {g})',
            boxes: { E: 'energy', m: 'mass', g: 'field' },
            chips: [
              { id: 'energy', label: J(E1) },
              { id: 'mass', label: `${fixed(LAUNCHER.m, 3)}${NB}kg` },
              { id: 'field', label: G9 },
              { id: 'grams', label: `${LAUNCHER.m * 1000}${NB}g`, hint: 'The mass must be in kg: 0.020 kg.' },
            ],
            result: { symbol: 'h', value: X.height.right, unit: 'm' },
          },
          why: `All the energy becomes GPE: mgΔh = ${J(E1)}, so Δh = ${sig(E1, 2)} ÷ (0.020 × 9.81) = ${sig(X.height.right, 3)}${NB}m.`,
        },
      ],
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
