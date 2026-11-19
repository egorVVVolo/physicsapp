// Every number in "Reading motion graphs" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readingMotionGraphs as L, ANSWERS as X, AB, LIFT, RAMP, TRAM, TRIP_A, TRIP_B, VA, WALK_PARTS } from './reading-motion-graphs.ts';
import { tripPosition, tripVelocity } from '../physics/kinematics.ts';
import type { Question } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as Question;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = '\u00A0';
const near = (a: number, b: number, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('the v–t lines cross at 4.0 s, where both cars do 10.0 m s⁻¹', () => {
  near(X.tCross, VA / AB);
  near(tripVelocity(X.tCross, TRIP_B), tripVelocity(X.tCross, TRIP_A));
  assert.equal(right('same-v'), 'velocity');
  assert.equal(right('flat'), 'zero-a');
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok('prompt' in hook && hook.prompt.includes(`4.0${NB}s`));
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
});

test('the cars are level at 8.0 s, 80.0 m along the road', () => {
  near(X.tLevel, 8);
  near(tripPosition(X.tLevel, TRIP_A), tripPosition(X.tLevel, TRIP_B));
  near(X.sLevel, 80);
  const scrub = L.story.find((s) => s.id === 'scrub');
  assert.ok(scrub?.kind === 'explore');
  assert.equal(scrub.question.options.find((o) => o.correct)?.id, 'level');
  assert.ok(scrub.question.right.includes(`8.0${NB}s`) && scrub.question.right.includes(`80.0${NB}m`));
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

test('the ball on the ramp: +9.0 m, then −4.0 m: displacement 5.0 m up the ramp, distance 13.0 m', () => {
  near(X.ramp.tTurn, 3);
  near(tripVelocity(X.ramp.tTurn, RAMP), 0);
  near(X.ramp.up, 9);
  near(X.ramp.back, -4);
  near(X.ramp.right, 5);
  near(X.ramp.distance, 13);
  assert.equal(label('ramp', 'right'), `5.0${NB}m up the ramp`);
  assert.equal(label('ramp', 'distance'), `13.0${NB}m up the ramp`);
  assert.equal(label('ramp', 'up'), `9.0${NB}m up the ramp`);
  assert.equal(label('ramp', 'back'), `4.0${NB}m down the ramp`);
});

test('Skill check: the stops are 72.0 m apart', () => {
  near(X.tram.right, 16 + 48 + 8);
  near(tripVelocity(12, TRAM), 0);
  assert.equal(label('tram', 'right'), `72.0${NB}m`);
  assert.equal(label('tram', 'steady'), `48.0${NB}m`);
  assert.equal(label('tram', 'top'), `96.0${NB}m`);
  assert.ok(q('tram').why.includes('16.0 + 48.0 + 8.0'));
});

test('Skill check: the walker is fastest in the steepest part, not the highest', () => {
  assert.equal(X.walk.fastest, 'B');
  assert.equal(right('fastest'), 'B');
  // the s–t line is highest at the end of part B and all through part C
  let s = 0;
  const ends = WALK_PARTS.map((part) => (s += part.v * part.dt));
  assert.equal(Math.max(...ends), ends[1]);
  assert.equal(ends[2], ends[1]);
  assert.equal(WALK_PARTS[2].v, 0);
  assert.equal(X.walk.highest, 'C');
});

test('Skill check: the lift ends 4.0 m below where it started', () => {
  near(X.lift.right, 2 * 4 - 2 * 6);
  near(tripPosition(10, LIFT), -4);
  assert.equal(label('lift', 'right'), `4.0${NB}m below`);
  assert.equal(label('lift', 'added'), `20.0${NB}m above`);
  assert.equal(label('lift', 'only-up'), `8.0${NB}m above`);
  assert.ok(q('lift').why.includes(`−12.0${NB}m`));
});

test('Skill check: a curved v–t graph needs the area, not suvat', () => {
  assert.equal(right('sprinter'), 'area');
  const s = q('sprinter');
  assert.ok(s.fig?.kind === 'graph');
  const accs = s.fig.lines[0].trip.phases.map((ph) => ph.a);
  assert.ok(accs.every((a, i) => i === 0 || a < accs[i - 1]), 'the sprinter’s acceleration falls all the time');
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
  for (const s of L.skillCheck) assert.ok(!story.has(s.prompt), s.id);
});
