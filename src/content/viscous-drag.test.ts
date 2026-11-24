// Every number in "Viscous drag" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { viscousDrag as L, ANSWERS as X, BALLS, CASTOR, EXAM, LAB, START, TEMP, WARM } from './viscous-drag.ts';
import { stokesFall } from '../physics/viscosity.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { BuildScreen, ExamCardScreen, GraphPickScreen, OptionQuestion, OrderScreen, PlotFig, SortScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const NB = ' ';
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);
const g = 9.81;
const cms = (s: string) => `${s}${NB}cm${NB}s⁻¹`;
const pas = (s: string) => `${s}${NB}Pa${NB}s`;
const vol = (r: number) => (4 / 3) * Math.PI * r ** 3;

test('glycerol at 20 °C, the small ball: W, U and the drag at its steady speed', () => {
  near(X.balance.W, 7800 * vol(1e-3) * g, 1e-15);
  near(X.balance.U, 1260 * vol(1e-3) * g, 1e-15);
  near(X.balance.F, X.balance.W - X.balance.U, 1e-15);
  assert.equal(TEMP, 20);
});

test('the order: the weight alone, the drag grows, the resultant shrinks, a steady speed', () => {
  const o = L.story.find((s) => s.id === 'terminal') as OrderScreen;
  assert.deepEqual(o.steps.map((s) => s.id), ['start', 'grows', 'shrinks', 'steady']);
  assert.ok(o.why.includes(`2.69${NB}×${NB}10⁻⁴${NB}N`));
});

test('the hook: the small ball sinks at 1.01 cm s⁻¹', () => {
  near(X.puzzle.same, (2 * 1e-6 * (7800 - 1260) * g) / (9 * 1.41), 1e-12);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.prompt.includes(cms('1.01')) && hook.options.some((o) => o.id === 'four' && o.correct));
});

test('graph pick: the ball speeds up and levels off (graph A); the ramp and the jump are named mistakes', () => {
  const s = L.story.find((x) => x.id === 'vt-graph') as GraphPickScreen;
  assert.equal(s.graphs.find((gr) => gr.correct)!.id, 'A');
  const pts = (id: string) => (s.graphs.find((gr) => gr.id === id)!.fig as PlotFig).points;
  for (const r of pts('A')) near(r.y, stokesFall(r.x / 1000, BALLS.small, 7800, 1260, 1.41).v * 100, 0.02);
  const model = pts('A');
  assert.ok(model[0].y === 0 && model[model.length - 1].y < X.start.vt * 100 * 1.001);
  assert.ok(model[model.length - 1].y > 0.99 * X.start.vt * 100, 'it has levelled off by 6 ms');
  // the same top for all three, and every curve fits on the axes
  const fig = s.graphs.map((gr) => gr.fig as PlotFig);
  assert.equal(new Set(fig.map((f) => JSON.stringify([f.x, f.y]))).size, 1);
  for (const f of fig) assert.ok(f.points.every((r) => r.y <= f.y.max && r.x <= f.x.max));
  assert.ok(fig[0].x.max === START.tMax);
});

test('sort: the six flows, three each', () => {
  const s = L.story.find((x) => x.id === 'flow-sort') as SortScreen;
  for (const bin of s.bins) assert.equal(s.items.filter((it) => it.bin === bin.id).length, 3, `${bin.id}: three items`);
});

test('the flow: glycerol is laminar, water is not', () => {
  assert.equal(right('flowTap'), 'glycerol');
  assert.ok(q('flowTap').why.includes(`62${NB}cm${NB}s⁻¹`));
});

test('the lab built: 9.89 s over 10.0 cm gives η = 1.41 Pa s', () => {
  near(LAB.gap / X.puzzle.same, LAB.time, 0.005); // the time the model gives, to 3 s.f.
  const b = build('lab');
  near(b.result.value, 1.41, 0.005);
  near(b.result.value, X.lab.F / (6 * Math.PI * BALLS.small * LAB.gap * 1 / LAB.time), 1e-9);
  assert.deepEqual(b.boxes, { F: 'drag', r: 'radius', v: 'speed' });
  assert.equal(chip(b, 'drag'), `0.000269${NB}N`);
  assert.equal(chip(b, 'radius'), `0.0010${NB}m`);
  assert.equal(chip(b, 'speed'), `0.0101${NB}m${NB}s⁻¹`);
  assert.equal(chip(b, 'diameter'), `0.0020${NB}m`);
  assert.equal(chip(b, 'weight'), `0.000321${NB}N`);
  assert.equal(chip(b, 'cm'), `1.01${NB}cm${NB}s⁻¹`);
  near(X.lab.diameter, b.result.value / 2, 0.005);
});

