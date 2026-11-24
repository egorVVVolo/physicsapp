// Lesson "Viscous drag" — laminar and turbulent flow, Stokes' law F = 6πηrv, the falling-ball method, and viscosity
// falling as a liquid warms (WPH11 points 25, 26). The puzzle: two steel balls, 2.0 mm and 4.0 mm across, sink through
// glycerol; the small one at a steady 1.01 cm s⁻¹. The big one? Four times as fast, 4.04 cm s⁻¹: it is 8 times as heavy
// (and gets 8 times the upthrust), so it needs 8 times the drag, and F = 6πηrv has only r in it, not r³.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
// Format v3 (V2 task D11): build, sort, order, graphPick; the Skill check ends on an exam-style card.
import { fixed, sci, sig } from '../physics/format.ts';
import { G } from '../physics/kinematics.ts';
import { glycerolViscosity, RHO_GLYCEROL, RHO_STEEL, sphereUpthrust, sphereWeight, stokesDrag, stokesFall, stokesTerminal, turbulentTerminal, viscosityFromFall, viscosityFromForces } from '../physics/viscosity.ts';
import type { FlowFig, Lesson, PlotFig, TubeFig } from './types.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const N = (x: number): string => `${sci(x)}${NB}N`;
const CMS = (v: number): string => `${sig(v * 100)}${NB}cm${NB}s⁻¹`;
const PAS = (x: number): string => `${sig(x)}${NB}Pa${NB}s`;
// chips are short: plain decimals, never 1.01 × 10⁻² in a chip
const NC = (x: number): string => `${fixed(x, 6)}${NB}N`;
const MM = (x: number): string => `${fixed(x, 4)}${NB}m`;
const MSI = (x: number, dp = 4): string => `${fixed(x, dp)}${NB}m${NB}s⁻¹`;
const G9 = `9.81${NB}N${NB}kg⁻¹`;
const KGM3 = (x: number): string => `${x}${NB}kg${NB}m⁻³`;

export const BALLS = { small: 1.0e-3, big: 2.0e-3 }; // radii, m
export const TEMP = 20; // °C, the lab
export const LAB = { gap: 0.1, time: 9.89 }; // m between the rubber bands, s the small ball takes
export const WARM = { min: 10, max: 40, to: 30 }; // °C, the explore's slider
export const START = { tMax: 6 }; // ms, the v–t graphs of the ball just released
// Skill check.
export const CASTOR = { r: 1.5e-3, rho: 960, v: 0.034 }; // m, kg m⁻³, m s⁻¹
export const EXAM = { r: 1.5e-3, gap: 0.1, time: 4.4 }; // the exam card's ball: m, m, s

const eta = glycerolViscosity(TEMP);
const W = sphereWeight(BALLS.small, RHO_STEEL);
const U = sphereUpthrust(BALLS.small, RHO_GLYCEROL);
const v1 = stokesTerminal(BALLS.small, RHO_STEEL, RHO_GLYCEROL, eta);
const v2 = stokesTerminal(BALLS.big, RHO_STEEL, RHO_GLYCEROL, eta);
const F = stokesDrag(eta, BALLS.small, v1);
const vLab = LAB.gap / LAB.time;
const vWater = turbulentTerminal(BALLS.small, RHO_STEEL, 1000);
const examW = sphereWeight(EXAM.r, RHO_STEEL);
const examU = sphereUpthrust(EXAM.r, RHO_GLYCEROL);
const examV = EXAM.gap / EXAM.time;

