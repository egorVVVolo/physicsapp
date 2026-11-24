// Every number in "Power and efficiency" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { powerAndEfficiency as L, ANSWERS as X, CAR, CRANE, LOAD, RIDE, SPEEDS, WINCH } from './power-and-efficiency.ts';
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
const g = 9.81;

test('each second Kira does 54.0 J against the air: 54.0 W', () => {
  near(X.perSecond.right, 9.0 * 6.0);
  near(X.perSecond.power, X.perSecond.right / 1);
  assert.equal(label('per-second', 'right'), `54.0${NB}J`);
  assert.equal(label('per-second', 'force'), `9.00${NB}J`);
  assert.equal(label('per-second', 'fOverV'), `1.50${NB}J`);
  assert.ok(label('per-second', 'zero').startsWith(`0${NB}J`));
  assert.ok(q('per-second').why.includes(`54.0${NB}W`));
});

test('explore: air resistance grows as v², 9.0 N → 36.0 N, within the slider', () => {
  near(X.faster.d2, 4 * X.faster.d1);
  near(X.faster.d1, 9.0);
  const s = L.story.find((x) => x.id === 'faster')!;
  assert.ok(s.kind === 'explore' && s.slider.min <= RIDE.v && s.slider.max >= RIDE.fast && s.slider.start === RIDE.v);
});

test('the order: four times the force, twice the distance, eight times the power', () => {
  const o = L.story.find((s) => s.id === 'why-cube') as OrderScreen;
  assert.deepEqual(o.steps.map((s) => s.id), ['drag', 'steady', 'far', 'eight']);
  near(X.puzzle.times, 8, 1e-9);
});

test('graph pick: P against v is the cubic (graph B); all three curves end at the same point', () => {
  const s = L.story.find((x) => x.id === 'p-graph') as GraphPickScreen;
  assert.equal(s.graphs.find((gr) => gr.correct)!.id, 'B');
  const pts = (id: string) => (s.graphs.find((gr) => gr.id === id)!.fig as PlotFig).points;
  const at = (id: string, v: number) => pts(id).find((r) => r.x === v)!.y;
  for (const r of pts('B')) near(r.y, 0.25 * r.x ** 3, 1e-9);
  near(at('B', 12), X.puzzle.right, 1e-9);
  near(at('B', 12), 8 * at('B', 6), 1e-9);
  near(at('A', 12), 2 * at('A', 6), 1e-9);
  near(at('C', 12), 4 * at('C', 6), 1e-9);
  for (const id of ['A', 'B', 'C']) near(at(id, SPEEDS.max), 0.25 * SPEEDS.max ** 3, 1e-9);
  const figs = s.graphs.map((gr) => gr.fig as PlotFig);
  assert.equal(new Set(figs.map((f) => JSON.stringify([f.x, f.y]))).size, 1);
  assert.ok(figs[0].y.max > 0.25 * SPEEDS.max ** 3 && figs[0].x.max === SPEEDS.max);
});

test('estimate: 432 W at 12 m s⁻¹; the thumb does not start inside the band', () => {
  const est = L.story.find((s) => s.id === 'at-12') as EstimateScreen;
  near(est.answer, 0.25 * 12 ** 3, 1e-9);
  assert.ok(est.scale.min < est.answer && est.scale.max > est.answer);
  assert.ok(Math.abs((est.scale.min + est.scale.max) / 2 - est.answer) > est.tolerance);
  assert.ok(est.why.includes(`432${NB}W`));
});

test('the puzzle built: P = Dv = 36.0 N × 12 m s⁻¹ = 432 W, eight times 54.0 W', () => {
  near(X.puzzle.right, 8 * X.puzzle.same, 1e-9);
  const b = build('hook-again');
  near(b.result.value, 36 * 12, 1e-9);
  assert.deepEqual(b.boxes, { F: 'drag', v: 'fast' });
  assert.equal(chip(b, 'drag'), `36.0${NB}N`);
  assert.equal(chip(b, 'oldF'), `9.0${NB}N`);
  assert.equal(chip(b, 'oldV'), `6.0${NB}m s⁻¹`);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'eight' && o.correct));
});

test('the winch built: 785 W useful from 1.20 kW, 65.4 % efficient', () => {
  const b = build('winch');
  near(b.result.value, (WINCH.m * g * WINCH.h) / WINCH.t, 1e-9);
  near(b.result.value, 785, 0.5);
  assert.deepEqual(b.boxes, { m: 'mass', g: 'field', h: 'height', t: 'time' });
  assert.equal(chip(b, 'input'), `1.20${NB}kW`);
  assert.equal(chip(b, 'weight'), `1.18${NB}kN`);
  const e = build('efficient');
  near(e.result.value, (100 * b.result.value) / WINCH.input, 1e-9);
  near(e.result.value, 65.4, 0.05);
  assert.equal(chip(e, 'useful'), `785${NB}W`);
  assert.equal(chip(e, 'heat'), `415${NB}W`);
});

test('explore: the same power lifts twice the load at half the speed, within the slider', () => {
  near(X.heavier.double, X.heavier.v / 2, 1e-9);
  const s = L.story.find((x) => x.id === 'heavier')!;
  assert.ok(s.kind === 'explore' && s.slider.min === LOAD.min && s.slider.max >= 2 * WINCH.m && s.slider.start === WINCH.m);
});

test('Skill check: car 1.20 kN (built), efficiency order, lift power, crane 2.94 kW and 58.9 %', () => {
  const b = build('car');
  near(b.result.value * 1000, CAR.P / CAR.v, 1e-9);
  near(b.result.value, 1.2, 1e-9);
  assert.equal(chip(b, 'power'), `30.0${NB}kW`);
  const o = all.find((s) => s.id === 'max-eff') as OrderScreen;
  assert.deepEqual(o.steps.map((s) => s.id), ['cons', 'sum', 'waste', 'less']);
  assert.equal(right('lift-power'), 'right');
  const card = all.find((s) => s.id === 'crane') as ExamCardScreen;
  const [a, bb] = card.parts;
  assert.ok(a.kind === 'build' && bb.kind === 'build');
  if (a.kind === 'build' && bb.kind === 'build') {
    near(a.build.result.value * 1000, (CRANE.m * g * CRANE.h) / CRANE.t, 1e-9);
    near(a.build.result.value, 2.94, 0.005);
    assert.equal(chip(a.build, 'input'), `5.00${NB}kW`);
    near(bb.build.result.value, (100 * (CRANE.m * g * CRANE.h)) / CRANE.t / CRANE.input, 1e-9);
    near(bb.build.result.value, 58.9, 0.05);
    assert.equal(chip(bb.build, 'useful'), `2.94${NB}kW`);
    assert.equal(chip(bb.build, 'heat'), `2.06${NB}kW`);
  }
  assert.equal(a.marks + bb.marks, 3);
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
