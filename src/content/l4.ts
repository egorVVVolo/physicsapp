// Lesson 4, "Up, stop, down": a package released from a moving drone.
// Every number in the text is computed from the givens below through src/physics.
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
import type { BuildStep, Lesson, Playback, PredictStep, SceneSetup, SpotErrorStep, Values } from './types.ts';

const WORLD_TOP = 34; // m on the ruler (headroom under the caption at the top of the flight)
const MS = 'm s⁻¹';
const MS2 = 'm s⁻²';
const gText = `${fixed(G, 2)} ${MS2}`;

/** The givens of one drone task and everything the model says about it. */
export function world(h0: number, vb: number) {
  const real: Motion = { s0: h0, u: vb, a: -G };
  const tTop = timeAtRest(real)!;
  const tLand = timeToReach(0, real)!;
  const speed = `${fixed(vb, 1)} ${MS}`;
  const scene: SceneSetup = {
    body: real,
    carrier: { motion: { s0: h0, u: vb, a: 0 }, label: speed },
    worldTop: WORLD_TOP,
    description: `A drone climbs at ${speed}. A package hangs below it, ${fixed(h0, 0)} metres above the ground.`,
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
    condition: `A drone climbs at a steady ${speed}. It releases a package ${fixed(h0, 0)} m above the ground. Take g = ${gText}, up is positive.`,
  };
}
type World = ReturnType<typeof world>;

export const W = world(20, 8);

const graphFor = (w: World, endT: number) => ({ tMax: endT * 1.1, hMax: Math.max(w.hTop, w.h0) * 1.2 });

// ── 1. Hook: what is the velocity at the instant of release? ─────────────────────────────

const hookU: Record<string, number> = { zero: 0, up: W.vb, down: -W.vb };

export const hook: PredictStep = {
  id: 'hook',
  type: 'predict',
  condition: W.condition,
  question: 'What is the package’s velocity the instant it is released?',
  scene: W.scene,
  options: [
    { id: 'zero', label: `0 ${MS}`, misconception: 'K-RELEASE-REST', feedback: `It was climbing with the drone, so it leaves with the drone’s ${W.speed} upwards.` },
    { id: 'up', label: `${W.speed} up`, correct: true, feedback: 'It shares the drone’s velocity, so it keeps rising before it falls.' },
    { id: 'down', label: `${W.speed} down`, misconception: 'K-ACC-DIR', feedback: `Letting go changes the forces, not the velocity at that instant. It still starts at ${W.speed} upwards.` },
  ],
  // A wrong answer plays as a ghost; a correct one is compared with "from rest".
  // It stops when the ghost lands, before the real landing, so the build step stays open.
  playbackFor(optionId) {
    const correct = optionId === 'up';
    const ghost: Motion = { s0: W.h0, u: correct ? 0 : hookU[optionId], a: -G };
    const endT = timeToReach(0, ghost)!;
    const stillUp = fixed(position(endT, W.real), 1);
    const events: ClockEvent[] = [{ t: W.tTop, id: 'top' }, { t: endT, id: 'ghostLand', end: true }];
    return {
      events,
      endT,
      captions: {
        top: `Top: ${fixed(W.hTop, 1)} m. It rose ${fixed(W.hTop - W.h0, 1)} m after the drone let go`,
        ghostLand: `${correct ? 'From rest it would land' : 'Yours lands'} at ${fixed(endT, 2)} s. The real one is still ${stillUp} m up`,
      },
      real: { motion: W.real, from: 0, end: endT },
      realLabel: 'real',
      companion: { track: { motion: ghost, from: 0, end: endT }, label: correct ? 'from rest' : 'your answer', kind: 'ghost' },
      showAcc: false,
      graph: graphFor(W, endT),
    };
  },
};

// ── 2. Acceleration while rising, at the top and while falling ───────────────────────────

