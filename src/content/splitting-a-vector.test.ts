// Every number in "Splitting a vector" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splittingAVector as L, ANSWERS as X, ANGLE, CLIMB, EXPLORE, HILL, KICK, KITE, PARTS, PULL, PUSH, SKIER, TOW } from './splitting-a-vector.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { Question } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as Question;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = ' ';
const rad = Math.PI / 180;
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('Ana: 100 N at 60° gives 50.0 N forward and 86.6 N up', () => {
  near(X.forward, PULL * Math.cos(ANGLE * rad));
  near(X.up, PULL * Math.sin(ANGLE * rad));
  assert.equal(label('forward', 'right'), `50.0${NB}N`);
  assert.equal(label('forward', 'sin'), `86.6${NB}N`);
  assert.equal(label('lift', 'right'), `86.6${NB}N`);
  assert.equal(label('lift', 'left-over'), `50.0${NB}N`); // 100 − 50, the wrong way to the same number as the forward part
  assert.equal(right('which-part'), 'forward');
});

test('the puzzle: Ben wins, 60 N against 50.0 N', () => {
  assert.ok(PUSH > X.forward && PULL > PUSH);
  assert.equal(right('hook-again'), 'ben');
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.equal(hook.kind, 'predict');
});

test('the parts add to 136.6 N as numbers, but to 100 N tip to tail', () => {
  near(X.addedAsNumbers, 136.6, 0.05);
  near(X.addedBack, PULL);
  const s = L.story.find((x) => x.id === 'add-back')!;
  assert.ok(s.kind === 'text' && s.body[0].includes(`136.6${NB}N`) && s.body[0].includes(`= 100${NB}N`));
});

test('explore: Ana matches Ben at 53.1°; 45° gives 70.7 N each; from the vertical the same 50.0 N', () => {
  near(PULL * Math.cos(X.sameAsBen * rad), PUSH);
  near(X.sameAsBen, 53.13, 0.01);
  near(X.sameAsBenUp, 80, 1e-9);
  assert.equal(Math.round(X.sameAsBen), EXPLORE.right);
  assert.ok(X.atSteep > PUSH);
  near(X.low, 70.71, 0.01);
  assert.equal(label('half', 'right'), `70.7${NB}N`);
  near(X.fromVertical, X.forward);
});

test('kite 11.5 N, kicked ball 11.6 m s⁻¹, hill 85.5 N along and 234.9 N into the slope', () => {
  near(X.kite.right, KITE.size * Math.sin(KITE.angle * rad));
  assert.equal(label('kite', 'right'), `11.5${NB}N`);
  assert.equal(label('kite', 'cos'), `16.4${NB}N`);
  near(X.kick.right, KICK.u * Math.sin(KICK.angle * rad));
  assert.equal(label('kick', 'right'), `11.6${NB}m${NB}s⁻¹`);
  near(X.hill.right, HILL.weight * Math.sin(HILL.angle * rad));
  assert.equal(label('along', 'right'), `85.5${NB}N`);
  assert.equal(label('along', 'cos'), `234.9${NB}N`);
});

test('Skill check: climb 49.9 m s⁻¹, angle 22.6°, skier 166 N, barge 544 N', () => {
  near(X.climb.right, CLIMB.v * Math.sin(CLIMB.angle * rad));
  assert.equal(label('climb', 'right'), `49.9${NB}m${NB}s⁻¹`);
  near(Math.tan(X.angle.right * rad), PARTS.y / PARTS.x);
  assert.equal(label('force-angle', 'right'), '22.6°');
  assert.equal(label('force-angle', 'vertical'), '67.4°');
  near(X.skier.right, SKIER.m * 9.81 * Math.sin(SKIER.angle * rad));
  assert.equal(label('skier', 'right'), `166${NB}N`);
  near(X.tow.right, 2 * TOW.tension * Math.cos(TOW.angle * rad));
  assert.equal(label('tow', 'right'), `544${NB}N`);
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
  assert.equal(lessons[L.id], L);
  assert.ok(course.levels.flatMap((lv) => lv.lessons).some((l) => l.id === L.id && l.ready));
});
