// Lesson "Turning forces" — the moment of a force, Fx with x the perpendicular distance (WPH11 point 15).
// The puzzle: Priya and Tom try the same 0.30 m spanner on a stuck nut with the same 40 N. Priya pulls at the end but at
// 30° to the handle; Tom pulls at right angles, 0.20 m from the nut. Tom's pull turns harder: 8.0 N m against 6.0 N m,
// because Priya's line of action passes only 0.15 m from the nut.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { distanceForMoment, loadMoment, moment, momentAtAngle, perpendicularDistance, resultantMoment } from '../physics/moments.ts';
import { fixed } from '../physics/format.ts';
import type { BarFig, Lesson, PoleFig, SpannerFig } from './types.ts';

const NB = '\u00A0';
const RAD = Math.PI / 180;
const Nm = (x: number, dp = 1): string => `${fixed(x, dp)}${NB}N${NB}m`;
const m = (x: number, dp = 2): string => `${fixed(x, dp)}${NB}m`;
/** "5.0 N m anticlockwise" from a signed moment (anticlockwise +). */
const sense = (x: number): string => `${Nm(Math.abs(x))} ${x >= 0 ? 'anticlockwise' : 'clockwise'}`;

// The puzzle: one spanner, one force, two ways to pull.
export const F = 40; // N, both pulls
export const SPANNER = 0.3; // m, from the nut's centre to the end
export const PRIYA = { r: 0.3, angle: 30 }; // at the end, at 30° to the handle
export const TOM = { r: 0.2, angle: 90 }; // at right angles, 20 cm from the nut
// The sign on a pole fixed to a wall.
export const POLE = { L: 2.0, angle: 30, W: 50 }; // m, degrees above the horizontal, N
// The light bar on a pivot at its middle (right of the pivot positive).
export const BAR = { half: 0.5, left: { at: -0.5, W: 30 }, right: { at: 0.2, W: 50 } };
// Skill check.
export const PEDAL = { r: 0.17, below: 60, F: 300 }; // m, degrees below the horizontal, N straight down
export const WHEEL = { across: 0.36, F: 20 }; // m, N each hand
export const BOLT = { M: 90, F: 250, angle: 60 }; // N m, N, degrees to the handle

const mTom = momentAtAngle(F, TOM.r, TOM.angle);
const mPriya = momentAtAngle(F, PRIYA.r, PRIYA.angle);
const xPriya = perpendicularDistance(PRIYA.r, PRIYA.angle);
const poleX = POLE.L * Math.cos(POLE.angle * RAD); // the weight is vertical: the horizontal distance counts
const barLeft = loadMoment(BAR.left.W, BAR.left.at);
const barRight = loadMoment(BAR.right.W, BAR.right.at);
const pedalX = PEDAL.r * Math.cos(PEDAL.below * RAD);

/** Answers and named mistakes, used by the screens and re-checked by turning-forces.test.ts. */
export const ANSWERS = {
  tom: { right: mTom, cm: moment(F, TOM.r * 100), divided: F / TOM.r },
  explore: { along: momentAtAngle(F, PRIYA.r, 0), across: momentAtAngle(F, PRIYA.r, 90) },
  /** The puzzle. */
  puzzle: { right: mPriya, x: xPriya, tom: mTom, point: moment(F, PRIYA.r), cos: moment(F, PRIYA.r * Math.cos(PRIYA.angle * RAD)) },
  pole: { x: poleX, right: moment(POLE.W, poleX), along: moment(POLE.W, POLE.L), height: moment(POLE.W, POLE.L * Math.sin(POLE.angle * RAD)) },
  bar: { left: barLeft, right: barRight, total: resultantMoment([barLeft, barRight]), added: Math.abs(barLeft) + Math.abs(barRight) },
  pedal: { x: pedalX, right: moment(PEDAL.F, pedalX), length: moment(PEDAL.F, PEDAL.r), sin: moment(PEDAL.F, PEDAL.r * Math.sin(PEDAL.below * RAD)), divided: PEDAL.F / PEDAL.r },
  wheel: { right: 2 * moment(WHEEL.F, WHEEL.across / 2), one: moment(WHEEL.F, WHEEL.across / 2), diameter: 2 * moment(WHEEL.F, WHEEL.across) },
  bolt: {
    right: distanceForMoment(BOLT.M, BOLT.F, BOLT.angle),
    turning: BOLT.F * Math.sin(BOLT.angle * RAD),
    ignored: distanceForMoment(BOLT.M, BOLT.F),
    cos: BOLT.M / (BOLT.F * Math.cos(BOLT.angle * RAD)),
    inverted: (BOLT.F * Math.sin(BOLT.angle * RAD)) / BOLT.M,
  },
};
const X = ANSWERS;

