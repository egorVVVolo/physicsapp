import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Polygon, Rect, Stop, Text as SvgText } from 'react-native-svg';
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

// A run never takes longer than this on screen; faster runs are labelled "time ×N".
const MAX_PLAY = 4; // s
const SETTLE = 0.9; // s of rocking after the car stops

type Playback = { t: number; settle: number; rate: number };

// t: simulated seconds since the run started (stops at dur). settle: real seconds since the car stopped.
export function usePlayback(dur: number, playKey: number, onDone?: () => void): Playback {
  const [state, setState] = useState<Playback>({ t: 0, settle: 0, rate: 1 });
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (playKey === 0) {
      setState({ t: 0, settle: 0, rate: 1 });
      return;
    }
    const playDur = Math.max(Math.min(dur, MAX_PLAY), 0.001);
    const rate = dur / playDur;
    let raf = 0;
    let cancelled = false;
    let finished = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        setState({ t: dur, settle: SETTLE, rate });
        doneRef.current?.();
        return;
      }
      const start = Date.now();
      const tick = () => {
        const el = (Date.now() - start) / 1000;
        setState({ t: Math.min(el * rate, dur), settle: Math.min(Math.max(el - playDur, 0), SETTLE), rate });
        if (!finished && el >= playDur) {
          finished = true;
          doneRef.current?.();
        }
        if (el < playDur + SETTLE) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [playKey, dur]);

  return state;
}

const tidy = (n: number) => Number(n.toFixed(1));

// A rounded value label with a dark background.
function Pill({ x, y, text, color, anchor = 'start' }: { x: number; y: number; text: string; color: string; anchor?: 'start' | 'end' }) {
  const w = text.length * 6.8 + 14;
  const left = anchor === 'start' ? x : x - w;
  return (
    <G>
      <Rect x={left} y={y - 14} width={w} height={20} rx={10} fill={colors.background} opacity={0.9} stroke={color} strokeWidth={1} />
      <SvgText x={left + w / 2} y={y} fontFamily={fonts.bodySemi} fontSize={11.5} fill={color} textAnchor="middle">
        {text}
      </SvgText>
    </G>
  );
}

// Vector arrow: rounded shaft with a soft glow, a solid head, a dot where it is attached to the car.
function VectorArrow({ x, y, length, dir, color }: { x: number; y: number; length: number; dir: 1 | -1; color: string }) {
  if (length < 12) return null;
  const x2 = x + dir * length;
  const hl = 12;
  const hw = 8;
  return (
    <G>
      <Line x1={x} y1={y} x2={x2 - dir * hl * 0.5} y2={y} stroke={color} strokeWidth={11} strokeLinecap="round" opacity={0.2} />
      <Line x1={x} y1={y} x2={x2 - dir * hl * 0.6} y2={y} stroke={color} strokeWidth={4.5} strokeLinecap="round" />
      <Path d={`M ${x2 - dir * hl} ${y - hw} L ${x2} ${y} L ${x2 - dir * hl} ${y + hw} Z`} fill={color} stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
      <Circle cx={x} cy={y} r={4} fill={color} stroke={colors.background} strokeWidth={1.5} />
    </G>
  );
}

