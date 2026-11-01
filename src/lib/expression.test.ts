import { describe, expect, it } from 'vitest';
import { evaluate, hasOperator } from './expression';

const e = (s: string) => evaluate(s.split(' '));

describe('expression evaluator', () => {
  it('respects precedence and brackets', () => {
    expect(e('2 + 3 × 4')).toBe(14);
    expect(e('( 2 + 3 ) × 4')).toBe(20);
    expect(e('40 × 40 ÷ ( 2 × 5 )')).toBe(160);
    expect(e('20 × 0.5 + 20 × 20 ÷ ( 2 × 5 )')).toBe(50);
  });

  it('rejects incomplete or malformed input', () => {
    expect(e('2 ×')).toBeNull();
    expect(e('( 2 + 3')).toBeNull();
    expect(e('2 3')).toBeNull();
    expect(e('÷ 4')).toBeNull();
    expect(evaluate([])).toBeNull();
    expect(e('4 ÷ 0')).toBeNull();
  });

  it('detects operators', () => {
    expect(hasOperator(['160'])).toBe(false);
    expect(hasOperator(['2', '×', '3'])).toBe(true);
  });
});
