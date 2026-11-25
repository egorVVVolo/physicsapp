// Me: momentum, stamps and the specification. A stub until the Me screen (task F5); Settings lives here already.
import { TabStub } from '@/ui/TabStub';

export default function Me() {
  return <TabStub title="Me" note="Your momentum, stamps and progress on the specification will live here." rows={[{ label: 'Settings', icon: 'settings', to: '/settings' }]} />;
}
