// The four tabs. The lesson, the notebook, Settings and the galleries are in the root stack above them.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { skipLaunch } from '@/map/Launch';
import { loadFinishedLessons, loadProfile } from '@/session/storage';
import { useTheme } from '@/theme/ThemeContext';
import { TabBar } from '@/ui/TabBar';

export default function TabsLayout() {
  const { palette: p } = useTheme();
  // the first launch goes to onboarding (someone who already finished a lesson has been here before)
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  useEffect(() => {
    Promise.all([loadProfile(), loadFinishedLessons()]).then(([profile, finished]) => setOnboarded(profile.onboarded || finished.size > 0));
  }, []);
  if (onboarded === null) return <View style={{ flex: 1, backgroundColor: p.page }} />;
  if (!onboarded) {
    skipLaunch();
    return <Redirect href="/welcome" />;
  }
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: p.page } }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn' }} />
      <Tabs.Screen name="revise" options={{ title: 'Revise' }} />
      <Tabs.Screen name="me" options={{ title: 'Me' }} />
    </Tabs>
  );
}
