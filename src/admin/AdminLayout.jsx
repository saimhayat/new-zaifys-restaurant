import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  Bell,
  BellOff,
  CalendarCheck,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  UtensilsCrossed,
  Users,
  X,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle";
import {
  useAdminStore,
  useRestaurantInfo,
  signOut,
  OPEN_ORDER_STATUSES,
} from "../store/restaurantStore";
import { formatRs } from "./format";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

const ALERTS_KEY = "zaify_admin_alerts";

/* Matches the breakpoint where `admin.css` swaps the sidebar from a static
   column to an off-canvas drawer. */
const DRAWER_QUERY = "(max-width: 1024px)";

function readAlertsEnabled() {
  if (typeof localStorage === "undefined") return true;
  return localStorage.getItem(ALERTS_KEY) !== "off";
}

/**
 * Two rising notes, so a new order is noticed from across the kitchen.
 * Browsers only allow audio after a user gesture, so a blocked context is
 * swallowed — the toast still arrives.
 */
function playChime() {
  try {
    const Ctx = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctx) return;

    const context = new Ctx();
    const start = context.currentTime;

    [880, 1174.66].forEach((frequency, index) => {
      const at = start + index * 0.16;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.16, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.3);

      oscillator.connect(gain).connect(context.destination);
      oscillator.start(at);
      oscillator.stop(at + 0.32);
    });

    setTimeout(() => context.close(), 900);
  } catch {
    /* audio is a bonus, never a failure */
  }
}

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/admin/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/admin/orders", label: "Orders", icon: ClipboardList, badge: "openOrders" },
      {
        to: "/admin/reservations",
        label: "Reservations",
        icon: CalendarCheck,
        badge: "pendingReservations",
      },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
      { to: "/admin/customers", label: "Customers", icon: Users },
      { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
];

