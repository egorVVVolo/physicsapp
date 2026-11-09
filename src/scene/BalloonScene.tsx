// Scene view: the world, big. The sandbag is the one object in focus.
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Defs, G as Group, Line, Marker, Path, Pattern, Rect, Text } from 'react-native-svg';
import { position, velocity, type Motion } from '@/physics/kinematics';
import { balloon, bagWith, H0, realBag, tLand, tLandReal, VB } from '@/content/balloon';
import { svgFont, type Palette } from '@/theme/tokens';

const ARect = Animated.createAnimatedComponent(Rect);
const ALine = Animated.createAnimatedComponent(Line);
const ACircle = Animated.createAnimatedComponent(Circle);
const APath = Animated.createAnimatedComponent(Path);
const AText = Animated.createAnimatedComponent(Text);

export const SCENE_W = 360;
export const SCENE_H = 480;
const GROUND = 436;
const PXM = 9.6; // px per metre: 0 m at 436, 42 m at ~33
const yPx = (m: number) => {
  'worklet';
  return GROUND - m * PXM;
};
const RULER_X = 46;
const LANE = 186; // real sandbag
const GHOST_LANE = 278; // learner's answer
const BAG = 28;
const V_SCALE = 4; // px per m s⁻¹
const DOT_TIMES = Array.from({ length: 12 }, (_, k) => (k + 1) * 0.25);

type Props = {
  t: SharedValue<number>;
  palette: Palette;
  revealed: boolean;
  ghostU: number | null;
  caption: string | null;
};

