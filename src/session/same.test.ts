import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sameData } from './same.ts';

test('the same saved data read twice counts as unchanged, whatever the order it arrived in', () => {
  const a = { finished: new Set(['x', 'y']), saved: { x: { index: 1, finished: true }, y: { index: 0, finished: false } }, days: ['2026-11-26'], exam: null };
  const b = { saved: { y: { finished: false, index: 0 }, x: { index: 1, finished: true } }, finished: new Set(['y', 'x']), exam: null, days: ['2026-11-26'] };
  assert.equal(sameData(a, b), true);
});

test('any real change is seen', () => {
  assert.equal(sameData({ a: 1 }, { a: 2 }), false);
  assert.equal(sameData({ a: 1 }, { a: 1, b: 1 }), false);
  assert.equal(sameData({ a: undefined }, { b: undefined }), false);
  assert.equal(sameData(new Set(['x']), new Set(['y'])), false);
  assert.equal(sameData(new Set(['x']), ['x']), false);
  assert.equal(sameData([1, 2], [2, 1]), false);
  assert.equal(sameData([], {}), false);
  assert.equal(sameData(null, {}), false);
});
