// Small animation clocks for figures. They run on requestAnimationFrame and re-render only the
// component that uses them (a few SVG lines), which is cheap enough for Expo Go and works on the web.
// With reduced motion turned on, values jump straight to their target and loops stay still.
import { createContext, useContext, useEffect, useState } from 'react';
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

// ── Clocks that stop when nobody can see them ──

/**
 * Whether the sheet is in view: false when the screen is scrolled so the sheet is mostly above the top (Frame), on a
 * compact sheet (a still reminder), and while the app is in the background (Sheet). Loops pause on the frame they are at;
 * short one-off changes (tweens, once-clips) simply finish. Outside a sheet it is true.
 */
export const SheetVisible = createContext(true);

/**
 * The one frame clock every figure uses: calls `step(dt)` on each animation frame while `running` and the sheet is in
 * view (dt in seconds, never more than 0.05, so a long gap never jumps far). `step` returning false stops the clock until
 * `wake` changes (or `running` / visibility turn it on again).
 */
export function useFrame(running: boolean, step: (dt: number) => boolean | void, wake?: unknown): void {
  const visible = useContext(SheetVisible);
  const [box] = useState(() => ({ step }));
  box.step = step;
  const active = running && visible;
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (box.step(dt) === false) return;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, wake, box]);
}

/** One eased number: where it goes, where it starts (default: already there), how long (ms), and a wait before its first move. */
export type TweenSpec = { to: number; from?: number; ms?: number; delay?: number };

/**
 * Several numbers that each ease to their `to` whenever it changes (ease-out cubic), all on one frame clock.
 * `delay` holds only each number's very first move, so a figure can wait until its screen has slid in.
 * Reduced motion or a sheet out of view: the numbers are simply at their targets.
 */
export function useTweens(specs: TweenSpec[]): number[] {
  const reduced = useReducedMotionPref();
  const visible = useContext(SheetVisible);
  const snap = reduced || !visible;
  const [parts] = useState(() => {
    const now = performance.now();
    return specs.map((s) => ({ start: s.from ?? s.to, to: s.to, at: s.from ?? s.to, t0: now + (s.delay ?? 0) }));
  });
  const [values, setValues] = useState(() => parts.map((q) => q.at));
  const key = specs.map((s) => s.to).join(',');
  useEffect(() => {
    const now = performance.now();
    specs.forEach((s, i) => {
      const q = parts[i];
      if (!q) return;
      if (snap) Object.assign(q, { start: s.to, to: s.to, at: s.to });
      else if (q.to !== s.to) Object.assign(q, { start: q.at, to: s.to, t0: Math.max(now, q.t0) });
    });
    if (snap) setValues(parts.map((q) => q.at));
    // `specs` is read through `key`: only a new target matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, snap, parts]);
  const ms = specs.map((s) => s.ms ?? 420);
  useFrame(
    !snap,
    () => {
      const now = performance.now();
      let moving = false;
      parts.forEach((q, i) => {
        const k = Math.max(0, Math.min(1, (now - q.t0) / ms[i]));
        q.at = q.start + (q.to - q.start) * (1 - (1 - k) ** 3);
        if (k < 1) moving = true;
      });
      setValues(parts.map((q) => q.at));
      return moving;
    },
    key,
  );
  return snap ? specs.map((s) => s.to) : values;
}

/**
 * A number that eases to `target` whenever it changes (ease-out cubic). Starts at `from` if given.
 * `delay` (ms) holds only the very first animation, so a figure can wait until its screen has slid in.
 */
export function useTween(target: number, from?: number, ms = 420, delay = 0): number {
  return useTweens([{ to: target, from, ms, delay }])[0];
}

/**
 * The sheet's replay counter: the Replay button adds one, and every clip on the sheet (useLoopTime, useOnceTime)
 * starts again from 0. Outside a sheet it stays 0.
 */
export const SheetReplay = createContext(0);

/**
 * Time in seconds inside a repeating clip: runs 0 → `length`, holds the last frame for `hold`, starts again.
 * `running` false (or the sheet out of view) pauses on the current frame; a new `restartKey` goes back to 0.
 */
export function useLoopTime(running: boolean, length: number, restartKey: unknown, hold = 0.7): number {
  const replay = useContext(SheetReplay);
  const [t, setT] = useState(0);
  const [clip] = useState(() => ({ time: 0 }));
  useEffect(() => {
    clip.time = 0;
    setT(0);
  }, [restartKey, replay, clip]);
  useFrame(running && length > 0, (dt) => {
    clip.time += dt;
    if (clip.time > length + hold) clip.time = 0;
    setT(Math.min(clip.time, length));
  });
  return t;
}

/**
 * A slow, endless wave between −1 and 1 (one full swing every `period` seconds), for gentle drifts
 * such as the acceleration chevrons. Updates at most 30 times a second; still (0) with reduced motion.
 */
export function useWave(period = 1.6, running = true): number {
  const reduced = useReducedMotionPref();
  const [w, setW] = useState(0);
  const [clip] = useState(() => ({ time: 0, since: 0 }));
  useFrame(!reduced && running, (dt) => {
    clip.time += dt;
    clip.since += dt;
    if (clip.since < 0.033) return;
    clip.since = 0;
    setW(Math.sin((clip.time / period) * 2 * Math.PI));
  });
  return reduced ? 0 : w;
}

/**
 * Seconds since the component appeared (or since `start` became true), counting up to `length` once and then staying there.
 * Reduced motion, `done` (the figure was already on the screen before) or a sheet out of view: `length` at once.
 */
export function useOnceTime(length: number, start = true, doneIn = false): number {
  const reduced = useReducedMotionPref();
  const visible = useContext(SheetVisible);
  const replay = useContext(SheetReplay);
  const done = doneIn && replay === 0; // a replay plays it even if it was already on the screen before
  const finished = reduced || done;
  const [t, setT] = useState(finished ? length : 0);
  const [clip] = useState(() => ({ time: 0 }));
  useEffect(() => {
    clip.time = finished ? length : 0;
    setT(clip.time);
  }, [length, finished, replay, clip]);
  // out of view the clip finishes (and stays finished when it comes back into view)
  useEffect(() => {
    if (visible) return;
    clip.time = length;
    setT(length);
  }, [visible, length, clip]);
  useFrame(
    start && !finished,
    (dt) => {
      clip.time = Math.min(length, clip.time + dt);
      setT(clip.time);
      return clip.time < length;
    },
    `${length}-${replay}`,
  );
  return finished ? length : t;
}

/** 0 → 1 between `start` and `start + dur` seconds, eased out (cubic). */
export function phaseOf(t: number, start: number, dur: number): number {
  const k = Math.max(0, Math.min(1, (t - start) / dur));
  return 1 - (1 - k) ** 3;
}
