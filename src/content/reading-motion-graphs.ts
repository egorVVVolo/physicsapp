// Lesson "Reading motion graphs" — gradients and areas of s–t, v–t and a–t graphs, WPH11 points 2 and 3.
// The puzzle: car A drives past car B at a steady 10.0 m s⁻¹; at that instant car B sets off after it at 2.5 m s⁻².
// Their v–t lines cross at 4.0 s. Is car B level with car A then?
// The answer: no. It is 20.0 m behind, the farthest behind it ever gets. They are level at 8.0 s, when the areas
// under the two lines are equal (80.0 m). Spec: docs/lessons/reading-motion-graphs.md.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { tripDisplacement, tripDistance, tripPosition, tripVelocity, type Trip } from '../physics/kinematics.ts';
import { fixed } from '../physics/format.ts';
import type { ChaseFig, GraphFig, Lesson } from './types.ts';

const NB = '\u00A0'; // numbers never break from their units
/** "10.0 m s⁻¹" */
const speed = (v: number) => `${fixed(v, 1)}${NB}m${NB}s⁻¹`;
/** "20.0 m" */
const metres = (x: number) => `${fixed(x, 1)}${NB}m`;
/** "4.0 s" */
const secs = (t: number) => `${fixed(t, 1)}${NB}s`;
/** "2.5 m s⁻²" */
const acc = (a: number) => `${fixed(a, 1)}${NB}m${NB}s⁻²`;

// The chase: car A keeps a steady VA; car B starts from rest beside it with acceleration AB. Forward is positive.
export const VA = 10; // m s⁻¹
export const AB = 2.5; // m s⁻²
const T_SHOWN = 9; // s, the graphs run this far
export const TRIP_A: Trip = { u: VA, phases: [{ dt: T_SHOWN, a: 0 }] };
export const TRIP_B: Trip = { u: 0, phases: [{ dt: T_SHOWN, a: AB }] };

// Other journeys
/** A ball rolled up a ramp: it slows, stops and rolls back with the same acceleration. */
export const RAMP: Trip = { u: 6, phases: [{ dt: 5, a: -2 }] };
/** A tram between two stops: speeds up, runs steadily, brakes. */
export const TRAM: Trip = { u: 0, phases: [{ dt: 4, a: 2 }, { dt: 6, a: 0 }, { dt: 2, a: -4 }] };
/** A goods lift: up at a steady speed, then down at the same speed for longer. */
export const LIFT: Trip = { u: 2, phases: [{ dt: 4, a: 0 }, { dt: 6, a: 0, v: -2 }] };
/** A walk in four parts of steady velocity, for an s–t graph of straight pieces. */
export const WALK_PARTS = [
  { id: 'A', dt: 4, v: 2 },
  { id: 'B', dt: 2, v: 5 },
  { id: 'C', dt: 3, v: 0 },
  { id: 'D', dt: 3, v: -3 },
];
const WALK: Trip = { u: WALK_PARTS[0].v, phases: WALK_PARTS.map((part) => ({ dt: part.dt, a: 0, v: part.v })) };
/** A sprinter: the velocity rises quickly at first and then levels off, v = 11(1 − e^(−t/1.3)), in short straight pieces. */
const SPRINT_DT = 0.25;
const sprintV = (t: number) => 11 * (1 - Math.exp(-t / 1.3));
const SPRINTER: Trip = {
  u: 0,
  phases: Array.from({ length: 24 }, (_, i) => ({ dt: SPRINT_DT, a: (sprintV((i + 1) * SPRINT_DT) - sprintV(i * SPRINT_DT)) / SPRINT_DT })),
};

