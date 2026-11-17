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

const NB = ' '; // numbers never break from their units
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
};
const kickFig: ResolveFig = {
  kind: 'resolve',
  header: `u = ${fixed(KICK.u, 0)} m s⁻¹ at ${KICK.angle}°`,
  size: KICK.u,
  unit: 'm s⁻¹',
  angle: KICK.angle,
  from: 'horizontal',
  velocity: true,
  name: 'ball',
  ask: 'y',
  answer: 'afterCheck',
};

export const splittingAVector: Lesson = {
  id: 'resolving',
  title: 'Splitting a vector',
  spec: [5, 6],
  minutes: 11,
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
        { id: 'ben', label: 'The one Ben pushes' },
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
      kind: 'choice',
      prompt: `The forward component is the side next to the ${deg(ANGLE)} angle. How big is it?`,
      fig: sledge({ split: 'box', forward: 'afterCheck' }),
      options: [
        { id: 'right', label: N(x.forward), correct: true },
        { id: 'sin', label: N(x.up), hint: `That is ${PULL} sin ${deg(ANGLE)}, the side opposite the angle: the upward part.` },
        { id: 'all', label: N(PULL, 0), hint: 'Only part of the pull goes forward. The rest lifts the sledge.' },
        { id: 'divided', label: N(x.divided, 0), hint: `A component is smaller than the pull: multiply by cos ${deg(ANGLE)}, don't divide.` },
      ],
      why: `Next to the angle: ${PULL} × cos ${deg(ANGLE)} = ${N(x.forward)}. Only half of Ana's pull goes forward.`,
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Back to the puzzle. Ben pushes forward with ${N(PUSH, 0)}. Which sledge gets the larger forward force?`,
      fig: both({ split: 'forward', forward: 'afterCheck' }),
      options: [
        { id: 'ana', label: 'The one Ana pulls', hint: `Ana pulls with ${N(PULL, 0)}, but only ${N(x.forward)} of it is forward.` },
        { id: 'ben', label: 'The one Ben pushes', correct: true },
        { id: 'same', label: 'They get the same', hint: `Compare ${N(x.forward)} forward with Ben's ${N(PUSH, 0)}.` },
      ],
      why: `Ben's: ${N(PUSH, 0)} against ${N(x.forward)}. A smaller push beats a bigger pull when the pull is slanted.`,
    },
    {
      id: 'lift',
      kind: 'choice',
      prompt: `And the upward component, the side opposite the ${deg(ANGLE)} angle: how big is it?`,
      fig: sledge({ split: 'box', forward: 'shown', up: 'afterCheck' }),
      options: [
        { id: 'right', label: N(x.up), correct: true },
        { id: 'left-over', label: N(x.leftOver), hint: `${PULL} − ${fixed(x.forward, 0)} shares the pull out like a number. Use sin ${deg(ANGLE)}.` },
        { id: 'all', label: N(PULL, 0), hint: 'The upward part is smaller than the whole pull.' },
        { id: 'zero', label: N(0, 0), hint: `A slanted rope lifts as well as pulls: ${PULL} sin ${deg(ANGLE)}.` },
      ],
      why: `Opposite the angle: ${PULL} × sin ${deg(ANGLE)} = ${N(x.up)}. This part lifts the sledge and does nothing to move it forward.`,
    },
    {
      id: 'add-back',
      kind: 'text',
      body: [`${fixed(x.forward, 1)} + ${fixed(x.up, 1)} is ${N(x.addedAsNumbers)}, but **tip to tail** they make √(${fixed(x.forward, 1)}² + ${fixed(x.up, 1)}²) = ${N(x.addedBack, 0)}.`],
      fig: sledge({ split: 'chain', forward: 'shown', up: 'shown' }),
    },
    {
      id: 'angle',
      kind: 'explore',
      instruction: "Drag the slider to tilt Ana's rope.",
      fig: sledge({ split: 'box', forward: 'shown', up: 'shown' }),
      slider: { min: 0, max: 90, step: 1, tick: 15, label: 'Angle of the rope above the snow', unit: '°', symbol: 'θ', dp: 0, start: ANGLE },
      question: {
        prompt: `At about what angle does Ana pull forward with ${N(PUSH, 0)}, like Ben?`,
        options: [
          { id: 'steep', label: `About ${deg(EXPLORE.steep)}`, hint: `At ${deg(EXPLORE.steep)} the forward part is ${N(x.atSteep)}: more than Ben's ${N(PUSH, 0)}.` },
          { id: 'right', label: `About ${deg(EXPLORE.right)}`, correct: true },
          { id: 'story', label: `About ${deg(ANGLE)}`, hint: `At ${deg(ANGLE)} it is ${N(x.forward)}. Lower the rope a little.` },
        ],
        right: `Right: at ${deg(x.sameAsBen, 1)}, where cos θ = ${PUSH} ÷ ${PULL}. Then ${N(x.sameAsBenUp)} goes up.`,
      },
    },
    {
      id: 'half',
      kind: 'choice',
      prompt: `Ana holds the rope at ${deg(LOW)}. How big is each component now?`,
      fig: sledge({ angle: LOW, split: 'box', forward: 'afterCheck', up: 'afterCheck' }),
      options: [
        { id: 'right', label: N(x.low), correct: true },
        { id: 'half', label: N(PULL / 2), hint: `Half and half adds up as numbers. Tip to tail the parts must make ${N(PULL, 0)}.` },
        { id: 'all', label: N(PULL, 0), hint: 'Each part is smaller than the pull it comes from.' },
        { id: 'divided', label: N(x.lowDivided), hint: `Multiply by cos ${deg(LOW)}, don't divide: the parts are smaller than ${N(PULL, 0)}.` },
      ],
      why: `${PULL} × cos ${deg(LOW)} = ${PULL} × sin ${deg(LOW)} = ${N(x.low)} each. Check: √(${fixed(x.low, 1)}² + ${fixed(x.low, 1)}²) = ${N(PULL, 0)}.`,
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
      kind: 'choice',
      prompt: `A kite string pulls on a hand with ${N(KITE.size, 0)}, at ${deg(KITE.angle)} to the vertical. What is the horizontal component?`,
      fig: kiteFig,
      options: [
        { id: 'right', label: N(x.kite.right), correct: true },
        { id: 'cos', label: N(x.kite.cos), hint: `${N(x.kite.cos)} is next to the ${deg(KITE.angle)} angle: that is the vertical part.` },
        { id: 'all', label: N(KITE.size, 0), hint: 'A component is always smaller than the vector it comes from.' },
        { id: 'tan', label: N(x.kite.tan), hint: 'tan gives neither side. The horizontal side is opposite the angle: use sin.' },
      ],
      why: `The angle is from the vertical, so the horizontal side is opposite it: ${KITE.size} × sin ${deg(KITE.angle)} = ${N(x.kite.right)}. Vertical: ${N(x.kite.cos)}.`,
    },
    {
      id: 'kick',
      kind: 'choice',
      prompt: `Velocity splits the same way. A ball is kicked at ${speed(KICK.u)}, ${deg(KICK.angle)} above the ground. What is its vertical component?`,
      fig: kickFig,
      options: [
        { id: 'right', label: speed(x.kick.right), correct: true },
        { id: 'cos', label: speed(x.kick.cos), hint: `That is the horizontal part, next to the ${deg(KICK.angle)} angle.` },
        { id: 'all', label: speed(KICK.u), hint: 'Only part of the velocity is upward.' },
        { id: 'half', label: speed(x.kick.half), hint: `Half works only at 30°. Use sin ${deg(KICK.angle)}.` },
      ],
      why: `Opposite the angle: ${KICK.u} × sin ${deg(KICK.angle)} = ${speed(x.kick.right)} up, and ${speed(x.kick.cos)} along. Next lesson, both run on one clock.`,
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
      kind: 'choice',
      prompt: `An aircraft flies at ${fixed(CLIMB.v, 0)}${NB}m${NB}s⁻¹, climbing at ${deg(CLIMB.angle)} to the horizontal. What is the vertical component of its velocity?`,
      options: [
        { id: 'right', label: speed(x.climb.right), correct: true },
        { id: 'cos', label: speed(x.climb.cos) },
        { id: 'all', label: `${fixed(CLIMB.v, 0)}${NB}m${NB}s⁻¹` },
        { id: 'zero', label: `0${NB}m${NB}s⁻¹` },
      ],
      why: `Opposite the ${deg(CLIMB.angle)} angle: ${CLIMB.v} × sin ${deg(CLIMB.angle)} = ${speed(x.climb.right)}. ${speed(x.climb.cos)} is the horizontal part.`,
    },
    {
      id: 'force-angle',
      kind: 'choice',
      prompt: `A force has a horizontal component of ${N(PARTS.x, 0)} and a vertical component of ${N(PARTS.y, 0)}. At what angle above the horizontal does it act?`,
      options: [
        { id: 'right', label: deg(x.angle.right, 1), correct: true },
        { id: 'vertical', label: deg(x.angle.fromVertical, 1) },
        { id: 'sin', label: deg(x.angle.sin, 1) },
        { id: 'cos', label: deg(x.angle.cos, 1) },
      ],
      why: `tan θ = ${PARTS.y} ÷ ${PARTS.x}, so θ = ${deg(x.angle.right, 1)} above the horizontal. ${deg(x.angle.fromVertical, 1)} is the angle from the vertical. The force is ${N(x.angle.size)}.`,
    },
    {
      id: 'skier',
      kind: 'choice',
      prompt: `A skier of mass ${SKIER.m}${NB}kg stands on a ${deg(SKIER.angle)} slope. g = 9.81${NB}N${NB}kg⁻¹. What is the component of the skier's weight along the slope?`,
      options: [
        { id: 'right', label: N(x.skier.right, 0), correct: true },
        { id: 'cos', label: N(x.skier.into, 0) },
        { id: 'all', label: N(x.skier.weight, 0) },
        { id: 'no-g', label: N(x.skier.noG) },
      ],
      why: `W = ${SKIER.m} × 9.81 = ${N(x.skier.weight, 0)}. Along the slope: ${fixed(x.skier.weight, 0)} × sin ${deg(SKIER.angle)} = ${N(x.skier.right, 0)}. ${N(x.skier.into, 0)} presses into the slope.`,
    },
    {
      id: 'tow',
      kind: 'choice',
      prompt: `A barge is towed by two ropes, each pulling with ${N(TOW.tension, 0)} at ${deg(TOW.angle)} either side of the canal. What is the resultant forward force?`,
      options: [
        { id: 'right', label: N(x.tow.right, 0), correct: true },
        { id: 'added', label: N(x.tow.added, 0) },
        { id: 'sin', label: N(x.tow.sin, 0) },
        { id: 'one', label: N(x.tow.one, 0) },
      ],
      why: `Each rope gives ${TOW.tension} × cos ${deg(TOW.angle)} = ${N(x.tow.one, 0)} forward, ${N(x.tow.right, 0)} in all. The sideways parts, ${N(x.tow.sideways, 0)} each, cancel.`,
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
