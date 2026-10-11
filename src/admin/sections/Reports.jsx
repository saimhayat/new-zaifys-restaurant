import { useMemo, useState } from "react";
import {
  Banknote,
  CalendarCheck,
  Clock,
  Download,
  PackageX,
  ShoppingBag,
  TrendingUp,
  Truck,
} from "lucide-react";
import {
  REPORT_PERIODS,
  deriveOrderTrend,
  deriveReport,
  useAdminStore,
} from "../../store/restaurantStore";
import { EmptyState, FilterTabs, PageHeader, RevenueChart, StatCard } from "../ui";
import { downloadCsv, formatRs, toCsv } from "../format";

/**
 * Horizontal bar list used for every breakdown on this page.
 *
 * A ranked bar is used instead of a pie or donut because it stays legible at
 * 320px wide, prints cleanly, and needs no chart dependency. Each row carries
 * its rank and its share of the period total, so the list reads like a proper
 * report rather than a set of unanchored bars.
 */
function BarList({ rows, format, emptyMessage }) {
  if (rows.length === 0) {
    return <p className="admin-barlist__empty">{emptyMessage}</p>;
  }

  const peak = Math.max(...rows.map((row) => row.value), 1);
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <div className="admin-barlist">
      {rows.map((row, index) => (
        <div key={row.label} className="admin-barlist__row">
          {rows.length > 1 && (
            <span className="admin-barlist__rank" aria-hidden="true">
              {index + 1}
            </span>
          )}
          <div className="admin-barlist__main">
            <div className="admin-barlist__top">
              <span className="admin-barlist__label">{row.label}</span>
              <span className="admin-barlist__value">
                {format(row)}
                {total > 0 && row.value > 0 && (
                  <span className="admin-barlist__share">
                    {Math.round((row.value / total) * 100)}%
                  </span>
                )}
              </span>
            </div>
            <div className="admin-barlist__track">
              <div
                className="admin-barlist__fill"
                style={{ width: `${Math.max((row.value / peak) * 100, 2)}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Reports() {
  const state = useAdminStore();
  const [period, setPeriod] = useState("7d");

  const report = useMemo(
    () => deriveReport(state, period),
    [state, period]
  );

  // "Today" on its own makes a one-bar chart, so the trend always looks back
  // at least a week — it is context, not the period itself.
  const trendDays = period === "30d" ? 30 : period === "all" ? 14 : 7;
  const trend = useMemo(
    () => deriveOrderTrend(state.orders, trendDays),
    [state.orders, trendDays]
  );

  const exportSummary = () => {
    const resByDate = new Map();
    state.reservations.forEach((reservation) => {
      if (reservation.status === "cancelled") return;
      const entry = resByDate.get(reservation.date) ?? { bookings: 0, covers: 0 };
      entry.bookings += 1;
      entry.covers += reservation.guests;
      resByDate.set(reservation.date, entry);
    });

    const ordersByDate = new Map();
    state.orders.forEach((order) => {
      if (order.status === "cancelled") return;
      const date = order.placedAt.split("T")[0];
      const entry = ordersByDate.get(date) ?? {
        orders: 0,
        revenue: 0,
        items: 0,
      };
      entry.orders += 1;
      entry.revenue += order.total;
      entry.items += order.items.reduce((sum, item) => sum + item.quantity, 0);
      ordersByDate.set(date, entry);
    });

    const dates = [...new Set([...ordersByDate.keys(), ...resByDate.keys()])].sort();

    const csv = toCsv(dates, [
      { label: "Date", value: (date) => date },
      { label: "Orders", value: (date) => ordersByDate.get(date)?.orders ?? 0 },
      { label: "Revenue", value: (date) => ordersByDate.get(date)?.revenue ?? 0 },
      { label: "Items sold", value: (date) => ordersByDate.get(date)?.items ?? 0 },
      { label: "Reservations", value: (date) => resByDate.get(date)?.bookings ?? 0 },
      { label: "Covers", value: (date) => resByDate.get(date)?.covers ?? 0 },
    ]);

    downloadCsv(`zaifys-daily-summary-${new Date().toISOString().split("T")[0]}.csv`, csv);
  };

  const periodLabel =
    REPORT_PERIODS.find((entry) => entry.id === period)?.label ?? "Period";

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle={`${periodLabel} · ${report.billableCount} completed ${
          report.billableCount === 1 ? "order" : "orders"
        } · ${report.itemsSold} items sold`}
      >
        <button type="button" className="admin-btn" onClick={exportSummary}>
          <Download size={15} strokeWidth={2} />
          Export daily summary
        </button>
      </PageHeader>

      <FilterTabs
        options={REPORT_PERIODS.map((entry) => ({ id: entry.id, label: entry.label }))}
        value={period}
        onChange={setPeriod}
      />

      <div className="admin-grid admin-grid--stats" style={{ marginTop: "1.25rem" }}>
        <StatCard
          label="Revenue"
          value={formatRs(report.revenue)}
          hint={`Excludes ${report.cancelled} cancelled`}
          icon={Banknote}
          tone="ok"
        />
        <StatCard
          label="Orders"
          value={report.orderCount}
          hint={`${report.billableCount} completed`}
          icon={ShoppingBag}
          tone="warn"
        />
        <StatCard
          label="Average order"
          value={formatRs(report.averageOrderValue)}
          hint={`${report.itemsSold} items sold`}
          icon={TrendingUp}
        />
        <StatCard
          label="Cancellation rate"
          value={`${report.cancelRate}%`}
          hint={`${report.cancelled} of ${report.orderCount} orders`}
          icon={PackageX}
          tone={report.cancelRate > 10 ? "danger" : "default"}
        />
      </div>

      <div className="admin-grid admin-grid--split" style={{ marginBottom: "1.5rem" }}>
        <section className="admin-card">
          <div className="admin-card__head" style={{ padding: "0 0 1.1rem", border: "none" }}>
            <div>
              <h2>Revenue by category</h2>
              <p>Where the money actually comes from</p>
            </div>
          </div>

          <BarList
            rows={report.byCategory.map((entry) => ({
              label: entry.label,
              value: entry.revenue,
              quantity: entry.quantity,
            }))}
            format={(row) => `${formatRs(row.value)} · ${row.quantity} sold`}
            emptyMessage="No completed orders in this period."
          />
        </section>

        <section className="admin-card">
          <div className="admin-card__head" style={{ padding: "0 0 1.1rem", border: "none" }}>
            <div>
              <h2>Payment mix</h2>
              <p>How customers are paying</p>
            </div>
          </div>

          <BarList
            rows={report.byPayment.map((entry) => ({
              label: entry.label,
              value: entry.revenue,
              orders: entry.orders,
            }))}
            format={(row) => `${formatRs(row.value)} · ${row.orders} orders`}
            emptyMessage="No completed orders in this period."
          />

          <div className="admin-detail-row" style={{ marginTop: "1rem" }}>
            <span>Delivery fees collected</span>
            <span>{formatRs(report.deliveryRevenue)}</span>
          </div>
        </section>
      </div>

      <div className="admin-grid admin-grid--split" style={{ marginBottom: "1.5rem" }}>
        <section className="admin-card">
          <div className="admin-card__head" style={{ padding: "0 0 1.1rem", border: "none" }}>
            <div>
              <h2>Busiest hours</h2>
              <p>When the kitchen should be staffed</p>
            </div>
            <Clock size={16} strokeWidth={2} aria-hidden="true" />
          </div>

          {report.peakHours.length === 0 ? (
            <EmptyState
              title="No order times yet"
              message="Hourly demand appears once orders come in."
            />
          ) : (
            <BarList
              rows={report.peakHours.map((entry) => ({
                label: formatHour(entry.hour),
                value: entry.orders,
                revenue: entry.revenue,
              }))}
              format={(row) => `${row.value} orders · ${formatRs(row.revenue)}`}
              emptyMessage="No order times yet."
            />
          )}
        </section>

        <section className="admin-card">
          <div className="admin-card__head" style={{ padding: "0 0 1.1rem", border: "none" }}>
            <div>
              <h2>Best sellers</h2>
              <p>By quantity sold in this period</p>
            </div>
          </div>

          {report.topDishes.length === 0 ? (
            <EmptyState
              title="Nothing sold"
              message="Dish rankings appear once orders come in."
            />
          ) : (
            <div>
              {report.topDishes.map((dish) => (
                <div key={dish.id} className="admin-dish-row">
                  <span className="admin-dish-row__name">{dish.name}</span>
                  <span className="admin-dish-row__stats">
                    {dish.quantity} sold · {formatRs(dish.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-card__head" style={{ padding: "0 0 1.1rem", border: "none" }}>
          <div>
            <h2>Revenue, last {trendDays} days</h2>
            <p>Daily takings — hover or hold a bar for detail</p>
          </div>
          <span className="admin-row__amount">{formatRs(report.revenue)} in period</span>
        </div>

        <RevenueChart days={trend} label={`Revenue, last ${trendDays} days`} />
      </section>

      <section className="admin-card">
        <div className="admin-card__head" style={{ padding: "0 0 1.1rem", border: "none" }}>
          <div>
            <h2>Reservations</h2>
            <p>Bookings dated within this period</p>
          </div>
          <CalendarCheck size={16} strokeWidth={2} aria-hidden="true" />
        </div>

        <div className="admin-grid admin-grid--stats" style={{ marginBottom: "1.25rem" }}>
          <StatCard label="Bookings" value={report.reservations.count} tone="info" />
          <StatCard label="Covers" value={report.reservations.covers} />
          <StatCard
            label="Still pending"
            value={report.reservations.pending}
            tone={report.reservations.pending > 0 ? "warn" : "default"}
          />
          <StatCard label="Cancelled" value={report.reservations.cancelled} />
        </div>

        {report.reservations.busiestSlots.length === 0 ? (
          <EmptyState
            title="No bookings in this window"
            message="Pick a wider period to see the busiest seating times."
          />
        ) : (
          <div>
            <h3 className="admin-block__title">Busiest seating times</h3>
            {report.reservations.busiestSlots.map((slot) => (
              <div key={slot.label} className="admin-dish-row">
                <span className="admin-dish-row__name">{slot.label}</span>
                <span className="admin-dish-row__stats">
                  {slot.covers} covers · {slot.bookings} booking
                  {slot.bookings === 1 ? "" : "s"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="admin-banner" style={{ marginTop: "1.5rem" }}>
        <Truck size={17} strokeWidth={2} />
        <div>
          Every figure here is calculated from the orders stored in this browser.
          Once a backend is connected the same numbers will cover every device —
          nothing on this page needs rebuilding.
        </div>
      </div>

    </>
  );
}

/** 13 → "1 PM", 0 → "12 AM". */
function formatHour(hour) {
  const suffix = hour < 12 ? "AM" : "PM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display} ${suffix}`;
}

export default Reports;
