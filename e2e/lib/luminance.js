/**
 * Measure text contrast on the pixels a visitor actually sees.
 *
 * Eyeballing a dark hero can't tell you whether the copy still clears WCAG
 * once the scrim, the photograph and the theme are all composited together.
 * This decodes a Playwright screenshot (pure Node — zlib only, no deps) and
 * reports the worst-case backdrop luminance inside a region.
 *
 * Usage: hide the text, screenshot exactly its box, and the brightest pixel
 * left is the worst backdrop that text has to survive.
 */
import zlib from "node:zlib";

const SIGNATURE = 0x89504e47;

/** Decode an 8-bit, non-interlaced PNG into { width, height, rgba }. */
export function decodePng(buffer) {
  if (buffer.readUInt32BE(0) !== SIGNATURE) throw new Error("not a PNG buffer");

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 8;
  let colorType = 6;
  let interlace = 0;
  const idat = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }

    offset += 12 + length;
  }

  if (bitDepth !== 8) throw new Error(`unsupported PNG bit depth ${bitDepth}`);
  if (interlace !== 0) throw new Error("interlaced PNGs are not supported");

  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`unsupported PNG colour type ${colorType}`);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const rgba = Buffer.alloc(width * height * 4);
  let prev = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride));

    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? line[x - channels] : 0;
      const b = prev[x];
      const c = x >= channels ? prev[x - channels] : 0;
      switch (filter) {
        case 0:
          break;
        case 1:
          line[x] = (line[x] + a) & 0xff;
          break;
        case 2:
          line[x] = (line[x] + b) & 0xff;
          break;
        case 3:
          line[x] = (line[x] + ((a + b) >> 1)) & 0xff;
          break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          line[x] = (line[x] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
          break;
        }
        default:
          throw new Error(`unknown PNG filter ${filter}`);
      }
    }

    prev = line;
    for (let x = 0; x < width; x++) {
      const s = x * channels;
      const d = (y * width + x) * 4;
      if (colorType === 6) {
        rgba[d] = line[s];
        rgba[d + 1] = line[s + 1];
        rgba[d + 2] = line[s + 2];
        rgba[d + 3] = line[s + 3];
      } else if (colorType === 2) {
        rgba[d] = line[s];
        rgba[d + 1] = line[s + 1];
        rgba[d + 2] = line[s + 2];
        rgba[d + 3] = 255;
      } else if (colorType === 0) {
        rgba[d] = rgba[d + 1] = rgba[d + 2] = line[s];
        rgba[d + 3] = 255;
      } else {
        rgba[d] = rgba[d + 1] = rgba[d + 2] = line[s];
        rgba[d + 3] = line[s + 1];
      }
    }
  }

  return { width, height, rgba };
}

/** sRGB → linear light. */
function linear(channel) {
  const v = channel / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance of an sRGB triple. */
export function luminance(r, g, b) {
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

export function hexLuminance(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return luminance(
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16)
  );
}

/** WCAG contrast ratio between two relative luminances. */
export function contrast(a, b) {
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Brightest pixel in the image — the worst backdrop for light text on it.
 * Also returns where it sits inside the crop, since "the copy is unreadable"
 * is usually answered by finding out which part of the frame is guilty.
 */
export function brightest(png) {
  const { rgba, width } = png;
  let best = 0;
  let rgb = null;
  let at = null;
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] < 8) continue;
    const l = luminance(rgba[i], rgba[i + 1], rgba[i + 2]);
    if (l > best) {
      best = l;
      rgb = [rgba[i], rgba[i + 1], rgba[i + 2]];
      const pixel = i / 4;
      at = [pixel % width, Math.floor(pixel / width)];
    }
  }
  return { luminance: best, rgb, at };
}

/**
 * Mean luminance of a region — used to prove the photograph is actually
 * visible rather than buried. Readability checks alone can be passed by
 * painting the frame black, which is the failure mode they never catch.
 */
export async function regionLuminance(page, clip) {
  const png = decodePng(await page.screenshot({ clip }));
  const { rgba } = png;
  let sum = 0;
  let count = 0;
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] < 8) continue;
    sum += luminance(rgba[i], rgba[i + 1], rgba[i + 2]);
    count += 1;
  }
  return count ? sum / count : 0;
}

/**
 * Worst-case contrast for `fgHex` text sitting inside `selector`.</
 * Hides the copy first so the glyphs themselves don't pollute the sample.
 */
export async function textContrast(page, selector, fgHex, { hideRoot = ".hero__content" } = {}) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box || box.width < 1 || box.height < 1) throw new Error(`no box for ${selector}`);

  await page.evaluate((root) => {
    const node = document.querySelector(root);
    if (node) node.style.visibility = "hidden";
  }, hideRoot);

  let shot;
  try {
    shot = await page.screenshot({
      clip: {
        x: Math.max(0, box.x),
        y: Math.max(0, box.y),
        width: box.width,
        height: box.height,
      },
    });
  } finally {
    await page.evaluate((root) => {
      const node = document.querySelector(root);
      if (node) node.style.visibility = "";
    }, hideRoot);
  }

  const worst = brightest(decodePng(shot));
  return {
    ratio: contrast(hexLuminance(fgHex), worst.luminance),
    backdrop: worst,
    box: { x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width), h: Math.round(box.height) },
  };
}
