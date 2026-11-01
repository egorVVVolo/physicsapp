import React from 'react';
import { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme/tokens';

// Side-view car facing RIGHT: long sloped bonnet, headlight and grille at the front,
// short boot, spoiler and red tail-light at the back. Gradients give a soft 3D look.
// Units: 72 wide, 35 tall (wheels touch y = 35). Put <CarDefs /> once inside the <Svg>.
export const CAR_W = 72;
export const CAR_H = 35;

const BODY = 'M0 28 L0 17.5 Q0 14.5 3 14 L8.5 13.2 L14 3.4 L36 3.4 L55 12.4 L68 15 Q72 16.2 72 20.5 L72 28 Z';
const WHEELS = [15, 57];

export function CarDefs() {
  return (
    <Defs>
      <LinearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#F7F9FD" />
        <Stop offset="0.5" stopColor="#CBD3E2" />
        <Stop offset="1" stopColor="#8A94AB" />
      </LinearGradient>
      <LinearGradient id="carGlass" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#6C92D6" />
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

// x = x of the front bumper, y = top of the car; scale is around the front bottom corner.
// pitch: degrees, positive = nose down (the car dips when braking). wheel: rotation in degrees.
export function Car({
  x,
  y,
  braking,
  scale = 1,
  pitch = 0,
  wheel = 0,
}: {
  x: number;
  y: number;
  braking: boolean;
  scale?: number;
  pitch?: number;
  wheel?: number;
}) {
  return (
    <G transform={`translate(${x} ${y}) scale(${scale}) translate(${-CAR_W} 0)`}>
      <Ellipse cx={36} cy={35.5} rx={39} ry={3.5} fill="#000000" opacity={0.5} />
      <G transform={`rotate(${pitch} 36 30)`}>
        {braking && <Circle cx={1} cy={18.5} r={10} fill="url(#carBrakeGlow)" />}
        <Circle cx={71} cy={19} r={9} fill="url(#carHeadGlow)" opacity={0.85} />
        <Path d={BODY} fill="url(#carBody)" />
        {WHEELS.map((cx) => (
          <Circle key={`a${cx}`} cx={cx} cy={28} r={8.6} fill="#10131A" />
        ))}
        <Rect x={2} y={24.6} width={68} height={3.6} rx={1.8} fill="#4E586F" opacity={0.5} />
        <Path d="M15.6 12.4 L19 5 L28 5 L28 12.4 Z" fill="url(#carGlass)" />
        <Path d="M30.4 5 L35 5 L47.5 12.4 L30.4 12.4 Z" fill="url(#carGlass)" />
        <Path d="M17.5 7 L21 7" stroke="#FFFFFF" strokeWidth={1} opacity={0.35} strokeLinecap="round" />
        <Path d="M16 3.4 L35 3.4" stroke="#FFFFFF" strokeWidth={1.2} opacity={0.75} strokeLinecap="round" />
        <Path d="M29 5.5 L29 24" stroke="#7A849B" strokeWidth={0.8} opacity={0.6} />
        <Path d="M-1.5 11.8 L9 11.4 L9.4 13 L-1.5 13.6 Z" fill="#323A4D" />
        <Rect x={0} y={15.5} width={3.4} height={5.5} rx={1} fill={braking ? colors.acceleration : '#8B3A3A'} />
        <Path d="M65.5 15.6 L72 17.4 L72 21 L66.5 19.6 Z" fill="#FFE08A" />
        <Path d="M71.5 22.4 L72 27 L69 27" stroke="#4E586F" strokeWidth={1} fill="none" />
      </G>
      {WHEELS.map((cx) => (
        <G key={cx}>
          <Circle cx={cx} cy={28} r={7.2} fill="#0B0D12" />
          <Circle cx={cx} cy={28} r={4.6} fill="url(#carRim)" />
          {[0, 1, 2, 3, 4].map((k) => {
            const a = ((wheel + k * 72) * Math.PI) / 180;
            return <Line key={k} x1={cx} y1={28} x2={cx + 4.2 * Math.cos(a)} y2={28 + 4.2 * Math.sin(a)} stroke="#4A5368" strokeWidth={1.3} strokeLinecap="round" />;
          })}
          <Circle cx={cx} cy={28} r={1.6} fill="#2A3040" />
        </G>
      ))}
    </G>
  );
}
