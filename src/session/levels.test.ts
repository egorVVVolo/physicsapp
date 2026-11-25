// Level complete: when it comes, once, and what it counts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { course } from '../content/course.ts';
import { lessons } from '../content/lessons.ts';
import { questionIds } from '../content/types.ts';
import { isGold, levelFinishOf } from './levels.ts';
import type { Outcome, Run } from './logic.ts';

const idsOf = (levelId: string) => course.levels.find((l) => l.id === levelId)!.lessons.map((x) => x.id);
const runWith = (lessonId: string, over: Record<string, Outcome> = {}): Run => {
  const ids = lessons[lessonId].skillCheck.flatMap(questionIds);
  return { at: 0, ms: 0, outcomes: { ...Object.fromEntries(ids.map((id) => [id, 'independent' as Outcome])), ...over }, wrong: {}, prediction: null, feel: null, marks: {} };
};

test('a level is done only when all its lessons are finished', () => {
  const fluids = idsOf('fluids');
  assert.equal(levelFinishOf(fluids[0], new Set([fluids[0]]), new Set(), {}), null);
  const done = levelFinishOf(fluids[1], new Set(fluids), new Set(), {});
  assert.ok(done);
  assert.equal(done.levelId, 'fluids');
  assert.equal(done.number, 5);
  assert.equal(done.lessons, 2);
});

test('it is shown once: a level already celebrated does not come back', () => {
  const fluids = idsOf('fluids');
  assert.equal(levelFinishOf(fluids[1], new Set(fluids), new Set(['fluids']), {}), null);
});

test('the gold count follows the latest runs: all Skill check answers right first time', () => {
  const forces = idsOf('forces');
  const hard = lessons[forces[1]].skillCheck.flatMap(questionIds)[0];
  const runs = Object.fromEntries(forces.map((id) => [id, runWith(id, id === forces[1] ? { [hard]: 'assisted' } : {})]));
  const done = levelFinishOf(forces[3], new Set(forces), new Set(), runs)!;
  assert.equal(done.lessons, 4);
  assert.equal(done.gold, 3);
  assert.equal(isGold(forces[0], undefined), false);
  assert.equal(isGold(forces[0], runWith(forces[0])), true);
  assert.equal(isGold(forces[1], runs[forces[1]]), false);
});

test('the next level and its first lesson; the last level has none', () => {
  const forces = idsOf('forces');
  const next = levelFinishOf(forces[3], new Set(forces), new Set(), {})!.next;
  assert.deepEqual(next, { levelId: 'momentum-moments', title: 'Momentum and moments', firstLessonId: 'momentum' });
  const materials = idsOf('materials');
  const last = levelFinishOf(materials[3], new Set(materials), new Set(), {})!;
  assert.equal(last.next, null);
  assert.equal(last.number, course.levels.length);
});

test('a lesson that is not in the course finishes no level', () => {
  assert.equal(levelFinishOf('nope', new Set(['nope']), new Set(), {}), null);
});
