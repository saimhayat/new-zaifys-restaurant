import { useSyncExternalStore } from "react";
import { menuItems, signatureDishIds } from "../data/menuData";
import { restaurantInfo } from "../data/siteData";
import {
  buildSeedOrders,
  buildSeedReservations,
  SEED_ORDER_SEQ,
  SEED_RESERVATION_SEQ,
} from "./seedData";

/**
 * The single source of truth for everything the admin panel manages, and for
 * the parts of the public site that should reflect admin edits.
 *
 * ── Why this file exists ────────────────────────────────────────────────────
 * There is no backend yet. Rather than scattering `localStorage` calls across
 * components, all reads and writes funnel through this module. When a real API
 * arrives, the swap is contained here: replace `loadState` / `persist` with
 * fetches, keep the same action names, and every component keeps working.
 *
 * ── Known limitation ────────────────────────────────────────────────────────
 * Data lives in THIS BROWSER only. An order placed on a customer's phone will
 * not appear on the restaurant's laptop. That is the whole reason a backend is
 * the next step — see the notice on the dashboard.
 */

const STATE_KEY = "zaify_admin_state";
const SESSION_KEY = "zaify_admin_session";

/** Bump when the persisted shape changes so stale blobs are discarded. */
const STORAGE_VERSION = 2;

export const ORDER_STATUSES = [
  { id: "new", label: "New", tone: "info" },
  { id: "confirmed", label: "Confirmed", tone: "info" },
  { id: "preparing", label: "Preparing", tone: "warn" },
  { id: "out-for-delivery", label: "Out for delivery", tone: "warn" },
  { id: "delivered", label: "Delivered", tone: "ok" },
  { id: "cancelled", label: "Cancelled", tone: "danger" },
];

export const RESERVATION_STATUSES = [
  { id: "pending", label: "Pending", tone: "warn" },
  { id: "confirmed", label: "Confirmed", tone: "ok" },
  { id: "seated", label: "Seated", tone: "info" },
  { id: "cancelled", label: "Cancelled", tone: "danger" },
];

/** Orders that still need someone in the kitchen to act. */
export const OPEN_ORDER_STATUSES = ["new", "confirmed", "preparing", "out-for-delivery"];

export const DEMO_PASSCODE = "admin123";

function defaultSettings() {
  return {
    name: restaurantInfo.name,
    tagline: restaurantInfo.tagline,
    address: restaurantInfo.address,
    phone: restaurantInfo.phone,
    phoneHref: restaurantInfo.phoneHref,
    whatsappHref: restaurantInfo.whatsappHref,
    priceRange: restaurantInfo.priceRange,
    hours: restaurantInfo.hours,
    services: [...restaurantInfo.services],
    /** Menu prices and the free-delivery threshold are all in rupees. */
    deliveryFee: 150,
    freeDeliveryOver: 5000,
  };
}

/** Editable copies of the menu — the public menu reads from here too. */
function defaultMenu() {
  return menuItems.map((item) => ({ ...item }));
}

function createInitialState() {
  const settings = defaultSettings();
  const menu = defaultMenu();

  return {
    version: STORAGE_VERSION,
    settings,
    menu,
    orders: buildSeedOrders(menu, settings),
    reservations: buildSeedReservations(),
    orderSeq: SEED_ORDER_SEQ,
    reservationSeq: SEED_RESERVATION_SEQ,
    session: null,
  };
}

// ── persistence ────────────────────────────────────────────────────────────

function loadState() {
  const fallback = createInitialState();

  if (typeof localStorage === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (parsed?.version !== STORAGE_VERSION) return fallback;

    // Settings are merged rather than replaced, so a field added in a later
    // release still arrives with its default instead of going undefined.
    return {
      ...fallback,
      ...parsed,
      settings: { ...fallback.settings, ...parsed.settings },
    };
  } catch {
    return fallback;
  }
}

