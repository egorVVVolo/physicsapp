// The order step: which row is the first one out of place. Pure, no React.
import type { OrderScreen } from '../content/types.ts';

/** The first row that does not hold the right statement, or -1 when all are right. */
export function firstWrongRow(screen: OrderScreen, rows: (string | null)[]): number {
  return screen.steps.findIndex((s, i) => rows[i] !== s.id);
}
