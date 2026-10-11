/**
 * Cache the site's remote photography on disk for the duration of a test run.
 *
 * The hero/reel/grid harnesses load a dozen full-resolution Unsplash images
 * every run, which is slow and gets rate-limited. Route them through a local
 * cache instead: first run fills it, later runs are served from disk — so the
 * visual checks are stable and don't depend on the network being kind.
 *
 * Each entry is one file: the response's content type on the first line, then
 * the raw bytes. Unsplash negotiates AVIF/WebP per browser, so the type has to
 * travel with the payload — serving AVIF bytes as image/jpeg fails to decode
 * and silently blanks the hero.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CACHE_DIR = join("test-results", ".image-cache");
const REMOTE = /^https:\/\/images\.unsplash\.com\//;

function splitEntry(buffer) {
  const newline = buffer.indexOf(0x0a);
  if (newline < 1) return null;
  return {
    contentType: buffer.subarray(0, newline).toString("ascii"),
    body: buffer.subarray(newline + 1),
  };
}

export async function cacheRemoteImages(page) {
  mkdirSync(CACHE_DIR, { recursive: true });
  const hits = [];

  await page.route(REMOTE, async (route) => {
    const url = route.request().url();
    const file = join(CACHE_DIR, `${createHash("sha1").update(url).digest("hex")}.img`);

    if (existsSync(file)) {
      const entry = splitEntry(readFileSync(file));
      if (entry && entry.body.length > 0) {
        hits.push(url);
        await route.fulfill({ body: entry.body, contentType: entry.contentType });
        return;
      }
    }

    try {
      const response = await route.fetch();
      const type = response.headers()["content-type"] || "";
      const body = await response.body();

      // Only cache something the browser could actually render. Caching a
      // 429/HTML body would poison every later run from disk.
      if (response.ok() && type.startsWith("image/") && body.length > 1024) {
        writeFileSync(file, Buffer.concat([Buffer.from(`${type}\n`), body]));
      }

      await route.fulfill({ response, body });
    } catch {
      // A miss under a flaky network shouldn't fail the run — let it through.
      await route.continue();
    }
  });

  return { cachedHits: hits.length, dir: CACHE_DIR };
}
