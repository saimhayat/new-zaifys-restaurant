# Zaify’s — Spice & Soul

The modernized Zaify’s Restaurant website. React + Vite, with the existing menu, cart, checkout and browser-local admin preserved.

## Run it

Use Node.js 22.12+ or 24.

```bash
npm install
npm run dev
npm run build
npm run preview
```

`dist/` is the production build. It is included in the downloadable project. For a manually deployed static site, upload the contents of `dist/`. For a Git-connected deployment, commit source files and let your host run `npm run build`. The static output directory is `dist`.

React Router needs a rewrite to `/index.html` for `/cart`, `/checkout`, and `/admin`. The supplied `public/_redirects` supports Netlify, and `vercel.json` supports Vercel. Keep those files if you use either host.

## What changed

- A coherent ivory, charcoal, orange and sage visual identity with Bricolage Grotesque and DM Sans typography.
- A custom transparent karahi hero visual with floating motion, pointer response and scroll parallax.
- A scrolling flavour band, scroll reveals, image hover motion and a reading progress line.
- A pause-motion control, reduced-motion support, keyboard focus indicators and accessible modal focus management.
- Mobile navigation, a mobile quick-action bar, safe-area spacing and flexible layouts. The header booking button stays hidden on mobile; booking remains in the bottom action bar. Narrow reservation fields, cart rows and landscape dialogs have dedicated layouts.
- A conservative light profile for browsers reporting limited memory, CPU threads, data saving or a slow connection. It removes decorative animation and parallax and limits photo candidates. All phones avoid costly glass blur; ambient animation stops outside the viewport and in background tabs. The interactive map loads only after a visitor requests it.
- A searchable menu with category filters, portion selection, spice preferences, quantity, notes and working incremental loading.
- An interactive Daawat Studio: three suggested spreads for 2–8 guests, portion and quantity controls, optional desserts and drinks, exact menu-based subtotals, dish spotlights and an add-to-bag flow. Menu edits and sold-out status update the studio immediately.
- A redesigned story, gallery with filters and lightbox, reviews, reservations, FAQ, contact section and footer.
- Locally saved food photography with responsive WebP variants at 160px, 320px, 480px, 800px and the original width, plus smaller transparent hero variants. Failed images retry the original and recover to a local placeholder; old saved Unsplash URLs resolve to bundled assets. Hero preload and image candidates match.
- Explicit build targets for Chrome 87, Safari 15, Firefox 78 and Edge 88 retain older media-query syntax. Dialog focus management avoids Array.at, and reservation date inputs receive ISO dates in Pakistan time. These targets do not replace testing on real browsers.
- Removed the duplicate cart provider; cart changes use functional updates, and different special instructions stay on separate order lines.
- Cart and checkout keep their routes and now share the updated branding and navigation.

## Orders, reservations and admin

The original project has no shared backend. Its admin data remains in the current browser’s local storage. It is a demonstration admin, not a secure production administration service.

Checkout prepares an order and a WhatsApp link containing the full order, customization, address, delivery fee and payment preference. A visitor must click **Send order on WhatsApp** and send the message; the restaurant confirms availability and delivery. No card payment is processed by this site.

Reservations prepare a WhatsApp request. A visitor must send it to the restaurant and wait for confirmation. The interface does not claim that a local form submission has booked a real table.

Menu prices, contact details, hours, address and supplied review content are preserved from the uploaded project. Check them before using the site as your business’s public ordering channel.

## Editing

- Menu: `src/data/menuData.js`
- Restaurant details and reviews: `src/data/siteData.js`
- Colors and typography: `src/styles/global.css`
- Phone and light-profile overrides: `src/styles/mobile.css`
- Performance hints and ambient motion: `src/utils/performance.js` and `src/hooks/useAmbientMotion.js`
- Homepage assembly: `src/pages/Home.jsx`
- Shared state and demo admin: `src/store/restaurantStore.js`
- Daawat combinations and suggested quantities: `src/utils/daawat.js`
- Daawat presentation: `src/components/DaawatStudio/`
- Image variants: `public/images/`

Home SEO uses the current host’s origin. For your own domain, update the absolute sharing image in `index.html` and the domain in `public/sitemap.xml`. Keep any environment or hosting configuration from your existing deployment.

## Validation

The production build passes. Verification includes 55 existing DOM and logic checks, 17 Daawat Studio checks, 18 performance and compatibility checks, 85 production CSS cascade checks and 11 utility tests. All 129 bundled WebP files decode and their descriptors match actual widths. Run the utility tests with `node --test src/utils/daawat.test.mjs src/utils/performance.test.mjs src/utils/forms.test.mjs`. The DOM and CSS checks simulate events, geometry and the cascade; they do not verify image paint, frame rate, or visual layout in a browser. See `QA-NOTES.md` for the exact scope.

The compiled CSS was checked at widths from 280px to 767px, five landscape sizes and 1280px desktop, including header booking visibility, bottom actions, full-width narrow forms, wrapping order controls and blur removal. Visual browser/device QA was unavailable in the editing environment. Neither these checks nor browser hints establish a universal frame-rate or device-compatibility guarantee.

## Presenting to the manager

Open the homepage and select **Build your daawat**. Try **Best of both**, change the guest count, choose a half portion, add a sweet ending, and add the spread to the bag. The cart keeps the selected quantities, portion prices and default spice levels. Checkout prepares the existing WhatsApp handoff; it does not send an order automatically.

The studio offers starting quantities, not guaranteed servings or special package prices. The per-person figure is the food subtotal divided by the selected guest count. Actual photographs, menu prices and the reported image-loading issue should be checked on the presentation device before the meeting.

## Photography

The supplied project’s stock photography has been retained as illustrative imagery and saved locally. Replace it with your actual dishes, chefs and restaurant photographs when available. The custom hero illustration is AI-generated; see `ASSET-NOTES.md` for its production prompt.
