import imageManifest from "../data/imageManifest.json";

export const IMAGE_FALLBACK = "/images/food-placeholder.svg";

/** Older browser data may still contain the original Unsplash URLs. */
export function resolveImageSrc(src) {
  if (typeof src !== "string" || !src.trim()) return IMAGE_FALLBACK;
  const value = src.trim();
  const local = value.match(/^\/images\/((?:photo-[\w-]+|hero-karahi))(?:\.webp|\.jpe?g)(?:[?#].*)?$/);
  let name = local?.[1];
  if (!name) {
    try {
      const url = new URL(value);
      if (url.hostname === "images.unsplash.com") name = url.pathname.match(/^\/(photo-[\w-]+)$/)?.[1];
    } catch { /* Relative paths and uploaded data URLs are also supported. */ }
  }
  if (name) {
    const canonical = `/images/${name.replace(/-(480|800)$/, "")}.webp`;
    if (imageManifest[canonical]) return canonical;
  }
  return value;
}

/** Only advertise variants that exist; descriptors use their actual widths. */
export function photoProps(src, sizes = "(max-width: 767px) 90vw, 45vw") {
  const resolved = resolveImageSrc(src), metadata = imageManifest[resolved];
  return {
    src: resolved,
    ...(metadata ? {
      width: metadata.width,
      height: metadata.height,
      srcSet: metadata.variants.map(image => `${image.src} ${image.width}w`).join(", "),
      sizes,
    } : {}),
  };
}
