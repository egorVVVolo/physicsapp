// A number and its unit never part at the end of a line: "0.60 m" must not wrap as "0.60" / "m".
// Lesson text is written with ordinary spaces; every string of a lesson passes through keepUnits once, when the lessons
// are collected (lessons.ts), so the screens get a no-break space between a number and its unit, and inside compound
// units ("N m", "m s⁻¹", "kg m s⁻¹").

const NBSP = ' ';
const UNIT = '(?:kg|g|kN|N|mm|μm|m|s|cm|km|kJ|J|kW|W|Pa|h|min|°C)';
/** A number, a space, a unit not followed by another letter ("3 m" but not "3 more"). */
const AFTER_NUMBER = new RegExp(`([\\d⁰¹²³⁴⁵⁶⁷⁸⁹]) (?=${UNIT}(?![A-Za-z]))`, 'g');
/** Standard form stays in one piece: "1.00 × 10⁻⁴". */
const STANDARD_FORM = /(\d) × 10(?=[⁻⁰¹²³⁴⁵⁶⁷⁸⁹])/g;
/** Inside a compound unit that follows a number: "N m", "kg m", "m s⁻¹", "cm s⁻¹", "m s⁻²". */
const IN_UNIT = /(\d (?:kg|N|cm|m)(?: (?:m))?) (?=(?:m|s⁻[¹²])(?![A-Za-z]))/g;
/** The unit of viscosity: "1.41 Pa s". */
const PA_S = /(\d Pa) (?=s(?![A-Za-z⁻]))/g;

/** The text with no-break spaces between each number and its unit. */
export function keepUnits(text: string): string {
  let out = text.replace(STANDARD_FORM, `$1${NBSP}×${NBSP}10`).replace(AFTER_NUMBER, `$1${NBSP}`);
  // twice, for "kg m s⁻¹" (two spaces inside one unit)
  out = out.replace(IN_UNIT, `$1${NBSP}`);
  out = out.replace(IN_UNIT, `$1${NBSP}`);
  return out.replace(PA_S, `$1${NBSP}`);
}

/** A deep copy of lesson data with keepUnits applied to every string in it. */
export function keepUnitsIn<T>(data: T): T {
  if (typeof data === 'string') return keepUnits(data) as T;
  if (Array.isArray(data)) return data.map((x) => keepUnitsIn(x)) as T;
  if (data !== null && typeof data === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) out[k] = keepUnitsIn(v);
    return out as T;
  }
  return data;
}
