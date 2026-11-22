// Deterministic order of answer options: the same every time a screen is shown, different between screens.

/** Course-wide salt. Changing it reorders every screen's options. */
export const SALT = 'v1';

/** FNV-1a, 32-bit. */
export function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: a small seeded generator of numbers in [0, 1). */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Options in display order. `salt` changes the order (review uses the date). 'unsure' always stays last. */
export function shuffled<T extends { id: string }>(items: readonly T[], key: string, salt = SALT): T[] {
  const unsure = items.filter((o) => o.id === 'unsure');
  const rest = items.filter((o) => o.id !== 'unsure');
  const next = rng(hash(key + '|' + salt));
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [...rest, ...unsure];
}
