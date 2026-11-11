// The course icon in the map header: a block resting on a slope, drawn as a small solid
// (three shaded faces) on a hatched base, with the weight arrow in the signature force colour.
import Svg, { G, Line, Path } from 'react-native-svg';
import { palette } from '@/theme/tokens';

export function CourseIcon({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {/* the slope: a wedge with a top face and a front face */}
      <Path d="M4,40 L40,40 L40,18 Z" fill="#C3CAD3" />
      <Path d="M40,40 L44,37 L44,15 L40,18 Z" fill="#9AA4B0" />
      <Path d="M4,40 L8,37 L44,15 L40,18 Z" fill="#E2E6EB" />
      {/* hatched floor */}
      <Line x1={2} y1={42} x2={46} y2={42} stroke={palette.draw} strokeWidth={1.6} strokeLinecap="round" />
      <G stroke={palette.draw} strokeWidth={1.2} strokeLinecap="round">
        <Line x1={8} y1={42} x2={5} y2={46} />
        <Line x1={16} y1={42} x2={13} y2={46} />
        <Line x1={24} y1={42} x2={21} y2={46} />
        <Line x1={32} y1={42} x2={29} y2={46} />
        <Line x1={40} y1={42} x2={37} y2={46} />
      </G>
      {/* the block on the slope (rotated with the slope, about 31°) */}
      <G transform="translate(22 27.5) rotate(-31.4)">
        <Path d="M-7,-11 L7,-11 L7,0 L-7,0 Z" fill={palette.ink} />
        <Path d="M-7,-11 L-4,-13.5 L10,-13.5 L7,-11 Z" fill="#4E5663" />
        <Path d="M7,-11 L10,-13.5 L10,-2.5 L7,0 Z" fill="#2A3039" />
      </G>
      {/* weight, straight down from the block's centre */}
      <Line x1={19.2} y1={23} x2={19.2} y2={34} stroke={palette.force} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M16,31 L19.2,35 L22.4,31" stroke={palette.force} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}
