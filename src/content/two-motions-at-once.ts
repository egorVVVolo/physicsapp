// Lesson "Two motions at once" — the horizontal and vertical motions of a projectile are independent: sideways the
// velocity never changes, downward it accelerates at g like a dropped body, and the two share only the clock.
// WPH11 point 7.
// The puzzle: Mia and Leo kick a ball from the same spot at 20 m s⁻¹, Mia at 30° above the ground, Leo at 60°.
// Whose ball lands further away?
// The answer: neither. Both land 35.3 m away: Mia's ball moves faster sideways, Leo's stays up longer.
// Spec: docs/lessons/two-motions-at-once.md.
// Every number below comes from src/physics; wrong options are named mistakes, recomputed by the test.
import { G } from '../physics/kinematics.ts';
import { flightTime, landingSpeed, launchParts, projectileRange, projectileVelocity, timeToTop, topHeight, type Launch } from '../physics/projectile.ts';
import { fixed, signed } from '../physics/format.ts';
import type { BenchFig, GraphFig, KickFig, Lesson } from './types.ts';
import type { Trip } from '../physics/kinematics.ts';

const NB = '\u00A0'; // numbers never break from their units
/** "1.01 m" */
const m = (x: number, dp = 1) => `${fixed(x, dp)}${NB}m`;
/** "17.3 m s⁻¹" */
const speed = (v: number, dp = 1) => `${fixed(v, dp)}${NB}m${NB}s⁻¹`;
/** "2.04 s" */
const sec = (t: number, dp = 2) => `${fixed(t, dp)}${NB}s`;
const deg = (a: number) => `${fixed(a, 0)}°`;
/** "+10.0 m s⁻¹", "−10.0 m s⁻¹" */
const vel = (v: number) => `${signed(v, 1)}${NB}m${NB}s⁻¹`;

// The bench: ball A is dropped from one end as ball B rolls off the other
export const BENCH = { h: 1.25, uB: 2.0, uC: 4.0 };
export const STROBE = 0.1; // s, the question on the explore screen
// The kicks
export const KICK = { u: 20, mia: 30, leo: 60, best: 45 };
// Skill check
export const CLIFF = { h: 20, u: 15 };
export const GOLF = { u: 25, angle: 40 };
export const PLANE = { h: 180, u: 60 };

const bench = (u: number): Launch => ({ u, angle: 0, h: BENCH.h });
const kick = (angle: number): Launch => ({ u: KICK.u, angle, h: 0 });

/** Times, distances and named mistakes, used by the screens and re-checked by the test. */
export const ANSWERS = (() => {
  const fall = flightTime(bench(BENCH.uB));
  const mia = kick(KICK.mia);
  const leo = kick(KICK.leo);
  const miaParts = launchParts(mia);
  const leoParts = launchParts(leo);
  const cliff: Launch = { u: CLIFF.u, angle: 0, h: CLIFF.h };
  const cliffT = flightTime(cliff);
  const cliffVy = -projectileVelocity(cliffT, cliff).vy;
  const golf: Launch = { u: GOLF.u, angle: GOLF.angle, h: 0 };
  const golfParts = launchParts(golf);
  const plane: Launch = { u: PLANE.u, angle: 0, h: PLANE.h };
  return {
    bench: {
      t: fall,
      noTwo: Math.sqrt(BENCH.h / G), // s = gt² instead of ½gt²
      sideways: BENCH.h / BENCH.uB, // the height divided by the sideways speed
      noRoot: (2 * BENCH.h) / G, // 2s ÷ g without the square root
      range: projectileRange(bench(BENCH.uB)),
      rangeSideways: BENCH.uB * (BENCH.h / BENCH.uB),
      rangeNoTwo: BENCH.uB * Math.sqrt(BENCH.h / G),
      rangeVy: -projectileVelocity(fall, bench(BENCH.uB)).vy * fall, // the downward landing speed times the time
      step: BENCH.uB * STROBE, // sideways in each 0.1 s
      tC: flightTime(bench(BENCH.uC)),
      rangeC: projectileRange(bench(BENCH.uC)),
    },
    mia: {
      ux: miaParts.ux,
      uy: miaParts.uy,
      t: flightTime(mia),
      toTop: timeToTop(mia),
      tSideways: (2 * miaParts.ux) / G, // the time worked out from the sideways part
      tWhole: (2 * KICK.u) / G, // … from the whole speed
      range: projectileRange(mia),
      rangeWhole: KICK.u * flightTime(mia),
      rangeToTop: miaParts.ux * timeToTop(mia),
      rangeUp: miaParts.uy * flightTime(mia),
      height: topHeight(mia),
    },
    leo: {
      ux: leoParts.ux,
      uy: leoParts.uy,
      t: flightTime(leo),
      range: projectileRange(leo),
      height: topHeight(leo),
      heightWhole: (KICK.u * KICK.u) / (2 * G),
      heightNoTwo: (leoParts.uy * leoParts.uy) / G,
    },
    best: { range: projectileRange(kick(KICK.best)), t: flightTime(kick(KICK.best)) },
    cliff: {
      t: cliffT,
      range: projectileRange(cliff),
      noTwo: CLIFF.u * Math.sqrt(CLIFF.h / G),
      noRoot: CLIFF.u * ((2 * CLIFF.h) / G),
      sideways: CLIFF.u * (CLIFF.h / CLIFF.u),
      vy: cliffVy,
      speed: landingSpeed(cliff),
      added: CLIFF.u + cliffVy,
    },
    golf: {
      right: topHeight(golf),
      whole: (GOLF.u * GOLF.u) / (2 * G),
      cos: (golfParts.ux * golfParts.ux) / (2 * G),
      noTwo: (golfParts.uy * golfParts.uy) / G,
    },
    plane: { t: flightTime(plane), x: projectileRange(plane) },
    golfFlight: { t: flightTime(golf), range: projectileRange(golf), toTop: timeToTop(golf), ux: golfParts.ux, uy: golfParts.uy },
  };
})();

