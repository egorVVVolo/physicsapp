// The colour of a lesson is the colour of its level on the map.
import { levelIdOf } from '@/content/course';
import { courseBlue, levelColors, type LevelColor } from './tokens';

export { mix, themed } from './themed';

export const colorOfLesson = (lessonId: string): LevelColor => levelColors[levelIdOf(lessonId)] ?? courseBlue;
