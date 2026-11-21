// Every number in "Reading material graphs" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readingMaterialGraphs as L, ANSWERS as X, LOAD, SKILL, WIRE } from './reading-material-graphs.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import { COMPARE_IDS, SKETCH_IDS, type Question } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as Question;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = ' ';
const near = (a: number, b: number, rel = 1e-9) => assert.ok(Math.abs(a - b) <= rel * Math.abs(b) + 1e-15, `expected ${b}, got ${a}`);
const mm = (s: string) => `${s}${NB}mm`;
const N = (s: string) => `${s}${NB}N`;

test('the puzzle: 3.0 × 10⁻³ of the 5.0 × 10⁻³ stays, 2.0 × 10⁻³ springs back', () => {
  near(X.hook.right, 3.0e-3);
  near(X.hook.springy, 2.0e-3);
  near(X.hook.all, WIRE.reach);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict');
  const labels = hook.kind === 'predict' ? hook.options.map((o) => o.label) : [];
  assert.ok(labels.includes('3.0 × 10⁻³') && labels.includes('2.0 × 10⁻³'));
  assert.ok(labels.some((l) => l.startsWith('5.0 × 10⁻³')));
});

test('the wire stays 4.50 mm longer; the wrong ones are named mistakes', () => {
  near(X.left.right, 4.5e-3);
  assert.equal(right('left'), 'right');
  assert.equal(label('left', 'right'), mm('4.50'));
  assert.equal(label('left', 'springy'), mm('3.00'));
  assert.equal(label('left', 'all'), mm('7.50'));
  assert.ok(label('left', 'zero').startsWith('0 mm'));
});

test('explore: the unloading line is parallel to the loading line', () => {
  const s = L.story.find((x) => x.id === 'release')!;
  assert.ok(s.kind === 'explore' && s.question.options.find((o) => o.correct)!.id === 'right');
  assert.ok(s.kind === 'explore' && s.slider.max === 5 && s.fig.kind === 'material' && s.fig.unload === true);
});

test('the sketch: P E Y U B are the tap targets; E is the elastic limit, U the greatest stress', () => {
  assert.equal(right('elastic-limit'), 'E');
  assert.equal(right('uts'), 'U');
  for (const id of ['elastic-limit', 'uts']) {
    const s = q(id);
    assert.deepEqual(s.options.map((o) => o.id), [...SKETCH_IDS]);
  }
  assert.equal(right('brittle'), 'B');
  assert.deepEqual(q('brittle').options.map((o) => o.id), [...COMPARE_IDS]);
});

test('the largest load: 171 N for a 0.80 mm wire of 340 MPa', () => {
  near(X.load.right, LOAD.uts * Math.PI * 0.4e-3 ** 2);
  assert.equal(right('load'), 'right');
  assert.equal(label('load', 'right'), N('171'));
  assert.equal(label('load', 'radius'), N('684'));
  assert.equal(label('load', 'noPi'), N('218'));
  assert.equal(label('load', 'mm2'), N('1.71 × 10⁸'));
});

test('Skill check: stays longer, 3.0 mm, ductile, 680 N', () => {
  assert.equal(right('beyond'), 'right');
  near(X.permanent.right, 3.0e-3);
  assert.equal(right('permanent'), 'right');
  assert.equal(label('permanent', 'right'), mm('3.00'));
  assert.equal(label('permanent', 'springy'), mm('5.00'));
  assert.equal(label('permanent', 'all'), mm('8.00'));
  assert.equal(right('describe'), 'right');
  assert.equal(SKILL.ratio, 4);
  assert.equal(right('thick'), 'right');
  assert.equal(label('thick', 'right'), N('680'));
  assert.equal(label('thick', 'twice'), N('340'));
  assert.equal(label('thick', 'eight'), N('1360'));
});

test('the recap: 2.0 × 10⁻³ springs back, 3.0 × 10⁻³ stays', () => {
  assert.ok(L.recap.text.includes('2.0 × 10⁻³') && L.recap.text.includes('3.0 × 10⁻³'));
});

test('the lesson is on the map and playable', () => {
  assert.equal(lessons[L.id]?.id, L.id);
  const ref = course.levels.flatMap((l) => l.lessons).find((r) => r.id === L.id);
  assert.ok(ref?.ready);
  assert.deepEqual(ref?.spec, L.spec);
});
