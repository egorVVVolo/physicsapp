// Lesson "Falling through air" — drag and terminal velocity, WPH11 point 9 (with ΣF = ma from "Force and acceleration").
// The puzzle: one paper cake case falls at a steady 1.20 m s⁻¹. Four stacked cases (four times the weight, same shape)?
// Twice as fast, 2.40 m s⁻¹: four times the weight needs four times the drag, and drag grows as the square of the speed.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { G } from '../physics/kinematics.ts';
import { acceleration, weight } from '../physics/dynamics.ts';
import { dragConstantFor, fallFromRest, peakDragRatio, skydiveSamples, terminalVelocity, type Skydive } from '../physics/drag.ts';
import { fixed, sig } from '../physics/format.ts';
import type { FallFig, FallVtFig, Lesson } from './types.ts';

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
export const TUCK = { vt: 60, open: 15, inflate: 4 }; // m s⁻¹ after she tucks in, s when she starts to, s to finish

const sd: Skydive = { vt1: SKY.vt, vt2: CHUTE.vt, open: CHUTE.open, inflate: CHUTE.inflate };
const W = weight(SKY.m);
const kCase = dragConstantFor(1, CASE_VT); // per kilogram of one case: only the ratio of weights matters
const stackVt = terminalVelocity(STACK, kCase);
const peak = Math.round(peakDragRatio(sd) * 10) / 10; // the drag at its biggest, as a multiple of W, to 0.1 (given)
const tPeak = skydiveSamples(sd, CHUTE.open + CHUTE.inflate, 0.01).reduce((best, r) => (r.dOverW > best.dOverW ? r : best)).t;
const shuttleW = weight(SHUTTLE.m);
const kSky = dragConstantFor(SKY.m, SKY.vt); // N s² m⁻²: the drag constant of her falling shape, D = kv²
const chuteD = peak * W;

/** Answers and named mistakes, used by the screens and re-checked by falling-through-air.test.ts. */
export const ANSWERS = {
  weight: W,
  stack: { right: stackVt, linear: STACK * CASE_VT, same: CASE_VT, slower: CASE_VT / 2 },
  startA: fallFromRest(0, SKY.vt).a,
  /** The speed at 15 s, when the graph has flattened. */
  at15: fallFromRest(CHUTE.open, SKY.vt).v,
    // ΣF = D − W = (r − 1)W, so a = (r − 1)g
  peak: { ratio: peak, t: tPeak, drag: chuteD, right: (peak - 1) * G, dragOnly: peak * G, added: (peak + 1) * G },
  shuttle: {
    right: acceleration(shuttleW - SHUTTLE.drag, SHUTTLE.m),
    dragOnly: acceleration(SHUTTLE.drag, SHUTTLE.m),
    added: acceleration(shuttleW + SHUTTLE.drag, SHUTTLE.m),
  },
  cyclist: { right: CYCLIST.v * Math.sqrt(CYCLIST.push / CYCLIST.drag), linear: CYCLIST.v * (CYCLIST.push / CYCLIST.drag), same: CYCLIST.v, inverse: CYCLIST.v / Math.sqrt(CYCLIST.push / CYCLIST.drag) },
  /** The terminal velocity built from m, g and k (D = kv² = W). */
  vt: { right: terminalVelocity(SKY.m, kSky), k: kSky, weightAsM: W },
};

const cases = (over: Partial<FallFig>): FallFig => ({ kind: 'fall', body: { cases: [1] }, vt: CASE_VT, tEnd: 1.2, at: 'end', ...over });
const both = (over: Partial<FallFig>): FallFig => cases({ body: { cases: [1, STACK] }, ...over });
const diver = (over: Partial<FallFig>): FallFig => ({ kind: 'fall', body: { skydiver: { m: SKY.m } }, vt: SKY.vt, tEnd: SKY.tEnd, graph: true, forces: true, ...over });
const chute = (over: Partial<FallFig>): FallFig => diver({ body: { skydiver: { m: SKY.m, chute: CHUTE } }, ...over });

