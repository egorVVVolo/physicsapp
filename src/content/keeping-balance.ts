// Lesson "Keeping balance" — the principle of moments and the centre of gravity (WPH11 point 16).
// The puzzle: Kai balances a broom on one finger and saws it in two right there. The short brush piece is the heavy
// one: 6.0 N against 2.0 N. It balanced because the moments about the cut were equal, not the weights.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { balancingLoad, balancingPosition, piecesAtBalance, senseTotals, supportPushes, type Load } from '../physics/moments.ts';
import { fixed } from '../physics/format.ts';
import type { BeamFig, BeamLoad, BroomFig, Lesson } from './types.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const N = (x: number, dp = 0): string => `${fixed(x, dp)}${NB}N`;
const m = (x: number, dp = 2): string => `${fixed(x, dp)}${NB}m`;

// The puzzle: the broom balanced on a finger, sawn at the balance point.
export const BROOM = { total: 8.0, brush: 0.15, handle: 0.45 }; // N; m from the cut to each piece's centre of gravity
// The balance plank: a light plank on a pivot at its middle. Distances from the pivot; Ana and the box on the left.
export const PLANK = { L: 4.4, pivot: 2.2 };
export const ANA = { W: 300, d: 1.6 };
export const BEN = { W: 400 };
export const BOX = { W: 100, d: 0.6 };
// A uniform beam on a support near its left end; Zoe stands on that end.
export const BEAM = { L: 3.0, W: 600, support: 1.0 };
// A uniform plank on a trestle at each end, a painter on it (positions from the left end).
export const PAINTER = { L: 4.0, plank: 200, W: 600, at: 1.0 };
// Skill check.
export const RULE = { pivot: 0.4, load: 0.5, at: 0.1 }; // m marks, N
export const BARROW = { W: 400, d: 0.4, handles: 1.2 }; // N, m from the axle
export const POLE = { L: 2.0, W: 80, bucket: 120, fromFront: 0.5 }; // m, N, N, m

const anaLoad: Load = { W: ANA.W, at: PLANK.pivot - ANA.d };
const boxLoad: Load = { W: BOX.W, at: PLANK.pivot - BOX.d };
const ben = (loads: Load[]) => balancingPosition(loads, BEN.W, PLANK.pivot) - PLANK.pivot;
const beamLoad: Load = { W: BEAM.W, at: BEAM.L / 2 };
const [brushW, handleW] = piecesAtBalance(BROOM.total, BROOM.brush, BROOM.handle);
const painterLoads: Load[] = [
  { W: PAINTER.W, at: PAINTER.at },
  { W: PAINTER.plank, at: PAINTER.L / 2 },
];
const [leftPush, rightPush] = supportPushes(painterLoads, 0, PAINTER.L);
const ruleW = balancingLoad([{ W: RULE.load, at: RULE.at }], 0.5, RULE.pivot);
const [, barrowLift] = supportPushes([{ W: BARROW.W, at: BARROW.d }], 0, BARROW.handles);
const poleLoads: Load[] = [
  { W: POLE.bucket, at: POLE.fromFront },
  { W: POLE.W, at: POLE.L / 2 },
];
const [poleFront, poleBack] = supportPushes(poleLoads, 0, POLE.L);

