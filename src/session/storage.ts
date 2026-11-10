// Progress is kept on the device (in the browser: localStorage). The only file that touches storage.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@/content/types';
import { parseProgress, type SavedProgress, type SessionState, type Survey } from './logic';

const key = (lessonId: string, sessionId: string) => `progress/v1/${lessonId}/${sessionId}`;

export async function loadProgress(lessonId: string, session: Session): Promise<SavedProgress | null> {
  try {
    return parseProgress(await AsyncStorage.getItem(key(lessonId, session.id)), lessonId, session);
  } catch {
    return null; // storage unavailable (for example a private browser window): just start fresh
  }
}

export async function saveProgress(lessonId: string, sessionId: string, state: SessionState, survey: Survey): Promise<void> {
  const data: SavedProgress = { v: 1, lessonId, sessionId, state, survey, updatedAt: Date.now() };
  try {
    await AsyncStorage.setItem(key(lessonId, sessionId), JSON.stringify(data));
  } catch {
    // nothing to do: the session still works, it just will not resume
  }
}

export async function clearProgress(lessonId: string, sessionId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key(lessonId, sessionId));
  } catch {}
}
