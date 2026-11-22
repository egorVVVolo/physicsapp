// Lesson "Hooke's law" — ΔF = kΔx with the extension (not the length), the stiffness k of an object, the
// force–extension graph, and compression (WPH11 point 27). The puzzle: a spring stretches 6.0 cm under a 3.0 N weight.
// Cut it in half and hang the same weight on one half: how far does it stretch? Only 3.0 cm. Every part of a hanging
// spring carries the whole load, so every coil stretches the same; half the coils, half the extension. The half is
// twice as stiff: stiffness belongs to the object, not the material.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { fixed, sig } from '../physics/format.ts';
import { cutStiffness, extensionFor, hookeForce, parallelStiffness, stiffness, stiffnessFromPair } from '../physics/springs.ts';
import type { Lesson, SpringFig, SpringHang } from './types.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const NM = (k: number): string => `${sig(k)}${NB}N${NB}m⁻¹`;
const CM = (x: number): string => `${fixed(x * 100, 1)}${NB}cm`;
const NEWTON = (F: number): string => `${fixed(F, 1)}${NB}N`;

export const SPRING = { L0: 0.1, W: 3.0, stretched: 0.16 }; // m, N, m: the spring with no load and with the weight
export const EXPLORE = { max: 6 }; // N, the slider
// Skill check.
export const PAIR = { F1: 2.0, L1: 0.15, F2: 5.0, L2: 0.225 }; // N, m
export const LAUNCHER = { k: 400, L0: 0.08, L: 0.05 }; // N m⁻¹, m, m
export const COILS = { P: 30, Q: 10 };

const dx = SPRING.stretched - SPRING.L0;
const k = stiffness(SPRING.W, dx);
const kHalf = cutStiffness(k, 0.5);
const xHalf = extensionFor(SPRING.W, kHalf);

/** Answers and named mistakes, used by the screens and re-checked by hookes-law.test.ts. */
export const ANSWERS = {
  /** The stiffness from the 3.0 N weight: Δx, not the length; metres, not cm; F ÷ Δx, not Δx ÷ F. */
  k: { right: k, length: SPRING.W / SPRING.stretched, cm: SPRING.W / (dx * 100), upside: dx / SPRING.W },
  /** The pull of the top half on the bottom half: the whole load. */
  pull: { right: SPRING.W, half: SPRING.W / 2, double: 2 * SPRING.W },
  /** How far the bottom half has stretched: half the extension, not the whole, not its length. */
  half: { right: dx / 2, whole: dx, length: SPRING.L0 / 2 + dx / 2, quarter: dx / 4 },
  /** The puzzle: one half on its own. */
  puzzle: { x: xHalf, k: kHalf, same: k, halved: k / 2, four: 4 * k },
  parallel: { right: extensionFor(SPRING.W, parallelStiffness(kHalf, kHalf)), oneHalf: xHalf, whole: dx, quarter: xHalf / 4 },
  pair: {
    right: stiffnessFromPair(PAIR.F1, PAIR.L1, PAIR.F2, PAIR.L2),
    oneLoad: PAIR.F2 / (PAIR.L2 - PAIR.L1),
    length: PAIR.F2 / PAIR.L2,
    cm: stiffnessFromPair(PAIR.F1, PAIR.L1 * 100, PAIR.F2, PAIR.L2 * 100),
  },
  launcher: {
    right: hookeForce(LAUNCHER.k, LAUNCHER.L0 - LAUNCHER.L),
    newLength: hookeForce(LAUNCHER.k, LAUNCHER.L),
    oldLength: hookeForce(LAUNCHER.k, LAUNCHER.L0),
    cm: hookeForce(LAUNCHER.k, (LAUNCHER.L0 - LAUNCHER.L) * 100),
  },
  coils: { ratio: COILS.P / COILS.Q },
};
const X = ANSWERS;

