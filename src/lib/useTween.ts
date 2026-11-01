import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

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
