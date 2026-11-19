import { test } from 'node:test';
import assert from 'node:assert/strict';
import { balancingLoad, balancingPosition, centreOfGravity, distanceForMoment, footOfPerpendicular, loadMoment, moment, momentAtAngle, momentsAbout, perpendicularDistance, piecesAtBalance, resultantMoment, senseTotals, supportPushes, turningComponent } from './moments.ts';

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

test('principle of moments: Ana 300 N at 1.6 m left balances Ben 400 N at 1.2 m right', () => {
  const ana = { W: 300, at: 2.2 - 1.6 };
  near(balancingPosition([ana], 400, 2.2), 2.2 + 1.2, 1e-12);
  near(momentsAbout([ana, { W: 400, at: 3.4 }], 2.2), 0, 1e-12);
  const t = senseTotals([ana, { W: 400, at: 3.4 }], 2.2);
  near(t.anticlockwise, 480, 1e-9);
  near(t.clockwise, 480, 1e-9);
});

test('balancing load: a uniform 3.0 m, 120 N plank on a support 1.0 m from its end needs 60 N at that end', () => {
  near(balancingLoad([{ W: 120, at: 1.5 }], 0, 1.0), 60, 1e-12);
});

test('support pushes: 4.0 m, 200 N plank, 600 N painter 1.0 m from the left: 550 N and 250 N', () => {
  const [left, right] = supportPushes([{ W: 600, at: 1 }, { W: 200, at: 2 }], 0, 4);
  near(left, 550, 1e-9);
  near(right, 250, 1e-9);
  // the moments balance about any point, not only a support
  for (const p of [0, 1.3, 2, 4, 7]) near(momentsAbout([{ W: 600, at: 1 }, { W: 200, at: 2 }, { W: -left, at: 0 }, { W: -right, at: 4 }], p), 0, 1e-9);
});

test('a body balanced and cut at its centre of gravity: the near piece is the heavy one', () => {
  const [brush, handle] = piecesAtBalance(8, 0.15, 0.45);
  near(brush, 6, 1e-12);
  near(handle, 2, 1e-12);
  near(centreOfGravity([{ W: brush, at: 0.15 }, { W: handle, at: -0.45 }]), 0, 1e-12);
});
