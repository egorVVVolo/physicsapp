import { describe, expect, it } from 'vitest';
import { brakingDemo } from '../content/brakingDemo';
import {
  positionDuringBraking,
  speedDuringBraking,
  stoppingDistance,
  stoppingTime,
} from './braking';

describe('braking physics', () => {
  it('20 m/s at 5 m/s^2 stops in 40 m after 4 s', () => {
    expect(stoppingDistance(20, 5)).toBeCloseTo(40);
    expect(stoppingTime(20, 5)).toBeCloseTo(4);
  });

  it('doubling the speed quadruples the distance', () => {
    expect(stoppingDistance(40, 5)).toBeCloseTo(4 * stoppingDistance(20, 5));
  });

  it('position and speed agree at the stop and stay put afterwards', () => {
    expect(positionDuringBraking(20, 5, 4)).toBeCloseTo(40);
    expect(positionDuringBraking(20, 5, 10)).toBeCloseTo(40);
    expect(speedDuringBraking(20, 5, 10)).toBe(0);
  });
});

describe('braking demo step', () => {
  it('marks exactly the physically correct option', () => {
    const correct = brakingDemo.options.filter((o) => o.isCorrect);
    expect(correct).toHaveLength(1);
    expect(correct[0].metres).toBeCloseTo(stoppingDistance(brakingDemo.u2, brakingDemo.a));
  });
});
