// Lesson "Keeping balance" — the principle of moments and the centre of gravity (WPH11 point 16).
// The puzzle: Kai balances a broom on one finger and saws it in two right there. The short brush piece is the heavy
// one: 6.0 N against 2.0 N. It balanced because the moments about the cut were equal, not the weights.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { balancingLoad, balancingPosition, piecesAtBalance, senseTotals, supportPushes, type Load } from '../physics/moments.ts';
import { fixed } from '../physics/format.ts';
import type { BeamFig, BeamLoad, BroomFig, Lesson } from './types.ts';

const NB = '\u00A0'; // a no-break space: a number never parts from its unit
const N = (x: number, dp = 0): string => `${fixed(x, dp)}${NB}N`;
const m = (x: number, dp = 2): string => `${fixed(x, dp)}${NB}m`;

// The puzzle: the broom balanced on a finger, sawn at the balance point.
export const BROOM = { total: 8.0, brush: 0.15, handle: 0.45 }; // N; m from the cut to each piece's centre of gravity
// The balance plank: a light plank on a pivot at its middle. Distances from the pivot; Sana and the box on the left.
export const PLANK = { L: 4.4, pivot: 2.2 };
export const SANA = { W: 300, d: 1.6 };
export const BRUNO = { W: 400 };
export const BOX = { W: 100, d: 0.6 };
// A uniform beam on a support near its left end; Zoe stands on that end.
export const BEAM = { L: 3.0, W: 600, support: 1.0 };
// A uniform plank on a trestle at each end, a painter on it (positions from the left end).
export const PAINTER = { L: 4.0, plank: 200, W: 600, at: 1.0 };
// Skill check.
export const CARD = { L: 5.0, plank: 300, W: 700, at: 1.0 }; // the exam card: a uniform plank on two trestles, a painter on it (from the left end)
export const RULE = { pivot: 0.4, load: 0.5, at: 0.1 }; // m marks, N
export const BARROW = { W: 400, d: 0.4, handles: 1.2 }; // N, m from the axle
export const POLE = { L: 2.0, W: 80, bucket: 120, fromFront: 0.5 }; // m, N, N, m

const sanaLoad: Load = { W: SANA.W, at: PLANK.pivot - SANA.d };
const boxLoad: Load = { W: BOX.W, at: PLANK.pivot - BOX.d };
const ben = (loads: Load[]) => balancingPosition(loads, BRUNO.W, PLANK.pivot) - PLANK.pivot;
const beamLoad: Load = { W: BEAM.W, at: BEAM.L / 2 };
const [brushW, handleW] = piecesAtBalance(BROOM.total, BROOM.brush, BROOM.handle);
const painterLoads: Load[] = [
  { W: PAINTER.W, at: PAINTER.at },
  { W: PAINTER.plank, at: PAINTER.L / 2 },
];
const [leftPush, rightPush] = supportPushes(painterLoads, 0, PAINTER.L);
const cardLoads: Load[] = [
  { W: CARD.W, at: CARD.at },
  { W: CARD.plank, at: CARD.L / 2 },
];
const [cardLeft, cardRight] = supportPushes(cardLoads, 0, CARD.L);
const ruleW = balancingLoad([{ W: RULE.load, at: RULE.at }], 0.5, RULE.pivot);
const [, barrowLift] = supportPushes([{ W: BARROW.W, at: BARROW.d }], 0, BARROW.handles);
const poleLoads: Load[] = [
  { W: POLE.bucket, at: POLE.fromFront },
  { W: POLE.W, at: POLE.L / 2 },
];
const [poleFront, poleBack] = supportPushes(poleLoads, 0, POLE.L);