export function BalloonScene({ t, palette: p, revealed, ghostU, caption }: Props) {
  const ghost: Motion | null = ghostU === null ? null : bagWith(ghostU);
  const ghostEnd = ghostU === null ? 0 : tLand(ghostU);

  const bagY = (time: number) => {
    'worklet';
    return yPx(Math.max(0, position(Math.min(time, tLandReal), realBag))) - BAG / 2;
  };

  const lift = (time: number) => {
    'worklet';
    return yPx(position(revealed ? time : 0, balloon)) - yPx(H0);
  };
  const envelopeProps = useAnimatedProps(() => ({ d: balloonEnvelope(lift(t.value)) }));
  const basketProps = useAnimatedProps(() => ({ d: balloonBasket(lift(t.value)) }));
  const seamProps = useAnimatedProps(() => ({ d: balloonSeams(lift(t.value)) }));
  const bArrow = useAnimatedProps(() => {
    const yb = BASKET_Y + lift(t.value);
    return { y1: yb - 40, y2: yb - 40 - VB * V_SCALE * 2 };
  });
  const bLabel = useAnimatedProps(() => ({ y: BASKET_Y + lift(t.value) - 46 }));
  const bagProps = useAnimatedProps(() => ({ y: (revealed ? bagY(t.value) : yPx(H0) - BAG / 2) - BAG / 2 }));
  const velProps = useAnimatedProps(() => {
    const time = Math.min(t.value, tLandReal);
    const y0 = bagY(time);
    const len = velocity(time, realBag) * V_SCALE;
    return { y1: y0, y2: y0 - len, opacity: revealed && Math.abs(len) > 8 ? 1 : 0 };
  });
  const velLabel = useAnimatedProps(() => {
    const time = Math.min(t.value, tLandReal);
    const y0 = bagY(time);
    const len = velocity(time, realBag) * V_SCALE;
    return { y: y0 - len / 2 + 5, opacity: revealed && Math.abs(len) > 8 ? 1 : 0 };
  });
  const accProps = useAnimatedProps(() => {
    const y0 = bagY(t.value);
    return { y1: y0 + BAG / 2 + 4, y2: y0 + BAG / 2 + 40, opacity: revealed ? 1 : 0 };
  });
  const accLabel = useAnimatedProps(() => ({ y: bagY(t.value) + BAG / 2 + 30, opacity: revealed ? 1 : 0 }));
  const ghostProps = useAnimatedProps(() => {
    if (!ghost) return { y: 0, opacity: 0 };
    const time = Math.min(t.value, ghostEnd);
    return { y: yPx(Math.max(0, position(time, ghost))) - BAG, opacity: 1 };
  });

  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} preserveAspectRatio="xMidYMid meet" fontFamily={svgFont}>
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

      <Rect x={-600} y={-600} width={SCENE_W + 1200} height={SCENE_H + 1200} fill={p.sky} />
      {/* ground */}
      <Rect x={-600} y={GROUND} width={SCENE_W + 1200} height={600} fill={p.ground} />
      <Rect x={-600} y={GROUND} width={SCENE_W + 1200} height={600} fill="url(#hatch)" />
      <Line x1={-600} y1={GROUND} x2={SCENE_W + 600} y2={GROUND} stroke={p.ink} strokeWidth={2.5} />

      {/* height ruler, positive direction up */}
      <Line x1={RULER_X} y1={GROUND} x2={RULER_X} y2={yPx(41)} stroke={p.ink} strokeWidth={1.6} />
      {Array.from({ length: 42 }, (_, m) => m).map((m) => (
        <Line key={m} x1={RULER_X} y1={yPx(m)} x2={RULER_X - (m % 10 === 0 ? 10 : m % 5 === 0 ? 7 : 3.5)} y2={yPx(m)} stroke={p.ink} strokeWidth={m % 10 === 0 ? 1.6 : 1} />
      ))}
      {[10, 20, 30, 40].map((m) => (
        <Text key={m} x={RULER_X - 14} y={yPx(m) + 5} fontSize={14} fontWeight="600" fill={p.muted} textAnchor="end">{m}</Text>
      ))}
      <Text x={RULER_X + 8} y={yPx(41) + 4} fontSize={13} fill={p.muted}>height / m</Text>

      {/* strobe dots: equal time steps */}
      {DOT_TIMES.map((ts) => (
        <Dot key={ts} t={t} ts={ts} cx={LANE} cy={bagYStatic(ts)} color={p.vel} revealed={revealed} filled />
      ))}
      {ghost && DOT_TIMES.filter((ts) => ts < ghostEnd).map((ts) => (
        <Dot key={'g' + ts} t={t} ts={ts} cx={GHOST_LANE} cy={yPx(Math.max(0, position(ts, ghost))) - BAG / 2} color={p.ghost} revealed={revealed} />
      ))}

      {/* balloon (given): moves up at a steady 4.0 m s⁻¹ and may leave the frame */}
      <APath animatedProps={basketProps} fill={p.surface} stroke={p.ink} strokeWidth={2} strokeLinejoin="round" />
      <APath animatedProps={envelopeProps} fill={p.surface} stroke={p.ink} strokeWidth={2} />
      <APath animatedProps={seamProps} fill="none" stroke={p.ink} strokeWidth={1.2} />
      <ALine animatedProps={bArrow} x1={LANE + 50} x2={LANE + 50} stroke={p.vel} strokeWidth={3} strokeLinecap="round" markerEnd="url(#mv)" />
      <AText animatedProps={bLabel} x={LANE + 58} fontSize={14} fontWeight="700" fill={p.velText}>4.0 m s⁻¹</AText>

      {/* rope before release */}
      {!revealed && <Line x1={LANE} y1={BASKET_Y} x2={LANE} y2={yPx(H0) - BAG} stroke={p.ink} strokeWidth={1.4} />}

      {/* ghost: the learner's answer */}
      {ghost && (
        <ARect animatedProps={ghostProps} x={GHOST_LANE - BAG / 2} width={BAG} height={BAG} rx={7} fill={p.surface} stroke={p.ghost} strokeWidth={2} strokeDasharray="4 3" />
      )}
      {ghost && <Text x={GHOST_LANE} y={GROUND + 26} fontSize={13} fontWeight="700" fill={p.muted} textAnchor="middle">your answer</Text>}
      {ghost && <Text x={LANE} y={GROUND + 26} fontSize={13} fontWeight="700" fill={p.ink} textAnchor="middle">real</Text>}

      {/* the sandbag: the one object in focus */}
      <ARect animatedProps={bagProps} x={LANE - BAG / 2} width={BAG} height={BAG} rx={7} fill={p.ink} />
      <ALine animatedProps={velProps} x1={LANE - BAG / 2 - 12} x2={LANE - BAG / 2 - 12} stroke={p.vel} strokeWidth={3} strokeLinecap="round" markerEnd="url(#mv)" />
      <AText animatedProps={velLabel} x={LANE - BAG / 2 - 22} fontSize={16} fontWeight="700" fontStyle="italic" fill={p.velText} textAnchor="end">v</AText>
      <ALine animatedProps={accProps} x1={LANE + BAG / 2 + 12} x2={LANE + BAG / 2 + 12} stroke={p.acc} strokeWidth={3} strokeLinecap="round" markerEnd="url(#ma)" />
      <AText animatedProps={accLabel} x={LANE + BAG / 2 + 24} fontSize={16} fontWeight="700" fontStyle="italic" fill={p.accText}>a</AText>

      {caption && <Caption text={caption} p={p} />}
    </Svg>
  );
}