function AdminLayout() {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const settings = useRestaurantInfo();
  const state = useAdminStore();

  const [alertsOn, setAlertsOn] = useState(readAlertsEnabled);
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  // True while the sidebar is an off-canvas drawer rather than a static column.
  const [drawerNav, setDrawerNav] = useState(
    () => typeof window !== "undefined" && window.matchMedia(DRAWER_QUERY).matches
  );

  useEffect(() => {
    const query = window.matchMedia(DRAWER_QUERY);
    const sync = (event) => setDrawerNav(event.matches);
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Rotating a phone or widening a window promotes the sidebar back to a
  // static column — the drawer state has to go with it.
  useEffect(() => {
    if (!drawerNav) setNavOpen(false);
  }, [drawerNav]);

  // The open drawer is a modal surface, so the page behind it must not scroll.
  useBodyScrollLock(navOpen && drawerNav);

  // Escape closes it, exactly like the detail panel.
  useEffect(() => {
    if (!navOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navOpen]);

  // Seeded from whatever already exists, so opening the panel never fires an
  // alert for orders that were placed before now.
  const seen = useRef(null);
  if (seen.current === null) {
    seen.current = {
      orders: new Set(state.orders.map((order) => order.id)),
      reservations: new Set(state.reservations.map((entry) => entry.id)),
    };
  }

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const pushToast = useCallback(
    (toast) => {
      const id = `${toast.title}-${Date.now()}`;
      setToasts((current) => [...current.slice(-2), { ...toast, id }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), 12000)
      );
      if (alertsOn) playChime();
    },
    [alertsOn, dismiss]
  );

  // The store mirrors itself across tabs, so an order placed in the customer
  // tab shows up here the moment it lands.
  useEffect(() => {
    const known = seen.current;
    const freshOrders = state.orders.filter((order) => !known.orders.has(order.id));
    const freshReservations = state.reservations.filter(
      (entry) => !known.reservations.has(entry.id)
    );

    state.orders.forEach((order) => known.orders.add(order.id));
    state.reservations.forEach((entry) => known.reservations.add(entry.id));

    // A reset swaps the entire dataset in one go — that is not live activity.
    if (freshOrders.length === 1 && freshReservations.length === 0) {
      const order = freshOrders[0];
      pushToast({
        title: "New order",
        body: `${order.id} · ${order.customer.name} · ${formatRs(order.total)}`,
        to: `/admin/orders?order=${order.id}`,
      });
    }

    if (freshReservations.length === 1 && freshOrders.length === 0) {
      const reservation = freshReservations[0];
      pushToast({
        title: "New reservation",
        body: `${reservation.name} · ${reservation.guests} guests · ${reservation.date} ${reservation.time}`,
        to: `/admin/reservations`,
      });
    }
  }, [state.orders, state.reservations, pushToast]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const toggleAlerts = () => {
    setAlertsOn((current) => {
      const next = !current;
      try {
        localStorage.setItem(ALERTS_KEY, next ? "on" : "off");
      } catch {
        /* storage blocked — the toggle still works for this session */
      }
      if (next) playChime();
      return next;
    });
  };

  const openOrders = state.orders.filter((order) =>
    OPEN_ORDER_STATUSES.includes(order.status)
  ).length;
  const pendingReservations = state.reservations.filter(
    (reservation) => reservation.status === "pending"
  ).length;
  const badges = { openOrders, pendingReservations };

  const activeItem = NAV_GROUPS.flatMap((group) => group.items).find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );

  // Close the mobile nav whenever the route changes.
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.title = `${activeItem?.label ?? "Admin"} · ${settings.name} Admin`;
  }, [activeItem, settings.name]);

  return (
    <div className={`admin ${navOpen ? "admin--nav-open" : ""}`}>
      <div className="admin__shell">
        <aside className="admin-sidebar" id="admin-nav">
          <div className="admin-brand">
            <span className="admin-brand__mark">Z</span>
            <div className="admin-brand__text">
              <strong>{settings.name}</strong>
              <span>Admin Panel</span>
            </div>
            <button
              type="button"
              className="admin-sidebar__close"
              onClick={() => setNavOpen(false)}
              aria-label="Close navigation"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          <nav className="admin-nav">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <span className="admin-nav__group-label">{group.label}</span>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const count = item.badge ? badges[item.badge] : 0;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `admin-nav__item ${isActive ? "admin-nav__item--active" : ""}`
                      }
                    >
                      <Icon size={17} strokeWidth={2} aria-hidden="true" />
                      {item.label}
                      {count > 0 && <span className="admin-nav__count">{count}</span>}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="admin-sidebar__foot">
            <Link to="/" className="admin-btn admin-btn--ghost">
              <ExternalLink size={15} strokeWidth={2} />
              View website
            </Link>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={signOut}>
              <LogOut size={15} strokeWidth={2} />
              Sign out
            </button>
          </div>
        </aside>

        {navOpen && (
          <button
            type="button"
            className="admin-nav-scrim"
            aria-label="Close navigation"
            onClick={() => setNavOpen(false)}
          />
        )}

        <div className="admin__main">
          <header className="admin-topbar">
            <button
              type="button"
              className="admin-hamburger"
              aria-label="Open navigation"
              aria-expanded={navOpen}
              aria-controls="admin-nav"
              onClick={() => setNavOpen(true)}
            >
              <MenuIcon size={19} strokeWidth={2} />
            </button>

            <h2 className="admin-topbar__title">{activeItem?.label ?? "Admin"}</h2>
            <span className="admin-topbar__spacer" />

            <button
              type="button"
              className="admin-alert-toggle"
              onClick={toggleAlerts}
              aria-pressed={alertsOn}
              title={
                alertsOn
                  ? "New-order alerts are on"
                  : "New-order alerts are muted"
              }
            >
              {alertsOn ? (
                <Bell size={16} strokeWidth={2} />
              ) : (
                <BellOff size={16} strokeWidth={2} />
              )}
              <span>{alertsOn ? "Alerts on" : "Muted"}</span>
            </button>

            <ThemeToggle />
          </header>

          <div className="admin-content">
            <Outlet />
          </div>
        </div>
      </div>

      <div className="admin-toasts" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="admin-toast">
            <span className="admin-toast__icon">
              <Bell size={16} strokeWidth={2} aria-hidden="true" />
            </span>
            <div className="admin-toast__body">
              <strong>{toast.title}</strong>
              <span>{toast.body}</span>
            </div>
            <Link
              to={toast.to}
              className="admin-btn admin-btn--primary admin-toast__action"
              onClick={() => dismiss(toast.id)}
            >
              Open
            </Link>
            <button
              type="button"
              className="admin-toast__close"
              aria-label="Dismiss alert"
              onClick={() => dismiss(toast.id)}
            >
              <X size={15} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminLayout;
