// Lesson "Turning forces" — the moment of a force, Fx with x the perpendicular distance (WPH11 point 15).
// The puzzle: Mia and Leo try the same 0.30 m spanner on a stuck nut with the same 40 N. Mia pulls at the end but at
// 30° to the handle; Leo pulls at right angles, 0.20 m from the nut. Leo's pull turns harder: 8.0 N m against 6.0 N m,
// because Mia's line of action passes only 0.15 m from the nut.
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
export const MIA = { r: 0.3, angle: 30 }; // at the end, at 30° to the handle
export const LEO = { r: 0.2, angle: 90 }; // at right angles, 20 cm from the nut
// The sign on a pole fixed to a wall.
export const POLE = { L: 2.0, angle: 30, W: 50 }; // m, degrees above the horizontal, N
// The light bar on a pivot at its middle (right of the pivot positive).
export const BAR = { half: 0.5, left: { at: -0.5, W: 30 }, right: { at: 0.2, W: 50 } };
// Skill check.
export const PEDAL = { r: 0.17, below: 60, F: 300 }; // m, degrees below the horizontal, N straight down
export const WHEEL = { across: 0.36, F: 20 }; // m, N each hand
export const BOLT = { M: 90, F: 250, angle: 60 }; // N m, N, degrees to the handle

const mLeo = momentAtAngle(F, LEO.r, LEO.angle);
const mMia = momentAtAngle(F, MIA.r, MIA.angle);
const xMia = perpendicularDistance(MIA.r, MIA.angle);
const poleX = POLE.L * Math.cos(POLE.angle * RAD); // the weight is vertical: the horizontal distance counts
const barLeft = loadMoment(BAR.left.W, BAR.left.at);
const barRight = loadMoment(BAR.right.W, BAR.right.at);
const pedalX = PEDAL.r * Math.cos(PEDAL.below * RAD);

/** Answers and named mistakes, used by the screens and re-checked by turning-forces.test.ts. */
export const ANSWERS = {
  leo: { right: mLeo, cm: moment(F, LEO.r * 100), divided: F / LEO.r },
  explore: { along: momentAtAngle(F, MIA.r, 0), across: momentAtAngle(F, MIA.r, 90) },
  /** The puzzle. */
  puzzle: { right: mMia, x: xMia, leo: mLeo, point: moment(F, MIA.r), cos: moment(F, MIA.r * Math.cos(MIA.angle * RAD)) },
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
    { who: 'MIA', ...MIA },
    { who: 'LEO', ...LEO },
  ],
  ...over,
});

const pole = (over: Partial<PoleFig>): PoleFig => ({ kind: 'pole', ...POLE, ...over });

const barFig: BarFig = { kind: 'bar', half: BAR.half, loads: [BAR.left, BAR.right], moments: 'afterCheck' };