test('twice as wide: 8 times as heavy', () => {
  near(X.heavier.ratio, 8, 1e-12);
  assert.equal(right('heavier'), 'right');
  assert.equal(label('heavier', 'right'), '8 times as heavy');
});

test('the puzzle: the big ball sinks at 4.04 cm s⁻¹, four times as fast', () => {
  near(X.puzzle.right / X.puzzle.same, 4, 1e-12);
  assert.equal(right('hook-again'), 'right');
  assert.equal(label('hook-again', 'right'), cms('4.04'));
  assert.ok(label('hook-again', 'same').startsWith(cms('1.01')));
  assert.ok(label('hook-again', 'twice').startsWith(cms('2.02')));
  assert.ok(label('hook-again', 'eight').startsWith(cms('8.09')));
  assert.equal(BALLS.big, 2 * BALLS.small);
});

test('explore: warmer glycerol is runnier, the ball sinks faster', () => {
  const s = L.story.find((x) => x.id === 'warm')!;
  assert.ok(s.kind === 'explore' && s.slider.min === WARM.min && s.slider.max === WARM.max && s.slider.start === TEMP);
  near(X.warm.eta, 0.612, 1e-12);
  assert.ok(X.warm.v > X.puzzle.same);
  assert.ok(s.question.right.includes(cms('2.33')) && s.question.right.includes(pas('0.612')));
});

test('Skill check: castor oil 0.987 Pa s (built), Stokes sort, the bubble, the falling-ball exam card', () => {
  const b = build('castor');
  near(X.castor.right, (2 * CASTOR.r ** 2 * (7800 - CASTOR.rho) * g) / (9 * CASTOR.v), 1e-12);
  near(b.result.value, 0.987, 0.0005);
  assert.deepEqual(b.boxes, { r: 'radius', 'ρ₁': 'steel', 'ρ₂': 'oil', g: 'field', v: 'speed' });
  assert.equal(chip(b, 'radius'), `0.0015${NB}m`);
  assert.equal(chip(b, 'diameter'), `0.0030${NB}m`);
  assert.equal(chip(b, 'speed'), `0.034${NB}m${NB}s⁻¹`);
  assert.equal(chip(b, 'oil'), `960${NB}kg${NB}m⁻³`);
  const s = all.find((x) => x.id === 'stokes-sort') as SortScreen;
  for (const bin of s.bins) assert.equal(s.items.filter((it) => it.bin === bin.id).length, 3);
  assert.equal(right('bubble'), 'right');
  assert.equal(label('bubble', 'right'), 'U = W + F');
  const card = all.find((x) => x.id === 'fall-method') as ExamCardScreen;
  const [a, bb] = card.parts;
  assert.ok(a.kind === 'order' && bb.kind === 'build');
  if (a.kind === 'order') assert.deepEqual(a.steps.map((st) => st.id), ['rest', 'speeds', 'steady', 'marks']);
  if (bb.kind === 'build') {
    near(bb.build.result.value, X.exam.F / (6 * Math.PI * EXAM.r * (EXAM.gap / EXAM.time)), 1e-9);
    near(bb.build.result.value, 1.41, 0.005);
    assert.equal(chip(bb.build, 'drag'), `0.000907${NB}N`);
    assert.equal(chip(bb.build, 'speed'), `0.0227${NB}m${NB}s⁻¹`);
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

test('the recap: 5 s after the drop, 4.04 cm s⁻¹', () => {
  assert.ok(L.recap.text.includes(cms('4.04')));
});

test('the lesson is on the map and playable', () => {
  assert.equal(lessons[L.id]?.id, L.id);
  const ref = course.levels.flatMap((l) => l.lessons).find((r) => r.id === L.id);
  assert.ok(ref?.ready);
  assert.deepEqual(ref?.spec, L.spec);
});
