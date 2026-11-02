import { describe, expect, it } from 'vitest';
import { evenGraph } from '../physics/motion';
import { goalMet, gradeAnswer, lessonOutcome, stepOutcome } from './grade';
import type { GoalStep, NumericStep } from './types';

const base = { id: 'x', level: 'intermediate' as const, tag: 't', title: 't', hints: ['a', 'b'] as [string, string], explanation: 'Well done.' };

describe('goals', () => {
  it('checks acceleration on one piece', () => {
    const g = evenGraph([0, 8, 8, 8, 0]);
    expect(goalMet({ kind: 'acceleration', segment: 0, target: 4 }, g)).toBe(true);
    expect(goalMet({ kind: 'acceleration', segment: 1, target: 4 }, g)).toBe(false);
  });
  it('checks displacement within tolerance', () => {
    const g = evenGraph([0, 5, 5, 5, 5]); // 5 + 10 + 10 + 10 = 35
    expect(goalMet({ kind: 'displacement', at: 8, target: 35, tolerance: 0 }, g)).toBe(true);
    expect(goalMet({ kind: 'displacement', at: 8, target: 40, tolerance: 2 }, g)).toBe(false);
  });
});

describe('grading', () => {
  const goal: GoalStep = { ...base, kind: 'goal', lab: { graph: evenGraph([0, 0, 0, 0, 0]) }, goal: { kind: 'acceleration', segment: 0, target: 4 }, goalText: '', solution: [0, 8, 8, 8, 0] };
  it('grades a goal answer', () => {
    expect(gradeAnswer(goal, { kind: 'goal', speeds: [0, 8, 0, 0, 0] }).ok).toBe(true);
    expect(gradeAnswer(goal, { kind: 'goal', speeds: [0, 6, 0, 0, 0] }).ok).toBe(false);
  });

  const numeric: NumericStep = {
    ...base,
    kind: 'numeric',
    lab: { graph: evenGraph([0, 10, 10, 0, -8]) },
    question: '',
    options: [{ value: 32 }, { value: 48, why: 'That is the distance, not the displacement.' }],
    answer: 32,
    unit: 'm',
    units: ['m', 'm/s'],
  };
  it('needs the right value and the right unit', () => {
    expect(gradeAnswer(numeric, { kind: 'numeric', value: 32, unit: 'm' }).ok).toBe(true);
    const wrongUnit = gradeAnswer(numeric, { kind: 'numeric', value: 32, unit: 'm/s' });
    expect(wrongUnit.ok).toBe(false);
    expect(wrongUnit.message).toMatch(/unit/);
    expect(gradeAnswer(numeric, { kind: 'numeric', value: 48, unit: 'm' }).message).toMatch(/distance/);
  });
});

describe('outcomes', () => {
  it('hints make a step assisted, show me makes it revealed', () => {
    expect(stepOutcome(0, false)).toBe('independent');
    expect(stepOutcome(1, false)).toBe('assisted');
    expect(stepOutcome(2, true)).toBe('revealed');
    expect(stepOutcome(0, true)).toBe('revealed');
  });
  it('a lesson is independent only if every step was', () => {
    expect(lessonOutcome(['independent', 'independent'])).toBe('independent');
    expect(lessonOutcome(['independent', 'assisted'])).toBe('assisted');
    expect(lessonOutcome(['revealed'])).toBe('assisted');
  });
});
