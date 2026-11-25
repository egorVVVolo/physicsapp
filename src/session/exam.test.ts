import { test } from 'node:test';
import assert from 'node:assert/strict';
import { daysToExam, examLine, nextSessions, sessionLabel } from './exam.ts';

test('the next three sessions after a date, the started ones skipped', () => {
  assert.deepEqual(nextSessions(new Date(2026, 10, 25)).map((s) => s.key), ['2027-01', '2027-05', '2027-10']);
  assert.deepEqual(nextSessions(new Date(2027, 0, 1)).map((s) => s.key), ['2027-05', '2027-10', '2028-01']);
  assert.deepEqual(nextSessions(new Date(2027, 4, 20)).map((s) => s.name), ['October 2027', 'January 2028', 'May–June 2028']);
});

test('labels and the countdown to the first of the month', () => {
  assert.equal(sessionLabel('2027-05'), 'MAY–JUNE 2027');
  assert.equal(sessionLabel('2027-01'), 'JANUARY 2027');
  assert.equal(daysToExam('2027-01', new Date(2026, 11, 31)), 1);
  assert.equal(daysToExam('2027-01', new Date(2027, 0, 9)), 0);
  assert.equal(examLine('2027-05', new Date(2026, 10, 25)), 'EXAM · MAY–JUNE 2027 · 157 DAYS');
  assert.equal(examLine('2027-01', new Date(2026, 11, 31)), 'EXAM · JANUARY 2027 · 1 DAY');
});
