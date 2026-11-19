// Moments: the turning effect of a force about a pivot (WPH11 point 15).
// moment = F × x, where x is the perpendicular distance from the pivot to the force's line of action.
// Signs: anticlockwise is positive, clockwise negative (the lesson text says the words, not the signs).

const RAD = Math.PI / 180;

/** Moment of a force F (N) whose line of action is a perpendicular distance x (m) from the pivot: F × x, in N m. */
export function moment(force: number, x: number): number {
  return force * x;
}

/**
 * Perpendicular distance from the pivot to the line of action of a force applied a distance r from the pivot,
 * at `angle` degrees to the line from the pivot to that point: r sin θ. Along the lever (0°) it is zero.
 */
export function perpendicularDistance(r: number, angle: number): number {
  return Math.abs(r * Math.sin(angle * RAD));
}

/** Moment of a force F applied at distance r, at `angle` degrees to the lever: F × r sin θ (= (F sin θ) × r). */
export function momentAtAngle(force: number, r: number, angle: number): number {
  return moment(force, perpendicularDistance(r, angle));
}

/** The component of a force at right angles to the lever, F sin θ: the only part that turns it. */
export function turningComponent(force: number, angle: number): number {
  return Math.abs(force * Math.sin(angle * RAD));
}

/**
 * The resultant moment of several moments, each signed: anticlockwise +, clockwise −.
 * Same sense: they add; opposite senses: they subtract.
 */
export function resultantMoment(moments: number[]): number {
  return moments.reduce((sum, m) => sum + m, 0);
}

/**
 * Moment about a pivot of a vertical load hanging a horizontal distance `at` from it (right of the pivot positive):
 * a downward force on the right turns clockwise (negative), on the left anticlockwise (positive).
 */
export function loadMoment(load: number, at: number): number {
  return -load * at;
}

/** How far from the pivot a force F at `angle` degrees to the lever must act to give the moment M: x = M ÷ (F sin θ). */
export function distanceForMoment(m: number, force: number, angle = 90): number {
  return m / turningComponent(force, angle);
}

/**
 * Where the perpendicular from point P meets the line through A in direction (dx, dy), and its length.
 * Used by the figures to draw the perpendicular distance to a line of action.
 */
export function footOfPerpendicular(p: readonly [number, number], a: readonly [number, number], d: readonly [number, number]): { foot: [number, number]; distance: number } {
  const len = Math.hypot(d[0], d[1]);
  const ux = d[0] / len;
  const uy = d[1] / len;
  const t = (p[0] - a[0]) * ux + (p[1] - a[1]) * uy;
  const foot: [number, number] = [a[0] + ux * t, a[1] + uy * t];
  return { foot, distance: Math.hypot(p[0] - foot[0], p[1] - foot[1]) };
}