/** Answers and named mistakes, used by the screens and re-checked by keeping-balance.test.ts. */
export const ANSWERS = {
  explore: { right: ben([sanaLoad]), same: SANA.d, upsideDown: (BRUNO.W * SANA.d) / SANA.W, totals: senseTotals([sanaLoad, { W: BRUNO.W, at: PLANK.pivot + ben([sanaLoad]) }], PLANK.pivot) },
  box: {
    right: ben([sanaLoad, boxLoad]),
    left: SANA.W * SANA.d + BOX.W * BOX.d,
    forgot: ben([sanaLoad]),
    atSana: ((SANA.W + BOX.W) * SANA.d) / BRUNO.W,
    subtracted: (SANA.W * SANA.d - BOX.W * BOX.d) / BRUNO.W,
  },
  beam: {
    right: balancingLoad([beamLoad], 0, BEAM.support),
    arm: BEAM.L / 2 - BEAM.support,
    same: BEAM.W,
    fromEnd: (BEAM.W * (BEAM.L / 2)) / BEAM.support,
    upsideDown: (BEAM.W * BEAM.support) / (BEAM.L / 2 - BEAM.support),
  },
  /** The puzzle. */
  puzzle: { brush: brushW, handle: handleW, half: BROOM.total / 2 },
  painter: { right: rightPush, left: leftPush, total: PAINTER.W + PAINTER.plank, forgot: supportPushes([painterLoads[0]], 0, PAINTER.L)[1], shared: (PAINTER.W + PAINTER.plank) / 2 },
  painterLeft: { right: leftPush, forgot: PAINTER.W - rightPush, same: rightPush, all: PAINTER.W + PAINTER.plank },
  rule: { right: ruleW, upsideDown: (RULE.load * (0.5 - RULE.pivot)) / (RULE.pivot - RULE.at), fromZero: (RULE.load * RULE.at) / 0.5, equal: RULE.load },
  barrow: { right: barrowLift, wheel: BARROW.W - barrowLift, upsideDown: (BARROW.W * BARROW.handles) / BARROW.d, all: BARROW.W },
  card: { right: cardRight, left: cardLeft, total: CARD.W + CARD.plank },
  pole: { right: poleFront, back: poleBack, shared: (POLE.W + POLE.bucket) / 2, forgot: supportPushes([poleLoads[0]], 0, POLE.L)[0] },
};
const X = ANSWERS;

const broom = (over: Partial<BroomFig>): BroomFig => ({ kind: 'broom', ...BROOM, ...over });

const person = (id: string, name: string, W: number, at: number, extra: Partial<BeamLoad> = {}): BeamLoad => ({ id, look: 'person', name, W, at, ...extra });
const plankFig = (loads: BeamLoad[], header: string, over: Partial<BeamFig> = {}): BeamFig => ({ kind: 'beam', header, L: PLANK.L, supports: [PLANK.pivot], loads, moments: true, ...over });
const sanaOn = person('sana', 'SANA', SANA.W, sanaLoad.at);
const PLANK_HEADER = `light plank, Sana ${N(SANA.W)}, Bruno ${N(BRUNO.W)}`;
const beamFig = (over: Partial<BeamFig>): BeamFig => ({
  kind: 'beam',
  header: `uniform beam ${m(BEAM.L, 1)}, W = ${N(BEAM.W)}`,
  L: BEAM.L,
  supports: [BEAM.support],
  weight: BEAM.W,
  loads: [person('zoe', 'ZOE', X.beam.right, 0, { asked: 'W' })],
  ...over,
});
const painterFig = (pushes: BeamFig['pushes']): BeamFig => ({
  kind: 'beam',
  header: `uniform plank ${m(PAINTER.L, 1)}, W = ${N(PAINTER.plank)}`,
  L: PAINTER.L,
  supports: [0, PAINTER.L],
  weight: PAINTER.plank,
  loads: [person('painter', 'PAINTER', PAINTER.W, PAINTER.at)],
  pushes,
  answer: 'afterCheck',
});
const cardFig: BeamFig = {
  kind: 'beam',
  header: `uniform plank ${m(CARD.L, 1)}, W = ${N(CARD.plank)}`,
  L: CARD.L,
  supports: [0, CARD.L],
  weight: CARD.plank,
  loads: [person('painter', 'PAINTER', CARD.W, CARD.at)],
  pushes: { known: [], asked: 1 },
  answer: 'afterCheck',
};

