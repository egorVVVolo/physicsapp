// Lesson "Splitting a vector" — resolving a vector into two components at right angles: cos next to the angle, sin
// opposite it, a weight on a slope, and adding vectors at an angle through their components. WPH11 points 5 and 6.
// The puzzle: Ana pulls her sledge with 100 N on a rope at 60° above the snow; Ben pushes his straight forward with
// 60 N. Which sledge gets the larger forward force?
// The answer: Ben's. Only 100 cos 60° = 50.0 N of Ana's pull goes forward; the other 86.6 N lifts the sledge.
// Spec: docs/lessons/splitting-a-vector.md.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { angleForComponent, angleFromFirst, components, onSlope, sizeAtRightAngles } from '../physics/vectors.ts';
import { weight } from '../physics/dynamics.ts';
import { fixed } from '../physics/format.ts';
import type { HillFig, Lesson, ResolveFig, SledgeFig } from './types.ts';

const NB = '\u00A0'; // numbers never break from their units
/** "50.0 N" (or "100 N" with dp 0) */
const N = (x: number, dp = 1) => `${fixed(x, dp)}${NB}N`;
/** "11.6 m s⁻¹" */
const speed = (v: number) => `${fixed(v, 1)}${NB}m${NB}s⁻¹`;
/** "60°", "22.6°" */
const deg = (a: number, dp = 0) => `${fixed(a, dp)}°`;

// The sledges
export const PULL = 100; // N, Ana's rope
export const ANGLE = 60; // degrees above the snow
export const PUSH = 60; // N, Ben's push, straight forward
export const LOW = 45; // degrees: "is it half and half?"
// The same rope, measured from the vertical
export const FROM_VERTICAL = 90 - ANGLE;
// The kite string, angle from the vertical
export const KITE = { size: 20, angle: 35 };
// The kicked ball, angle above the ground
export const KICK = { u: 18, angle: 40 };
// Ben's sledge on a hill
export const HILL = { weight: 250, angle: 20 };
// Skill check
export const CLIMB = { v: 240, angle: 12 };
export const PARTS = { x: 36, y: 15 };
export const SKIER = { m: 70, angle: 14 };
export const TOW = { tension: 300, angle: 25 };
export const RAMP = { m: 40, angle: 25 }; // the exam card: a box on a ramp
/** The angles offered on the explore screen. */
export const EXPLORE = { steep: 37, right: 53 };

/** Components, angles and named mistakes, used by the screens and re-checked by the test. */
export const ANSWERS = (() => {
  const ana = components(PULL, ANGLE);
  const low = components(PULL, LOW);
  const kite = components(KITE.size, KITE.angle); // along = next to the angle (vertical), across = opposite (horizontal)
  const kick = components(KICK.u, KICK.angle);
  const hill = onSlope(HILL.weight, HILL.angle);
  const climb = components(CLIMB.v, CLIMB.angle);
  const w = weight(SKIER.m);
  const skier = onSlope(w, SKIER.angle);
  const rope = components(TOW.tension, TOW.angle);
  const wRamp = weight(RAMP.m);
  const ramp = onSlope(wRamp, RAMP.angle);
  const rad = Math.PI / 180;
  return {
    forward: ana.along,
    up: ana.across,
    divided: PULL / Math.cos(ANGLE * rad), // divided by cos instead of multiplying
    leftOver: PULL - ana.along, // the pull shared out like a number
    addedAsNumbers: ana.along + ana.across,
    addedBack: sizeAtRightAngles(ana.along, ana.across),
    sameAsBen: angleForComponent(PULL, PUSH),
    sameAsBenUp: components(PULL, angleForComponent(PULL, PUSH)).across,
    atSteep: components(PULL, EXPLORE.steep).along,
    low: low.along,
    lowDivided: PULL / Math.cos(LOW * rad),
    fromVertical: components(PULL, FROM_VERTICAL).across, // opposite the angle from the vertical: the forward part again
    kite: { right: kite.across, cos: kite.along, tan: KITE.size * Math.tan(KITE.angle * rad) },
    kick: { right: kick.across, cos: kick.along, half: KICK.u / 2 },
    hill: { right: hill.along, into: hill.into },
    climb: { right: climb.across, cos: climb.along },
    angle: {
      right: angleFromFirst(PARTS.x, PARTS.y), // tan θ = 15 ÷ 36 from the horizontal
      fromVertical: angleFromFirst(PARTS.y, PARTS.x),
      sin: Math.asin(PARTS.y / PARTS.x) / rad,
      cos: Math.acos(PARTS.y / PARTS.x) / rad,
      size: sizeAtRightAngles(PARTS.x, PARTS.y),
    },
    skier: { weight: w, right: skier.along, into: skier.into, noG: SKIER.m * Math.sin(SKIER.angle * rad) },
    ramp: { weight: wRamp, right: ramp.along, into: ramp.into },
    climbFromVertical: 90 - CLIMB.angle,
    tow: { right: 2 * rope.along, added: 2 * TOW.tension, sin: 2 * rope.across, one: rope.along, sideways: rope.across },
  };
})();

