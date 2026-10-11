/**
 * Cinematic hero reel — verification.
 *
 * Checks the slideshow actually cycles, that the picker drives it, that only
 * one frame is ever visible, that the entrance choreography always finishes
 * (nothing left invisible), and that reduced-motion users get a still frame.
 *
 * Run with the dev server up:  node e2e/hero-reel.mjs
 */
import { chromium } from "@playwright/test";
import { regionLuminance, textContrast } from "./lib/luminance.js";
import { cacheRemoteImages } from "./lib/imageCache.js";

const BASE = "http://localhost:5173";
const results = [];

function check(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

/**
 * The contrast bar depends on the text itself, per WCAG: 3:1 counts as AA for
 * large text (24px+, or 18.66px+ when bold), 4.5:1 for everything else. Deriving
 * it from the computed style means the check follows the type scale instead of
 * a number picked to fit today's design.
 */
async function requiredRatio(page, selector) {
  const { size, weight } = await page.evaluate((sel) => {
    const style = getComputedStyle(document.querySelector(sel));
    return { size: parseFloat(style.fontSize), weight: Number(style.fontWeight) };
  }, selector);
  const large = size >= 24 || (size >= 18.66 && weight >= 700);
  return { min: large ? 3 : 4.5, size: Math.round(size * 10) / 10, weight, large };
}

const state = () =>
  `Array.from(document.querySelectorAll('.hero__slide')).map(s => s.classList.contains('is-active'))`;

/* "networkidle" never settles reliably here (the slides are remote photos),
   so wait for the thing that actually matters: the first frame on screen. */
async function openHero(page) {
  await cacheRemoteImages(page);
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => {
      const img = document.querySelector(".hero__slide img");
      return Boolean(img && img.complete && img.naturalWidth > 0);
    },
    null,
    { timeout: 20000 }
  );
  await page.evaluate(() => document.fonts.ready);
}

const browser = await chromium.launch();

