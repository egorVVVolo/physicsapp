// Small animation clocks for figures. They run on requestAnimationFrame and re-render only the
// component that uses them (a few SVG lines), which is cheap enough for Expo Go and works on the web.
// With reduced motion turned on, values jump straight to their target and loops stay still.
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Easing, useSharedValue, withDelay, withTiming, type SharedValue } from 'react-native-reanimated';
import type { Fig } from '@/content/types';
import { motion } from '@/theme/tokens';
import { useReducedMotionPref } from '@/ui/parts';

// ── A figure draws itself the first time it appears in a lesson ──

/** While `on`, `t` runs 0 → 1 and each line of the drawing picks its own stretch of it (see DrawnPath). */
export type DrawClock = { on: false } | { on: true; t: SharedValue<number> };
export const STILL: DrawClock = { on: false };

const DRAW_DELAY = 380; // the screen slides in first (340 ms)
const DRAW_MS = motion.scene * 2;
/** Milliseconds from the start of a draw-in until the drawing (lines and fills) is done: forces grow after this. */
export const DRAWN_MS = DRAW_DELAY + DRAW_MS * 0.85;

/**
 * The pen's clock: 1.2 s, eased in and out, from the moment `active` becomes true (the sheet knows its size).
 * Not active or reduced motion: the figure is simply there.
 */
export function useDrawIn(active: boolean): DrawClock {
  const reduced = useReducedMotionPref();
  const run = active && !reduced;
  const t = useSharedValue(0);
  const [finished, setFinished] = useState(false);
  useEffect(() => {
    if (!run) return;
    t.set(withDelay(DRAW_DELAY, withTiming(1, { duration: DRAW_MS, easing: Easing.inOut(Easing.cubic) })));
    // when the pen is done the figure goes back to plain lines (nothing left animating)
    const id = setTimeout(() => setFinished(true), DRAW_DELAY + DRAW_MS + 40);
    return () => clearTimeout(id);
  }, [run, t]);
  return run && !finished ? { on: true, t } : STILL;
}

/**
 * What a lesson remembers about its figures from screen to screen. The lesson player provides it (outside a lesson
 * it is null and nothing draws itself). `seen`: the kinds of figure already shown. `shown`: the figure on screen now,
 * as drawn (after Check, with a lift's live acceleration). `width`: the sheet's drawing width. `scrollY`: how far
 * the screen is scrolled. The sheet and the screen frame write it; the player reads it when it moves on.
 */
export type FigMemory = { seen: Set<string>; shown: Fig | null; width: number; scrollY: number };
export const LessonFigs = createContext<FigMemory | null>(null);

/** True if this is the first time a figure of this kind appears in the lesson (decided once, when it mounts). */
export function useFirstShow(kind: string): boolean {
  const memory = useContext(LessonFigs);
  const [first] = useState(() => memory !== null && !memory.seen.has(kind));
  useEffect(() => {
    memory?.seen.add(kind);
  }, [memory, kind]);
  return first;
}

// ── The same figure on the next screen ──

/**
 * Set when the screen before showed a figure of the same kind. Its sheet then stays where it was (only the text moves in)
 * and the figure changes state from `prev`: arrows already there stay, new ones grow, values count to their new size.
 * `fromY`: how far the screen before was scrolled, so the sheet glides back into place instead of jumping.
 */
export type SharedFig = { prev: Fig; width: number; fromY: number };
export const SharedSheet = createContext<SharedFig | null>(null);

/** On a sheet that stays, the change waits this long, so the eye is on the figure when it happens. */
export const CHANGE_DELAY = motion.base;

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

/**
 * Seconds since the component appeared (or since `start` became true), counting up to `length` once and then staying there.
 * Reduced motion, or `done` (the figure was already on the screen before): `length` at once.
 */
export function useOnceTime(length: number, start = true, done = false): number {
  const reduced = useReducedMotionPref();
  const [t, setT] = useState(done ? length : 0);
  useEffect(() => {
    if (reduced || done) {
      setT(length);
      return;
    }
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const x = Math.min(length, (now - t0) / 1000);
      setT(x);
      if (x < length) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [length, reduced, start, done]);
  return t;
}

/** 0 → 1 between `start` and `start + dur` seconds, eased out (cubic). */
export function phaseOf(t: number, start: number, dur: number): number {
  const k = Math.max(0, Math.min(1, (t - start) / dur));
  return 1 - (1 - k) ** 3;
}
