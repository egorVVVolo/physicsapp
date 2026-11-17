// Every number in "Which way is positive?" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whichWayIsPositive as L, ANSWERS as X, BOUNCE, HIKE, LAP, RUN_A, RUN_B, SWIM, T, T_MID } from './which-way-is-positive.ts';
import { tripPosition, tripVelocity } from '../physics/kinematics.ts';
import type { Question } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as Question;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = '\u00A0';
const near = (a: number, b: number, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('runner A: 300 m east, 500 m west in 200 s; distance 800 m, displacement −200 m', () => {
  near(X.out, 300);
  near(X.back, -500);
  near(X.distA, 800);
  near(X.dispA, -200);
  assert.equal(right('displacement'), 'right');
  assert.equal(label('displacement', 'right'), `200${NB}m west`);
  assert.equal(label('displacement', 'path'), `800${NB}m west`);
});

test('average speed 4.0 m s⁻¹, average velocity −1.0 m s⁻¹; west positive flips only the sign', () => {
  near(X.avgSpeedA, 4);
  near(X.avgVelA, -1);
  assert.equal(label('avg-velocity', 'right'), `−1.0${NB}m${NB}s⁻¹`);
  assert.equal(label('avg-velocity', 'speed'), `+4.0${NB}m${NB}s⁻¹`);
  assert.equal(label('flip', 'right'), `+1.0${NB}m${NB}s⁻¹`);
});

test('the puzzle: both runners have the same average velocity, and A catches B exactly at the finish', () => {
  near(X.avgVelB, X.avgVelA);
  near(tripPosition(T, RUN_B), tripPosition(T, RUN_A));
  for (let t = 1; t < T; t += 1) assert.ok(tripPosition(t, RUN_A) > tripPosition(t, RUN_B), `A is not ahead (east) of B at ${t} s`);
  assert.equal(right('hook-again'), 'same');
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.equal(hook.kind, 'predict');
});

test('at 120 s both move west; runner A is the faster one', () => {
  near(X.vA, tripVelocity(T_MID, RUN_A));
  assert.ok(X.vA < 0 && X.vB < 0 && Math.abs(X.vA) > Math.abs(X.vB));
  assert.equal(right('faster'), 'A');
});

test('runner A is back at the lamp post at 150 s, after 600 m', () => {
  near(tripPosition(X.tHome, RUN_A), 0);
  near(X.tHome, 150);
  near(X.distHome, 600);
  const scrub = L.story.find((s) => s.id === 'scrub')!;
  assert.ok(scrub.kind === 'explore' && scrub.question.options.find((o) => o.correct)!.label === `At 150${NB}s`);
});

test('the hiker: 5.0 km at 53° east of north (7.0 km walked)', () => {
  near(X.hike.right, Math.hypot(HIKE.north, HIKE.east));
  near(X.hike.right, 5);
  near(X.hike.angle, (Math.atan(HIKE.east / HIKE.north) * 180) / Math.PI);
  assert.equal(label('hiker', 'right'), `5.0${NB}km`);
  assert.equal(label('hiker', 'added'), `7.0${NB}km`);
  assert.equal(label('bearing', 'right'), '53° east of north');
  assert.equal(label('bearing', 'from-east'), '37° east of north');
});

test('Skill check: half lap 3.2 m s⁻¹, river 1.5 m s⁻¹, bounce −10.0 m s⁻¹, mass is the scalar', () => {
  near(X.lap.chord, LAP.round / Math.PI, 1e-9);
  assert.equal(label('half-lap', 'right'), `3.2${NB}m${NB}s⁻¹`);
  assert.equal(label('half-lap', 'speed'), `5.0${NB}m${NB}s⁻¹`);
  near(X.swim.right, Math.hypot(SWIM.across, SWIM.current));
  assert.equal(label('river', 'right'), `1.5${NB}m${NB}s⁻¹`);
  near(X.bounce.right, BOUNCE.v - BOUNCE.u);
  assert.equal(label('bounce', 'right'), `−10.0${NB}m${NB}s⁻¹`);
  assert.equal(right('scalar-q'), 'mass');
});

test('every option label is different within a question', () => {
  for (const s of all) {
    if (s.kind === 'choice' || s.kind === 'tapFig') {
      const labels = s.options.map((o) => o.label);
      assert.equal(new Set(labels).size, labels.length, `${s.id}: two options read the same: ${labels.join(' | ')}`);
    }
  }
});
