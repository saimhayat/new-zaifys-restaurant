export function motionEnabled() {
  return document.documentElement.dataset.motion !== "off" && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
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
