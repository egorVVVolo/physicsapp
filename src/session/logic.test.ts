import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countOutcomes, itemsOf, next, outcomeOf, parseProgress, progressOf, recordOutcome, recordPick, startState } from './logic.ts';
import { normalReaction as L } from '../content/normal-reaction.ts';

test('story questions: right first time, after a hint, or shown', () => {
  assert.equal(outcomeOf(0, 'story'), 'independent');
  assert.equal(outcomeOf(1, 'story'), 'assisted');
  assert.equal(outcomeOf(2, 'story'), 'revealed');
});

test('Skill check: one try, so a miss shows the answer', () => {
  assert.equal(outcomeOf(0, 'check'), 'independent');
  assert.equal(outcomeOf(1, 'check'), 'revealed');
});

test('items: the story, then the Skill check splash, then its questions', () => {
  const items = itemsOf(L);
  assert.equal(items.length, L.story.length + 1 + L.skillCheck.length);
  assert.equal(items[L.story.length].kind, 'checkIntro');
});

test('the first outcome of a question stays', () => {
  let s = recordOutcome(startState, 'calc', 'assisted');
  s = recordOutcome(s, 'calc', 'independent');
  assert.equal(s.outcomes.calc, 'assisted');
  assert.deepEqual(countOutcomes(s), { independent: 0, assisted: 1, revealed: 0 });
});

test('walking through every item finishes the lesson', () => {
  let s = startState;
  for (let i = 0; i < itemsOf(L).length; i++) s = next(s, L);
  assert.ok(s.finished);
  assert.equal(progressOf(s, L).story, 1);
});

test('saved progress round-trips, and broken data starts fresh', () => {
  let s = recordPick(startState, 'hook', 'same');
  s = recordOutcome({ ...s, index: 5 }, 'at-rest', 'independent');
  const saved = JSON.stringify({ v: 2, lessonId: L.id, state: s, updatedAt: 1 });
  assert.deepEqual(parseProgress(saved, L)?.state, s);
  assert.equal(parseProgress(JSON.stringify({ v: 1, lessonId: L.id, state: s }), L), null);
  assert.equal(parseProgress(JSON.stringify({ v: 2, lessonId: L.id, state: { ...s, outcomes: { nope: 'independent' } } }), L), null);
  assert.equal(parseProgress('{oops', L), null);
});
