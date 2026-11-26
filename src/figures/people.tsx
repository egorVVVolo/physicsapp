// The person and the bathroom scales, drawn once and reused by every figure.
// Never blue (blue is for forces). Two heroes: A in plum, B in grey-teal (`who`).
// The scales are drawn in the same flat "vector 3D" as the pucks on the map: a light top face and a darker front.
// Both can draw themselves: pass the running clock and the stretch of the draw-in (`pen`) their outlines take.
import { Circle, G, Path, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { STILL, type DrawClock } from './anim';
import { CgMark, DrawnFade, DrawnShape, FILLS, MonoLabel, penPart, polyPath, rectPath, type Pen } from './draw';

/** Height of the person from the soles to the top of the head, in viewBox units at scale 1. */
export const PERSON_H = 136;
/** Where the centre of gravity sits above the soles, at scale 1. */
export const PERSON_CG = 80;
/** Half the width of the person at the shoulders and arms, at scale 1. */
export const PERSON_HALF_W = 25;

// The person is a pictogram, as on a station sign: one solid shape and a round head. No outline, face or clothes,
// so it reads at any size. In its own units, soles at (0, 0): arms at the sides, a slit between each arm and the
// body, and one between the legs.
const BODY =
  'M-22,-90 Q-22,-105 -7,-105 H7 Q22,-105 22,-90 V-62 Q22,-57.5 18,-57.5 Q14,-57.5 14,-62 V-88 H12 V-6 Q12,0 7,0 Q2,0 2,-6 V-52 H-2 V-6 Q-2,0 -7,0 Q-12,0 -12,-6 V-88 H-14 V-62 Q-14,-57.5 -18,-57.5 Q-22,-57.5 -22,-62 Z';
const HEAD_Y = -122;
const HEAD_R = 13;

/** A person standing, soles at (x, y). With a running clock the shape fades in over the pen's stretch, then the CG mark. */
export function Person({ x, y, scale = 1, cg = true, who = 'A', halo = false, clock = STILL, pen = [0, 1] }: { x: number; y: number; scale?: number; cg?: boolean; who?: 'A' | 'B'; /** Fill the slit between the legs with paper, so a post behind the person does not show through it. */ halo?: boolean; clock?: DrawClock; pen?: Pen }) {
  const { palette: p, material: m } = useTheme();
  const color = who === 'A' ? m.clothA : m.clothB;
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`}>
      <DrawnFade clock={clock} from={pen[0]} to={pen[1]}>
        {/* paper in the slit between the legs, stopping short of the ground line */}
        {halo && <Rect x={-2.5} y={-52} width={5} height={50} fill={p.paper} />}
        <Circle cx={0} cy={HEAD_Y} r={HEAD_R} fill={color} />
        <Path d={BODY} fill={color} />
      </DrawnFade>
      {cg && (
        <DrawnFade clock={clock} from={CG_MARK[0]} to={CG_MARK[1]}>
          <CgMark x={0} y={-PERSON_CG} color={p.draw} />
        </DrawnFade>
      )}
    </G>
  );
}

/** The centre-of-gravity mark appears after the fills. */
export const CG_MARK = [0.8, 0.88] as const;

/** Height of the scales from the floor to the top face (where the soles stand). */
export const SCALES_H = 30;

/**
 * Bathroom scales on the floor at height y, centred on x. The display on the front face shows `reading`
 * ("60.0 kg", or "- - -" when it is hidden); with `reading` null the front face is plain.
 */
export function Scales({ x, y, reading, width = 96, clock = STILL, pen = [0, 1] }: { x: number; y: number; reading: string | null; width?: number; clock?: DrawClock; pen?: Pen }) {
  const { palette: p, material: m, stroke, pick } = useTheme();
  const w = width / 2;
  const front = 23; // front face height
  const top = y - front;
  const topFace = polyPath([[x - w, top], [x + w, top], [x + w - 7, y - SCALES_H], [x - w + 7, y - SCALES_H]]);
  return (
    <G>
      {/* top face, seen slightly from above */}
      <DrawnShape clock={clock} pen={penPart(pen, 0, 3)} {...topFace} fill={pick(m.metal, p.scalesTop)} stroke={p.draw} strokeWidth={stroke.body} strokeLinejoin="round" />
      {/* front face with the display */}
      <DrawnShape clock={clock} pen={penPart(pen, 1, 3)} {...rectPath(x - w, top, width, front, 3)} fill={pick(m.metalSide, p.scalesFront)} stroke={p.draw} strokeWidth={stroke.body} />
      {reading !== null && (
        <G>
          <DrawnShape clock={clock} pen={penPart(pen, 2, 3)} {...rectPath(x - 31, top + 4, 62, 15, 3)} fill={p.page} stroke={p.draw} strokeWidth={stroke.thin} />
          {/* the reading appears with the fills, never before (a hidden reading stays "- - -") */}
          <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
            <MonoLabel x={x} y={top + 15.5} text={reading} color={p.ink} size={11} />
          </DrawnFade>
        </G>
      )}
    </G>
  );
}
