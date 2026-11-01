// Constant deceleration to rest. SI units: u in m/s, a in m/s^2 (positive magnitude), t in s.

export function stoppingDistance(u: number, a: number): number {
  return (u * u) / (2 * a);
}

export function stoppingTime(u: number, a: number): number {
  return u / a;
}

// Speed from which braking at a stops the car in exactly s metres.
export function stoppingSpeed(s: number, a: number): number {
  return Math.sqrt(2 * a * s);
}

// Driver reacts for tr seconds at constant speed u, then brakes.
export function totalStoppingDistance(u: number, a: number, tr: number): number {
  return u * tr + stoppingDistance(u, a);
}

export function speedWithReaction(u: number, a: number, tr: number, t: number): number {
  return t < tr ? u : speedDuringBraking(u, a, t - tr);
}

export function positionWithReaction(u: number, a: number, tr: number, t: number): number {
  return t < tr ? u * t : u * tr + positionDuringBraking(u, a, t - tr);
}

export function speedDuringBraking(u: number, a: number, t: number): number {
  return Math.max(u - a * t, 0);
}

export function positionDuringBraking(u: number, a: number, t: number): number {
  const tt = Math.min(t, stoppingTime(u, a));
  return u * tt - 0.5 * a * tt * tt;
}

// Whole grid squares (dt seconds wide, dv m/s tall) in the rectangle that bounds the braking triangle.
export function boundingSquares(u: number, a: number, dt: number, dv: number): { w: number; h: number } {
  return { w: stoppingTime(u, a) / dt, h: u / dv };
}
