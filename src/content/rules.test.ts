// Writing rules for every lesson (docs/LESSON_FRAMEWORK.md, "Decisions of 11 Nov, night").
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from './lessons.ts';
import { CANDIDATE_IDS, PAIR_IDS, isQuestion, type Fig, type Screen } from './types.ts';

const max = (text: string, n: number, where: string) => assert.ok(text.length <= n, `${where}: ${text.length} > ${n} characters: "${text}"`);

function targets(fig: Fig): readonly string[] {
  if (fig.kind === 'pairs') return PAIR_IDS;
  if (fig.kind === 'vt') return fig.phases.map((p) => p.id);
  return fig.candidates ? CANDIDATE_IDS : [];
}

for (const lesson of Object.values(lessons)) {
  const all: Screen[] = [...lesson.story, ...lesson.skillCheck];

  test(`${lesson.id}: screen ids are unique`, () => {
    assert.equal(new Set(all.map((s) => s.id)).size, all.length);
  });

  test(`${lesson.id}: starts with an intro and ends the story before the Skill check`, () => {
    assert.equal(lesson.story[0].kind, 'intro');
    assert.ok(lesson.skillCheck.length >= 3 && lesson.skillCheck.length <= 5);
    assert.ok(lesson.skillCheck.every(isQuestion));
  });

  test(`${lesson.id}: one focus per screen`, () => {
    for (const s of all) {
      if (s.kind === 'text') {
        if (s.fig) {
          assert.equal(s.body.length, 1, `${s.id}: a figure screen has one sentence`);
          assert.ok(!s.card, `${s.id}: a figure screen has no card`);
          max(s.body[0], 90, s.id);
        } else {
          assert.ok(s.body.length <= 2, `${s.id}: at most two paragraphs`);
          s.body.forEach((p) => max(p, 160, s.id));
        }
      }
      if (s.kind === 'intro') max(s.body, 120, s.id);
    }
  });

  test(`${lesson.id}: questions are full questions with exactly one right option`, () => {
    for (const s of all) {
      if (s.kind === 'choice' || s.kind === 'tapFig') {
        assert.ok(s.prompt.endsWith('?'), `${s.id}: the prompt is a question`);
        max(s.prompt, 140, s.id);
        assert.equal(s.options.filter((o) => o.correct).length, 1, `${s.id}: one right option`);
        max(s.why, 170, `${s.id} why`);
        s.options.forEach((o) => max(o.label, 70, `${s.id} option`));
      }
      if (s.kind === 'explore') {
        assert.ok(s.question.prompt.endsWith('?'));
        assert.equal(s.question.options.filter((o) => o.correct).length, 1, `${s.id}: one right option`);
      }
      if (s.kind === 'predict') assert.ok(s.prompt.endsWith('?') && !s.options.some((o) => o.correct));
    }
  });

  test(`${lesson.id}: hints only in the story, short, and only on wrong options`, () => {
    for (const s of lesson.story) {
      if (s.kind === 'choice' || s.kind === 'tapFig') {
        for (const o of s.options) {
          if (o.correct) assert.ok(!o.hint, `${s.id}: the right option has no hint`);
          else assert.ok(o.hint, `${s.id}/${o.id}: a wrong story option needs a hint`);
          if (o.hint) max(o.hint, 80, `${s.id}/${o.id} hint`);
        }
      }
    }
    for (const s of lesson.skillCheck) assert.ok(s.options.every((o) => !o.hint), `${s.id}: no hints in the Skill check`);
  });

  test(`${lesson.id}: gestures are named, tap targets match the figure`, () => {
    for (const s of all) {
      if (s.kind === 'explore') assert.match(s.instruction, /^Drag /);
      if (s.kind === 'tapFig') {
        assert.match(s.instruction, /^Tap /);
        assert.deepEqual([...s.options.map((o) => o.id)].sort(), [...targets(s.fig)].sort(), `${s.id}: options = tap targets`);
      }
    }
  });

  test(`${lesson.id}: a revisit points back to an earlier prediction`, () => {
    all.forEach((s, i) => {
      if (s.kind === 'choice' && s.revisitOf) {
        const j = all.findIndex((x) => x.id === s.revisitOf);
        assert.ok(j >= 0 && j < i && all[j].kind === 'predict', `${s.id}: revisitOf must name an earlier predict screen`);
      }
    });
  });
}
