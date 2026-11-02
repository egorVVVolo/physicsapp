import { describe, expect, it } from 'vitest';
import { accelerationAt, displacementAt, distanceAt, DURATION, piecesUpTo, pieceArea, positionRange, velocityAt } from './motion';

const turnBack = [0, 10, 10, 0, -8];

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

  it('signed piece areas add up to the position at any time', () => {
    for (const t of [0.5, 2, 3.3, 6.5, 8]) {
      const sum = piecesUpTo(turnBack, t).reduce((s, p) => s + pieceArea(p), 0);
      expect(sum).toBeCloseTo(displacementAt(turnBack, t));
    }
  });

  it('splits pieces where the graph crosses zero', () => {
    const pieces = piecesUpTo([4, -4, -4, 0, 0], DURATION);
    expect(pieces[0]).toMatchObject({ t0: 0, t1: 1, v1: 0 });
    expect(pieces[1]).toMatchObject({ t0: 1, v0: 0 });
  });

  it('distance counts backwards motion as positive', () => {
    expect(distanceAt(turnBack, 8)).toBeCloseTo(40 + 8);
  });

  it('finds the track extent', () => {
    expect(positionRange(turnBack)).toEqual({ min: 0, max: 40 });
    expect(positionRange([0, -5, -5, -5, -5]).min).toBeCloseTo(-35);
  });
});
