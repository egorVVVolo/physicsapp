// Lesson "Stress, strain, Young modulus" — σ = F ÷ A, ε = Δx ÷ L, E = σ ÷ ε, the wire's extension FL ÷ (AE), and
// Core Practical 2: E from the gradient of a force–extension graph (WPH11 points 28 and 31). The puzzle: two wires of
// the same steel carry the same 60 N; B is twice as long and twice as wide. How far does B stretch compared with A?
// Half as far: length doubles it, width (area ∝ d²) quarters it.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
// Format v3 (V2 task D12): build, order, spotError; the Skill check ends on an exam-style card.
import { fixed, sci } from '../physics/format.ts';
import { circleArea, E_STEEL, strain, stress, wireExtension, youngFromGradient, youngModulus } from '../physics/young.ts';
import type { Lesson, WireFig, WireSpec } from './types.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const PA = (x: number): string => `${sci(x)}${NB}Pa`;
const MM = (x: number): string => `${fixed(x * 1e3, 2)}${NB}mm`;
const M = (x: number, dp = 5): string => `${fixed(x, dp)}${NB}m`; // a chip: plain decimals, at most 14 characters
const NEWTON = (F: number): string => `${F}${NB}N`;
const AREA = (x: number): string => `${sci(x)}${NB}m²`;
const EP = (x: number): string => `${sci(x)}`;

export const LOAD = 60; // N, on each wire
export const WA: WireSpec = { name: 'A', L: 1.5, d: 0.5e-3 };
export const WB: WireSpec = { name: 'B', L: 3.0, d: 1.0e-3 };
export const EXPLORE = { max: 70 }; // N, the slider
/** Core Practical 2: the lab wire and the gradient of its force–extension graph. */
export const LAB = { L: 1.6, d: 0.4e-3, k: 1.6e4 };
// Skill check.
export const ROD = { F: 400, L: 1.5, A: 0.8e-6 }; // N, m, m²
export const TEST = { F: 80, L: 2.0, d: 0.5e-3, dx: 3.9e-3 }; // the exam card's wire: N, m, m, m

const aA = circleArea(WA.d);
const aB = circleArea(WB.d);
const sigmaA = stress(LOAD, aA);
const dxA = wireExtension(LOAD, WA.L, aA, E_STEEL);
const dxB = wireExtension(LOAD, WB.L, aB, E_STEEL);
const epsA = strain(dxA, WA.L);
const aLab = circleArea(LAB.d);
const testSigma = stress(TEST.F, circleArea(TEST.d));
const testEps = strain(TEST.dx, TEST.L);

/** Answers and named mistakes, used by the screens and re-checked by stress-strain-young.test.ts. */
export const ANSWERS = {
  /** The stress in A: A = πd² ÷ 4 with the diameter, in m². */
  stress: { right: sigmaA, radiusAsD: LOAD / circleArea(WA.d / 2), noPi: LOAD / (WA.d / 2) ** 2, wrongArea: Math.PI * WA.d ** 2, area: aA },
  /** The strain of A: Δx ÷ L, in the same unit. */
  strain: { right: epsA, noLength: dxA, mixed: (dxA * 1e3) / WA.L, upside: WA.L / dxA },
  /** The Young modulus of the steel from A's stress and strain. */
  young: { right: youngModulus(sigmaA, epsA), upside: epsA / sigmaA },
  /** The puzzle: B's extension. */
  puzzle: { right: dxB, quarter: dxB / 2, same: dxA, double: 2 * dxA, areaB: aB, areaA: aA },
  /** The spotError: the diameter used where πr² wants the radius. */
  error: { area: Math.PI * WA.d ** 2, sigma: LOAD / (Math.PI * WA.d ** 2) },
  /** The lab: E from the gradient. */
  gradient: { right: youngFromGradient(LAB.k, LAB.L, aLab), radius: youngFromGradient(LAB.k, LAB.L, circleArea(LAB.d / 2)), noLength: LAB.k / aLab },
  extension: { right: wireExtension(ROD.F, ROD.L, ROD.A, E_STEEL) },
  /** The exam card: stress and Young modulus of the 2.0 m wire. */
  test: { sigma: testSigma, eps: testEps, E: youngModulus(testSigma, testEps), dx: TEST.dx },
};
const X = ANSWERS;

