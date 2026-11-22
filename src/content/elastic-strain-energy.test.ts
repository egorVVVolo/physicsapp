// Every number in "Elastic strain energy" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { elasticStrainEnergy as L, ANSWERS as X, DOUBLE, LAUNCHER } from './elastic-strain-energy.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { Question } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as Question;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = ' ';
const near = (a: number, b: number, rel = 1e-9) => assert.ok(Math.abs(a - b) <= rel * Math.abs(b), `expected ${b}, got ${a}`);
const j = (s: string) => `${s}${NB}J`;
const ms = (s: string) => `${s}${NB}m${NB}s⁻¹`;

test('the launcher: 12 N over 3.0 cm stores 0.18 J', () => {
  near(LAUNCHER.k * LAUNCHER.x, 12);
  near(X.energy.right, 0.18);
  assert.equal(right('energy'), 'right');
  assert.equal(label('energy', 'right'), j('0.18'));
  assert.equal(label('energy', 'noHalf'), j('0.36'));
  assert.equal(label('energy', 'cm'), j('18'));
});

test('the puzzle: twice the squash, 4 times the energy, 0.72 J', () => {
  near(DOUBLE / LAUNCHER.x, 2);
  near(X.stored.ratio, 4);
  assert.equal(right('stored'), 'right');
  assert.equal(label('stored', 'right'), j('0.72'));
  assert.equal(label('stored', 'doubled'), j('0.36'));
  assert.equal(label('stored', 'noHalf'), j('1.4'));
  assert.ok(label('stored', 'same').startsWith(j('0.18')));
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'four'));
});

test('the ball leaves at 8.49 m s⁻¹, twice the 4.24 from 3.0 cm', () => {
  near(X.speed.right / X.speed.first, 2);
  assert.equal(right('speed'), 'right');
  assert.equal(label('speed', 'right'), ms('8.49'));
  assert.equal(label('speed', 'noHalf'), ms('6.00'));
  assert.equal(label('speed', 'noRoot'), ms('72.0'));
  assert.equal(label('speed', 'grams'), ms('0.268'));
});

test('the same push: the softer spring stores twice as much', () => {
  near(X.softer.A / X.softer.B, 2);
  assert.equal(right('softer'), 'right');
  assert.equal(right('curve'), 'right');
  const s = L.story.find((x) => x.id === 'graph')!;
  assert.ok(s.kind === 'explore' && s.question.options.find((o) => o.correct)!.id === 'right');
});

test('Skill check: 0.090 J, 0.066 J, 0.92 m, 3 times', () => {
  assert.equal(right('stretch'), 'right');
  assert.equal(label('stretch', 'right'), j('0.090'));
  assert.equal(label('stretch', 'noSquare'), j('1.5'));
  assert.equal(label('stretch', 'noHalf'), j('0.18'));
  assert.equal(label('stretch', 'cm'), j('900'));
  assert.equal(right('wire'), 'right');
  assert.equal(label('wire', 'right'), j('0.066'));
  assert.equal(label('wire', 'noHalf'), j('0.13'));
  assert.equal(label('wire', 'mm'), j('66'));
  assert.equal(label('wire', 'mmNoHalf'), j('130'));
  assert.equal(right('height'), 'right');
  assert.equal(label('height', 'right'), `0.92${NB}m`);
  assert.equal(label('height', 'noG'), `9.0${NB}m`);
  assert.equal(label('height', 'half'), `0.46${NB}m`);
  assert.equal(label('height', 'grams'), `0.92${NB}mm`);
  near(X.band.ratio, 3);
  assert.equal(right('band'), 'right');
});

test('the recap: 0.18 J and 0.72 J', () => {
  assert.ok(L.recap.text.includes(j('0.18')) && L.recap.text.includes(j('0.72')));
});

test('the lesson is on the map and playable', () => {
  assert.equal(lessons[L.id]?.id, L.id);
  const ref = course.levels.flatMap((l) => l.lessons).find((r) => r.id === L.id);
  assert.ok(ref?.ready);
  assert.deepEqual(ref?.spec, L.spec);
});
