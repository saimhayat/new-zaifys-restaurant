/**
 * Checks the public menu's dish grid at real phone widths: two dishes per row
 * from 320px up, with nothing clipped, colliding or overflowing.
 * Run: node e2e/menu-grid-check.mjs
 */
import { chromium } from "@playwright/test";

const BASE = "http://localhost:5173";
const WIDTHS = [320, 360, 375, 390, 430, 600];

const browser = await chromium.launch();
const results = {};

for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  await page.goto(`${BASE}/#menu`, { waitUntil: "networkidle" });
  await page.waitForSelector(".menu__card, .menu-card");
  await page.waitForTimeout(300);

  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const cards = [...document.querySelectorAll(".menu-card")];

    // Group by vertical position to count how many share a row.
    const tops = [...new Set(cards.map((c) => Math.round(c.getBoundingClientRect().top)))];
    const perRow = tops.map((top) =>
      cards.filter((c) => Math.round(c.getBoundingClientRect().top) === top).length
    );

    const inspect = (card) => {
      const body = card.querySelector(".menu-card__body");
      const title = card.querySelector(".menu-card__title-row h3");
      const button = card.querySelector(".menu-card__order");
      const category = card.querySelector(".menu-card__category");
      const prep = card.querySelector(".menu-card__prep");
      const bodyRect = body.getBoundingClientRect();

      // Does any child spill past the card's padding box?
      const spilled = [...body.querySelectorAll("h3, .menu-card__price")].filter(
        (el) => el.getBoundingClientRect().right > bodyRect.right + 1
      ).length;

      // A true rectangle overlap — chips on different rows may share a column.
      const chipsCollide = (() => {
        if (!category || !prep) return false;
        const a = category.getBoundingClientRect();
        const b = prep.getBoundingClientRect();
        return a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom;
      })();

      return {
        name: card.querySelector(".menu-card__title-row h3")?.textContent,
        category: category?.textContent,
        chipWidths: category && prep
          ? [Math.round(category.getBoundingClientRect().width), Math.round(prep.getBoundingClientRect().width)]
          : null,
        cardWidth: Math.round(card.getBoundingClientRect().width),
        titleTruncated: title.scrollWidth > title.clientWidth + 1,
        spilled,
        chipsCollide,
        buttonClipped: button.scrollWidth > button.clientWidth + 1,
        // Hovering one card lifts the row — check the row's cards match height.
        cardHeight: Math.round(card.getBoundingClientRect().height),
      };
    };

    const first = cards.slice(0, 2).map(inspect);

    return {
      overflowX: doc.scrollWidth - doc.clientWidth,
      cards: cards.length,
      perRow,
      first,
      rowHeightsMatch: first.length === 2 ? first[0].cardHeight === first[1].cardHeight : null,
    };
  });

  await page.screenshot({ path: `test-results/menu-${width}.png` });
  results[`${width}px`] = metrics;
  await page.close();
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
