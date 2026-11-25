// Welcome, the first screen on the first launch: the app's mark and name, and a puck hanging on a spring. Pull the puck
// down (up to 120 pt) and let go: it bobs by the model of a damped spring (bobStep, src/physics/springs.ts), three or four
// swings before it settles. "Physics you can move." and Start, to the exam date.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import Svg, { Line, Path } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';
import { mark } from '@/art/brand';
import { uiIcon } from '@/art/uiIcons';
import { APP_NAME } from '@/config';
import { Puck } from '@/figures/Puck';
import { CONTENT_MAX } from '@/lesson/Frame';
import { bobStep } from '@/physics/springs';
import { useTheme } from '@/theme/ThemeContext';
import { courseBlue, font } from '@/theme/tokens';
import { Art } from '@/ui/Art';
import { feedback } from '@/ui/feedback';
import { MainButton } from '@/ui/parts';

const REST = 96; // pt, the spring's length with the puck hanging still
const PULL = 120; // pt, the furthest the puck can be pulled down
const OMEGA = 10.5; // rad s⁻¹: a swing of about 0.6 s
const ZETA = 0.08; // light damping: three or four visible swings
const PUCK = 104;
const COILS = 9;

export default function Welcome() {
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  const [pulled, setPulled] = useState(false);
  const y = useSharedValue(0); // how far below its resting place the puck is
  const v = useSharedValue(0);
  const held = useSharedValue(false);

  const pan = Gesture.Pan()
    .onBegin(() => {
      held.set(true);
      v.set(0);
    })
    .onUpdate((e) => {
      y.set(Math.max(-20, Math.min(PULL, e.translationY)));
    })
    .onFinalize(() => {
      held.set(false);
      scheduleOnRN(setPulled, true);
      scheduleOnRN(feedback.pick);
    });

  useFrameCallback((info) => {
    if (held.get()) return;
    const dt = Math.min(0.05, (info.timeSincePreviousFrame ?? 16) / 1000);
    const next = bobStep({ x: y.get(), v: v.get() }, 0, OMEGA, ZETA, dt);
    y.set(Math.abs(next.x) < 0.05 && Math.abs(next.v) < 0.5 ? 0 : next.x);
    v.set(next.v);
  });

  const springStyle = useAnimatedStyle(() => ({ height: REST + y.get() }));
  // one zigzag, stretched with the spring
  const zig = `M20,0 ${Array.from({ length: COILS }, (_, i) => `L${i % 2 ? 6 : 34},${((i + 0.5) / COILS) * 100}`).join(' ')} L20,100`;

  return (
    <View style={[styles.root, { backgroundColor: p.page, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      <View style={[styles.column, styles.brand]}>
        <Art xml={mark(courseBlue, 'blue')} width={44} />
        <Text style={[styles.name, { color: p.ink }]}>{APP_NAME}</Text>
      </View>

      <View style={styles.stage}>
        {/* the ceiling the spring hangs from */}
        <Svg width={140} height={12}>
          <Line x1={0} y1={2} x2={140} y2={2} stroke={p.draw} strokeWidth={2.4} />
          {Array.from({ length: 10 }, (_, i) => (
            <Line key={i} x1={6 + i * 14} y1={2} x2={i * 14} y2={11} stroke={p.draw} strokeWidth={1.2} />
          ))}
        </Svg>
        <GestureDetector gesture={pan}>
          <View style={styles.hang} accessible accessibilityRole="adjustable" accessibilityLabel="A puck on a spring. Pull it down and let go.">
            <Animated.View style={[styles.spring, springStyle]}>
              <Svg width={40} height="100%" viewBox="0 0 40 100" preserveAspectRatio="none">
                <Path d={zig} fill="none" stroke={p.draw} strokeWidth={2.4} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </Svg>
            </Animated.View>
            {/* the puck hangs under the spring: it moves as the spring stretches */}
            <View style={styles.puck}>
              <Puck size={PUCK} state="current" color={courseBlue} />
            </View>
          </View>
        </GestureDetector>
        <View style={[styles.hint, { opacity: pulled ? 0 : 1 }]}>
          <Art xml={uiIcon('drag')} width={18} color={p.muted} />
          <Text style={[styles.hintText, { color: p.muted }]}>Pull the puck</Text>
        </View>
      </View>

      <View style={[styles.column, { gap: 12 }]}>
        <Text accessibilityRole="header" style={[styles.title, { color: p.ink }]}>
          Physics you can move.
        </Text>
        <Text style={[styles.line, { color: p.muted }]}>Edexcel IAL Unit 1 in 24 short lessons.</Text>
        <View style={{ marginTop: 8 }}>
          <MainButton label="Start" onPress={() => router.push('/onboarding/exam')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, justifyContent: 'space-between' },
  column: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { fontFamily: font.display, fontSize: 20 },
  stage: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  hang: { alignItems: 'center', height: REST + PULL + PUCK, width: 200 },
  spring: { width: 40, overflow: 'visible' },
  puck: { marginTop: -24 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -PULL + 8 },
  hintText: { fontFamily: font.bodySemi, fontSize: 14 },
  title: { fontFamily: font.display, fontSize: 32, lineHeight: 38 },
  line: { fontFamily: font.body, fontSize: 17, lineHeight: 24 },
});
