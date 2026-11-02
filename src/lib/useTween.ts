import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { easeArray } from './ease';

let reduceMotion = false;
AccessibilityInfo.isReduceMotionEnabled().then((v) => {
  reduceMotion = v;
});

// Smoothly moves a number to `target` (ease-out). With reduced motion it jumps.
export function useTween(target: number, ms = 600): number {
  const [value, setValue] = useState(target);
  const current = useRef(target);

  useEffect(() => {
    if (reduceMotion) {
      current.current = target;
      setValue(target);
      return;
    }
    const from = current.current;
    const start = Date.now();
    let raf = 0;
    const tick = () => {
      const x = Math.min((Date.now() - start) / ms, 1);
      const eased = 1 - Math.pow(1 - x, 3);
      current.current = from + (target - from) * eased;
      setValue(current.current);
      if (x < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);

  return value;
}

// Smoothly moves a list of numbers to `target` (one animation for the whole list).
// Used so the graph, the car and the road glide to a new shape instead of jumping.
export function useTweenArray(target: number[], ms = 160): number[] {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  const key = target.join(',');

  useEffect(() => {
    if (reduceMotion || current.current.length !== target.length) {
      current.current = target;
      setValue(target);
      return;
    }
    const from = current.current;
    const start = Date.now();
    let raf = 0;
    const tick = () => {
      const x = Math.min((Date.now() - start) / ms, 1);
      current.current = easeArray(from, target, x);
      setValue(current.current);
      if (x < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // `key` stands for the contents of `target`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ms]);

  return value;
}
