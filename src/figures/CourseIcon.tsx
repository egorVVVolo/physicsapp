// The course icon in the map header: a block resting on a slope, flat vector 3D (solid faces, no outlines).
import Svg, { G, Path } from 'react-native-svg';
import { palette } from '@/theme/tokens';

export function CourseIcon({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {/* the slope: a wedge with a top face and a front face */}
      <Path d="M4,40 L40,40 L40,18 Z" fill="#C3CAD3" />
      <Path d="M40,40 L44,37 L44,15 L40,18 Z" fill="#9AA4B0" />
      <Path d="M4,40 L8,37 L44,15 L40,18 Z" fill="#E2E6EB" />
      {/* the block on the slope (rotated with the slope, about 31°) */}
      <G transform="translate(22 27.5) rotate(-31.4)">
        <Path d="M-7,-11 L7,-11 L7,0 L-7,0 Z" fill={palette.ink} />
        <Path d="M-7,-11 L-4,-13.5 L10,-13.5 L7,-11 Z" fill="#4E5663" />
        <Path d="M7,-11 L10,-13.5 L10,-2.5 L7,0 Z" fill="#2A3039" />
      </G>
    </Svg>
  );
}
