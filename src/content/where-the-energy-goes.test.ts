// Every number in "Where the energy goes" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whereTheEnergyGoes as L, ANSWERS as X, CLIFF, COASTER, CYCLIST, LONGER, SKATER, SLIDE, STONES } from './where-the-energy-goes.ts';
import { landingSpeed, flightTime } from '../physics/projectile.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { BuildScreen, EstimateScreen, ExamCardScreen, OptionQuestion, SortScreen, SpotErrorScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const NB = ' ';
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('a dropped stone: 19.8 m s⁻¹', () => {
  near(0.5 * X.drop.right ** 2, 9.81 * CLIFF.h, 1e-9);
  assert.equal(label('drop', 'right'), `19.8${NB}m s⁻¹`);
  assert.equal(label('drop', 'noHalf'), `14.0${NB}m s⁻¹`);
  assert.equal(label('drop', 'noRoot'), `392${NB}m s⁻¹`);
  assert.equal(label('drop', 'gh'), `196${NB}m s⁻¹`);
});

test('explore: the total stays 107 J; the slider ends before stone A lands', () => {
  near(X.flight.total, X.flight.ep0 + X.flight.ek0);
  const s = L.story.find((x) => x.id === 'flight')!;
  assert.ok(s.kind === 'explore' && s.slider.max <= flightTime({ u: CLIFF.u, angle: 45, h: CLIFF.h }));
});

test('the puzzle: every stone hits the sea at 23.2 m s⁻¹, as the projectile model says', () => {
  for (const s of STONES) near(landingSpeed({ u: CLIFF.u, angle: s.angle, h: CLIFF.h }), X.puzzle.right, 1e-9);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'same' && o.correct));
});

test('estimate: stone B hits the sea at 23.2 m s⁻¹; the thumb does not start inside the band', () => {
  const est = L.story.find((s) => s.id === 'sea-speed') as EstimateScreen;
  near(est.answer, landingSpeed({ u: CLIFF.u, angle: 0, h: CLIFF.h }), 1e-9);
  assert.ok(est.scale.min < est.answer && est.scale.max > est.answer);
  assert.ok(Math.abs((est.scale.min + est.scale.max) / 2 - est.answer) > est.tolerance);
  assert.ok(est.why.includes(`23.2${NB}m s⁻¹`));
});

test('the puzzle built: v = √(u² + 2gh) = 23.2 m s⁻¹ for every throw', () => {
  const b = build('hook-again');
  near(b.result.value, Math.sqrt(CLIFF.u ** 2 + 2 * 9.81 * CLIFF.h));
  near(b.result.value, 23.2, 0.05);
  assert.deepEqual(b.boxes, { u: 'start', g: 'field', h: 'drop' });
  assert.equal(chip(b, 'start'), `12.0${NB}m s⁻¹`);
  assert.equal(chip(b, 'drop'), `20${NB}m`);
  assert.equal(chip(b, 'angle'), '45°');
  assert.equal(chip(b, 'mass'), `0.40${NB}kg`);
});

test('spotError: leaving out the starting Ek gives the speed of a dropped stone, 19.8 m s⁻¹', () => {
  const s = L.story.find((x) => x.id === 'forgot') as SpotErrorScreen;
  assert.equal(s.lines.filter((l) => l.wrong).length, 1);
  assert.equal(s.lines.find((l) => l.wrong)!.id, 'all');
  near(X.forgot.wrongSpeed, X.puzzle.noStart, 1e-9);
  const bad = s.lines.find((l) => l.id === 'v')!.text;
  assert.ok(bad.includes(`19.8${NB}m s⁻¹`) && bad.includes('78.5'));
  assert.ok(s.lines.find((l) => l.wrong)!.fix!.includes('28.8') && s.lines.find((l) => l.wrong)!.fix!.includes(`107${NB}J`));
});

