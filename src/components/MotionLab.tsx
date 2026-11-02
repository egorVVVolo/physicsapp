import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, PanResponder, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Polygon, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { useTween } from '../lib/useTween';
import {
  accelerationAt,
  displacementAt,
  DURATION,
  KNOT_TIMES,
  Knots,
  pieceArea,
  piecesUpTo,
  positionRange,
  velocityAt,
} from '../physics/motion';
import { fonts } from '../theme/fonts';
import { colors } from '../theme/tokens';
import { Pill, VectorArrow } from './BrakingScene';
import { CAR_H, CAR_W, Car, CarDefs } from './Car';
import { tapHaptic } from './stepParts';

// Motion Lab (Scene A): a car on a track, a v-t graph you can drag, and the s-t graph that follows.
// Everything is computed from the knots in src/physics/motion.ts.
export const V_MIN = -12;
export const V_MAX = 16;
const PLAY_SECONDS = 6; // real time for the 8 s run
const CAR_SCALE = 1.3;
const PL = 52;
const PR = 16;

type Props = {
  knots: Knots;
  onChange: (next: Knots) => void;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  showFps?: boolean;
};

const tidy = (n: number) => String(Number(n.toFixed(1)));
const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

export function MotionLab({ knots, onChange, playing, onPlayingChange, showFps }: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [tc, setTc] = useState(DURATION); // time cursor, s
  const [active, setActive] = useState<number | null>(null);
  const [fps, setFps] = useState(0);

  const { w: W, h: H } = size;
  const trackH = Math.round(H * 0.3);
  const vH = Math.round(H * 0.38);
  const sH = H - trackH - vH;
  const vTop = trackH;
  const sTop = trackH + vH;
  const vGTop = vTop + 24;
  const vGBot = vTop + vH - 22;
  const sGTop = sTop + 24;
  const sGBot = sTop + sH - 22;

  // The track and the s axis stretch to fit the run, easing so nothing jumps while you drag.
  const range = useMemo(() => positionRange(knots), [knots]);
  const loTarget = Math.floor(range.min / 20) * 20;
  const hiTarget = Math.max(Math.ceil(range.max / 20) * 20, loTarget + 60);
  const lo = useTween(loTarget, 450);
  const hi = useTween(hiTarget, 450);

  const px = (t: number) => PL + (t * (W - PL - PR)) / DURATION;
  const yv = (v: number) => vGBot - ((v - V_MIN) * (vGBot - vGTop)) / (V_MAX - V_MIN);
  const ys = (s: number) => sGBot - ((s - lo) * (sGBot - sGTop)) / (hi - lo);
  const tx = (s: number) => 36 + ((s - lo) * (W - 72)) / (hi - lo);

  // Latest values for the gesture handlers, which are created once.
  const live = useRef({ knots, onChange, W, vGTop, vGBot, vTop, sTop, onPlayingChange });
  live.current = { knots, onChange, W, vGTop, vGBot, vTop, sTop, onPlayingChange };

  // Play loop: advances the cursor along the run, then stops at the end.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        setTc(DURATION);
        live.current.onPlayingChange(false);
        return;
      }
      const t0 = tc >= DURATION ? 0 : tc;
      const start = Date.now();
      let frames = 0;
      let mark = start;
      const tick = () => {
        const now = Date.now();
        const t = Math.min(t0 + ((now - start) / 1000) * (DURATION / PLAY_SECONDS), DURATION);
        setTc(t);
        frames++;
        if (now - mark >= 1000) {
          setFps(Math.round((frames * 1000) / (now - mark)));
          frames = 0;
          mark = now;
        }
        if (t >= DURATION) live.current.onPlayingChange(false);
        else raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
    // The cursor is read once, when play starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  // Drag a knot of the v-t graph: the touch picks the nearest knot in time and moves it up or down.
  const vPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (ev) => {
        const ne = ev.nativeEvent as unknown as { locationX?: number; locationY?: number; offsetX?: number; offsetY?: number };
        const x = ne.locationX ?? ne.offsetX ?? 0;
        const y = ne.locationY ?? ne.offsetY ?? 0;
        const l = live.current;
        const tt = ((x - PL) * DURATION) / (l.W - PL - PR);
        const k = clamp(Math.round(tt / (DURATION / (KNOT_TIMES.length - 1))), 0, KNOT_TIMES.length - 1);
        grab.current = { k, y0: y, last: l.knots[k] };
        l.onPlayingChange(false);
        setActive(k);
        moveKnot(y);
      },
      onPanResponderMove: (_ev, g) => moveKnot(grab.current.y0 + g.dy),
      onPanResponderRelease: () => setActive(null),
      onPanResponderTerminate: () => setActive(null),
    }),
  ).current;
  const grab = useRef({ k: 0, y0: 0, last: 0 });
  function moveKnot(localY: number) {
    const l = live.current;
    const y = l.vTop + localY;
    const v = clamp(Math.round(V_MIN + ((l.vGBot - y) * (V_MAX - V_MIN)) / (l.vGBot - l.vGTop)), V_MIN, V_MAX);
    if (v === l.knots[grab.current.k]) return;
    tapHaptic();
    grab.current.last = v;
    const next = l.knots.slice();
    next[grab.current.k] = v;
    l.onChange(next);
  }

  // Drag along the s-t graph to move the time cursor.
  const sPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (ev) => {
        const ne = ev.nativeEvent as unknown as { locationX?: number; offsetX?: number };
        scrub.current = ne.locationX ?? ne.offsetX ?? 0;
        live.current.onPlayingChange(false);
        moveCursor(scrub.current);
      },
      onPanResponderMove: (_ev, g) => moveCursor(scrub.current + g.dx),
    }),
  ).current;
  const scrub = useRef(0);
  function moveCursor(x: number) {
    const l = live.current;
    setTc(clamp(((x - PL) * DURATION) / (l.W - PL - PR), 0, DURATION));
  }

  const t = tc;
  const v = velocityAt(knots, t);
  const a = accelerationAt(knots, Math.min(t, DURATION - 0.001));
  const s = displacementAt(knots, t);
  const dir: 1 | -1 = v < 0 ? -1 : 1;
  const braking = a * v < -0.3;

  const pieces = piecesUpTo(knots, t);
  const sTick = hi - lo > 160 ? 40 : 20;
  const sTicks: number[] = [];
  for (let m = Math.ceil(lo / sTick) * sTick; m <= hi; m += sTick) sTicks.push(m);
  const vTicks = [-12, -8, -4, 0, 4, 8, 12, 16];
  const font = { fontFamily: fonts.bodyMedium, fontSize: 13 };

  // s-t curve, drawn as many short straight pieces.
  const curve = (upTo: number) => {
    const n = Math.max(Math.ceil((upTo / DURATION) * 80), 1);
    let d = '';
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * upTo;
      d += `${i === 0 ? 'M' : 'L'} ${px(tt)} ${ys(displacementAt(knots, tt))} `;
    }
    return d;
  };

  // Car on the track.
  const roadY = trackH - 34;
  const carW = CAR_W * CAR_SCALE;
  const carCx = clamp(tx(s), 36 + carW / 2, W - 36 - carW / 2);
  const carTop = roadY - CAR_H * CAR_SCALE + 4;
  const wheel = ((s * (W - 72)) / (hi - lo) / (7.2 * CAR_SCALE)) * (180 / Math.PI);
  const pitch = clamp(-a * dir * 0.7, -4, 4);

  let pillX = 12;
  const readout = (text: string, color: string) => {
    const el = <Pill key={text} x={pillX} y={22} text={text} color={color} />;
    pillX += text.length * 7.6 + 18 + 6;
    return el;
  };

  return (
    <View
      style={{ flex: 1 }}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      accessible
      accessibilityLabel={`Motion lab. A car on a track with a velocity-time graph and a position-time graph. Now at ${tidy(t)} seconds, velocity ${tidy(v)} metres per second, position ${tidy(s)} metres.`}
    >
      {W > 0 && (
        <>
          <Svg width={W} height={H} pointerEvents="none">
            <Defs>
              <LinearGradient id="labPos" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.velocity} stopOpacity="0.55" />
                <Stop offset="1" stopColor={colors.velocity} stopOpacity="0.12" />
              </LinearGradient>
              <LinearGradient id="labNeg" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.backward} stopOpacity="0.12" />
                <Stop offset="1" stopColor={colors.backward} stopOpacity="0.55" />
              </LinearGradient>
              <LinearGradient id="labRoad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#2A3040" />
                <Stop offset="1" stopColor="#1B1F29" />
              </LinearGradient>
            </Defs>
            <CarDefs />

            {/* Track */}
            <Rect x={0} y={roadY} width={W} height={26} fill="url(#labRoad)" />
            <Line x1={0} y1={roadY} x2={W} y2={roadY} stroke={colors.axis} strokeWidth={1.5} />
            {sTicks.map((m) => (
              <G key={`tt${m}`}>
                <Line x1={tx(m)} y1={roadY} x2={tx(m)} y2={roadY + 8} stroke={colors.axis} strokeWidth={1.5} />
                <SvgText x={tx(m)} y={roadY + 21} {...font} fill={colors.inkMuted} textAnchor="middle">
                  {m}
                </SvgText>
              </G>
            ))}
            <Line x1={tx(0)} y1={roadY - 22} x2={tx(0)} y2={roadY} stroke={colors.accent} strokeWidth={2} strokeDasharray="3 3" />
            <SvgText x={tx(0) + 4} y={roadY - 12} {...font} fill={colors.accent}>
              start
            </SvgText>
            <SvgText x={W - 6} y={roadY + 21} {...font} fontFamily={fonts.bodySemi} fill={colors.ink} textAnchor="end">
              m
            </SvgText>

            {/* Car, mirrored when it drives backwards, with velocity and acceleration arrows */}
            <G transform={`translate(${carCx} 0) scale(${dir} 1) translate(${-carCx} 0)`}>
              <Car x={carCx + carW / 2} y={carTop} braking={braking} scale={CAR_SCALE} pitch={pitch} wheel={wheel * dir} />
            </G>
            <VectorArrow x={carCx} y={carTop - 12} length={Math.min(Math.abs(v) * 6, 130)} dir={dir} color={colors.velocity} />
            {Math.abs(a) > 0.01 && (
              <VectorArrow x={carCx} y={carTop - 32} length={Math.min(Math.abs(a) * 14, 90)} dir={a >= 0 ? 1 : -1} color={colors.acceleration} />
            )}

            {readout(`t = ${tidy(t)} s`, colors.accent)}
            {readout(`v = ${tidy(v)} m/s`, colors.velocity)}
            {readout(`s = ${tidy(s)} m`, colors.ink)}

            {/* v-t graph */}
            <Rect x={0} y={vTop} width={W} height={vH} fill={colors.surface} opacity={0.5} />
            {vTicks.map((y) => (
              <G key={`vy${y}`}>
                <Line x1={PL} y1={yv(y)} x2={W - PR} y2={yv(y)} stroke={y === 0 ? colors.axis : colors.line} strokeWidth={y === 0 ? 1.5 : 1} />
                <SvgText x={PL - 16} y={yv(y) + 5} {...font} fill={colors.inkMuted} textAnchor="end">
                  {y}
                </SvgText>
              </G>
            ))}
            {KNOT_TIMES.map((x) => (
              <G key={`vx${x}`}>
                <Line x1={px(x)} y1={vGTop} x2={px(x)} y2={vGBot} stroke={colors.line} strokeWidth={1} />
                <SvgText x={px(x)} y={vGBot + 15} {...font} fill={colors.inkMuted} textAnchor="middle">
                  {x}
                </SvgText>
              </G>
            ))}
            {pieces.map((p, i) => {
              const y0 = yv(0);
              return (
                <Polygon
                  key={i}
                  points={`${px(p.t0)},${y0} ${px(p.t0)},${yv(p.v0)} ${px(p.t1)},${yv(p.v1)} ${px(p.t1)},${y0}`}
                  fill={pieceArea(p) >= 0 ? 'url(#labPos)' : 'url(#labNeg)'}
                />
              );
            })}
            <Path
              d={KNOT_TIMES.map((x, i) => `${i === 0 ? 'M' : 'L'} ${px(x)} ${yv(knots[i])}`).join(' ')}
              stroke={colors.velocity}
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={0.18}
            />
            <Path
              d={KNOT_TIMES.map((x, i) => `${i === 0 ? 'M' : 'L'} ${px(x)} ${yv(knots[i])}`).join(' ')}
              stroke={colors.velocity}
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Line x1={px(t)} y1={vGTop} x2={px(t)} y2={vGBot} stroke={colors.accent} strokeWidth={1.5} strokeDasharray="4 3" />
            <Circle cx={px(t)} cy={yv(v)} r={5} fill={colors.accent} stroke={colors.background} strokeWidth={2} />
            {KNOT_TIMES.map((x, i) => (
              <G key={`k${x}`}>
                {active === i && <Circle cx={px(x)} cy={yv(knots[i])} r={20} fill={colors.velocity} opacity={0.25} />}
                <Circle cx={px(x)} cy={yv(knots[i])} r={active === i ? 11 : 9} fill={colors.ink} stroke={colors.velocity} strokeWidth={3.5} />
              </G>
            ))}
            {active != null && <Pill x={clamp(px(KNOT_TIMES[active]), 70, W - 70) - 38} y={yv(knots[active]) - 20} text={`${knots[active]} m/s`} color={colors.ink} />}
            {active == null && <Pill x={W - PR - 4} y={vGTop + 22} anchor="end" text={`a = ${tidy(accelerationAt(knots, Math.min(t, DURATION - 0.001)))} m/s²`} color={colors.acceleration} />}
            <Line x1={PL} y1={vGTop - 6} x2={PL} y2={vGBot} stroke={colors.axis} strokeWidth={1.5} />
            <SvgText x={4} y={vTop + 14} {...font} fontFamily={fonts.bodySemi} fill={colors.ink}>
              v / m s⁻¹
            </SvgText>
            <SvgText x={W - PR - 14} y={vGBot + 15} {...font} fontFamily={fonts.bodySemi} fill={colors.ink} textAnchor="end">
              t / s
            </SvgText>

            {/* s-t graph */}
            {sTicks.map((m) => (
              <G key={`sy${m}`}>
                <Line x1={PL} y1={ys(m)} x2={W - PR} y2={ys(m)} stroke={m === 0 ? colors.axis : colors.line} strokeWidth={m === 0 ? 1.5 : 1} />
                <SvgText x={PL - 16} y={ys(m) + 5} {...font} fill={colors.inkMuted} textAnchor="end">
                  {m}
                </SvgText>
              </G>
            ))}
            {KNOT_TIMES.map((x) => (
              <G key={`sx${x}`}>
                <Line x1={px(x)} y1={sGTop} x2={px(x)} y2={sGBot} stroke={colors.line} strokeWidth={1} />
                <SvgText x={px(x)} y={sGBot + 15} {...font} fill={colors.inkMuted} textAnchor="middle">
                  {x}
                </SvgText>
              </G>
            ))}
            <Path d={curve(DURATION)} stroke={colors.velocity} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.3} />
            {t > 0 && (
              <>
                <Path d={curve(t)} stroke={colors.velocity} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.18} />
                <Path d={curve(t)} stroke={colors.velocity} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}
            <Line x1={px(t)} y1={sGTop} x2={px(t)} y2={sGBot} stroke={colors.accent} strokeWidth={1.5} strokeDasharray="4 3" />
            <Line x1={PL} y1={ys(s)} x2={px(t)} y2={ys(s)} stroke={colors.accent} strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
            <Circle cx={px(t)} cy={ys(s)} r={6} fill={colors.accent} stroke={colors.background} strokeWidth={2} />
            <Line x1={PL} y1={sGTop - 6} x2={PL} y2={sGBot} stroke={colors.axis} strokeWidth={1.5} />
            <SvgText x={4} y={sTop + 14} {...font} fontFamily={fonts.bodySemi} fill={colors.ink}>
              s / m
            </SvgText>
            <SvgText x={W - PR - 14} y={sGBot + 15} {...font} fontFamily={fonts.bodySemi} fill={colors.ink} textAnchor="end">
              t / s
            </SvgText>
            {showFps && (
              <SvgText x={W - 8} y={roadY - 8} {...font} fill={colors.inkMuted} textAnchor="end">
                {fps > 0 ? `${fps} fps` : 'fps'}
              </SvgText>
            )}
          </Svg>

          {/* Touch areas on top of the two graphs */}
          <View {...vPan.panHandlers} style={{ position: 'absolute', left: 0, right: 0, top: vTop, height: vH }} />
          <View {...sPan.panHandlers} style={{ position: 'absolute', left: 0, right: 0, top: sTop, height: sH }} />
        </>
      )}
    </View>
  );
}
