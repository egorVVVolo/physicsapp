// A tab that is not built yet: its title and a row for each screen that already lives elsewhere.
// Replaced by the real screens (Home, Revise, Me) in the next tasks.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { uiIcon, type UiIconName } from '@/art/uiIcons';
import { CONTENT_MAX } from '@/lesson/Frame';
import { useTheme } from '@/theme/ThemeContext';
import { font } from '@/theme/tokens';
import { Art } from '@/ui/Art';

type Row = { label: string; icon: UiIconName; to: Href };

export function TabStub({ title, note, rows = [] }: { title: string; note: string; rows?: Row[] }) {
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: p.page, paddingTop: insets.top + 16 }}>
      <View style={styles.column}>
        <Text accessibilityRole="header" style={[styles.title, { color: p.ink }]}>
          {title}
        </Text>
        <Text style={[styles.note, { color: p.muted }]}>{note}</Text>
        {rows.map((r) => (
          <Pressable key={r.label} accessibilityRole="button" onPress={() => router.push(r.to)} style={[styles.row, { borderColor: p.line }]}>
            <Art xml={uiIcon(r.icon)} width={24} color={p.ink} />
            <Text style={[styles.rowText, { color: p.ink }]}>{r.label}</Text>
            <Art xml={uiIcon('forward')} width={20} color={p.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center', paddingHorizontal: 20, gap: 16 },
  title: { fontFamily: font.display, fontSize: 30, lineHeight: 36 },
  note: { fontFamily: font.body, fontSize: 16, lineHeight: 23 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, borderBottomWidth: 1 },
  rowText: { flex: 1, fontFamily: font.bodyMedium, fontSize: 17 },
});
