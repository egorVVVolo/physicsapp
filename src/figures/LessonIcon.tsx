// The raised tile with a lesson's icon that hovers above the next lesson on the map.
// The drawing itself lives in src/art/lessonIcons.ts (one icon per lesson).
import { lessonTile } from '@/art/lessonIcons';
import type { LevelColor } from '@/theme/tokens';
import { Art } from '@/ui/Art';

export function LessonTile({ lessonId, levelId, color, size = 60 }: { lessonId: string; levelId: string; color: LevelColor; size?: number }) {
  return <Art xml={lessonTile(lessonId, levelId, color)} width={size} />;
}
