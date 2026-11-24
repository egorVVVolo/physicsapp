// Lesson "Hooke's law" — ΔF = kΔx with the extension (not the length), the stiffness k of an object, the
// force–extension graph, and compression (WPH11 point 27). The puzzle: a spring stretches 6.0 cm under a 3.0 N weight.
// Cut it in half and hang the same weight on one half: how far does it stretch? Only 3.0 cm. Every part of a hanging
// spring carries the whole load, so every coil stretches the same; half the coils, half the extension. The half is
// twice as stiff: stiffness belongs to the object, not the material.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
// Format v3 (V2 task D11): build, graphPick, estimate, spotError; the Skill check ends on an exam-style card.
import { fixed, sig } from '../physics/format.ts';
import { cutStiffness, extensionFor, hookeForce, parallelStiffness, stiffness, stiffnessFromPair } from '../physics/springs.ts';
import type { Lesson, PlotFig, SpringFig, SpringHang } from './types.ts';

const NB = ' '; // a no-break space: a number never parts from its unit
const NM = (k: number): string => `${sig(k)}${NB}N${NB}m⁻¹`;
const CM = (x: number): string => `${fixed(x * 100, 1)}${NB}cm`;
const MT = (x: number): string => `${fixed(x, 3)}${NB}m`;
const NEWTON = (F: number): string => `${fixed(F, 1)}${NB}N`;

export const SPRING = { L0: 0.1, W: 3.0, stretched: 0.16 }; // m, N, m: the spring with no load and with the weight
export const EXPLORE = { max: 6 }; // N, the slider
export const PLOT = { xMax: 12, FMax: 6 }; // cm, N: the axes of the force–extension graphs
// Skill check.
export const PAIR = { F1: 2.0, L1: 0.15, F2: 5.0, L2: 0.225 }; // N, m
export const LAUNCHER = { k: 400, L0: 0.08, L: 0.05 }; // N m⁻¹, m, m
export const COILS = { P: 30, Q: 10 };

const dx = SPRING.stretched - SPRING.L0;
const k = stiffness(SPRING.W, dx);
const kHalf = cutStiffness(k, 0.5);
const xHalf = extensionFor(SPRING.W, kHalf);
const pairDF = PAIR.F2 - PAIR.F1;
const pairDx = PAIR.L2 - PAIR.L1;
const sideBySide = extensionFor(SPRING.W / 2, kHalf);

/** Answers and named mistakes, used by the screens and re-checked by hookes-law.test.ts. */
export const ANSWERS = {
  /** The stiffness from the 3.0 N weight: Δx, not the length; metres, not cm. */
  k: { right: k, length: SPRING.W / SPRING.stretched, cm: SPRING.W / (dx * 100), dx },
  /** The pull of the top half on the bottom half: the whole load. */
  pull: { right: SPRING.W, half: SPRING.W / 2, double: 2 * SPRING.W },
  /** How far the bottom half has stretched: half the extension. */
  half: { right: dx / 2, whole: dx },
  /** The puzzle: one half on its own. */
  puzzle: { x: xHalf, k: kHalf, same: k, whole: dx },
  pair: { right: stiffnessFromPair(PAIR.F1, PAIR.L1, PAIR.F2, PAIR.L2), dF: pairDF, dx: pairDx, cm: stiffnessFromPair(PAIR.F1, PAIR.L1 * 100, PAIR.F2, PAIR.L2 * 100) },
  launcher: { right: hookeForce(LAUNCHER.k, LAUNCHER.L0 - LAUNCHER.L), newLength: hookeForce(LAUNCHER.k, LAUNCHER.L), oldLength: hookeForce(LAUNCHER.k, LAUNCHER.L0) },
  /** Both halves side by side share the 3.0 N: each stretches 1.5 cm, and together they are twice as stiff as one half. */
  parallel: { x: sideBySide, k: parallelStiffness(kHalf, kHalf), eachLoad: SPRING.W / 2 },
  /** Exam part (b): the stiffness of the pair, from the whole load and the common extension. */
  pairK: stiffness(SPRING.W, sideBySide),
  coils: { ratio: COILS.P / COILS.Q },
};
const X = ANSWERS;

const whole = (over: Partial<SpringHang> = {}): SpringHang => ({ part: 1, load: SPRING.W, name: 'WHOLE', hung: true, ...over });
const half = (over: Partial<SpringHang> = {}): SpringHang => ({ part: 0.5, load: SPRING.W, name: 'HALF', ...over });
const spring = (over: Partial<SpringFig>): SpringFig => ({ kind: 'spring', L0: SPRING.L0, k, springs: [whole()], panel: 'readings', ...over });
const pairFig = (over: Partial<SpringFig> = {}): SpringFig =>
  spring({ springs: [whole({ load: 0, name: 'NO LOAD', hung: undefined }), whole({ name: 'LOADED' })], rows: ['load', 'length'], ...over });

