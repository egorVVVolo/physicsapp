import { loadJson, removeKey, saveJson } from '../lib/storage';
import { lessonOutcome } from './grade';
import { Outcome } from './types';

// What happened on one step. Hints and reveals are kept so the summary can be honest.
export type StepRecord = { outcome: Outcome | null; hintsUsed: number; revealed: boolean };

export type LessonProgress = {
  lessonId: string;
  stepIndex: number; // the step to resume on
  records: Record<string, StepRecord>;
  status: 'in-progress' | 'done';
  outcome: 'independent' | 'assisted' | null;
  completedAt?: string;
};

export const newProgress = (lessonId: string): LessonProgress => ({ lessonId, stepIndex: 0, records: {}, status: 'in-progress', outcome: null });

// Saves how a step went and moves on to the next step.
export function recordStep(p: LessonProgress, stepId: string, record: StepRecord, nextIndex: number): LessonProgress {
  return { ...p, records: { ...p.records, [stepId]: record }, stepIndex: Math.max(p.stepIndex, nextIndex) };
}

// Marks the lesson done; the overall outcome comes from the scored steps only.
export function completeLesson(p: LessonProgress, scoredStepIds: string[], now = new Date()): LessonProgress {
  const outcomes = scoredStepIds.map((id) => p.records[id]?.outcome ?? 'independent');
  return { ...p, status: 'done', outcome: lessonOutcome(outcomes), completedAt: now.toISOString() };
}

const key = (lessonId: string) => `progress:${lessonId}`;
export const loadProgress = (lessonId: string) => loadJson<LessonProgress>(key(lessonId));
export const saveProgress = (p: LessonProgress) => saveJson(key(p.lessonId), p);
export const resetProgress = (lessonId: string) => removeKey(key(lessonId));
