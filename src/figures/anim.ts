// Small animation clocks for figures. They run on requestAnimationFrame and re-render only the
// component that uses them (a few SVG lines), which is cheap enough for Expo Go and works on the web.
// With reduced motion turned on, values jump straight to their target and loops stay still.
import { useEffect, useRef, useState } from 'react';
import { useReducedMotionPref } from '@/ui/parts';

/** A number that eases to `target` whenever it changes (ease-out cubic). Starts at `from` if given. */
export function useTween(target: number, from?: number, ms = 420): number {
  const reduced = useReducedMotionPref();
  const [value, setValue] = useState(from ?? target);
  const current = useRef(from ?? target);
  useEffect(() => {
    if (reduced) {
      current.current = target;
      setValue(target);
      return;
    }
    const start = current.current;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      const x = start + (target - start) * (1 - (1 - k) ** 3);
      current.current = x;
      setValue(x);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced, ms]);
  return value;
}

/**
 * Time in seconds inside a repeating clip: runs 0 → `length`, holds the last frame for `hold`, starts again.
 * `running` false pauses on the current frame; a new `restartKey` goes back to 0.
 */
export function useLoopTime(running: boolean, length: number, restartKey: unknown, hold = 0.7): number {
  const [t, setT] = useState(0);
  const time = useRef(0);
  useEffect(() => {
    time.current = 0;
    setT(0);
  }, [restartKey]);
  useEffect(() => {
    if (!running || length <= 0) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      time.current += Math.min(0.05, (now - last) / 1000); // a long gap (tab hidden) never jumps far
      last = now;
      if (time.current > length + hold) time.current = 0;
      setT(Math.min(time.current, length));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [running, length, hold, restartKey]);
  return t;
}