const x = ANSWERS;

const sledge = (over: Partial<SledgeFig> = {}): SledgeFig => ({ kind: 'sledge', who: 'A', pull: PULL, angle: ANGLE, push: PUSH, values: true, ...over });
const both = (over: Partial<SledgeFig> = {}): SledgeFig => sledge({ who: 'AB', ...over });
const hill = (over: Partial<HillFig> = {}): HillFig => ({ kind: 'hill', weight: HILL.weight, angle: HILL.angle, ...over });

const kiteFig: ResolveFig = {
  kind: 'resolve',
  header: `${fixed(KITE.size, 0)} N at ${KITE.angle}° to the vertical`,
  size: KITE.size,
  unit: 'N',
  angle: KITE.angle,
  from: 'vertical',
  name: 'string',
  ask: 'x',
  answer: 'afterCheck',
  play: 'afterCheck',
};
const rad = Math.PI / 180;

export const splittingAVector: Lesson = {
  id: 'resolving',
  title: 'Splitting a vector',
  spec: [5, 6],
  minutes: 11,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'Cos and sin', from: 'parts' },
    { title: 'Back to the sledges', from: 'hook-again' },
  ],
  cast: ['Ana', 'Ben', 'Theo', 'Iris'],
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Splitting a vector',
      body: `Ana pulls her sledge with ${N(PULL, 0)} on a rope at ${deg(ANGLE)} above the snow. Ben pushes his straight forward with ${N(PUSH, 0)}.`,
      fig: both(),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: 'The two sledges are the same. Which one gets the larger forward force?',
      fig: both(),
      options: [
        { id: 'ana', label: 'The one Ana pulls' },
        { id: 'ben', label: 'The one Ben pushes', correct: true },
        { id: 'same', label: 'They get the same' },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'parts',
      kind: 'text',
      body: [
        "Ana's rope pulls forward and upward at once. Only the forward part moves the sledge along the snow; the upward part lifts it a little.",
        'So split the pull into two **components**: one along the snow, one straight up.',
      ],
      card: { term: 'Components', text: 'Two vectors at right angles that add tip to tail to give the original vector. Finding them is called resolving.' },
    },
    {
      id: 'which-part',
      kind: 'tapFig',
      prompt: "Which arrow is the part of Ana's pull that moves the sledge forward?",
      instruction: 'Tap an arrow on the drawing.',
      fig: sledge({ split: 'box', targets: true, values: undefined }),
      options: [
        { id: 'pull', label: 'The whole pull, along the rope', hint: 'That is the whole pull. Look for the part along the snow.' },
        { id: 'forward', label: 'The part along the snow', correct: true },
        { id: 'up', label: 'The part straight up', hint: 'That part lifts the sledge. The sledge moves along the snow.' },
      ],
      why: 'Only the part along the snow moves the sledge forward. The pull is that part and the upward part, added tip to tail.',
    },
    {
      id: 'forward',
      kind: 'build',
      prompt: `The forward component is the side next to the ${deg(ANGLE)} angle. Build it.`,
      fig: sledge({ split: 'box', forward: 'afterCheck' }),
      equation: 'F = {pull} × cos {θ}',
      boxes: { pull: 'pull', θ: 'angle' },
      chips: [
        { id: 'pull', label: N(PULL, 0) },
        { id: 'angle', label: deg(ANGLE) },
        { id: 'vertical', label: deg(FROM_VERTICAL), hint: `That is the angle from the vertical. θ is measured from the snow: ${deg(ANGLE)}.` },
        { id: 'push', label: N(PUSH, 0), hint: "That is Ben's push. The pull is Ana's." },
      ],
      result: { symbol: 'F', value: x.forward, unit: 'N' },
      why: `Next to the angle: ${PULL} × cos ${deg(ANGLE)} = ${N(x.forward)}. Only half of Ana's pull goes forward.`,
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Back to the two sledges. Ben pushes forward with ${N(PUSH, 0)}. Which sledge gets the larger forward force?`,
      fig: both({ split: 'forward', forward: 'afterCheck' }),
      options: [
        { id: 'ana', label: 'The one Ana pulls', hint: `Ana pulls with ${N(PULL, 0)}, but only ${N(x.forward)} of it is forward.` },
        { id: 'ben', label: 'The one Ben pushes', correct: true },
        { id: 'same', label: 'They get the same', hint: `Compare ${N(x.forward)} forward with Ben's ${N(PUSH, 0)}.` },
      ],
      why: `Ben's: ${N(PUSH, 0)} against ${N(x.forward)}. A smaller push beats a bigger pull when the pull is slanted.`,
    },
    {
      id: 'jobs',
      kind: 'sort',
      prompt: "Ana's rope pulls with 100 N at 60°. Sort these by the job they do.",
      bins: [
        { id: 'forward', label: 'Moves it forward' },
        { id: 'lift', label: 'Lifts it' },
      ],
      items: [
        { id: 'along', label: 'The part along the snow', bin: 'forward', hint: 'The sledge moves along the snow, so that part does the pulling.' },
        { id: 'up', label: 'The part straight up', bin: 'lift', hint: 'A part straight up cannot move it along the snow: it lifts.' },
        { id: 'fifty', label: `The ${N(x.forward)} part`, bin: 'forward', hint: `${N(x.forward)} is ${PULL} cos ${deg(ANGLE)}: the side next to the angle, along the snow.` },
        { id: 'eightysix', label: `The ${N(x.up)} part`, bin: 'lift', hint: `${N(x.up)} is ${PULL} sin ${deg(ANGLE)}: the side opposite the angle, straight up.` },
        { id: 'ben', label: `Ben's whole ${N(PUSH, 0)} push`, bin: 'forward', hint: "Ben's push is already along the snow: all of it moves the sledge." },
      ],
      why: `Along the snow, ${N(x.forward)}, moves the sledge. Straight up, ${N(x.up)}, lifts it. Ben's push has no upward part.`,
    },
    {
      id: 'match',
      kind: 'estimate',
      prompt: `Ana wants as much forward force as Ben, ${N(PUSH, 0)}. Drag to the angle of her rope above the snow.`,
      fig: both(),
      after: sledge({ who: 'A', angle: x.sameAsBen, split: 'box', forward: 'shown', up: 'shown' }),
      scale: { min: 0, max: 90, step: 1, tick: 15, unit: '°', symbol: 'θ', dp: 0, label: "Angle of Ana's rope" },
      answer: x.sameAsBen,
      tolerance: 5,
      why: `cos θ = ${PUSH} ÷ ${PULL}, so θ = ${deg(x.sameAsBen, 1)}. The lower the rope, the more of the pull goes forward.`,
    },
    {
      id: 'angle',
      kind: 'explore',
      instruction: "Drag the slider to tilt Ana's rope.",
      fig: sledge({ split: 'box', forward: 'shown', up: 'shown' }),
      slider: { min: 0, max: 90, step: 1, tick: 15, label: 'Angle of the rope above the snow', unit: '°', symbol: 'θ', dp: 0, start: ANGLE },
      question: {
        prompt: 'What happens to the upward component as the rope gets steeper?',
        options: [
          { id: 'grows', label: 'It grows', correct: true },
          { id: 'shrinks', label: 'It shrinks', hint: 'Tilt the rope towards the vertical and watch the vertical side.' },
          { id: 'same', label: 'It stays the same', hint: 'Move the slider: the two sides trade size.' },
        ],
        right: `Right: sin θ grows from 0 at ${deg(0)} to the whole pull at ${deg(90)}. The forward part shrinks as the upward part grows.`,
      },
    },
    {
      id: 'from-vertical',
      kind: 'text',
      body: [
        'Cos goes with the side **next to** the angle, sin with the side opposite. Where the angle is drawn decides which side is which.',
        `Measured from the vertical, Ana's rope is at ${deg(FROM_VERTICAL)}. The forward side is now opposite it: ${PULL} × sin ${deg(FROM_VERTICAL)} = ${N(x.fromVertical)}, as before.`,
      ],
    },
    {
      id: 'kite',
      kind: 'spotError',
      prompt: `Theo works out the horizontal pull of a kite string: ${N(KITE.size, 0)} at ${deg(KITE.angle)} to the vertical. His working has one mistake. Which line?`,
      fig: kiteFig,
      lines: [
        { id: 'data', text: `The angle, ${deg(KITE.angle)}, is measured from the vertical.`, hint: 'That line is right: the drawing shows it.' },
        {
          id: 'cos',
          text: `Horizontal = ${KITE.size} × cos ${deg(KITE.angle)} = ${N(x.kite.cos)}`,
          wrong: true,
          fix: `Horizontal = ${KITE.size} × sin ${deg(KITE.angle)} = ${N(x.kite.right)}`,
        },
        { id: 'end', text: `So the string pulls sideways with ${N(x.kite.cos)}.`, hint: 'This follows from the line above. Which side is next to the angle?' },
      ],
      why: `The angle is from the vertical, so the horizontal side is opposite it: sin, not cos. ${KITE.size} × sin ${deg(KITE.angle)} = ${N(x.kite.right)}; ${N(x.kite.cos)} is the vertical part.`,
    },
    {
      id: 'slope',
      kind: 'text',
      body: ["Split the weight **along** the slope and **into** it. The angle at W is the hill's angle again."],
      fig: hill({ along: 'name', into: 'name' }),
    },
    {
      id: 'along',
      kind: 'choice',
      prompt: `Ben's sledge weighs ${N(HILL.weight, 0)}. What is the component of its weight along the slope?`,
      fig: hill({ along: 'afterCheck', into: 'name' }),
      options: [
        { id: 'right', label: N(x.hill.right), correct: true },
        { id: 'cos', label: N(x.hill.into), hint: `That side is next to the ${deg(HILL.angle)} at W: it presses into the slope.` },
        { id: 'all', label: N(HILL.weight, 0), hint: 'Only part of the weight acts along the slope.' },
        { id: 'zero', label: N(0, 0), hint: 'The weight points straight down, but on a slope it has a part along it.' },
      ],
      why: `Opposite the ${deg(HILL.angle)} at W: ${HILL.weight} × sin ${deg(HILL.angle)} = ${N(x.hill.right)} down the slope. Into it: ${N(x.hill.into)}.`,
    },
    {
      id: 'rules',
      kind: 'text',
      body: [
        'To resolve, draw a rectangle with the vector as its diagonal. Check: each component is smaller than the vector.',
        'By drawing: make a **scale drawing** of the rectangle, then measure both sides with a ruler.',
      ],
      card: { term: 'Resolving a vector F', text: 'Next to the angle θ: F cos θ. Opposite the angle: F sin θ. The two components add tip to tail back to F.' },
    },
  ],
  skillCheck: [
    {
      id: 'climb',
      kind: 'build',
      prompt: `An aircraft flies at ${fixed(CLIMB.v, 0)}${NB}m${NB}s⁻¹, climbing at ${deg(CLIMB.angle)} to the horizontal. Build the vertical component of its velocity.`,
      equation: 'v = {speed} × sin {θ}',
      boxes: { speed: 'speed', θ: 'angle' },
      chips: [
        { id: 'speed', label: `${fixed(CLIMB.v, 0)}${NB}m${NB}s⁻¹` },
        { id: 'angle', label: deg(CLIMB.angle) },
        { id: 'vertical', label: deg(x.climbFromVertical), hint: `That is the angle from the vertical. θ is measured from the horizontal: ${deg(CLIMB.angle)}.` },
        { id: 'half', label: `${fixed(CLIMB.v / 2, 0)}${NB}m${NB}s⁻¹`, hint: 'Half the speed is the vertical part only at 30°.' },
      ],
      result: { symbol: 'v', value: x.climb.right, unit: 'm s⁻¹' },
      why: `Opposite the ${deg(CLIMB.angle)} angle: ${CLIMB.v} × sin ${deg(CLIMB.angle)} = ${speed(x.climb.right)}. ${speed(x.climb.cos)} is the horizontal part.`,
    },
    {
      id: 'skier',
      kind: 'spotError',
      prompt: `A skier of mass ${SKIER.m}${NB}kg stands on a ${deg(SKIER.angle)} slope. Iris finds the component of the weight along the slope. Which line of her working is wrong?`,
      lines: [
        { id: 'w', text: `W = mg = ${SKIER.m} × 9.81 = ${N(x.skier.weight, 0)}`, hint: 'That line is right: the weight is mass times g.' },
        {
          id: 'cos',
          text: `Along the slope: W cos ${deg(SKIER.angle)} = ${fixed(x.skier.weight, 0)} × ${fixed(Math.cos(SKIER.angle * rad), 3)} = ${N(x.skier.into, 0)}`,
          wrong: true,
          fix: `Along the slope: W sin ${deg(SKIER.angle)} = ${fixed(x.skier.weight, 0)} × ${fixed(Math.sin(SKIER.angle * rad), 3)} = ${N(x.skier.right, 0)}`,
        },
        { id: 'end', text: `So ${N(x.skier.into, 0)} acts down the slope.`, hint: 'This follows from the line above. Check which side is next to the angle.' },
      ],
      why: `The angle at W is the slope's, so the part along the slope is opposite it: W sin ${deg(SKIER.angle)} = ${N(x.skier.right, 0)}. ${N(x.skier.into, 0)} presses into the slope.`,
    },
    {
      id: 'components-true',
      kind: 'choice',
      prompt: 'Which statement about the components of a force is true?',
      options: [
        { id: 'right', label: 'Each is smaller than the force, and they add tip to tail to give it', correct: true },
        { id: 'numbers', label: 'They add up to the force as plain numbers' },
        { id: 'sin', label: 'The sin component is always the vertical one' },
        { id: 'larger', label: 'One of them can be larger than the force' },
      ],
      why: 'The components are the two sides of a right-angled triangle with the force as hypotenuse: shorter than it, added tip to tail. Sin or cos depends on the angle.',
    },
    {
      id: 'ramp',
      kind: 'examCard',
      context: `A ${RAMP.m}${NB}kg box rests on a ramp at ${deg(RAMP.angle)} to the horizontal. g = 9.81${NB}N${NB}kg⁻¹.`,
      fig: hill({ weight: x.ramp.weight, angle: RAMP.angle, along: 'name', into: 'name' }),
      parts: [
        {
          id: 'a',
          command: 'State',
          text: 'which component of the weight makes the box slide down the ramp.',
          marks: 1,
          kind: 'choice',
          options: [
            { id: 'right', label: 'The component along the slope', correct: true },
            { id: 'into', label: 'The component into the slope' },
            { id: 'whole', label: 'The whole weight' },
            { id: 'normal', label: 'The push of the ramp on the box' },
          ],
          why: 'Only the part of the weight along the slope pulls the box down it. The part into the slope is balanced by the ramp.',
        },
        {
          id: 'b',
          command: 'Calculate',
          text: 'the component of the weight along the slope.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'F = {m} × {g} × sin {θ}',
            boxes: { m: 'mass', g: 'field', θ: 'angle' },
            chips: [
              { id: 'mass', label: `${RAMP.m}${NB}kg` },
              { id: 'field', label: `9.81${NB}N${NB}kg⁻¹` },
              { id: 'angle', label: deg(RAMP.angle) },
              { id: 'other', label: deg(90 - RAMP.angle), hint: `That is the angle from the vertical. At W the angle is the ramp's: ${deg(RAMP.angle)}.` },
              { id: 'weight', label: N(x.ramp.weight, 0), hint: 'That is the whole weight. The box has mass 40 kg: use m × g.' },
            ],
            result: { symbol: 'F', value: x.ramp.right, unit: 'N' },
          },
          why: `Opposite the ${deg(RAMP.angle)} at W: ${RAMP.m} × 9.81 × sin ${deg(RAMP.angle)} = ${N(x.ramp.right, 0)}. One mark for the values, one for the answer.`,
        },
      ],
    },
  ],
  youCanNow: [
    'Split a vector into two components at right angles',
    'Pick cos or sin from where the angle is drawn',
    'Split a weight along a slope and into it',
    'Add vectors at an angle through their components',
  ],
  recap: {
    fig: both({ split: 'forward', forward: 'shown' }),
    text: `Ana pulled with ${N(PULL, 0)}, Ben pushed with ${N(PUSH, 0)}, but only ${N(x.forward)} of Ana's pull went forward. The rest lifted her sledge.`,
  },
  card: {
    formula: 'F cos θ, F sin θ',
    idea: 'The side next to the angle is F cos θ. Components add tip to tail, never as plain numbers.',
  },
};
