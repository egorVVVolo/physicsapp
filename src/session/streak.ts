// The day streak ("days of momentum"), as plain logic: no React, no storage (src/session/storage.ts keeps it).
// A day counts when a lesson was finished on it. A missed day ends the run; the longest run is remembered.
// Dates are local calendar days 'YYYY-MM-DD'; arithmetic between them is done on calendar numbers, so
// time zones and daylight-saving changes cannot shift a day.

/** Days with at least one finished lesson, as local dates 'YYYY-MM-DD', oldest first, no repeats. */
export type Streak = { days: string[] };
export const emptyStreak: Streak = { days: [] };

const KEEP = 400;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** The local calendar date of a moment, 'YYYY-MM-DD' (not the UTC date). */
export function dayKey(d: Date): string {
  const two = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
}

/** Days since 1970-01-01 for a 'YYYY-MM-DD' calendar date. */
function dayNumber(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

/** Adds `today` once; keeps the days sorted and only the last 400. */
export function addDay(s: Streak, today: string): Streak {
  if (s.days.includes(today)) return s;
  return { days: [...s.days, today].sort().slice(-KEEP) };
}

/** count: days in a row ending today or yesterday (0 if the last day is older). spinning: today is in. */
export function currentRun(s: Streak, today: string): { count: number; spinning: boolean } {
  const n = s.days.length;
  if (n === 0) return { count: 0, spinning: false };
  const last = dayNumber(s.days[n - 1]);
  const now = dayNumber(today);
  if (now - last > 1) return { count: 0, spinning: false };
  let count = 1;
  for (let i = n - 1; i > 0 && dayNumber(s.days[i]) - dayNumber(s.days[i - 1]) === 1; i--) count++;
  return { count, spinning: last === now };
}

/** The longest run of days in a row in the whole history. */
export function longestRun(s: Streak): number {
  let best = 0;
  let run = 0;
  s.days.forEach((d, i) => {
    run = i > 0 && dayNumber(d) - dayNumber(s.days[i - 1]) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  });
  return best;
}

/** Reads a saved streak; anything broken reads as empty, stray entries are dropped. */
export function parseStreak(json: string | null): Streak {
  if (!json) return emptyStreak;
  try {
    const p = JSON.parse(json) as { days?: unknown };
    if (!Array.isArray(p.days)) return emptyStreak;
    const days = p.days.filter((d): d is string => typeof d === 'string' && DAY.test(d));
    return { days: [...new Set(days)].sort().slice(-KEEP) };
  } catch {
    return emptyStreak;
  }
}
