import { describe, expect, it } from 'vitest';
import {
  accelerationAt,
  averageVelocity,
  displacementAt,
  distanceAt,
  duration,
  evenGraph,
  pieceArea,
  piecesUpTo,
  positionRange,
  reachable,
  velocityAt,
} from './motion';

const turnBack = evenGraph([0, 10, 10, 0, -8]);
// 0 -> 8 m/s in 4 s, 8 m/s for 6 s, back to 0 in 2 s.
const trip = { t: [0, 4, 10, 12], v: [0, 8, 8, 0] };

describe('motion model', () => {
  it('reads velocity and acceleration from the straight pieces', () => {
    expect(velocityAt(turnBack, 1)).toBe(5);
    expect(accelerationAt(turnBack, 1)).toBe(5);
    expect(accelerationAt(turnBack, 3)).toBe(0);
    expect(accelerationAt(turnBack, 7)).toBe(-4);
    expect(velocityAt(turnBack, 7)).toBe(-4);
  });

  it('position is the area under the graph', () => {
    expect(displacementAt(turnBack, 2)).toBe(10);
    expect(displacementAt(turnBack, 4)).toBe(30);
    expect(displacementAt(turnBack, 6)).toBe(40);
    expect(displacementAt(turnBack, 8)).toBe(32);
    expect(displacementAt(turnBack, 1)).toBeCloseTo(2.5);
  });

  it('handles graphs whose points are not evenly spaced', () => {
    expect(duration(trip)).toBe(12);
    expect(accelerationAt(trip, 2)).toBe(2);
    expect(accelerationAt(trip, 5)).toBe(0);
    expect(accelerationAt(trip, 11)).toBe(-4);
    expect(displacementAt(trip, 4)).toBe(16);
    expect(displacementAt(trip, 10)).toBe(64);
    expect(displacementAt(trip, 12)).toBe(72);
    expect(averageVelocity(trip, 12)).toBe(6);
  });

  it('signed piece areas add up to the position at any time', () => {
    for (const t of [0.5, 2, 3.3, 6.5, 8]) {
      const sum = piecesUpTo(turnBack, t).reduce((s, p) => s + pieceArea(p), 0);
      expect(sum).toBeCloseTo(displacementAt(turnBack, t));
    }
  });

  it('splits pieces where the graph crosses zero', () => {
    const pieces = piecesUpTo(evenGraph([4, -4, -4, 0, 0]), 8);
    expect(pieces[0]).toMatchObject({ t0: 0, t1: 1, v1: 0 });
    expect(pieces[1]).toMatchObject({ t0: 1, v0: 0 });
  });

  it('distance counts backwards motion as positive', () => {
    expect(distanceAt(turnBack, 8)).toBeCloseTo(40 + 8);
  });

  it('finds the track extent', () => {
    expect(positionRange(turnBack)).toEqual({ min: 0, max: 40 });
    expect(positionRange(evenGraph([0, -5, -5, -5, -5])).min).toBeCloseTo(-35);
  });

  it('can tell whether a goal is reachable with whole-number speeds', () => {
    const g = evenGraph([0, 0, 0, 0, 0]);
    expect(reachable(g, [1, 2], 0, 10, (x) => displacementAt(x, 8) === 40)).toBe(true);
    expect(reachable(g, [1], 0, 2, (x) => displacementAt(x, 8) === 400)).toBe(false);
  });
});
