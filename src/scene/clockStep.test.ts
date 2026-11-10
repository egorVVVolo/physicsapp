import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advance, type StepState } from './clockStep.ts';

const times = [0.5, 1.2, 2.0];
const ends = [false, false, true];
const HOLD = 1.7;

/** Run to the end at a given frame rate; return real seconds elapsed and the events fired. */
function run(hz: number, jump = false) {
  let s: StepState = { t: 0, index: 0, hold: 0, ended: false };
  const dt = 1 / hz;
  let real = 0;
  const fired: number[] = [];
  let resumes = 0;
  for (let i = 0; i < 100000 && !s.ended; i++) {
    const r = advance(s, dt, times, ends, HOLD, jump);
    real += dt;
    if (r.fired >= 0) fired.push(r.fired);
    if (r.resumed) resumes++;
    s = r;
  }
  return { real, fired, resumes, t: s.t };
}

test('same real duration at 60, 90 and 120 Hz', () => {
  const expected = 2.0 + 2 * HOLD; // model time + two holds
  for (const hz of [60, 90, 120]) {
    const { real } = run(hz);
    assert.ok(Math.abs(real - expected) < 0.08, `${hz} Hz took ${real.toFixed(3)} s, expected ${expected}`);
  }
});

test('stops exactly on each event, in order, and ends on the last', () => {
  const { fired, resumes, t } = run(60);
  assert.deepEqual(fired, [0, 1, 2]);
  assert.equal(resumes, 2);
  assert.equal(t, 2.0);
});

test('time never passes an event within one step', () => {
  const r = advance({ t: 0.49, index: 0, hold: 0, ended: false }, 0.05, times, ends, HOLD, false);
  assert.equal(r.t, 0.5);
  assert.equal(r.hold, HOLD);
});

test('reduced motion jumps from event to event', () => {
  const r = advance({ t: 0, index: 0, hold: 0, ended: false }, 0.016, times, ends, HOLD, true);
  assert.equal(r.t, 0.5);
  assert.equal(r.fired, 0);
});

test('nothing changes after the end', () => {
  const r = advance({ t: 2, index: 3, hold: 0, ended: true }, 0.016, times, ends, HOLD, false);
  assert.equal(r.t, 2);
  assert.equal(r.fired, -1);
});
