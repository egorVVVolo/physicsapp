// Spaced review, as pure functions. Each question of a finished lesson sits in a box 0–4. Right first time moves it up
// a box and it comes back after 1, 3, 7 or 21 days (box 4 stays at 21); anything else sends it back to box 0, tomorrow.
import type { Outcome } from '../session/logic.ts';
import { addDays, dayNumber } from '../session/streak.ts';
import type { Item } from './bank.ts';

export type Box = 0 | 1 | 2 | 3 | 4;
/** Days until the next showing for each box. */
export const INTERVALS = [1, 1, 3, 7, 21] as const;

/** One question in the queue: its box, the day it is due ('YYYY-MM-DD') and how it was last answered. */
export type Entry = { key: string; box: Box; due: string; last: Outcome };
export type Queue = Record<string, Entry>;

/** The next state of a question after it was answered on `today`. */
export function schedule(entry: Entry | undefined, key: string, outcome: Outcome, today: string): Entry {
  if (outcome !== 'independent') return { key, box: 0, due: addDays(today, 1), last: outcome };
  const box = Math.min(4, (entry?.box ?? 0) + 1) as Box;
  return { key, box, due: addDays(today, INTERVALS[box]), last: outcome };
}

/** A lesson was finished: all its questions join the queue (right first time: box 1 in 3 days; otherwise box 0 tomorrow). */
export function addLesson(queue: Queue, items: Item[], outcomes: Record<string, Outcome>, today: string): Queue {
  const next = { ...queue };
  for (const it of items) {
    const o = outcomes[it.screen.id] ?? 'revealed';
    next[it.key] = o === 'independent' ? { key: it.key, box: 1, due: addDays(today, 3), last: o } : { key: it.key, box: 0, due: addDays(today, 1), last: o };
  }
  return next;
}

/** The questions due on `today` or earlier, the most overdue first. */
export function dueEntries(queue: Queue, today: string): Entry[] {
  const t = dayNumber(today);
  return Object.values(queue)
    .filter((e) => dayNumber(e.due) <= t)
    .sort((a, b) => dayNumber(a.due) - dayNumber(b.due) || a.key.localeCompare(b.key));
}

/** The nearest day something is due after `today`, or null for an empty queue. */
export function nextDue(queue: Queue, today: string): string | null {
  const t = dayNumber(today);
  const later = Object.values(queue).map((e) => e.due).filter((d) => dayNumber(d) > t).sort();
  return later[0] ?? null;
}

/** "tomorrow", "in 3 days". */
export function whenText(day: string, today: string): string {
  const n = dayNumber(day) - dayNumber(today);
  return n <= 0 ? 'today' : n === 1 ? 'tomorrow' : `in ${n} days`;
}

/** Puts the items in an order where, as far as possible, no two in a row come from the same lesson. */
export function spreadLessons(items: Item[]): Item[] {
  const left = [...items];
  const out: Item[] = [];
  while (left.length) {
    const i = left.findIndex((it) => it.lessonId !== out[out.length - 1]?.lessonId);
    out.push(...left.splice(i < 0 ? 0 : i, 1));
  }
  return out;
}

/** Today's review: the due questions first (most overdue first), then, to make up `n`, ones not yet in the queue. */
export function pickReview(queue: Queue, bank: Item[], today: string, n = 5): Item[] {
  const byKey = new Map(bank.map((it) => [it.key, it]));
  const due = dueEntries(queue, today).map((e) => byKey.get(e.key)).filter((x): x is Item => !!x).slice(0, n);
  const fresh = bank.filter((it) => !queue[it.key]).slice(-Math.max(0, n - due.length));
  return spreadLessons([...due, ...(due.length < n ? fresh : [])].slice(0, n));
}

/** Questions whose last answer was not right first time, the most recent lessons' last, up to `n`. */
export function mistakes(queue: Queue, bank: Item[], n = 8): Item[] {
  return spreadLessons(bank.filter((it) => queue[it.key] && queue[it.key].last !== 'independent').slice(0, n));
}

/** The last outcome of each question, for the specification status. */
export function lastOutcomes(queue: Queue): Record<string, Outcome> {
  return Object.fromEntries(Object.values(queue).map((e) => [e.key, e.last]));
}
