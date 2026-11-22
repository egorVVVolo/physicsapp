import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { BuildScreen } from '../content/types.ts';
import { allFilled, boxesOf, checkBuild, emptyBox, emptyFilled, fillBox, firstHint, parseEquation, solvedFilled } from './build.ts';

const screen: BuildScreen = {
  id: 'omar',
  kind: 'build',
  prompt: 'How much work does Omar do?',
  equation: 'W = {F} × {s} × cos {θ}',
  boxes: { F: 'f40', s: 's30', θ: 'a60' },
  chips: [
    { id: 'f40', label: '40 N' },
    { id: 's30', label: '30 m' },
    { id: 'a60', label: '60°' },
    { id: 'w147', label: '147 N', hint: 'weight hint' },
    { id: 'a30', label: '30°', hint: 'angle hint' },
  ],
  result: { symbol: 'W', value: 600, unit: 'J' },
  why: 'why',
};

test('the equation splits into text and boxes', () => {
  assert.deepEqual(parseEquation('W = {F} × {s} × cos {θ}'), [{ text: 'W = ' }, { box: 'F' }, { text: ' × ' }, { box: 's' }, { text: ' × cos ' }, { box: 'θ' }]);
  assert.deepEqual(parseEquation('{a}{b}'), [{ box: 'a' }, { box: 'b' }]);
  assert.deepEqual(parseEquation('no boxes'), [{ text: 'no boxes' }]);
  assert.deepEqual(boxesOf(screen.equation), ['F', 's', 'θ']);
});

test('a chip goes into the first empty box, or the chosen one; placed again it moves', () => {
  let f = emptyFilled(screen);
  assert.deepEqual(f, { F: null, s: null, θ: null });
  f = fillBox(f, 'w147');
  assert.deepEqual(f, { F: 'w147', s: null, θ: null });
  f = fillBox(f, 'a30', 'θ');
  assert.deepEqual(f, { F: 'w147', s: null, θ: 'a30' });
  f = fillBox(f, 'a30'); // moves from θ to the first empty box
  assert.deepEqual(f, { F: 'w147', s: 'a30', θ: null });
  f = fillBox(f, 'f40', 'F'); // replaces what was there
  assert.deepEqual(f, { F: 'f40', s: 'a30', θ: null });
  assert.equal(allFilled(f), false);
  f = emptyBox(f, 's');
  assert.deepEqual(f, { F: 'f40', s: null, θ: null });
  const full = solvedFilled(screen);
  assert.equal(fillBox(full, 'w147'), full); // nowhere to go
  assert.equal(allFilled(full), true);
});

test('Check finds the wrong boxes; the hint is the first wrong chip’s', () => {
  assert.deepEqual(checkBuild(screen, solvedFilled(screen)), { ok: true, wrongBoxes: [] });
  const f = { F: 'w147', s: 's30', θ: 'a30' };
  assert.deepEqual(checkBuild(screen, f), { ok: false, wrongBoxes: ['F', 'θ'] });
  assert.equal(firstHint(screen, f), 'weight hint');
  assert.equal(firstHint(screen, { F: 'f40', s: 's30', θ: 'a30' }), 'angle hint');
  assert.equal(firstHint(screen, solvedFilled(screen)), null);
});
