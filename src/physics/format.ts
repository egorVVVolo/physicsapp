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

/** Three (or n) significant figures, never in e-notation: sig(2354.4) → "2350", sig(156.96) → "157", sig(0.5) → "0.500". */
export function sig(x: number, n = 3): string {
  if (Math.abs(x) < 1e-9) return '0'; // 0 and floating-point dust such as 2.2e-16
  const digits = Math.floor(Math.log10(Math.abs(x))) + 1; // digits before the point
  if (digits < n) return fixed(x, n - digits);
  const step = 10 ** (digits - n);
  return fixed(Math.round(x / step) * step, 0);
}

const SUPER: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };

/** Standard form with three (or n) significant figures: sci(0.0001) → "1.00 × 10⁻⁴", sci(7.8e-4) → "7.80 × 10⁻⁴". */
export function sci(x: number, n = 3): string {
  if (x === 0) return '0';
  let e = Math.floor(Math.log10(Math.abs(x)));
  let m = Number((x / 10 ** e).toFixed(n - 1));
  if (Math.abs(m) >= 10) {
    m /= 10;
    e += 1;
  }
  const power = String(e).split('').map((c) => SUPER[c]).join('');
  return `${fixed(m, n - 1)} × 10${power}`;
}
