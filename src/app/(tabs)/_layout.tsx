// The four tabs. The lesson, the notebook, Settings and the galleries are in the root stack above them.
import { Tabs } from 'expo-router/js-tabs';
import { useTheme } from '@/theme/ThemeContext';
import { TabBar } from '@/ui/TabBar';

export default function TabsLayout() {
  const { palette: p } = useTheme();
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: p.page } }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn' }} />
      <Tabs.Screen name="revise" options={{ title: 'Revise' }} />
      <Tabs.Screen name="me" options={{ title: 'Me' }} />
    </Tabs>
  );
}