export const accTop: PredictStep = {
  id: 'acc-top',
  type: 'predict',
  condition: W.condition,
  question: 'Compare its acceleration while rising, at the top and while falling.',
  scene: W.scene,
  options: [
    { id: 'same', label: 'The same all the way', correct: true, feedback: `Only gravity acts after the release, so a is ${gText} downwards all the way, top included.` },
    { id: 'zeroTop', label: 'Zero at the top', misconception: 'K-TOP-ZERO-A', feedback: 'v is zero for an instant but still changing. With a = 0 there it would hang, as your ghost does.' },
    { id: 'flips', label: 'It reverses at the top', misconception: 'K-ACC-DIR', feedback: 'a follows the force, not the motion. An upward a while rising would speed it up, as your ghost does.' },
  ],
  playbackFor(optionId) {
    const endT = W.tTop + 0.6;
    const hang: Motion = { s0: W.hTop, u: 0, a: 0 };
    const speedsUp: Motion = { s0: W.h0, u: W.vb, a: G };
    const flips = optionId === 'flips';
    const top: Record<string, string> = {
      same: 'Top: v = 0. With a = 0 it would stay here, like the dashed one',
      zeroTop: 'Top. Yours has v = 0 and a = 0, so nothing can move it again',
      flips: 'Top. Yours had a upwards, so it sped up and is leaving the frame',
    };
    return {
      events: [{ t: W.tTop, id: 'top' }, { t: endT, id: 'after', end: true }],
      endT,
      captions: { top: top[optionId], after: `The a arrow never changed: ${gText} down before, at and after the top` },
      real: { motion: W.real, from: 0, end: endT },
      realLabel: 'real',
      companion: flips
        ? { track: { motion: speedsUp, from: 0, end: timeToReach(WORLD_TOP, speedsUp)! }, label: 'your answer', kind: 'ghost' }
        : { track: { motion: hang, from: W.tTop, end: endT }, label: optionId === 'same' ? 'a = 0 at top' : 'your answer', kind: 'ghost' },
      showAcc: true,
      graph: graphFor(W, endT),
    };
  },
};

// ── 3. The trap problem: time to the ground with one equation for the whole flight ───────

