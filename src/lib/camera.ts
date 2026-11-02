// One camera for the Motion Lab track. It either follows the car (the road slides under it)
// or shows the whole track (to pick a place by tapping). Moving between the two is a blend, so it is smooth.
export const FOLLOW_WINDOW = 30; // m across the screen when following
export const CAR_FRACTION = 0.4; // where the car stands on the track while following

export type TrackBox = { left: number; width: number };

export const followX = (m: number, s: number, box: TrackBox, windowM = FOLLOW_WINDOW) =>
  box.left + box.width * CAR_FRACTION + ((m - s) * box.width) / windowM;

export const overviewX = (m: number, lo: number, hi: number, box: TrackBox) => box.left + ((m - lo) / (hi - lo)) * box.width;

// mix 0 = whole track, 1 = following the car.
export const cameraX = (m: number, s: number, mix: number, lo: number, hi: number, box: TrackBox) =>
  overviewX(m, lo, hi, box) * (1 - mix) + followX(m, s, box) * mix;

// Pixels per metre at this blend (used to spin the wheels in step with the road).
export const pixelsPerMetre = (mix: number, lo: number, hi: number, box: TrackBox) =>
  (box.width / (hi - lo)) * (1 - mix) + (box.width / FOLLOW_WINDOW) * mix;

// Is a world position inside the visible track?
export const isVisible = (x: number, width: number, margin = 10) => x >= margin && x <= width - margin;
