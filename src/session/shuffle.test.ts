import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../content/lessons.ts';
import { shuffled } from './shuffle.ts';

const items = ['a', 'b', 'c', 'd'].map((id) => ({ id }));
const ids = (xs: { id: string }[]) => xs.map((x) => x.id).join('');

test('the same key gives the same order every time', () => {
  assert.equal(ids(shuffled(items, 'screen-1')), ids(shuffled(items, 'screen-1')));
});

test('different keys give different orders at least sometimes', () => {
  const orders = new Set(Array.from({ length: 20 }, (_, i) => ids(shuffled(items, `screen-${i}`))));
  assert.ok(orders.size > 1);
});

test('a different salt can change the order', () => {
  const orders = new Set(Array.from({ length: 20 }, (_, i) => ids(shuffled(items, 'screen-1', `2026-11-${i + 1}`))));
  assert.ok(orders.size > 1);
});

test("'unsure' always stays last and nothing is lost", () => {
  const withUnsure = [{ id: 'unsure' }, ...items];
  for (let i = 0; i < 50; i++) {
    const out = shuffled(withUnsure, `k${i}`);
    assert.equal(out.at(-1)!.id, 'unsure');
    assert.deepEqual([...out].map((o) => o.id).sort(), ['a', 'b', 'c', 'd', 'unsure']);
  }
});

test('across the course the right answer sits in every position 12–40 % of the time', () => {
  const counts = [0, 0, 0, 0];
  for (const lesson of Object.values(lessons)) {
    for (const s of [...lesson.story, ...lesson.skillCheck]) {
      if (s.kind !== 'choice' || s.options.length !== 4 || s.options.some((o) => o.id === 'unsure')) continue;
      counts[shuffled(s.options, s.id).findIndex((o) => o.correct)]++;
    }
  }
  const total = counts.reduce((a, b) => a + b, 0);
  assert.ok(total > 40, `only ${total} questions`);
  for (const c of counts) {
    const share = c / total;
    assert.ok(share >= 0.12 && share <= 0.4, `positions ${counts.join(' / ')} of ${total}`);
  }
});
