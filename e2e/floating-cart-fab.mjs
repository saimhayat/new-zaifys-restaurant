/**
 * The floating stack's green WhatsApp button was a duplicate on phones, where
 * the sticky bar already carries WhatsApp. It is now a cart shortcut.
 *
 * Run: node e2e/floating-cart-fab.mjs
 */
import { chromium } from "@playwright/test";
import { cacheRemoteImages } from "./lib/imageCache.js";

const BASE = "http://localhost:5173";
const VIEWPORTS = [
  { width: 375, height: 667, mobile: true },
  { width: 1280, height: 900, mobile: false },
];

const browser = await chromium.launch();
const results = {};

for (const viewport of VIEWPORTS) {
  const page = await browser.newPage({ viewport });
  await cacheRemoteImages(page);
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".fab--cart");

  const fab = await page.evaluate(() => {
    const cart = document.querySelector(".fab--cart");
    const bar = document.querySelector(".action-bar");
    return {
      cartHref: cart.getAttribute("href"),
      cartIcon: cart.querySelector("svg")?.getAttribute("class") ?? null,
      cartBackground: getComputedStyle(cart).backgroundImage.slice(0, 40),
      whatsappFabs: document.querySelectorAll(".fab--wa").length,
      badge: document.querySelector(".fab__badge")?.textContent ?? null,
      // The sticky bar is the WhatsApp entry point on phones.
      actionBarVisible: bar ? getComputedStyle(bar).display !== "none" : false,
      actionBarWhatsApp: document.querySelectorAll(".action-bar__btn--wa").length,
      // Nothing should sit inside the floating stack that points at WhatsApp.
      stackLinks: [...document.querySelectorAll(".fab-stack a")].map((a) =>
        a.getAttribute("href")
      ),
    };
  });

  // Add a dish to the cart and confirm the badge counts it.
  await page.locator(".menu-card__order").first().click();
  await page.waitForSelector(".add-cart-btn");
  await page.click(".add-cart-btn");
  await page.waitForTimeout(600);

  const afterAdd = await page.evaluate(() => ({
    badge: document.querySelector(".fab__badge")?.textContent ?? null,
    label: document.querySelector(".fab--cart")?.getAttribute("aria-label") ?? null,
  }));

  // Tapping it must land on the cart page.
  await page.click(".fab--cart");
  await page.waitForTimeout(700);
  const landedOn = new URL(page.url()).pathname;

  results[`${viewport.width}x${viewport.height}`] = {
    ...fab,
    afterAdd,
    landedOn,
  };

  await page.screenshot({ path: `test-results/fab-${viewport.width}.png` });
  await page.close();
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
