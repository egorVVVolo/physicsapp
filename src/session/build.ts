// The "build the solution" step as a small state machine: pick the equation, fill it with
// signed values, then read the result. Pure functions, no React.
import { RELATIONS, relationFits, type Quantity, type RelationId } from '../physics/kinematics.ts';
import type { BuildStep, Playback, Values } from '../content/types.ts';
import { laddered, type Outcome } from './logic.ts';

export type BuildState = {
  stage: 'relation' | 'slots' | 'final' | 'done';
  relation: RelationId | null;
  values: Values;
  active: Quantity | null; // the slot being filled
  finalId: string | null;
  wrong: number; // wrong checks so far (help levels)
  lost: number; // exam format: marks lost
  marked: Quantity | null; // the slot pointed out as wrong
  revealed: boolean;
};

export const initialBuild: BuildState = { stage: 'relation', relation: null, values: {}, active: null, finalId: null, wrong: 0, lost: 0, marked: null, revealed: false };

/** ok: true = right, false = wrong, null = a neutral note. */
export type Verdict = { ok: boolean | null; text: string };
export type CheckResult = { state: BuildState; verdict: Verdict | null; playback: Playback | null };

export const pickRelation = (s: BuildState, relation: RelationId): BuildState => (s.stage === 'relation' ? { ...s, relation } : s);
export const pickSlot = (s: BuildState, active: Quantity): BuildState => (s.stage === 'slots' ? { ...s, active } : s);
export const pickFinal = (s: BuildState, finalId: string): BuildState => (s.stage === 'final' ? { ...s, finalId } : s);

/** Put a value into the active slot and move on to the next empty one. */
export function pickChip(step: BuildStep, s: BuildState, value: number): BuildState {
  if (s.stage !== 'slots' || !s.active) return s;
  const values = { ...s.values, [s.active]: value };
  const nextEmpty = step.slots.find((sl) => values[sl.quantity] === undefined);
  return { ...s, values, active: nextEmpty ? nextEmpty.quantity : s.active, marked: s.marked === s.active ? null : s.marked };
}

export function canCheck(step: BuildStep, s: BuildState): boolean {
  if (s.stage === 'relation') return s.relation !== null;
  if (s.stage === 'slots') return step.slots.every((sl) => s.values[sl.quantity] !== undefined);
  return s.stage === 'final' && s.finalId !== null;
}

const correctRelation = (step: BuildStep) => step.relations.find((r) => relationFits(r.id, step.known, step.unknown))!.id;
const correctValues = (step: BuildStep): Values => Object.fromEntries(step.slots.map((sl) => [sl.quantity, sl.correct]));
const correctFinal = (step: BuildStep) => step.final.choices.find((c) => c.correct)!.id;

export function check(step: BuildStep, s: BuildState): CheckResult {
  if (!canCheck(step, s)) return { state: s, verdict: null, playback: null };

  if (s.stage === 'relation') {
    if (relationFits(s.relation!, step.known, step.unknown)) return { state: toSlots(step, s), verdict: null, playback: null };
    return fail(step, s, step.relations.find((r) => r.id === s.relation)!.feedback, null);
  }

  if (s.stage === 'slots') {
    const wrongSlots = step.slots.filter((sl) => s.values[sl.quantity] !== sl.correct);
    if (wrongSlots.length === 0) return { state: { ...s, stage: 'final', active: null, marked: null }, verdict: null, playback: null };
    const flipped = step.slots.every((sl) => s.values[sl.quantity] === -sl.correct);
    if (flipped && step.flippedFeedback && !step.exam) return { state: s, verdict: { ok: null, text: step.flippedFeedback }, playback: null };
    const first = wrongSlots[0];
    const chip = first.chips.find((c) => c.value === s.values[first.quantity]);
    const text = !step.exam && s.wrong === 1 && step.methodHint ? step.methodHint : chip?.feedback ?? '';
    return fail(step, { ...s, marked: first.quantity, active: first.quantity }, text, step.exam ? null : step.wrongPlayback(s.values));
  }

  const choice = step.final.choices.find((c) => c.id === s.finalId)!;
  if (choice.correct) return { state: { ...s, stage: 'done' }, verdict: { ok: true, text: choice.feedback }, playback: step.donePlayback() };
  return fail(step, s, choice.feedback, null);
}

function toSlots(step: BuildStep, s: BuildState): BuildState {
  return { ...s, stage: 'slots', active: step.slots[0].quantity };
}

function fail(step: BuildStep, s: BuildState, text: string, playback: Playback | null): CheckResult {
  const verdict: Verdict = { ok: false, text };
  if (step.exam) {
    // One attempt per part: the mark is lost, the part is corrected and the question moves on.
    const lost = s.lost + 1;
    if (s.stage === 'relation') return { state: toSlots(step, { ...s, lost, relation: correctRelation(step) }), verdict, playback: null };
    if (s.stage === 'slots') return { state: { ...s, lost, stage: 'final', values: correctValues(step), active: null }, verdict, playback: null };
    return { state: { ...s, lost, stage: 'done' }, verdict, playback: step.donePlayback() };
  }
  const wrong = s.wrong + 1;
  if (wrong >= 3) {
    const state: BuildState = { ...s, wrong, stage: 'done', revealed: true, relation: correctRelation(step), values: correctValues(step), finalId: correctFinal(step), active: null, marked: null };
    return { state, verdict: { ok: false, text: step.retry ? 'Here is the full solution. Next: the same problem with new numbers.' : 'Here is the full solution.' }, playback: step.donePlayback() };
  }
  return { state: { ...s, wrong }, verdict, playback };
}

export function buildOutcome(step: BuildStep, s: BuildState): Outcome {
  if (step.exam) return s.lost === 0 ? 'independent' : 'revealed';
  return laddered(s.wrong);
}

/** Marks earned on an exam-format step. */
export const marksEarned = (step: BuildStep, s: BuildState) => (step.exam ? step.exam.marks - s.lost : 0);

export const relationText = (id: RelationId) => RELATIONS[id].text;
