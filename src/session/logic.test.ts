import { test } from 'node:test';
import assert from 'node:assert/strict';
import { carriedFig, chapterOf, countOutcomes, estimateOutcome, recordMarks, screenOutcome, figNumbers, figOf, shownFigOf, itemsOf, MAX_GAP_MS, next, outcomeOf, parseProgress, progressOf, recordOutcome, recordPick, recordWrong, runOf, startState, tick } from './logic.ts';
import { normalReaction as L } from '../content/normal-reaction.ts';
import { workDoneLesson as W } from '../content/work-done.ts';
import { revealed } from './reveal.ts';

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
    const fig = shownFigOf(L, i);
    const before = i > 0 ? shownFigOf(L, i - 1) : undefined;
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
    marks: {},
  });
  assert.equal(runOf(L, recordPick(s, 'hook', 'less'), 0).prediction?.right, false);
  assert.equal(runOf(L, startState, 0).prediction, null);
});

test('chapters: which one a story screen is in, and how full each is', () => {
  const at = (id: string) => L.story.findIndex((x) => x.id === id);
  assert.equal(chapterOf(L, 0), 0);
  assert.equal(chapterOf(L, at('weight') - 1), 0);
  assert.equal(chapterOf(L, at('weight')), 1);
  assert.equal(chapterOf(L, at('slider')), 2);
  assert.equal(chapterOf(L, L.story.length - 1), 2);
  assert.equal(chapterOf(L, L.story.length), null); // the Skill check splash
  assert.equal(chapterOf({ ...L, chapters: undefined }, 0), null);

  const shares = (index: number) => progressOf({ ...startState, index }, L).chapters.map((c) => c.share);
  assert.deepEqual(shares(0), [0, 0, 0]);
  assert.deepEqual(shares(at('weight')), [1, 0, 0]);
  const mid = shares(at('weight') + 1);
  assert.ok(mid[1] > 0 && mid[1] < 1 && mid[2] === 0);
  assert.deepEqual(shares(L.story.length), [1, 1, 1]);
  assert.deepEqual(progressOf(startState, { ...L, chapters: undefined }).chapters, []);
});

test('a text screen without a figure carries the last one, answered, under the same FIG number', () => {
  for (const lesson of [L, W]) {
    const nums = figNumbers(lesson).of;
    lesson.story.forEach((s, i) => {
      const carried = carriedFig(lesson, i);
      if (s.kind !== 'text' || s.fig) return assert.equal(carried, undefined, `${s.id}: only text screens without a figure carry one`);
      let j = i - 1;
      const hasFig = (x: (typeof lesson.story)[number]) => 'fig' in x && !!x.fig;
      while (j >= 0 && !hasFig(lesson.story[j])) j--;
      if (j < 0) return assert.equal(carried, undefined);
      const src = lesson.story[j];
      const fig = 'fig' in src ? src.fig! : undefined;
      assert.deepEqual(carried, src.kind === 'choice' || src.kind === 'tapFig' ? revealed(fig!) : fig, `${s.id} carries ${src.id}`);
      assert.equal(nums[s.id], nums[src.id], `${s.id}: same FIG number as ${src.id}`);
    });
  }
});

test('estimate: within the tolerance, a near miss in the story, everything else shown', () => {
  assert.equal(estimateOutcome(500, 471, 50, 'story'), 'independent');
  assert.equal(estimateOutcome(421, 471, 50, 'check'), 'independent');
  assert.equal(estimateOutcome(550, 471, 50, 'story'), 'assisted');
  assert.equal(estimateOutcome(380, 471, 50, 'story'), 'assisted');
  assert.equal(estimateOutcome(600, 471, 50, 'story'), 'revealed');
  assert.equal(estimateOutcome(550, 471, 50, 'check'), 'revealed');
});

test('exam card: one outcome once every part is answered; the first marks stay', () => {
  const card = { id: 'exam', kind: 'examCard' as const, context: '', parts: ['a', 'b'].map((id) => ({ id, command: 'State' as const, text: '', marks: 1, kind: 'choice' as const, options: [], why: '' })) };
  let s = recordOutcome(startState, 'exam.a', 'independent');
  assert.equal(screenOutcome(s, card), undefined);
  assert.equal(screenOutcome(recordOutcome(s, 'exam.b', 'independent'), card), 'independent');
  assert.equal(screenOutcome(recordOutcome(s, 'exam.b', 'revealed'), card), 'assisted');
  assert.equal(screenOutcome(recordOutcome(recordOutcome(startState, 'exam.a', 'revealed'), 'exam.b', 'revealed'), card), 'revealed');
  s = recordMarks(recordMarks(s, 'exam.b', [1, 2]), 'exam.b', [2, 2]);
  assert.deepEqual(s.marks, { 'exam.b': [1, 2] });
});
