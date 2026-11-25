// Every number in "Reading material graphs" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readingMaterialGraphs as L, ANSWERS as X, BREAK, EXAM, EXPLORE, LOAD, UNLOAD, WIRE } from './reading-material-graphs.ts';
import { COPPER, E_COPPER, loadingStress, permanentStrain } from '../physics/materials.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { BuildScreen, EstimateScreen, ExamCardScreen, GraphPickScreen, OptionQuestion, PlotFig, SortScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const NB = ' ';
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('the puzzle: stretched to 5.0 × 10⁻³ (240 MPa), 3.0 × 10⁻³ is left', () => {
  near(loadingStress(WIRE.reach), 240e6, 1e-3);
  near(X.hook.right, 3.0e-3, 1e-12);
  near(X.hook.springy, 2.0e-3, 1e-12);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.correct && o.label === '3.0 × 10⁻³'));
});

test('sort: three elastic and three plastic', () => {
  const s = L.story.find((x) => x.id === 'elastic-sort') as SortScreen;
  for (const bin of s.bins) assert.equal(s.items.filter((it) => it.bin === bin.id).length, 3, `${bin.id}: three items`);
});

test('the sketch has the points the legend names, and the tap screens answer them', () => {
  assert.equal(right('elastic-limit'), 'E');
  assert.equal(right('uts'), 'U');
});

test('explore: the slider covers the 5.0 × 10⁻³ of the puzzle', () => {
  const s = L.story.find((x) => x.id === 'release')!;
  assert.ok(s.kind === 'explore' && s.slider.max === EXPLORE.max && s.slider.max >= WIRE.reach * 1e3);
});

test('estimate: 3.0 × 10⁻³ is left; the thumb does not start inside the band', () => {
  const est = L.story.find((s) => s.id === 'left-strain') as EstimateScreen;
  near(est.answer, 3.0, 1e-9);
  assert.ok(est.scale.min < est.answer && est.scale.max > est.answer);
  assert.ok(Math.abs((est.scale.min + est.scale.max) / 2 - est.answer) > est.tolerance);
});

test('the puzzle built: 3.0 × 10⁻³ of 1.50 m is 4.50 mm longer', () => {
  const b = build('hook-again');
  near(b.result.value, 4.5, 1e-9);
  near(b.result.value / 1e3, X.left.right, 1e-12);
  assert.deepEqual(b.boxes, { 'ε': 'left', L: 'length' });
  assert.equal(chip(b, 'left'), '3.0 × 10⁻³');
  assert.equal(chip(b, 'springy'), '2.0 × 10⁻³');
  assert.equal(chip(b, 'all'), '5.0 × 10⁻³');
  assert.equal(chip(b, 'length'), `1.50${NB}m`);
});

test('graph pick: brittle is the straight line to a break (B); all axes the same, numbers hidden', () => {
  const s = L.story.find((x) => x.id === 'brittle') as GraphPickScreen;
  assert.equal(s.graphs.find((gr) => gr.correct)!.id, 'B');
  const fig = (id: string) => s.graphs.find((gr) => gr.id === id)!.fig as PlotFig;
  assert.equal(fig('B').points.length, 2, 'brittle: a straight line');
  assert.ok(fig('A').points.length > 4 && fig('A').points.some((p) => p.y === 1), 'ductile: a peak');
  for (const gr of s.graphs) assert.equal((gr.fig as PlotFig).sketch, true);
  assert.equal(new Set(s.graphs.map((gr) => JSON.stringify([(gr.fig as PlotFig).x, (gr.fig as PlotFig).y]))).size, 1);
  // the brittle line ends well before the ductile one
  assert.ok(fig('B').points[1].x < fig('A').points[fig('A').points.length - 1].x / 2);
});

test('the wire 0.80 mm across breaks at 171 N', () => {
  near(X.load.right, LOAD.uts * (Math.PI * (0.4e-3) ** 2), 1e-9);
  assert.equal(label('load', 'right'), `171${NB}N`);
  assert.equal(label('load', 'radius'), `684${NB}N`);
});

test('Skill check: the 0.60 mm wire breaks at 96.1 N (built)', () => {
  const b = build('breaking');
  near(b.result.value, BREAK.uts * ((Math.PI * BREAK.d ** 2) / 4), 1e-9);
  near(b.result.value, 96.1, 0.05);
  assert.deepEqual(b.boxes, { 'σ': 'uts', d: 'diameter' });
  assert.equal(chip(b, 'uts'), `3.40 × 10⁸${NB}Pa`);
  assert.equal(chip(b, 'diameter'), `0.00060${NB}m`);
  assert.equal(chip(b, 'radius'), `0.00030${NB}m`);
});

test('Skill check: the unloading graph is the parallel line (C), from the model', () => {
  const s = all.find((x) => x.id === 'unloading') as GraphPickScreen;
  assert.equal(s.graphs.find((gr) => gr.correct)!.id, 'C');
  const pts = (id: string) => (s.graphs.find((gr) => gr.id === id)!.fig as PlotFig).points;
  const reach = UNLOAD.reach * 1e3;
  // every curve starts the same way: up the loading curve to the strain reached
  for (const id of ['A', 'B', 'C']) {
    assert.ok(pts(id).some((p) => p.x === reach && Math.abs(p.y - loadingStress(UNLOAD.reach) / 1e6) < 1e-9));
  }
  // the right one ends at the permanent strain on the axis, parallel to the straight part
  const end = pts('C')[pts('C').length - 1];
  const top = pts('C').find((p) => p.x === reach)!;
  near(end.y, 0);
  near(end.x, permanentStrain(UNLOAD.reach) * 1e3, 1e-9);
  near((top.y - end.y) / (top.x - end.x), (E_COPPER / 1e6) / 1e3, 1e-6); // slope E in MPa per 10⁻³
  near(X.unload.perm, 1.714e-3, 1e-6);
  // the retraced one comes back to the origin, the vertical one stays at the strain reached
  assert.deepEqual(pts('A')[pts('A').length - 1], { x: 0, y: 0 });
  assert.deepEqual(pts('B')[pts('B').length - 1], { x: reach, y: 0 });
  assert.ok(COPPER.yieldStrain * 1e3 < reach);
  assert.equal(right('describe'), 'right');
});

test('exam card: 2.5 × 10⁻³ springs back, the 2.0 m wire stays 3.0 mm longer', () => {
  const card = all.find((x) => x.id === 'copper-wire') as ExamCardScreen;
  const [a, bb] = card.parts;
  assert.ok(a.kind === 'build' && bb.kind === 'build');
  if (a.kind === 'build' && bb.kind === 'build') {
    near(a.build.result.value, (EXAM.sigma / E_COPPER) * 1e3, 1e-9);
    near(a.build.result.value, 2.5, 1e-9);
    near(bb.build.result.value, (EXAM.eps - EXAM.sigma / E_COPPER) * EXAM.L * 1e3, 1e-9);
    near(bb.build.result.value, 3.0, 1e-9);
    assert.equal(chip(a.build, 'stress'), `3.00 × 10⁸${NB}Pa`);
    assert.equal(chip(a.build, 'modulus'), `1.20 × 10¹¹${NB}Pa`);
    assert.equal(chip(bb.build, 'back'), '2.5 × 10⁻³');
    assert.equal(chip(bb.build, 'perm'), '1.5 × 10⁻³');
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
