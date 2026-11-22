// Lesson "Density and upthrust" — ρ = m ÷ V, and upthrust = the weight of the fluid displaced (WPH11 points 23, 24).
// The puzzle: Sam's toy boat floats in a glass tank carrying a 0.78 kg steel block. Over the side it goes, to the bottom:
// does the level rise, fall or stay? It falls, by 1.36 cm. On board the block made the boat displace its own weight of
// water, 780 cm³; on the bottom it displaces only its own volume, 100 cm³. On the way: the block on a newtonmeter in a
// displacement can (100 cm³ overflow, upthrust 0.981 N, the reading 7.65 → 6.67 N, deeper changes nothing).
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { weight } from '../physics/dynamics.ts';
import { apparentWeight, densityByWeighing, floatingDisplacement, massOf, RHO_WATER, tankLevelFall, upthrust, volumeOf } from '../physics/fluids.ts';
import { G } from '../physics/kinematics.ts';
import { fixed, sci, sig } from '../physics/format.ts';
import type { DunkFig, Lesson, TankFig } from './types.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const N = (x: number): string => `${sig(x)}${NB}N`;
const KG = (x: number): string => `${sig(x)}${NB}kg`;
const M3 = (x: number): string => `${sci(x)}${NB}m³`;
const CM3 = (x: number): string => `${sig(x * 1e6)}${NB}cm³`;
const CM = (x: number): string => `${fixed(x * 100, 2)}${NB}cm`;
const RHO = (x: number): string => `${sig(x)}${NB}kg${NB}m⁻³`;

// The steel block: 5.0 cm × 5.0 cm × 4.0 cm.
export const BLOCK = { m: 0.78, rho: 7800, h: 0.04 }; // kg, kg m⁻³, m
// The toy boat and the tank: base 25 cm × 20 cm, water up to 14.0 cm while the block is on board.
export const TANK = { boat: 0.3, area: 0.05, water: 5.92e-3 }; // kg, m², m³
export const DEPTH = { min: 0, max: 7, start: 2 }; // cm, the explore's slider: how deep the block's bottom is
export const DENSITY = { min: 1000, max: 11000 }; // kg m⁻³, the explore's slider
// Skill check.
export const STONE = { air: 4.5, water: 2.7 }; // N
export const ROOM = { l: 8.0, w: 6.0, h: 3.0, rho: 1.2 }; // m, kg m⁻³
export const BALLOON = { V: 0.012, air: 1.2, helium: 0.18 }; // m³, kg m⁻³
export const ICE = { m: 0.92, rho: 920, sea: 1030 }; // kg, kg m⁻³

const V = volumeOf(BLOCK.m, BLOCK.rho);
const W = weight(BLOCK.m);
const U = upthrust(RHO_WATER, V);
const onBoard = floatingDisplacement(BLOCK.m, RHO_WATER);
const roomV = ROOM.l * ROOM.w * ROOM.h;

/** Answers and named mistakes, used by the screens and re-checked by density-and-upthrust.test.ts. */
export const ANSWERS = {
  volume: { right: V, times: BLOCK.m * BLOCK.rho, upside: BLOCK.rho / BLOCK.m, gcm3: BLOCK.m / (BLOCK.rho / 1000) },
  weigh: { right: U, weight: W, mass: massOf(RHO_WATER, V), reading: apparentWeight(W, U) },
  pushed: { right: onBoard, ownVolume: V, weight: W / RHO_WATER, perKg: BLOCK.m / 1 },
  /** The puzzle: the level falls by (780 − 100) cm³ ÷ 500 cm². */
  puzzle: { right: tankLevelFall(BLOCK.m, BLOCK.rho, TANK.area), rise: V / TANK.area, noVolume: onBoard / TANK.area },
  denser: { same: tankLevelFall(BLOCK.m, RHO_WATER, TANK.area), lead: tankLevelFall(BLOCK.m, DENSITY.max, TANK.area) },
  stone: { right: densityByWeighing(STONE.air, STONE.water, RHO_WATER), reading: (STONE.water / (STONE.air - STONE.water)) * RHO_WATER, ratio: (STONE.air / STONE.water) * RHO_WATER, upside: ((STONE.air - STONE.water) / STONE.air) * RHO_WATER },
  room: { right: massOf(ROOM.rho, roomV), upside: roomV / ROOM.rho, flipped: ROOM.rho / roomV, weight: weight(massOf(ROOM.rho, roomV)) },
  balloon: { right: upthrust(BALLOON.air, BALLOON.V), mass: massOf(BALLOON.air, BALLOON.V), helium: upthrust(BALLOON.helium, BALLOON.V), water: upthrust(RHO_WATER, BALLOON.V) },
  ice: { right: floatingDisplacement(ICE.m, ICE.sea), whole: volumeOf(ICE.m, ICE.rho), fresh: floatingDisplacement(ICE.m, RHO_WATER), weight: weight(ICE.m) / ICE.sea },
};
const X = ANSWERS;

