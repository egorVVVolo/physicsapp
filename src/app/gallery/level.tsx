// A hidden page for the owner: the Level complete screen for any level, without playing a level through.
// Open /gallery/level?level=forces (motion, forces, momentum-moments, energy, fluids, materials) in the web version.
// Nothing in the app links here, and nothing is saved.
import { router, useLocalSearchParams } from 'expo-router';
import { course } from '@/content/course';
import { LevelComplete } from '@/lesson/LevelComplete';
import type { LevelFinish } from '@/session/levels';

export default function LevelGallery() {
  const { level } = useLocalSearchParams<{ level?: string }>();
  const at = Math.max(0, course.levels.findIndex((l) => l.id === level));
  const lv = course.levels[at];
  const after = course.levels[at + 1];
  const finish: LevelFinish = {
    levelId: lv.id,
    title: lv.title,
    number: at + 1,
    lessons: lv.lessons.length,
    gold: Math.max(0, lv.lessons.length - 1),
    next: after ? { levelId: after.id, title: after.title, firstLessonId: after.lessons[0].id } : null,
  };
  return <LevelComplete key={lv.id} finish={finish} onNext={() => router.replace(`/lesson/${after?.lessons[0].id}`)} onDone={() => router.replace('/')} />;
}
