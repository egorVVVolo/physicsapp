// One clock `t` (seconds of model time) drives everything in a scene.
// Playback pauses briefly at each event, shows its caption, then carries on by itself.
import { useRef, useState } from 'react';
import { useFrameCallback, useReducedMotion, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

export type ClockEvent = { t: number; id: string; end?: boolean };
export type ClockStatus = 'idle' | 'playing' | 'holding' | 'paused' | 'ended';

const FROZEN = 1e9;

export function useClock(holdSeconds = 1.7) {
  const t = useSharedValue(0);
  const times = useSharedValue<number[]>([]);
  const ends = useSharedValue<boolean[]>([]);
  const index = useSharedValue(0);
  const hold = useSharedValue(0);
  const lastTs = useSharedValue(-1); // timestamp of the previous frame; -1 = no previous frame
  const reduced = useReducedMotion();
  const ids = useRef<string[]>([]);
  const [status, setStatus] = useState<ClockStatus>('idle');
  const [eventId, setEventId] = useState<string | null>(null);

  const onEvent = (i: number, end: boolean) => {
    setEventId(ids.current[i] ?? null);
    if (end) {
      frame.setActive(false);
      setStatus('ended');
    } else {
      setStatus('holding');
    }
  };
  const onResume = () => {
    setEventId(null);
    setStatus('playing');
  };

  const frame = useFrameCallback((info) => {
    'worklet';
    // Real elapsed time from timestamps, so playback speed is the same at 60, 90 and 120 Hz.
    const elapsed = lastTs.value < 0 ? 0 : info.timestamp - lastTs.value;
    lastTs.value = info.timestamp;
    const dt = Math.min(0.05, Math.max(0, elapsed) / 1000);
    if (hold.value > 0) {
      if (hold.value >= FROZEN) return;
      hold.value -= dt;
      if (hold.value <= 0) scheduleOnRN(onResume);
      return;
    }
    const i = index.value;
    const next = i < times.value.length ? times.value[i] : Number.POSITIVE_INFINITY;
    const nt = reduced ? next : t.value + dt;
    if (nt >= next) {
      t.value = next;
      index.value = i + 1;
      const end = ends.value[i] === true;
      hold.value = end ? FROZEN : holdSeconds;
      scheduleOnRN(onEvent, i, end);
    } else {
      t.value = nt;
    }
  }, false);

  function play(events: ClockEvent[]) {
    const sorted = [...events].sort((a, b) => a.t - b.t);
    ids.current = sorted.map((e) => e.id);
    times.value = sorted.map((e) => e.t);
    ends.value = sorted.map((e) => e.end === true);
    index.value = 0;
    hold.value = 0;
    t.value = 0;
    lastTs.value = -1;
    setEventId(null);
    setStatus('playing');
    frame.setActive(true);
  }

  function togglePause() {
    if (status === 'playing' || status === 'holding') {
      frame.setActive(false);
      setStatus('paused');
    } else if (status === 'paused') {
      lastTs.value = -1;
      frame.setActive(true);
      setStatus(hold.value > 0 ? 'holding' : 'playing');
    }
  }

  function reset() {
    frame.setActive(false);
    t.value = 0;
    hold.value = 0;
    index.value = 0;
    setEventId(null);
    setStatus('idle');
  }

  return { t, status, eventId, play, togglePause, reset, setEventId };
}