function loadSession() {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(state) {
  if (typeof localStorage === "undefined") return;
  try {
    // The session is persisted separately so resetting demo data never signs
    // the operator out mid-session.
    const data = { ...state };
    delete data.session;
    localStorage.setItem(STATE_KEY, JSON.stringify(data));
  } catch {
    /* storage full or blocked (private mode) — keep running in memory */
  }
}

function persistSession(session) {
  if (typeof localStorage === "undefined") return;
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

// ── store ──────────────────────────────────────────────────────────────────

let state = { ...loadState(), session: loadSession() };
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function setState(updater) {
  const next = typeof updater === "function" ? updater(state) : updater;
  if (next === state) return;
  state = next;
  persist(state);
  emit();
}

/**
 * React hook returning the whole admin state.
 * `useSyncExternalStore` keeps every consumer in step, including other tabs.
 */
export function useAdminStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Keep a second tab (the customer site, say) in step with admin edits — an
// order placed in another tab raises a `storage` event here and re-renders.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STATE_KEY) return;
    // The session is persisted under its own key, so keep the in-memory one
    // rather than clobbering it with whatever the other tab wrote.
    state = { ...loadState(), session: state.session };
    emit();
  });
}

// ── selectors ──────────────────────────────────────────────────────────────

export function useAdminMenu() {
  return useAdminStore().menu;
}

export function useRestaurantInfo() {
  return useAdminStore().settings;
}

export function useSignatureDishes() {
  const menu = useAdminMenu();
  return signatureDishIds
    .map((id) => menu.find((item) => item.id === id))
    .filter(Boolean);
}

/** A dish is orderable when it exists in the menu and is marked available. */
export function canOrder(item) {
  return Boolean(item) && item.available !== false;
}

/** Totals for any basket, honouring the admin's delivery rules. */
export function computeTotals(subtotal, settings) {
  const qualifiesForFreeDelivery =
    settings.freeDeliveryOver > 0 && subtotal >= settings.freeDeliveryOver;
  const deliveryFee =
    subtotal <= 0 || qualifiesForFreeDelivery ? 0 : settings.deliveryFee;

  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    qualifiesForFreeDelivery,
    /** How much more the customer must spend to unlock free delivery. */
    freeDeliveryGap: qualifiesForFreeDelivery
      ? 0
      : Math.max(settings.freeDeliveryOver - subtotal, 0),
  };
}

/** Customers are derived from orders — there is no separate customer record. */
export function deriveCustomers(orders) {
  const byPhone = new Map();

  orders.forEach((order) => {
    const key = order.customer.phone;
    const existing = byPhone.get(key);

    if (existing) {
      existing.orders += 1;
      existing.spend += order.status === "cancelled" ? 0 : order.total;
      if (new Date(order.placedAt) > new Date(existing.lastOrderAt)) {
        existing.lastOrderAt = order.placedAt;
        existing.lastAddress = order.customer.address;
      }
    } else {
      byPhone.set(key, {
        phone: key,
        name: order.customer.name,
        address: order.customer.address,
        city: order.customer.city,
        orders: 1,
        spend: order.status === "cancelled" ? 0 : order.total,
        lastOrderAt: order.placedAt,
        lastAddress: order.customer.address,
      });
    }
  });

  return [...byPhone.values()].sort(
    (a, b) => new Date(b.lastOrderAt) - new Date(a.lastOrderAt)
  );
}

