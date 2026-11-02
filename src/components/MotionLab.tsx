import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, PanResponder, Pressable, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Polygon, Rect, Stop, Text as SvgText } from 'react-native-svg';
import type { LabView } from '../engine/types';
import { cameraX, FOLLOW_WINDOW, isVisible, overviewX, pixelsPerMetre, followX } from '../lib/camera';
import { useTween, useTweenArray } from '../lib/useTween';
import { accelerationAt, displacementAt, duration, pieceArea, piecesUpTo, positionRange, velocityAt } from '../physics/motion';
import { fonts } from '../theme/fonts';
import { colors } from '../theme/tokens';
import { Pill, VectorArrow } from './BrakingScene';
import { CAR_H, CAR_W, Car, CarDefs } from './Car';
import { tapHaptic } from './stepParts';

// Motion Lab (Scene A): a car on a track, a v-t graph whose points can be dragged,
// and the s-t graph that follows. Everything is computed from src/physics/motion.ts.
const PLAY_SECONDS = 6; // real time for a whole run
const CAR_SCALE = 1.3;
const PL = 52;
const PR = 16;

type Props = LabView & {
  onChange?: (speeds: number[]) => void;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  // hideRun views stay hidden until this is true (the answer is in).
  revealed?: boolean;
  height?: number; // fixed height; otherwise fills the parent
  showFps?: boolean;
  marker?: number | null; // a flag the learner placed on the track, m
  onTrackTap?: (metres: number) => void;
};

const tidy = (n: number) => String(Number(n.toFixed(1)));
const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

