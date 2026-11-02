import { Lesson, Step } from '../../engine/types';
import { displacementAt, distanceAt, duration, evenGraph, Graph, pieceArea, piecesUpTo, slopeOfSt } from '../../physics/motion';

// Lesson 2: read motion from a graph. Every number below comes from the physics model.

// Hook graph: speeds up for 4 s, holds 8 m/s for 6 s, stops in 2 s.
export const trip: Graph = { t: [0, 4, 10, 12], v: [0, 8, 8, 0] };
// Forward, then back: used for signed area and the numeric questions.
export const turnBack: Graph = evenGraph([0, 6, 6, 0, -6]);
// Position-time warm-up: speeds up, then holds a steady speed.
export const pickCorrect: Graph = evenGraph([0, 4, 8, 8, 8]);
export const pickOptions: Graph[] = [evenGraph([8, 8, 8, 4, 0]), pickCorrect, evenGraph([0, 2, 4, 6, 8])];

const tripEnd = displacementAt(trip, duration(trip)); // 72 m
const forwardArea = piecesUpTo(turnBack, duration(turnBack)).filter((p) => pieceArea(p) > 0).reduce((s, p) => s + pieceArea(p), 0);
const backArea = piecesUpTo(turnBack, duration(turnBack)).filter((p) => pieceArea(p) < 0).reduce((s, p) => s + pieceArea(p), 0);
const net = displacementAt(turnBack, duration(turnBack));
const path = distanceAt(turnBack, duration(turnBack));
const grade5 = slopeOfSt(turnBack, 5);
const pos5 = displacementAt(turnBack, 5);

const rise = 8; // m/s gained in the first piece of the slope task
const dt = 2; // s between the points
const aTarget = rise / dt;
const startS = 40;

