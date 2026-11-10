// Scene view: the world, drawn in real screen points. The package is the one object in focus.
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, Marker, Path, Pattern, Rect, Text } from 'react-native-svg';
import { position, velocity } from '@/physics/kinematics';
import { bodyWith, carrier, carrierLabel, H0, realBody, tLandReal, tLandWith, VB } from '@/content/drop';
import { svgFont } from '@/theme/svgFont';
import type { Palette } from '@/theme/tokens';

const ARect = Animated.createAnimatedComponent(Rect);
const ALine = Animated.createAnimatedComponent(Line);
const ACircle = Animated.createAnimatedComponent(Circle);
const APath = Animated.createAnimatedComponent(Path);
const AText = Animated.createAnimatedComponent(Text);

const WORLD_TOP = 30; // metres shown on the ruler
const GROUND_BAND = 40; // pt
const BOX = 28; // package size, pt
const V_SCALE = 3.2; // pt per m s⁻¹
const DOT_TIMES = Array.from({ length: 12 }, (_, k) => (k + 1) * 0.25);

type Props = {
  t: SharedValue<number>;
  palette: Palette;
  width: number;
  height: number;
  revealed: boolean;
  ghostU: number | null;
  ghostLabel: string;
};

export function DropScene({ t, palette: p, width, height, revealed, ghostU, ghostLabel }: Props) {
  const ground = height - GROUND_BAND;
  const pxm = (ground - 14) / WORLD_TOP;
  const rulerX = 40;
  const lane = Math.round(width * 0.5);
  const ghostLane = Math.round(width * 0.72);
  const ghost = ghostU === null ? null : bodyWith(ghostU);
  const ghostEnd = ghostU === null ? 0 : tLandWith(ghostU);

  const yOf = (m: number) => {
    'worklet';
    return ground - m * pxm;
  };
  /** Centre of the package: it rests on its bottom edge. */
  const boxY = (time: number) => {
    'worklet';
    const tt = revealed ? Math.min(time, tLandReal) : 0;
    return yOf(Math.max(0, position(tt, realBody))) - BOX / 2;
  };
  const droneBottom = (time: number) => {
    'worklet';
    return yOf(position(revealed ? time : 0, carrier)) - BOX - 14;
  };

  const droneProps = useAnimatedProps(() => ({ d: dronePath(lane, droneBottom(t.value)) }));
  const carrierArrow = useAnimatedProps(() => {
    const y = droneBottom(t.value) - 2;
    return { y1: y, y2: y - VB * V_SCALE };
  });
  const carrierText = useAnimatedProps(() => ({ y: droneBottom(t.value) - VB * V_SCALE - 12 }));
  const boxProps = useAnimatedProps(() => ({ y: boxY(t.value) - BOX / 2 }));
  const velProps = useAnimatedProps(() => {
    const y0 = boxY(t.value);
    const len = velocity(Math.min(t.value, tLandReal), realBody) * V_SCALE;
    return { y1: y0, y2: y0 - len, opacity: revealed && Math.abs(len) > 8 ? 1 : 0 };
  });
  const velText = useAnimatedProps(() => {
    const y0 = boxY(t.value);
    const len = velocity(Math.min(t.value, tLandReal), realBody) * V_SCALE;
    return { y: y0 - len / 2 + 5, opacity: revealed && Math.abs(len) > 8 ? 1 : 0 };
  });
  const accProps = useAnimatedProps(() => {
    const y0 = boxY(t.value) + BOX / 2 + 4;
    return { y1: y0, y2: y0 + 30, opacity: revealed ? 1 : 0 };
  });
  const accText = useAnimatedProps(() => ({ y: boxY(t.value) + BOX / 2 + 26, opacity: revealed ? 1 : 0 }));
  const ghostProps = useAnimatedProps(() => {
    if (!ghost) return { y: 0, opacity: 0 };
    return { y: yOf(Math.max(0, position(Math.min(t.value, ghostEnd), ghost))) - BOX, opacity: 1 };
  });

  const ticks = Array.from({ length: WORLD_TOP + 1 }, (_, m) => m);

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
      <Line x1={rulerX} y1={ground} x2={rulerX} y2={yOf(WORLD_TOP)} stroke={p.ink} strokeWidth={1.6} />
      {ticks.map((m) => (
        <Line key={m} x1={rulerX} y1={yOf(m)} x2={rulerX - (m % 10 === 0 ? 10 : m % 5 === 0 ? 7 : 3.5)} y2={yOf(m)} stroke={p.ink} strokeWidth={m % 10 === 0 ? 1.6 : 1} />
      ))}
      {[10, 20, 30].map((m) => (
        <Text key={m} x={rulerX - 13} y={yOf(m) + 5} fontSize={13} fontWeight="600" fill={p.muted} textAnchor="end">{m}</Text>
      ))}
      <Text x={rulerX + 8} y={yOf(WORLD_TOP) + 12} fontSize={13} fill={p.muted}>height / m</Text>

      {/* equal-time dots */}
      {DOT_TIMES.map((ts) => (
        <Dot key={ts} t={t} ts={ts} cx={lane} cy={yOf(Math.max(0, position(Math.min(ts, tLandReal), realBody))) - BOX / 2} color={p.vel} revealed={revealed} filled />
      ))}
      {ghost && DOT_TIMES.filter((ts) => ts < ghostEnd).map((ts) => (
        <Dot key={'g' + ts} t={t} ts={ts} cx={ghostLane} cy={yOf(Math.max(0, position(ts, ghost))) - BOX / 2} color={p.ghost} revealed={revealed} />
      ))}

      {/* the drone (given): climbs steadily and may leave the frame */}
      <APath animatedProps={droneProps} fill={p.surface} stroke={p.ink} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <ALine animatedProps={carrierArrow} x1={lane + 62} x2={lane + 62} stroke={p.vel} strokeWidth={3} strokeLinecap="round" markerEnd="url(#mv)" />
      <AText animatedProps={carrierText} x={lane + 62} fontSize={13} fontWeight="700" fill={p.velText} textAnchor="middle">{carrierLabel}</AText>
      {!revealed && <Line x1={lane} y1={yOf(H0) - BOX - 14} x2={lane} y2={yOf(H0) - BOX} stroke={p.ink} strokeWidth={1.4} />}

      {/* ghost: the answer being compared */}
      {ghost && (
        <ARect animatedProps={ghostProps} x={ghostLane - BOX / 2} width={BOX} height={BOX} rx={6} fill={p.surface} stroke={p.ghost} strokeWidth={2} strokeDasharray="4 3" />
      )}
      {ghost && <Text x={ghostLane} y={ground + 25} fontSize={13} fontWeight="700" fill={p.muted} textAnchor="middle">{ghostLabel}</Text>}
      {ghost && <Text x={lane} y={ground + 25} fontSize={13} fontWeight="700" fill={p.ink} textAnchor="middle">real</Text>}

      {/* the package */}
      <ARect animatedProps={boxProps} x={lane - BOX / 2} width={BOX} height={BOX} rx={6} fill={p.ink} />
      <ALine animatedProps={velProps} x1={lane - BOX / 2 - 12} x2={lane - BOX / 2 - 12} stroke={p.vel} strokeWidth={3} strokeLinecap="round" markerEnd="url(#mv)" />
      <AText animatedProps={velText} x={lane - BOX / 2 - 22} fontSize={16} fontWeight="700" fontStyle="italic" fill={p.velText} textAnchor="end">v</AText>
      <ALine animatedProps={accProps} x1={lane + BOX / 2 + 12} x2={lane + BOX / 2 + 12} stroke={p.acc} strokeWidth={3} strokeLinecap="round" markerEnd="url(#ma)" />
      <AText animatedProps={accText} x={lane + BOX / 2 + 24} fontSize={16} fontWeight="700" fontStyle="italic" fill={p.accText}>a</AText>
    </Svg>
  );
}

function Dot({ t, ts, cx, cy, color, revealed, filled }: { t: SharedValue<number>; ts: number; cx: number; cy: number; color: string; revealed: boolean; filled?: boolean }) {
  const props = useAnimatedProps(() => ({ opacity: revealed && t.value >= ts ? 1 : 0 }));
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
