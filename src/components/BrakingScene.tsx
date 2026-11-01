import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { A } from '../content/brakingDemo';
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
  // Speed of the run to show. null = nothing revealed yet (empty axes, car at rest).
  u: number | null;
  // 0 = not braking yet. Each increase starts a new run from the beginning.
  playKey: number;
  range: number; // road length shown, m
  xMax: number; // graph time axis, s
  yMax: number; // graph speed axis, m/s
  // Earlier runs, drawn faintly so they can be compared with the current one.
  history?: number[];
  onDone?: () => void;
};

function usePlayback(dur: number, playKey: number, onDone?: () => void) {
  const [t, setT] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (playKey === 0) {
      setT(0);
      return;
    }
    let raf = 0;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        setT(dur);
        doneRef.current?.();
        return;
      }
      const start = Date.now();
      const tick = () => {
        const elapsed = (Date.now() - start) / 1000;
        setT(Math.min(elapsed, dur));
        if (elapsed < dur) raf = requestAnimationFrame(tick);
        else doneRef.current?.();
      };
      raf = requestAnimationFrame(tick);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [playKey, dur]);

  return t;
}

// Car faces right: bonnet and headlight on the right, brake light on the left.
const CAR_W = 72;
const CAR_H = 35;
const BODY = 'M0 28 L0 19 Q0 15 4 14 L16 12 L25 2 L50 2 L61 12 L69 15 Q72 17 72 21 L72 28 Z';

function Car({ x, y, braking }: { x: number; y: number; braking: boolean }) {
  return (
    <G transform={`translate(${x - CAR_W} ${y})`}>
      <Path d={BODY} fill={colors.ink} />
      <Path d="M20 12 L27 5 L35 5 L35 12 Z" fill="#DCE5FF" />
      <Path d="M39 5 L49 5 L57 12 L39 12 Z" fill="#DCE5FF" />
      <Rect x={0} y={17} width={4} height={5} rx={1} fill={braking ? colors.acceleration : '#7A828F'} />
      <Rect x={68} y={18} width={4} height={4} rx={1} fill="#FFC53D" />
      {[17, 55].map((cx) => (
        <G key={cx}>
          <Circle cx={cx} cy={28} r={7} fill={colors.ink} stroke={colors.surface} strokeWidth={2} />
          <Circle cx={cx} cy={28} r={2.5} fill={colors.surface} />
        </G>
      ))}
    </G>
  );
}

function Arrow({ x, y, length, dir, color }: { x: number; y: number; length: number; dir: 1 | -1; color: string }) {
  if (length < 6) return null;
  const x2 = x + dir * length;
  const h = 5;
  return (
    <G>
      <Line x1={x} y1={y} x2={x2 - dir * h} y2={y} stroke={color} strokeWidth={3.5} strokeLinecap="round" />
      <Polygon points={`${x2},${y} ${x2 - dir * h * 1.7},${y - h} ${x2 - dir * h * 1.7},${y + h}`} fill={color} />
    </G>
  );
}

