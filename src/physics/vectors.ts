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