export const turningForces: Lesson = {
  id: 'moments',
  title: 'Turning forces',
  spec: [15],
  minutes: 12,
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Turning forces',
      body: `A wheel nut is stuck. Mia and Leo try the same spanner, each pulling with ${F}${NB}N, but in different ways.`,
      fig: nut({}),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: 'Whose pull has the bigger turning effect on the nut?',
      fig: nut({}),
      options: [
        { id: 'mia', label: "Mia's: she pulls further from the nut" },
        { id: 'leo', label: "Leo's: he pulls at right angles", correct: true },
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
      id: 'leo',
      kind: 'choice',
      prompt: `Leo pulls with ${F}${NB}N at right angles to the handle, ${Math.round(LEO.r * 100)}${NB}cm from the centre of the nut. What is the moment of his pull?`,
      fig: nut({ pulls: [{ who: 'LEO', ...LEO }], perp: 'afterCheck', moment: 'afterCheck' }),
      options: [
        { id: 'cm', label: Nm(X.leo.cm, 0), hint: '20 cm is 0.20 m. Put distances in metres for N m.' },
        { id: 'divided', label: Nm(X.leo.divided, 0), hint: 'Multiply, do not divide: further from the pivot turns more.' },
        { id: 'right', label: Nm(mLeo), correct: true },
        { id: 'unit', label: `${fixed(mLeo, 1)}${NB}N`, hint: 'Force times distance: the unit is N m, not N.' },
      ],
      why: `${Math.round(LEO.r * 100)} cm = ${fixed(LEO.r, 2)} m, so the moment = ${F} × ${fixed(LEO.r, 2)} = ${Nm(mLeo)}, anticlockwise.`,
    },
    {
      id: 'line',
      kind: 'text',
      body: [
        'Mia pulls at an angle. Extend her arrow both ways: that straight line is the force’s **line of action**.',
        'What counts is the **perpendicular distance** from the pivot to the line of action: the shortest way to it, at right angles.',
      ],
      card: { term: 'Moment of a force', text: 'Moment = Fx, where x is the perpendicular distance from the pivot to the line of action of the force.' },
    },
    {
      id: 'angle',
      kind: 'explore',
      instruction: "Drag the slider to turn Mia's pull. Watch the perpendicular x from the nut.",
      fig: nut({ pulls: [{ who: 'MIA', r: MIA.r, angle: 90 }], perp: 'shown' }),
      slider: { min: 0, max: 90, step: 5, tick: 15, label: "Mia's angle to the handle", unit: '°', symbol: 'θ', dp: 0, start: 90 },
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
      id: 'two-ways',
      kind: 'text',
      body: [
        'Or split Mia’s pull. Along the handle, F cos θ only pushes into the nut. Across it, **F sin θ** turns the nut, at the full 30 cm.',
        'Both ways give the same moment: F × (r sin θ) = (F sin θ) × r. Use whichever is easier to see.',
      ],
      card: { term: 'Force at θ to the lever', text: 'Moment = F r sin θ: F times the perpendicular distance, or the perpendicular component times r.' },
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Back to the nut. Mia pulls with ${F}${NB}N at the end of the ${Math.round(SPANNER * 100)}${NB}cm spanner, at ${MIA.angle}° to the handle. Whose moment is bigger?`,
      fig: nut({ perp: 'afterCheck', moment: 'afterCheck' }),
      options: [
        { id: 'point', label: `Mia's: hers is ${Nm(X.puzzle.point)}`, hint: '30 cm is where she pulls, not x. Use the perpendicular to her line.' },
        { id: 'cos', label: `Mia's: hers is ${Nm(X.puzzle.cos)}`, hint: 'x is opposite the 30° angle: 0.30 × sin 30°, not cos.' },
        { id: 'right', label: `Leo's: Mia's is only ${Nm(mMia)}`, correct: true },
        { id: 'same', label: 'The same: 40 N each', hint: 'Same force, but different perpendicular distances.' },
      ],
      why: `Mia: x = ${fixed(MIA.r, 2)} × sin ${MIA.angle}° = ${m(xMia)}, so ${F} × ${fixed(xMia, 2)} = ${Nm(mMia)}. Leo: ${Nm(mLeo)}. Nearer the nut, but at right angles, Leo wins.`,
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
      id: 'pole',
      kind: 'choice',
      prompt: `The pole is ${m(POLE.L, 1)} long, at ${POLE.angle}° above the horizontal. What is the moment of the ${POLE.W}${NB}N sign about the fixing?`,
      fig: pole({ moment: 'afterCheck' }),
      options: [
        { id: 'along', label: Nm(X.pole.along, 0), hint: `${m(POLE.L, 1)} is along the pole. Use the horizontal distance.` },
        { id: 'right', label: Nm(X.pole.right), correct: true },
        { id: 'height', label: Nm(X.pole.height), hint: 'That uses the height, 2.0 sin 30°. The weight needs cos 30°.' },
      ],
      why: `x = ${fixed(POLE.L, 1)} × cos ${POLE.angle}° = ${m(poleX)}, so the moment = ${POLE.W} × ${fixed(poleX, 2)} = ${Nm(X.pole.right)}, clockwise.`,
    },
    {
      id: 'sense',
      kind: 'text',
      body: [
        'A moment has a direction too: it turns the body **clockwise** or **anticlockwise**.',
        'Moments the same way add up; opposite ways, they subtract. The body starts to turn the way of the bigger total, the **resultant moment**.',
      ],
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
      body: [
        'Moment = **F × x**, where x is the perpendicular distance from the pivot to the line of action. A force through the pivot has no moment.',
        'Give every moment its sense. And if the clockwise and anticlockwise moments cancel exactly? That is the next lesson.',
      ],
    },
  ],
  skillCheck: [
    {
      id: 'pedal',
      kind: 'choice',
      prompt: `A bicycle crank ${m(PEDAL.r)} long points ${PEDAL.below}° below the horizontal. The foot pushes straight down with ${PEDAL.F}${NB}N. What is the moment about the axle?`,
      options: [
        { id: 'length', label: Nm(X.pedal.length) },
        { id: 'right', label: Nm(X.pedal.right), correct: true },
        { id: 'sin', label: Nm(X.pedal.sin) },
        { id: 'divided', label: Nm(Math.round(X.pedal.divided / 10) * 10, 0) },
      ],
      why: `The push is vertical, so x is horizontal: ${fixed(PEDAL.r, 2)} × cos ${PEDAL.below}° = ${m(pedalX, 3)}. Moment = ${PEDAL.F} × ${fixed(pedalX, 3)} = ${Nm(X.pedal.right)}.`,
    },
    {
      id: 'wheel',
      kind: 'choice',
      prompt: `A steering wheel is ${m(WHEEL.across)} across. Left hand pushes up, right hand pushes down, ${WHEEL.F}${NB}N each. What is the total moment about the centre?`,
      options: [
        { id: 'zero', label: 'Zero: the two forces cancel' },
        { id: 'one', label: Nm(X.wheel.one) },
        { id: 'right', label: Nm(X.wheel.right), correct: true },
        { id: 'diameter', label: Nm(X.wheel.diameter) },
      ],
      why: `Each hand is ${m(WHEEL.across / 2)} from the centre and both turn the wheel clockwise: 2 × ${WHEEL.F} × ${fixed(WHEEL.across / 2, 2)} = ${Nm(X.wheel.right)}. The forces cancel; the moments add.`,
    },
    {
      id: 'bolt',
      kind: 'choice',
      prompt: `A bolt needs a moment of ${BOLT.M}${NB}N${NB}m to undo it. A mechanic pushes with ${BOLT.F}${NB}N at ${BOLT.angle}° to the handle. How far from the bolt must she push?`,
      options: [
        { id: 'right', label: m(X.bolt.right), correct: true },
        { id: 'ignored', label: m(X.bolt.ignored) },
        { id: 'cos', label: m(X.bolt.cos) },
        { id: 'inverted', label: m(X.bolt.inverted, 1) },
      ],
      why: `Only F sin ${BOLT.angle}° = ${fixed(X.bolt.turning, 0)} N turns the bolt, so x = ${BOLT.M} ÷ ${fixed(X.bolt.turning, 0)} = ${m(X.bolt.right)}.`,
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
  ],
  youCanNow: [
    'Find the moment of a force about a pivot',
    'Find the perpendicular distance to a line of action',
    'Handle a force at an angle in two ways',
    'Add clockwise and anticlockwise moments',
  ],
  recap: {
    fig: nut({ perp: 'shown', moment: 'shown' }),
    text: "Further out but at an angle, Mia's pull turns the nut less than Leo's.",
  },
  card: {
    formula: 'moment = Fx',
    idea: "x is the perpendicular distance from the pivot to the force's line of action. Unit: N m.",
  },
};
