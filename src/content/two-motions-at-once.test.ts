// Every number in "Two motions at once" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { twoMotionsAtOnce as L, ANSWERS as X, BENCH, CLIFF, GOLF, KICK, PLANE } from './two-motions-at-once.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { Question } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as Question;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = '\u00A0';
const g = 9.81;
const rad = Math.PI / 180;
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('the bench: dropped and rolled balls land together after 0.505 s; B lands 1.01 m out', () => {
  near(X.bench.t, Math.sqrt((2 * BENCH.h) / g));
  assert.equal(right('race'), 'same');
  assert.equal(label('fall-time', 'right'), `0.505${NB}s`);
  assert.equal(label('fall-time', 'sideways'), `0.625${NB}s`);
  near(X.bench.range, BENCH.uB * X.bench.t);
  assert.equal(label('land', 'right'), `1.01${NB}m`);
  assert.equal(label('land', 'sideways'), `1.25${NB}m`); // h ÷ u as the time gives back the height
  near(X.bench.step, 0.2);
});

test('twice as fast: the same fall time, twice as far', () => {
  near(X.bench.tC, X.bench.t);
  near(X.bench.rangeC, 2 * X.bench.range);
  assert.equal(right('faster'), 'same');
});

test('Mia, 20 m s⁻¹ at 30°: 17.3 along, 10.0 up, 2.04 s, 17.3 m s⁻¹ at the top, 35.3 m', () => {
  near(X.mia.ux, KICK.u * Math.cos(KICK.mia * rad));
  near(X.mia.uy, KICK.u * Math.sin(KICK.mia * rad));
  near(X.mia.t, (2 * X.mia.uy) / g);
  assert.equal(label('flight-time', 'right'), `2.04${NB}s`);
  assert.equal(label('flight-time', 'to-top'), `1.02${NB}s`);
  assert.equal(label('top', 'right'), `17.3${NB}m${NB}s⁻¹`);
  near(X.mia.range, X.mia.ux * X.mia.t);
  assert.equal(label('range', 'right'), `35.3${NB}m`);
  assert.equal(label('range', 'whole'), `40.8${NB}m`);
});

test('the puzzle: Leo at 60° lands at the same spot, 35.3 m; 45° goes furthest, 40.8 m', () => {
  near(X.leo.range, X.mia.range, 1e-9);
  assert.ok(X.leo.t > X.mia.t && X.leo.ux < X.mia.ux);
  assert.equal(right('hook-again'), 'same');
  assert.equal(L.story.find((s) => s.id === 'hook')!.kind, 'predict');
  assert.ok(X.best.range > X.mia.range);
  near(X.best.range, 40.77, 0.01);
});

test("Leo's ball rises 15.3 m; Mia's 5.1 m", () => {
  near(X.leo.height, X.leo.uy ** 2 / (2 * g));
  assert.equal(label('height', 'right'), `15.3${NB}m`);
  assert.equal(label('height', 'mia'), `5.1${NB}m`);
});

test('Skill check: cliff 30.3 m and 24.8 m s⁻¹, golf 13.2 m, the plane right above the package', () => {
  const t = Math.sqrt((2 * CLIFF.h) / g);
  near(X.cliff.range, CLIFF.u * t);
  assert.equal(label('cliff', 'right'), `30.3${NB}m`);
  near(X.cliff.speed, Math.hypot(CLIFF.u, g * t));
  assert.equal(label('impact', 'right'), `24.8${NB}m${NB}s⁻¹`);
  near(X.golf.right, (GOLF.u * Math.sin(GOLF.angle * rad)) ** 2 / (2 * g));
  assert.equal(label('golf', 'right'), `13.2${NB}m`);
  near(X.plane.x, PLANE.u * Math.sqrt((2 * PLANE.h) / g));
  assert.equal(right('package'), 'above');
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
