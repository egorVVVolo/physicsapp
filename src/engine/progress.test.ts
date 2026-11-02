import { describe, expect, it } from 'vitest';
import { completeLesson, newProgress, recordStep } from './progress';

describe('lesson progress', () => {
  it('moves forward and remembers each step', () => {
    let p = newProgress('l2');
    p = recordStep(p, 'a', { outcome: 'independent', hintsUsed: 0, revealed: false }, 1);
    p = recordStep(p, 'b', { outcome: 'assisted', hintsUsed: 1, revealed: false }, 2);
    expect(p.stepIndex).toBe(2);
    expect(p.records.b.hintsUsed).toBe(1);
  });

  it('never moves the resume point backwards', () => {
    let p = newProgress('l2');
    p = recordStep(p, 'a', { outcome: 'independent', hintsUsed: 0, revealed: false }, 3);
    p = recordStep(p, 'b', { outcome: 'independent', hintsUsed: 0, revealed: false }, 1);
    expect(p.stepIndex).toBe(3);
  });

  it('is independent only when every scored step was', () => {
    let p = newProgress('l2');
    p = recordStep(p, 'a', { outcome: 'independent', hintsUsed: 0, revealed: false }, 1);
    p = recordStep(p, 'b', { outcome: 'revealed', hintsUsed: 2, revealed: true }, 2);
    expect(completeLesson(p, ['a']).outcome).toBe('independent');
    const done = completeLesson(p, ['a', 'b'], new Date('2026-11-02T10:00:00Z'));
    expect(done.outcome).toBe('assisted');
    expect(done.status).toBe('done');
    expect(done.completedAt).toBe('2026-11-02T10:00:00.000Z');
  });
});