export function MotionLab({
  graph: graphIn,
  editable,
  showSt = true,
  showVt = true,
  track = true,
  hideRun,
  areaNumbers,
  target,
  tangent,
  slopes,
  readouts,
  arrows = 'v',
  trackRange,
  focus,
  vRange = [-12, 16],
  cursor,
  onChange,
  playing,
  onPlayingChange,
  revealed,
  height,
  showFps,
  marker,
  onTrackTap,
}: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const D = duration(graphIn);
  // The graph the car follows glides to the learner's graph, so dragging a dot never makes anything jump.
  const speeds = useTweenArray(graphIn.v, 160);
  const graph = useMemo(() => ({ t: graphIn.t, v: speeds }), [graphIn.t, speeds]);
  const [tc, setTc] = useState(cursor ?? D); // time cursor, s
  const [active, setActive] = useState<number | null>(null);
  const [fps, setFps] = useState(0);
  const [V_MIN, V_MAX] = vRange;
  const hidden = !!hideRun && !revealed;

  const { w: W } = size;
  const H = height ?? size.h;
  const trackH = track ? Math.round(H * (target || onTrackTap ? 0.36 : showSt ? 0.3 : 0.32)) : 0;
  const vH = !showVt ? 0 : showSt ? Math.round(H * (track ? 0.38 : 0.5)) : H - trackH;
  const sH = showSt ? H - trackH - vH : 0;
  const vTop = trackH;
  const sTop = trackH + vH;
  const vGTop = vTop + 24;
  const vGBot = vTop + vH - 36;
  const sGTop = sTop + 24;
  const sGBot = sTop + sH - 36;

  // The track and the s axis stretch to fit the run, easing so nothing jumps while you drag.
  const range = useMemo(() => positionRange(graph), [graph]);
  const minS = Math.min(range.min, target?.s ?? 0, marker ?? 0);
  const maxS = Math.max(range.max, target?.s ?? 0, marker ?? 0);
  const loTarget = trackRange ? trackRange[0] : Math.floor(minS / 20) * 20;
  const hiTarget = trackRange ? trackRange[1] : Math.max(Math.ceil((maxS + 1) / 20) * 20, loTarget + 60);
  const lo = useTween(loTarget, 450);
  const hi = useTween(hiTarget, 450);

  // One camera: it follows the car, or shows the whole track while the learner picks a place. Moving between the two is a blend.
  const wantOverview = !!onTrackTap && (!revealed || (!playing && tc >= D - 1e-9));
  const mix = useTween(wantOverview ? 0 : 1, 700);

  const px = (t: number) => PL + (t * (W - PL - PR)) / D;
  const yv = (v: number) => vGBot - ((v - V_MIN) * (vGBot - vGTop)) / (V_MAX - V_MIN);
  const ys = (s: number) => sGBot - ((s - lo) * (sGBot - sGTop)) / (hi - lo);

  // Latest values for the gesture handlers, which are created once.
  const live = useRef({ graph: graphIn, onChange, W, D, vGTop, vGBot, vTop, onPlayingChange, editable, V_MIN, V_MAX });
  live.current = { graph: graphIn, onChange, W, D, vGTop, vGBot, vTop, onPlayingChange, editable, V_MIN, V_MAX };

  // When a hidden run is revealed, start from the beginning.
  useEffect(() => {
    if (hideRun && revealed) setTc(0);
  }, [hideRun, revealed]);

  // Play loop: advances the cursor along the run, then stops at the end.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        setTc(live.current.D);
        live.current.onPlayingChange(false);
        return;
      }
      const d = live.current.D;
      const t0 = tc >= d || hidden ? 0 : tc;
      const start = Date.now();
      let frames = 0;
      let mark = start;
      const tick = () => {
        const now = Date.now();
        const t = Math.min(t0 + ((now - start) / 1000) * (d / PLAY_SECONDS), d);
        setTc(t);
        frames++;
        if (now - mark >= 1000) {
          setFps(Math.round((frames * 1000) / (now - mark)));
          frames = 0;
          mark = now;
        }
        if (t >= d) live.current.onPlayingChange(false);
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

  // Drag a point of the v-t graph: the touch picks the nearest editable point in time and moves it up or down.
  const grab = useRef({ k: 0, y0: 0 });
  const vPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !!live.current.editable?.length,
      onMoveShouldSetPanResponder: () => !!live.current.editable?.length,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (ev) => {
        const ne = ev.nativeEvent as unknown as { locationX?: number; locationY?: number; offsetX?: number; offsetY?: number };
        const x = ne.locationX ?? ne.offsetX ?? 0;
        const y = ne.locationY ?? ne.offsetY ?? 0;
        const l = live.current;
        const tt = ((x - PL) * l.D) / (l.W - PL - PR);
        let best = l.editable![0];
        for (const k of l.editable!) if (Math.abs(l.graph.t[k] - tt) < Math.abs(l.graph.t[best] - tt)) best = k;
        grab.current = { k: best, y0: y };
        l.onPlayingChange(false);
        setActive(best);
        moveKnot(y);
      },
      onPanResponderMove: (_ev, g) => moveKnot(grab.current.y0 + g.dy),
      onPanResponderRelease: () => setActive(null),
      onPanResponderTerminate: () => setActive(null),
    }),
  ).current;
  function moveKnot(localY: number) {
    const l = live.current;
    const y = l.vTop + localY;
    const v = clamp(Math.round(l.V_MIN + ((l.vGBot - y) * (l.V_MAX - l.V_MIN)) / (l.vGBot - l.vGTop)), l.V_MIN, l.V_MAX);
    if (v === l.graph.v[grab.current.k]) return;
    tapHaptic();
    const next = l.graph.v.slice();
    next[grab.current.k] = v;
    l.onChange?.(next);
  }

  // Drag along the s-t graph to move the time cursor.
  const scrub = useRef(0);
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
  function moveCursor(x: number) {
    const l = live.current;
    setTc(clamp(((x - PL) * l.D) / (l.W - PL - PR), 0, l.D));
  }

  const t = hidden ? 0 : tc;
  const tSafe = Math.min(t, D - 0.001);
  const v = velocityAt(graph, t);
  const a = accelerationAt(graph, tSafe);
  const s = displacementAt(graph, t);
  const dir: 1 | -1 = v < 0 ? -1 : 1;
  const braking = !hidden && a * v < -0.3;

  const pieces = hidden ? [] : piecesUpTo(graph, t);
  const sTick = hi - lo > 160 ? 40 : 20;
  const sTicks: number[] = [];
  for (let m = Math.ceil(lo / sTick) * sTick; m <= hi; m += sTick) sTicks.push(m);
  const vTicks: number[] = [];
  for (let y = Math.ceil(V_MIN / 4) * 4; y <= V_MAX; y += 4) vTicks.push(y);
  const xStep = D > 8 ? 2 : 2;
  const xTicks: number[] = [];
  for (let x = 0; x <= D + 1e-9; x += xStep) xTicks.push(x);
  const font = { fontFamily: fonts.bodyMedium, fontSize: 13 };

  // s-t curve, drawn as many short straight pieces.
  const curve = (upTo: number) => {
    const n = Math.max(Math.ceil((upTo / D) * 80), 1);
    let d = '';
    for (let i = 0; i <= n; i++) {
      const tt = (i / n) * upTo;
      d += `${i === 0 ? 'M' : 'L'} ${px(tt)} ${ys(displacementAt(graph, tt))} `;
    }
    return d;
  };
  // The line follows the finger exactly; area, position, car and road glide after it.
  const vtPath = graphIn.t.map((x, i) => `${i === 0 ? 'M' : 'L'} ${px(x)} ${yv(graphIn.v[i])}`).join(' ');

  // Car on the track.
  const roadY = trackH - 34;
  const carW = CAR_W * CAR_SCALE;
  // The car keeps its place on the screen and the road slides under it. While a place is being picked,
  // the camera pulls back to show the whole track, then glides in again.
  const box = { left: 36, width: W - 72 };
  const cx = (m: number) => cameraX(m, s, mix, lo, hi, box);
  const carOverview = clamp(overviewX(s, lo, hi, box), 36 + carW / 2, W - 36 - carW / 2);
  const carCx = carOverview * (1 - mix) + followX(s, s, box) * mix;
  const ppm = pixelsPerMetre(mix, lo, hi, box);
  const followMode = mix >= 0.5;
  const tickFade = clamp(Math.abs(mix - 0.5) * 2, 0, 1);
  const roadTicks: number[] = [];
  const dashes: number[] = [];
  if (followMode) {
    for (let m = Math.ceil((s - 0.45 * FOLLOW_WINDOW) / 10) * 10; m <= s + 0.65 * FOLLOW_WINDOW; m += 10) roadTicks.push(m);
    for (let m = Math.floor((s - 0.45 * FOLLOW_WINDOW) / 4) * 4; m <= s + 0.65 * FOLLOW_WINDOW; m += 4) dashes.push(m);
  } else roadTicks.push(...sTicks);
  const carTop = roadY - CAR_H * CAR_SCALE + 4;
  const wheel = ((s * ppm) / (7.2 * CAR_SCALE)) * (180 / Math.PI);
  const pitch = clamp(-a * dir * 0.7, -4, 4);

  // Value pills at the top of the track, left to right.
  let pillX = 12;
  const readout = (text: string, color: string) => {
    const el = <Pill key={text} x={pillX} y={22} text={text} color={color} />;
    pillX += text.length * 7.6 + 18 + 6;
    return el;
  };

  const isEditable = (k: number) => !!editable?.includes(k);

  return (
    <View
      style={height ? { height } : { flex: 1 }}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      accessible
      accessibilityLabel={`Motion lab. A car on a track with a velocity-time graph${showSt ? ' and a position-time graph' : ''}.${hidden ? '' : ` Now at ${tidy(t)} seconds, velocity ${tidy(v)} metres per second, position ${tidy(s)} metres.`}`}
    >
      {W > 0 && H > 0 && (
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

            {track && (
              <G>
            {/* Track */}
            <Rect x={0} y={roadY} width={W} height={26} fill="url(#labRoad)" />
            <Line x1={0} y1={roadY} x2={W} y2={roadY} stroke={colors.axis} strokeWidth={1.5} />
            <G opacity={tickFade}>
            {dashes.map((m) => (
              <Line key={`ld${m}`} x1={cx(m)} y1={roadY + 24} x2={cx(m + 2)} y2={roadY + 24} stroke="#4A5368" strokeWidth={2.5} strokeLinecap="round" />
            ))}
            {roadTicks
              .filter((m) => cx(m) > 6 && cx(m) < W - 40)
              .map((m) => (
              <G key={`tt${m}`}>
                <Line x1={cx(m)} y1={roadY} x2={cx(m)} y2={roadY + 8} stroke={colors.axis} strokeWidth={1.5} />
                <SvgText x={cx(m)} y={roadY + 21} {...font} fill={colors.inkMuted} textAnchor="middle">
                  {m}
                </SvgText>
              </G>
            ))}
            </G>
            <Line x1={cx(0)} y1={roadY - 22} x2={cx(0)} y2={roadY} stroke={colors.accent} strokeWidth={2} strokeDasharray="3 3" />
            <SvgText x={cx(0) + 4} y={roadY - 12} {...font} fill={colors.accent}>
              start
            </SvgText>
            <SvgText x={W - 6} y={roadY + 21} {...font} fontFamily={fonts.bodySemi} fill={colors.ink} textAnchor="end">
              m
            </SvgText>
            {target &&
              (isVisible(cx(target.s), W) ? (
                <G>
                  <Line x1={cx(target.s)} y1={roadY - 92} x2={cx(target.s)} y2={roadY} stroke={colors.correct} strokeWidth={2.5} strokeDasharray="4 3" />
                  <Pill x={cx(target.s)} y={roadY - 98} anchor="middle" text={`target ${target.s} m`} color={colors.correct} />
                </G>
              ) : (
                <Pill x={cx(target.s) > W / 2 ? W - 8 : 8} anchor={cx(target.s) > W / 2 ? 'end' : 'start'} y={roadY - 98} text={`target ${target.s} m: ${Math.round(Math.abs(target.s - s))} m ${target.s > s ? 'ahead' : 'behind'}`} color={colors.correct} />
              ))}
            {marker != null &&
              (isVisible(cx(marker), W) ? (
                <G>
                  <Line x1={cx(marker)} y1={roadY - 44} x2={cx(marker)} y2={roadY} stroke={colors.accent} strokeWidth={2.5} />
                  <Polygon points={`${cx(marker)},${roadY - 44} ${cx(marker) + 16},${roadY - 38} ${cx(marker)},${roadY - 32}`} fill={colors.accent} />
                  <SvgText x={cx(marker)} y={roadY - 50} fontFamily={fonts.display} fontSize={14} fill={colors.accent} textAnchor="middle">
                    {`${Math.round(marker)} m`}
                  </SvgText>
                </G>
              ) : (
                <Pill x={cx(marker) > W / 2 ? W - 8 : 8} anchor={cx(marker) > W / 2 ? 'end' : 'start'} y={roadY - 98} text={`your guess ${Math.round(marker)} m: ${Math.round(Math.abs(marker - s))} m ${marker > s ? 'ahead' : 'behind'}`} color={colors.accent} />
              ))}

            {onTrackTap && marker == null && !revealed && <Pill x={W / 2} anchor="middle" y={roadY - 62} text="Tap the track" color={colors.inkMuted} />}

            {/* Car, mirrored when it drives backwards, with velocity and acceleration arrows */}
            <G transform={`translate(${carCx} 0) scale(${dir} 1) translate(${-carCx} 0)`}>
              <Car x={carCx + carW / 2} y={carTop} braking={braking} scale={CAR_SCALE} pitch={pitch} wheel={wheel * dir} />
            </G>
            {!hidden && <VectorArrow x={carCx} y={carTop - 12} length={Math.min(Math.abs(v) * 6, 130)} dir={dir} color={colors.velocity} />}
            {!hidden && arrows === 'va' && t < D - 1e-9 && Math.abs(a) > 0.01 && (
              <VectorArrow x={carCx} y={carTop - 32} length={Math.min(Math.abs(a) * 14, 90)} dir={a >= 0 ? 1 : -1} color={colors.acceleration} />
            )}

            {readouts && readout(`t = ${tidy(t)} s`, colors.accent)}
            {readouts && !hidden && readout(`v = ${tidy(v)} m/s`, colors.velocity)}
            {readouts && !hidden && readout(`s = ${tidy(s)} m`, colors.ink)}

              </G>
            )}

            {showVt && (
              <G>
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
            {xTicks.map((x) => (
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
            {areaNumbers &&
              !hidden &&
              pieces.map((p, i) => {
                const wide = px(p.t1) - px(p.t0);
                const area = pieceArea(p);
                if (wide < 46 || t < p.t1 - 1e-9 || Math.abs(area) < 0.05) return null;
                // Inside the shape when it is tall enough; otherwise just past the axis, clear of the lines.
                const tall = Math.max(Math.abs(p.v0), Math.abs(p.v1)) * ((vGBot - vGTop) / (V_MAX - V_MIN)) >= 40;
                // Centre of the shape (centroid of a trapezoid), so the label sits clear of the sloping line.
                const sum = p.v0 + p.v1;
                const cx = sum === 0 ? (p.t0 + p.t1) / 2 : p.t0 + ((p.t1 - p.t0) * (p.v0 + 2 * p.v1)) / (3 * sum);
                const cy = sum === 0 ? 0 : (p.v0 * p.v0 + p.v0 * p.v1 + p.v1 * p.v1) / (3 * sum);
                const y = tall ? yv(cy) + 5 : area > 0 ? yv(0) + 19 : yv(0) - 9;
                return (
                  <SvgText key={`an${i}`} x={tall ? px(cx) : (px(p.t0) + px(p.t1)) / 2} y={y} fontFamily={fonts.display} fontSize={15} fill={colors.ink} textAnchor="middle">
                    {`${area < 0 ? '−' : ''}${tidy(Math.abs(area))} m`}
                  </SvgText>
                );
              })}
            <Path d={vtPath} stroke={colors.velocity} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.18} />
            <Path d={vtPath} stroke={colors.velocity} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {focus != null && graphIn.t[focus + 1] !== undefined && (
              <Line x1={px(graphIn.t[focus])} y1={yv(graphIn.v[focus])} x2={px(graphIn.t[focus + 1])} y2={yv(graphIn.v[focus + 1])} stroke={colors.acceleration} strokeWidth={7} strokeLinecap="round" />
            )}
            {!hidden && track && (
              <>
                <Line x1={px(t)} y1={vGTop} x2={px(t)} y2={vGBot} stroke={colors.accent} strokeWidth={1.5} strokeDasharray="4 3" />
                <Circle cx={px(t)} cy={yv(v)} r={5} fill={colors.accent} stroke={colors.background} strokeWidth={2} />
              </>
            )}
            {graph.t.map((x, i) => (
              <G key={`k${x}`}>
                {active === i && <Circle cx={px(x)} cy={yv(graphIn.v[i])} r={20} fill={colors.velocity} opacity={0.25} />}
                <Circle
                  cx={px(x)}
                  cy={yv(graphIn.v[i])}
                  r={isEditable(i) ? (active === i ? 11 : 9) : 5}
                  fill={isEditable(i) ? colors.ink : colors.velocity}
                  stroke={colors.velocity}
                  strokeWidth={isEditable(i) ? 3.5 : 2}
                />
              </G>
            ))}
            {active != null && <Pill x={clamp(px(graph.t[active]), 70, W - 70)} anchor="middle" y={yv(graphIn.v[active]) - 20} text={`${graphIn.v[active]} m/s`} color={colors.ink} />}
            {active == null && !slopes && track && arrows === 'va' && <Pill x={W - PR - 4} y={vGTop + 22} anchor="end" text={`a = ${tidy(a)} m/s²`} color={colors.acceleration} />}
            {slopes &&
              (() => {
                // Non-zero labels first; a zero label is only drawn if it does not collide with one already placed.
                const items = graphIn.t.slice(0, -1).map((t0, i) => {
                  const t1 = graphIn.t[i + 1];
                  const acc = (graphIn.v[i + 1] - graphIn.v[i]) / (t1 - t0);
                  const text = `a = ${acc < 0 ? '−' : ''}${tidy(Math.abs(acc))}`;
                  const w = text.length * 7.6 + 18;
                  const x0 = acc === 0 ? (px(t0) + px(t1)) / 2 : acc > 0 ? px(t1) : px(t0);
                  return { i, acc, text, w, x: clamp(x0, w / 2 + 4, W - w / 2 - 4), y: yv(Math.max(graphIn.v[i], graphIn.v[i + 1])) - 24 };
                });
                const placed: typeof items = [];
                const order = [...items.filter((x) => x.i === focus), ...items.filter((x) => x.i !== focus && x.acc !== 0), ...items.filter((x) => x.i !== focus && x.acc === 0)];
                for (const it of order) {
                  const clash = placed.some((p) => Math.abs(p.x - it.x) < (p.w + it.w) / 2 + 4 && Math.abs(p.y - it.y) < 28);
                  if (!clash) placed.push(it);
                }
                return placed.map((it) => <Pill key={`sl${it.i}`} x={it.x} anchor="middle" y={it.y} text={it.text} color={colors.acceleration} />);
              })()}
            <Line x1={PL} y1={vGTop - 6} x2={PL} y2={vGBot} stroke={colors.axis} strokeWidth={1.5} />
            <SvgText x={4} y={vTop + 14} {...font} fontFamily={fonts.bodySemi} fill={colors.ink}>
              v / m s⁻¹
            </SvgText>
            <SvgText x={W - PR} y={vGBot + 31} {...font} fontFamily={fonts.bodySemi} fill={colors.ink} textAnchor="end">
              t / s
            </SvgText>

              </G>
            )}

            {/* s-t graph */}
            {showSt && (
              <G>
                {sTicks.map((m) => (
                  <G key={`sy${m}`}>
                    <Line x1={PL} y1={ys(m)} x2={W - PR} y2={ys(m)} stroke={m === 0 ? colors.axis : colors.line} strokeWidth={m === 0 ? 1.5 : 1} />
                    <SvgText x={PL - 16} y={ys(m) + 5} {...font} fill={colors.inkMuted} textAnchor="end">
                      {m}
                    </SvgText>
                  </G>
                ))}
                {xTicks.map((x) => (
                  <G key={`sx${x}`}>
                    <Line x1={px(x)} y1={sGTop} x2={px(x)} y2={sGBot} stroke={colors.line} strokeWidth={1} />
                    <SvgText x={px(x)} y={sGBot + 15} {...font} fill={colors.inkMuted} textAnchor="middle">
                      {x}
                    </SvgText>
                  </G>
                ))}
                {target && <Line x1={PL} y1={ys(target.s)} x2={W - PR} y2={ys(target.s)} stroke={colors.correct} strokeWidth={2} strokeDasharray="5 4" />}
                {!hidden && (
                  <>
                    <Path d={curve(D)} stroke={colors.velocity} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.3} />
                    {t > 0 && (
                      <>
                        <Path d={curve(t)} stroke={colors.velocity} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.18} />
                        <Path d={curve(t)} stroke={colors.velocity} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </>
                    )}
                    <Line x1={px(t)} y1={sGTop} x2={px(t)} y2={sGBot} stroke={colors.accent} strokeWidth={1.5} strokeDasharray="4 3" />
                    <Line x1={PL} y1={ys(s)} x2={px(t)} y2={ys(s)} stroke={colors.accent} strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
                    {tangent &&
                      (() => {
                        const span = 1.6;
                        const t0 = Math.max(t - span, 0);
                        const t1 = Math.min(t + span, D);
                        const y0 = ys(s - v * (t - t0));
                        const y1 = ys(s + v * (t1 - t));
                        return (
                          <G>
                            <Line x1={px(t0)} y1={y0} x2={px(t1)} y2={y1} stroke={colors.ink} strokeWidth={3} strokeLinecap="round" />
                          </G>
                        );
                      })()}
                    <Circle cx={px(t)} cy={ys(s)} r={6} fill={colors.accent} stroke={colors.background} strokeWidth={2} />
                  </>
                )}
                <Line x1={PL} y1={sGTop - 6} x2={PL} y2={sGBot} stroke={colors.axis} strokeWidth={1.5} />
                <SvgText x={4} y={sTop + 14} {...font} fontFamily={fonts.bodySemi} fill={colors.ink}>
                  s / m
                </SvgText>
                <SvgText x={W - PR} y={sGBot + 31} {...font} fontFamily={fonts.bodySemi} fill={colors.ink} textAnchor="end">
                  t / s
                </SvgText>
              </G>
            )}
            {showFps && (
              <SvgText x={W - 8} y={roadY - 8} {...font} fill={colors.inkMuted} textAnchor="end">
                {fps > 0 ? `${fps} fps` : 'fps'}
              </SvgText>
            )}
          </Svg>

          {/* Touch areas: tap the track, drag points of the v-t graph, scrub the s-t graph */}
          {onTrackTap && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Track. Tap to place a flag where you think the car ends up."
              onPress={(e) => {
                const ev = e.nativeEvent as { locationX?: number; offsetX?: number };
                const x = ev.locationX ?? ev.offsetX;
                if (revealed || x === undefined || Number.isNaN(x)) return;
                onTrackTap(Math.round(lo + ((x - 36) / (W - 72)) * (hi - lo)));
              }}
              style={{ position: 'absolute', left: 0, right: 0, top: 0, height: trackH }}
            />
          )}
          {showVt && !!editable?.length && <View {...vPan.panHandlers} style={{ position: 'absolute', left: 0, right: 0, top: vTop, height: vH }} />}
          {showSt && !hidden && <View {...sPan.panHandlers} style={{ position: 'absolute', left: 0, right: 0, top: sTop, height: sH }} />}
        </>
      )}
    </View>
  );
}
