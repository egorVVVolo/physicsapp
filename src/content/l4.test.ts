import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G, initialVelocityFor, position, relationFits, timesForDisplacement, timeToReach, velocity } from '../physics/kinematics.ts';
import { fixed } from '../physics/format.ts';
import { accTop, build, exam, EXAM_H, EXAM_T, examU, hook, l4, spotError, studentT, twins, W, W2 } from './l4.ts';
import type { BuildStep, Playback, Step } from './types.ts';

const near = (a: number, b: number, tol = 0.005) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);
const core = l4.sessions[0];

/** Every playback a step can produce, with a name for error messages. */
function playbacks(step: Step): [string, Playback][] {
  if (step.type === 'predict') return step.options.map((o) => [`${step.id}/${o.id}`, step.playbackFor(o.id)]);
  if (step.type === 'spot-error') return [[step.id, step.playback()]];
  const out: [string, Playback][] = [[`${step.id}/done`, step.donePlayback()]];
  for (const combo of combos(step)) out.push([`${step.id}/${JSON.stringify(combo)}`, step.wrongPlayback(combo)]);
  return out.concat(step.retry ? playbacks(step.retry) : []);
}
/** Every way of filling the slots except the correct one. */
function combos(step: BuildStep) {
  let all: Record<string, number>[] = [{}];
  for (const sl of step.slots) all = all.flatMap((c) => sl.chips.map((ch) => ({ ...c, [sl.quantity]: ch.value })));
  return all.filter((c) => step.slots.some((sl) => c[sl.quantity] !== sl.correct));
}
/** Every sentence a step can show as feedback. */
function feedbacks(step: Step): string[] {
  if (step.type === 'predict') return step.options.map((o) => o.feedback);
  if (step.type === 'spot-error') return [...step.lines.map((l) => l.feedback), step.methodHint];
  return [
    ...step.relations.map((r) => r.feedback),
    ...step.slots.flatMap((sl) => sl.chips.map((c) => c.feedback ?? '')),
    ...step.final.choices.map((c) => c.feedback),
    step.final.prompt,
    step.flippedFeedback,
    step.methodHint,
    ...(step.retry ? feedbacks(step.retry) : []),
  ];
}

test('model values for the drone task (20 m, 8.0 m s⁻¹ up)', () => {
  near(W.tTop, 0.815);
  near(W.hTop, 23.26);
  near(W.tBack, 1.631);
  near(W.tLand, 2.993);
  near(W.vLand, -21.36);
  near(W.roots[1], -1.362);
  near(velocity(W.tBack, W.real), -W.vb, 1e-9);
  near(W2.tLand, 2.464);
});

test('the session has 6–8 steps with unique ids and at least three step types', () => {
  assert.ok(core.steps.length >= 6 && core.steps.length <= 8);
  assert.equal(new Set(core.steps.map((s) => s.id)).size, core.steps.length);
  assert.ok(new Set(core.steps.map((s) => (s.type === 'build' && s.exam ? 'exam' : s.type))).size >= 3);
});

test('predict steps: exactly one correct option, every wrong one names a misconception', () => {
  for (const step of [hook, accTop, twins]) {
    assert.equal(step.options.filter((o) => o.correct).length, 1, step.id);
    for (const o of step.options) assert.ok(o.correct || o.misconception, `${step.id}/${o.id}`);
    assert.equal(new Set(step.options.map((o) => o.id)).size, step.options.length);
  }
});

test('hook: the correct option is the model’s u, and playback stops before the real landing', () => {
  assert.equal(hook.options.find((o) => o.correct)!.id, 'up');
  assert.equal(hook.playbackFor('up').real.motion.u, W.vb);
  for (const o of hook.options) {
    const p = hook.playbackFor(o.id);
    assert.ok(p.endT < W.tLand - 0.5);
    assert.equal(p.showAcc, false, 'the a arrow would answer the next step');
    assert.ok(p.captions.ghostLand.includes(fixed(p.endT, 2)));
    assert.ok(p.captions.ghostLand.includes(fixed(position(p.endT, W.real), 1)));
  }
});

test('acceleration step: stops before the package is back at the release height', () => {
  for (const o of accTop.options) assert.ok(accTop.playbackFor(o.id).endT < W.tBack);
});

test('build step: one fitting equation, slot values and both roots come from the model', () => {
  for (const step of [build, build.retry!]) {
    const w = step === build ? W : W2;
    const fitting = step.relations.filter((r) => relationFits(r.id, step.known, step.unknown));
    assert.deepEqual(fitting.map((r) => r.id), ['sut']);
    for (const r of step.relations) assert.ok(r.id === 'sut' || r.misconception, r.id);
    const correct = Object.fromEntries(step.slots.map((sl) => [sl.quantity, sl.correct]));
    assert.deepEqual(correct, { s: -w.h0, u: w.vb, a: -G });
    for (const sl of step.slots) {
      assert.equal(sl.chips.filter((c) => c.value === sl.correct).length, 1);
      for (const c of sl.chips) assert.ok(c.value === sl.correct || (c.misconception && c.feedback), `${sl.quantity}=${c.value}`);
    }
    const roots = timesForDisplacement(correct.s, correct.u, correct.a);
    near(roots[0], timeToReach(0, w.real)!, 1e-9);
    assert.ok(step.solved.includes(fixed(roots[0], 2)) && step.solved.includes(fixed(roots[1], 2)), step.solved);
    const right = step.final.choices.filter((c) => c.correct);
    assert.equal(right.length, 1);
    assert.equal(right[0].label, `${fixed(roots[0], 2)} s`);
    assert.ok(step.worked.some((l) => l.includes(fixed(roots[0], 2))));
  }
});

