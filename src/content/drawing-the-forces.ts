// Lesson "Drawing the forces" — free-body diagrams, WPH11 point 8 (with balance, point 9, and components from lesson 6).
// The puzzle: Rose drags a 40 kg crate at a steady speed with a rope at 30°, 120 N. Does the floor push up with the
// crate's weight? No: the rope holds up 60.0 N, so the floor pushes only 332 N against a weight of 392 N.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { G } from '../physics/kinematics.ts';
import { ladderWallPush, normalWithPull, weight } from '../physics/dynamics.ts';
import { components, onSlope } from '../physics/vectors.ts';
import { fixed } from '../physics/format.ts';
import type { CrateFig, LadderFig, Lesson } from './types.ts';

const NB = '\u00A0';
/** "392 N": a force to the newton. */
export const n0 = (x: number): string => `${fixed(x, 0)}${NB}N`;
/** "60.0 N": a force to 0.1 N. */
export const n1 = (x: number): string => `${fixed(x, 1)}${NB}N`;
const RAD = Math.PI / 180;

// The story and the numbers of each question.
export const M = 40; // kg, the crate
export const PULL = 120; // N, Rose's rope (and later her pole)
export const ANGLE = 30; // degrees, above the floor (the pole: below it)
export const LADDER = { m: 12, angle: 65 }; // a uniform ladder on a smooth wall
export const ICE = { m: 30, a: 120, b: 200 }; // a box on smooth ice, pushed both ways
export const SIGN = { m: 6, angle: 50 }; // a sign on two cables
export const SLOPE = { m: 5, angle: 25 }; // a box at rest on a rough slope
export const BOOK = { m: 1.2, press: 30 }; // a book pressed on a wall

const W = weight(M);
const parts = components(PULL, ANGLE);
const ladderW = weight(LADDER.m);
const wallPush = ladderWallPush(ladderW, LADDER.angle);
const signW = weight(SIGN.m);
const slopeW = weight(SLOPE.m);

/** Answers and named mistakes, used by the screens and re-checked by drawing-the-forces.test.ts. */
export const ANSWERS = {
  weight: W,
  forward: parts.along,
  up: parts.across,
  friction: { right: parts.along, whole: PULL, sin: parts.across },
  /** The puzzle: the floor's push with the rope pulling up at 30°. */
  normal: {
    right: normalWithPull(W, PULL, ANGLE),
    weight: W,
    ropeDown: normalWithPull(W, PULL, -ANGLE), // took the rope as pushing down
    cos: W - parts.along, // took away the forward part
  },
  /** The pole pushing down at 30°. */
  pole: {
    right: normalWithPull(W, PULL, -ANGLE),
    copied: normalWithPull(W, PULL, ANGLE),
    weight: W,
    cos: W + parts.along,
  },
  ladder: { weight: ladderW, wall: wallPush, friction: wallPush, normal: ladderW },
  ice: { weight: weight(ICE.m), resultant: ICE.b - ICE.a },
  sign: {
    right: signW / (2 * Math.sin(SIGN.angle * RAD)),
    half: signW / 2,
    cos: signW / (2 * Math.cos(SIGN.angle * RAD)),
    whole: signW,
    weight: signW,
  },
  slope: { right: onSlope(slopeW, SLOPE.angle).along, cos: onSlope(slopeW, SLOPE.angle).into, whole: slopeW },
  book: { right: weight(BOOK.m), sum: BOOK.press + weight(BOOK.m) },
};

const crate = (over: Partial<CrateFig>): CrateFig => ({ kind: 'crate', m: M, by: 'rope', force: PULL, angle: ANGLE, forces: [], ...over });
const ALL: CrateFig['forces'] = ['W', 'N', 'F', 'T'];
const ladder = (over: Partial<LadderFig>): LadderFig => ({ kind: 'ladder', m: LADDER.m, angle: LADDER.angle, forces: ['W'], values: true, ...over });
/** How the ladder figure writes a force: 1 decimal below 100 N, whole newtons above. */
const ln = (x: number) => (x < 100 ? n1(x) : n0(x));

