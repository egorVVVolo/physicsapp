// Lesson "Stress, strain, Young modulus" — σ = F ÷ A, ε = Δx ÷ L, E = σ ÷ ε, the wire's extension FL ÷ (AE), and
// Core Practical 2: E from the gradient of a force–extension graph (WPH11 points 28 and 31). The puzzle: two wires of
// the same steel carry the same 60 N; B is twice as long and twice as wide. How far does B stretch compared with A?
// Half as far: length doubles it, width (area ∝ d²) quarters it.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { fixed, sci } from '../physics/format.ts';
import { circleArea, E_STEEL, strain, stress, wireExtension, youngFromGradient, youngModulus } from '../physics/young.ts';
import type { Lesson, WireFig, WireSpec } from './types.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const PA = (x: number): string => `${sci(x)}${NB}Pa`;
const MM = (x: number): string => `${fixed(x * 1e3, 2)}${NB}mm`;

export const LOAD = 60; // N, on each wire
export const WA: WireSpec = { name: 'A', L: 1.5, d: 0.5e-3 };
export const WB: WireSpec = { name: 'B', L: 3.0, d: 1.0e-3 };
export const EXPLORE = { max: 70 }; // N, the slider
/** Core Practical 2: the lab wire and the gradient of its force–extension graph. */
export const LAB = { L: 1.6, d: 0.4e-3, k: 1.6e4 };
// Skill check.
export const ROD = { F: 400, L: 1.5, A: 0.8e-6 }; // N, m, m²
export const TEST = { sigma: 1.4e8, epsilon: 2.0e-3 }; // Pa, no unit
export const DIAMETER_ERROR = 1.02; // the diameter read 2 % too big

const aA = circleArea(WA.d);
const aB = circleArea(WB.d);
const sigmaA = stress(LOAD, aA);
const dxA = wireExtension(LOAD, WA.L, aA, E_STEEL);
const dxB = wireExtension(LOAD, WB.L, aB, E_STEEL);
const epsA = strain(dxA, WA.L);
const aLab = circleArea(LAB.d);

