import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { OrderScreen } from '../content/types.ts';
import { firstWrongRow } from './order.ts';

const screen: OrderScreen = { id: 'o', kind: 'order', prompt: '?', steps: ['a', 'b', 'c', 'd'].map((id) => ({ id, text: id })), hint: 'h', why: 'w' };

test('the first row out of place', () => {
  assert.equal(firstWrongRow(screen, ['a', 'b', 'c', 'd']), -1);
  assert.equal(firstWrongRow(screen, ['b', 'a', 'c', 'd']), 0);
  assert.equal(firstWrongRow(screen, ['a', 'b', 'd', 'c']), 2);
  assert.equal(firstWrongRow(screen, ['a', null, null, null]), 1);
});
