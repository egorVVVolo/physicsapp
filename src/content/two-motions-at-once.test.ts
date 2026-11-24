// Every number in "Two motions at once" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { twoMotionsAtOnce as L, ANSWERS as X, BENCH, CLIFF, GOLF, KICK, PLANE } from './two-motions-at-once.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { BuildScreen, EstimateScreen, ExamCardScreen, GraphPickScreen, OptionQuestion, OrderScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const NB = '\u00A0';
const g = 9.81;
const rad = Math.PI / 180;
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('the bench: dropped and rolled balls land together after 0.505 s; B lands 1.01 m out (the estimate)', () => {
  near(X.bench.t, Math.sqrt((2 * BENCH.h) / g));
  assert.equal(right('race'), 'same');
  const b = build('fall-time');
  near(b.result.value, X.bench.t);
  assert.deepEqual(b.boxes, { h: 'height', g: 'field' });
  assert.equal(chip(b, 'height'), `1.25${NB}m`);
  assert.equal(chip(b, 'field'), `9.81${NB}m${NB}s⁻²`);
  assert.equal(chip(b, 'sideways'), `2.0${NB}m${NB}s⁻¹`);
  assert.equal(chip(b, 'double'), `2.50${NB}m`);
  near(X.bench.range, BENCH.uB * X.bench.t);
  const est = L.story.find((s) => s.id === 'land') as EstimateScreen;
  near(est.answer, X.bench.range);
  assert.ok(est.scale.max > est.answer && est.tolerance >= est.scale.step);
  near(X.bench.step, 0.2);
});

test('twice as fast: the same fall time, twice as far', () => {
  near(X.bench.tC, X.bench.t);
  near(X.bench.rangeC, 2 * X.bench.range);
});

test('the order: no force sideways, so a = 0, so a steady velocity, so s = ut', () => {
  const o = L.story.find((s) => s.id === 'steady') as OrderScreen;
  assert.deepEqual(o.steps.map((x) => x.id), ['no-force', 'no-a', 'steady', 'equal']);
});

test('Mia, 20 m s⁻¹ at 30°: 17.3 along, 10.0 up, 2.04 s, 35.3 m (built from the sideways speed and the whole flight)', () => {
  near(X.mia.ux, KICK.u * Math.cos(KICK.mia * rad));
  near(X.mia.uy, KICK.u * Math.sin(KICK.mia * rad));
  near(X.mia.t, (2 * X.mia.uy) / g);
  assert.equal(label('flight-time', 'right'), `2.04${NB}s`);
  assert.equal(label('flight-time', 'to-top'), `1.02${NB}s`);
  near(X.mia.range, X.mia.ux * X.mia.t);
  const b = build('range');
  near(b.result.value, X.mia.range);
  assert.deepEqual(b.boxes, { u: 'ux', t: 'time' });
  assert.equal(chip(b, 'ux'), `17.3${NB}m${NB}s⁻¹`);
  assert.equal(chip(b, 'time'), `2.04${NB}s`);
  assert.equal(chip(b, 'whole'), `20${NB}m${NB}s⁻¹`);
  assert.equal(chip(b, 'up'), `10.0${NB}m${NB}s⁻¹`);
  assert.equal(chip(b, 'top'), `1.02${NB}s`);
});

test("the graph pick: Mia's vertical velocity starts at +10.0 m s⁻¹ and falls at g; the others are the sideways velocity and a drop", () => {
  const pick = L.story.find((s) => s.id === 'vy') as GraphPickScreen;
  const correct = pick.graphs.find((gr) => gr.correct)!;
  assert.equal(correct.id, 'B');
  const trip = (gr: (typeof pick.graphs)[number]) => (gr.fig.kind === 'graph' ? gr.fig.lines[0].trip : null)!;
  near(trip(correct).u, X.mia.uy);
  near(trip(correct).phases[0].a, -g);
  const [flat, rest] = pick.graphs.filter((gr) => !gr.correct).map(trip);
  near(flat.u, X.mia.ux);
  assert.equal(flat.phases[0].a, 0);
  assert.equal(rest.u, 0);
});

test('the puzzle: Leo at 60° lands at the same spot, 35.3 m; 45° goes furthest, 40.8 m', () => {
  near(X.leo.range, X.mia.range, 1e-9);
  assert.ok(X.leo.t > X.mia.t && X.leo.ux < X.mia.ux);
  assert.equal(right('hook-again'), 'same');
  assert.equal(L.story.find((s) => s.id === 'hook')!.kind, 'predict');
  assert.ok(X.best.range > X.mia.range);
  near(X.best.range, 40.77, 0.01);
});

test('Skill check: the cliff stone lands 30.3 m out (built), its sideways velocity is flat, the plane is right above the package', () => {
  const t = Math.sqrt((2 * CLIFF.h) / g);
  near(X.cliff.range, CLIFF.u * t);
  const b = build('cliff');
  near(b.result.value, X.cliff.range);
  assert.deepEqual(b.boxes, { u: 'speed', h: 'height', g: 'field' });
  assert.equal(chip(b, 'speed'), `15${NB}m${NB}s⁻¹`);
  assert.equal(chip(b, 'height'), `20${NB}m`);
  assert.equal(chip(b, 'time'), `2.02${NB}s`);
  const pick = all.find((s) => s.id === 'stone-sideways') as GraphPickScreen;
  const c = pick.graphs.find((gr) => gr.correct)!;
  assert.ok(c.fig.kind === 'graph' && c.fig.lines[0].trip.u === CLIFF.u && c.fig.lines[0].trip.phases[0].a === 0);
  near(X.plane.x, PLANE.u * Math.sqrt((2 * PLANE.h) / g));
  assert.equal(right('package'), 'above');
});

test('Skill check: the golf ball is in the air 3.28 s and lands 62.7 m away (exam card, 2 + 2 marks)', () => {
  near(X.golfFlight.t, (2 * GOLF.u * Math.sin(GOLF.angle * rad)) / g);
  near(X.golfFlight.range, GOLF.u * Math.cos(GOLF.angle * rad) * X.golfFlight.t);
  const card = all.find((s) => s.id === 'golf') as ExamCardScreen;
  const [a, b] = card.parts;
  assert.ok(a.kind === 'build' && b.kind === 'build');
  if (a.kind === 'build' && b.kind === 'build') {
    near(a.build.result.value, X.golfFlight.t);
    near(b.build.result.value, X.golfFlight.range);
    assert.equal(chip(b.build, 'time'), `3.28${NB}s`);
    assert.equal(chip(a.build, 'other'), '50°');
  }
  assert.equal(a.marks + b.marks, 4);
});

test('every option label is different within a question', () => {
  for (const s of all) {
    if (s.kind === 'choice' || s.kind === 'tapFig') {
      const labels = s.options.map((o) => o.label);
      assert.equal(new Set(labels).size, labels.length, `${s.id}: two options read the same: ${labels.join(' | ')}`);
    }
  }
});

test('the lesson is playable from the map', () => {
  assert.equal(lessons[L.id]?.id, L.id);
  assert.ok(course.levels.flatMap((lv) => lv.lessons).some((l) => l.id === L.id && l.ready));
});
