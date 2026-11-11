// A lesson "puck": a flat disc seen at an angle, drawn like a part on a drawing sheet.
// done = filled with a check · current = filled with a ring around it · soon = grey.
import Svg, { Ellipse, G, Path } from 'react-native-svg';

type Props = { size?: number; state: 'done' | 'current' | 'open' | 'soon'; color: { main: string; lip: string; soft: string } };

export function Puck({ size = 84, state, color }: Props) {
  const grey = { main: '#D5DAE0', lip: '#AEB6C0', soft: '#EEF1F4' };
  const c = state === 'soon' ? grey : color;
  const h = size * 0.78;
  return (
    <Svg width={size} height={h} viewBox="0 0 100 78">
      {state === 'current' && <Ellipse cx={50} cy={40} rx={48} ry={30} fill="none" stroke={c.main} strokeWidth={3} opacity={0.35} />}
      <G>
        {/* side band */}
        <Path d="M12,34 L12,46 A38,20 0 0 0 88,46 L88,34 Z" fill={c.lip} />
        {/* top face */}
        <Ellipse cx={50} cy={34} rx={38} ry={20} fill={c.main} />
        <Ellipse cx={50} cy={34} rx={24} ry={12.5} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={state === 'soon' ? 0.6 : 0.9} />
        {state === 'done' && <Path d="M40,34 L47,40 L61,27" fill="none" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />}
      </G>
    </Svg>
  );
}
