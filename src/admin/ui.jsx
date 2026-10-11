import { useEffect, useRef, useState } from "react";
import { Inbox, Search, X } from "lucide-react";
import { formatRs, formatRsCompact } from "./format";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

/**
 * Small presentational primitives shared by every admin section.
 * Styling lives in `admin.css` so the panel stays theme-aware in one place.
 */

export function StatCard({ label, value, hint, icon: Icon, tone = "default" }) {
  return (
    <div className={`admin-stat admin-stat--${tone}`}>
      <div className="admin-stat__top">
        <span className="admin-stat__label">{label}</span>
        {Icon && <Icon size={16} strokeWidth={2} aria-hidden="true" />}
      </div>
      <strong className="admin-stat__value">{value}</strong>
      {hint && <span className="admin-stat__hint">{hint}</span>}
    </div>
  );
}

export function Pill({ children, tone = "neutral" }) {
  return <span className={`admin-pill admin-pill--${tone}`}>{children}</span>;
}

/** Renders a status id as a human label, looked up from the status table. */
export function StatusPill({ status, statuses }) {
  const entry = statuses.find((item) => item.id === status);
  return <Pill tone={entry?.tone ?? "neutral"}>{entry?.label ?? status}</Pill>;
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <header className="admin-page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="admin-page-head__actions">{children}</div>}
    </header>
  );
}

export function SearchField({ value, onChange, placeholder = "Search…", label }) {
  return (
    <label className="admin-search">
      <span className="admin-visually-hidden">{label ?? placeholder}</span>
      <Search size={16} strokeWidth={2} aria-hidden="true" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button type="button" onClick={() => onChange("")} aria-label="Clear search">
          <X size={14} strokeWidth={2.25} />
        </button>
      )}
    </label>
  );
}

