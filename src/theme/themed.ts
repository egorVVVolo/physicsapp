// Level colours on the dark page: a level's dark text colour is too dim there and its pale tint too bright,
// so `themed` swaps in the light inner shade for text and a dark tint for washes and the back of a card.
import { darkPalette, type LevelColor } from './tokens.ts';

/** Mix two #RRGGBB colours (t = 0 gives a, 1 gives b). */
export function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}

/** A level colour for the current theme: unchanged in light, with light text and a dark tint in dark. */
export function themed(c: LevelColor, dark: boolean): LevelColor {
  return dark ? { ...c, text: c.inner, soft: mix(c.main, darkPalette.page, 0.78) } : c;
}
