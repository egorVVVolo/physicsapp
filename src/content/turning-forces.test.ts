// Every number in "Turning forces" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { turningForces as L, ANSWERS as X, BAR, BOLT, F, PRIYA, TOM, PEDAL, POLE, WHEEL } from './turning-forces.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { BuildScreen, ExamCardScreen, OptionQuestion, SpotErrorScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const NB = ' ';
const NM = `${NB}N${NB}m`;
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);
const RAD = Math.PI / 180;

test('Tom: 40 N at right angles, 0.20 m: 8.0 N m', () => {
  near(X.tom.right, F * TOM.r);
  assert.equal(label('tom', 'right'), `8.0${NM}`);
  assert.equal(label('tom', 'cm'), `800${NM}`);
  assert.equal(label('tom', 'divided'), `200${NM}`);
  assert.equal(label('tom', 'unit'), `8.0${NB}N`);
});

test('explore: along the handle the moment is zero, at right angles 12.0 N m', () => {
  near(X.explore.along, 0);
  near(X.explore.across, 12);
});

test("the puzzle (built): Priya's x is 0.15 m, M = 6.0 N m, less than Tom's 8.0", () => {
  near(X.puzzle.x, PRIYA.r * Math.sin(PRIYA.angle * RAD));
  near(X.puzzle.right, 6);
  assert.ok(X.puzzle.right < X.puzzle.tom);
  const b = build('hook-again');
  near(b.result.value, F * X.puzzle.x);
  assert.deepEqual(b.boxes, { F: 'force', x: 'perp' });
  assert.equal(chip(b, 'perp'), `0.15${NB}m`);
  assert.equal(chip(b, 'point'), `0.30${NB}m`);
  assert.equal(chip(b, 'cos'), `0.26${NB}m`);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.find((o) => o.id === 'tom')!.correct);
});

test('the sign on the pole: horizontal distance 1.73 m, 86.6 N m; Maya used the length (100 N m)', () => {
  assert.equal(right('pole-x'), 'across');
  near(X.pole.x, POLE.L * Math.cos(POLE.angle * RAD));
  near(X.pole.right, 86.6, 0.05);
  const s = L.story.find((x) => x.id === 'pole-error') as SpotErrorScreen;
  const wrong = s.lines.find((l) => l.wrong)!;
  assert.equal(wrong.id, 'x');
  assert.ok(wrong.fix!.includes(`1.73${NB}m`));
  assert.ok(s.lines.find((l) => l.id === 'm')!.text.includes(`100${NM}`));
  assert.ok(s.why.includes(`86.6${NM}`));
});

test('the bar: 15.0 anticlockwise, 10.0 clockwise, resultant 5.0 anticlockwise', () => {
  near(X.bar.left, BAR.left.W * -BAR.left.at);
  near(X.bar.right, -BAR.right.W * BAR.right.at);
  near(X.bar.total, 5);
  assert.equal(label('bar', 'right'), `5.0${NM} anticlockwise`);
  assert.equal(label('bar', 'added'), `25.0${NM} anticlockwise`);
  assert.equal(label('bar', 'bigger'), `5.0${NM} clockwise`);
});

test('Skill check: pedal 25.5 (built), wheel 7.2 (spot the error), exam card bolt 0.416 m', () => {
  const b = build('pedal');
  near(b.result.value, PEDAL.F * PEDAL.r * Math.cos(PEDAL.below * RAD));
  assert.equal(chip(b, 'horizontal'), `0.085${NB}m`);
  assert.equal(chip(b, 'length'), `0.17${NB}m`);
  assert.equal(chip(b, 'sin'), `0.147${NB}m`);
  near(X.wheel.right, 2 * WHEEL.F * (WHEEL.across / 2));
  near(X.wheel.right, 7.2);
  const w = all.find((x) => x.id === 'wheel') as SpotErrorScreen;
  assert.equal(w.lines.find((l) => l.wrong)!.id, 'cancel');
  assert.ok(w.why.includes(`7.2${NM}`));
  const card = all.find((x) => x.id === 'bolt') as ExamCardScreen;
  const [a, bb] = card.parts;
  assert.ok(a.kind === 'build' && bb.kind === 'order');
  near(BOLT.F * Math.sin(BOLT.angle * RAD) * X.bolt.right, BOLT.M);
  if (a.kind === 'build') {
    near(a.build.result.value, 0.416, 0.001);
    assert.equal(chip(a.build, 'angle'), '60°');
    assert.equal(chip(a.build, 'comp'), `217${NB}N`);
  }
  near(X.bolt.ignored, 0.36);
  assert.equal(a.marks + bb.marks, 4);
  assert.equal(right('slide'), 'right');
});

test('the spanner shows the two pulls by their new names', () => {
  const fig = L.story[0].kind === 'intro' ? L.story[0].fig : undefined;
  assert.ok(fig?.kind === 'spanner' && fig.pulls.map((p) => p.who).join() === 'PRIYA,TOM');
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