/** Answers and named mistakes, used by the screens and re-checked by viscous-drag.test.ts. */
export const ANSWERS = {
  balance: { W, U, F },
  /** The lab: η from the forces and the timed speed (W and U as written on the sheet, to 3 s.f.). */
  lab: { right: viscosityFromForces(W, U, BALLS.small, vLab), vLab, F: W - U, diameter: viscosityFromForces(W, U, 2 * BALLS.small, vLab), noUpthrust: viscosityFromForces(W, 0, BALLS.small, vLab), cm: viscosityFromForces(W, U, BALLS.small, vLab * 100) },
  heavier: { ratio: sphereWeight(BALLS.big, RHO_STEEL) / W, W2: sphereWeight(BALLS.big, RHO_STEEL) },
  /** The puzzle: the big ball's terminal velocity. */
  puzzle: { right: v2, same: v1, twice: 2 * v1, eight: 8 * v1 },
  warm: { eta: glycerolViscosity(WARM.to), v: stokesTerminal(BALLS.small, RHO_STEEL, RHO_GLYCEROL, glycerolViscosity(WARM.to)) },
  start: { tau: stokesFall(0, BALLS.small, RHO_STEEL, RHO_GLYCEROL, eta).tau, vt: v1 },
  castor: {
    right: viscosityFromFall(CASTOR.r, RHO_STEEL, CASTOR.rho, CASTOR.v),
    noUpthrust: viscosityFromFall(CASTOR.r, RHO_STEEL, 0, CASTOR.v),
    diameter: viscosityFromFall(2 * CASTOR.r, RHO_STEEL, CASTOR.rho, CASTOR.v),
    cm: viscosityFromFall(CASTOR.r, RHO_STEEL, CASTOR.rho, CASTOR.v * 100),
  },
  exam: { right: viscosityFromForces(examW, examU, EXAM.r, examV), F: examW - examU, W: examW, v: examV, diameter: viscosityFromForces(examW, examU, 2 * EXAM.r, examV) },
};
const X = ANSWERS;

const tube = (over: Partial<TubeFig>): TubeFig => ({ kind: 'tube', balls: [BALLS.small, BALLS.big], rho: RHO_STEEL, T: TEMP, panel: 'speeds', ...over });
const flow: FlowFig = { kind: 'flow', r: BALLS.small, rho: RHO_STEEL, T: TEMP };

/** One v–t curve of the small ball just released into the glycerol: the model (stokesFall) or a named mistake. */
const startGraph = (shape: 'model' | 'ramp' | 'jump'): PlotFig => {
  const vt = X.start.vt * 100; // cm s⁻¹
  const steps = START.tMax * 4;
  return {
    kind: 'plot',
    header: 'small ball just released, v against t',
    x: { label: 't / ms', max: START.tMax, tick: 1 },
    y: { label: 'v / cm s⁻¹', max: 1.2, tick: 0.2 },
    points:
      shape === 'jump'
        ? [{ x: 0, y: 0 }, { x: 0.05, y: vt }, { x: START.tMax, y: vt }]
        : Array.from({ length: steps + 1 }, (_, k) => {
            const t = k / 4; // ms
            return { x: t, y: shape === 'model' ? stokesFall(t / 1000, BALLS.small, RHO_STEEL, RHO_GLYCEROL, eta).v * 100 : (vt * t) / START.tMax };
          }),
  };
};

