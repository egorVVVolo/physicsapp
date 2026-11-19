// Every number in "Falling through air" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fallingThroughAir as L, ANSWERS as X, CASE_VT, CHUTE, CYCLIST, DIVERS, SHUTTLE, SKY, STACK } from './falling-through-air.ts';
import { skydive } from '../physics/drag.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { Question } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as Question;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = '\u00A0';
const V = `${NB}m${NB}s⁻¹`;
const A = `${NB}m${NB}s⁻²`;
const g = 9.81;
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('the puzzle: four times the weight, twice the terminal velocity, 2.40 m s⁻¹', () => {
  // drag = kv² = weight for both: (v_stack / v_one)² = 4
  near((X.stack.right / CASE_VT) ** 2, STACK);
  assert.equal(label('hook-again', 'right'), `2.40${V}`);
  assert.equal(label('hook-again', 'linear'), `4.80${V}`);
  assert.equal(label('hook-again', 'same'), `1.20${V}`);
  assert.equal(label('hook-again', 'slower'), `0.60${V}`);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'twice'));
});

test('the skydiver: a = g at the start, near 50 m s⁻¹ at 15 s, 6.0 m s⁻¹ under the canopy', () => {
  near(X.startA, g);
  assert.equal(label('start-a', 'right'), `9.81${A}`);
  assert.ok(X.at15 > 49.5 && X.at15 < SKY.vt);
  near(skydive(SKY.tEnd, { vt1: SKY.vt, vt2: CHUTE.vt, open: CHUTE.open, inflate: CHUTE.inflate }).v, CHUTE.vt, 1e-2);
  assert.equal(right('steady'), 'right');
  assert.equal(right('chute-dir'), 'right');
  assert.equal(label('chute-steady', 'right'), `Equal to her weight, 687${NB}N, as at 50${V}`);
});

test('just after the parachute opens: D = 5.0 W, a = 4.0 g = 39.2 m s⁻² upward', () => {
  assert.equal(X.peak.ratio, 5);
  near(X.peak.right, (X.peak.ratio - 1) * g);
  assert.equal(label('peak', 'right'), `39.2${A} upward`);
  assert.equal(label('peak', 'drag-only'), `49.1${A} upward`);
  assert.equal(label('peak', 'added'), `58.9${A} upward`);
  assert.ok(X.peak.t > CHUTE.open && X.peak.t < CHUTE.open + CHUTE.inflate);
});

test('Skill check: shuttlecock 5.81 m s⁻², cyclist 16.0 m s⁻¹, heavier diver 58.8 m s⁻¹', () => {
  near(X.shuttle.right, (SHUTTLE.m * g - SHUTTLE.drag) / SHUTTLE.m);
  assert.equal(label('shuttle', 'right'), `5.81${A}`);
  assert.equal(label('shuttle', 'drag-only'), `4.00${A}`);
  assert.equal(label('shuttle', 'added'), `13.8${A}`);
  near((X.cyclist.right / CYCLIST.v) ** 2, CYCLIST.push / CYCLIST.drag);
  assert.equal(label('cyclist', 'right'), `16.0${V}`);
  assert.equal(label('cyclist', 'linear'), `32.0${V}`);
  near((X.divers.right / DIVERS.vt) ** 2, DIVERS.heavy / DIVERS.light);
  assert.equal(label('divers', 'right'), `58.8${V}`);
  assert.equal(label('divers', 'linear'), `72.0${V}`);
  assert.equal(label('divers', 'slower'), `32.0${V}`);
  assert.equal(right('down'), 'right');
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
