// Graph view: height against time, full width, in real screen points. Same model and clock as the scene.
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Line, Path, Rect, Text } from 'react-native-svg';
import { trackPosition, type Track } from '@/physics/kinematics';
import type { Companion } from '@/content/types';
import { svgFont } from '@/theme/svgFont';
import type { Palette } from '@/theme/tokens';

const APath = Animated.createAnimatedComponent(Path);
const ALine = Animated.createAnimatedComponent(Line);
const ACircle = Animated.createAnimatedComponent(Circle);

export const GRAPH_LEFT = 46;
export const GRAPH_RIGHT_PAD = 16;

type Props = {
  t: SharedValue<number>;
  palette: Palette;
  width: number;
  height: number;
  real: Track;
  companion: Companion | null;
  tMax: number;
  hMax: number;
};

export function HeightGraph({ t, palette: p, width, height, real, companion, tMax, hMax }: Props) {
  const L = GRAPH_LEFT;
  const R = width - GRAPH_RIGHT_PAD;
  const TOP = 34;
  const BOTTOM = height - 88; // leaves room for the time labels and the overlay buttons
  const comp = companion?.track ?? null;

  const X = (time: number) => {
    'worklet';
    return L + (time / tMax) * (R - L);
  };
  const Y = (h: number) => {
    'worklet';
    return BOTTOM - (Math.max(0, h) / hMax) * (BOTTOM - TOP);
  };
  /** The curve of a track from its start up to the clock time. */
  const trace = (tr: Track, now: number) => {
    'worklet';
    const tEnd = Math.min(now, tr.end);
    if (tEnd <= tr.from) return 'M0,0';
    let d = '';
    const n = 40;
    for (let i = 0; i <= n; i++) {
      const tt = tr.from + ((tEnd - tr.from) * i) / n;
      d += (i ? 'L' : 'M') + X(tt).toFixed(1) + ',' + Y(trackPosition(tt, tr)).toFixed(1);
    }
    return d;
  };

  const realProps = useAnimatedProps(() => ({ d: trace(real, t.value) }));
  const ghostProps = useAnimatedProps(() => ({ d: comp ? trace(comp, t.value) : 'M0,0' }));
  const head = useAnimatedProps(() => {
    const tt = Math.min(t.value, real.end);
    return { cx: X(tt), cy: Y(trackPosition(tt, real)) };
  });
  const cursor = useAnimatedProps(() => ({ x1: X(t.value), x2: X(t.value) }));

  const hStep = hMax > 30 ? 10 : 5;
  const hTicks = Array.from({ length: Math.floor(hMax / hStep) }, (_, i) => (i + 1) * hStep);
  const tStep = tMax > 4 ? 1 : 0.5;
  const tTicks = Array.from({ length: Math.floor(tMax / tStep) + 1 }, (_, i) => i * tStep);

  return (
    <Svg width={width} height={height} fontFamily={svgFont}>
      <Rect x={0} y={0} width={width} height={height} fill={p.surface} />
      {hTicks.map((h) => (
        <Line key={'h' + h} x1={L} y1={Y(h)} x2={R} y2={Y(h)} stroke={p.line} strokeWidth={1} />
      ))}
      {tTicks.slice(1).map((s) => (
        <Line key={'t' + s} x1={X(s)} y1={TOP} x2={X(s)} y2={BOTTOM} stroke={p.line} strokeWidth={1} />
      ))}
      <Line x1={L} y1={BOTTOM} x2={R} y2={BOTTOM} stroke={p.ink} strokeWidth={2} />
      <Line x1={L} y1={BOTTOM} x2={L} y2={TOP - 8} stroke={p.ink} strokeWidth={2} />
      {hTicks.map((h) => (
        <Text key={'hl' + h} x={L - 9} y={Y(h) + 5} fontSize={13} fontWeight="600" fill={p.muted} textAnchor="end">{h}</Text>
      ))}
      {tTicks.map((s) => (
        <Text key={'tl' + s} x={X(s)} y={BOTTOM + 20} fontSize={13} fontWeight="600" fill={p.ink} textAnchor="middle">{Number.isInteger(s) ? s : s.toFixed(1)}</Text>
      ))}
      <Text x={L + 8} y={TOP - 14} fontSize={13} fill={p.muted}>height / m</Text>
      <Text x={(L + R) / 2} y={BOTTOM + 38} fontSize={13} fill={p.muted} textAnchor="middle">time / s</Text>

      <ALine animatedProps={cursor} y1={TOP} y2={BOTTOM} stroke={p.event} strokeWidth={1.5} />
      {comp && <APath animatedProps={ghostProps} fill="none" stroke={p.ghost} strokeWidth={2.5} strokeDasharray="6 5" />}
      <APath animatedProps={realProps} fill="none" stroke={p.vel} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <ACircle animatedProps={head} r={7} fill={p.vel} stroke={p.surface} strokeWidth={2.5} />
      {companion && <Text x={R} y={TOP - 14} fontSize={13} fontWeight="700" fill={p.muted} textAnchor="end">dashed: {companion.label}</Text>}
    </Svg>
  );
}
