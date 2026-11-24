// Lesson "Density and upthrust" — ρ = m ÷ V, and upthrust = the weight of the fluid displaced (WPH11 points 23, 24).
// The puzzle: Sam's toy boat floats in a glass tank carrying a 0.78 kg steel block. Over the side it goes, to the bottom:
// does the level rise, fall or stay? It falls, by 1.36 cm. On board the block made the boat displace its own weight of
// water, 780 cm³; on the bottom it displaces only its own volume, 100 cm³. On the way: the block on a newtonmeter in a
// displacement can (100 cm³ overflow, upthrust 0.981 N, the reading 7.65 → 6.67 N, deeper changes nothing).
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
// Format v3 (V2 task D10): build, sort, estimate, order; the Skill check ends on an exam-style card.
import { weight } from '../physics/dynamics.ts';
import { apparentWeight, densityByWeighing, floatingDisplacement, massOf, RHO_WATER, tankLevelFall, upthrust, volumeOf } from '../physics/fluids.ts';
import { G } from '../physics/kinematics.ts';
import { fixed, sci, sig } from '../physics/format.ts';
import type { DunkFig, Lesson, TankFig } from './types.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const N = (x: number): string => `${sig(x)}${NB}N`;
const M3 = (x: number): string => `${sci(x)}${NB}m³`;
const CM3 = (x: number): string => `${sig(x * 1e6)}${NB}cm³`;
const CM = (x: number): string => `${fixed(x * 100, 2)}${NB}cm`;
const RHO = (x: number): string => `${sig(x)}${NB}kg${NB}m⁻³`;
const G9 = `9.81${NB}N${NB}kg⁻¹`;

// The steel block: 5.0 cm × 5.0 cm × 4.0 cm.
export const BLOCK = { m: 0.78, rho: 7800, h: 0.04 }; // kg, kg m⁻³, m
// The toy boat and the tank: base 25 cm × 20 cm, water up to 14.0 cm while the block is on board.
export const TANK = { boat: 0.3, area: 0.05, water: 5.92e-3 }; // kg, m², m³
export const DEPTH = { min: 0, max: 7, start: 2 }; // cm, the explore's slider: how deep the block's bottom is
export const DENSITY = { min: 1000, max: 11000 }; // kg m⁻³, the explore's slider
// Skill check.
export const BALLOON = { V: 0.012, air: 1.2, helium: 0.18 }; // m³, kg m⁻³
export const ICE = { m: 0.92, rho: 920, sea: 1030 }; // kg, kg m⁻³

const V = volumeOf(BLOCK.m, BLOCK.rho);
const W = weight(BLOCK.m);
const U = upthrust(RHO_WATER, V);
const onBoard = floatingDisplacement(BLOCK.m, RHO_WATER);
const iceBelow = floatingDisplacement(ICE.m, ICE.sea);
const iceVolume = volumeOf(ICE.m, ICE.rho);

/** Answers and named mistakes, used by the screens and re-checked by density-and-upthrust.test.ts. */
export const ANSWERS = {
  volume: { right: V, times: BLOCK.m * BLOCK.rho, upside: BLOCK.rho / BLOCK.m, gcm3: BLOCK.m / (BLOCK.rho / 1000) },
  weigh: { right: U, weight: W, mass: massOf(RHO_WATER, V), reading: apparentWeight(W, U) },
  pushed: { right: onBoard, ownVolume: V, weight: W / RHO_WATER, more: weight(BLOCK.m) },
  /** The puzzle: the level falls by (780 − 100) cm³ ÷ 500 cm². */
  puzzle: { right: tankLevelFall(BLOCK.m, BLOCK.rho, TANK.area), rise: V / TANK.area, noVolume: onBoard / TANK.area, sum: onBoard + V },
  denser: { same: tankLevelFall(BLOCK.m, RHO_WATER, TANK.area), lead: tankLevelFall(BLOCK.m, DENSITY.max, TANK.area) },
  balloon: { right: upthrust(BALLOON.air, BALLOON.V), helium: upthrust(BALLOON.helium, BALLOON.V), mass: massOf(BALLOON.air, BALLOON.V) },
  ice: { below: iceBelow, whole: iceVolume, fraction: iceBelow / iceVolume, fresh: floatingDisplacement(ICE.m, RHO_WATER) },
};
const X = ANSWERS;

