// Graph view: height against time, full width. Same model, same clock as the scene.
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Line, Path, Rect, Text } from 'react-native-svg';
import { position } from '@/physics/kinematics';
import { bagWith, realBag, tLand, tLandReal } from '@/content/balloon';
import { svgFont, type Palette } from '@/theme/tokens';
import { SCENE_H, SCENE_W } from './BalloonScene';

const APath = Animated.createAnimatedComponent(Path);
const ALine = Animated.createAnimatedComponent(Line);
const ACircle = Animated.createAnimatedComponent(Circle);

const L = 58, R = 344, TOP = 44, BOTTOM = 384;
const T_MAX = 3.2, H_MAX = 40;
const X = (t: number) => {
  'worklet';
  return L + (t / T_MAX) * (R - L);
};
const Y = (h: number) => {
  'worklet';
  return BOTTOM - (Math.max(0, h) / H_MAX) * (BOTTOM - TOP);
};

function trace(s0: number, u: number, a: number, tEnd: number) {
  'worklet';
  let d = '';
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const t = (tEnd * i) / n;
    d += (i ? 'L' : 'M') + X(t).toFixed(1) + ',' + Y(s0 + u * t + 0.5 * a * t * t).toFixed(1);
  }
  return d;
}

type Props = { t: SharedValue<number>; palette: Palette; ghostU: number | null };

export function HeightGraph({ t, palette: p, ghostU }: Props) {
  const ghost = ghostU === null ? null : bagWith(ghostU);
  const ghostEnd = ghostU === null ? 0 : tLand(ghostU);
  const real = realBag;

  const realProps = useAnimatedProps(() => ({ d: trace(real.s0, real.u, real.a, Math.min(t.value, tLandReal)) }));
  const ghostProps = useAnimatedProps(() => ({ d: ghost ? trace(ghost.s0, ghost.u, ghost.a, Math.min(t.value, ghostEnd)) : '' }));
  const head = useAnimatedProps(() => {
    const tt = Math.min(t.value, tLandReal);
    return { cx: X(tt), cy: Y(position(tt, real)) };
  });
  const cursor = useAnimatedProps(() => ({ x1: X(t.value), x2: X(t.value) }));

  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} preserveAspectRatio="xMidYMid meet" fontFamily={svgFont}>
      <Rect x={-600} y={-600} width={SCENE_W + 1200} height={SCENE_H + 1200} fill={p.surface} />
      {[10, 20, 30, 40].map((h) => (
        <Line key={h} x1={L} y1={Y(h)} x2={R} y2={Y(h)} stroke={p.line} strokeWidth={1} />
      ))}
      {[1, 2, 3].map((s) => (
        <Line key={s} x1={X(s)} y1={TOP} x2={X(s)} y2={BOTTOM} stroke={p.line} strokeWidth={1} />
      ))}
      <Line x1={L} y1={BOTTOM} x2={R} y2={BOTTOM} stroke={p.ink} strokeWidth={2} />
      <Line x1={L} y1={BOTTOM} x2={L} y2={TOP - 8} stroke={p.ink} strokeWidth={2} />
      {[10, 20, 30, 40].map((h) => (
        <Text key={h} x={L - 10} y={Y(h) + 5} fontSize={14} fontWeight="600" fill={p.muted} textAnchor="end">{h}</Text>
      ))}
      {[0, 1, 2, 3].map((s) => (
        <Text key={s} x={X(s)} y={BOTTOM + 22} fontSize={14} fontWeight="600" fill={p.ink} textAnchor="middle">{s}</Text>
      ))}
      <Text x={L + 8} y={TOP - 14} fontSize={14} fill={p.muted}>height / m</Text>
      <Text x={R} y={BOTTOM + 44} fontSize={14} fill={p.muted} textAnchor="end">time / s</Text>

      <ALine animatedProps={cursor} y1={TOP} y2={BOTTOM} stroke={p.event} strokeWidth={1.5} />
      {ghost && <APath animatedProps={ghostProps} fill="none" stroke={p.ghost} strokeWidth={2.5} strokeDasharray="6 5" />}
      <APath animatedProps={realProps} fill="none" stroke={p.vel} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <ACircle animatedProps={head} r={7} fill={p.vel} stroke={p.surface} strokeWidth={2.5} />
      {ghost && <Text x={R} y={TOP + 4} fontSize={13} fontWeight="700" fill={p.muted} textAnchor="end">dashed: your answer</Text>}
    </Svg>
  );
}
