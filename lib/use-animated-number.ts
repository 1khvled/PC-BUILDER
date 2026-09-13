"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Smoothly counts from the previous value to `target` (ease-out cubic).
 *
 * - First render returns `target` verbatim, so prerendered HTML and the
 *   first client render always match (hydration-safe).
 * - Animation runs only inside useEffect, i.e. after clicks / live updates.
 * - Jumps instantly when the user prefers reduced motion.
 */
export function useAnimatedNumber(target: number, durationMs = 300): number {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;

    let reduce = false;
    try {
      reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      /* noop */
    }
    if (reduce || durationMs <= 0) {
      fromRef.current = target;
      setDisplay(target);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = from + (target - from) * eased;
      fromRef.current = value;
      setDisplay(value);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, durationMs]);

  return display;
}
