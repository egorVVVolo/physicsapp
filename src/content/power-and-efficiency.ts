// Lesson "Power and efficiency" — power as the rate of doing work, P = ΔW ÷ Δt = Fv, and efficiency (WPH11 points 21, 22).
// The puzzle: Kira cycles at a steady 6.0 m s⁻¹ against 9.0 N of air resistance. Air resistance grows as v², so at
// 12 m s⁻¹ it is 36.0 N, and each second she pushes it twice as far: eight times the power, 54.0 W → 432 W.
// Then a winch: 120 kg up 8.0 m in 12 s is 785 W of useful power from 1.20 kW, 65.4 % efficient; the same power lifts
// twice the load at half the speed (P = Tv). Every number below comes from src/physics; wrong options are named
// mistakes, recomputed by the test.
import { dragForce } from '../physics/drag.ts';
import { potentialChange } from '../physics/energy.ts';
import { G } from '../physics/kinematics.ts';
import { efficiency, inputFor, liftSpeed, outputFor, power, powerFromForce } from '../physics/power.ts';
import { workDone } from '../physics/work.ts';
import { fixed, sig } from '../physics/format.ts';
import type { Lesson, RideFig, WinchFig } from './types.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const J = (x: number): string => `${sig(x)}${NB}J`;
const KJ = (x: number): string => `${sig(x / 1000)}${NB}kJ`;
const W = (x: number): string => `${sig(x)}${NB}W`;
const KW = (x: number): string => `${sig(x / 1000)}${NB}kW`;
const N = (x: number): string => `${sig(x)}${NB}N`;
const KN = (x: number): string => `${sig(x / 1000)}${NB}kN`;
const PC = (x: number): string => `${sig(x * 100)}%`;
const MS = (x: number): string => `${sig(x)}${NB}m s⁻¹`;

// The puzzle: Kira on a level road, against air resistance D = kv² only.
export const RIDE = { k: 0.25, v: 6.0, fast: 12 }; // N s² m⁻², m s⁻¹, m s⁻¹
export const SPEEDS = { min: 2, max: 14 }; // m s⁻¹, the explore's slider
// The winch on the scaffold.
export const WINCH = { m: 120, h: 8.0, t: 12, input: 1200 }; // kg, m, s, W
export const LOAD = { min: 40, max: 240 }; // kg, the explore's slider
// Skill check.
export const STAIRS = { m: 62, h: 4.5, t: 3.2 };
export const CAR = { P: 30000, v: 25 };
export const MOTOR = { eff: 0.4, m: 30, h: 5.0 };
export const EBIKE = { eff: 0.8, input: 300, v: 8.0 };

const D1 = dragForce(RIDE.k, RIDE.v);
const D2 = dragForce(RIDE.k, RIDE.fast);
const liftWork = potentialChange(WINCH.m, WINCH.h);
const useful = power(liftWork, WINCH.t);
const stairsWork = potentialChange(STAIRS.m, STAIRS.h);
const motorUseful = potentialChange(MOTOR.m, MOTOR.h);
const ebikeUseful = outputFor(EBIKE.input, EBIKE.eff);

/** Answers and named mistakes, used by the screens and re-checked by power-and-efficiency.test.ts. */
export const ANSWERS = {
  perSecond: { right: workDone(D1, RIDE.v * 1), force: D1, fOverV: D1 / RIDE.v, power: powerFromForce(D1, RIDE.v) },
  faster: { d1: D1, d2: D2 },
  /** The puzzle: four times the force at twice the speed. */
  puzzle: { right: powerFromForce(D2, RIDE.fast), speedOnly: powerFromForce(D1, RIDE.fast), forceOnly: powerFromForce(D2, RIDE.v), same: powerFromForce(D1, RIDE.v) },
  winch: { right: useful, energy: liftWork, mass: (WINCH.m * WINCH.h) / WINCH.t, timesT: liftWork * WINCH.t },
  efficient: { right: efficiency(useful, WINCH.input), upside: WINCH.input / useful, wasted: 1 - efficiency(useful, WINCH.input), mass: (WINCH.m * WINCH.h) / WINCH.t / WINCH.input, heat: WINCH.input - useful },
  heavier: { v: liftSpeed(useful, WINCH.m), double: liftSpeed(useful, 2 * WINCH.m) },
  stairs: { right: power(stairsWork, STAIRS.t), mass: (STAIRS.m * STAIRS.h) / STAIRS.t, energy: stairsWork, timesT: stairsWork * STAIRS.t },
  car: { right: CAR.P / CAR.v, timesV: CAR.P * CAR.v, overV2: CAR.P / CAR.v ** 2 },
  motor: { right: inputFor(motorUseful, MOTOR.eff), useful: motorUseful, times: outputFor(motorUseful, MOTOR.eff), wasted: inputFor(motorUseful, 1 - MOTOR.eff) },
  ebike: { right: ebikeUseful / EBIKE.v, noEff: EBIKE.input / EBIKE.v, divided: inputFor(EBIKE.input, EBIKE.eff) / EBIKE.v, timesV: ebikeUseful * EBIKE.v, useful: ebikeUseful },
};
const X = ANSWERS;