const nut = (over: Partial<SpannerFig>): SpannerFig => ({
  kind: 'spanner',
  F,
  length: SPANNER,
  pulls: [
    { who: 'PRIYA', ...PRIYA },
    { who: 'TOM', ...TOM },
  ],
  ...over,
});

const pole = (over: Partial<PoleFig>): PoleFig => ({ kind: 'pole', ...POLE, ...over });

const barFig: BarFig = { kind: 'bar', half: BAR.half, loads: [BAR.left, BAR.right], moments: 'afterCheck', play: 'afterCheck' };
const barStill: BarFig = { kind: 'bar', half: BAR.half, loads: [BAR.left, BAR.right] };

export const turningForces: Lesson = {
  id: 'moments',
  title: 'Turning forces',
  spec: [15],
  minutes: 12,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'Moment of a force', from: 'moment' },
    { title: 'Back to the nut', from: 'hook-again' },
  ],
  cast: ['Priya', 'Tom', 'Maya', 'Joel'],
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Turning forces',
      body: `A wheel nut is stuck. Priya and Tom try the same spanner, each pulling with ${F}${NB}N, but in different ways.`,
      fig: nut({}),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: 'Whose pull has the bigger turning effect on the nut?',
      fig: nut({}),
      options: [
        { id: 'priya', label: "Priya's: she pulls further from the nut" },
        { id: 'tom', label: "Tom's: he pulls at right angles", correct: true },
        { id: 'same', label: 'The same: same force, same spanner' },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'moment',
      kind: 'text',
      body: [
        'A force can make a body turn about a fixed point, the **pivot**. Its turning effect is called the **moment** of the force.',
        'Push a door at the handle and it swings easily. Push it near the hinge and it hardly moves: distance matters as much as force.',
      ],
      card: { term: 'Moment', text: 'For a force at right angles to the lever: moment = force × distance from the pivot. Unit: N m.' },
    },
    {
      id: 'tom',
      kind: 'choice',
      prompt: `Tom pulls with ${F}${NB}N at right angles to the handle, ${Math.round(TOM.r * 100)}${NB}cm from the centre of the nut. What is the moment of his pull?`,
      fig: nut({ pulls: [{ who: 'TOM', ...TOM }], perp: 'afterCheck', moment: 'afterCheck', play: 'afterCheck' }),
      options: [
        { id: 'cm', label: Nm(X.tom.cm, 0), hint: '20 cm is 0.20 m. Put distances in metres for N m.' },
        { id: 'divided', label: Nm(X.tom.divided, 0), hint: 'Multiply, do not divide: further from the pivot turns more.' },
        { id: 'right', label: Nm(mTom), correct: true },
        { id: 'unit', label: `${fixed(mTom, 1)}${NB}N`, hint: 'Force times distance: the unit is N m, not N.' },
      ],
      why: `${Math.round(TOM.r * 100)} cm = ${fixed(TOM.r, 2)} m, so the moment = ${F} × ${fixed(TOM.r, 2)} = ${Nm(mTom)}, anticlockwise.`,
    },
    {
      id: 'line',
      kind: 'text',
      body: [
        'Priya pulls at an angle. Extend her arrow both ways: that straight line is the force’s **line of action**.',
        'What counts is the **perpendicular distance** from the pivot to the line of action: the shortest way to it, at right angles.',
      ],
      card: { term: 'Moment of a force', text: 'Moment = Fx, where x is the perpendicular distance from the pivot to the line of action of the force.' },
    },
    {
      id: 'angle',
      kind: 'explore',
      instruction: "Drag the slider to turn Priya's pull. Watch the perpendicular x from the nut.",
      fig: nut({ pulls: [{ who: 'PRIYA', r: PRIYA.r, angle: 90 }], perp: 'shown' }),
      slider: { min: 0, max: 90, step: 5, tick: 15, label: "Priya's angle to the handle", unit: '°', symbol: 'θ', dp: 0, start: 90 },
      question: {
        prompt: 'Turn the pull until it points along the handle. What is its moment about the nut?',
        options: [
          { id: 'most', label: 'The biggest: all 40 N pushes on the spanner', hint: 'It only pushes into the nut. Watch x as you turn it.' },
          { id: 'right', label: 'Zero: its line of action passes through the nut', correct: true },
          { id: 'same', label: `Still ${Nm(X.explore.across)}: same force, same point`, hint: 'Same force, same point, but x shrinks. Watch the perpendicular.' },
        ],
        right: `Right: at 0° the line of action runs through the nut, so x = 0. At 90°, x is the whole ${Math.round(SPANNER * 100)} cm.`,
      },
    },
    {
      id: 'hook-again',
      kind: 'build',
      prompt: `Back to the nut. Priya pulls with ${F}${NB}N at the end of the ${Math.round(SPANNER * 100)}${NB}cm spanner, at ${PRIYA.angle}° to the handle. Build her moment.`,
      fig: nut({ perp: 'afterCheck', moment: 'afterCheck', play: 'afterCheck' }),
      equation: 'M = {F} × {x}',
      boxes: { F: 'force', x: 'perp' },
      chips: [
        { id: 'force', label: `${F}${NB}N` },
        { id: 'perp', label: m(xPriya) },
        { id: 'point', label: m(PRIYA.r), hint: 'That is where she pulls, not the perpendicular distance to her line.' },
        { id: 'cos', label: m(PRIYA.r * Math.cos(PRIYA.angle * RAD)), hint: 'x is opposite the 30° angle: 0.30 × sin 30°, not cos.' },
      ],
      result: { symbol: 'M', value: mPriya, unit: 'N m' },
      why: `x = ${fixed(PRIYA.r, 2)} × sin ${PRIYA.angle}° = ${m(xPriya)}, so M = ${F} × ${fixed(xPriya, 2)} = ${Nm(mPriya)}. Tom's ${Nm(mTom)} is bigger: nearer the nut, but at right angles.`,
    },
    {
      id: 'pole-x',
      kind: 'tapFig',
      prompt: `A ${POLE.W}${NB}N sign hangs from the end of a pole. Which distance gives the moment of its weight about the fixing?`,
      instruction: 'Tap the distance you would multiply the weight by.',
      fig: pole({ candidates: true }),
      options: [
        { id: 'along', label: 'Along the pole', hint: 'The weight acts straight down: measure to its line of action.' },
        { id: 'height', label: 'The height of the end', hint: 'That runs along the line of action. x is at right angles to it.' },
        { id: 'across', label: 'The horizontal distance', correct: true },
      ],
      why: 'The weight’s line of action is vertical. The perpendicular from the fixing to a vertical line is horizontal.',
    },
    {
      id: 'pole-error',
      kind: 'spotError',
      prompt: `The pole is ${m(POLE.L, 1)} long, ${POLE.angle}° above the horizontal. Maya works out the moment of the sign. One line is wrong. Which?`,
      fig: pole({}),
      lines: [
        { id: 'w', text: `The ${POLE.W}${NB}N weight acts straight down.`, hint: 'That line is right: the sign hangs straight down.' },
        { id: 'x', text: `x = length of the pole = ${m(POLE.L, 1)}`, wrong: true, fix: `x = ${fixed(POLE.L, 1)} cos ${POLE.angle}° = ${m(poleX)}, horizontal` },
        { id: 'm', text: `Moment = Fx = ${POLE.W} × ${fixed(POLE.L, 1)} = ${Nm(X.pole.along, 0)}`, hint: 'This follows from the line above. Check the x put in.' },
        { id: 'end', text: `So the sign turns the pole ${Nm(X.pole.along, 0)} clockwise.`, hint: 'This repeats the line above. Look further up for the slip.' },
      ],
      why: `The weight is vertical, so x is horizontal: ${fixed(POLE.L, 1)} cos ${POLE.angle}° = ${m(poleX)}, and the moment is ${Nm(X.pole.right)}, not ${Nm(X.pole.along, 0)}.`,
    },
    {
      id: 'sense',
      kind: 'text',
      body: ['Moments the same way add; opposite ways subtract. The bigger total decides the turn.'],
      fig: barStill,
    },
    {
      id: 'bar',
      kind: 'choice',
      prompt: `A light bar is pivoted at its middle. ${BAR.left.W}${NB}N hangs ${m(-BAR.left.at)} left of the pivot, ${BAR.right.W}${NB}N hangs ${m(BAR.right.at)} right. What is the resultant moment?`,
      fig: barFig,
      options: [
        { id: 'added', label: sense(X.bar.added), hint: 'The two turn the bar opposite ways: subtract.' },
        { id: 'right', label: sense(X.bar.total), correct: true },
        { id: 'bigger', label: sense(-X.bar.total), hint: '50 N is bigger, but 50 × 0.20 = 10.0 N m is less than 15.0.' },
        { id: 'zero', label: 'Zero: the bar balances', hint: 'Only if the moments are equal: 15.0 and 10.0 are not.' },
      ],
      why: `Left: ${BAR.left.W} × ${fixed(-BAR.left.at, 2)} = ${sense(barLeft)}. Right: ${BAR.right.W} × ${fixed(BAR.right.at, 2)} = ${sense(barRight)}. Resultant: ${sense(X.bar.total)}.`,
    },
    {
      id: 'rules',
      kind: 'text',
      body: ['Moment = **F × x**, x the perpendicular distance from the pivot to the line of action.'],
      fig: nut({ perp: 'shown', moment: 'shown' }),
    },
  ],
  skillCheck: [
    {
      id: 'pedal',
      kind: 'build',
      prompt: `A bicycle crank ${m(PEDAL.r)} long points ${PEDAL.below}° below the horizontal. The foot pushes straight down with ${PEDAL.F}${NB}N. Build the moment about the axle.`,
      equation: 'M = {F} × {x}',
      boxes: { F: 'force', x: 'horizontal' },
      chips: [
        { id: 'force', label: `${PEDAL.F}${NB}N` },
        { id: 'horizontal', label: m(pedalX, 3) },
        { id: 'length', label: m(PEDAL.r), hint: 'That is the crank length. The push is vertical: use the horizontal distance.' },
        { id: 'sin', label: m(PEDAL.r * Math.sin(PEDAL.below * RAD), 3), hint: 'The horizontal part is 0.17 × cos 60°, not sin.' },
      ],
      result: { symbol: 'M', value: X.pedal.right, unit: 'N m' },
      why: `The push is vertical, so x is horizontal: ${fixed(PEDAL.r, 2)} × cos ${PEDAL.below}° = ${m(pedalX, 3)}. Moment = ${PEDAL.F} × ${fixed(pedalX, 3)} = ${Nm(X.pedal.right)}.`,
    },
    {
      id: 'wheel',
      kind: 'spotError',
      prompt: `A steering wheel is ${m(WHEEL.across)} across. One hand pushes up, the other down, ${WHEEL.F}${NB}N each. Joel's working has one mistake. Which line?`,
      lines: [
        { id: 'r', text: `Each hand is ${m(WHEEL.across / 2)} from the centre.`, hint: 'That is right: half of the 0.36 m across.' },
        { id: 'cancel', text: 'The forces are opposite, so the moments cancel.', wrong: true, fix: 'Both moments turn the wheel clockwise, so they add.' },
        { id: 'sum', text: `Total moment = ${WHEEL.F} × ${fixed(WHEEL.across / 2, 2)} − ${WHEEL.F} × ${fixed(WHEEL.across / 2, 2)} = 0`, hint: 'This follows from the line above. Do the moments really subtract?' },
        { id: 'end', text: 'So the wheel does not turn.', hint: 'This repeats the line above. Look further up for the slip.' },
      ],
      why: `The forces cancel, but the moments add: 2 × ${WHEEL.F} × ${fixed(WHEEL.across / 2, 2)} = ${Nm(X.wheel.right)}. A pair of equal opposite forces turns a body.`,
    },
    {
      id: 'slide',
      kind: 'choice',
      prompt: 'Which change leaves the moment of a force about a pivot exactly the same?',
      options: [
        { id: 'angle', label: 'Turning the force to a new angle at the same point' },
        { id: 'nearer', label: 'Moving the force nearer the pivot, in the same direction' },
        { id: 'right', label: 'Sliding the force along its own line of action', correct: true },
        { id: 'other', label: 'Moving it to the same distance on the other side of the pivot' },
      ],
      why: 'Sliding a force along its line of action keeps x, so F × x stays the same. On the other side the size is the same, but the sense flips.',
    },
    {
      id: 'bolt',
      kind: 'examCard',
      context: `A bolt needs a moment of ${BOLT.M}${NB}N${NB}m to undo it. A mechanic pushes with ${BOLT.F}${NB}N at ${BOLT.angle}° to the handle.`,
      parts: [
        {
          id: 'a',
          command: 'Calculate',
          text: 'how far from the bolt she must push.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'x = {M} ÷ ({F} × sin {θ})',
            boxes: { M: 'moment', F: 'force', 'θ': 'angle' },
            chips: [
              { id: 'moment', label: `${BOLT.M}${NB}N${NB}m` },
              { id: 'force', label: `${BOLT.F}${NB}N` },
              { id: 'angle', label: `${BOLT.angle}°` },
              { id: 'other', label: `${90 - BOLT.angle}°`, hint: 'The angle is measured to the handle: 60°, not its complement.' },
              { id: 'comp', label: `${fixed(X.bolt.turning, 0)}${NB}N`, hint: 'That is F sin θ already. The equation applies sin itself.' },
            ],
            result: { symbol: 'x', value: X.bolt.right, unit: 'm' },
          },
          why: `Only F sin ${BOLT.angle}° = ${fixed(X.bolt.turning, 0)} N turns the bolt, so x = ${BOLT.M} ÷ ${fixed(X.bolt.turning, 0)} = ${m(X.bolt.right, 3)}. One mark for F sin θ, one for x.`,
        },
        {
          id: 'b',
          command: 'Explain',
          text: 'why she must push further out than if she pushed at 90°.',
          marks: 2,
          kind: 'order',
          steps: [
            { id: 'part', text: `Only the part of the push across the handle turns the bolt: F sin ${BOLT.angle}°.` },
            { id: 'less', text: `That is ${fixed(X.bolt.turning, 0)} N, less than the full ${BOLT.F} N.` },
            { id: 'same', text: `The moment needed is still ${BOLT.M} N m.` },
            { id: 'far', text: `So the distance must be bigger: ${m(X.bolt.right, 3)}, not ${m(X.bolt.ignored)}.` },
          ],
          why: `At 90° the whole ${BOLT.F} N turns the bolt and ${m(X.bolt.ignored)} is enough. Tilted, a smaller part turns it, so the push must be further out.`,
        },
      ],
    },
  ],
  youCanNow: [
    'Find the moment of a force about a pivot',
    'Find the perpendicular distance to a line of action',
    'Handle a force at an angle in two ways',
    'Add clockwise and anticlockwise moments',
  ],
  recap: {
    fig: nut({ perp: 'shown', moment: 'shown' }),
    text: "Further out but at an angle, Priya's pull turns the nut less than Tom's.",
  },
  card: {
    formula: 'moment = Fx',
    idea: "x is the perpendicular distance from the pivot to the force's line of action. Unit: N m.",
  },
};
