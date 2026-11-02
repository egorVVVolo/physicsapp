// Ease-out between two number lists of the same length (x runs 0..1).
export function easeArray(from: number[], to: number[], x: number): number[] {
  const e = 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);
  return to.map((t, i) => from[i] + (t - from[i]) * e);
}
