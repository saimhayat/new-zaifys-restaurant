import { useEffect, useRef, useState } from "react";

/**
 * Counts up from 0 to `end` once the target element enters the viewport.
 * Runs once per mount; respects reduced-motion by jumping straight to the end value.
 */
export function useCountUp(end, { duration = 1600, decimals = 0 } = {}) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setValue(end);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setValue(end);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          const start = performance.now();

          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Number((end * eased).toFixed(decimals)));
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
          observer.unobserve(node);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration, decimals]);

  return [value, ref];
}
