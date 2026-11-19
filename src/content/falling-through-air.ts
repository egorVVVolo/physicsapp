// Lesson "Falling through air" — drag and terminal velocity, WPH11 point 9 (with ΣF = ma from "Force and acceleration").
// The puzzle: one paper cake case falls at a steady 1.20 m s⁻¹. Four stacked cases (four times the weight, same shape)?
// Twice as fast, 2.40 m s⁻¹: four times the weight needs four times the drag, and drag grows as the square of the speed.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { G } from '../physics/kinematics.ts';
import { acceleration, weight } from '../physics/dynamics.ts';
import { dragConstantFor, fallFromRest, peakDragRatio, skydiveSamples, terminalVelocity, type Skydive } from '../physics/drag.ts';
import { fixed } from '../physics/format.ts';
import type { FallFig, Lesson } from './types.ts';

const NB = '\u00A0';
/** "2.40 m s⁻¹". */
export const ms = (x: number, dp = 2): string => `${fixed(x, dp)}${NB}m${NB}s⁻¹`;
/** "39.2 m s⁻²". */
export const ms2 = (x: number, dp = 1): string => `${fixed(x, dp)}${NB}m${NB}s⁻²`;
/** "687 N". */
export const n = (x: number, dp = 0): string => `${fixed(x, dp)}${NB}N`;

// The story and the numbers of each question.
export const CASE_VT = 1.2; // m s⁻¹, one paper cake case
export const STACK = 4; // cases stacked inside each other
export const SKY = { m: 70, vt: 50, tEnd: 30 }; // kg, m s⁻¹ before the parachute, s on the graph
export const CHUTE = { vt: 6, open: 15, inflate: 4 }; // m s⁻¹ under the canopy, s when it starts to open, s to open fully
export const SHUTTLE = { m: 0.005, v: 3.0, drag: 0.02 }; // kg, m s⁻¹, N
export const CYCLIST = { v: 8.0, drag: 30, push: 120 }; // m s⁻¹, N, N
export const DIVERS = { light: 60, heavy: 90, vt: 48.0 }; // kg, kg, m s⁻¹

const sd: Skydive = { vt1: SKY.vt, vt2: CHUTE.vt, open: CHUTE.open, inflate: CHUTE.inflate };
const W = weight(SKY.m);
const kCase = dragConstantFor(1, CASE_VT); // per kilogram of one case: only the ratio of weights matters
const stackVt = terminalVelocity(STACK, kCase);
const peak = Math.round(peakDragRatio(sd) * 10) / 10; // the drag at its biggest, as a multiple of W, to 0.1 (given)
const tPeak = skydiveSamples(sd, CHUTE.open + CHUTE.inflate, 0.01).reduce((best, r) => (r.dOverW > best.dOverW ? r : best)).t;
const shuttleW = weight(SHUTTLE.m);
const kDiver = dragConstantFor(DIVERS.light, DIVERS.vt);

/** Answers and named mistakes, used by the screens and re-checked by falling-through-air.test.ts. */
export const ANSWERS = {
  weight: W,
  stack: { right: stackVt, linear: STACK * CASE_VT, same: CASE_VT, slower: CASE_VT / 2 },
  startA: fallFromRest(0, SKY.vt).a,
  /** The speed at 15 s, when the graph has flattened. */
  at15: fallFromRest(CHUTE.open, SKY.vt).v,
    // ΣF = D − W = (r − 1)W, so a = (r − 1)g
  peak: { ratio: peak, t: tPeak, right: (peak - 1) * G, dragOnly: peak * G, added: (peak + 1) * G },
  shuttle: {
    right: acceleration(shuttleW - SHUTTLE.drag, SHUTTLE.m),
    dragOnly: acceleration(SHUTTLE.drag, SHUTTLE.m),
    added: acceleration(shuttleW + SHUTTLE.drag, SHUTTLE.m),
  },
  cyclist: { right: CYCLIST.v * Math.sqrt(CYCLIST.push / CYCLIST.drag), linear: CYCLIST.v * (CYCLIST.push / CYCLIST.drag), same: CYCLIST.v, inverse: CYCLIST.v / Math.sqrt(CYCLIST.push / CYCLIST.drag) },
  divers: { right: terminalVelocity(DIVERS.heavy, kDiver), linear: (DIVERS.vt * DIVERS.heavy) / DIVERS.light, same: DIVERS.vt, slower: (DIVERS.vt * DIVERS.light) / DIVERS.heavy },
};

