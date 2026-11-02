import type { Lesson } from '../../engine/types';
import { lesson2 } from './l2';

export const lessons: Lesson[] = [lesson2];
export const findLesson = (id: string) => lessons.find((l) => l.id === id);