export const keepingBalance: Lesson = {
  id: 'balance',
  title: 'Keeping balance',
  spec: [16],
  minutes: 12,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'Principle of moments', from: 'equilibrium' },
    { title: 'Back to the broom', from: 'hook-again' },
  ],
  cast: ['Kai', 'Sana', 'Bruno', 'Zoe'],
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Keeping balance',
      body: 'Kai balances a broom on one finger. Then he saws it in two, exactly where it balanced.',
      fig: broom({}),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: 'Which of the two pieces is heavier?',
      fig: broom({ cut: true }),
      options: [
        { id: 'brush', label: 'The short piece with the brush', correct: true },
        { id: 'handle', label: 'The long handle piece' },
        { id: 'same', label: 'Neither: it balanced, so they weigh the same' },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'equilibrium',
      kind: 'text',
      body: [
        'A body is in **equilibrium** when nothing makes it start to move or to turn: the resultant force on it is zero, and so is the resultant moment.',
        'No resultant moment means the turning effects cancel exactly: the clockwise moments and the anticlockwise moments are equal.',
      ],
      card: { term: 'Principle of moments', text: 'For a body in equilibrium, the sum of the clockwise moments about any point equals the sum of the anticlockwise moments.' },
    },
    {
      id: 'sense',
      kind: 'sort',
      prompt: 'About the pivot of a plank, which way does each force turn it?',
      bins: [
        { id: 'cw', label: 'Clockwise' },
        { id: 'acw', label: 'Anticlockwise' },
      ],
      items: [
        { id: 'left', label: 'A weight hanging left of the pivot', bin: 'acw', hint: 'A weight pulls down: on the left side it turns the plank anticlockwise.' },
        { id: 'right', label: 'A weight hanging right of the pivot', bin: 'cw', hint: 'A weight pulls down: on the right side it turns the plank clockwise.' },
        { id: 'upRight', label: 'An upward push right of the pivot', bin: 'acw', hint: 'An upward push on the right lifts that side: anticlockwise.' },
        { id: 'upLeft', label: 'An upward push left of the pivot', bin: 'cw', hint: 'An upward push on the left lifts that side: clockwise.' },
        { id: 'box', label: 'A box set down right of the pivot', bin: 'cw', hint: 'The box pulls down on the right: clockwise.' },
      ],
      why: 'Down on the right or up on the left turns the plank clockwise; down on the left or up on the right, anticlockwise.',
    },
    {
      id: 'seesaw',
      kind: 'estimate',
      prompt: `Sana (${N(SANA.W)}) sits ${m(SANA.d, 1)} left of the pivot of a light plank. Bruno weighs ${N(BRUNO.W)}. Drag to where he must sit, right of the pivot, to balance it.`,
      fig: plankFig([sanaOn, person('bruno', 'BRUNO', BRUNO.W, PLANK.pivot + 0.4, { asked: 'at' })], PLANK_HEADER, { moments: undefined }),
      after: plankFig([sanaOn, person('bruno', 'BRUNO', BRUNO.W, PLANK.pivot + X.explore.right, { asked: 'at' })], PLANK_HEADER, { answer: 'shown' }),
      scale: { min: 0, max: 2, step: 0.1, tick: 0.5, unit: 'm', symbol: 'x', dp: 1, label: "Bruno's distance from pivot" },
      answer: X.explore.right,
      tolerance: 0.1,
      why: `Equal moments: ${BRUNO.W} × x = ${SANA.W} × ${fixed(SANA.d, 1)}, so x = ${m(X.explore.right, 1)}. The heavier person sits nearer the pivot.`,
    },
    {
      id: 'box',
      kind: 'build',
      prompt: `Sana puts down a ${N(BOX.W)} box ${m(BOX.d)} left of the pivot and stays where she is. Build where Bruno must sit now.`,
      fig: plankFig([sanaOn, { id: 'box', look: 'box', W: BOX.W, at: boxLoad.at }, person('bruno', 'BRUNO', BRUNO.W, PLANK.pivot + X.box.right, { asked: 'at' })], `Sana ${N(SANA.W)}, box ${N(BOX.W)}, Bruno ${N(BRUNO.W)}`, { answer: 'afterCheck', moments: undefined }),
      equation: 'x = ({W₁} × {d₁} + {W₂} × {d₂}) ÷ {W₃}',
      boxes: { 'W₁': 'sana', 'd₁': 'dSana', 'W₂': 'box', 'd₂': 'dBox', 'W₃': 'bruno' },
      chips: [
        { id: 'sana', label: N(SANA.W) },
        { id: 'dSana', label: m(SANA.d) },
        { id: 'box', label: N(BOX.W) },
        { id: 'dBox', label: m(BOX.d) },
        { id: 'bruno', label: N(BRUNO.W) },
        { id: 'before', label: m(X.box.forgot), hint: "That is where he sat for Sana alone. The box's moment adds to hers." },
        { id: 'total', label: N(SANA.W + BOX.W + BRUNO.W), hint: 'Weights do not simply add: each has its own distance.' },
      ],
      result: { symbol: 'x', value: X.box.right, unit: 'm' },
      why: `Anticlockwise: ${SANA.W} × ${fixed(SANA.d, 2)} + ${BOX.W} × ${fixed(BOX.d, 2)} = ${fixed(X.box.left, 0)} N m. Bruno needs the same clockwise: x = ${fixed(X.box.left, 0)} ÷ ${BRUNO.W} = ${m(X.box.right)}.`,
    },
    {
      id: 'cg',
      kind: 'text',
      body: [
        'Every bit of a body is pulled down by gravity. Together those pulls act like one force, the weight, at one point: the **centre of gravity**.',
        'For a **uniform** beam it is at the middle. Support a body right under its centre of gravity and it balances: its weight has no moment there.',
      ],
      card: { term: 'Centre of gravity', text: 'The point where the whole weight of a body can be taken to act.' },
    },
    {
      id: 'beam-cg',
      kind: 'tapFig',
      prompt: `A uniform ${m(BEAM.L, 1)} beam rests on a support ${m(BEAM.support, 1)} from its left end. Where does the beam's own weight act?`,
      instruction: 'Tap the point where the weight of the beam acts.',
      fig: beamFig({ candidates: true }),
      options: [
        { id: 'pivot', label: 'At the support', hint: 'The support pushes up there. The weight acts at the centre of gravity.' },
        { id: 'middle', label: 'At the middle of the beam', correct: true },
        { id: 'long', label: 'At the middle of the longer part', hint: 'The short part has weight too. Take the whole beam at once.' },
      ],
      why: `A uniform beam's centre of gravity is at its middle: ${m(BEAM.L / 2, 1)} from the end, ${m(X.beam.arm)} right of the support.`,
    },
    {
      id: 'beam',
      kind: 'build',
      prompt: `The beam weighs ${N(BEAM.W)}. Zoe stands on its left end, and the beam balances. Build Zoe's weight.`,
      fig: beamFig({ answer: 'afterCheck', moments: true }),
      equation: 'W = {W₁} × {d₁} ÷ {d₂}',
      boxes: { 'W₁': 'beam', 'd₁': 'arm', 'd₂': 'zoe' },
      chips: [
        { id: 'beam', label: N(BEAM.W) },
        { id: 'arm', label: m(X.beam.arm) },
        { id: 'zoe', label: m(BEAM.support) },
        { id: 'fromEnd', label: m(BEAM.L / 2), hint: 'That is from the end. Measure from the support: 0.50 m.' },
        { id: 'whole', label: m(BEAM.L), hint: "That is the beam's whole length, not a distance from the support." },
      ],
      result: { symbol: 'W', value: X.beam.right, unit: 'N' },
      why: `The beam's weight acts ${m(X.beam.arm)} right of the support: ${BEAM.W} × ${fixed(X.beam.arm, 2)} = ${fixed(BEAM.W * X.beam.arm, 0)} N m clockwise. Zoe is ${m(BEAM.support)} left: W = ${N(X.beam.right)}.`,
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Back to the ${N(BROOM.total, 1)} broom. The brush piece's weight acts ${m(BROOM.brush)} from the cut, the handle's ${m(BROOM.handle)}. Which is heavier?`,
      fig: broom({ cut: true, pieces: 'afterCheck', play: 'afterCheck' }),
      options: [
        { id: 'same', label: `Neither: ${N(X.puzzle.half, 1)} each, since it balanced`, hint: 'Balance means equal moments about the cut, not equal weights.' },
        { id: 'handle', label: 'The handle piece: it is far longer', hint: 'Its weight acts 0.45 m out: three times as far needs a third of the weight.' },
        { id: 'right', label: `The brush piece: ${N(brushW, 1)} against ${N(handleW, 1)}`, correct: true },
        { id: 'flipped', label: `The handle piece: ${N(brushW, 1)} against ${N(handleW, 1)}`, hint: 'The weight further out must be the smaller one to give the same moment.' },
      ],
      why: `Moments about the cut: W × ${fixed(BROOM.brush, 2)} = (${fixed(BROOM.total, 1)} − W) × ${fixed(BROOM.handle, 2)}, so the brush piece is ${N(brushW, 1)} and the handle ${N(handleW, 1)}. Equal moments, unequal weights.`,
    },
    {
      id: 'two-rules',
      kind: 'text',
      body: ['Take moments about a point where an unknown force acts: its moment is zero.'],
      fig: painterFig({ known: [], asked: 1 }),
    },
    {
      id: 'painter',
      kind: 'build',
      prompt: `The plank lies on a trestle at each end. A ${N(PAINTER.W)} painter stands ${m(PAINTER.at, 1)} from the left end. Build how hard the right trestle pushes up.`,
      fig: painterFig({ known: [], asked: 1 }),
      equation: 'R = ({W₁} × {d₁} + {W₂} × {d₂}) ÷ {L}',
      boxes: { 'W₁': 'painter', 'd₁': 'dPainter', 'W₂': 'plank', 'd₂': 'dPlank', L: 'length' },
      chips: [
        { id: 'painter', label: N(PAINTER.W) },
        { id: 'dPainter', label: m(PAINTER.at, 1) },
        { id: 'plank', label: N(PAINTER.plank) },
        { id: 'dPlank', label: m(PAINTER.L / 2, 1) },
        { id: 'length', label: m(PAINTER.L, 1) },
        { id: 'far', label: m(PAINTER.L - PAINTER.at, 1), hint: 'Measure from the left trestle: the painter is 1.0 m from it.' },
        { id: 'sum', label: N(PAINTER.W + PAINTER.plank), hint: 'Weights do not simply add: each has its own distance from the pivot.' },
      ],
      result: { symbol: 'R', value: X.painter.right, unit: 'N' },
      why: `Moments about the left trestle: R × ${fixed(PAINTER.L, 1)} = ${PAINTER.W} × ${fixed(PAINTER.at, 1)} + ${PAINTER.plank} × ${fixed(PAINTER.L / 2, 1)} = ${fixed(X.painter.right * PAINTER.L, 0)} N m, so R = ${N(X.painter.right)}.`,
    },
    {
      id: 'painter-left',
      kind: 'choice',
      prompt: `The right trestle pushes up with ${N(rightPush)}. How hard does the left trestle push up?`,
      fig: painterFig({ known: [1], asked: 0 }),
      options: [
        { id: 'same', label: N(X.painterLeft.same), hint: 'Only if the painter stood in the middle.' },
        { id: 'forgot', label: N(X.painterLeft.forgot), hint: 'The pushes hold up the plank too: 600 + 200 = 800 N.' },
        { id: 'right', label: N(X.painterLeft.right), correct: true },
        { id: 'all', label: N(X.painterLeft.all), hint: 'The right trestle takes 250 N of it.' },
      ],
      why: `No resultant force: the two pushes hold up ${PAINTER.W} + ${PAINTER.plank} = ${N(X.painter.total)}, so the left one is ${fixed(X.painter.total, 0)} − ${fixed(rightPush, 0)} = ${N(leftPush)}.`,
    },
    {
      id: 'rules',
      kind: 'text',
      body: ['In equilibrium: no resultant force, and the moments balance about any point.'],
      fig: broom({ cut: true, pieces: 'shown' }),
    },
  ],
  skillCheck: [
    {
      id: 'barrow',
      kind: 'build',
      prompt: `A loaded wheelbarrow weighs ${N(BARROW.W)}, acting ${m(BARROW.d)} from the wheel's axle. Its handles are ${m(BARROW.handles)} from the axle. Build the upward force that holds the handles up.`,
      equation: 'F = {W} × {d} ÷ {x}',
      boxes: { W: 'weight', d: 'dLoad', x: 'dHandles' },
      chips: [
        { id: 'weight', label: N(BARROW.W) },
        { id: 'dLoad', label: m(BARROW.d) },
        { id: 'dHandles', label: m(BARROW.handles) },
        { id: 'between', label: m(BARROW.handles - BARROW.d), hint: 'Take moments about the axle: both distances are measured from it.' },
        { id: 'wheel', label: N(X.barrow.wheel), hint: 'That is what the wheel takes, not a distance or the load.' },
      ],
      result: { symbol: 'F', value: X.barrow.right, unit: 'N' },
      why: `Moments about the axle, where the wheel's push drops out: F × ${fixed(BARROW.handles, 2)} = ${BARROW.W} × ${fixed(BARROW.d, 2)}, so F = ${N(X.barrow.right)}. The wheel takes the other ${N(X.barrow.wheel)}.`,
    },
    {
      id: 'moment-about',
      kind: 'sort',
      prompt: "A painter's plank rests on two trestles. Taking moments about the left trestle, which forces have a moment?",
      bins: [
        { id: 'has', label: 'Has a moment' },
        { id: 'none', label: 'No moment' },
      ],
      items: [
        { id: 'left', label: "The left trestle's own push", bin: 'none', hint: 'It acts at the pivot: its distance is zero, so its moment is zero.' },
        { id: 'painter', label: "The painter's weight", bin: 'has', hint: 'It acts 1.0 m from the pivot: weight × distance is a moment.' },
        { id: 'plank', label: "The plank's weight at its middle", bin: 'has', hint: 'It acts at the centre of gravity, 2.0 m from the pivot.' },
        { id: 'right', label: "The right trestle's push", bin: 'has', hint: 'It acts 4.0 m from the pivot, so it has a moment: this is the one we want.' },
        { id: 'through', label: 'A force acting through the pivot', bin: 'none', hint: 'Its line of action passes through the pivot: x = 0.' },
      ],
      why: 'A force through the pivot has no moment, so choosing the left trestle as the pivot removes its unknown push from the equation.',
    },
    {
      id: 'any',
      kind: 'choice',
      prompt: 'A plank rests on two trestles. A student takes moments about a point where no force acts at all. What does she find?',
      options: [
        { id: 'support', label: 'Nothing useful: moments balance only about a support' },
        { id: 'cg', label: 'They balance only about the centre of gravity' },
        { id: 'right', label: 'The clockwise and anticlockwise moments still balance', correct: true },
        { id: 'zero', label: 'Every moment about that point is zero' },
      ],
      why: 'In equilibrium the resultant moment is zero about every point. A support is just the handiest: its push drops out.',
    },
    {
      id: 'trestles',
      kind: 'examCard',
      context: `A uniform ${m(CARD.L, 1)} plank weighing ${N(CARD.plank)} rests on a trestle at each end. A ${N(CARD.W)} painter stands ${m(CARD.at, 1)} from the left end.`,
      fig: cardFig,
      parts: [
        {
          id: 'a',
          command: 'Calculate',
          text: 'the push of the right trestle.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'R = ({W₁} × {d₁} + {W₂} × {d₂}) ÷ {L}',
            boxes: { 'W₁': 'painter', 'd₁': 'dPainter', 'W₂': 'plank', 'd₂': 'dPlank', L: 'length' },
            chips: [
              { id: 'painter', label: N(CARD.W) },
              { id: 'dPainter', label: m(CARD.at, 1) },
              { id: 'plank', label: N(CARD.plank) },
              { id: 'dPlank', label: m(CARD.L / 2, 1) },
              { id: 'length', label: m(CARD.L, 1) },
              { id: 'far', label: m(CARD.L - CARD.at, 1), hint: 'Measure from the left trestle: the painter is 1.0 m from it.' },
            ],
            result: { symbol: 'R', value: X.card.right, unit: 'N' },
          },
          why: `Moments about the left trestle: R × ${fixed(CARD.L, 1)} = ${CARD.W} × ${fixed(CARD.at, 1)} + ${CARD.plank} × ${fixed(CARD.L / 2, 1)}, so R = ${N(X.card.right)}. One mark for the moments, one for R.`,
        },
        {
          id: 'b',
          command: 'Calculate',
          text: 'the push of the left trestle.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'L = {W₁} + {W₂} − {R}',
            boxes: { 'W₁': 'painter', 'W₂': 'plank', R: 'right' },
            chips: [
              { id: 'painter', label: N(CARD.W) },
              { id: 'plank', label: N(CARD.plank) },
              { id: 'right', label: N(X.card.right) },
              { id: 'total', label: N(X.card.total), hint: 'That is the total weight. The equation adds the two weights itself.' },
            ],
            result: { symbol: 'L', value: X.card.left, unit: 'N' },
          },
          why: `No resultant force: the pushes hold up ${CARD.W} + ${CARD.plank} = ${N(X.card.total)}, so L = ${fixed(X.card.total, 0)} − ${fixed(X.card.right, 0)} = ${N(X.card.left)}.`,
        },
      ],
    },
  ],
  youCanNow: [
    'Use the principle of moments for a body in equilibrium',
    "Place a body's weight at its centre of gravity",
    'Find the push of each support on a beam',
    'Pick a pivot that removes an unknown force',
  ],
  recap: {
    fig: broom({ cut: true, pieces: 'shown' }),
    text: 'Balanced at its centre of gravity, the short brush piece weighs three times as much as the handle.',
  },
  card: {
    formula: 'ΣF = 0, ΣM = 0',
    idea: 'Equilibrium: clockwise moments = anticlockwise moments about any point. Weight acts at the centre of gravity.',
  },
};
