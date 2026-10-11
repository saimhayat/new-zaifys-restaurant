/**
 * Demo seed data for the admin panel.
 *
 * This exists so the panel has something believable to show before a real
 * backend is wired up. Every order here is built from the actual menu so
 * prices and dish names can never drift from `src/data/menuData.js`.
 *
 * Nothing in this file runs once orders start arriving from the checkout —
 * `resetDemoData()` is the only thing that calls back into it.
 */

const CUSTOMERS = [
  {
    name: "Ayesha Malik",
    phone: "0300 1234567",
    address: "House 42, Street 6, Block B, Satellite Town",
    city: "Rawalpindi",
  },
  {
    name: "Bilal Ahmed",
    phone: "0321 2345678",
    address: "Flat 3-C, Al-Noor Plaza, Block C, Satellite Town",
    city: "Rawalpindi",
  },
  {
    name: "Sana Tariq",
    phone: "0333 3456789",
    address: "House 17, Gulraiz Housing Scheme, Phase 2",
    city: "Rawalpindi",
  },
  {
    name: "Hamza Raza",
    phone: "0345 4567890",
    address: "House 8, Street 2, Chaklala Scheme 3",
    city: "Rawalpindi",
  },
  {
    name: "Fatima Iqbal",
    phone: "0301 5678901",
    address: "Shop 12, Commercial Market",
    city: "Rawalpindi",
  },
  {
    name: "Usman Sheikh",
    phone: "0312 6789012",
    address: "House 91, Dhoke Kala Khan",
    city: "Rawalpindi",
  },
  {
    name: "Zainab Nawaz",
    phone: "0334 7890123",
    address: "House 25, Street 11, Block A, Satellite Town",
    city: "Rawalpindi",
  },
  {
    name: "Ali Hassan",
    phone: "0308 8901234",
    address: "House 6, Sadiqabad Road",
    city: "Rawalpindi",
  },
];

/**
 * `items` entries are [menuItemId, sizeLabel, quantity].
 * `daysAgo` / `hour` position the order on a real timeline so the dashboard's
 * "today" figures are meaningful whenever the demo is opened.
 */
const ORDER_BLUEPRINTS = [
  { daysAgo: 0, hour: 12, customer: 0, items: [["chicken-karahi", "Full", 1], ["egg-fried-rice", "Full", 1]], status: "new", payment: "Cash on Delivery" },
  { daysAgo: 0, hour: 13, customer: 2, items: [["malai-boti", "Full", 2], ["blueberry-shake", "Regular", 2]], status: "new", payment: "Cash on Delivery" },
  { daysAgo: 0, hour: 13, customer: 5, items: [["mutton-karahi", "Half", 1], ["seekh-kabab", "Full", 1]], status: "preparing", payment: "Cash on Delivery", notes: "Extra green chillies on the side." },
  { daysAgo: 0, hour: 14, customer: 1, items: [["biryani", "Full", 3], ["chicken-tikka", "Half", 1], ["chocolate-lava", "Regular", 2]], status: "out-for-delivery", payment: "Card" },
  { daysAgo: 0, hour: 14, customer: 7, items: [["moroccan-steak", "8 oz", 1], ["chef-special-soup", "Full", 1]], status: "confirmed", payment: "Card", notes: "Medium rare, please." },
  { daysAgo: 0, hour: 15, customer: 3, items: [["singapore-chowmein", "Full", 1], ["wraps", "Regular", 2]], status: "new", payment: "Cash on Delivery" },
  { daysAgo: 1, hour: 20, customer: 4, items: [["chicken-handi", "Full", 1], ["chicken-qorma", "Half", 1], ["wraps", "Regular", 1]], status: "delivered", payment: "Cash on Delivery" },
  { daysAgo: 1, hour: 21, customer: 6, items: [["mongolian-chicken", "Full", 1], ["egg-fried-rice", "Half", 1]], status: "delivered", payment: "Cash on Delivery" },
  { daysAgo: 1, hour: 22, customer: 0, items: [["tarragon-steak", "12 oz", 1], ["chocolate-lava", "Regular", 1]], status: "delivered", payment: "Card" },
  { daysAgo: 2, hour: 19, customer: 3, items: [["chicken-karahi", "Full", 2], ["seekh-kabab", "Full", 2], ["chicken-tikka", "Full", 1]], status: "delivered", payment: "Cash on Delivery" },
  { daysAgo: 2, hour: 20, customer: 1, items: [["alfredo-pasta", "Full", 1], ["chicken-sandwich", "Regular", 2]], status: "delivered", payment: "Card" },
  { daysAgo: 3, hour: 18, customer: 5, items: [["mutton-karahi", "Full", 1], ["chicken-tikka", "Full", 1]], status: "delivered", payment: "Cash on Delivery", notes: "Deliver to the side gate." },
  { daysAgo: 3, hour: 21, customer: 7, items: [["biryani", "Half", 2], ["blueberry-shake", "Large", 1]], status: "cancelled", payment: "Cash on Delivery", notes: "Customer called to cancel — ordered by mistake." },
  { daysAgo: 4, hour: 20, customer: 2, items: [["chicken-qorma", "Full", 1], ["egg-fried-rice", "Full", 1], ["chocolate-lava", "Regular", 1]], status: "delivered", payment: "Card" },
  { daysAgo: 5, hour: 19, customer: 6, items: [["moroccan-steak", "12 oz", 2], ["chef-special-soup", "Full", 2]], status: "delivered", payment: "Card" },
  { daysAgo: 6, hour: 21, customer: 4, items: [["malai-boti", "Half", 2], ["chicken-handi", "Half", 1], ["blueberry-shake", "Regular", 3]], status: "delivered", payment: "Cash on Delivery" },
];

