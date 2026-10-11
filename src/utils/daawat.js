export const DAAWAT_GUESTS = [2, 4, 6, 8];

// These are suggested combinations, not new set menus or fixed serving claims.
export const DAAWAT_PROFILES = [
  { id: "desi", name: "Desi classics", note: "A karahi at the centre. Biryani on the side.", dishes: ["chicken-karahi", "biryani"] },
  { id: "bbq", name: "Over the coals", note: "Creamy malai boti, seekh kabab and smoky tikka.", dishes: ["malai-boti", "seekh-kabab", "chicken-tikka"] },
  { id: "mixed", name: "Best of both", note: "The comfort of karahi. The char of BBQ. A little biryani.", dishes: ["chicken-karahi", "malai-boti", "biryani"] },
];

export const DAAWAT_EXTRAS = [
  { id: "chocolate-lava", name: "A sweet ending", note: "Chocolate lava cake", icon: "sweet" },
  { id: "blueberry-shake", name: "Something cool", note: "Blueberry shakes", icon: "drink" },
];

export function daawatSelection(item, guests = 4, extra = false) {
  const group = DAAWAT_GUESTS.includes(guests) ? guests : 4;
  const size = (!extra && group === 2 && item?.sizes?.find(option => option.label === "Half")) || item?.sizes?.[0];
  const quantity = extra ? (item?.category === "Drinks" ? group : Math.ceil(group / 2)) : Math.ceil(group / 4);
  return { size: size?.label ?? "", quantity };
}

export function createDaawatSelections(profileId, guests, menu) {
  const profile = DAAWAT_PROFILES.find(entry => entry.id === profileId) ?? DAAWAT_PROFILES[0];
  return Object.fromEntries(profile.dishes.flatMap(id => {
    const item = menu.find(dish => dish.id === id);
    return item ? [[id, daawatSelection(item, guests)]] : [];
  }));
}

/** Resolve prices and availability at render time, including later menu edits. */
export function daawatLines(selections, menu) {
  return Object.entries(selections).flatMap(([id, selection]) => {
    const item = menu.find(dish => dish.id === id);
    if (!item) return [];
    const option = item.sizes?.find(size => size.label === selection.size) ?? item.sizes?.[0];
    const unitPrice = option?.price;
    const available = item.available !== false && typeof unitPrice === "number" && Number.isFinite(unitPrice) && unitPrice >= 0;
    const quantity = Number.isSafeInteger(selection.quantity) ? Math.max(0, Math.min(20, selection.quantity)) : 0;
    return [{ item, size: option?.label ?? "", unitPrice, quantity, available, total: available ? quantity * unitPrice : 0 }];
  });
}

export function daawatCartItem(line) {
  if (!line.available || line.quantity < 1) return null;
  return { id: line.item.id, name: line.item.name, image: line.item.image, size: line.size,
    quantity: line.quantity, unitPrice: line.unitPrice, totalPrice: line.total,
    spice: line.item.spice ?? "", notes: "" };
}
