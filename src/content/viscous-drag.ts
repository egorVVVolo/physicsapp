// Lesson "Viscous drag" — laminar and turbulent flow, Stokes' law F = 6πηrv, the falling-ball method, and viscosity
// falling as a liquid warms (WPH11 points 25, 26). The puzzle: two steel balls, 2.0 mm and 4.0 mm across, sink through
// glycerol; the small one at a steady 1.01 cm s⁻¹. The big one? Four times as fast, 4.04 cm s⁻¹: it is 8 times as heavy
// (and gets 8 times the upthrust), so it needs 8 times the drag, and F = 6πηrv has only r in it, not r³.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { fixed, sci, sig } from '../physics/format.ts';
import { G } from '../physics/kinematics.ts';
import { glycerolViscosity, RHO_GLYCEROL, RHO_STEEL, sphereUpthrust, sphereWeight, stokesDrag, stokesTerminal, turbulentTerminal, viscosityFromFall, viscosityFromForces } from '../physics/viscosity.ts';
import type { FlowFig, Lesson, TubeFig } from './types.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const N = (x: number): string => `${sci(x)}${NB}N`;
const CMS = (v: number): string => `${sig(v * 100)}${NB}cm${NB}s⁻¹`;
const PAS = (x: number): string => `${sig(x)}${NB}Pa${NB}s`;

export const BALLS = { small: 1.0e-3, big: 2.0e-3 }; // radii, m
export const TEMP = 20; // °C, the lab
export const LAB = { gap: 0.1, time: 9.89 }; // m between the rubber bands, s the small ball takes
export const WARM = { min: 10, max: 40, to: 30 }; // °C, the explore's slider
// Skill check.
export const GLASS = { rho: 2500 }; // kg m⁻³
export const BUBBLE = { r: 0.5e-3, rho: 1.2 }; // m, kg m⁻³ (air)
export const CASTOR = { r: 1.5e-3, rho: 960, v: 0.034 }; // m, kg m⁻³, m s⁻¹

const eta = glycerolViscosity(TEMP);
const W = sphereWeight(BALLS.small, RHO_STEEL);
const U = sphereUpthrust(BALLS.small, RHO_GLYCEROL);
const v1 = stokesTerminal(BALLS.small, RHO_STEEL, RHO_GLYCEROL, eta);
const v2 = stokesTerminal(BALLS.big, RHO_STEEL, RHO_GLYCEROL, eta);
const F = stokesDrag(eta, BALLS.small, v1);
const vLab = LAB.gap / LAB.time;
const vWater = turbulentTerminal(BALLS.small, RHO_STEEL, 1000);
const glassV = stokesTerminal(BALLS.small, GLASS.rho, RHO_GLYCEROL, eta);

/** Answers and named mistakes, used by the screens and re-checked by viscous-drag.test.ts. */
export const ANSWERS = {
  balance: { W, U, F },
  /** The lab: η from the forces and the timed speed (W and U as written on the sheet, to 3 s.f.). */
  lab: { right: viscosityFromForces(W, U, BALLS.small, vLab), diameter: viscosityFromForces(W, U, 2 * BALLS.small, vLab), noUpthrust: viscosityFromForces(W, 0, BALLS.small, vLab), cm: viscosityFromForces(W, U, BALLS.small, vLab * 100) },
  heavier: { ratio: sphereWeight(BALLS.big, RHO_STEEL) / W, W2: sphereWeight(BALLS.big, RHO_STEEL) },
  /** The puzzle: the big ball's terminal velocity. */
  puzzle: { right: v2, same: v1, twice: 2 * v1, eight: 8 * v1 },
  warm: { eta: glycerolViscosity(WARM.to), v: stokesTerminal(BALLS.small, RHO_STEEL, RHO_GLYCEROL, glycerolViscosity(WARM.to)) },
  glass: { right: glassV, noUpthrust: v1 * (GLASS.rho / RHO_STEEL), same: v1, upside: v1 * ((RHO_STEEL - RHO_GLYCEROL) / (GLASS.rho - RHO_GLYCEROL)) },
  bubble: { v: stokesTerminal(BUBBLE.r, BUBBLE.rho, RHO_GLYCEROL, eta) },
  castor: {
    right: viscosityFromFall(CASTOR.r, RHO_STEEL, CASTOR.rho, CASTOR.v),
    noUpthrust: viscosityFromFall(CASTOR.r, RHO_STEEL, 0, CASTOR.v),
    diameter: viscosityFromFall(2 * CASTOR.r, RHO_STEEL, CASTOR.rho, CASTOR.v),
    cm: viscosityFromFall(CASTOR.r, RHO_STEEL, CASTOR.rho, CASTOR.v * 100),
  },
};
const X = ANSWERS;

