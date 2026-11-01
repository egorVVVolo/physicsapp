import React from 'react';
import { Circle, Defs, G, Path, RadialGradient, Rect, Stop, Ellipse, LinearGradient } from 'react-native-svg';
import { colors } from '../theme/tokens';

// Side-view car facing right, drawn with gradients for a soft 3D look.
// Units: 72 wide, 35 tall (wheels touch y = 35). Put <CarDefs /> once inside the <Svg>.
export const CAR_W = 72;
export const CAR_H = 35;

const BODY = 'M0 28 L0 19 Q0 15 4 14 L16 12 L25 2 L50 2 L61 12 L69 15 Q72 17 72 21 L72 28 Z';

export function CarDefs() {
  return (
    <Defs>
      <LinearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#F7F9FD" />
        <Stop offset="0.5" stopColor="#CBD3E2" />
        <Stop offset="1" stopColor="#8A94AB" />
      </LinearGradient>
      <LinearGradient id="carGlass" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#5F86C9" />
        <Stop offset="1" stopColor="#1E2F55" />
      </LinearGradient>
      <RadialGradient id="carRim" cx="0.4" cy="0.35" r="0.8">
        <Stop offset="0" stopColor="#F2F4F8" />
        <Stop offset="1" stopColor="#7F889C" />
      </RadialGradient>
      <RadialGradient id="carHeadGlow" cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0" stopColor="#FFD76A" stopOpacity="0.9" />
        <Stop offset="1" stopColor="#FFD76A" stopOpacity="0" />
      </RadialGradient>
      <RadialGradient id="carBrakeGlow" cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0" stopColor={colors.acceleration} stopOpacity="0.95" />
        <Stop offset="1" stopColor={colors.acceleration} stopOpacity="0" />
      </RadialGradient>
    </Defs>
  );
}

// x = x of the front bumper, y = top of the car, scale around the front bottom corner.
export function Car({ x, y, braking, scale = 1 }: { x: number; y: number; braking: boolean; scale?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${scale}) translate(${-CAR_W} 0)`}>
      <Ellipse cx={36} cy={35.5} rx={39} ry={3.5} fill="#000000" opacity={0.5} />
      {braking && <Circle cx={1} cy={19.5} r={10} fill="url(#carBrakeGlow)" />}
      <Circle cx={72} cy={20} r={8} fill="url(#carHeadGlow)" opacity={0.75} />
      <Path d={BODY} fill="url(#carBody)" />
      <Rect x={2} y={23.5} width={68} height={4.5} rx={2} fill="#4E586F" opacity={0.55} />
      <Path d="M20 12 L27 4.6 L35 4.6 L35 12 Z" fill="url(#carGlass)" />
      <Path d="M39 4.6 L49 4.6 L57 12 L39 12 Z" fill="url(#carGlass)" />
      <Path d="M29 6.5 L33 6.5" stroke="#FFFFFF" strokeWidth={1} opacity={0.4} strokeLinecap="round" />
      <Path d="M26 2.4 L49 2.4" stroke="#FFFFFF" strokeWidth={1.2} opacity={0.7} strokeLinecap="round" />
      <Path d="M37 6 L37 23" stroke="#7A849B" strokeWidth={0.8} opacity={0.6} />
      <Rect x={0} y={17} width={4} height={5} rx={1} fill={braking ? colors.acceleration : '#8B4A4A'} />
      <Rect x={68} y={18} width={4} height={4} rx={1} fill="#FFE08A" />
      {[17, 55].map((cx) => (
        <G key={cx}>
          <Circle cx={cx} cy={28} r={7.2} fill="#0B0D12" />
          <Circle cx={cx} cy={28} r={4.4} fill="url(#carRim)" />
          <Circle cx={cx} cy={28} r={1.5} fill="#2A3040" />
        </G>
      ))}
    </G>
  );
}
