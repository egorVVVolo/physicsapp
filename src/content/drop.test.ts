import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G, position, velocity } from '../physics/kinematics.ts';
import { fixed } from '../physics/format.ts';
import { condition, H0, hTop, options, playbackFor, realBody, tBack, tLandReal, tLandWith, tTop, VB } from './drop.ts';

const near = (a: number, b: number, tol = 0.005) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('model values for the task (20 m, 8.0 m s⁻¹ up)', () => {
  near(tTop, 0.815);
  near(hTop, 23.26);
  near(tBack, 1.631);
  near(tLandReal, 2.993);
  near(velocity(tBack, realBody), -VB, 1e-9);
});

test('exactly one correct option, and it matches the model', () => {
  const correct = options.filter((o) => o.correct);
  assert.equal(correct.length, 1);
  assert.equal(correct[0].u, realBody.u);
  assert.equal(new Set(options.map((o) => o.id)).size, options.length);
});

test('the rise is big enough to see (at least 3 m)', () => {
  assert.ok(hTop - H0 >= 3, `rise is only ${(hTop - H0).toFixed(2)} m`);
});

test('every playback: ordered events, one final event, stops before the real landing', () => {
  for (const o of options) {
    const p = playbackFor(o);
    const ts = p.events.map((e) => e.t);
    assert.deepEqual([...ts].sort((a, b) => a - b), ts, 'events in time order');
    assert.equal(p.events.filter((e) => e.end).length, 1);
    assert.equal(p.events[p.events.length - 1].end, true);
    assert.ok(p.endT < tLandReal, 'the real landing time is not revealed');
    assert.ok(Number.isFinite(p.endT) && p.endT > 0);
    near(p.endT, tLandWith(p.ghostU), 1e-9);
    for (const e of p.events) assert.ok(p.captions[e.id], `caption for ${e.id}`);
    // numbers quoted in the final caption come from the model
    const cap = p.captions.ghostLand;
    assert.ok(cap.includes(fixed(p.endT, 2)), cap);
    assert.ok(cap.includes(fixed(position(p.endT, realBody), 1)), cap);
    assert.ok(p.graph.tMax > p.endT && p.graph.hMax > hTop);
  }
});

test('the condition states every given with its unit', () => {
  assert.ok(condition.includes(`${fixed(VB, 1)} m s⁻¹`));
  assert.ok(condition.includes(`${fixed(H0, 0)} m `));
  assert.ok(condition.includes(`${fixed(G, 2)} m s⁻²`));
});

test('text fits one screen: feedback ≤ 110 characters, captions ≤ 80', () => {
  for (const o of options) {
    assert.ok(o.feedback.length <= 110, `${o.id}: ${o.feedback.length}`);
    for (const c of Object.values(playbackFor(o).captions)) assert.ok(c.length <= 80, `${c.length}: ${c}`);
  }
});
