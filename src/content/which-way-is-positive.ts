// Lesson "Which way is positive?" — scalars and vectors, distance and displacement, speed and velocity, signs on a
// line and vectors at right angles. WPH11 points 4 and 6.
// The puzzle: runners A and B leave the same lamp post. In 200 s runner A runs 300 m east, then 500 m west;
// runner B walks 200 m west. Whose average velocity is greater?
// The answer: the same, −1.0 m s⁻¹ each (east positive), although runner A ran four times as far.
// Spec: docs/lessons/which-way-is-positive.md. Format v3 (V2 task D1): sort, estimate, build, spotError and a worked example
// replace the old text screens and number choices; the Skill check ends with an exam-style card.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { tripDistance, tripPosition, tripVelocity, type Trip } from '../physics/kinematics.ts';
import { angleFromFirst, chordAround, radiusOf, sizeAtRightAngles } from '../physics/vectors.ts';
import { fixed, sig, signed } from '../physics/format.ts';
import type { Lesson, TrackFig, VectorsFig } from './types.ts';

const NB = '\u00A0'; // numbers never break from their units
/** "4.0 m s⁻¹" */
const speed = (v: number) => `${fixed(v, 1)}${NB}m${NB}s⁻¹`;
/** "−1.0 m s⁻¹", "+4.0 m s⁻¹" */
const vel = (v: number) => `${signed(v, 1)}${NB}m${NB}s⁻¹`;
/** "300 m" */
const metres = (x: number) => `${fixed(x, 0)}${NB}m`;
/** "200 s" */
const secs = (t: number) => `${fixed(t, 0)}${NB}s`;
/** "5.0 km" */
const km = (x: number) => `${fixed(x, 1)}${NB}km`;

// The race, east positive. Runner A runs out east and back west at the same speed; runner B walks steadily west.
export const T = 200; // s, both runs
export const RUN_A: Trip = { u: 4, phases: [{ dt: 75, a: 0 }, { dt: 125, a: 0, v: -4 }] };
export const RUN_B: Trip = { u: -1, phases: [{ dt: T, a: 0 }] };
/** The moment of the "who is faster" screen: both are moving west. */
export const T_MID = 120;

// The hiker: north, then east (km)
export const HIKE = { north: 3, east: 4 };
// The swimmer: straight across, and the current along the river (m s⁻¹)
export const SWIM = { across: 1.2, current: 0.9 };
// Half a lap of a circular track
export const LAP = { round: 400, t: 40 };
// The ball against a wall, towards the wall positive (m s⁻¹)
export const BOUNCE = { u: 6, v: -4 };

/** Distances, displacements, velocities and named mistakes, used by the screens and re-checked by the test. */
export const ANSWERS = (() => {
  const tTurn = RUN_A.phases[0].dt;
  const out = tripPosition(tTurn, RUN_A);
  const dispA = tripPosition(T, RUN_A);
  const distA = tripDistance(0, T, RUN_A);
  const vBack = tripVelocity(tTurn + 1, RUN_A);
  const tHome = tTurn + out / Math.abs(vBack); // runner A passes the lamp post on the way back
  const hike = sizeAtRightAngles(HIKE.north, HIKE.east);
  const swim = sizeAtRightAngles(SWIM.across, SWIM.current);
  const chord = chordAround(LAP.round, 0.5);
  return {
    out,
    back: dispA - out,
    distA,
    dispA,
    dispB: tripPosition(T, RUN_B),
    avgSpeedA: distA / T,
    avgVelA: dispA / T,
    avgVelB: tripPosition(T, RUN_B) / T,
    vA: tripVelocity(T_MID, RUN_A),
    vB: tripVelocity(T_MID, RUN_B),
    tTurn,
    tHome,
    distHome: tripDistance(0, tHome, RUN_A),
    hike: {
      right: hike,
      added: HIKE.north + HIKE.east, // the sizes added as if both pointed the same way
      subtracted: HIKE.east - HIKE.north,
      angle: angleFromFirst(HIKE.north, HIKE.east), // east of north
      fromEast: angleFromFirst(HIKE.east, HIKE.north), // tan⁻¹(3/4): the angle from the east line
    },
    swim: {
      right: swim,
      added: SWIM.across + SWIM.current,
      subtracted: SWIM.across - SWIM.current,
      squaresSubtracted: Math.sqrt(SWIM.across ** 2 - SWIM.current ** 2),
    },
    lap: {
      chord,
      right: chord / LAP.t,
      speed: LAP.round / 2 / LAP.t, // the average speed: half the track ÷ time
      radius: radiusOf(LAP.round) / LAP.t, // the radius instead of the diameter
    },
    bounce: {
      right: BOUNCE.v - BOUNCE.u,
      sizes: Math.abs(BOUNCE.v) - Math.abs(BOUNCE.u), // both taken as positive
      sizesFlipped: Math.abs(BOUNCE.u) - Math.abs(BOUNCE.v),
      flipped: BOUNCE.u - BOUNCE.v, // u − v
    },
  };
})();

