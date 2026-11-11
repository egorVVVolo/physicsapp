// Small shared pieces: glyphs, the chunky button, answer cards, the time line and the number tiles.
// Cards and buttons have a darker bottom lip and sink when pressed (Duolingo-style), in calm colours.
import { useEffect, useRef, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { radius, touch } from '@/theme/tokens';
import { svgFont } from '@/theme/svgFont';

// ── Glyphs ───────────────────────────────────────────────────────────────────────────────

/** A vertical arrow (up or down) or a dot (zero). Drawn, so it looks the same everywhere. */
export function ArrowGlyph({ kind, color, size = 28 }: { kind: 'up' | 'down' | 'dot'; color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28">
      {kind === 'dot' ? (
        <Circle cx={14} cy={14} r={5} fill={color} />
      ) : (
        <Path d={kind === 'up' ? 'M14 25V4M5.5 13L14 4l8.5 9' : 'M14 3v21M5.5 15L14 24l8.5-9'} stroke={color} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </Svg>
  );
}

/** A small mark: check or cross. Always paired with words for screen readers. */
export function Mark({ kind, color, size = 16 }: { kind: 'ok' | 'bad'; color: string; size?: number }) {
  const d = kind === 'ok' ? 'M3 8.5l3.2 3.2L13 4.6' : 'M3.5 3.5l9 9M12.5 3.5l-9 9';
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path d={d} stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CloseIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path d="M3 3l10 10M13 3L3 13" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

// ── The chunky button ────────────────────────────────────────────────────────────────────

export type Tone = 'primary' | 'ok' | 'bad';

/** The one main button: full width, 52 pt, a darker lip at the bottom that disappears when pressed. */
export function ChunkyButton({ label, onPress, disabled, tone = 'primary' }: { label: string; onPress?: () => void; disabled?: boolean; tone?: Tone }) {
  const { palette: p } = useTheme();
  const bg = disabled ? p.disabled : tone === 'ok' ? p.ok : tone === 'bad' ? p.bad : p.primary;
  const lip = disabled ? p.disabledLip : tone === 'ok' ? p.okLip : tone === 'bad' ? p.badLip : p.primaryLip;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderBottomColor: lip, borderBottomWidth: pressed ? 1 : 4, transform: [{ translateY: pressed ? 3 : 0 }] },
      ]}
    >
      <Text style={[styles.buttonText, { color: disabled ? p.onDisabled : p.onPrimary }]} maxFontSizeMultiplier={1.3}>
        {label}
      </Text>
    </Pressable>
  );
}

// ── Answer cards ─────────────────────────────────────────────────────────────────────────

export type CardState = 'idle' | 'selected' | 'right' | 'wrong' | 'dim';

/** One answer card. Right and wrong get an icon and words for screen readers, never colour alone. A wrong card shakes once. */
export function Card({ label, state, onPress, disabled, minHeight = 56, italic }: { label: string; state: CardState; onPress: () => void; disabled?: boolean; minHeight?: number; italic?: boolean }) {
  const { palette: p } = useTheme();
  const shake = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (state !== 'wrong') return;
    let cancelled = false;
    const step = (to: number) => Animated.timing(shake, { toValue: to, duration: 55, useNativeDriver: Platform.OS !== 'web' });
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (!cancelled && !reduced) Animated.sequence([step(-6), step(6), step(-4), step(3), step(0)]).start();
    });
    return () => {
      cancelled = true;
    };
  }, [state, shake]);

  const border = state === 'selected' ? p.select : state === 'right' ? p.ok : state === 'wrong' ? p.bad : p.line;
  const lip = state === 'selected' ? p.select : state === 'right' ? p.okLip : state === 'wrong' ? p.badLip : p.lineStrong;
  const bg = state === 'selected' ? p.selectBg : state === 'right' ? p.okBg : state === 'wrong' ? p.badBg : p.page;
  const color = state === 'right' ? p.okText : state === 'wrong' ? p.badText : state === 'dim' ? p.faint : p.ink;
  const said = state === 'right' ? ', correct' : state === 'wrong' ? ', incorrect' : '';
  return (
    <Animated.View style={{ flex: 1, transform: [{ translateX: shake }] }}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ checked: state === 'selected', disabled }}
        accessibilityLabel={label + said}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          { minHeight, borderColor: border, borderBottomColor: lip, backgroundColor: bg, borderBottomWidth: pressed ? 2 : 4, transform: [{ translateY: pressed ? 2 : 0 }] },
        ]}
      >
        {(state === 'right' || state === 'wrong') && <Mark kind={state === 'right' ? 'ok' : 'bad'} color={state === 'right' ? p.ok : p.bad} size={14} />}
        <Text style={[styles.cardText, { color, fontStyle: italic ? 'italic' : 'normal' }]} maxFontSizeMultiplier={1.25}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function CardRow({ children }: { children: ReactNode }) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {children}
    </View>
  );
}

// ── Time line: tap the moment ────────────────────────────────────────────────────────────