const wireFig = (over: Partial<WireFig> = {}): WireFig => ({ kind: 'wire', E: E_STEEL, F: LOAD, wires: [WA, WB], panel: 'readings', ...over });
const labFig = (over: Partial<WireFig> = {}): WireFig =>
  wireFig({ wires: [{ name: 'WIRE', L: LAB.L, d: LAB.d }], k: LAB.k, ...over });

export const stressStrainYoung: Lesson = {
  id: 'young',
  title: 'Stress, strain, Young modulus',
  spec: [28, 31],
  minutes: 10,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'Stress, strain, E', from: 'law' },
    { title: 'Back to the wires', from: 'hook-again' },
  ],
  cast: ['Hana'],
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Stress, strain, Young modulus',
      body: 'Two steel wires hang side by side, each carrying a 60 N weight. B is twice as long as A, and twice as wide.',
      fig: wireFig({ rows: ['L', 'd'], stretch: 'hidden' }),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: 'Compared with wire A, how far does wire B stretch under the same 60 N?',
      fig: wireFig({ panel: 'section', stretch: 'afterCheck' }),
      options: [
        { id: 'quarter', label: 'A quarter as far' },
        { id: 'half', label: 'Half as far', correct: true },
        { id: 'same', label: 'The same' },
        { id: 'double', label: 'Twice as far' },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'law',
      kind: 'text',
      body: [
        'What matters is the force on each square metre of the cross-section: the **stress**, σ = F ÷ A, in pascals (Pa).',
        'And the stretch of each metre of wire: the **strain**, ε = Δx ÷ L. A ratio, so it has no unit.',
      ],
      card: { term: 'Stress and strain', text: 'Stress σ = F ÷ A, in Pa. Strain ε = Δx ÷ L, with no unit.' },
    },
    {
      id: 'stress',
      kind: 'build',
      prompt: 'Wire A is 0.50 mm across and carries 60 N. Build the stress in it. The area of the circle is πd² ÷ 4.',
      fig: wireFig({ wires: [WA], panel: 'section' }),
      equation: 'σ = {F} ÷ (π × {d}² ÷ 4)',
      boxes: { F: 'force', d: 'diameter' },
      chips: [
        { id: 'force', label: NEWTON(LOAD) },
        { id: 'diameter', label: M(WA.d) },
        { id: 'radius', label: M(WA.d / 2), hint: 'That is the radius. This equation has d² ÷ 4 for it.' },
        { id: 'mm', label: `${fixed(WA.d * 1e3, 2)}${NB}mm`, hint: 'Work in metres: 1 mm is 10⁻³ m.' },
      ],
      result: { symbol: 'σ', value: X.stress.right / 1e6, unit: 'MPa' },
      why: `A = π(0.50 × 10⁻³)² ÷ 4 = ${sci(X.stress.area)} m². σ = F ÷ A = 60 ÷ ${sci(X.stress.area)} = ${PA(X.stress.right)}.`,
    },
    {
      id: 'strain',
      kind: 'choice',
      prompt: 'The 60 N stretches wire A, 1.5 m long, by 2.18 mm. What is its strain?',
      fig: wireFig({ wires: [WA], panel: 'readings', rows: ['L', 'ext'] }),
      options: [
        { id: 'noLength', label: EP(X.strain.noLength), hint: 'That is the extension in metres. Divide by the length, 1.5 m.' },
        { id: 'mixed', label: fixed(X.strain.mixed, 2), hint: 'That mixes mm and m. Use 0.00218 m ÷ 1.5 m.' },
        { id: 'right', label: EP(X.strain.right), correct: true },
        { id: 'upside', label: fixed(X.strain.upside, 0), hint: 'That is L ÷ Δx. Strain is extension ÷ length.' },
      ],
      why: `ε = Δx ÷ L = 0.00218 ÷ 1.5 = ${EP(X.strain.right)}. Every metre of the wire stretches by 1.46 mm.`,
    },
    {
      id: 'graph',
      kind: 'explore',
      instruction: 'Drag the slider to change the load. Watch the point on the graph.',
      fig: wireFig({ wires: [WA], panel: 'graph' }),
      slider: { min: 0, max: EXPLORE.max, step: 10, tick: 10, label: 'Load on the wire', unit: 'N', symbol: 'F', dp: 0, start: LOAD },
      question: {
        prompt: 'The point traces a straight line through the origin. What does its gradient give?',
        options: [
          { id: 'right', label: 'The Young modulus E', correct: true },
          { id: 'k', label: 'The stiffness k of the wire', hint: 'k is the gradient of force against extension. This graph is stress against strain.' },
          { id: 'strain', label: 'The strain', hint: 'The strain is read along the bottom axis.' },
        ],
        right: 'Right: gradient = σ ÷ ε, the Young modulus E. A steeper line is a stiffer material.',
      },
    },
    {
      id: 'material',
      kind: 'text',
      body: [
        'The ratio **E = σ ÷ ε** is the **Young modulus**, in pascals. It belongs to the **material**: any steel wire gives the same E, whatever its length or width.',
        'The stiffness k belongs to the wire as an object. E tells you how stiff the material itself is.',
      ],
      card: { term: 'Young modulus', text: 'E = stress ÷ strain, in Pa. A property of the material, not of one wire.' },
    },
    {
      id: 'young',
      kind: 'build',
      prompt: 'Wire A has a stress of 306 MPa and carries 60 N over 1.5 m, stretching 2.18 mm. Build the Young modulus of the steel.',
      fig: wireFig({ wires: [WA], panel: 'readings', rows: ['stress', 'strain', 'E'], ask: { row: 'E', col: 0, hide: 'afterCheck' } }),
      equation: 'E = {σ} ÷ {ε}',
      boxes: { 'σ': 'stress', 'ε': 'strain' },
      chips: [
        { id: 'stress', label: PA(sigmaA) },
        { id: 'strain', label: EP(epsA) },
        { id: 'ext', label: MM(dxA), hint: 'That is the extension. Strain is extension ÷ length, with no unit.' },
        { id: 'length', label: `${fixed(WA.L, 1)}${NB}m`, hint: 'That is the length. The strain is Δx ÷ L: a ratio.' },
      ],
      result: { symbol: 'E', value: X.young.right / 1e9, unit: 'GPa' },
      why: `E = σ ÷ ε = ${sci(sigmaA)} ÷ ${sci(epsA)} = ${PA(X.young.right)}. Steel is stiff: it takes a huge stress to strain it.`,
    },
    {
      id: 'hook-again',
      kind: 'build',
      prompt: 'Back to the two wires. Wire B is twice as long and twice as wide. Build how far it stretches under 60 N.',
      fig: wireFig({ rows: ['L', 'A', 'ext'], ask: { row: 'ext', col: 1, hide: 'afterCheck' }, stretch: 'afterCheck' }),
      equation: 'Δx = {F} × {L} ÷ ({A} × {E})',
      boxes: { F: 'force', L: 'length', A: 'area', E: 'modulus' },
      chips: [
        { id: 'force', label: NEWTON(LOAD) },
        { id: 'length', label: `${fixed(WB.L, 1)}${NB}m` },
        { id: 'area', label: AREA(aB) },
        { id: 'modulus', label: PA(E_STEEL) },
        { id: 'lenA', label: `${fixed(WA.L, 1)}${NB}m`, hint: 'That is wire A’s length. B is twice as long.' },
        { id: 'areaA', label: AREA(aA), hint: 'That is wire A’s area. B is twice as wide: 4 times the area.' },
      ],
      result: { symbol: 'Δx', value: X.puzzle.right * 1e3, unit: 'mm' },
      why: `Δx = FL ÷ (AE) = 60 × 3.0 ÷ (${sci(aB)} × ${sci(E_STEEL)}) = ${MM(X.puzzle.right)}. Twice the length doubles it; 4 times the area quarters it: half of A's ${MM(X.puzzle.same)}.`,
    },
    {
      id: 'error',
      kind: 'spotError',
      prompt: 'Hana works out the stress in wire A, which is 0.50 mm across and carries 60 N. One line is wrong. Which?',
      fig: wireFig({ wires: [WA], panel: 'section' }),
      lines: [
        { id: 'r', text: 'The wire is 0.50 mm across, so r = 0.25 mm', hint: 'That line is right: the radius is half the diameter.' },
        { id: 'area', text: `A = πr² = π × (0.50 × 10⁻³)² = ${AREA(X.error.area)}`, wrong: true, fix: `A = π × (0.25 × 10⁻³)² = ${AREA(aA)}` },
        { id: 'sigma', text: `σ = F ÷ A = 60 ÷ ${sci(X.error.area)} = ${PA(X.error.sigma)}`, hint: 'This follows from the line above. Check the A put in.' },
        { id: 'low', text: 'So A carries about 76 MPa', hint: 'This follows from the lines above. Is that stress too low?' },
      ],
      why: `πr² needs the radius, 0.25 mm. With the diameter the area comes out 4 times too big and the stress 4 times too small. σ = ${PA(X.stress.right)}.`,
    },
    {
      id: 'cp2',
      kind: 'order',
      prompt: 'Core Practical 2: find the Young modulus of a wire. Put the steps of the experiment in order.',
      fig: labFig({ view: 'rig' }),
      steps: [
        { id: 'length', text: 'Measure the wire’s length from the clamp to the marker.' },
        { id: 'diameter', text: 'Measure its diameter in several places with a micrometer.' },
        { id: 'load', text: 'Add the load in equal steps and note the extension each time.' },
        { id: 'plot', text: 'Plot force against extension and find the gradient.' },
      ],
      hint: 'First the wire’s own size, then the loading, and the graph last.',
      why: 'Length and diameter give L and A. The loads and extensions give the graph; its gradient is k, and E = kL ÷ A.',
    },
    {
      id: 'long-thin',
      kind: 'choice',
      prompt: 'In the lab, why use a long, thin wire to find the Young modulus?',
      options: [
        { id: 'right', label: 'The extension is big enough to measure with a small load', correct: true },
        { id: 'smallE', label: 'A long, thin wire has a smaller Young modulus', hint: 'E belongs to the material. Length and width do not change it.' },
        { id: 'noStrain', label: 'Then the strain does not have to be measured', hint: 'Strain still needs Δx and L. Long and thin only makes Δx bigger.' },
        { id: 'lessStress', label: 'A thin wire carries less stress under the same load', hint: 'A thin wire has more stress: σ = F ÷ A, and A is small.' },
      ],
      why: 'Δx = FL ÷ (AE): a long, thin wire stretches more for each newton, so the load can stay small (and elastic) while Δx is easy to read.',
    },
    {
      id: 'gradient',
      kind: 'build',
      prompt: 'A 1.60 m wire, 0.40 mm across, gives a force–extension graph of gradient 16 000 N m⁻¹. Build its Young modulus.',
      fig: labFig({ view: 'plot' }),
      equation: 'E = {k} × {L} ÷ (π × {d}² ÷ 4)',
      boxes: { k: 'gradient', L: 'length', d: 'diameter' },
      chips: [
        { id: 'gradient', label: `${LAB.k}${NB}N${NB}m⁻¹` },
        { id: 'length', label: `${fixed(LAB.L, 2)}${NB}m` },
        { id: 'diameter', label: M(LAB.d) },
        { id: 'radius', label: M(LAB.d / 2), hint: 'That is the radius. 0.40 mm is the diameter.' },
      ],
      result: { symbol: 'E', value: X.gradient.right / 1e9, unit: 'GPa' },
      why: `The gradient is k = EA ÷ L, so E = kL ÷ A = ${LAB.k} × ${fixed(LAB.L, 2)} ÷ ${sci(aLab)} = ${PA(X.gradient.right)}.`,
    },
    {
      id: 'rules',
      kind: 'text',
      body: ['σ = F ÷ A, ε = Δx ÷ L, E = σ ÷ ε: a property of the material.'],
      fig: wireFig({ rows: ['L', 'A', 'stress', 'ext'] }),
    },
  ],
  skillCheck: [
    {
      id: 'extension',
      kind: 'build',
      prompt: 'Steel has E = 2.1 × 10¹¹ Pa. A 1.5 m steel wire has a cross-section of 0.80 mm². Build how far a 400 N load stretches it.',
      equation: 'Δx = {F} × {L} ÷ ({A} × {E})',
      boxes: { F: 'force', L: 'length', A: 'area', E: 'modulus' },
      chips: [
        { id: 'force', label: NEWTON(ROD.F) },
        { id: 'length', label: `${fixed(ROD.L, 1)}${NB}m` },
        { id: 'area', label: AREA(ROD.A) },
        { id: 'modulus', label: PA(E_STEEL) },
        { id: 'mm2', label: `0.80${NB}mm²`, hint: 'Work in m²: 1 mm² is 10⁻⁶ m².' },
      ],
      result: { symbol: 'Δx', value: X.extension.right * 1e3, unit: 'mm' },
      why: `Δx = FL ÷ (AE) = 400 × 1.5 ÷ (0.80 × 10⁻⁶ × 2.1 × 10¹¹) = ${MM(X.extension.right)}.`,
    },
    {
      id: 'elastic-why',
      kind: 'order',
      prompt: 'Why must the wire in the lab stay below its elastic limit? Put the steps in order.',
      steps: [
        { id: 'past', text: 'Past the elastic limit, part of the extension is permanent.' },
        { id: 'curve', text: 'Then the force–extension graph stops being a straight line.' },
        { id: 'gradient', text: 'So its gradient is no longer the stiffness k.' },
        { id: 'young', text: 'And E = kL ÷ A would give the wrong value.' },
      ],
      hint: 'Start with what happens past the limit, and end with what goes wrong for E.',
      why: 'E = kL ÷ A holds only on the straight part of the graph, where the wire is elastic and force is proportional to extension.',
    },
    {
      id: 'halved',
      kind: 'choice',
      prompt: 'The wire is cut in half and the same 60 N hangs from one half. Which of these stay the same as before?',
      options: [
        { id: 'object', label: 'The extension and the stiffness k' },
        { id: 'onlyE', label: 'Only the Young modulus' },
        { id: 'right', label: 'The stress, the strain and the Young modulus', correct: true },
        { id: 'extStrain', label: 'The extension and the strain' },
      ],
      why: 'The same load on the same area: the same stress, so the same strain and E. Half the length: half the extension, twice the k.',
    },
    {
      id: 'steel-wire',
      kind: 'examCard',
      context: `Hana hangs ${TEST.F} N from a steel wire ${fixed(TEST.L, 1)} m long and ${fixed(TEST.d * 1e3, 2)} mm across. It stretches ${fixed(TEST.dx * 1e3, 1)} mm.`,
      parts: [
        {
          id: 'a',
          command: 'Calculate',
          text: 'the stress in the wire.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'σ = {F} ÷ (π × {d}² ÷ 4)',
            boxes: { F: 'force', d: 'diameter' },
            chips: [
              { id: 'force', label: NEWTON(TEST.F) },
              { id: 'diameter', label: M(TEST.d) },
              { id: 'radius', label: M(TEST.d / 2), hint: 'That is the radius. This equation has d² ÷ 4 for it.' },
            ],
            result: { symbol: 'σ', value: X.test.sigma / 1e6, unit: 'MPa' },
          },
          why: `A = π(0.50 × 10⁻³)² ÷ 4 = ${sci(circleArea(TEST.d))} m², so σ = ${TEST.F} ÷ ${sci(circleArea(TEST.d))} = ${PA(X.test.sigma)}. One mark for the area, one for the stress.`,
        },
        {
          id: 'b',
          command: 'Calculate',
          text: 'the Young modulus of the steel.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'E = {σ} ÷ {ε}',
            boxes: { 'σ': 'stress', 'ε': 'strain' },
            chips: [
              { id: 'stress', label: PA(X.test.sigma) },
              { id: 'strain', label: EP(X.test.eps) },
              { id: 'ext', label: MM(TEST.dx), hint: 'That is the extension. Strain is extension ÷ length, with no unit.' },
            ],
            result: { symbol: 'E', value: X.test.E / 1e9, unit: 'GPa' },
          },
          why: `ε = Δx ÷ L = ${fixed(TEST.dx, 4)} ÷ ${fixed(TEST.L, 1)} = ${EP(X.test.eps)}, so E = σ ÷ ε = ${PA(X.test.sigma)} ÷ ${EP(X.test.eps)} = ${PA(X.test.E)}.`,
        },
      ],
    },
  ],
  youCanNow: [
    'Calculate stress, strain and the Young modulus',
    'Find a wire’s extension from F, L, A and E',
    'Find E from the gradient of a force–extension graph',
  ],
  recap: {
    fig: wireFig({ rows: ['L', 'A', 'stress', 'ext'] }),
    text: `Same steel, same 60 N: A stretches ${MM(dxA)}, B ${MM(dxB)}. Longer stretches more, wider stretches less, and E is ${PA(E_STEEL)} for both.`,
  },
  card: {
    formula: 'E = σ ÷ ε',
    idea: 'Stress is force per area, strain is extension per length. Their ratio E belongs to the material, not the wire.',
  },
};