test('sort: every store has two items, and every item is in a real bin', () => {
  const s = L.story.find((x) => x.id === 'stores') as SortScreen;
  const bins = new Set(s.bins.map((b) => b.id));
  assert.equal(s.bins.length, 3);
  for (const it of s.items) assert.ok(bins.has(it.bin), `${it.id}: its bin exists`);
  for (const b of bins) assert.equal(s.items.filter((it) => it.bin === b).length, 2, `${b}: two items`);
});

test('the slide built: friction took 413 J, 82.6 N over 5.0 m; without it 7.00 m s⁻¹', () => {
  const b = build('slide');
  near(b.result.value, SLIDE.m * (9.81 * SLIDE.h - 0.5 * SLIDE.v ** 2), 1e-9);
  near(b.result.value, 413, 0.5);
  near(X.slide.right + X.slide.ek, SLIDE.m * 9.81 * SLIDE.h, 1e-9);
  near(X.slide.friction * SLIDE.L, X.slide.right, 1e-9);
  assert.deepEqual(b.boxes, { m: 'mass', g: 'field', h: 'height', v: 'speed' });
  assert.equal(chip(b, 'speed'), `4.0${NB}m s⁻¹`);
  assert.equal(chip(b, 'length'), `5.0${NB}m`);
  assert.equal(chip(b, 'still'), `7.00${NB}m s⁻¹`);
  assert.ok(b.why.includes(`82.6${NB}N`));
});

test('explore: a longer slide is slower, and friction never takes more than the GPE on the slider', () => {
  assert.ok(X.longer.short > SLIDE.v && SLIDE.v > X.longer.long && X.longer.long > 0);
  assert.ok(X.longer.ekLong > 0);
  const s = L.story.find((x) => x.id === 'longer')!;
  assert.ok(s.kind === 'explore' && s.slider.min === LONGER.min && s.slider.max === LONGER.max && s.slider.start === SLIDE.L);
  assert.ok(s.question.right.includes(`1.67${NB}m s⁻¹`) && s.question.right.includes(`578${NB}J`));
});

test('Skill check: coaster 18.8 m s⁻¹, skater 1.83 m, ramps, cyclist 3.30 kJ and 11.0 N', () => {
  const c = build('coaster');
  near(c.result.value, Math.sqrt(2 * 9.81 * (COASTER.drop - COASTER.hill)), 1e-9);
  near(c.result.value, 18.8, 0.05);
  assert.equal(chip(c, 'below'), `18${NB}m`);
  const sk = all.find((s) => s.id === 'skater') as SpotErrorScreen;
  assert.equal(sk.lines.find((l) => l.wrong)!.id, 'cancel');
  near(X.skater.right, SKATER.v ** 2 / (2 * 9.81), 1e-9);
  assert.ok(sk.lines.find((l) => l.id === 'h')!.text.includes(`3.67${NB}m`));
  assert.ok(sk.why.includes(`1.83${NB}m`));
  assert.equal(right('ramps'), 'right');
  const card = all.find((s) => s.id === 'freewheel') as ExamCardScreen;
  const [a, bb] = card.parts;
  assert.ok(a.kind === 'build' && bb.kind === 'build');
  if (a.kind === 'build' && bb.kind === 'build') {
    near(a.build.result.value * 1000, CYCLIST.m * 9.81 * CYCLIST.drop - 0.5 * CYCLIST.m * (CYCLIST.v ** 2 - CYCLIST.u ** 2), 1e-9);
    near(a.build.result.value, 3.30, 0.005);
    assert.equal(chip(a.build, 'road'), `300${NB}m`);
    near(bb.build.result.value, 3297.6 / CYCLIST.road, 1e-9);
    near(bb.build.result.value, 11.0, 0.01);
    assert.equal(chip(bb.build, 'energy'), `3.30${NB}kJ`);
    assert.equal(chip(bb.build, 'height'), `12${NB}m`);
    assert.equal(chip(bb.build, 'gpe'), `9.42${NB}kJ`);
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
