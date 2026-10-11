# Quality fixes — Zaify’s

| Issue | Correction |
| --- | --- |
| Duplicate section offset and competing route scrolls | One measured header offset and one route scroll controller. Hash links work across cart and homepage, and browser back restores the previous position. |
| Pause and reduced-motion settings ignored by scrolling | Scrolling, parallax and reveals respond to both settings, including preference changes while the page is open. |
| Abrupt parallax reset and stale scroll progress | Parallax remains continuous outside the viewport. Progress recalculates when content height or image loading changes. |
| Old stored image URLs and missing recovery | Known legacy URLs resolve to local assets. Responsive candidates retry their original, then a branded local placeholder; changing images resets failure state. |
| Oversized mobile hero and blurred gallery detail | 480px and 800px hero variants, matching responsive preload, and image sizes suited to each rendered location. |
| Mobile bag hidden on checkout/cart | The hidden header bag rule applies only to the homepage, which has its own bottom bag action. Bottom spacing also applies only to the homepage. |
| Notches, landscape overlays and narrow cart content | Safe-area padding, viewport height fallbacks, flexible grid tracks, text wrapping and larger touch controls. |
| Background focus and overlapping scroll locks | Dialogs make the background inert, trap focus and retain the page lock until the final overlay closes. |
| Corrupt cart data or changed prices | Invalid lines are removed, totals are recomputed, and distinct prices remain separate. |
| Invalid contact fields and past booking times | Accessible inline validation, focus on the first error, and Pakistan-time checks for past reservation times. |

## Verification

- Production Vite build succeeded.
- 55 DOM and logic checks passed, including the prior ordering, booking and navigation flows.
- All 78 WebP files decode; every responsive width descriptor matches the real file width.
- All referenced local assets exist, and the SVG fallback parses successfully.
- Responsive CSS reviewed for 320px phones, tablet, desktop, landscape and safe-area insets.

Visual browser QA and physical-device testing were unavailable. Simulated DOM checks cannot prove pixel-level layout, browser image rendering, scroll animation quality, or frame rate. Verify those on the phones and browsers used by customers.
