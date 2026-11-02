import React, { useEffect, useRef, useState } from 'react';
import { PanResponder, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Polygon, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { A, GAME } from '../content/brakingDemo';
import { positionWithReaction, speedWithReaction, stoppingDistance, stoppingTime } from '../physics/braking';
import { fonts } from '../theme/fonts';
import { colors } from '../theme/tokens';
import { Pill, usePlayback } from './BrakingScene';
import { CAR_H, CAR_W, Car, CarDefs } from './Car';
import { tapHaptic } from './stepParts';


type Props = {
  height: number;
  u: number; // speed set by dragging, m/s
  onChangeU: (u: number) => void;
  playKey: number; // 0 = not braking; each increase starts a run with the current u
  locked: boolean; // true while a run is on screen
  touched: boolean; // user has already dragged once
  onDone: (result: { u: number; distance: number; crashed: boolean }) => void;
};

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

// "Stop the car in the parking spot": drag the starting speed on the v-t graph, then brake.
// The run uses the physics model; the car hits the wall if the model says it would pass it.
export function StopGame({ height, u, onChangeU, playKey, locked, touched, onDone }: Props) {
  const [width, setWidth] = useState(0);
  // The speed of the run is fixed at the moment the brakes go on.
  const runU = useRef(u);
  const lastKey = useRef(0);
  if (playKey !== lastKey.current) {
    lastKey.current = playKey;
    runU.current = u;
  }
  const ru = runU.current;
  const total = stoppingDistance(ru, A);
  const crashes = total > GAME.wall;
  const dur = stoppingTime(ru, A);
  // Report each run once, whichever of the two paths (stopped, crashed) gets there first.
  const reportedKey = useRef(0);
  if (playKey === 0) reportedKey.current = 0;
  const finish = () => {
    if (reportedKey.current === playKey) return;
    reportedKey.current = playKey;
    onDone({ u: ru, distance: total, crashed: crashes });
  };
  const { t, settle, rate } = usePlayback(dur, playKey, crashes ? undefined : finish);

  const running = playKey > 0;
  const raw = running ? positionWithReaction(ru, A, 0, t) : 0;
  const s = Math.min(raw, GAME.wall);
  const hit = running && crashes && raw >= GAME.wall;
  const v = running ? (hit ? 0 : speedWithReaction(ru, A, 0, t)) : 0;
  const done = running && t >= dur;
  // A crash ends the run a moment after the impact instead of waiting for the model to finish.
  const finishRef = useRef(finish);
  finishRef.current = finish;
  useEffect(() => {
    if (!hit) return;
    const id = setTimeout(() => finishRef.current(), 700);
    return () => clearTimeout(id);
  }, [hit]);
  const lights = running && !done && !hit;

  // Layout
  const roadH = Math.round(height * 0.42);
  const groundY = roadH - 58;
  const carScale = 1.2;
  const carW = CAR_W * carScale;
  const carH = CAR_H * carScale;
  const padL = carW + 12;
  const padR = 28;
  const roadW = width - padL - padR;
  const sx = (m: number) => padL + (m * roadW) / GAME.range;
  const carY = groundY - carH;
  const gTop = roadH + 22;
  const gBottom = height - 26;
  const pl = 44;
  const pr = 14;
  const px = (sec: number) => pl + (sec * (width - pl - pr)) / GAME.xMax;
  const py = (vel: number) => gBottom - (vel * (gBottom - gTop)) / GAME.yMax;
  const font = { fontFamily: fonts.bodyMedium, fontSize: 11 };

  // What the graph draws: the chosen speed while setting up, the run itself while braking.
  const shownU = running ? ru : u;
  const shownT = stoppingTime(shownU, A);
  const tt = running ? Math.min(t, dur) : 0;
  const vNow = shownU - A * tt;

  // Drag anywhere on the graph: the height of the touch sets the starting speed.
  const live = useRef({ locked, gTop, gBottom, onChangeU, u });
  live.current = { locked, gTop, gBottom, onChangeU, u };
  const grab = useRef({ y0: 0 });
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !live.current.locked,
      onMoveShouldSetPanResponder: () => !live.current.locked,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (ev) => {
        const ne = ev.nativeEvent as unknown as { locationY?: number; offsetY?: number };
        grab.current.y0 = ne.locationY ?? ne.offsetY ?? 0;
        applyY(grab.current.y0);
      },
      onPanResponderMove: (_e, g) => applyY(grab.current.y0 + g.dy),
    }),
  ).current;
  const panelTop = roadH;
  function applyY(localY: number) {
    const l = live.current;
    if (l.locked) return;
    const y = panelTop + localY;
    const next = clamp(Math.round(((l.gBottom - y) * GAME.yMax) / (l.gBottom - l.gTop)), GAME.uMin, GAME.uMax);
    if (next === l.u) return;
    tapHaptic();
    l.onChangeU(next);
  }

  const bodyBrake = lights && v > 0.5;
  const pitch = bodyBrake ? 3.4 : done && !hit ? 3.4 * Math.exp(-6 * settle) * Math.cos(18 * settle) : 0;
  const carX = sx(s);
  const spotL = sx(GAME.wall - GAME.spot);
  const wallX = sx(GAME.wall);
  const ticks = [0, 20, 40, 60, 80, 100];
  const xTicks = [0, 2, 4, 6, 8];
  const yTicks = [0, 10, 20, 30, 40];
  const arrow = Math.min((v / 40) * 80, 90);

  return (
    <View
      style={{ height }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityLabel={`Parking game. Drag on the velocity graph to set the starting speed, currently ${u} metres per second, then brake. The parking spot is just before the wall at ${GAME.wall} metres.`}
    >
      {width > 0 && (
        <>
          <Svg width={width} height={height} pointerEvents="none">
            <CarDefs />
            <Defs>
              <LinearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.velocity} stopOpacity="0.55" />
                <Stop offset="1" stopColor={colors.velocity} stopOpacity="0.08" />
              </LinearGradient>
              <LinearGradient id="gSpot" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.correct} stopOpacity="0.05" />
                <Stop offset="1" stopColor={colors.correct} stopOpacity="0.45" />
              </LinearGradient>
            </Defs>

            {/* road, parking spot, wall */}
            <Rect x={0} y={groundY} width={width} height={9} fill="#232835" />
            <Line x1={0} y1={groundY} x2={width} y2={groundY} stroke={colors.axis} strokeWidth={2} />
            <Rect x={spotL} y={groundY - 62} width={wallX - spotL} height={62} fill="url(#gSpot)" />
            <Line x1={spotL} y1={groundY - 62} x2={spotL} y2={groundY} stroke={colors.correct} strokeWidth={2} strokeDasharray="4 3" />
            <SvgText x={(spotL + wallX) / 2} y={groundY - 68} fontFamily={fonts.bodySemi} fontSize={11.5} fill={colors.correct} textAnchor="middle">
              park here
            </SvgText>
            <Rect x={wallX} y={groundY - 70} width={14} height={70} rx={3} fill={hit ? colors.incorrect : '#8993A6'} />
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <Line key={k} x1={wallX} y1={groundY - 70 + k * 14 + 8} x2={wallX + 14} y2={groundY - 70 + k * 14} stroke="#12141A" strokeWidth={2} opacity={0.5} />
            ))}
            {ticks.map((m) => (
              <G key={m}>
                <Line x1={sx(m)} y1={groundY + 9} x2={sx(m)} y2={groundY + 14} stroke={colors.axis} strokeWidth={1.5} />
                <SvgText x={sx(m)} y={groundY + 27} {...font} fill={colors.inkMuted} textAnchor="middle">
                  {m === 0 ? '0 m' : m}
                </SvgText>
              </G>
            ))}
            <Line x1={sx(0)} y1={carY - 6} x2={sx(0)} y2={groundY} stroke={colors.inkMuted} strokeWidth={1} strokeDasharray="3 3" />
            <SvgText x={width - 12} y={20} fontFamily={fonts.bodySemi} fontSize={13} fill={colors.acceleration} textAnchor="end">
              {`braking: a = ${A} m/s²`}
            </SvgText>

            {running && s > 0.2 && <Line x1={sx(0)} y1={groundY + 4.5} x2={sx(s)} y2={groundY + 4.5} stroke="#0B0D12" strokeWidth={3.5} opacity={0.9} />}
            <Car x={carX} y={carY} braking={lights} scale={carScale} pitch={pitch} wheel={s * 22} />
            {v > 1 && <Line x1={carX - carW / 2} y1={carY - 14} x2={carX - carW / 2 + arrow} y2={carY - 14} stroke={colors.velocity} strokeWidth={5} strokeLinecap="round" />}
            {v > 1 && <Pill x={Math.min(carX - carW / 2 + arrow + 8, width - 96)} y={carY - 9} text={`v = ${Math.round(v)} m/s`} color={colors.velocity} />}

            {hit && <Pill x={wallX - 80} y={groundY - 100} text="Crash!" color={colors.incorrect} />}
            {done && !hit && (
              <G>
                <Line x1={sx(0)} y1={groundY + 38} x2={sx(total)} y2={groundY + 38} stroke={colors.velocity} strokeWidth={2} />
                <Line x1={sx(0)} y1={groundY + 33} x2={sx(0)} y2={groundY + 43} stroke={colors.velocity} strokeWidth={2} />
                <Line x1={sx(total)} y1={groundY + 33} x2={sx(total)} y2={groundY + 43} stroke={colors.velocity} strokeWidth={2} />
                <SvgText x={Math.max(sx(total) / 2, sx(0) + 24)} y={groundY + 56} fontFamily={fonts.display} fontSize={13} fill={colors.velocity} textAnchor="middle">
                  {`${Math.round(total * 10) / 10} m`}
                </SvgText>
              </G>
            )}

            {/* v-t graph */}
            {yTicks.map((y) => (
              <Line key={`gy${y}`} x1={pl} y1={py(y)} x2={width - pr} y2={py(y)} stroke={colors.line} strokeWidth={1} />
            ))}
            {xTicks.map((x) => (
              <Line key={`gx${x}`} x1={px(x)} y1={gTop} x2={px(x)} y2={gBottom} stroke={colors.line} strokeWidth={1} />
            ))}
            {running && (
              <Polygon points={`${px(0)},${py(0)} ${px(0)},${py(shownU)} ${px(tt)},${py(vNow)} ${px(tt)},${py(0)}`} fill="url(#gArea)" />
            )}
            <Path d={`M ${px(0)} ${py(shownU)} L ${px(shownT)} ${py(0)}`} stroke={colors.velocity} strokeWidth={10} strokeLinecap="round" opacity={0.18} />
            <Path d={`M ${px(0)} ${py(shownU)} L ${px(shownT)} ${py(0)}`} stroke={colors.velocity} strokeWidth={3.5} strokeLinecap="round" />
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
            {running && rate > 1.01 && (
              <SvgText x={width - pr} y={gTop - 8} {...font} fill={colors.inkMuted} textAnchor="end">
                {`time ×${Number(rate.toFixed(1))}`}
              </SvgText>
            )}
            {running && <Circle cx={px(tt)} cy={py(vNow)} r={6} fill={colors.velocity} stroke={colors.ink} strokeWidth={2} />}
            {!running && (
              <G>
                <Circle cx={px(0)} cy={py(u)} r={22} fill={colors.accent} opacity={0.2} />
                <Circle cx={px(0)} cy={py(u)} r={11} fill={colors.accent} stroke={colors.background} strokeWidth={2.5} />
                <Pill x={px(0) + 20} y={py(u) - 8} text={`u = ${u} m/s`} color={colors.accent} />
                {!touched && <Pill x={px(0) + 20} y={py(u) + 22} text="drag up or down" color={colors.inkMuted} />}
              </G>
            )}
          </Svg>
          {!locked && <View {...pan.panHandlers} style={{ position: 'absolute', left: 0, right: 0, top: roadH, height: height - roadH }} />}
        </>
      )}
    </View>
  );
}
