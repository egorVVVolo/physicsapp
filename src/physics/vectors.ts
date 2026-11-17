// Vectors in a plane: two perpendicular parts added tip to tail, and the displacement around part of a circle.
// Directions are measured as an angle from one chosen line (north, or "straight across"), as exam answers are.

/** Size of the resultant of two perpendicular vectors (Pythagoras): √(a² + b²). */
export function sizeAtRightAngles(a: number, b: number): number {
  return Math.hypot(a, b);
}

/**
 * Angle of the resultant, in degrees, measured from the line of the first vector towards the second one:
 * tan θ = second ÷ first. For 3.0 km north then 4.0 km east it is 53° east of north.
 */
export function angleFromFirst(first: number, second: number): number {
  return (Math.atan2(Math.abs(second), Math.abs(first)) * 180) / Math.PI;
}

/** Straight-line distance between the start and the end of a run once round a fraction of a circle of this circumference. */
export function chordAround(circumference: number, fraction: number): number {
  const r = circumference / (2 * Math.PI);
  return 2 * r * Math.abs(Math.sin(Math.PI * fraction));
}

/** Radius of a circle of this circumference. */
export function radiusOf(circumference: number): number {
  return circumference / (2 * Math.PI);
}

// ── Resolving: one vector split into two components at right angles ──

const RAD = Math.PI / 180;

/**
 * The two components of a vector of size `size` at `angle` degrees from a chosen line:
 * the one along that line (next to the angle) is size × cos θ, the one across it (opposite the angle) is size × sin θ.
 * For a 100 N rope at 60° above the snow: forward 50.0 N, up 86.6 N.
 */
export function components(size: number, angle: number): { along: number; across: number } {
  return { along: size * Math.cos(angle * RAD), across: size * Math.sin(angle * RAD) };
}

/** The angle from a line, in degrees, at which a vector of size `size` has the component `along` along that line: cos θ = along ÷ size. */
export function angleForComponent(size: number, along: number): number {
  return Math.acos(along / size) / RAD;
}

/**
 * A weight on a slope of `angle` degrees, split along the slope (down it: W sin θ) and into the slope (W cos θ).
 * The angle between the weight and the line into the slope is the angle of the slope itself.
 */
export function onSlope(weight: number, angle: number): { along: number; into: number } {
  const c = components(weight, angle);
  return { along: c.across, into: c.along };
}
