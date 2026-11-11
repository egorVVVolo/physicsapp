// Progress is kept on the device (in the browser: localStorage). The only file that touches storage.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lesson } from '@/content/types';
import { parseProgress, type LessonState, type SavedProgress } from './logic';

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
