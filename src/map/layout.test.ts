import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BADGE_SPACE, PUCK, ROW, labelX, levelAt, pathThrough, puckX, rowLayout } from './layout.ts';

test('rows stack without gaps, and only the current row is taller', () => {
  const { tops, heights, total } = rowLayout(4, 2);
  assert.deepEqual(heights, [ROW, ROW, ROW + BADGE_SPACE, ROW]);
  assert.deepEqual(tops, [0, ROW, 2 * ROW, 3 * ROW + BADGE_SPACE]);
  assert.equal(total, 4 * ROW + BADGE_SPACE);
  assert.equal(rowLayout(3, -1).total, 3 * ROW);
});

test('pucks never reach the title column, on a small phone and on a tablet', () => {
  for (const width of [320, 335, 560]) {
    for (let i = 0; i < 8; i++) assert.ok(puckX(width, i) + PUCK / 2 < labelX(width), `width ${width}, row ${i}`);
    assert.ok(puckX(width, 6) - PUCK / 2 >= 0, `puck goes off the left edge at ${width}`);
    assert.ok(width - labelX(width) >= 120, `title column too narrow at ${width}`);
  }
});

test('the pinned header shows the last level whose top has passed', () => {
  const tops = [0, 500, 900];
  assert.equal(levelAt(-20, tops), 0);
  assert.equal(levelAt(499, tops), 0);
  assert.equal(levelAt(500, tops), 1);
  assert.equal(levelAt(5000, tops), 2);
});

test('the path starts at the first puck and ends at the last', () => {
  const d = pathThrough([{ x: 10, y: 20 }, { x: 30, y: 120 }, { x: 5, y: 220 }]);
  assert.ok(d.startsWith('M10,20'));
  assert.ok(d.endsWith('5,220'));
  assert.equal(pathThrough([]), '');
});
