import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDay, currentRun, dayKey, emptyStreak, longestRun, parseStreak } from './streak.ts';

test('the first day gives a run of one, spinning', () => {
  const s = addDay(emptyStreak, '2026-11-14');
  assert.deepEqual(s.days, ['2026-11-14']);
  assert.deepEqual(currentRun(s, '2026-11-14'), { count: 1, spinning: true });
  assert.equal(longestRun(s), 1);
});

test('two days in a row give two', () => {
  const s = addDay(addDay(emptyStreak, '2026-11-13'), '2026-11-14');
  assert.deepEqual(currentRun(s, '2026-11-14'), { count: 2, spinning: true });
  assert.equal(longestRun(s), 2);
});

test('the same day twice does not grow the run', () => {
  const s = addDay(addDay(emptyStreak, '2026-11-14'), '2026-11-14');
  assert.deepEqual(s.days, ['2026-11-14']);
  assert.equal(currentRun(s, '2026-11-14').count, 1);
});

test('yesterday done, today not yet: the run holds, the top is not spinning', () => {
  const s = addDay(addDay(emptyStreak, '2026-11-12'), '2026-11-13');
  assert.deepEqual(currentRun(s, '2026-11-14'), { count: 2, spinning: false });
});

test('a missed day ends the run; the longest run is kept', () => {
  let s = emptyStreak;
  for (const d of ['2026-11-01', '2026-11-02', '2026-11-03']) s = addDay(s, d);
  assert.deepEqual(currentRun(s, '2026-11-05'), { count: 0, spinning: false });
  assert.equal(longestRun(s), 3);
  s = addDay(s, '2026-11-05');
  assert.deepEqual(currentRun(s, '2026-11-05'), { count: 1, spinning: true });
  assert.equal(longestRun(s), 3);
});

test('runs cross the end of a month and of a year', () => {
  const month = addDay(addDay(emptyStreak, '2026-10-31'), '2026-11-01');
  assert.equal(currentRun(month, '2026-11-01').count, 2);
  const leap = addDay(addDay(emptyStreak, '2028-02-28'), '2028-02-29');
  assert.equal(currentRun(addDay(leap, '2028-03-01'), '2028-03-01').count, 3);
  const year = addDay(addDay(emptyStreak, '2026-12-31'), '2027-01-01');
  assert.deepEqual(currentRun(year, '2027-01-01'), { count: 2, spinning: true });
  assert.deepEqual(currentRun(year, '2027-01-02'), { count: 2, spinning: false });
});

test('days stay sorted and only the last 400 are kept', () => {
  let s = addDay(emptyStreak, '2026-11-14');
  s = addDay(s, '2026-11-10'); // out of order (a clock changed): still sorted
  assert.deepEqual(s.days, ['2026-11-10', '2026-11-14']);
  let long = emptyStreak;
  const d = new Date(2025, 0, 1);
  for (let i = 0; i < 450; i++) {
    long = addDay(long, dayKey(d));
    d.setDate(d.getDate() + 1);
  }
  assert.equal(long.days.length, 400);
  assert.equal(longestRun(long), 400);
});

test('dayKey uses the local date, not UTC', () => {
  // 23:30 local time is still the same local day, whatever the time zone
  assert.equal(dayKey(new Date(2026, 10, 14, 23, 30)), '2026-11-14');
  assert.equal(dayKey(new Date(2026, 10, 14, 0, 15)), '2026-11-14');
  assert.equal(dayKey(new Date(2026, 0, 5, 12)), '2026-01-05');
});

test('broken data reads as an empty streak', () => {
  assert.deepEqual(parseStreak(null), emptyStreak);
  assert.deepEqual(parseStreak('not json'), emptyStreak);
  assert.deepEqual(parseStreak('{"days": "2026-11-14"}'), emptyStreak);
  assert.deepEqual(parseStreak('{"days": ["2026-11-14", 3, "yesterday", "2026-11-13"]}'), { days: ['2026-11-13', '2026-11-14'] });
});