const X = ANSWERS;
const N = X.normal;
const P = X.pole;
const S = X.sign;

export const drawingTheForces: Lesson = {
  id: 'free-body',
  title: 'Drawing the forces',
  spec: [8],
  minutes: 12,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'Every force', from: 'fbd' },
    { title: 'Back to the crate', from: 'hook-again' },
  ],
  cast: ['Rose', 'Hugo'],
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Drawing the forces',
      body: `Rose drags a ${M} kg crate across the floor with a rope. The crate slides along at a steady speed.`,
      fig: crate({ play: true }),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: "The floor pushes up on the crate. How does that push compare with the crate's weight?",
      fig: crate({ play: true }),
      options: [
        { id: 'bigger', label: 'It is bigger than the weight' },
        { id: 'equal', label: 'It is equal to the weight' },
        { id: 'smaller', label: 'It is smaller than the weight', correct: true },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'fbd',
      kind: 'text',
      body: [
        'To find a force, draw the crate on its own, with one arrow for **every force acting on it**. The longer the arrow, the bigger the force.',
        'The crate slides without turning, so we can treat it as a **particle**: a dot, with every arrow starting from it.',
      ],
      card: { term: 'Free-body diagram', text: 'One object on its own, with every force acting on it, and nothing else.' },
    },
    {
      id: 'forces',
      kind: 'sort',
      prompt: "Sort these forces. Which belong on the crate's free-body diagram?",
      fig: crate({ forces: ALL }),
      bins: [
        { id: 'on', label: 'On the crate' },
        { id: 'by', label: 'By the crate' },
      ],
      items: [
        { id: 'weight', label: "The crate's weight", bin: 'on', hint: "Weight is the Earth's pull on the crate: it acts on the crate." },
        { id: 'normal', label: "The floor's push up on the crate", bin: 'on', hint: 'The floor pushes the crate: that force acts on the crate.' },
        { id: 'friction', label: 'Friction from the floor', bin: 'on', hint: 'The floor rubs on the crate, so friction acts on the crate.' },
        { id: 'rope', label: "The rope's pull on the crate", bin: 'on', hint: 'The rope pulls the crate: that force acts on the crate.' },
        { id: 'push', label: "The crate's push down on the floor", bin: 'by', hint: 'The crate pushes the floor: that force acts on the floor, not on the crate.' },
        { id: 'tug', label: "The crate's pull on the rope", bin: 'by', hint: 'The crate pulls the rope: that force acts on the rope.' },
      ],
      why: "A free-body diagram holds only the forces acting on the crate. The crate's own pushes and pulls act on other bodies: Newton's third law partners, drawn on their diagrams.",
    },
    {
      id: 'motion',
      kind: 'spotError',
      prompt: "Rose lets go and the crate slides on. Hugo draws its forces. His working has one mistake. Which line?",
      fig: crate({ by: 'none', forces: ['W', 'N', 'F'], fbdAfterCheck: true, play: true }),
      lines: [
        { id: 'data', text: 'Rose lets go: the crate slides on and slows down.', hint: 'That line only describes what happens.' },
        { id: 'forces', text: 'Forces on the crate: weight W, N and friction F.', hint: 'That line is right: the Earth and the floor both act.' },
        { id: 'forward', text: 'It also has a forward force, to keep it moving.', wrong: true, fix: 'No forward force: nothing touches the front. Friction slows it.' },
        { id: 'end', text: 'So the diagram has W, N, F and a forward force.', hint: 'This follows from the line above. A force needs a push or a pull.' },
      ],
      why: 'Only the Earth and the floor act on the crate now. It needs no forward force to keep moving: friction is the reason it slows down.',
    },
    {
      id: 'balance',
      kind: 'text',
      body: ['Steady speed means no acceleration, so the forces **balance up and down, and side to side**.'],
      fig: crate({ forces: ALL, values: true, split: true, ask: [{ force: 'N', answer: 'unknown' }, { force: 'F', answer: 'unknown' }] }),
    },
    {
      id: 'friction',
      kind: 'choice',
      prompt: 'The crate moves at a steady speed. How big is the friction force on it?',
      fig: crate({ forces: ALL, values: true, split: true, ask: [{ force: 'N', answer: 'unknown' }, { force: 'F', answer: 'afterCheck' }] }),
      options: [
        { id: 'whole', label: n0(X.friction.whole), hint: "That's the whole pull. Only its forward part acts along the floor." },
        { id: 'right', label: n0(X.friction.right), correct: true },
        { id: 'sin', label: n1(X.friction.sin), hint: "That's the upward part. Friction balances the forward part." },
        { id: 'zero', label: n0(0), hint: 'It slides on the floor, so friction acts. Moving does not remove it.' },
      ],
      why: `Side to side the forces balance, so F equals the forward part of the pull: ${PULL} cos ${ANGLE}° = ${n0(X.friction.right)}.`,
    },
    {
      id: 'normal',
      kind: 'build',
      prompt: 'Up and down the forces balance too. Build how hard the floor pushes up on the crate.',
      fig: crate({ forces: ALL, values: true, split: true, ask: [{ force: 'N', answer: 'afterCheck' }] }),
      equation: 'N = {W} − {T} × sin {θ}',
      boxes: { W: 'weight', T: 'pull', θ: 'angle' },
      chips: [
        { id: 'weight', label: n0(W) },
        { id: 'pull', label: n0(PULL) },
        { id: 'angle', label: `${ANGLE}°` },
        { id: 'vertical', label: `${90 - ANGLE}°`, hint: `That is the angle from the vertical. θ is measured from the floor: ${ANGLE}°.` },
        { id: 'forward', label: n0(X.forward), hint: `That is the forward part, ${n0(X.forward)}. The rope itself pulls with ${n0(PULL)}.` },
      ],
      result: { symbol: 'N', value: N.right, unit: 'N' },
      why: `N + ${n1(X.up)} = ${n0(W)}, so N = ${n0(N.right)}. The rope holds up ${n1(X.up)} of the weight.`,
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: "Back to the crate. Why does the floor push with less than the crate's weight?",
      fig: crate({ forces: ALL, values: true, split: true }),
      options: [
        { id: 'friction', label: 'Friction takes some of the weight', hint: 'Friction acts along the floor. It plays no part in holding the crate up.' },
        { id: 'moving', label: 'The crate is moving, so it weighs less', hint: "Weight is the Earth's pull. Moving does not change it." },
        { id: 'rope', label: 'The rope pulls up, so it holds up part of the weight', correct: true },
      ],
      why: `The rope holds up ${n1(X.up)} of the ${n0(W)} weight, so the floor only has to push with ${n0(N.right)}. The crate is no lighter.`,
    },
    {
      id: 'steeper',
      kind: 'explore',
      instruction: 'Drag the slider to change the angle of the rope.',
      fig: crate({ forces: ALL, values: true }),
      slider: { min: 0, max: 60, step: 1, tick: 15, label: 'Angle of the rope above the floor', unit: '°', symbol: 'θ', dp: 0, start: ANGLE },
      question: {
        prompt: 'As the rope gets steeper, what happens to N?',
        options: [
          { id: 'bigger', label: 'It gets bigger', hint: 'Watch the N arrow as you drag to the right.' },
          { id: 'smaller', label: 'It gets smaller', correct: true },
          { id: 'same', label: 'It stays equal to W', hint: 'Only at 0°. Try a steeper rope.' },
        ],
        right: 'Right: a steeper rope lifts more, so the floor pushes less.',
      },
    },
    {
      id: 'body',
      kind: 'text',
      body: ['A ladder can turn, so it is an **extended body**: draw each force where it acts.'],
      fig: ladder({}),
    },
    {
      id: 'wall',
      kind: 'tapFig',
      prompt: 'The wall is smooth. Which way does it push on the ladder?',
      instruction: 'Tap the arrow you expect.',
      fig: ladder({ candidates: true }),
      options: [
        { id: 'normal', label: 'At right angles to the wall, away from it', correct: true },
        { id: 'perp', label: 'At right angles to the ladder', hint: 'A surface pushes at right angles to itself: to the wall, not to the ladder.' },
        { id: 'up', label: 'Straight up the wall', hint: 'That would be friction, and a smooth wall has none.' },
      ],
      why: 'A surface pushes at right angles to itself. Smooth means no friction, so the push of the wall is horizontal, away from the wall.',
    },
    {
      id: 'foot',
      kind: 'choice',
      prompt: `The ladder does not slip. The wall pushes with ${ln(X.ladder.wall)}. What is the friction force at the foot?`,
      fig: ladder({ forces: ['W', 'S', 'N', 'F'], askF: 'afterCheck' }),
      options: [
        { id: 'away', label: `${ln(X.ladder.friction)} away from the wall`, hint: 'Then both sideways forces point away from the wall. They must cancel.' },
        { id: 'zero', label: n0(0), hint: 'Then the wall would push the foot out. The floor has to hold it.' },
        { id: 'right', label: `${ln(X.ladder.friction)} towards the wall`, correct: true },
        { id: 'weight', label: `${ln(X.ladder.weight)} towards the wall`, hint: "That's the weight. It is balanced by N, up and down." },
      ],
      why: `Side to side only S and F act, so they cancel: F = ${ln(X.ladder.friction)}, towards the wall. Up and down N = W = ${ln(X.ladder.normal)}.`,
    },
    {
      id: 'rules',
      kind: 'text',
      body: [
        'Draw the body alone. Add its **weight**, then one force at each contact: N at right angles to the surface, friction along it, tension along a rope.',
        'Leave out forces the body exerts on others, and never add a force of motion. Balanced forces mean **steady velocity**, not only rest.',
      ],
      card: { term: 'Steady velocity', text: 'The forces on the body balance in every direction: up = down, forward = back.' },
    },
  ],
  skillCheck: [
    {
      id: 'table',
      kind: 'sort',
      prompt: 'A box sits at rest on a table. Sort these forces by where they act.',
      bins: [
        { id: 'on', label: 'On the box' },
        { id: 'not', label: 'Not on the box' },
      ],
      items: [
        { id: 'weight', label: "The box's weight", bin: 'on' },
        { id: 'push', label: "The table's push up on the box", bin: 'on' },
        { id: 'pressing', label: "The box's push down on the table", bin: 'not' },
        { id: 'earth', label: "The box's pull on the Earth", bin: 'not' },
      ],
      why: "The weight and the table's push act on the box. The box's push on the table and its pull on the Earth act on other bodies.",
    },
    {
      id: 'pole',
      kind: 'build',
      prompt: `Rose pushes the crate with a pole instead: ${PULL} N at ${ANGLE}° below the horizontal, at a steady speed. Build how hard the floor pushes up.`,
      equation: 'N = {W} + {T} × sin {θ}',
      boxes: { W: 'weight', T: 'push', θ: 'angle' },
      chips: [
        { id: 'weight', label: n0(W) },
        { id: 'push', label: n0(PULL) },
        { id: 'angle', label: `${ANGLE}°` },
        { id: 'vertical', label: `${90 - ANGLE}°`, hint: `That is the angle from the vertical. θ is measured from the floor: ${ANGLE}°.` },
        { id: 'forward', label: n0(X.forward), hint: 'That is the forward part. Up and down use the part along the vertical.' },
      ],
      result: { symbol: 'N', value: P.right, unit: 'N' },
      why: `The push points down at the floor, so it adds ${n1(X.up)}: N = ${n0(W)} + ${n1(X.up)} = ${n0(P.right)}.`,
    },
    {
      id: 'ice',
      kind: 'choice',
      prompt: `Two people push a box on smooth ice: ${ICE.a} N to the right and ${ICE.b} N to the left. Which way is the box moving?`,
      fig: {
        kind: 'particle',
        header: `box on smooth ice, W = ${n0(X.ice.weight)}`,
        scale: 0.34,
        forces: [
          { size: X.ice.weight, angle: 270, text: 'W' },
          { size: X.ice.weight, angle: 90, text: 'N' },
          { size: ICE.a, angle: 0, text: `${ICE.a} N` },
          { size: ICE.b, angle: 180, text: `${ICE.b} N` },
        ],
      },
      options: [
        { id: 'left', label: 'To the left' },
        { id: 'right-way', label: 'To the right' },
        { id: 'rest', label: 'It is at rest' },
        { id: 'right', label: "We can't tell: we only know it accelerates to the left", correct: true },
      ],
      why: `The resultant is ${n0(X.ice.resultant)} to the left, so the box accelerates to the left. It may be moving left and speeding up, or moving right and slowing.`,
    },
    {
      id: 'ladder-card',
      kind: 'examCard',
      context: `A uniform ladder of mass ${LADDER.m} kg leans against a smooth wall at ${LADDER.angle}° to the rough floor and does not slip. g = ${G} N kg⁻¹.`,
      fig: ladder({ forces: ['W'] }),
      parts: [
        {
          id: 'a',
          command: 'State',
          text: 'the direction of the push of the wall on the ladder.',
          marks: 1,
          kind: 'choice',
          options: [
            { id: 'right', label: 'Horizontal, away from the wall', correct: true },
            { id: 'ladder', label: 'At right angles to the ladder' },
            { id: 'up', label: 'Vertically up' },
            { id: 'down', label: 'Down the wall' },
          ],
          why: 'A smooth wall has no friction, so it pushes at right angles to itself: horizontal, away from the wall.',
        },
        {
          id: 'b',
          command: 'Calculate',
          text: 'the friction force at the foot of the ladder.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'F = {W} ÷ (2 × tan {θ})',
            boxes: { W: 'weight', θ: 'angle' },
            chips: [
              { id: 'weight', label: n0(X.ladder.weight) },
              { id: 'angle', label: `${LADDER.angle}°` },
              { id: 'other', label: `${90 - LADDER.angle}°`, hint: 'That is the angle from the wall. θ is measured from the floor.' },
              { id: 'mass', label: `${LADDER.m} kg`, hint: 'That is the mass. The equation needs the weight in newtons.' },
            ],
            result: { symbol: 'F', value: X.ladder.friction, unit: 'N' },
          },
          why: `Moments about the foot give the wall's push S = W ÷ (2 tan ${LADDER.angle}°) = ${ln(X.ladder.wall)}. Sideways F = S: ${ln(X.ladder.friction)}. One mark for the values, one for the answer.`,
        },
      ],
    },
  ],
  youCanNow: [
    'Draw a free-body diagram for a body that is pulled, pushed or leaning',
    'Leave out forces a body exerts on others, and any "force of motion"',
    'Find a missing force from balance in each direction',
    'Tell which way a body accelerates from its diagram',
  ],
  recap: {
    fig: crate({ forces: ALL, values: true, split: true }),
    text: `The rope holds up ${n1(X.up)} of the crate's ${n0(W)} weight, so the floor pushes with only ${n0(N.right)}.`,
  },
  card: {
    formula: 'ΣF = 0 each way',
    idea: 'Draw one body alone: its weight, plus one force wherever something touches it. Balanced means steady velocity.',
  },
};
