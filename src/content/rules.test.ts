// Writing rules for every lesson (docs/LESSON_FRAMEWORK.md, "Decisions of 11 Nov, night").
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from './lessons.ts';
import { samples } from './samples.ts';
import { boxesOf } from '../session/build.ts';
import { ACC_IDS, BEAM_IDS, CANDIDATE_IDS, COMPARE_IDS, SKETCH_IDS, EQUATION_IDS, FLOW_IDS, LADDER_IDS, PAIR_IDS, POLE_IDS, SLEDGE_IDS, isQuestion, type BuildScreen, type Fig, type OrderScreen, type Screen, type SpotErrorScreen } from './types.ts';

// **key words** are bold on screen: the stars do not count, but they must come in pairs
const max = (text: string, n: number, where: string) => {
  assert.equal(text.split('**').length % 2, 1, `${where}: unpaired ** in "${text}"`);
  const shown = text.replaceAll('**', '');
  assert.ok(shown.length <= n, `${where}: ${shown.length} > ${n} characters: "${shown}"`);
};

/** A build step: every box has a right chip that exists, every wrong chip says what it gets wrong, 3–7 chips. */
function checkBuildScreen(s: BuildScreen) {
  const boxes = boxesOf(s.equation);
  assert.ok(boxes.length > 0, `${s.id}: the equation has boxes`);
  assert.deepEqual([...boxes].sort(), Object.keys(s.boxes).sort(), `${s.id}: every box of the equation, and only those, has a right chip`);
  const right = new Set(Object.values(s.boxes));
  for (const id of right) assert.ok(s.chips.some((c) => c.id === id), `${s.id}: chip ${id} exists`);
  assert.equal(new Set(s.chips.map((c) => c.id)).size, s.chips.length, `${s.id}: chip ids are unique`);
  for (const c of s.chips) {
    if (!right.has(c.id)) assert.ok(c.hint, `${s.id}/${c.id}: a wrong chip needs a hint`);
    if (c.hint) max(c.hint, 80, `${s.id}/${c.id} hint`);
    max(c.label, 14, `${s.id}/${c.id} label`);
  }
  assert.ok(s.chips.length >= 3 && s.chips.length <= 7, `${s.id}: 3–7 chips`);
  assert.ok(Number.isFinite(s.result.value) && s.result.unit !== '', `${s.id}: a result with a unit`);
  max(s.why, 170, `${s.id} why`);
  if (s.choose) {
    assert.equal(s.choose.options.filter((o) => o.correct).length, 1, `${s.id}: one right equation`);
    for (const o of s.choose.options) if (!o.correct) assert.ok(o.hint, `${s.id}/${o.id}: a wrong equation needs a hint`);
  }
}

/** An order step: 3–5 statements of at most 90 characters, a hint, unique ids. */
function checkOrderScreen(s: OrderScreen) {
  assert.ok(s.steps.length >= 3 && s.steps.length <= 5, `${s.id}: 3–5 statements`);
  assert.equal(new Set(s.steps.map((x) => x.id)).size, s.steps.length, `${s.id}: statement ids are unique`);
  s.steps.forEach((x) => max(x.text, 90, `${s.id}/${x.id}`));
  max(s.hint, 80, `${s.id} hint`);
  max(s.why, 170, `${s.id} why`);
}

/** A spot-the-error step: 3–5 lines of at most 70 characters, exactly one wrong (with its fix), hints on the others. */
function checkSpotErrorScreen(s: SpotErrorScreen) {
  assert.ok(s.lines.length >= 3 && s.lines.length <= 5, `${s.id}: 3–5 lines`);
  const wrong = s.lines.filter((l) => l.wrong);
  assert.equal(wrong.length, 1, `${s.id}: exactly one wrong line`);
  assert.ok(wrong[0].fix, `${s.id}: the wrong line has its fix`);
  for (const l of s.lines) {
    max(l.text, 70, `${s.id}/${l.id}`);
    if (l.fix) max(l.fix, 70, `${s.id}/${l.id} fix`);
    if (!l.wrong) assert.ok(l.hint, `${s.id}/${l.id}: a right line needs a hint (in case it is picked)`);
    if (l.hint) max(l.hint, 80, `${s.id}/${l.id} hint`);
  }
  max(s.why, 170, `${s.id} why`);
}

test('sample steps of the gallery fit together', () => {
  for (const { screen } of samples) {
    if (screen.kind === 'build') checkBuildScreen(screen);
    if (screen.kind === 'order') checkOrderScreen(screen);
    if (screen.kind === 'spotError') checkSpotErrorScreen(screen);
  }
});

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
      if (s.kind === 'predict') {
        assert.ok(s.prompt.endsWith('?'));
        // the right prediction is marked (for the lesson's run record), never on "I'm not sure"
        assert.equal(s.options.filter((o) => o.correct).length, 1, `${s.id}: one right prediction`);
        assert.ok(!s.options.some((o) => o.correct && o.id === 'unsure'), `${s.id}: "I'm not sure" is never right`);
      }
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
    for (const s of lesson.skillCheck) if (s.kind === 'choice' || s.kind === 'tapFig') assert.ok(s.options.every((o) => !o.hint), `${s.id}: no hints in the Skill check`);
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

  test(`${lesson.id}: build steps fit together`, () => {
    for (const s of all) {
      if (s.kind === 'build') checkBuildScreen(s);
      if (s.kind === 'order') checkOrderScreen(s);
      if (s.kind === 'spotError') checkSpotErrorScreen(s);
    }
  });

  test(`${lesson.id}: chapters, if any, are three and follow the story in order`, () => {
    if (!lesson.chapters) return;
    assert.equal(lesson.chapters.length, 3, 'three chapters');
    assert.equal(lesson.chapters[0].from, lesson.story[0].id, 'the first chapter starts at the intro');
    assert.equal(lesson.story[0].kind, 'intro');
    const at = lesson.chapters.map((c) => lesson.story.findIndex((x) => x.id === c.from));
    at.forEach((i, k) => {
      assert.ok(i >= 0, `chapter "${lesson.chapters![k].title}": from must name a story screen`);
      if (k > 0) assert.ok(i > at[k - 1], 'chapters in story order, none empty');
    });
    lesson.chapters.forEach((c) => max(c.title, 24, 'chapter title'));
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
