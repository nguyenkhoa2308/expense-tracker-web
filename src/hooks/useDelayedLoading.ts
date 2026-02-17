import { useState, useEffect, useRef } from "react";

/**
 * Returns true only after `loading` has been true for at least `delay` ms.
 * Prevents skeleton flash when data loads quickly.
 * Once visible, stays visible for at least `minVisible` ms to avoid flicker.
 */
export function useDelayedLoading(
  loading: boolean,
  delay = 200,
  minVisible = 500,
): boolean {
  // Show skeleton immediately on first render if already loading
  const isFirstRender = useRef(true);
  const [show, setShow] = useState(() => loading);
  const showTimestamp = useRef<number>(loading ? Date.now() : 0);

  useEffect(() => {
    // Skip the first effect if we already initialized show=true
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (loading) return;
    }

    if (loading) {
      const timer = setTimeout(() => {
        setShow(true);
        showTimestamp.current = Date.now();
      }, delay);
      return () => clearTimeout(timer);
    }

    // Loading finished — ensure skeleton was visible for at least minVisible
    if (show) {
      const elapsed = Date.now() - showTimestamp.current;
      const remaining = Math.max(0, minVisible - elapsed);
      const timer = setTimeout(() => setShow(false), remaining);
      return () => clearTimeout(timer);
    }

    setShow(false);
  }, [loading, delay, minVisible, show]);

  return show;
}
