/**
 * Temporary responsive-verification harness for the admin panel.
 * Loads /admin at 320 / 375 / 768 / 1280 and reports layout metrics.
 * Run: node e2e/responsive-check.mjs
 */
import { chromium } from "@playwright/test";

const WIDTHS = [320, 375, 768, 1280];
const BASE = "http://localhost:5173";

const browser = await chromium.launch();

for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 740 } });
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });

  // Sign in through the real UI when the demo gate is showing.
  if (await page.locator(".admin-login__card").count()) {
    await page.screenshot({ path: `test-results/admin-login-${width}.png` });
    await page.fill("input[type=password]", "admin123");
    await page.click("button[type=submit]");
  }

  await page.waitForSelector(".admin-chart", { timeout: 10000 });

  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const chart = document.querySelector(".admin-chart");
    const scroller = chart?.querySelector(".admin-chart__scroller");
    const title = document.querySelector(".admin-topbar__title");
    const burger = document.querySelector(".admin-hamburger");
    const stats = [...document.querySelectorAll(".admin-grid--stats .admin-stat")];
    const statTop = stats.map((s) => Math.round(s.getBoundingClientRect().top));
    const statRows = new Set(statTop).size;
    const baseline = (() => {
      const cols = chart?.querySelector(".admin-chart__cols");
      if (!cols) return null;
      return Math.round(cols.getBoundingClientRect().bottom - 22);
    })();
    const barBottoms = [...new Set(
      [...chart.querySelectorAll(".admin-chart__bar")].map(
        (b) => Math.round(b.getBoundingClientRect().bottom) - baseline
      )
    )];
    return {
      docOverflowX: doc.scrollWidth - doc.clientWidth,
      burgerVisible: getComputedStyle(burger).display !== "none",
      titleTruncated: title.scrollWidth > title.clientWidth,
      statRows,
      chartCols: chart.querySelectorAll(".admin-chart__col").length,
      chartScrolls: scroller ? scroller.scrollWidth - scroller.clientWidth : null,
      barBottomOffsets: barBottoms,
      axisLabels: [...chart.querySelectorAll(".admin-chart__axis span")].map((s) => s.textContent),
    };
  });

  await page.screenshot({ path: `test-results/admin-${width}.png`, fullPage: false });
  console.log(`\n=== ${width}px ===`);
  console.log(JSON.stringify(metrics, null, 2));

  // Orders is the longest list in the panel, so it is the page where a
  // background scroll would be most obvious if the lock were missing.
  await page.goto(`${BASE}/admin/orders`, { waitUntil: "networkidle" });
  await page.waitForSelector(".admin-row--orders");

  const drawerMode = await page.evaluate(() => {
    const burger = document.querySelector(".admin-hamburger");
    return Boolean(burger) && getComputedStyle(burger).display !== "none";
  });

  let nav = { drawerMode };

  if (drawerMode) {
    // A short viewport forces the drawer's nav list to overflow, so its own
    // scrolling can be told apart from the page's.
    await page.setViewportSize({ width, height: 480 });
    await page.waitForTimeout(150);

    // A wheel gesture is what a swipe actually sends; `window.scrollTo`
    // bypasses the lock because overflow:hidden still allows programmatic
    // scrolling. Gestures are the only honest way to test this.
    const wheelPage = async () => {
      await page.mouse.move(width / 2, 300);
      await page.mouse.wheel(0, 900);
      await page.waitForTimeout(250);
      return page.evaluate(() => Math.round(window.scrollY));
    };

    const scrollBefore = await wheelPage();
    await page.mouse.wheel(0, -3000);
    await page.waitForTimeout(200);

    await page.click(".admin-hamburger");
    await page.waitForTimeout(450);

    const drawer = await page.evaluate(() => {
      const sidebar = document.querySelector(".admin-sidebar");
      const closeBtn = document.querySelector(".admin-sidebar__close");
      const rect = sidebar.getBoundingClientRect();
      const foot = document.querySelector(".admin-sidebar__foot .admin-btn");
      const closeRect = closeBtn.getBoundingClientRect();
      const brand = document.querySelector(".admin-brand__text strong");
      const brandRect = brand.getBoundingClientRect();
      return {
        closeButton: {
          left: Math.round(closeRect.left),
          width: Math.round(closeRect.width),
          insideDrawer: closeRect.right <= rect.right,
          clearsBrand: closeRect.left >= Math.round(brandRect.right),
          brandTruncated: brand.scrollWidth > brand.clientWidth,
        },
        html: document.documentElement.style.overflow,
        body: document.body.style.overflow,
        scrim: Boolean(document.querySelector(".admin-nav-scrim")),
        closeBtnVisible: getComputedStyle(closeBtn).display !== "none",
        sidebarWidth: Math.round(rect.width),
        sidebarLeft: Math.round(rect.left),
        sidebarFitsViewport: Math.round(rect.height) <= window.innerHeight + 1,
        sidebarScrollable: sidebar.scrollHeight > sidebar.clientHeight,
        footBottom: foot ? Math.round(foot.getBoundingClientRect().bottom) : null,
        viewportHeight: window.innerHeight,
      };
    });

    // Wheel over the page *behind* the drawer — the page must not move.
    const wheelBehind = async () => {
      await page.mouse.move(width - 16, 300);
      await page.mouse.wheel(0, 900);
      await page.waitForTimeout(250);
      return page.evaluate(() => Math.round(window.scrollY));
    };
    const backgroundScroll = await wheelBehind();

    // Wheel over the drawer itself — its own list must still scroll.
    await page.mouse.move(Math.round(drawer.sidebarWidth / 2), 300);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(250);
    const ownScroll = await page.evaluate(
      () => Math.round(document.querySelector(".admin-sidebar").scrollTop)
    );

    await page.screenshot({ path: `test-results/admin-${width}-nav.png` });

    // Closing from inside the drawer must release the lock.
    await page.click(".admin-sidebar__close");
    await page.waitForTimeout(450);

    const restored = await page.evaluate(() => ({
      html: document.documentElement.style.overflow,
      body: document.body.style.overflow,
      scrim: Boolean(document.querySelector(".admin-nav-scrim")),
    }));
    const scrollAfterClose = await wheelPage();

    nav = {
      drawerMode: true,
      scrollBefore,
      ...drawer,
      backgroundScroll,
      ownScroll,
      restored,
      scrollAfterClose,
    };
  }

  console.log(`--- ${width}px nav drawer ---`);
  console.log(JSON.stringify(nav, null, 2));

  // Desktop keeps its static sidebar, so what needs checking there is the
  // detail drawer: same lock, and no sideways twitch when the scrollbar goes.
  if (!drawerMode) {
    const before = await page.evaluate(() => ({
      scrollbar: window.innerWidth - document.documentElement.clientWidth,
      contentLeft: Math.round(document.querySelector(".admin-content").getBoundingClientRect().left),
    }));

    await page.mouse.move(600, 300);
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(200);
    const pageScrolls = await page.evaluate(() => Math.round(window.scrollY));

    await page.click(".admin-row--orders");
    await page.waitForSelector(".admin-drawer");
    await page.waitForTimeout(450);

    const during = await page.evaluate(() => ({
      html: document.documentElement.style.overflow,
      body: document.body.style.overflow,
      bodyPaddingRight: document.body.style.paddingRight,
      contentLeft: Math.round(document.querySelector(".admin-content").getBoundingClientRect().left),
    }));

    // Wheel over the content area left of the drawer — behind it, on the page.
    const scrollBeforeWheel = await page.evaluate(() => Math.round(window.scrollY));
    await page.mouse.move(400, 300);
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(250);
    const backgroundScroll = await page.evaluate(() => Math.round(window.scrollY));

    await page.keyboard.press("Escape");
    await page.waitForTimeout(450);
    const after = await page.evaluate(() => ({
      html: document.documentElement.style.overflow,
      body: document.body.style.overflow,
      bodyPaddingRight: document.body.style.paddingRight,
      drawerOpen: Boolean(document.querySelector(".admin-drawer")),
    }));
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(200);
    const scrollAfterClose = await page.evaluate(() => Math.round(window.scrollY));

    console.log(`--- ${width}px detail drawer ---`);
    console.log(
      JSON.stringify(
        {
          pageScrolls,
          before,
          during,
          scrollBeforeWheel,
          backgroundScroll,
          backgroundHeld: scrollBeforeWheel === backgroundScroll,
          after,
          scrollAfterClose,
        },
        null,
        2
      )
    );

    await page.screenshot({ path: `test-results/admin-${width}-drawer.png` });
  }

  await page.close();
}

await browser.close();
console.log("\nDone.");
