import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Text as SvgText } from 'react-native-svg';
import { brakingDemo } from '../content/brakingDemo';
import {
  positionDuringBraking,
  speedDuringBraking,
  stoppingDistance,
  stoppingTime,
} from '../physics/braking';
import { colors } from '../theme/tokens';
import { fonts } from '../theme/fonts';

type Props = {
  height: number;
  // 'known': the 20 m/s car, shown before the answer. 'compare': the 40 m/s car, shown after.
  mode: 'known' | 'compare';
  grid?: boolean;
  background?: string;
};

function usePlayback(duration: number, restartKey: unknown) {
  const [t, setT] = useState(0);
  const [reduce, setReduce] = useState(false);
  const [run, setRun] = useState(0);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce);
  }, []);

  useEffect(() => {
    if (reduce) {
      setT(duration);
      return;
    }
    const start = Date.now() + 500;
    let raf = 0;
    const tick = () => {
      const elapsed = (Date.now() - start) / 1000;
      setT(Math.min(Math.max(elapsed, 0), duration));
      if (elapsed < duration) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, restartKey, reduce, run]);

  return { t, replay: () => setRun((r) => r + 1) };
}

const CAR_W = 56;
const CAR_BODY = 'M0 22 L0 12 Q0 9 4 8 L14 6 L22 0 L40 0 L48 6 L54 8 Q56 9 56 12 L56 22 Z';
const CAR_WINDOW = 'M24 3 L38 3 L44 8 L20 8 Z';

function Car({ x, y, ghost }: { x: number; y: number; ghost?: boolean }) {
  return (
    <G transform={`translate(${x - CAR_W} ${y})`} opacity={ghost ? 0.9 : 1}>
      <Path
        d={CAR_BODY}
        fill={ghost ? 'none' : colors.ink}
        stroke={ghost ? colors.inkMuted : 'none'}
        strokeWidth={1.5}
        strokeDasharray={ghost ? '4 3' : undefined}
      />
      {!ghost && <Path d={CAR_WINDOW} fill="#DCE5FF" />}
      {[13, 43].map((cx) => (
        <G key={cx}>
          <Circle cx={cx} cy={22} r={6} fill={ghost ? colors.surface : colors.ink} stroke={ghost ? colors.inkMuted : colors.surface} strokeWidth={1.5} />
          {!ghost && <Circle cx={cx} cy={22} r={2} fill={colors.surface} />}
        </G>
      ))}
    </G>
  );
}

function Arrow({ x, y, length, dir, color }: { x: number; y: number; length: number; dir: 1 | -1; color: string }) {
  if (length < 5) return null;
  const x2 = x + dir * length;
  const h = 5;
  return (
    <G>
      <Line x1={x} y1={y} x2={x2 - dir * h} y2={y} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <Polygon points={`${x2},${y} ${x2 - dir * h * 1.6},${y - h} ${x2 - dir * h * 1.6},${y + h}`} fill={color} />
    </G>
  );
}