type TimelineProps = {
  choices: { id: string; label: string; value: number }[];
  selected: string | null;
  marks?: Record<string, 'right' | 'wrong'>;
  disabled?: boolean;
  onSelect: (id: string) => void;
  width: number;
};

/** A time axis with t = 0 marked as the release and one tappable dot per answer. */
export function Timeline({ choices, selected, marks, disabled, onSelect, width }: TimelineProps) {
  const { palette: p } = useTheme();
  const lo = Math.floor(Math.min(0, ...choices.map((c) => c.value)) - 0.5);
  const hi = Math.ceil(Math.max(0, ...choices.map((c) => c.value)) + 0.5);
  const L = 22;
  const R = width - 22;
  const X = (t: number) => L + ((t - lo) / (hi - lo)) * (R - L);
  const axisY = 44;
  const ticks: number[] = [];
  for (let i = lo; i <= hi; i++) ticks.push(i);
  return (
    <View style={{ width, height: 86 }}>
      <Svg width={width} height={86} fontFamily={svgFont}>
        <Line x1={L} y1={axisY} x2={R} y2={axisY} stroke={p.lineStrong} strokeWidth={3} strokeLinecap="round" />
        {ticks.map((i) => (
          <SvgText key={i} x={X(i)} y={axisY + 24} fontSize={12} fill={p.faint} textAnchor="middle">{i === 0 ? '' : i}</SvgText>
        ))}
        {ticks.map((i) => (
          <Line key={'k' + i} x1={X(i)} y1={axisY - 4} x2={X(i)} y2={axisY + 4} stroke={p.lineStrong} strokeWidth={1.5} />
        ))}
        <Line x1={X(0)} y1={axisY - 12} x2={X(0)} y2={axisY + 12} stroke={p.ink} strokeWidth={2} />
        <SvgText x={X(0)} y={axisY + 26} fontSize={11} fontWeight="700" fill={p.ink} textAnchor="middle">release</SvgText>
        <SvgText x={R} y={axisY + 40} fontSize={11} fill={p.faint} textAnchor="end">t / s</SvgText>
        {choices.map((c) => {
          const m = marks?.[c.id];
          const on = selected === c.id;
          const stroke = m === 'right' ? p.ok : m === 'wrong' ? p.bad : p.select;
          return (
            <SvgText key={'l' + c.id} x={X(c.value)} y={axisY - 22} fontSize={14} fontWeight="700" fill={m === 'wrong' ? p.badText : p.ink} textAnchor="middle">
              {c.label}
            </SvgText>
          );
        })}
        {choices.map((c) => {
          const m = marks?.[c.id];
          const on = selected === c.id;
          const stroke = m === 'right' ? p.ok : m === 'wrong' ? p.bad : p.select;
          return <Circle key={'d' + c.id} cx={X(c.value)} cy={axisY} r={11} fill={on || m ? stroke : p.page} stroke={stroke} strokeWidth={3} />;
        })}
      </Svg>
      {choices.map((c) => (
        <Pressable
          key={c.id}
          accessibilityRole="radio"
          accessibilityLabel={`t = ${c.label}`}
          accessibilityState={{ checked: selected === c.id, disabled }}
          disabled={disabled}
          onPress={() => onSelect(c.id)}
          style={{ position: 'absolute', left: X(c.value) - 26, top: axisY - 40, width: 52, height: 64 }}
        />
      ))}
    </View>
  );
}

// ── Number tiles: tap a tile to place it in the equation ─────────────────────────────────

export function TileBank({ tiles, selected, used, disabled, onSelect }: { tiles: { value: number; label: string }[]; selected: number | null; used?: number[]; disabled?: boolean; onSelect: (v: number) => void }) {
  const { palette: p } = useTheme();
  return (
    <View style={styles.tiles} accessibilityRole="radiogroup">
      {tiles.map((t) => {
        const on = selected === t.value;
        const gone = used?.includes(t.value) && !on;
        return (
          <Pressable
            key={t.value}
            accessibilityRole="radio"
            accessibilityLabel={t.label}
            accessibilityState={{ checked: on, disabled: disabled || gone }}
            disabled={disabled || gone}
            onPress={() => onSelect(t.value)}
            style={({ pressed }) => [
              styles.tile,
              {
                borderColor: on ? p.select : p.line,
                borderBottomColor: on ? p.select : p.lineStrong,
                backgroundColor: on ? p.selectBg : gone ? p.disabled : p.page,
                borderBottomWidth: pressed ? 2 : 4,
                opacity: gone ? 0.5 : 1,
              },
            ]}
          >
            <Text style={[styles.tileText, { color: p.ink }]} maxFontSizeMultiplier={1.25}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 52, borderRadius: radius.m, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  buttonText: { fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  row: { flexDirection: 'row', gap: 8, alignSelf: 'stretch' },
  card: { borderWidth: 2, borderRadius: radius.m, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 6, flexDirection: 'row', gap: 6 },
  cardText: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  tile: { minHeight: touch, minWidth: 76, paddingHorizontal: 12, borderWidth: 2, borderRadius: radius.s, alignItems: 'center', justifyContent: 'center' },
  tileText: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
