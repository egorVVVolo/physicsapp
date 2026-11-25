import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../content/lessons.ts';
import { questionIds } from '../content/types.ts';
import { continueInfo, continueLine, greeting, levelCounts, longDate, nextLessonId, pickOfDay, readyRefs, specStatus, stampOf } from './progress.ts';
import { itemsOf, type Outcome, type Run } from './logic.ts';

const run = (lessonId: string, over: Record<string, Outcome> = {}): Run => ({
  at: 0, ms: 0, wrong: {}, prediction: null, feel: null, marks: {},
  outcomes: { ...Object.fromEntries(lessons[lessonId].skillCheck.flatMap(questionIds).map((id) => [id, 'independent' as Outcome])), ...over },
});

test('the next lesson is the first never finished, in course order', () => {
  assert.equal(nextLessonId(new Set()), 'vectors-signs');
  assert.equal(nextLessonId(new Set(['vectors-signs', 'motion-graphs'])), 'suvat');
  assert.equal(nextLessonId(new Set(readyRefs.map((x) => x.r.id))), undefined);
});

test('where you are in a lesson: chapter and minutes left', () => {
  const L = lessons['f-ma'];
  assert.equal(continueLine(L, undefined), `Up next · ~${L.minutes} min`);
  const mid = L.story.findIndex((s) => s.id === L.chapters[1].from) + 1;
  const info = continueInfo(L, { index: mid, finished: false });
  assert.deepEqual([info.started, info.chapter, info.chapters], [true, 2, 3]);
  assert.equal(info.minutesLeft, Math.round(L.minutes * (1 - mid / itemsOf(L).length)));
  assert.equal(continueLine(L, { index: mid, finished: false }), `Chapter 2 of 3 · ~${info.minutesLeft} min left`);
  // in the Skill check: the last chapter, at least a minute
  assert.equal(continueInfo(L, { index: itemsOf(L).length - 1, finished: false }).chapter, 3);
  assert.equal(continueInfo(L, { index: itemsOf(L).length - 1, finished: false }).minutesLeft, 1);
  // a finished lesson counts as not started (replay from the beginning)
  assert.equal(continueInfo(L, { index: 5, finished: true }).started, false);
});

test('levels at a glance', () => {
  const c = levelCounts(new Set(['vectors-signs', 'hooke']));
  assert.equal(c.length, 6);
  assert.deepEqual(c[0], { levelId: 'motion', title: 'Motion', done: 1, total: 6 });
  assert.equal(c[5].done, 1);
});

test('greeting, date and the pick of the day', () => {
  assert.equal(greeting(4), 'Good evening');
  assert.equal(greeting(5), 'Good morning');
  assert.equal(greeting(12), 'Good afternoon');
  assert.equal(greeting(18), 'Good evening');
  assert.equal(longDate(new Date(2026, 10, 22)), 'Sunday, 22 November');
  assert.equal(pickOfDay([], '2026-11-25'), undefined);
  assert.equal(pickOfDay(['a', 'b', 'c'], '2026-11-25'), pickOfDay(['a', 'b', 'c'], '2026-11-25'));
  assert.notEqual(pickOfDay(['a', 'b'], '2026-11-25'), pickOfDay(['a', 'b'], '2026-11-26'));
});

test('stamps from the latest run', () => {
  assert.equal(stampOf('f-ma', undefined), 'none');
  assert.equal(stampOf('f-ma', run('f-ma')), 'independent');
  const ids = lessons['f-ma'].skillCheck.flatMap(questionIds);
  assert.equal(stampOf('f-ma', run('f-ma', { [ids[0]]: 'assisted' })), 'assisted');
  assert.equal(stampOf('f-ma', run('f-ma', Object.fromEntries(ids.map((id) => [id, 'revealed' as Outcome])))), 'revealed');
});

test('specification status: not started, learning, secure, and a wrong review takes secure away', () => {
  // point 13 is taught only in "momentum"
  const base = { finished: new Set<string>(), started: new Set<string>(), lastRuns: {}, lastReview: {} };
  assert.equal(specStatus(13, base), 'not-started');
  assert.equal(specStatus(13, { ...base, started: new Set(['momentum']) }), 'learning');
  const done = { ...base, finished: new Set(['momentum']), lastRuns: { momentum: run('momentum') } };
  assert.equal(specStatus(13, done), 'secure');
  assert.equal(specStatus(13, { ...done, lastReview: { 'momentum/x': 'assisted' as Outcome } }), 'learning');
  assert.equal(specStatus(13, { ...done, lastReview: { 'collisions/x': 'assisted' as Outcome } }), 'secure');
  assert.equal(specStatus(13, { ...done, lastRuns: { momentum: run('momentum', { [lessons.momentum.skillCheck[0].id]: 'assisted' }) } }), 'learning');
});

test('the 12 weeks: Monday first, the current week last, today and the future marked', async () => {
  const { weeksGrid, levelOfPoint } = await import('./progress.ts');
  const g = weeksGrid(['2026-11-24', '2026-11-25', '2026-09-10'], '2026-11-25');
  assert.equal(g.length, 12);
  const last = g[11];
  assert.equal(last.cells[0].key, '2026-11-23'); // Monday of this week
  assert.deepEqual(last.cells.slice(1, 3).map((c) => c.done), [true, true]);
  assert.deepEqual(last.cells.map((c) => c.future), [false, false, false, true, true, true, true]);
  assert.equal(g[0].month, 'SEP');
  assert.ok(g.some((w) => w.month === 'NOV'));
  assert.equal(g.flatMap((w) => w.cells).filter((c) => c.done).length, 3);
  assert.equal(levelOfPoint(1), 'motion');
  assert.equal(levelOfPoint(12), 'forces');
  assert.equal(levelOfPoint(32), 'materials');
});
