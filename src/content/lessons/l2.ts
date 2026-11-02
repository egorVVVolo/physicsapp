import { Lesson, LabView, Step } from '../../engine/types';
import { accelerationAt, displacementAt, distanceAt, duration, evenGraph, Graph, pieceArea, piecesUpTo, slopeOfSt } from '../../physics/motion';

// Lesson 2: read motion from a graph, built around the mistakes that cost marks.
// Every number below comes from the physics model.

const area = (g: Graph) => piecesUpTo(g, duration(g)).reduce((s, p) => s + pieceArea(p), 0);
const r2 = (n: number) => Number(n.toFixed(2));

// Gate stimulus: a plain velocity graph with a hill and no turn-round.
const gateGraph: Graph = { t: [0, 4, 8, 12], v: [0, 8, 8, 0] };
const gateLab: LabView = { graph: gateGraph, showSt: false, track: false, vRange: [-4, 12] };

// Trap 1: speed peaks at 4 s, never goes negative.
const peak: Graph = { t: [0, 4, 8, 12], v: [0, 12, 6, 0] };
// Trap 2 and the challenge: forward, then back.
export const turnBack: Graph = evenGraph([0, 6, 6, 0, -6]);
// Trap 4: a trapezium. Speed rises from 4 to 10 m/s in 3 s.
export const trapGraph: Graph = { t: [0, 3, 8], v: [4, 10, 10] };
// Match the graphs: speeds up, then constant.
export const pickCorrect: Graph = evenGraph([0, 4, 8, 8, 8]);
export const pickOptions: Graph[] = [evenGraph([8, 8, 8, 4, 0]), pickCorrect, evenGraph([0, 2, 4, 6, 8])];
// Describe-and-draw: speeds up to 8 m/s in 4 s, holds 6 s, stops in 2 s.
export const story: Graph = { t: [0, 4, 10, 12], v: [0, 8, 8, 0] };
// Exam question: 0 to 20 m/s in 8 s, 12 s steady, then to rest in 5 s.
export const exam: Graph = { t: [0, 8, 20, 25], v: [0, 20, 20, 0] };

const net = displacementAt(turnBack, duration(turnBack));
const path = distanceAt(turnBack, duration(turnBack));
const forward = path - (path - net) / 2; // forward area; path = f + b, net = f - b
const back = (path - net) / 2;
const grade5 = slopeOfSt(turnBack, 5);
const pos5 = displacementAt(turnBack, 5);
const trapArea = displacementAt(trapGraph, 3);
const examTotal = area(exam);
const examA = accelerationAt(exam, 22);
const avgSpeed = path / duration(turnBack);
const avgVelocity = net / duration(turnBack);

