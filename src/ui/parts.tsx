// Shared pieces: icons, the main button (dark pill with a bottom lip), answer cards, the verdict sheet.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { font, LIP, palette as lightPalette, radius, reward, touch } from '@/theme/tokens';
import { feedback } from './feedback';
import { Pop, Shake, Sparks, useReducedMotionPref } from './motion';

const lightInk = lightPalette.ink; // ink on the white button, the same in both themes

const nativeDriver = Platform.OS !== 'web';

export { useReducedMotionPref };

// ── Icons ────────────────────────────────────────────────────────────────────────────────

export function Mark({ kind, color, size = 16 }: { kind: 'ok' | 'bad'; color: string; size?: number }) {
  const d = kind === 'ok' ? 'M3 8.5l3.2 3.2L13 4.6' : 'M4 4l8 8M12 4l-8 8';
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path d={d} stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CloseIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path d="M3 3l10 10M13 3L3 13" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

/** The small square badge in the corner of a right or wrong card. */
function CornerBadge({ kind, color }: { kind: 'ok' | 'bad'; color: string }) {
  return (
    <View style={styles.badge} pointerEvents="none">
      {kind === 'ok' && <Sparks color={reward.face} size={70} />}
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Rect x={0} y={0} width={24} height={24} rx={6} fill={color} />
        <Path d={kind === 'ok' ? 'M6.5 12.5l3.5 3.5 7.5-8' : 'M7.5 7.5l9 9M16.5 7.5l-9 9'} stroke="#FFFFFF" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

// ── The main button ──────────────────────────────────────────────────────────────────────

/** white: the one button on a screen filled with a level colour (the Skill check splash). */
export type Tone = 'primary' | 'ok' | 'level' | 'white';

/** The one main button per screen: a pill with a darker lip underneath that it presses into. */
export function MainButton({ label, onPress, disabled, tone = 'primary', color }: { label: string; onPress?: () => void; disabled?: boolean; tone?: Tone; color?: { main: string; lip: string } }) {
  const { palette: p } = useTheme();
  const main = disabled ? p.disabled : tone === 'white' ? '#FFFFFF' : tone === 'ok' ? p.ok : tone === 'level' && color ? color.main : p.primary;
  const lip = disabled ? p.disabledLip : tone === 'white' ? 'rgba(0,0,0,0.22)' : tone === 'ok' ? p.okLip : tone === 'level' && color ? color.lip : p.primaryLip;
  // the white button keeps dark ink and a level-coloured one keeps white text in both themes
  const ink = disabled ? p.onDisabled : tone === 'white' ? lightInk : tone === 'level' && color ? '#FFFFFF' : p.onPrimary;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled || !onPress} onPress={onPress} style={[styles.buttonWrap, { backgroundColor: lip }]}>
      {({ pressed }) => (
        <View style={[styles.button, { backgroundColor: main, transform: [{ translateY: pressed ? LIP : 0 }] }]}>
          <Text style={[styles.buttonText, { color: ink }]} maxFontSizeMultiplier={1.3}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/** A small secondary pill ("Why?", "Try again" on a sheet). */
export function PillButton({ label, onPress, color, bg }: { label: string; onPress: () => void; color: string; bg: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={6} style={({ pressed }) => [styles.pill, { backgroundColor: bg, opacity: pressed ? 0.75 : 1 }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </Pressable>
  );
}

// ── Answer cards ─────────────────────────────────────────────────────────────────────────

export type CardState = 'idle' | 'selected' | 'right' | 'wrong' | 'dim';

/** One answer card. Right and wrong get a corner badge and words for screen readers, never colour alone. */
export function OptionCard({ label, state, onPress, disabled, compact }: { label: string; state: CardState; onPress: () => void; disabled?: boolean; compact?: boolean }) {
  const { palette: p } = useTheme();

  const border = state === 'selected' ? p.select : state === 'right' ? p.ok : state === 'wrong' ? p.bad : p.line;
  const bg = state === 'right' ? p.okBg : state === 'wrong' ? p.badBg : state === 'selected' ? p.selectBg : p.page;
  const color = state === 'right' ? p.okText : state === 'wrong' ? p.badText : state === 'dim' ? p.faint : p.ink;
  const said = state === 'right' ? ', correct' : state === 'wrong' ? ', incorrect' : '';
  return (
    <Shake trigger={state === 'wrong'} style={compact && { flex: 1 }}>
      <Pop trigger={state === 'right'} style={compact && { flex: 1 }}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ checked: state === 'selected', disabled }}
        accessibilityLabel={label + said}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          compact && styles.cardCompact,
          { borderColor: border, backgroundColor: pressed && state === 'idle' ? p.selectBg : bg, borderBottomWidth: state === 'selected' ? 2 + LIP : 2 },
        ]}
      >
        <Text style={[styles.cardText, compact && { textAlign: 'center' }, { color }]} maxFontSizeMultiplier={1.3}>
          {label}
        </Text>
      </Pressable>
      {(state === 'right' || state === 'wrong') && <CornerBadge kind={state === 'right' ? 'ok' : 'bad'} color={state === 'right' ? p.ok : p.bad} />}
      </Pop>
    </Shake>
  );
}

export function OptionList({ children, grid }: { children: ReactNode; grid?: boolean }) {
  return (
    <View style={grid ? styles.grid : styles.list} accessibilityRole="radiogroup">
      {children}
    </View>
  );
}

// ── Verdict sheet ────────────────────────────────────────────────────────────────────────

export type Verdict = { tone: 'ok' | 'bad'; title: string; text?: string; why?: string };

/**
 * Slides up from the bottom after Check. Green: "Correct!" with Why? and Continue.
 * Red: "Not quite" with a hint and Try again, or the shown answer with Why? and Continue.
 */
export function VerdictSheet({ verdict, button }: { verdict: Verdict; button: { label: string; onPress: () => void } }) {
  const { palette: p } = useTheme();
  const reduced = useReducedMotionPref();
  const [whyOpen, setWhyOpen] = useState(false);
  const y = useRef(new Animated.Value(90)).current;
  // a new verdict (not a re-render of the same one) slides in again and closes "Why?"
  const said = `${verdict.tone}|${verdict.title}|${verdict.text ?? ''}`;
  useEffect(() => {
    setWhyOpen(false);
    AccessibilityInfo.announceForAccessibility(`${verdict.title}. ${verdict.text ?? ''}`);
    if (reduced) return y.setValue(0);
    y.setValue(90);
    Animated.spring(y, { toValue: 0, damping: 16, stiffness: 210, mass: 0.9, useNativeDriver: nativeDriver }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [said, reduced, y]);

  const ok = verdict.tone === 'ok';
  const bg = ok ? p.okBg : p.badBg;
  const text = ok ? p.okText : p.badText;
  return (
    <Animated.View style={[styles.sheet, { backgroundColor: bg, transform: [{ translateY: y }] }]}>
      <View style={styles.sheetHead}>
        <View style={styles.sheetTitleRow}>
          <View>
            {ok && <Sparks key={said} color={reward.face} size={56} />}
            <Mark kind={ok ? 'ok' : 'bad'} color={ok ? p.ok : p.bad} size={20} />
          </View>
          <Text style={[styles.sheetTitle, { color: p.ink }]} accessibilityRole="header">
            {verdict.title}
          </Text>
        </View>
        {verdict.why && !whyOpen && (
          <PillButton
            label="Why?"
            onPress={() => {
              feedback.reveal();
              setWhyOpen(true);
            }}
            color={p.ink}
            bg={p.pillBg}
          />
        )}
      </View>
      {verdict.text ? <Text style={[styles.sheetText, { color: text }]}>{verdict.text}</Text> : null}
      {whyOpen && verdict.why ? <Text style={[styles.sheetText, { color: text }]}>{verdict.why}</Text> : null}
      <View style={{ marginTop: 12 }}>
        <MainButton label={button.label} onPress={button.onPress} tone={ok ? 'ok' : 'primary'} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonWrap: { borderRadius: radius.pill, paddingBottom: LIP, alignSelf: 'stretch' },
  button: { minHeight: 54, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  buttonText: { fontSize: 18, fontFamily: font.displaySemi, letterSpacing: 0.2 },
  pill: { minHeight: touch, paddingHorizontal: 18, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  pillText: { fontSize: 16, fontFamily: font.displaySemi },
  list: { gap: 10, alignSelf: 'stretch' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignSelf: 'stretch' },
  card: { borderWidth: 2, borderRadius: radius.m, minHeight: 58, paddingHorizontal: 18, paddingVertical: 14, justifyContent: 'center' },
  cardCompact: { paddingHorizontal: 10, alignItems: 'center' },
  cardText: { fontSize: 17, lineHeight: 23, fontFamily: font.bodyMedium },
  badge: { position: 'absolute', top: -8, right: -8 },
  sheet: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: touch },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  sheetTitle: { fontSize: 22, fontFamily: font.display },
  sheetText: { fontSize: 16, lineHeight: 23, fontFamily: font.bodyMedium, marginTop: 8 },
});
