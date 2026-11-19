// Every number in "Picking the equation" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickingTheEquation as L, ANSWERS as X, A, CYCLIST, REACT, TRAIN, TREE, UA, UB, WET_A } from './picking-the-equation.ts';
import { RELATIONS, brakingPosition, brakingVelocity, leftOut, relationFits, velocity, type Quantity, type RelationId } from '../physics/kinematics.ts';
import { EQUATION_IDS, type Question } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as Question;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = '\u00A0';
const near = (a: number, b: number, tol = 1e-3) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);
/** The only equation that has the unknown and otherwise only known quantities. */
const fits = (known: Quantity[], want: Quantity) => EQUATION_IDS.filter((id) => relationFits(id, known, want));

test('car B is twice as fast as car A, and both slow at the same rate', () => {
  assert.equal(UB, 2 * UA);
  assert.ok(A < 0);
});

test('car A: 0 = 12.0² + 2 × (−8.0) × s gives 9.0 m', () => {
  near(X.brakeA.right, (UA * UA) / (2 * -A));
  near(brakingPosition(X.tA, { u: UA, a: A, react: 0 }), X.brakeA.right);
  assert.equal(brakingVelocity(X.tA, { u: UA, a: A, react: 0 }), 0);
  assert.equal(label('brake-a', 'right'), `9.0${NB}m`);
  assert.equal(label('brake-a', 'time'), `1.5${NB}m`);
  assert.equal(label('brake-a', 'lost-two'), `18.0${NB}m`);
  assert.ok(q('brake-a').prompt.replaceAll(NB, ' ').includes('0 = 12.0² + 2 × (−8.0) × s'));
  assert.ok(q('brake-a').why.includes('0 = 144 − 16.0s'));
});

test('the puzzle: twice the speed needs four times the road, 36.0 m', () => {
  near(X.brakeB.right, 4 * X.brakeA.right);
  near(brakingPosition(X.tB, { u: UB, a: A, react: 0 }), X.brakeB.right);
  assert.equal(label('hook-again', 'right'), `36.0${NB}m`);
  assert.equal(label('hook-again', 'doubled'), `18.0${NB}m`);
  assert.equal(label('hook-again', 'tripled'), `27.0${NB}m`);
  assert.equal(label('hook-again', 'lost-two'), `72.0${NB}m`);
  assert.ok(L.recap.text.includes(label('hook-again', 'right')) && L.recap.text.includes(label('brake-a', 'right')));
});

test('the right equation is the only one that fits what is known and wanted', () => {
  assert.deepEqual(fits(['u', 'v', 'a'], 's'), ['v2as']);
  assert.equal(right('pick'), 'v2as');
  assert.deepEqual(fits(['u', 'v', 'a'], 't'), ['vuat']);
  assert.equal(right('time'), 'vuat');
  assert.deepEqual(fits(['u', 'v', 't'], 's'), ['suvt']);
  assert.equal(right('train'), 'suvt');
  for (const id of ['pick', 'time', 'train']) {
    const s = q(id);
    assert.ok(s.kind === 'tapFig' && s.fig.kind === 'equations');
    for (const o of s.options) assert.equal(o.label, RELATIONS[o.id as RelationId].text);
    // the list on the figure says the same as the question
    if (s.fig.list) assert.deepEqual(fits(Object.keys(s.fig.list.known) as Quantity[], s.fig.list.want), [right(id)]);
  }
});

test('v² = u² + 2as leaves out t', () => {
  assert.equal(leftOut('v2as'), 't');
  assert.equal(right('missing'), 't');
  const s = q('missing');
  assert.ok(s.fig?.kind === 'equations' && s.fig.focus === 'v2as' && s.fig.leftOut === 'afterCheck', 'the missing quantities appear only after the answer');
});

test('"stops" hides a known value: v = 0', () => {
  assert.equal(right('knowns'), 'v');
});

test('car B takes 3.00 s to stop, twice as long as car A', () => {
  near(X.tB, UB / -A);
  near(X.tB, 2 * X.tA);
  near(velocity(X.tB, { s0: 0, u: UB, a: A }), 0);
  assert.ok(q('time').why.includes(`t${NB}=${NB}3.00${NB}s`));
});

