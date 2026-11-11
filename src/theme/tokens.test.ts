import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palette as p, stage as s } from './tokens.ts';

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

const TEXT = ['ink', 'muted', 'faint', 'velText', 'accText', 'okText', 'badText'] as const;

test('text on the page is at least 4.5:1', () => {
  for (const k of TEXT) check(p[k], p.page, 4.5, `${k} on the page`);
  check(p.ink, p.selectBg, 4.5, 'text on a selected card');
  check(p.select, p.page, 4.5, 'selected card ring and active slot');
});

test('text on the dark stage is at least 4.5:1, on the sky and on pills drawn over it', () => {
  for (const bg of [s.sky, s.page]) {
    for (const k of TEXT) check(s[k], bg, 4.5, `stage ${k} on ${bg}`);
  }
  check(s.muted, s.ground, 4.5, 'labels under the ground line');
  check(p.ink, '#FFFFFF', 4.5, 'caption text on its white pill');
});

test('buttons and verdict banners are at least 4.5:1', () => {
  check(p.onPrimary, p.primary, 4.5, 'onPrimary on primary');
  check(p.onDisabled, p.disabled, 4.5, 'onDisabled on disabled');
  check(p.onPrimary, p.ok, 4.5, 'white on the green button');
  check(p.onPrimary, p.bad, 4.5, 'white on the red button');
  check(p.okText, p.okBg, 4.5, 'okText on okBg');
  check(p.badText, p.badBg, 4.5, 'badText on badBg');
});

test('strokes drawn on the stage are at least 3:1 on the sky', () => {
  for (const k of ['vel', 'acc', 'ok', 'bad', 'ghost', 'groundLine', 'select', 'lineStrong', 'sack'] as const) check(s[k], s.sky, 3, `stage ${k}`);
  check(s.acc, s.okBg, 3, 'acceleration glyph in a green circle');
  check(s.acc, s.badBg, 3, 'acceleration glyph in a red circle');
});
