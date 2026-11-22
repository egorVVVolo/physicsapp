// Lesson "Reading material graphs" — elastic and plastic behaviour, the limit of proportionality, elastic limit, yield
// point, ultimate tensile stress, ductile and brittle (WPH11 points 29–30). The puzzle: a copper wire is stretched to
// 240 MPa and a strain of 5.0 × 10⁻³, then the load is taken off. How much strain is left? 3.0 × 10⁻³: it does not
// retrace its curve, it unloads along a line parallel to the straight part, so only σ ÷ E = 2.0 × 10⁻³ springs back.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { fixed, sci, sig } from '../physics/format.ts';
import { breakingForce, COPPER, E_COPPER, elasticRecovery, permanentStrain } from '../physics/materials.ts';
import type { Lesson, MaterialFig } from './types.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const EPS = (x: number): string => `${fixed(x * 1e3, 1)} × 10⁻³`;
const MM = (x: number): string => `${fixed(x * 1e3, 2)}${NB}mm`;
const NEWTON = (F: number): string => (F >= 1e5 ? `${sci(F)}${NB}N` : `${sig(F)}${NB}N`);

export const WIRE = { L: 1.5, reach: 5.0e-3 }; // m, the strain reached; the stress there is COPPER.endStress
export const EXPLORE = { max: 5 }; // 10⁻³, the slider
export const LOAD = { uts: 340e6, d: 0.8e-3 }; // Pa, m
// Skill check.
export const SKILL = { L: 2.0, sigma: 300e6, eps: 4.0e-3, F: 170, ratio: 4 }; // m, Pa, no unit, N

const sigma = COPPER.endStress;
const back = elasticRecovery(sigma);
const perm = permanentStrain(WIRE.reach);
const skillBack = elasticRecovery(SKILL.sigma);
const skillPerm = SKILL.eps - skillBack;

/** Answers and named mistakes, used by the screens and re-checked by reading-material-graphs.test.ts. */
export const ANSWERS = {
  /** The puzzle: the strain left. */
  hook: { right: perm, none: 0, springy: back, all: WIRE.reach },
  /** The wire's permanent extension, m. */
  left: { right: perm * WIRE.L, zero: 0, springy: back * WIRE.L, all: WIRE.reach * WIRE.L },
  /** The largest load: UTS × A; d for r; no π; A in mm² as m². */
  load: {
    right: breakingForce(LOAD.uts, LOAD.d),
    radius: breakingForce(LOAD.uts, LOAD.d * 2),
    noPi: LOAD.uts * LOAD.d ** 2,
    mm2: LOAD.uts * (breakingForce(1, LOAD.d) * 1e6),
  },
  permanent: { right: skillPerm * SKILL.L, zero: 0, springy: skillBack * SKILL.L, all: SKILL.eps * SKILL.L },
  thick: { right: SKILL.F * SKILL.ratio, twice: SKILL.F * 2, same: SKILL.F, eight: SKILL.F * 8 },
};
const X = ANSWERS;

const loop = (over: Partial<MaterialFig> = {}): MaterialFig => ({ kind: 'material', view: 'loop', E: E_COPPER, ...over });
const sketch = (over: Partial<MaterialFig> = {}): MaterialFig => ({ kind: 'material', view: 'sketch', E: E_COPPER, ...over });

