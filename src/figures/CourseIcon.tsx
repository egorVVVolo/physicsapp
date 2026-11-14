// The course icon in the map header: a block resting on a slope, flat vector 3D (solid faces, no outlines).
// On the dark page the greys are turned around: a dark slope and a light block.
import Svg, { G, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';

const LIGHT = { slopeTop: '#E2E6EB', slopeFront: '#C3CAD3', slopeSide: '#9AA4B0', front: '#1A1E25', top: '#4E5663', side: '#2A3039' };
const DARK = { slopeTop: '#4A5463', slopeFront: '#353E4B', slopeSide: '#262D37', front: '#E6EAEF', top: '#FFFFFF', side: '#AEB6C2' };

export function CourseIcon({ size = 44 }: { size?: number }) {
  const { dark } = useTheme();
  const c = dark ? DARK : LIGHT;
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {/* the slope: a wedge with a top face and a front face */}
      <Path d="M4,40 L40,40 L40,18 Z" fill={c.slopeFront} />
      <Path d="M40,40 L44,37 L44,15 L40,18 Z" fill={c.slopeSide} />
      <Path d="M4,40 L8,37 L44,15 L40,18 Z" fill={c.slopeTop} />
      {/* the block on the slope (rotated with the slope, about 31°) */}
      <G transform="translate(22 27.5) rotate(-31.4)">
        <Path d="M-7,-11 L7,-11 L7,0 L-7,0 Z" fill={c.front} />
        <Path d="M-7,-11 L-4,-13.5 L10,-13.5 L7,-11 Z" fill={c.top} />
        <Path d="M7,-11 L10,-13.5 L10,-2.5 L7,0 Z" fill={c.side} />
      </G>
    </Svg>
  );
}