const steps: Step[] = [
  // --- Quick check: two questions. Both right first time skips the refresher.
  {
    id: 'l2-gate-slope',
    kind: 'choice',
    level: 'intermediate',
    tag: 'Quick check',
    gate: true,
    title: 'What does the slope show?',
    lab: gateLab,
    question: 'On a velocity–time graph, the gradient is…',
    options: [
      { label: 'velocity, in m/s', why: 'Velocity is the height of the line. The gradient is how fast that height changes.' },
      { label: 'displacement, in m', why: 'Displacement is the area under the line, not its gradient.' },
      { label: 'acceleration, in m/s²', },
      { label: 'acceleration, in m/s', why: 'Right quantity, wrong unit. A change in speed each second is m/s², not m/s.' },
    ],
    correct: 2,
    hints: ['Gradient is rise ÷ run: how much the speed changes in a time.', 'Change in speed (m/s) divided by time (s).'],
    explanation: 'Gradient = change in velocity ÷ time = acceleration, in m/s².',
  },
  {
    id: 'l2-gate-area',
    kind: 'choice',
    level: 'intermediate',
    tag: 'Quick check',
    gate: true,
    title: 'What does the area show?',
    lab: gateLab,
    question: 'The area between the graph and the time axis is…',
    options: [
      { label: 'velocity, in m/s', why: 'Velocity is the height of the line. Area is height × time.' },
      { label: 'displacement, in m' },
      { label: 'displacement, in m²', why: 'Right quantity, wrong unit. m/s × s leaves metres, not m².' },
      { label: 'acceleration, in m/s²', why: 'Acceleration is the gradient, not the area.' },
    ],
    correct: 1,
    hints: ['Area = height × width. Here height is speed and width is time.', 'm/s × s = m.'],
    explanation: 'Area = velocity × time = displacement, in m.',
  },
  // --- Refresher: only for a learner who missed a quick check.
  {
    id: 'l2-refresh-slope',
    kind: 'beats',
    level: 'foundations',
    tag: 'Refresher',
    refresher: true,
    title: 'Slope is acceleration',
    beats: [
      { note: 'A steeper line is a bigger change in speed every second: up 8 m/s in 2 s means a = 4 m/s².', lab: { graph: evenGraph([0, 8, 8, 8, 0]), showSt: false, slopes: true, arrows: 'va', focus: 0, vRange: [-4, 12] } },
      { note: 'Flat means a = 0. Sloping down is negative: the speed falls 8 m/s in 2 s, so a = −4 m/s².', lab: { graph: evenGraph([0, 8, 8, 8, 0]), showSt: false, slopes: true, arrows: 'va', focus: 3, vRange: [-4, 12] } },
    ],
  },
  {
    id: 'l2-refresh-area',
    kind: 'beats',
    level: 'foundations',
    tag: 'Refresher',
    refresher: true,
    title: 'Area is displacement',
    beats: [
      { note: `Above the axis the car moves forward: ${forward} m so far.`, lab: { graph: turnBack, areaNumbers: true, showSt: false, cursor: 6, vRange: [-8, 8] } },
      { note: `Below the axis it moves backwards, so that area is negative: ${-back} m.`, lab: { graph: turnBack, areaNumbers: true, showSt: false, cursor: 8, vRange: [-8, 8] } },
    ],
  },
  // --- Traps
  {
    id: 'l2-trap-peak',
    kind: 'choice',
    level: 'intermediate',
    tag: 'Trap',
    title: 'When does it turn round?',
    lab: { graph: peak, showSt: false, hideRun: true, trackRange: [0, 100], vRange: [-4, 14] },
    question: 'The car follows this graph for 12 s. When does it change direction?',
    options: [
      { label: 'At 4 s, where the speed is greatest', why: 'The peak is the fastest moment, not a turn. To turn round the velocity must change sign.' },
      { label: 'At 8 s, where the line bends', why: 'A bend means the acceleration changed. The car is still moving forward.' },
      { label: 'It never does' },
      { label: 'At 12 s, when it stops', why: 'v = 0 only means it stops. It would have to go below the axis to move back.' },
    ],
    correct: 2,
    hints: ['Which way is the car moving when v is positive?', 'A change of direction needs the line to cross the time axis.'],
    explanation: 'The line stays above the axis, so the velocity is always positive. The car only ever moves forward.',
  },
  {
    id: 'l2-trap-displacement',
    kind: 'numeric',
    level: 'intermediate',
    tag: 'Trap',
    title: 'How far from the start?',
    lab: { graph: turnBack, areaNumbers: true, showSt: false, track: false, vRange: [-8, 8] },
    question: 'How far is the car from where it started after 8 s?',
    options: [
      { value: path, why: 'That is the distance travelled. Position counts the backwards part as negative.' },
      { value: forward, why: 'That is only the forward area. The car then drove back.' },
      { value: net },
      { value: back, why: 'That is only the size of the backwards area.' },
    ],
    answer: net,
    unit: 'm',
    units: ['m', 'm/s', 'm/s²'],
    hints: ['Displacement is the signed area under the graph.', `Forward area is ${forward} m and backward area is ${-back} m.`],
    explanation: `${forward} + (${-back}) = ${net} m. Area below the axis is negative.`,
  },
  {
    id: 'l2-trap-gradient',
    kind: 'numeric',
    level: 'intermediate',
    tag: 'Trap',
    title: 'Read the gradient',
    lab: { graph: turnBack, showSt: true, showVt: false, track: false, tangent: true, cursor: 5, vRange: [-8, 8] },
    question: 'The white line touches the position–time curve at 5 s. What is the velocity then?',
    options: [
      { value: pos5, why: 'That is the position, the height of the curve. The velocity is its gradient.' },
      { value: slopeOfSt(turnBack, 4), why: 'That is the velocity at 4 s. The gradient changes along the curve.' },
      { value: grade5 },
      { value: 0, why: 'The velocity is zero at 6 s, not at 5 s.' },
    ],
    answer: grade5,
    unit: 'm/s',
    units: ['m', 'm/s', 'm/s²'],
    hints: ['The gradient of a position–time graph is the velocity. Gradient = rise ÷ run.', 'Pick two points on the white line and compare how far up it goes with how far across.'],
    explanation: `The gradient at 5 s is ${grade5} m/s. Velocity is the slope of the position–time graph.`,
  },
  {
    id: 'l2-trap-trapezium',
    kind: 'numeric',
    level: 'intermediate',
    tag: 'Trap',
    title: 'A sloping top',
    lab: { graph: trapGraph, showSt: false, track: false, vRange: [0, 12] },
    question: 'How far does the car travel in the first 3 s, while its speed rises from 4 m/s to 10 m/s?',
    options: [
      { value: 10 * 3, why: 'That uses the top speed for the whole 3 s. The car was slower earlier.' },
      { value: trapArea },
      { value: (4 + 10) * 3, why: 'That is (4 + 10) × 3 without the ½. A trapezium is the average of the two sides times the width.' },
      { value: 4 * 3, why: 'That uses the starting speed for the whole 3 s. The car speeds up.' },
    ],
    answer: trapArea,
    unit: 'm',
    units: ['m', 'm/s', 'm/s²'],
    hints: ['Area of a trapezium = average of the two parallel sides × width.', 'The parallel sides are 4 m/s and 10 m/s. The width is 3 s.'],
    explanation: `½ × (4 + 10) × 3 = ${trapArea} m.`,
  },
  {
    id: 'l2-pick',
    kind: 'pick',
    level: 'intermediate',
    tag: 'Trap',
    title: 'Match the graphs',
    shown: pickCorrect,
    options: pickOptions,
    correct: 1,
    why: ['In graph A the speed is greatest at the start, so the position curve would start steep. This curve starts flat.', '', 'In graph C the speed keeps growing, so the curve would keep bending upwards. This one straightens out.'],
    hints: ['The slope of a position–time graph is the velocity. Where the curve is steepest, the car is fastest.', 'A straight position–time line means a constant velocity.'],
    explanation: 'The curve bends up, then straightens. The speed grows, then stays constant: that is graph B.',
  },
  // --- Draw from a description (the graph is checked, not a single number)
  {
    id: 'l2-sketch',
    kind: 'goal',
    level: 'intermediate',
    tag: 'Draw it',
    title: 'Draw the journey',
    body: 'A car speeds up from rest to 8 m/s in 4 s, then holds that speed for 6 s, then stops in 2 s.',
    lab: { graph: { t: story.t, v: [0, 0, 0, 0] }, editable: [1, 2, 3], showSt: false, vRange: [-2, 12] },
    goal: { kind: 'shape', target: story.v, tolerance: 0.5 },
    goalText: 'Drag the dots to draw this journey.',
    solution: story.v,
    hints: ['The dot at 4 s is the speed when the speeding up ends.', 'Holding a speed means the next dot is at the same height. Stopping means 0.'],
    explanation: 'Up to 8 m/s at 4 s, level to 10 s, down to 0 at 12 s. The position curve bends up, runs straight, then flattens.',
  },
  // --- Exam question, 5 marks
  {
    id: 'l2-exam-a',
    kind: 'build',
    level: 'intermediate',
    tag: 'Exam question (a)',
    title: 'Total distance',
    body: 'A car starts from rest and speeds up uniformly to 20 m/s in 8 s. It travels at 20 m/s for 12 s, then brakes uniformly to rest in 5 s. Calculate the total distance.',
    lab: { graph: exam, showSt: false, track: false, vRange: [-4, 24] },
    template: [
      { kind: 'slot' }, { kind: 'op', sym: '×' }, { kind: 'slot' }, { kind: 'op', sym: '÷' }, { kind: 'slot' }, { kind: 'op', sym: '+' }, { kind: 'break' },
      { kind: 'slot' }, { kind: 'op', sym: '×' }, { kind: 'slot' }, { kind: 'op', sym: '+' }, { kind: 'break' },
      { kind: 'slot' }, { kind: 'op', sym: '×' }, { kind: 'slot' }, { kind: 'op', sym: '÷' }, { kind: 'slot' },
    ],
    tiles: [2, 5, 8, 12, 20],
    answer: examTotal,
    solution: ['8', '20', '2', '12', '20', '5', '20', '2'],
    unit: 'm',
    marks: {
      total: 3,
      scheme: ['M1  Distance = area under the graph.', `M1  Triangle ½ × 8 × 20 = 80, rectangle 12 × 20 = 240, triangle ½ × 5 × 20 = 50.`, `A1  ${examTotal} m`],
    },
    structureHint: 'Split the graph into a triangle, a rectangle and another triangle. A triangle is base × height ÷ 2.',
    hints: ['A triangle has area base × height ÷ 2. A rectangle has base × height.', 'The pieces last 8 s, 12 s and 5 s. The top speed is 20 m/s.'],
    explanation: `80 + 240 + 50 = ${examTotal} m.`,
  },
  {
    id: 'l2-exam-b',
    kind: 'numeric',
    level: 'intermediate',
    tag: 'Exam question (b)',
    title: 'Acceleration while braking',
    lab: { graph: exam, showSt: false, track: false, vRange: [-4, 24] },
    question: 'Calculate the acceleration of the car during the last 5 s.',
    options: [
      { value: -examA, why: 'The size is right, but the car is slowing down, so the acceleration is negative.' },
      { value: -20, why: 'That is only the change in velocity. Divide it by the time, 5 s.' },
      { value: examA },
      { value: r2(5 / -20), why: 'That is time ÷ change in velocity, upside down.' },
    ],
    answer: examA,
    unit: 'm/s²',
    units: ['m', 'm/s', 'm/s²'],
    marks: { total: 2, scheme: ['M1  a = change in velocity ÷ time = (0 − 20) ÷ 5', `A1  ${examA} m/s². The minus sign shows it is slowing down.`] },
    hints: ['Acceleration = change in velocity ÷ time taken.', 'The velocity goes from 20 m/s to 0 m/s in 5 s.'],
    explanation: `a = (0 − 20) ÷ 5 = ${examA} m/s².`,
  },
  // --- Challenge
  {
    id: 'l2-challenge-speed',
    kind: 'numeric',
    level: 'advanced',
    tag: 'Challenge',
    title: 'Average speed',
    lab: { graph: turnBack, areaNumbers: true, showSt: false, track: false, vRange: [-8, 8] },
    question: 'What is the average speed of the car over the 8 s? (Speed has no direction.)',
    options: [
      { value: avgVelocity, why: 'That is the average velocity: displacement ÷ time. Average speed uses the distance travelled.' },
      { value: path, why: 'That is the total distance. Divide it by the time to get a speed.' },
      { value: avgSpeed },
      { value: net, why: 'That is the displacement, and it has not been divided by the time.' },
    ],
    answer: avgSpeed,
    unit: 'm/s',
    units: ['m', 'm/s', 'm/s²'],
    hints: ['Average speed = total distance ÷ total time.', `Distance counts every area as positive: ${forward} + ${-back}.`],
    explanation: `Distance ${path} m ÷ 8 s = ${avgSpeed} m/s. The average velocity would be ${avgVelocity} m/s.`,
  },
  {
    id: 'l2-complete',
    kind: 'complete',
    level: 'intermediate',
    tag: 'Lesson complete',
    title: 'Marks you no longer lose',
    summary: [
      'A car turns round when its velocity crosses zero, not at a peak.',
      'Displacement is signed area. Distance adds the sizes. Average speed uses distance.',
      'Gradient of a position–time graph is velocity. Gradient of a velocity–time graph is acceleration.',
      'Give the unit, and the sign of an acceleration.',
    ],
  },
];

export const lesson2: Lesson = { id: 'l2', number: 2, title: 'Read motion from a graph', spec: 'Motion graphs', minutes: 8, steps };
