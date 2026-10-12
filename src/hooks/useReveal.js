import { useEffect, useRef } from "react";
import { motionEnabled } from "../utils/scrollTo";
export function useReveal({ threshold = 0.08, rootMargin = "0px 0px -20px 0px" } = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!window.IntersectionObserver || !motionEnabled(reduced?.matches)) { node.classList.add("is-visible"); return; }
    // Hide only after observation is available. Unsupported clients stay readable.
    node.classList.add("reveal-ready");
    const observer = new window.IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { node.classList.add("is-visible"); observer.disconnect(); }
    }, { threshold, rootMargin });
    observer.observe(node);
    const respectMotion = () => {
      if (!motionEnabled(reduced?.matches)) {
        node.classList.add("is-visible"); observer.disconnect();
      }
    };
    reduced?.addEventListener("change", respectMotion);
    window.addEventListener("zaify-motion", respectMotion);
    window.addEventListener("zaify-performance", respectMotion);
    return () => { observer.disconnect(); reduced?.removeEventListener("change", respectMotion); window.removeEventListener("zaify-motion", respectMotion); window.removeEventListener("zaify-performance", respectMotion); };
  }, [threshold, rootMargin]);
  return ref;
}