const tube = (over: Partial<TubeFig>): TubeFig => ({ kind: 'tube', balls: [BALLS.small, BALLS.big], rho: RHO_STEEL, T: TEMP, panel: 'speeds', ...over });
const flow: FlowFig = { kind: 'flow', r: BALLS.small, rho: RHO_STEEL, T: TEMP };

export const viscousDrag: Lesson = {
  id: 'viscosity',
  title: 'Viscous drag',
  spec: [25, 26],
  minutes: 11,
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
      id: 'balance',
      kind: 'choice',
      prompt: 'The small ball sinks at a steady speed. Which is true of the viscous drag F on it?',
      fig: tube({ balls: [BALLS.small], panel: 'forces', ask: 'afterCheck', play: true }),
      options: [
        { id: 'none', label: 'F = 0: at a steady speed no force is needed', hint: 'Its weight still pulls it down. Something must balance it.' },
        { id: 'weight', label: 'F = W', hint: 'The glycerol also pushes up: the upthrust U helps hold the ball.' },
        { id: 'right', label: 'F = W − U', correct: true },
        { id: 'plus', label: 'F = W + U', hint: 'U points up, like F. Together they balance W.' },
      ],
      why: `A steady speed means no resultant force: U + F = W. So F = ${sci(W)} − ${sci(U)} = ${N(F)}.`,
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
      kind: 'choice',
      prompt: `The small ball, r = 1.0 mm, takes ${fixed(LAB.time, 2)} s to sink between the rubber bands, 10.0 cm apart. What is the viscosity of the glycerol?`,
      fig: tube({ balls: [BALLS.small], panel: 'timing', play: true }),
      options: [
        { id: 'diameter', label: PAS(X.lab.diameter), hint: 'That uses the diameter, 2.0 mm. Stokes’ law needs the radius.' },
        { id: 'right', label: PAS(X.lab.right), correct: true },
        { id: 'noUpthrust', label: PAS(X.lab.noUpthrust), hint: 'That uses F = W. The drag is only W − U: the upthrust helps.' },
        { id: 'cm', label: PAS(X.lab.cm), hint: `That uses v in cm s⁻¹. Work in metres: v = 0.100 ÷ ${fixed(LAB.time, 2)} m s⁻¹.` },
      ],
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
      body: [
        '**Stokes’ law** for a small, slow sphere in laminar flow: F = 6πηrv. At terminal velocity W = U + F, so timing a ball gives η.',
        'Viscosity falls as a liquid warms. That is the end of Fluids. Next: how materials stretch, starting with springs.',
      ],
    },
  ],
  skillCheck: [
    {
      id: 'glass',
      kind: 'choice',
      prompt: `A glass bead the size of the small ball, density ${GLASS.rho} kg m⁻³, is dropped into the same glycerol. What is its terminal velocity?`,
      options: [
        { id: 'noUpthrust', label: CMS(X.glass.noUpthrust) },
        { id: 'right', label: CMS(X.glass.right), correct: true },
        { id: 'same', label: CMS(X.glass.same) },
        { id: 'upside', label: CMS(X.glass.upside) },
      ],
      why: `v grows with ρ − ρ(glycerol): ${CMS(v1)} × (${GLASS.rho} − ${RHO_GLYCEROL}) ÷ (${RHO_STEEL} − ${RHO_GLYCEROL}) = ${CMS(X.glass.right)}.`,
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
      id: 'turbulent',
      kind: 'choice',
      prompt: 'A student times a 2.0 cm steel ball falling through water and uses F = 6πηrv to find η. Why is the result wrong?',
      options: [
        { id: 'upthrust', label: 'Stokes’ law leaves out the upthrust' },
        { id: 'right', label: 'The flow round the ball is turbulent', correct: true },
        { id: 'thin', label: 'Water is too runny to have a viscosity' },
        { id: 'steady', label: 'The ball never reaches a steady speed' },
      ],
      why: 'A big ball dropping fast through a runny liquid leaves eddies behind it. Stokes’ law holds only for small, slow spheres in laminar flow.',
    },
    {
      id: 'castor',
      kind: 'choice',
      prompt: `A steel ball of diameter 3.0 mm falls at a steady ${fixed(CASTOR.v * 100, 1)} cm s⁻¹ through castor oil of density ${CASTOR.rho} kg m⁻³. What is the oil’s viscosity?`,
      options: [
        { id: 'noUpthrust', label: PAS(X.castor.noUpthrust) },
        { id: 'right', label: PAS(X.castor.right), correct: true },
        { id: 'diameter', label: PAS(X.castor.diameter) },
        { id: 'cm', label: PAS(X.castor.cm) },
      ],
      why: `η = 2r²(ρ − ρ(oil))g ÷ 9v = 2 × (1.5 × 10⁻³)² × ${RHO_STEEL - CASTOR.rho} × ${G} ÷ (9 × ${CASTOR.v}) = ${PAS(X.castor.right)}.`,
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
