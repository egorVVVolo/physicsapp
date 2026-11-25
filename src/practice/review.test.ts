import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../content/lessons.ts';
import { puzzleQuestionId } from '../session/puzzle.ts';
import { bankOf, examCardsOf } from './bank.ts';
import { addLesson, dueEntries, mistakes, nextDue, pickReview, schedule, spreadLessons, whenText, type Queue } from './review.ts';
import type { Outcome } from '../session/logic.ts';

test('the bank: graded questions that stand alone; no puzzle question, estimate or exam card', () => {
  const bank = bankOf(['f-ma', 'momentum']);
  assert.ok(bank.length > 10);
  for (const it of bank) {
    assert.notEqual(it.screen.id, puzzleQuestionId(lessons[it.lessonId]));
    assert.notEqual(it.screen.kind, 'estimate');
    assert.equal(it.key, `${it.lessonId}/${it.screen.id}`);
  }
  assert.equal(new Set(bank.map((it) => it.key)).size, bank.length);
  assert.equal(examCardsOf(['f-ma']).length, 1);
  assert.deepEqual(bankOf(['nope']), []);
});

test('the schedule: up a box when right first time (1, 3, 7, 21 days), back to box 0 otherwise', () => {
  const e1 = schedule(undefined, 'a/b', 'independent', '2026-11-25');
  assert.deepEqual(e1, { key: 'a/b', box: 1, due: '2026-11-26', last: 'independent' });
  const e2 = schedule(e1, 'a/b', 'independent', '2026-11-26');
  assert.deepEqual([e2.box, e2.due], [2, '2026-11-29']);
  const e3 = schedule(e2, 'a/b', 'independent', '2026-11-29');
  assert.deepEqual([e3.box, e3.due], [3, '2026-12-06']);
  const e4 = schedule(e3, 'a/b', 'independent', '2026-12-06');
  assert.deepEqual([e4.box, e4.due], [4, '2026-12-27']);
  const e5 = schedule(e4, 'a/b', 'independent', '2026-12-27');
  assert.deepEqual([e5.box, e5.due], [4, '2027-01-17']);
  const miss = schedule(e4, 'a/b', 'assisted', '2026-12-06');
  assert.deepEqual(miss, { key: 'a/b', box: 0, due: '2026-12-07', last: 'assisted' });
});

test('a finished lesson fills the queue; tomorrow the mistakes are due', () => {
  const bank = bankOf(['f-ma']);
  const wrong = bank[0].screen.id;
  const outcomes: Record<string, Outcome> = Object.fromEntries(bank.map((it) => [it.screen.id, 'independent' as Outcome]));
  outcomes[wrong] = 'assisted';
  const q = addLesson({}, bank, outcomes, '2026-11-25');
  assert.equal(Object.keys(q).length, bank.length);
  assert.deepEqual(dueEntries(q, '2026-11-25'), []);
  assert.deepEqual(dueEntries(q, '2026-11-26').map((e) => e.key), [bank[0].key]);
  assert.equal(dueEntries(q, '2026-11-28').length, bank.length);
  assert.equal(nextDue(q, '2026-11-25'), '2026-11-26');
  assert.equal(nextDue({}, '2026-11-25'), null);
  assert.deepEqual(mistakes(q, bank).map((it) => it.key), [bank[0].key]);
});

test("today's review: overdue first, then new ones, never two of one lesson in a row when it can be helped", () => {
  const bank = bankOf(['f-ma', 'momentum']);
  const q: Queue = {};
  for (const it of bank.slice(0, 3)) q[it.key] = { key: it.key, box: 1, due: '2026-11-20', last: 'independent' };
  const pick = pickReview(q, bank, '2026-11-25', 5);
  assert.equal(pick.length, 5);
  for (const it of bank.slice(0, 3)) assert.ok(pick.some((p) => p.key === it.key), 'all due questions are in');
  for (let i = 1; i < pick.length; i++) if (pick[i].lessonId === pick[i - 1].lessonId) assert.ok(pick.slice(i).every((p) => p.lessonId === pick[i].lessonId));
  const spread = spreadLessons([...bankOf(['f-ma']).slice(0, 2), ...bankOf(['momentum']).slice(0, 2)]);
  assert.deepEqual(spread.map((it) => it.lessonId), ['f-ma', 'momentum', 'f-ma', 'momentum']);
});

test('when text', () => {
  assert.equal(whenText('2026-11-26', '2026-11-25'), 'tomorrow');
  assert.equal(whenText('2026-11-28', '2026-11-25'), 'in 3 days');
  assert.equal(whenText('2026-11-25', '2026-11-25'), 'today');
});
