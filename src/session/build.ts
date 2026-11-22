// "Build the solution": the equation is split into text and boxes, the learner fills the boxes with chips,
// Check compares each box with its right chip. The app does the arithmetic (the result comes from src/physics).
// Pure functions, no React.
import type { BuildScreen } from '../content/types.ts';

export type Piece = { text: string } | { box: string };

/** "W = {F} × {s}" → [{ text: 'W = ' }, { box: 'F' }, { text: ' × ' }, { box: 's' }]. */
export function parseEquation(eq: string): Piece[] {
  const pieces: Piece[] = [];
  const re = /\{([^{}]+)\}/g;
  let at = 0;
  for (let m = re.exec(eq); m; m = re.exec(eq)) {
    if (m.index > at) pieces.push({ text: eq.slice(at, m.index) });
    pieces.push({ box: m[1] });
    at = m.index + m[0].length;
  }
  if (at < eq.length) pieces.push({ text: eq.slice(at) });
  return pieces;
}

/** The box names of an equation, in order. */
export function boxesOf(eq: string): string[] {
  return parseEquation(eq).flatMap((p) => ('box' in p ? [p.box] : []));
}

/** Box name → the chip placed in it (null: empty). */
export type Filled = Record<string, string | null>;

export function emptyFilled(screen: BuildScreen): Filled {
  return Object.fromEntries(boxesOf(screen.equation).map((b) => [b, null]));
}

/**
 * Places a chip. Into `box` if given, otherwise into the first empty box. A chip already placed elsewhere moves.
 * Returns the same object when there is nowhere to put it.
 */
export function fillBox(filled: Filled, chipId: string, box?: string | null): Filled {
  const target = box ?? Object.keys(filled).find((b) => filled[b] === null);
  if (target === undefined || !(target in filled)) return filled;
  const next: Filled = {};
  for (const [b, c] of Object.entries(filled)) next[b] = c === chipId ? null : c;
  next[target] = chipId;
  return next;
}

/** Takes the chip out of a box. */
export function emptyBox(filled: Filled, box: string): Filled {
  return { ...filled, [box]: null };
}

export const allFilled = (filled: Filled): boolean => Object.values(filled).every((c) => c !== null);

/** Every box holds its right chip? `wrongBoxes`: the boxes that do not, in equation order. */
export function checkBuild(screen: BuildScreen, filled: Filled): { ok: boolean; wrongBoxes: string[] } {
  const wrongBoxes = boxesOf(screen.equation).filter((b) => filled[b] !== screen.boxes[b]);
  return { ok: wrongBoxes.length === 0, wrongBoxes };
}

/** The hint of the first wrong chip in the equation (or null when there is none). */
export function firstHint(screen: BuildScreen, filled: Filled): string | null {
  for (const b of checkBuild(screen, filled).wrongBoxes) {
    const chip = screen.chips.find((c) => c.id === filled[b]);
    if (chip?.hint) return chip.hint;
  }
  return null;
}

/** Every box with its right chip: the solution shown after the last allowed miss. */
export function solvedFilled(screen: BuildScreen): Filled {
  return Object.fromEntries(boxesOf(screen.equation).map((b) => [b, screen.boxes[b]]));
}
