// Ways to answer ON the scene. Each one draws in its own Svg layer over the scene, using the
// scene geometry so handles sit exactly on the picture, and adds touch areas (≥ 44 pt) above it.
// Every control also works with a screen reader (adjustable or button) without any drag.
import { useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, G, Line, Path, Rect, Text } from 'react-native-svg';
import type { AccDir, WorkingItem } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { svgFont } from '@/theme/svgFont';
import { arrowD, StillSack, V_SCALE, type SceneGeometry } from './BalloonScene';

const nearest = (values: number[], v: number) => values.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a));
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** Keeps the latest props in a ref, so a gesture created once always sees fresh values. */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

// ── Drag a vertical arrow (velocity on the sandbag, or the displacement s) ────────────────

type ArrowDragProps = {
  g: SceneGeometry;
  x: number;
  y0: number; // where the arrow starts
  pxPerUnit: number; // pt per m s⁻¹ (velocity) or per metre (displacement)
  value: number | null; // null = not touched yet
  snaps: number[]; // values the arrow settles on when released
  disabled?: boolean;
  onChange: (v: number) => void; // while dragging
  onRelease: (v: number) => void; // snapped value
  label: (v: number | null) => string;
  name: string; // for screen readers, e.g. "Velocity arrow"
  pill?: boolean; // label in a white pill (displacement) instead of plain text
};

