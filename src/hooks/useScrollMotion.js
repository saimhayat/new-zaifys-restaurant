import { useEffect } from "react";
export function useScrollMotion() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)"), small = window.matchMedia("(max-width: 767px)");
    const scenes = [...document.querySelectorAll("[data-parallax]")];
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = Math.max(1, window.innerHeight), enabled = !reduced.matches && document.documentElement.dataset.motion !== "off";
      const values = scenes.map(scene => {
        const rect = scene.getBoundingClientRect();
        const progress = Math.max(-1, Math.min(1, (height / 2 - rect.top - rect.height / 2) / height));
        return enabled ? progress * Number(scene.dataset.parallax) * (small.matches ? .32 : 1) : 0;
      });
      scenes.forEach((scene, i) => scene.style.setProperty("--parallax", `${values[i].toFixed(2)}px`));
      const range = document.documentElement.scrollHeight - height;
      document.documentElement.style.setProperty("--scroll-progress", range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0);
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(update); };
    request();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });
    window.addEventListener("zaify-motion", request);
    reduced.addEventListener("change", request);
    small.addEventListener("change", request);
    const resize = window.ResizeObserver ? new window.ResizeObserver(request) : null;
    resize?.observe(document.documentElement);
    document.addEventListener("load", request, true);
    return () => {
      cancelAnimationFrame(frame); resize?.disconnect();
      window.removeEventListener("scroll", request); window.removeEventListener("resize", request);
      window.removeEventListener("zaify-motion", request); reduced.removeEventListener("change", request);
      small.removeEventListener("change", request); document.removeEventListener("load", request, true);
      scenes.forEach(scene => scene.style.removeProperty("--parallax"));
      document.documentElement.style.removeProperty("--scroll-progress");
    };
  }, []);
}
