// A lesson "puck": a thick glossy disc seen at an angle, like a big physical button.
// done = check on the face · current = recessed centre, the map adds a halo and a badge · soon = matte grey.
// The face sits on its own layer so it can sink into the side band when pressed (`press` 0..1).
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

export type PuckState = 'done' | 'current' | 'open' | 'soon';
export type LevelColor = { main: string; lip: string; soft: string };

const GREY: LevelColor = { main: '#CDD3DA', lip: '#A3ACB7', soft: '#E9ECF0' };
const VB_W = 100;
const VB_H = 84;
/** How far the face can sink, in viewBox units (the band is 14 thick at rest). */
const SINK = 7;

type Props = { size?: number; state: PuckState; color: LevelColor; press?: SharedValue<number>; id?: string };

export function Puck({ size = 92, state, color, press, id }: Props) {
  const c = state === 'soon' ? GREY : color;
  const k = size / VB_W;
  const h = VB_H * k;
  const faceStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (press ? press.get() : 0) * SINK * k }] }));
  // gradient ids are global on a web page; pucks that look the same may share them
  const g = (name: string) => `${name}-${id ?? `${state}${c.main.slice(1)}`}`;

  return (
    <View style={{ width: size, height: h }} pointerEvents="none">
      {/* shadow on the floor + the side band */}
      <Svg width={size} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id={g('shadow')} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor="#1A1E25" stopOpacity={0.22} />
            <Stop offset="1" stopColor="#1A1E25" stopOpacity={0} />
          </RadialGradient>
          <LinearGradient id={g('band')} x1="10" y1="0" x2="90" y2="0" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={c.lip} />
            <Stop offset="0.35" stopColor={mix(c.lip, c.main, 0.45)} />
            <Stop offset="1" stopColor={mix(c.lip, '#000000', 0.18)} />
          </LinearGradient>
        </Defs>
        <Ellipse cx={50} cy={58} rx={48} ry={20} fill={`url(#${g('shadow')})`} />
        <G fill={`url(#${g('band')})`}>
          <Ellipse cx={50} cy={34 + SINK} rx={40} ry={22} />
          <Rect x={10} y={34 + SINK} width={80} height={14 - SINK} />
          <Ellipse cx={50} cy={48} rx={40} ry={22} />
        </G>
      </Svg>

      {/* the face */}
      <Animated.View style={[StyleSheet.absoluteFill, faceStyle]}>
        <Svg width={size} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`}>
          <Defs>
            <LinearGradient id={g('face')} x1="0.2" y1="0" x2="0.8" y2="1">
              <Stop offset="0" stopColor={mix(c.main, '#FFFFFF', state === 'soon' ? 0.25 : 0.22)} />
              <Stop offset="1" stopColor={c.main} />
            </LinearGradient>
            <LinearGradient id={g('well')} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={mix(c.lip, c.main, 0.3)} />
              <Stop offset="1" stopColor={mix(c.main, '#FFFFFF', 0.12)} />
            </LinearGradient>
          </Defs>
          <Ellipse cx={50} cy={34} rx={40} ry={22} fill={`url(#${g('face')})`} />
          {/* rim highlight along the far edge */}
          <Path d="M16,28 A40,22 0 0 1 84,28" fill="none" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={1.6} strokeLinecap="round" />
          {state === 'current' ? (
            <>
              {/* recessed centre: an open slot waiting for the lesson */}
              <Ellipse cx={50} cy={35} rx={25} ry={13.5} fill={`url(#${g('well')})`} />
              <Ellipse cx={50} cy={35} rx={25} ry={13.5} fill="none" stroke="#FFFFFF" strokeOpacity={0.85} strokeWidth={4} />
            </>
          ) : (
            <>
              {/* a groove: a dark line under a light one reads as cut into the face */}
              <Ellipse cx={50} cy={35.4} rx={25} ry={13.5} fill="none" stroke={c.lip} strokeOpacity={0.45} strokeWidth={4} />
              <Ellipse cx={50} cy={34} rx={25} ry={13.5} fill="none" stroke="#FFFFFF" strokeOpacity={state === 'soon' ? 0.75 : 0.6} strokeWidth={3.2} />
            </>
          )}
          {state === 'done' && <Path d="M40.5,34.5 L47,40 L60,28" fill="none" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />}
        </Svg>
      </Animated.View>
    </View>
  );
}

/** Mix two #RRGGBB colours (t = 0 gives a, 1 gives b). */
export function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}
