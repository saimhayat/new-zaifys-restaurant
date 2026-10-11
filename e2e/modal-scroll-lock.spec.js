import { test, expect } from "@playwright/test";

test("body scroll is locked when order modal is open", async ({ page }) => {
  await page.goto("http://localhost:5173/#menu");
  await page.waitForSelector(".menu-card");

  await page.click(".menu-card__order");
  await page.waitForSelector(".order-modal");

  const scrollable = await page.evaluate(() => {
    const m = document.querySelector(".order-modal__right");
    return { scrollHeight: m.scrollHeight, clientHeight: m.clientHeight };
  });

  // Scroll the modal content to its maximum
  await page.evaluate(() => {
    const m = document.querySelector(".order-modal__right");
    m.scrollTop = m.scrollHeight;
  });
  await page.waitForTimeout(250);

  const modalScrollTop = await page.evaluate(() => document.querySelector(".order-modal__right").scrollTop);

  // Scroll the *window* (i.e., try to scroll the page behind the modal)
  await page.evaluate(() => window.scrollTo(0, 5000));
  await page.waitForTimeout(100);

  // The page behind (body) must be locked — unchanged from before
  const bodyScrollTop = await page.evaluate(() => document.body.scrollTop);
  const windowScrollY = await page.evaluate(() => window.scrollY);

  const scrollableAmount = scrollable.scrollHeight - scrollable.clientHeight;

  // Modal should have scrolled by at least half of its actual scrollable height
  expect(modalScrollTop).toBeGreaterThan(scrollableAmount * 0.5);

  // Body / window behind must not have moved
  expect(bodyScrollTop).toBe(0);
  expect(windowScrollY).toBe(0);
});