export const viscousDrag: Lesson = {
  id: 'viscosity',
  title: 'Viscous drag',
  spec: [25, 26],
  minutes: 11,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'Drag and flow', from: 'viscosity' },
    { title: 'Back to the tube', from: 'hook-again' },
  ],
  cast: ['Mei'],
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Viscous drag',
      body: 'Two steel balls, 2.0 mm and 4.0 mm across, are dropped into a tall tube of glycerol, a thick, clear liquid.',
      fig: tube({ ask: 'unknown' }),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: `The small ball sinks at a steady ${CMS(v1)}. How fast does the big ball sink?`,
      fig: tube({ ask: 'unknown' }),
      options: [
        { id: 'same', label: 'At the same speed' },
        { id: 'twice', label: 'Twice as fast' },
        { id: 'four', label: 'Four times as fast', correct: true },
        { id: 'eight', label: 'Eight times as fast' },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'viscosity',
      kind: 'text',
      body: [
        'A liquid’s layers drag on one another as they slide. That is its **viscosity**, η, in Pa s: water 0.0010 Pa s, honey about 10 Pa s.',
        'A body moving through a fluid drags the layers next to it, and they drag back: **viscous drag**, against the motion. The faster, the bigger.',
      ],
      card: { term: 'Viscosity', text: 'How strongly a fluid’s layers drag on one another: η, in Pa s. Viscous drag acts against a body’s motion.' },
    },
    {
      id: 'terminal',
      kind: 'order',
      prompt: 'The small ball is released from rest in the glycerol. Put the steps in order: how does it reach a steady speed?',
      fig: tube({ balls: [BALLS.small], panel: 'forces', ask: 'afterCheck', play: true }),
      steps: [
        { id: 'start', text: 'At first the weight W is the main force, so the ball speeds up.' },
        { id: 'grows', text: 'As it speeds up, the viscous drag F grows.' },
        { id: 'shrinks', text: 'The resultant W − U − F shrinks, so the acceleration falls.' },
        { id: 'steady', text: 'When F = W − U the resultant is zero: a steady speed.' },
      ],
      hint: 'First the weight acts alone, then the drag grows, then the two balance.',
      why: `A steady speed means no resultant force: U + F = W. So F = ${sci(W)} − ${sci(U)} = ${N(F)}.`,
    },
    {
      id: 'vt-graph',
      kind: 'graphPick',
      prompt: 'Which graph shows the small ball’s speed in the first few milliseconds after it is released?',
      graphs: [
        { id: 'A', fig: startGraph('model'), correct: true },
        { id: 'B', fig: startGraph('ramp'), hint: 'A straight line is a steady acceleration. But the drag grows with speed.' },
        { id: 'C', fig: startGraph('jump'), hint: 'The ball cannot reach its speed at once: it has to accelerate from rest.' },
      ],
      why: `It speeds up fast, then levels off as the drag grows: within about ${sig(4 * X.start.tau * 1000, 2)} ms it is at ${CMS(v1)}. It reaches that speed almost at once.`,
    },
    {
      id: 'flow',
      kind: 'text',
      body: [
        'In **laminar flow** a fluid moves in smooth layers. Each bit of it follows a **streamline**, and streamlines never cross.',
        'In **turbulent flow** the layers break up into swirling eddies and the streamlines tangle. Big, fast bodies in runny fluids make it.',
      ],
      card: { term: 'Laminar flow', text: 'Smooth layers of fluid: the streamlines never cross. Turbulent flow: eddies, and the streamlines mix.' },
    },
    {
      id: 'flow-sort',
      kind: 'sort',
      prompt: 'Is the flow laminar or turbulent in each of these?',
      bins: [
        { id: 'laminar', label: 'Laminar' },
        { id: 'turbulent', label: 'Turbulent' },
      ],
      items: [
        { id: 'honey', label: 'Honey creeping off a spoon', bin: 'laminar', hint: 'Slow and very viscous: smooth layers.' },
        { id: 'waterfall', label: 'Water crashing down a waterfall', bin: 'turbulent', hint: 'Fast and runny: it churns into eddies.' },
        { id: 'smoke', label: 'Thin smoke rising from incense', bin: 'laminar', hint: 'A smooth, thin stream, at least near the stick.' },
        { id: 'boat', label: 'Water swirling behind a fast boat', bin: 'turbulent', hint: 'Swirls and eddies: turbulent.' },
        { id: 'oil', label: 'Oil poured slowly from a bottle', bin: 'laminar', hint: 'Slow and viscous: smooth layers.' },
        { id: 'lorry', label: 'Air churning behind a lorry at speed', bin: 'turbulent', hint: 'Big, fast and runny: eddies.' },
      ],
      why: 'Slow, small, viscous: laminar. Big, fast, runny: turbulent, with eddies behind.',
    },
    {
      id: 'flowTap',
      kind: 'tapFig',
      prompt: 'The same steel ball sinks through glycerol and through water. Around which ball is the flow laminar?',
      instruction: 'Tap the ball with laminar flow around it.',
      fig: flow,
      options: [
        { id: 'glycerol', label: 'The ball in glycerol', correct: true },
        { id: 'water', label: 'The ball in water', hint: 'Behind it the water curls into eddies: that is turbulent flow.' },
      ],
      why: `In glycerol it creeps at ${CMS(v1)} and the streamlines slide smoothly round it. In water it drops at ${sig(vWater * 100, 2)} cm s⁻¹ and leaves eddies behind.`,
    },
    {
      id: 'stokes',
      kind: 'text',
      body: [
        'For a small sphere moving slowly, in laminar flow, the drag is given by **Stokes’ law**: F = 6πηrv, with r the radius and v the speed.',
        'It fails for big or fast bodies, where the flow turns turbulent. So in the lab we time small balls in a very viscous liquid.',
      ],
      card: { term: 'Stokes’ law', text: 'F = 6πηrv: the drag on a small sphere moving slowly, in laminar flow. r is the radius, not the diameter.' },
    },
    {
      id: 'lab',
      kind: 'build',
      prompt: `The small ball, r = 1.0 mm, takes ${fixed(LAB.time, 2)} s to sink between the rubber bands, 10.0 cm apart. Build the viscosity of the glycerol.`,
      fig: tube({ balls: [BALLS.small], panel: 'timing', play: true }),
      equation: 'η = {F} ÷ (6π × {r} × {v})',
      boxes: { F: 'drag', r: 'radius', v: 'speed' },
      chips: [
        { id: 'drag', label: NC(X.lab.F) },
        { id: 'radius', label: MM(BALLS.small) },
        { id: 'speed', label: MSI(vLab) },
        { id: 'diameter', label: MM(2 * BALLS.small), hint: 'That is the diameter, 2.0 mm. Stokes’ law needs the radius.' },
        { id: 'weight', label: NC(W), hint: 'That is the weight. The drag is only W − U: the upthrust helps.' },
        { id: 'cm', label: `${sig(vLab * 100)}${NB}cm${NB}s⁻¹`, hint: 'Work in metres: v is in m s⁻¹.' },
      ],
      result: { symbol: 'η', value: X.lab.right, unit: 'Pa s' },
      why: `v = 0.100 ÷ ${fixed(LAB.time, 2)} = ${sci(vLab)} m s⁻¹ and F = W − U = ${N(F)}. So η = F ÷ 6πrv = ${PAS(X.lab.right)}.`,
    },
    {
      id: 'heavier',
      kind: 'choice',
      prompt: 'The big ball is twice as wide as the small one. How many times heavier is it?',
      fig: tube({ panel: 'weights', ask: 'afterCheck' }),
      options: [
        { id: 'twice', label: 'Twice as heavy', hint: 'It is twice as wide, twice as tall and twice as deep.' },
        { id: 'four', label: '4 times as heavy', hint: 'That is how its area grows, r². Weight goes with volume, r³.' },
        { id: 'right', label: '8 times as heavy', correct: true },
      ],
      why: `Volume grows as r³: 2³ = 8, so W = ${N(X.heavier.W2)}. The upthrust is 8 times as big too, so W − U, the drag it needs, is 8 times as big.`,
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Back to the tube. The small ball sinks at a steady ${CMS(v1)}. How fast does the big ball sink?`,
      fig: tube({ ask: 'afterCheck', play: 'afterCheck' }),
      options: [
        { id: 'same', label: `${CMS(X.puzzle.same)}: the same speed`, hint: 'It needs 8 times the drag. At the same speed, twice the r gives only twice.' },
        { id: 'twice', label: `${CMS(X.puzzle.twice)}: twice as fast`, hint: 'Twice the r and twice the v give 4 times the drag. It needs 8.' },
        { id: 'right', label: CMS(X.puzzle.right), correct: true },
        { id: 'eight', label: `${CMS(X.puzzle.eight)}: 8 times as fast`, hint: 'F = 6πηrv: r has doubled too, so 4 times the speed is enough.' },
      ],
      why: `It needs 8 times the drag. In F = 6πηrv, r is twice as big, so v must be 4 times as big: 4 × ${sig(v1 * 100)} = ${CMS(X.puzzle.right)}.`,
    },
    {
      id: 'warm',
      kind: 'explore',
      instruction: 'Drag the slider to warm or cool the glycerol. Watch its viscosity and the ball.',
      fig: tube({ balls: [BALLS.small], panel: 'warm' }),
      slider: { min: WARM.min, max: WARM.max, step: 1, tick: 5, label: 'Temperature of the glycerol', unit: '°C', symbol: 'T', dp: 0, start: TEMP },
      question: {
        prompt: `On a warm day the lab is at ${WARM.to} °C instead of ${TEMP} °C. What happens to the ball?`,
        options: [
          { id: 'right', label: 'It sinks faster: warm glycerol is less viscous', correct: true },
          { id: 'slower', label: 'It sinks more slowly: warm liquids are thicker', hint: 'Watch η as the slider goes right: it falls.' },
          { id: 'same', label: 'No change: a liquid’s viscosity is fixed', hint: 'Watch η: it changes a lot with temperature.' },
        ],
        right: `Right: η falls from ${PAS(eta)} to ${PAS(X.warm.eta)}, and the ball sinks at ${CMS(X.warm.v)}. Always note the temperature when you measure η.`,
      },
    },
    {
      id: 'rules',
      kind: 'text',
      body: ['F = 6πηrv for a small, slow sphere. At a steady speed W = U + F.'],
      fig: tube({ at: 5 }),
    },
  ],
  skillCheck: [
    {
      id: 'castor',
      kind: 'build',
      prompt: `A steel ball of diameter 3.0 mm falls at a steady ${fixed(CASTOR.v * 100, 1)} cm s⁻¹ through castor oil of density ${CASTOR.rho} kg m⁻³. Build the oil’s viscosity.`,
      equation: 'η = 2 × {r}² × ({ρ₁} − {ρ₂}) × {g} ÷ (9 × {v})',
      boxes: { r: 'radius', 'ρ₁': 'steel', 'ρ₂': 'oil', g: 'field', v: 'speed' },
      chips: [
        { id: 'radius', label: MM(CASTOR.r) },
        { id: 'steel', label: KGM3(RHO_STEEL) },
        { id: 'oil', label: KGM3(CASTOR.rho) },
        { id: 'field', label: G9 },
        { id: 'speed', label: MSI(CASTOR.v, 3) },
        { id: 'diameter', label: MM(2 * CASTOR.r), hint: 'That is the diameter, 3.0 mm. The equation needs the radius.' },
        { id: 'cm', label: `${fixed(CASTOR.v * 100, 1)}${NB}cm${NB}s⁻¹`, hint: 'Work in metres: v is in m s⁻¹.' },
      ],
      result: { symbol: 'η', value: X.castor.right, unit: 'Pa s' },
      why: `η = 2r²(ρ − ρ(oil))g ÷ 9v = 2 × (1.5 × 10⁻³)² × ${RHO_STEEL - CASTOR.rho} × ${G} ÷ (9 × ${CASTOR.v}) = ${PAS(X.castor.right)}.`,
    },
    {
      id: 'stokes-sort',
      kind: 'sort',
      prompt: 'Does Stokes’ law, F = 6πηrv, apply to each of these?',
      bins: [
        { id: 'applies', label: 'Applies' },
        { id: 'fails', label: 'Does not' },
      ],
      items: [
        { id: 'bead', label: 'A 1 mm bead creeping through treacle', bin: 'applies', hint: 'Small, slow, very viscous: laminar flow.' },
        { id: 'cricket', label: 'A cricket ball falling through air', bin: 'fails', hint: 'Big and fast in a runny fluid: turbulent.' },
        { id: 'dust', label: 'A tiny dust grain settling in oil', bin: 'applies', hint: 'Tiny and slow: the flow stays laminar.' },
        { id: 'water', label: 'A 2 cm steel ball dropped in water', bin: 'fails', hint: 'Big, fast, runny water: eddies form.' },
        { id: 'oil', label: 'A 2 mm ball sinking slowly in glycerol', bin: 'applies', hint: 'Small and slow in a viscous liquid: laminar.' },
        { id: 'diver', label: 'A skydiver falling through the air', bin: 'fails', hint: 'Huge and fast: turbulent flow.' },
      ],
      why: 'Stokes’ law holds for small spheres moving slowly through a viscous fluid, where the flow is laminar. Big, fast bodies make eddies.',
    },
    {
      id: 'bubble',
      kind: 'choice',
      prompt: 'A small air bubble rises at a steady speed through glycerol. Which equation describes the forces on it?',
      options: [
        { id: 'dragUp', label: 'W = U + F' },
        { id: 'noDrag', label: 'U = W' },
        { id: 'right', label: 'U = W + F', correct: true },
        { id: 'sum', label: 'F = W + U' },
      ],
      why: 'The bubble moves up, so the drag acts down. At a steady speed the upthrust balances the weight and the drag together.',
    },
    {
      id: 'fall-method',
      kind: 'examCard',
      context: `Mei finds the viscosity of glycerol. A steel ball, radius ${fixed(EXAM.r * 1000, 1)} mm, is released at the surface. It takes ${fixed(EXAM.time, 2)} s to pass two marks ${fixed(EXAM.gap * 100, 1)} cm apart, set well below the surface. Take g = 9.81 N kg⁻¹.`,
      parts: [
        {
          id: 'a',
          command: 'Explain',
          text: 'why the marks are set well below the surface.',
          marks: 2,
          kind: 'order',
          steps: [
            { id: 'rest', text: 'The ball is released from rest at the surface.' },
            { id: 'speeds', text: 'It speeds up until the drag balances W − U.' },
            { id: 'steady', text: 'Only then does it sink at a steady speed.' },
            { id: 'marks', text: 'So the marks go lower: v = distance ÷ time is then the terminal velocity.' },
          ],
          why: 'v = distance ÷ time gives the terminal velocity only where the speed is steady. Near the surface the ball is still speeding up.',
        },
        {
          id: 'b',
          command: 'Calculate',
          text: 'the viscosity of the glycerol.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'η = {F} ÷ (6π × {r} × {v})',
            boxes: { F: 'drag', r: 'radius', v: 'speed' },
            chips: [
              { id: 'drag', label: NC(X.exam.F) },
              { id: 'radius', label: MM(EXAM.r) },
              { id: 'speed', label: MSI(X.exam.v) },
              { id: 'weight', label: NC(X.exam.W), hint: 'That is the weight. The drag is W − U: the upthrust helps.' },
              { id: 'diameter', label: MM(2 * EXAM.r), hint: 'That is the diameter, 3.0 mm. Stokes’ law needs the radius.' },
            ],
            result: { symbol: 'η', value: X.exam.right, unit: 'Pa s' },
          },
          why: `v = ${fixed(EXAM.gap, 2)} ÷ ${fixed(EXAM.time, 2)} = ${sci(X.exam.v)} m s⁻¹ and F = W − U = ${N(X.exam.F)}. So η = F ÷ 6πrv = ${PAS(X.exam.right)}.`,
        },
      ],
    },
  ],
  youCanNow: [
    'Describe laminar and turbulent flow, with streamlines',
    'Use Stokes’ law, F = 6πηrv, and say when it applies',
    'Balance weight, upthrust and drag at terminal velocity',
    'Find a viscosity by timing a falling ball',
  ],
  recap: {
    fig: tube({ at: 5 }),
    text: `Twice as wide: 8 times the weight, but only twice the drag at the same speed. So the big ball sinks 4 times as fast: ${CMS(v2)}.`,
  },
  card: {
    formula: 'F = 6πηrv',
    idea: 'Viscous drag on a small, slow sphere in laminar flow. At terminal velocity, W = U + F.',
  },
};
