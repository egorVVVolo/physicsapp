// The picture of the Mechanics and Materials course, drawn in code and moving by formulas: a ball flies along its
// parabola (x = u·t, y = ½gt², as a drawn arc) and a mass swings on a spring (simple harmonic motion). Flat
// colours: the ball is blue (Motion), the mass is green (Materials); everything else is paper and ink lines.
// The clock stops when the tab is not in view and with reduced motion (a still frame).
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, { Easing, cancelAnimation, useAnimatedProps, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { levelColors } from '@/theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

const W = 320;
const H = 150;
export const SCENE_RATIO = H / W;

const GROUND = 124;
const BALL_R = 7;
const FLIGHT = 2.4; // s, one throw
const CYCLE = 3.1; // s, a throw and a short pause with the ball out of sight
const FROM = 34;
const RANGE = 160;
const APEX = 76;

const SPRING_X = 262;
const BEAM_Y = 16;
const REST = 82; // top of the mass at rest
const SWING = 13;
const PERIOD = 1.9; // s
const MASS_W = 34;
const MASS_H = 26;

/** The zigzag of the spring from the beam down to the mass. */
function springPath(bottom: number): string {
  'worklet';
  const coils = 9;
  const y0 = BEAM_Y + 7;
  const y1 = bottom - 7;
  let d = `M${SPRING_X} ${BEAM_Y} L${SPRING_X} ${y0}`;
  for (let i = 0; i < coils; i++) {
    const y = y0 + ((y1 - y0) * (i + 0.5)) / coils;
    d += ` L${SPRING_X + (i % 2 ? -11 : 11)} ${y.toFixed(2)}`;
  }
  return `${d} L${SPRING_X} ${y1} L${SPRING_X} ${bottom}`;
}

/** The static dotted arc of the throw, from the launch point to the landing point. */
const ARC = (() => {
  let d = '';
  for (let i = 0; i <= 24; i++) {
    const u = i / 24;
    d += `${i ? ' L' : 'M'}${(FROM + RANGE * u).toFixed(1)} ${(GROUND - 4 * APEX * u * (1 - u)).toFixed(1)}`;
  }
  return d;
})();

export function CourseScene({ width }: { width: number }) {
  const { palette: p, level } = useTheme();
  const reduced = useReducedMotion();
  const t = useSharedValue(0.95); // s; the still frame shows the ball in the air and the mass a little below rest
  // the clock is one linear run of the shared value (on the UI thread, nothing per frame on the JS thread)
  useFocusEffect(
    useCallback(() => {
      if (reduced) return;
      const span = 100000; // s: longer than anyone keeps the tab open
      t.set(withTiming(t.get() + span, { duration: span * 1000, easing: Easing.linear }));
      return () => cancelAnimation(t);
    }, [t, reduced]),
  );

  const ball = level(levelColors.motion);
  const mass = level(levelColors.materials);

  const ballProps = useAnimatedProps(() => {
    const u = Math.min(1, (t.get() % CYCLE) / FLIGHT);
    return {
      cx: FROM + RANGE * u,
      cy: GROUND - BALL_R - 4 * APEX * u * (1 - u),
      opacity: Math.min(1, u * 12, (1 - u) * 12),
    };
  });
  const massTop = () => {
    'worklet';
    return REST + SWING * Math.sin((2 * Math.PI * t.get()) / PERIOD);
  };
  const massProps = useAnimatedProps(() => ({ y: massTop() }));
  const massFootProps = useAnimatedProps(() => ({ y: massTop() + MASS_H - 6 }));
  // the shadow of the ball on the ground follows it and shrinks as the ball goes up
  const shadowProps = useAnimatedProps(() => {
    const u = Math.min(1, (t.get() % CYCLE) / FLIGHT);
    return { cx: FROM + RANGE * u, rx: BALL_R * (1.5 - 1.1 * 4 * u * (1 - u)), opacity: 0.22 * Math.min(1, u * 12, (1 - u) * 12) };
  });
  const springProps = useAnimatedProps(() => ({ d: springPath(massTop()) }));

  // a faint drawing grid, every 20 units
  let grid = '';
  for (let x = 20; x < W; x += 20) grid += `M${x} 0 V${H} `;
  for (let y = 20; y < H; y += 20) grid += `M0 ${y} H${W} `;

  return (
    <Svg width={width} height={width * SCENE_RATIO} viewBox={`0 0 ${W} ${H}`} accessibilityLabel="A ball flying along its arc and a mass swinging on a spring">
      <Path d={grid} stroke={p.paperLine} strokeWidth={0.8} opacity={0.5} />
      {/* ground under the throw */}
      <Line x1={14} y1={GROUND} x2={206} y2={GROUND} stroke={p.ink} strokeWidth={2} strokeLinecap="round" />
      <Path d={ARC} stroke={p.lineStrong} strokeWidth={1.8} strokeDasharray="1 7" strokeLinecap="round" fill="none" />
      <AnimatedEllipse cy={GROUND + 4} ry={2.2} fill={p.ink} animatedProps={shadowProps} />
      <AnimatedCircle r={BALL_R} fill={ball.face} animatedProps={ballProps} />
      {/* the spring hangs from a beam */}
      <Line x1={SPRING_X - 30} y1={BEAM_Y} x2={SPRING_X + 30} y2={BEAM_Y} stroke={p.ink} strokeWidth={3} strokeLinecap="round" />
      <AnimatedPath stroke={p.ink} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" fill="none" animatedProps={springProps} />
      <AnimatedRect x={SPRING_X - MASS_W / 2} width={MASS_W} height={MASS_H} rx={3} fill={mass.face} animatedProps={massProps} />
      <AnimatedRect x={SPRING_X - MASS_W / 2} width={MASS_W} height={6} rx={3} fill={mass.side} animatedProps={massFootProps} />
    </Svg>
  );
}

/** The scene as wide as the space it is put in (measured, so it also fits a wide window). */
export function SceneBox() {
  const [width, setWidth] = useState(0);
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? <CourseScene width={width} /> : <View style={{ aspectRatio: 1 / SCENE_RATIO }} />}
    </View>
  );
}
