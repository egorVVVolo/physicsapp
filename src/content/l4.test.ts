import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G, initialVelocityFor, position, relationFits, timesForDisplacement, timeToReach, velocity } from '../physics/kinematics.ts';
import { fixed } from '../physics/format.ts';
import { accTop, build, exam, EXAM_H, EXAM_T, examU, hook, ideaGravity, ideaRelease, ideaSign, l4, spotError, studentT, W, W2 } from './l4.ts';
import type { AccDir, BuildStep, Playback, Step } from './types.ts';
import { judgeStrobe } from '../session/logic.ts';

const near = (a: number, b: number, tol = 0.005) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);
const core = l4.sessions[0];

/** Every playback a step can produce, with a name for error messages. */
function playbacks(step: Step): [string, Playback][] {
  if (step.type === 'idea') return [[step.id, step.playback]];
  if (step.type === 'predict') return step.options.map((o) => [`${step.id}/${o.id}`, step.playbackFor(o.id)]);
  if (step.type === 'strobe') return strobeAnswers().map((a) => [`${step.id}/${JSON.stringify(a)}`, step.playbackFor(a)]);
  if (step.type === 'spot-error') return [[step.id, step.playback()]];
  const out: [string, Playback][] = [[`${step.id}/done`, step.donePlayback()]];
  for (const combo of combos(step)) out.push([`${step.id}/${JSON.stringify(combo)}`, step.wrongPlayback(combo)]);
  return out.concat(step.retry ? playbacks(step.retry) : []);
}
/** All 27 ways of setting the three strobe arrows. */
function strobeAnswers(): Record<string, AccDir>[] {
  const dirs: AccDir[] = ['down', 'zero', 'up'];
  return dirs.flatMap((rise) => dirs.flatMap((top) => dirs.map((fall) => ({ rise, top, fall }))));
}
/** Every way of filling the slots except the correct one. */
function combos(step: BuildStep) {
  let all: Record<string, number>[] = [{}];
  for (const sl of step.slots) all = all.flatMap((c) => sl.chips.map((ch) => ({ ...c, [sl.quantity]: ch.value })));
  return all.filter((c) => step.slots.some((sl) => c[sl.quantity] !== sl.correct));
}
/** Every feedback sentence a step can show (hints included). */
function feedbacks(step: Step): string[] {
  if (step.type === 'idea') return [];
  if (step.type === 'predict') return step.options.map((o) => o.feedback);
  if (step.type === 'strobe') return Object.values(step.feedback);
  if (step.type === 'spot-error') return [...step.items.map((l) => l.feedback), step.methodHint];
  return [
    ...step.relations.map((r) => r.feedback),
    ...step.slots.flatMap((sl) => sl.chips.map((c) => c.feedback ?? '')),
    ...step.final.choices.map((c) => c.feedback),
    step.methodHint,
    ...(step.retry ? feedbacks(step.retry) : []),
  ];
}
const buildSteps = (): [BuildStep, typeof W][] => [[build, W], [build.retry!, W2]];

test('model values for the balloon task (20 m, 12 m s⁻¹ up)', () => {
  near(W.tTop, 1.223);
  near(W.hTop, 27.34);
  near(W.tBack, 2.446);
  near(W.tLand, 3.584);
  near(W.roots[1], -1.138);
  near(velocity(W.tBack, W.real), -W.vb, 1e-9);
  assert.ok(W.hTop < 34, 'the whole rise fits in the world');
  near(W2.h0, 15, 0);
  near(W2.vb, 9, 0);
  assert.equal(W.scene.body.u, W.vb);
  assert.equal(W.scene.carrier.a, 0);
  assert.equal(W.scene.carrier.u, W.vb);
});

