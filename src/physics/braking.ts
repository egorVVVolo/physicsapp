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

export function speedDuringBraking(u: number, a: number, t: number): number {
  return Math.max(u - a * t, 0);
}

export function positionDuringBraking(u: number, a: number, t: number): number {
  const tt = Math.min(t, stoppingTime(u, a));
  return u * tt - 0.5 * a * tt * tt;
}
