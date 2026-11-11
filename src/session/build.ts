// The "build the solution" step as a small state machine: pick the equation, fill it with
// signed values one at a time, then read the result. Every tap commits at once (no Check button),
// and each stage is its own screen. Pure functions, no React.
import { RELATIONS, relationFits, type RelationId } from '../physics/kinematics.ts';
import type { BuildStep, Highlight, Playback, Values } from '../content/types.ts';
import { laddered, type Outcome } from './logic.ts';

export type BuildStage = 'relation' | 'slot' | 'final' | 'done';

export type BuildState = {
  stage: BuildStage;
  slotIndex: number; // which of step.slots is being filled (while stage is 'slot')
  relation: RelationId | null;
  values: Values; // the slots filled so far
  wrong: number; // wrong taps so far (help levels; the third one reveals)
  lost: number; // exam format: marks lost
  marked: boolean; // the last tap on this screen was wrong; the next tap clears it
  revealed: boolean;
};

export const initialBuild: BuildState = { stage: 'relation', slotIndex: 0, relation: null, values: {}, wrong: 0, lost: 0, marked: false, revealed: false };

/** ok: true = right, false = wrong, null = a neutral note. */
export type Verdict = { ok: boolean | null; text: string };
/** The result of one tap. `correct` is false for a wrong tap (and for a tap that does nothing). */
export type Answered = { state: BuildState; verdict: Verdict | null; playback: Playback | null; correct: boolean };

const correctRelation = (step: BuildStep) => step.relations.find((r) => relationFits(r.id, step.known, step.unknown))!.id;
const correctValues = (step: BuildStep): Values => Object.fromEntries(step.slots.map((sl) => [sl.quantity, sl.correct]));

const ignored = (s: BuildState): Answered => ({ state: s, verdict: null, playback: null, correct: false });
const right = (state: BuildState, verdict: Verdict | null = null, playback: Playback | null = null): Answered => ({ state, verdict, playback, correct: true });

/** The stage that follows slot number `index` (or the relation, with index -1). */
function afterSlot(step: BuildStep, s: BuildState, index: number): BuildState {
  const next = index + 1;
  return next < step.slots.length ? { ...s, stage: 'slot', slotIndex: next } : { ...s, stage: 'final' };
}

/**
 * A wrong tap. Exam format: one attempt per part, so a mark is lost, the right value is filled in
 * and the question moves on. Otherwise: the first miss gets the specific feedback, the second the
 * method hint, the third shows the full solution.
 */
function wrongTap(step: BuildStep, s: BuildState, feedback: string, playback: Playback | null, advance: BuildState, finalPlayback: Playback | null = null): Answered {
  const verdict: Verdict = { ok: false, text: feedback };
  if (step.exam) return { state: { ...advance, lost: s.lost + 1, marked: false }, verdict, playback: finalPlayback, correct: false };
  const wrong = s.wrong + 1;
  if (wrong >= 3) {
    const state: BuildState = { ...s, wrong, stage: 'done', revealed: true, marked: false, relation: correctRelation(step), values: correctValues(step) };
    return { state, verdict: { ok: false, text: 'Here is the full solution.' }, playback: step.donePlayback(), correct: false };
  }
  return { state: { ...s, wrong, marked: true }, verdict, playback, correct: false };
}

/** Second miss on a slot or an equation gets the method hint instead of the specific feedback. */
const hintOr = (step: BuildStep, s: BuildState, text: string) => (s.wrong === 1 && step.methodHint ? step.methodHint : text);

export function chooseRelation(step: BuildStep, s0: BuildState, id: RelationId): Answered {
  if (s0.stage !== 'relation') return ignored(s0);
  const s: BuildState = { ...s0, marked: false };
  if (relationFits(id, step.known, step.unknown)) return right(afterSlot(step, { ...s, relation: id }, -1));
  const feedback = step.relations.find((r) => r.id === id)?.feedback ?? '';
  const advance = afterSlot(step, { ...s, relation: correctRelation(step) }, -1); // used in exam format only
  return wrongTap(step, s, hintOr(step, s, feedback), null, advance);
}

/** A tap on a chip of the slot being filled (step.slots[s.slotIndex]). */
export function chooseChip(step: BuildStep, s0: BuildState, value: number): Answered {
  if (s0.stage !== 'slot') return ignored(s0);
  const s: BuildState = { ...s0, marked: false };
  const slot = step.slots[s.slotIndex];
  if (value === slot.correct) return right(afterSlot(step, { ...s, values: { ...s.values, [slot.quantity]: value } }, s.slotIndex));
  const chip = slot.chips.find((c) => c.value === value);
  const advance = afterSlot(step, { ...s, values: { ...s.values, [slot.quantity]: slot.correct } }, s.slotIndex); // exam format only
  // The wrong numbers play as a ghost: the motion they describe, next to the real one.
  const playback = step.exam ? null : step.wrongPlayback({ ...s.values, [slot.quantity]: value });
  // a value that belongs to another quantity (a tile with the wrong unit) gets a plain note
  return wrongTap(step, s, hintOr(step, s, chip?.feedback ?? 'Wrong quantity: check the unit.'), playback, advance);
}

export function chooseFinal(step: BuildStep, s0: BuildState, choiceId: string): Answered {
  if (s0.stage !== 'final') return ignored(s0);
  const s: BuildState = { ...s0, marked: false };
  const choice = step.final.choices.find((c) => c.id === choiceId);
  if (!choice) return ignored(s0);
  if (choice.correct) return right({ ...s, stage: 'done' }, { ok: true, text: choice.feedback }, step.donePlayback());
  // In exam format the question ends here, so the real motion plays; otherwise the learner tries again.
  return wrongTap(step, s, choice.feedback, null, { ...s, stage: 'done' }, step.donePlayback());
}

/** The question for the screen the learner is on. */
export function currentPrompt(step: BuildStep, s: BuildState): string {
  if (s.stage === 'relation') return step.relationPrompt;
  if (s.stage === 'slot') return step.slots[s.slotIndex].prompt;
  if (s.stage === 'final') return step.final.prompt;
  return step.exam ? `${step.exam.command} ${step.question}` : step.question; // 'done': the task itself stays on the stage
}

/** The quantity the scene points out while a slot is being filled. */
export function currentHighlight(step: BuildStep, s: BuildState): Highlight {
  return s.stage === 'slot' ? step.slots[s.slotIndex].highlight : null;
}

export function buildOutcome(step: BuildStep, s: BuildState): Outcome {
  if (step.exam) return s.lost === 0 ? 'independent' : 'revealed';
  return laddered(s.wrong);
}

/** Marks earned on an exam-format step. */
export const marksEarned = (step: BuildStep, s: BuildState) => (step.exam ? step.exam.marks - s.lost : 0);

export const relationText = (id: RelationId) => RELATIONS[id].text;
