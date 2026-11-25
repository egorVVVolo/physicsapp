// Every number in "Elastic strain energy" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { elasticStrainEnergy as L, ANSWERS as X, DOUBLE, LAUNCHER, SPRING, WIRE } from './elastic-strain-energy.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { BuildScreen, EstimateScreen, ExamCardScreen, OptionQuestion, OrderScreen, SpotErrorScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const NB = ' ';
const near = (a: number, b: number, rel = 1e-9) => assert.ok(Math.abs(a - b) <= rel * Math.abs(b), `expected ${b}, got ${a}`);
const j = (s: string) => `${s}${NB}J`;
const ms = (s: string) => `${s}${NB}m${NB}s⁻¹`;

test('the launcher built: 12 N over 3.0 cm stores 0.18 J', () => {
  near(LAUNCHER.k * LAUNCHER.x, 12);
  near(X.energy.right, 0.18);
  const b = build('energy');
  near(b.result.value, 0.18);
  assert.deepEqual(b.boxes, { F: 'force', 'Δx': 'squash' });
  assert.equal(chip(b, 'force'), `12${NB}N`);
  assert.equal(chip(b, 'squash'), `0.030${NB}m`);
  assert.equal(chip(b, 'cm'), `3.0${NB}cm`);
  assert.equal(chip(b, 'double'), `24${NB}N`);
});

test('estimate: twice the squash, 4 times the energy; the thumb does not start inside the band', () => {
  near(DOUBLE / LAUNCHER.x, 2);
  near(X.stored.ratio, 4);
  const est = L.story.find((s) => s.id === 'times') as EstimateScreen;
  near(est.answer, 4);
  assert.ok(est.scale.min < est.answer && est.scale.max > est.answer);
  assert.ok(Math.abs((est.scale.min + est.scale.max) / 2 - est.answer) > est.tolerance);
});

test('the puzzle built: 6.0 cm and 24 N store 0.72 J, 4 times the 0.18 J', () => {
  const b = build('hook-again');
  near(b.result.value, 0.72);
  assert.deepEqual(b.boxes, { F: 'force', 'Δx': 'squash' });
  assert.equal(chip(b, 'force'), `24${NB}N`);
  assert.equal(chip(b, 'squash'), `0.060${NB}m`);
  assert.equal(chip(b, 'oldF'), `12${NB}N`);
  assert.equal(chip(b, 'oldE'), j('0.18'));
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'four' && o.correct));
});

test('spotError: leaving out the ½ doubles the energy to 1.44 J and the speed to 12.0 m s⁻¹', () => {
  const s = L.story.find((x) => x.id === 'error') as SpotErrorScreen;
  assert.equal(s.lines.filter((l) => l.wrong).length, 1);
  assert.equal(s.lines.find((l) => l.wrong)!.id, 'energy');
  near(X.speed.wrongE, 2 * X.stored.right);
  near(X.speed.wrong, 12.0, 1e-3);
  assert.ok(s.lines.find((l) => l.id === 'v')!.text.includes(ms('12.0')));
  assert.ok(s.lines.find((l) => l.wrong)!.fix!.includes(j('0.720')));
});

test('the chain: stored energy, release, kinetic energy, 8.49 m s⁻¹ (twice 4.24)', () => {
  const o = L.story.find((x) => x.id === 'chain') as OrderScreen;
  assert.deepEqual(o.steps.map((s) => s.id), ['stored', 'release', 'kinetic', 'speed']);
  near(X.speed.right / X.speed.first, 2);
  assert.ok(o.steps[3].text.includes(ms('8.49')) && o.steps[3].text.includes(ms('4.24')));
});

test('the rubber band and the softer spring', () => {
  assert.equal(right('curve'), 'right');
  assert.equal(right('softer'), 'right');
  near(X.softer.A, 2 * X.softer.B);
});

test('Skill check: spring 0.0900 J (built), the wire 0.066 J, 3 times, launcher 0.18 J and 0.92 m', () => {
  const b = build('stretch');
  near(b.result.value, 0.5 * SPRING.k * SPRING.x ** 2);
  near(b.result.value, 0.09);
  assert.equal(chip(b, 'stiff'), `50${NB}N${NB}m⁻¹`);
  assert.equal(chip(b, 'ext'), `0.060${NB}m`);
  assert.equal(chip(b, 'cm'), `6.0${NB}cm`);
  const e = all.find((x) => x.id === 'wire-error') as SpotErrorScreen;
  assert.equal(e.lines.find((l) => l.wrong)!.id, 'sum');
  near(X.wire.right, 0.5 * WIRE.F * WIRE.x);
  near(X.wire.mm, 66, 1e-9);
  assert.ok(e.lines.find((l) => l.id === 'sum')!.text.includes(j('66')));
  assert.ok(e.lines.find((l) => l.wrong)!.fix!.includes(j('0.066')));
  assert.equal(right('band'), 'right');
  near(X.band.ratio, 3);
  const card = all.find((x) => x.id === 'ball-up') as ExamCardScreen;
  const [a, bb] = card.parts;
  assert.ok(a.kind === 'build' && bb.kind === 'build');
  if (a.kind === 'build' && bb.kind === 'build') {
    near(a.build.result.value, 0.18);
    near(bb.build.result.value * 0.02 * 9.81, 0.18, 1e-9);
    near(bb.build.result.value, 0.918, 2e-3);
    assert.equal(chip(a.build, 'stiff'), `400${NB}N${NB}m⁻¹`);
    assert.equal(chip(bb.build, 'energy'), j('0.18'));
    assert.equal(chip(bb.build, 'mass'), `0.020${NB}kg`);
    assert.equal(chip(bb.build, 'grams'), `20${NB}g`);
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