test('where car A has stopped, car B still moves at 20.8 m s⁻¹', () => {
  near(X.passing.right, Math.sqrt(UB * UB + 2 * A * X.brakeA.right));
  assert.equal(label('still-fast', 'right'), `20.8${NB}m${NB}s⁻¹`);
  assert.equal(label('still-fast', 'half'), `12.0${NB}m${NB}s⁻¹`);
  assert.equal(label('still-fast', 'even'), `18.0${NB}m${NB}s⁻¹`);
  assert.equal(label('still-fast', 'lost-two'), `22.4${NB}m${NB}s⁻¹`);
  assert.ok(q('still-fast').why.includes(`only 3.2${NB}m${NB}s⁻¹`));
  const s = q('still-fast');
  assert.ok(s.fig?.kind === 'road' && s.fig.ask && !s.fig.ask.shown, 'the speed at the marker is hidden until the answer');
  near(s.fig.ask.at, X.brakeA.right);
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

test('the tree: 28.0 m of braking are left, the car arrives at 11.3 m s⁻¹', () => {
  near(X.tree.left, TREE - UB * REACT);
  near(X.tree.right, Math.sqrt(UB * UB + 2 * A * X.tree.left));
  assert.ok(X.stopping.right > TREE, 'the car cannot stop in time');
  assert.ok(X.brakeB.right < TREE, 'forgetting the thinking distance makes it look safe');
  assert.equal(label('tree', 'right'), `It hits the tree at 11.3${NB}m${NB}s⁻¹`);
  assert.equal(label('tree', 'stops-short'), `The car stops 4.0${NB}m before the tree`);
  assert.equal(label('tree', 'lost-two'), `It hits the tree at 18.8${NB}m${NB}s⁻¹`);
  assert.equal(label('tree', 'wrong-sign'), `It hits the tree at 32.0${NB}m${NB}s⁻¹`);
  const s = q('tree');
  assert.ok(s.fig?.kind === 'road' && s.fig.tree === TREE && s.fig.react === REACT && s.fig.span > X.stopping.right);
});

test('Skill check: the train covers 500 m, from s = ½(u + v)t', () => {
  assert.equal(X.train, 0.5 * (TRAIN.u + TRAIN.v) * TRAIN.t);
  assert.ok(q('train').why.includes(`500${NB}m`));
  assert.ok(q('train').prompt.includes(`in 25.0${NB}s`));
});

test('Skill check: half the deceleration, twice the braking distance', () => {
  near(X.wet.right, (UB * UB) / (2 * -WET_A));
  near(X.wet.right, 2 * X.brakeB.right);
  assert.equal(label('wet', 'right'), `It doubles to 72.0${NB}m`);
  assert.equal(right('wet'), 'right');
});

test('Skill check: the cyclist travels 64.0 m', () => {
  near(X.cyclist.right, CYCLIST.u * CYCLIST.t + 0.5 * CYCLIST.a * CYCLIST.t ** 2);
  assert.equal(label('cyclist', 'right'), `64.0${NB}m`);
  assert.equal(label('cyclist', 'only-at2'), `16.0${NB}m`);
  assert.equal(label('cyclist', 'only-ut'), `48.0${NB}m`);
  assert.equal(label('cyclist', 'lost-half'), `80.0${NB}m`);
  assert.deepEqual(fits(['u', 'a', 't'], 's'), ['sut']);
});

test('Skill check: at half the speed the stopping distance lands between a quarter and a half', () => {
  assert.ok(X.halfSpeedShare > 0.25 && X.halfSpeedShare < 0.5, String(X.halfSpeedShare));
  assert.equal(right('limit'), 'between');
});

test('number options go up in size, so the right one is not always in the same place', () => {
  for (const id of ['brake-a', 'hook-again', 'still-fast', 'stopping', 'cyclist']) {
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
  for (const s of L.skillCheck) assert.ok(!story.has(s.prompt), s.id);
});

test("nothing before the revisit gives away car B's braking distance", () => {
  const i = L.story.findIndex((s) => s.id === 'hook-again');
  const before = JSON.stringify(L.story.slice(0, i));
  assert.ok(!before.includes('36.0'), "car B's braking distance appears before the puzzle is answered");
  for (const s of L.story.slice(0, i)) {
    if ('fig' in s && s.fig?.kind === 'road') assert.ok(!(s.fig.play === true && s.fig.cars.some((c) => c.id === 'B')), `${s.id}: car B must not be played before the puzzle is answered`);
    if ('fig' in s && s.fig?.kind === 'brakeVt') assert.fail(`${s.id}: the v–t graph shows both braking distances`);
  }
});

test('the reaction time and the tree come only after the stopping distance is taught', () => {
  const ids = L.story.map((s) => s.id);
  assert.ok(ids.indexOf('reaction') < ids.indexOf('stopping') && ids.indexOf('stopping') < ids.indexOf('tree'));
});
