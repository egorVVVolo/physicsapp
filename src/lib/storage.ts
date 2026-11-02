import AsyncStorage from '@react-native-async-storage/async-storage';

// Tiny key-value store for progress. Falls back to memory if the device storage is unavailable,
// so the app never breaks because of it (progress just will not survive a restart).
const memory = new Map<string, string>();

export async function loadJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw != null) return JSON.parse(raw) as T;
  } catch {
    // fall through to memory
  }
  const raw = memory.get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function saveJson(key: string, value: unknown): Promise<void> {
  const raw = JSON.stringify(value);
  memory.set(key, raw);
  try {
    await AsyncStorage.setItem(key, raw);
  } catch {
    // memory copy is kept
  }
}

export async function removeKey(key: string): Promise<void> {
  memory.delete(key);
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}
