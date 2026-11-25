// Today's review on Home as one quiet row: how many questions are due, and a tap to start. Without questions due it
// only says why (nothing finished yet, or all caught up). The fuller card is on the Revise tab.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { uiIcon } from '@/art/uiIcons';
import { useTheme } from '@/theme/ThemeContext';
import { font } from '@/theme/tokens';
import { Art } from '@/ui/Art';

type Props = { due: number; minutes: number; next?: string | null; empty: boolean; onStart: () => void };

export function ReviewRow({ due, minutes, next, empty, onStart }: Props) {
  const { palette: p } = useTheme();
  const open = !empty && due > 0;
  const title = open ? `Review today · ${due} ${due === 1 ? 'question' : 'questions'}` : empty ? 'Review opens after your first lesson' : 'Review: all caught up';
  const sub = open ? `About ${minutes} min` : empty ? 'Its questions come back here to keep them fresh' : next ? `Next: ${next}` : undefined;
  return (
    <Pressable
      accessibilityRole={open ? 'button' : 'text'}
      accessibilityLabel={sub ? `${title}. ${sub}` : title}
      disabled={!open}
      onPress={onStart}
      style={({ pressed }) => [styles.row, { borderColor: p.line, opacity: pressed ? 0.7 : 1 }]}
    >
      <Art xml={uiIcon('practice')} width={26} color={open ? p.ink : p.muted} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: open ? p.ink : p.muted }]}>{title}</Text>
        {sub && <Text style={[styles.sub, { color: p.muted }]}>{sub}</Text>}
      </View>
      {open && <Art xml={uiIcon('forward')} width={20} color={p.muted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 64, borderWidth: 2, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10 },
  title: { fontFamily: font.bodySemi, fontSize: 16, lineHeight: 21 },
  sub: { fontFamily: font.body, fontSize: 14, lineHeight: 19, marginTop: 1 },
});
