// Lesson "Power and efficiency" — power as the rate of doing work, P = ΔW ÷ Δt = Fv, and efficiency (WPH11 points 21, 22).
// The puzzle: Kira cycles at a steady 6.0 m s⁻¹ against 9.0 N of air resistance. Air resistance grows as v², so at
// 12 m s⁻¹ it is 36.0 N, and each second she pushes it twice as far: eight times the power, 54.0 W → 432 W.
// Then a winch: 120 kg up 8.0 m in 12 s is 785 W of useful power from 1.20 kW, 65.4 % efficient; the same power lifts
// twice the load at half the speed (P = Tv). Every number below comes from src/physics; wrong options are named
// mistakes, recomputed by the test.
// Format v3 (V2 task D10): build, order, estimate, graphPick; the Skill check ends on an exam-style card.
import { dragForce } from '../physics/drag.ts';
import { potentialChange } from '../physics/energy.ts';
import { weight } from '../physics/dynamics.ts';
import { G } from '../physics/kinematics.ts';
import { efficiency, liftSpeed, power, powerFromForce } from '../physics/power.ts';
import { workDone } from '../physics/work.ts';
import { fixed, sig } from '../physics/format.ts';
import type { Lesson, PlotFig, RideFig, WinchFig } from './types.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const J = (x: number): string => `${sig(x)}${NB}J`;
const W = (x: number): string => `${sig(x)}${NB}W`;
const KW = (x: number): string => `${sig(x / 1000)}${NB}kW`;
const N = (x: number): string => `${sig(x)}${NB}N`;
const KN = (x: number): string => `${sig(x / 1000)}${NB}kN`;
const PC = (x: number): string => `${sig(x * 100)}%`;
const MS = (x: number): string => `${sig(x)}${NB}m s⁻¹`;
const G9 = `9.81${NB}N${NB}kg⁻¹`;

// The puzzle: Kira on a level road, against air resistance D = kv² only.
export const RIDE = { k: 0.25, v: 6.0, fast: 12 }; // N s² m⁻², m s⁻¹, m s⁻¹
export const SPEEDS = { min: 2, max: 14 }; // m s⁻¹, the explore's slider and the P–v graphs
// The winch on the scaffold.
export const WINCH = { m: 120, h: 8.0, t: 12, input: 1200 }; // kg, m, s, W
export const LOAD = { min: 40, max: 240 }; // kg, the explore's slider
// Skill check.
export const CAR = { P: 30000, v: 25 };
export const CRANE = { m: 400, h: 6.0, t: 8.0, input: 5000 }; // kg, m, s, W

const D1 = dragForce(RIDE.k, RIDE.v);
const D2 = dragForce(RIDE.k, RIDE.fast);
const liftWork = potentialChange(WINCH.m, WINCH.h);
const useful = power(liftWork, WINCH.t);
const craneUseful = power(potentialChange(CRANE.m, CRANE.h), CRANE.t);
/** Kira's power at speed v: P = Dv. */
const kiraPower = (v: number): number => powerFromForce(dragForce(RIDE.k, v), v);

/** Answers and named mistakes, used by the screens and re-checked by power-and-efficiency.test.ts. */
export const ANSWERS = {
  perSecond: { right: workDone(D1, RIDE.v * 1), force: D1, fOverV: D1 / RIDE.v, power: powerFromForce(D1, RIDE.v) },
  faster: { d1: D1, d2: D2 },
  /** The puzzle: four times the force at twice the speed. */
  puzzle: { right: powerFromForce(D2, RIDE.fast), speedOnly: powerFromForce(D1, RIDE.fast), forceOnly: powerFromForce(D2, RIDE.v), same: powerFromForce(D1, RIDE.v), times: powerFromForce(D2, RIDE.fast) / powerFromForce(D1, RIDE.v) },
  winch: { right: useful, energy: liftWork, weight: weight(WINCH.m), heat: WINCH.input - useful },
  efficient: { right: efficiency(useful, WINCH.input), heat: WINCH.input - useful },
  heavier: { v: liftSpeed(useful, WINCH.m), double: liftSpeed(useful, 2 * WINCH.m) },
  car: { right: CAR.P / CAR.v, timesV: CAR.P * CAR.v },
  crane: { power: craneUseful, eff: efficiency(craneUseful, CRANE.input), heat: CRANE.input - craneUseful, weight: weight(CRANE.m) },
};
const X = ANSWERS;

