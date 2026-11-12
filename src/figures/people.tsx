// The person and the bathroom scales, drawn once and reused by every figure.
// Flat shapes with an ink outline, quiet colours (never blue: blue is for forces).
// The scales are drawn in the same flat "vector 3D" as the pucks on the map: a light top face and a darker front.
import { Circle, G, Path, Polygon, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { CgMark, MonoLabel } from './draw';

/** Height of the person from the soles to the top of the head, in viewBox units at scale 1. */
export const PERSON_H = 136;
/** Where the centre of gravity sits above the soles, at scale 1. */
export const PERSON_CG = 80;
/** Half the width of the person at the shoulders and arms, at scale 1. */
export const PERSON_HALF_W = 25;

/** A person standing, soles at (x, y). */
export function Person({ x, y, scale = 1, cg = true }: { x: number; y: number; scale?: number; cg?: boolean }) {
  const { palette: p } = useTheme();
  const line = { stroke: p.draw, strokeWidth: 1.8, strokeLinejoin: 'round' as const };
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* shoes */}
      <Rect x={-16} y={-7} width={14} height={7} rx={3.5} fill={p.shoe} />
      <Rect x={2} y={-7} width={14} height={7} rx={3.5} fill={p.shoe} />
      {/* trousers: one shape with a gap between the legs */}
      <Path d="M-14,-64 L14,-64 L13,-6 L2.5,-6 L1,-42 L-1,-42 L-2.5,-6 L-13,-6 Z" fill={p.trousers} {...line} />
      {/* arms behind the shirt, hands below the cuffs */}
      <Rect x={-24} y={-104} width={8} height={40} rx={4} fill={p.shirt} {...line} />
      <Rect x={16} y={-104} width={8} height={40} rx={4} fill={p.shirt} {...line} />
      <Circle cx={-20} cy={-61} r={4.2} fill={p.skin} {...line} />
      <Circle cx={20} cy={-61} r={4.2} fill={p.skin} {...line} />
      {/* neck and shirt */}
      <Rect x={-4.5} y={-114} width={9} height={10} fill={p.skin} {...line} />
      <Path d="M-18,-98 Q-18,-106 -10,-106 L10,-106 Q18,-106 18,-98 L16,-62 L-16,-62 Z" fill={p.shirt} {...line} />
      <Path d="M-5,-106 L0,-100 L5,-106" fill="none" stroke={p.draw} strokeWidth={1.4} strokeLinejoin="round" />
      {/* head with a short fringe of hair */}
      <Circle cx={0} cy={-123} r={12.5} fill={p.skin} {...line} />
      <Path d="M-12.34,-121 A12.5,12.5 0 1 1 12.34,-121 Q12,-125.5 8,-126.5 Q1,-128 -4,-126 Q-9,-127 -12.34,-121 Z" fill={p.hair} {...line} />
      {cg && <CgMark x={0} y={-PERSON_CG} color={p.draw} />}
    </G>
  );
}

/** Height of the scales from the floor to the top face (where the soles stand). */
export const SCALES_H = 30;

/**
 * Bathroom scales on the floor at height y, centred on x. The display on the front face shows `reading`
 * ("60.0 kg", or "- - -" when it is hidden); with `reading` null the front face is plain.
 */
export function Scales({ x, y, reading, width = 96 }: { x: number; y: number; reading: string | null; width?: number }) {
  const { palette: p } = useTheme();
  const w = width / 2;
  const front = 23; // front face height
  const top = y - front;
  return (
    <G>
      {/* top face, seen slightly from above */}
      <Polygon points={`${x - w},${top} ${x + w},${top} ${x + w - 7},${y - SCALES_H} ${x - w + 7},${y - SCALES_H}`} fill={p.scalesTop} stroke={p.draw} strokeWidth={1.8} strokeLinejoin="round" />
      {/* front face with the display */}
      <Rect x={x - w} y={top} width={width} height={front} rx={3} fill={p.scalesFront} stroke={p.draw} strokeWidth={1.8} />
      {reading !== null && (
        <G>
          <Rect x={x - 31} y={top + 4} width={62} height={15} rx={3} fill="#FFFFFF" stroke={p.draw} strokeWidth={1.2} />
          <MonoLabel x={x} y={top + 15.5} text={reading} color={p.ink} size={11} />
        </G>
      )}
    </G>
  );
}
