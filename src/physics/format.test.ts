import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixed, sig, signed } from './format.ts';

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

test('three significant figures, never in e-notation', () => {
  assert.equal(sig(2354.4), '2350');
  assert.equal(sig(2.2e-16), '0'); // floating-point dust is zero
  assert.equal(sig(0), '0');
  assert.equal(sig(4414.5), '4410');
  assert.equal(sig(470.88), '471');
  assert.equal(sig(156.96), '157');
  assert.equal(sig(45.96), '46.0');
  assert.equal(sig(0.5), '0.500');
  assert.equal(sig(600), '600');
  assert.equal(sig(-964.2), '−964');
});

test('standard form: three significant figures, a proper superscript power', async () => {
  const { sci } = await import('./format.ts');
  assert.equal(sci(1.0e-4), '1.00 × 10⁻⁴');
  assert.equal(sci(7.8e-4), '7.80 × 10⁻⁴');
  assert.equal(sci(0.00765179), '7.65 × 10⁻³');
  assert.equal(sci(10000), '1.00 × 10⁴');
  assert.equal(sci(9.996e-4), '1.00 × 10⁻³');
});
