// Progress is kept on the device (in the browser: localStorage). The only file that touches storage.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lesson } from '@/content/types';
import { parseProgress, type LessonState, type Run, type SavedProgress } from './logic';
import { addDay, dayKey, emptyStreak, parseStreak, type Streak } from './streak';
import type { Entry, Queue } from '@/practice/review';

const key = (lessonId: string) => `progress/v2/${lessonId}`;

export async function loadProgress(lesson: Lesson): Promise<SavedProgress | null> {
  try {
    return parseProgress(await AsyncStorage.getItem(key(lesson.id)), lesson);
  } catch {
    return null; // storage unavailable (for example a private browser window): just start fresh
  }
}

export async function saveProgress(lessonId: string, state: LessonState): Promise<void> {
  const data: SavedProgress = { v: 2, lessonId, state, updatedAt: Date.now() };
  try {
    await AsyncStorage.setItem(key(lessonId), JSON.stringify(data));
  } catch {
    // nothing to do: the lesson still works, it just will not resume
  }
}

export async function clearProgress(lessonId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key(lessonId));
  } catch {}
}

const STREAK_KEY = 'streak/v1';

export async function loadStreak(): Promise<Streak> {
  try {
    return parseStreak(await AsyncStorage.getItem(STREAK_KEY));
  } catch {
    return emptyStreak;
  }
}

export async function saveStreak(s: Streak): Promise<void> {
  try {
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(s));
  } catch {}
}

/** A lesson was just finished: today counts for the streak. Returns the streak before and after. */
export async function recordFinishedDay(now = new Date()): Promise<{ before: Streak; after: Streak }> {
  const before = await loadStreak();
  const after = addDay(before, dayKey(now));
  if (after !== before) await saveStreak(after);
  return { before, after };
}

const FINISHED_KEY = 'finished/v1';

