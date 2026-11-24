// Every number in "Falling through air" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fallingThroughAir as L, ANSWERS as X, CASE_VT, CHUTE, CYCLIST, SHUTTLE, SKY, STACK, TUCK } from './falling-through-air.ts';
import { skydive, terminalVelocity, dragConstantFor, fallVtCurve } from '../physics/drag.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { BuildScreen, EstimateScreen, ExamCardScreen, FallVtFig, GraphPickScreen, OptionQuestion, OrderScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const fallVtPoints = (f: FallVtFig) => fallVtCurve(f.curve, f.vt, f.chute, f.tEnd, 0.25);
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const NB = ' ';
const V = `${NB}m${NB}s⁻¹`;
const A = `${NB}m${NB}s⁻²`;
const g = 9.81;
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('the puzzle: four times the weight, twice the terminal velocity, 2.40 m s⁻¹ (an estimate)', () => {
  // drag = kv² = weight for both: (v_stack / v_one)² = 4
  near((X.stack.right / CASE_VT) ** 2, STACK);
  const est = L.story.find((s) => s.id === 'hook-again') as EstimateScreen;
  near(est.answer, 2.4);
  assert.ok(est.scale.min < est.answer && est.scale.max > est.answer);
  assert.notEqual((est.scale.min + est.scale.max) / 2, est.answer);
  assert.ok(est.why.includes(`2.40${V}`));
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'twice'));
  assert.ok(hook.kind === 'predict' && hook.options.find((o) => o.id === 'twice')!.correct);
});

test('the skydiver: a = g at the start, near 50 m s⁻¹ at 15 s, 6.0 m s⁻¹ under the canopy', () => {
  near(X.startA, g);
  assert.equal(label('start-a', 'right'), `9.81${A}`);
  assert.ok(X.at15 > 49.5 && X.at15 < SKY.vt);
  near(skydive(SKY.tEnd, { vt1: SKY.vt, vt2: CHUTE.vt, open: CHUTE.open, inflate: CHUTE.inflate }).v, CHUTE.vt, 1e-2);
  assert.equal(right('chute-dir'), 'right');
});

test('the order: the reasoning chain ends with D = W = 687 N and no resultant', () => {
  const o = L.story.find((s) => s.id === 'why-steady') as OrderScreen;
  assert.deepEqual(o.steps.map((s) => s.id), ['faster', 'shrinks', 'a', 'equal', 'steady']);
  assert.ok(o.steps[3].text.includes(`687${NB}N`));
});

test('terminal velocity built from m, g and k: v = √(mg ÷ k) = 50.0 m s⁻¹', () => {
  const b = build('vt-build');
  near(b.result.value, 50, 1e-9);
  near(X.vt.right, terminalVelocity(SKY.m, X.vt.k));
  near(X.vt.k, dragConstantFor(SKY.m, SKY.vt));
  assert.equal(chip(b, 'k'), `0.275${NB}N${NB}s²${NB}m⁻²`);
  assert.equal(chip(b, 'weight'), `687${NB}N`);
  assert.deepEqual(b.boxes, { m: 'mass', g: 'field', k: 'k' });
  // the shown k, rounded to 3 s.f., gives the same speed to 3 s.f.
  near(Math.sqrt((SKY.m * g) / 0.275), 50, 0.05);
});

test('just after the parachute opens: D = 5.0 W, a = 4.0 g = 39.2 m s⁻² upward (built)', () => {
  assert.equal(X.peak.ratio, 5);
  near(X.peak.right, (X.peak.ratio - 1) * g);
  const b = build('peak');
  near(b.result.value, (X.peak.drag - SKY.m * g) / SKY.m, 1e-9);
  near(b.result.value, 39.24, 0.01);
  assert.equal(chip(b, 'drag'), `3430${NB}N`);
  assert.equal(chip(b, 'sum'), `4120${NB}N`);
  assert.ok(X.peak.t > CHUTE.open && X.peak.t < CHUTE.open + CHUTE.inflate);
});