export function BrakingScene({ height, mode, grid, background = 'transparent' }: Props) {
  const [width, setWidth] = useState(0);
  const { u1, u2, a } = brakingDemo;
  const u = mode === 'known' ? u1 : u2;
  const dur = stoppingTime(u, a);
  const { t, replay } = usePlayback(dur + 0.4, mode);

  const tt = Math.min(t, dur);
  const s = positionDuringBraking(u, a, t);
  const v = speedDuringBraking(u, a, t);
  const done = t >= dur;
  const total = stoppingDistance(u, a);

  // Road (top part)
  const roadH = Math.max(140, height * 0.45);
  const groundY = roadH - 56;
  const range = mode === 'known' ? 60 : 180;
  const step = mode === 'known' ? 20 : 40;
  const padL = 64;
  const padR = 16;
  const sx = (m: number) => padL + (m * (width - padL - padR)) / range;
  const carY = groundY - 28;

  // Graph (bottom part)
  const gTop = roadH + 14;
  const gBottom = height - 26;
  const pl = 44;
  const pr = 14;
  const xMax = mode === 'known' ? 5 : 9;
  const yMax = mode === 'known' ? 24 : 48;
  const px = (sec: number) => pl + (sec * (width - pl - pr)) / xMax;
  const py = (vel: number) => gBottom - (vel * (gBottom - gTop)) / yMax;
  const xTicks = Array.from({ length: Math.floor(xMax / (mode === 'known' ? 1 : 2)) + 1 }, (_, i) => i * (mode === 'known' ? 1 : 2));
  const yStep = mode === 'known' ? 10 : 20;
  const yTicks = Array.from({ length: Math.floor(yMax / yStep) + 1 }, (_, i) => i * yStep);
  const roadTicks = Array.from({ length: Math.floor(range / step) + 1 }, (_, i) => i * step);

  const fill = `${px(0)},${py(0)} ${px(0)},${py(u)} ${px(tt)},${py(u - a * tt)} ${px(tt)},${py(0)}`;
  const font = { fontFamily: fonts.bodyMedium, fontSize: 11 };

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ height, backgroundColor: background }}
      accessible
      accessibilityLabel={`Animation: a car brakes at ${a} metres per second squared from ${u} metres per second, with a velocity-time graph underneath.`}
    >
      {width > 0 && (
        <Svg width={width} height={height}>
          {/* road */}
          <Line x1={0} y1={groundY} x2={width} y2={groundY} stroke={colors.ink} strokeWidth={2} />
          {roadTicks.map((m) => (
            <G key={m}>
              <Line x1={sx(m)} y1={groundY} x2={sx(m)} y2={groundY + 6} stroke={colors.ink} strokeWidth={1.5} />
              <SvgText x={sx(m)} y={groundY + 19} {...font} fill={colors.inkMuted} textAnchor="middle">
                {m === 0 ? '0 m' : m}
              </SvgText>
            </G>
          ))}
          <Line x1={sx(0)} y1={carY - 30} x2={sx(0)} y2={groundY} stroke={colors.inkMuted} strokeWidth={1} strokeDasharray="3 3" />
          <SvgText x={sx(0) + 5} y={carY - 33} {...font} fill={colors.inkMuted}>
            brakes on
          </SvgText>

          {/* ghost of the known car, only in compare mode */}
          {mode === 'compare' && <Car x={sx(stoppingDistance(u1, a))} y={carY} ghost />}
          <Car x={sx(s)} y={carY} />

          {/* arrows attached to the car */}
          <Arrow x={sx(s) - CAR_W / 2} y={carY - 12} length={(v / 40) * 72} dir={1} color={colors.velocity} />
          <Arrow x={sx(s) - CAR_W / 2} y={carY - 26} length={v > 0 ? 30 : 0} dir={-1} color={colors.acceleration} />
          {v > 4 && (
            <SvgText x={sx(s) - CAR_W / 2 + (v / 40) * 72 + 6} y={carY - 8} {...font} fontFamily={fonts.bodySemi} fill={colors.velocity}>
              v
            </SvgText>
          )}
          {v > 0 && (
            <SvgText x={sx(s) - CAR_W / 2 - 38} y={carY - 22} {...font} fontFamily={fonts.bodySemi} fill={colors.acceleration}>
              a
            </SvgText>
          )}

          {/* stopping distance bracket */}
          {done && (
            <G>
              <Line x1={sx(0)} y1={groundY + 34} x2={sx(total)} y2={groundY + 34} stroke={colors.velocity} strokeWidth={2} />
              <Line x1={sx(0)} y1={groundY + 29} x2={sx(0)} y2={groundY + 39} stroke={colors.velocity} strokeWidth={2} />
              <Line x1={sx(total)} y1={groundY + 29} x2={sx(total)} y2={groundY + 39} stroke={colors.velocity} strokeWidth={2} />
              <SvgText x={(sx(0) + sx(total)) / 2} y={groundY + 54} fontFamily={fonts.display} fontSize={13} fill={colors.velocity} textAnchor="middle">
                {`${total} m`}
              </SvgText>
            </G>
          )}

          {/* v-t graph */}
          {grid &&
            yTicks.map((y) => (
              <Line key={`gy${y}`} x1={pl} y1={py(y)} x2={width - pr} y2={py(y)} stroke={colors.line} strokeWidth={1} />
            ))}
          {grid &&
            xTicks.map((x) => (
              <Line key={`gx${x}`} x1={px(x)} y1={gTop} x2={px(x)} y2={gBottom} stroke={colors.line} strokeWidth={1} />
            ))}
          <Polygon points={fill} fill={colors.velocity} opacity={0.18} />
          {mode === 'compare' && (
            <Line x1={px(0)} y1={py(u1)} x2={px(stoppingTime(u1, a))} y2={py(0)} stroke={colors.velocity} strokeWidth={2} strokeDasharray="4 3" opacity={0.45} />
          )}
          <Line x1={px(0)} y1={py(u)} x2={px(dur)} y2={py(0)} stroke={colors.velocity} strokeWidth={2.5} strokeLinecap="round" />
          <Line x1={pl} y1={gTop - 4} x2={pl} y2={gBottom} stroke={colors.ink} strokeWidth={1.5} />
          <Line x1={pl} y1={gBottom} x2={width - pr} y2={gBottom} stroke={colors.ink} strokeWidth={1.5} />
          {yTicks.map((y) => (
            <SvgText key={`ly${y}`} x={pl - 6} y={py(y) + 4} {...font} fill={colors.inkMuted} textAnchor="end">
              {y}
            </SvgText>
          ))}
          {xTicks.map((x) => (
            <SvgText key={`lx${x}`} x={px(x)} y={gBottom + 15} {...font} fill={colors.inkMuted} textAnchor="middle">
              {x}
            </SvgText>
          ))}
          <SvgText x={4} y={gTop - 2} {...font} fontFamily={fonts.bodySemi} fill={colors.ink}>
            v / m s⁻¹
          </SvgText>
          <SvgText x={width - pr} y={gBottom - 7} {...font} fontFamily={fonts.bodySemi} fill={colors.ink} textAnchor="end">
            t / s
          </SvgText>
          {done && (
            <SvgText x={px(dur * 0.28)} y={py(u * 0.3)} fontFamily={fonts.bodySemi} fontSize={12} fill={colors.velocity}>
              {`area = ${total} m`}
            </SvgText>
          )}
          <Circle cx={px(tt)} cy={py(v)} r={5} fill={colors.velocity} stroke={colors.surface} strokeWidth={2} />
        </Svg>
      )}
      <Pressable
        onPress={replay}
        accessibilityRole="button"
        accessibilityLabel="Replay animation"
        hitSlop={6}
        style={{ position: 'absolute', top: 4, right: 4, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ fontFamily: fonts.bodySemi, fontSize: 13, color: colors.inkMuted }}>Replay</Text>
      </Pressable>
    </View>
  );
}
