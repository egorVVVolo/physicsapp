// Lesson 4, "Up, stop, down": a sandbag released from a rising hot-air balloon.
// Every number in the text is computed from the givens below through src/physics.
// Lesson flow: idea, question, idea, question ... then spot-the-error and an exam-format step.
// Each question screen: a full natural question (what is asked) + an instruction (how to answer).
// Text limits (checked by l4.test.ts): question ≤ 58, instruction ≤ 44, idea line ≤ 70, feedback ≤ 45, caption ≤ 38.
import {
  G,
  initialVelocityFor,
  motionStop,
  position,
  timeAtRest,
  timesForDisplacement,
  timeToReach,
  velocity,
  type Motion,
} from '../physics/kinematics.ts';
import { fixed, signed } from '../physics/format.ts';
import type { ClockEvent } from '../scene/clockStep.ts';
import type { AccDir, BuildStep, IdeaStep, Lesson, Playback, PredictStep, SceneSetup, SpotErrorStep, StrobeStep, Values } from './types.ts';

const WORLD_TOP = 34; // m on the ruler: the climb to about 27 m must be clearly visible
const MS = 'm\u00A0s⁻¹'; // non-breaking space: the unit never splits across lines
const MS2 = 'm\u00A0s⁻²';
const gText = `${fixed(G, 2)} ${MS2}`;

/** The givens of one balloon task and everything the model says about it. */
export function world(h0: number, vb: number) {
  const real: Motion = { s0: h0, u: vb, a: -G }; // the sandbag, from the release
  const tTop = timeAtRest(real)!;
  const tLand = timeToReach(0, real)!;
  const speed = `${fixed(vb, 1)} ${MS}`;
  const scene: SceneSetup = {
    body: real,
    carrier: { s0: h0, u: vb, a: 0 }, // the balloon keeps its speed
    worldTop: WORLD_TOP,
    description: `A hot-air balloon climbs at ${speed}. A sandbag hangs from it, ${fixed(h0, 0)} metres above the ground.`,
  };
  return {
    h0,
    vb,
    real,
    scene,
    speed,
    tTop,
    hTop: position(tTop, real),
    tBack: timeToReach(h0, real)!,
    tLand,
    vLand: velocity(tLand, real),
    roots: timesForDisplacement(-h0, vb, -G), // [landing, the one before the release]
  };
}
type World = ReturnType<typeof world>;

export const W = world(20, 12);

/** The real sandbag as it plays until `endT`. */
const real = (w: World, endT: number) => ({ real: { motion: w.real, from: 0, end: endT }, realLabel: 'real' });

// ── Idea 1: the sandbag leaves at the balloon's speed ────────────────────────────────────

export const ideaRelease: IdeaStep = {
  id: 'idea-release',
  type: 'idea',
  question: 'It leaves at the balloon’s speed',
  line: 'The sandbag was rising with the balloon, so it keeps rising.',
  scene: W.scene,
  highlight: 'u',
  playback: {
    events: [{ t: W.tTop, id: 'top' }, { t: W.tTop + 0.6, id: 'after', end: true }],
    captions: {
      top: `It rose ${fixed(W.hTop - W.h0, 1)} m after the release`,
      after: 'Then it falls back down',
    },
    endT: W.tTop + 0.6,
    ...real(W, W.tTop + 0.6),
    companion: null,
    showAcc: false,
  },
};

// ── 1. Hook: what is the velocity at the instant of release? ─────────────────────────────

const hookU: Record<string, number> = { zero: 0, up: W.vb, down: -W.vb };