const x = ANSWERS;

const benchFig = (over: Partial<BenchFig> = {}): BenchFig => ({ kind: 'bench', h: BENCH.h, balls: [{ id: 'B', u: BENCH.uB }], ...over });
const AB: BenchFig['balls'] = [
  { id: 'A', u: 0 },
  { id: 'B', u: BENCH.uB },
];
const miaFig = (over: Partial<KickFig> = {}): KickFig => ({ kind: 'kick', u: KICK.u, kicks: [{ id: 'Mia', angle: KICK.mia }], ...over });
const leoFig = (over: Partial<KickFig> = {}): KickFig => ({ kind: 'kick', u: KICK.u, kicks: [{ id: 'Leo', angle: KICK.leo }], ...over });
const both = (over: Partial<KickFig> = {}): KickFig => ({
  kind: 'kick',
  u: KICK.u,
  kicks: [
    { id: 'Mia', angle: KICK.mia },
    { id: 'Leo', angle: KICK.leo },
  ],
  ...over,
});

/** The vertical velocity of Mia's ball against time, and two wrong graphs: the sideways velocity, and a drop from rest. */
const MIA_UP: Trip = { u: x.mia.uy, phases: [{ dt: x.mia.t, a: -G }] };
const MIA_SIDEWAYS: Trip = { u: x.mia.ux, phases: [{ dt: x.mia.t, a: 0 }] };
const FROM_REST: Trip = { u: 0, phases: [{ dt: x.mia.t, a: -G }] };
const vyOf = (id: string, trip: Trip): GraphFig => ({ kind: 'graph', y: 'v', header: `graph ${id}`, lines: [{ id: '', trip }], tMax: 2.2, tTick: 0.5, yMin: -20, yMax: 20, yTick: 10 });
/** The cliff stone's sideways velocity (flat) and two wrong graphs. */
const STONE_FLAT: Trip = { u: CLIFF.u, phases: [{ dt: x.cliff.t, a: 0 }] };
const STONE_GROWS: Trip = { u: 0, phases: [{ dt: x.cliff.t, a: G }] };
const STONE_SLOWS: Trip = { u: CLIFF.u, phases: [{ dt: x.cliff.t, a: -CLIFF.u / x.cliff.t }] };
const stoneOf = (id: string, trip: Trip): GraphFig => ({ kind: 'graph', y: 'v', header: `graph ${id}`, lines: [{ id: '', trip }], tMax: 2.5, tTick: 0.5, yMin: 0, yMax: 25, yTick: 5 });

