// Every number in "Picking the equation" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickingTheEquation as L, ANSWERS as X, A, DRIVER, REACT, RIDER, TRAIN, TREE, UA, UB } from './picking-the-equation.ts';
import { RELATIONS, brakingPosition, brakingVelocity, leftOut, position, relationFits, velocity, type Quantity, type RelationId } from '../physics/kinematics.ts';
import { EQUATION_IDS, type BuildScreen, type EstimateScreen, type ExamCardScreen, type OptionQuestion, type SpotErrorScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const chooseRight = (b: BuildScreen) => b.choose!.options.find((o) => o.correct)!.id;
const NB = '\u00A0';
const near = (a: number, b: number, tol = 1e-3) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);
/** The only equation that has the unknown and otherwise only known quantities. */
const fits = (known: Quantity[], want: Quantity) => EQUATION_IDS.filter((id) => relationFits(id, known, want));

test('car B is twice as fast as car A, and both slow at the same rate', () => {
  assert.equal(UB, 2 * UA);
  assert.ok(A < 0);
});

test('car A: v = 0 once it stops, s = (0 − 12.0²) ÷ (2 × (−8.0)) = 9.0 m, built with the right equation', () => {
  near(X.brakeA.right, (UA * UA) / (2 * -A));
  near(brakingPosition(X.tA, { u: UA, a: A, react: 0 }), X.brakeA.right);
  assert.equal(brakingVelocity(X.tA, { u: UA, a: A, react: 0 }), 0);
  const b = build('brake-a');
  assert.equal(chooseRight(b), 'v2as');
  assert.deepEqual(b.choose!.options.map((o) => o.label), EQUATION_IDS.map((id) => RELATIONS[id].text));
  assert.deepEqual(b.boxes, { v: 'v0', u: 'uA', a: 'aSigned' });
  assert.equal(chip(b, 'v0'), `0${NB}m${NB}s⁻¹`);
  assert.equal(chip(b, 'uA'), `12.0${NB}m${NB}s⁻¹`);
  assert.equal(chip(b, 'aSigned'), `−8.0${NB}m${NB}s⁻²`);
  assert.equal(chip(b, 'aPlus'), `8.0${NB}m${NB}s⁻²`);
  assert.equal(chip(b, 'uB'), `24.0${NB}m${NB}s⁻¹`);
  near(b.result.value, (0 - UA * UA) / (2 * A));
  // the equation fits the known and wanted quantities
  assert.deepEqual(fits(['u', 'v', 'a'], 's'), ['v2as']);
});

test('the estimate: car B stops at 36.0 m, before the puzzle is answered', () => {
  const est = L.story.find((s) => s.id === 'guess') as EstimateScreen;
  near(est.answer, X.brakeB.right);
  near(est.answer, 4 * X.brakeA.right);
  assert.equal(est.tolerance, 3);
  assert.ok(est.scale.max > est.answer);
  assert.ok(est.fig.kind === 'road' && est.fig.play === undefined && est.after.kind === 'road' && est.after.play === true);
});

test('the puzzle: twice the speed needs four times the road, 36.0 m', () => {
  near(X.brakeB.right, 4 * X.brakeA.right);
  near(brakingPosition(X.tB, { u: UB, a: A, react: 0 }), X.brakeB.right);
  assert.equal(right('hook-again'), 'square');
  assert.ok(L.recap.text.includes(`36.0${NB}m`) && L.recap.text.includes(`9.0${NB}m`));
  assert.ok(q('hook-again').why.includes(`9.0${NB}m`) && q('hook-again').why.includes(`36.0${NB}m`));
});

test('the right equation is the only one that fits what is known and wanted', () => {
  assert.deepEqual(fits(['u', 'v', 'a'], 't'), ['vuat']);
  assert.equal(right('time'), 'vuat');
  assert.deepEqual(fits(['u', 'v', 't'], 's'), ['suvt']);
  assert.equal(chooseRight(build('train')), 'suvt');
  const s = q('time');
  assert.ok(s.kind === 'tapFig' && s.fig.kind === 'equations');
  for (const o of s.options) assert.equal(o.label, RELATIONS[o.id as RelationId].text);
  if (s.fig.list) assert.deepEqual(fits(Object.keys(s.fig.list.known) as Quantity[], s.fig.list.want), ['vuat']);
  for (const id of ['brake-a', 'train']) for (const o of build(id).choose!.options) assert.equal(o.label, RELATIONS[o.id as RelationId].text);
});

