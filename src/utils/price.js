/**
 * Menu price helpers.
 *
 * Prices live in `src/data/menuData.js` as numbers inside each item's `sizes`
 * array. Nothing outside this module should parse or format a price by hand —
 * the menu card, the order modal, the cart and the checkout all read from here
 * so a single size selection can never disagree with what is displayed.
 */

/**
 * The size selected by default when the order modal opens.
 *
 * By convention the FIRST entry in `sizes` is the restaurant's default serving
 * — the large shared portions for curries, the standard cut for steaks, the
 * regular glass for drinks. The menu card advertises this same price, so the
 * number a customer sees on the card is always the number they land on.
 */
export function defaultSize(item) {
  return item?.sizes?.[0] ?? null;
}

/** Price in rupees for a given size label, falling back to the default size. */
export function priceForSize(item, label) {
  if (!item?.sizes?.length) return 0;

  const match = item.sizes.find((size) => size.label === label);
  return (match ?? item.sizes[0]).price;
}

/** "Rs. 1,650" — the single place a menu price becomes text. */
export function formatRs(amount) {
  return `Rs. ${Math.round(Number(amount) || 0).toLocaleString()}`;
}
