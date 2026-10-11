import { useEffect } from "react";
export function useScrollMotion() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)"), small = window.matchMedia("(max-width: 767px)");
    const scenes = [...document.querySelectorAll("[data-parallax]")];
    let frame = 0, range = 0, measure = true;
    const update = () => {
      frame = 0;
      if (document.hidden) return;
      const height = Math.max(1, window.innerHeight), enabled = !reduced.matches && document.documentElement.dataset.motion !== "off" && document.documentElement.dataset.performance !== "lite";
      if (measure) { range = Math.max(0, document.documentElement.scrollHeight - height); measure = false; }
      const values = scenes.map(scene => {
        if (!enabled) return 0;
        const rect = scene.getBoundingClientRect();
        const progress = Math.max(-1, Math.min(1, (height / 2 - rect.top - rect.height / 2) / height));
        return progress * Number(scene.dataset.parallax) * (small.matches ? .32 : 1);
      });
      scenes.forEach((scene, i) => {
        const value = `${values[i].toFixed(2)}px`;
        if (scene.style.getPropertyValue("--parallax") !== value) scene.style.setProperty("--parallax", value);
      });
      const progress = String(range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0);
      if (document.documentElement.style.getPropertyValue("--scroll-progress") !== progress) document.documentElement.style.setProperty("--scroll-progress", progress);
    };
    const request = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(update); };
    const layoutChanged = () => { measure = true; request(); };
    const visibilityChanged = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else layoutChanged();
    };
    request();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", layoutChanged, { passive: true });
    window.addEventListener("zaify-motion", request);
    window.addEventListener("zaify-performance", request);
    document.addEventListener("visibilitychange", visibilityChanged);
    reduced.addEventListener("change", request);
    small.addEventListener("change", request);
    const resize = window.ResizeObserver ? new window.ResizeObserver(layoutChanged) : null;
    resize?.observe(document.documentElement);
    document.addEventListener("load", layoutChanged, true);
    return () => {
      cancelAnimationFrame(frame); resize?.disconnect();
      window.removeEventListener("scroll", request); window.removeEventListener("resize", layoutChanged);
      window.removeEventListener("zaify-motion", request); reduced.removeEventListener("change", request);
      window.removeEventListener("zaify-performance", request); document.removeEventListener("visibilitychange", visibilityChanged);
      small.removeEventListener("change", request); document.removeEventListener("load", layoutChanged, true);
      scenes.forEach(scene => scene.style.removeProperty("--parallax"));
      document.documentElement.style.removeProperty("--scroll-progress");
    };
  }, []);
}