test('the session has 8 steps with unique ids, in the agreed order, and at least three step types', () => {
  assert.equal(core.steps.length, 8);
  assert.deepEqual(core.steps.map((s) => s.id), ['idea-release', 'hook', 'idea-gravity', 'acc-top', 'idea-sign', 'build', 'spot-error', 'exam']);
  assert.equal(new Set(core.steps.map((s) => s.id)).size, core.steps.length);
  assert.ok(new Set(core.steps.map((s) => (s.type === 'build' && s.exam ? 'exam' : s.type))).size >= 3);
});

test('hook: one correct option, every wrong one names a misconception, answered by dragging the arrow', () => {
  assert.equal(hook.input, 'vector');
  assert.equal(hook.options.filter((o) => o.correct).length, 1);
  for (const o of hook.options) assert.ok(o.correct || o.misconception, o.id);
  // the drag snaps to the preview values, so they must be distinct numbers
  const values = hook.options.map((o) => hook.preview(o.id));
  assert.equal(new Set(values).size, values.length);
});

test('hook: the correct option is the model’s u, the preview arrow matches, playback stops before the real landing', () => {
  assert.equal(hook.options.find((o) => o.correct)!.id, 'up');
  assert.equal(hook.preview('zero'), 0);
  assert.equal(hook.preview('up'), W.vb);
  assert.equal(hook.preview('down'), -W.vb);
  for (const o of hook.options) {
    const p = hook.playbackFor(o.id);
    assert.ok(p.endT < W.tLand - 0.5);
    assert.equal(p.showAcc, false, 'the a arrow would answer the next question');
    assert.ok(p.captions.ghostLand.includes(fixed(position(p.endT, W.real), 1)));
  }
});

test('strobe: rising, top, falling in time order; rising and falling at the same height', () => {
  const [rise, top, fall] = accTop.frames;
  assert.ok(rise.t < top.t && top.t < fall.t);
  near(top.t, W.tTop, 1e-9);
  near(position(rise.t, W.real), position(fall.t, W.real), 1e-9);
  near(velocity(top.t, W.real), 0, 1e-9);
});

test('strobe: only all-down is right; the telling mistakes get their own feedback', () => {
  assert.equal(judgeStrobe(accTop, { rise: 'down', top: 'down', fall: 'down' }).ok, true);
  const zero = judgeStrobe(accTop, { rise: 'down', top: 'zero', fall: 'down' });
  assert.equal(zero.ok, false);
  assert.equal(zero.misconception, 'K-TOP-ZERO-A');
  const follows = judgeStrobe(accTop, { rise: 'up', top: 'down', fall: 'down' });
  assert.equal(follows.misconception, 'K-ACC-DIR');
  for (const a of strobeAnswers()) {
    const p = accTop.playbackFor(a);
    assert.ok(p.endT < W.tBack, 'it never shows the return to the release height');
    assert.equal(p.showAcc, true);
    if (judgeStrobe(accTop, a).ok) assert.equal(p.companion, null);
  }
});

test('idea steps: no outcome, the real motion from the model, gravity ends before the return', () => {
  for (const s of [ideaRelease, ideaGravity, ideaSign]) {
    assert.equal(s.type, 'idea');
    assert.deepEqual(s.playback.real.motion, W.real);
    assert.equal(s.playback.companion, null);
  }
  assert.equal(ideaGravity.playback.showAcc, true);
  assert.ok(ideaGravity.playback.endT > W.tTop && ideaGravity.playback.endT < W.tBack);
  assert.equal(ideaSign.highlight, 's');
  // the sign tag shows wherever a sign is decided (not on spot-the-error: its stage is too short for extra pills)
  for (const s of [ideaGravity, ideaSign, build, exam, accTop]) assert.equal(s.sign, true, s.id);
});

