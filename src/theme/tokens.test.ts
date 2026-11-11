import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palette as p } from './tokens.ts';

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

test('text on the page and in the scene is at least 4.5:1', () => {
  for (const bg of [p.page, p.sky]) {
    for (const k of ['ink', 'muted', 'faint', 'velText', 'accText', 'okText', 'badText'] as const) check(p[k], bg, 4.5, `${k} on ${bg}`);
  }
  check(p.muted, p.ground, 4.5, 'labels under the ground line');
  check(p.ink, p.selectBg, 4.5, 'text on a selected card');
  check(p.select, p.page, 4.5, 'the instruction line under the question');
});

test('buttons and verdict banners are at least 4.5:1', () => {
  check(p.onPrimary, p.primary, 4.5, 'onPrimary on primary');
  check(p.onDisabled, p.disabled, 4.5, 'onDisabled on disabled');
  check(p.onPrimary, p.ok, 4.5, 'white on the green button');
  check(p.onPrimary, p.bad, 4.5, 'white on the red button');
  check(p.okText, p.okBg, 4.5, 'okText on okBg');
  check(p.badText, p.badBg, 4.5, 'badText on badBg');
});

test('strokes drawn in the scene are at least 3:1 on the sky', () => {
  for (const k of ['vel', 'acc', 'ghost', 'groundLine', 'select', 'kraftDark'] as const) check(p[k], p.sky, 3, k);
});
