// The layout every lesson screen shares: the figure sheet on top, then scrolling content, a footer with
// the one main button, and the verdict sheet sliding over the footer after Check.
// While the sheet is up, the content gets room underneath and scrolls to its end,
// so the answer cards (and the one you picked) stay visible above the sheet.
// The figure always comes first, so when the next screen shows the same kind of figure its sheet is exactly
// where it was: it stays (gliding back if the screen was scrolled) and only the text and the button move in.
import { Children, useContext, useEffect, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LessonFigs, SharedSheet } from '@/figures/anim';
import { Glide, Rise, ScreenEnter, useReducedMotionPref } from '@/ui/motion';

export const CONTENT_MAX = 560;

type Props = { children: ReactNode; footer: ReactNode; sheet?: ReactNode; center?: boolean; fig?: ReactNode };

export function Frame({ children, footer, sheet, center, fig }: Props) {
  const reduced = useReducedMotionPref();
  const memory = useContext(LessonFigs);
  const shared = useContext(SharedSheet);
  const kept = !!fig && shared !== null; // the sheet stays from the screen before
  const first = fig ? 1 : 0; // blocks after the figure rise a step later
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [footerH, setFooterH] = useState(0);
  const [sheetH, setSheetH] = useState(0);
  // how far the sheet reaches above the footer, into the scrolling content
  const cover = sheet ? Math.max(0, sheetH - footerH) : 0;

  // a new screen starts at the top
  useEffect(() => {
    if (memory) memory.scrollY = 0;
  }, [memory]);

  useEffect(() => {
    if (cover <= 0) return;
    const id = requestAnimationFrame(() => scroll.current?.scrollToEnd({ animated: !reduced }));
    return () => cancelAnimationFrame(id);
  }, [cover, reduced]);

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scroll}
        style={styles.scroll}
        contentContainerStyle={[styles.content, center && styles.center, { paddingBottom: 40 + cover }]}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={32}
        onScroll={(e) => {
          if (memory) memory.scrollY = e.nativeEvent.contentOffset.y;
        }}
      >
        <View style={styles.column}>
          {fig ? kept ? <Glide fromY={shared?.fromY ?? 0}>{fig}</Glide> : <Rise delay={90}>{fig}</Rise> : null}
          {/* the blocks of a screen rise in one after another (a block added later rises when it appears) */}
          <ScreenEnter still={!kept} style={styles.blocks}>
            {Children.map(children, (child, i) => (child ? <Rise delay={90 + (i + first) * 80}>{child}</Rise> : null))}
          </ScreenEnter>
        </View>
      </ScrollView>
      <View style={styles.footer} onLayout={(e) => setFooterH(e.nativeEvent.layout.height)}>
        <ScreenEnter still={!kept} style={styles.column}>
          {footer}
        </ScreenEnter>
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
  blocks: { gap: 20 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  sheetLayer: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, justifyContent: 'flex-end' },
});
