// Every number in "Up, stop, down" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { upStopDown as L, ANSWERS as X, CLIFF, DRONE_V, GRADIENT, H, U } from './up-stop-down.ts';
import { G, position, velocity } from '../physics/kinematics.ts';
import type { OptionQuestion } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = '\u00A0';
const near = (a: number, b: number, tol = 1e-3) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('ball A: top after u/g = 0.82 s, 3.26 m above the hand, back at the hand after 1.63 s moving at −8.0 m s⁻¹', () => {
  near(X.tTop, U / G);
  near(position(X.tTop, { s0: 0, u: U, a: -G }), X.rise);
  near(X.rise, 3.262);
  near(position(X.tBack, { s0: 0, u: U, a: -G }), 0);
  near(velocity(X.tBack, { s0: 0, u: U, a: -G }), -U);
  assert.equal(label('back', 'minus'), `−8.0${NB}m${NB}s⁻¹`);
  assert.equal(right('back'), 'minus');
});

test('the puzzle: both balls land at 17.3 m s⁻¹, whichever way they were thrown', () => {
  near(X.impact.right, Math.sqrt(U * U + 2 * G * H));
  assert.equal(X.impact.right, X.impact.ballB);
  near(Math.abs(velocity(X.tA, { s0: 0, u: U, a: -G })), X.impact.right);
  near(Math.abs(velocity(X.tB, { s0: 0, u: -U, a: -G })), X.impact.right);
  assert.equal(label('hook-again', 'right'), `17.3${NB}m${NB}s⁻¹`);
  assert.equal(label('hook-again', 'from-rest'), `15.3${NB}m${NB}s⁻¹`);
  assert.equal(label('hook-again', 'added'), `23.3${NB}m${NB}s⁻¹`);
  assert.equal(label('hook-again', 'minus-u2'), `13.1${NB}m${NB}s⁻¹`);
  assert.ok(L.recap.text.includes(label('hook-again', 'right')));
});

test('the roots of −12.0 = 8.0t − 4.905t²: 2.58 s and −0.95 s; the negative one is ball B’s time', () => {
  near(position(X.tA, { s0: 0, u: U, a: -G }), -H);
  near(position(X.tNeg, { s0: 0, u: U, a: -G }), -H);
  assert.ok(X.tNeg < 0 && X.tA > 0);
  near(-X.tNeg, X.tB); // a neat fact, not shown: running ball A backwards in time is ball B forwards
  assert.equal(label('roots', 'right'), `2.58${NB}s after the throw`);
  assert.equal(label('roots', 'unsigned'), `0.95${NB}s after the throw`);
  assert.equal(label('roots', 'back'), `1.63${NB}s after the throw`);
  assert.equal(label('roots', 'sum'), `3.53${NB}s after the throw`);
  assert.ok(q('roots').prompt.includes(`t${NB}=${NB}2.58${NB}s or t${NB}=${NB}−0.95${NB}s`));
});

test('the signed values: s = −12.0 m, u = +8.0 m s⁻¹, a = −9.81 m s⁻²', () => {
  assert.equal(label('values', 'right'), `s${NB}=${NB}−12.0${NB}m, u${NB}=${NB}+8.0${NB}m${NB}s⁻¹, a${NB}=${NB}−9.81${NB}m${NB}s⁻²`);
  const labels = q('values').options.map((o) => o.label);
  assert.equal(new Set(labels).size, labels.length);
});

test('Skill check: ball A lands 2u/g = 1.63 s after ball B', () => {
  near(X.later.right, (2 * U) / G);
  assert.equal(label('later', 'right'), `1.63${NB}s`);
  assert.equal(label('later', 'only-up'), `0.82${NB}s`);
  assert.equal(label('later', 'whole'), `2.58${NB}s`);
});

test('Skill check: the stone rises to 21.8 m above the sea', () => {
  near(X.cliff.right, CLIFF.h + (CLIFF.u * CLIFF.u) / (2 * G));
  assert.equal(label('cliff', 'right'), `21.8${NB}m`);
  assert.equal(label('cliff', 'no-cliff'), `1.8${NB}m`);
  assert.equal(label('cliff', 'lost-half'), `23.7${NB}m`);
});

test('Skill check: the parcel keeps the drone’s velocity, its acceleration becomes −g', () => {
  assert.equal(label('drone', 'right'), `v${NB}=${NB}+3.0${NB}m${NB}s⁻¹, a${NB}=${NB}−9.81${NB}m${NB}s⁻²`);
  assert.equal(DRONE_V, 3);
});

test('Core Practical 1: g is twice the gradient of h against t²', () => {
  near(X.g.right, 2 * GRADIENT);
  assert.equal(label('gradient', 'right'), `9.74${NB}m${NB}s⁻²`);
  assert.equal(label('gradient', 'half'), `2.44${NB}m${NB}s⁻²`);
  assert.equal(label('gradient', 'book'), `9.81${NB}m${NB}s⁻²`);
  assert.equal(right('timer'), 'gate');
});

test('answers follow the physics: a points down at the top, and a is never zero', () => {
  assert.equal(right('top'), 'down');
  const scrub = L.story.find((s) => s.id === 'scrub');
  assert.ok(scrub?.kind === 'explore' && scrub.question.options.find((o) => o.correct)?.id === 'never');
});

test('the explore slider starts on a step at the top, and stops before ball A is back at the hand', () => {
  const scrub = L.story.find((s) => s.id === 'scrub');
  assert.ok(scrub?.kind === 'explore');
  const { min, max, step, start } = scrub.slider;
  assert.ok(start !== undefined && start >= min && start <= max);
  near(Math.round(start / step) * step, start, 1e-9);
  assert.ok(Math.abs(start - X.tTop) <= step / 2);
  assert.ok(max < X.tBack, 'the slider would show the speed back at the hand, which a later question asks');
});

test('number options go up in size, so the right one is not always in the same place', () => {
  for (const id of ['hook-again', 'roots', 'later', 'cliff', 'gradient']) {
    const values = q(id).options.map((o) => parseFloat(o.label.replace('−', '-')));
    assert.deepEqual(values, [...values].sort((a, b) => a - b), id);
    assert.equal(new Set(values).size, values.length, `${id}: two options are the same`);
  }
});

test('numbers never break from their units', () => {
  for (const s of all) {
    const texts = [...('prompt' in s ? [s.prompt] : []), ...('body' in s ? [s.body].flat() : []), ...('why' in s ? [s.why] : []), ...('options' in s ? s.options.map((o) => o.label) : [])];
    for (const t of texts) assert.ok(!/\d (kg|N|m|s)\b/.test(t) && !/ m s⁻/.test(t), `${s.id}: use a no-break space before units in "${t}"`);
  }
});

test('the return to the puzzle is a new question, not the prediction again', () => {
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok('prompt' in hook && hook.prompt !== q('hook-again').prompt);
});

test('no Skill check question repeats a story prompt', () => {
  const story = new Set(L.story.map((s) => ('prompt' in s ? s.prompt : '')));
  for (const s of L.skillCheck) if ('prompt' in s) assert.ok(!story.has(s.prompt), s.id);
});

test('nothing before the revisit gives away the landing speed', () => {
  const i = L.story.findIndex((s) => s.id === 'hook-again');
  const before = JSON.stringify(L.story.slice(0, i));
  assert.ok(!before.includes('17.3'), 'the landing speed appears before the puzzle is answered');
  for (const s of L.story.slice(0, i)) if ('fig' in s && s.fig?.kind === 'throw') assert.ok(!(s.fig.play && s.fig.values), `${s.id}: a playing figure with values shows the landing speed`);
});