export function BrakingScene({ height, u, playKey, range, xMax, yMax, reaction = 0, graph = true, history = [], marker, onRoadTap, onDone }: Props) {
  const [width, setWidth] = useState(0);
  const dur = u === null ? 0 : reaction + stoppingTime(u, A);
  const { t, settle, rate } = usePlayback(dur, playKey, onDone);

  const run = u !== null;
  const braking = run && playKey > 0;
  const tt = Math.min(t, dur);
  const clock = braking ? t : 0;
  const s = run ? positionWithReaction(u, A, reaction, clock) : 0;
  const v = run ? speedWithReaction(u, A, reaction, clock) : 0;
  const vAtTt = v;
  const done = braking && t >= dur;
  const brakeOn = braking && t >= reaction;
  const lights = brakeOn && v > 0;
  const total = run ? totalStoppingDistance(u, A, reaction) : 0;

  // Body language of the braking car (visual only; the motion itself follows the model).
  const brakeSecs = brakeOn ? (t - reaction) / rate : 0; // real seconds since the brakes went on
  const pitch = lights ? 3.4 * Math.min(brakeSecs / 0.3, 1) : done ? 3.4 * Math.exp(-6 * settle) * Math.cos(18 * settle) : 0;
  const wheel = s * 20;

  // Road strip (top)
  const carScale = graph ? 1.4 : 2;
  const carW = CAR_W * carScale;
  const carH = CAR_H * carScale;
  const roadH = graph ? Math.max(180, height * 0.4) : height;
  const groundY = roadH - 50;
  const padL = carW + 14;
  const padR = 16;
  const roadW = width - padL - padR;
  const sx = (m: number) => padL + (m * roadW) / range;
  const carY = groundY - carH;
  const roadStep = range >= 150 ? 40 : 20;
  const roadTicks = Array.from({ length: Math.floor(range / roadStep) + 1 }, (_, i) => i * roadStep);

  // v-t graph (bottom, the larger part)
  const gTop = roadH + 20;
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
  const vLen = (v / 40) * 92;
  const rearX = sx(s) - carW + 15 * carScale;

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
          <Defs>
            <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.velocity} stopOpacity="0.55" />
              <Stop offset="1" stopColor={colors.velocity} stopOpacity="0.08" />
            </LinearGradient>
          </Defs>

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
          <Rect x={0} y={groundY} width={width} height={9} fill="#232835" />
          <Line x1={0} y1={groundY} x2={width} y2={groundY} stroke={colors.axis} strokeWidth={2} />
          {roadTicks.map((m) => (
            <G key={m}>
              <Line x1={sx(m)} y1={groundY + 9} x2={sx(m)} y2={groundY + 14} stroke={colors.axis} strokeWidth={1.5} />
              <SvgText x={sx(m)} y={groundY + 27} {...font} fill={colors.inkMuted} textAnchor="middle">
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
          {graph &&
            past.map((h) => (
              <G key={`h${h}`}>
                <Line x1={sx(stoppingDistance(h, A))} y1={groundY - 16} x2={sx(stoppingDistance(h, A))} y2={groundY} stroke={colors.velocity} strokeWidth={2} opacity={0.5} />
                <Line x1={px(0)} y1={py(h)} x2={px(stoppingTime(h, A))} y2={py(0)} stroke={colors.velocity} strokeWidth={2} strokeDasharray="4 3" opacity={0.5} />
              </G>
            ))}

          {/* tyre marks on the road, smoke from the wheels */}
          {s > skidStart + 0.2 && <Line x1={sx(skidStart)} y1={groundY + 4.5} x2={sx(s)} y2={groundY + 4.5} stroke="#0B0D12" strokeWidth={3.5} opacity={0.9} />}
          {lights &&
            v > 3 &&
            [0, 1, 2, 3].map((j) => {
              const age = (brakeSecs * 2.2 + j / 4) % 1;
              return <Circle key={j} cx={rearX - age * 40 - j * 2} cy={groundY - 4 - age * 18} r={3 + age * 9} fill="#C9CFDB" opacity={0.34 * (1 - age) * Math.min(1, v / 12)} />;
            })}

          <Car x={sx(s)} y={carY} braking={lights} scale={carScale} pitch={pitch} wheel={wheel} />

          {/* arrows attached to the car, with live values */}
          {run && <VectorArrow x={cx} y={carY - 20} length={vLen} dir={1} color={colors.velocity} />}
          {run && v > 0.5 && vLen >= 12 && <Pill x={Math.min(cx + vLen + 10, width - 100)} y={carY - 15} text={`v = ${Math.round(v)} m/s`} color={colors.velocity} />}
          {run && lights && <VectorArrow x={cx} y={carY - 46} length={40} dir={-1} color={colors.acceleration} />}
          {run && lights && <Pill x={cx + 10} y={carY - 41} text="a" color={colors.acceleration} />}

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
              <Line x1={sx(0)} y1={groundY + 40} x2={sx(total)} y2={groundY + 40} stroke={colors.velocity} strokeWidth={2} />
              <Line x1={sx(0)} y1={groundY + 35} x2={sx(0)} y2={groundY + 45} stroke={colors.velocity} strokeWidth={2} />
              <Line x1={sx(total)} y1={groundY + 35} x2={sx(total)} y2={groundY + 45} stroke={colors.velocity} strokeWidth={2} />
            </G>
          )}

          {/* v-t graph */}
          {graph && (
            <G>
              {run && (
                <Polygon
                  points={`${px(0)},${py(0)} ${px(0)},${py(u)} ${px(trEnd)},${py(u)} ${px(tt)},${py(vAtTt)} ${px(tt)},${py(0)}`}
                  fill="url(#areaFill)"
                />
              )}
              {run && (
                <Path d={`M ${px(0)} ${py(u)} L ${px(trEnd)} ${py(u)} L ${px(tt)} ${py(vAtTt)}`} stroke={colors.velocity} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.18} />
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
              {braking && rate > 1.01 && (
                <SvgText x={width - pr} y={gTop - 8} {...font} fill={colors.inkMuted} textAnchor="end">
                  {`time ×${tidy(rate)}`}
                </SvgText>
              )}
              {run && braking && (
                <SvgText x={px(Math.max(dur * 0.08, 0.12)) + 4} y={py(u * 0.14)} fontFamily={fonts.display} fontSize={14} fill={colors.ink}>
                  {`area = ${tidy(s)} m`}
                </SvgText>
              )}
              {run && braking && !done && (
                <G>
                  <Line x1={px(tt)} y1={py(vAtTt)} x2={px(tt)} y2={gBottom} stroke={colors.velocity} strokeWidth={1.2} strokeDasharray="3 3" opacity={0.7} />
                  <Line x1={pl} y1={py(vAtTt)} x2={px(tt)} y2={py(vAtTt)} stroke={colors.velocity} strokeWidth={1.2} strokeDasharray="3 3" opacity={0.7} />
                </G>
              )}
              {run && <Circle cx={px(tt)} cy={py(vAtTt)} r={11} fill={colors.velocity} opacity={0.22} />}
              {run && <Circle cx={px(tt)} cy={py(vAtTt)} r={6} fill={colors.velocity} stroke={colors.ink} strokeWidth={2} />}
              {run && !braking && (
                <Pill x={px(0) + 14} y={py(u) - 8} text={`u = ${u} m/s`} color={colors.velocity} />
              )}
            </G>
          )}
          {done && (
            <SvgText x={(sx(0) + sx(total)) / 2} y={groundY + 58} fontFamily={fonts.display} fontSize={14} fill={colors.velocity} textAnchor="middle">
              {`${tidy(total)} m`}
            </SvgText>
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