function bagYStatic(ts: number) {
  return yPx(Math.max(0, position(Math.min(ts, tLandReal), realBag))) - BAG / 2;
}

function Dot({ t, ts, cx, cy, color, revealed, filled }: { t: SharedValue<number>; ts: number; cx: number; cy: number; color: string; revealed: boolean; filled?: boolean }) {
  const props = useAnimatedProps(() => ({ opacity: revealed && t.value >= ts ? 1 : 0 }));
  return filled ? (
    <ACircle animatedProps={props} cx={cx} cy={cy} r={3.4} fill={color} fillOpacity={0.55} />
  ) : (
    <ACircle animatedProps={props} cx={cx} cy={cy} r={3.2} fill="none" stroke={color} strokeWidth={1.4} />
  );
}

// Balloon drawn as paths offset by dy so it can move on the UI thread.
const BASKET_Y = yPx(H0) - BAG - 12; // basket bottom at release
function balloonBasket(dy: number) {
  'worklet';
  const x = LANE, yb = BASKET_Y + dy;
  return `M${x - 9},${yb - 14} L${x - 22},${yb - 44} M${x + 9},${yb - 14} L${x + 22},${yb - 44} M${x - 11},${yb - 14} h22 l-3,14 h-16 z`;
}
function balloonEnvelope(dy: number) {
  'worklet';
  const x = LANE, yb = BASKET_Y + dy, top = yb - 104;
  return `M${x - 22},${yb - 44} C${x - 44},${top + 50} ${x - 37},${top} ${x},${top} C${x + 37},${top} ${x + 44},${top + 50} ${x + 22},${yb - 44} Z`;
}
function balloonSeams(dy: number) {
  'worklet';
  const x = LANE, yb = BASKET_Y + dy, top = yb - 104;
  return `M${x},${top} C${x - 15},${top + 24} ${x - 13},${yb - 60} ${x - 7},${yb - 44} M${x},${top} C${x + 15},${top + 24} ${x + 13},${yb - 60} ${x + 7},${yb - 44}`;
}

function Caption({ text, p }: { text: string; p: Palette }) {
  // top band: the sandbag is below it at every event
  const lines = wrap(text, 38);
  const h = lines.length * 18 + 12;
  const y = 8;
  return (
    <Group>
      <Rect x={12} y={y} width={SCENE_W - 24} height={h} rx={10} fill={p.eventText} />
      {lines.map((l, i) => (
        <Text key={i} x={SCENE_W / 2} y={y + 20 + i * 18} fontSize={14.5} fontWeight="700" fill="#FFFFFF" textAnchor="middle">{l}</Text>
      ))}
    </Group>
  );
}

function wrap(s: string, max: number) {
  const out: string[] = [];
  let line = '';
  for (const w of s.split(' ')) {
    if ((line + ' ' + w).trim().length > max) { out.push(line.trim()); line = w; } else line += ' ' + w;
  }
  if (line.trim()) out.push(line.trim());
  return out;
}
