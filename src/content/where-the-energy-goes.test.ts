// Every number in "Where the energy goes" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whereTheEnergyGoes as L, ANSWERS as X, BALL, CLIFF, CYCLIST, LONGER, SLIDE, STONES } from './where-the-energy-goes.ts';
import { landingSpeed, flightTime } from '../physics/projectile.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { Question } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as Question;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = ' ';
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('a dropped stone: 19.8 m s⁻¹', () => {
  near(0.5 * X.drop.right ** 2, 9.81 * CLIFF.h, 1e-9);
  assert.equal(label('drop', 'right'), `19.8${NB}m s⁻¹`);
  assert.equal(label('drop', 'noHalf'), `14.0${NB}m s⁻¹`);
  assert.equal(label('drop', 'noRoot'), `392${NB}m s⁻¹`);
  assert.equal(label('drop', 'gh'), `196${NB}m s⁻¹`);
});

test('explore: the total stays 107 J; the slider ends before stone A lands', () => {
  near(X.flight.total, X.flight.ep0 + X.flight.ek0);
  const s = L.story.find((x) => x.id === 'flight')!;
  assert.ok(s.kind === 'explore' && s.slider.max <= flightTime({ u: CLIFF.u, angle: 45, h: CLIFF.h }));
});

test('the puzzle: every stone hits the sea at 23.2 m s⁻¹, as the projectile model says', () => {
  for (const s of STONES) near(landingSpeed({ u: CLIFF.u, angle: s.angle, h: CLIFF.h }), X.puzzle.right, 1e-9);
  assert.equal(right('hook-again'), 'right');
  assert.equal(label('hook-again', 'right'), `All three at 23.2${NB}m s⁻¹`);
  assert.equal(label('hook-again', 'added'), `All three at 31.8${NB}m s⁻¹`);
  assert.equal(label('hook-again', 'noStart'), `All three at 19.8${NB}m s⁻¹`);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'same'));
});

test('the slide: friction took 413 J, 82.6 N over 5.0 m; without it 7.00 m s⁻¹', () => {
  near(X.slide.right + X.slide.ek, SLIDE.m * 9.81 * SLIDE.h, 1e-9);
  assert.equal(label('slide', 'right'), `413${NB}J`);
  assert.equal(label('slide', 'ek'), `200${NB}J`);
  assert.equal(label('slide', 'ep'), `613${NB}J`);
  assert.equal(label('slide', 'sum'), `813${NB}J`);
  assert.ok(q('slide').why.includes(`7.00${NB}m s⁻¹`));
  near(X.friction.right * SLIDE.L, X.slide.right, 1e-9);
  assert.equal(label('friction', 'right'), `82.6${NB}N`);
  assert.equal(label('friction', 'ep'), `123${NB}N`);
  assert.equal(label('friction', 'ek'), `40.0${NB}N`);
  assert.equal(label('friction', 'height'), `165${NB}N`);
});

test('explore: a longer slide is slower, and friction never takes more than the GPE on the slider', () => {
  assert.ok(X.longer.short > SLIDE.v && SLIDE.v > X.longer.long && X.longer.long > 0);
  assert.ok(X.longer.ekLong > 0);
  const s = L.story.find((x) => x.id === 'longer')!;
  assert.ok(s.kind === 'explore' && s.slider.min === LONGER.min && s.slider.max === LONGER.max && s.slider.start === SLIDE.L);
  assert.ok(s.question.right.includes(`1.67${NB}m s⁻¹`) && s.question.right.includes(`578${NB}J`));
});

test('Skill check: coaster 18.8 m s⁻¹, skater 1.83 m, cyclist 3.30 kJ, ball 0.288 N', () => {
  assert.equal(label('coaster', 'right'), `18.8${NB}m s⁻¹`);
  assert.equal(label('coaster', 'first'), `25.1${NB}m s⁻¹`);
  assert.equal(label('coaster', 'second'), `16.6${NB}m s⁻¹`);
  assert.equal(label('coaster', 'noHalf'), `13.3${NB}m s⁻¹`);
  assert.equal(label('skater', 'right'), `1.83${NB}m`);
  assert.equal(label('skater', 'noHalf'), `3.67${NB}m`);
  assert.equal(label('skater', 'vOverG'), `0.612${NB}m`);
  near(X.cyclist.right, CYCLIST.m * 9.81 * CYCLIST.drop - 0.5 * CYCLIST.m * (CYCLIST.v ** 2 - CYCLIST.u ** 2), 1e-9);
  assert.equal(label('cyclist', 'right'), `3.30${NB}kJ`);
  assert.equal(label('cyclist', 'noStart'), `2.66${NB}kJ`);
  assert.equal(label('cyclist', 'dEk'), `6.12${NB}kJ`);
  assert.equal(label('cyclist', 'ep'), `9.42${NB}kJ`);
  near(X.ball.right * BALL.rise, 0.5 * BALL.m * BALL.u ** 2 - BALL.m * 9.81 * BALL.rise, 1e-9);
  assert.equal(label('ball', 'right'), `0.288${NB}N`);
  assert.equal(label('ball', 'ek'), `2.25${NB}N`);
  assert.equal(label('ball', 'weight'), `1.96${NB}N`);
  assert.equal(label('ball', 'added'), `4.21${NB}N`);
});

test('the lesson is on the map and playable', () => {
  assert.equal(lessons[L.id]?.id, L.id);
  const ref = course.levels.flatMap((l) => l.lessons).find((r) => r.id === L.id);
  assert.ok(ref?.ready);
  assert.deepEqual(ref?.spec, L.spec);
});