const tank = (over: Partial<TankFig>): TankFig => ({ kind: 'tank', block: { m: BLOCK.m, rho: BLOCK.rho }, ...TANK, at: 'boat', ...over });
const dunk = (over: Partial<DunkFig>): DunkFig => ({ kind: 'dunk', ...BLOCK, depth: 0.06, ...over });

export const densityAndUpthrust: Lesson = {
  id: 'density-upthrust',
  title: 'Density and upthrust',
  spec: [23, 24],
  minutes: 11,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'Density and upthrust', from: 'density' },
    { title: 'Back to the tank', from: 'hook-again' },
  ],
  cast: ['Sam'],
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Density and upthrust',
      body: `Sam’s toy boat floats in a glass tank of water. On board is a ${BLOCK.m} kg block of steel.`,
      fig: tank({}),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: 'Sam lifts the block out and drops it over the side. It sinks to the bottom. What happens to the water level in the tank?',
      fig: tank({}),
      options: [
        { id: 'rise', label: 'It rises' },
        { id: 'fall', label: 'It falls', correct: true },
        { id: 'same', label: 'It stays the same' },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'density',
      kind: 'text',
      body: [
        '**Density** is mass per unit volume: ρ = m ÷ V, in kg m⁻³. Water is 1000 kg m⁻³, steel about 7800 kg m⁻³.',
        'Watch the units: 1 g cm⁻³ = 1000 kg m⁻³, and 1 cm³ = 10⁻⁶ m³. Work in kg and m³.',
      ],
      card: { term: 'Density', text: 'ρ = m ÷ V: mass per unit volume, in kg m⁻³. Water: 1000 kg m⁻³.' },
    },
    {
      id: 'volume',
      kind: 'choice',
      prompt: `The ${BLOCK.m} kg steel block has a density of ${BLOCK.rho} kg m⁻³. What is its volume?`,
      fig: dunk({ overflow: 'afterCheck' }),
      options: [
        { id: 'times', label: `${sig(X.volume.times)}${NB}m³`, hint: 'That is m × ρ. Rearrange ρ = m ÷ V: V = m ÷ ρ.' },
        { id: 'right', label: M3(X.volume.right), correct: true },
        { id: 'upside', label: M3(X.volume.upside), hint: 'That is ρ ÷ m. Rearrange ρ = m ÷ V: V = m ÷ ρ.' },
        { id: 'gcm3', label: `${sig(X.volume.gcm3)}${NB}m³`, hint: `That uses 7.8 g cm⁻³ with kg. In SI units steel is ${BLOCK.rho} kg m⁻³.` },
      ],
      why: `V = m ÷ ρ = ${BLOCK.m} ÷ ${BLOCK.rho} = ${M3(X.volume.right)}, or ${CM3(V)}. Under water the block pushes out exactly its own volume.`,
    },
    {
      id: 'upthrust',
      kind: 'text',
      body: [
        'Water pushes on every face of the block, harder the deeper the face. The bottom is pushed up more than the top is pushed down: the difference is the **upthrust**.',
        'Archimedes: **upthrust = the weight of the fluid displaced**. U = ρVg, with the fluid’s density and the volume under the surface.',
      ],
      card: { term: 'Upthrust', text: 'The upward push of a fluid: the weight of the fluid displaced. U = ρVg, with ρ the fluid’s density.' },
    },
    {
      id: 'weigh',
      kind: 'build',
      prompt: `In air the newtonmeter reads ${N(W)}. Build the upthrust on the block now that it is under water.`,
      fig: dunk({ inAir: true, reading: 'afterCheck', overflow: 'shown' }),
      equation: 'U = {ρ} × {V} × {g}',
      boxes: { 'ρ': 'water', V: 'volume', g: 'field' },
      chips: [
        { id: 'water', label: RHO(RHO_WATER) },
        { id: 'volume', label: M3(V) },
        { id: 'field', label: G9 },
        { id: 'steel', label: RHO(BLOCK.rho), hint: 'That is the steel’s density. Upthrust uses the density of the water displaced.' },
        { id: 'weight', label: N(W), hint: 'That is the block’s weight in air, not the upthrust.' },
      ],
      result: { symbol: 'U', value: U, unit: 'N' },
      why: `It displaces ${CM3(V)} of water: ${sig(X.weigh.mass)} kg, weighing ${N(U)}. So the newtonmeter reads ${sig(W)} − ${sig(U)} = ${N(X.weigh.reading)}.`,
    },
    {
      id: 'deeper',
      kind: 'explore',
      instruction: 'Drag the slider to lower the block into the can. Watch the reading and the water in the cylinder.',
      fig: dunk({ forces: true, reading: 'shown', overflow: 'shown', inAir: true }),
      slider: { min: DEPTH.min, max: DEPTH.max, step: 0.5, tick: 1, label: 'Depth of the block’s bottom', unit: 'cm', symbol: 'd', dp: 1, start: DEPTH.start },
      question: {
        prompt: 'Once the block is completely under water, Sam lowers it further. What happens to the reading?',
        options: [
          { id: 'falls', label: 'It keeps falling: deeper water pushes up harder', hint: 'Watch the cylinder: once the block is under, no more water comes out.' },
          { id: 'right', label: `It stays at ${N(X.weigh.reading)}`, correct: true },
          { id: 'rises', label: 'It rises back towards the weight in air', hint: 'The block still displaces its whole volume, so the upthrust stays.' },
        ],
        right: `Right: the block displaces ${CM3(V)} at any depth, so the upthrust stays ${N(U)}. Only the part under the surface counts.`,
      },
    },
    {
      id: 'floating',
      kind: 'text',
      body: [
        'A floating body sinks until the fluid it displaces weighs as much as it does. Then upthrust = weight, and it floats.',
        'So a floating body displaces **its own weight** of fluid, whatever its own volume. The heavier the load, the lower a boat sits.',
      ],
    },
    {
      id: 'float-sink',
      kind: 'sort',
      prompt: `Solid blocks are put into water, density ${RHO_WATER} kg m⁻³. Which float?`,
      bins: [
        { id: 'floats', label: 'Floats' },
        { id: 'sinks', label: 'Sinks' },
      ],
      items: [
        { id: 'pine', label: `Pine wood, 500${NB}kg${NB}m⁻³`, bin: 'floats', hint: 'Less dense than water: it floats.' },
        { id: 'ice', label: `Ice, 920${NB}kg${NB}m⁻³`, bin: 'floats', hint: 'Less dense than water: it floats, mostly under the surface.' },
        { id: 'glass', label: `Glass, 2500${NB}kg${NB}m⁻³`, bin: 'sinks', hint: 'Denser than water: even fully under, U is less than its weight.' },
        { id: 'alu', label: `Aluminium, 2700${NB}kg${NB}m⁻³`, bin: 'sinks', hint: 'Denser than water: it sinks.' },
        { id: 'cork', label: `Cork, 240${NB}kg${NB}m⁻³`, bin: 'floats', hint: 'Much less dense than water: it floats high.' },
        { id: 'steel', label: `Steel, 7800${NB}kg${NB}m⁻³`, bin: 'sinks', hint: 'Denser than water: a solid steel block sinks.' },
      ],
      why: 'Fully under water, upthrust = ρ(water)Vg and weight = ρ(block)Vg. The block floats if it is less dense than the water, and sinks if it is denser.',
    },
    {
      id: 'pushed',
      kind: 'order',
      prompt: 'Why does the boat displace so much water with the block on board? Put the steps in order.',
      fig: tank({ pushed: 'afterCheck' }),
      steps: [
        { id: 'floats', text: 'The boat floats, so its upthrust equals its weight.' },
        { id: 'adds', text: `The block adds ${N(X.pushed.more)}, so the upthrust must grow by that much.` },
        { id: 'water', text: `Upthrust is the weight of water displaced: ${BLOCK.m} kg more water.` },
        { id: 'volume', text: `That is ${CM3(onBoard)}, far more than the block’s own ${CM3(V)}.` },
      ],
      hint: 'A floating boat: upthrust = weight. Then what the extra weight needs.',
      why: `To hold up ${BLOCK.m} kg more, the boat displaces ${BLOCK.m} kg more water: V = ${BLOCK.m} ÷ ${RHO_WATER} = ${M3(onBoard)}, or ${CM3(onBoard)}.`,
    },
    {
      id: 'level',
      kind: 'estimate',
      prompt: `The tank’s base is ${TANK.area * 1e4} cm². Sam drops the block over the side and it sinks. Drag to how far the water level falls.`,
      fig: tank({}),
      after: tank({ drop: true }),
      scale: { min: 0, max: 4, step: 0.1, tick: 1, unit: 'cm', symbol: 'Δh', dp: 1, label: 'Fall of the water level' },
      answer: X.puzzle.right * 100,
      tolerance: 0.2,
      why: `The block displaced ${CM3(onBoard)} on board and only ${CM3(V)} on the bottom: ${sig((onBoard - V) * 1e6)} cm³ less, spread over ${TANK.area * 1e4} cm².`,
    },
    {
      id: 'hook-again',
      kind: 'build',
      prompt: 'Back to the tank. Build how far the water level falls when the block goes over the side.',
      fig: tank({ drop: 'afterCheck' }),
      equation: 'Δh = ({V₁} − {V₂}) ÷ {A}',
      boxes: { 'V₁': 'board', 'V₂': 'bottom', A: 'area' },
      chips: [
        { id: 'board', label: CM3(onBoard) },
        { id: 'bottom', label: CM3(V) },
        { id: 'area', label: `${TANK.area * 1e4}${NB}cm²` },
        { id: 'sum', label: CM3(X.puzzle.sum), hint: 'The block’s own volume still counts on the bottom: subtract it, do not add.' },
        { id: 'mass', label: `${BLOCK.m}${NB}kg`, hint: 'That is the block’s mass. The equation needs volumes.' },
      ],
      result: { symbol: 'Δh', value: X.puzzle.right * 100, unit: 'cm' },
      why: `On board: ${CM3(onBoard)} displaced. On the bottom: ${CM3(V)}. ${sig((onBoard - V) * 1e6)} cm³ less over ${TANK.area * 1e4} cm²: the level falls ${CM(X.puzzle.right)}.`,
    },
    {
      id: 'denser',
      kind: 'explore',
      instruction: `Drag the slider to change what the ${BLOCK.m} kg block is made of. The dashed line is the level while it was on board.`,
      fig: tank({ at: 'bottom', levels: true }),
      slider: { min: DENSITY.min, max: DENSITY.max, step: 200, tick: 2000, label: 'Density of the block', unit: 'kg m⁻³', symbol: 'ρ', dp: 0, start: BLOCK.rho },
      question: {
        prompt: `What if the block had the same density as water, ${RHO_WATER} kg m⁻³?`,
        options: [
          { id: 'most', label: 'The level would fall the most', hint: 'Watch the gap as the slider goes left: it shrinks.' },
          { id: 'right', label: 'The level would stay the same', correct: true },
          { id: 'rise', label: 'The level would rise', hint: 'It can never displace more on the bottom than on board: at most its own weight of water.' },
        ],
        right: `Right: ${BLOCK.m} kg of it takes up ${CM3(onBoard)}, exactly the water it displaced on board. The denser the block, the bigger the fall.`,
      },
    },
    {
      id: 'rules',
      kind: 'text',
      body: ['Upthrust = ρVg. A floating body displaces its own weight of fluid.'],
      fig: tank({ compare: true }),
    },
  ],
  skillCheck: [
    {
      id: 'balloon',
      kind: 'build',
      prompt: `A helium party balloon has a volume of ${BALLOON.V} m³. The air around it has a density of ${fixed(BALLOON.air, 2)} kg m⁻³. Build the upthrust on the balloon.`,
      equation: 'U = {ρ} × {V} × {g}',
      boxes: { 'ρ': 'air', V: 'volume', g: 'field' },
      chips: [
        { id: 'air', label: RHO(BALLOON.air) },
        { id: 'volume', label: M3(BALLOON.V) },
        { id: 'field', label: G9 },
        { id: 'helium', label: RHO(BALLOON.helium), hint: 'That is the helium’s density. Upthrust uses the air the balloon displaces.' },
      ],
      result: { symbol: 'U', value: X.balloon.right, unit: 'N' },
      why: `The balloon displaces ${BALLOON.V} m³ of air: U = ρVg = ${fixed(BALLOON.air, 2)} × ${BALLOON.V} × ${G} = ${N(X.balloon.right)}. Use the air’s density, not the helium’s.`,
    },
    {
      id: 'forces',
      kind: 'sort',
      prompt: 'How does the upthrust U on each body compare with its weight W?',
      bins: [
        { id: 'more', label: 'U > W' },
        { id: 'equal', label: 'U = W' },
        { id: 'less', label: 'U < W' },
      ],
      items: [
        { id: 'cork', label: 'A cork released under water, speeding up', bin: 'more', hint: 'It speeds up towards the surface: the resultant force is upwards.' },
        { id: 'boat', label: 'A boat floating at rest', bin: 'equal', hint: 'At rest: no resultant force, so U = W.' },
        { id: 'stone', label: 'A stone sinking, speeding up', bin: 'less', hint: 'It speeds up downwards: the resultant force is down.' },
        { id: 'sub', label: 'A submarine hovering at a steady depth', bin: 'equal', hint: 'Steady, not moving: U = W.' },
        { id: 'balloon', label: 'A helium balloon rising, speeding up', bin: 'more', hint: 'It speeds up upwards: U is more than W.' },
        { id: 'coin', label: 'A coin lying on the bottom of a pool', bin: 'less', hint: 'The floor pushes up too: U alone is less than W.' },
      ],
      why: 'U > W gives an upward resultant force, U < W a downward one, and U = W none. Resting on the bottom, the floor’s push makes up the difference.',
    },
    {
      id: 'river',
      kind: 'choice',
      prompt: 'A ship sails from the sea into a river. River water is less dense than sea water. How does the ship sit?',
      options: [
        { id: 'same', label: 'The same: its weight has not changed' },
        { id: 'right', label: 'Lower: it must displace more volume of the lighter water', correct: true },
        { id: 'higher', label: 'Higher: the river water is lighter, so it pushes less' },
        { id: 'sinks', label: 'It sinks: the upthrust is smaller' },
      ],
      why: 'Floating, the ship displaces its own weight of water. Lighter river water means a larger volume: the ship sits lower. The upthrust is unchanged.',
    },
    {
      id: 'ice',
      kind: 'examCard',
      context: `A ${ICE.m} kg block of ice, density ${ICE.rho} kg m⁻³, floats in sea water of density ${ICE.sea} kg m⁻³.`,
      parts: [
        {
          id: 'a',
          command: 'Calculate',
          text: 'the volume of ice under the surface.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'V = {m} ÷ {ρ}',
            boxes: { m: 'mass', 'ρ': 'sea' },
            chips: [
              { id: 'mass', label: `${fixed(ICE.m, 2)}${NB}kg` },
              { id: 'sea', label: RHO(ICE.sea) },
              { id: 'ice', label: RHO(ICE.rho), hint: 'That is the ice’s density. Floating, it displaces its weight of sea water.' },
            ],
            result: { symbol: 'V', value: X.ice.below * 1e6, unit: 'cm³' },
          },
          why: `Floating, the ice displaces its own weight of sea water: ${ICE.m} kg of it. V = ${ICE.m} ÷ ${ICE.sea} = ${CM3(X.ice.below)}. One mark for the idea, one for the answer.`,
        },
        {
          id: 'b',
          command: 'Calculate',
          text: 'the percentage of the ice that is under the surface.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'fraction = {ρ₁} ÷ {ρ₂}',
            boxes: { 'ρ₁': 'ice', 'ρ₂': 'sea' },
            chips: [
              { id: 'ice', label: RHO(ICE.rho) },
              { id: 'sea', label: RHO(ICE.sea) },
              { id: 'water', label: RHO(RHO_WATER), hint: 'That is fresh water. The ice floats in sea water.' },
            ],
            result: { symbol: 'fraction', value: X.ice.fraction * 100, unit: '%' },
          },
          why: `The whole block is ${CM3(X.ice.whole)}, and ${CM3(X.ice.below)} of it is under the surface: ${ICE.rho} ÷ ${ICE.sea} = ${sig(X.ice.fraction * 100)}%.`,
        },
      ],
    },
  ],
  youCanNow: [
    'Use ρ = m ÷ V, with masses in kg and volumes in m³',
    'Explain where upthrust comes from',
    'Find the upthrust as the weight of the fluid displaced',
    'Use the fact that a floating body displaces its own weight of fluid',
  ],
  recap: {
    fig: tank({ compare: true }),
    text: `Floating, the block makes the boat displace its own weight of water: ${CM3(onBoard)}. On the bottom, only its volume: ${CM3(V)}. The level falls ${CM(X.puzzle.right)}.`,
  },
  card: {
    formula: 'ρ = m/V,  U = ρVg',
    idea: 'Upthrust is the weight of fluid pushed aside. A floating body pushes aside its own weight of fluid.',
  },
};
