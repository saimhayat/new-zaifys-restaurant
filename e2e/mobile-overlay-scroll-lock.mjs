/**
 * Regression check for every overlay that covers the page on a phone: while
 * one is open, the page behind it must not scroll.
 *
 * Uses real wheel input, not `window.scrollTo` — programmatic scrolling
 * bypasses `overflow: hidden`, so only a gesture can prove the lock works.
 *
 * Run: node e2e/mobile-overlay-scroll-lock.mjs
 */
import { chromium } from "@playwright/test";
import { cacheRemoteImages } from "./lib/imageCache.js";

const BASE = "http://localhost:5173";
const VIEWPORTS = [
  { width: 375, height: 667 },
  { width: 320, height: 480 },
];

/** Wraps a viewport in the gesture helpers the checks below share. */
async function session(browser, viewport) {
  const page = await browser.newPage({ viewport });
  await cacheRemoteImages(page);
  const wait = (ms) => page.waitForTimeout(ms);
  const scrollY = () => page.evaluate(() => Math.round(window.scrollY));

  const wheelAt = async (x, y, dy) => {
    await page.mouse.move(x, y);
    await page.mouse.wheel(0, dy);
    await wait(300);
    return scrollY();
  };

  const overlays = () =>
    page.evaluate(() => ({
      htmlOverflow: document.documentElement.style.overflow,
      bodyOverflow: document.body.style.overflow,
    }));

  return { page, wait, scrollY, wheelAt, overlays };
}

const browser = await chromium.launch();
const results = {};

for (const viewport of VIEWPORTS) {
  const { page, wait, wheelAt, overlays } = await session(browser, viewport);

  /* --- the public site's mobile menu -------------------------------------- */
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".navbar__toggle");

  const navScrolls = await wheelAt(viewport.width / 2, viewport.height / 2, 600);

  await page.click(".navbar__toggle");
  await wait(500);

  const menuOpen = await page.evaluate(() => ({
    open: document
      .querySelector(".navbar__mobile")
      .classList.contains("navbar__mobile--open"),
    overlay: Boolean(document.querySelector(".navbar__overlay")),
  }));
  const menuLock = await overlays();

  // A finger on the dimmed strip beside the drawer, then on the drawer itself.
  const menuHeld = await wheelAt(Math.round(viewport.width * 0.08), viewport.height / 2, 900);
  const drawerHeld = await wheelAt(viewport.width - 40, viewport.height / 2, 400);

  await page.screenshot({
    path: `test-results/nav-menu-${viewport.width}.png`,
  });

  await page.click(".navbar__toggle");
  await wait(500);
  const menuRestored = await overlays();
  const menuScrollsAgain = await wheelAt(viewport.width / 2, viewport.height / 2, 600);

  /* --- the gallery lightbox ---------------------------------------------- */
  await page.goto(`${BASE}/#gallery`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".gallery__item");
  await page.locator(".gallery__item").first().click();
  await wait(500);

  const lightboxOpen = await page.evaluate(
    () => Boolean(document.querySelector(".gallery-lightbox, [class*='lightbox']"))
  );
  const lightboxLock = await overlays();
  // The #gallery anchor has already scrolled the page, so the held position is
  // whatever it was when the lightbox opened — not zero.
  const lightboxBefore = await page.evaluate(() => Math.round(window.scrollY));
  const lightboxHeld = await wheelAt(viewport.width / 2, viewport.height / 2, 900);

  await page.keyboard.press("Escape");
  await wait(500);
  const lightboxRestored = await overlays();
  const lightboxScrollsAgain = await wheelAt(viewport.width / 2, viewport.height / 2, 600);

  results[`${viewport.width}x${viewport.height}`] = {
    menu: {
      navScrolls,
      menuOpen,
      menuLock,
      pageHeld: menuHeld === navScrolls,
      drawerHeld: drawerHeld === navScrolls,
      menuRestored,
      menuScrollsAgain: menuScrollsAgain > navScrolls,
    },
    lightbox: {
      lightboxOpen,
      lightboxLock,
      lightboxBefore,
      lightboxHeld,
      pageHeld: lightboxHeld === lightboxBefore,
      lightboxRestored,
      lightboxScrollsAgain: lightboxScrollsAgain > lightboxHeld,
    },
  };

  await page.close();
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
