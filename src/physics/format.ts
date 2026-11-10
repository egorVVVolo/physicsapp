// Number formatting for lesson text and readouts. Rounds first, then decides the sign,
// so a value that rounds to zero is never shown as "−0.0".

const MINUS = '−';

/** Fixed decimals, e.g. fixed(9.81, 2) → "9.81". A rounded zero has no sign. */
export function fixed(x: number, dp: number): string {
  const r = Math.abs(x).toFixed(dp);
  if (Number(r) === 0) return r;
  return x < 0 ? MINUS + r : r;
}

/** Fixed decimals with an explicit sign: "+4.0", "−9.8", and "0.0" for a rounded zero. */
export function signed(x: number, dp: number): string {
  const r = Math.abs(x).toFixed(dp);
  if (Number(r) === 0) return r;
  return (x < 0 ? MINUS : '+') + r;
}
