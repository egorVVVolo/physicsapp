// Every number in "Keeping balance" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keepingBalance as L, ANSWERS as X, SANA, BARROW, BEAM, BRUNO, BOX, BROOM, CARD, PAINTER } from './keeping-balance.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { BuildScreen, EstimateScreen, ExamCardScreen, OptionQuestion, SortScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const NB = ' '; // a no-break space: a number never parts from its unit
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('the seesaw (an estimate): Bruno balances Sana at 1.2 m, 480 N m each way; the slider does not start on it', () => {
  near(X.explore.right, (SANA.W * SANA.d) / BRUNO.W);
  near(X.explore.totals.clockwise, 480);
  near(X.explore.totals.anticlockwise, 480);
  const s = L.story.find((x) => x.id === 'seesaw') as EstimateScreen;
  near(s.answer, 1.2);
  assert.notEqual((s.scale.min + s.scale.max) / 2, s.answer);
  assert.ok(s.why.includes(`1.2${NB}m`));
});

test('the sorts: down on the right and up on the left are clockwise', () => {
  const s = L.story.find((x) => x.id === 'sense') as SortScreen;
  const bin = (id: string) => s.items.find((i) => i.id === id)!.bin;
  for (const id of ['right', 'upLeft', 'box']) assert.equal(bin(id), 'cw', id);
  for (const id of ['left', 'upRight']) assert.equal(bin(id), 'acw', id);
  const k = all.find((x) => x.id === 'moment-about') as SortScreen;
  const kb = (id: string) => k.items.find((i) => i.id === id)!.bin;
  for (const id of ['left', 'through']) assert.equal(kb(id), 'none', id);
  for (const id of ['painter', 'plank', 'right']) assert.equal(kb(id), 'has', id);
});

test('the box (built): Bruno moves out to 1.35 m', () => {
  near(X.box.right * BRUNO.W, SANA.W * SANA.d + BOX.W * BOX.d);
  const b = build('box');
  near(b.result.value, 1.35);
  assert.equal(chip(b, 'dSana'), `1.60${NB}m`);
  assert.equal(chip(b, 'dBox'), `0.60${NB}m`);
  assert.equal(chip(b, 'before'), `1.20${NB}m`);
  assert.equal(chip(b, 'total'), `800${NB}N`);
});

test('the beam (built): weight at the middle, Zoe 300 N', () => {
  assert.equal(right('beam-cg'), 'middle');
  near(X.beam.right * BEAM.support, BEAM.W * (BEAM.L / 2 - BEAM.support));
  const b = build('beam');
  near(b.result.value, 300);
  assert.equal(chip(b, 'arm'), `0.50${NB}m`);
  assert.equal(chip(b, 'fromEnd'), `1.50${NB}m`);
  assert.equal(chip(b, 'whole'), `3.00${NB}m`);
});

test('the puzzle: the brush piece 6.0 N, the handle 2.0 N, equal moments about the cut', () => {
  near(X.puzzle.brush * BROOM.brush, X.puzzle.handle * BROOM.handle);
  near(X.puzzle.brush + X.puzzle.handle, BROOM.total);
  assert.equal(right('hook-again'), 'right');
  assert.equal(label('hook-again', 'right'), `The brush piece: 6.0${NB}N against 2.0${NB}N`);
  assert.equal(label('hook-again', 'same'), `Neither: 4.0${NB}N each, since it balanced`);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.find((o) => o.id === 'brush')!.correct);
});

test('the painter (built): right trestle 250 N, left 550 N', () => {
  near(X.painter.right * PAINTER.L, PAINTER.W * PAINTER.at + PAINTER.plank * (PAINTER.L / 2));
  near(X.painter.right + X.painter.left, PAINTER.W + PAINTER.plank);
  const b = build('painter');
  near(b.result.value, 250);
  assert.equal(chip(b, 'far'), `3.0${NB}m`);
  assert.equal(chip(b, 'sum'), `800${NB}N`);
  assert.equal(label('painter-left', 'right'), `550${NB}N`);
  assert.equal(label('painter-left', 'forgot'), `350${NB}N`);
  assert.equal(label('painter-left', 'same'), `250${NB}N`);
  assert.equal(label('painter-left', 'all'), `800${NB}N`);
});

test('Skill check: barrow 133 N (built), exam card plank 290 N and 710 N', () => {
  const b = build('barrow');
  near(X.barrow.right * BARROW.handles, BARROW.W * BARROW.d);
  near(b.result.value, 133.33, 0.01);
  assert.equal(chip(b, 'between'), `0.80${NB}m`);
  assert.equal(chip(b, 'wheel'), `267${NB}N`);
  const card = all.find((x) => x.id === 'trestles') as ExamCardScreen;
  const [a, bb] = card.parts;
  assert.ok(a.kind === 'build' && bb.kind === 'build');
  near(X.card.right * CARD.L, CARD.W * CARD.at + CARD.plank * (CARD.L / 2));
  near(X.card.right, 290);
  near(X.card.left, 710);
  near(X.card.left + X.card.right, CARD.W + CARD.plank);
  if (a.kind === 'build' && bb.kind === 'build') {
    near(a.build.result.value, 290);
    near(bb.build.result.value, 710);
    assert.equal(chip(bb.build, 'right'), `290${NB}N`);
    assert.equal(chip(bb.build, 'total'), `1000${NB}N`);
  }
  assert.equal(a.marks + bb.marks, 4);
  assert.equal(right('any'), 'right');
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
