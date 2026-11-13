// The person and the bathroom scales, drawn once and reused by every figure.
// Flat shapes with an ink outline, quiet colours (never blue: blue is for forces).
// The scales are drawn in the same flat "vector 3D" as the pucks on the map: a light top face and a darker front.
// Both can draw themselves: pass the running clock and the stretch of the draw-in (`pen`) their outlines take.
import { G, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { STILL, type DrawClock } from './anim';
import { CgMark, circlePath, DrawnFade, DrawnPath, DrawnShape, FILLS, MonoLabel, penPart, polyPath, rectPath, type Pen } from './draw';

/** Height of the person from the soles to the top of the head, in viewBox units at scale 1. */
export const PERSON_H = 136;
/** Where the centre of gravity sits above the soles, at scale 1. */
export const PERSON_CG = 80;
/** Half the width of the person at the shoulders and arms, at scale 1. */
export const PERSON_HALF_W = 25;

// the person's outlines, in their own units (soles at 0, 0); lengths are worked out or a little over
const TROUSERS = polyPath([[-14, -64], [14, -64], [13, -6], [2.5, -6], [1, -42], [-1, -42], [-2.5, -6], [-13, -6]]);
const ARM_L = rectPath(-24, -104, 8, 40, 4);
const ARM_R = rectPath(16, -104, 8, 40, 4);
const HAND_L = circlePath(-20, -61, 4.2);
const HAND_R = circlePath(20, -61, 4.2);
const NECK = rectPath(-4.5, -114, 9, 10);
const SHIRT = { d: 'M-18,-98 Q-18,-106 -10,-106 L10,-106 Q18,-106 18,-98 L16,-62 L-16,-62 Z', len: 152 };
const COLLAR = { d: 'M-5,-106 L0,-100 L5,-106', len: 16 };
const HEAD = circlePath(0, -123, 12.5);
const HAIR = { d: 'M-12.34,-121 A12.5,12.5 0 1 1 12.34,-121 Q12,-125.5 8,-126.5 Q1,-128 -4,-126 Q-9,-127 -12.34,-121 Z', len: 76 };

/** A person standing, soles at (x, y). Drawn by the pen: legs, arms, shirt, head, then the fills, then the CG mark. */
export function Person({ x, y, scale = 1, cg = true, clock = STILL, pen = [0, 1] }: { x: number; y: number; scale?: number; cg?: boolean; clock?: DrawClock; pen?: Pen }) {
  const { palette: p } = useTheme();
  const line = { stroke: p.draw, strokeWidth: 1.8, strokeLinejoin: 'round' as const };
  const part = (i: number) => penPart(pen, i, 6);
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* shoes */}
      <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
        <Rect x={-16} y={-7} width={14} height={7} rx={3.5} fill={p.shoe} />
        <Rect x={2} y={-7} width={14} height={7} rx={3.5} fill={p.shoe} />
      </DrawnFade>
      {/* trousers: one shape with a gap between the legs */}
      <DrawnShape clock={clock} pen={part(0)} {...TROUSERS} fill={p.trousers} {...line} />
      {/* arms behind the shirt, hands below the cuffs */}
      <DrawnShape clock={clock} pen={part(1)} {...ARM_L} fill={p.shirt} {...line} />
      <DrawnShape clock={clock} pen={part(1)} {...ARM_R} fill={p.shirt} {...line} />
      <DrawnShape clock={clock} pen={part(2)} {...HAND_L} fill={p.skin} {...line} />
      <DrawnShape clock={clock} pen={part(2)} {...HAND_R} fill={p.skin} {...line} />
      {/* neck and shirt */}
      <DrawnShape clock={clock} pen={part(3)} {...NECK} fill={p.skin} {...line} />
      <DrawnShape clock={clock} pen={part(3)} {...SHIRT} fill={p.shirt} {...line} />
      <DrawnPath clock={clock} from={part(3)[0]} to={part(3)[1]} {...COLLAR} fill="none" stroke={p.draw} strokeWidth={1.4} strokeLinejoin="round" />
      {/* head with a short fringe of hair */}
      <DrawnShape clock={clock} pen={part(4)} {...HEAD} fill={p.skin} {...line} />
      <DrawnShape clock={clock} pen={part(5)} {...HAIR} fill={p.hair} {...line} />
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
  const { palette: p } = useTheme();
  const w = width / 2;
  const front = 23; // front face height
  const top = y - front;
  const topFace = polyPath([[x - w, top], [x + w, top], [x + w - 7, y - SCALES_H], [x - w + 7, y - SCALES_H]]);
  return (
    <G>
      {/* top face, seen slightly from above */}
      <DrawnShape clock={clock} pen={penPart(pen, 0, 3)} {...topFace} fill={p.scalesTop} stroke={p.draw} strokeWidth={1.8} strokeLinejoin="round" />
      {/* front face with the display */}
      <DrawnShape clock={clock} pen={penPart(pen, 1, 3)} {...rectPath(x - w, top, width, front, 3)} fill={p.scalesFront} stroke={p.draw} strokeWidth={1.8} />
      {reading !== null && (
        <G>
          <DrawnShape clock={clock} pen={penPart(pen, 2, 3)} {...rectPath(x - 31, top + 4, 62, 15, 3)} fill="#FFFFFF" stroke={p.draw} strokeWidth={1.2} />
          {/* the reading appears with the fills, never before (a hidden reading stays "- - -") */}
          <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
            <MonoLabel x={x} y={top + 15.5} text={reading} color={p.ink} size={11} />
          </DrawnFade>
        </G>
      )}
    </G>
  );
}