/** Answers and named mistakes, used by the screens and re-checked by keeping-balance.test.ts. */
export const ANSWERS = {
  explore: { right: ben([anaLoad]), same: ANA.d, upsideDown: (BEN.W * ANA.d) / ANA.W, totals: senseTotals([anaLoad, { W: BEN.W, at: PLANK.pivot + ben([anaLoad]) }], PLANK.pivot) },
  box: {
    right: ben([anaLoad, boxLoad]),
    left: ANA.W * ANA.d + BOX.W * BOX.d,
    forgot: ben([anaLoad]),
    atAna: ((ANA.W + BOX.W) * ANA.d) / BEN.W,
    subtracted: (ANA.W * ANA.d - BOX.W * BOX.d) / BEN.W,
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
  pole: { right: poleFront, back: poleBack, shared: (POLE.W + POLE.bucket) / 2, forgot: supportPushes([poleLoads[0]], 0, POLE.L)[0] },
};
const X = ANSWERS;

const broom = (over: Partial<BroomFig>): BroomFig => ({ kind: 'broom', ...BROOM, ...over });

const person = (id: string, name: string, W: number, at: number, extra: Partial<BeamLoad> = {}): BeamLoad => ({ id, look: 'person', name, W, at, ...extra });
const plankFig = (loads: BeamLoad[], header: string, over: Partial<BeamFig> = {}): BeamFig => ({ kind: 'beam', header, L: PLANK.L, supports: [PLANK.pivot], loads, moments: true, ...over });
const anaOn = person('ana', 'ANA', ANA.W, anaLoad.at);
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

export const keepingBalance: Lesson = {
  id: 'balance',
  title: 'Keeping balance',
  spec: [16],
  minutes: 12,
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
        { id: 'brush', label: 'The short piece with the brush' },
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
      id: 'seesaw',
      kind: 'explore',
      instruction: 'Drag the slider to move Ben along the plank. Watch both totals at the top.',
      fig: plankFig([anaOn, person('ben', 'BEN', BEN.W, PLANK.pivot + 0.4, { slide: true })], `light plank, Ana ${N(ANA.W)}, Ben ${N(BEN.W)}`),
      slider: { min: 0.4, max: 2.0, step: 0.1, tick: 0.4, label: "Ben's distance from the pivot", unit: 'm', symbol: 'x', dp: 1, start: 0.4 },
      question: {
        prompt: 'Where does Ben stand when the plank balances?',
        options: [
          { id: 'same', label: `${m(X.explore.same, 1)}: as far out as Ana`, hint: 'There his 400 N turns harder than her 300 N. Watch the totals.' },
          { id: 'right', label: `${m(X.explore.right, 1)}: ${BEN.W} × ${fixed(X.explore.right, 1)} = ${ANA.W} × ${fixed(ANA.d, 1)}`, correct: true },
          { id: 'further', label: `${m(X.explore.upsideDown, 1)}: further out, because he is heavier`, hint: 'Further out turns harder still. The heavier one moves in.' },
        ],
        right: `Right: ${BEN.W} × ${fixed(X.explore.right, 1)} = ${fixed(X.explore.totals.clockwise, 0)} N m clockwise, the same as Ana's ${ANA.W} × ${fixed(ANA.d, 1)} anticlockwise. The heavier person stands nearer.`,
      },
    },
    {
      id: 'box',
      kind: 'choice',
      prompt: `Ana puts down a ${N(BOX.W)} box ${m(BOX.d)} left of the pivot and stays where she is. Where must Ben stand now to balance the plank?`,
      fig: plankFig([anaOn, { id: 'box', look: 'box', W: BOX.W, at: boxLoad.at }, person('ben', 'BEN', BEN.W, PLANK.pivot + X.box.right, { asked: 'at' })], `Ana ${N(ANA.W)}, box ${N(BOX.W)}, Ben ${N(BEN.W)}`, { answer: 'afterCheck' }),
      options: [
        { id: 'subtracted', label: `${m(X.box.subtracted)} right of the pivot`, hint: 'The box and Ana are on the same side: their moments add.' },
        { id: 'forgot', label: `${m(X.box.forgot)} right of the pivot`, hint: 'The box turns the plank too: add its moment to Ana’s.' },
        { id: 'right', label: `${m(X.box.right)} right of the pivot`, correct: true },
        { id: 'atAna', label: `${m(X.box.atAna)} right of the pivot`, hint: 'The box is only 0.60 m out. Use its own distance.' },
      ],
      why: `Anticlockwise: ${ANA.W} × ${fixed(ANA.d, 2)} + ${BOX.W} × ${fixed(BOX.d, 2)} = ${fixed(X.box.left, 0)} N m. Ben needs the same clockwise: x = ${fixed(X.box.left, 0)} ÷ ${BEN.W} = ${m(X.box.right)}.`,
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
      kind: 'choice',
      prompt: `The beam weighs ${N(BEAM.W)}. Zoe stands on its left end, and the beam balances. What is Zoe's weight?`,
      fig: beamFig({ answer: 'afterCheck', moments: true }),
      options: [
        { id: 'right', label: N(X.beam.right), correct: true },
        { id: 'same', label: N(X.beam.same), hint: 'Equal weights balance only at equal distances: 1.00 m against 0.50 m.' },
        { id: 'fromEnd', label: N(X.beam.fromEnd), hint: 'Measure from the support, not from the end: the weight is 0.50 m from it.' },
        { id: 'upsideDown', label: N(X.beam.upsideDown), hint: 'Zoe is twice as far out as the beam’s weight, so she needs half of it.' },
      ],
      why: `The beam's weight acts ${m(X.beam.arm)} right of the support: ${BEAM.W} × ${fixed(X.beam.arm, 2)} = ${fixed(BEAM.W * X.beam.arm, 0)} N m clockwise. Zoe is ${m(BEAM.support)} left: W = ${N(X.beam.right)}.`,
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Back to the ${N(BROOM.total, 1)} broom. The brush piece's weight acts ${m(BROOM.brush)} from the cut, the handle's ${m(BROOM.handle)}. Which is heavier?`,
      fig: broom({ cut: true, pieces: 'afterCheck' }),
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
      body: [
        'Equilibrium also means **no resultant force**: the supports push up with the whole weight, all together.',
        'And the moments balance about **any** point. Take moments about a point where an unknown force acts: its moment there is zero, so it drops out.',
      ],
    },
    {
      id: 'painter',
      kind: 'choice',
      prompt: `The plank lies on a trestle at each end. A ${N(PAINTER.W)} painter stands ${m(PAINTER.at, 1)} from the left end. How hard does the right trestle push up?`,
      fig: painterFig({ known: [], asked: 1 }),
      options: [
        { id: 'forgot', label: N(X.painter.forgot), hint: 'The plank’s own 200 N acts at its middle, 2.0 m from the left: add its moment.' },
        { id: 'right', label: N(X.painter.right), correct: true },
        { id: 'shared', label: N(X.painter.shared), hint: 'The painter is near the left trestle, so the left one takes more.' },
        { id: 'swapped', label: N(X.painter.left), hint: 'That is the left trestle. Take moments about the left one to find the right.' },
      ],
      why: `Moments about the left trestle: R × ${fixed(PAINTER.L, 1)} = ${PAINTER.W} × ${fixed(PAINTER.at, 1)} + ${PAINTER.plank} × ${fixed(PAINTER.L / 2, 1)} = ${fixed(X.painter.right * PAINTER.L, 0)} N m, so R = ${N(X.painter.right)}. The left push has no moment there.`,
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
      body: [
        'In equilibrium there is **no resultant force**, and about any point the clockwise moments equal the anticlockwise ones. Weight acts at the centre of gravity.',
        'Pick a pivot where an unknown force acts and it drops out. That completes momentum and moments: next comes energy.',
      ],
    },
  ],
  skillCheck: [
    {
      id: 'rule',
      kind: 'choice',
      prompt: `A uniform metre rule balances on a knife-edge at the ${fixed(RULE.pivot * 100, 1)} cm mark when a ${N(RULE.load, 2)} weight hangs at the ${fixed(RULE.at * 100, 1)} cm mark. What does the rule weigh?`,
      options: [
        { id: 'fromZero', label: N(X.rule.fromZero, 2) },
        { id: 'upsideDown', label: N(X.rule.upsideDown, 2) },
        { id: 'equal', label: N(X.rule.equal, 2) },
        { id: 'right', label: N(X.rule.right, 2), correct: true },
      ],
      why: `The rule's weight acts at the 50.0 cm mark, ${m(0.5 - RULE.pivot)} from the knife-edge; the load is ${m(RULE.pivot - RULE.at)} away. W × 0.10 = 0.50 × 0.30, so W = ${N(X.rule.right, 2)}.`,
    },
    {
      id: 'barrow',
      kind: 'choice',
      prompt: `A loaded wheelbarrow weighs ${N(BARROW.W)}, acting ${m(BARROW.d)} from the wheel's axle. Its handles are ${m(BARROW.handles)} from the axle. What upward force holds it up?`,
      options: [
        { id: 'right', label: N(X.barrow.right), correct: true },
        { id: 'wheel', label: N(X.barrow.wheel) },
        { id: 'all', label: N(X.barrow.all) },
        { id: 'upsideDown', label: N(X.barrow.upsideDown) },
      ],
      why: `Moments about the axle, where the wheel's push drops out: F × ${fixed(BARROW.handles, 2)} = ${BARROW.W} × ${fixed(BARROW.d, 2)}, so F = ${N(X.barrow.right)}. The wheel takes the other ${N(X.barrow.wheel)}.`,
    },
    {
      id: 'pole',
      kind: 'choice',
      prompt: `Two people carry a uniform ${m(POLE.L, 1)}, ${N(POLE.W)} pole by its ends. A ${N(POLE.bucket)} bucket hangs ${m(POLE.fromFront)} from the front. How hard does the front person push up?`,
      options: [
        { id: 'back', label: N(X.pole.back) },
        { id: 'forgot', label: N(X.pole.forgot) },
        { id: 'shared', label: N(X.pole.shared) },
        { id: 'right', label: N(X.pole.right), correct: true },
      ],
      why: `Moments about the back end: F × ${fixed(POLE.L, 1)} = ${POLE.bucket} × ${fixed(POLE.L - POLE.fromFront, 1)} + ${POLE.W} × ${fixed(POLE.L / 2, 1)} = ${fixed(X.pole.right * POLE.L, 0)} N m, so F = ${N(X.pole.right)}. The back person pushes ${N(X.pole.back)}.`,
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
