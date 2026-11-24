// Every number in "Drawing the forces" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drawingTheForces as L, ANSWERS as X, ANGLE, ICE, LADDER, M, PULL } from './drawing-the-forces.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { BuildScreen, ExamCardScreen, OptionQuestion, SortScreen, SpotErrorScreen } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const build = (id: string) => all.find((s) => s.id === id) as BuildScreen;
const chip = (b: Pick<BuildScreen, 'chips'>, id: string) => b.chips.find((c) => c.id === id)!.label;
const NB = '\u00A0';
const rad = Math.PI / 180;
const g = 9.81;
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('the crate: W = 392 N, the rope gives 103.9 N forward and 60.0 N up', () => {
  near(X.weight, M * g);
  near(X.forward, PULL * Math.cos(ANGLE * rad));
  near(X.up, PULL * Math.sin(ANGLE * rad));
});

test('friction at steady speed is the forward part: 104 N, not 120 N', () => {
  near(X.friction.right, X.forward);
  assert.equal(label('friction', 'right'), `104${NB}N`);
  assert.equal(label('friction', 'whole'), `120${NB}N`);
  assert.equal(label('friction', 'sin'), `60.0${NB}N`);
  assert.equal(right('friction'), 'right');
});

test('the puzzle: the floor pushes 332 N (built), less than the weight, because the rope holds up part of it', () => {
  near(X.normal.right + X.up, X.weight); // up and down balance
  assert.ok(X.normal.right < X.weight);
  const b = build('normal');
  near(b.result.value, X.normal.right);
  assert.deepEqual(b.boxes, { W: 'weight', T: 'pull', θ: 'angle' });
  assert.equal(chip(b, 'weight'), `392${NB}N`);
  assert.equal(chip(b, 'pull'), `120${NB}N`);
  assert.equal(chip(b, 'angle'), '30°');
  assert.equal(chip(b, 'vertical'), '60°');
  assert.equal(chip(b, 'forward'), `104${NB}N`);
  assert.equal(right('hook-again'), 'rope');
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.equal(hook.kind, 'predict');
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'smaller'));
});

test('the sort: the crate’s weight, the floor’s push, friction and the rope’s pull act on it; its own pushes act on others', () => {
  const s = L.story.find((sc) => sc.id === 'forces') as SortScreen;
  const bin = (id: string) => s.items.find((i) => i.id === id)!.bin;
  for (const id of ['weight', 'normal', 'friction', 'rope']) assert.equal(bin(id), 'on', id);
  for (const id of ['push', 'tug']) assert.equal(bin(id), 'by', id);
});

test('Hugo’s mistake: a forward force after Rose lets go', () => {
  const s = L.story.find((sc) => sc.id === 'motion') as SpotErrorScreen;
  assert.equal(s.lines.find((l) => l.wrong)!.id, 'forward');
  assert.ok(s.fig?.kind === 'crate' && s.fig.by === 'none' && s.fig.fbdAfterCheck === true, 'the diagram appears after the answer');
});

test('the ladder: the smooth wall pushes 27.4 N; friction 27.4 N towards the wall; N = W = 118 N (exam card)', () => {
  const w = LADDER.m * g;
  const a = LADDER.angle * rad;
  near(w * 0.5 * Math.cos(a), X.ladder.wall * Math.sin(a)); // moments about the foot
  near(X.ladder.friction, X.ladder.wall);
  near(X.ladder.normal, w);
  assert.equal(label('foot', 'right'), `27.4${NB}N towards the wall`);
  assert.equal(right('wall'), 'normal');
  const card = all.find((s) => s.id === 'ladder-card') as ExamCardScreen;
  const [pa, pb] = card.parts;
  assert.ok(pa.kind === 'choice' && pa.options.find((o) => o.correct)!.id === 'right');
  assert.ok(pb.kind === 'build');
  if (pb.kind === 'build') {
    near(pb.build.result.value, 27.4, 0.05);
    near(pb.build.result.value, w / (2 * Math.tan(a)));
    assert.equal(chip(pb.build, 'weight'), `118${NB}N`);
    assert.equal(chip(pb.build, 'angle'), '65°');
    assert.equal(chip(pb.build, 'other'), '25°');
  }
  assert.equal(pa.marks + pb.marks, 3);
});

test('Skill check: a pole pushing down at 30° makes the floor push 452 N (built); the box on ice cannot be told', () => {
  const b = build('pole');
  near(b.result.value, X.weight + X.up);
  assert.deepEqual(b.boxes, { W: 'weight', T: 'push', θ: 'angle' });
  assert.equal(chip(b, 'forward'), `104${NB}N`);
  assert.equal(X.ice.resultant, ICE.b - ICE.a);
  near(X.ice.weight, ICE.m * g);
  assert.equal(right('ice'), 'right');
});

test('Skill check: the table sort', () => {
  const s = all.find((sc) => sc.id === 'table') as SortScreen;
  const bin = (id: string) => s.items.find((i) => i.id === id)!.bin;
  assert.equal(bin('weight'), 'on');
  assert.equal(bin('push'), 'on');
  assert.equal(bin('pressing'), 'not');
  assert.equal(bin('earth'), 'not');
});

test('every option label is different within a question', () => {
  for (const s of all) {
    if (s.kind === 'choice' || s.kind === 'tapFig') {
      const labels = s.options.map((o) => o.label);
      assert.equal(new Set(labels).size, labels.length, `${s.id}: two options read the same: ${labels.join(' | ')}`);
    }
  }
});

test('the lesson is playable from the map', () => {
  assert.equal(lessons[L.id]?.id, L.id);
  assert.ok(course.levels.flatMap((lv) => lv.lessons).some((l) => l.id === L.id && l.ready));
});
