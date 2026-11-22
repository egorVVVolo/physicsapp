// A definition that opens with its formula ("ΔW = FΔs: force × distance…") shows the formula on a line of its own.
// No React, so it can be tested on its own.

/** Longest formula pulled out of a definition's text; anything longer stays in the sentence. */
export const FORMULA_MAX = 24;

/**
 * Splits off a formula at the start of the text: everything before the first ":", "," or full stop, when it has
 * an "=" and is at most FORMULA_MAX characters. The rest starts with a capital. No formula: `formula` is null.
 */
export function splitFormula(text: string): { formula: string | null; rest: string } {
  const m = /^(.*?)(?::|,|\.(?=\s|$))\s*/.exec(text);
  const head = m ? m[1].trim() : text.trim();
  if (!head.includes('=') || head.length > FORMULA_MAX) return { formula: null, rest: text };
  const rest = m ? text.slice(m[0].length) : '';
  return { formula: head, rest: rest.charAt(0).toUpperCase() + rest.slice(1) };
}
