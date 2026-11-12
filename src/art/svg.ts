// Helpers for the art library. Everything in src/art/ is plain data: functions that return SVG markup
// as strings, with no React imports. The app draws them with <Art> (src/art/Art.tsx, react-native-svg's SvgXml);
// scripts/build-assets.ts turns the same strings into PNG files and into the demo page.
// Rules of the style ("flat vector 3D"): every surface is one solid colour, depth comes from facets,
// no gradients, no blur, no outlines. Line icons are the opposite: strokes only, round caps.

/** Colours of one level (the same shape as LevelColor in src/theme/tokens.ts). */
export type Tone = { main: string; lip: string; soft: string; face: string; side: string; inner: string; text: string };
/** The reward yellow (src/theme/tokens.ts). */
export type Gold = { face: string; side: string; lip: string; pale: string; soft: string };

export const WHITE = '#FFFFFF';

const r = (n: number) => Math.round(n * 100) / 100;

/** A whole SVG document. */
export const svg = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="none">${body}</svg>`;

/** Path of a line with an open arrowhead at (x2, y2), for stroke icons. */
export function arrow(x1: number, y1: number, x2: number, y2: number, head = 4.6): string {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p = (d: number) => `${r(x2 - head * Math.cos(a + d))},${r(y2 - head * Math.sin(a + d))}`;
  return `M${x1},${y1} L${x2},${y2} M${p(-0.76)} L${x2},${y2} L${p(0.76)}`;
}

/** An upright cylinder seen from above: (cx, cy) is the centre of the top face. */
export function cyl(cx: number, cy: number, rx: number, ry: number, h: number, top: string, side: string): string {
  return (
    `<path d="M${cx - rx},${cy} v${h} a${rx},${ry} 0 0 0 ${2 * rx},0 v${-h} z" fill="${side}"/>` +
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${top}"/>`
  );
}

/**
 * A box in 2:1 projection. (cx, cy) is the centre of the top face, w and d are its sizes along the two
 * ground axes, h is the height. Three faces, three colours.
 */
export function isoBox(cx: number, cy: number, w: number, d: number, h: number, top: string, left: string, right: string): string {
  const a = w / 2;
  const b = d / 2;
  const F = [cx + a - b, cy + (a + b) / 2];
  const R = [cx + a + b, cy + (a - b) / 2];
  const B = [cx - a + b, cy - (a + b) / 2];
  const L = [cx - a - b, cy + (b - a) / 2];
  const pt = (p: number[], dy = 0) => `${r(p[0])},${r(p[1] + dy)}`;
  return (
    `<path d="M${pt(L)} L${pt(F)} L${pt(F, h)} L${pt(L, h)} Z" fill="${left}"/>` +
    `<path d="M${pt(F)} L${pt(R)} L${pt(R, h)} L${pt(F, h)} Z" fill="${right}"/>` +
    `<path d="M${pt(L)} L${pt(B)} L${pt(R)} L${pt(F)} Z" fill="${top}"/>`
  );
}

/** Puts flat art onto the top face of an isoBox: plane units map to the two ground axes. */
export const onTop = (cx: number, cy: number, body: string) => `<g transform="matrix(1 0.5 -1 0.5 ${cx} ${cy})">${body}</g>`;

/** A flat ball: one colour, a darker crescent underneath, a small white glint. */
export function ball(cx: number, cy: number, rad: number, face: string, side: string): string {
  return (
    `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${face}"/>` +
    `<path d="M${cx - rad},${cy} A${rad},${rad} 0 0 0 ${cx + rad},${cy} A${rad},${r(rad * 0.55)} 0 0 1 ${cx - rad},${cy} Z" fill="${side}"/>` +
    `<ellipse cx="${r(cx - rad * 0.36)}" cy="${r(cy - rad * 0.44)}" rx="${r(rad * 0.26)}" ry="${r(rad * 0.16)}" fill="${WHITE}" fill-opacity="0.85" transform="rotate(-35 ${r(cx - rad * 0.36)} ${r(cy - rad * 0.44)})"/>`
  );
}

/** A flat shadow on the ground. */
export const shadow = (cx: number, cy: number, rx: number, ry: number, fill: string) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;

/** A hanging coil spring from (x, y1) to (x, y2): the far halves of the turns first, then the near halves. */
export function coil(x: number, y1: number, y2: number, rx: number, turns: number, near: string, far: string, width = 4): string {
  const pitch = (y2 - y1) / turns;
  const ry = rx * 0.34;
  let back = '';
  let front = '';
  for (let i = 0; i < turns; i++) {
    const y = y1 + pitch * i;
    back += `<path d="M${x + rx},${r(y)} A${rx},${r(ry)} 0 0 0 ${x - rx},${r(y + pitch / 2)}" stroke="${far}"/>`;
    front += `<path d="M${x - rx},${r(y + pitch / 2)} A${rx},${r(ry)} 0 0 0 ${x + rx},${r(y + pitch)}" stroke="${near}"/>`;
  }
  return `<g fill="none" stroke-width="${width}" stroke-linecap="round">${back}${front}</g>`;
}
