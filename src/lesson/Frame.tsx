// The layout every lesson screen shares: scrolling content, a footer with the one main button,
// and the verdict sheet sliding over the footer after Check.
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export const CONTENT_MAX = 560;

export function Frame({ children, footer, sheet, center }: { children: ReactNode; footer: ReactNode; sheet?: ReactNode; center?: boolean }) {
  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, center && styles.center]} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>{children}</View>
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.column}>{footer}</View>
      </View>
      {sheet ? <View style={styles.sheetLayer} pointerEvents="box-none"><View style={[styles.column, { flex: 1 }]} pointerEvents="box-none">{sheet}</View></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, flexGrow: 1 },
  center: { justifyContent: 'center' },
  column: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center', gap: 20 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  sheetLayer: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, justifyContent: 'flex-end' },
});
