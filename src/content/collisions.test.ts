// Every number in "Collisions" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collisions as L, ANSWERS as X, STICK_GRAPHS, A, APART, B, BOUNCE, C, D, GLIDERS, WAGONS } from './collisions.ts';
import { tripVelocity } from '../physics/kinematics.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { BuildScreen, EstimateScreen, ExamCardScreen, GraphFig, GraphPickScreen, OptionQuestion, OrderScreen, SpotErrorScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const NB = ' ';
const V = `${NB}m${NB}s⁻¹`;
const P = `${NB}kg${NB}m${NB}s⁻¹`;
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);
/** Total momentum before = total after, worked out by hand for each case. */
const conserved = (m1: number, u1: number, v1: number, m2: number, u2: number, v2: number) => near(m1 * u1 + m2 * u2, m1 * v1 + m2 * v2);

test('A sticks to B at rest (an estimate): 0.75 m s⁻¹, the scale does not start on it; the explore keeps Σp at 1.20', () => {
  conserved(A.m, A.u, X.stick.right, B.m, 0, X.stick.right);
  const est = L.story.find((s) => s.id === 'stick') as EstimateScreen;
  near(est.answer, 0.75);
  assert.notEqual((est.scale.min + est.scale.max) / 2, est.answer);
  assert.ok(est.why.includes(`0.75${V}`));
  near(X.explore.total, A.m * A.u);
  near(X.explore.light, 1.2);
  near(X.explore.heavy, 0.375);
});

test('the v–t graphs of the stick: lines meet at 0.75; the wrong ones are a bounce and a gain of momentum', () => {
  const s = L.story.find((x) => x.id === 'stick-graph') as GraphPickScreen;
  assert.equal(s.graphs.find((g) => g.correct)!.id, 'C');
  const line = (id: string, who: string) => (s.graphs.find((g) => g.id === id)!.fig as GraphFig).lines.find((l) => l.id === who)!.trip;
  const end = (id: string, who: string) => tripVelocity(0.6, line(id, who));
  // right: both end at the common speed
  near(end('C', 'A'), 0.75);
  near(end('C', 'B'), 0.75);
  conserved(A.m, A.u, end('C', 'A'), B.m, 0, end('C', 'B'));
  // A: equal masses bounce (swap speeds), momentum is kept but they do not stay together
  near(end('A', 'A'), STICK_GRAPHS.swap.vA);
  near(end('A', 'B'), 1.5);
  conserved(A.m, A.u, end('A', 'A'), B.m, 0, end('A', 'B'));
  assert.notEqual(end('A', 'A'), end('A', 'B'));
  // B: B gets 1.5 while A keeps 0.75 — momentum would grow
  assert.ok(A.m * end('B', 'A') + B.m * end('B', 'B') > A.m * A.u + 1e-9);
  for (const g of s.graphs) assert.ok(g.correct || g.hint, g.id);
});

test('head-on with D (built): 0.50 m s⁻¹ to the right, five boxes in one formula', () => {
  conserved(A.m, A.u, X.headOn.right, D.m, D.u, X.headOn.right);
  const b = build('head-on');
  near(b.result.value, 0.5);
  assert.deepEqual(b.boxes, { 'm₁': 'mA', 'u₁': 'uA', 'm₂': 'mD', 'u₂': 'uD', M: 'total' });
  assert.equal(chip(b, 'uD'), `−1.5${V}`);
  assert.equal(chip(b, 'total'), `1.20${NB}kg`);
  assert.equal(chip(b, 'p'), `1.20${P}`);
});

test('the puzzle: A and C stop dead', () => {
  near(X.puzzle.right, 0);
  conserved(A.m, A.u, 0, C.m, C.u, 0);
  assert.equal(right('hook-again'), 'right');
  assert.equal(label('hook-again', 'averaged'), `0.25${V} to the right`);
  assert.equal(label('hook-again', 'sizes'), `1.20${V} to the right`);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.find((o) => o.id === 'stop')!.correct);
});

test('pushed apart (order): equal and opposite momenta; the bounce: C at 1.20 right', () => {
  conserved(A.m, 0, APART.vA, C.m, 0, X.apart.right);
  near(A.m * APART.vA, -C.m * X.apart.right);
  const o = L.story.find((s) => s.id === 'recoil') as OrderScreen;
  assert.deepEqual(o.steps.map((s) => s.id), ['rest', 'forces', 'equal', 'zero', 'fast']);
  assert.ok(o.why.includes('−0.72') && o.why.includes('+0.72'));
  conserved(A.m, A.u, BOUNCE.vA, C.m, 0, X.bounce.right);
  assert.equal(label('bounce', 'right'), `1.20${V} to the right`);
  assert.equal(label('bounce', 'sign'), `0.80${V} to the right`);
  assert.equal(label('bounce', 'left-out'), `1.00${V} to the right`);
  assert.equal(label('bounce', 'a-speed'), `1.5${V} to the right`);
});

test('Skill check: wagons 1.88 (built), gliders 1.0 (spot the error), exam card spring 0.60 right', () => {
  const b = build('wagons');
  conserved(WAGONS.m1, WAGONS.u, X.wagons.right, WAGONS.m2, 0, X.wagons.right);
  near(b.result.value, 1.875);
  assert.equal(chip(b, 'moving'), `25${NB}000${NB}kg`);
  assert.equal(chip(b, 'total'), `40${NB}000${NB}kg`);
  conserved(GLIDERS.m1, GLIDERS.u1, X.gliders.right, GLIDERS.m2, GLIDERS.u2, GLIDERS.v2);
  near(X.gliders.right, 1);
  near(X.gliders.signsDropped, 3);
  const s = all.find((x) => x.id === 'gliders') as SpotErrorScreen;
  assert.equal(s.lines.find((l) => l.wrong)!.id, 'before');
  assert.ok(s.lines.find((l) => l.id === 'after')!.text.includes(`+3.0${V}`));
  assert.ok(s.why.includes('+1.0'));
  const card = all.find((x) => x.id === 'release') as ExamCardScreen;
  const [a, bb] = card.parts;
  assert.ok(a.kind === 'build' && bb.kind === 'choice');
  near(X.apart.right, 0.6);
  if (a.kind === 'build') {
    near(a.build.result.value, 0.6);
    assert.equal(chip(a.build, 'vA'), `−0.90${V}`);
  }
  if (bb.kind === 'choice') {
    assert.equal(bb.options.find((o) => o.correct)!.id, 'zero');
    assert.equal(bb.options.find((o) => o.id === 'right')!.label, `0.72${P} to the right`);
  }
  assert.equal(a.marks + bb.marks, 3);
  assert.equal(right('falling'), 'right');
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
