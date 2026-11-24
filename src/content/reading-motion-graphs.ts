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
/** "10 s": a whole number of seconds */
const wholeSecs = (t: number) => `${fixed(t, 0)}${NB}s`;
/** "2.5 m s⁻²" */
const acc = (a: number) => `${fixed(a, 1)}${NB}m${NB}s⁻²`;

// The chase: car A keeps a steady VA; car B starts from rest beside it with acceleration AB. Forward is positive.
export const VA = 10; // m s⁻¹
export const AB = 2.5; // m s⁻²
const T_SHOWN = 9; // s, the graphs run this far
export const TRIP_A: Trip = { u: VA, phases: [{ dt: T_SHOWN, a: 0 }] };
export const TRIP_B: Trip = { u: 0, phases: [{ dt: T_SHOWN, a: AB }] };

// Other journeys
/** A tram between two stops: speeds up, runs steadily, brakes. */
export const TRAM: Trip = { u: 0, phases: [{ dt: 4, a: 2 }, { dt: 6, a: 0 }, { dt: 2, a: -4 }] };
/** A car braking steadily to a stop (the Skill check). */
export const BRAKING: Trip = { u: 20, phases: [{ dt: 8, a: -2.5 }] };
/** The wrong graphs of the Skill check's graph pick: a steady speed, and a speed that grows. */
const STEADY: Trip = { u: 20, phases: [{ dt: 8, a: 0 }] };
const SPEEDING: Trip = { u: 0, phases: [{ dt: 8, a: 2.5 }] };
/** Car B's line mirrored in time: slowing down from where B ended up (a wrong graph in the story's graph pick). */
const SLOWING: Trip = { u: AB * T_SHOWN, phases: [{ dt: T_SHOWN, a: -AB }] };
/** The strip of car B's journey between two times, for the trapezoid. */
export const STRIP = { from: 4, to: 8 };

