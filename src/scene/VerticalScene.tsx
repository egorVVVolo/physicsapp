// Scene view: vertical motion drawn in real screen points. The package is the one object in focus.
// Everything it shows comes in through props (the step's scene setup and the current playback).
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, Marker, Path, Pattern, Rect, Text } from 'react-native-svg';
import { position, trackPosition, trackVelocity, type Motion, type Track } from '@/physics/kinematics';
import type { Playback, SceneSetup } from '@/content/types';
import { svgFont } from '@/theme/svgFont';
import type { Palette } from '@/theme/tokens';

const ARect = Animated.createAnimatedComponent(Rect);
const ALine = Animated.createAnimatedComponent(Line);
const ACircle = Animated.createAnimatedComponent(Circle);
const APath = Animated.createAnimatedComponent(Path);
const AText = Animated.createAnimatedComponent(Text);

const GROUND_BAND = 40; // pt
const BOX = 28; // package size, pt
const V_SCALE = 3.2; // pt per m s⁻¹
const DOT_TIMES = Array.from({ length: 12 }, (_, k) => (k + 1) * 0.25);

type Props = {
  t: SharedValue<number>;
  palette: Palette;
  width: number;
  height: number;
  scene: SceneSetup;
  playback: Playback | null; // null = only the setup is shown
};

