import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distanceForMoment, footOfPerpendicular, loadMoment, moment, momentAtAngle, perpendicularDistance, resultantMoment, turningComponent } from './moments.ts';

const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('moment = F × x', () => {
  near(moment(40, 0.2), 8);
  near(moment(250, 0), 0);
});

test('a force at an angle: perpendicular distance r sin θ, the same as the turning component times r', () => {
  near(perpendicularDistance(0.3, 30), 0.15);
  near(perpendicularDistance(0.3, 90), 0.3);
  near(perpendicularDistance(0.3, 0), 0);
  near(momentAtAngle(40, 0.3, 30), 6);
  for (const angle of [10, 30, 45, 60, 90, 120]) near(momentAtAngle(40, 0.3, angle), turningComponent(40, angle) * 0.3, 1e-12);
});

test('moments with senses: anticlockwise +, clockwise −', () => {
  near(loadMoment(30, -0.5), 15);
  near(loadMoment(50, 0.2), -10);
  near(resultantMoment([loadMoment(30, -0.5), loadMoment(50, 0.2)]), 5);
});

test('distance for a moment: x = M ÷ (F sin θ)', () => {
  near(distanceForMoment(90, 250), 0.36);
  near(distanceForMoment(90, 250, 30), 0.72);
  near(momentAtAngle(250, distanceForMoment(90, 250, 60), 60), 90);
});

test('foot of the perpendicular: matches r sin θ for a pull at 30° to a 0.30 m handle', () => {
  const end: [number, number] = [0.3, 0];
  const dir: [number, number] = [-Math.cos(Math.PI / 6), Math.sin(Math.PI / 6)];
  const { foot, distance } = footOfPerpendicular([0, 0], end, dir);
  near(distance, perpendicularDistance(0.3, 30), 1e-12);
  near(foot[0], 0.075, 1e-12);
  near(foot[1], 0.3 * Math.cos(Math.PI / 6) * Math.sin(Math.PI / 6), 1e-12);
});