function buildTime(w: World, id: string): BuildStep {
  const { h0, vb } = w;
  const [tLand, tBefore] = w.roots;
  const m = (x: number) => `${signed(x, 0)} m`;
  const v = (x: number) => (x === 0 ? `0 ${MS}` : `${signed(x, 1)} ${MS}`);
  const a = (x: number) => `${signed(x, 2)} ${MS2}`;
  return {
    id,
    type: 'build',
    condition: w.condition,
    question: 'Find the time to reach the ground. Use one equation for the whole flight.',
    scene: w.scene,
    unknown: 't',
    known: ['s', 'u', 'a'],
    hint: 'Known: s, u, a. Wanted: t.',
    relations: [
      { id: 'vuat', misconception: 'K-SUVAT-PICK', feedback: 'v at the ground is not given. This one only gets you to the top, then you need a second stage.' },
      { id: 'sut', feedback: 'It has t, and everything else in it is known.' },
      { id: 'v2as', misconception: 'K-SUVAT-PICK', feedback: 'There is no t in it. It could be a first stage, but the task asks for one equation.' },
    ],
    template: [{ q: 's' }, ' = ', { q: 'u' }, ' t + ½ ', { q: 'a' }, ' t²'],
    slots: [
      {
        quantity: 's',
        correct: -h0,
        chips: [
          { value: h0, label: m(h0), misconception: 'K-SIGN-CONV', feedback: `The ground is below the release point, so s = ${m(-h0)}. ${m(h0)} is a point it never reaches.` },
          { value: -h0, label: m(-h0) },
        ],
      },
      {
        quantity: 'u',
        correct: vb,
        chips: [
          { value: vb, label: v(vb) },
          { value: 0, label: v(0), misconception: 'K-RELEASE-REST', feedback: 'u = 0 is a package dropped from a hovering drone. You found the real u in the first step.' },
          { value: -vb, label: v(-vb), misconception: 'K-SPEED-VEL', feedback: `It ends up falling, but u is the velocity at the release: with the drone, ${v(vb)}.` },
        ],
      },
      {
        quantity: 'a',
        correct: -G,
        chips: [
          { value: G, label: a(G), misconception: 'K-SIGN-CONV', feedback: `Gravity acts downwards and up is positive, so a = ${a(-G)}. Yours accelerates upwards.` },
          { value: -G, label: a(-G) },
        ],
      },
    ],
    solved: `t = ${fixed(tLand, 2)} s  or  t = ${fixed(tBefore, 2)} s`,
    final: {
      prompt: 'The equation has two solutions. Which one is the landing?',
      choices: [
        { id: 'land', label: `${fixed(tLand, 2)} s`, correct: true, feedback: `One equation, three signed values: it lands ${fixed(tLand, 2)} s after the release.` },
        { id: 'before', label: `${fixed(tBefore, 2)} s`, misconception: 'K-ROOT-PICK', feedback: 'Negative t is before the release. The equation only holds once the drone has let go.' },
      ],
    },
    flippedFeedback: 'Consistent with down as positive, and t comes out right. This task fixed up as positive: flip all three.',
    methodHint: 'Compare each one with the + direction: where is the ground, which way is u, which way is a?',
    worked: [
      'Up is positive; measure s from the release point.',
      `The ground is ${fixed(h0, 0)} m below: s = ${m(-h0)}.`,
      `The package leaves with the drone’s velocity: u = ${v(vb)}.`,
      `Gravity acts downwards all the way: a = ${a(-G)}.`,
      `s = ut + ½at² gives t = ${fixed(tLand, 2)} s or ${fixed(tBefore, 2)} s.`,
      `After the release t > 0, so t = ${fixed(tLand, 2)} s.`,
    ],
    // The wrong numbers describe some other motion. Play that motion next to the real one.
    wrongPlayback(values: Values): Playback {
      const ghost: Motion = { s0: h0, u: values.u ?? vb, a: values.a ?? -G };
      const target = h0 + (values.s ?? -h0);
      const stop = motionStop(ghost, target, WORLD_TOP);
      const hStop = position(stop.t, ghost);
      const realH = fixed(position(stop.t, w.real), 1);
      const caption =
        stop.why === 'target'
          ? `Yours lands at ${fixed(stop.t, 2)} s. The real one is still ${realH} m up`
          : stop.why === 'offTop'
            ? 'Yours keeps speeding up and leaves the frame. It never comes down'
            : stop.why === 'apex'
              ? target > h0
                ? `Yours turns round at ${fixed(hStop, 1)} m. Your s points to ${fixed(target, 0)} m, above the drone`
                : `Yours stops at ${fixed(hStop, 1)} m, then climbs. It never reaches the ground`
              : `Yours hits the ground. Your s points to ${fixed(target, 0)} m, above the drone`;
      return {
        events: [{ t: stop.t, id: 'stop', end: true }],
        endT: stop.t,
        captions: { stop: caption },
        real: { motion: w.real, from: 0, end: stop.t },
        realLabel: 'real',
        companion: { track: { motion: ghost, from: 0, end: stop.t }, label: 'your values', kind: 'ghost' },
        showAcc: true,
        graph: graphFor(w, stop.t),
      };
    },
    donePlayback(): Playback {
      return {
        events: [{ t: w.tTop, id: 'top' }, { t: w.tBack, id: 'back' }, { t: w.tLand, id: 'land', end: true }],
        endT: w.tLand,
        captions: {
          top: `Top: s = ${signed(w.hTop - h0, 1)} m. The equation needs no stop here`,
          back: 's = 0 again. Same equation, nothing restarted',
          land: `Ground: s = ${m(-h0)} at t = ${fixed(w.tLand, 2)} s`,
        },
        real: { motion: w.real, from: 0, end: w.tLand },
        realLabel: 'real',
        companion: null,
        showAcc: true,
        graph: graphFor(w, w.tLand),
      };
    },
  };
}

export const W2 = world(15, 6); // the same problem with new values, used after a reveal
export const build: BuildStep = { ...buildTime(W, 'build'), retry: buildTime(W2, 'build-retry') };

// ── 4. Spot the error: a square root with the wrong sign ─────────────────────────────────

const v2 = W.vb ** 2 + 2 * -G * -W.h0; // v² at the ground
const vUp = Math.sqrt(v2); // the student's (wrong) positive root
export const studentT = (vUp - W.vb) / -G; // what the wrong sign leads to

