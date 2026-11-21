// Writing rules for every lesson (docs/LESSON_FRAMEWORK.md, "Decisions of 11 Nov, night").
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from './lessons.ts';
import { ACC_IDS, BEAM_IDS, CANDIDATE_IDS, COMPARE_IDS, SKETCH_IDS, EQUATION_IDS, FLOW_IDS, LADDER_IDS, PAIR_IDS, POLE_IDS, SLEDGE_IDS, isQuestion, type Fig, type Screen } from './types.ts';

// **key words** are bold on screen: the stars do not count, but they must come in pairs
const max = (text: string, n: number, where: string) => {
  assert.equal(text.split('**').length % 2, 1, `${where}: unpaired ** in "${text}"`);
  const shown = text.replaceAll('**', '');
  assert.ok(shown.length <= n, `${where}: ${shown.length} > ${n} characters: "${shown}"`);
};

function targets(fig: Fig): readonly string[] {
  if (fig.kind === 'pairs') return PAIR_IDS;
  if (fig.kind === 'vt') return fig.phases.map((p) => p.id);
  if (fig.kind === 'throw') return fig.candidates ? ACC_IDS : [];
  if (fig.kind === 'equations') return EQUATION_IDS;
  if (fig.kind === 'graph') return fig.parts?.map((part) => part.id) ?? [];
  if (fig.kind === 'sledge') return fig.targets ? SLEDGE_IDS : [];
  if (fig.kind === 'ladder') return fig.candidates ? LADDER_IDS : [];
  if (fig.kind === 'pole') return fig.candidates ? POLE_IDS : [];
  if (fig.kind === 'beam') return fig.candidates ? BEAM_IDS : [];
  if (fig.kind === 'flow') return FLOW_IDS;
  if (fig.kind === 'material') return fig.view === 'compare' ? COMPARE_IDS : fig.view === 'sketch' && fig.targets ? SKETCH_IDS : [];
  if (fig.kind === 'spring') return fig.view === 'lines' ? (fig.lines ?? []).map((l) => l.id) : [];
  if (fig.kind !== 'lift') return [];
  return fig.candidates ? CANDIDATE_IDS : [];
}

for (const lesson of Object.values(lessons)) {
  const all: Screen[] = [...lesson.story, ...lesson.skillCheck];

  test(`${lesson.id}: the notebook card is short`, () => {
    assert.ok(lesson.card.formula.length > 0 && lesson.card.formula.length <= 24, `formula: ${lesson.card.formula.length} > 24 characters`);
    assert.ok(lesson.card.idea.length > 0 && lesson.card.idea.length <= 110, `idea: ${lesson.card.idea.length} > 110 characters`);
  });

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
