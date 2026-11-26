// One car seen from the side, flat: body, windows, wheels with a spoke that turns as it rolls, and its letter.
import { useContext } from 'react';
import { Circle, G as Group, Line, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import type { DrawClock } from '../anim';
import { DrawnFade, DrawnShape, FILLS, ForceLetter, polyPath, SheetClean, type Pen } from '../draw';

export const WHEEL_R = 6.5;
/** A style-3 car is drawn this much larger, from its front bumper on the road. */
const CLEAN_SIZE = 1.15;
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
  const { palette: p, material: m, soft, stroke, pick, dark } = useTheme();
  const clean = useContext(SheetClean);
  // style 3: car B in the second body tone, any other car in the first; the edge has the body's tone
  const tone = id === 'B' ? soft.B : soft.A;
  const size = clean ? CLEAN_SIZE : 1;
  const body = clean ? tone.fill : pick(id === 'A' ? m.carA : m.carB, p.drawFill);
  const edge = clean ? tone.edge : p.draw;
  // ink is too dark on the plum of car A in the light theme: its letter is white there
  const letter = clean ? p.ink : pick(id === 'A' && !dark ? p.page : p.ink, p.ink);
  const rim = WHEEL_R - 2.6;
  // a larger wheel turns less for the same distance along the road
  const dx = rim * Math.sin(roll / size);
  const dy = rim * Math.cos(roll / size);
  return (
    <Group transform={`translate(${front}, ${y}) scale(${size})`}>
      <DrawnShape clock={clock} pen={pen} d={BODY.d} len={BODY.len} fill={body} stroke={edge} strokeWidth={pick(stroke.body, 1.7)} strokeLinejoin="round" />
      <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
        <Path d={WINDOW} fill={p.drawFillDark} />
        {/* the pillar between the windows, and the door below it */}
        <Path d="M-36.5,-22.5 V-15.5" stroke={body} strokeWidth={2} fill="none" />
        {!clean && <Path d="M-36.5,-15.5 V-7" stroke={p.draw} strokeWidth={stroke.hair} opacity={0.45} fill="none" />}
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