const ride = (over: Partial<RideFig>): RideFig => ({ kind: 'ride', k: RIDE.k, v: RIDE.v, ...over });
const winch = (over: Partial<WinchFig>): WinchFig => ({ kind: 'winch', ...WINCH, ...over });

/** One P–v curve for "which graph?": the model (P = Dv, so v³) or a named mistake. All three end at the same point. */
const pGraph = (shape: 'cube' | 'line' | 'square'): PlotFig => {
  const end = kiraPower(SPEEDS.max);
  return {
    kind: 'plot',
    header: 'Kira, power against speed',
    x: { label: 'v / m s⁻¹', max: SPEEDS.max, tick: 2 },
    y: { label: 'P / W', max: 700, tick: 100 },
    points: Array.from({ length: SPEEDS.max + 1 }, (_, v) => {
      const share = v / SPEEDS.max;
      return { x: v, y: shape === 'cube' ? kiraPower(v) : shape === 'line' ? end * share : end * share * share };
    }),
  };
};

export const powerAndEfficiency: Lesson = {
  id: 'power',
  title: 'Power and efficiency',
  spec: [21, 22],
  minutes: 11,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'Power', from: 'power' },
    { title: 'Back to Kira', from: 'hook-again' },
  ],
  cast: ['Kira'],
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
        { id: 'eight', label: 'Eight times as much', correct: true },
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
      id: 'why-cube',
      kind: 'order',
      prompt: 'Why does twice the speed need eight times the power? Put the steps in order.',
      fig: ride({ v: RIDE.fast }),
      steps: [
        { id: 'drag', text: 'Air resistance D = kv²: twice the speed, four times the force.' },
        { id: 'steady', text: 'At a steady speed her driving force equals D.' },
        { id: 'far', text: 'Each second she also moves twice as far.' },
        { id: 'eight', text: 'P = Fv: four times the force × twice the speed = eight times the power.' },
      ],
      hint: 'First what the air does, then her force, then her distance, then P = Fv.',
      why: 'D = kv² and F = D, so P = Fv = kv³. Doubling v multiplies the power by 2³ = 8.',
    },
    {
      id: 'p-graph',
      kind: 'graphPick',
      prompt: `Which graph shows Kira’s power against her speed, from 0 to ${SPEEDS.max} m s⁻¹?`,
      graphs: [
        { id: 'A', fig: pGraph('line'), hint: 'A straight line: twice the speed, twice the power. But the force grows too.' },
        { id: 'B', fig: pGraph('cube'), correct: true },
        { id: 'C', fig: pGraph('square'), hint: 'A parabola is v². Power is force × speed, and the force is v² already.' },
      ],
      why: `P = Dv = kv³: it stays low at first, then climbs very steeply. At ${RIDE.fast} m s⁻¹ it is ${W(X.puzzle.right)}, at ${SPEEDS.max} m s⁻¹ ${W(kiraPower(SPEEDS.max))}.`,
    },
    {
      id: 'at-12',
      kind: 'estimate',
      prompt: `Kira needs ${W(X.puzzle.same)} at ${fixed(RIDE.v, 1)} m s⁻¹. Drag to the power she needs at a steady ${RIDE.fast} m s⁻¹.`,
      fig: ride({ v: RIDE.fast }),
      after: ride({ v: RIDE.fast, power: 'shown' }),
      scale: { min: 0, max: 600, step: 10, tick: 100, unit: 'W', symbol: 'P', dp: 0, label: 'Power at 12 m s⁻¹' },
      answer: X.puzzle.right,
      tolerance: 30,
      why: `The force is four times as big and the distance each second twice as far: 4 × 2 = 8, and 8 × ${sig(X.puzzle.same)} = ${W(X.puzzle.right)}.`,
    },
    {
      id: 'hook-again',
      kind: 'build',
      prompt: `Back to Kira. Build the power she must give to ride at a steady ${RIDE.fast} m s⁻¹.`,
      fig: ride({ v: RIDE.fast, power: 'afterCheck' }),
      equation: 'P = {F} × {v}',
      boxes: { F: 'drag', v: 'fast' },
      chips: [
        { id: 'drag', label: `${fixed(D2, 1)}${NB}N` },
        { id: 'fast', label: `${RIDE.fast}${NB}m s⁻¹` },
        { id: 'oldF', label: `${fixed(D1, 1)}${NB}N`, hint: `That is the air’s push at ${fixed(RIDE.v, 1)} m s⁻¹. At ${RIDE.fast} m s⁻¹ it is ${fixed(D2, 1)} N.` },
        { id: 'oldV', label: `${fixed(RIDE.v, 1)}${NB}m s⁻¹`, hint: 'That is her old speed. P = Fv uses the speed she rides at now.' },
      ],
      result: { symbol: 'P', value: X.puzzle.right, unit: 'W' },
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
      kind: 'build',
      prompt: `A winch lifts ${WINCH.m} kg of bricks ${fixed(WINCH.h, 1)} m in ${WINCH.t} s at a steady speed. Build the useful power it gives.`,
      fig: winch({ play: true, useful: 'afterCheck' }),
      equation: 'P = {m} × {g} × {h} ÷ {t}',
      boxes: { m: 'mass', g: 'field', h: 'height', t: 'time' },
      chips: [
        { id: 'mass', label: `${WINCH.m}${NB}kg` },
        { id: 'field', label: G9 },
        { id: 'height', label: `${fixed(WINCH.h, 1)}${NB}m` },
        { id: 'time', label: `${WINCH.t}${NB}s` },
        { id: 'input', label: KW(WINCH.input), hint: 'That is the power the motor takes in. The useful power is what lifts the bricks.' },
        { id: 'weight', label: KN(X.winch.weight), hint: 'That is the weight, mg. The equation multiplies the mass by g itself.' },
      ],
      result: { symbol: 'P', value: X.winch.right, unit: 'W' },
      why: `Useful work = mgΔh = ${WINCH.m} × ${G} × ${fixed(WINCH.h, 1)} = ${J(liftWork)} in ${WINCH.t} s: P = ${W(X.winch.right)}.`,
    },
    {
      id: 'efficient',
      kind: 'build',
      prompt: `The winch’s motor takes ${WINCH.input}${NB}W from the mains. Build its efficiency.`,
      fig: winch({ play: true, useful: 'shown', efficiency: 'afterCheck' }),
      equation: 'efficiency = {useful} ÷ {input}',
      boxes: { useful: 'useful', input: 'input' },
      chips: [
        { id: 'useful', label: W(useful) },
        { id: 'input', label: `${WINCH.input}${NB}W` },
        { id: 'heat', label: W(X.efficient.heat), hint: 'That is the power that heats the motor. Efficiency uses the useful power.' },
      ],
      result: { symbol: 'efficiency', value: X.efficient.right * 100, unit: '%' },
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
      body: ['P = Fv: twice the speed against air, eight times the power.'],
      fig: ride({ compare: RIDE.fast }),
    },
  ],
  skillCheck: [
    {
      id: 'car',
      kind: 'build',
      prompt: `A car travels at a steady ${CAR.v} m s⁻¹ on a level road, its engine giving a useful power of ${CAR.P / 1000} kW. Build the total resistive force.`,
      equation: 'F = {P} ÷ {v}',
      boxes: { P: 'power', v: 'speed' },
      chips: [
        { id: 'power', label: KW(CAR.P) },
        { id: 'speed', label: `${CAR.v}${NB}m s⁻¹` },
        { id: 'field', label: G9, hint: 'This is a level road: g does not come into it.' },
      ],
      result: { symbol: 'F', value: X.car.right / 1000, unit: 'kN' },
      why: `At a steady speed the driving force equals the resistance: F = P ÷ v = ${CAR.P} ÷ ${CAR.v} = ${KN(X.car.right)}.`,
    },
    {
      id: 'max-eff',
      kind: 'order',
      prompt: 'Why can the efficiency of a machine never be more than 100%? Put the steps in order.',
      steps: [
        { id: 'cons', text: 'Energy is conserved: it cannot be created.' },
        { id: 'sum', text: 'So useful output + wasted output = total input.' },
        { id: 'waste', text: 'Wasted output is never negative: it heats the surroundings.' },
        { id: 'less', text: 'So useful output ≤ total input: efficiency ≤ 100%.' },
      ],
      hint: 'Start with the conservation of energy, then split the input into two parts.',
      why: 'Total input = useful + wasted, and wasted ≥ 0. So useful ÷ total can reach 100% only if nothing is wasted.',
    },
    {
      id: 'lift-power',
      kind: 'choice',
      prompt: 'A lift carries a load upwards at a steady speed. What gives its useful power output?',
      options: [
        { id: 'mv', label: 'The load’s mass × its speed' },
        { id: 'right', label: 'The load’s weight × its speed', correct: true },
        { id: 'wh', label: 'The load’s weight × the height it rises' },
        { id: 'wOverV', label: 'The load’s weight ÷ its speed' },
      ],
      why: 'At a steady speed the cable pulls with a force equal to the weight, so P = Fv = weight × speed. Weight × height is the work done, an energy.',
    },
    {
      id: 'crane',
      kind: 'examCard',
      context: `A crane’s motor takes ${CRANE.input / 1000} kW from the mains. It lifts a ${CRANE.m} kg load ${fixed(CRANE.h, 1)} m in ${fixed(CRANE.t, 1)} s at a steady speed. Take g = 9.81 N kg⁻¹.`,
      parts: [
        {
          id: 'a',
          command: 'Calculate',
          text: 'the useful power output of the crane.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'P = {m} × {g} × {h} ÷ {t}',
            boxes: { m: 'mass', g: 'field', h: 'height', t: 'time' },
            chips: [
              { id: 'mass', label: `${CRANE.m}${NB}kg` },
              { id: 'field', label: G9 },
              { id: 'height', label: `${fixed(CRANE.h, 1)}${NB}m` },
              { id: 'time', label: `${fixed(CRANE.t, 1)}${NB}s` },
              { id: 'input', label: KW(CRANE.input), hint: 'That is the power the motor takes in. Useful power comes from the lift.' },
            ],
            result: { symbol: 'P', value: X.crane.power / 1000, unit: 'kW' },
          },
          why: `Useful work = mgΔh = ${CRANE.m} × ${G} × ${fixed(CRANE.h, 1)} = ${J(potentialChange(CRANE.m, CRANE.h))}, in ${fixed(CRANE.t, 1)} s: P = ${KW(X.crane.power)}. One mark for the work, one for the power.`,
        },
        {
          id: 'b',
          command: 'Calculate',
          text: 'the efficiency of the crane.',
          marks: 1,
          kind: 'build',
          build: {
            equation: 'efficiency = {useful} ÷ {input}',
            boxes: { useful: 'useful', input: 'input' },
            chips: [
              { id: 'useful', label: KW(X.crane.power) },
              { id: 'input', label: KW(CRANE.input) },
              { id: 'heat', label: KW(X.crane.heat), hint: 'That is the power that heats the motor. Efficiency uses the useful power.' },
            ],
            result: { symbol: 'efficiency', value: X.crane.eff * 100, unit: '%' },
          },
          why: `Efficiency = useful ÷ total = ${sig(X.crane.power / 1000)} ÷ ${CRANE.input / 1000} = ${PC(X.crane.eff)}.`,
        },
      ],
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