export const twoMotionsAtOnce: Lesson = {
  id: 'projectiles',
  title: 'Two motions at once',
  spec: [7],
  minutes: 12,
  chapters: [
    { title: 'The puzzle', from: 'intro' },
    { title: 'Two motions, one clock', from: 'two-motions' },
    { title: 'Back to the kicks', from: 'split' },
  ],
  cast: ['Mia', 'Leo'],
  story: [
    {
      id: 'intro',
      kind: 'intro',
      title: 'Two motions at once',
      body: `Mia and Leo kick a ball from the same spot at ${speed(KICK.u, 0)}. Mia kicks at ${deg(KICK.mia)} above the ground, Leo at ${deg(KICK.leo)}.`,
      fig: both({ launch: 'arrow' }),
    },
    {
      id: 'hook',
      kind: 'predict',
      prompt: 'Ignore air resistance. Whose ball lands further away?',
      fig: both({ launch: 'arrow' }),
      options: [
        { id: 'mia', label: "Mia's, the lower kick" },
        { id: 'leo', label: "Leo's, the higher kick" },
        { id: 'same', label: 'They land at the same spot', correct: true },
        { id: 'unsure', label: "I'm not sure" },
      ],
      after: "Let's find out",
    },
    {
      id: 'two-motions',
      kind: 'text',
      body: [
        'A ball in flight does **two motions at once**. Sideways nothing pushes it, so its speed that way never changes.',
        `Downward, gravity speeds it up at ${fixed(G, 2)}${NB}m${NB}s⁻², exactly as if it were simply dropped.`,
      ],
      card: { term: 'Independent motions', text: 'The horizontal and vertical motions of a projectile do not affect each other. They share only the time t.' },
    },
    {
      id: 'race',
      kind: 'choice',
      prompt: `Ball A drops off one end of a bench just as ball B rolls off the other end at ${speed(BENCH.uB)}. Which ball lands first?`,
      fig: benchFig({ balls: AB, levels: true, play: 'afterCheck' }),
      options: [
        { id: 'a', label: 'A, it has the shorter path', hint: 'A longer path, but the same fall: B has no extra speed downward.' },
        { id: 'b', label: 'B, it is moving faster', hint: "B's speed is sideways. It does nothing to the fall." },
        { id: 'same', label: 'They land together', correct: true },
      ],
      why: 'Both start with no downward speed and fall the same height at g. Watch the copies every 0.1 s: they stay level all the way down.',
    },
    {
      id: 'strobe',
      kind: 'explore',
      instruction: 'Drag the slider to run the clock.',
      fig: benchFig({ balls: AB, levels: true, arrows: true }),
      slider: { min: 0, max: 0.5, step: 0.01, tick: 0.1, label: 'Time since the balls left the bench', unit: 's', symbol: 't', dp: 2 },
      question: {
        prompt: `How far does B move sideways in each ${sec(STROBE, 1)}?`,
        options: [
          { id: 'same', label: `${m(x.bench.step, 2)} every time`, correct: true },
          { id: 'more', label: 'More each time, like its fall', hint: 'Downward the gaps grow. Look along the floor.' },
          { id: 'less', label: 'Less each time', hint: `Its sideways speed stays ${speed(BENCH.uB)}. Look at the arrow.` },
        ],
        right: `Right: ${m(x.bench.step, 2)} in every ${sec(STROBE, 1)}, the steady ${speed(BENCH.uB)}. Downward the gaps grow: that motion speeds up.`,
      },
    },
    {
      id: 'land',
      kind: 'estimate',
      prompt: `The bench is ${m(BENCH.h, 2)} high and B rolls off at ${speed(BENCH.uB)}. Drag to how far from the end of the bench it lands.`,
      fig: benchFig(),
      after: benchFig({ play: true, range: 'shown' }),
      scale: { min: 0, max: 3, step: 0.05, tick: 0.5, unit: 'm', symbol: 's', dp: 2, label: 'Distance from the bench' },
      answer: x.bench.range,
      tolerance: 0.3,
      why: `It falls for ${sec(x.bench.t, 3)} while moving sideways at ${speed(BENCH.uB)}: ${fixed(BENCH.uB, 1)} × ${fixed(x.bench.t, 3)} = ${m(x.bench.range, 2)}.`,
    },
    {
      id: 'fall-time',
      kind: 'build',
      prompt: 'The time comes from the fall alone, like a dropped ball. Build how long B is in the air.',
      fig: benchFig({ play: 'afterCheck' }),
      equation: 't = √(2 × {h} ÷ {g})',
      boxes: { h: 'height', g: 'field' },
      chips: [
        { id: 'height', label: m(BENCH.h, 2) },
        { id: 'field', label: `${fixed(G, 2)}${NB}m${NB}s⁻²` },
        { id: 'sideways', label: speed(BENCH.uB), hint: 'That is the sideways speed. The fall does not use it.' },
        { id: 'double', label: m(2 * BENCH.h, 2), hint: 'That is 2h. The 2 is already in the equation.' },
      ],
      result: { symbol: 't', value: x.bench.t, unit: 's' },
      why: `Downward B starts at 0, like a dropped ball: ${fixed(BENCH.h, 2)} = ½ × ${fixed(G, 2)} × t², so t = ${sec(x.bench.t, 3)}.`,
    },
    {
      id: 'steady',
      kind: 'order',
      prompt: 'Why does the sideways velocity of a ball in flight never change? Put the reasoning in order.',
      steps: [
        { id: 'no-force', text: 'Once the ball has left the foot, nothing pushes it sideways.' },
        { id: 'no-a', text: 'No sideways force means no sideways acceleration: a = 0.' },
        { id: 'steady', text: 'With a = 0 the sideways velocity cannot change.' },
        { id: 'equal', text: 'So it covers equal distances in equal times: s = ut.' },
      ],
      hint: 'Start with the forces, then the acceleration, then the velocity.',
      why: 'Only gravity acts on the ball, and it acts downward. Sideways there is no force, no acceleration, and so a steady velocity.',
    },
    {
      id: 'split',
      kind: 'text',
      body: [`Split Mia's kick: ${speed(x.mia.ux)} along the ground, ${speed(x.mia.uy)} up. Each part runs on its own.`],
      fig: miaFig({ launch: 'parts' }),
    },
    {
      id: 'vy',
      kind: 'graphPick',
      prompt: "Which v–t graph shows the vertical velocity of Mia's ball? Up is positive.",
      scene: miaFig({ launch: 'parts' }),
      graphs: [
        { id: 'A', fig: vyOf('A', MIA_SIDEWAYS), hint: `A flat line is a steady velocity: that is the sideways ${speed(x.mia.ux)}.` },
        { id: 'B', fig: vyOf('B', MIA_UP), correct: true },
        { id: 'C', fig: vyOf('C', FROM_REST), hint: `That ball starts from rest. Mia's starts upward at ${speed(x.mia.uy)}.` },
      ],
      why: `Up starts at ${vel(x.mia.uy)} and g takes ${fixed(G, 2)}${NB}m${NB}s⁻¹ off it every second: a straight line down through zero at the top, to ${vel(-x.mia.uy)} on landing.`,
    },
    {
      id: 'flight-time',
      kind: 'choice',
      prompt: `Mia's ball goes up at ${speed(x.mia.uy)} and comes back down to the ground. How long is it in the air?`,
      fig: miaFig({ launch: 'parts', play: 'afterCheck' }),
      options: [
        { id: 'right', label: sec(x.mia.t), correct: true },
        { id: 'to-top', label: sec(x.mia.toTop), hint: 'That is only the way up, to the top. The way down takes as long again.' },
        { id: 'sideways', label: sec(x.mia.tSideways), hint: `That uses ${speed(x.mia.ux)}, the sideways part. Time comes from the vertical.` },
        { id: 'whole', label: sec(x.mia.tWhole), hint: `That uses all ${speed(KICK.u, 0)}. Only ${speed(x.mia.uy)} of it is upward.` },
      ],
      why: `Up is +: 0 = ${fixed(x.mia.uy, 1)}t − ½ × ${fixed(G, 2)} × t², so t = 2 × ${fixed(x.mia.uy, 1)} ÷ ${fixed(G, 2)} = ${sec(x.mia.t)}.`,
    },
    {
      id: 'range',
      kind: 'build',
      prompt: "Now sideways: build how far from the kick Mia's ball lands.",
      fig: miaFig({ path: 'shown', range: 'afterCheck' }),
      equation: 's = {u} × {t}',
      boxes: { u: 'ux', t: 'time' },
      chips: [
        { id: 'ux', label: speed(x.mia.ux) },
        { id: 'time', label: sec(x.mia.t) },
        { id: 'whole', label: speed(KICK.u, 0), hint: `Sideways the ball moves at ${speed(x.mia.ux)}, not the whole kick.` },
        { id: 'up', label: speed(x.mia.uy), hint: `That is the upward part. Sideways it is ${speed(x.mia.ux)}.` },
        { id: 'top', label: sec(x.mia.toTop), hint: 'That only takes the ball to the top. Use the whole flight.' },
      ],
      result: { symbol: 's', value: x.mia.range, unit: 'm' },
      why: `Sideways, s = ut: ${fixed(x.mia.ux, 1)} × ${fixed(x.mia.t, 2)} = ${m(x.mia.range)}. The time came from the vertical motion.`,
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Back to the two kicks. Leo's ball goes up at ${speed(x.leo.uy)} and along at ${speed(x.leo.ux)}, so it stays up ${sec(x.leo.t)}. Whose ball lands further away?`,
      fig: both({ launch: 'arrow', path: 'afterCheck', range: 'afterCheck', play: 'afterCheck' }),
      options: [
        { id: 'mia', label: "Mia's, the lower kick", hint: `Leo's ball is slower sideways, but for longer: ${fixed(x.leo.ux, 1)} × ${fixed(x.leo.t, 2)}.` },
        { id: 'leo', label: "Leo's, the higher kick", hint: `Longer in the air, but only ${speed(x.leo.ux)} sideways: ${fixed(x.leo.ux, 1)} × ${fixed(x.leo.t, 2)}.` },
        { id: 'same', label: 'They land at the same spot', correct: true },
      ],
      why: `Leo's: ${fixed(x.leo.ux, 1)} × ${fixed(x.leo.t, 2)} = ${m(x.leo.range)}, the same as Mia's. His ball is up longer but moves slower sideways.`,
    },
    {
      id: 'angle',
      kind: 'explore',
      instruction: 'Drag the slider to change the angle of the kick.',
      fig: miaFig({ launch: 'arrow', path: 'shown', range: 'shown' }),
      slider: { min: 0, max: 90, step: 1, tick: 15, label: 'Angle of the kick above the ground', unit: '°', symbol: 'θ', dp: 0, start: KICK.mia },
      question: {
        prompt: `At about what angle does a ${speed(KICK.u, 0)} kick land furthest away?`,
        options: [
          { id: 'low', label: `About ${deg(KICK.mia)}`, hint: `At ${deg(KICK.mia)} it lands ${m(x.mia.range)} away. Try a little higher.` },
          { id: 'best', label: `About ${deg(KICK.best)}`, correct: true },
          { id: 'high', label: `About ${deg(KICK.leo)}`, hint: `At ${deg(KICK.leo)} it lands ${m(x.leo.range)} away. Try a little lower.` },
        ],
        right: `Right: at ${deg(KICK.best)} it lands ${m(x.best.range)} away. Angles the same amount either side of ${deg(KICK.best)} tie, like ${deg(KICK.mia)} and ${deg(KICK.leo)}.`,
      },
    },
    {
      id: 'rules',
      kind: 'text',
      body: [
        `Split the launch velocity into **horizontal** and **vertical** parts. Horizontally, s = ut. Vertically, use suvat with a = ${fixed(G, 2)}${NB}m${NB}s⁻² downward.`,
        'The **time** links the two. Find it from the vertical motion, then use it sideways. Air resistance is ignored.',
      ],
      card: { term: 'A projectile', text: 'Horizontal: steady velocity, s = ut. Vertical: acceleration g downward. The same time t for both.' },
    },
  ],
  skillCheck: [
    {
      id: 'cliff',
      kind: 'build',
      prompt: `A stone is kicked horizontally at ${speed(CLIFF.u, 0)} off the top of a ${fixed(CLIFF.h, 0)}${NB}m cliff. Build how far from the foot of the cliff it lands.`,
      equation: 's = {u} × √(2 × {h} ÷ {g})',
      boxes: { u: 'speed', h: 'height', g: 'field' },
      chips: [
        { id: 'speed', label: speed(CLIFF.u, 0) },
        { id: 'height', label: m(CLIFF.h, 0) },
        { id: 'field', label: `${fixed(G, 2)}${NB}m${NB}s⁻²` },
        { id: 'half', label: m(CLIFF.h / 2, 0), hint: 'That is h ÷ 2. The 2 is already in the equation.' },
        { id: 'time', label: sec(x.cliff.t), hint: 'That is the fall time. The equation works it out itself.' },
      ],
      result: { symbol: 's', value: x.cliff.range, unit: 'm' },
      why: `Down: ${CLIFF.h} = ½ × ${fixed(G, 2)} × t², so t = ${sec(x.cliff.t)}. Sideways: ${CLIFF.u} × ${fixed(x.cliff.t, 2)} = ${m(x.cliff.range)}.`,
    },
    {
      id: 'stone-sideways',
      kind: 'graphPick',
      prompt: 'The same stone falls from the cliff. Which v–t graph shows its sideways velocity?',
      graphs: [
        { id: 'A', fig: stoneOf('A', STONE_GROWS), hint: 'That line grows by g every second: it is the vertical speed.' },
        { id: 'B', fig: stoneOf('B', STONE_FLAT), correct: true },
        { id: 'C', fig: stoneOf('C', STONE_SLOWS), hint: 'Nothing slows the stone down sideways: there is no sideways force.' },
      ],
      why: `Sideways there is no force, so no acceleration: the velocity stays ${speed(CLIFF.u, 0)} all the way down. A flat line.`,
    },
    {
      id: 'package',
      kind: 'choice',
      prompt: `A plane flies level at ${speed(PLANE.u, 0)}, ${PLANE.h}${NB}m up, and drops a package. Ignore air resistance. Where is the plane when the package lands?`,
      options: [
        { id: 'above', label: 'Directly above the package', correct: true },
        { id: 'ahead', label: `${m(x.plane.x, 0)} ahead of the package` },
        { id: 'behind', label: `${m(x.plane.x, 0)} behind the package` },
        { id: 'release', label: 'Above the point where it was dropped' },
      ],
      why: `The package keeps the plane's ${speed(PLANE.u, 0)} sideways while it falls for ${sec(x.plane.t, 1)}. Both go ${m(x.plane.x, 0)}: the plane is right above it.`,
    },
    {
      id: 'golf',
      kind: 'examCard',
      context: `A golf ball is hit at ${speed(GOLF.u, 0)}, ${deg(GOLF.angle)} above level ground. Ignore air resistance.`,
      parts: [
        {
          id: 'a',
          command: 'Calculate',
          text: 'the time the ball is in the air.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 't = 2 × {u} × sin {θ} ÷ {g}',
            boxes: { u: 'speed', θ: 'angle', g: 'field' },
            chips: [
              { id: 'speed', label: speed(GOLF.u, 0) },
              { id: 'angle', label: deg(GOLF.angle) },
              { id: 'field', label: `${fixed(G, 2)}${NB}m${NB}s⁻²` },
              { id: 'other', label: deg(90 - GOLF.angle), hint: 'That is the angle from the vertical. θ is measured from the ground.' },
              { id: 'cos', label: speed(x.golfFlight.ux), hint: 'That is the sideways part. The time comes from the upward part.' },
            ],
            result: { symbol: 't', value: x.golfFlight.t, unit: 's' },
          },
          why: `Up: ${GOLF.u} sin ${deg(GOLF.angle)} = ${speed(x.golfFlight.uy)}. Up and back down takes t = 2 × ${fixed(x.golfFlight.uy, 1)} ÷ ${fixed(G, 2)} = ${sec(x.golfFlight.t)}.`,
        },
        {
          id: 'b',
          command: 'Calculate',
          text: 'how far the ball lands from where it was hit.',
          marks: 2,
          kind: 'build',
          build: {
            equation: 's = {u} × cos {θ} × {t}',
            boxes: { u: 'speed', θ: 'angle', t: 'time' },
            chips: [
              { id: 'speed', label: speed(GOLF.u, 0) },
              { id: 'angle', label: deg(GOLF.angle) },
              { id: 'time', label: sec(x.golfFlight.t) },
              { id: 'top', label: sec(x.golfFlight.toTop), hint: 'That only takes the ball to the top. Use the whole flight.' },
              { id: 'other', label: deg(90 - GOLF.angle), hint: 'That is the angle from the vertical. θ is measured from the ground.' },
            ],
            result: { symbol: 's', value: x.golfFlight.range, unit: 'm' },
          },
          why: `Sideways, s = ut: ${fixed(x.golfFlight.ux, 1)} × ${fixed(x.golfFlight.t, 2)} = ${m(x.golfFlight.range)}. One mark for the values, one for the answer.`,
        },
      ],
    },
  ],
  youCanNow: [
    'Treat a projectile as two motions on one clock',
    'Find the time of flight from the vertical motion alone',
    'Find how far a projectile goes',
    'Explain why the sideways velocity never changes',
  ],
  recap: {
    fig: both({ path: 'shown', range: 'shown' }),
    text: `Mia's ball moved faster sideways, Leo's stayed up longer. Both landed ${m(x.mia.range)} away.`,
  },
  card: {
    formula: 'x: s = ut; y: a = g',
    idea: 'Horizontal and vertical motions are independent. They share only the time t.',
  },
};
