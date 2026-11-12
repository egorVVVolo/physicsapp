// A slider with ticks and a value bubble above the thumb, like a ruler. Snaps to `step`.
// Works with touch, mouse and screen readers (adjustable: swipe up/down to change).
import { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { useTheme } from '@/theme/ThemeContext';
import { font } from '@/theme/tokens';

type Props = {
  value: number;
  min: number;
  max: number;
  step: number;
  /** Gap between the ruler marks (defaults to `step`). */
  tick?: number;
  label: string; // for screen readers and the caption under the ruler
  format: (v: number) => string; // the bubble text
  formatEnd?: (v: number) => string; // the numbers at both ends of the ruler
  onChange: (v: number) => void;
};

const THUMB = 30;

export function Slider({ value, min, max, step, tick = step, label, format, formatEnd = format, onChange }: Props) {
  const { palette: p } = useTheme();
  const [width, setWidth] = useState(0);
  const span = Math.max(1, width - THUMB);
  const toX = (v: number) => ((v - min) / (max - min)) * span;
  const snap = (x: number) => {
    const raw = min + (Math.min(Math.max(x, 0), span) / span) * (max - min);
    return Math.round(raw / step) * step;
  };
  const set = (x: number) => {
    const v = Number(snap(x).toFixed(6));
    if (v !== value) onChange(v);
  };

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      'worklet';
      scheduleOnRN(set, e.x - THUMB / 2);
    })
    .onUpdate((e) => {
      'worklet';
      scheduleOnRN(set, e.x - THUMB / 2);
    });

  const ticks: number[] = [];
  for (let v = min; v <= max + 1e-9; v += tick) ticks.push(Number(v.toFixed(6)));
  const x = toX(value);

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: format(value) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => onChange(Math.min(max, Math.max(min, value + (e.nativeEvent.actionName === 'increment' ? step : -step))))}
    >
      <GestureDetector gesture={pan}>
        <View style={styles.area} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
          {width > 0 && (
            <>
              <View style={[styles.bubble, { backgroundColor: p.ink, left: Math.min(Math.max(x + THUMB / 2 - 75, 0), width - 150) }]} pointerEvents="none">
                <Text style={styles.bubbleText}>{format(value)}</Text>
              </View>
              <View style={[styles.track, { backgroundColor: p.drawFill, left: THUMB / 2, right: THUMB / 2 }]} />
              {ticks.map((t) => (
                <View key={t} style={[styles.tick, { left: toX(t) + THUMB / 2 - 1, height: t === 0 ? 18 : 10, top: t === 0 ? 47 : 51, backgroundColor: t === 0 ? p.draw : p.lineStrong }]} />
              ))}
              <View style={[styles.thumb, { left: x, borderColor: p.ink, backgroundColor: p.page }]} pointerEvents="none">
                <View style={[styles.thumbDot, { backgroundColor: p.ink }]} />
              </View>
            </>
          )}
        </View>
      </GestureDetector>
      <View style={styles.ends}>
        <Text style={[styles.end, { color: p.faint }]}>{formatEnd(min)}</Text>
        <Text style={[styles.caption, { color: p.muted }]}>{label}</Text>
        <Text style={[styles.end, { color: p.faint }]}>{formatEnd(max)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  area: { height: 76, justifyContent: 'flex-start' },
  bubble: { position: 'absolute', top: 0, width: 150, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  bubbleText: { color: '#FFFFFF', fontFamily: font.monoBold, fontSize: 14 },
  track: { position: 'absolute', top: 54, height: 4, borderRadius: 2 },
  tick: { position: 'absolute', width: 2 },
  thumb: { position: 'absolute', top: 41, width: THUMB, height: THUMB, borderRadius: THUMB / 2, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  thumbDot: { width: 8, height: 8, borderRadius: 4 },
  ends: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  end: { fontFamily: font.mono, fontSize: 12 },
  caption: { fontFamily: font.bodyMedium, fontSize: 14 },
});