function ArrowDrag({ g, x, y0, pxPerUnit, value, snaps, disabled, onChange, onRelease, label, name, pill }: ArrowDragProps) {
  const { palette: p } = useTheme();
  const latest = useLatest({ value, snaps, onChange, onRelease, pxPerUnit });
  const start = useRef(0);
  const lo = Math.min(...snaps) * 1.25;
  const hi = Math.max(...snaps) * 1.25;

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .minDistance(0)
        .enabled(!disabled)
        .onBegin(() => {
          start.current = latest.current.value ?? 0;
        })
        .onUpdate((e) => {
          latest.current.onChange(clamp(start.current - e.translationY / latest.current.pxPerUnit, lo, hi));
        })
        .onEnd((e) => {
          latest.current.onRelease(nearest(latest.current.snaps, start.current - e.translationY / latest.current.pxPerUnit));
        }),
    [disabled, latest, lo, hi],
  );

  const v = value ?? 0;
  // keep the tip inside the scene even for a long arrow
  const tipY = clamp(y0 - v * pxPerUnit, 10, g.ground + 4);
  const len = y0 - tipY;
  const text = label(value);
  const labelY = value === null || Math.abs(len) < 6 ? y0 + 5 : (y0 + tipY) / 2 + 5;
  const step = (dir: 1 | -1) => {
    const sorted = [...snaps].sort((a, b) => a - b);
    const i = value === null ? sorted.indexOf(nearest(sorted, 0)) : sorted.indexOf(nearest(sorted, value));
    onRelease(sorted[clamp(i + dir, 0, sorted.length - 1)]);
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Svg width={g.width} height={g.height} style={StyleSheet.absoluteFill} pointerEvents="none" fontFamily={svgFont}>
        {/* faint ticks where the arrow can settle */}
        {snaps.map((s) => (
          <Line key={s} x1={x - 9} y1={clamp(y0 - s * pxPerUnit, 10, g.ground + 4)} x2={x + 9} y2={clamp(y0 - s * pxPerUnit, 10, g.ground + 4)} stroke={p.vel} strokeOpacity={0.35} strokeWidth={2} strokeLinecap="round" />
        ))}
        {value !== null && <Path d={arrowD(x, y0, len)} stroke={p.vel} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
        <Circle cx={x} cy={tipY} r={16} fill={p.select} fillOpacity={0.12} stroke={p.select} strokeWidth={2} strokeDasharray="4 3" />
        {pill ? (
          <>
            <Rect x={x + 22} y={labelY - 17} width={text.length * 8 + 16} height={24} rx={12} fill={p.page} stroke={p.vel} strokeWidth={1.5} />
            <Text x={x + 30} y={labelY} fontSize={14} fontWeight="700" fill={p.velText}>{text}</Text>
          </>
        ) : (
          <Text x={x + 22} y={labelY} fontSize={14} fontWeight="700" fill={p.velText}>{text}</Text>
        )}
      </Svg>
      <GestureDetector gesture={pan}>
        <View
          style={[styles.handle, { left: x - 28, top: tipY - 28 }]}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={name}
          accessibilityValue={{ text }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
        />
      </GestureDetector>
    </View>
  );
}

/** Drag the velocity arrow on the hanging sandbag. */
export function VelocityDrag(props: Omit<ArrowDragProps, 'x' | 'y0' | 'pxPerUnit' | 'name'>) {
  const { g } = props;
  return <ArrowDrag {...props} x={g.velX} y0={g.yRelease - g.bagH / 2} pxPerUnit={V_SCALE} name="Velocity arrow" />;
}

/** Drag the displacement arrow s from the release point. */
export function DisplacementDrag(props: Omit<ArrowDragProps, 'x' | 'y0' | 'pxPerUnit' | 'name' | 'pill'>) {
  const { g } = props;
  return <ArrowDrag {...props} x={g.sX} y0={g.yRelease} pxPerUnit={g.pxm} name="Displacement arrow s" pill />;
}

// ── Tap the acceleration arrow to turn it ────────────────────────────────────────────────

const ORDER: AccDir[] = ['up', 'zero', 'down'];
export const nextDir = (d: AccDir | null): AccDir => (d === null ? ORDER[0] : ORDER[(ORDER.indexOf(d) + 1) % ORDER.length]);
const dirWords: Record<AccDir, string> = { up: 'pointing up', zero: 'zero', down: 'pointing down' };

/** An acceleration arrow drawn at (x, y0): up, down, a dot for zero, or "?" when not set. */
function AccGlyph({ x, y0, dir, label }: { x: number; y0: number; dir: AccDir | null; label?: string }) {
  const { palette: p } = useTheme();
  if (dir === null) {
    return (
      <>
        <Circle cx={x} cy={y0} r={16} fill={p.page} stroke={p.acc} strokeWidth={2} strokeDasharray="4 3" />
        <Text x={x} y={y0 + 6} fontSize={16} fontWeight="800" fill={p.accText} textAnchor="middle">?</Text>
      </>
    );
  }
  const len = dir === 'up' ? 34 : dir === 'down' ? -34 : 0;
  const top = dir === 'up' ? y0 + 17 : y0 - 17;
  return (
    <>
      <Path d={arrowD(x, dir === 'zero' ? y0 : top, len)} stroke={p.acc} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill={dir === 'zero' ? p.acc : 'none'} />
      {label ? <Text x={x - 12} y={y0 + 5} fontSize={14} fontWeight="700" fill={p.accText} textAnchor="end">{label}</Text> : null}
    </>
  );
}

/** Tap the acceleration arrow next to the hanging sandbag: up → zero → down → up… */
export function AccFlip({ g, dir, disabled, onTap, label }: { g: SceneGeometry; dir: AccDir | null; disabled?: boolean; onTap: () => void; label: string }) {
  const y0 = g.yRelease - g.bagH / 2;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Svg width={g.width} height={g.height} style={StyleSheet.absoluteFill} pointerEvents="none" fontFamily={svgFont}>
        <AccGlyph x={g.accX} y0={y0} dir={dir} label={label} />
      </Svg>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Acceleration arrow, ${dir ? dirWords[dir] : 'not set'}. Tap to turn it.`}
        disabled={disabled}
        onPress={onTap}
        style={[styles.tapBox, { left: g.accX - 28, top: y0 - 30, width: 56, height: 60 }]}
      />
    </View>
  );
}

// ── Strobe: the sandbag frozen at a few moments, one acceleration arrow each ─────────────

export type StrobeFrame = { id: string; label: string; h: number; v: number };

export function StrobeFrames({ g, frames, answers, marks, disabled, onTap }: { g: SceneGeometry; frames: StrobeFrame[]; answers: Record<string, AccDir | undefined>; marks?: Record<string, 'right' | 'wrong'>; disabled?: boolean; onTap: (id: string) => void }) {
  const { palette: p } = useTheme();
  const xs = frames.map((_, i) => Math.round(g.width * (0.24 + (0.52 * i) / Math.max(1, frames.length - 1))));
  const lowest = Math.max(...frames.map((f) => g.yOf(f.h)));
  const rowY = Math.min(lowest + 64, g.ground - 52); // the row of acceleration buttons
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Svg width={g.width} height={g.height} style={StyleSheet.absoluteFill} pointerEvents="none" fontFamily={svgFont}>
        {/* time runs left to right */}
        <Path d={`M${xs[0] - 30},${rowY + 44} H${xs[xs.length - 1] + 30} M${xs[xs.length - 1] + 22},${rowY + 39} L${xs[xs.length - 1] + 30},${rowY + 44} L${xs[xs.length - 1] + 22},${rowY + 49}`} stroke={p.faint} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Text x={xs[xs.length - 1] + 30} y={rowY + 62} fontSize={11} fill={p.faint} textAnchor="end">time</Text>
        {frames.map((f, i) => {
          const y = g.yOf(f.h);
          const m = marks?.[f.id];
          return (
            <G key={f.id}>
              <StillSack x={xs[i]} y={y} p={p} />
              <Path d={arrowD(xs[i] + 22, y - g.bagH / 2, f.v * V_SCALE)} stroke={p.vel} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill={Math.abs(f.v) < 0.5 ? p.vel : 'none'} />
              <Circle cx={xs[i]} cy={rowY} r={22} fill={m === 'right' ? p.okBg : m === 'wrong' ? p.badBg : p.page} stroke={m === 'right' ? p.ok : m === 'wrong' ? p.bad : answers[f.id] ? p.acc : p.lineStrong} strokeWidth={2} />
              <AccGlyphSmall x={xs[i]} y={rowY} dir={answers[f.id] ?? null} />
              <Text x={xs[i]} y={rowY + 34} fontSize={12} fontWeight="700" fill={p.muted} textAnchor="middle">{f.label}</Text>
            </G>
          );
        })}
      </Svg>
      {frames.map((f, i) => (
        <Pressable
          key={f.id}
          accessibilityRole="button"
          accessibilityLabel={`${f.label}: acceleration ${answers[f.id] ? dirWords[answers[f.id]!] : 'not set'}. Tap to turn it.`}
          disabled={disabled}
          onPress={() => onTap(f.id)}
          style={[styles.tapBox, { left: xs[i] - 28, top: rowY - 28, width: 56, height: 56 }]}
        />
      ))}
    </View>
  );
}

function AccGlyphSmall({ x, y, dir }: { x: number; y: number; dir: AccDir | null }) {
  const { palette: p } = useTheme();
  if (dir === null) return <Text x={x} y={y + 6} fontSize={17} fontWeight="800" fill={p.faint} textAnchor="middle">?</Text>;
  if (dir === 'zero') return <Circle cx={x} cy={y} r={4.5} fill={p.acc} />;
  const d = dir === 'up' ? `M${x},${y + 11} V${y - 11} M${x - 6},${y - 4} L${x},${y - 11} L${x + 6},${y - 4}` : `M${x},${y - 11} V${y + 11} M${x - 6},${y + 4} L${x},${y + 11} L${x + 6},${y + 4}`;
  return <Path d={d} stroke={p.acc} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
}

// ── A student's working drawn on the scene: tap the wrong item ───────────────────────────

type ItemBox = { x: number; y: number; w: number; h: number };

/** Where each item of the working is drawn, and its touch box. */
function layoutWorking(g: SceneGeometry, items: WorkingItem[]) {
  const mid = g.yRelease - g.bagH / 2;
  const groundMid = g.ground - g.bagH / 2;
  const sX = g.width - 36;
  const boxes: Record<string, ItemBox> = {};
  for (const it of items) {
    if (it.kind === 'u') boxes[it.id] = { x: g.velX - 18, y: mid - it.value * V_SCALE - 10, w: 108, h: it.value * V_SCALE + 20 };
    if (it.kind === 'a') boxes[it.id] = { x: g.accX - 90, y: mid - 8, w: 106, h: 54 };
    if (it.kind === 'v') boxes[it.id] = { x: g.velX - 18, y: groundMid - Math.max(0, it.value) * V_SCALE - 10, w: 108, h: Math.abs(it.value) * V_SCALE + 20 };
    if (it.kind === 's') boxes[it.id] = { x: sX - 24, y: g.yRelease, w: 48, h: g.ground - g.yRelease };
    if (it.kind === 't') boxes[it.id] = { x: 12, y: 12, w: 112, h: 44 };
  }
  return { mid, groundMid, sX, boxes };
}

export function WorkingPicture({ g, items, selected, cleared, revealed, disabled, onTap }: { g: SceneGeometry; items: WorkingItem[]; selected: string | null; cleared: string[]; revealed: boolean; disabled?: boolean; onTap: (id: string) => void }) {
  const { palette: p } = useTheme();
  const { mid, groundMid, sX, boxes } = layoutWorking(g, items);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Svg width={g.width} height={g.height} style={StyleSheet.absoluteFill} pointerEvents="none" fontFamily={svgFont}>
        {/* the student's picture of the landing */}
        <StillSack x={g.px} y={g.ground} p={p} />
        {items.map((it) => {
          const wrongShown = revealed && it.wrong;
          const color = wrongShown ? p.bad : it.kind === 'a' ? p.acc : p.vel;
          const text = wrongShown ? p.badText : it.kind === 'a' ? p.accText : p.velText;
          if (it.kind === 'u') return <Item key={it.id} d={arrowD(g.velX, mid, it.value * V_SCALE)} color={color} textColor={text} tx={g.velX + 12} ty={mid - (it.value * V_SCALE) / 2 + 5} label={it.label} />;
          if (it.kind === 'a') return <Item key={it.id} d={arrowD(g.accX, mid, -36)} color={color} textColor={text} tx={g.accX - 10} ty={mid + 22} label={it.label} anchor="end" />;
          if (it.kind === 'v') return <Item key={it.id} d={arrowD(g.velX, groundMid, it.value * V_SCALE)} color={color} textColor={text} tx={g.velX + 12} ty={groundMid - (it.value * V_SCALE) / 2 + 5} label={it.label} />;
          if (it.kind === 's') return <Item key={it.id} d={arrowD(sX, g.yRelease, -(g.ground - g.yRelease - 2))} color={color} textColor={text} tx={sX - 10} ty={g.yRelease + 34} label={it.label} anchor="end" />;
          return (
            <G key={it.id}>
              <Rect x={14} y={16} width={it.label.length * 8 + 22} height={30} rx={15} fill={p.page} stroke={p.lineStrong} strokeWidth={1.5} />
              <Text x={25} y={36} fontSize={14} fontWeight="700" fill={p.ink}>{it.label}</Text>
            </G>
          );
        })}
        {/* the selected item gets a blue ring; items already checked get a green tick */}
        {items.map((it) => {
          const b = boxes[it.id];
          const ok = cleared.includes(it.id);
          if (selected === it.id) return <Rect key={'sel' + it.id} x={b.x} y={b.y} width={b.w} height={b.h} rx={10} fill="none" stroke={p.select} strokeWidth={2.5} />;
          if (ok) return <Circle key={'ok' + it.id} cx={b.x + b.w - 6} cy={b.y + 6} r={9} fill={p.okBg} stroke={p.ok} strokeWidth={1.5} />;
          return null;
        })}
      </Svg>
      {items.map((it) => {
        const b = boxes[it.id];
        return (
          <Pressable
            key={it.id}
            accessibilityRole="radio"
            accessibilityLabel={`${it.label}${cleared.includes(it.id) ? ', this one is fine' : ''}`}
            accessibilityState={{ checked: selected === it.id, disabled: disabled || cleared.includes(it.id) }}
            disabled={disabled || cleared.includes(it.id)}
            onPress={() => onTap(it.id)}
            style={[styles.tapBox, { left: b.x, top: b.y, width: Math.max(44, b.w), height: Math.max(44, b.h) }]}
          />
        );
      })}
    </View>
  );
}

function Item({ d, color, textColor, tx, ty, label, anchor }: { d: string; color: string; textColor: string; tx: number; ty: number; label: string; anchor?: 'end' }) {
  return (
    <>
      <Path d={d} stroke={color} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Text x={tx} y={ty} fontSize={14} fontWeight="700" fill={textColor} textAnchor={anchor ?? 'start'}>{label}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  handle: { position: 'absolute', width: 56, height: 56, borderRadius: 28 },
  tapBox: { position: 'absolute' },
});
