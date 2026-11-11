import { test } from 'node:test';
import assert from 'node:assert/strict';
import { course } from './course.ts';
import { lessons } from './lessons.ts';

const refs = course.levels.flatMap((l) => l.lessons);

test('every WPH11 point 1–32 belongs to a lesson', () => {
  const covered = new Set(refs.flatMap((r) => r.spec));
  for (let p = 1; p <= 32; p++) assert.ok(covered.has(p), `spec point ${p} has no lesson`);
});

test('lesson ids are unique', () => {
  assert.equal(new Set(refs.map((r) => r.id)).size, refs.length);
});

test('ready lessons exist, and every existing lesson is on the map as ready', () => {
  for (const r of refs.filter((x) => x.ready)) assert.ok(lessons[r.id], `${r.id} is ready but has no content`);
  for (const id of Object.keys(lessons)) {
    const r = refs.find((x) => x.id === id);
    assert.ok(r?.ready, `${id} is missing from the map`);
    assert.deepEqual(r.spec, lessons[id].spec, `${id}: spec on the map differs from the lesson`);
    assert.equal(r.title, lessons[id].title);
  }
});