const cases = (over: Partial<FallFig>): FallFig => ({ kind: 'fall', body: { cases: [1] }, vt: CASE_VT, tEnd: 1.2, at: 'end', ...over });
const both = (over: Partial<FallFig>): FallFig => cases({ body: { cases: [1, STACK] }, ...over });
const diver = (over: Partial<FallFig>): FallFig => ({ kind: 'fall', body: { skydiver: { m: SKY.m } }, vt: SKY.vt, tEnd: SKY.tEnd, graph: true, forces: true, ...over });
const chute = (over: Partial<FallFig>): FallFig => diver({ body: { skydiver: { m: SKY.m, chute: CHUTE } }, ...over });

const X = ANSWERS;

export const fallingThroughAir: Lesson = {
  id: 'terminal-velocity',
  title: 'Falling through air',
  spec: [9],
  minutes: 12,
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Falling through air',
      body: `Drop a paper cake case in still air. Within a moment it stops speeding up and falls at a steady ${ms(CASE_VT)}.`,
      fig: cases({ forces: true, speeds: 'shown', play: true }),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: `Stack ${STACK} cases inside each other: ${STACK} times the weight, the same shape. How fast does the stack fall once it is steady?`,
      fig: both({ speeds: 'unknown' }),
      options: [
        { id: 'same', label: 'The same speed' },
        { id: 'twice', label: 'Twice as fast' },
        { id: 'four', label: `${STACK} times as fast` },
        { id: 'slower', label: 'Slower than one case' },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'drag',
      kind: 'text',
      body: [
        'Anything moving through air has to push the air aside, and the air pushes back. This force is called **drag**.',
        'Drag always acts **against the motion**, and the faster the body moves, the bigger the drag.',
      ],
      card: { term: 'Drag', text: 'The force of the air (or any fluid) on a moving body, opposite to its velocity. It grows with speed.' },
    },
    {
      id: 'jump',
      kind: 'text',
      body: ['The moment she jumps, v = 0: there is **no drag yet**, only her weight.'],
      fig: diver({}),
    },
    {
      id: 'start-a',
      kind: 'choice',
      prompt: `A ${SKY.m} kg skydiver jumps from a hovering helicopter. What is her acceleration at the very moment she lets go?`,
      fig: diver({}),
      options: [
        { id: 'zero', label: ms2(0, 2), hint: 'Her speed is zero, but her weight already acts. v = 0 does not mean a = 0.' },
        { id: 'right', label: ms2(X.startA, 2), correct: true },
        { id: 'less', label: `Less than ${ms2(G, 2)}, because of the air`, hint: 'Drag needs speed. At v = 0 there is none yet.' },
      ],
      why: `At v = 0 there is no drag, so ΣF = W and a = W / m = g = ${ms2(X.startA, 2)}, the same as in a vacuum.`,
    },
    {
      id: 'speeding',
      kind: 'explore',
      instruction: 'Drag the slider to move through the first 15 s of her fall.',
      fig: diver({}),
      slider: { min: 0, max: CHUTE.open, step: 0.5, tick: 5, label: 'Time since she jumped', unit: 's', symbol: 't', dp: 1 },
      question: {
        prompt: 'As she speeds up, what happens to her acceleration?',
        options: [
          { id: 'bigger', label: 'It gets bigger', hint: 'Watch a in the header, and the slope of the graph.' },
          { id: 'smaller', label: 'It gets smaller', correct: true },
          { id: 'same', label: `It stays ${G} m s⁻²`, hint: 'Look at D: it grows, so ΣF = W − D shrinks.' },
        ],
        right: 'Right: D grows, so ΣF = W − D shrinks, and so does a. The graph gets flatter.',
      },
    },
    {
      id: 'steady',
      kind: 'choice',
      prompt: `After about ${CHUTE.open} s her speed stays at ${ms(SKY.vt, 0)}. How does the drag on her compare with her weight now?`,
      fig: diver({ at: CHUTE.open, askD: 'afterCheck' }),
      options: [
        { id: 'bigger', label: 'Drag is bigger than her weight', hint: 'Then ΣF would point up and she would slow down.' },
        { id: 'right', label: 'Drag is equal to her weight', correct: true },
        { id: 'smaller', label: 'Drag is smaller than her weight', hint: 'Then ΣF would point down and she would still speed up.' },
        { id: 'none', label: 'No forces act on her now', hint: 'Gravity never switches off. Two forces act, and they balance.' },
      ],
      why: `Steady speed means a = 0, so ΣF = 0: drag = weight = ${n(W)}. Both forces still act; they cancel.`,
    },
    {
      id: 'terminal',
      kind: 'text',
      body: [
        "When the drag has grown to equal the weight, ΣF = 0 and a = 0. The speed stops changing: Newton's first law again.",
        `This top speed of a falling body is its **terminal velocity**. For her it is ${ms(SKY.vt, 0)}, about ${fixed(SKY.vt * 3.6, 0)} km/h.`,
      ],
      card: { term: 'Terminal velocity', text: 'The steady speed of a falling body, reached when the drag on it equals its weight.' },
    },
    {
      id: 'square',
      kind: 'text',
      body: [
        'For a body like a cake case or a skydiver, drag grows with the **square** of the speed: twice as fast, four times the drag.',
        'A heavier body of the same shape needs more drag to balance its weight, so it has to fall **faster** to get it.',
      ],
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Back to the puzzle. One case falls at a steady ${ms(CASE_VT)}. What is the terminal velocity of the stack of ${STACK}?`,
      fig: both({ speeds: 'afterCheck' }),
      options: [
        { id: 'linear', label: ms(X.stack.linear), hint: `${STACK} times the drag needs only twice the speed: drag goes as v².` },
        { id: 'same', label: ms(X.stack.same), hint: 'Only true with no air. Here the stack needs more drag than one case.' },
        { id: 'right', label: ms(X.stack.right), correct: true },
        { id: 'slower', label: ms(X.stack.slower), hint: 'More weight needs more drag, and more drag needs more speed.' },
      ],
      why: `The stack needs ${STACK} times the drag. Drag goes as v², and 2² = ${STACK}, so twice the speed: ${ms(X.stack.right)}.`,
    },
    {
      id: 'chute',
      kind: 'text',
      body: [`At ${CHUTE.open} s she opens her parachute, and its drag grows fast.`],
      fig: chute({ at: 'end' }),
    },
    {
      id: 'chute-dir',
      kind: 'choice',
      prompt: `Her speed falls from ${ms(SKY.vt, 0)} to ${ms(CHUTE.vt, 1)} while she keeps falling. Which way does the resultant force on her point?`,
      fig: chute({ at: 'end', forces: undefined }),
      options: [
        { id: 'down', label: 'Down, because she is moving down', hint: 'ΣF gives the acceleration. She is slowing, so a points up.' },
        { id: 'right', label: 'Up, while she is moving down', correct: true },
        { id: 'zero', label: 'There is no resultant force', hint: 'Her speed changes, so a ≠ 0 and ΣF ≠ 0.' },
        { id: 'up-moving', label: 'Up, because the parachute lifts her up', hint: 'She never goes up. She slows down while still falling.' },
      ],
      why: 'Slowing down while falling means the acceleration points up, so the resultant does too: drag is bigger than her weight.',
    },
    {
      id: 'chute-steady',
      kind: 'choice',
      prompt: `With the parachute open she falls at a steady ${ms(CHUTE.vt, 1)}. How big is the drag on her now?`,
      fig: chute({ at: 'end', askD: 'afterCheck' }),
      options: [
        { id: 'bigger', label: 'Bigger than her weight: the parachute is open', hint: 'Then she would still be slowing down. Her speed is steady.' },
        { id: 'smaller', label: 'Smaller than her weight: she is slower now', hint: 'Then she would speed up again. Steady speed means ΣF = 0.' },
        { id: 'right', label: `Equal to her weight, ${n(W)}, as at ${ms(SKY.vt, 0)}`, correct: true },
        { id: 'zero', label: 'Zero: she is no longer speeding up', hint: 'Then only her weight would act, and she would speed up.' },
      ],
      why: `Any steady fall has D = W = ${n(W)}. The big canopy gets that drag at ${ms(CHUTE.vt, 1)}, not ${ms(SKY.vt, 0)}.`,
    },
    {
      id: 'peak',
      kind: 'choice',
      prompt: `Just after the parachute opens, the drag on her is ${fixed(peak, 1)} times her weight. What is her acceleration then?`,
      fig: chute({ at: tPeak }),
      options: [
        { id: 'drag-only', label: `${ms2(X.peak.dragOnly)} upward`, hint: 'That is D / m. Her weight pulls the other way: use ΣF = D − W.' },
        { id: 'right', label: `${ms2(X.peak.right)} upward`, correct: true },
        { id: 'added', label: `${ms2(X.peak.added)} upward`, hint: 'W points down and D up: take W away, do not add it.' },
        { id: 'g', label: `${ms2(G, 2)} downward`, hint: 'That is free fall, with no drag at all.' },
      ],
      why: `ΣF = D − W = ${fixed(peak, 1)}W − W = ${fixed(peak - 1, 1)}W upward, so a = ${fixed(peak - 1, 1)}g = ${ms2(X.peak.right)} upward, about ${fixed(peak - 1, 0)}g.`,
    },
    {
      id: 'rules',
      kind: 'text',
      body: [
        'Falling from rest, a starts at **g** and shrinks as drag grows, until D = W at the **terminal velocity**. The v–t graph curves and flattens.',
        'Open a parachute and D > W: she slows while still falling, until D = W again at a lower terminal velocity.',
      ],
      card: { term: 'The v–t graph of a fall', text: 'Starts with gradient g, gets flatter as drag grows, and levels off at the terminal velocity.' },
    },
  ],
  skillCheck: [
    {
      id: 'shuttle',
      kind: 'choice',
      prompt: `A ${fixed(SHUTTLE.m * 1000, 1)} g shuttlecock falls at ${ms(SHUTTLE.v, 1)}, where the drag on it is ${n(SHUTTLE.drag, 3)}. Take g = ${G} N kg⁻¹. What is its acceleration?`,
      options: [
        { id: 'drag-only', label: ms2(X.shuttle.dragOnly, 2) },
        { id: 'g', label: ms2(G, 2) },
        { id: 'right', label: ms2(X.shuttle.right, 2), correct: true },
        { id: 'added', label: ms2(X.shuttle.added, 1) },
      ],
      why: `ΣF = W − D = ${n(shuttleW, 4)} − ${n(SHUTTLE.drag, 3)} = ${n(shuttleW - SHUTTLE.drag, 4)}, so a = ΣF / m = ${ms2(X.shuttle.right, 2)}.`,
    },
    {
      id: 'cyclist',
      kind: 'choice',
      prompt: `Drag on a cyclist grows as the square of her speed: ${n(CYCLIST.drag)} at ${ms(CYCLIST.v, 1)}. At top speed she pedals with ${n(CYCLIST.push)}. What is her top speed?`,
      options: [
        { id: 'linear', label: ms(X.cyclist.linear, 1) },
        { id: 'right', label: ms(X.cyclist.right, 1), correct: true },
        { id: 'same', label: ms(X.cyclist.same, 1) },
        { id: 'inverse', label: ms(X.cyclist.inverse, 1) },
      ],
      why: `At top speed drag = ${n(CYCLIST.push)}, ${CYCLIST.push / CYCLIST.drag} times ${n(CYCLIST.drag)}. Drag goes as v², so v is √${CYCLIST.push / CYCLIST.drag} = ${fixed(Math.sqrt(CYCLIST.push / CYCLIST.drag), 0)} times bigger: ${ms(X.cyclist.right, 1)}.`,
    },
    {
      id: 'divers',
      kind: 'choice',
      prompt: `Two skydivers have the same shape in the air. The ${DIVERS.light} kg one has a terminal velocity of ${ms(DIVERS.vt, 1)}. What is the ${DIVERS.heavy} kg one's?`,
      options: [
        { id: 'same', label: ms(X.divers.same, 1) },
        { id: 'slower', label: ms(X.divers.slower, 1) },
        { id: 'right', label: ms(X.divers.right, 1), correct: true },
        { id: 'linear', label: ms(X.divers.linear, 1) },
      ],
      why: `D = W at terminal velocity, and D goes as v². ${DIVERS.heavy / DIVERS.light} times the weight needs √${DIVERS.heavy / DIVERS.light} times the speed: ${ms(X.divers.right, 1)}.`,
    },
    {
      id: 'down',
      kind: 'choice',
      prompt: 'A ball is thrown straight down from a tall tower, faster than its terminal velocity. What happens to its speed as it falls?',
      options: [
        { id: 'up', label: 'It keeps increasing' },
        { id: 'same', label: 'It stays the same' },
        { id: 'right', label: 'It decreases until it reaches terminal velocity', correct: true },
        { id: 'zero', label: 'It decreases until the ball stops' },
      ],
      why: 'Above terminal velocity the drag is bigger than the weight, so ΣF points up and the ball slows, until D = W again.',
    },
  ],
  youCanNow: [
    'Explain why a falling body reaches terminal velocity',
    'Find the acceleration on the way with ΣF = W − D',
    'Read the v–t graph of a fall, parachute included',
    'Say how terminal velocity changes with weight',
  ],
  recap: {
    fig: both({ speeds: 'shown', play: true }),
    text: `${STACK} times the weight needs ${STACK} times the drag, and that takes only twice the speed: ${ms(X.stack.right)}.`,
  },
  card: {
    formula: 'D = W at terminal v',
    idea: 'Drag grows with speed until it equals the weight. Then ΣF = 0 and the speed stays steady.',
  },
};
