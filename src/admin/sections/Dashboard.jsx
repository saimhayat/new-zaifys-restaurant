import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Banknote,
  CalendarCheck,
  ClipboardList,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import {
  ORDER_STATUSES,
  OPEN_ORDER_STATUSES,
  deriveDashboardStats,
  deriveOrderTrend,
  deriveTopDishes,
  useAdminStore,
} from "../../store/restaurantStore";
import { EmptyState, PageHeader, RevenueChart, StatCard, StatusPill } from "../ui";
import { formatRelative, formatRs } from "../format";

function Dashboard() {
  const state = useAdminStore();
  const stats = deriveDashboardStats(state);
  const trend = deriveOrderTrend(state.orders, 7);
  const topDishes = deriveTopDishes(state.orders, 5);

  const openOrders = state.orders.filter((order) =>
    OPEN_ORDER_STATUSES.includes(order.status)
  );
  const pendingReservations = state.reservations.filter(
    (reservation) => reservation.status === "pending"
  );

  const recentOrders = state.orders.slice(0, 6);

  return (
    <>
      <PageHeader
        title={`Good ${partOfDay()}, Manager`}
        subtitle="Here is what is happening at the restaurant right now."
      />

      {/* Honest about the current limitation, rather than pretending. */}
      <div className="admin-banner">
        <AlertTriangle size={17} strokeWidth={2} />
        <div>
          <strong>Frontend only — data lives in this browser.</strong> Orders and
          reservations are saved to local storage, so the panel only sees what was
          placed on this device. Connecting a backend is what makes them appear
          for everyone.
        </div>
      </div>

      <div className="admin-grid admin-grid--stats">
        <StatCard
          label="Orders today"
          value={stats.ordersToday}
          hint={`${stats.openOrders} still open`}
          icon={ShoppingBag}
          tone="warn"
        />
        <StatCard
          label="Revenue today"
          value={formatRs(stats.revenueToday)}
          hint="Cancelled orders excluded"
          icon={Banknote}
          tone="ok"
        />
        <StatCard
          label="Reservations today"
          value={stats.reservationsToday}
          hint={`${stats.guestsToday} guests expected`}
          icon={CalendarCheck}
          tone="info"
        />
        <StatCard
          label="Average order"
          value={formatRs(stats.averageOrderValue)}
          hint={`Across ${stats.totalOrders} orders`}
          icon={TrendingUp}
        />
      </div>

      {(openOrders.length > 0 || pendingReservations.length > 0) && (
        <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
          <div className="admin-card__head">
            <div>
              <h2>Needs attention</h2>
              <p>Waiting on someone to act</p>
            </div>
          </div>
          <div className="admin-card__body" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {openOrders.length > 0 && (
              <Link to="/admin/orders" className="admin-btn admin-btn--primary">
                <ClipboardList size={16} strokeWidth={2} />
                {openOrders.length} open {openOrders.length === 1 ? "order" : "orders"}
              </Link>
            )}
            {pendingReservations.length > 0 && (
              <Link to="/admin/reservations" className="admin-btn">
                <CalendarCheck size={16} strokeWidth={2} />
                {pendingReservations.length} to confirm
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="admin-grid admin-grid--split" style={{ marginBottom: "1.5rem" }}>
        <section className="admin-card admin-card--flush">
          <div className="admin-card__head">
            <div>
              <h2>Recent orders</h2>
              <p>Latest activity across the site</p>
            </div>
            <Link to="/admin/orders" className="admin-btn admin-btn--ghost">
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              message="Orders placed on the website will appear here straight away."
            />
          ) : (
            <div className="admin-rows">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/admin/orders?order=${order.id}`}
                  className="admin-row admin-row--orders"
                >
                  <span className="admin-row__primary">
                    <span>
                      <strong className="admin-row__title">{order.customer.name}</strong>
                      <span className="admin-row__meta">
                        {order.id} · {order.items.length} item
                        {order.items.length === 1 ? "" : "s"} · {formatRelative(order.placedAt)}
                      </span>
                    </span>
                  </span>
                  <span className="admin-row__cell admin-row__amount">
                    {formatRs(order.total)}
                  </span>
                  <span className="admin-row__end">
                    <StatusPill status={order.status} statuses={ORDER_STATUSES} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="admin-card">
          <div className="admin-card__head" style={{ padding: "0 0 1rem", border: "none" }}>
            <div>
              <h2>Best sellers</h2>
              <p>By quantity sold</p>
            </div>
          </div>

          {topDishes.length === 0 ? (
            <EmptyState title="Nothing sold yet" message="Dish rankings appear once orders come in." />
          ) : (
            <div>
              {topDishes.map((dish, index) => (
                <div key={dish.id} className="admin-dish-row">
                  <span className="admin-dish-row__rank">{index + 1}</span>
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

      <section className="admin-card">
        <div className="admin-card__head" style={{ padding: "0 0 1rem", border: "none" }}>
          <div>
            <h2>Revenue, last 7 days</h2>
            <p>Daily takings — hover or hold a bar for detail</p>
          </div>
          <span className="admin-row__amount">{formatRs(stats.lifetimeRevenue)} lifetime</span>
        </div>

        <RevenueChart days={trend} label="Revenue, last 7 days" />
      </section>
    </>
  );
}

function partOfDay(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export default Dashboard;
