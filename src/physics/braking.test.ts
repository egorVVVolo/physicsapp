import { describe, expect, it } from 'vitest';
import { A, buildQuestions, tapWarmup } from '../content/brakingDemo';
import { evaluate } from '../lib/expression';
import {
  positionWithReaction,
  speedWithReaction,
  totalStoppingDistance,
  boundingSquares,
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

describe('squares picture', () => {
  it('doubling u doubles both sides: 2x2 squares become 4x4, triangle = half the rectangle', () => {
    const cell = 2 * 10; // 2 s x 10 m/s = 20 m per square
    const small = boundingSquares(20, 5, 2, 10);
    const big = boundingSquares(40, 5, 2, 10);
    expect(small.w * small.h).toBe(4);
    expect(big.w * big.h).toBe(16);
    expect(0.5 * small.w * small.h * cell).toBeCloseTo(stoppingDistance(20, 5));
    expect(0.5 * big.w * big.h * cell).toBeCloseTo(stoppingDistance(40, 5));
  });

  it('s = 1/2 u t with t = u / a gives u^2 / 2a', () => {
    expect(0.5 * 20 * stoppingTime(20, 5)).toBeCloseTo(stoppingDistance(20, 5));
  });
});

describe('reaction time', () => {
  it('adds u x tr to the braking distance', () => {
    expect(totalStoppingDistance(20, 5, 0.5)).toBeCloseTo(50);
    expect(positionWithReaction(20, 5, 0.5, 0.25)).toBeCloseTo(5);
    expect(positionWithReaction(20, 5, 0.5, 10)).toBeCloseTo(50);
    expect(speedWithReaction(20, 5, 0.5, 0.4)).toBe(20);
    expect(speedWithReaction(20, 5, 0.5, 1.5)).toBeCloseTo(15);
  });
});

describe('demo content', () => {
  it('tap warm-up answer is the stopping distance from 20 m/s', () => {
    expect(tapWarmup.answer).toBeCloseTo(40);
  });

  it('build questions have the expected answers', () => {
    expect(buildQuestions[0].answer).toBeCloseTo(160);
    expect(buildQuestions[1].answer).toBeCloseTo(50);
  });

  it('the intended expressions evaluate to the answers', () => {
    expect(evaluate('40 × 40 ÷ ( 2 × 5 )'.split(' '))).toBeCloseTo(buildQuestions[0].answer);
    expect(evaluate('20 × 0.5 + 20 × 20 ÷ ( 2 × 5 )'.split(' '))).toBeCloseTo(buildQuestions[1].answer);
  });

  it('every number in the intended expressions is offered as a tile', () => {
    expect(buildQuestions[0].tiles).toEqual(expect.arrayContaining([40, 5, 2]));
    expect(buildQuestions[1].tiles).toEqual(expect.arrayContaining([20, 0.5, 2, 5]));
  });
});