/** Horizontal filter chips, optionally showing a count per option. */
export function FilterTabs({ options, value, onChange, counts }) {
  const listRef = useRef(null);
  const [overflowing, setOverflowing] = useState(false);

  // The edge fade that hints "there are more chips" must only appear when the
  // row genuinely overflows — measuring is the only way to know, so it is
  // re-checked after every render (chip counts change the width) and on resize.
  useEffect(() => {
    const node = listRef.current;
    if (!node) return undefined;

    const measure = () =>
      setOverflowing(node.scrollWidth - node.clientWidth > 2);

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  });

  return (
    <div
      ref={listRef}
      className={`admin-tabs ${overflowing ? "admin-tabs--scrollable" : ""}`}
      role="tablist"
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={value === option.id}
          className={`admin-tab ${value === option.id ? "admin-tab--active" : ""}`}
          onClick={() => onChange(option.id)}
        >
          {option.label}
          {counts?.[option.id] > 0 && (
            <span className="admin-tab__count">{counts[option.id]}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ title, message, action, icon: Icon = Inbox }) {
  return (
    <div className="admin-empty">
      <Icon size={30} strokeWidth={1.6} aria-hidden="true" />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

/**
 * Right-hand detail panel. Locks background scrolling and closes on Escape, so
 * it behaves the same way the public order modal does.
 */
export function Drawer({ open, title, subtitle, onClose, children, footer }) {
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="admin-drawer-overlay" onClick={onClose}>
      <aside
        className="admin-drawer"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="admin-drawer__head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            type="button"
            className="admin-icon-btn"
            onClick={onClose}
            aria-label="Close panel"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <div className="admin-drawer__body">{children}</div>

        {footer && <footer className="admin-drawer__foot">{footer}</footer>}
      </aside>
    </div>
  );
}

/**
 * Two-step destructive action: the first click arms it, the second commits.
 * Deleting an order, booking or dish cannot be undone, so it should never
 * happen from a single stray tap. Disarms itself after a few seconds.
 */
export function ConfirmButton({
  onConfirm,
  label,
  confirmLabel,
  className = "admin-btn admin-btn--danger",
  icon: Icon,
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return undefined;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed]);

  return (
    <button
      type="button"
      className={`${className} ${armed ? "admin-btn--armed" : ""}`}
      onClick={() => {
        if (armed) {
          onConfirm();
          setArmed(false);
        } else {
          setArmed(true);
        }
      }}
    >
      {Icon && <Icon size={15} strokeWidth={2} />}
      {armed ? confirmLabel : label}
    </button>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="admin-field">
      <span className="admin-field__label">{label}</span>
      {children}
      {hint && <span className="admin-field__hint">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`admin-toggle ${checked ? "admin-toggle--on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="admin-toggle__knob" />
    </button>
  );
}

/** Definition row used inside drawers and summary cards. */
export function DetailRow({ label, value, strong }) {
  return (
    <div className={`admin-detail-row ${strong ? "admin-detail-row--strong" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/**
 * Rounds a value up to the nearest "nice" axis maximum (1 / 2 / 2.5 / 5 × 10ⁿ),
 * so gridline labels read as round amounts rather than raw data peaks.
 */
function niceAxisMax(value) {
  if (value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const base = 10 ** exponent;
  const units = value / base;
  const nice = units <= 1 ? 1 : units <= 2 ? 2 : units <= 2.5 ? 2.5 : units <= 5 ? 5 : 10;
  return nice * base;
}

/**
 * Daily revenue column chart.
 *
 * Hand-rolled rather than a chart library on purpose: the panel has no chart
 * dependency, this stays theme-aware through the shared CSS variables, and it
 * scrolls horizontally on phones instead of squeezing thirty bars into
 * unreadable slivers.
 *
 * `days` is the `deriveOrderTrend` shape: `{ label, date, orders, revenue }[]`.
 */
export function RevenueChart({ days, label = "Revenue" }) {
  const peakRevenue = Math.max(...days.map((day) => day.revenue), 0);
  const peakIndex = days.reduce(
    (best, day, index) => (day.revenue > days[best].revenue ? index : best),
    0
  );

  if (days.length === 0 || peakRevenue === 0) {
    return (
      <p className="admin-barlist__empty">
        No revenue recorded in this window yet — bars appear as completed orders
        come in.
      </p>
    );
  }

  const axisMax = niceAxisMax(peakRevenue);
  const dense = days.length > 10;
  const labelEvery = days.length > 20 ? 5 : days.length > 8 ? 2 : 1;
  const first = new Date(days[0].date);
  const last = new Date(days[days.length - 1].date);
  const summary = `${label} from ${first.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })} to ${last.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })}. Best day ${days[peakIndex].label} at ${formatRs(days[peakIndex].revenue)}.`;

  return (
    <div className="admin-chart" role="img" aria-label={summary}>
      <div className="admin-chart__axis" aria-hidden="true">
        <span style={{ "--tick": 1 }}>{formatRsCompact(axisMax)}</span>
        <span style={{ "--tick": 0.75 }}>{formatRsCompact(axisMax * 0.75)}</span>
        <span style={{ "--tick": 0.5 }}>{formatRsCompact(axisMax * 0.5)}</span>
        <span style={{ "--tick": 0.25 }}>{formatRsCompact(axisMax * 0.25)}</span>
      </div>

      <div className="admin-chart__scroller">
        <div
          className={`admin-chart__cols ${dense ? "admin-chart__cols--dense" : ""}`}
          style={{ "--cols": days.length }}
        >
          <div className="admin-chart__grid" aria-hidden="true">
            <span style={{ "--line": 1 }} />
            <span style={{ "--line": 0.75 }} />
            <span style={{ "--line": 0.5 }} />
            <span style={{ "--line": 0.25 }} />
          </div>

          {days.map((day, index) => {
            const isPeak = index === peakIndex;
            const isZero = day.revenue === 0;
            const showLabel = index % labelEvery === 0 || index === days.length - 1;

            return (
              <div
                key={day.date}
                className={`admin-chart__col ${isPeak ? "admin-chart__col--peak" : ""}`}
                title={`${day.label}: ${formatRs(day.revenue)} from ${day.orders} ${
                  day.orders === 1 ? "order" : "orders"
                }`}
              >
                <div className="admin-chart__colplot">
                  {isZero ? (
                    <div className="admin-chart__bar admin-chart__bar--zero" />
                  ) : (
                    <div
                      className="admin-chart__bar"
                      style={{
                        /* Scaled against the nice axis max, minus the
                           headroom that keeps value labels unclipped. */
                        height: `calc((100% - var(--chart-head, 20px)) * ${(
                          day.revenue / axisMax
                        ).toFixed(4)})`,
                      }}
                    >
                      <span className="admin-chart__value">
                        {formatRsCompact(day.revenue)}
                      </span>
                    </div>
                  )}
                </div>
                <span className="admin-chart__label">
                  {showLabel ? day.label.slice(0, 2) : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