export const spotError: SpotErrorStep = {
  id: 'spot-error',
  type: 'spot-error',
  condition: 'Same drone, same package. A student finds the landing time in two stages and gets a negative answer.',
  question: 'Tap the line where the working first goes wrong.',
  scene: { ...W.scene, worldTop: 44 }, // a short view: the four lines of working take the room
  misconception: 'K-SPEED-VEL',
  lines: [
    { id: '1', text: `u = ${signed(W.vb, 1)},  a = ${signed(-G, 2)},  s = ${signed(-W.h0, 0)}`, feedback: 'Line 1 is fine: the ground is below the release point, so s is negative with up positive.' },
    { id: '2', text: `v² = u² + 2as = ${fixed(W.vb, 1)}² + 2(${fixed(-G, 2)})(${fixed(-W.h0, 0)}) = ${fixed(v2, 0)}`, feedback: 'Line 2 is fine: a and s are both negative, so 2as is positive. It gains speed.' },
    { id: '3', text: `v = √${fixed(v2, 0)} = ${signed(vUp, 1)} ${MS}`, wrong: true, feedback: `A square root gives ±${fixed(vUp, 1)}. At the ground it moves down, so v = ${signed(W.vLand, 1)} ${MS}.` },
    { id: '4', text: `t = (${fixed(vUp, 1)} − ${fixed(W.vb, 1)}) / (${fixed(-G, 2)}) = ${fixed(studentT, 2)} s`, feedback: 'Line 4 uses v = u + at correctly. It inherits a v with the wrong sign from above.' },
  ],
  methodHint: 'Which way is the package moving when it reaches the ground? Find the line that disagrees with that.',
  worked: [
    `Lines 1 and 2 are right: v² = ${fixed(v2, 0)}.`,
    `v = ±${fixed(vUp, 1)} ${MS}. It is moving down at the ground, so v = ${signed(W.vLand, 1)} ${MS}.`,
    `t = (v − u) / a = (${fixed(W.vLand, 1)} − ${fixed(W.vb, 1)}) / (${fixed(-G, 2)}) = ${fixed(W.tLand, 2)} s.`,
  ],
  playback() {
    return {
      events: [{ t: W.tLand, id: 'land', end: true }],
      endT: W.tLand,
      captions: { land: `Ground: moving down, so v = ${signed(W.vLand, 1)} ${MS}, and t = ${fixed(W.tLand, 2)} s` },
      real: { motion: W.real, from: 0, end: W.tLand },
      realLabel: 'real',
      companion: null,
      showAcc: true,
      graph: graphFor(W, W.tLand),
    };
  },
};

// ── 5. Twin drones: released going up or going down, which lands faster? ─────────────────

const bodyB: Motion = { s0: W.h0, u: -W.vb, a: -G };
const tLandB = timeToReach(0, bodyB)!;
const impact = `${fixed(-W.vLand, 1)} ${MS}`;

export const twins: PredictStep = {
  id: 'twins',
  type: 'predict',
  condition: `Drone A climbs at ${W.speed}, drone B descends at ${W.speed}. Each releases a package ${fixed(W.h0, 0)} m above the ground at the same instant.`,
  question: 'Which package hits the ground at the greater speed?',
  scene: {
    ...W.scene,
    second: { body: bodyB, carrier: { s0: W.h0, u: -W.vb, a: 0 }, labels: ['A', 'B'] },
    description: `Two drones ${fixed(W.h0, 0)} metres up, each carrying a package. Drone A climbs at ${W.speed}, drone B descends at ${W.speed}.`,
  },
  options: [
    { id: 'A', label: 'A’s package', misconception: 'K-ACC-DIR', feedback: `Gravity took ${W.speed} off on the way up, then gave it back. Back at ${fixed(W.h0, 0)} m, A is where B started.` },
    { id: 'same', label: 'Same speed', correct: true, feedback: `A comes back to ${fixed(W.h0, 0)} m moving down at ${W.speed}. From there it repeats B’s flight.` },
    { id: 'B', label: 'B’s package', misconception: 'K-SPEED-VEL', feedback: 'The sign of u changes when it lands, not how fast. In v² = u² + 2as, u is squared.' },
  ],
  playbackFor() {
    return {
      events: [{ t: tLandB, id: 'bLand' }, { t: W.tBack, id: 'aBack' }, { t: W.tLand, id: 'aLand', end: true }],
      endT: W.tLand,
      captions: {
        bLand: `B lands at ${fixed(tLandB, 2)} s, moving at ${impact}`,
        aBack: `A is back at ${fixed(W.h0, 0)} m, moving down at ${W.speed}: B’s start, ${fixed(W.tBack, 2)} s late`,
        aLand: `A lands at ${impact} too. Same speed, ${fixed(W.tBack, 2)} s later`,
      },
      real: { motion: W.real, from: 0, end: W.tLand },
      realLabel: 'A',
      companion: { track: { motion: bodyB, from: 0, end: tLandB }, label: 'B', kind: 'solid' },
      showAcc: true,
      graph: graphFor(W, W.tLand),
    };
  },
};

// ── 6. Exam format: the sign of the answer is the answer ─────────────────────────────────

export const EXAM_H = 24; // m
export const EXAM_T = 3.0; // s
export const examU = initialVelocityFor(-EXAM_H, -G, EXAM_T);
const examBody: Motion = { s0: EXAM_H, u: examU, a: -G };
const examTop = timeAtRest(examBody)!;

