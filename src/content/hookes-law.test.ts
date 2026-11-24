// Every number in "Hooke's law" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hookesLaw as L, ANSWERS as X, COILS, EXPLORE, LAUNCHER, PAIR, PLOT, SPRING } from './hookes-law.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { BuildScreen, EstimateScreen, ExamCardScreen, GraphPickScreen, OptionQuestion, PlotFig, SpotErrorScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const NB = ' ';
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('the spring: 6.0 cm under 3.0 N is 50 N m⁻¹, built from the extension and not the length', () => {
  near(X.k.dx, 0.06);
  near(X.k.right, 50, 1e-9);
  const b = build('stiffness');
  near(b.result.value, 3.0 / (SPRING.stretched - SPRING.L0), 1e-9);
  assert.deepEqual(b.boxes, { 'ΔF': 'force', 'Δx': 'ext' });
  assert.equal(chip(b, 'force'), `3.0${NB}N`);
  assert.equal(chip(b, 'ext'), `0.060${NB}m`);
  assert.equal(chip(b, 'length'), `16.0${NB}cm`);
  assert.equal(chip(b, 'cm'), `6.0${NB}cm`);
});

test('explore: the load slider covers the 3.0 N of the puzzle', () => {
  const s = L.story.find((x) => x.id === 'graph')!;
  assert.ok(s.kind === 'explore' && s.slider.max === EXPLORE.max && s.slider.start === SPRING.W);
});

test('the top half pulls up with the whole load: 3.0 N', () => {
  near(X.pull.right, SPRING.W);
  assert.equal(right('pull'), 'right');
  assert.equal(label('pull', 'right'), `3.0${NB}N`);
  assert.equal(label('pull', 'half'), `1.5${NB}N`);
  assert.equal(label('pull', 'double'), `6.0${NB}N`);
});

test('estimate: the mark on the middle coil moves 3.0 cm; the thumb does not start inside the band', () => {
  const est = L.story.find((s) => s.id === 'half') as EstimateScreen;
  near(est.answer, 3.0, 1e-9);
  near(est.answer / 100, X.k.dx / 2, 1e-12);
  assert.ok(est.scale.min < est.answer && est.scale.max > est.answer);
  assert.ok(Math.abs((est.scale.min + est.scale.max) / 2 - est.answer) > est.tolerance);
});

test('the puzzle built: one half stretches 3.0 cm and is 100 N m⁻¹, twice as stiff', () => {
  near(X.puzzle.x, 0.03, 1e-12);
  near(X.puzzle.k, 2 * X.puzzle.same, 1e-9);
  const b = build('hook-again');
  near(b.result.value, 100, 1e-9);
  assert.deepEqual(b.boxes, { 'ΔF': 'force', 'Δx': 'ext' });
  assert.equal(chip(b, 'ext'), `0.030${NB}m`);
  assert.equal(chip(b, 'whole'), `0.060${NB}m`);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'half' && o.correct));
});

test('graph pick: the half is the steeper line, C; every line fits on the axes', () => {
  const s = L.story.find((x) => x.id === 'lines') as GraphPickScreen;
  assert.equal(s.graphs.find((gr) => gr.correct)!.id, 'C');
  const grad = (f: PlotFig) => {
    const end = f.points[f.points.length - 1];
    return (end.y / (end.x / 100));
  };
  const fig = (id: string) => s.graphs.find((gr) => gr.id === id)!.fig as PlotFig;
  near(grad(fig('C')), 100, 1e-9);
  near(grad(fig('B')), 50, 1e-9);
  near(grad(fig('A')), 25, 1e-9);
  for (const gr of s.graphs) {
    const f = gr.fig as PlotFig;
    assert.ok(f.points.every((r) => r.x <= PLOT.xMax && r.y <= PLOT.FMax + 1e-9));
  }
  assert.equal(new Set(s.graphs.map((gr) => JSON.stringify([(gr.fig as PlotFig).x, (gr.fig as PlotFig).y]))).size, 1);
});

test('spotError: the length instead of the extension gives 18.8 N m⁻¹', () => {
  const s = L.story.find((x) => x.id === 'error') as SpotErrorScreen;
  assert.equal(s.lines.filter((l) => l.wrong).length, 1);
  assert.equal(s.lines.find((l) => l.wrong)!.id, 'ext');
  near(X.k.length, 3.0 / 0.16, 1e-12);
  assert.ok(s.lines.find((l) => l.id === 'k')!.text.includes(`18.8${NB}N${NB}m⁻¹`));
});

test('Skill check: launcher 12.0 N (built), the pair 40 N m⁻¹, coils, side by side 1.5 cm and 200 N m⁻¹', () => {
  const b = build('launcher');
  near(b.result.value, LAUNCHER.k * (LAUNCHER.L0 - LAUNCHER.L), 1e-9);
  near(b.result.value, 12, 1e-9);
  assert.equal(chip(b, 'newLength'), `0.050${NB}m`);
  assert.equal(chip(b, 'oldLength'), `0.080${NB}m`);
  const e = all.find((x) => x.id === 'pair-error') as SpotErrorScreen;
  assert.equal(e.lines.find((l) => l.wrong)!.id, 'k');
  near(X.pair.right, (PAIR.F2 - PAIR.F1) / (PAIR.L2 - PAIR.L1), 1e-9);
  near(X.pair.right, 40, 1e-9);
  near(X.pair.cm, 0.4, 1e-9);
  assert.ok(e.lines.find((l) => l.id === 'k')!.text.includes('0.40'));
  assert.equal(right('coils'), 'right');
  near(X.coils.ratio, 3);
  assert.equal(COILS.P / COILS.Q, 3);
  const card = all.find((x) => x.id === 'side-by-side') as ExamCardScreen;
  const [a, bb] = card.parts;
  assert.ok(a.kind === 'build' && bb.kind === 'build');
  if (a.kind === 'build' && bb.kind === 'build') {
    near(a.build.result.value, 1.5, 1e-9);
    near(a.build.result.value / 100, 1.5 / X.puzzle.k, 1e-12);
    assert.equal(chip(a.build, 'load'), `1.5${NB}N`);
    assert.equal(chip(a.build, 'whole'), `3.0${NB}N`);
    near(bb.build.result.value, 200, 1e-9);
    near(bb.build.result.value, X.parallel.k, 1e-9);
    assert.equal(chip(bb.build, 'ext'), `0.015${NB}m`);
  }
  assert.equal(a.marks + bb.marks, 3);
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
