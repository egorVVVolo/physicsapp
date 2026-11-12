// Small animation clocks for figures. They run on requestAnimationFrame and re-render only the
// component that uses them (a few SVG lines), which is cheap enough for Expo Go and works on the web.
// With reduced motion turned on, values jump straight to their target and loops stay still.
import { useEffect, useRef, useState } from 'react';
import { useReducedMotionPref } from '@/ui/parts';

/**
 * A number that eases to `target` whenever it changes (ease-out cubic). Starts at `from` if given.
 * `delay` (ms) holds only the very first animation, so a figure can wait until its screen has slid in.
 */
export function useTween(target: number, from?: number, ms = 420, delay = 0): number {
  const reduced = useReducedMotionPref();
  const [value, setValue] = useState(from ?? target);
  const current = useRef(from ?? target);
  const first = useRef(true);
  useEffect(() => {
    if (reduced) {
      current.current = target;
      setValue(target);
      return;
    }
    const start = current.current;
    const t0 = performance.now() + (first.current ? delay : 0);
    first.current = false;
    let raf = 0;
    const step = (now: number) => {
      const k = Math.max(0, Math.min(1, (now - t0) / ms));
      const x = start + (target - start) * (1 - (1 - k) ** 3);
      current.current = x;
      setValue(x);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced, ms, delay]);
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

/**
 * A slow, endless wave between −1 and 1 (one full swing every `period` seconds), for gentle drifts
 * such as the acceleration chevrons. Updates at most 30 times a second; still (0) with reduced motion.
 */
export function useWave(period = 1.6, running = true): number {
  const reduced = useReducedMotionPref();
  const [w, setW] = useState(0);
  useEffect(() => {
    if (reduced || !running) return;
    let raf = 0;
    let last = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      if (now - last > 33) {
        last = now;
        setW(Math.sin(((now - t0) / 1000 / period) * 2 * Math.PI));
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [period, reduced, running]);
  return w;
}

/** Seconds since the component appeared, counting up to `length` once and then staying there. Reduced motion: `length` at once. */
export function useOnceTime(length: number): number {
  const reduced = useReducedMotionPref();
  const [t, setT] = useState(0);
  useEffect(() => {
    if (reduced) {
      setT(length);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const x = Math.min(length, (now - t0) / 1000);
      setT(x);
      if (x < length) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [length, reduced]);
  return t;
}

/** 0 → 1 between `start` and `start + dur` seconds, eased out (cubic). */
export function phaseOf(t: number, start: number, dur: number): number {
  const k = Math.max(0, Math.min(1, (t - start) / dur));
  return 1 - (1 - k) ** 3;
}
