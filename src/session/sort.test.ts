import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { SortScreen } from '../content/types.ts';
import { solvedPlaced, wrongItems } from './sort.ts';

const screen: SortScreen = {
  id: 's',
  kind: 'sort',
  prompt: '?',
  bins: [
    { id: 'x', label: 'X' },
    { id: 'y', label: 'Y' },
  ],
  items: [
    { id: 'a', label: 'a', bin: 'x' },
    { id: 'b', label: 'b', bin: 'y' },
    { id: 'c', label: 'c', bin: 'x' },
  ],
  why: 'w',
};

test('items in the wrong bin, in screen order', () => {
  assert.deepEqual(wrongItems(screen, solvedPlaced(screen)), []);
  assert.deepEqual(wrongItems(screen, { a: 'y', b: 'y', c: 'y' }), ['a', 'c']);
  assert.deepEqual(wrongItems(screen, { a: 'x', b: null, c: 'x' }), ['b']);
});