test('build step: no wrong setup ever shows the real landing time', () => {
  for (const step of [build, build.retry!]) {
    const w = step === build ? W : W2;
    for (const combo of combos(step)) {
      // every sign flipped is never played: it gets a note instead (see session/build.ts)
      if (step.slots.every((sl) => combo[sl.quantity] === -sl.correct)) continue;
      const p = step.wrongPlayback(combo);
      assert.ok(Number.isFinite(p.endT) && p.endT > 0.3, `${JSON.stringify(combo)}: ${p.endT}`);
      assert.ok(p.endT < w.tLand - 0.4, `${JSON.stringify(combo)} ends at ${p.endT}`);
      for (const c of Object.values(p.captions)) assert.ok(!c.includes(fixed(w.tLand, 2)), c);
    }
  }
});

test('spot the error: one wrong line, and its numbers follow from the model', () => {
  assert.equal(spotError.lines.filter((l) => l.wrong).length, 1);
  near(studentT, W.roots[1], 1e-9); // the wrong sign leads exactly to the rejected root
  const v2 = W.vb ** 2 + 2 * G * W.h0;
  assert.ok(spotError.lines[1].text.includes(fixed(v2, 0)));
  assert.ok(spotError.lines[2].text.includes(fixed(Math.sqrt(v2), 1)));
  assert.ok(spotError.lines[3].text.includes(fixed(studentT, 2)));
  assert.ok(spotError.worked.at(-1)!.includes(fixed(W.tLand, 2)));
});

test('twin drones: both land at the same speed, A later by the time it takes to come back', () => {
  const p = twins.playbackFor('same');
  const b = p.companion!.track;
  near(Math.abs(velocity(b.end, b.motion)), Math.abs(W.vLand), 1e-9);
  near(W.tLand - b.end, W.tBack, 1e-9);
  assert.ok(p.captions.aLand.includes(fixed(-W.vLand, 1)) && p.captions.bLand.includes(fixed(-W.vLand, 1)));
});

test('exam step: u from the model lands the package at the given time, and it is positive', () => {
  near(examU, initialVelocityFor(-EXAM_H, -G, EXAM_T), 1e-12);
  near(timeToReach(0, { s0: EXAM_H, u: examU, a: -G })!, EXAM_T, 1e-9);
  assert.ok(examU > 0);
  assert.equal(exam.final.choices.find((c) => c.correct)!.id, 'up');
  assert.deepEqual(exam.relations.filter((r) => relationFits(r.id, exam.known, exam.unknown)).map((r) => r.id), ['sut']);
  assert.ok(exam.solved.includes(fixed(examU, 1)));
  assert.equal(exam.scene.carrier.secret, true, 'the drone’s velocity arrow would give the answer away');
  assert.ok(exam.condition.includes(`${fixed(EXAM_H, 0)} m`) && exam.condition.includes(`${fixed(EXAM_T, 1)} s`));
});

test('every playback: ordered events, one final event, a caption for each', () => {
  for (const step of core.steps) {
    for (const [name, p] of playbacks(step)) {
      const ts = p.events.map((e) => e.t);
      assert.deepEqual([...ts].sort((a, b) => a - b), ts, name);
      assert.equal(p.events.filter((e) => e.end).length, 1, name);
      assert.equal(p.events.at(-1)!.end, true, name);
      near(p.events.at(-1)!.t, p.endT, 1e-9);
      for (const e of p.events) assert.ok(p.captions[e.id], `${name}: caption for ${e.id}`);
      assert.ok(p.graph.tMax > p.endT, name);
    }
  }
});

test('text fits one screen: feedback ≤ 110 characters, captions ≤ 80, conditions ≤ 135', () => {
  for (const step of core.steps) {
    assert.ok(step.condition.length <= 135, `${step.id} condition: ${step.condition.length}`);
    for (const f of feedbacks(step)) assert.ok(f.length <= 110, `${step.id} (${f.length}): ${f}`);
    for (const [name, p] of playbacks(step)) for (const c of Object.values(p.captions)) assert.ok(c.length <= 80, `${name} (${c.length}): ${c}`);
  }
});

test('conditions state the givens with units', () => {
  assert.ok(W.condition.includes(`${fixed(W.vb, 1)} m s⁻¹`));
  assert.ok(W.condition.includes(`${fixed(W.h0, 0)} m `));
  assert.ok(W.condition.includes(`${fixed(G, 2)} m s⁻²`));
});