/** Times, distances and named mistakes, used by the screens and re-checked by reading-motion-graphs.test.ts. */
export const ANSWERS = (() => {
  const tCross = VA / AB; // the v–t lines cross: 10.0 = 2.5t
  const tLevel = 2 * tCross; // equal areas: 10.0t = ½ × 2.5t²
  const sA = tripPosition(tCross, TRIP_A);
  const sB = tripPosition(tCross, TRIP_B);
  const tTurn = RAMP.u / -RAMP.phases[0].a; // the ball stops for an instant
  const tEnd = RAMP.phases[0].dt;
  const tramTop = tripVelocity(4, TRAM);
  return {
    tCross,
    tLevel,
    sA,
    sB,
    gap: sA - sB,
    sLevel: tripPosition(tLevel, TRIP_A),
    vBLevel: tripVelocity(tLevel, TRIP_B),
    areaB: {
      right: sB,
      rectangle: VA * tCross, // height × width: forgot that it is a triangle
      height: tripVelocity(tCross, TRIP_B), // read the height of the line instead of the area
    },
    ramp: {
      tTurn,
      tEnd,
      up: tripDisplacement(0, tTurn, RAMP),
      back: tripDisplacement(tTurn, tEnd, RAMP),
      right: tripDisplacement(0, tEnd, RAMP),
      distance: tripDistance(0, tEnd, RAMP), // both areas counted as positive
    },
    tram: {
      right: tripDistance(0, 12, TRAM),
      steadyOnly: tripDisplacement(4, 10, TRAM), // only the flat part
      topTimesTotal: tramTop * 12, // top speed × total time
    },
    lift: {
      right: tripDisplacement(0, 10, LIFT),
      added: tripDistance(0, 10, LIFT), // both areas counted as positive
      onlyUp: tripDisplacement(0, 4, LIFT), // ignored the part below the axis
    },
    walk: {
      fastest: [...WALK_PARTS].sort((p, q) => Math.abs(q.v) - Math.abs(p.v))[0].id,
      highest: 'C', // where the s–t line is highest (checked by the test)
    },
  };
})();

const x = ANSWERS;

const HEADER = `A: steady ${fixed(VA, 1)} m s⁻¹, B: from rest`;
const CHASE_LINES: GraphFig['lines'] = [
  { id: 'A', trip: TRIP_A },
  { id: 'B', trip: TRIP_B },
];
const vt = (over: Partial<GraphFig> = {}): GraphFig => ({ kind: 'graph', y: 'v', header: HEADER, lines: CHASE_LINES, tMax: T_SHOWN, tTick: 2, yMax: 25, yTick: 5, ...over });
const st = (over: Partial<GraphFig> = {}): GraphFig => ({ kind: 'graph', y: 's', header: HEADER, lines: CHASE_LINES, tMax: T_SHOWN, tTick: 2, yMax: 110, yTick: 20, ...over });
const CARS: ChaseFig['cars'] = [
  { id: 'A', u: VA, a: 0 },
  { id: 'B', u: 0, a: AB },
];
const chase = (over: Partial<ChaseFig> = {}): ChaseFig => ({ kind: 'chase', cars: CARS, span: 90, until: x.tCross, ...over });