const ride = (over: Partial<RideFig>): RideFig => ({ kind: 'ride', k: RIDE.k, v: RIDE.v, ...over });
const winch = (over: Partial<WinchFig>): WinchFig => ({ kind: 'winch', ...WINCH, ...over });

export const powerAndEfficiency: Lesson = {
  id: 'power',
  title: 'Power and efficiency',
  spec: [21, 22],
  minutes: 11,
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Power and efficiency',
      body: `Kira cycles along a flat road at a steady ${fixed(RIDE.v, 1)} m s⁻¹. The air pushes back on her with ${fixed(D1, 1)} N.`,
      fig: ride({}),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: `Air resistance grows as v². To ride at a steady ${RIDE.fast} m s⁻¹, twice as fast, how much power must Kira give?`,
      fig: ride({}),
      options: [
        { id: 'twice', label: 'Twice as much' },
        { id: 'four', label: 'Four times as much' },
        { id: 'eight', label: 'Eight times as much' },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'power',
      kind: 'text',
      body: [
        '**Power** is the rate of doing work: the work done, or the energy transferred, each second. P = ΔW ÷ Δt.',
        'It is measured in **watts**: 1 W = 1 J s⁻¹. A 600 W blender transfers 600 J of energy every second.',
      ],
      card: { term: 'Power', text: 'P = ΔW ÷ Δt: the work done, or energy transferred, per second. 1 W = 1 J s⁻¹.' },
    },
    {
      id: 'per-second',
      kind: 'choice',
      prompt: `The posts are ${fixed(RIDE.v, 1)} m apart, so Kira passes one each second. How much work does she do against the air each second?`,
      fig: ride({ perSecond: true, power: 'afterCheck' }),
      options: [
        { id: 'force', label: J(X.perSecond.force), hint: `That is the force. Work is force × distance: she moves ${fixed(RIDE.v, 1)} m each second.` },
        { id: 'zero', label: '0 J: her speed is steady', hint: `Her push and the air balance, but her push still moves her ${fixed(RIDE.v, 1)} m each second.` },
        { id: 'right', label: J(X.perSecond.right), correct: true },
        { id: 'fOverV', label: J(X.perSecond.fOverV), hint: 'Work is force × distance, not force ÷ speed.' },
      ],
      why: `Each second she pushes ${fixed(D1, 1)} N through ${fixed(RIDE.v, 1)} m: ΔW = FΔs = ${J(X.perSecond.right)}. So her power is ${W(X.perSecond.power)}.`,
    },
    {
      id: 'fv',
      kind: 'text',
      body: [
        'Work done each second is force × distance moved each second: P = FΔs ÷ Δt = **Fv**, with v the speed along the force.',
        'At a steady speed the resultant force is zero, so Kira’s driving force equals the air resistance. Her power is D × v.',
      ],
    },
    {
      id: 'faster',
      kind: 'explore',
      instruction: 'Drag the slider to change Kira’s speed. Her driving force always equals the air resistance.',
      fig: ride({}),
      slider: { min: SPEEDS.min, max: SPEEDS.max, step: 0.5, tick: 2, label: 'Her speed', unit: 'm s⁻¹', symbol: 'v', dp: 1, start: RIDE.v },
      question: {
        prompt: `When Kira rides twice as fast, from ${fixed(RIDE.v, 1)} to ${RIDE.fast} m s⁻¹, what happens to the air resistance?`,
        options: [
          { id: 'double', label: 'It doubles', hint: 'Watch D: it grows as v², not as v.' },
          { id: 'right', label: 'It becomes four times as big', correct: true },
          { id: 'same', label: `It stays ${fixed(D1, 1)} N: her speed is steady`, hint: 'A faster steady speed means more air resistance, steadily.' },
        ],
        right: `Right: D = kv², so ${fixed(D1, 1)} N becomes ${fixed(D2, 1)} N. And each second she now pushes it twice as far.`,
      },
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Back to Kira. How much power must she give to ride at a steady ${RIDE.fast} m s⁻¹?`,
      fig: ride({ v: RIDE.fast, power: 'afterCheck' }),
      options: [
        { id: 'speedOnly', label: W(X.puzzle.speedOnly), hint: `That keeps ${fixed(D1, 1)} N. At ${RIDE.fast} m s⁻¹ the air pushes with ${fixed(D2, 1)} N.` },
        { id: 'forceOnly', label: W(X.puzzle.forceOnly), hint: `That is ${fixed(D2, 1)} N × the old ${fixed(RIDE.v, 1)} m s⁻¹. Use her new speed: P = Dv.` },
        { id: 'right', label: W(X.puzzle.right), correct: true },
        { id: 'same', label: `${W(X.puzzle.same)}: her speed is still steady`, hint: `A steady speed still needs power: ${fixed(D2, 1)} N over every metre.` },
      ],
      why: `P = Dv = ${fixed(D2, 1)} × ${RIDE.fast} = ${W(X.puzzle.right)}: eight times ${W(X.puzzle.same)}. Four times the force, twice the distance each second.`,
    },
    {
      id: 'efficiency',
      kind: 'text',
      body: [
        'No machine turns all the energy it takes in into useful work. Some is wasted, mostly **heating** the machine and its surroundings.',
        '**Efficiency** = useful energy output ÷ total energy input. Divide both by the time: useful power output ÷ total power input.',
      ],
      card: { term: 'Efficiency', text: 'Useful output ÷ total input, for energies or for powers. Often a percentage; never more than 100%.' },
    },
    {
      id: 'winch',
      kind: 'choice',
      prompt: `A winch lifts ${WINCH.m} kg of bricks ${fixed(WINCH.h, 1)} m in ${WINCH.t} s at a steady speed. What useful power does it give?`,
      fig: winch({ play: true, useful: 'afterCheck' }),
      options: [
        { id: 'energy', label: KW(X.winch.energy), hint: 'That is the energy, mgΔh, in joules. Power is energy per second.' },
        { id: 'right', label: W(X.winch.right), correct: true },
        { id: 'mass', label: W(X.winch.mass), hint: 'Use the weight, mg: the force the cable pulls with. Not the mass.' },
        { id: 'timesT', label: KW(X.winch.timesT), hint: 'Divide the energy by the time; do not multiply.' },
      ],
      why: `Useful work = mgΔh = ${WINCH.m} × ${G} × ${fixed(WINCH.h, 1)} = ${J(liftWork)} in ${WINCH.t} s: P = ${W(X.winch.right)}.`,
    },
    {
      id: 'efficient',
      kind: 'choice',
      prompt: `The winch’s motor takes ${KW(WINCH.input)} from the mains. What is its efficiency?`,
      fig: winch({ play: true, useful: 'shown', efficiency: 'afterCheck' }),
      options: [
        { id: 'upside', label: PC(X.efficient.upside), hint: 'That is input ÷ output. Efficiency is useful ÷ total: never above 100%.' },
        { id: 'right', label: PC(X.efficient.right), correct: true },
        { id: 'wasted', label: PC(X.efficient.wasted), hint: 'That is the share that heats the motor. Efficiency is the useful share.' },
        { id: 'mass', label: PC(X.efficient.mass), hint: `The useful power is ${W(useful)}: it uses the weight, mg, not the mass.` },
      ],
      why: `Efficiency = useful ÷ total = ${sig(useful)} ÷ ${WINCH.input} = ${fixed(X.efficient.right, 3)}, or ${PC(X.efficient.right)}. The other ${W(X.efficient.heat)} heats the motor.`,
    },
    {
      id: 'heavier',
      kind: 'explore',
      instruction: `Drag the slider to change the load. The motor gives the same useful power, ${W(useful)}, every time.`,
      fig: winch({ useful: 'shown' }),
      slider: { min: LOAD.min, max: LOAD.max, step: 10, tick: 40, label: 'Load on the pallet', unit: 'kg', symbol: 'm', dp: 0, start: WINCH.m },
      question: {
        prompt: `The winch now lifts twice the load, ${2 * WINCH.m} kg. How fast does the pallet rise?`,
        options: [
          { id: 'same', label: `As before, ${MS(X.heavier.v)}: it is the same motor`, hint: 'The power is the same, and P = Tv: twice the pull leaves less speed.' },
          { id: 'right', label: 'At half the speed', correct: true },
          { id: 'quarter', label: 'At a quarter of the speed', hint: 'The pull T = mg only doubles, so v = P ÷ T halves.' },
        ],
        right: `Right: P = Tv, and T = mg is twice as big, so v halves to ${MS(X.heavier.double)}. The same power: twice the force, half the speed.`,
      },
    },
    {
      id: 'rules',
      kind: 'text',
      body: [
        '**Power** = ΔW ÷ Δt = Fv. Against air resistance a faster ride costs far more: twice the speed, eight times the power.',
        '**Efficiency** = useful output ÷ total input, never above 100%. That is the Energy level done. Next: fluids.',
      ],
    },
  ],
  skillCheck: [
    {
      id: 'stairs',
      kind: 'choice',
      prompt: `A ${STAIRS.m} kg student runs up a flight of stairs, rising ${fixed(STAIRS.h, 1)} m in ${fixed(STAIRS.t, 1)} s. What average useful power does she develop?`,
      options: [
        { id: 'mass', label: W(X.stairs.mass) },
        { id: 'energy', label: KW(X.stairs.energy) },
        { id: 'right', label: W(X.stairs.right), correct: true },
        { id: 'timesT', label: KW(X.stairs.timesT) },
      ],
      why: `Work against gravity mgΔh = ${STAIRS.m} × ${G} × ${fixed(STAIRS.h, 1)} = ${J(stairsWork)} in ${fixed(STAIRS.t, 1)} s: P = ${W(X.stairs.right)}.`,
    },
    {
      id: 'car',
      kind: 'choice',
      prompt: `A car travels at a steady ${CAR.v} m s⁻¹ on a level road, its engine giving a useful power of ${CAR.P / 1000} kW. What is the total resistive force?`,
      options: [
        { id: 'timesV', label: KN(X.car.timesV) },
        { id: 'zero', label: '0 N: the speed is steady' },
        { id: 'overV2', label: N(X.car.overV2) },
        { id: 'right', label: KN(X.car.right), correct: true },
      ],
      why: `At a steady speed the driving force equals the resistance: F = P ÷ v = ${CAR.P} ÷ ${CAR.v} = ${KN(X.car.right)}.`,
    },
    {
      id: 'motor',
      kind: 'choice',
      prompt: `An electric motor with an efficiency of ${MOTOR.eff * 100}% lifts a ${MOTOR.m} kg load through ${fixed(MOTOR.h, 1)} m. How much electrical energy does it use?`,
      options: [
        { id: 'useful', label: KJ(X.motor.useful) },
        { id: 'right', label: KJ(X.motor.right), correct: true },
        { id: 'times', label: J(X.motor.times) },
        { id: 'wasted', label: KJ(X.motor.wasted) },
      ],
      why: `Useful energy mgΔh = ${J(motorUseful)}. Input = useful ÷ efficiency = ${sig(motorUseful)} ÷ ${fixed(MOTOR.eff, 2)} = ${KJ(X.motor.right)}.`,
    },
    {
      id: 'ebike',
      kind: 'choice',
      prompt: `An e-bike’s motor is ${EBIKE.eff * 100}% efficient and takes ${EBIKE.input} W from the battery. At a steady ${fixed(EBIKE.v, 1)} m s⁻¹ on the level, what is the resistive force?`,
      options: [
        { id: 'noEff', label: N(X.ebike.noEff) },
        { id: 'right', label: N(X.ebike.right), correct: true },
        { id: 'divided', label: N(X.ebike.divided) },
        { id: 'timesV', label: KN(X.ebike.timesV) },
      ],
      why: `Useful power = ${fixed(EBIKE.eff, 2)} × ${EBIKE.input} = ${W(X.ebike.useful)}. At a steady speed P = Fv, so F = ${sig(X.ebike.useful)} ÷ ${fixed(EBIKE.v, 1)} = ${N(X.ebike.right)}.`,
    },
  ],
  youCanNow: [
    'Define power as the rate of doing work, in watts',
    'Use P = ΔW ÷ Δt and P = Fv',
    'Explain why a faster ride costs far more power',
    'Find an efficiency, or use one to find an input or an output',
  ],
  recap: {
    fig: ride({ compare: RIDE.fast }),
    text: `Twice the speed: four times the air resistance, pushed twice as far each second. Eight times the power: ${W(X.puzzle.same)} → ${W(X.puzzle.right)}.`,
  },
  card: {
    formula: 'P = ΔW/Δt = Fv',
    idea: 'Power is how fast work is done. Efficiency is the useful share of what goes in, never above 100%.',
  },
};
