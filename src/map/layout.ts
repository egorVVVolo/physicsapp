// Geometry of the course map, kept apart from the drawing so it can be tested.
// Inside a level the pucks follow a gentle wave on the left; titles sit in a fixed column on the right.

export const PUCK = 92; // puck width, pt
export const ROW = 112; // height of one lesson row
export const BADGE_SPACE = 56; // extra room above the current lesson for its hovering tile
const WAVE = [0, 18, 26, 18, 0, -18, -26, -18];

/** Top and height of every row in a level; the row of the current lesson is taller (badge above). */
export function rowLayout(count: number, currentIndex: number): { tops: number[]; heights: number[]; total: number } {
  const tops: number[] = [];
  const heights: number[] = [];
  let y = 0;
  for (let i = 0; i < count; i++) {
    const h = ROW + (i === currentIndex ? BADGE_SPACE : 0);
    tops.push(y);
    heights.push(h);
    y += h;
  }
  return { tops, heights, total: y };
}

/** Horizontal centre of the i-th puck in a column `width` wide. */
export function puckX(width: number, i: number): number {
  return Math.round(Math.min(width * 0.3, 120) + WAVE[i % WAVE.length]);
}

/** Left edge of the title column: clear of the widest swing of the wave. */
export function labelX(width: number): number {
  return Math.round(Math.min(width * 0.3, 120) + Math.max(...WAVE) + PUCK / 2 + 14);
}

/** Vertical centre of a puck's face inside its row (the badge space, if any, is above it). */
export function puckY(rowTop: number, rowHeight: number): number {
  return rowTop + rowHeight - ROW / 2 - 4;
}

/** Index of the level shown in the pinned header: the last one whose top has scrolled up to `y`. */
export function levelAt(y: number, levelTops: number[]): number {
  let at = 0;
  levelTops.forEach((top, i) => {
    if (top <= y) at = i;
  });
  return at;
}

/** SVG path through the puck centres, as smooth S-curves between neighbours. */
export function pathThrough(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const my = (a.y + b.y) / 2;
    d += ` C${a.x},${my} ${b.x},${my} ${b.x},${b.y}`;
  }
  return d;
}
