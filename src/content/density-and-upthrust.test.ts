// Every number in "Density and upthrust" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { densityAndUpthrust as L, ANSWERS as X, BALLOON, BLOCK, DENSITY, DEPTH, ICE, ROOM, STONE, TANK } from './density-and-upthrust.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { Question } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as Question;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = ' ';
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);
const g = 9.81;
const m3 = (s: string) => `${s}${NB}m³`;

test('the steel block: 1.00 × 10⁻⁴ m³, 100 cm³', () => {
  near(X.volume.right, BLOCK.m / BLOCK.rho);
  assert.equal(label('volume', 'right'), m3('1.00 × 10⁻⁴'));
  assert.equal(label('volume', 'times'), m3('6080'));
  assert.equal(label('volume', 'upside'), m3('1.00 × 10⁴'));
  assert.equal(label('volume', 'gcm3'), m3('0.100'));
  assert.ok(q('volume').why.includes(`100${NB}cm³`));
});

test('under water: upthrust 0.981 N, the reading 7.65 → 6.67 N', () => {
  near(X.weigh.right, 1000 * 1e-4 * g);
  near(X.weigh.reading, X.weigh.weight - X.weigh.right);
  assert.equal(label('weigh', 'right'), `0.981${NB}N`);
  assert.equal(label('weigh', 'weight'), `7.65${NB}N`);
  assert.equal(label('weigh', 'mass'), `0.100${NB}N`);
  assert.equal(label('weigh', 'reading'), `6.67${NB}N`);
});

test('explore: the slider reaches below the block, which is 4.0 cm tall', () => {
  const s = L.story.find((x) => x.id === 'deeper')!;
  assert.ok(s.kind === 'explore' && s.slider.min === DEPTH.min && s.slider.max === DEPTH.max && s.slider.start === DEPTH.start);
  assert.ok(DEPTH.max / 100 > BLOCK.h && DEPTH.start / 100 < BLOCK.h);
  assert.ok(s.question.right.includes(`0.981${NB}N`));
});

test('on board the block makes the boat displace its own weight of water: 780 cm³', () => {
  near(X.pushed.right, BLOCK.m / 1000);
  assert.equal(label('pushed', 'right'), m3('7.80 × 10⁻⁴'));
  assert.ok(label('pushed', 'ownVolume').startsWith(m3('1.00 × 10⁻⁴')));
  assert.equal(label('pushed', 'weight'), m3('7.65 × 10⁻³'));
  assert.equal(label('pushed', 'perKg'), m3('0.780'));
});

test('the puzzle: the level falls 1.36 cm', () => {
  near(X.puzzle.right, (BLOCK.m / 1000 - BLOCK.m / BLOCK.rho) / TANK.area);
  assert.equal(right('hook-again'), 'right');
  assert.equal(label('hook-again', 'right'), `It falls by 1.36${NB}cm`);
  assert.equal(label('hook-again', 'rise'), `It rises by 0.20${NB}cm`);
  assert.equal(label('hook-again', 'noVolume'), `It falls by 1.56${NB}cm`);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.id === 'fall'));
  // the water in the tank stands at 14.0 cm while the block is on board
  near((TANK.water + (TANK.boat + BLOCK.m) / 1000) / TANK.area, 0.14, 1e-12);
});

test('explore: a block as dense as water leaves the level; lead-like 11 000 kg m⁻³ drops it most', () => {
  near(X.denser.same, 0, 1e-15);
  assert.ok(X.denser.lead > X.puzzle.right);
  const s = L.story.find((x) => x.id === 'denser')!;
  assert.ok(s.kind === 'explore' && s.slider.min === DENSITY.min && s.slider.max === DENSITY.max && s.slider.start === BLOCK.rho);
  assert.equal((BLOCK.rho - DENSITY.min) % s.slider.step, 0);
});

test('Skill check: stone 2500 kg m⁻³, room 173 kg, balloon 0.141 N, ice 8.93 × 10⁻⁴ m³', () => {
  near(X.stone.right, (STONE.air / (STONE.air - STONE.water)) * 1000);
  assert.equal(label('stone', 'right'), `2500${NB}kg${NB}m⁻³`);
  assert.equal(label('stone', 'reading'), `1500${NB}kg${NB}m⁻³`);
  assert.equal(label('stone', 'ratio'), `1670${NB}kg${NB}m⁻³`);
  assert.equal(label('stone', 'upside'), `400${NB}kg${NB}m⁻³`);
  near(X.room.right, ROOM.rho * ROOM.l * ROOM.w * ROOM.h);
  assert.equal(label('room', 'right'), `173${NB}kg`);
  assert.equal(label('room', 'upside'), `120${NB}kg`);
  assert.equal(label('room', 'flipped'), `0.00833${NB}kg`);
  assert.equal(label('room', 'weight'), `1700${NB}kg`);
  near(X.balloon.right, BALLOON.air * BALLOON.V * g);
  assert.equal(label('balloon', 'right'), `0.141${NB}N`);
  assert.equal(label('balloon', 'mass'), `0.0144${NB}N`);
  assert.equal(label('balloon', 'helium'), `0.0212${NB}N`);
  assert.equal(label('balloon', 'water'), `118${NB}N`);
  near(X.ice.right, ICE.m / ICE.sea);
  assert.equal(label('ice', 'right'), m3('8.93 × 10⁻⁴'));
  assert.equal(label('ice', 'whole'), m3('1.00 × 10⁻³'));
  assert.equal(label('ice', 'fresh'), m3('9.20 × 10⁻⁴'));
  assert.equal(label('ice', 'weight'), m3('8.76 × 10⁻³'));
});

test('the lesson is on the map and playable', () => {
  assert.equal(lessons[L.id]?.id, L.id);
  const ref = course.levels.flatMap((l) => l.lessons).find((r) => r.id === L.id);
  assert.ok(ref?.ready);
  assert.deepEqual(ref?.spec, L.spec);
});