/** Lessons finished at least once. A replay clears the lesson's progress, but its notebook card stays. */
export async function loadFinishedLessons(): Promise<Set<string>> {
  try {
    const raw: unknown = JSON.parse((await AsyncStorage.getItem(FINISHED_KEY)) ?? '[]');
    return new Set(Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

/** Marks a lesson as finished; true if this is the first time ever. */
export async function addFinishedLesson(lessonId: string): Promise<boolean> {
  const done = await loadFinishedLessons();
  if (done.has(lessonId)) return false;
  done.add(lessonId);
  try {
    await AsyncStorage.setItem(FINISHED_KEY, JSON.stringify([...done]));
  } catch {}
  return true;
}

export type { Run };

const runsKey = (lessonId: string) => `runs/v1/${lessonId}`;
/** How many finished runs of each lesson are kept. */
const RUNS_KEPT = 5;

/** The lesson's finished runs, newest last. */
export async function loadRuns(lessonId: string): Promise<Run[]> {
  try {
    const raw: unknown = JSON.parse((await AsyncStorage.getItem(runsKey(lessonId))) ?? '[]');
    if (!Array.isArray(raw)) return [];
    // runs saved before exam cards have no marks
    return raw.filter((r): r is Run => typeof r === 'object' && r !== null && typeof r.at === 'number' && typeof r.ms === 'number').map((r) => ({ ...r, marks: r.marks ?? {} }));
  } catch {
    return [];
  }
}

async function saveRuns(lessonId: string, runs: Run[]): Promise<void> {
  try {
    await AsyncStorage.setItem(runsKey(lessonId), JSON.stringify(runs.slice(-RUNS_KEPT)));
  } catch {}
}

/** Keeps a finished run (only the last five per lesson). */
export async function saveRun(lessonId: string, run: Run): Promise<void> {
  await saveRuns(lessonId, [...(await loadRuns(lessonId)), run]);
}

/** How the lesson felt, given after the latest run. */
export async function setLastRunFeel(lessonId: string, feel: Run['feel']): Promise<void> {
  const runs = await loadRuns(lessonId);
  if (runs.length === 0) return;
  runs[runs.length - 1] = { ...runs[runs.length - 1], feel };
  await saveRuns(lessonId, runs);
}

const REVIEW_KEY = 'review/v1';

/** The spaced-review queue (src/practice/review.ts): question key → box, due day, last outcome. */
export async function loadReview(): Promise<Queue> {
  try {
    const raw: unknown = JSON.parse((await AsyncStorage.getItem(REVIEW_KEY)) ?? '{}');
    if (!raw || typeof raw !== 'object') return {};
    return Object.fromEntries(
      Object.entries(raw as Record<string, Entry>).filter(([, e]) => e && typeof e.due === 'string' && typeof e.box === 'number' && typeof e.last === 'string'),
    );
  } catch {
    return {};
  }
}

export async function saveReview(q: Queue): Promise<void> {
  try {
    await AsyncStorage.setItem(REVIEW_KEY, JSON.stringify(q));
  } catch {}
}

const PROFILE_KEY = 'profile/v1';

/** Who the learner is: whether onboarding is done, and the exam session they picked ('2027-05') or null. */
export type Profile = { onboarded: boolean; exam: string | null };
export const emptyProfile: Profile = { onboarded: false, exam: null };

export async function loadProfile(): Promise<Profile> {
  try {
    const raw = JSON.parse((await AsyncStorage.getItem(PROFILE_KEY)) ?? '{}') as Partial<Profile>;
    return { onboarded: raw.onboarded === true, exam: typeof raw.exam === 'string' && /^\d{4}-\d{2}$/.test(raw.exam) ? raw.exam : null };
  } catch {
    return emptyProfile;
  }
}

/** Changes part of the profile and keeps the rest. Reset progress does not touch it. */
export async function saveProfile(change: Partial<Profile>): Promise<Profile> {
  const next = { ...(await loadProfile()), ...change };
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

const PREFS_KEY = 'prefs/v1';

/** The learner's settings, kept on the device. */
export type Prefs = { mode: 'system' | 'light' | 'dark'; sound: boolean; haptics: boolean };
export const defaultPrefs: Prefs = { mode: 'system', sound: true, haptics: true };

export async function loadPrefs(): Promise<Prefs> {
  try {
    const raw = JSON.parse((await AsyncStorage.getItem(PREFS_KEY)) ?? '{}') as Partial<Prefs>;
    return {
      mode: raw.mode === 'light' || raw.mode === 'dark' ? raw.mode : 'system',
      sound: raw.sound !== false,
      haptics: raw.haptics !== false,
    };
  } catch {
    return defaultPrefs;
  }
}

/** Changes some settings and keeps the rest. */
export async function savePrefs(change: Partial<Prefs>): Promise<Prefs> {
  const next = { ...(await loadPrefs()), ...change };
  try {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

const COURSE_KEY = 'course/v1';

/** The course the learner opened last in Learn, or null before the first choice. Reset progress does not touch it. */
export async function loadCourseId(): Promise<string | null> {
  try {
    const id = await AsyncStorage.getItem(COURSE_KEY);
    return id && id.length < 60 ? id : null;
  } catch {
    return null;
  }
}

export async function saveCourseId(id: string): Promise<void> {
  try {
    await AsyncStorage.setItem(COURSE_KEY, id);
  } catch {}
}

const LEVELS_KEY = 'levels-done/v1';

/** Levels whose "Level complete" has been shown. */
export async function loadLevelsDone(): Promise<Set<string>> {
  try {
    const raw: unknown = JSON.parse((await AsyncStorage.getItem(LEVELS_KEY)) ?? '[]');
    return new Set(Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

/** Remembers that a level's celebration was shown, so a replay does not show it again. */
export async function markLevelDone(levelId: string): Promise<void> {
  const done = await loadLevelsDone();
  done.add(levelId);
  try {
    await AsyncStorage.setItem(LEVELS_KEY, JSON.stringify([...done]));
  } catch {}
}

/** Clears every lesson's progress and finished runs, the notebook cards and the day streak. Settings stay. */
export async function resetProgress(): Promise<void> {
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith('progress/') || k.startsWith('runs/') || k === FINISHED_KEY || k === STREAK_KEY || k === LEVELS_KEY || k === REVIEW_KEY);
    await AsyncStorage.multiRemove(keys);
  } catch {}
}