export const exam: BuildStep = {
  id: 'exam',
  type: 'build',
  exam: { command: 'Determine', marks: 3 },
  condition: `A drone moving vertically at a steady velocity releases a package ${fixed(EXAM_H, 0)} m up. It lands ${fixed(EXAM_T, 1)} s later. g = ${gText}, up is positive.`,
  question: 'the drone’s velocity at the moment of release.',
  scene: {
    body: examBody,
    carrier: { motion: { s0: EXAM_H, u: examU, a: 0 }, label: `${fixed(examU, 1)} ${MS}`, secret: true },
    worldTop: WORLD_TOP,
    description: `A drone ${fixed(EXAM_H, 0)} metres above the ground carries a package. Its velocity is not shown.`,
  },
  unknown: 'u',
  known: ['s', 'a', 't'],
  hint: 'Known: s, a, t. Wanted: u.',
  relations: [
    { id: 'vuat', misconception: 'K-SUVAT-PICK', feedback: 'v at the ground is unknown as well: two unknowns in one equation.' },
    { id: 'v2as', misconception: 'K-SUVAT-PICK', feedback: 'It has no t and two unknowns, u and v.' },
    { id: 'sut', feedback: 'It has u, and everything else in it is known.' },
  ],
  template: [{ q: 's' }, ' = ', { q: 'u' }, ' ', { q: 't' }, ' + ½ ', { q: 'a' }, ' ', { q: 't' }, '²'],
  given: { quantity: 't', value: EXAM_T, label: `(${fixed(EXAM_T, 1)})` },
  slots: [
    {
      quantity: 's',
      correct: -EXAM_H,
      chips: [
        { value: -EXAM_H, label: `${signed(-EXAM_H, 0)} m` },
        { value: EXAM_H, label: `${signed(EXAM_H, 0)} m`, misconception: 'K-SIGN-CONV', feedback: `It ends ${fixed(EXAM_H, 0)} m below the release point: s = ${signed(-EXAM_H, 0)} m with up positive.` },
      ],
    },
    {
      quantity: 'a',
      correct: -G,
      chips: [
        { value: -G, label: `${signed(-G, 2)} ${MS2}` },
        { value: G, label: `${signed(G, 2)} ${MS2}`, misconception: 'K-SIGN-CONV', feedback: `Up is positive and gravity acts downwards: a = ${signed(-G, 2)} ${MS2}.` },
      ],
    },
  ],
  solved: `u = ${signed(examU, 1)} ${MS}`,
  final: {
    prompt: `The equation gives u = ${signed(examU, 1)} ${MS}. The drone was…`,
    choices: [
      { id: 'up', label: 'climbing', correct: true, feedback: `Positive means upwards here: the drone was climbing at ${fixed(examU, 1)} ${MS}.` },
      { id: 'down', label: 'descending', misconception: 'K-SPEED-VEL', feedback: 'Up is positive here, so a positive u means the drone was moving up.' },
    ],
  },
  flippedFeedback: '',
  methodHint: '',
  worked: [
    `Up positive, s from the release point: s = ${signed(-EXAM_H, 0)} m, a = ${signed(-G, 2)} ${MS2}, t = ${fixed(EXAM_T, 1)} s.`,
    `s = ut + ½at² gives u = ${signed(examU, 1)} ${MS}.`,
    `Positive means upwards: the drone was climbing at ${fixed(examU, 1)} ${MS}.`,
  ],
  wrongPlayback: () => exam.donePlayback(),
  donePlayback() {
    return {
      events: [{ t: examTop, id: 'top' }, { t: EXAM_T, id: 'land', end: true }],
      endT: EXAM_T,
      captions: {
        top: `Top: ${fixed(position(examTop, examBody), 1)} m. It rose first, because the drone was climbing`,
        land: `Lands at ${fixed(EXAM_T, 1)} s, as given: u = ${signed(examU, 1)} ${MS}`,
      },
      real: { motion: examBody, from: 0, end: EXAM_T },
      realLabel: 'real',
      companion: null,
      showAcc: true,
      graph: { tMax: EXAM_T * 1.1, hMax: 30 },
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
      steps: [hook, accTop, build, spotError, twins, exam],
      youCanNow: [
        'Solve an up-and-down flight with one equation and one sign convention',
        `Explain why a is ${gText} downwards even at the instant v = 0`,
        'Pick the root that fits the flight and read the sign of an answer as a direction',
      ],
    },
  ],
};
