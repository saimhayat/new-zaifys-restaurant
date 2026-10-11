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
- Mobile navigation, a mobile quick-action bar, safe-area spacing, responsive type and layouts, and smaller touch-device parallax.
- A searchable menu with category filters, portion selection, spice preferences, quantity, notes and working incremental loading.
- A redesigned story, gallery with filters and lightbox, reviews, reservations, FAQ, contact section and footer.
- Locally saved food photography with responsive WebP variants at 480px, 800px and 1200px, plus smaller transparent hero variants. Failed images retry the original and recover to a local placeholder; old saved Unsplash URLs resolve to bundled assets.
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
- Homepage assembly: `src/pages/Home.jsx`
- Shared state and demo admin: `src/store/restaurantStore.js`
- Image variants: `public/images/`

Home SEO uses the current host’s origin. For your own domain, update the absolute sharing image in `index.html` and the domain in `public/sitemap.xml`. Keep any environment or hosting configuration from your existing deployment.

## Validation

The production build passes. 55 DOM and logic checks passed across images, search, category filtering, incremental loading, portion pricing, cart customization, navigation, motion and theme preferences, gallery controls, review controls, FAQ, reservation validation, WhatsApp booking details, cart routing and checkout handoff. The regression checks simulate geometry and browser events; they do not verify image paint, frame rate, or visual layout in a browser. See `QA-NOTES.md` for the fixes and verification scope.

Responsive CSS was reviewed for phone, tablet and desktop layouts, including the 320px breakpoint, landscape overlay height, 16px mobile form fields and safe-area insets. Visual browser/device QA was unavailable in the editing environment. Check the finished design on your target phones before calling it fully device-tested.

## Photography

The supplied project’s stock photography has been retained as illustrative imagery and saved locally. Replace it with your actual dishes, chefs and restaurant photographs when available. The custom hero illustration is AI-generated; see `ASSET-NOTES.md` for its production prompt.
