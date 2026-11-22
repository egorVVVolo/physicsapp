import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countOutcomes, figNumbers, figOf, itemsOf, MAX_GAP_MS, next, outcomeOf, parseProgress, progressOf, recordOutcome, recordPick, recordWrong, runOf, startState, tick } from './logic.ts';
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

test('FIG numbers: one number per run of neighbouring screens with the same kind of figure', () => {
  const { of, count } = figNumbers(L);
  const items = itemsOf(L);
  let expected = 0;
  for (let i = 0; i < items.length; i++) {
    const fig = figOf(items[i]);
    const before = figOf(items[i - 1]);
    if (!fig) continue;
    if (fig.kind !== before?.kind) expected += 1;
    const item = items[i];
    assert.equal(item.kind === 'screen' && of[item.screen.id], expected);
  }
  assert.equal(count, expected);
  // the opening lift and the prediction about it are one figure
  assert.equal(of[L.story[0].id], 1);
  assert.equal(of[L.story[1].id], 1);
});

test('saves from before the run record load with an empty record', () => {
  const old = { index: 3, outcomes: { 'at-rest': 'independent' }, picks: { hook: 'more' }, finished: false };
  const st = parseProgress(JSON.stringify({ v: 2, lessonId: L.id, state: old, updatedAt: 1 }), L)?.state;
  assert.deepEqual(st, { ...old, wrong: {}, activeMs: 0, lastAt: null });
});

test('wrong picks are kept per question, in order', () => {
  let s = recordWrong(startState, 'calc', 'home');
  s = recordWrong(s, 'calc', 'added-to-kg');
  s = recordWrong(s, 'at-rest', 'less');
  assert.deepEqual(s.wrong, { calc: ['home', 'added-to-kg'], 'at-rest': ['less'] });
  assert.deepEqual(startState.wrong, {});
});

test('active time adds the gaps between screens, each at most 3 minutes', () => {
  let s = tick(startState, 1_000); // the first screen opens: nothing to count yet
  assert.deepEqual([s.activeMs, s.lastAt], [0, 1_000]);
  s = tick(s, 31_000);
  assert.deepEqual([s.activeMs, s.lastAt], [30_000, 31_000]);
  s = tick(s, 31_000 + 60 * 60_000); // an hour away counts as 3 minutes
  assert.equal(s.activeMs, 30_000 + MAX_GAP_MS);
  s = next(s, L, s.lastAt! + 5_000); // moving on counts the screen just left
  assert.equal(s.activeMs, 35_000 + MAX_GAP_MS);
  assert.equal(s.index, 1);
});

test('a run keeps the time, outcomes, wrong picks and whether the prediction was right', () => {
  let s = { ...tick(startState, 0), activeMs: 0 };
  s = recordPick(s, 'hook', 'more');
  s = recordWrong(s, 'calc', 'home');
  s = recordOutcome(s, 'calc', 'assisted');
  s = next(s, L, 42_000);
  const run = runOf(L, s, 50_000);
  assert.deepEqual(run, {
    at: 50_000,
    ms: 42_000,
    outcomes: { calc: 'assisted' },
    wrong: { calc: ['home'] },
    prediction: { id: 'hook', pick: 'more', right: true },
    feel: null,
  });
  assert.equal(runOf(L, recordPick(s, 'hook', 'less'), 0).prediction?.right, false);
  assert.equal(runOf(L, startState, 0).prediction, null);
});
