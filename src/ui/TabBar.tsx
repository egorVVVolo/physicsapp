// The bottom bar of the four tabs: Home · Learn · Revise · Me. A thin line on top, an icon and a word per tab; the
// active one is in ink with a dot under it in the colour of the level of the next lesson, the rest are muted.
// It does not bounce: the change is instant. Lessons and the other full screens open over it, without the bar.
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { uiIcon, type UiIconName } from '@/art/uiIcons';
import { course, levelIdOf } from '@/content/course';
import { loadFinishedLessons } from '@/session/storage';
import { useTheme } from '@/theme/ThemeContext';
import { font, levelColors } from '@/theme/tokens';
import { Art } from '@/ui/Art';

/** The tabs in order: the route name, the word under the icon and the icon. */
export const TABS: { name: string; label: string; icon: UiIconName }[] = [
  { name: 'index', label: 'Home', icon: 'home' },
  { name: 'learn', label: 'Learn', icon: 'learn' },
  { name: 'revise', label: 'Revise', icon: 'practice' },
  { name: 'me', label: 'Me', icon: 'user' },
];

export const TAB_BAR_HEIGHT = 56;

const ready = course.levels.flatMap((l) => l.lessons).filter((r) => r.ready);

export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { palette: p, level } = useTheme();
  const insets = useSafeAreaInsets();
  // the level of the next lesson to do: the dot under the active tab
  const [levelId, setLevelId] = useState(course.levels[0].id);
  useEffect(() => {
    let alive = true;
    loadFinishedLessons().then((done) => {
      const next = ready.find((r) => !done.has(r.id)) ?? ready[ready.length - 1];
      if (alive && next) setLevelId(levelIdOf(next.id));
    });
    return () => {
      alive = false;
    };
  }, [state.index]);
  const dot = level(levelColors[levelId]).main;

  return (
    <View accessibilityRole="tablist" style={[styles.bar, { backgroundColor: p.page, borderTopColor: p.line, height: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]}>
      {state.routes.map((route, i) => {
        const tab = TABS.find((t) => t.name === route.name);
        if (!tab) return null;
        const selected = state.index === i;
        const press = () => {
          const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!selected && !event.defaultPrevented) navigateToTab(route.key);
        };
        return (
          <Pressable key={route.key} accessibilityRole="tab" accessibilityLabel={tab.label} accessibilityState={{ selected }} onPress={press} style={styles.tab}>
            <Art xml={uiIcon(tab.icon)} width={24} color={selected ? p.ink : p.muted} />
            <Text style={[styles.label, { color: selected ? p.ink : p.muted }]} maxFontSizeMultiplier={1.2}>
              {tab.label}
            </Text>
            <View style={[styles.dot, { backgroundColor: selected ? dot : 'transparent' }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: 1 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, minHeight: 44 },
  label: { fontFamily: font.displaySemi, fontSize: 12, lineHeight: 15 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
});
