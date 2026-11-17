import { test } from 'node:test';
import assert from 'node:assert/strict';
import { angleFromFirst, chordAround, radiusOf, sizeAtRightAngles } from './vectors.ts';

const near = (actual: number, expected: number, tol = 0.01) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected}, got ${actual}`);

test('3.0 km north then 4.0 km east: 5.0 km, 53.1° east of north', () => {
  near(sizeAtRightAngles(3, 4), 5);
  near(angleFromFirst(3, 4), 53.13);
  near(angleFromFirst(4, 3), 36.87); // measured from the east line instead
});

test('the direction does not depend on the signs of the parts', () => {
  near(angleFromFirst(-3, 4), 53.13);
  near(sizeAtRightAngles(-1.2, 0.9), 1.5);
});

test('half a lap of a 400 m circle: displacement is the diameter, 127.3 m; a full lap: zero', () => {
  near(chordAround(400, 0.5), 127.32);
  near(chordAround(400, 1), 0);
  near(chordAround(400, 0.25), Math.SQRT2 * radiusOf(400));
  near(radiusOf(400), 63.66);
});
