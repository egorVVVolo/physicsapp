import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palettes } from './tokens.ts';

function luminance(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const l = c.map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

for (const [id, p] of Object.entries(palettes)) {
  test(`palette ${id}: text ≥ 4.5:1 on scene and surface`, () => {
    for (const k of ['ink', 'muted', 'velText', 'accText', 'eventText', 'ok', 'bad'] as const) {
      for (const bg of [p.sky, p.surface, p.bg]) {
        assert.ok(contrast(p[k], bg) >= 4.5, `${k} ${p[k]} on ${bg}: ${contrast(p[k], bg).toFixed(2)}`);
      }
    }
    assert.ok(contrast(p.onPrimary, p.primary) >= 4.5);
  });
  test(`palette ${id}: strokes ≥ 3:1 on scene`, () => {
    for (const k of ['vel', 'acc', 'event', 'ghost', 'ink'] as const) {
      assert.ok(contrast(p[k], p.sky) >= 3, `${k} on sky: ${contrast(p[k], p.sky).toFixed(2)}`);
    }
  });
}
