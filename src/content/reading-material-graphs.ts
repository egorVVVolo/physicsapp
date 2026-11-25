// Lesson "Reading material graphs" — elastic and plastic behaviour, the limit of proportionality, elastic limit, yield
// point, ultimate tensile stress, ductile and brittle (WPH11 points 29–30). The puzzle: a copper wire is stretched to
// 240 MPa and a strain of 5.0 × 10⁻³, then the load is taken off. How much strain is left? 3.0 × 10⁻³: it does not
// retrace its curve, it unloads along a line parallel to the straight part, so only σ ÷ E = 2.0 × 10⁻³ springs back.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
// Format v3 (V2 task D12): sort, estimate, graphPick, build; the Skill check ends on an exam-style card.
import { fixed, sci, sig } from '../physics/format.ts';
import { breakingForce, COPPER, E_COPPER, elasticRecovery, loadingStress, permanentStrain } from '../physics/materials.ts';
import type { Lesson, MaterialFig, PlotFig } from './types.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const EPS = (x: number): string => `${fixed(x * 1e3, 1)} × 10⁻³`;
const MM = (x: number): string => `${fixed(x * 1e3, 2)}${NB}mm`;
const NEWTON = (F: number): string => (F >= 1e5 ? `${sci(F)}${NB}N` : `${sig(F)}${NB}N`);
const PA = (x: number): string => `${sci(x)}${NB}Pa`;
const MT = (x: number): string => `${fixed(x, 5)}${NB}m`; // a chip: plain decimals, at most 14 characters

export const WIRE = { L: 1.5, reach: 5.0e-3 }; // m, the strain reached; the stress there is COPPER.endStress
export const EXPLORE = { max: 5 }; // 10⁻³, the slider
export const LOAD = { uts: 340e6, d: 0.8e-3 }; // Pa, m
// Skill check.
export const BREAK = { uts: 340e6, d: 0.6e-3 }; // Pa, m: another wire of the same copper
export const UNLOAD = { reach: 3.5e-3 }; // the strain the graph pick's wire is stretched to
export const EXAM = { L: 2.0, sigma: 300e6, eps: 4.0e-3 }; // m, Pa, no unit

const sigma = COPPER.endStress;
const back = elasticRecovery(sigma);
const perm = permanentStrain(WIRE.reach);
const examBack = elasticRecovery(EXAM.sigma);
const examPerm = EXAM.eps - examBack;
const unloadPerm = permanentStrain(UNLOAD.reach);

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
  /** The Skill check's build: another wire's largest load. */
  breaking: { right: breakingForce(BREAK.uts, BREAK.d), radius: breakingForce(BREAK.uts, BREAK.d / 2) },
  unload: { perm: unloadPerm, stress: loadingStress(UNLOAD.reach) },
  exam: { back: examBack, perm: examPerm, ext: examPerm * EXAM.L, total: EXAM.eps },
};
const X = ANSWERS;

const loop = (over: Partial<MaterialFig> = {}): MaterialFig => ({ kind: 'material', view: 'loop', E: E_COPPER, ...over });
const sketch = (over: Partial<MaterialFig> = {}): MaterialFig => ({ kind: 'material', view: 'sketch', E: E_COPPER, ...over });

/** The loading curve of the copper wire up to strain `reach` (10⁻³), as points (10⁻³, MPa). */
const loadingPoints = (reach: number): { x: number; y: number }[] => {
  const yieldAt = COPPER.yieldStrain * 1e3;
  const pts = [{ x: 0, y: 0 }, { x: yieldAt, y: loadingStress(COPPER.yieldStrain) / 1e6 }];
  if (reach > yieldAt) pts.push({ x: reach, y: loadingStress(reach / 1e3) / 1e6 });
  return pts;
};

/** One graph of a copper wire loaded to UNLOAD.reach and released: the model (a parallel line) or a named mistake. */
const unloadGraph = (shape: 'parallel' | 'retrace' | 'vertical'): PlotFig => {
  const reach = UNLOAD.reach * 1e3;
  const up = loadingPoints(reach);
  const down = shape === 'parallel' ? [{ x: unloadPerm * 1e3, y: 0 }] : shape === 'vertical' ? [{ x: reach, y: 0 }] : [...up].reverse().slice(1);
  return {
    kind: 'plot',
    header: 'copper wire, loaded and released',
    x: { label: 'ε / 10⁻³', max: 6, tick: 1 },
    y: { label: 'σ / MPa', max: 300, tick: 50 },
    points: [...up, ...down],
  };
};

