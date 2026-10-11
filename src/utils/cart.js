import { resolveImageSrc } from "./images";

/** Ignore corrupt saved lines and always derive totals from price × quantity. */
export function normalizeCartItems(items) {
  if (!Array.isArray(items)) return [];
  return items.flatMap(item => {
    if (!item || typeof item.id !== "string" || typeof item.name !== "string" || !item.name.trim()) return [];
    const quantity = Number(item.quantity), unitPrice = Number(item.unitPrice);
    if (!Number.isSafeInteger(quantity) || quantity < 1 || item.unitPrice == null || !Number.isFinite(unitPrice) || unitPrice < 0 || !Number.isFinite(unitPrice * quantity)) return [];
    return [{ ...item, quantity, unitPrice, totalPrice: unitPrice * quantity,
      image: resolveImageSrc(item.image), size: typeof item.size === "string" ? item.size : "Regular",
      spice: typeof item.spice === "string" ? item.spice : "", notes: typeof item.notes === "string" ? item.notes : "" }];
  });
}