const RESERVATION_BLUEPRINTS = [
  { daysFromNow: 0, time: "20:00", name: "Kamran Yousaf", phone: "0300 9988771", guests: 4, status: "pending", message: "Window table if possible." },
  { daysFromNow: 0, time: "21:30", name: "Nida Aslam", phone: "0321 8877665", guests: 2, status: "confirmed", message: "" },
  { daysFromNow: 1, time: "13:00", name: "Rehan Siddiqui", phone: "0333 7766554", guests: 6, status: "confirmed", message: "Birthday — please arrange a cake." },
  { daysFromNow: 1, time: "19:30", name: "Mariam Butt", phone: "0345 6655443", guests: 3, status: "pending", message: "" },
  { daysFromNow: 2, time: "20:00", name: "Shahid Mehmood", phone: "0301 5544332", guests: 8, status: "pending", message: "Corporate dinner, need a long table." },
  { daysFromNow: 2, time: "18:30", name: "Hina Qureshi", phone: "0312 4433221", guests: 2, status: "confirmed", message: "" },
  { daysFromNow: 3, time: "21:00", name: "Tariq Jameel", phone: "0334 3322110", guests: 5, status: "pending", message: "One guest is vegetarian." },
  { daysFromNow: -1, time: "20:30", name: "Amna Zahid", phone: "0308 2211009", guests: 4, status: "seated", message: "" },
  { daysFromNow: -2, time: "19:00", name: "Junaid Akram", phone: "0311 1100998", guests: 3, status: "cancelled", message: "Guest cancelled — rescheduling next week." },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Builds the seed order list, priced from the live menu so it stays truthful. */
export function buildSeedOrders(menu, settings) {
  const now = new Date();

  return ORDER_BLUEPRINTS.map((blueprint, index) => {
    const placed = new Date(now.getTime() - blueprint.daysAgo * DAY_MS);
    placed.setHours(blueprint.hour, (index * 7) % 60, 0, 0);

    const items = blueprint.items
      .map(([id, size, quantity]) => {
        const dish = menu.find((entry) => entry.id === id);
        if (!dish) return null; // blueprint references a dish that no longer exists

        const sizeEntry =
          dish.sizes.find((entry) => entry.label === size) ?? dish.sizes[0];

        return {
          id: dish.id,
          name: dish.name,
          image: dish.image,
          size: sizeEntry.label,
          spice: dish.spice,
          quantity,
          unitPrice: sizeEntry.price,
          totalPrice: sizeEntry.price * quantity,
          notes: "",
        };
      })
      .filter(Boolean);

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const deliveryFee =
      settings.freeDeliveryOver > 0 && subtotal >= settings.freeDeliveryOver
        ? 0
        : settings.deliveryFee;

    const customer = CUSTOMERS[blueprint.customer];

    return {
      id: `ORD-${1000 + index}`,
      customer: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
      },
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      paymentMethod: blueprint.payment,
      status: blueprint.status,
      placedAt: placed.toISOString(),
      notes: blueprint.notes ?? "",
    };
  }).filter((order) => order.items.length > 0);
}

export function buildSeedReservations() {
  const now = new Date();

  return RESERVATION_BLUEPRINTS.map((blueprint, index) => {
    const date = new Date(now.getTime() + blueprint.daysFromNow * DAY_MS);
    const iso = date.toISOString().split("T")[0];

    return {
      id: `RES-${2000 + index}`,
      name: blueprint.name,
      phone: blueprint.phone,
      guests: blueprint.guests,
      date: iso,
      time: blueprint.time,
      message: blueprint.message,
      status: blueprint.status,
      createdAt: new Date(
        now.getTime() - Math.max(blueprint.daysFromNow + 2, 0) * DAY_MS
      ).toISOString(),
    };
  });
}

/** Sequence numbers continue past the seed so new ids never collide. */
export const SEED_ORDER_SEQ = 1000 + ORDER_BLUEPRINTS.length;
export const SEED_RESERVATION_SEQ = 2000 + RESERVATION_BLUEPRINTS.length;
