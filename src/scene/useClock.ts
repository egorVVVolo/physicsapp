// One clock `t` (seconds of model time) drives everything in a scene.
// Playback pauses briefly at each event, shows its caption, then carries on by itself.
import { useCallback, useRef, useState } from 'react';
import { useFrameCallback, useReducedMotion, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { advance, type ClockEvent } from './clockStep';

export type { ClockEvent };
export type ClockStatus = 'idle' | 'playing' | 'holding' | 'paused' | 'ended';

export function useClock(holdSeconds = 1.7) {
  const t = useSharedValue(0);
  const times = useSharedValue<number[]>([]);
  const ends = useSharedValue<boolean[]>([]);
  const index = useSharedValue(0);
  const hold = useSharedValue(0);
  const ended = useSharedValue(false);
  const paused = useSharedValue(true);
  const lastTs = useSharedValue(-1); // previous frame timestamp; -1 = none yet
  const reduced = useReducedMotion();
  const ids = useRef<string[]>([]);
  const [status, setStatus] = useState<ClockStatus>('idle');
  const [eventId, setEventId] = useState<string | null>(null);

  const onEvent = useCallback((i: number, isEnd: boolean) => {
    setEventId(ids.current[i] ?? null);
    setStatus(isEnd ? 'ended' : 'holding');
  }, []);
  const onResume = useCallback(() => {
    setEventId(null);
    setStatus('playing');
  }, []);

  // Always running; does nothing while paused. Real elapsed time comes from frame timestamps,
  // so playback speed is the same at 60, 90 and 120 Hz.
  useFrameCallback((info) => {
    'worklet';
    if (paused.value || ended.value) {
      lastTs.value = -1;
      return;
    }
    const elapsed = lastTs.value < 0 ? 0 : info.timestamp - lastTs.value;
    lastTs.value = info.timestamp;
    const dt = Math.min(0.05, Math.max(0, elapsed) / 1000);
    const r = advance({ t: t.value, index: index.value, hold: hold.value, ended: false }, dt, times.value, ends.value, holdSeconds, reduced);
    t.value = r.t;
    index.value = r.index;
    hold.value = r.hold;
    ended.value = r.ended;
    if (r.fired >= 0) scheduleOnRN(onEvent, r.fired, r.ended);
    else if (r.ended) scheduleOnRN(onEvent, -1, true);
    else if (r.resumed) scheduleOnRN(onResume);
  });

  const play = useCallback(
    (events: ClockEvent[]) => {
      const sorted = [...events].sort((a, b) => a.t - b.t);
      ids.current = sorted.map((e) => e.id);
      times.value = sorted.map((e) => e.t);
      ends.value = sorted.map((e) => e.end === true);
      index.value = 0;
      hold.value = 0;
      t.value = 0;
      ended.value = false;
      paused.value = false;
      setEventId(null);
      setStatus('playing');
    },
    [times, ends, index, hold, t, ended, paused],
  );

  const togglePause = useCallback(() => {
    if (ended.value || times.value.length === 0) return;
    paused.value = !paused.value;
    setStatus(paused.value ? 'paused' : hold.value > 0 ? 'holding' : 'playing');
  }, [ended, times, paused, hold]);

  const reset = useCallback(() => {
    paused.value = true;
    ended.value = false;
    times.value = [];
    ends.value = [];
    t.value = 0;
    hold.value = 0;
    index.value = 0;
    setEventId(null);
    setStatus('idle');
  }, [paused, ended, times, ends, t, hold, index]);

  return { t, status, eventId, play, togglePause, reset, setEventId };
}
