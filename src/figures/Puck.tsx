// A lesson "puck" in flat vector 3D: a thick disc seen at an angle. Every surface is one solid colour
// (top, side band, centre, white ring); depth comes from the facets, not from gradients.
// done = check in the centre · current = a hollow well the lesson "fits into" · open / soon = ring broken in four.
// The top sits on its own layer so it can sink into the side band when pressed (`press` 0..1).
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { Ellipse, G, Path, Rect } from 'react-native-svg';
import { soonGrey, type LevelColor } from '@/theme/tokens';

export type PuckState = 'done' | 'current' | 'open' | 'soon';
export type { LevelColor };

export const PUCK_VB_W = 100;
export const PUCK_VB_H = 76;
/** Centre of the top face in viewBox units. */
export const PUCK_FACE_Y = 32;
/** How far the top can sink, in viewBox units (the band is 12 thick at rest). */
const SINK = 6;
// the ring (rx 24, ry 13) is about 118.8 long: four dashes with gaps centred at 0°, 90°, 180°, 270°
const RING_GAP = 3.6;
const RING_DASH = 118.8 / 4 - RING_GAP;

type Props = { size?: number; state: PuckState; color: LevelColor; press?: SharedValue<number> };

export function Puck({ size = 100, state, color, press }: Props) {
  const c = state === 'soon' ? soonGrey : color;
  const k = size / PUCK_VB_W;
  const h = PUCK_VB_H * k;
  const vb = `0 0 ${PUCK_VB_W} ${PUCK_VB_H}`;
  const topStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (press ? press.get() : 0) * SINK * k }] }));

  return (
    <View style={{ width: size, height: h }} pointerEvents="none">
      {/* side band; its top edge follows the sunk top, so pressing never shows a gap */}
      <Svg width={size} height={h} viewBox={vb} style={StyleSheet.absoluteFill}>
        <G fill={c.side}>
          <Ellipse cx={50} cy={32 + SINK} rx={40} ry={22} />
          <Rect x={10} y={32 + SINK} width={80} height={12 - SINK} />
          <Ellipse cx={50} cy={44} rx={40} ry={22} />
        </G>
      </Svg>

      <Animated.View style={[StyleSheet.absoluteFill, topStyle]}>
        <Svg width={size} height={h} viewBox={vb}>
          <Ellipse cx={50} cy={32} rx={40} ry={22} fill={c.face} />
          {state === 'current' ? (
            <>
              {/* the well: its far wall in shadow, the white rim around it */}
              <Ellipse cx={50} cy={33} rx={24} ry={13} fill={c.side} />
              <Path d="M26,33 A24,13 0 0 1 74,33 A24,10 0 0 0 26,33 Z" fill="#000000" fillOpacity={0.16} />
              <Ellipse cx={50} cy={33} rx={24} ry={13} fill="none" stroke="#FFFFFF" strokeWidth={5} />
            </>
          ) : (
            <>
              <Ellipse cx={50} cy={32} rx={22} ry={11.5} fill={c.inner} />
              <Ellipse
                cx={50}
                cy={32}
                rx={24}
                ry={13}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={5}
                strokeDasharray={state === 'done' ? undefined : `${RING_DASH} ${RING_GAP}`}
                strokeDashoffset={RING_DASH + RING_GAP / 2}
              />
            </>
          )}
          {state === 'done' && <Path d="M41,32 L47.5,37.5 L59.5,26.5" fill="none" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />}
        </Svg>
      </Animated.View>
    </View>
  );
}
