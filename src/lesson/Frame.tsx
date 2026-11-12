// The layout every lesson screen shares: scrolling content, a footer with the one main button,
// and the verdict sheet sliding over the footer after Check.
// While the sheet is up, the content gets room underneath and scrolls to its end,
// so the answer cards (and the one you picked) stay visible above the sheet.
import { Children, useEffect, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Rise, useReducedMotionPref } from '@/ui/motion';

export const CONTENT_MAX = 560;

export function Frame({ children, footer, sheet, center }: { children: ReactNode; footer: ReactNode; sheet?: ReactNode; center?: boolean }) {
  const reduced = useReducedMotionPref();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [footerH, setFooterH] = useState(0);
  const [sheetH, setSheetH] = useState(0);
  // how far the sheet reaches above the footer, into the scrolling content
  const cover = sheet ? Math.max(0, sheetH - footerH) : 0;

  useEffect(() => {
    if (cover <= 0) return;
    const id = requestAnimationFrame(() => scroll.current?.scrollToEnd({ animated: !reduced }));
    return () => cancelAnimationFrame(id);
  }, [cover, reduced]);

  return (
    <View style={styles.root}>
      <ScrollView ref={scroll} style={styles.scroll} contentContainerStyle={[styles.content, center && styles.center, { paddingBottom: 40 + cover }]} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          {/* the blocks of a screen rise in one after another (a block added later rises when it appears) */}
          {Children.map(children, (child, i) => (child ? <Rise delay={90 + i * 80}>{child}</Rise> : null))}
        </View>
      </ScrollView>
      <View style={styles.footer} onLayout={(e) => setFooterH(e.nativeEvent.layout.height)}>
        <View style={styles.column}>{footer}</View>
      </View>
      {sheet ? (
        <View style={styles.sheetLayer} pointerEvents="box-none">
          <View style={styles.column} onLayout={(e) => setSheetH(e.nativeEvent.layout.height)}>
            {sheet}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, flexGrow: 1 },
  center: { justifyContent: 'center' },
  column: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center', gap: 20 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  sheetLayer: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, justifyContent: 'flex-end' },
});
