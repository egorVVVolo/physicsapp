// Every number in "Work done" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { workDoneLesson as L, ANSWERS as X, MOVER, OMAR, STAIRS, TRIP, VAN } from './work-done.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { OptionQuestion } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
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

test('the puzzle: Nadia 0 J, Omar 600 J', () => {
  assert.equal(X.puzzle.nadia, 0);
  near(X.puzzle.omar, 600, 1e-9);
  assert.equal(right('hook-again'), 'right');
  assert.equal(label('hook-again', 'right'), `Nadia 0${NB}J, Omar 600${NB}J`);
  assert.equal(label('hook-again', 'whole'), `Nadia 4410${NB}J, Omar 1200${NB}J`);
  assert.equal(label('hook-again', 'carry'), `Nadia 4410${NB}J, Omar 600${NB}J`);
  assert.equal(label('hook-again', 'omarWhole'), `Nadia 0${NB}J, Omar 1200${NB}J`);
  near(X.puzzle.resistance, 20, 1e-9);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'omar'));
});

test('the ramp: 471 J for every length; the 3.0 m ramp needs 157 N', () => {
  near(X.ramp.work, X.ramp.weight * VAN.h);
  assert.equal(label('ramp-push', 'right'), `157${NB}N`);
  assert.equal(label('ramp-push', 'weight'), `392${NB}N`);
  assert.equal(label('ramp-push', 'into'), `360${NB}N`);
  assert.equal(label('ramp-push', 'times'), `1410${NB}N`);
  near(X.rampPush.right * VAN.L, X.ramp.work);
  const s = L.story.find((x) => x.id === 'ramp')!;
  assert.ok(s.kind === 'explore');
  assert.ok(s.question.options.find((o) => o.correct)!.label.includes(`471${NB}J`));
  assert.ok(s.slider.min > VAN.h, 'the shortest ramp is still longer than the height');
});

test('Skill check: mower 1150 J, stairs 1940 J, slide 60.0 J', () => {
  assert.equal(label('mower', 'right'), `1150${NB}J`);
  assert.equal(label('mower', 'sin'), `964${NB}J`);
  assert.equal(label('mower', 'whole'), `1500${NB}J`);
  assert.equal(label('mower', 'noDistance'), `46.0${NB}J`);
  near(X.stairs.right, STAIRS.m * 9.81 * STAIRS.up);
  assert.equal(label('stairs', 'right'), `1940${NB}J`);
  assert.equal(label('stairs', 'across'), `2590${NB}J`);
  assert.equal(label('stairs', 'along'), `3240${NB}J`);
  assert.equal(label('stairs', 'mass'), `198${NB}J`);
  assert.equal(right('joule'), 'right');
  assert.equal(label('slide', 'right'), `60.0${NB}J, heating the box and the floor`);
});

test('the lesson is on the map and playable', () => {
  assert.equal(lessons[L.id]?.id, L.id);
  const ref = course.levels.flatMap((l) => l.lessons).find((r) => r.id === L.id);
  assert.ok(ref?.ready);
  assert.deepEqual(ref?.spec, L.spec);
});
