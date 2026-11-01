import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Text as SvgText } from 'react-native-svg';
import { A } from '../content/brakingDemo';
import {
  positionWithReaction,
  speedWithReaction,
  stoppingDistance,
  stoppingTime,
  totalStoppingDistance,
} from '../physics/braking';
import { colors } from '../theme/tokens';
import { fonts } from '../theme/fonts';
import { CAR_H, CAR_W, Car, CarDefs } from './Car';

type Props = {
  height: number;
  // Speed of the run to show. null = nothing revealed yet (empty axes, car at rest).
  u: number | null;
  // 0 = not braking yet. Each increase starts a new run from the beginning.
  playKey: number;
  range: number; // road length shown, m
  xMax: number; // graph time axis, s
  yMax: number; // graph speed axis, m/s
  reaction?: number; // s of constant speed before the brakes go on
  graph?: boolean; // false = road only
  // Earlier runs, drawn faintly so they can be compared with the current one.
  history?: number[];
  // A flag the user placed on the road, in metres; tapping the road reports a position.
  marker?: number | null;
  onRoadTap?: (metres: number) => void;
  onDone?: () => void;
};

export function usePlayback(dur: number, playKey: number, onDone?: () => void) {
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

function Arrow({ x, y, length, dir, color }: { x: number; y: number; length: number; dir: 1 | -1; color: string }) {
  if (length < 6) return null;
  const x2 = x + dir * length;
  const h = 6;
  return (
    <G>
      <Line x1={x} y1={y} x2={x2 - dir * h} y2={y} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <Polygon points={`${x2},${y} ${x2 - dir * h * 1.7},${y - h} ${x2 - dir * h * 1.7},${y + h}`} fill={color} />
    </G>
  );
}

const tidy = (n: number) => Number(n.toFixed(1));

export function BrakingScene({ height, u, playKey, range, xMax, yMax, reaction = 0, graph = true, history = [], marker, onRoadTap, onDone }: Props) {
  const [width, setWidth] = useState(0);
  const dur = u === null ? 0 : reaction + stoppingTime(u, A);
  const t = usePlayback(dur, playKey, onDone);

  const run = u !== null;
  const braking = run && playKey > 0;
  const tt = Math.min(t, dur);
  const clock = braking ? t : 0;
  const s = run ? positionWithReaction(u, A, reaction, clock) : 0;
  const v = run ? speedWithReaction(u, A, reaction, clock) : 0;
  const vAtTt = run ? speedWithReaction(u, A, reaction, braking ? tt : 0) : 0;
  const done = braking && t >= dur;
  const lights = braking && t >= reaction && v > 0;
  const total = run ? totalStoppingDistance(u, A, reaction) : 0;

  // Road strip (top)
  const carScale = graph ? 1.4 : 2;
  const carW = CAR_W * carScale;
  const carH = CAR_H * carScale;
  const roadH = graph ? Math.max(176, height * 0.4) : height;
  const groundY = roadH - 50;
  const padL = carW + 14;
  const padR = 16;
  const roadW = width - padL - padR;
  const sx = (m: number) => padL + (m * roadW) / range;
  const carY = groundY - carH;
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
  const cx = sx(s) - carW / 2;
  const trEnd = Math.min(tt, reaction);
  const skidStart = run ? u * reaction : 0; // the car only skids once the brakes are on

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ height }}
      accessible
      accessibilityLabel={`Animation: a car brakes at ${A} metres per second squared, with a velocity-time graph underneath.`}
    >
      {width > 0 && (
        <Svg width={width} height={height}>
          <CarDefs />
          {graph && (
            <G>
          {yTicks.map((y) => (
            <Line key={`gy${y}`} x1={pl} y1={py(y)} x2={width - pr} y2={py(y)} stroke={colors.line} strokeWidth={1} />
          ))}
          {xTicks.map((x) => (
            <Line key={`gx${x}`} x1={px(x)} y1={gTop} x2={px(x)} y2={gBottom} stroke={colors.line} strokeWidth={1} />
          ))}

            </G>
          )}

          {/* road */}
          <SvgText x={width - 12} y={22} fontFamily={fonts.bodySemi} fontSize={13} fill={colors.acceleration} textAnchor="end">
            {`braking: a = ${A} m/s²`}
          </SvgText>
          <Line x1={0} y1={groundY} x2={width} y2={groundY} stroke={colors.axis} strokeWidth={2} />
          {roadTicks.map((m) => (
            <G key={m}>
              <Line x1={sx(m)} y1={groundY} x2={sx(m)} y2={groundY + 6} stroke={colors.axis} strokeWidth={1.5} />
              <SvgText x={sx(m)} y={groundY + 19} {...font} fill={colors.inkMuted} textAnchor="middle">
                {m === 0 ? '0 m' : m}
              </SvgText>
            </G>
          ))}
          <Line x1={sx(0)} y1={carY - 6} x2={sx(0)} y2={groundY} stroke={colors.inkMuted} strokeWidth={1} strokeDasharray="3 3" />
          {reaction > 0 && run && (
            <G>
              <Line x1={sx(u * reaction)} y1={carY - 6} x2={sx(u * reaction)} y2={groundY} stroke={colors.acceleration} strokeWidth={1.5} strokeDasharray="3 3" />
              <SvgText x={sx(u * reaction) + 5} y={carY - 8} {...font} fill={colors.acceleration}>
                brakes on
              </SvgText>
            </G>
          )}

          {/* earlier runs: where they stopped, and their graph lines */}
          {graph && past.map((h) => (
            <G key={`h${h}`}>
              <Line x1={sx(stoppingDistance(h, A))} y1={groundY - 16} x2={sx(stoppingDistance(h, A))} y2={groundY} stroke={colors.velocity} strokeWidth={2} opacity={0.5} />
              <Line x1={px(0)} y1={py(h)} x2={px(stoppingTime(h, A))} y2={py(0)} stroke={colors.velocity} strokeWidth={2} strokeDasharray="4 3" opacity={0.5} />
            </G>
          ))}

          {/* skid marks + car */}
          {s > skidStart + 0.2 && <Line x1={sx(skidStart)} y1={groundY - 1.5} x2={sx(s)} y2={groundY - 1.5} stroke={colors.inkMuted} strokeWidth={3} opacity={0.35} />}
          <Car x={sx(s)} y={carY} braking={lights} scale={carScale} />

          {/* arrows attached to the car */}
          {run && <Arrow x={cx} y={carY - 14} length={(v / 40) * 80} dir={1} color={colors.velocity} />}
          {run && lights && <Arrow x={cx} y={carY - 30} length={32} dir={-1} color={colors.acceleration} />}
          {run && v > 5 && (
            <SvgText x={cx + (v / 40) * 80 + 6} y={carY - 10} {...font} fontFamily={fonts.bodySemi} fill={colors.velocity}>
              v
            </SvgText>
          )}
          {run && lights && (
            <SvgText x={cx - 42} y={carY - 26} {...font} fontFamily={fonts.bodySemi} fill={colors.acceleration}>
              a
            </SvgText>
          )}

          {/* user's flag */}
          {marker != null && (
            <G>
              <Line x1={sx(marker)} y1={groundY - 34} x2={sx(marker)} y2={groundY} stroke={colors.accent} strokeWidth={2.5} />
              <Polygon points={`${sx(marker)},${groundY - 34} ${sx(marker) + 16},${groundY - 28} ${sx(marker)},${groundY - 22}`} fill={colors.accent} />
              <SvgText x={sx(marker)} y={groundY - 40} fontFamily={fonts.display} fontSize={13} fill={colors.accent} textAnchor="middle">
                {`${Math.round(marker)} m`}
              </SvgText>
            </G>
          )}

          {/* stopping distance bracket */}
          {done && (
            <G>
              <Line x1={sx(0)} y1={groundY + 34} x2={sx(total)} y2={groundY + 34} stroke={colors.velocity} strokeWidth={2} />
              <Line x1={sx(0)} y1={groundY + 29} x2={sx(0)} y2={groundY + 39} stroke={colors.velocity} strokeWidth={2} />
              <Line x1={sx(total)} y1={groundY + 29} x2={sx(total)} y2={groundY + 39} stroke={colors.velocity} strokeWidth={2} />
              <SvgText x={(sx(0) + sx(total)) / 2} y={groundY + 49} fontFamily={fonts.display} fontSize={13} fill={colors.velocity} textAnchor="middle">
                {`${tidy(total)} m`}
              </SvgText>
            </G>
          )}

          {graph && (
            <G>
          {run && (
            <Polygon
              points={`${px(0)},${py(0)} ${px(0)},${py(u)} ${px(trEnd)},${py(u)} ${px(tt)},${py(vAtTt)} ${px(tt)},${py(0)}`}
              fill={colors.velocity}
              opacity={0.28}
            />
          )}
          {run && (
            <Path d={`M ${px(0)} ${py(u)} L ${px(trEnd)} ${py(u)} L ${px(tt)} ${py(vAtTt)}`} stroke={colors.velocity} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          )}
          <Line x1={pl} y1={gTop - 6} x2={pl} y2={gBottom} stroke={colors.axis} strokeWidth={1.5} />
          <Line x1={pl} y1={gBottom} x2={width - pr} y2={gBottom} stroke={colors.axis} strokeWidth={1.5} />
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
            <SvgText x={px(dur * 0.05) + 6} y={py(u! * 0.18)} fontFamily={fonts.bodySemi} fontSize={13} fill={colors.ink}>
              {`area = ${tidy(total)} m`}
            </SvgText>
          )}
          {run && <Circle cx={px(tt)} cy={py(vAtTt)} r={6} fill={colors.velocity} stroke={colors.ink} strokeWidth={2} />}
          {run && !braking && (
            <SvgText x={px(0) + 12} y={py(u) - 8} fontFamily={fonts.bodySemi} fontSize={13} fill={colors.velocity}>
              {`u = ${u} m/s`}
            </SvgText>
          )}
            </G>
          )}
        </Svg>
      )}
      {onRoadTap && width > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Road. Tap to place the flag where the car stops."
          onPress={(e) => {
            // Native gives locationX; react-native-web gives the DOM offsetX.
            const ev = e.nativeEvent as { locationX?: number; offsetX?: number };
            const x = ev.locationX ?? ev.offsetX;
            if (x === undefined || Number.isNaN(x)) return;
            const m = ((x - padL) / roadW) * range;
            onRoadTap(Math.round(Math.min(Math.max(m, 0), range)));
          }}
          style={{ position: 'absolute', left: 0, top: 0, width, height: roadH }}
        />
      )}
    </View>
  );
}