/** One sketched stress–strain curve for "which is brittle?": not to scale, no numbers on the axes. */
const sketchGraph = (shape: 'ductile' | 'brittle' | 'soft'): PlotFig => ({
  kind: 'plot',
  header: 'stress against strain, a sketch',
  x: { label: 'strain', max: 1, tick: 0.2 },
  y: { label: 'stress', max: 1, tick: 0.2 },
  sketch: true,
  points:
    shape === 'brittle'
      ? [{ x: 0, y: 0 }, { x: 0.3, y: 0.96 }]
      : shape === 'ductile'
        ? [{ x: 0, y: 0 }, { x: 0.12, y: 0.5 }, { x: 0.3, y: 0.78 }, { x: 0.55, y: 1 }, { x: 0.75, y: 0.95 }, { x: 0.9, y: 0.8 }]
        : [{ x: 0, y: 0 }, { x: 0.1, y: 0.18 }, { x: 0.4, y: 0.34 }, { x: 0.9, y: 0.5 }],
});

export const readingMaterialGraphs: Lesson = {
  id: 'material-graphs',
  title: 'Reading material graphs',
  spec: [29, 30],
  minutes: 10,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'Elastic and plastic', from: 'elastic' },
    { title: 'Back to the wire', from: 'hook-again' },
  ],
  cast: ['Felix'],
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
      fig: loop({ unload: 'afterCheck', play: 'afterCheck' }),
      options: [
        { id: 'none', label: 'None: it returns to its original length' },
        { id: 'springy', label: EPS(X.hook.springy) },
        { id: 'right', label: EPS(X.hook.right), correct: true },
        { id: 'all', label: `${EPS(X.hook.all)}, all of it` },
        { id: 'unsure', label: "I'm not sure" },
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
      id: 'elastic-sort',
      kind: 'sort',
      prompt: 'Is each of these elastic or plastic?',
      bins: [
        { id: 'elastic', label: 'Elastic' },
        { id: 'plastic', label: 'Plastic' },
      ],
      items: [
        { id: 'spring', label: 'A spring stretched a little, then let go', bin: 'elastic', hint: 'It returns to its original length.' },
        { id: 'clip', label: 'A paper clip bent open and left bent', bin: 'plastic', hint: 'Some of the change stays: plastic.' },
        { id: 'band', label: 'A rubber band after a small stretch', bin: 'elastic', hint: 'It snaps back to its length.' },
        { id: 'clay', label: 'Modelling clay pressed into a new shape', bin: 'plastic', hint: 'It keeps the new shape: plastic.' },
        { id: 'ruler', label: 'A steel ruler flexed slightly and released', bin: 'elastic', hint: 'It springs straight again.' },
        { id: 'wire', label: 'A wire stretched past its elastic limit', bin: 'plastic', hint: 'Past the limit some strain is permanent.' },
      ],
      why: 'Elastic: all the change goes when the load does. Plastic: some stays. The elastic limit is the boundary on the graph.',
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
      id: 'left-strain',
      kind: 'estimate',
      prompt: 'The copper wire is stretched to 240 MPa and a strain of 5.0 × 10⁻³, then released. Drag to the strain that is left in it.',
      fig: loop(),
      after: loop({ unload: true, play: true }),
      scale: { min: 0, max: 8, step: 0.5, tick: 1, unit: '× 10⁻³', symbol: 'ε', dp: 1, label: 'Strain left in the wire' },
      answer: X.hook.right * 1e3,
      tolerance: 0.5,
      why: `The wire comes back along a line parallel to the straight part. Only σ ÷ E = ${EPS(back)} springs back, so ${EPS(perm)} stays.`,
    },
    {
      id: 'hook-again',
      kind: 'build',
      prompt: 'Back to the copper wire, 1.50 m long. Build how much longer it is after release than before.',
      fig: loop({ unload: 'afterCheck', play: 'afterCheck' }),
      equation: 'Δx = {ε} × {L}',
      boxes: { 'ε': 'left', L: 'length' },
      chips: [
        { id: 'left', label: EPS(perm) },
        { id: 'length', label: `${fixed(WIRE.L, 2)}${NB}m` },
        { id: 'springy', label: EPS(back), hint: 'That is the part that springs back. The extension left is the permanent strain.' },
        { id: 'all', label: EPS(WIRE.reach), hint: 'That is the whole strain at 240 MPa. Part of it springs back.' },
      ],
      result: { symbol: 'Δx', value: X.left.right * 1e3, unit: 'mm' },
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
      kind: 'graphPick',
      prompt: 'Which stress–strain graph is a brittle material? The three are sketches, not to scale.',
      graphs: [
        { id: 'A', fig: sketchGraph('ductile'), hint: 'A has a long plastic region before it breaks: a ductile metal.' },
        { id: 'B', fig: sketchGraph('brittle'), correct: true },
        { id: 'C', fig: sketchGraph('soft'), hint: 'C stretches a long way before it breaks: soft and ductile.' },
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
      body: ['Past the elastic limit, unloading runs parallel to the straight part.'],
      fig: loop({ unload: true }),
    },
  ],
  skillCheck: [
    {
      id: 'breaking',
      kind: 'build',
      prompt: 'Another wire of the same copper is 0.60 mm across. Its ultimate tensile stress is 340 MPa. Build the largest force it can carry.',
      equation: 'F = {σ} × π × {d}² ÷ 4',
      boxes: { 'σ': 'uts', d: 'diameter' },
      chips: [
        { id: 'uts', label: PA(BREAK.uts) },
        { id: 'diameter', label: MT(BREAK.d) },
        { id: 'radius', label: MT(BREAK.d / 2), hint: 'That is the radius. This equation has d² ÷ 4 for it.' },
        { id: 'mm', label: `${fixed(BREAK.d * 1e3, 2)}${NB}mm`, hint: 'Work in metres: 1 mm is 10⁻³ m.' },
      ],
      result: { symbol: 'F', value: X.breaking.right, unit: 'N' },
      why: `A = π(0.60 × 10⁻³)² ÷ 4 = 2.83 × 10⁻⁷ m². F = stress × area = 340 × 10⁶ × 2.83 × 10⁻⁷ = ${NEWTON(X.breaking.right)}.`,
    },
    {
      id: 'unloading',
      kind: 'graphPick',
      prompt: 'A copper wire is stretched to a strain of 3.5 × 10⁻³, past its elastic limit, then released. Which graph shows it?',
      graphs: [
        { id: 'A', fig: unloadGraph('retrace'), hint: 'Back along the same curve would leave no strain. Part is permanent.' },
        { id: 'B', fig: unloadGraph('vertical'), hint: 'Straight down means none of the strain springs back. The elastic part does.' },
        { id: 'C', fig: unloadGraph('parallel'), correct: true },
      ],
      why: `The unloading line is parallel to the straight part. The stress ${sig(X.unload.stress / 1e6)} MPa gives back ${EPS(elasticRecovery(X.unload.stress))}, and ${EPS(X.unload.perm)} stays.`,
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
      id: 'copper-wire',
      kind: 'examCard',
      context: `Felix loads a ${fixed(EXAM.L, 1)} m copper wire to a stress of ${PA(EXAM.sigma)} and a strain of ${EPS(EXAM.eps)}, beyond its elastic limit. He then removes the load. For copper E = 1.2 × 10¹¹ Pa.`,
      parts: [
        {
          id: 'a',
          command: 'Calculate',
          text: 'the strain that springs back when the load is removed.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'ε = {σ} ÷ {E}',
            boxes: { 'σ': 'stress', E: 'modulus' },
            chips: [
              { id: 'stress', label: PA(EXAM.sigma) },
              { id: 'modulus', label: PA(E_COPPER) },
              { id: 'total', label: EPS(EXAM.eps), hint: 'That is the total strain reached. The part that springs back is σ ÷ E.' },
            ],
            result: { symbol: 'ε', value: X.exam.back * 1e3, unit: '× 10⁻³' },
          },
          why: `It comes back along a line parallel to the straight part, with slope E: ε = σ ÷ E = ${sci(EXAM.sigma)} ÷ ${sci(E_COPPER)} = ${EPS(X.exam.back)}.`,
        },
        {
          id: 'b',
          command: 'Calculate',
          text: 'how much longer the wire is than before.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'Δx = ({ε₁} − {ε₂}) × {L}',
            boxes: { 'ε₁': 'total', 'ε₂': 'back', L: 'length' },
            chips: [
              { id: 'total', label: EPS(EXAM.eps) },
              { id: 'back', label: EPS(X.exam.back) },
              { id: 'length', label: `${fixed(EXAM.L, 1)}${NB}m` },
              { id: 'perm', label: EPS(X.exam.perm), hint: 'That is the permanent strain itself. The equation subtracts for you.' },
            ],
            result: { symbol: 'Δx', value: X.exam.ext * 1e3, unit: 'mm' },
          },
          why: `The permanent strain is ${EPS(EXAM.eps)} − ${EPS(X.exam.back)} = ${EPS(X.exam.perm)}, so the wire is ${EPS(X.exam.perm)} × ${fixed(EXAM.L, 1)} m = ${MM(X.exam.ext)} longer.`,
        },
      ],
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
