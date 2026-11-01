import { describe, expect, it } from 'vitest';
import { A, questions } from '../content/brakingDemo';
import {
  positionDuringBraking,
  speedDuringBraking,
  stoppingDistance,
  stoppingSpeed,
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

  it('stopping speed inverts stopping distance', () => {
    expect(stoppingSpeed(90, 5)).toBeCloseTo(30);
    expect(stoppingDistance(stoppingSpeed(90, 5), 5)).toBeCloseTo(90);
  });

  it('position and speed agree at the stop and stay put afterwards', () => {
    expect(positionDuringBraking(20, 5, 4)).toBeCloseTo(40);
    expect(positionDuringBraking(20, 5, 10)).toBeCloseTo(40);
    expect(speedDuringBraking(20, 5, 10)).toBe(0);
  });
});

describe('braking demo questions', () => {
  const expected: Record<string, number> = {
    time: stoppingTime(25, A),
    double: stoppingDistance(40, A),
    backwards: stoppingSpeed(90, A),
  };

  it.each(questions.map((q) => [q.id, q] as const))('%s marks exactly the physically correct option', (id, q) => {
    const correct = q.options.filter((o) => o.isCorrect);
    expect(correct).toHaveLength(1);
    expect(correct[0].value).toBeCloseTo(expected[id]);
    expect(new Set(q.options.map((o) => o.value)).size).toBe(q.options.length);
  });

  it('expected answers are 5 s, 160 m, 30 m/s', () => {
    expect(expected.time).toBeCloseTo(5);
    expect(expected.double).toBeCloseTo(160);
    expect(expected.backwards).toBeCloseTo(30);
  });
});
