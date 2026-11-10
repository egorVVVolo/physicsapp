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

test('text on the dark stage is at least 4.5:1', () => {
  for (const k of ['stageText', 'stageMuted', 'stageDim'] as const) check(p[k], p.stage, 4.5, k);
});

test('text on the sheet and on answer cards is at least 4.5:1', () => {
  for (const bg of [p.sheet, p.card]) {
    for (const k of ['ink', 'muted', 'velText', 'accText', 'ok', 'bad'] as const) check(p[k], bg, 4.5, `${k} on ${bg}`);
  }
});

test('buttons and verdict colours are at least 4.5:1', () => {
  check(p.onPrimary, p.primary, 4.5, 'onPrimary on primary');
  check(p.onDisabled, p.disabled, 4.5, 'onDisabled on disabled');
  check(p.bad, p.badBg, 4.5, 'bad on badBg');
  check(p.ok, p.okBg, 4.5, 'ok on okBg');
});

test('strokes and labels drawn on the stage are at least 3:1', () => {
  for (const k of ['vel', 'acc', 'kraft', 'ghost', 'stageGroundLine'] as const) check(p[k], p.stage, 3, k);
  // text drawn in the scene (speed labels, "a") must read as text
  for (const k of ['vel', 'acc'] as const) check(p[k], p.stage, 4.5, `${k} as text`);
});
