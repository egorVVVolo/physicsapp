import { test } from 'node:test';
import assert from 'node:assert/strict';
import { levelColors, palette as p } from './tokens.ts';

function luminance(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const l = c.map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const check = (fg: string, bg: string, min: number, what: string) =>
  assert.ok(contrast(fg, bg) >= min, `${what}: ${fg} on ${bg} is ${contrast(fg, bg).toFixed(2)}, needs ${min}`);

test('text on the page and on a selected card is at least 4.5:1', () => {
  for (const k of ['ink', 'muted', 'faint', 'okText', 'badText', 'forceText'] as const) check(p[k], p.page, 4.5, k);
  check(p.ink, p.selectBg, 4.5, 'text on a selected card');
});

test('text on the drawing paper is at least 4.5:1', () => {
  for (const k of ['draw', 'label', 'forceText', 'ink'] as const) check(p[k], p.paper, 4.5, `${k} on paper`);
});

test('buttons and verdict sheets are at least 4.5:1', () => {
  check(p.onPrimary, p.primary, 4.5, 'button');
  check(p.onDisabled, p.disabled, 4.5, 'disabled button');
  check(p.onPrimary, p.ok, 4.5, 'green button');
  check(p.okText, p.okBg, 4.5, 'correct sheet');
  check(p.badText, p.badBg, 4.5, 'wrong sheet');
  check(p.ink, p.okBg, 4.5, 'title on the correct sheet');
  check(p.ink, p.badBg, 4.5, 'title on the wrong sheet');
});

test('strokes are at least 3:1: forces and line art on paper, card borders that carry meaning', () => {
  check(p.force, p.paper, 3, 'force arrows');
  check(p.draw, p.paper, 3, 'line art');
  check(p.ok, p.page, 3, 'right card border');
  check(p.bad, p.page, 3, 'wrong card border');
});

test('level colours: white text on the Start button, the colour visible on white', () => {
  for (const [id, c] of Object.entries(levelColors)) {
    check('#FFFFFF', c.main, 4.5, `${id} button`);
    check(c.main, c.soft, 3, `${id} on its soft tint`);
  }
});