test('v² = u² + 2as leaves out t', () => {
  assert.equal(leftOut('v2as'), 't');
  assert.equal(right('missing'), 't');
  const s = q('missing');
  assert.ok(s.fig?.kind === 'equations' && s.fig.focus === 'v2as' && s.fig.leftOut === 'afterCheck', 'the missing quantities appear only after the answer');
});

test('car B takes 3.00 s to stop, twice as long as car A', () => {
  near(X.tB, UB / -A);
  near(X.tB, 2 * X.tA);
  near(velocity(X.tB, { s0: 0, u: UB, a: A }), 0);
  assert.ok(q('time').why.includes(`t${NB}=${NB}3.00${NB}s`));
});

test('explore: car B covers 20.0 m, 12.0 m and 4.0 m in its three seconds', () => {
  assert.deepEqual(X.perSecond, [20, 12, 4]);
  const scrub = L.story.find((s) => s.id === 'scrub');
  assert.ok(scrub?.kind === 'explore' && scrub.question.options.find((o) => o.correct)?.id === 'first');
  assert.ok(scrub.question.right.includes(`20.0${NB}m, then 12.0${NB}m, then 4.0${NB}m`));
  const { min, max, step } = scrub.slider;
  assert.equal(min, 0);
  near(max, X.tB);
  near(Math.round(max / step) * step, max, 1e-9);
});

test('stopping distance: 12.0 m of thinking plus 36.0 m of braking', () => {
  near(X.stopping.thinking, UB * REACT);
  near(X.stopping.right, X.stopping.thinking + X.brakeB.right);
  assert.equal(label('stopping', 'right'), `48.0${NB}m`);
  assert.equal(label('stopping', 'braking-only'), `36.0${NB}m`);
  assert.equal(label('stopping', 'half-thinking'), `42.0${NB}m`);
});

test("Tariq's mistake: 36.0 m looks safe next to a 40.0 m tree, but the thinking distance makes it 48.0 m", () => {
  near(X.tree.left, TREE - UB * REACT);
  near(X.tree.right, Math.sqrt(UB * UB + 2 * A * X.tree.left));
  assert.ok(X.stopping.right > TREE, 'the car cannot stop in time');
  assert.ok(X.brakeB.right < TREE, 'forgetting the thinking distance makes it look safe');
  const s = L.story.find((sc) => sc.id === 'tree') as SpotErrorScreen;
  assert.equal(s.kind, 'spotError');
  const wrong = s.lines.find((l) => l.wrong)!;
  assert.equal(wrong.id, 'compare');
  assert.ok(wrong.text.includes(`36.0${NB}m is less than 40.0${NB}m`));
  assert.ok(wrong.fix!.includes(`12.0${NB}m + 36.0${NB}m = 48.0${NB}m`));
  assert.ok(s.fig?.kind === 'road' && s.fig.tree === TREE && s.fig.react === REACT && s.fig.span > X.stopping.right);
  assert.ok(s.why.includes(`14.4${NB}m${NB}s⁻¹`.replace('14.4', '11.3')));
});

test('Skill check: the train covers 500 m, from s = ½(u + v)t (built)', () => {
  assert.equal(X.train, 0.5 * (TRAIN.u + TRAIN.v) * TRAIN.t);
  const b = build('train');
  near(b.result.value, 500);
  assert.deepEqual(b.boxes, { u: 'u', v: 'v', t: 'time' });
  assert.equal(chip(b, 'u'), `30.0${NB}m${NB}s⁻¹`);
  assert.equal(chip(b, 'v'), `10.0${NB}m${NB}s⁻¹`);
  assert.equal(chip(b, 'time'), `25.0${NB}s`);
  assert.equal(chip(b, 'average'), `20.0${NB}m${NB}s⁻¹`);
  assert.equal(chip(b, 'a'), `0.80${NB}m${NB}s⁻²`);
  assert.ok(b.prompt.includes(`in 25.0${NB}s`));
});

