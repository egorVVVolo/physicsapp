/**
 * True when two pieces of loaded data say the same thing: plain objects (key order ignored), arrays, Sets and
 * simple values. Screens use it to skip a redraw when a reload brought nothing new.
 */
export function sameData(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (a instanceof Set || b instanceof Set) return a instanceof Set && b instanceof Set && a.size === b.size && [...a].every((x) => b.has(x));
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((k) => k in b && sameData((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}
