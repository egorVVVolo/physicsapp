// The breakdown is counted from what the learner really did: ribbon, mistakes, prediction, numbers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../content/lessons.ts';
import { questionIds } from '../content/types.ts';
import { entriesOf, minutesOf, onYourOwn, predictionMarks, predictionOf, reviewLine, ribbonLabel, ribbonOf, shorten, stampKind, trippedUp } from './breakdown.ts';
import { puzzleQuestionId } from './puzzle.ts';
import { startState, type LessonState, type Outcome } from './logic.ts';

const L = lessons['f-ma'];
const ids = [...L.story, ...L.skillCheck].flatMap(questionIds);
const solved = (over: Record<string, Outcome> = {}): LessonState => ({ ...startState, outcomes: { ...Object.fromEntries(ids.map((id) => [id, 'independent' as Outcome])), ...over } });

test('one entry per graded question, exam parts separately, in lesson order', () => {
  const entries = entriesOf(L);
  assert.deepEqual(entries.map((e) => e.id), ids);
  assert.ok(entries.some((e) => e.id.includes('.')), 'an exam card gives one entry per part');
  assert.ok(entries.every((e) => e.prompt.length > 0 && e.why.length > 0));
  assert.deepEqual(entries.filter((e) => e.phase === 'check').length, L.skillCheck.length + 1); // the card has two parts
});

test('the ribbon: groups by chapter, then the Skill check, with the honest counts', () => {
  const r = ribbonOf(L, solved({ [ids[0]]: 'assisted', [ids[ids.length - 1]]: 'revealed' }));
  assert.equal(r.groups[r.groups.length - 1].label, 'SKILL CHECK');
  assert.ok(r.groups.every((g) => g.cells.length > 0));
  assert.equal(r.groups.flatMap((g) => g.cells).length, ids.length);
  assert.deepEqual(r.counts, { independent: ids.length - 2, assisted: 1, revealed: 1 });
  assert.equal(ribbonLabel(r.counts), `${ids.length - 2} on your own, 1 after a hint, 1 shown`);
  assert.equal(onYourOwn(r.counts), `${ids.length - 2}/${ids.length}`);
  // the labels are the chapters' own titles
  const titles = L.chapters.map((c) => c.title.toUpperCase());
  for (const g of r.groups.slice(0, -1)) assert.ok(titles.includes(g.label));
});

test('a question with no outcome counts as shown, never as right', () => {
  const r = ribbonOf(L, startState);
  assert.equal(r.counts.revealed, ids.length);
});

test('what tripped you up: only questions not right first time, with the first wrong pick in words', () => {
  assert.deepEqual(trippedUp(L, solved()), []);
  const choice = L.story.find((s) => s.kind === 'choice' && s.options.some((o) => o.hint))!;
  assert.ok(choice.kind === 'choice');
  const wrongOpt = choice.options.find((o) => o.hint)!;
  const state = { ...solved({ [choice.id]: 'assisted' }), wrong: { [choice.id]: [wrongOpt.id, 'zzz'] } };
  const t = trippedUp(L, state);
  assert.equal(t.length, 1);
  assert.equal(t[0].id, choice.id);
  assert.ok(t[0].prompt.length <= 80);
  assert.equal(t[0].picked, wrongOpt.label.length <= 90 ? wrongOpt.label : t[0].picked);
  assert.equal(t[0].note, wrongOpt.hint);
});

test('a shown answer with no recorded pick falls back to the explanation', () => {
  const q = L.story.find((s) => s.kind === 'build')!;
  const t = trippedUp(L, solved({ [q.id]: 'revealed' }));
  assert.equal(t[0].picked, null);
  assert.ok(q.kind === 'build' && t[0].note === q.why);
});

test('the prediction: what was said, what the puzzle showed, the marks in the table', () => {
  const predict = L.story.find((s) => s.kind === 'predict')!;
  assert.ok(predict.kind === 'predict');
  const good = predict.options.find((o) => o.correct)!;
  const bad = predict.options.find((o) => !o.correct && o.id !== 'unsure')!;
  const right = predictionOf(L, { ...solved(), picks: { [predict.id]: good.id } })!;
  assert.deepEqual(right, { you: good.label, was: good.label, right: true });
  assert.deepEqual(predictionMarks(L, { ...solved(), picks: { [predict.id]: good.id } }), [true]);
  assert.deepEqual(predictionOf(L, { ...solved(), picks: { [predict.id]: bad.id } })!.right, false);
  assert.deepEqual(predictionMarks(L, { ...solved(), picks: { [predict.id]: bad.id } }), [false, true]);
  const revisit = L.chapters[2].from;
  assert.deepEqual(predictionMarks(L, { ...solved({ [revisit]: 'revealed' }), picks: { [predict.id]: bad.id } }), [false, false]);
  assert.equal(predictionOf(L, solved()), null);
  assert.equal(predictionMarks(L, solved()), null);
});

test('time in whole minutes, at least one; a long question is cut at a word', () => {
  assert.equal(minutesOf(0), 1);
  assert.equal(minutesOf(29_000), 1);
  assert.equal(minutesOf(11 * 60_000 + 20_000), 11);
  assert.equal(shorten('short'), 'short');
  const cut = shorten('A trolley is released from the top of a long and gentle frictionless ramp of some height, and rolls down.', 80);
  assert.ok(cut.length <= 80 && cut.endsWith('…') && !cut.includes('rolls'));
});

test('review line and stamp', () => {
  assert.equal(reviewLine(0), 'Nothing to review: every answer was right first time.');
  assert.equal(reviewLine(1), 'This question comes back tomorrow.');
  assert.equal(reviewLine(3), 'These 3 questions come back tomorrow.');
  const check = L.skillCheck.map((q) => q.id);
  const examIds = L.skillCheck.flatMap(questionIds);
  assert.equal(stampKind(L, solved()), 'independent');
  assert.equal(stampKind(L, solved({ [examIds[0]]: 'assisted' })), 'assisted');
  const allShown = Object.fromEntries(examIds.map((id) => [id, 'revealed' as Outcome]));
  assert.equal(stampKind(L, solved(allShown)), 'revealed');
  // exactly half shown is not "more than half"
  assert.equal(check.length, 4);
  assert.equal(stampKind(L, solved({ [check[0]]: 'revealed', [check[1]]: 'revealed' })), 'assisted');
});

test('every lesson has a puzzle question, and it is a graded question of its last chapter', () => {
  for (const lesson of Object.values(lessons)) {
    const id = puzzleQuestionId(lesson);
    assert.ok(id, `${lesson.id}: a puzzle question`);
    const at = lesson.story.findIndex((s) => s.id === id);
    const chapterStart = lesson.story.findIndex((s) => s.id === lesson.chapters[2].from);
    assert.ok(at >= chapterStart, `${lesson.id}: it comes in the last chapter`);
    assert.ok(entriesOf(lesson).some((e) => e.id === id), `${lesson.id}: it is graded`);
  }
});