export const readingMaterialGraphs: Lesson = {
  id: 'material-graphs',
  title: 'Reading material graphs',
  spec: [29, 30],
  minutes: 10,
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Reading material graphs',
      body: 'A copper wire is stretched until its stress is 240 MPa and its strain 5.0 × 10⁻³. Then the load is taken off.',
      fig: loop(),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: 'After the load is taken off, how much of the strain is left in the wire?',
      fig: loop({ unload: 'afterCheck' }),
      options: [
        { id: 'none', label: 'None: it returns to its original length' },
        { id: 'springy', label: EPS(X.hook.springy) },
        { id: 'right', label: EPS(X.hook.right), correct: true },
        { id: 'all', label: `${EPS(X.hook.all)}, all of it` },
      ],
      after: "Let's find out",
    },
    {
      id: 'elastic',
      kind: 'text',
      body: [
        'A material is **elastic** if it returns to its original length when the load is removed, and **plastic** if some extension stays.',
        'The line is straight up to the **limit of proportionality**. The **elastic limit** comes just after: beyond it, part of the strain is permanent.',
      ],
      card: { term: 'Elastic and plastic', text: 'Elastic: springs back completely. Plastic: some strain is permanent. The elastic limit is the boundary.' },
    },
    {
      id: 'points',
      kind: 'text',
      body: ['P proportionality limit, E elastic limit, Y yield, U ultimate tensile stress, B break.'],
      fig: sketch(),
    },
    {
      id: 'elastic-limit',
      kind: 'tapFig',
      prompt: 'Which point is the elastic limit, the last one the wire still springs back from?',
      instruction: 'Tap the letter of the elastic limit.',
      fig: sketch({ targets: true }),
      options: [
        { id: 'P', label: 'Point P', hint: 'P is where the line stops being straight: the limit of proportionality.' },
        { id: 'E', label: 'Point E', correct: true },
        { id: 'Y', label: 'Point Y', hint: 'Y is the yield point, past the elastic limit: the wire gives.' },
        { id: 'U', label: 'Point U', hint: 'U is the greatest stress. The wire is well into plastic stretching.' },
        { id: 'B', label: 'Point B', hint: 'B is where the wire breaks.' },
      ],
      why: 'The line stops being straight at P, but the wire still springs back until E. After E some strain is permanent.',
    },
    {
      id: 'uts',
      kind: 'tapFig',
      prompt: 'Which point is the ultimate tensile stress, the greatest stress the wire carries?',
      instruction: 'Tap the letter of the greatest stress.',
      fig: sketch({ targets: true }),
      options: [
        { id: 'P', label: 'Point P', hint: 'P is early in the curve. The stress goes on rising.' },
        { id: 'E', label: 'Point E', hint: 'E is the elastic limit. The stress goes on rising.' },
        { id: 'Y', label: 'Point Y', hint: 'Y is the yield point. The stress still rises later.' },
        { id: 'U', label: 'Point U', correct: true },
        { id: 'B', label: 'Point B', hint: 'The stress has already fallen at B, where the wire breaks.' },
      ],
      why: 'The stress peaks at U, the ultimate tensile stress. A ductile wire then thins in one place and breaks at B under less stress.',
    },
    {
      id: 'release',
      kind: 'explore',
      instruction: 'Drag the slider to choose how far the wire is stretched, then see it released.',
      fig: loop({ unload: true }),
      slider: { min: 0, max: EXPLORE.max, step: 0.5, tick: 1, label: 'Strain reached before release', unit: '× 10⁻³', symbol: 'ε', dp: 1, start: 3 },
      question: {
        prompt: 'Released from beyond the elastic limit, how does the wire come back?',
        options: [
          { id: 'right', label: 'Along a line parallel to the straight part', correct: true },
          { id: 'retrace', label: 'Back along the same curve', hint: 'Then no strain would be permanent. The curve is not retraced.' },
          { id: 'vertical', label: 'Straight down: the strain stays the same', hint: 'The stress and the strain both fall: the elastic part springs back.' },
        ],
        right: 'Right: the unloading line is parallel to the straight part, with slope E. Only σ ÷ E springs back.',
      },
    },
    {
      id: 'left',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: 'Back to the copper wire, 1.50 m long. After release, how much longer is it than before?',
      fig: loop({ unload: 'afterCheck' }),
      options: [
        { id: 'zero', label: `0 mm: it springs back completely`, hint: 'Past the elastic limit some of the strain is permanent.' },
        { id: 'springy', label: MM(X.left.springy), hint: 'That is the part that springs back: 2.0 × 10⁻³ of 1.50 m.' },
        { id: 'right', label: MM(X.left.right), correct: true },
        { id: 'all', label: MM(X.left.all), hint: 'That is the whole stretch at 240 MPa. Part of it springs back.' },
      ],
      why: `It springs back σ ÷ E = ${EPS(back)} along a parallel line; ${EPS(perm)} stays: ${EPS(perm)} × 1.50 m = ${MM(X.left.right)}.`,
    },
    {
      id: 'ductile',
      kind: 'text',
      body: [
        '**Ductile** materials, like copper, stretch a long way past the elastic limit before they break: they can be drawn into wire.',
        '**Brittle** materials, like glass, break soon after the straight part with almost no plastic region. Brittle does not mean weak.',
      ],
      card: { term: 'Ductile and brittle', text: 'Ductile: a long plastic region. Brittle: breaks with almost none.' },
    },
    {
      id: 'brittle',
      kind: 'tapFig',
      prompt: 'Which curve is the brittle material?',
      instruction: 'Tap the letter of the brittle material.',
      fig: { kind: 'material', view: 'compare', E: E_COPPER, targets: true },
      options: [
        { id: 'A', label: 'Curve A', hint: 'A has a long plastic region before it breaks: a ductile metal.' },
        { id: 'B', label: 'Curve B', correct: true },
        { id: 'C', label: 'Curve C', hint: 'C stretches a long way before it breaks: soft and ductile.' },
      ],
      why: 'B is straight almost to the break, with no plastic region: it fractures suddenly. That is brittle.',
    },
    {
      id: 'load',
      kind: 'choice',
      prompt: 'A copper wire 0.80 mm across has an ultimate tensile stress of 340 MPa. What is the largest force it can carry?',
      options: [
        { id: 'radius', label: NEWTON(X.load.radius), hint: 'That uses 0.80 mm as the radius. It is the diameter.' },
        { id: 'noPi', label: NEWTON(X.load.noPi), hint: 'That forgets π: A = πd² ÷ 4, not d².' },
        { id: 'right', label: NEWTON(X.load.right), correct: true },
        { id: 'mm2', label: NEWTON(X.load.mm2), hint: 'That leaves A in mm². 1 mm² is 10⁻⁶ m².' },
      ],
      why: `A = π(0.40 × 10⁻³)² = 5.03 × 10⁻⁷ m². F = stress × area = 340 × 10⁶ × 5.03 × 10⁻⁷ = ${NEWTON(X.load.right)}.`,
    },
    {
      id: 'rules',
      kind: 'text',
      body: [
        'The line is straight to the **limit of proportionality**; past the **elastic limit** some strain stays. Unloading runs **parallel** to the straight part.',
        'The greatest stress is the **ultimate tensile stress**. Ductile materials have a long plastic region, brittle ones almost none.',
      ],
    },
  ],
  skillCheck: [
    {
      id: 'beyond',
      kind: 'choice',
      prompt: 'A wire is stretched beyond its elastic limit and the load is removed. What happens to its length?',
      options: [
        { id: 'back', label: 'It returns exactly to its original length' },
        { id: 'limit', label: 'It returns to its length at the limit of proportionality' },
        { id: 'right', label: 'It stays longer than it was at the start', correct: true },
        { id: 'breaks', label: 'It breaks as the load is removed' },
      ],
      why: 'Past the elastic limit part of the strain is plastic. The unloading line meets the axis at a permanent strain.',
    },
    {
      id: 'permanent',
      kind: 'choice',
      prompt: 'A 2.0 m wire is loaded to a stress of 300 MPa and a strain of 4.0 × 10⁻³, then released. E = 1.2 × 10¹¹ Pa. How much longer is it?',
      options: [
        { id: 'zero', label: '0 mm' },
        { id: 'springy', label: MM(X.permanent.springy) },
        { id: 'right', label: MM(X.permanent.right), correct: true },
        { id: 'all', label: MM(X.permanent.all) },
      ],
      why: `It springs back σ ÷ E = ${EPS(skillBack)}. The permanent strain is ${EPS(SKILL.eps)} − ${EPS(skillBack)} = ${EPS(skillPerm)}: ${EPS(skillPerm)} × 2.0 m = ${MM(X.permanent.right)}.`,
    },
    {
      id: 'describe',
      kind: 'choice',
      prompt: 'Which is the best description of a ductile material?',
      options: [
        { id: 'weak', label: 'A material with a low breaking stress' },
        { id: 'right', label: 'It has a large plastic region before it breaks', correct: true },
        { id: 'elastic', label: 'A material that always springs back' },
        { id: 'small', label: 'It breaks soon after the elastic limit' },
      ],
      why: 'Ductile materials stretch a long way plastically, so they can be drawn into wires. Breaking soon after the elastic limit is brittle.',
    },
    {
      id: 'thick',
      kind: 'choice',
      prompt: 'Wire P, of copper, breaks at 170 N. Wire Q is the same copper, with twice the diameter. What force breaks Q?',
      options: [
        { id: 'twice', label: NEWTON(X.thick.twice) },
        { id: 'same', label: NEWTON(X.thick.same) },
        { id: 'right', label: NEWTON(X.thick.right), correct: true },
        { id: 'eight', label: NEWTON(X.thick.eight) },
      ],
      why: 'The same material breaks at the same stress. Twice the diameter is 4 times the area, so 4 times the force: 680 N.',
    },
  ],
  youCanNow: [
    'Name the points on a stress–strain graph',
    'Find the permanent strain after a load is removed',
    'Tell ductile from brittle, and find a wire’s largest load',
  ],
  recap: {
    fig: loop({ unload: true }),
    text: `Stretched to ${EPS(WIRE.reach)}, the wire comes back along a parallel line: ${EPS(back)} springs back and ${EPS(perm)} stays.`,
  },
  card: {
    formula: 'unloading ∥ loading',
    idea: 'Past the elastic limit a wire unloads along a parallel line: some strain stays, permanently.',
  },
};
