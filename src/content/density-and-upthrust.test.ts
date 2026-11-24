// Every number in "Density and upthrust" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { densityAndUpthrust as L, ANSWERS as X, BALLOON, BLOCK, DENSITY, DEPTH, ICE, TANK } from './density-and-upthrust.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { BuildScreen, EstimateScreen, ExamCardScreen, OptionQuestion, OrderScreen, SortScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const NB = ' ';
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);
const g = 9.81;
const m3 = (s: string) => `${s}${NB}m³`;

test('the steel block: 1.00 × 10⁻⁴ m³, 100 cm³', () => {
  near(X.volume.right, BLOCK.m / BLOCK.rho);
  assert.equal(label('volume', 'right'), m3('1.00 × 10⁻⁴'));
  assert.equal(label('volume', 'times'), m3('6080'));
  assert.equal(label('volume', 'upside'), m3('1.00 × 10⁴'));
  assert.equal(label('volume', 'gcm3'), m3('0.100'));
  assert.ok(q('volume').why.includes(`100${NB}cm³`));
});

test('under water, built: upthrust 0.981 N, the reading 7.65 → 6.67 N', () => {
  near(X.weigh.right, 1000 * 1e-4 * g);
  near(X.weigh.reading, X.weigh.weight - X.weigh.right);
  const b = build('weigh');
  near(b.result.value, 0.981, 1e-3);
  assert.deepEqual(b.boxes, { 'ρ': 'water', V: 'volume', g: 'field' });
  assert.equal(chip(b, 'water'), `1000${NB}kg${NB}m⁻³`);
  assert.equal(chip(b, 'volume'), m3('1.00 × 10⁻⁴'));
  assert.equal(chip(b, 'steel'), `7800${NB}kg${NB}m⁻³`);
  assert.equal(chip(b, 'weight'), `7.65${NB}N`);
  assert.ok(b.why.includes(`6.67${NB}N`));
});

test('explore: the slider reaches below the block, which is 4.0 cm tall', () => {
  const s = L.story.find((x) => x.id === 'deeper')!;
  assert.ok(s.kind === 'explore' && s.slider.min === DEPTH.min && s.slider.max === DEPTH.max && s.slider.start === DEPTH.start);
  assert.ok(DEPTH.max / 100 > BLOCK.h && DEPTH.start / 100 < BLOCK.h);
  assert.ok(s.question.right.includes(`0.981${NB}N`));
});

test('sort: every solid is on the right side of the density of water', () => {
  const s = L.story.find((x) => x.id === 'float-sink') as SortScreen;
  for (const it of s.items) {
    const rho = Number(/(\d+)/.exec(it.label.replace(/\s/g, ''))![1]);
    assert.equal(it.bin, rho < 1000 ? 'floats' : 'sinks', `${it.id}: ${rho} kg m⁻³`);
  }
  assert.equal(s.items.filter((it) => it.bin === 'floats').length, 3);
});

test('the order: a floating boat displaces 780 cm³ for the 7.65 N it takes on', () => {
  near(X.pushed.right, BLOCK.m / 1000);
  const o = L.story.find((s) => s.id === 'pushed') as OrderScreen;
  assert.deepEqual(o.steps.map((s) => s.id), ['floats', 'adds', 'water', 'volume']);
  assert.ok(o.steps[1].text.includes(`7.65${NB}N`) && o.steps[3].text.includes(`780${NB}cm³`) && o.steps[3].text.includes(`100${NB}cm³`));
});

test('estimate: the level falls 1.36 cm; the thumb does not start inside the band', () => {
  const est = L.story.find((s) => s.id === 'level') as EstimateScreen;
  near(est.answer, 1.36, 0.005);
  near(est.answer / 100, (BLOCK.m / 1000 - BLOCK.m / BLOCK.rho) / TANK.area, 1e-12);
  assert.ok(est.scale.min < est.answer && est.scale.max > est.answer);
  assert.ok(Math.abs((est.scale.min + est.scale.max) / 2 - est.answer) > est.tolerance);
});

test('the puzzle built: the level falls 1.36 cm', () => {
  const b = build('hook-again');
  near(b.result.value, 1.36, 0.005);
  near(b.result.value / 100, ((BLOCK.m / 1000) - BLOCK.m / BLOCK.rho) / TANK.area, 1e-12);
  assert.deepEqual(b.boxes, { 'V₁': 'board', 'V₂': 'bottom', A: 'area' });
  assert.equal(chip(b, 'board'), `780${NB}cm³`);
  assert.equal(chip(b, 'bottom'), `100${NB}cm³`);
  assert.equal(chip(b, 'area'), `500${NB}cm²`);
  assert.equal(chip(b, 'sum'), `880${NB}cm³`);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'fall' && o.correct));
  // the water in the tank stands at 14.0 cm while the block is on board
  near((TANK.water + (TANK.boat + BLOCK.m) / 1000) / TANK.area, 0.14, 1e-12);
});

test('explore: a block as dense as water leaves the level; lead-like 11 000 kg m⁻³ drops it most', () => {
  near(X.denser.same, 0, 1e-15);
  assert.ok(X.denser.lead > X.puzzle.right);
  const s = L.story.find((x) => x.id === 'denser')!;
  assert.ok(s.kind === 'explore' && s.slider.min === DENSITY.min && s.slider.max === DENSITY.max && s.slider.start === BLOCK.rho);
  assert.equal((BLOCK.rho - DENSITY.min) % s.slider.step, 0);
});

test('Skill check: balloon 0.141 N (built), forces sort, river, ice 893 cm³ and 89.3 %', () => {
  const b = build('balloon');
  near(b.result.value, BALLOON.air * BALLOON.V * g, 1e-9);
  near(b.result.value, 0.141, 1e-3);
  assert.equal(chip(b, 'air'), `1.20${NB}kg${NB}m⁻³`);
  assert.equal(chip(b, 'helium'), `0.180${NB}kg${NB}m⁻³`);
  assert.equal(chip(b, 'volume'), m3('1.20 × 10⁻²'));
  const s = all.find((x) => x.id === 'forces') as SortScreen;
  assert.equal(s.bins.length, 3);
  for (const bin of s.bins) assert.equal(s.items.filter((it) => it.bin === bin.id).length, 2, `${bin.id}: two items`);
  assert.equal(right('river'), 'right');
  const card = all.find((x) => x.id === 'ice') as ExamCardScreen;
  const [a, bb] = card.parts;
  assert.ok(a.kind === 'build' && bb.kind === 'build');
  if (a.kind === 'build' && bb.kind === 'build') {
    near(a.build.result.value / 1e6, ICE.m / ICE.sea, 1e-12);
    near(a.build.result.value, 893, 0.5);
    assert.equal(chip(a.build, 'ice'), `920${NB}kg${NB}m⁻³`);
    near(bb.build.result.value, (100 * ICE.rho) / ICE.sea, 1e-9);
    near(bb.build.result.value, 89.3, 0.05);
    assert.equal(chip(bb.build, 'water'), `1000${NB}kg${NB}m⁻³`);
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
