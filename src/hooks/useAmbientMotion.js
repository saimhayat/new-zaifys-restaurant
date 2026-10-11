import { useEffect } from "react";

/** CSS does the animation; the observer only switches work on visible scenes. */
export function useAmbientMotion() {
  useEffect(() => {
    const scenes = [...document.querySelectorAll("[data-ambient]")];
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const visible = new Set();
    const update = () => {
      const enabled = !document.hidden && !reduced?.matches && document.documentElement.dataset.motion !== "off" && document.documentElement.dataset.performance !== "lite";
      scenes.forEach(scene => scene.style.setProperty("--ambient-play-state", enabled && visible.has(scene) ? "running" : "paused"));
    };
    const observer = window.IntersectionObserver ? new window.IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      update();
    }, { rootMargin: "40px", threshold: 0 }) : null;
    scenes.forEach(scene => observer?.observe(scene));
    update();
    document.addEventListener("visibilitychange", update);
    window.addEventListener("zaify-motion", update);
    window.addEventListener("zaify-performance", update);
    reduced?.addEventListener("change", update);
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("zaify-motion", update);
      window.removeEventListener("zaify-performance", update);
      reduced?.removeEventListener("change", update);
      scenes.forEach(scene => scene.style.removeProperty("--ambient-play-state"));
    };
  }, []);
}
