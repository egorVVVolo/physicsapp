// Lesson "Drawing the forces" — free-body diagrams, WPH11 point 8 (with balance, point 9, and components from lesson 6).
// The puzzle: Rose drags a 40 kg crate at a steady speed with a rope at 30°, 120 N. Does the floor push up with the
// crate's weight? No: the rope holds up 60.0 N, so the floor pushes only 332 N against a weight of 392 N.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { G } from '../physics/kinematics.ts';
import { ladderWallPush, normalWithPull, weight } from '../physics/dynamics.ts';
import { components, onSlope } from '../physics/vectors.ts';
import { fixed } from '../physics/format.ts';
import type { CrateFig, LadderFig, Lesson } from './types.ts';

const NB = ' ';
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
        { id: 'smaller', label: 'It is smaller than the weight' },
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
      id: 'find',
      kind: 'text',
      body: ['**Weight**, plus a force per touch: the floor pushes up (N) and rubs (F), the rope pulls (T).'],
      fig: crate({ forces: ALL }),
    },
    {
      id: 'not-on',
      kind: 'choice',
      prompt: "The crate also pushes down on the floor with a force P. Does P belong on the crate's free-body diagram?",
      fig: crate({ forces: ALL, floorPush: true }),
      options: [
        { id: 'exerts', label: 'Yes: the crate exerts P', hint: "It does, but on the floor. The diagram shows forces acting on the crate." },
        { id: 'weight', label: 'Yes: P is just the weight again', hint: "Weight is the Earth's pull on the crate. P is a push, on the floor." },
        { id: 'right', label: 'No: P acts on the floor, not on the crate', correct: true },
        { id: 'moving', label: 'Only while the crate is moving', hint: 'Moving or not, P acts on the floor.' },
      ],
      why: "P is the crate's push on the floor, so it acts on the floor. It is the Newton's third law partner of N: same size, but on the other object.",
    },
    {
      id: 'let-go',
      kind: 'choice',
      prompt: 'Rose lets go. The crate slides on and slows down. Which forces act on it now?',
      fig: crate({ by: 'none', forces: ['W', 'N', 'F'], fbdAfterCheck: true, play: true }),
      options: [
        { id: 'pull-left', label: 'Weight, N, friction and a forward force from the pull', hint: 'Nothing touches the front of the crate now. A force needs a push or a pull.' },
        { id: 'right', label: 'Weight, N and friction', correct: true },
        { id: 'floor', label: 'Weight, N, friction and its push on the floor', hint: 'That push acts on the floor, not on the crate.' },
        { id: 'no-friction', label: 'Weight and N only', hint: 'Then nothing would slow it down. Something rubs on its base.' },
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
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: 'Back to the puzzle. Up and down the forces balance too. How hard does the floor push on the crate?',
      fig: crate({ forces: ALL, values: true, split: true, ask: [{ force: 'N', answer: 'afterCheck' }] }),
      options: [
        { id: 'weight', label: n0(N.weight), hint: "That's W. The rope pulls up too, so the floor does less." },
        { id: 'rope-down', label: n0(N.ropeDown), hint: `The rope pulls up, not down: its ${n1(X.up)} helps hold the crate.` },
        { id: 'right', label: n0(N.right), correct: true },
        { id: 'cos', label: n0(N.cos), hint: 'You took away the forward part. Up and down, use the upward part.' },
      ],
      why: `N + ${n1(X.up)} = ${n0(W)}, so N = ${n0(N.right)}. The rope holds up part of the weight, so the floor pushes less than the weight.`,
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
      id: 'push',
      kind: 'choice',
      prompt: `Rose pushes with a pole instead: ${PULL} N at ${ANGLE}° below the horizontal, at a steady speed. How hard does the floor push now?`,
      fig: crate({ by: 'pole', forces: ALL, values: true, ask: [{ force: 'N', answer: 'afterCheck' }] }),
      options: [
        { id: 'copied', label: n0(P.copied), hint: 'That was the rope. This push points down, onto the floor.' },
        { id: 'weight', label: n0(P.weight), hint: 'The pole pushes the crate down too, so N is more than W.' },
        { id: 'cos', label: n0(P.cos), hint: `You added the forward part. Up and down, use the ${n1(X.up)}.` },
        { id: 'right', label: n0(P.right), correct: true },
      ],
      why: `Now the push adds ${n1(X.up)} downward: N = ${n0(W)} + ${n1(X.up)} = ${n0(P.right)}. Push down on a crate and the floor pushes back harder.`,
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
        { id: 'left', label: 'To the left', hint: 'The diagram shows how it accelerates. It might be moving right, slowing.' },
        { id: 'right-way', label: 'To the right', hint: 'The bigger force points left. And a diagram shows forces, not motion.' },
        { id: 'rest', label: 'It is at rest', hint: "The forces don't balance, so it can't stay at rest." },
        { id: 'right', label: "We can't tell: we only know it accelerates to the left", correct: true },
      ],
      why: `The resultant is ${n0(X.ice.resultant)} to the left, so the box accelerates to the left. It may be moving left and speeding up, or moving right and slowing.`,
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
      id: 'thrown',
      kind: 'choice',
      prompt: 'A ball has been thrown straight up and is still rising. Air resistance is negligible. Which forces act on the ball?',
      options: [
        { id: 'throw', label: 'Its weight and the upward force of the throw' },
        { id: 'right', label: 'Only its weight', correct: true },
        { id: 'fading', label: 'Its weight and an upward force that gets smaller' },
        { id: 'none', label: 'No forces until it starts to fall' },
      ],
      why: 'Once it leaves the hand nothing touches it, so only its weight acts. It keeps rising because it is moving up, not because a force pushes it.',
    },
    {
      id: 'sign',
      kind: 'choice',
      prompt: `A ${fixed(SIGN.m, 1)} kg sign hangs at rest from two cables, each at ${SIGN.angle}° to the horizontal. Take g = ${G} N kg⁻¹. What is the tension in each cable?`,
      fig: {
        kind: 'particle',
        header: `sign at rest, cables at ${SIGN.angle}°`,
        scale: 1.2,
        forces: [
          { size: S.weight, angle: 270, text: `W ${n1(S.weight)}` },
          { size: S.right, angle: SIGN.angle, text: 'T' },
          { size: S.right, angle: 180 - SIGN.angle, text: 'T' },
        ],
      },
      options: [
        { id: 'half', label: n1(S.half) },
        { id: 'cos', label: n1(S.cos) },
        { id: 'right', label: n1(S.right), correct: true },
        { id: 'whole', label: n1(S.whole) },
      ],
      why: `Up and down: 2T sin ${SIGN.angle}° = ${n1(S.weight)}, so T = ${n1(S.right)}. The sideways parts of the two cables cancel.`,
    },
    {
      id: 'slope',
      kind: 'choice',
      prompt: `A ${fixed(SLOPE.m, 1)} kg box rests on a rough slope at ${SLOPE.angle}° to the horizontal. Take g = ${G} N kg⁻¹. What is the friction force on the box?`,
      options: [
        { id: 'right', label: `${n1(X.slope.right)} up the slope`, correct: true },
        { id: 'cos', label: `${n1(X.slope.cos)} up the slope` },
        { id: 'whole', label: `${n1(X.slope.whole)} up the slope` },
        { id: 'zero', label: `${n0(0)}: the box is at rest` },
      ],
      why: `Along the slope, friction balances the part of the weight down the slope: F = ${n1(X.slope.whole)} × sin ${SLOPE.angle}° = ${n1(X.slope.right)}.`,
    },
    {
      id: 'book',
      kind: 'choice',
      prompt: `A hand presses a ${fixed(BOOK.m, 1)} kg book flat against a wall with ${BOOK.press} N. The book does not slip. Take g = ${G} N kg⁻¹. What is the friction on the book?`,
      options: [
        { id: 'press', label: `${n0(BOOK.press)} upward` },
        { id: 'zero', label: n0(0) },
        { id: 'sum', label: `${n1(X.book.sum)} upward` },
        { id: 'right', label: `${n1(X.book.right)} upward`, correct: true },
      ],
      why: `Up and down only the weight and friction act, so friction = mg = ${n1(X.book.right)}, upward. The ${BOOK.press} N press is balanced by the wall's N.`,
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
