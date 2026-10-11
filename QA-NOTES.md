# Quality fixes — Zaify’s

| Issue | Correction |
| --- | --- |
| Duplicate section offset and competing route scrolls | One measured header offset and one route scroll controller. Hash links work across cart and homepage, and browser back restores the previous position. |
| Pause and reduced-motion settings ignored by scrolling | Scrolling, parallax and reveals respond to both settings, including preference changes while the page is open. |
| Abrupt parallax reset and stale scroll progress | Parallax remains continuous outside the viewport. Progress recalculates when content height or image loading changes. |
| Old stored image URLs and missing recovery | Known legacy URLs resolve to local assets. Responsive candidates retry their original, then a branded local placeholder; changing images resets failure state. |
| Oversized mobile hero and small thumbnails | 160px and 320px photo candidates, 320px hero, larger responsive variants and a matching hero preload. |
| Header booking button reappears on phones | The shared `.btn` display rule overrode the earlier hide rule. `.navbar__cta.btn` now has enough specificity to keep the top button hidden through 1100px; the bottom booking action remains available through 767px. Desktop booking remains visible. |
| Cramped narrow form fields and checkout rows | Single-column reservation rows through 480px, flexible minimum-width tracks, wrapping order controls and revised cart, checkout and footer layout through 400px. Extra spacing rules cover 280–320px widths. |
| Decorative work continues offscreen or in background tabs | Visible-scene observers pause ambient CSS motion. Hidden tabs cancel pending scroll work; scroll progress reuses the measured page height and repeated scroll events share one animation frame. |
| Excess effects and image cost on limited devices | Optional browser hints select a light profile that disables decorative motion, parallax and large photo candidates. Phone layouts also remove backdrop blur and the hero drop shadow independently of those hints. |
| Map starts a third-party application while scrolling | The interactive map iframe is absent until the visitor selects View interactive map. Closing it removes the iframe. |
| Paused entry animation leaves a new dialog invisible | Paused and reduced-motion styles remove one-shot animations rather than freezing their initial frame. |
| Newer build syntax prevents older mobile breakpoints | Explicit JS/CSS targets retain min/max media-query syntax. Array.at was removed from dialog code; aria-hidden complements inert for older browsers. Build targets are not proof of complete browser support. |
| Locale-dependent date format breaks a native date input | Pakistan-time date parts are assembled into the required YYYY-MM-DD format. |
| Mobile bag hidden on checkout/cart | The hidden header bag rule applies only to the homepage, which has its own bottom bag action. Bottom spacing also applies only to the homepage. |
| Notches, landscape overlays and narrow cart content | Safe-area padding, viewport height fallbacks, flexible grid tracks, text wrapping and larger touch controls. |
| Background focus and overlapping scroll locks | Dialogs make the background inert, trap focus and retain the page lock until the final overlay closes. |
| Corrupt cart data or changed prices | Invalid lines are removed, totals are recomputed, and distinct prices remain separate. |
| Invalid contact fields and past booking times | Accessible inline validation, focus on the first error, and Pakistan-time checks for past reservation times. |

## Verification

- Production Vite build succeeded.
- Source lint passed with three existing warnings in CartContext (unused catch parameters and Fast Refresh export structure). The full-repository lint command remains blocked by duplicate declarations in the pre-existing `e2e/hero-reel.mjs`, an older slideshow script that does not describe the current hero. Browser scripts were not run in this environment.
- 55 DOM and logic checks passed, including the prior ordering, booking and navigation flows.
- 17 Daawat Studio DOM checks passed: guest counts, spread changes, portion selection, extras, dish spotlights, cart preservation, duplicate-click prevention, current menu prices, unavailable and deleted dishes, empty selections and reset.
- 18 performance and compatibility DOM checks passed: light-profile parallax, ambient visibility, background tabs, scroll batching, cached page height, motion preferences, reveals, image candidates, preload matching, map loading and dialog operation without Array.at.
- 85 checks against the built production CSS passed. Portrait widths: 280, 320, 360, 375, 390, 412, 430, 480, 600 and 767px. Landscape sizes: 568×320, 667×375, 740×360, 844×390 and 932×430. Desktop: 1280px. The checks resolve applicable media rules and specificity; they are not a browser layout engine.
- 11 automated utility tests passed: six Daawat pricing/availability cases, three performance-profile cases and two date/phone-validation cases. Command: `node --test src/utils/daawat.test.mjs src/utils/performance.test.mjs src/utils/forms.test.mjs`.
- All 129 WebP files decode; every responsive width descriptor matches the real file width, and production copies match their source assets.
- All referenced local assets exist, and the SVG fallback parses successfully.
- Across the 25 stock photographs, the new 160px candidates total 147,448 bytes versus 763,576 bytes for their previous smallest 480px candidates: 81% smaller. Actual downloads depend on browser selection, screen density and the rendered image size.
- Responsive source reviewed for phone, tablet, desktop, landscape, 16px form fields and safe-area insets. Font metrics were checked for the narrow hero and header; this is an estimate rather than rendered geometry.

Visual browser QA and physical-device testing were unavailable. Simulated DOM and CSS checks cannot prove pixel-level layout, actual horizontal overflow, browser image rendering, keyboard behavior, scroll animation quality, or frame rate. No CPU-throttled browser benchmark or Lighthouse run was performed. Verify those on the phones and browsers used by customers before describing the site as 100% device-tested.

The light profile uses browser hints when available: memory at most 4 GB, at most four reported CPU threads, Save-Data or a reported slow-2g/2g/3g connection. These hints are approximate and optional; browsers without them keep normal motion. The phone-wide blur reduction, smaller image candidates, on-demand map, viewport-aware animation and existing pause control still apply.

## Daawat Studio layout and motion

The desktop studio pairs a sticky food showcase with a receipt-style planner. At 1000px and below it becomes one column; at 374px and below quantity controls move below the dish details. Portion selectors use 16px text; quantity, reset, thumbnail and selection controls have at least 44px touch dimensions. Animation respects the existing pause setting and reduced-motion preference, with smaller phone parallax. The global scroll controller handles the new `#daawat` destination.

The earlier report of missing images remains unverified in the user's browser. All bundled assets are present and decode successfully, but direct hosted requests encounter the private Site's sign-in gate. This does not establish the cause of the user's image problem.