export const hook: PredictStep = {
  id: 'hook',
  type: 'predict',
  question: 'The sandbag is let go. How is it moving at that instant?',
  instruction: 'Drag the arrow on the sandbag up or down',
  scene: W.scene,
  input: 'vector', // the arrow snaps to the options' preview values: 0, +12 or −12
  options: [
    { id: 'zero', label: `0 ${MS}`, misconception: 'K-RELEASE-REST', feedback: 'Not from rest: it rises with the balloon.' },
    { id: 'up', label: `${W.speed} up`, correct: true, feedback: `Same as the balloon: ${W.speed} up.` },
    { id: 'down', label: `${W.speed} down`, misconception: 'K-RELEASE-REST', feedback: 'Letting go changes forces, not velocity.' },
  ],
  // The chosen velocity shows as an arrow on the sandbag before it is let go.
  preview: (optionId) => hookU[optionId] ?? null,
  // A wrong answer plays as a ghost; the right one is compared with "from rest".
  // It stops when the ghost lands, long before the real landing, so the build step stays open.
  playbackFor(optionId) {
    const correct = optionId === 'up';
    const ghost: Motion = { s0: W.h0, u: correct ? 0 : hookU[optionId], a: -G };
    const endT = timeToReach(0, ghost)!;
    const stillUp = fixed(position(endT, W.real), 1);
    const events: ClockEvent[] = [];
    if (endT > W.tTop + 0.3) events.push({ t: W.tTop, id: 'top' }); // the ghost is still falling, the real one turns
    events.push({ t: endT, id: 'ghostLand', end: true });
    return {
      events,
      endT,
      captions: {
        top: `It rose ${fixed(W.hTop - W.h0, 1)} m first`,
        ghostLand: `${correct ? 'From rest it lands' : 'Yours lands'}. Real: ${stillUp} m high`,
      },
      ...real(W, endT),
      companion: { track: { motion: ghost, from: 0, end: endT }, label: correct ? 'from rest' : 'your answer', kind: 'ghost' },
      showAcc: false, // the a arrow would answer the next question
    };
  },
};

// ── Idea 2: gravity never switches off ───────────────────────────────────────────────────

export const ideaGravity: IdeaStep = {
  id: 'idea-gravity',
  type: 'idea',
  question: 'Gravity never switches off',
  line: `Once released, only gravity acts: ${gText} down, all the way.`,
  scene: W.scene,
  sign: true,
  highlight: 'a',
  playback: {
    events: [{ t: W.tTop, id: 'top' }, { t: W.tTop + 0.6, id: 'after', end: true }], // ends before the return
    captions: {
      top: 'At the top v = 0, but a is still g',
      after: 'Same a before, at and after the top',
    },
    endT: W.tTop + 0.6,
    ...real(W, W.tTop + 0.6),
    companion: null,
    showAcc: true,
  },
};

// ── 2. Acceleration at three moments: rising, top, falling (strobe) ──────────────────────
// Setting one arrow per frame shows the idea "a never changes" far better than one question
// about the top: a learner who thinks "a follows the motion" sets different arrows and sees it.

const tRise = 0.6;
const tFall = 2 * W.tTop - tRise; // the same height as the rising frame: the flight is symmetric

export const accTop: StrobeStep = {
  id: 'acc-top',
  type: 'strobe',
  question: 'What is its acceleration rising, at the top and falling?',
  instruction: 'Tap each circle to turn its arrow',
  scene: W.scene,
  sign: true,
  frames: [
    { id: 'rise', t: tRise, label: 'rising' },
    { id: 'top', t: W.tTop, label: 'top' },
    { id: 'fall', t: tFall, label: 'falling' },
  ],
  feedback: {
    right: `The same every time: ${gText} down.`,
    zeroTop: 'v is 0 at the top for an instant; a is not.',
    followsMotion: 'a follows gravity, not the motion.',
    other: 'Only gravity acts, so a never changes.',
  },
  misconceptions: { zeroTop: 'K-TOP-ZERO-A', followsMotion: 'K-ACC-DIR' },
  playbackFor(answers: Record<string, AccDir>) {
    const endT = tFall + 0.15; // ends long before the landing
    const hang: Motion = { s0: W.hTop, u: 0, a: 0 }; // what "a = 0 at the top" would do
    const speedsUp: Motion = { s0: W.h0, u: W.vb, a: G }; // what "a points up while rising" would do
    const companion =
      answers.top === 'zero'
        ? { track: { motion: hang, from: W.tTop, end: endT }, label: 'your a = 0', kind: 'ghost' as const }
        : answers.rise === 'up'
          ? { track: { motion: speedsUp, from: 0, end: Math.min(timeToReach(WORLD_TOP, speedsUp)!, endT) }, label: 'your answer', kind: 'ghost' as const }
          : null;
    return {
      events: [
        { t: tRise, id: 'rise' },
        { t: W.tTop, id: 'top' },
        { t: tFall, id: 'fall' },
        { t: endT, id: 'end', end: true },
      ],
      endT,
      captions: {
        rise: 'Rising: v up, a down',
        top: 'Top: v = 0, a still down',
        fall: 'Falling: v down, a down',
        end: 'One a for the whole flight',
      },
      ...real(W, endT),
      companion,
      showAcc: true,
    };
  },
};

