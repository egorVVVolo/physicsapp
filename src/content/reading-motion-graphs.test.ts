// Every number in "Reading motion graphs" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readingMotionGraphs as L, ANSWERS as X, AB, BRAKING, STRIP, TRAM, TRIP_A, TRIP_B, VA } from './reading-motion-graphs.ts';
import { tripDisplacement, tripPosition, tripVelocity } from '../physics/kinematics.ts';
import type { BuildScreen, EstimateScreen, ExamCardScreen, GraphPickScreen, OptionQuestion, OrderScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const NB = '\u00A0';
const near = (a: number, b: number, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('the v–t lines cross at 4.0 s, where both cars do 10.0 m s⁻¹', () => {
  near(X.tCross, VA / AB);
  near(tripVelocity(X.tCross, TRIP_B), tripVelocity(X.tCross, TRIP_A));
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok('prompt' in hook && hook.prompt.includes(`4.0${NB}s`));
});

test("the graph pick: car B's line is the one from rest at 2.5 m s⁻²", () => {
  const pick = L.story.find((s) => s.id === 'pick-b') as GraphPickScreen;
  const correct = pick.graphs.find((g) => g.correct)!;
  assert.equal(correct.id, 'C');
  assert.ok(correct.fig.kind === 'graph');
  if (correct.fig.kind === 'graph') {
    const trip = correct.fig.lines[0].trip;
    near(tripVelocity(0, trip), 0);
    near(tripVelocity(1, trip), AB);
  }
  // the wrong graphs: a flat line (car A) and a line that slopes down
  const [flat, down] = [pick.graphs[0], pick.graphs[1]].map((g) => (g.fig.kind === 'graph' ? g.fig.lines[0].trip : null)!);
  near(tripVelocity(0, flat), tripVelocity(5, flat));
  assert.ok(tripVelocity(5, down) < tripVelocity(0, down));
});

test('at the crossing car B is 20.0 m behind, and the gap is never larger', () => {
  near(X.sA, 40);
  near(X.sB, 0.5 * AB * X.tCross ** 2);
  near(X.gap, 20);
  for (let t = 0; t <= 9; t += 0.25) assert.ok(tripPosition(t, TRIP_A) - tripPosition(t, TRIP_B) <= X.gap + 1e-9, `the gap is larger at ${t} s`);
  assert.equal(label('area-b', 'right'), `20.0${NB}m`);
  assert.equal(label('area-b', 'rectangle'), `40.0${NB}m`);
  assert.equal(label('area-b', 'height'), `10.0${NB}m`);
  assert.equal(label('hook-again', 'right'), `20.0${NB}m behind car A`);
  assert.equal(label('hook-again', 'forgot-b'), `40.0${NB}m behind car A`);
  assert.equal(right('hook-again'), 'right');
});

test('the strip between 4.0 s and 8.0 s is a trapezoid: ½ (10.0 + 20.0) × 4.0 = 60.0 m', () => {
  const b = build('strip');
  near(X.strip.right, 60);
  near(X.strip.u, 10);
  near(X.strip.v, 20);
  near(X.strip.dt, 4);
  near(b.result.value, tripDisplacement(STRIP.from, STRIP.to, TRIP_B));
  assert.deepEqual(b.boxes, { u: 'u', v: 'v', t: 'dt' });
  assert.equal(chip(b, 'u'), `10.0${NB}m${NB}s⁻¹`);
  assert.equal(chip(b, 'v'), `20.0${NB}m${NB}s⁻¹`);
  assert.equal(chip(b, 'dt'), `4.0${NB}s`);
  assert.equal(chip(b, 'end'), `8.0${NB}s`);
});

test('the order: the four steps reach "car B is 20.0 m behind"', () => {
  const o = L.story.find((s) => s.id === 'why-not') as OrderScreen;
  assert.deepEqual(o.steps.map((s) => s.id), ['cross', 'ahead', 'areas', 'behind']);
  assert.ok(o.steps[2].text.includes(`40.0${NB}m`) && o.steps[2].text.includes(`20.0${NB}m`));
  assert.ok(o.steps[3].text.includes(`20.0${NB}m`));
});

test('the cars are level at 8.0 s, 80.0 m along the road (the estimate)', () => {
  near(X.tLevel, 8);
  near(tripPosition(X.tLevel, TRIP_A), tripPosition(X.tLevel, TRIP_B));
  near(X.sLevel, 80);
  const est = L.story.find((s) => s.id === 'level') as EstimateScreen;
  near(est.answer, X.tLevel);
  assert.ok(est.scale.max > X.tLevel, 'the scale reaches past the moment the cars are level');
  assert.ok(est.why.includes(`80.0${NB}m`));
  const scrub = L.story.find((s) => s.id === 'scrub');
  assert.ok(scrub?.kind === 'explore');
  assert.equal(scrub.question.options.find((o) => o.correct)?.id, 'shrinks');
  const { min, max, step } = scrub.slider;
  assert.ok(min === 0 && max > X.tLevel, 'the slider reaches past the moment the cars are level');
  near(Math.round(X.tLevel / step) * step, X.tLevel);
  near(Math.round(X.tCross / step) * step, X.tCross);
  assert.ok(L.recap.text.includes(`8.0${NB}s`) && L.recap.text.includes(`80.0${NB}m`));
  assert.ok(L.recap.fig.kind === 'chase' && L.recap.fig.until === X.tLevel);
});

test('the regions between the lines on either side of the crossing are equal', () => {
  const s = L.story.find((sc) => sc.id === 'equal-areas');
  assert.ok(s?.kind === 'text' && s.fig?.kind === 'graph' && s.fig.between?.length === 2);
  const gain = (from: number, to: number) => tripPosition(to, TRIP_A) - tripPosition(from, TRIP_A) - (tripPosition(to, TRIP_B) - tripPosition(from, TRIP_B));
  const [before, after] = s.fig.between;
  near(gain(before.from, before.to), X.gap);
  near(gain(after.from, after.to), -X.gap);
});

test('on the s–t graph the tangent to car B at 4.0 s has car A’s gradient', () => {
  assert.equal(right('tangent'), 'same-v');
  const s = q('tangent');
  assert.ok(s.fig?.kind === 'graph' && s.fig.y === 's' && s.fig.tangent?.at === X.tCross);
});

test('Skill check: braking from 20.0 m s⁻¹ in 8.0 s covers 80.0 m; the graph pick has a falling line', () => {
  near(X.brake.right, 80);
  near(tripVelocity(8, BRAKING), 0);
  const b = build('brake-area');
  near(b.result.value, 0.5 * 8 * 20);
  assert.equal(chip(b, 'time'), `8.0${NB}s`);
  assert.equal(chip(b, 'speed'), `20.0${NB}m${NB}s⁻¹`);
  const pick = L.skillCheck.find((s) => s.id === 'brake-graph') as GraphPickScreen;
  const c = pick.graphs.find((g) => g.correct)!;
  assert.ok(c.fig.kind === 'graph' && tripVelocity(8, c.fig.lines[0].trip) < tripVelocity(0, c.fig.lines[0].trip));
});

test('Skill check: the tram covers 64.0 m in 10 s (a trapezoid), 72.0 m in all', () => {
  near(X.tram.right, 16 + 48);
  near(X.tram.right, 0.5 * (X.tram.long + X.tram.short) * X.tram.top);
  near(tripDisplacement(0, 10, TRAM), X.tram.right);
  near(X.tram.whole, 72);
  near(tripVelocity(12, TRAM), 0);
  const card = L.skillCheck.find((s) => s.id === 'tram') as ExamCardScreen;
  const b = card.parts.find((p) => p.id === 'b')!;
  assert.ok(b.kind === 'build');
  if (b.kind === 'build') {
    near(b.build.result.value, X.tram.right);
    assert.equal(chip(b.build, 'long'), `10.0${NB}s`);
    assert.equal(chip(b.build, 'short'), `6.0${NB}s`);
    assert.equal(chip(b.build, 'height'), `8.0${NB}m${NB}s⁻¹`);
  }
  const a = card.parts.find((p) => p.id === 'a')!;
  assert.ok(a.kind === 'choice' && a.options.find((o) => o.correct)!.id === 'right');
  // between 4 s and 10 s the line is flat
  near(tripVelocity(4, TRAM), tripVelocity(10, TRAM));
});

test('numbers never break from their units', () => {
  for (const s of all) {
    const texts = [
      ...('prompt' in s ? [s.prompt] : []),
      ...('body' in s ? [s.body].flat() : []),
      ...('why' in s ? [s.why] : []),
      ...('options' in s ? s.options.flatMap((o) => [o.label, o.hint ?? '']) : []),
      ...(s.kind === 'explore' ? [s.question.right, ...s.question.options.flatMap((o) => [o.label, o.hint ?? ''])] : []),
    ];
    for (const t of texts) assert.ok(!/\d (kg|N|m|s)\b/.test(t) && !/ m s⁻/.test(t), `${s.id}: use a no-break space before units in "${t}"`);
  }
});

test('the return to the puzzle is a new question, and nothing before it says where car B is', () => {
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok('prompt' in hook && hook.prompt !== q('hook-again').prompt);
  const i = L.story.findIndex((s) => s.id === 'hook-again');
  for (const s of L.story.slice(0, i)) {
    assert.ok(!('fig' in s && s.fig?.kind === 'chase' && s.fig.play), `${s.id}: the road must not be played before the puzzle is answered`);
    assert.ok(!('fig' in s && s.fig?.kind === 'graph' && (s.fig.cursor || s.fig.between || s.fig.y === 's')), `${s.id}: this graph gives the puzzle away`);
  }
});

test('no Skill check question repeats a story prompt', () => {
  const story = new Set(L.story.map((s) => ('prompt' in s ? s.prompt : '')));
  for (const s of L.skillCheck) if ('prompt' in s) assert.ok(!story.has(s.prompt), s.id);
});