/** Answers and named mistakes, used by the screens and re-checked by stress-strain-young.test.ts. */
export const ANSWERS = {
  /** The stress in A: A = πr² with the radius, in m², with π. */
  stress: { right: sigmaA, diameter: LOAD / (Math.PI * WA.d ** 2), mm2: LOAD / (aA * 1e6), noPi: LOAD / (WA.d / 2) ** 2 },
  /** The strain of A: Δx ÷ L, in the same unit. */
  strain: { right: epsA, noLength: dxA, mixed: (dxA * 1e3) / WA.L, upside: WA.L / dxA },
  /** The Young modulus of the steel from A's stress and strain. */
  young: { right: youngModulus(sigmaA, epsA), upside: epsA / sigmaA, product: sigmaA * epsA, mpa: sigmaA / 1e6 / epsA },
  /** The puzzle: B's extension. */
  puzzle: { right: dxB, quarter: dxB / 2, same: dxA, double: 2 * dxA },
  /** The lab: E from the gradient. */
  gradient: {
    right: youngFromGradient(LAB.k, LAB.L, aLab),
    radius: youngFromGradient(LAB.k, LAB.L, Math.PI * LAB.d ** 2),
    noLength: LAB.k / aLab,
    mm2: youngFromGradient(LAB.k, LAB.L, aLab * 1e6),
  },
  extension: {
    right: wireExtension(ROD.F, ROD.L, ROD.A, E_STEEL),
    noLength: ROD.F / (ROD.A * E_STEEL),
    divLength: ROD.F / (ROD.A * E_STEEL * ROD.L),
    mm2: wireExtension(ROD.F, ROD.L, ROD.A * 1e3, E_STEEL),
  },
  modulus: { right: youngModulus(TEST.sigma, TEST.epsilon), upside: TEST.epsilon / TEST.sigma, product: TEST.sigma * TEST.epsilon },
  /** The diameter 2 % too big: the area 4 % too big, so E about 4 % too small. */
  diameter: {
    ratio:
      youngFromGradient(LAB.k, LAB.L, circleArea(LAB.d * DIAMETER_ERROR)) / youngFromGradient(LAB.k, LAB.L, aLab),
  },
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
      kind: 'choice',
      prompt: 'Wire A is 0.50 mm across and carries 60 N. What is the stress in it?',
      fig: wireFig({ wires: [WA], panel: 'section' }),
      options: [
        { id: 'diameter', label: PA(X.stress.diameter), hint: 'That puts the diameter in for the radius. The radius is 0.25 mm.' },
        { id: 'mm2', label: PA(X.stress.mm2), hint: 'That leaves A in mm². 1 mm² is 10⁻⁶ m².' },
        { id: 'right', label: PA(X.stress.right), correct: true },
        { id: 'noPi', label: PA(X.stress.noPi), hint: 'That forgets π: the area is πr², not r².' },
      ],
      why: `A = π(0.25 × 10⁻³)² = 1.96 × 10⁻⁷ m². σ = F ÷ A = 60 ÷ 1.96 × 10⁻⁷ = ${PA(X.stress.right)}.`,
    },
    {
      id: 'strain',
      kind: 'choice',
      prompt: 'The 60 N stretches wire A, 1.5 m long, by 2.18 mm. What is its strain?',
      fig: wireFig({ wires: [WA], panel: 'readings', rows: ['L', 'ext'] }),
      options: [
        { id: 'noLength', label: sci(X.strain.noLength), hint: 'That is the extension in metres. Divide by the length, 1.5 m.' },
        { id: 'mixed', label: fixed(X.strain.mixed, 2), hint: 'That mixes mm and m. Use 0.00218 m ÷ 1.5 m.' },
        { id: 'right', label: sci(X.strain.right), correct: true },
        { id: 'upside', label: fixed(X.strain.upside, 0), hint: 'That is L ÷ Δx. Strain is extension ÷ length.' },
      ],
      why: `ε = Δx ÷ L = 0.00218 ÷ 1.5 = ${sci(X.strain.right)}. Every metre of the wire stretches by 1.46 mm.`,
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
      kind: 'choice',
      prompt: 'Wire A has a stress of 306 MPa and a strain of 1.46 × 10⁻³. What is the Young modulus of the steel?',
      fig: wireFig({ wires: [WA], panel: 'readings', rows: ['stress', 'strain', 'E'], ask: { row: 'E', col: 0, hide: 'afterCheck' } }),
      options: [
        { id: 'upside', label: PA(X.young.upside), hint: 'That is ε ÷ σ. E = stress ÷ strain.' },
        { id: 'product', label: PA(X.young.product), hint: 'That multiplies them. E is the stress divided by the strain.' },
        { id: 'right', label: PA(X.young.right), correct: true },
        { id: 'mpa', label: PA(X.young.mpa), hint: 'That leaves the stress in MPa. 306 MPa is 3.06 × 10⁸ Pa.' },
      ],
      why: `E = σ ÷ ε = 3.06 × 10⁸ ÷ 1.46 × 10⁻³ = ${PA(X.young.right)}. Steel is stiff: it takes a huge stress to strain it.`,
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: 'Back to the two wires. Wire B is twice as long and twice as wide. How far does it stretch under 60 N?',
      fig: wireFig({ rows: ['L', 'A', 'ext'], ask: { row: 'ext', col: 1, hide: 'afterCheck' }, stretch: 'afterCheck' }),
      options: [
        { id: 'quarter', label: MM(X.puzzle.quarter), hint: 'Twice as wide quarters it, but twice as long doubles it again.' },
        { id: 'right', label: MM(X.puzzle.right), correct: true },
        { id: 'same', label: `${MM(X.puzzle.same)}, the same as A`, hint: 'Twice the width is 4 times the area, not twice.' },
        { id: 'double', label: MM(X.puzzle.double), hint: 'Twice as long doubles it, but the wider wire cuts it back.' },
      ],
      why: `Δx = FL ÷ (AE). Twice the length doubles it; twice the width is 4 times the area, which quarters it: half overall, ${MM(X.puzzle.right)}.`,
    },
    {
      id: 'long-thin',
      kind: 'choice',
      prompt: 'In the lab, why use a long, thin wire to find the Young modulus?',
      fig: labFig({ view: 'rig' }),
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
      kind: 'choice',
      prompt: 'A 1.60 m wire, 0.40 mm across, gives a force–extension graph of gradient 1.6 × 10⁴ N m⁻¹. What is its Young modulus?',
      fig: labFig({ view: 'plot' }),
      options: [
        { id: 'radius', label: PA(X.gradient.radius), hint: 'That uses 0.40 mm as the radius. It is the diameter.' },
        { id: 'noLength', label: PA(X.gradient.noLength), hint: 'That leaves out the length. E = gradient × L ÷ A.' },
        { id: 'right', label: PA(X.gradient.right), correct: true },
        { id: 'mm2', label: PA(X.gradient.mm2), hint: 'That puts A in mm². 1 mm² is 10⁻⁶ m².' },
      ],
      why: `The gradient is k = EA ÷ L, so E = kL ÷ A = 1.6 × 10⁴ × 1.60 ÷ 1.26 × 10⁻⁷ = ${PA(X.gradient.right)}.`,
    },
    {
      id: 'rules',
      kind: 'text',
      body: [
        '**Stress** σ = F ÷ A, **strain** ε = Δx ÷ L, and **E = σ ÷ ε**, a property of the material.',
        'Δx = FL ÷ (AE): longer stretches more, wider stretches less, with the area going as d². Next: where the line stops being straight.',
      ],
    },
  ],
  skillCheck: [
    {
      id: 'extension',
      kind: 'choice',
      prompt: 'Steel has E = 2.1 × 10¹¹ Pa. A 1.5 m steel wire has a cross-section of 0.80 mm². How far does a 400 N load stretch it?',
      options: [
        { id: 'noLength', label: MM(X.extension.noLength) },
        { id: 'right', label: MM(X.extension.right), correct: true },
        { id: 'divLength', label: MM(X.extension.divLength) },
        { id: 'mm2', label: `${fixed(X.extension.mm2 * 1e6, 2)}${NB}μm` },
      ],
      why: `Δx = FL ÷ (AE) = 400 × 1.5 ÷ (0.80 × 10⁻⁶ × 2.1 × 10¹¹) = ${MM(X.extension.right)}.`,
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
      id: 'modulus',
      kind: 'choice',
      prompt: 'A rod under a stress of 1.4 × 10⁸ Pa has a strain of 2.0 × 10⁻³. What is the Young modulus of its material?',
      options: [
        { id: 'upside', label: PA(X.modulus.upside) },
        { id: 'product', label: PA(X.modulus.product) },
        { id: 'unit', label: `${sci(X.modulus.right)}${NB}N${NB}m⁻¹` },
        { id: 'right', label: PA(X.modulus.right), correct: true },
      ],
      why: `E = σ ÷ ε = 1.4 × 10⁸ ÷ 2.0 × 10⁻³ = ${PA(X.modulus.right)}, which is N m⁻². Strain has no unit, so E has the unit of stress.`,
    },
    {
      id: 'diameter',
      kind: 'choice',
      prompt: 'A student reads the wire’s diameter 2 % too big; the other readings are right. What happens to the value of E?',
      options: [
        { id: 'big2', label: 'About 2 % too big' },
        { id: 'small2', label: 'About 2 % too small' },
        { id: 'big4', label: 'About 4 % too big' },
        { id: 'right', label: 'About 4 % too small', correct: true },
      ],
      why: 'A ∝ d², so the area comes out about 4 % too big. E = kL ÷ A is then about 4 % too small.',
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