/** The force–extension line of a spring of stiffness kk (N m⁻¹): a straight line from the origin to the edge of the axes. */
const lineGraph = (kk: number): PlotFig => {
  const xEnd = Math.min(PLOT.xMax, (PLOT.FMax / kk) * 100); // cm
  return {
    kind: 'plot',
    header: 'force against extension',
    x: { label: 'Δx / cm', max: PLOT.xMax, tick: 2 },
    y: { label: 'F / N', max: PLOT.FMax, tick: 1 },
    points: [{ x: 0, y: 0 }, { x: xEnd, y: (kk * xEnd) / 100 }],
  };
};

export const hookesLaw: Lesson = {
  id: 'hooke',
  title: "Hooke's law",
  spec: [27],
  minutes: 10,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: "Hooke's law", from: 'law' },
    { title: 'Back to the spring', from: 'hook-again' },
  ],
  cast: ['Lena', 'Aisha'],
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
        { id: 'unsure', label: "I'm not sure" },
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
      kind: 'build',
      prompt: 'The 3.0 N weight stretches the spring from 10.0 cm to 16.0 cm. Build its stiffness.',
      fig: pairFig({ rows: ['load', 'length', 'k'], ask: { row: 'k', col: 1, hide: 'afterCheck' } }),
      equation: 'k = {ΔF} ÷ {Δx}',
      boxes: { 'ΔF': 'force', 'Δx': 'ext' },
      chips: [
        { id: 'force', label: NEWTON(SPRING.W) },
        { id: 'ext', label: MT(dx) },
        { id: 'length', label: `${fixed(SPRING.stretched * 100, 1)}${NB}cm`, hint: 'That is the length, not the extension. Δx is the new length minus the old.' },
        { id: 'cm', label: `${fixed(dx * 100, 1)}${NB}cm`, hint: 'Right size, wrong unit: in N m⁻¹ the extension is in metres, 0.060 m.' },
      ],
      result: { symbol: 'k', value: X.k.right, unit: 'N m⁻¹' },
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
      kind: 'estimate',
      prompt: 'A paint mark sits on the middle coil. The end of the spring moves down 6.0 cm. Drag to how far the mark moves down.',
      fig: spring({ springs: [whole({ name: 'SPRING', mark: true, hung: undefined })], rows: ['load', 'length'] }),
      after: spring({ springs: [whole({ name: 'SPRING', mark: true })], panel: 'halves' }),
      scale: { min: 0, max: 8, step: 0.5, tick: 1, unit: 'cm', symbol: 'x', dp: 1, label: 'How far the mark moves' },
      answer: X.half.right * 100,
      tolerance: 0.5,
      why: 'The bottom half went from 5.0 cm long to 8.0 cm: 3.0 cm. Each half carries 3.0 N and stretches 3.0 cm.',
    },
    {
      id: 'hook-again',
      kind: 'build',
      prompt: 'Back to Lena’s cut spring. The 3.0 N weight stretches one half 3.0 cm. Build the stiffness of one half on its own.',
      fig: spring({ springs: [whole({ name: 'WHOLE' }), half({ hung: 'afterCheck' })], rows: ['load', 'ext', 'k'] }),
      equation: 'k = {ΔF} ÷ {Δx}',
      boxes: { 'ΔF': 'force', 'Δx': 'ext' },
      chips: [
        { id: 'force', label: NEWTON(SPRING.W) },
        { id: 'ext', label: MT(X.puzzle.x) },
        { id: 'whole', label: MT(dx), hint: 'That is the whole spring’s extension. The half stretches only 0.030 m.' },
        { id: 'cm', label: `${fixed(X.puzzle.x * 100, 1)}${NB}cm`, hint: 'Right size, wrong unit: in N m⁻¹ the extension is in metres.' },
      ],
      result: { symbol: 'k', value: X.puzzle.k, unit: 'N m⁻¹' },
      why: `The half carries 3.0 N with only half the coils, so it stretches ${CM(X.puzzle.x)}. k = 3.0 ÷ 0.030 = ${NM(X.puzzle.k)}: twice as stiff.`,
    },
    {
      id: 'lines',
      kind: 'graphPick',
      prompt: 'The whole spring is 50 N m⁻¹. Which force–extension graph belongs to one half of it?',
      graphs: [
        { id: 'A', fig: lineGraph(k / 2), hint: 'This line is less steep than the whole spring’s: a weaker spring. The half is stiffer.' },
        { id: 'B', fig: lineGraph(k), hint: 'That is the whole spring’s own line: the half is stiffer.' },
        { id: 'C', fig: lineGraph(kHalf), correct: true },
      ],
      why: `The gradient is the stiffness. One half is ${NM(kHalf)}, twice as steep as the whole spring’s line: 6.0 N stretches it only 6.0 cm.`,
    },
    {
      id: 'error',
      kind: 'spotError',
      prompt: 'Aisha works out the stiffness of the spring from the 3.0 N reading. One line is wrong. Which?',
      fig: pairFig(),
      lines: [
        { id: 'read', text: 'The weight is 3.0 N, and the spring is now 16.0 cm long', hint: 'That line is right: it is what the ruler shows.' },
        { id: 'law', text: 'Hooke’s law: ΔF = kΔx, so k = ΔF ÷ Δx', hint: 'That is the right rearrangement.' },
        { id: 'ext', text: 'Δx = 16.0 cm = 0.160 m', wrong: true, fix: 'Δx = 16.0 − 10.0 = 6.0 cm = 0.060 m' },
        { id: 'k', text: `k = 3.0 ÷ 0.160 = ${NM(X.k.length)}`, hint: 'This follows from the line above. Check the Δx put in.' },
      ],
      why: `Δx is the extension, the new length minus the length with no load: 6.0 cm. 16.0 cm is the length. k = 3.0 ÷ 0.060 = ${NM(X.k.right)}.`,
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
      body: ["ΔF = kΔx, with the extension in metres. The gradient of a force–extension graph is k."],
      fig: spring({ springs: [whole({ name: 'WHOLE' }), half({ hung: true })], rows: ['load', 'ext', 'k'] }),
    },
  ],
  skillCheck: [
    {
      id: 'launcher',
      kind: 'build',
      prompt: `A toy launcher’s spring, stiffness ${LAUNCHER.k} N m⁻¹, is 8.0 cm long. Build the force that squashes it to 5.0 cm long.`,
      equation: 'F = {k} × {Δx}',
      boxes: { k: 'stiff', 'Δx': 'compress' },
      chips: [
        { id: 'stiff', label: `${LAUNCHER.k}${NB}N${NB}m⁻¹` },
        { id: 'compress', label: MT(LAUNCHER.L0 - LAUNCHER.L) },
        { id: 'newLength', label: MT(LAUNCHER.L), hint: 'That is the squashed length. The compression is how much shorter it gets.' },
        { id: 'oldLength', label: MT(LAUNCHER.L0), hint: 'That is the natural length. Δx is the change: 8.0 − 5.0 cm.' },
      ],
      result: { symbol: 'F', value: X.launcher.right, unit: 'N' },
      why: `The compression is 8.0 − 5.0 = 3.0 cm = 0.030 m. F = kΔx = ${LAUNCHER.k} × 0.030 = ${NEWTON(X.launcher.right)}.`,
    },
    {
      id: 'pair-error',
      kind: 'spotError',
      prompt: 'A spring is 15.0 cm long holding 2.0 N, and 22.5 cm long holding 5.0 N. Aisha finds its stiffness. One line is wrong. Which?',
      lines: [
        { id: 'dF', text: 'ΔF = 5.0 − 2.0 = 3.0 N', hint: 'That line is right: the change in force.' },
        { id: 'dx', text: 'Δx = 22.5 − 15.0 = 7.5 cm', hint: 'That line is right: the change in length.' },
        { id: 'k', text: 'k = 3.0 ÷ 7.5 = 0.40 N m⁻¹', wrong: true, fix: 'Δx = 0.075 m, so k = 3.0 ÷ 0.075 = 40 N m⁻¹' },
        { id: 'soft', text: 'So the spring is very soft', hint: 'This follows from the line above. Check the unit of Δx.' },
      ],
      why: `The stiffness is in N m⁻¹, so Δx must be in metres: 7.5 cm = 0.075 m. k = 3.0 ÷ 0.075 = ${NM(X.pair.right)}.`,
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
    {
      id: 'side-by-side',
      kind: 'examCard',
      context: 'Lena hangs a 3.0 N weight from both halves of the cut spring side by side, sharing it equally. Each half has a stiffness of 100 N m⁻¹.',
      parts: [
        {
          id: 'a',
          command: 'Calculate',
          text: 'the extension of each half.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 'Δx = {F} ÷ {k}',
            boxes: { F: 'load', k: 'stiff' },
            chips: [
              { id: 'load', label: NEWTON(X.parallel.eachLoad) },
              { id: 'stiff', label: `${sig(kHalf)}${NB}N${NB}m⁻¹` },
              { id: 'whole', label: NEWTON(SPRING.W), hint: 'Each half carries half the weight: 1.5 N.' },
            ],
            result: { symbol: 'Δx', value: X.parallel.x * 100, unit: 'cm' },
          },
          why: `Each half carries 1.5 N: Δx = ΔF ÷ k = 1.5 ÷ ${sig(kHalf)} = ${fixed(X.parallel.x, 3)} m = ${CM(X.parallel.x)}. One mark for the 1.5 N, one for the answer.`,
        },
        {
          id: 'b',
          command: 'Calculate',
          text: 'the stiffness of the pair together.',
          marks: 1,
          kind: 'build',
          build: {
            equation: 'k = {ΔF} ÷ {Δx}',
            boxes: { 'ΔF': 'load', 'Δx': 'ext' },
            chips: [
              { id: 'load', label: NEWTON(SPRING.W) },
              { id: 'ext', label: MT(X.parallel.x) },
              { id: 'each', label: NEWTON(X.parallel.eachLoad), hint: 'The pair together holds the whole 3.0 N.' },
            ],
            result: { symbol: 'k', value: X.pairK, unit: 'N m⁻¹' },
          },
          why: `Together they hold 3.0 N and stretch ${CM(X.parallel.x)}: k = 3.0 ÷ ${fixed(X.parallel.x, 3)} = ${NM(X.pairK)}, twice as stiff as one half.`,
        },
      ],
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
