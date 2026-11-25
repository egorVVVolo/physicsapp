// Home: what to do today. A stub until the Home screen (task F2). The launch animation plays here, once per app start.
import { View } from 'react-native';
import { Launch } from '@/map/Launch';
import { TabStub } from '@/ui/TabStub';

export default function Home() {
  return (
    <View style={{ flex: 1 }}>
      <TabStub title="Home" note="Your day: the next lesson, review and progress will live here." />
      <Launch target={() => undefined} />
    </View>
  );
}
