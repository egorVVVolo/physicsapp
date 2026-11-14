// Progress is kept on the device (in the browser: localStorage). The only file that touches storage.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lesson } from '@/content/types';
import { parseProgress, type LessonState, type SavedProgress } from './logic';
import { addDay, dayKey, emptyStreak, parseStreak, type Streak } from './streak';

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