const whole = (over: Partial<SpringHang> = {}): SpringHang => ({ part: 1, load: SPRING.W, name: 'WHOLE', hung: true, ...over });
const half = (over: Partial<SpringHang> = {}): SpringHang => ({ part: 0.5, load: SPRING.W, name: 'HALF', ...over });
const spring = (over: Partial<SpringFig>): SpringFig => ({ kind: 'spring', L0: SPRING.L0, k, springs: [whole()], panel: 'readings', ...over });
const pairFig = (over: Partial<SpringFig> = {}): SpringFig =>
  spring({ springs: [whole({ load: 0, name: 'NO LOAD', hung: undefined }), whole({ name: 'LOADED' })], rows: ['load', 'length'], ...over });

export const hookesLaw: Lesson = {
  id: 'hooke',
  title: "Hooke's law",
  spec: [27],
  minutes: 10,
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: "Hooke's law",
      body: 'A spring hangs beside a ruler. A 3.0 N weight stretches it from 10.0 cm long to 16.0 cm.',
      fig: pairFig(),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: 'Lena cuts the spring in half and hangs the same 3.0 N weight on one half. How far does the half stretch?',
      fig: spring({ springs: [whole({ name: 'WHOLE' }), half({ hung: 'afterCheck' })], rows: ['load', 'ext'] }),
      options: [
        { id: 'quarter', label: '1.5 cm' },
        { id: 'half', label: '3.0 cm', correct: true },
        { id: 'same', label: '6.0 cm, the same' },
        { id: 'double', label: '12.0 cm' },
      ],
      after: "Let's find out",
    },
    {
      id: 'law',
      kind: 'text',
      body: [
        'The **extension** Δx is how much longer the spring gets: its new length minus its length with no load. Not the length itself.',
        "Up to a limit, the force and the extension grow in step: **Hooke's law**, ΔF = kΔx. The constant k is the spring's **stiffness**, in N m⁻¹.",
      ],
      card: { term: "Hooke's law", text: 'ΔF = kΔx: the change in force is proportional to the extension. k is the stiffness of the object, in N m⁻¹.' },
    },
    {
      id: 'stiffness',
      kind: 'choice',
      prompt: 'The 3.0 N weight stretches the spring from 10.0 cm to 16.0 cm. What is its stiffness?',
      fig: pairFig({ rows: ['load', 'length', 'k'], ask: { row: 'k', col: 1, hide: 'afterCheck' } }),
      options: [
        { id: 'length', label: NM(X.k.length), hint: 'That divides by the length, 16.0 cm. Use the extension: 6.0 cm.' },
        { id: 'cm', label: NM(X.k.cm), hint: 'That divides by 6.0, in cm. In N m⁻¹ the extension is 0.060 m.' },
        { id: 'right', label: NM(X.k.right), correct: true },
        { id: 'upside', label: NM(X.k.upside), hint: 'That is Δx ÷ F. The stiffness is force per metre: F ÷ Δx.' },
      ],
      why: `Δx = 16.0 − 10.0 = 6.0 cm = 0.060 m, so k = ΔF ÷ Δx = 3.0 ÷ 0.060 = ${NM(X.k.right)}.`,
    },
    {
      id: 'graph',
      kind: 'explore',
      instruction: 'Drag the slider to change the load. Watch the point on the graph.',
      fig: spring({ springs: [whole({ name: 'SPRING' })], panel: 'graph' }),
      slider: { min: 0, max: EXPLORE.max, step: 0.5, tick: 1, label: 'Load on the spring', unit: 'N', symbol: 'F', dp: 1, start: SPRING.W },
      question: {
        prompt: 'The point traces a straight line through the origin. What does its gradient give?',
        options: [
          { id: 'right', label: 'The stiffness k', correct: true },
          { id: 'ext', label: 'The extension', hint: 'The extension is read along the bottom axis.' },
          { id: 'length', label: 'The length of the spring', hint: 'The graph shows the extension, not the length.' },
        ],
        right: `Right: gradient = ΔF ÷ Δx = 6.0 N ÷ 0.120 m = ${NM(k)}. A steeper line is a stiffer spring.`,
      },
    },
    {
      id: 'pull',
      kind: 'choice',
      prompt: 'Think of the spring as a top half and a bottom half. How hard does the top half pull up on the bottom half?',
      fig: spring({ springs: [whole({ name: 'SPRING', mark: true, pull: 'afterCheck' })], rows: ['load', 'ext'] }),
      options: [
        { id: 'half', label: NEWTON(X.pull.half), hint: 'Look at the bottom half and the weight together: they are at rest.' },
        { id: 'right', label: NEWTON(X.pull.right), correct: true },
        { id: 'double', label: NEWTON(X.pull.double), hint: 'Only the weight pulls the bottom half down: 3.0 N.' },
        { id: 'zero', label: '0 N: the spring is in one piece', hint: 'Then nothing would hold the bottom half and the weight up.' },
      ],
      why: 'The bottom half and the weight are at rest, so T balances W: 3.0 N. Every part of a hanging spring carries the whole load.',
    },
    {
      id: 'half',
      kind: 'choice',
      prompt: 'A paint mark sits on the middle coil. How far has the bottom half of the spring stretched?',
      fig: spring({ springs: [whole({ name: 'SPRING', mark: true })], panel: 'halves', ask: { row: 'half', col: 0, hide: 'afterCheck' } }),
      options: [
        { id: 'quarter', label: CM(X.half.quarter), hint: 'Read the ruler: the end moved 6.0 cm, the mark 3.0 cm.' },
        { id: 'right', label: CM(X.half.right), correct: true },
        { id: 'whole', label: CM(X.half.whole), hint: 'That is the whole spring. The top half took some of it.' },
        { id: 'length', label: CM(X.half.length), hint: 'That is the bottom half’s length, 16.0 − 8.0. Take away its 5.0 cm.' },
      ],
      why: 'The bottom half went from 5.0 cm long (10.0 − 5.0) to 8.0 cm (16.0 − 8.0): 3.0 cm. Each half carries 3.0 N and stretches 3.0 cm.',
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: 'Back to Lena’s cut spring. What is the stiffness of one half on its own?',
      fig: spring({ springs: [whole({ name: 'WHOLE' }), half({ hung: 'afterCheck' })], rows: ['load', 'ext', 'k'] }),
      options: [
        { id: 'same', label: `${NM(X.puzzle.same)}: the same steel`, hint: 'The same 3.0 N stretches the half only 3.0 cm.' },
        { id: 'halved', label: NM(X.puzzle.halved), hint: 'Half the coils stretch less, not more. Less stretch means stiffer.' },
        { id: 'right', label: NM(X.puzzle.k), correct: true },
        { id: 'four', label: NM(X.puzzle.four), hint: 'Half the coils, half the extension: twice as stiff, not 4 times.' },
      ],
      why: `The half carries 3.0 N with only half the coils, so it stretches ${CM(X.puzzle.x)}. k = 3.0 ÷ 0.030 = ${NM(X.puzzle.k)}: twice as stiff.`,
    },
    {
      id: 'lines',
      kind: 'tapFig',
      prompt: 'Line C is the force–extension graph of the whole spring. Which line belongs to one half?',
      instruction: 'Tap the letter of the line for one half.',
      fig: spring({ view: 'lines', springs: [], lines: [{ id: 'A', k: 4 * k }, { id: 'B', k: kHalf }, { id: 'C', k }, { id: 'D', k: k / 2 }] }),
      options: [
        { id: 'A', label: 'Line A', hint: 'A is 4 times as steep as C. The half is only twice as stiff.' },
        { id: 'B', label: 'Line B', correct: true },
        { id: 'C', label: 'Line C', hint: 'C is the whole spring. The half stretches less for each newton.' },
        { id: 'D', label: 'Line D', hint: 'D is less steep: a weaker spring. The half is stiffer.' },
      ],
      why: `The gradient is the stiffness. One half is ${NM(kHalf)}, twice as steep as C: 6.0 N stretches it only 6.0 cm.`,
    },
    {
      id: 'object',
      kind: 'text',
      body: [
        'So k belongs to the **object**, not just the material: a shorter spring, or a thicker wire, is stiffer. To compare materials we need stress and strain, next lesson.',
        'Squash a spring and the same law holds: ΔF = kΔx, with Δx the **compression**, how much shorter it gets.',
      ],
    },
    {
      id: 'rules',
      kind: 'text',
      body: [
        "**Hooke's law**: ΔF = kΔx. Use the extension, in metres, never the length. The gradient of a force–extension graph is k.",
        'It holds only up to the **limit of proportionality**. Stretch further and the line bends: more on that in two lessons.',
      ],
    },
  ],
  skillCheck: [
    {
      id: 'parallel',
      kind: 'choice',
      prompt: 'Lena hangs the 3.0 N weight from both halves side by side, sharing it equally. How far does each half stretch?',
      options: [
        { id: 'quarter', label: CM(X.parallel.quarter) },
        { id: 'right', label: CM(X.parallel.right), correct: true },
        { id: 'oneHalf', label: CM(X.parallel.oneHalf) },
        { id: 'whole', label: CM(X.parallel.whole) },
      ],
      why: `Each half carries 1.5 N and has k = ${NM(kHalf)}: Δx = 1.5 ÷ ${sig(kHalf)} = 0.015 m = ${CM(X.parallel.right)}.`,
    },
    {
      id: 'pair',
      kind: 'choice',
      prompt: 'A spring is 15.0 cm long holding 2.0 N, and 22.5 cm long holding 5.0 N. What is its stiffness?',
      options: [
        { id: 'oneLoad', label: NM(X.pair.oneLoad) },
        { id: 'length', label: NM(X.pair.length) },
        { id: 'right', label: NM(X.pair.right), correct: true },
        { id: 'cm', label: NM(X.pair.cm) },
      ],
      why: `ΔF = 5.0 − 2.0 = 3.0 N, Δx = 22.5 − 15.0 = 7.5 cm = 0.075 m. k = 3.0 ÷ 0.075 = ${NM(X.pair.right)}.`,
    },
    {
      id: 'launcher',
      kind: 'choice',
      prompt: `A toy launcher's spring, stiffness ${LAUNCHER.k} N m⁻¹, is 8.0 cm long. What force squashes it to 5.0 cm long?`,
      options: [
        { id: 'newLength', label: NEWTON(X.launcher.newLength) },
        { id: 'right', label: NEWTON(X.launcher.right), correct: true },
        { id: 'oldLength', label: NEWTON(X.launcher.oldLength) },
        { id: 'cm', label: `${fixed(X.launcher.cm, 0)} N` },
      ],
      why: `The compression is 8.0 − 5.0 = 3.0 cm = 0.030 m. F = kΔx = ${LAUNCHER.k} × 0.030 = ${NEWTON(X.launcher.right)}.`,
    },
    {
      id: 'coils',
      kind: 'choice',
      prompt: 'Springs P and Q are wound from the same wire, with coils the same size. P has 30 coils, Q has 10. Which is true?',
      options: [
        { id: 'P', label: 'P is 3 times as stiff: it has more metal' },
        { id: 'same', label: 'They are equally stiff: same wire, same coils' },
        { id: 'right', label: 'Q is 3 times as stiff', correct: true },
        { id: 'Qfar', label: 'Q stretches 3 times as far under the same load' },
      ],
      why: 'Each coil carries the whole load and stretches the same. P has 3 times the coils, so 3 times the extension: Q is 3 times as stiff.',
    },
  ],
  youCanNow: [
    "Use Hooke's law, ΔF = kΔx, with the extension or compression",
    'Find a stiffness from two readings or from a graph’s gradient',
    'Explain why half a spring is twice as stiff',
  ],
  recap: {
    fig: spring({ springs: [whole({ name: 'WHOLE' }), half({ hung: true })], rows: ['load', 'ext', 'k'] }),
    text: `Every coil carries the whole 3.0 N. Half the coils, half the stretch: ${CM(xHalf)}, and twice the stiffness, ${NM(kHalf)}.`,
  },
  card: {
    formula: 'ΔF = kΔx',
    idea: 'Force grows in step with extension, up to a limit. k belongs to the object: half a spring is twice as stiff.',
  },
};