for (const width of [320, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: 780 } });
  await openHero(page);

  const slides = await page.locator(".hero__slide").count();
  check(`[${width}] reel has all slides`, slides === 5, `${slides} slides`);

  const single = await page.evaluate(
    `(${state()}).filter(Boolean).length`
  );
  check(`[${width}] exactly one frame visible`, single === 1, `${single} active`);

  // Entrance choreography must finish, or the copy stays stuck invisible.
  await page.waitForTimeout(2200);
  const enter = await page.evaluate(`(() => {
    const nodes = Array.from(document.querySelectorAll('.hero-enter'));
    const opacity = nodes.map(n => Number(getComputedStyle(n).opacity));
    const titles = document.querySelector('.hero__title').textContent.trim();
    return {
      count: nodes.length,
      min: Math.min(...opacity),
      titles,
      titleOpacity: Number(getComputedStyle(document.querySelector('.hero__title')).opacity),
    };
  })()`);
  check(
    `[${width}] ${enter.count} entrance items all fully visible`,
    enter.min === 1 && enter.titleOpacity === 1,
    `min opacity ${enter.min}`
  );
  // &rsquo; renders as a typographic apostrophe — normalise before comparing.
  check(
    `[${width}] headline reads correctly`,
    enter.titles.replace(/[’']/g, "'") === "Zaify's Restaurant",
    enter.titles
  );

  // Film grain present.
  const grain = await page.evaluate(
    `getComputedStyle(document.querySelector('.hero__grain')).backgroundImage.slice(0, 24)`
  );
  check(`[${width}] film grain layer present`, grain.startsWith("url("), grain);

  // No sideways overflow.
  const overflow = await page.evaluate(
    `document.documentElement.scrollWidth - document.documentElement.clientWidth`
  );
  check(`[${width}] no horizontal overflow`, overflow <= 0, `${overflow}px`);

  // The reel cycles, so the copy has to survive EVERY frame — not just the
  // one that happens to be on screen at load. Measured on screenshots with the
  // text hidden, against the composited scrim + photo + theme.
  const worst = { head: { ratio: Infinity, at: 0 }, tag: { ratio: Infinity, at: 0 } };
  const settle = async () => {
    // Clicking can nudge the page; measuring a region that has slid under the
    // fixed navbar would blame the navbar's glass for the photo's contrast.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  };

  for (let i = 0; i < slides; i++) {
    await page.locator(".hero__dot").nth(i).click();
    await page.waitForTimeout(1600); // let the 1.4s crossfade finish
    await settle();
    const h = await textContrast(page, ".hero__title", "#ffffff");
    const t = await textContrast(page, ".hero__tagline", "#ffd76a");
    if (h.ratio < worst.head.ratio) worst.head = { ratio: h.ratio, at: i + 1 };
    if (t.ratio < worst.tag.ratio) worst.tag = { ratio: t.ratio, at: i + 1 };
  }

  const headBar = await requiredRatio(page, ".hero__title");
  check(
    `[${width}] headline readable on every slide`,
    worst.head.ratio >= headBar.min,
    `${worst.head.ratio.toFixed(2)}:1 vs ${headBar.min}:1 required ` +
      `(${headBar.size}px${headBar.large ? ", large" : ""}) — worst on slide ${worst.head.at}`
  );

  const tagBar = await requiredRatio(page, ".hero__tagline");
  check(
    `[${width}] tagline readable on every slide`,
    worst.tag.ratio >= tagBar.min,
    `${worst.tag.ratio.toFixed(2)}:1 vs ${tagBar.min}:1 required ` +
      `(${tagBar.size}px/${tagBar.weight}${tagBar.large ? ", large" : ""}) — worst on slide ${worst.tag.at}`
  );

  // ...and the photograph is still there. The copy column is deliberately the
  // darkest part of the frame, so sample the open side of it instead.
  const hero = await page.locator(".hero").boundingBox();
  const presence = await regionLuminance(page, {
    x: Math.round(hero.x + hero.width * (width > 768 ? 0.68 : 0.5)),
    y: Math.round(hero.y + hero.height * 0.34),
    width: Math.round(hero.width * (width > 768 ? 0.3 : 0.45)),
    height: Math.round(hero.height * 0.26),
  });
  check(
    `[${width}] photo still visible through the scrim`,
    presence > 0.05,
    `mean luminance ${presence.toFixed(3)} (near 0 = blacked out)`
  );

  // Picker is on screen, and nothing fixed is sitting on top of it. Fixed
  // chrome (the sticky action bar, the floating stack) doesn't move the page
  // out of shape, it just quietly covers what's underneath — so compare boxes.
  await settle();
  const boxes = await page.evaluate(() => {
    const rect = (sel) => {
      const node = document.querySelector(sel);
      if (!node) return null;
      const r = node.getBoundingClientRect();
      if (getComputedStyle(node).display === "none" || r.width === 0) return null;
      return { x: r.x, y: r.y, w: r.width, h: r.height, bottom: r.bottom, right: r.right };
    };

    const intersects = (a, b) =>
      a && b && a.x < b.right && a.right > b.x && a.y < b.bottom && a.bottom > b.y;

    // Test the bars themselves, not the picker's container: the container is
    // deliberately full-width (it mirrors .container for alignment), so its box
    // would report a collision the eye never sees.
    const bars = Array.from(document.querySelectorAll(".hero__dot")).map((node) => {
      const r = node.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height, bottom: r.bottom, right: r.right };
    });
    const picker = bars.length
      ? {
          x: Math.min(...bars.map((b) => b.x)),
          right: Math.max(...bars.map((b) => b.right)),
          y: Math.min(...bars.map((b) => b.y)),
          bottom: Math.max(...bars.map((b) => b.bottom)),
        }
      : null;

    const chrome = [".action-bar", ".fab-stack"]
      .map((sel) => [sel, rect(sel)])
      .filter(([, r]) => Boolean(r));

    const blockers = [];
    for (const bar of bars) {
      for (const [sel, box] of chrome) {
        if (intersects(bar, box)) blockers.push(sel);
      }
    }

    return {
      picker,
      blockers: [...new Set(blockers)],
      viewport: window.innerHeight,
    };
  });

  const inView =
    boxes.picker &&
    boxes.picker.y > 0 &&
    boxes.picker.bottom < boxes.viewport &&
    boxes.picker.x >= 0;
  check(
    `[${width}] picker fully on screen`,
    Boolean(inView),
    boxes.picker ? `y=${Math.round(boxes.picker.y)}-${Math.round(boxes.picker.bottom)}` : "missing"
  );
  check(
    `[${width}] picker clear of fixed chrome`,
    boxes.blockers.length === 0,
    boxes.blockers.length ? `covered by ${boxes.blockers.join(", ")}` : "nothing overlaps"
  );

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  const dotsNeverFlashOnEnter = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".hero__dot")).some((d) =>
      d.classList.contains("is-active") &&
      getComputedStyle(d.querySelector(".hero__dot-fill")).animationName === "hero-dot-fill"
    )
  );
  check(
    `[${width}] dots never flash on enter`,
    dotsNeverFlashOnEnter,
    `active dot has a fill animation running`);

