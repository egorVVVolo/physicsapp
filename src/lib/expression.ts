// Tiny arithmetic evaluator for the "build the calculation" answers.
// Tokens are numbers as strings and the symbols + - × ÷ ( ). No eval.

export type Token = string;

export function evaluate(tokens: Token[]): number | null {
  let i = 0;

  const expr = (): number | null => {
    let left = term();
    while (left !== null && (tokens[i] === '+' || tokens[i] === '-')) {
      const op = tokens[i++];
      const right = term();
      if (right === null) return null;
      left = op === '+' ? left + right : left - right;
    }
    return left;
  };

  const term = (): number | null => {
    let left = factor();
    while (left !== null && (tokens[i] === '×' || tokens[i] === '÷')) {
      const op = tokens[i++];
      const right = factor();
      if (right === null) return null;
      left = op === '×' ? left * right : left / right;
    }
    return left;
  };

  const factor = (): number | null => {
    const tok = tokens[i];
    if (tok === undefined) return null;
    if (tok === '(') {
      i++;
      const inner = expr();
      if (inner === null || tokens[i] !== ')') return null;
      i++;
      return inner;
    }
    const n = Number(tok);
    if (tok === '' || Number.isNaN(n)) return null;
    i++;
    return n;
  };

  const value = expr();
  if (value === null || i !== tokens.length || !Number.isFinite(value)) return null;
  return value;
}

export function hasOperator(tokens: Token[]): boolean {
  return tokens.some((t) => ['+', '-', '×', '÷'].includes(t));
}
