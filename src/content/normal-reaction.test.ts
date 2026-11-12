// Every number in the lesson is recomputed from the physics model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalReaction as L, ANSWERS, CALC, DOWN_SLOW, M, PUZZLE, SLOW, TRIP, newtons } from './normal-reaction.ts';
import { timeAtRest } from '../physics/kinematics.ts';
import { G } from '../physics/kinematics.ts';
import type { Question } from './types.ts';

const q = (id: string) => [...L.story, ...L.skillCheck].find((s) => s.id === id) as Question;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;

test('calculation: N = m(g + a) = 881 N for 80 kg at +1.2 m s⁻²', () => {
  assert.equal(label('calc', 'right'), newtons(CALC.m * (G + CALC.a)));
  assert.equal(label('calc', 'right'), '881\u00a0N');
  assert.equal(label('calc', 'forgot-a'), '785\u00a0N');
  assert.equal(label('calc', 'subtracted-a'), '689\u00a0N');
  assert.equal(label('calc', 'only-ma'), '96\u00a0N');
});

test('the four options of the calculation are all different', () => {
  const labels = q('calc').options.map((o) => o.label);
  assert.equal(new Set(labels).size, labels.length);
});

test('free fall: the scales read 0 N', () => {
  assert.equal(ANSWERS.freeFall.right, 0);
  assert.equal(label('free-fall', 'zero'), '0\u00a0N');
  assert.equal(label('free-fall', 'weight'), newtons(M * G));
});

test('moving down and slowing: acceleration is upward, N = 886 N for 75 kg', () => {
  assert.equal(label('down-slow', 'right'), newtons(DOWN_SLOW.m * (G + DOWN_SLOW.a)));
  assert.equal(label('down-slow', 'right'), '886\u00a0N');
  assert.equal(label('down-slow', 'wrong-sign'), '586\u00a0N');
  assert.equal(label('down-slow', 'weight'), '736\u00a0N');
});

test('answers follow the physics: at rest N = W, steady N = W, slowing upward N < W, starting up N > W', () => {
  assert.equal(right('at-rest'), 'equal');
  assert.equal(right('steady'), 'same');
  assert.equal(right('slowing'), 'shorter');
  assert.equal(right('partner'), 'P');
});

test('the lift trip: the part with the largest upward acceleration is the right answer', () => {
  const best = [...TRIP].sort((a, b) => b.a - a.a)[0].id;
  assert.equal(right('trip'), best);
});

test('the lift trip starts and ends at rest', () => {
  const v = TRIP.reduce((sum, p) => sum + p.a * p.dt, 0);
  assert.ok(Math.abs(v) < 1e-9);
});

test('the options of the calculation go up in size, so the right one is not always first', () => {
  const values = q('calc').options.map((o) => parseFloat(o.label));
  assert.deepEqual(values, [...values].sort((a, b) => a - b));
});

test('numbers never break from their units', () => {
  for (const s of [...L.story, ...L.skillCheck]) {
    const texts = 'prompt' in s ? [s.prompt] : [];
    for (const t of texts) assert.ok(!/\d (kg|N|m s)/.test(t) && !/ m s⁻/.test(t), `${s.id}: use a no-break space before units`);
  }
});

test('the puzzle: 60.0 kg at home, 69.2 kg in a lift starting up at +1.5 m s⁻² (scales show N ÷ g)', () => {
  assert.equal(ANSWERS.scales.home, '60.0\u00a0kg');
  assert.equal(ANSWERS.scales.startingUp, '69.2\u00a0kg');
  assert.equal(label('hook-again', 'right'), ((M * (G + PUZZLE.a)) / G).toFixed(1) + '\u00a0kg');
  assert.equal(label('hook-again', 'home'), '60.0\u00a0kg');
  assert.equal(label('hook-again', 'subtracted-a'), '50.8\u00a0kg');
  assert.equal(label('hook-again', 'added-to-kg'), '61.5\u00a0kg');
  const intro = L.story[0];
  assert.ok(intro.kind === 'intro' && intro.body.includes(ANSWERS.scales.home));
  assert.ok(q('hook-again').why.includes(ANSWERS.scales.startingUp));
});

test('the slowing lift is still moving up for a while (it does not stop at once)', () => {
  const t = timeAtRest({ s0: 0, u: SLOW.u, a: SLOW.a });
  assert.ok(SLOW.u > 0 && SLOW.a < 0 && t !== null && t > 1);
});

test('the return to the puzzle is a new question, not the prediction again', () => {
  const hook = L.story.find((x) => x.id === 'hook')!;
  const again = q('hook-again');
  assert.ok('prompt' in hook && hook.prompt !== again.prompt);
  const labels = again.options.map((o) => o.label);
  assert.equal(new Set(labels).size, labels.length);
});

test('no Skill check question repeats a story prompt', () => {
  const story = new Set(L.story.map((x) => ('prompt' in x ? x.prompt : '')));
  for (const s of L.skillCheck) assert.ok(!story.has(s.prompt), s.id);
});
