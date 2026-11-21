import { test } from 'node:test';
import assert from 'node:assert/strict';
import { circleArea, E_STEEL, stress, strain, wireExtension, wireStiffness, youngFromGradient, youngModulus } from './young.ts';

const near = (a: number, b: number, rel = 1e-9) => assert.ok(Math.abs(a - b) <= rel * Math.abs(b), `expected ${b}, got ${a}`);

test('a round wire: A = πd² ÷ 4, and a wire twice as wide has four times the area', () => {
  near(circleArea(0.5e-3), 1.9635e-7, 1e-4);
  near(circleArea(1.0e-3) / circleArea(0.5e-3), 4);
});

test('stress, strain and the modulus', () => {
  near(stress(60, circleArea(0.5e-3)), 3.0558e8, 1e-4);
  near(strain(2e-3, 1.5), 1.3333e-3, 1e-4);
  near(youngModulus(1.4e8, 2.0e-3), 7.0e10);
});

test('the wire stretches by FL ÷ (AE): the same as strain × L', () => {
  const A = circleArea(0.5e-3);
  const dx = wireExtension(60, 1.5, A, E_STEEL);
  near(dx, 2.1827e-3, 1e-4);
  near(strain(dx, 1.5), stress(60, A) / E_STEEL);
  near(youngModulus(stress(60, A), strain(dx, 1.5)), E_STEEL);
});

test('the puzzle: twice as long and twice as wide stretches half as far', () => {
  const a = wireExtension(60, 1.5, circleArea(0.5e-3), E_STEEL);
  const b = wireExtension(60, 3.0, circleArea(1.0e-3), E_STEEL);
  near(b / a, 0.5);
  // length alone doubles it, width alone quarters it
  near(wireExtension(60, 3.0, circleArea(0.5e-3), E_STEEL) / a, 2);
  near(wireExtension(60, 1.5, circleArea(1.0e-3), E_STEEL) / a, 0.25);
});

test('stiffness belongs to the object, the modulus to the material', () => {
  const kA = wireStiffness(E_STEEL, circleArea(0.5e-3), 1.5);
  const kB = wireStiffness(E_STEEL, circleArea(1.0e-3), 3.0);
  near(kB / kA, 2);
  near(60 / kA, wireExtension(60, 1.5, circleArea(0.5e-3), E_STEEL));
});

test('the lab: E = gradient × L ÷ A, and it undoes the stiffness', () => {
  const A = circleArea(0.4e-3);
  const E = youngFromGradient(1.6e4, 1.6, A);
  near(E, 2.0372e11, 1e-4);
  near(youngFromGradient(wireStiffness(E_STEEL, A, 1.6), 1.6, A), E_STEEL);
});

test('a diameter read 2 % too big makes E about 4 % too small', () => {
  const k = 1.6e4;
  const right = youngFromGradient(k, 1.6, circleArea(0.4e-3));
  const wrong = youngFromGradient(k, 1.6, circleArea(0.4e-3 * 1.02));
  near(wrong / right, 1 / 1.02 ** 2);
  assert.ok(wrong / right < 0.97 && wrong / right > 0.95);
});