const tank = (over: Partial<TankFig>): TankFig => ({ kind: 'tank', block: { m: BLOCK.m, rho: BLOCK.rho }, ...TANK, at: 'boat', ...over });
const dunk = (over: Partial<DunkFig>): DunkFig => ({ kind: 'dunk', ...BLOCK, depth: 0.06, ...over });

export const densityAndUpthrust: Lesson = {
  id: 'density-upthrust',
  title: 'Density and upthrust',
  spec: [23, 24],
  minutes: 11,
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
      kind: 'choice',
      prompt: `In air the newtonmeter reads ${N(W)}. What is the upthrust on the block now that it is under water?`,
      fig: dunk({ inAir: true, reading: 'afterCheck', overflow: 'shown' }),
      options: [
        { id: 'weight', label: N(X.weigh.weight), hint: 'That is the block’s own weight. Upthrust is the weight of the water displaced.' },
        { id: 'mass', label: N(X.weigh.mass), hint: `That is the mass of the water, in kg. Its weight is mg.` },
        { id: 'right', label: N(X.weigh.right), correct: true },
        { id: 'reading', label: N(X.weigh.reading), hint: 'That is what the newtonmeter reads in water: the weight minus the upthrust.' },
      ],
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
      id: 'pushed',
      kind: 'choice',
      prompt: 'With the block on board, the boat sits lower. How much extra water does the boat displace because of the block?',
      fig: tank({ pushed: 'afterCheck' }),
      options: [
        { id: 'ownVolume', label: `${M3(X.pushed.ownVolume)}: the block’s volume`, hint: `The block is not in the water. The boat must displace ${BLOCK.m} kg more water.` },
        { id: 'right', label: M3(X.pushed.right), correct: true },
        { id: 'weight', label: M3(X.pushed.weight), hint: `That divides the weight, ${N(W)}, by ρ. Use the mass: ${BLOCK.m} kg of water.` },
        { id: 'perKg', label: `${sig(X.pushed.perKg)}${NB}m³`, hint: 'Water is 1000 kg m⁻³, not 1 kg m⁻³.' },
      ],
      why: `To hold up ${BLOCK.m} kg more, the boat displaces ${BLOCK.m} kg more water: V = ${BLOCK.m} ÷ ${RHO_WATER} = ${M3(onBoard)}, or ${CM3(onBoard)}.`,
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Back to the tank: its base is ${TANK.area} m². Sam drops the block over the side and it sinks. What happens to the water level?`,
      fig: tank({ drop: 'afterCheck' }),
      options: [
        { id: 'rise', label: `It rises by ${CM(X.puzzle.rise)}`, hint: `On board it already made the boat displace ${CM3(onBoard)}. On the bottom: less.` },
        { id: 'same', label: 'It stays the same: the same things are in the tank', hint: `Compare what is displaced: ${CM3(onBoard)} on board, ${CM3(V)} on the bottom.` },
        { id: 'noVolume', label: `It falls by ${CM(X.puzzle.noVolume)}`, hint: `On the bottom the block still displaces its own ${CM3(V)}.` },
        { id: 'right', label: `It falls by ${CM(X.puzzle.right)}`, correct: true },
      ],
      why: `On board: ${CM3(onBoard)} displaced. On the bottom: ${CM3(V)}. ${sig((onBoard - V) * 1e6)} cm³ less over ${sig(TANK.area * 1e4)} cm²: the level falls ${CM(X.puzzle.right)}.`,
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
      body: [
        '**Density** ρ = m ÷ V. **Upthrust** = the weight of the fluid displaced, ρVg: under the surface, a body displaces its own volume.',
        'A floating body displaces its own weight of fluid. Next: what slows a ball falling through oil.',
      ],
    },
  ],
  skillCheck: [
    {
      id: 'stone',
      kind: 'choice',
      prompt: `A stone hangs from a newtonmeter. It reads ${fixed(STONE.air, 1)} N in air and ${fixed(STONE.water, 1)} N fully under water. What is the density of the stone?`,
      options: [
        { id: 'reading', label: RHO(X.stone.reading) },
        { id: 'ratio', label: RHO(X.stone.ratio) },
        { id: 'right', label: RHO(X.stone.right), correct: true },
        { id: 'upside', label: RHO(X.stone.upside) },
      ],
      why: `U = ${fixed(STONE.air, 1)} − ${fixed(STONE.water, 1)} = ${fixed(STONE.air - STONE.water, 1)} N, the weight of its volume of water. So ρ = ${RHO_WATER} × ${fixed(STONE.air, 1)} ÷ ${fixed(STONE.air - STONE.water, 1)} = ${RHO(X.stone.right)}.`,
    },
    {
      id: 'room',
      kind: 'choice',
      prompt: `A classroom is ${fixed(ROOM.l, 1)} m by ${fixed(ROOM.w, 1)} m by ${fixed(ROOM.h, 1)} m. The air in it has a density of ${fixed(ROOM.rho, 2)} kg m⁻³. What is the mass of the air?`,
      options: [
        { id: 'upside', label: KG(X.room.upside) },
        { id: 'right', label: KG(X.room.right), correct: true },
        { id: 'flipped', label: KG(X.room.flipped) },
        { id: 'weight', label: KG(X.room.weight) },
      ],
      why: `V = ${fixed(ROOM.l, 1)} × ${fixed(ROOM.w, 1)} × ${fixed(ROOM.h, 1)} = ${roomV} m³, so m = ρV = ${fixed(ROOM.rho, 2)} × ${roomV} = ${KG(X.room.right)}: about two adults.`,
    },
    {
      id: 'balloon',
      kind: 'choice',
      prompt: `A helium party balloon has a volume of ${BALLOON.V} m³. The air around it has a density of ${fixed(BALLOON.air, 2)} kg m⁻³. What is the upthrust on the balloon?`,
      options: [
        { id: 'mass', label: N(X.balloon.mass) },
        { id: 'helium', label: N(X.balloon.helium) },
        { id: 'water', label: N(X.balloon.water) },
        { id: 'right', label: N(X.balloon.right), correct: true },
      ],
      why: `The balloon displaces ${BALLOON.V} m³ of air: U = ρVg = ${fixed(BALLOON.air, 2)} × ${BALLOON.V} × ${G} = ${N(X.balloon.right)}. Use the air’s density, not the helium’s.`,
    },
    {
      id: 'ice',
      kind: 'choice',
      prompt: `A ${ICE.m} kg block of ice, density ${ICE.rho} kg m⁻³, floats in sea water of density ${ICE.sea} kg m⁻³. What volume of the ice is under the surface?`,
      options: [
        { id: 'whole', label: M3(X.ice.whole) },
        { id: 'fresh', label: M3(X.ice.fresh) },
        { id: 'right', label: M3(X.ice.right), correct: true },
        { id: 'weight', label: M3(X.ice.weight) },
      ],
      why: `Floating, it displaces its own weight of sea water: ${ICE.m} kg of it. V = ${ICE.m} ÷ ${ICE.sea} = ${M3(X.ice.right)}, out of ${M3(X.ice.whole)}.`,
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
