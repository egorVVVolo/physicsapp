// The Unit 1 exam sessions: January, May–June and October. The learner picks one; Home counts the days to it.
// A session is kept as 'YYYY-MM' of its first month ('2027-01', '2027-05', '2027-10').
import { dayKey, dayNumber } from './streak.ts';

const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
/** The first month of each session in a year (1-based), and its name. */
const SESSIONS: { month: number; name: (y: number) => string }[] = [
  { month: 1, name: (y) => `January ${y}` },
  { month: 5, name: (y) => `May–June ${y}` },
  { month: 10, name: (y) => `October ${y}` },
];

export type Session = { key: string; name: string };

/** The three next sessions that have not started yet, from `today` on. */
export function nextSessions(today: Date): Session[] {
  const out: Session[] = [];
  for (let y = today.getFullYear(); out.length < 3; y++) {
    for (const s of SESSIONS) {
      if (out.length === 3) break;
      const start = new Date(y, s.month - 1, 1);
      if (start <= today) continue;
      out.push({ key: `${y}-${String(s.month).padStart(2, '0')}`, name: s.name(y) });
    }
  }
  return out;
}

/** The session's name in words: "May–June 2027". */
export function sessionName(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return SESSIONS.find((x) => x.month === m)?.name(y) ?? key;
}

/** The session's name for the strip: "MAY–JUNE 2027". */
export function sessionLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return m === 5 ? `MAY–JUNE ${y}` : `${MONTHS[m - 1]} ${y}`;
}

/** Whole days from `today` to the 1st of the session's first month (0 once it has started). */
export function daysToExam(key: string, today: Date): number {
  return Math.max(0, dayNumber(`${key}-01`) - dayNumber(dayKey(today)));
}

/** "EXAM · MAY–JUNE 2027 · 196 DAYS". */
export function examLine(key: string, today: Date): string {
  const n = daysToExam(key, today);
  return `EXAM · ${sessionLabel(key)} · ${n === 1 ? '1 DAY' : `${n} DAYS`}`;
}