/** The v–t graphs of the parachute question and of the tucking-in question: one right, two named mistakes, on the same axes. */
const chuteGraph = (curve: FallVtFig['curve']): FallVtFig => ({ kind: 'fallVt', header: `skydiver, parachute opens at ${CHUTE.open} s`, curve, vt: SKY.vt, chute: CHUTE, tEnd: SKY.tEnd });
const tuckGraph = (curve: FallVtFig['curve']): FallVtFig => ({ kind: 'fallVt', header: `skydiver tucks in at ${TUCK.open} s`, curve, vt: SKY.vt, chute: TUCK, tEnd: SKY.tEnd });

const X = ANSWERS;
const kText = `${fixed(kSky, 3)}${NB}N${NB}s²${NB}m⁻²`;

export const fallingThroughAir: Lesson = {
  id: 'terminal-velocity',
  title: 'Falling through air',
  spec: [9],
  minutes: 12,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'Why the speed levels off', from: 'speeding' },
    { title: 'The parachute', from: 'chute' },
  ],
  cast: ['Ines'],
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
        { id: 'twice', label: 'Twice as fast', correct: true },
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
      id: 'start-a',
      kind: 'choice',
      prompt: `Ines, ${SKY.m} kg, jumps from a hovering helicopter. What is her acceleration at the very moment she lets go?`,
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
      id: 'why-steady',
      kind: 'order',
      prompt: `After about ${CHUTE.open} s her speed stays at ${ms(SKY.vt, 0)}. Put the reasoning in order.`,
      fig: diver({ at: CHUTE.open }),
      steps: [
        { id: 'faster', text: 'She speeds up, so the air pushes back harder: the drag D grows.' },
        { id: 'shrinks', text: 'Her weight stays the same, so the resultant W − D gets smaller.' },
        { id: 'a', text: 'A smaller resultant means a smaller acceleration: the graph flattens.' },
        { id: 'equal', text: `At ${ms(SKY.vt, 0)} the drag equals her weight, ${n(W)}: ΣF = 0.` },
        { id: 'steady', text: 'With no resultant, her speed stays steady.' },
      ],
      hint: 'Start with the drag growing, then follow what that does to the resultant.',
      why: `Steady speed means a = 0, so ΣF = 0: drag = weight = ${n(W)}. Both forces still act; they cancel.`,
    },
    {
      id: 'terminal',
      kind: 'text',
      body: [
        'When the drag has grown to equal the weight, ΣF = 0 and a = 0: the speed stops changing. This steady top speed is the **terminal velocity**.',
        `For Ines it is ${ms(SKY.vt, 0)}, about ${fixed(SKY.vt * 3.6, 0)} km/h. A heavier body of the same shape needs more drag, so it falls faster.`,
      ],
      card: { term: 'Terminal velocity', text: 'The steady speed of a falling body, reached when the drag on it equals its weight.' },
    },
    {
      id: 'square',
      kind: 'text',
      body: [`Drag grows as the square of the speed: **D = kv²**. For Ines, k = ${kText}.`],
      fig: both({ speeds: 'shown', play: true }),
    },
    {
      id: 'vt-build',
      kind: 'build',
      prompt: `At terminal velocity D = W, so kv² = mg. Build Ines's terminal velocity, with k = ${kText}.`,
      fig: diver({ at: CHUTE.open, graph: undefined }),
      equation: 'v = √({m} × {g} ÷ {k})',
      boxes: { m: 'mass', g: 'field', k: 'k' },
      chips: [
        { id: 'mass', label: `${SKY.m}${NB}kg` },
        { id: 'field', label: `${G}${NB}N${NB}kg⁻¹` },
        { id: 'k', label: kText },
        { id: 'weight', label: n(W), hint: 'That is the weight. The equation multiplies the mass by g itself.' },
        { id: 'tenfold', label: `${fixed(kSky * 10, 2)}${NB}N${NB}s²${NB}m⁻²`, hint: `Check the decimal point: k is ${fixed(kSky, 3)}, not ${fixed(kSky * 10, 2)}.` },
      ],
      result: { symbol: 'v', value: X.vt.right, unit: 'm s⁻¹' },
      why: `v² = mg / k = ${n(W)} / ${fixed(kSky, 3)}, so v = ${ms(X.vt.right, 1)}. The square root appears because drag goes as v².`,
    },
    {
      id: 'hook-again',
      kind: 'estimate',
      prompt: `Back to the cases. One falls at a steady ${ms(CASE_VT)}. Drag to the terminal velocity of the stack of ${STACK}.`,
      fig: both({ speeds: 'unknown' }),
      after: both({ speeds: 'shown' }),
      scale: { min: 0, max: 6, step: 0.1, tick: 1, unit: 'm s⁻¹', symbol: 'v', dp: 1, label: 'Terminal velocity of the stack' },
      answer: X.stack.right,
      tolerance: 0.2,
      why: `The stack needs ${STACK} times the drag. Drag goes as v², and 2² = ${STACK}, so twice the speed: ${ms(X.stack.right)}.`,
    },
    {
      id: 'chute',
      kind: 'text',
      body: [`At ${CHUTE.open} s she opens her parachute, and its drag grows fast.`],
      fig: chute({ at: 'end' }),
    },
    {
      id: 'chute-graph',
      kind: 'graphPick',
      prompt: `She falls at ${ms(SKY.vt, 0)} when the parachute opens at ${CHUTE.open} s. Which v–t graph shows her whole fall?`,
      scene: chute({ at: 0, graph: undefined, forces: undefined }),
      graphs: [
        { id: 'A', fig: chuteGraph('straight'), hint: 'A straight start means a = g all the way. Drag makes a shrink: the line must curve.' },
        { id: 'B', fig: chuteGraph('model'), correct: true },
        { id: 'C', fig: chuteGraph('stop'), hint: 'This line reaches zero: she would stop in mid-air. She keeps falling, only slower.' },
      ],
      why: `The line curves up to ${ms(SKY.vt, 0)}, then drops to ${ms(CHUTE.vt, 1)} and levels off again: she slows but never stops, because drag equals her weight again.`,
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
      why: `Slowing down while falling means the acceleration points up, so the resultant does too: drag is bigger than her weight. At a steady ${ms(CHUTE.vt, 1)} it is ${n(W)} again.`,
    },
    {
      id: 'peak',
      kind: 'build',
      prompt: `Just after the parachute opens, the drag on her is ${fixed(peak, 1)} times her weight, ${sig(X.peak.drag)} N. Build her acceleration, upward.`,
      fig: chute({ at: tPeak }),
      equation: 'a = ({D} − {W}) ÷ {m}',
      boxes: { D: 'drag', W: 'weight', m: 'mass' },
      chips: [
        { id: 'drag', label: `${sig(X.peak.drag)}${NB}N` },
        { id: 'weight', label: n(W) },
        { id: 'mass', label: `${SKY.m}${NB}kg` },
        { id: 'sum', label: `${sig(X.peak.drag + W)}${NB}N`, hint: 'W points down and D up: take W away, do not add it.' },
        { id: 'free', label: `${fixed(SKY.m * G, 0)}${NB}kg`, hint: 'That is the weight in newtons, not a mass. The mass is 70 kg.' },
      ],
      result: { symbol: 'a', value: X.peak.right, unit: 'm s⁻²' },
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
      id: 'cyclist',
      kind: 'build',
      prompt: `Drag on a cyclist grows as the square of her speed: ${n(CYCLIST.drag)} at ${ms(CYCLIST.v, 1)}. At top speed her pedals push with ${n(CYCLIST.push)}, and drag equals that push. Build her top speed.`,
      equation: 'v = {v₀} × √({F} ÷ {D₀})',
      boxes: { 'v₀': 'v0', F: 'push', 'D₀': 'd0' },
      chips: [
        { id: 'v0', label: ms(CYCLIST.v, 1) },
        { id: 'push', label: n(CYCLIST.push) },
        { id: 'd0', label: n(CYCLIST.drag) },
        { id: 'diff', label: n(CYCLIST.push - CYCLIST.drag), hint: 'At top speed drag equals the whole push, not the difference.' },
        { id: 'linear', label: ms(X.cyclist.linear, 1), hint: 'That treats drag as growing in step with speed. It grows as v².' },
      ],
      result: { symbol: 'v', value: X.cyclist.right, unit: 'm s⁻¹' },
      why: `Drag goes as v², and ${CYCLIST.push} N is ${CYCLIST.push / CYCLIST.drag} times ${n(CYCLIST.drag)}, so v is √${CYCLIST.push / CYCLIST.drag} = ${fixed(Math.sqrt(CYCLIST.push / CYCLIST.drag), 0)} times bigger: ${ms(X.cyclist.right, 1)}.`,
    },
    {
      id: 'tuck',
      kind: 'graphPick',
      prompt: `Ines falls steadily at ${ms(SKY.vt, 0)}. At ${TUCK.open} s she tucks into a tight ball: same weight, less area facing the air. Which v–t graph shows what follows?`,
      graphs: [
        { id: 'A', fig: tuckGraph('flat'), hint: 'A flat line means no resultant. But less drag leaves her weight unbalanced.' },
        { id: 'B', fig: tuckGraph('stop'), hint: 'Slowing needs drag bigger than her weight. Tucking in makes the drag smaller.' },
        { id: 'C', fig: tuckGraph('model'), correct: true },
      ],
      why: `Tucked in, the same speed gives less drag than her weight, so ΣF points down and she speeds up again, until D = W at a higher terminal velocity.`,
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
    {
      id: 'shuttle',
      kind: 'examCard',
      context: `A ${fixed(SHUTTLE.m * 1000, 1)} g shuttlecock is dropped from a high balcony. When it falls at ${ms(SHUTTLE.v, 1)}, the drag on it is ${n(SHUTTLE.drag, 3)}. Take g = ${G} N kg⁻¹.`,
      parts: [
        {
          id: 'a',
          command: 'Calculate',
          text: 'its acceleration at that speed.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'a = ({W} − {D}) ÷ {m}',
            boxes: { W: 'weight', D: 'drag', m: 'mass' },
            chips: [
              { id: 'weight', label: n(shuttleW, 4) },
              { id: 'drag', label: n(SHUTTLE.drag, 3) },
              { id: 'mass', label: `${fixed(SHUTTLE.m, 4)}${NB}kg` },
              { id: 'added', label: n(shuttleW + SHUTTLE.drag, 4), hint: 'Drag points up and weight down: take it away, do not add it.' },
              { id: 'grams', label: `${fixed(SHUTTLE.m * 1000, 1)}${NB}g`, hint: 'That is the mass in grams. The equation needs kilograms: 0.0050 kg.' },
            ],
            result: { symbol: 'a', value: X.shuttle.right, unit: 'm s⁻²' },
          },
          why: `ΣF = W − D = ${n(shuttleW, 4)} − ${n(SHUTTLE.drag, 3)} = ${n(shuttleW - SHUTTLE.drag, 4)}, so a = ΣF / m = ${ms2(X.shuttle.right, 2)}. One mark for ΣF, one for the answer.`,
        },
        {
          id: 'b',
          command: 'Explain',
          text: 'why the shuttlecock stops speeding up if it falls far enough.',
          marks: 3,
          kind: 'order',
          steps: [
            { id: 'drag', text: 'As it speeds up, the drag on it grows.' },
            { id: 'resultant', text: 'Its weight stays the same, so the resultant W − D gets smaller.' },
            { id: 'a', text: 'The acceleration shrinks, until D = W and a = 0.' },
            { id: 'steady', text: 'With ΣF = 0 its speed stays steady: the terminal velocity.' },
          ],
          why: 'Drag grows with speed until it balances the weight. Then there is no resultant force, so the speed cannot change.',
        },
      ],
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