export const readingMotionGraphs: Lesson = {
  id: 'motion-graphs',
  title: 'Reading motion graphs',
  spec: [2, 3],
  minutes: 12,
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Reading motion graphs',
      body: `Car A drives past car B at a steady ${speed(VA)}. At that instant car B sets off after it, speeding up at ${acc(AB)}.`,
      fig: chase({ values: true }),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: `Here are both cars on a v–t graph. The lines cross at ${secs(x.tCross)}. What is happening at that moment?`,
      fig: vt({ ring: { line: 'B', at: x.tCross } }),
      options: [
        { id: 'catches', label: 'Car B catches car A' },
        { id: 'behind', label: 'Car B is still behind', correct: true },
        { id: 'ahead', label: 'Car B is already ahead' },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'not-a-picture',
      kind: 'text',
      body: [
        'A motion graph is **not a picture** of the road. Nothing on it shows directly where the cars are.',
        'On a v–t graph the **height** of a line means one thing only: how fast that car is moving at that time.',
      ],
    },
    {
      id: 'same-v',
      kind: 'choice',
      prompt: `So what do the two cars share at ${secs(x.tCross)}, where the lines cross?`,
      fig: vt({ ring: { line: 'B', at: x.tCross } }),
      options: [
        { id: 'position', label: 'The same position', hint: 'Height on this graph is velocity, not position.' },
        { id: 'velocity', label: 'The same velocity', correct: true },
        { id: 'acceleration', label: 'The same acceleration', hint: 'Acceleration is how steep a line is. These two are not equally steep.' },
      ],
      why: `Both lines are at ${speed(VA)} there, so the cars are equally fast. Where each car is, the graph does not say directly.`,
    },
    {
      id: 'gradient',
      kind: 'text',
      body: ['The **gradient** of a v–t line is the acceleration: the rise in v divided by the time taken.'],
      fig: vt({ gradient: { line: 'B', from: 2, to: 6 } }),
    },
    {
      id: 'flat',
      kind: 'choice',
      prompt: "Car A's line is flat. What does that tell you?",
      fig: vt(),
      options: [
        { id: 'rest', label: 'Car A is at rest', hint: `Flat at ${speed(VA)} is steady motion. At rest the line would lie on the axis.` },
        { id: 'zero-a', label: 'Its acceleration is zero', correct: true },
        { id: 'level-road', label: 'The road is level', hint: 'A graph is not a picture. Height here is velocity, not the shape of the road.' },
      ],
      why: `A flat v–t line has zero gradient, so a = 0: car A keeps moving at a steady ${speed(VA)}.`,
    },
    {
      id: 'area-a',
      kind: 'text',
      body: ['Car A keeps a steady v, so s = vt: the height times the width, the **area** under its line.'],
      fig: vt({ areas: [{ line: 'A', from: 0, to: x.tCross, value: 'shown', at: [1.25, 7.6] }] }),
    },
    {
      id: 'area-b',
      kind: 'choice',
      prompt: `The area under any v–t line is the displacement. How far has car B travelled by ${secs(x.tCross)}?`,
      fig: vt({ areas: [{ line: 'B', from: 0, to: x.tCross, value: 'afterCheck' }] }),
      options: [
        { id: 'height', label: metres(x.areaB.height), hint: `That is its velocity at ${secs(x.tCross)}, read off the axis. Displacement is the area.` },
        { id: 'right', label: metres(x.areaB.right), correct: true },
        { id: 'rectangle', label: metres(x.areaB.rectangle), hint: "That is a whole rectangle. Under car B's line there is only a triangle." },
      ],
      why: `The area is a triangle: ½ × ${fixed(x.tCross, 1)} × ${fixed(VA, 1)} = ${metres(x.areaB.right)}. Half of what car A has covered in the same time.`,
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Back to the puzzle. At ${secs(x.tCross)}, where is car B?`,
      fig: vt({
        areas: [
          { line: 'A', from: 0, to: x.tCross, value: 'shown', at: [1.35, 7.6] },
          { line: 'B', from: 0, to: x.tCross, value: 'shown', at: [2.9, 2.9] },
        ],
      }),
      options: [
        { id: 'level', label: 'Level with car A', hint: `Compare the areas: ${metres(x.sA)} under car A's line, ${metres(x.sB)} under car B's.` },
        { id: 'right', label: `${metres(x.gap)} behind car A`, correct: true },
        { id: 'forgot-b', label: `${metres(x.sA)} behind car A`, hint: `Car B has moved too: the triangle under its line is ${metres(x.sB)}.` },
        { id: 'ahead', label: `${metres(x.gap)} ahead of car A`, hint: 'Car A has the larger area so far, so car A is in front.' },
      ],
      why: `Car A has covered ${metres(x.sA)}, car B ${metres(x.sB)}. Until now car A was the faster one, so the gap kept growing: ${metres(x.gap)} is the largest it ever gets.`,
    },
    {
      id: 'road',
      kind: 'text',
      body: [`On the road: the gap grows while car A is the faster one, and stops growing at ${secs(x.tCross)}.`],
      fig: chase({ play: true }),
    },
    {
      id: 'scrub',
      kind: 'explore',
      instruction: 'Drag the slider to let time run on.',
      fig: vt({ cursor: true }),
      slider: { min: 0, max: T_SHOWN, step: 0.25, tick: 1, label: 'Time since car B set off', unit: 's', symbol: 't', dp: 2 },
      question: {
        prompt: 'When is car B level with car A?',
        options: [
          { id: 'cross', label: `At ${secs(x.tCross)}`, hint: `At ${secs(x.tCross)} the areas are ${metres(x.sA)} and ${metres(x.sB)}. Keep going.` },
          { id: 'level', label: `At ${secs(x.tLevel)}`, correct: true },
          { id: 'never', label: 'Never', hint: `After ${secs(x.tCross)} car B is the faster one. Watch the two areas.` },
        ],
        right: `Right: at ${secs(x.tLevel)} both areas are ${metres(x.sLevel)}.`,
      },
    },
    {
      id: 'equal-areas',
      kind: 'text',
      body: [`Level means **equal areas**. What car B loses before ${secs(x.tCross)}, it wins back by ${secs(x.tLevel)}.`],
      fig: vt({
        between: [
          { from: 0, to: x.tCross },
          { from: x.tCross, to: x.tLevel },
        ],
      }),
    },
    {
      id: 'st',
      kind: 'text',
      body: ['On an s–t graph the height is the position. Here crossing lines do mean **side by side**.'],
      fig: st({ ring: { line: 'A', at: x.tLevel } }),
    },
    {
      id: 'tangent',
      kind: 'choice',
      prompt: `On an s–t graph the gradient is the velocity. At ${secs(x.tCross)} the tangent to car B's curve is parallel to car A's line. What does that show?`,
      fig: st({ tangent: { line: 'B', at: x.tCross } }),
      options: [
        { id: 'side', label: 'The cars are side by side then', hint: 'Side by side would be the same height. Parallel means the same gradient.' },
        { id: 'same-v', label: 'The cars have the same velocity then', correct: true },
        { id: 'steady', label: 'Car B has stopped speeding up', hint: 'The curve keeps getting steeper, so car B is still speeding up.' },
      ],
      why: `Same gradient, same velocity: ${speed(VA)}. It is the moment the v–t lines cross, and the gap between the s–t lines is widest there.`,
    },
    {
      id: 'rules',
      kind: 'text',
      body: ['A curve has a different gradient at every point. To read it at one instant, draw the **tangent** there and find its gradient.'],
      card: { term: 'Gradient and area', text: 's–t: gradient = velocity. v–t: gradient = acceleration, area = displacement. a–t: area = change in velocity.' },
    },
    {
      id: 'ramp',
      kind: 'choice',
      prompt: `A ball is rolled up a ramp. From ${secs(x.ramp.tTurn)} its velocity is negative: it rolls back down. What is its displacement after ${secs(x.ramp.tEnd)}?`,
      fig: {
        kind: 'graph',
        y: 'v',
        header: 'ball on a ramp, up the ramp is +',
        lines: [{ id: '', trip: RAMP }],
        tMax: 5.5,
        tTick: 1,
        yMin: -6,
        yMax: 8,
        yTick: 2,
        areas: [
          { line: '', from: 0, to: x.ramp.tTurn, value: 'shown' },
          { line: '', from: x.ramp.tTurn, to: x.ramp.tEnd, value: 'shown' },
        ],
      },
      options: [
        { id: 'back', label: `${metres(-x.ramp.back)} down the ramp`, hint: 'That is only the part below the axis. First the ball went up.' },
        { id: 'right', label: `${metres(x.ramp.right)} up the ramp`, correct: true },
        { id: 'up', label: `${metres(x.ramp.up)} up the ramp`, hint: `That is how far up it got. Then it rolled back ${metres(-x.ramp.back)}.` },
        { id: 'distance', label: `${metres(x.ramp.distance)} up the ramp`, hint: 'That is the distance travelled. An area below the axis counts as negative.' },
      ],
      why: `Above the axis: +${metres(x.ramp.up)}. Below it: −${metres(-x.ramp.back)}. Displacement = ${fixed(x.ramp.up, 1)} − ${fixed(-x.ramp.back, 1)} = ${metres(x.ramp.right)} up the ramp. The distance is ${metres(x.ramp.distance)}.`,
    },
  ],
  skillCheck: [
    {
      id: 'tram',
      kind: 'choice',
      prompt: 'This v–t graph shows a tram running from one stop to the next. How far apart are the stops?',
      fig: { kind: 'graph', y: 'v', header: 'tram between two stops', lines: [{ id: '', trip: TRAM, until: 12 }], tMax: 13, tTick: 2, yMax: 10, yTick: 2 },
      options: [
        { id: 'steady', label: metres(x.tram.steadyOnly) },
        { id: 'right', label: metres(x.tram.right), correct: true },
        { id: 'top', label: metres(x.tram.topTimesTotal) },
      ],
      why: `The distance is the whole area: ${fixed(tripDisplacement(0, 4, TRAM), 1)} + ${fixed(x.tram.steadyOnly, 1)} + ${fixed(tripDisplacement(10, 12, TRAM), 1)} = ${metres(x.tram.right)}. Two triangles and a rectangle.`,
    },
    {
      id: 'fastest',
      kind: 'tapFig',
      prompt: 'This s–t graph shows a walk along a straight path. In which part does the walker move fastest?',
      instruction: 'Tap that part of the graph.',
      fig: {
        kind: 'graph',
        y: 's',
        header: 'a walk along a straight path',
        lines: [{ id: '', trip: WALK, until: 12 }],
        tMax: 13,
        tTick: 2,
        yMax: 20,
        yTick: 5,
        parts: (() => {
          let t = 0;
          return WALK_PARTS.map((part) => ({ id: part.id, from: t, to: (t += part.dt) }));
        })(),
      },
      options: WALK_PARTS.map((part) => (part.id === x.walk.fastest ? { id: part.id, label: `Part ${part.id}`, correct: true as const } : { id: part.id, label: `Part ${part.id}` })),
      why: `Speed is the gradient of an s–t graph, so look for the steepest part: B, at ${speed(5)}. In part C the line is highest, but flat: the walker stands still.`,
    },
    {
      id: 'lift',
      kind: 'choice',
      prompt: 'This v–t graph shows a goods lift; up is positive. Where is the lift at the end, compared with where it started?',
      fig: { kind: 'graph', y: 'v', header: 'goods lift, up is +', lines: [{ id: '', trip: LIFT, until: 10 }], tMax: 11, tTick: 2, yMin: -3, yMax: 3, yTick: 1 },
      options: [
        { id: 'right', label: `${metres(-x.lift.right)} below`, correct: true },
        { id: 'flipped', label: `${metres(-x.lift.right)} above` },
        { id: 'only-up', label: `${metres(x.lift.onlyUp)} above` },
        { id: 'added', label: `${metres(x.lift.added)} above` },
      ],
      why: `Up: 2.0 × 4.0 = +${metres(x.lift.onlyUp)}. Down: the area below the axis, −${metres(x.lift.onlyUp - x.lift.right)}. Displacement = ${fixed(x.lift.right, 1)}${NB}m: ${metres(-x.lift.right)} below the start.`,
    },
    {
      id: 'sprinter',
      kind: 'choice',
      prompt: `A sprinter's v–t graph is a curve. How do you find the distance covered in the first ${secs(4)}?`,
      fig: { kind: 'graph', y: 'v', header: 'sprinter, from the start', lines: [{ id: '', trip: SPRINTER, until: 6 }], tMax: 6.5, tTick: 1, yMax: 12, yTick: 2 },
      options: [
        { id: 'suvat', label: 'Use s = ut + ½at²' },
        { id: 'final', label: `Multiply the velocity at ${secs(4)} by ${secs(4)}` },
        { id: 'area', label: 'Estimate the area under the curve', correct: true },
        { id: 'tangent', label: `Find the gradient of the tangent at ${secs(4)}` },
      ],
      why: 'The acceleration is not constant, so suvat does not apply. The area under a v–t graph is the displacement for any motion: count the squares.',
    },
  ],
  youCanNow: [
    'Read velocity and acceleration from gradients',
    'Find displacement from the area under a v–t graph, with its sign',
    'Say what crossing lines mean on a v–t graph and on an s–t graph',
  ],
  recap: {
    fig: chase({ play: true, until: x.tLevel }),
    text: `The lines cross at ${secs(x.tCross)}, but the cars are level at ${secs(x.tLevel)}, when the areas are equal: ${metres(x.sLevel)} each.`,
  },
  card: {
    formula: 's = area under v–t',
    idea: 'Gradient of s–t is v, gradient of v–t is a. Crossing v–t lines mean equal speeds, not side by side.',
  },
};
