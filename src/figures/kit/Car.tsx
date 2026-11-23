// One car seen from the side, flat: body, windows, wheels with a spoke that turns as it rolls, and its letter.
import { Circle, G as Group, Line, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import type { DrawClock } from '../anim';
import { DrawnFade, DrawnShape, FILLS, ForceLetter, polyPath, type Pen } from '../draw';

export const WHEEL_R = 6.5;
/** When the pen draws the car, unless the figure says otherwise. */
const CAR_PEN: Pen = [0.36, 0.62];

// the outline of the car, front bumper at x = 0, road at y = 0, pointing right
const BODY = polyPath([
  [-64, -5],
  [-64, -13],
  [-58, -15.5],
  [-47, -25],
  [-27, -25],
  [-15, -15.5],
  [-3, -13.5],
  [0, -10],
  [0, -5],
]);
const WINDOW = 'M-45.5,-22.5 L-28,-22.5 L-19.5,-15.5 L-53,-15.5 Z';
const WHEELS = [-49, -15];

/** One car with its front bumper at `front`, standing on the road at `y`. `roll`: how far its wheels have turned, rad. */
export function Car({ front, y, id, roll, clock, pen = CAR_PEN }: { front: number; y: number; id: string; roll: number; clock: DrawClock; pen?: Pen }) {
  const { palette: p, material: m, stroke, pick, dark } = useTheme();
  const body = pick(id === 'A' ? m.carA : m.carB, p.drawFill);
  // ink is too dark on the plum of car A in the light theme: its letter is white there
  const letter = pick(id === 'A' && !dark ? p.page : p.ink, p.ink);
  const rim = WHEEL_R - 2.6;
  const dx = rim * Math.sin(roll);
  const dy = rim * Math.cos(roll);
  return (
    <Group transform={`translate(${front}, ${y})`}>
      <DrawnShape clock={clock} pen={pen} d={BODY.d} len={BODY.len} fill={body} stroke={p.draw} strokeWidth={pick(stroke.body, 1.7)} strokeLinejoin="round" />
      <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
        <Path d={WINDOW} fill={p.drawFillDark} />
        {/* the pillar between the windows, and the door below it */}
        <Path d="M-36.5,-22.5 V-15.5" stroke={body} strokeWidth={2} fill="none" />
        <Path d="M-36.5,-15.5 V-7" stroke={p.draw} strokeWidth={0.9} opacity={0.45} fill="none" />
        {WHEELS.map((x) => (
          <Group key={x}>
            <Circle cx={x} cy={-WHEEL_R} r={WHEEL_R} fill={pick(m.rubber, p.draw)} stroke={pick(p.draw, 'none')} strokeWidth={pick(stroke.thin, 0)} />
            <Circle cx={x} cy={-WHEEL_R} r={rim} fill={pick(m.metal, p.drawFill)} />
            {/* one spoke across the rim, so the wheel is seen to roll */}
            <Line x1={x - dx} y1={-WHEEL_R + dy} x2={x + dx} y2={-WHEEL_R - dy} stroke={p.draw} strokeWidth={pick(stroke.thin, 1.3)} />
          </Group>
        ))}
        <ForceLetter x={-32} y={-7} text={id} color={letter} size={10} />
      </DrawnFade>
    </Group>
  );
}
