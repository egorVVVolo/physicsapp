// Every number in "Kinetic and potential energy" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kineticAndPotentialEnergy as L, ANSWERS as X, CAR, CRICKET, PARK, SERVE } from './kinetic-and-potential-energy.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { BuildScreen, EstimateScreen, ExamCardScreen, GraphPickScreen, OptionQuestion, OrderScreen, PlotFig } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const NB = ' ';
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('the car at 10 m s⁻¹: 60.0 kJ', () => {
  near(X.ke10.right, 0.5 * CAR.m * CAR.v1 ** 2);
  assert.equal(label('ke10', 'right'), `60.0${NB}kJ`);
  assert.equal(label('ke10', 'halfMv'), `6.00${NB}kJ`);
  assert.equal(label('ke10', 'momentum'), `12.0${NB}kJ`);
  assert.equal(label('ke10', 'noHalf'), `120${NB}kJ`);
});

test('the order: W = FΔs, F = ma, Δs = v² ÷ 2a, then ½mv²', () => {
  const o = L.story.find((s) => s.id === 'why-square') as OrderScreen;
  assert.deepEqual(o.steps.map((s) => s.id), ['work', 'newton', 'suvat', 'sub']);
  assert.ok(o.steps[3].text.includes('½mv²'));
});

test('explore: twice the speed, four times the energy; the slider reaches both speeds', () => {
  near(X.explore.at20, 4 * X.explore.at10);
  const s = L.story.find((x) => x.id === 'square')!;
  assert.ok(s.kind === 'explore' && s.slider.min === 0 && s.slider.max === CAR.v2 && s.slider.start === CAR.v1);
});

test('graph pick: Ek against v is the parabola (graph C); all three curves end at the same point', () => {
  const s = L.story.find((x) => x.id === 'ek-graph') as GraphPickScreen;
  assert.equal(s.graphs.find((gr) => gr.correct)!.id, 'C');
  const pts = (id: string) => (s.graphs.find((gr) => gr.id === id)!.fig as PlotFig).points;
  const parabola = pts('C');
  for (const r of parabola) near(r.y, (0.5 * CAR.m * r.x ** 2) / 1000, 1e-9);
  // doubling the speed quadruples the energy on the right curve, but not on the wrong ones
  const at = (id: string, v: number) => pts(id).find((r) => r.x === v)!.y;
  near(at('C', 20), 4 * at('C', 10), 1e-9);
  near(at('A', 20), 2 * at('A', 10), 1e-9);
  assert.ok(at('B', 20) < 1.5 * at('B', 10));
  for (const id of ['A', 'B', 'C']) near(at(id, 20), X.crane.ek / 1000, 1e-9);
  // the same axes for every curve, and the largest value fits
  const figs = s.graphs.map((gr) => gr.fig as PlotFig);
  assert.equal(new Set(figs.map((f) => JSON.stringify([f.x, f.y]))).size, 1);
  assert.ok(figs[0].y.max > X.crane.ek / 1000 && figs[0].x.max === CAR.v2);
});

test('estimate: the second stage needs three times the work of the first; the scale does not start on the answer', () => {
  near(X.puzzle.ratio, 3, 1e-9);
  const est = L.story.find((s) => s.id === 'ratio') as EstimateScreen;
  near(est.answer, 3);
  const mid = (est.scale.min + est.scale.max) / 2;
  assert.ok(est.scale.min < est.answer && est.scale.max > est.answer);
  assert.ok(Math.abs(mid - est.answer) > est.tolerance, 'the thumb starts outside the tolerance band');
});

test('the puzzle built: 180 kJ from 10 to 20 m s⁻¹, three times the first stage', () => {
  near(X.puzzle.second, 3 * X.puzzle.first, 1e-6);
  const b = build('hook-again');
  near(b.result.value * 1000, 0.5 * CAR.m * (CAR.v2 ** 2 - CAR.v1 ** 2), 1e-6);
  near(b.result.value, 180, 1e-9);
  assert.deepEqual(b.boxes, { m: 'mass', v: 'fast', u: 'slow' });
  assert.equal(chip(b, 'first'), `60.0${NB}kJ`);
  assert.equal(chip(b, 'fast'), `20${NB}m${NB}s⁻¹`);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'second' && o.correct));
});

