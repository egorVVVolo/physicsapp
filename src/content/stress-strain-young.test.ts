// Every number in "Stress, strain, Young modulus" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stressStrainYoung as L, ANSWERS as X, DIAMETER_ERROR, LAB, LOAD, WA, WB } from './stress-strain-young.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { Question } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as Question;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = ' ';
const near = (a: number, b: number, rel = 1e-9) => assert.ok(Math.abs(a - b) <= rel * Math.abs(b), `expected ${b}, got ${a}`);
const pa = (s: string) => `${s}${NB}Pa`;
const mm = (s: string) => `${s}${NB}mm`;

test('the wires: B is twice as long and twice as wide', () => {
  near(WB.L / WA.L, 2);
  near(WB.d / WA.d, 2);
  assert.equal(LOAD, 60);
});

test('the stress in A is 3.06 × 10⁸ Pa; the wrong ones are named mistakes', () => {
  near(X.stress.right, 60 / (Math.PI * (0.25e-3) ** 2));
  assert.equal(right('stress'), 'right');
  assert.equal(label('stress', 'right'), pa('3.06 × 10⁸'));
  assert.equal(label('stress', 'diameter'), pa('7.64 × 10⁷'));
  assert.equal(label('stress', 'mm2'), pa('3.06 × 10²'));
  assert.equal(label('stress', 'noPi'), pa('9.60 × 10⁸'));
});

test('the strain of A is 1.46 × 10⁻³ for 2.18 mm over 1.5 m', () => {
  near(X.strain.right, 2.1827e-3 / 1.5, 1e-3);
  assert.equal(right('strain'), 'right');
  assert.equal(label('strain', 'right'), '1.46 × 10⁻³');
  assert.equal(label('strain', 'noLength'), '2.18 × 10⁻³');
  assert.equal(label('strain', 'mixed'), '1.46');
  assert.equal(label('strain', 'upside'), '687');
  assert.ok(q('strain').prompt.includes('2.18 mm'));
});

test('explore: the gradient is the Young modulus, not k', () => {
  const s = L.story.find((x) => x.id === 'graph')!;
  assert.ok(s.kind === 'explore' && s.question.options.find((o) => o.correct)!.id === 'right');
  assert.ok(s.kind === 'explore' && s.slider.max === 70 && s.slider.start === LOAD);
});

test('E of the steel is 2.10 × 10¹¹ Pa; the stress and strain in the question are A’s', () => {
  near(X.young.right, 2.1e11, 1e-3);
  assert.equal(right('young'), 'right');
  assert.equal(label('young', 'right'), pa('2.10 × 10¹¹'));
  assert.equal(label('young', 'upside'), pa('4.76 × 10⁻¹²'));
  assert.equal(label('young', 'product'), pa('4.45 × 10⁵'));
  assert.equal(label('young', 'mpa'), pa('2.10 × 10⁵'));
  assert.ok(q('young').prompt.includes('306 MPa') && q('young').prompt.includes('1.46 × 10⁻³'));
});

test('the puzzle: B stretches 1.09 mm, half of A’s 2.18 mm', () => {
  near(X.puzzle.right * 2, X.puzzle.same);
  assert.equal(right('hook-again'), 'right');
  assert.equal(label('hook-again', 'right'), mm('1.09'));
  assert.equal(label('hook-again', 'quarter'), mm('0.55'));
  assert.ok(label('hook-again', 'same').startsWith(mm('2.18')));
  assert.equal(label('hook-again', 'double'), mm('4.37'));
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.label === 'Half as far'));
});

test('the lab: E = kL ÷ A = 2.04 × 10¹¹ Pa', () => {
  near(X.gradient.right, (LAB.k * LAB.L) / (Math.PI * (0.2e-3) ** 2), 1e-9);
  assert.equal(right('gradient'), 'right');
  assert.equal(label('gradient', 'right'), pa('2.04 × 10¹¹'));
  assert.equal(label('gradient', 'radius'), pa('5.09 × 10¹⁰'));
  assert.equal(label('gradient', 'noLength'), pa('1.27 × 10¹¹'));
  assert.equal(label('gradient', 'mm2'), pa('2.04 × 10⁵'));
  assert.equal(right('long-thin'), 'right');
  const plot = q('gradient').fig;
  assert.ok(plot?.kind === 'wire' && plot.view === 'plot' && plot.k === LAB.k);
});

test('Skill check: 3.57 mm, stress strain and E stay, 7.00 × 10¹⁰ Pa, about 4 % too small', () => {
  assert.equal(right('extension'), 'right');
  assert.equal(label('extension', 'right'), mm('3.57'));
  assert.equal(label('extension', 'noLength'), mm('2.38'));
  assert.equal(label('extension', 'divLength'), mm('1.59'));
  assert.equal(label('extension', 'mm2'), `3.57${NB}μm`);
  assert.equal(right('halved'), 'right');
  assert.equal(right('modulus'), 'right');
  assert.equal(label('modulus', 'right'), pa('7.00 × 10¹⁰'));
  assert.equal(label('modulus', 'upside'), pa('1.43 × 10⁻¹¹'));
  assert.equal(label('modulus', 'product'), pa('2.80 × 10⁵'));
  assert.equal(label('modulus', 'unit'), `7.00 × 10¹⁰${NB}N${NB}m⁻¹`);
  assert.equal(right('diameter'), 'right');
  near(X.diameter.ratio, 1 / DIAMETER_ERROR ** 2);
  assert.ok(X.diameter.ratio < 0.97 && X.diameter.ratio > 0.95);
});

test('the recap: 2.18 mm, 1.09 mm and 2.10 × 10¹¹ Pa', () => {
  const t = L.recap.text;
  assert.ok(t.includes(mm('2.18')) && t.includes(mm('1.09')) && t.includes(pa('2.10 × 10¹¹')));
});

test('the lesson is on the map and playable', () => {
  assert.equal(lessons[L.id]?.id, L.id);
  const ref = course.levels.flatMap((l) => l.lessons).find((r) => r.id === L.id);
  assert.ok(ref?.ready);
  assert.deepEqual(ref?.spec, L.spec);
});
