import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixed, signed } from './format.ts';

test('a rounded zero has no sign', () => {
  assert.equal(signed(-0.02, 1), '0.0');
  assert.equal(signed(0.04, 1), '0.0');
  assert.equal(fixed(-0.004, 2), '0.00');
});

test('signs use the proper minus and an explicit plus', () => {
  assert.equal(signed(8, 1), '+8.0');
  assert.equal(signed(-21.36, 1), '−21.4');
  assert.equal(fixed(-2.5, 1), '−2.5');
  assert.equal(fixed(9.81, 2), '9.81');
});