const failed = results.filter((r) => !r.pass);
console.log(`
${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log("FAILED:", failed.map((f) => f.name).join(" | "));
  process.exitCode = 1;


  await page.close();
}
}

/* ---- Autoplay and manual control (desktop, where the reel is the star) ---- */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await openHero(page);

  const first = await page.evaluate(`(${state()}).indexOf(true)`);
  await page.waitForTimeout(6800);
  const next = await page.evaluate(`(${state()}).indexOf(true)`);
  check("reel advances on its own", next === (first + 1) % 5, `${first} -> ${next}`);

  const fill = () =>
    page.evaluate(`(() => {
      const active = document.querySelector('.hero__dot.is-active .hero__dot-fill');
      return parseFloat(getComputedStyle(active).width) / parseFloat(getComputedStyle(active.parentElement).width);
    })()`);

  // Tapping a dot jumps there, restarts the hold, and keeps the countdown in
  // step with the reel — sampled once just after the flip and once mid-hold.
  // Tapping a dot jumps there, restarts the hold, and keeps the countdown in
  // step with the reel — sampled once just after the flip and once mid-hold.
  await page.locator(".hero__dot").nth(3).click();
  const picked = await page.evaluate(`(${state()}).indexOf(true)`);
  check("picker jumps to the chosen slide", picked === 3, `index ${picked}`);

  await page.waitForTimeout(2000);
  const early = await fill();
  check("hold restarts after picking", early < 0.15, `${(early * 100).toFixed(0)}%`);

  await page.waitForTimeout(3400);
  const after = await fill();
  check(
    "progress bar tracks the hold",
    after > 0.35 && after < 0.80,
    `${(early * 100).toFixed(0)}% → ${(late * 100).toFixed(0)}%`
  );

  // Wait for the slide to actually change
  await page.waitForTimeout(3400);
  const after = await fill();
  check(
    "progress bar tracks the hold",
    after > 0.35 && after < 0.80,
    `${(early * 100).toFixed(0)}% → ${(late * 100).toFixed(0)}% → ${after.toFixed(2)}%`);

  // Wait for the slide to actually change
  await page.waitForTimeout(3400);
  const after = await fill();
  check(
    "progress bar tracks the hold",
    after > 0.35 && after < 0.80,
    `${(early * 100).toFixed(0)}% → ${(late * 100).toFixed(0)}% → ${after.toFixed(2)}%`);

  // Wait for the slide to actually change
  await page.waitForTimeout(3400);
  const after = await fill();
  check(
    "progress bar tracks the hold",
    after > 0.35 && after < 0.80,
    `${(early * 100).toFixed(0)}% → ${(late * 100).toFixed(0)}% → ${after.toFixed(2)}%`);

  // ...and the reel really does advance at the end of that hold.
  await page.waitForTimeout(3400);
  const afterHold = await page.evaluate(`(${state()}).indexOf(true)`);
  check("hold length matches the reel", afterHold === 4, `index ${afterHold} after ~6.6s`);

  // Every photo actually loads rather than 404ing.
  const loaded = await page.evaluate(`(async () => {
    const imgs = Array.from(document.querySelectorAll('.hero__slide img'));
    await Promise.all(imgs.map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; })));
    return imgs.map(i => ({ ok: i.naturalWidth > 0, src: i.currentSrc.slice(-24) }));
  })()`);
  const broken = loaded.filter((i) => !i.ok);
  check("every slide photo loads", broken.length === 0, broken.map((b) => b.src).join(", "));

  await page.close();
}

/* ---- Reduced motion: a still frame, nothing hidden, no cycling ---- */
{
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await openHero(page);

  const index = await page.evaluate(`(${state()}).indexOf(true)`);
  await page.waitForTimeout(7000);
  const later = await page.evaluate(`(${state()}).indexOf(true)`);
  check("reduced motion: reel does not advance", index === later, `held at ${index}`);

  const opacity = await page.evaluate(`(() => {
    const nodes = Array.from(document.querySelectorAll('.hero-enter'));
    return Math.min(...nodes.map(n => Number(getComputedStyle(n).opacity)));
  })()`);
  check("reduced motion: all content visible immediately", opacity === 1, `min opacity ${opacity}`);

  await context.close();
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log("FAILED:", failed.map((f) => f.name).join(" | "));
  process.exitCode = 1;
}