// ── Idea 3: pick a sign, keep it ─────────────────────────────────────────────────────────

export const ideaSign: IdeaStep = {
  id: 'idea-sign',
  type: 'idea',
  question: 'Pick a sign, keep it',
  line: 'Up is positive: s, u and a each get a sign, and keep it all the way.',
  scene: W.scene,
  sign: true,
  highlight: 's',
  playback: {
    events: [{ t: W.tTop, id: 'top' }, { t: W.tBack, id: 'back', end: true }],
    captions: {
      top: `Above the release: s = ${signed(W.hTop - W.h0, 1)} m`,
      back: 'Back at s = 0. Falling: v is negative',
    },
    endT: W.tBack,
    ...real(W, W.tBack),
    companion: null,
    showAcc: false,
  },
};

// ── 3. The trap problem: time to the ground with one equation for the whole flight ───────

function buildTime(w: World, id: string): BuildStep {
  const { h0, vb } = w;
  const [tLand, tBefore] = w.roots;
  const m = (x: number) => `${signed(x, 0)} m`;
  const v = (x: number) => (x === 0 ? '0' : `${signed(x, 1)} ${MS}`);
  const a = (x: number) => (x === 0 ? `0 ${MS2}` : `${signed(x, 2)} ${MS2}`);
  return {
    id,
    type: 'build',
    question: 'How long after the release does it hit the ground?',
    scene: w.scene,
    sign: true,
    goal: 'Find: t to hit the ground',
    unknown: 't',
    known: ['s', 'u', 'a'],
    relationPrompt: 'You know s, u and a. Which equation gives t?',
    relationInstruction: 'Tap the equation you would use',
    // The right one (sut) sits in the middle here; the exam step puts it first.
    relations: [
      { id: 'vuat', misconception: 'K-SUVAT-PICK', feedback: 'No v is given: it needs two stages.' },
      { id: 'sut', feedback: 'It has t, and all the rest are known.' },
      { id: 'v2as', misconception: 'K-SUVAT-PICK', feedback: 'It has no t in it.' },
    ],
    template: [{ q: 's' }, ' = ', { q: 'u' }, ' t + ½ ', { q: 'a' }, ' t²'],
    slots: [
      {
        quantity: 's',
        correct: -h0,
        prompt: 'Where is the ground, measured from the release point?',
        instruction: 'Drag the s handle up or down',
        highlight: 's',
        input: 'displacement',
        chips: [
          { value: h0, label: m(h0), misconception: 'K-SIGN-CONV', feedback: `The ground is below: s = ${m(-h0)}.` },
          { value: -h0, label: m(-h0) },
        ],
      },
      {
        quantity: 'u',
        correct: vb,
        prompt: 'What is u, its velocity at the release?',
        instruction: 'Drag the arrow on the sandbag up or down',
        highlight: 'u',
        input: 'vector',
        chips: [
          { value: 0, label: v(0), misconception: 'K-RELEASE-REST', feedback: `It leaves with the balloon: ${v(vb)}.` },
          { value: vb, label: v(vb) },
          { value: -vb, label: v(-vb), misconception: 'K-SPEED-VEL', feedback: `At the release it moves up: u = ${v(vb)}.` },
        ],
      },
      {
        quantity: 'a',
        correct: -G,
        prompt: 'What is a, its acceleration after the release?',
        instruction: 'Tap the circle to turn the a arrow',
        highlight: 'a',
        input: 'flip',
        chips: [
          { value: -G, label: a(-G) },
          { value: G, label: a(G), misconception: 'K-SIGN-CONV', feedback: `Gravity pulls down: a = ${a(-G)}.` },
          { value: 0, label: a(0), misconception: 'K-TOP-ZERO-A', feedback: 'Gravity never switches off: a is not 0.' },
        ],
      },
    ],
    solved: `t = ${fixed(tLand, 2)} s  or  t = ${fixed(tBefore, 2)} s`,
    final: {
      prompt: 'Two times solve it. Which one is the landing?',
      instruction: 'Tap a time on the line',
      input: 'timeline',
      choices: [
        { id: 'before', label: `${fixed(tBefore, 2)} s`, value: tBefore, misconception: 'K-ROOT-PICK', feedback: 'A negative t is before the release.' },
        { id: 'land', label: `${fixed(tLand, 2)} s`, value: tLand, correct: true, feedback: `After the release, so t = ${fixed(tLand, 2)} s.` },
      ],
    },
    methodHint: 'Known: s, u, a. Up is +, so check signs.',
    worked: [
      'Up is +. Measure s from the release point.',
      `The ground is ${fixed(h0, 0)} m below: s = ${m(-h0)}.`,
      `It leaves with the balloon: u = ${v(vb)}.`,
      `Gravity pulls down all the way: a = ${a(-G)}.`,
      `s = ut + ½at² gives t = ${fixed(tLand, 2)} s or ${fixed(tBefore, 2)} s.`,
      `After the release t > 0, so t = ${fixed(tLand, 2)} s.`,
    ],
    // The wrong numbers describe some other motion. Play that motion next to the real one.
    // It always stops well before the real landing and never states the real landing time.
    wrongPlayback(values: Values): Playback {
      const ghost: Motion = { s0: h0, u: values.u ?? vb, a: values.a ?? -G };
      const sValue = values.s ?? -h0;
      const target = h0 + sValue;
      const stop = motionStop(ghost, target, WORLD_TOP);
      const hStop = position(stop.t, ghost);
      const realH = fixed(position(stop.t, w.real), 1);
      const at = fixed(stop.t, 2);
      let caption: string;
      if (stop.why === 'target') {
        caption = target === 0 ? `Lands at ${at} s. Real: ${realH} m high` : `Yours gets to ${m(sValue)} at ${at} s`;
      } else if (stop.why === 'offTop') {
        caption = 'Yours leaves the frame. No landing.';
      } else if (stop.why === 'apex') {
        if (ghost.u === 0 && ghost.a === 0) caption = 'Yours never moves: u = 0 and a = 0';
        else if (target > h0) caption = `Peaks at ${signed(hStop - h0, 1)} m: never reaches ${m(sValue)}`;
        else caption = `Yours turns at ${fixed(hStop, 1)} m high.`;
      } else {
        caption = `Yours falls. It never gets to ${m(sValue)}`;
      }
      return {
        events: [{ t: stop.t, id: 'stop', end: true }],
        endT: stop.t,
        captions: { stop: caption },
        ...real(w, stop.t),
        companion: { track: { motion: ghost, from: 0, end: stop.t }, label: 'your values', kind: 'ghost' },
        showAcc: true,
      };
    },
    donePlayback(): Playback {
      return {
        events: [{ t: w.tTop, id: 'top' }, { t: w.tBack, id: 'back' }, { t: w.tLand, id: 'land', end: true }],
        endT: w.tLand,
        captions: {
          top: `Top: s = ${signed(w.hTop - h0, 1)} m, v = 0`,
          back: 's = 0 again. Nothing restarted',
          land: `Ground: s = ${m(-h0)} at ${fixed(w.tLand, 2)} s`,
        },
        ...real(w, w.tLand),
        companion: null,
        showAcc: true,
      };
    },
  };
}

