export function motionEnabled(reducedMotion) {
  const { motion, performance } = document.documentElement.dataset;
  if (motion === "off") return false;
  if (motion === "on") return true;
  const reduced = reducedMotion ?? Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  return !reduced && performance !== "lite";
}

export function scrollToSection(id, { behavior } = {}) {
  const target = document.getElementById(id);
  if (!target) return false;
  const header = document.querySelector(".navbar");
  const offset = (header?.getBoundingClientRect().height || header?.offsetHeight || 0) + 12;
  const top = id === "home" ? 0 : Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
  window.scrollTo({ top, left: 0, behavior: motionEnabled() ? (behavior || "smooth") : "instant" });
  return true;
}
