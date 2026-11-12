// The app's mark, its icon, and the stamps a lesson ends with.
// The mark is a lesson puck whose centre is the centre-of-gravity symbol of an engineering drawing
// (a circle cut in four, two quarters filled). No letters: the app has no final name yet.
import { WHITE, svg, type Gold, type Tone } from './svg.ts';

const INK = '#1A1E25';

type MarkColors = { face: string; side: string; ring: string; disc: string; quarter: string };

/** The mark's markup (100 × 76, the puck's box). */
export function markBody(m: MarkColors): string {
  return (
    `<g fill="${m.side}"><ellipse cx="50" cy="38" rx="40" ry="22"/><rect x="10" y="38" width="80" height="6"/><ellipse cx="50" cy="44" rx="40" ry="22"/></g>` +
    `<ellipse cx="50" cy="32" rx="40" ry="22" fill="${m.face}"/>` +
    `<ellipse cx="50" cy="32" rx="24" ry="13" fill="${m.disc}"/>` +
    `<path d="M50,32 L74,32 A24,13 0 0 0 50,19 Z M50,32 L26,32 A24,13 0 0 0 50,45 Z" fill="${m.quarter}"/>` +
    `<ellipse cx="50" cy="32" rx="24" ry="13" stroke="${m.ring}" stroke-width="5"/>`
  );
}

/** The three icon directions shown to the owner on 12 Nov: on ink, on blue, on white. */
export type IconVariant = 'ink' | 'blue' | 'white';

export function markColors(variant: IconVariant, c: Tone): MarkColors & { bg: string } {
  if (variant === 'blue') return { bg: c.main, face: WHITE, side: c.lip, ring: WHITE, disc: WHITE, quarter: INK };
  // on white and on ink the puck is the course blue; the centre is always the black-and-white symbol
  return { bg: variant === 'white' ? WHITE : INK, face: c.face, side: c.side, ring: WHITE, disc: WHITE, quarter: INK };
}

/** The mark alone on a transparent ground (splash screen, headers). */
export const mark = (c: Tone, variant: IconVariant = 'white') => svg(100, 76, markBody(markColors(variant, c)));

/** The full square icon, 1024 × 1024, no transparency (iOS and the web). `scale` shrinks the mark for Android's safe zone. */
export function appIcon(c: Tone, variant: IconVariant, opts: { background?: boolean; scale?: number } = {}): string {
  const m = markColors(variant, c);
  const k = opts.scale ?? 6.6;
  const x = (1024 - 100 * k) / 2;
  const y = (1024 - 76 * k) / 2;
  return svg(1024, 1024, (opts.background === false ? '' : `<rect width="1024" height="1024" fill="${m.bg}"/>`) + `<g transform="translate(${x} ${y}) scale(${k})">${markBody(m)}</g>`);
}

/** Android's one-colour icon: the mark as a white silhouette with the two quarters cut out. */
export function appIconMono(): string {
  const k = 5;
  const x = (1024 - 100 * k) / 2;
  const y = (1024 - 76 * k) / 2;
  return svg(
    1024,
    1024,
    `<g transform="translate(${x} ${y}) scale(${k})" fill="${WHITE}">` +
      `<path fill-rule="evenodd" d="M10,32 A40,22 0 0 1 90,32 V44 A40,22 0 0 1 10,44 Z M50,32 L74,32 A24,13 0 0 0 50,19 Z M50,32 L26,32 A24,13 0 0 0 50,45 Z"/></g>`,
  );
}

// ── Stamps: how a lesson was finished. A symbol only; the words sit under it as real text. ──

/** A round stamp, 96 × 96: a thick disc with a dial of ticks and a mark in the centre. */
function disc(face: string, side: string, ring: string, ticks: string, centre: string): string {
  let dial = '';
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI) / 12;
    const r1 = i % 2 ? 37 : 35.5;
    const p = (rr: number) => `${(48 + rr * Math.cos(a)).toFixed(2)},${(45 + rr * Math.sin(a)).toFixed(2)}`;
    dial += `M${p(r1)} L${p(40)} `;
  }
  return (
    `<circle cx="48" cy="51" r="44" fill="${side}"/><circle cx="48" cy="45" r="44" fill="${face}"/>` +
    `<path d="${dial}" stroke="${ticks}" stroke-width="2" stroke-linecap="round"/>` +
    `<circle cx="48" cy="45" r="29" stroke="${ring}" stroke-width="3.4"/>` +
    centre
  );
}

const CHECK = (color: string) => `<path d="M34,46 L44,56 L63,35" stroke="${color}" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"/>`;

export type StampName = 'independent' | 'assisted' | 'revealed' | 'level';

/**
 * independent: the gold stamp (every Skill check answer right on the first try) ·
 * assisted: the level's colour · revealed: grey, an eye (the answer was shown) ·
 * level: a hexagon with the spark (the whole level is done).
 */
export function stamp(name: StampName, c: Tone, g: Gold, grey: Tone): string {
  if (name === 'independent') return svg(96, 96, disc(g.face, g.side, INK, g.lip, CHECK(INK)));
  if (name === 'assisted') return svg(96, 96, disc(c.face, c.side, WHITE, c.inner, CHECK(WHITE)));
  if (name === 'revealed') {
    const eye = `<path d="M30,45 Q48,29 66,45 Q48,61 30,45 Z" stroke="${WHITE}" stroke-width="4.5" stroke-linejoin="round"/><circle cx="48" cy="45" r="5.5" fill="${WHITE}"/>`;
    return svg(96, 96, disc(grey.face, grey.side, WHITE, grey.inner, eye));
  }
  const hex = (cy: number) => {
    let d = '';
    for (let i = 0; i < 6; i++) d += `${i ? 'L' : 'M'}${(48 + 40 * Math.cos((i * Math.PI) / 3 + Math.PI / 6)).toFixed(2)},${(cy + 40 * Math.sin((i * Math.PI) / 3 + Math.PI / 6)).toFixed(2)} `;
    return d + 'Z';
  };
  const star = 'M48,23 Q51,42 70,45 Q51,48 48,67 Q45,48 26,45 Q45,42 48,23 Z';
  return svg(
    96,
    96,
    `<path d="${hex(51)}" fill="${c.side}" stroke="${c.side}" stroke-width="6" stroke-linejoin="round"/><path d="${hex(45)}" fill="${c.face}" stroke="${c.face}" stroke-width="6" stroke-linejoin="round"/>` +
      `<circle cx="48" cy="45" r="30" stroke="${WHITE}" stroke-width="3.4"/><path d="${star}" fill="${g.face}"/>`,
  );
}