export const W2 = world(15, 9); // the same problem with new values, used after a reveal
export const build: BuildStep = { ...buildTime(W, 'build'), retry: buildTime(W2, 'build-retry') };

// ── 4. Spot the error: a square root with the wrong sign ─────────────────────────────────

const v2 = W.vb ** 2 + 2 * -G * -W.h0; // v² at the ground
const vUp = Math.sqrt(v2); // the student's (wrong) positive root
export const studentT = (vUp - W.vb) / -G; // what the wrong sign leads to

export const spotError: SpotErrorStep = {
  id: 'spot-error',
  type: 'spot-error',
  question: `A student got t = ${fixed(studentT, 2)} s. Which value is wrong?`,
  instruction: 'Tap the wrong arrow or value on the scene',
  scene: W.scene,
  sign: true,
  misconception: 'K-SPEED-VEL',
  working: `v² = ${fixed(v2, 0)}, v = ${signed(vUp, 1)}, so t = ${fixed(studentT, 2)} s`,
  // Each quantity of the working is drawn on the scene: s, u, a at the release, v at the ground, t on a clock tag.
  items: [
    { id: 's', kind: 's', label: `s = ${signed(-W.h0, 0)} m`, value: -W.h0, feedback: 'Fine: the ground is below, so s < 0.' },
    { id: 'u', kind: 'u', label: `u = ${signed(W.vb, 1)}`, value: W.vb, feedback: 'Fine: it leaves moving up.' },
    { id: 'a', kind: 'a', label: `a = ${signed(-G, 2)}`, value: -G, feedback: 'Fine: gravity pulls down.' },
    { id: 'v', kind: 'v', label: `v = ${signed(vUp, 1)}`, value: vUp, wrong: true, feedback: `√ gives ±${fixed(vUp, 1)}. Moving down: v = ${signed(W.vLand, 1)}` },
    { id: 't', kind: 't', label: `t = ${fixed(studentT, 2)} s`, value: studentT, feedback: 'That is the symptom. Find the cause.' },
  ],
  methodHint: 'Which way does it move at the ground?',
  worked: [
    `Lines 1 and 2 are right: v² = ${fixed(v2, 0)}.`,
    `v = ±${fixed(vUp, 1)} ${MS}. It moves down, so v = ${signed(W.vLand, 1)} ${MS}.`,
    `t = (v − u) / a = (${fixed(W.vLand, 1)} − ${fixed(W.vb, 1)}) / (${fixed(-G, 2)}) = ${fixed(W.tLand, 2)} s.`,
  ],
  playback() {
    return {
      events: [{ t: W.tLand, id: 'land', end: true }],
      endT: W.tLand,
      captions: { land: `Down at the ground: v = ${signed(W.vLand, 1)} ${MS}` },
      ...real(W, W.tLand),
      companion: null,
      showAcc: true,
    };
  },
};

