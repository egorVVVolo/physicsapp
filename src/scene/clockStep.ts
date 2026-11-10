// Pure step function for the scene clock. No React, no Reanimated imports, so it can be unit-tested
// and also run as a worklet on the UI thread.

export type ClockEvent = { t: number; id: string; end?: boolean };

export type StepState = {
  t: number; // model time, s
  index: number; // next event to reach
  hold: number; // seconds left in the pause at an event
  ended: boolean;
};

export type StepResult = StepState & {
  fired: number; // index of the event reached in this step, or -1
  resumed: boolean; // a pause at an event just finished
};

/**
 * Advance the clock by dt seconds of real time.
 * - Model time never passes an event: it stops exactly on it.
 * - A non-final event holds the clock for `holdSeconds`, then playback carries on by itself.
 * - `jump` (reduced motion) moves straight from event to event instead of animating between them.
 */
export function advance(s: StepState, dt: number, times: number[], ends: boolean[], holdSeconds: number, jump: boolean): StepResult {
  'worklet';
  if (s.ended) return { t: s.t, index: s.index, hold: 0, ended: true, fired: -1, resumed: false };
  if (s.hold > 0) {
    const left = s.hold - dt;
    if (left <= 0) return { t: s.t, index: s.index, hold: 0, ended: false, fired: -1, resumed: true };
    return { t: s.t, index: s.index, hold: left, ended: false, fired: -1, resumed: false };
  }
  if (s.index >= times.length) return { t: s.t, index: s.index, hold: 0, ended: true, fired: -1, resumed: false };
  const next = times[s.index];
  const nt = jump ? next : s.t + dt;
  if (nt >= next) {
    const end = ends[s.index] === true;
    return { t: next, index: s.index + 1, hold: end ? 0 : holdSeconds, ended: end, fired: s.index, resumed: false };
  }
  return { t: nt, index: s.index, hold: 0, ended: false, fired: -1, resumed: false };
}
