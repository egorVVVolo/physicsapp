// The sort step: which items sit in the wrong bin. Pure, no React.
import type { SortScreen } from '../content/types.ts';

/** Item id → the bin it was put in (null: still in the pool). */
export type Placed = Record<string, string | null>;

/** The ids of items in the wrong bin (or not placed), in the screen's order. */
export function wrongItems(screen: SortScreen, placed: Placed): string[] {
  return screen.items.filter((it) => placed[it.id] !== it.bin).map((it) => it.id);
}

/** Every item in its right bin. */
export function solvedPlaced(screen: SortScreen): Placed {
  return Object.fromEntries(screen.items.map((it) => [it.id, it.bin]));
}