export function VerticalScene({ t, palette: p, width, height, scene, playback }: Props) {
  const revealed = playback !== null;
  const ground = height - GROUND_BAND;
  const worldTop = scene.worldTop;
  const pxm = (ground - 14) / worldTop;
  const rulerX = 40;
  const twin = scene.second !== undefined;
  const lane = Math.round(width * (twin ? 0.46 : 0.5));
  const lane2 = Math.round(width * (twin ? 0.78 : 0.72));
  const arrowX = twin ? lane - 62 : lane + 62; // with two drones, A's arrow goes on the free left side

  const real: Track = playback?.real ?? { motion: scene.body, from: 0, end: 0 };
  const companion = playback?.companion ?? null;
  const comp: Track | null = companion?.track ?? null;
  const showAcc = playback?.showAcc ?? false;
  const carrier = scene.carrier.motion;
  const carrier2: Motion | null = scene.second?.carrier ?? null;
  const showCarrierArrow = !scene.carrier.secret || revealed;
  const h0 = scene.body.s0;

  const yOf = (m: number) => {
    'worklet';
    return ground - m * pxm;
  };
  /** Centre of the package: it rests on its bottom edge. */
  const boxY = (time: number) => {
    'worklet';
    return yOf(Math.max(0, trackPosition(time, real))) - BOX / 2;
  };
  const droneBottom = (time: number, c: Motion) => {
    'worklet';
    return yOf(Math.max(0, position(revealed ? time : 0, c))) - BOX - 14; // a descending drone stops above the ground
  };

  const droneProps = useAnimatedProps(() => ({ d: dronePath(lane, droneBottom(t.value, carrier)) }));
  const drone2Props = useAnimatedProps(() => ({ d: carrier2 ? dronePath(lane2, droneBottom(t.value, carrier2)) : 'M0,0' }));
  const carrierArrow = useAnimatedProps(() => {
    const y = droneBottom(t.value, carrier) - 8;
    return { y1: y, y2: y - carrier.u * V_SCALE };
  });
  // the label sits to the right of the arrow, level with its middle, clear of the readout at the top
  const carrierText = useAnimatedProps(() => ({ y: droneBottom(t.value, carrier) - 8 - (carrier.u * V_SCALE) / 2 + 5 }));
  const carrier2Arrow = useAnimatedProps(() => {
    if (!carrier2) return { y1: 0, y2: 0 };
    const y = droneBottom(t.value, carrier2) - 8;
    return { y1: y, y2: y - carrier2.u * V_SCALE };
  });
  const boxProps = useAnimatedProps(() => ({ y: boxY(t.value) - BOX / 2 }));
  const velProps = useAnimatedProps(() => {
    const y0 = boxY(t.value);
    const len = trackVelocity(t.value, real) * V_SCALE;
    return { y1: y0, y2: y0 - len, opacity: revealed && Math.abs(len) > 8 ? 1 : 0 };
  });
  const velText = useAnimatedProps(() => {
    const y0 = boxY(t.value);
    const len = trackVelocity(t.value, real) * V_SCALE;
    return { y: y0 - len / 2 + 5, opacity: revealed && Math.abs(len) > 8 ? 1 : 0 };
  });
  const accProps = useAnimatedProps(() => {
    const y0 = boxY(t.value) + BOX / 2 + 4;
    return { y1: y0, y2: y0 + 30, opacity: showAcc ? 1 : 0 };
  });
  const accText = useAnimatedProps(() => ({ y: boxY(t.value) + BOX / 2 + 26, opacity: showAcc ? 1 : 0 }));
  const compProps = useAnimatedProps(() => {
    if (!comp) return { y: 0, opacity: 0 };
    return { y: yOf(Math.max(0, trackPosition(t.value, comp))) - BOX, opacity: t.value >= comp.from ? 1 : 0 };
  });

  const ticks = Array.from({ length: worldTop + 1 }, (_, m) => m);
  const labels = Array.from({ length: Math.floor(worldTop / 10) }, (_, i) => (i + 1) * 10);
  const leftLabel = companion ? playback!.realLabel : scene.second?.labels[0];
  const rightLabel = companion ? companion.label : scene.second?.labels[1];
  const ghostly = companion?.kind === 'ghost';

  return (
    <Svg width={width} height={height} fontFamily={svgFont}>
      <Defs>
        <Marker id="mv" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="12" markerHeight="12" orient="auto" markerUnits="userSpaceOnUse">
          <Path d="M2,1.5 L10,6 L2,10.5" fill="none" stroke={p.vel} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        </Marker>
        <Marker id="ma" viewBox="-4 0 16 12" refX="10" refY="6" markerWidth="16" markerHeight="12" orient="auto" markerUnits="userSpaceOnUse">
          <Path d="M2,1.5 L10,6 L2,10.5 M-3,1.5 L5,6 L-3,10.5" fill="none" stroke={p.acc} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        </Marker>
        <Pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <Line x1="0" y1="0" x2="0" y2="8" stroke={p.ink} strokeWidth={1} opacity={0.35} />
        </Pattern>
      </Defs>

      <Rect x={0} y={0} width={width} height={height} fill={p.sky} />
      <Rect x={0} y={ground} width={width} height={GROUND_BAND} fill={p.ground} />
      <Rect x={0} y={ground} width={width} height={GROUND_BAND} fill="url(#hatch)" />
      <Line x1={0} y1={ground} x2={width} y2={ground} stroke={p.ink} strokeWidth={2.5} />

      {/* height ruler */}
      <Line x1={rulerX} y1={ground} x2={rulerX} y2={yOf(worldTop)} stroke={p.ink} strokeWidth={1.6} />
      {ticks.map((m) => (
        <Line key={m} x1={rulerX} y1={yOf(m)} x2={rulerX - (m % 10 === 0 ? 10 : m % 5 === 0 ? 7 : 3.5)} y2={yOf(m)} stroke={p.ink} strokeWidth={m % 10 === 0 ? 1.6 : 1} />
      ))}
      {labels.map((m) => (
        <Text key={m} x={rulerX - 13} y={yOf(m) + 5} fontSize={13} fontWeight="600" fill={p.muted} textAnchor="end">{m}</Text>
      ))}
      <Text x={rulerX + 8} y={ground - 8} fontSize={13} fill={p.muted}>height / m</Text>

      {/* equal-time dots */}
      {revealed && DOT_TIMES.filter((ts) => ts <= real.end).map((ts) => (
        <Dot key={ts} t={t} ts={ts} cx={lane} cy={yOf(Math.max(0, trackPosition(ts, real))) - BOX / 2} color={p.vel} filled />
      ))}
      {comp && DOT_TIMES.filter((ts) => ts > comp.from && ts < comp.end).map((ts) => (
        <Dot key={'c' + ts} t={t} ts={ts} cx={lane2} cy={yOf(Math.max(0, trackPosition(ts, comp))) - BOX / 2} color={ghostly ? p.ghost : p.vel} filled={!ghostly} />
      ))}

      {/* the drone (given): moves steadily and may leave the frame */}
      <APath animatedProps={droneProps} fill={p.surface} stroke={p.ink} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {showCarrierArrow && (
        <ALine animatedProps={carrierArrow} x1={arrowX} x2={arrowX} stroke={p.vel} strokeWidth={3} strokeLinecap="round" markerEnd="url(#mv)" />
      )}
      {showCarrierArrow && !twin && (
        <AText animatedProps={carrierText} x={lane + 70} fontSize={13} fontWeight="700" fill={p.velText} textAnchor="start">{scene.carrier.label}</AText>
      )}
      {!revealed && <Line x1={lane} y1={yOf(h0) - BOX - 14} x2={lane} y2={yOf(h0) - BOX} stroke={p.ink} strokeWidth={1.4} />}
      {carrier2 && <APath animatedProps={drone2Props} fill={p.surface} stroke={p.ink} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
      {carrier2 && <ALine animatedProps={carrier2Arrow} x1={lane2 + 62} x2={lane2 + 62} stroke={p.vel} strokeWidth={3} strokeLinecap="round" markerEnd="url(#mv)" />}
      {carrier2 && !revealed && <Line x1={lane2} y1={yOf(h0) - BOX - 14} x2={lane2} y2={yOf(h0) - BOX} stroke={p.ink} strokeWidth={1.4} />}
      {carrier2 && !revealed && <Rect x={lane2 - BOX / 2} y={yOf(h0) - BOX} width={BOX} height={BOX} rx={6} fill={p.ink} />}

      {/* the body played next to the real one: the learner's answer (dashed) or a second real package */}
      {comp && (
        <ARect
          animatedProps={compProps}
          x={lane2 - BOX / 2}
          width={BOX}
          height={BOX}
          rx={6}
          fill={ghostly ? p.surface : p.ink}
          stroke={ghostly ? p.ghost : p.ink}
          strokeWidth={2}
          strokeDasharray={ghostly ? '4 3' : undefined}
        />
      )}
      {rightLabel && <Text x={lane2} y={ground + 25} fontSize={13} fontWeight="700" fill={ghostly ? p.muted : p.ink} textAnchor="middle">{rightLabel}</Text>}
      {leftLabel && <Text x={lane} y={ground + 25} fontSize={13} fontWeight="700" fill={p.ink} textAnchor="middle">{leftLabel}</Text>}

      {/* the package */}
      <ARect animatedProps={boxProps} x={lane - BOX / 2} width={BOX} height={BOX} rx={6} fill={p.ink} />
      <ALine animatedProps={velProps} x1={lane - BOX / 2 - 12} x2={lane - BOX / 2 - 12} stroke={p.vel} strokeWidth={3} strokeLinecap="round" markerEnd="url(#mv)" />
      <AText animatedProps={velText} x={lane - BOX / 2 - 22} fontSize={16} fontWeight="700" fontStyle="italic" fill={p.velText} textAnchor="end">v</AText>
      <ALine animatedProps={accProps} x1={lane + BOX / 2 + 12} x2={lane + BOX / 2 + 12} stroke={p.acc} strokeWidth={3} strokeLinecap="round" markerEnd="url(#ma)" />
      <AText animatedProps={accText} x={lane + BOX / 2 + 24} fontSize={16} fontWeight="700" fontStyle="italic" fill={p.accText}>a</AText>
    </Svg>
  );
}

function Dot({ t, ts, cx, cy, color, filled }: { t: SharedValue<number>; ts: number; cx: number; cy: number; color: string; filled?: boolean }) {
  const props = useAnimatedProps(() => ({ opacity: t.value >= ts ? 1 : 0 }));
  return filled ? (
    <ACircle animatedProps={props} cx={cx} cy={cy} r={3.4} fill={color} fillOpacity={0.55} />
  ) : (
    <ACircle animatedProps={props} cx={cx} cy={cy} r={3.2} fill="none" stroke={color} strokeWidth={1.4} />
  );
}

/** Flat schematic quadcopter, side view. (x, yb) = centre of the body's bottom edge. */
function dronePath(x: number, yb: number) {
  'worklet';
  return (
    `M${x - 16},${yb - 12} h32 v12 h-32 z ` + // body
    `M${x - 16},${yb - 7} H${x - 38} M${x + 16},${yb - 7} H${x + 38} ` + // arms
    `M${x - 38},${yb - 7} v-8 M${x + 38},${yb - 7} v-8 ` + // masts
    `M${x - 52},${yb - 15} h28 M${x + 24},${yb - 15} h28` // rotors
  );
}
