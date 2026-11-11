// Small line-art icons for lessons, drawn like tiny engineering sketches (white on a coloured tile).
// A lesson can have its own icon; otherwise its level's icon is used.
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { mix, type LevelColor } from './Puck';

type IconKey = 'normal-reaction' | 'motion' | 'forces' | 'momentum-moments' | 'energy' | 'fluids' | 'materials';

/** Strokes for each icon, in a 32 × 32 box. */
function Strokes({ k, color }: { k: IconKey; color: string }) {
  const s = { stroke: color, strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  switch (k) {
    case 'normal-reaction':
      // a box on a hatched floor, the floor pushing up on it
      return (
        <G {...s}>
          <Line x1={4} y1={26} x2={28} y2={26} />
          <Path d="M8,26 l-3,4 M13,26 l-3,4 M18,26 l-3,4 M23,26 l-3,4 M28,26 l-3,4" strokeWidth={1.6} />
          <Rect x={9} y={15} width={14} height={11} rx={1.5} />
          <Line x1={16} y1={13} x2={16} y2={3.5} />
          <Path d="M12.5,7 L16,3.5 L19.5,7" />
        </G>
      );
    case 'motion':
      return (
        <G {...s}>
          <Path d="M4,27 Q14,-2 28,22" strokeDasharray="0.1 4.2" strokeWidth={2.6} />
          <Circle cx={4.5} cy={26} r={3} fill={color} stroke="none" />
          <Path d="M23,22.5 L28,22 L27.5,17" />
          <Line x1={2} y1={30} x2={30} y2={30} strokeWidth={1.6} />
        </G>
      );
    case 'forces':
      return (
        <G {...s}>
          <Line x1={3} y1={26} x2={29} y2={26} />
          <Rect x={6} y={14} width={12} height={12} rx={1.5} />
          <Line x1={18} y1={20} x2={28} y2={20} />
          <Path d="M24.5,16.5 L28,20 L24.5,23.5" />
        </G>
      );
    case 'momentum-moments':
      return (
        <G {...s}>
          <Circle cx={9} cy={18} r={5.5} />
          <Circle cx={24} cy={18} r={4} />
          <Line x1={3} y1={9} x2={12} y2={9} />
          <Path d="M9.5,6.5 L12,9 L9.5,11.5" />
          <Line x1={3} y1={28} x2={29} y2={28} strokeWidth={1.6} />
        </G>
      );
    case 'energy':
      // a pendulum swinging between two heights
      return (
        <G {...s}>
          <Line x1={8} y1={3} x2={24} y2={3} />
          <Line x1={16} y1={3} x2={23} y2={21} />
          <Circle cx={23.8} cy={23} r={3.6} fill={color} stroke="none" />
          <Path d="M7,21 Q16,30 25,21" strokeDasharray="0.1 4" strokeWidth={2.6} />
        </G>
      );
    case 'fluids':
      return (
        <G {...s}>
          <Rect x={10} y={8} width={12} height={12} rx={1.5} />
          <Path d="M3,17 q3.25,-3 6.5,0 t6.5,0 t6.5,0 t6.5,0" />
          <Path d="M3,24 q3.25,-3 6.5,0 t6.5,0 t6.5,0 t6.5,0" strokeWidth={1.6} />
        </G>
      );
    case 'materials':
      // a spring stretched by a hanging load
      return (
        <G {...s}>
          <Line x1={6} y1={3} x2={26} y2={3} />
          <Path d="M16,3 L16,6 L11,8.5 L21,12 L11,15.5 L21,19 L16,21 L16,23" />
          <Rect x={11} y={23} width={10} height={7} rx={1.5} fill={color} stroke="none" />
        </G>
      );
  }
}

const OWN_ICON: Record<string, IconKey> = { 'normal-reaction': 'normal-reaction' };

export function iconFor(lessonId: string, levelId: string): IconKey {
  return OWN_ICON[lessonId] ?? (levelId as IconKey);
}

/**
 * A raised tile with the lesson's icon: coloured face, darker lip underneath, a soft gloss on top.
 * Used above the current puck on the map and next to the lesson title in the card.
 */
export function LessonTile({ lessonId, levelId, color, size = 60, id }: { lessonId: string; levelId: string; color: LevelColor; size?: number; id: string }) {
  const lip = 6;
  const g = `tile-${id}`;
  return (
    <Svg width={size} height={size * (60 + lip) / 60} viewBox={`0 0 60 ${60 + lip}`}>
      <Defs>
        <LinearGradient id={g} x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor={mix(color.main, '#FFFFFF', 0.2)} />
          <Stop offset="1" stopColor={color.main} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={lip} width={60} height={60} rx={18} fill={color.lip} />
      <Rect x={0} y={0} width={60} height={60} rx={18} fill={`url(#${g})`} />
      <Path d="M10,14 Q12,5 22,4.5 L38,4.5" stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <G transform="translate(12 12) scale(1.125)">
        <Strokes k={iconFor(lessonId, levelId)} color="#FFFFFF" />
      </G>
    </Svg>
  );
}
