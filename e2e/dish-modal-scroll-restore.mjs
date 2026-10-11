/**
 * Closing the dish modal must leave the customer exactly where they were.
 *
 * The body is pinned with `position: fixed` while the modal is open, so if the
 * captured scroll offset is never put back, closing it lands on the very top
 * of the page. The assertion is that the offset the modal pinned to is the
 * offset the page returns to, and that a dish sits on the same pixel of the
 * screen before it opens and after it closes.
 *
 * The click is dispatched at the button's coordinates rather than through
 * Playwright's locator API, because that API scrolls the element into view
 * first and would move the page behind the test's back.
 *
 * Run: node e2e/dish-modal-scroll-restore.mjs
 */
import { chromium } from "@playwright/test";
import { cacheRemoteImages } from "./lib/imageCache.js";

const BASE = "http://localhost:5173";
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 1280, height: 900 },
];

const browser = await chromium.launch();
const results = {};

for (const viewport of VIEWPORTS) {
  // Reduced motion switches the entrance animations off, so a `getBoundingClientRect`
  // mid-fade can't be mistaken for the page having moved.
  const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
  await cacheRemoteImages(page);
  await page.goto(`${BASE}/#menu`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".menu-card__order");

  // Neutralise smooth scrolling and let every image decode, so "before" is a
  // settled position rather than a page still growing under the measurement.
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
  await page
    .waitForFunction(() => [...document.images].every((img) => img.complete), null, {
      timeout: 15000,
    })
    .catch(() => {});
  await page.waitForTimeout(800);

  await page.evaluate(() => window.scrollTo(0, 1600));

  const button = page.locator(".menu-card__order").first();
  await button.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);

  const push = async () => {
    const box = await button.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForSelector(".order-modal");
    await page.waitForTimeout(450);
  };

  /**
   * Where the first dish card sits, on screen (rect) and in the layout
   * (offsetTop), plus the scroll offset itself.
   */
  const probe = () =>
    page.evaluate(() => {
      const card = document.querySelector(".menu-card");
      return {
        rectTop: Math.round(card.getBoundingClientRect().top),
        offsetTop: Math.round(card.offsetTop),
        scrollY: Math.round(window.scrollY),
        clientWidth: document.documentElement.clientWidth,
        scrollbar: window.innerWidth - document.documentElement.clientWidth,
      };
    });

  const before = await probe();

  await push();
  const pinned = await page.evaluate(() => ({
    bodyPosition: document.body.style.position,
    bodyTop: document.body.style.top,
  }));
  const whileOpen = await probe();

  await page.click(".order-modal__close");
  await page.waitForTimeout(500);
  const afterButton = await probe();
  const stylesCleared = await page.evaluate(() => ({
    bodyPosition: document.body.style.position,
    bodyTop: document.body.style.top,
    modalOpen: Boolean(document.querySelector(".order-modal")),
  }));

  // Same again, closed with Escape instead of the button.
  await push();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  const afterEscape = await probe();

  const capturedOffset = Math.abs(parseInt(pinned.bodyTop, 10)) || 0;

  results[`${viewport.width}x${viewport.height}`] = {
    before,
    capturedOffset,
    whileOpen,
    pinned,
    // The offset the modal pinned to is the offset it hands back.
    restoredByButton: afterButton.scrollY === capturedOffset,
    restoredByEscape: afterEscape.scrollY === capturedOffset,
    // And the dish is on the same pixel of the screen as it was before.
    samePixelOnScreen:
      before.rectTop === whileOpen.rectTop && before.rectTop === afterButton.rectTop,
    layoutUnchanged: before.offsetTop === whileOpen.offsetTop,
    stylesCleared,
  };

  await page.close();
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