test('build step: one fitting equation, slot values and both roots come from the model', () => {
  for (const [step, w] of buildSteps()) {
    const fitting = step.relations.filter((r) => relationFits(r.id, step.known, step.unknown));
    assert.deepEqual(fitting.map((r) => r.id), ['sut']);
    for (const r of step.relations) assert.ok(r.id === 'sut' || r.misconception, r.id);
    const correct = Object.fromEntries(step.slots.map((sl) => [sl.quantity, sl.correct]));
    assert.deepEqual(correct, { s: -w.h0, u: w.vb, a: -G });
    assert.deepEqual(step.slots.map((sl) => sl.highlight), ['s', 'u', 'a']);
    for (const sl of step.slots) {
      assert.ok(sl.chips.length >= 2 && sl.chips.length <= 3);
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

test('build step: the correct answer is not in the same place every time', () => {
  const pos = (n: number, len: number) => (n === 0 ? 'first' : n === len - 1 ? 'last' : 'middle');
  const slotPositions = new Set(build.slots.map((sl) => pos(sl.chips.findIndex((c) => c.value === sl.correct), sl.chips.length)));
  assert.ok(slotPositions.size >= 2, 'chips: the correct one is not always first or always last');
  assert.ok(build.relations.findIndex((r) => r.id === 'sut') !== exam.relations.findIndex((r) => r.id === 'sut'));
  assert.ok(build.relations.findIndex((r) => r.id === 'sut') > 0 && build.relations.findIndex((r) => r.id === 'sut') < build.relations.length - 1);
});

test('build step: no wrong setup ever shows the real landing time', () => {
  for (const [step, w] of buildSteps()) {
    for (const combo of combos(step)) {
      // all three signs flipped is the same flight with down positive; it is never reached through the taps
      // (the first wrong value ends the attempt) and would land exactly when the real one does
      if (step.slots.every((sl) => combo[sl.quantity] === -sl.correct)) continue;
      const p = step.wrongPlayback(combo);
      assert.ok(Number.isFinite(p.endT) && p.endT > 0.3, `${JSON.stringify(combo)}: ${p.endT}`);
      assert.ok(p.endT < w.tLand - 0.35, `${JSON.stringify(combo)} ends at ${p.endT}`);
      for (const c of Object.values(p.captions)) assert.ok(!c.includes(fixed(w.tLand, 2)), c);
    }
    // the ways the taps really reach wrongPlayback: the correct values so far plus one wrong value
    step.slots.forEach((sl, i) => {
      const before = Object.fromEntries(step.slots.slice(0, i).map((x) => [x.quantity, x.correct]));
      for (const ch of sl.chips.filter((c) => c.value !== sl.correct)) {
        const p = step.wrongPlayback({ ...before, [sl.quantity]: ch.value });
        assert.ok(p.endT < w.tLand - 0.35);
      }
    });
  }
});

test('spot the error: one wrong item (v at the ground), and every value follows from the model', () => {
  assert.equal(spotError.items.length, 5);
  const wrong = spotError.items.filter((l) => l.wrong);
  assert.deepEqual(wrong.map((w) => w.kind), ['v']);
  near(studentT, W.roots[1], 1e-9); // the wrong sign leads exactly to the rejected root
  const v2 = W.vb ** 2 + 2 * G * W.h0;
  const byKind = Object.fromEntries(spotError.items.map((i) => [i.kind, i]));
  near(byKind.v.value, Math.sqrt(v2), 1e-9);
  near(byKind.v.value, -W.vLand, 1e-9); // the student's v has the right size and the wrong sign
  assert.equal(byKind.s.value, -W.h0);
  assert.equal(byKind.u.value, W.vb);
  near(byKind.t.value, studentT, 1e-9);
  assert.ok(byKind.v.label.includes(fixed(Math.sqrt(v2), 1)));
  assert.ok(byKind.t.label.includes(fixed(studentT, 2)));
  assert.ok(spotError.working.includes(fixed(v2, 0)) && spotError.working.includes(fixed(studentT, 2)));
  assert.ok(spotError.worked.at(-1)!.includes(fixed(W.tLand, 2)));
});

test('exam step: u from the model lands the sandbag at the given time, and it is positive', () => {
  near(examU, initialVelocityFor(-EXAM_H, -G, EXAM_T), 1e-12);
  near(timeToReach(0, { s0: EXAM_H, u: examU, a: -G })!, EXAM_T, 1e-9);
  assert.ok(examU > 0);
  assert.equal(exam.final.choices.find((c) => c.correct)!.id, 'up');
  assert.deepEqual(exam.relations.filter((r) => relationFits(r.id, exam.known, exam.unknown)).map((r) => r.id), ['sut']);
  assert.ok(exam.solved.includes(fixed(examU, 1)));
  assert.equal(exam.scene.secretCarrierSpeed, true, 'the balloon’s velocity arrow would give the answer away');
  assert.deepEqual(exam.exam, { command: 'Determine', marks: 3 });
  assert.deepEqual(exam.facts, [`sandbag lands after ${fixed(EXAM_T, 1)} s`]);
  assert.equal(exam.scene.body.s0, EXAM_H);
  assert.equal(exam.given!.value, EXAM_T);
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
    }
  }
});

test('text fits one screen: question ≤ 48, idea line ≤ 70, feedback ≤ 45, caption ≤ 38, slot prompt ≤ 40, facts ≤ 28, working ≤ 46', () => {
  const all = core.steps.flatMap((s): Step[] => (s.type === 'build' && s.retry ? [s, s.retry] : [s]));
  for (const step of all) {
    const question = step.type === 'build' && step.exam ? `${step.exam.command} ${step.question}` : step.question;
    assert.ok(question.length <= 48, `${step.id} question (${question.length}): ${question}`);
    assert.ok((step.facts?.length ?? 0) <= 2, step.id);
    for (const f of step.facts ?? []) assert.ok(f.length <= 28, `${step.id} fact: ${f}`);
    if (step.type === 'idea') assert.ok(step.line.length <= 70, `${step.id} line (${step.line.length})`);
    for (const f of feedbacks(step)) assert.ok(f.length <= 45, `${step.id} feedback (${f.length}): ${f}`);
    for (const [name, p] of playbacks(step)) for (const c of Object.values(p.captions)) assert.ok(c.length <= 38, `${name} caption (${c.length}): ${c}`);
    if (step.type === 'build') {
      assert.ok(step.relationPrompt.length <= 48 && step.final.prompt.length <= 40, step.id);
      for (const sl of step.slots) assert.ok(sl.prompt.length <= 40, `${step.id} prompt (${sl.prompt.length}): ${sl.prompt}`);
      for (const l of step.worked) assert.ok(l.length <= 100, `${step.id} worked: ${l}`);
    }
    if (step.type === 'spot-error') {
      assert.ok(step.working.length <= 46, `${step.id} working (${step.working.length})`);
      for (const l of step.items) assert.ok(l.label.length <= 14, `${step.id} item label: ${l.label}`);
      for (const l of step.worked) assert.ok(l.length <= 100, l);
    }
  }
});

test('no filler feedback ("Yes.", "Not quite.", "Correct!")', () => {
  for (const step of core.steps) for (const f of feedbacks(step)) assert.doesNotMatch(f, /^(Yes|No|Not quite|Correct|Right|Wrong|Great)\b[.!,]/, f);
});

test('every build stage says how it is answered; timeline answers sit at the model roots', () => {
  for (const step of [build, build.retry!, exam]) {
    for (const sl of step.slots) assert.ok(['displacement', 'vector', 'flip', 'tiles', 'cards'].includes(sl.input), `${step.id}/${sl.quantity}`);
    if (step.final.input === 'timeline') {
      const roots = timesForDisplacement(step.slots[0].correct, step.slots[1].correct, step.slots[2].correct);
      for (const c of step.final.choices) assert.ok(roots.some((r) => Math.abs(r - (c.value ?? NaN)) < 1e-9), `${step.id}/${c.id}`);
    }
  }
  // ordinary choice stays where choosing is the skill: which equation, and what the sign means
  assert.ok(core.steps.some((s) => s.type === 'build' && s.final.input === 'cards'));
});
