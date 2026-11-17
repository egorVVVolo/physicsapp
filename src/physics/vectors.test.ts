import { test } from 'node:test';
import assert from 'node:assert/strict';
import { angleFromFirst, angleForComponent, chordAround, components, onSlope, radiusOf, sizeAtRightAngles } from './vectors.ts';

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

test('a 100 N rope at 60° above the snow: forward 50.0 N, up 86.6 N; the parts add back to 100 N tip to tail', () => {
  const c = components(100, 60);
  near(c.along, 50);
  near(c.across, 86.6, 0.05);
  near(sizeAtRightAngles(c.along, c.across), 100, 1e-9);
  near(c.along + c.across, 136.6, 0.05); // added as plain numbers: more than the pull
  near(components(100, 45).along, 70.71);
  near(components(100, 0).across, 0);
  near(angleForComponent(100, 60), 53.13); // forward 60 N, like Ben's push
  near(components(100, angleForComponent(100, 60)).across, 80);
});

test('a 250 N weight on a 20° slope: 85.5 N along the slope, 234.9 N into it', () => {
  const s = onSlope(250, 20);
  near(s.along, 85.5, 0.05);
  near(s.into, 234.9, 0.05);
  near(sizeAtRightAngles(s.along, s.into), 250, 1e-9);
  near(onSlope(250, 0).along, 0);
});
