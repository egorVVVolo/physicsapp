// Every number in "Force and acceleration" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forceAndAcceleration as L, ANSWERS as X, FRICTION, LAB, M, PULL, PULL2, ROCKET, TOW } from './force-and-acceleration.ts';
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
const A = `${NB}m${NB}s⁻²`;
const g = 9.81;
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('150 N against 100 N of friction: ΣF = 50 N, a = 1.25 m s⁻² (built)', () => {
  near(X.sum1, PULL - FRICTION);
  near(X.first.right * M, X.sum1);
  const b = build('first-a');
  near(b.result.value, 1.25);
  assert.deepEqual(b.boxes, { pull: 'pull', friction: 'friction', mass: 'mass' });
  assert.equal(chip(b, 'pull'), `150${NB}N`);
  assert.equal(chip(b, 'friction'), `100${NB}N`);
  assert.equal(chip(b, 'mass'), `40${NB}kg`);
  assert.equal(chip(b, 'weight'), `392${NB}N`);
  assert.equal(chip(b, 'sum'), `250${NB}N`);
});

test('the puzzle: twice the pull gives four times the acceleration, 5.00 m s⁻² (the estimate)', () => {
  near(X.second.right * M, PULL2 - FRICTION);
  near(X.second.right / X.first.right, 4);
  const est = L.story.find((s) => s.id === 'double') as EstimateScreen;
  near(est.answer, 5);
  assert.equal(est.tolerance, 0.3);
  assert.ok(est.scale.max > est.answer && est.tolerance >= est.scale.step);
  assert.equal(right('hook-again'), 'resultant');
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'more'));
});

test('the lab: a = 1.96 m s⁻², then a steady 1.40 m s⁻¹ (graph pick and order)', () => {
  const W = LAB.hanging * g;
  near(X.lab.a.right * (LAB.trolley + LAB.hanging), W);
  near(X.lab.vLand, Math.sqrt(2 * X.lab.a.right * LAB.drop));
  near(X.lab.tLand, X.lab.vLand / X.lab.a.right);
  assert.equal(label('lab-a', 'right'), `1.96${A}`);
  assert.equal(label('lab-a', 'trolley-only'), `2.45${A}`);
  assert.equal(label('lab-a', 'by-weight'), `0.200${A}`);
  const pick = L.story.find((s) => s.id === 'lab-graph') as GraphPickScreen;
  const trip = (gr: (typeof pick.graphs)[number]) => (gr.fig.kind === 'graph' ? gr.fig.lines[0].trip : null)!;
  const correct = trip(pick.graphs.find((gr) => gr.correct)!);
  assert.equal(correct.phases[1].a, 0, 'after the landing the line is flat');
  near(correct.phases[0].a, X.lab.a.right);
  const o = L.story.find((s) => s.id === 'slack') as OrderScreen;
  assert.deepEqual(o.steps.map((x) => x.id), ['lands', 'nothing', 'zero', 'steady']);
  assert.ok(o.steps[3].text.includes(`1.40${NB}m${NB}s⁻¹`));
});

test('Skill check: the rocket 6.19 m s⁻² (built), the book slides to rest, the puck has no resultant force', () => {
  const b = build('rocket');
  near(b.result.value, (ROCKET.thrust - ROCKET.m * g) / ROCKET.m);
  assert.deepEqual(b.boxes, { thrust: 'thrust', weight: 'weight', mass: 'mass' });
  assert.equal(chip(b, 'thrust'), `8.0${NB}N`);
  assert.equal(chip(b, 'weight'), `4.91${NB}N`);
  assert.equal(chip(b, 'mass'), `0.50${NB}kg`);
  assert.equal(chip(b, 'sum'), `12.9${NB}N`);
  const pick = all.find((s) => s.id === 'book-graph') as GraphPickScreen;
  const c = pick.graphs.find((gr) => gr.correct)!;
  assert.ok(c.fig.kind === 'graph' && c.fig.lines[0].trip.phases[0].a < 0 && c.fig.lines[0].trip.u > 0);
  assert.equal(right('puck'), 'right');
});

test('Skill check: the tow, a = 1.50 m s⁻² and a tension of 750 N (exam card, 2 + 2 marks)', () => {
  near(X.tow.a, TOW.drive / (TOW.car + TOW.trailer));
  near(X.tow.a, 1.5);
  near(X.tow.right, TOW.trailer * X.tow.a);
  near(TOW.drive - X.tow.right, TOW.car * X.tow.a);
  const card = all.find((s) => s.id === 'tow') as ExamCardScreen;
  const [a, b] = card.parts;
  assert.ok(a.kind === 'build' && b.kind === 'order');
  if (a.kind === 'build') {
    near(a.build.result.value, 1.5);
    assert.equal(chip(a.build, 'drive'), `2400${NB}N`);
    assert.equal(chip(a.build, 'car'), `1100${NB}kg`);
    assert.equal(chip(a.build, 'trailer'), `500${NB}kg`);
    assert.equal(chip(a.build, 'total'), `1600${NB}kg`);
    assert.equal(chip(a.build, 'tension'), `750${NB}N`);
  }
  if (b.kind === 'order') {
    assert.deepEqual(b.steps.map((x) => x.id), ['both', 'bar', 'tension', 'less']);
    assert.ok(b.steps[2].text.includes(`750${NB}N`));
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