test('the graph of the parachute: the model curve levels off at 50, then at 6.0; the wrong ones are named mistakes', () => {
  const s = L.story.find((x) => x.id === 'chute-graph') as GraphPickScreen;
  const curve = (id: string) => (s.graphs.find((gr) => gr.id === id)!.fig as FallVtFig).curve;
  assert.equal(s.graphs.find((gr) => gr.correct)!.id, 'B');
  assert.deepEqual([curve('A'), curve('B'), curve('C')], ['straight', 'model', 'stop']);
  for (const gr of s.graphs) assert.ok(gr.correct || gr.hint, gr.id);
  const f = s.graphs[1].fig as FallVtFig;
  const model = fallVtPoints(f);
  near(model[model.length - 1].v, CHUTE.vt, 0.02);
  assert.ok(model.find((r) => r.t === CHUTE.open)!.v > 49.5);
  const stop = fallVtPoints({ ...f, curve: 'stop' });
  assert.equal(stop[stop.length - 1].v, 0);
  const straight = fallVtPoints({ ...f, curve: 'straight' });
  near(straight.find((r) => r.t === 2)!.v, 2 * g, 1e-9); // a = g until it hits 50
  // the scene above the graphs shows no graph
  assert.ok(s.scene && s.scene.kind === 'fall' && !s.scene.graph);
});

test('the same axes for all three graphs of one question', () => {
  for (const id of ['chute-graph', 'tuck']) {
    const s = all.find((x) => x.id === id) as GraphPickScreen;
    const figs = s.graphs.map((gr) => gr.fig as FallVtFig);
    for (const f of figs) {
      assert.equal(f.vt, figs[0].vt);
      assert.equal(f.tEnd, figs[0].tEnd);
      assert.deepEqual(f.chute, figs[0].chute);
    }
  }
});

test('tucking in: the terminal velocity rises to 60 m s⁻¹ (graph C)', () => {
  const s = all.find((x) => x.id === 'tuck') as GraphPickScreen;
  assert.equal(s.graphs.find((gr) => gr.correct)!.id, 'C');
  const f = s.graphs.find((gr) => gr.correct)!.fig as FallVtFig;
  assert.equal(f.chute.vt, TUCK.vt);
  const pts = fallVtPoints(f);
  assert.ok(pts[pts.length - 1].v > 58 && pts[pts.length - 1].v < TUCK.vt);
  assert.ok(pts.find((r) => r.t === TUCK.open)!.v > 49.5); // the same line until she tucks in
});

test('Skill check: cyclist 16.0 m s⁻¹ (built), exam card shuttlecock 5.81 m s⁻²', () => {
  const b = build('cyclist');
  near(b.result.value, CYCLIST.v * Math.sqrt(CYCLIST.push / CYCLIST.drag));
  near(b.result.value, 16, 1e-9);
  assert.equal(chip(b, 'linear'), `32.0${V}`);
  assert.equal(chip(b, 'diff'), `90${NB}N`);
  const card = all.find((s) => s.id === 'shuttle') as ExamCardScreen;
  const [a, bb] = card.parts;
  assert.ok(a.kind === 'build' && bb.kind === 'order');
  if (a.kind === 'build') {
    near(a.build.result.value, (SHUTTLE.m * g - SHUTTLE.drag) / SHUTTLE.m);
    near(a.build.result.value, 5.81, 0.01);
    assert.equal(chip(a.build, 'weight'), `0.0491${NB}N`);
    assert.equal(chip(a.build, 'added'), `0.0691${NB}N`);
  }
  assert.equal(a.marks + bb.marks, 5);
  assert.equal(right('down'), 'right');
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

test('the lesson is playable from the map', () => {
  assert.equal(lessons[L.id]?.id, L.id);
  assert.ok(course.levels.flatMap((lv) => lv.lessons).some((l) => l.id === L.id && l.ready));
});
