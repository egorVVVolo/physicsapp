// Every number in "Stress, strain, Young modulus" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stressStrainYoung as L, ANSWERS as X, EXPLORE, LAB, LOAD, ROD, TEST, WA, WB } from './stress-strain-young.ts';
import { E_STEEL } from '../physics/young.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { BuildScreen, ExamCardScreen, OptionQuestion, OrderScreen, SpotErrorScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const NB = ' ';
const near = (a: number, b: number, rel = 1e-9) => assert.ok(Math.abs(a - b) <= rel * Math.max(1, Math.abs(b)), `expected ${b}, got ${a}`);
const area = (d: number) => (Math.PI * d * d) / 4;

test('wire A, 0.50 mm across under 60 N: 306 MPa, built with the diameter', () => {
  near(X.stress.right, 60 / area(0.5e-3));
  const b = build('stress');
  near(b.result.value * 1e6, X.stress.right, 1e-9);
  near(b.result.value, 306, 3e-3);
  assert.deepEqual(b.boxes, { F: 'force', d: 'diameter' });
  assert.equal(chip(b, 'force'), `60${NB}N`);
  assert.equal(chip(b, 'diameter'), `0.00050${NB}m`);
  assert.equal(chip(b, 'radius'), `0.00025${NB}m`);
});

test('the strain of A: 1.46 × 10⁻³, and the named mistakes', () => {
  near(X.strain.right, 2.18e-3 / 1.5, 3e-3);
  assert.equal(right('strain'), 'right');
  assert.equal(label('strain', 'right'), '1.46 × 10⁻³');
  assert.equal(label('strain', 'noLength'), '2.18 × 10⁻³');
  assert.equal(label('strain', 'mixed'), '1.46');
  assert.equal(label('strain', 'upside'), '687');
});

test('explore: the slider reaches 70 N and starts at the 60 N of the wires', () => {
  const s = L.story.find((x) => x.id === 'graph')!;
  assert.ok(s.kind === 'explore' && s.slider.max === EXPLORE.max && s.slider.start === LOAD);
});

test('the Young modulus built: 3.06 × 10⁸ Pa ÷ 1.46 × 10⁻³ = 210 GPa', () => {
  const b = build('young');
  near(b.result.value * 1e9, E_STEEL, 1e-9);
  assert.deepEqual(b.boxes, { 'σ': 'stress', 'ε': 'strain' });
  assert.equal(chip(b, 'stress'), `3.06 × 10⁸${NB}Pa`);
  assert.equal(chip(b, 'strain'), '1.46 × 10⁻³');
  assert.equal(chip(b, 'ext'), `2.18${NB}mm`);
});

test('the puzzle built: B stretches 1.09 mm, half as far as A', () => {
  near(X.puzzle.right, X.puzzle.same / 2, 1e-9);
  const b = build('hook-again');
  near(b.result.value, 1.09, 3e-3);
  assert.deepEqual(b.boxes, { F: 'force', L: 'length', A: 'area', E: 'modulus' });
  assert.equal(chip(b, 'area'), `7.85 × 10⁻⁷${NB}m²`);
  assert.equal(chip(b, 'areaA'), `1.96 × 10⁻⁷${NB}m²`);
  assert.equal(chip(b, 'length'), `3.0${NB}m`);
  assert.equal(chip(b, 'lenA'), `1.5${NB}m`);
  assert.equal(chip(b, 'modulus'), `2.10 × 10¹¹${NB}Pa`);
  assert.equal(WB.L, 2 * WA.L);
  assert.equal(WB.d, 2 * WA.d);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'half' && o.correct));
});

test('spotError: the diameter in πr² makes the area 4 times too big and the stress 76.4 MPa', () => {
  const s = L.story.find((x) => x.id === 'error') as SpotErrorScreen;
  assert.equal(s.lines.filter((l) => l.wrong).length, 1);
  assert.equal(s.lines.find((l) => l.wrong)!.id, 'area');
  near(X.error.area, 4 * X.stress.area, 1e-9);
  near(X.error.sigma, X.stress.right / 4, 1e-9);
  assert.ok(s.lines.find((l) => l.id === 'sigma')!.text.includes(`7.64 × 10⁷${NB}Pa`));
});

test('the Core Practical 2 order: length, diameter, loading, graph', () => {
  const o = L.story.find((x) => x.id === 'cp2') as OrderScreen;
  assert.deepEqual(o.steps.map((s) => s.id), ['length', 'diameter', 'load', 'plot']);
  assert.equal(right('long-thin'), 'right');
});

test('the lab built: gradient 16 000 N m⁻¹ on a 1.60 m, 0.40 mm wire gives 204 GPa', () => {
  const b = build('gradient');
  near(b.result.value * 1e9, (LAB.k * LAB.L) / area(LAB.d), 1e-9);
  near(b.result.value, 204, 3e-3);
  assert.deepEqual(b.boxes, { k: 'gradient', L: 'length', d: 'diameter' });
  assert.equal(chip(b, 'gradient'), `16000${NB}N${NB}m⁻¹`);
  assert.equal(chip(b, 'diameter'), `0.00040${NB}m`);
  assert.equal(chip(b, 'radius'), `0.00020${NB}m`);
});

test('Skill check: rod 3.57 mm (built), why the elastic limit matters, halved wire, steel wire 407 MPa and 209 GPa', () => {
  const b = build('extension');
  near(b.result.value / 1e3, (ROD.F * ROD.L) / (ROD.A * E_STEEL), 1e-9);
  near(b.result.value, 3.57, 3e-3);
  assert.equal(chip(b, 'area'), `8.00 × 10⁻⁷${NB}m²`);
  const o = all.find((x) => x.id === 'elastic-why') as OrderScreen;
  assert.deepEqual(o.steps.map((s) => s.id), ['past', 'curve', 'gradient', 'young']);
  assert.equal(right('halved'), 'right');
  const card = all.find((x) => x.id === 'steel-wire') as ExamCardScreen;
  const [a, bb] = card.parts;
  assert.ok(a.kind === 'build' && bb.kind === 'build');
  if (a.kind === 'build' && bb.kind === 'build') {
    near(a.build.result.value * 1e6, TEST.F / area(TEST.d), 1e-9);
    near(a.build.result.value, 407, 2e-3);
    near(bb.build.result.value * 1e9, (TEST.F / area(TEST.d)) / (TEST.dx / TEST.L), 1e-9);
    near(bb.build.result.value, 209, 3e-3);
    assert.equal(chip(a.build, 'diameter'), `0.00050${NB}m`);
    assert.equal(chip(bb.build, 'stress'), `4.07 × 10⁸${NB}Pa`);
    assert.equal(chip(bb.build, 'strain'), '1.95 × 10⁻³');
    assert.equal(chip(bb.build, 'ext'), `3.90${NB}mm`);
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