// ── 5. Exam format: the sign of the answer is the answer ─────────────────────────────────

export const EXAM_H = 24; // m
export const EXAM_T = 3.0; // s
export const examU = initialVelocityFor(-EXAM_H, -G, EXAM_T);
const examBody: Motion = { s0: EXAM_H, u: examU, a: -G };
const examTop = timeAtRest(examBody)!;
const examSpeed = `${fixed(examU, 1)} ${MS}`;

export const exam: BuildStep = {
  id: 'exam',
  type: 'build',
  exam: { command: 'Determine', marks: 3 },
  question: 'the balloon’s velocity at release.', // the view shows "Determine" in bold in front of it
  scene: {
    body: examBody,
    carrier: { s0: EXAM_H, u: examU, a: 0 },
    worldTop: WORLD_TOP,
    description: `A hot-air balloon ${fixed(EXAM_H, 0)} metres above the ground carries a sandbag. Its velocity is not shown.`,
    secretCarrierSpeed: true, // the balloon's velocity arrow would give the answer away
  },
  sign: true,
  facts: [`lands after ${fixed(EXAM_T, 1)} s`],
  goal: 'Find: balloon’s u',
  unknown: 'u',
  known: ['s', 'a', 't'],
  relationPrompt: 'You know s, a and t. Which equation gives u?',
  relationInstruction: 'Tap the equation you would use',
  relations: [
    { id: 'sut', feedback: 'It has u, and all the rest are known.' },
    { id: 'vuat', misconception: 'K-SUVAT-PICK', feedback: 'v is unknown too: two unknowns.' },
    { id: 'v2as', misconception: 'K-SUVAT-PICK', feedback: 'No t in it, and u and v are unknown.' },
  ],
  template: [{ q: 's' }, ' = ', { q: 'u' }, ' ', { q: 't' }, ' + ½ ', { q: 'a' }, ' ', { q: 't' }, '²'],
  given: { quantity: 't', value: EXAM_T, label: `(${fixed(EXAM_T, 1)})` },
  slots: [
    {
      quantity: 's',
      correct: -EXAM_H,
      prompt: 'What is s, measured from the release point?',
      instruction: 'Tap a tile to put it into the equation',
      highlight: 's',
      input: 'tiles',
      chips: [
        { value: -EXAM_H, label: `${signed(-EXAM_H, 0)} m` },
        { value: EXAM_H, label: `${signed(EXAM_H, 0)} m`, misconception: 'K-SIGN-CONV', feedback: `The ground is below: s = ${signed(-EXAM_H, 0)} m.` },
      ],
    },
    {
      quantity: 'a',
      correct: -G,
      prompt: 'What is a, the sandbag’s acceleration?',
      instruction: 'Tap a tile to put it into the equation',
      highlight: 'a',
      input: 'tiles',
      chips: [
        { value: G, label: `${signed(G, 2)} ${MS2}`, misconception: 'K-SIGN-CONV', feedback: `Gravity pulls down: a = ${signed(-G, 2)} ${MS2}.` },
        { value: -G, label: `${signed(-G, 2)} ${MS2}` },
      ],
    },
  ],
  solved: `u = ${signed(examU, 1)} ${MS}`,
  final: {
    prompt: `u = ${signed(examU, 1)} ${MS}. Which way was the balloon moving?`,
    instruction: 'Tap climbing or descending',
    input: 'cards',
    choices: [
      { id: 'up', label: 'climbing', correct: true, feedback: `Positive is up: it was climbing at ${examSpeed}.` },
      { id: 'down', label: 'descending', misconception: 'K-SPEED-VEL', feedback: 'Up is +, so a positive u means moving up.' },
    ],
  },
  methodHint: 'Known: s, a, t. Up is +, so check signs.',
  worked: [
    `Up is +, s from the release: s = ${signed(-EXAM_H, 0)} m, a = ${signed(-G, 2)} ${MS2}, t = ${fixed(EXAM_T, 1)} s.`,
    `s = ut + ½at² gives u = ${signed(examU, 1)} ${MS}.`,
    `Positive is up: the balloon was climbing at ${examSpeed}.`,
  ],
  wrongPlayback: () => exam.donePlayback(),
  donePlayback() {
    return {
      events: [{ t: examTop, id: 'top' }, { t: EXAM_T, id: 'land', end: true }],
      endT: EXAM_T,
      captions: {
        top: `Top: ${fixed(position(examTop, examBody), 1)} m high. It rose first`,
        land: `Lands at ${fixed(EXAM_T, 1)} s: u = ${signed(examU, 1)} ${MS}`,
      },
      real: { motion: examBody, from: 0, end: EXAM_T },
      realLabel: 'real',
      companion: null,
      showAcc: true,
    };
  },
};

export const l4: Lesson = {
  id: 'kin-04-up-stop-down',
  number: 'L4',
  title: 'Up, stop, down',
  idea: 'At the top v = 0 but a is still −g; one sign convention carries the whole flight.',
  spec: [1, 2],
  misconceptions: ['K-TOP-ZERO-A', 'K-SIGN-CONV', 'K-ACC-DIR', 'K-SPEED-VEL', 'K-SUVAT-PICK', 'K-RELEASE-REST', 'K-ROOT-PICK'],
  sessions: [
    {
      id: 'core',
      kind: 'core',
      minutes: 10,
      steps: [ideaRelease, hook, ideaGravity, accTop, ideaSign, build, spotError, exam],
      youCanNow: [
        'Solve an up-and-down flight with one equation and one sign convention',
        `Explain why a is ${gText} downwards even at the instant v = 0`,
        'Pick the root that fits the flight and read the sign of an answer as a direction',
      ],
    },
  ],
};
