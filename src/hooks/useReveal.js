import { useEffect, useRef } from "react";
export function useReveal({ threshold = 0.08, rootMargin = "0px 0px -20px 0px" } = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!window.IntersectionObserver || reduced?.matches || document.documentElement.dataset.motion === "off") { node.classList.add("is-visible"); return; }
    // Hide only after observation is available. Unsupported clients stay readable.
    node.classList.add("reveal-ready");
    const observer = new window.IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { node.classList.add("is-visible"); observer.disconnect(); }
    }, { threshold, rootMargin });
    observer.observe(node);
    const respectMotion = () => {
      if (reduced?.matches || document.documentElement.dataset.motion === "off") {
        node.classList.add("is-visible"); observer.disconnect();
      }
    };
    reduced?.addEventListener("change", respectMotion);
    window.addEventListener("zaify-motion", respectMotion);
    return () => { observer.disconnect(); reduced?.removeEventListener("change", respectMotion); window.removeEventListener("zaify-motion", respectMotion); };
  }, [threshold, rootMargin]);
  return ref;
}