function isSameDay(iso, reference) {
  const date = new Date(iso);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

/** KPI figures for the dashboard, scoped to today. */
export function deriveDashboardStats(state, now = new Date()) {
  const { orders, reservations } = state;

  const todayOrders = orders.filter((order) => isSameDay(order.placedAt, now));
  const revenueToday = todayOrders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  const openOrders = orders.filter((order) =>
    OPEN_ORDER_STATUSES.includes(order.status)
  );

  const pendingReservations = reservations.filter(
    (reservation) => reservation.status === "pending"
  );

  const todaysReservations = reservations.filter(
    (reservation) =>
      reservation.date === now.toISOString().split("T")[0] &&
      reservation.status !== "cancelled"
  );

  const countedOrders = orders.filter((order) => order.status !== "cancelled");

  return {
    ordersToday: todayOrders.length,
    revenueToday,
    openOrders: openOrders.length,
    pendingReservations: pendingReservations.length,
    reservationsToday: todaysReservations.length,
    guestsToday: todaysReservations.reduce((sum, r) => sum + r.guests, 0),
    averageOrderValue: countedOrders.length
      ? Math.round(
          countedOrders.reduce((sum, order) => sum + order.total, 0) /
            countedOrders.length
        )
      : 0,
    totalOrders: orders.length,
    lifetimeRevenue: countedOrders.reduce((sum, order) => sum + order.total, 0),
  };
}

/** Best-selling dishes across all non-cancelled orders. */
export function deriveTopDishes(orders, limit = 5) {
  const tally = new Map();

  orders
    .filter((order) => order.status !== "cancelled")
    .forEach((order) => {
      order.items.forEach((item) => {
        const entry = tally.get(item.id) ?? {
          id: item.id,
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
        entry.quantity += item.quantity;
        entry.revenue += item.totalPrice;
        tally.set(item.id, entry);
      });
    });

  return [...tally.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

/** Orders per day for the last `days` days, oldest first. */
export function deriveOrderTrend(orders, days = 7, now = new Date()) {
  const series = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000);
    const dayOrders = orders.filter((order) => isSameDay(order.placedAt, day));

    series.push({
      label: day.toLocaleDateString("en-GB", { weekday: "short" }),
      date: day.toISOString().split("T")[0],
      orders: dayOrders.length,
      revenue: dayOrders
        .filter((order) => order.status !== "cancelled")
        .reduce((sum, order) => sum + order.total, 0),
    });
  }

  return series;
}

/**
 * Reporting windows. `days: null` means "everything ever recorded".
 */
export const REPORT_PERIODS = [
  { id: "today", label: "Today", days: 1 },
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "all", label: "All time", days: null },
];

/** Midnight on the first day included by a period, or null for "all time". */
function periodStart(periodId, now = new Date()) {
  const period = REPORT_PERIODS.find((entry) => entry.id === periodId);
  if (!period || period.days === null) return null;

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (period.days - 1));
  return start;
}

/**
 * Everything the Reports section shows, in one pass over the orders.
 *
 * Deliberately returns plain ranked lists rather than a chart library — the
 * panel should stay dependency-free, and ranked bars survive every screen size.
 */
