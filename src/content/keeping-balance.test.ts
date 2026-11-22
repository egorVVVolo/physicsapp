// Every number in "Keeping balance" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keepingBalance as L, ANSWERS as X, ANA, BARROW, BEAM, BEN, BOX, BROOM, PAINTER, POLE, RULE } from './keeping-balance.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { OptionQuestion } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = '\u00A0'; // a no-break space: a number never parts from its unit
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('explore: Ben balances Ana at 1.2 m, 480 N m each way', () => {
  near(X.explore.right, (ANA.W * ANA.d) / BEN.W);
  near(X.explore.totals.clockwise, 480);
  near(X.explore.totals.anticlockwise, 480);
  const s = L.story.find((x) => x.id === 'seesaw')!;
  assert.ok(s.kind === 'explore');
  assert.ok(s.question.options.find((o) => o.correct)!.label.startsWith(`1.2${NB}m`));
  // the slider can reach the balance point exactly
  const steps = (X.explore.right - s.slider.min) / s.slider.step;
  near(steps, Math.round(steps), 1e-9);
});

test('the box: Ben moves out to 1.35 m', () => {
  near(X.box.right * BEN.W, ANA.W * ANA.d + BOX.W * BOX.d);
  assert.equal(label('box', 'right'), `1.35${NB}m right of the pivot`);
  assert.equal(label('box', 'forgot'), `1.20${NB}m right of the pivot`);
  assert.equal(label('box', 'atAna'), `1.60${NB}m right of the pivot`);
  assert.equal(label('box', 'subtracted'), `1.05${NB}m right of the pivot`);
});

test('the beam: weight at the middle, Zoe 300 N', () => {
  assert.equal(right('beam-cg'), 'middle');
  near(X.beam.right * BEAM.support, BEAM.W * (BEAM.L / 2 - BEAM.support));
  assert.equal(label('beam', 'right'), `300${NB}N`);
  assert.equal(label('beam', 'same'), `600${NB}N`);
  assert.equal(label('beam', 'fromEnd'), `900${NB}N`);
  assert.equal(label('beam', 'upsideDown'), `1200${NB}N`);
});

test('the puzzle: the brush piece 6.0 N, the handle 2.0 N, equal moments about the cut', () => {
  near(X.puzzle.brush * BROOM.brush, X.puzzle.handle * BROOM.handle);
  near(X.puzzle.brush + X.puzzle.handle, BROOM.total);
  assert.equal(right('hook-again'), 'right');
  assert.equal(label('hook-again', 'right'), `The brush piece: 6.0${NB}N against 2.0${NB}N`);
  assert.equal(label('hook-again', 'same'), `Neither: 4.0${NB}N each, since it balanced`);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'brush'));
});

test('the painter: right trestle 250 N, left 550 N', () => {
  near(X.painter.right * PAINTER.L, PAINTER.W * PAINTER.at + PAINTER.plank * (PAINTER.L / 2));
  near(X.painter.right + X.painter.left, PAINTER.W + PAINTER.plank);
  assert.equal(label('painter', 'right'), `250${NB}N`);
  assert.equal(label('painter', 'forgot'), `150${NB}N`);
  assert.equal(label('painter', 'shared'), `400${NB}N`);
  assert.equal(label('painter', 'swapped'), `550${NB}N`);
  assert.equal(label('painter-left', 'right'), `550${NB}N`);
  assert.equal(label('painter-left', 'forgot'), `350${NB}N`);
  assert.equal(label('painter-left', 'same'), `250${NB}N`);
  assert.equal(label('painter-left', 'all'), `800${NB}N`);
});

test('Skill check: rule 1.50 N, barrow 133 N, pole 130 N', () => {
  near(X.rule.right * (0.5 - RULE.pivot), RULE.load * (RULE.pivot - RULE.at));
  assert.equal(label('rule', 'right'), `1.50${NB}N`);
  assert.equal(label('rule', 'upsideDown'), `0.17${NB}N`);
  assert.equal(label('rule', 'fromZero'), `0.10${NB}N`);
  assert.equal(label('rule', 'equal'), `0.50${NB}N`);
  near(X.barrow.right * BARROW.handles, BARROW.W * BARROW.d);
  assert.equal(label('barrow', 'right'), `133${NB}N`);
  assert.equal(label('barrow', 'wheel'), `267${NB}N`);
  assert.equal(label('barrow', 'upsideDown'), `1200${NB}N`);
  near(X.pole.right * POLE.L, POLE.bucket * (POLE.L - POLE.fromFront) + POLE.W * (POLE.L / 2));
  assert.equal(label('pole', 'right'), `130${NB}N`);
  assert.equal(label('pole', 'back'), `70${NB}N`);
  assert.equal(label('pole', 'forgot'), `90${NB}N`);
  assert.equal(label('pole', 'shared'), `100${NB}N`);
  assert.equal(right('any'), 'right');
});

test('the lesson is on the map and playable', () => {
  assert.equal(lessons[L.id]?.id, L.id);
  const ref = course.levels.flatMap((l) => l.lessons).find((r) => r.id === L.id);
  assert.ok(ref?.ready);
  assert.deepEqual(ref?.spec, L.spec);
});
