// Every number in "Up, stop, down" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { upStopDown as L, ANSWERS as X, CLIFF, DRONE_V, GRADIENT, H, U } from './up-stop-down.ts';
import { G, position, velocity } from '../physics/kinematics.ts';
import type { BuildScreen, EstimateScreen, ExamCardScreen, GraphPickScreen, OptionQuestion, OrderScreen, SpotErrorScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const NB = '\u00A0';
const near = (a: number, b: number, tol = 1e-3) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('ball A: top after u/g = 0.82 s, 3.26 m above the hand, back at the hand after 1.63 s moving at −8.0 m s⁻¹', () => {
  near(X.tTop, U / G);
  near(position(X.tTop, { s0: 0, u: U, a: -G }), X.rise);
  near(X.rise, 3.262);
  near(position(X.tBack, { s0: 0, u: U, a: -G }), 0);
  near(velocity(X.tBack, { s0: 0, u: U, a: -G }), -U);
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

test('the estimate and the build: ball A rises 3.26 m above the hand, built with a = −9.81 m s⁻² and v = 0', () => {
  const est = L.story.find((sc) => sc.id === 'rise') as EstimateScreen;
  near(est.answer, X.rise);
  assert.ok(est.scale.max > est.answer && est.tolerance >= est.scale.step);
  const b = build('height');
  near(b.result.value, (0 - U * U) / (2 * -G));
  assert.deepEqual(b.boxes, { v: 'v0', u: 'uUp', a: 'aDown' });
  assert.equal(chip(b, 'v0'), `0${NB}m${NB}s⁻¹`);
  assert.equal(chip(b, 'uUp'), `+8.0${NB}m${NB}s⁻¹`);
  assert.equal(chip(b, 'aDown'), `−9.81${NB}m${NB}s⁻²`);
  assert.equal(chip(b, 'aUp'), `+9.81${NB}m${NB}s⁻²`);
  assert.equal(chip(b, 'uDown'), `−8.0${NB}m${NB}s⁻¹`);
});

test('the order: v = 0 at the top, then the weight, then v keeps changing, then the turn', () => {
  const o = L.story.find((sc) => sc.id === 'at-top') as OrderScreen;
  assert.deepEqual(o.steps.map((x) => x.id), ['v0', 'weight', 'keeps', 'back']);
  assert.ok(o.steps[1].text.includes(`−9.81${NB}m${NB}s⁻²`));
});

test('the graph pick: the right graph is one straight line from +8.0 m s⁻¹ through zero; the others are speed and a flat line', () => {
  const pick = L.story.find((sc) => sc.id === 'vt') as GraphPickScreen;
  const right = pick.graphs.find((g) => g.correct)!;
  assert.equal(right.fig.kind, 'throwVt');
  if (right.fig.kind === 'throwVt') {
    assert.equal(right.fig.u, U);
    near(right.fig.tEnd, X.tBack);
  }
  const trips = pick.graphs.filter((g) => !g.correct).map((g) => (g.fig.kind === 'graph' ? g.fig.lines[0].trip : null)!);
  const [speedOnly, steady] = trips;
  // speed only: it rises again after the top
  const top = velocity(X.tTop, { s0: 0, u: speedOnly.u, a: speedOnly.phases[0].a });
  near(top, 0);
  assert.ok(speedOnly.phases[1].a > 0);
  assert.equal(steady.phases[0].a, 0);
});

test('Skill check: the stone rises to 21.8 m above the sea (built)', () => {
  near(X.cliff.right, CLIFF.h + (CLIFF.u * CLIFF.u) / (2 * G));
  const b = build('cliff');
  near(b.result.value, X.cliff.right);
  assert.equal(chip(b, 'cliff'), `20.0${NB}m`);
  assert.equal(chip(b, 'speed'), `6.0${NB}m${NB}s⁻¹`);
  assert.equal(chip(b, 'aDown'), `−9.81${NB}m${NB}s⁻²`);
  assert.ok(Math.abs(X.cliff.right - 21.83) < 0.01);
});

test("Skill check: Zara's wrong line has a = +9.81 m s⁻², which gives a negative time", () => {
  const sp = all.find((sc) => sc.id === 'sign') as SpotErrorScreen;
  assert.equal(sp.lines.find((l) => l.wrong)!.id, 'a');
  assert.ok(sp.lines[1].text.includes(`+9.81${NB}m${NB}s⁻²`));
  assert.ok(sp.lines[2].text.includes(`−0.82${NB}s`));
  near(-U / G, -X.tTop);
});

test('Skill check: the parcel keeps the drone’s velocity, its acceleration becomes −g', () => {
  assert.equal(label('drone', 'right'), `v${NB}=${NB}+3.0${NB}m${NB}s⁻¹, a${NB}=${NB}−9.81${NB}m${NB}s⁻²`);
  assert.equal(DRONE_V, 3);
});

test('Core Practical 1: g is twice the gradient of h against t² (the exam card)', () => {
  near(X.g.right, 2 * GRADIENT);
  const card = all.find((sc) => sc.id === 'cp1-card') as ExamCardScreen;
  assert.ok(card.fig?.kind === 'fallGraph' && card.fig.gradient === GRADIENT);
  const [a, b] = card.parts;
  assert.ok(a.kind === 'choice' && a.options.find((o) => o.correct)!.id === 'right');
  assert.ok(b.kind === 'build');
  if (b.kind === 'build') {
    near(b.build.result.value, 9.74, 0.005);
    assert.equal(chip(b.build, 'gradient'), `4.87${NB}m${NB}s⁻²`);
    assert.equal(chip(b.build, 'book'), `9.81${NB}m${NB}s⁻²`);
    assert.equal(chip(b.build, 'two'), '2');
  }
  assert.equal(a.marks + b.marks, 3);
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
  for (const id of ['hook-again']) {
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
