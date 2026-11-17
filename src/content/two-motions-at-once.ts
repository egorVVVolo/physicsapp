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
import { fixed } from '../physics/format.ts';
import type { BenchFig, KickFig, Lesson } from './types.ts';

const NB = ' '; // numbers never break from their units
/** "1.01 m" */
const m = (x: number, dp = 1) => `${fixed(x, dp)}${NB}m`;
/** "17.3 m s⁻¹" */
const speed = (v: number, dp = 1) => `${fixed(v, dp)}${NB}m${NB}s⁻¹`;
/** "2.04 s" */
const sec = (t: number, dp = 2) => `${fixed(t, dp)}${NB}s`;
const deg = (a: number) => `${fixed(a, 0)}°`;

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

export const twoMotionsAtOnce: Lesson = {
  id: 'projectiles',
  title: 'Two motions at once',
  spec: [7],
  minutes: 12,
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
        { id: 'same', label: 'They land at the same spot' },
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
      id: 'fall-time',
      kind: 'choice',
      prompt: `The bench is ${m(BENCH.h, 2)} high. How long does B take to reach the floor?`,
      fig: benchFig({ play: 'afterCheck' }),
      options: [
        { id: 'right', label: sec(x.bench.t, 3), correct: true },
        { id: 'no-two', label: sec(x.bench.noTwo, 3), hint: 'Check the ½: s = ½gt², so t = √(2s ÷ g).' },
        { id: 'sideways', label: sec(x.bench.sideways, 3), hint: `That is ${fixed(BENCH.h, 2)} ÷ ${fixed(BENCH.uB, 1)}: the sideways speed has nothing to do with the fall.` },
        { id: 'no-root', label: sec(x.bench.noRoot, 3), hint: 'That is 2s ÷ g. Take the square root to get t.' },
      ],
      why: `Downward B starts at 0, like a dropped ball: ${fixed(BENCH.h, 2)} = ½ × ${fixed(G, 2)} × t², so t = ${sec(x.bench.t, 3)}.`,
    },
    {
      id: 'land',
      kind: 'choice',
      prompt: 'How far from the end of the bench does B land?',
      fig: benchFig({ range: 'afterCheck', play: 'afterCheck' }),
      options: [
        { id: 'right', label: m(x.bench.range, 2), correct: true },
        { id: 'sideways', label: m(x.bench.rangeSideways, 2), hint: `The time is ${sec(x.bench.t, 3)}, from the fall, not height ÷ sideways speed.` },
        { id: 'no-two', label: m(x.bench.rangeNoTwo, 2), hint: `Use t = ${sec(x.bench.t, 3)}: check the ½ in s = ½gt².` },
        { id: 'vy', label: m(x.bench.rangeVy, 2), hint: `Sideways the speed is ${speed(BENCH.uB)}. The downward speed belongs to the fall.` },
      ],
      why: `Sideways the speed stays ${speed(BENCH.uB)} for the whole ${sec(x.bench.t, 3)}: s = ut = ${fixed(BENCH.uB, 1)} × ${fixed(x.bench.t, 3)} = ${m(x.bench.range, 2)}.`,
    },
    {
      id: 'faster',
      kind: 'choice',
      prompt: `Ball C rolls off the same bench twice as fast, at ${speed(BENCH.uC)}. How long does its fall take?`,
      fig: benchFig({
        balls: [
          { id: 'B', u: BENCH.uB },
          { id: 'C', u: BENCH.uC },
        ],
        at: 'end',
        levels: true,
        play: 'afterCheck',
      }),
      options: [
        { id: 'same', label: `${sec(x.bench.tC, 3)}, the same as B`, correct: true },
        { id: 'half', label: `${sec(x.bench.tC / 2, 3)}, half as long`, hint: 'C goes faster sideways only. Downward it starts at 0, like B.' },
        { id: 'double', label: `${sec(x.bench.tC * 2, 3)}, twice as long`, hint: 'C lands further out, but it falls the same height from rest.' },
      ],
      why: `Only the height decides the time. C lands twice as far out, ${m(x.bench.rangeC, 2)}, after the same ${sec(x.bench.tC, 3)}.`,
    },
    {
      id: 'split',
      kind: 'text',
      body: [`Split Mia's kick: ${speed(x.mia.ux)} along the ground, ${speed(x.mia.uy)} up. Each part runs on its own.`],
      fig: miaFig({ launch: 'parts' }),
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
      id: 'top',
      kind: 'choice',
      prompt: "What is the speed of Mia's ball at the top of its flight?",
      fig: miaFig({ path: 'toTop', at: 'top', topV: 'afterCheck' }),
      options: [
        { id: 'right', label: speed(x.mia.ux), correct: true },
        { id: 'zero', label: speed(0, 0), hint: 'Only the vertical part is zero at the top. Sideways it still moves.' },
        { id: 'whole', label: speed(KICK.u), hint: 'The upward part has gone by the top. Only the sideways part is left.' },
        { id: 'up', label: speed(x.mia.uy), hint: 'That was the upward part at the start. At the top it is zero.' },
      ],
      why: `At the top the vertical part is 0, but the sideways ${speed(x.mia.ux)} never changes. So the ball still moves at ${speed(x.mia.ux)}.`,
    },
    {
      id: 'range',
      kind: 'choice',
      prompt: "How far from the kick does Mia's ball land?",
      fig: miaFig({ path: 'shown', range: 'afterCheck' }),
      options: [
        { id: 'right', label: m(x.mia.range), correct: true },
        { id: 'whole', label: m(x.mia.rangeWhole), hint: `Sideways the ball moves at ${speed(x.mia.ux)}, not the whole ${speed(KICK.u, 0)}.` },
        { id: 'to-top', label: m(x.mia.rangeToTop), hint: `${sec(x.mia.toTop)} only takes the ball to the top. Use the whole ${sec(x.mia.t)}.` },
        { id: 'up', label: m(x.mia.rangeUp), hint: `${speed(x.mia.uy)} is the upward part. Sideways it is ${speed(x.mia.ux)}.` },
      ],
      why: `Sideways, s = ut: ${fixed(x.mia.ux, 1)} × ${fixed(x.mia.t, 2)} = ${m(x.mia.range)}. The time came from the vertical motion.`,
    },
    {
      id: 'hook-again',
      kind: 'choice',
      revisitOf: 'hook',
      prompt: `Leo's ball goes up at ${speed(x.leo.uy)} and along at ${speed(x.leo.ux)}, so it stays up ${sec(x.leo.t)}. Whose ball lands further away?`,
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
      id: 'height',
      kind: 'choice',
      prompt: "How high does Leo's ball rise above the ground?",
      fig: leoFig({ path: 'shown', at: 'top', height: 'afterCheck' }),
      options: [
        { id: 'right', label: m(x.leo.height), correct: true },
        { id: 'whole', label: m(x.leo.heightWhole), hint: `That uses all ${speed(KICK.u, 0)}. Only the ${speed(x.leo.uy)} part lifts the ball.` },
        { id: 'mia', label: m(x.mia.height), hint: `That uses ${speed(x.leo.ux)}, Leo's sideways part: it is Mia's height.` },
        { id: 'no-two', label: m(x.leo.heightNoTwo), hint: `At the top v = 0: 0 = ${fixed(x.leo.uy, 1)}² − 2 × ${fixed(G, 2)} × s. Check the 2.` },
      ],
      why: `Vertically, at the top v = 0: 0 = ${fixed(x.leo.uy, 1)}² − 2 × ${fixed(G, 2)} × s, so s = ${m(x.leo.height)}. Mia's ball rises only ${m(x.mia.height)}.`,
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
      kind: 'choice',
      prompt: `A stone is kicked horizontally at ${speed(CLIFF.u, 0)} off the top of a ${fixed(CLIFF.h, 0)}${NB}m cliff. How far from the foot of the cliff does it land?`,
      options: [
        { id: 'right', label: m(x.cliff.range), correct: true },
        { id: 'no-two', label: m(x.cliff.noTwo) },
        { id: 'no-root', label: m(x.cliff.noRoot) },
        { id: 'sideways', label: m(x.cliff.sideways) },
      ],
      why: `Down: ${CLIFF.h} = ½ × ${fixed(G, 2)} × t², so t = ${sec(x.cliff.t)}. Sideways: ${CLIFF.u} × ${fixed(x.cliff.t, 2)} = ${m(x.cliff.range)}.`,
    },
    {
      id: 'impact',
      kind: 'choice',
      prompt: 'What is the speed of the same stone just before it lands?',
      options: [
        { id: 'right', label: speed(x.cliff.speed), correct: true },
        { id: 'vertical', label: speed(x.cliff.vy) },
        { id: 'added', label: speed(x.cliff.added) },
        { id: 'sideways', label: speed(CLIFF.u) },
      ],
      why: `Down: v = ${fixed(G, 2)} × ${fixed(x.cliff.t, 2)} = ${speed(x.cliff.vy)}. Sideways still ${speed(CLIFF.u, 0)}. Tip to tail: √(${CLIFF.u}² + ${fixed(x.cliff.vy, 1)}²) = ${speed(x.cliff.speed)}.`,
    },
    {
      id: 'golf',
      kind: 'choice',
      prompt: `A golf ball is hit at ${speed(GOLF.u, 0)}, ${deg(GOLF.angle)} above level ground. How high does it rise?`,
      options: [
        { id: 'right', label: m(x.golf.right), correct: true },
        { id: 'whole', label: m(x.golf.whole) },
        { id: 'cos', label: m(x.golf.cos) },
        { id: 'no-two', label: m(x.golf.noTwo) },
      ],
      why: `Up: ${GOLF.u} sin ${deg(GOLF.angle)} = ${speed(launchParts({ u: GOLF.u, angle: GOLF.angle, h: 0 }).uy)}. At the top v = 0, so s = ${fixed(launchParts({ u: GOLF.u, angle: GOLF.angle, h: 0 }).uy, 1)}² ÷ (2 × ${fixed(G, 2)}) = ${m(x.golf.right)}.`,
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
  ],
  youCanNow: [
    'Treat a projectile as two motions on one clock',
    'Find the time of flight from the vertical motion alone',
    'Find how far and how high a projectile goes',
    'Explain why the speed at the top is not zero',
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