export function deriveReport(state, periodId, now = new Date()) {
  const start = periodStart(periodId, now);
  const startDate = start ? start.toISOString().split("T")[0] : null;

  const periodOrders = state.orders.filter(
    (order) => !start || new Date(order.placedAt) >= start
  );
  const billable = periodOrders.filter((order) => order.status !== "cancelled");

  const categoryOf = new Map(state.menu.map((item) => [item.id, item.category]));

  const byCategory = new Map();
  const byPayment = new Map();
  const byHour = new Map();
  let itemsSold = 0;
  let deliveryRevenue = 0;

  billable.forEach((order) => {
    deliveryRevenue += order.deliveryFee ?? 0;

    const payment = byPayment.get(order.paymentMethod) ?? {
      label: order.paymentMethod,
      orders: 0,
      revenue: 0,
    };
    payment.orders += 1;
    payment.revenue += order.total;
    byPayment.set(order.paymentMethod, payment);

    const hour = new Date(order.placedAt).getHours();
    const bucket = byHour.get(hour) ?? { hour, orders: 0, revenue: 0 };
    bucket.orders += 1;
    bucket.revenue += order.total;
    byHour.set(hour, bucket);

    order.items.forEach((item) => {
      itemsSold += item.quantity;
      const category = categoryOf.get(item.id) ?? "Other";
      const entry = byCategory.get(category) ?? {
        label: category,
        quantity: 0,
        revenue: 0,
      };
      entry.quantity += item.quantity;
      entry.revenue += item.totalPrice;
      byCategory.set(category, entry);
    });
  });

  const revenue = billable.reduce((sum, order) => sum + order.total, 0);
  const cancelled = periodOrders.length - billable.length;

  // Reservations are dated, not timestamped, so they filter on the date string.
  const periodReservations = state.reservations.filter(
    (reservation) => !startDate || reservation.date >= startDate
  );
  const reservations = periodReservations.filter(
    (reservation) => reservation.status !== "cancelled"
  );

  const bySlot = new Map();
  reservations.forEach((reservation) => {
    const slot = bySlot.get(reservation.time) ?? {
      label: reservation.time,
      covers: 0,
      bookings: 0,
    };
    slot.covers += reservation.guests;
    slot.bookings += 1;
    bySlot.set(reservation.time, slot);
  });

  const sortDesc = (key) => (a, b) => b[key] - a[key];

  return {
    periodId,
    start,
    orderCount: periodOrders.length,
    billableCount: billable.length,
    revenue,
    itemsSold,
    deliveryRevenue,
    cancelled,
    cancelRate: periodOrders.length
      ? Math.round((cancelled / periodOrders.length) * 100)
      : 0,
    averageOrderValue: billable.length ? Math.round(revenue / billable.length) : 0,
    byCategory: [...byCategory.values()].sort(sortDesc("revenue")),
    byPayment: [...byPayment.values()].sort(sortDesc("revenue")),
    peakHours: [...byHour.values()].sort(sortDesc("orders")),
    topDishes: deriveTopDishes(
      periodOrders.filter((order) => order.status !== "cancelled"),
      6
    ),
    reservations: {
      count: periodReservations.length,
      active: reservations.length,
      cancelled: periodReservations.length - reservations.length,
      covers: reservations.reduce((sum, reservation) => sum + reservation.guests, 0),
      pending: reservations.filter((reservation) => reservation.status === "pending")
        .length,
      busiestSlots: [...bySlot.values()].sort(sortDesc("covers")).slice(0, 5),
    },
  };
}

// ── actions: orders ────────────────────────────────────────────────────────

/**
 * Records an order placed on the public site and returns it, so the checkout
 * can show the customer their order number.
 */
export function addOrder(draft) {
  const seq = state.orderSeq;
  const order = {
    id: `ORD-${seq}`,
    status: "new",
    placedAt: new Date().toISOString(),
    notes: "",
    ...draft,
  };

  setState((current) => ({
    ...current,
    orders: [order, ...current.orders],
    orderSeq: seq + 1,
  }));

  return order;
}

export function updateOrderStatus(id, status) {
  setState((current) => ({
    ...current,
    orders: current.orders.map((order) =>
      order.id === id ? { ...order, status } : order
    ),
  }));
}

export function updateOrderNotes(id, notes) {
  setState((current) => ({
    ...current,
    orders: current.orders.map((order) =>
      order.id === id ? { ...order, notes } : order
    ),
  }));
}

export function deleteOrder(id) {
  setState((current) => ({
    ...current,
    orders: current.orders.filter((order) => order.id !== id),
  }));
}

// ── actions: reservations ──────────────────────────────────────────────────

/** Records a booking request from the public reservation form. */
export function addReservation(draft) {
  const seq = state.reservationSeq;
  const reservation = {
    id: `RES-${seq}`,
    status: "pending",
    createdAt: new Date().toISOString(),
    message: "",
    ...draft,
  };

  setState((current) => ({
    ...current,
    reservations: [reservation, ...current.reservations],
    reservationSeq: seq + 1,
  }));

  return reservation;
}

export function updateReservationStatus(id, status) {
  setState((current) => ({
    ...current,
    reservations: current.reservations.map((reservation) =>
      reservation.id === id ? { ...reservation, status } : reservation
    ),
  }));
}

export function deleteReservation(id) {
  setState((current) => ({
    ...current,
    reservations: current.reservations.filter(
      (reservation) => reservation.id !== id
    ),
  }));
}

