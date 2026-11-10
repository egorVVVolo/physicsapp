// Small pieces the step screens, the start screen and the wrap-up share:
// answer cards, the feedback line, arrow glyphs, status marks, the one main button, the dark/light page layout.
import { Children, useEffect, useRef, type ReactNode } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { radius } from '@/theme/tokens';

/** ok: true = right, false = wrong, null = a neutral note. Same shape as the build state machine's Verdict. */
export type FeedbackVerdict = { ok: boolean | null; text: string };

// ── Drawn glyphs ─────────────────────────────────────────────────────────────────────────

/** A vertical arrow (up or down) or a dot (zero). Drawn, not a text character, so it is the same everywhere. */
export function ArrowGlyph({ kind, color, size = 28 }: { kind: 'up' | 'down' | 'dot'; color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28">
      {kind === 'dot' ? (
        <Circle cx={14} cy={14} r={5} fill={color} />
      ) : (
        <Path
          d={kind === 'up' ? 'M14 25V4M5.5 13L14 4l8.5 9' : 'M14 3v21M5.5 15L14 24l8.5-9'}
          stroke={color}
          strokeWidth={3.4}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
}

/** A small mark: check, cross or "try again" arrow. Always paired with words for screen readers. */
export function Mark({ kind, color, size = 16 }: { kind: 'ok' | 'bad' | 'redo'; color: string; size?: number }) {
  const d = kind === 'ok' ? 'M3 8.5l3.2 3.2L13 4.6' : kind === 'bad' ? 'M3.5 3.5l9 9M12.5 3.5l-9 9' : 'M3.2 8a4.8 4.8 0 1 0 1.5-3.5M3 2.2v3.2h3.2';
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path d={d} stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** The close "x" used on dark headers. */
export function CloseIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path d="M3 3l10 10M13 3L3 13" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

// ── Answer cards ─────────────────────────────────────────────────────────────────────────

export type ChoiceState = 'idle' | 'selected' | 'right' | 'wrong' | 'dim';

type ChoiceProps = {
  label: string;
  state: ChoiceState;
  disabled?: boolean;
  onPress: () => void;
  /** A drawn glyph above the label. It receives the colour that fits the card's state. */
  glyph?: (color: string) => ReactNode;
  minHeight?: number;
};

/**
 * One big answer card. Right and wrong are shown with an icon and a border, and read out in words
 * for screen readers, never by colour alone. A wrong card shakes once, lightly.
 */
export function Choice({ label, state, disabled, onPress, glyph, minHeight = 56 }: ChoiceProps) {
  const { palette: p } = useTheme();
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state !== 'wrong') return;
    const step = (to: number) => Animated.timing(shake, { toValue: to, duration: 55, useNativeDriver: Platform.OS !== 'web' });
    Animated.sequence([step(-6), step(6), step(-4), step(3), step(0)]).start();
  }, [state, shake]);

  const border = state === 'right' ? p.ok : state === 'wrong' ? p.bad : state === 'selected' ? p.ink : p.line;
  const tint = state === 'right' ? p.okBg : state === 'wrong' ? p.badBg : p.card;
  const text = state === 'dim' ? p.muted : p.ink;
  const glyphColor = state === 'selected' ? p.velText : state === 'right' ? p.ok : state === 'wrong' ? p.bad : state === 'dim' ? p.muted : p.ink;
  const result = state === 'right' ? ', correct' : state === 'wrong' ? ', incorrect' : '';

  return (
    <Animated.View style={[styles.choiceWrap, { transform: [{ translateX: shake }] }]}>
      <Pressable
        accessibilityRole="radio"
        accessibilityLabel={label + result}
        accessibilityState={{ checked: state === 'selected' || state === 'right', disabled: !!disabled }}
        disabled={disabled}
        onPress={onPress}
        style={[styles.choice, { minHeight, borderColor: border, borderWidth: state === 'selected' ? 2.5 : 1.5, backgroundColor: tint, opacity: state === 'dim' ? 0.7 : 1 }]}
      >
        {glyph ? <View style={styles.glyph}>{glyph(glyphColor)}</View> : null}
        <Text style={[styles.choiceText, { color: text }]} maxFontSizeMultiplier={1.2} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
          {label}
        </Text>
        {state === 'right' || state === 'wrong' ? (
          <View style={styles.corner}>
            <Mark kind={state === 'right' ? 'ok' : 'bad'} color={state === 'right' ? p.ok : p.bad} size={16} />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

/** A group of cards laid out in a grid of `columns` (default: all in one row). Exactly one can be selected. */
export function ChoiceRow({ children, columns }: { children: ReactNode; columns?: number }) {
  const items = Children.toArray(children);
  const cols = Math.max(1, columns ?? items.length);
  const rows: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));
  return (
    <View style={styles.group} accessibilityRole="radiogroup">
      {rows.map((row, i) => (
        <View key={i} style={styles.row}>
          {row}
          {/* empty spacers keep the last row's cards the same width as the rest */}
          {Array.from({ length: cols - row.length }, (_, k) => (
            <View key={`spacer${k}`} style={styles.choiceWrap} />
          ))}
        </View>
      ))}
    </View>
  );
}

// ── Feedback ─────────────────────────────────────────────────────────────────────────────

/** One line of feedback: a round icon, then the sentence. `reserve` keeps the space when there is nothing to say, so nothing jumps. */
export function FeedbackRow({ verdict, reserve }: { verdict: FeedbackVerdict | null; reserve?: boolean }) {
  const { palette: p } = useTheme();
  if (!verdict) return reserve ? <View style={styles.feedback} accessibilityLiveRegion="polite" /> : null;
  const ok = verdict.ok;
  return (
    <View
      style={styles.feedback}
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={(ok === true ? 'Correct. ' : ok === false ? 'Incorrect. ' : '') + verdict.text}
    >
      {ok !== null && (
        <View style={[styles.round, { backgroundColor: ok ? p.okBg : p.badBg }]}>
          <Mark kind={ok ? 'ok' : 'bad'} color={ok ? p.ok : p.bad} size={ok ? 16 : 14} />
        </View>
      )}
      <Text style={[styles.feedbackText, { color: p.ink }]} maxFontSizeMultiplier={1.3}>
        {verdict.text}
      </Text>
    </View>
  );
}

// ── Main button and page layout ──────────────────────────────────────────────────────────

/** The one main button of a light screen (the step screens get theirs from StageScreen). */
export function PrimaryButton({ label, disabled, onPress }: { label: string; disabled?: boolean; onPress: () => void }) {
  const { palette: p } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.primary, { backgroundColor: disabled ? p.disabled : p.primary }]}
    >
      <Text style={[styles.primaryText, { color: disabled ? p.onDisabled : p.onPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const SHEET_OVERLAP = 18;

/**
 * A page in the app's two-tone look: a dark stage on top, a light sheet with rounded top corners below,
 * overlapping the stage a little. `grow` says which part takes the free space.
 */
export function StageSheetLayout({ stage, children, grow }: { stage: ReactNode; children: ReactNode; grow: 'stage' | 'sheet' }) {
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.page, { backgroundColor: p.stage }]}>
      <SafeAreaView edges={['top']} style={[grow === 'stage' ? styles.fill : null, { backgroundColor: p.stage, paddingBottom: SHEET_OVERLAP + 6 }]}>
        {stage}
      </SafeAreaView>
      <View
        style={[
          styles.sheet,
          grow === 'sheet' ? styles.fill : null,
          { backgroundColor: p.sheet, marginTop: -SHEET_OVERLAP, paddingBottom: Math.max(insets.bottom, 12) + 4 },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  choiceWrap: { flex: 1 },
  choice: { flex: 1, borderRadius: radius.l, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 8, gap: 4 },
  glyph: { height: 28, alignItems: 'center', justifyContent: 'center' },
  choiceText: { fontSize: 17, fontWeight: '700', textAlign: 'center', fontVariant: ['tabular-nums'] },
  corner: { position: 'absolute', top: 6, right: 6 },
  feedback: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 4 },
  round: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  feedbackText: { flexShrink: 1, fontSize: 16, lineHeight: 22, fontWeight: '500', textAlign: 'center' },
  primary: { minHeight: 54, borderRadius: radius.l, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontSize: 17, fontWeight: '700' },
  page: { flex: 1 },
  fill: { flex: 1 },
  sheet: { borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, paddingTop: 20, paddingHorizontal: 20, gap: 12 },
});
