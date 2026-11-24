// Every number in "Work done" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { workDoneLesson as L, ANSWERS as X, MOVER, MOWER, OMAR, STAIRS, TRIP, VAN } from './work-done.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { BuildScreen, ExamCardScreen, OptionQuestion, SortScreen, SpotErrorScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const NB = ' ';
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('the mover: 900 J, whatever the steady speed', () => {
  near(X.mover.right, MOVER.friction * MOVER.s);
  assert.equal(label('mover', 'right'), `900${NB}J`);
  assert.equal(label('mover', 'weight'), `2350${NB}J`);
  assert.equal(label('mover', 'divided'), `25.0${NB}J`);
  assert.equal(label('mover', 'zero'), `0${NB}J`);
});

test('explore: 1200 J flat, none straight up; the slider reaches both ends', () => {
  near(X.explore.flat, OMAR.F * TRIP.s);
  assert.equal(X.explore.steep, 0);
  const s = L.story.find((x) => x.id === 'handle')!;
  assert.ok(s.kind === 'explore' && s.slider.min === 0 && s.slider.max === 90);
});

test('the puzzle (built): Nadia 0 J, Omar 600 J', () => {
  assert.equal(X.puzzle.nadia, 0);
  near(X.puzzle.omar, 600, 1e-9);
  const b = build('hook-again');
  near(b.result.value, 600, 1e-9);
  assert.deepEqual(b.boxes, { F: 'pull', s: 'dist', 'θ': 'angle' });
  assert.equal(chip(b, 'weight'), `147${NB}N`);
  assert.equal(chip(b, 'comp'), '30°');
  near(X.puzzle.resistance, 20, 1e-9);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.find((o) => o.id === 'omar')!.correct);
});

test('the sorts: which forces do work', () => {
  const s = L.story.find((x) => x.id === 'which') as SortScreen;
  const bin = (id: string) => s.items.find((i) => i.id === id)!.bin;
  for (const id of ['cable', 'friction']) assert.equal(bin(id), 'work', id);
  for (const id of ['wall', 'tray', 'floor']) assert.equal(bin(id), 'none', id);
  const k = all.find((x) => x.id === 'work-sort') as SortScreen;
  const kb = (id: string) => k.items.find((i) => i.id === id)!.bin;
  for (const id of ['fall', 'brake', 'rope']) assert.equal(kb(id), 'work', id);
  for (const id of ['hold', 'ice']) assert.equal(kb(id), 'none', id);
});

test('the ramp: 471 J for every length; Jonas divided by the height (392 N instead of 157 N)', () => {
  near(X.ramp.work, X.ramp.weight * VAN.h);
  near(X.rampPush.right * VAN.L, X.ramp.work);
  const s = L.story.find((x) => x.id === 'ramp-error') as SpotErrorScreen;
  assert.equal(s.lines.find((l) => l.wrong)!.id, 'ds');
  assert.ok(s.lines.find((l) => l.id === 'f')!.text.endsWith(`392${NB}N`));
  assert.ok(s.why.includes(`157${NB}N`));
  near(X.ramp.work / VAN.h, X.rampPush.weight, 1e-9);
  const e = L.story.find((x) => x.id === 'ramp')!;
  assert.ok(e.kind === 'explore');
  assert.ok(e.question.options.find((o) => o.correct)!.label.includes(`471${NB}J`));
  assert.ok(e.slider.min > VAN.h, 'the shortest ramp is still longer than the height');
});

test('Skill check: mower 1150 J (built), stairs 1940 J (exam card), joule', () => {
  const b = build('mower');
  near(b.result.value, MOWER.F * MOWER.s * Math.cos((MOWER.angle * Math.PI) / 180));
  assert.equal(label('joule', 'right'), 'kg m² s⁻²');
  assert.equal(chip(b, 'comp'), '50°');
  assert.equal(right('joule'), 'right');
  const card = all.find((x) => x.id === 'stairs') as ExamCardScreen;
  const [a, bb] = card.parts;
  assert.ok(a.kind === 'build' && bb.kind === 'order');
  near(X.stairs.right, STAIRS.m * 9.81 * STAIRS.up);
  if (a.kind === 'build') {
    near(a.build.result.value, 1942.38, 0.01);
    assert.equal(chip(a.build, 'across'), `4.8${NB}m`);
    assert.equal(chip(a.build, 'along'), `6.0${NB}m`);
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