// ── actions: menu & settings ───────────────────────────────────────────────

export function updateMenuItem(id, patch) {
  setState((current) => ({
    ...current,
    menu: current.menu.map((item) =>
      item.id === id ? { ...item, ...patch } : item
    ),
  }));
}

/** Rewrites one entry in a dish's `sizes` array, keeping the rest intact. */
export function updateMenuItemSize(id, sizeLabel, price) {
  setState((current) => ({
    ...current,
    menu: current.menu.map((item) =>
      item.id === id
        ? {
            ...item,
            sizes: item.sizes.map((size) =>
              size.label === sizeLabel ? { ...size, price } : size
            ),
          }
        : item
    ),
  }));
}

/** Flips availability for many dishes at once — used by the category bulk actions. */
export function setMenuAvailability(ids, available) {
  const target = new Set(ids);

  setState((current) => ({
    ...current,
    menu: current.menu.map((item) =>
      target.has(item.id) ? { ...item, available } : item
    ),
  }));
}

export function toggleMenuItemAvailability(id) {
  setState((current) => ({
    ...current,
    menu: current.menu.map((item) =>
      item.id === id ? { ...item, available: item.available === false } : item
    ),
  }));
}

/** Turns a dish name into a url-safe id: "Zaify's Biryani" → "zaifys-biryani". */
function slugify(value) {
  return (
    String(value)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "dish"
  );
}

/** Guarantees a new dish never collides with an existing id. */
function uniqueMenuId(menu, base) {
  let id = base;
  let suffix = 2;
  while (menu.some((item) => item.id === id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

/** Creates a dish from the "Add new item" form. Returns the stored item. */
export function addMenuItem(draft) {
  const item = {
    id: uniqueMenuId(state.menu, draft.id || slugify(draft.name)),
    name: draft.name.trim(),
    category: draft.category.trim(),
    description: draft.description?.trim() ?? "",
    image: draft.image?.trim() ?? "",
    sizes: draft.sizes?.length ? draft.sizes : [{ label: "Regular", price: 0 }],
    tags: draft.tags ?? [],
    spice: draft.spice ?? null,
    prepTime: Number(draft.prepTime) || 20,
    available: draft.available !== false,
    rating: Number(draft.rating) || 0,
    reviewCount: Number(draft.reviewCount) || 0,
    badge: draft.badge ?? null,
  };

  setState((current) => ({ ...current, menu: [...current.menu, item] }));
  return item;
}

/** Copies a dish so a near-identical variant can be created quickly. */
export function duplicateMenuItem(id) {
  const source = state.menu.find((item) => item.id === id);
  if (!source) return null;

  // Drop the id so the copy gets its own slug from the new name.
  return addMenuItem({ ...source, id: undefined, name: `${source.name} (copy)` });
}

export function deleteMenuItem(id) {
  setState((current) => ({
    ...current,
    menu: current.menu.filter((item) => item.id !== id),
  }));
}

/** Categories present in the menu, for the create/edit form's datalist. */
export function useMenuCategories() {
  const menu = useAdminMenu();
  return [...new Set(menu.map((item) => item.category))].sort();
}

export function updateSettings(patch) {
  setState((current) => ({
    ...current,
    settings: { ...current.settings, ...patch },
  }));
}

/** Throws away every change and rebuilds from the seed. */
export function resetDemoData() {
  setState((current) => ({
    ...createInitialState(),
    session: current.session,
  }));
}

// ── actions: session (demo gate only — see LoginScreen) ────────────────────

export function signIn(passcode) {
  if (passcode !== DEMO_PASSCODE) return false;

  const session = { signedInAt: new Date().toISOString(), name: "Manager" };
  persistSession(session);
  setState((current) => ({ ...current, session }));
  return true;
}

export function signOut() {
  persistSession(null);
  setState((current) => ({ ...current, session: null }));
}

export function useAdminSession() {
  return useAdminStore().session;
}
