import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from 0 to the target value.
 * Returns the current animated value.
 */
export function useCountUp(target: number, duration = 800): number {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const start = prevTarget.current;
    const diff = target - start;
    if (diff === 0) return;

    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = start + diff * eased;

      setValue(Math.round(current));

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        prevTarget.current = target;
      }
    }

    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [target, duration]);

  return value;
}