test('the car park built: 106 kJ, only the rise counts', () => {
  near(X.park.right, CAR.m * 9.81 * PARK.up);
  const b = build('car-park');
  near(b.result.value, 105.948, 1e-3);
  assert.deepEqual(b.boxes, { m: 'mass', g: 'field', 'Δh': 'rise' });
  assert.equal(chip(b, 'ramps'), `120${NB}m`);
  assert.equal(chip(b, 'weight'), `11.8${NB}kN`);
  assert.equal(chip(b, 'field'), `9.81${NB}N${NB}kg⁻¹`);
});

test('the crane: the bars meet at 20.4 m, inside the slider; the van needs the same height', () => {
  near(CAR.m * 9.81 * X.crane.height, X.crane.ek, 1e-6);
  const s = L.story.find((x) => x.id === 'crane')!;
  assert.ok(s.kind === 'explore' && s.slider.max > X.crane.height && s.slider.min === 0);
  assert.ok(s.question.right.includes(`20.4${NB}m`));
  assert.equal(label('van', 'right'), `20.4${NB}m, the same as the car`);
  assert.equal(label('van', 'heavier'), `10.2${NB}m: it is twice as heavy`);
  assert.equal(label('van', 'double'), `40.8${NB}m: it has twice the energy`);
  assert.equal(label('van', 'vOverG'), `2.04${NB}m`);
  near(X.machine, 40 * 9.81 * 1.2);
});

test('Skill check: cricket ball 98.0 J (built), braking order, van at half speed, tennis serve 49.1 m s⁻¹ and 123 m', () => {
  const b = build('cricket');
  near(b.result.value, 0.5 * CRICKET.m * CRICKET.v ** 2);
  near(b.result.value, 98, 1e-9);
  assert.equal(chip(b, 'p'), `5.60${NB}kg${NB}m${NB}s⁻¹`);
  const o = all.find((s) => s.id === 'braking') as OrderScreen;
  assert.deepEqual(o.steps.map((s) => s.id), ['work', 'ek', 'four', 'dist']);
  assert.equal(right('half-speed'), 'right');
  near(X.vanHalf.ratio, 0.5, 1e-12);
  const card = all.find((s) => s.id === 'serve') as ExamCardScreen;
  const [a, bb] = card.parts;
  assert.ok(a.kind === 'build' && bb.kind === 'build');
  if (a.kind === 'build' && bb.kind === 'build') {
    near(0.5 * SERVE.m * a.build.result.value ** 2, SERVE.E, 1e-9);
    near(a.build.result.value, 49.1, 0.05);
    assert.equal(chip(a.build, 'grams'), `58${NB}kg`);
    near(bb.build.result.value * SERVE.m * 9.81, SERVE.E, 1e-9);
    near(bb.build.result.value, 123, 0.05);
    assert.equal(chip(bb.build, 'speed'), `49.1${NB}m s⁻¹`);
  }
  assert.equal(a.marks + bb.marks, 4);
});

test('every option label is different within a question', () => {
  for (const s of all) {
    if (s.kind === 'choice' || s.kind === 'tapFig') {
      const labels = s.options.map((o) => o.label);
      assert.equal(new Set(labels).size, labels.length, `${s.id}: two options read the same: ${labels.join(' | ')}`);
    }
    if (s.kind === 'build') {
      const labels = s.chips.map((c) => c.label);
      assert.equal(new Set(labels).size, labels.length, `${s.id}: two chips read the same: ${labels.join(' | ')}`);
    }
  }
});

test('the lesson is on the map and playable', () => {
  assert.equal(lessons[L.id]?.id, L.id);
  const ref = course.levels.flatMap((l) => l.lessons).find((r) => r.id === L.id);
  assert.ok(ref?.ready);
  assert.deepEqual(ref?.spec, L.spec);
});