/** Times, distances and named mistakes, used by the screens and re-checked by reading-motion-graphs.test.ts. */
export const ANSWERS = (() => {
  const tCross = VA / AB; // the v–t lines cross: 10.0 = 2.5t
  const tLevel = 2 * tCross; // equal areas: 10.0t = ½ × 2.5t²
  const sA = tripPosition(tCross, TRIP_A);
  const sB = tripPosition(tCross, TRIP_B);
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
    strip: {
      right: tripDisplacement(STRIP.from, STRIP.to, TRIP_B), // the trapezoid
      u: tripVelocity(STRIP.from, TRIP_B),
      v: tripVelocity(STRIP.to, TRIP_B),
      dt: STRIP.to - STRIP.from,
    },
    brake: { right: tripDisplacement(0, 8, BRAKING), t: 8, v: BRAKING.u },
    tram: {
      right: tripDisplacement(0, 10, TRAM), // the trapezoid: ½ (10 + 6) × 8
      long: 10,
      short: 6,
      top: tripVelocity(4, TRAM),
      whole: tripDistance(0, 12, TRAM),
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

/** A v–t graph of one journey, for the graph picks. */
const lineOf = (header: string, trip: Trip, over: Partial<GraphFig> = {}): GraphFig => ({ kind: 'graph', y: 'v', header, lines: [{ id: '', trip }], tMax: T_SHOWN, tTick: 2, yMax: 25, yTick: 5, ...over });

export const readingMotionGraphs: Lesson = {
  id: 'motion-graphs',
  title: 'Reading motion graphs',
  spec: [2, 3],
  minutes: 12,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'Gradient and area', from: 'not-a-picture' },
    { title: 'Back to the cars', from: 'hook-again' },
  ],
  cast: ['Dana'],
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Reading motion graphs',
      body: `Car A drives past car B at a steady ${speed(VA)}. At that instant car B sets off after it, speeding up at ${acc(AB)}.`,
      fig: chase({ values: true }),
    },
    {
      id: 'pick-b',
      kind: 'graphPick',
      prompt: "Which v–t graph is car B's?",
      scene: chase({ values: true, until: 4 }),
      graphs: [
        { id: 'A', fig: lineOf('graph A', TRIP_A), hint: `A flat line is a steady velocity: that is car A at ${speed(VA)}.` },
        { id: 'B', fig: lineOf('graph B', SLOWING), hint: 'This line slopes down: the car is slowing. Car B starts from rest and speeds up.' },
        { id: 'C', fig: lineOf('graph C', TRIP_B), correct: true },
      ],
      why: `From rest, steady acceleration: a straight line from zero. Its gradient is the acceleration, ${acc(AB)}, so it reaches ${speed(tripVelocity(T_SHOWN, TRIP_B))} at ${secs(T_SHOWN)}.`,
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
      id: 'gradient',
      kind: 'text',
      body: ['The **gradient** of a v–t line is the acceleration: the rise in v divided by the time taken.'],
      fig: vt({ gradient: { line: 'B', from: 2, to: 6 } }),
    },
    {
      id: 'area-b',
      kind: 'choice',
      prompt: `The area under a v–t line is the displacement. How far has car B travelled by ${secs(x.tCross)}?`,
      fig: vt({ areas: [{ line: 'B', from: 0, to: x.tCross, value: 'afterCheck' }] }),
      options: [
        { id: 'height', label: metres(x.areaB.height), hint: `That is its velocity at ${secs(x.tCross)}, read off the axis. Displacement is the area.` },
        { id: 'right', label: metres(x.areaB.right), correct: true },
        { id: 'rectangle', label: metres(x.areaB.rectangle), hint: "That is a whole rectangle. Under car B's line there is only a triangle." },
      ],
      why: `The area is a triangle: ½ × ${fixed(x.tCross, 1)} × ${fixed(VA, 1)} = ${metres(x.areaB.right)}. Half of what car A has covered in the same time.`,
    },
    {
      id: 'strip',
      kind: 'build',
      prompt: `Car B keeps speeding up. Build how far it travels between ${secs(STRIP.from)} and ${secs(STRIP.to)}.`,
      fig: vt({ areas: [{ line: 'B', from: STRIP.from, to: STRIP.to, value: 'afterCheck' }] }),
      equation: 's = ½ × ({u} + {v}) × {t}',
      boxes: { u: 'u', v: 'v', t: 'dt' },
      chips: [
        { id: 'u', label: speed(x.strip.u) },
        { id: 'v', label: speed(x.strip.v) },
        { id: 'dt', label: secs(x.strip.dt) },
        { id: 'end', label: secs(STRIP.to), hint: `That is the end time. The strip is ${secs(x.strip.dt)} wide.` },
        { id: 'a', label: acc(AB), hint: 'That is the gradient: the acceleration, not a velocity.' },
      ],
      result: { symbol: 's', value: x.strip.right, unit: 'm' },
      why: `The strip is a trapezoid: the average height, ½ × (${fixed(x.strip.u, 1)} + ${fixed(x.strip.v, 1)}), times its width ${secs(x.strip.dt)}, is ${metres(x.strip.right)}.`,
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Back to the two cars. At ${secs(x.tCross)}, where is car B?`,
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
      id: 'why-not',
      kind: 'order',
      prompt: 'Why are the cars not level where the lines cross? Put the reasoning in order.',
      steps: [
        { id: 'cross', text: `At ${secs(x.tCross)} the lines cross: both cars have the same velocity.` },
        { id: 'ahead', text: 'Before that car A was the faster one, so it kept pulling ahead.' },
        { id: 'areas', text: `The area under A's line is ${metres(x.sA)}, under B's only ${metres(x.sB)}.` },
        { id: 'behind', text: `So car B is ${metres(x.gap)} behind: level means equal areas.` },
      ],
      hint: 'Start with what the crossing means, then who was ahead, then the areas.',
      why: 'Crossing lines mean equal velocities, not equal positions. Position is the area under the line, added up from the start.',
    },
    {
      id: 'scrub',
      kind: 'explore',
      instruction: 'Drag the slider to let time run on.',
      fig: vt({ cursor: true }),
      slider: { min: 0, max: T_SHOWN, step: 0.25, tick: 1, label: 'Time since car B set off', unit: 's', symbol: 't', dp: 2 },
      question: {
        prompt: `What happens to the gap between the cars after ${secs(x.tCross)}?`,
        options: [
          { id: 'grows', label: 'It keeps growing', hint: `After ${secs(x.tCross)} car B is the faster one. Watch the two areas.` },
          { id: 'shrinks', label: 'It shrinks', correct: true },
          { id: 'steady', label: 'It stays the same', hint: 'The two areas grow by different amounts every second.' },
        ],
        right: `Right: car B is now faster, so it gains on car A every second.`,
      },
    },
    {
      id: 'level',
      kind: 'estimate',
      prompt: 'Both cars started side by side. Drag to the time when car B draws level with car A.',
      fig: vt(),
      after: vt({
        between: [
          { from: 0, to: x.tCross },
          { from: x.tCross, to: x.tLevel },
        ],
      }),
      scale: { min: 0, max: T_SHOWN, step: 0.5, tick: 1, unit: 's', symbol: 't', dp: 1, label: 'Time when the cars are level' },
      answer: x.tLevel,
      tolerance: 1,
      why: `Level means equal areas: both are ${metres(x.sLevel)} at ${secs(x.tLevel)}. What car B loses before ${secs(x.tCross)}, it wins back by ${secs(x.tLevel)}.`,
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
  ],
  skillCheck: [
    {
      id: 'brake-graph',
      kind: 'graphPick',
      prompt: 'A car brakes steadily to a stop. Which v–t graph shows it?',
      graphs: [
        { id: 'A', fig: lineOf('graph A', STEADY, { tMax: 9, yMax: 25 }), hint: 'A flat line is a steady velocity: the car is not braking.' },
        { id: 'B', fig: lineOf('graph B', SPEEDING, { tMax: 9, yMax: 25 }), hint: 'This line rises: the car is speeding up.' },
        { id: 'C', fig: lineOf('graph C', BRAKING, { tMax: 9, yMax: 25 }), correct: true },
      ],
      why: `Steady braking is a straight line sloping down: the gradient is the acceleration, ${acc(-2.5)}, and the line reaches zero when the car stops.`,
    },
    {
      id: 'brake-area',
      kind: 'build',
      prompt: `The car brakes from ${speed(x.brake.v)} to rest in ${secs(x.brake.t)}. Build the distance it travels.`,
      fig: lineOf('car braking to a stop', BRAKING, { areas: [{ line: '', from: 0, to: x.brake.t, value: 'afterCheck' }] }),
      equation: 's = ½ × {t} × {v}',
      boxes: { t: 'time', v: 'speed' },
      chips: [
        { id: 'time', label: secs(x.brake.t) },
        { id: 'speed', label: speed(x.brake.v) },
        { id: 'gradient', label: acc(2.5), hint: 'That is the gradient: the acceleration, not a side of the triangle.' },
        { id: 'zero', label: speed(0), hint: 'That is the final velocity. The triangle is as tall as the starting velocity.' },
      ],
      result: { symbol: 's', value: x.brake.right, unit: 'm' },
      why: `The area is a triangle: ½ × ${fixed(x.brake.t, 1)} × ${fixed(x.brake.v, 1)} = ${metres(x.brake.right)}.`,
    },
    {
      id: 'below-axis',
      kind: 'choice',
      prompt: 'A v–t graph dips below the time axis for part of the journey. What does the area below the axis stand for?',
      options: [
        { id: 'right', label: 'Displacement in the negative direction', correct: true },
        { id: 'time', label: 'Time spent going backwards' },
        { id: 'slow', label: 'The body is slowing down' },
        { id: 'ignore', label: 'Nothing: only the area above the axis counts' },
      ],
      why: 'A negative velocity means moving the other way, so the area below the axis is negative displacement. It is subtracted from the area above.',
    },
    {
      id: 'tram',
      kind: 'examCard',
      context: `Dana rides a tram between two stops. Its v–t graph is shown.`,
      fig: { kind: 'graph', y: 'v', header: 'tram between two stops', lines: [{ id: '', trip: TRAM, until: 12 }], tMax: 13, tTick: 2, yMax: 10, yTick: 2 },
      parts: [
        {
          id: 'a',
          command: 'Describe',
          text: `the motion of the tram between ${wholeSecs(4)} and ${wholeSecs(10)}.`,
          marks: 1,
          kind: 'choice',
          options: [
            { id: 'right', label: 'It moves at a steady velocity', correct: true },
            { id: 'speeds', label: 'It speeds up steadily' },
            { id: 'rest', label: 'It is at rest' },
            { id: 'slows', label: 'It slows down steadily' },
          ],
          why: 'The line is flat there: the velocity is constant, so the acceleration is zero.',
        },
        {
          id: 'b',
          command: 'Calculate',
          text: `the distance the tram covers in the first ${wholeSecs(10)}.`,
          marks: 2,
          kind: 'build',
          build: {
            equation: 's = ½ × ({long} + {short}) × {height}',
            boxes: { long: 'long', short: 'short', height: 'height' },
            chips: [
              { id: 'long', label: secs(x.tram.long) },
              { id: 'short', label: secs(x.tram.short) },
              { id: 'height', label: speed(x.tram.top) },
              { id: 'four', label: secs(4), hint: `That is the speeding-up time. The parallel sides are ${secs(10)} and ${secs(6)}.` },
              { id: 'whole', label: secs(12), hint: `That is the whole journey, with the braking. Stop at ${wholeSecs(10)}.` },
            ],
            result: { symbol: 's', value: x.tram.right, unit: 'm' },
          },
          why: `The area up to ${wholeSecs(10)} is a trapezoid: ½ × (${fixed(x.tram.long, 1)} + ${fixed(x.tram.short, 1)}) × ${fixed(x.tram.top, 1)} = ${metres(x.tram.right)}. One mark for the values, one for the answer.`,
        },
      ],
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
