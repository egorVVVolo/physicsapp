// Every number in "Splitting a vector" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splittingAVector as L, ANSWERS as X, ANGLE, CLIMB, FROM_VERTICAL, HILL, KITE, PULL, PUSH, RAMP, SKIER } from './splitting-a-vector.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { BuildScreen, EstimateScreen, ExamCardScreen, OptionQuestion, SortScreen, SpotErrorScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const spot = (id: string) => all.find((s) => s.id === id) as SpotErrorScreen;
const NB = '\u00A0';
const rad = Math.PI / 180;
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('Ana: 100 N at 60° gives 50.0 N forward (built) and 86.6 N up', () => {
  near(X.forward, PULL * Math.cos(ANGLE * rad));
  near(X.up, PULL * Math.sin(ANGLE * rad));
  const b = build('forward');
  assert.deepEqual(b.boxes, { pull: 'pull', θ: 'angle' });
  near(b.result.value, X.forward);
  assert.equal(chip(b, 'pull'), `100${NB}N`);
  assert.equal(chip(b, 'angle'), '60°');
  assert.equal(chip(b, 'vertical'), `${FROM_VERTICAL}°`);
  assert.equal(chip(b, 'push'), `60${NB}N`);
  assert.equal(right('which-part'), 'forward');
});

test('the puzzle: Ben wins, 60 N against 50.0 N', () => {
  assert.ok(PUSH > X.forward && PULL > PUSH);
  assert.equal(right('hook-again'), 'ben');
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.equal(hook.kind, 'predict');
});

test('the sort: along the snow, the 50.0 N part and Ben’s push move it; the upward parts lift it', () => {
  const s = L.story.find((sc) => sc.id === 'jobs') as SortScreen;
  const bin = (id: string) => s.items.find((i) => i.id === id)!.bin;
  for (const id of ['along', 'fifty', 'ben']) assert.equal(bin(id), 'forward', id);
  for (const id of ['up', 'eightysix']) assert.equal(bin(id), 'lift', id);
  assert.equal(s.items.find((i) => i.id === 'fifty')!.label, `The 50.0${NB}N part`);
  assert.equal(s.items.find((i) => i.id === 'eightysix')!.label, `The 86.6${NB}N part`);
});

test('the estimate: Ana matches Ben at 53.1°; steeper ropes give a larger upward part', () => {
  near(PULL * Math.cos(X.sameAsBen * rad), PUSH);
  near(X.sameAsBen, 53.13, 0.01);
  near(X.sameAsBenUp, 80, 1e-9);
  const est = L.story.find((s) => s.id === 'match') as EstimateScreen;
  near(est.answer, X.sameAsBen);
  assert.equal(est.tolerance, 5);
  assert.ok(est.after.kind === 'sledge' && Math.abs(est.after.angle - X.sameAsBen) < 1e-9);
  const angle = L.story.find((s) => s.id === 'angle')!;
  assert.ok(angle.kind === 'explore' && angle.question.options.find((o) => o.correct)!.id === 'grows');
  near(X.fromVertical, X.forward);
});

test("Theo's mistake: cos instead of sin on an angle from the vertical, 16.4 N instead of 11.5 N", () => {
  near(X.kite.right, KITE.size * Math.sin(KITE.angle * rad));
  const s = spot('kite');
  const wrong = s.lines.find((l) => l.wrong)!;
  assert.equal(wrong.id, 'cos');
  assert.ok(wrong.text.includes(`16.4${NB}N`) && wrong.text.includes('cos 35°'));
  assert.ok(wrong.fix!.includes(`11.5${NB}N`) && wrong.fix!.includes('sin 35°'));
});

test('the hill: 85.5 N along and 234.9 N into the slope', () => {
  near(X.hill.right, HILL.weight * Math.sin(HILL.angle * rad));
  assert.equal(label('along', 'right'), `85.5${NB}N`);
  assert.equal(label('along', 'cos'), `234.9${NB}N`);
});

test('Skill check: climb 49.9 m s⁻¹ (built), skier 166 N (Iris used cos: 666 N), components statement', () => {
  near(X.climb.right, CLIMB.v * Math.sin(CLIMB.angle * rad));
  const b = build('climb');
  near(b.result.value, X.climb.right);
  assert.equal(chip(b, 'speed'), `240${NB}m${NB}s⁻¹`);
  assert.equal(chip(b, 'angle'), '12°');
  assert.equal(chip(b, 'vertical'), '78°');
  near(X.skier.right, SKIER.m * 9.81 * Math.sin(SKIER.angle * rad));
  const wrong = spot('skier').lines.find((l) => l.wrong)!;
  assert.ok(wrong.text.includes(`666${NB}N`) && wrong.fix!.includes(`166${NB}N`));
  assert.equal(right('components-true'), 'right');
});

test('Skill check: the exam card, 166 N of the 40 kg box’s weight acts along a 25° ramp', () => {
  near(X.ramp.right, RAMP.m * 9.81 * Math.sin(RAMP.angle * rad));
  near(X.ramp.right, 165.8, 0.05);
  const card = all.find((s) => s.id === 'ramp') as ExamCardScreen;
  assert.ok(card.fig?.kind === 'hill' && card.fig.angle === RAMP.angle);
  const [a, b] = card.parts;
  assert.ok(a.kind === 'choice' && a.options.find((o) => o.correct)!.id === 'right');
  assert.ok(b.kind === 'build');
  if (b.kind === 'build') {
    near(b.build.result.value, X.ramp.right);
    assert.equal(chip(b.build, 'mass'), `40${NB}kg`);
    assert.equal(chip(b.build, 'field'), `9.81${NB}N${NB}kg⁻¹`);
    assert.equal(chip(b.build, 'angle'), '25°');
    assert.equal(chip(b.build, 'other'), '65°');
  }
  assert.equal(a.marks + b.marks, 3);
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