test('Skill check: the rider covers 12.0 m in 2.0 s; the other root, −6.0 s, is thrown away', () => {
  near(X.rider.right, 2);
  near(X.rider.negative, -6);
  near(position(X.rider.right, { s0: 0, u: RIDER.u, a: RIDER.a }), RIDER.s);
  near(position(X.rider.negative, { s0: 0, u: RIDER.u, a: RIDER.a }), RIDER.s);
  const s = all.find((sc) => sc.id === 'root') as SpotErrorScreen;
  assert.equal(s.lines.find((l) => l.wrong)!.id, 'pick');
  assert.ok(s.lines[2].text.includes(`2.0${NB}s`) && s.lines[2].text.includes(`−6.0${NB}s`));
});

test('Skill check: the exam card, 10.0 m of thinking and 40.0 m of braking', () => {
  near(X.driver.thinking, DRIVER.u * DRIVER.react);
  near(X.driver.thinking, 10);
  near(X.driver.braking, 40);
  const card = all.find((sc) => sc.id === 'driver') as ExamCardScreen;
  const [a, b] = card.parts;
  assert.ok(a.kind === 'build' && b.kind === 'build');
  if (a.kind === 'build' && b.kind === 'build') {
    near(a.build.result.value, 10);
    near(b.build.result.value, 40);
    assert.equal(chip(a.build, 'react'), `0.50${NB}s`);
    assert.equal(chip(b.build, 'aSigned'), `−5.0${NB}m${NB}s⁻²`);
    assert.equal(chip(b.build, 'v0'), `0${NB}m${NB}s⁻¹`);
  }
  assert.equal(a.marks + b.marks, 3);
});

test('Skill check: at half the speed the stopping distance lands between a quarter and a half', () => {
  assert.ok(X.halfSpeedShare > 0.25 && X.halfSpeedShare < 0.5, String(X.halfSpeedShare));
  assert.equal(right('limit'), 'between');
});

test('number options go up in size, so the right one is not always in the same place', () => {
  for (const id of ['stopping']) {
    const values = q(id).options.map((o) => parseFloat(o.label.replace('−', '-')));
    assert.deepEqual(values, [...values].sort((a, b) => a - b), id);
    assert.equal(new Set(values).size, values.length, `${id}: two options are the same`);
  }
});

test('numbers never break from their units', () => {
  for (const s of all) {
    const texts = [
      ...('prompt' in s ? [s.prompt] : []),
      ...('body' in s ? [s.body].flat() : []),
      ...('why' in s ? [s.why] : []),
      ...('options' in s ? s.options.flatMap((o) => [o.label, o.hint ?? '']) : []),
      ...(s.kind === 'explore' ? [s.question.right] : []),
    ];
    for (const t of texts) assert.ok(!/\d (kg|N|m|s)\b/.test(t) && !/ m s⁻/.test(t), `${s.id}: use a no-break space before units in "${t}"`);
  }
});

test('the return to the puzzle is a new question, not the prediction again', () => {
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok('prompt' in hook && hook.prompt !== q('hook-again').prompt);
});

test('no Skill check question repeats a story prompt', () => {
  const story = new Set(L.story.map((s) => ('prompt' in s ? s.prompt : '')));
  for (const s of L.skillCheck) if ('prompt' in s) assert.ok(!story.has(s.prompt), s.id);
});

test("nothing before the estimate gives away car B's braking distance", () => {
  const i = L.story.findIndex((s) => s.id === 'guess');
  const before = JSON.stringify(L.story.slice(0, i));
  assert.ok(!before.includes('36.0'), "car B's braking distance appears before the estimate");
  for (const s of L.story.slice(0, i)) {
    if ('fig' in s && s.fig?.kind === 'road') assert.ok(!(s.fig.play === true && s.fig.cars.some((c) => c.id === 'B')), `${s.id}: car B must not be played before the puzzle is answered`);
    if ('fig' in s && s.fig?.kind === 'brakeVt') assert.fail(`${s.id}: the v–t graph shows both braking distances`);
  }
});

test('the reaction time comes before the stopping distance and the tree', () => {
  const ids = L.story.map((s) => s.id);
  assert.ok(ids.indexOf('reaction') < ids.indexOf('stopping') && ids.indexOf('stopping') < ids.indexOf('tree'));
});