const x = ANSWERS;

const BOTH: TrackFig['runners'] = [
  { id: 'A', trip: RUN_A },
  { id: 'B', trip: RUN_B },
];
const ONLY_A: TrackFig['runners'] = [{ id: 'A', trip: RUN_A }];
const track = (over: Partial<TrackFig> = {}): TrackFig => ({ kind: 'track', runners: BOTH, tEnd: T, plus: 'east', ...over });
const hike = (over: Partial<VectorsFig> = {}): VectorsFig => ({
  kind: 'vectors',
  header: 'north, then east',
  unit: 'km',
  grid: 1,
  compass: true,
  legs: [
    { east: 0, north: HIKE.north, label: `${fixed(HIKE.north, 1)} km N` },
    { east: HIKE.east, north: 0, label: `${fixed(HIKE.east, 1)} km E` },
  ],
  resultant: 'unknown',
  ...over,
});

export const whichWayIsPositive: Lesson = {
  id: 'vectors-signs',
  title: 'Which way is positive?',
  spec: [4, 6],
  minutes: 11,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'Signs and arrows', from: 'signs' },
    { title: 'Back to the runners', from: 'hook-again' },
  ],
  cast: ['Noor'],
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Which way is positive?',
      body: `Runners A and B leave a lamp post. In ${secs(T)}, A runs ${metres(x.out)} east, then ${metres(-x.back)} west. B walks ${metres(-x.dispB)} west.`,
      fig: track(),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: `Both runs take ${secs(T)}. Whose average velocity is greater?`,
      fig: track(),
      options: [
        { id: 'A', label: "Runner A's" },
        { id: 'B', label: "Runner B's" },
        { id: 'same', label: 'They are the same', correct: true },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'quantities',
      kind: 'sort',
      prompt: 'Sort these quantities into scalars and vectors.',
      bins: [
        { id: 'scalar', label: 'Scalar' },
        { id: 'vector', label: 'Vector' },
      ],
      items: [
        { id: 'distance', label: 'Distance', bin: 'scalar', hint: 'A path length has a size and no direction: a scalar.' },
        { id: 'displacement', label: 'Displacement', bin: 'vector', hint: 'Displacement is an arrow from start to finish: size and direction.' },
        { id: 'speed', label: 'Speed', bin: 'scalar', hint: 'Speed is only the size of the velocity: a scalar.' },
        { id: 'velocity', label: 'Velocity', bin: 'vector', hint: 'Velocity is speed with a direction: a vector.' },
        { id: 'time', label: 'Time', bin: 'scalar', hint: 'Time has no direction: a scalar.' },
        { id: 'acceleration', label: 'Acceleration', bin: 'vector', hint: 'Acceleration points somewhere: it is a vector.' },
      ],
      why: 'A scalar has a size only; a vector has a size and a direction. Speed goes with velocity, distance with displacement, but distance is not the size of the displacement.',
    },
    {
      id: 'distance',
      kind: 'text',
      body: [`**Distance** is the length of the path: ${metres(x.out)} out plus ${metres(-x.back)} back, ${metres(x.distA)}.`],
      fig: track({ runners: ONLY_A, legs: true, at: 'end' }),
    },
    {
      id: 'finish',
      kind: 'estimate',
      prompt: 'Displacement is the arrow from the start to the finish. East is positive: where does runner A finish?',
      fig: track({ runners: ONLY_A, legs: true, at: 'start' }),
      after: track({ runners: ONLY_A, legs: true, play: true, disp: 'shown', numbers: true }),
      scale: { min: -400, max: 400, step: 10, tick: 100, unit: 'm', symbol: 's', dp: 0, label: "Runner A's displacement" },
      answer: x.dispA,
      tolerance: 20,
      why: `Displacement = (${signed(x.out, 0)}) + (${signed(x.back, 0)}) = ${signed(x.dispA, 0)}${NB}m: ${metres(-x.dispA)} west. The path was ${metres(x.distA)}, but only the start and the finish count.`,
    },
    {
      id: 'signs',
      kind: 'text',
      body: [
        `On a straight line a direction is just a **sign**. Choose east as positive: ${metres(x.out)} east is ${signed(x.out, 0)}${NB}m, ${metres(-x.back)} west is ${signed(x.back, 0)}${NB}m.`,
        `Displacement = (${signed(x.out, 0)}) + (${signed(x.back, 0)}) = **${signed(x.dispA, 0)}${NB}m**. The minus sign does not mean less. It means west.`,
      ],
    },
    {
      id: 'avg-velocity',
      kind: 'build',
      prompt: "Average velocity = displacement ÷ time. East is positive. Build runner A's average velocity.",
      fig: track({ runners: ONLY_A, legs: true, at: 'end', disp: 'shown' }),
      equation: 'v = {s} ÷ {t}',
      boxes: { s: 'disp', t: 'time' },
      chips: [
        { id: 'disp', label: `${signed(x.dispA, 0)}${NB}m` },
        { id: 'time', label: secs(T) },
        { id: 'path', label: metres(x.distA), hint: `That is the distance A ran, not the displacement.` },
        { id: 'plus', label: `${signed(-x.dispA, 0)}${NB}m`, hint: 'Runner A finishes west of the lamp post, so s is negative.' },
        { id: 'leg', label: metres(x.out), hint: 'That is the first leg alone. Use the whole displacement.' },
      ],
      result: { symbol: 'v', value: x.avgVelA, unit: 'm s⁻¹', sf: 2 },
      why: `${signed(x.dispA, 0)}${NB}m ÷ ${secs(T)} = ${vel(x.avgVelA)}: ${speed(-x.avgVelA)} west. The average speed is ${metres(x.distA)} ÷ ${secs(T)} = ${speed(x.avgSpeedA)}.`,
    },
    {
      id: 'working',
      kind: 'spotError',
      prompt: "Noor works out runner A's average velocity. Her working has one mistake. Which line?",
      lines: [
        { id: 'data', text: `A runs ${metres(x.out)} east, then ${metres(-x.back)} west, in ${secs(T)}.`, hint: 'That line only copies the data.' },
        { id: 'rule', text: 'Average velocity = displacement ÷ time', hint: 'That is the right rule. Velocity uses displacement.' },
        {
          id: 'calc',
          text: `v = ${metres(x.distA)} ÷ ${secs(T)} = ${vel(x.avgSpeedA)}`,
          wrong: true,
          fix: `v = (${signed(x.dispA, 0)}${NB}m) ÷ ${secs(T)} = ${vel(x.avgVelA)}`,
        },
        { id: 'end', text: `So A moves at ${vel(x.avgSpeedA)}, towards the east.`, hint: `This follows from the line above. Where did ${metres(x.distA)} come from?` },
      ],
      why: `Velocity divides the displacement, ${signed(x.dispA, 0)}${NB}m, by the time. ${metres(x.distA)} is the distance: ${speed(x.avgSpeedA)} is the average speed.`,
    },
    {
      id: 'flip',
      kind: 'choice',
      prompt: "You choose which way is positive. Take west as positive instead. What is runner A's average velocity now?",
      fig: track({ runners: ONLY_A, legs: true, at: 'end', disp: 'afterCheck', plus: 'west', numbers: true }),
      options: [
        { id: 'right', label: vel(-x.avgVelA), correct: true },
        { id: 'same', label: vel(x.avgVelA), hint: `With west positive, the displacement to the west is ${signed(-x.dispA, 0)}${NB}m.` },
        { id: 'speed', label: vel(x.avgSpeedA), hint: 'That is the average speed. Velocity uses the displacement.' },
      ],
      why: `The motion is the same, only the sign flips: ${signed(-x.dispA, 0)}${NB}m ÷ ${secs(T)} = ${vel(-x.avgVelA)}. Choose + once and never switch halfway.`,
    },
    {
      id: 'plane',
      kind: 'text',
      body: ['Off a straight line a sign is not enough: add vectors **tip to tail**.'],
      fig: hike(),
    },
    {
      id: 'hiker',
      kind: 'worked',
      title: 'Worked example',
      fig: hike({ resultant: 'shown', play: true }),
      steps: [
        { text: `A hiker walks ${km(HIKE.north)} north, then ${km(HIKE.east)} east. Draw the legs tip to tail: they meet at a right angle.` },
        { text: 'The resultant runs from the first tail to the last tip. At a right angle its size comes from Pythagoras.', math: 'R² = a² + b²' },
        { text: 'Put in the numbers, with their units.', math: `R = √(${fixed(HIKE.north, 1)}² + ${fixed(HIKE.east, 1)}²) km` },
      ],
      last: {
        prompt: 'So how far from the start does the hiker end up?',
        options: [
          { id: 'right', label: km(x.hike.right), correct: true },
          { id: 'added', label: km(x.hike.added) },
          { id: 'subtracted', label: km(x.hike.subtracted) },
        ],
      },
    },
    {
      id: 'bearing',
      kind: 'choice',
      prompt: 'In which direction from the start does the hiker end up?',
      fig: hike({ resultant: 'shown', angle: 'afterCheck' }),
      options: [
        { id: 'right', label: `${fixed(x.hike.angle, 0)}° east of north`, correct: true },
        { id: 'from-east', label: `${fixed(x.hike.fromEast, 0)}° east of north`, hint: `tan⁻¹(${fixed(HIKE.north, 1)} ÷ ${fixed(HIKE.east, 1)}) is the angle from the east line, not from north.` },
        { id: 'equal', label: '45° east of north', hint: `45° needs equal legs: ${km(HIKE.north)} and ${km(HIKE.east)} are not.` },
        { id: 'west', label: `${fixed(x.hike.angle, 0)}° west of north`, hint: 'The second leg went east, so the resultant leans east of north.' },
      ],
      why: `tan θ = ${fixed(HIKE.east, 1)} ÷ ${fixed(HIKE.north, 1)}, so θ = ${fixed(x.hike.angle, 0)}° from the north line, towards the east. As a bearing: 0${fixed(x.hike.angle, 0)}°.`,
    },
    {
      id: 'rules',
      kind: 'text',
      body: ['At any other angle, make a **scale drawing**: draw the arrows tip to tail with a ruler and a protractor, then measure the resultant.'],
      card: { term: 'Adding two vectors', text: 'Along one line: add them with their signs. At right angles: Pythagoras for the size, tan for the angle. Any angle: a scale drawing.' },
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Back to the two runners. Runner B walks ${metres(-x.dispB)} west in the same ${secs(T)}. Whose average velocity is greater?`,
      fig: track({ at: 'end', disp: 'shown' }),
      options: [
        { id: 'A', label: "Runner A's", hint: 'A ran farther, but finished in the same place. Velocity uses displacement.' },
        { id: 'B', label: "Runner B's", hint: `Both end ${metres(-x.dispA)} west of the lamp post after ${secs(T)}.` },
        { id: 'same', label: 'They are the same', correct: true },
      ],
      why: `Both end ${metres(-x.dispA)} west after ${secs(T)}: ${vel(x.avgVelA)} each. Runner A's average speed, ${speed(x.avgSpeedA)}, is four times runner B's.`,
    },
    {
      id: 'scrub',
      kind: 'explore',
      instruction: 'Drag the slider to run the clock.',
      fig: track({ numbers: true }),
      slider: { min: 0, max: T, step: 5, tick: 25, label: 'Time since the runners set off', unit: 's', symbol: 't', dp: 0 },
      question: {
        prompt: 'When is runner A back at the lamp post?',
        options: [
          { id: 'turn', label: `At ${secs(x.tTurn)}`, hint: `At ${secs(x.tTurn)} runner A turns round, ${metres(x.out)} east of the lamp post.` },
          { id: 'home', label: `At ${secs(x.tHome)}`, correct: true },
          { id: 'end', label: `At ${secs(T)}`, hint: `At ${secs(T)} runner A is ${metres(-x.dispA)} west. It passed the lamp post earlier.` },
        ],
        right: `Right: at ${secs(x.tHome)}. Distance ${metres(x.distHome)}, displacement 0${NB}m.`,
      },
    },
  ],
  skillCheck: [
    {
      id: 'river',
      kind: 'build',
      prompt: `A swimmer swims at ${speed(SWIM.across)} straight across a river. The current flows at ${speed(SWIM.current)}. Build the swimmer's resultant speed.`,
      fig: {
        kind: 'vectors',
        header: 'across the river, then downstream',
        unit: 'm s⁻¹',
        grid: 0.3,
        legs: [
          { east: 0, north: SWIM.across, label: `swim ${fixed(SWIM.across, 1)} m s⁻¹` },
          { east: SWIM.current, north: 0, label: `current ${fixed(SWIM.current, 1)} m s⁻¹` },
        ],
        resultant: 'afterCheck',
      },
      equation: 'R = √({across}² + {current}²)',
      boxes: { across: 'across', current: 'current' },
      chips: [
        { id: 'across', label: speed(SWIM.across) },
        { id: 'current', label: speed(SWIM.current) },
        { id: 'added', label: speed(x.swim.added), hint: 'That adds the speeds. At right angles they do not simply add.' },
        { id: 'subtracted', label: speed(x.swim.subtracted), hint: 'That subtracts the speeds. They are not opposite.' },
        { id: 'root', label: speed(x.swim.squaresSubtracted), hint: 'That is a root of a difference. The squares are added.' },
      ],
      result: { symbol: 'R', value: x.swim.right, unit: 'm s⁻¹', sf: 2 },
      why: `The two velocities are at right angles: √(${fixed(SWIM.across, 1)}² + ${fixed(SWIM.current, 1)}²) = ${speed(x.swim.right)}. Adding only works for vectors in the same direction.`,
    },
    {
      id: 'bounce',
      kind: 'spotError',
      prompt: `A ball hits a wall at ${speed(BOUNCE.u)} and bounces straight back at ${speed(-BOUNCE.v)}. Which line of this working is wrong?`,
      lines: [
        { id: 'signs', text: `Towards the wall is +: u = ${vel(BOUNCE.u)}, v = ${vel(BOUNCE.v)}`, hint: 'That line only sets the signs, and they are right.' },
        { id: 'rule', text: 'Change in velocity: Δv = v − u', hint: 'That is the right rule for a change.' },
        { id: 'calc', text: `Δv = ${fixed(Math.abs(BOUNCE.v), 1)} − ${fixed(Math.abs(BOUNCE.u), 1)} = ${vel(x.bounce.sizes)}`, wrong: true, fix: `Δv = (${signed(BOUNCE.v, 1)}) − (${signed(BOUNCE.u, 1)}) = ${vel(x.bounce.right)}` },
        { id: 'end', text: `So the velocity changes by ${vel(x.bounce.sizes)}.`, hint: `This follows from the line above. Check where ${signed(x.bounce.sizes, 1)} came from.` },
      ],
      why: `The signs matter: v = ${signed(BOUNCE.v, 1)}, u = ${signed(BOUNCE.u, 1)}, so Δv = ${vel(x.bounce.right)}. With sizes only it looks as if the ball had just slowed down.`,
    },
    {
      id: 'brake-sign',
      kind: 'choice',
      prompt: 'A cyclist rides west and brakes to a stop. East is positive. What is the sign of the acceleration?',
      options: [
        { id: 'right', label: 'Positive: the velocity changes towards the east', correct: true },
        { id: 'slow', label: 'Negative: the cyclist is slowing down' },
        { id: 'west', label: 'Negative: the cyclist moves west' },
        { id: 'zero', label: 'Zero: the cyclist ends at rest' },
      ],
      why: 'West is negative, so the velocity goes from −v up to 0: the change is positive. Slowing down does not make an acceleration negative.',
    },
    {
      id: 'half-lap',
      kind: 'examCard',
      context: `A runner runs half a lap of a circular track, ${metres(LAP.round)} round, in ${secs(LAP.t)}.`,
      parts: [
        {
          id: 'a',
          command: 'State',
          text: 'the difference between distance and displacement.',
          marks: 1,
          kind: 'choice',
          options: [
            { id: 'right', label: 'Distance has size only; displacement also has a direction', correct: true },
            { id: 'swap', label: 'Distance is a vector; displacement is a scalar' },
            { id: 'path', label: 'Displacement is the length of the path' },
            { id: 'same', label: 'They are equal when the runner moves in a circle' },
          ],
          why: 'Distance is a scalar, the length of the path. Displacement is a vector, the straight line from start to finish.',
        },
        {
          id: 'b',
          command: 'Calculate',
          text: "the size of the runner's average velocity.",
          marks: 2,
          kind: 'build',
          build: {
            equation: 'v = {s} ÷ {t}',
            boxes: { s: 'chord', t: 'time' },
            chips: [
              { id: 'chord', label: metres(Number(sig(x.lap.chord))) },
              { id: 'time', label: secs(LAP.t) },
              { id: 'half', label: metres(LAP.round / 2), hint: 'That is half the track, the distance. Use the displacement.' },
              { id: 'radius', label: `${sig(radiusOf(LAP.round))}${NB}m`, hint: 'That is the radius. Across half a lap is the diameter.' },
            ],
            result: { symbol: 'v', value: x.lap.right, unit: 'm s⁻¹', sf: 2 },
          },
          why: `The displacement is the diameter: ${fixed(LAP.round, 0)} ÷ π = ${metres(x.lap.chord)}. ${metres(x.lap.chord)} ÷ ${secs(LAP.t)} = ${speed(x.lap.right)}.`,
        },
      ],
    },
  ],
  youCanNow: [
    'Sort quantities into scalars and vectors',
    'Tell distance from displacement, and speed from velocity',
    'Keep one sign convention all the way through a problem',
    'Add two vectors at right angles: size and direction',
  ],
  recap: {
    fig: track({ play: true, disp: 'shown', numbers: true }),
    text: `Runner A ran ${metres(x.distA)}, runner B walked ${metres(-x.dispB)}, yet both ended ${metres(-x.dispA)} west after ${secs(T)}: the same average velocity, ${vel(x.avgVelA)}.`,
  },
  card: {
    formula: 'velocity = s ÷ t',
    idea: 'Velocity uses displacement, speed uses distance. A minus sign is a direction: choose + once and keep it.',
  },
};
