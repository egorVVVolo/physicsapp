// Every number in the lesson is recomputed from the physics model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalReaction as L, ANSWERS, CALC, DOWN_SLOW, EXAM, M, PUZZLE, SLOW, newtons } from './normal-reaction.ts';
import { timeAtRest, G } from '../physics/kinematics.ts';
import type { BuildScreen, EstimateScreen, ExamCardScreen, OptionQuestion, SortScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const NB = '\u00a0';
const near = (a: number, b: number, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('calculation: N = m(g + a) = 881 N for 80 kg at +1.2 m s⁻² (built, with the sign of a as a chip)', () => {
  const b = build('calc');
  near(b.result.value, CALC.m * (G + CALC.a));
  assert.equal(newtons(b.result.value), '881\u00a0N');
  assert.deepEqual(b.boxes, { m: 'mass', g: 'field', a: 'acc' });
  assert.equal(chip(b, 'mass'), `80${NB}kg`);
  assert.equal(chip(b, 'field'), `9.81${NB}N${NB}kg⁻¹`);
  assert.equal(chip(b, 'acc'), `+1.2${NB}m${NB}s⁻²`);
  assert.equal(chip(b, 'down'), `−1.2${NB}m${NB}s⁻²`);
});

test('free fall: the scales read 0 N', () => {
  assert.equal(ANSWERS.freeFall.right, 0);
  assert.equal(label('free-fall', 'zero'), '0\u00a0N');
  assert.equal(label('free-fall', 'weight'), newtons(M * G));
});

test('moving down and slowing: acceleration is upward, N = 886 N for 75 kg (built)', () => {
  const b = build('down-slow');
  near(b.result.value, DOWN_SLOW.m * (G + DOWN_SLOW.a));
  assert.equal(newtons(b.result.value), '886\u00a0N');
  assert.equal(chip(b, 'acc'), `+2.0${NB}m${NB}s⁻²`);
  assert.equal(chip(b, 'down'), `−2.0${NB}m${NB}s⁻²`);
});

test('the exam card: the lift starts down at 1.0 m s⁻², the passenger feels N = 485 N, less than the 540 N weight', () => {
  near(ANSWERS.exam.right, EXAM.m * (G + EXAM.a));
  assert.ok(ANSWERS.exam.right < ANSWERS.exam.weight);
  const card = all.find((s) => s.id === 'passenger') as ExamCardScreen;
  const [a, b] = card.parts;
  assert.ok(a.kind === 'choice' && a.options.find((o) => o.correct)!.id === 'down');
  assert.ok(b.kind === 'build');
  if (b.kind === 'build') {
    near(b.build.result.value, 484.55, 0.01);
    assert.equal(chip(b.build, 'acc'), `−1.0${NB}m${NB}s⁻²`);
    assert.equal(chip(b.build, 'up'), `+1.0${NB}m${NB}s⁻²`);
    assert.equal(chip(b.build, 'weight'), newtons(EXAM.m * G));
  }
  assert.equal(a.marks + b.marks, 3);
});

test('answers follow the physics: at rest N = W, slowing upward N < W, starting up N > W', () => {
  assert.equal(right('at-rest'), 'equal');
  assert.equal(right('slowing'), 'shorter');
  assert.equal(right('hook-again'), 'push');
});

test('the puzzle: 60.0 kg at home, 69.2 kg in a lift starting up at +1.5 m s⁻² (the estimate; scales show N ÷ g)', () => {
  assert.equal(ANSWERS.scales.home, '60.0\u00a0kg');
  assert.equal(ANSWERS.scales.startingUp, '69.2\u00a0kg');
  const est = L.story.find((s) => s.id === 'reading') as EstimateScreen;
  near(est.answer, (M * (G + PUZZLE.a)) / G);
  near(est.answer, 69.17, 0.01);
  assert.equal(est.tolerance, 1.5);
  assert.ok(est.scale.min < ANSWERS.scales.n / G && est.scale.max > est.answer);
  const intro = L.story[0];
  assert.ok(intro.kind === 'intro' && intro.body.includes(ANSWERS.scales.home));
  assert.ok(est.why.includes(ANSWERS.scales.startingUp));
});

test('the sorts: third-law pairs act on two bodies, balanced forces on one', () => {
  const s = L.story.find((sc) => sc.id === 'pair-sort') as SortScreen;
  const bin = (id: string) => s.items.find((i) => i.id === id)!.bin;
  for (const id of ['floor', 'earth', 'book']) assert.equal(bin(id), 'pair', id);
  for (const id of ['rest', 'lamp']) assert.equal(bin(id), 'balanced', id);
  const k = all.find((sc) => sc.id === 'scales-sort') as SortScreen;
  assert.equal(k.items.find((i) => i.id === 'press')!.bin, 'scales');
  assert.equal(k.items.find((i) => i.id === 'push')!.bin, 'person');
});

test('the slowing lift is still moving up for a while (it does not stop at once)', () => {
  const t = timeAtRest({ s0: 0, u: SLOW.u, a: SLOW.a });
  assert.ok(SLOW.u > 0 && SLOW.a < 0 && t !== null && t > 1);
});

test('the return to the puzzle is a new question, not the prediction again', () => {
  const hook = L.story.find((x) => x.id === 'hook')!;
  const again = q('hook-again');
  assert.ok('prompt' in hook && hook.prompt !== again.prompt);
  const labels = again.options.map((o) => o.label);
  assert.equal(new Set(labels).size, labels.length);
});

test('no Skill check question repeats a story prompt', () => {
  const story = new Set(L.story.map((x) => ('prompt' in x ? x.prompt : '')));
  for (const s of L.skillCheck) if ('prompt' in s) assert.ok(!story.has(s.prompt), s.id);
});