const steps: Step[] = [
  {
    id: 'l2-predict',
    kind: 'predict',
    level: 'intermediate',
    tag: 'Predict',
    title: 'Where does the car end up?',
    body: 'It follows this graph for 12 seconds. Tap the track where you think it stops.',
    lab: { graph: trip, showSt: false, slopes: true, vRange: [-4, 12], trackRange: [0, 120] },
    answer: tripEnd,
    tolerance: 8,
    revealNote: (guess, answer) =>
      Math.abs(guess - answer) <= 8
        ? `${answer} m. Spot on. The area under a velocity graph is the distance travelled.`
        : `${answer} m, not ${guess} m. The car is only at full speed for part of the trip. The area under the graph is the distance.`,
  },
  {
    id: 'l2-slope-goal',
    kind: 'goal',
    level: 'intermediate',
    tag: 'Explore',
    title: 'Make it speed up',
    lab: { graph: evenGraph([0, 2, 2, 2, 2]), editable: [1], showSt: false, slopes: true, vRange: [-4, 12] },
    goal: { kind: 'acceleration', segment: 0, target: aTarget },
    goalText: `Drag the dot at ${dt} s until the first piece shows a = ${aTarget}.`,
    solution: [0, rise, 2, 2, 2],
    hints: ['Acceleration is how much the speed changes each second.', `In ${dt} seconds the speed has to rise by ${dt} × ${aTarget} = ${rise} m/s. Aim for ${rise} m/s.`],
    explanation: `The speed rose ${rise} m/s in ${dt} s, so a = ${rise} ÷ ${dt} = ${aTarget} m/s². That is the slope of the line.`,
  },
  {
    id: 'l2-slope-beats',
    kind: 'beats',
    level: 'intermediate',
    tag: 'Idea',
    title: 'Slope is acceleration',
    beats: [
      { note: `Steeper line, bigger change in speed every second. Here it rises ${rise} m/s in ${dt} s: a = ${aTarget} m/s².`, lab: { graph: evenGraph([0, 8, 8, 8, 0]), showSt: false, slopes: true, focus: 0, vRange: [-4, 12] } },
      { note: 'A flat line means the speed does not change, so a = 0.', lab: { graph: evenGraph([0, 8, 8, 8, 0]), showSt: false, slopes: true, focus: 1, vRange: [-4, 12] } },
      { note: `Sloping down means negative acceleration: the speed falls ${rise} m/s in ${dt} s, so a = −${aTarget} m/s².`, lab: { graph: evenGraph([0, 8, 8, 8, 0]), showSt: false, slopes: true, focus: 3, vRange: [-4, 12] } },
    ],
  },
  {
    id: 'l2-area-goal',
    kind: 'goal',
    level: 'intermediate',
    tag: 'Explore',
    title: 'Land on the target',
    lab: { graph: evenGraph([0, 4, 4, 4, 4]), editable: [1, 2, 3, 4], areaNumbers: true, target: { s: startS }, vRange: [-4, 12] },
    goal: { kind: 'displacement', at: 8, target: startS, tolerance: 1 },
    goalText: `Reshape the graph so the car finishes ${startS} m from the start.`,
    solution: [0, 6, 6, 6, 4],
    hints: ['The area under the graph is how far the car travels. The numbers on the pieces add up to its position.', 'Try 6 m/s for the middle dots and slow down to 4 m/s at the end.'],
    explanation: `The areas add up to ${startS} m. The area under a velocity graph is the displacement.`,
  },
  {
    id: 'l2-sign-goal',
    kind: 'goal',
    level: 'intermediate',
    tag: 'Explore',
    title: 'Back to the start',
    lab: { graph: evenGraph([0, 6, 6, 0, 0]), editable: [3, 4], areaNumbers: true, vRange: [-12, 12] },
    goal: { kind: 'displacement', at: 8, target: 0, tolerance: 1 },
    goalText: 'Bring the car back to where it started: finish at 0 m.',
    solution: [0, 6, 6, -8, -8],
    hints: ['Area below the axis counts as negative. How much backwards area cancels the forward area?', 'Drag the last two dots below zero, to about −8 m/s.'],
    explanation: 'Forward area and backward area cancel, so the displacement is zero. The car is home again.',
  },
  {
    id: 'l2-sign-beats',
    kind: 'beats',
    level: 'intermediate',
    tag: 'Idea',
    title: 'Area has a sign',
    beats: [
      { note: `Above the axis the car moves forward. The areas so far add up to ${forwardArea} m.`, lab: { graph: turnBack, areaNumbers: true, cursor: 6, vRange: [-8, 8] } },
      { note: `Below the axis it moves backwards. That area counts as negative: ${backArea} m.`, lab: { graph: turnBack, areaNumbers: true, cursor: 8, vRange: [-8, 8] } },
      { note: `Displacement is the signed total: ${forwardArea} − ${-backArea} = ${net} m. Distance ignores the sign: ${forwardArea} + ${-backArea} = ${path} m.`, lab: { graph: turnBack, areaNumbers: true, cursor: 8, vRange: [-8, 8] } },
    ],
  },
  {
    id: 'l2-pick',
    kind: 'pick',
    level: 'intermediate',
    tag: 'Warm-up',
    title: 'Match the graphs',
    shown: pickCorrect,
    options: pickOptions,
    correct: 1,
    hints: ['The slope of a position–time graph is the velocity. Where the curve is steepest, the car is fastest.', 'A straight position–time line means a constant velocity.'],
    explanation: 'The curve bends up, then straightens. The speed grows, then stays constant: that is graph B.',
  },
  {
    id: 'l2-build',
    kind: 'build',
    level: 'intermediate',
    tag: 'Apply',
    title: 'Find the distance',
    body: 'How far does the car travel in the 12 seconds? Build the calculation.',
    lab: { graph: trip, showSt: false, vRange: [-4, 12] },
    template: [
      { kind: 'slot' }, { kind: 'op', sym: '×' }, { kind: 'slot' }, { kind: 'op', sym: '÷' }, { kind: 'slot' }, { kind: 'op', sym: '+' }, { kind: 'break' },
      { kind: 'slot' }, { kind: 'op', sym: '×' }, { kind: 'slot' }, { kind: 'op', sym: '+' }, { kind: 'break' },
      { kind: 'slot' }, { kind: 'op', sym: '×' }, { kind: 'slot' }, { kind: 'op', sym: '÷' }, { kind: 'slot' },
    ],
    tiles: [2, 4, 6, 8],
    answer: tripEnd,
    solution: ['4', '8', '2', '6', '8', '2', '8', '2'],
    unit: 'm',
    structureHint: 'Split the graph into a triangle, a rectangle and another triangle. Add their areas. A triangle is base × height ÷ 2.',
    hints: ['A triangle has area base × height ÷ 2. A rectangle has base × height.', `The pieces last ${trip.t[1] - trip.t[0]} s, ${trip.t[2] - trip.t[1]} s and ${trip.t[3] - trip.t[2]} s. The top speed is ${trip.v[1]} m/s.`],
    explanation: `4 × 8 ÷ 2 = 16, then 6 × 8 = 48, then 2 × 8 ÷ 2 = 8. Total ${tripEnd} m.`,
  },
  {
    id: 'l2-displacement',
    kind: 'numeric',
    level: 'intermediate',
    tag: 'Apply',
    title: 'Displacement',
    lab: { graph: turnBack, areaNumbers: true, showSt: false, vRange: [-8, 8] },
    question: 'What is the displacement after 8 s?',
    options: [
      { value: net },
      { value: path, why: 'That is the distance travelled. Displacement counts the backwards area as negative.' },
      { value: forwardArea, why: 'That is only the forward area. Subtract the backwards area too.' },
      { value: -backArea, why: 'That is only the backwards area, without its sign.' },
    ],
    answer: net,
    unit: 'm',
    units: ['m', 'm/s', 'm/s²'],
    hints: ['Displacement is the signed area under the graph.', `Forward area is ${forwardArea} m and backward area is ${backArea} m.`],
    explanation: `${forwardArea} + (${backArea}) = ${net} m. A length is measured in metres.`,
  },
  {
    id: 'l2-distance',
    kind: 'numeric',
    level: 'advanced',
    tag: 'Challenge',
    title: 'Distance travelled',
    lab: { graph: turnBack, areaNumbers: true, showSt: false, vRange: [-8, 8] },
    question: 'The odometer counts every metre driven, in any direction. What does it read after 8 s?',
    options: [
      { value: path },
      { value: net, why: 'That is the displacement. An odometer adds the backwards distance instead of subtracting it.' },
      { value: forwardArea, why: 'That leaves out the distance driven backwards.' },
      { value: forwardArea + path, why: 'The forward area is counted twice there.' },
    ],
    answer: path,
    unit: 'm',
    units: ['m', 'm/s', 'm/s²'],
    hints: ['Distance has no direction, so every area counts as positive.', `Add ${forwardArea} m and ${-backArea} m.`],
    explanation: `${forwardArea} + ${-backArea} = ${path} m. Distance is at least as big as the size of the displacement.`,
  },
  {
    id: 'l2-gradient',
    kind: 'numeric',
    level: 'advanced',
    tag: 'Challenge',
    title: 'Read the gradient',
    lab: { graph: turnBack, showSt: true, tangent: true, cursor: 5, vRange: [-8, 8] },
    question: 'The white line touches the position–time curve at 5 s. What is the speed then?',
    options: [
      { value: grade5 },
      { value: slopeOfSt(turnBack, 4), why: 'That is the speed at 4 s. The gradient changes along the curve.' },
      { value: pos5, why: 'That is the position, the height of the curve. The speed is its gradient.' },
      { value: 0, why: 'The speed is zero at 6 s, not at 5 s.' },
    ],
    answer: grade5,
    unit: 'm/s',
    units: ['m', 'm/s', 'm/s²'],
    hints: ['The gradient of a position–time graph is the velocity. Gradient = rise ÷ run.', 'Pick two points on the white line and compare how far up it goes with how far across.'],
    explanation: `The gradient at 5 s is ${grade5} m/s. Velocity is the slope of the position–time graph.`,
  },
  {
    id: 'l2-complete',
    kind: 'complete',
    level: 'intermediate',
    tag: 'Lesson complete',
    title: 'You can read motion graphs',
    summary: [
      'The slope of a velocity–time graph is the acceleration.',
      'The area under it is the displacement. Below the axis it counts as negative.',
      'The slope of a position–time graph is the velocity.',
    ],
  },
];

export const lesson2: Lesson = { id: 'l2', number: 2, title: 'Read motion from a graph', spec: 'Motion graphs', minutes: 8, steps };
