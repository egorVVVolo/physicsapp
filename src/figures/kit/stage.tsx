// The draw-in helper every figure uses: a part of the drawing fades in over one stretch of the pen's clock.
import type { ReactNode } from 'react';
import type { DrawClock } from '../anim';
import { DrawnFade, type Pen } from '../draw';

/** `children` fade in while the pen is in the stretch `pen` (plain when the figure does not draw itself). */
export function stage(clock: DrawClock, pen: Pen, children: ReactNode) {
  return (
    <DrawnFade clock={clock} from={pen[0]} to={pen[1]}>
      {children}
    </DrawnFade>
  );
}