export function BrakingScene({ height, u, playKey, range, xMax, yMax, history = [], onDone }: Props) {
  const [width, setWidth] = useState(0);
  const dur = u === null ? 0 : stoppingTime(u, A);
  const t = usePlayback(dur, playKey, onDone);

  const run = u !== null;
  const braking = run && playKey > 0;
  const tt = Math.min(t, dur);
  const s = run ? positionDuringBraking(u, A, t) : 0;
  const v = run ? speedDuringBraking(u, A, braking ? t : 0) : 0;
  const done = braking && t >= dur;
  const total = run ? stoppingDistance(u, A) : 0;

  // Road strip (top)
  const roadH = Math.max(128, height * 0.34);
  const groundY = roadH - 50;
  const padL = 84;
  const padR = 16;
  const sx = (m: number) => padL + (m * (width - padL - padR)) / range;
  const carY = groundY - CAR_H;
  const roadStep = range >= 150 ? 40 : 20;
  const roadTicks = Array.from({ length: Math.floor(range / roadStep) + 1 }, (_, i) => i * roadStep);

  // v-t graph (bottom, the larger part)
  const gTop = roadH + 18;
  const gBottom = height - 28;
  const pl = 44;
  const pr = 14;
  const px = (sec: number) => pl + (sec * (width - pl - pr)) / xMax;
  const py = (vel: number) => gBottom - (vel * (gBottom - gTop)) / yMax;
  const xStep = xMax > 7 ? 2 : 1;
  const yStep = yMax > 40 ? 20 : 10;
  const xTicks = Array.from({ length: Math.floor(xMax / xStep) + 1 }, (_, i) => i * xStep);
  const yTicks = Array.from({ length: Math.floor(yMax / yStep) + 1 }, (_, i) => i * yStep);

  const font = { fontFamily: fonts.bodyMedium, fontSize: 11 };
  const past = history.filter((h) => h !== u);
  const cx = sx(s) - CAR_W / 2;

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ height }}
      accessible
      accessibilityLabel={`Animation: a car brakes at ${A} metres per second squared, with a velocity-time graph underneath.`}
    >
      {width > 0 && (
        <Svg width={width} height={height}>
          {/* graph grid and axes */}
          {yTicks.map((y) => (
            <Line key={`gy${y}`} x1={pl} y1={py(y)} x2={width - pr} y2={py(y)} stroke={colors.line} strokeWidth={1} />
          ))}
          {xTicks.map((x) => (
            <Line key={`gx${x}`} x1={px(x)} y1={gTop} x2={px(x)} y2={gBottom} stroke={colors.line} strokeWidth={1} />
          ))}

          {/* road */}
          <SvgText x={width - 10} y={20} fontFamily={fonts.bodySemi} fontSize={13} fill={colors.acceleration} textAnchor="end">
            {`braking: a = ${A} m/s²`}
          </SvgText>
          <Line x1={0} y1={groundY} x2={width} y2={groundY} stroke={colors.ink} strokeWidth={2} />
          {roadTicks.map((m) => (
            <G key={m}>
              <Line x1={sx(m)} y1={groundY} x2={sx(m)} y2={groundY + 6} stroke={colors.ink} strokeWidth={1.5} />
              <SvgText x={sx(m)} y={groundY + 19} {...font} fill={colors.inkMuted} textAnchor="middle">
                {m === 0 ? '0 m' : m}
              </SvgText>
            </G>
          ))}
          <Line x1={sx(0)} y1={carY - 6} x2={sx(0)} y2={groundY} stroke={colors.inkMuted} strokeWidth={1} strokeDasharray="3 3" />

          {/* earlier runs: where they stopped, and their graph lines */}
          {past.map((h) => (
            <G key={`h${h}`}>
              <Line x1={sx(stoppingDistance(h, A))} y1={groundY - 14} x2={sx(stoppingDistance(h, A))} y2={groundY} stroke={colors.velocity} strokeWidth={2} opacity={0.4} />
              <Line x1={px(0)} y1={py(h)} x2={px(stoppingTime(h, A))} y2={py(0)} stroke={colors.velocity} strokeWidth={2} strokeDasharray="4 3" opacity={0.4} />
            </G>
          ))}

          {/* skid marks + car */}
          {s > 0.2 && <Line x1={sx(0)} y1={groundY - 1.5} x2={sx(s)} y2={groundY - 1.5} stroke={colors.ink} strokeWidth={3} opacity={0.22} />}
          {run && <Car x={sx(s)} y={carY} braking={braking && v > 0} />}
          {!run && <Car x={sx(0)} y={carY} braking={false} />}

          {/* arrows attached to the car */}
          {run && <Arrow x={cx} y={carY - 12} length={(v / 40) * 80} dir={1} color={colors.velocity} />}
          {run && v > 0 && <Arrow x={cx} y={carY - 28} length={32} dir={-1} color={colors.acceleration} />}
          {run && v > 5 && (
            <SvgText x={cx + (v / 40) * 80 + 6} y={carY - 8} {...font} fontFamily={fonts.bodySemi} fill={colors.velocity}>
              v
            </SvgText>
          )}
          {run && v > 0 && (
            <SvgText x={cx - 42} y={carY - 24} {...font} fontFamily={fonts.bodySemi} fill={colors.acceleration}>
              a
            </SvgText>
          )}

          {/* stopping distance bracket */}
          {done && (
            <G>
              <Line x1={sx(0)} y1={groundY + 34} x2={sx(total)} y2={groundY + 34} stroke={colors.velocity} strokeWidth={2} />
              <Line x1={sx(0)} y1={groundY + 29} x2={sx(0)} y2={groundY + 39} stroke={colors.velocity} strokeWidth={2} />
              <Line x1={sx(total)} y1={groundY + 29} x2={sx(total)} y2={groundY + 39} stroke={colors.velocity} strokeWidth={2} />
              <SvgText x={(sx(0) + sx(total)) / 2} y={groundY + 48} fontFamily={fonts.display} fontSize={13} fill={colors.velocity} textAnchor="middle">
                {`${total} m`}
              </SvgText>
            </G>
          )}

          {/* v-t graph */}
          {run && <Polygon points={`${px(0)},${py(0)} ${px(0)},${py(u)} ${px(tt)},${py(u - A * tt)} ${px(tt)},${py(0)}`} fill={colors.velocity} opacity={0.18} />}
          {run && <Line x1={px(0)} y1={py(u)} x2={px(tt)} y2={py(u - A * tt)} stroke={colors.velocity} strokeWidth={3} strokeLinecap="round" />}
          <Line x1={pl} y1={gTop - 6} x2={pl} y2={gBottom} stroke={colors.ink} strokeWidth={1.5} />
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
          <SvgText x={4} y={gTop - 8} {...font} fontFamily={fonts.bodySemi} fill={colors.ink}>
            v / m s⁻¹
          </SvgText>
          <SvgText x={width - pr} y={gBottom - 7} {...font} fontFamily={fonts.bodySemi} fill={colors.ink} textAnchor="end">
            t / s
          </SvgText>
          {done && (
            <SvgText x={px(dur * 0.05)} y={py(u! * 0.18)} fontFamily={fonts.bodySemi} fontSize={13} fill={colors.velocity}>
              {`area = ${total} m`}
            </SvgText>
          )}
          {run && <Circle cx={px(tt)} cy={py(v)} r={5.5} fill={colors.velocity} stroke={colors.surface} strokeWidth={2} />}
          {run && !braking && (
            <SvgText x={px(0) + 10} y={py(u) - 8} fontFamily={fonts.bodySemi} fontSize={13} fill={colors.velocity}>
              {`u = ${u} m/s`}
            </SvgText>
          )}
        </Svg>
      )}
    </View>
  );
}
