import { test } from 'node:test';
import assert from 'node:assert/strict';
import { course } from './course.ts';
import { SPEC } from './spec.ts';

test('32 points, numbered 1 to 32, short own names, the same numbers the course uses', () => {
  assert.deepEqual(SPEC.map((s) => s.n), Array.from({ length: 32 }, (_, i) => i + 1));
  for (const s of SPEC) assert.ok(s.name.length > 0 && s.name.length <= 40, `${s.n}: "${s.name}" is at most 40 characters`);
  const used = new Set(course.levels.flatMap((l) => l.lessons.flatMap((r) => r.spec)));
  assert.deepEqual([...used].sort((a, b) => a - b), SPEC.map((s) => s.n));
});
