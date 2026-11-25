// Learn: first the courses, then the map of the one you open. The last course opened is remembered, so Learn comes
// back to its map ("Courses" at the top goes back to the list). /learn?level=<id> opens the Mechanics and Materials map.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MECHANICS_ID, courses } from '@/content/courses';
import { CourseMap } from '@/map/CourseMap';
import { CoursePicker } from '@/map/CoursePicker';
import { loadCourseId, saveCourseId } from '@/session/storage';
import { useTheme } from '@/theme/ThemeContext';
import { ScreenEnter } from '@/ui/motion';

type View_ = 'loading' | 'courses' | string;

export default function Learn() {
  const { palette: p } = useTheme();
  const { level } = useLocalSearchParams<{ level?: string }>();
  const [view, setView] = useState<View_>('loading');
  const [moved, setMoved] = useState(false); // after the first change the screens slide; the first one is just there
  useEffect(() => {
    loadCourseId().then((id) => setView((v) => (v !== 'loading' ? v : id && courses.some((c) => c.id === id && c.ready) ? id : 'courses')));
  }, []);
  // opened from a level bar elsewhere: straight to the map
  useEffect(() => {
    if (level) setView(MECHANICS_ID);
  }, [level]);

  if (view === 'loading') return <View style={{ flex: 1, backgroundColor: p.page }} />;
  if (view === 'courses') {
    return (
      <ScreenEnter key="courses" still={!moved} from={-28}>
        <CoursePicker
          onOpen={(id) => {
            saveCourseId(id);
            setMoved(true);
            setView(id);
          }}
        />
      </ScreenEnter>
    );
  }
  return (
    <ScreenEnter key={view} still={!moved}>
      <CourseMap
        onBack={() => {
          setMoved(true);
          setView('courses');
        }}
      />
    </ScreenEnter>
  );
}
