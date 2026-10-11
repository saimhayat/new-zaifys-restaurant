import ResponsiveImage from "../../components/ResponsiveImage";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Check,
  ChefHat,
  Download,
  MessageCircle,
  PackageCheck,
  Phone,
  Printer,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import {
  ORDER_STATUSES,
  deleteOrder,
  updateOrderNotes,
  updateOrderStatus,
  useAdminStore,
  useRestaurantInfo,
} from "../../store/restaurantStore";
import PrintTicket from "../PrintTicket";
import {
  ConfirmButton,
  DetailRow,
  Drawer,
  EmptyState,
  FilterTabs,
  PageHeader,
  SearchField,
  StatusPill,
} from "../ui";
import {
  downloadCsv,
  formatDateTime,
  formatRelative,
  formatRs,
  toCsv,
  toWhatsAppHref,
} from "../format";

/** Midnight today, used as the boundary for the date-range filters. */
function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

/** The natural next step in the kitchen's workflow, per status. */
const NEXT_STEP = {
  new: { status: "confirmed", label: "Confirm order", icon: Check },
  confirmed: { status: "preparing", label: "Start preparing", icon: ChefHat },
  preparing: {
    status: "out-for-delivery",
    label: "Send out for delivery",
    icon: Truck,
  },
  "out-for-delivery": {
    status: "delivered",
    label: "Mark as delivered",
    icon: PackageCheck,
  },
};

function Orders() {
  const state = useAdminStore();
  const restaurant = useRestaurantInfo();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("all");
  const [query, setQuery] = useState("");
  const [notesDraft, setNotesDraft] = useState(null);

  const orders = state.orders;

  // Opening one order is driven by the URL, so a link from the dashboard (or a
  // refresh) lands the operator straight back on that order.
  const openId = searchParams.get("order");
  const openOrder = openId ? orders.find((order) => order.id === openId) : null;

  const openOrderDrawer = (id) => {
    const next = new URLSearchParams(searchParams);
    next.set("order", id);
    setSearchParams(next, { replace: true });
  };

  const closeDrawer = () => {
    setNotesDraft(null);
    const next = new URLSearchParams(searchParams);
    next.delete("order");
    setSearchParams(next, { replace: true });
  };

  const counts = useMemo(() => {
    const tally = { all: orders.length };
    ORDER_STATUSES.forEach((entry) => {
      tally[entry.id] = orders.filter((order) => order.status === entry.id).length;
    });
    return tally;
  }, [orders]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const today = startOfToday();
    const weekStart = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

    return orders.filter((order) => {
      if (status !== "all" && order.status !== status) return false;

      const placed = new Date(order.placedAt);
      if (range === "today" && placed < today) return false;
      if (range === "week" && placed < weekStart) return false;

      if (!needle) return true;

      return (
        order.id.toLowerCase().includes(needle) ||
        order.customer.name.toLowerCase().includes(needle) ||
        order.customer.phone.replace(/\s/g, "").includes(needle.replace(/\s/g, ""))
      );
    });
  }, [orders, status, range, query]);

  const exportOrders = () => {
    const csv = toCsv(filtered, [
      { label: "Order", value: (order) => order.id },
      { label: "Placed at", value: (order) => order.placedAt },
      { label: "Customer", value: (order) => order.customer.name },
      { label: "Phone", value: (order) => order.customer.phone },
      { label: "Address", value: (order) => order.customer.address },
      { label: "City", value: (order) => order.customer.city },
      {
        label: "Items",
        value: (order) =>
          order.items
            .map(
              (item) =>
                `${item.quantity}x ${item.name} (${item.size}${
                  item.spice ? `, ${item.spice}` : ""
                })`
            )
            .join(" | "),
      },
      { label: "Subtotal", value: (order) => order.subtotal },
      { label: "Delivery", value: (order) => order.deliveryFee },
      { label: "Total", value: (order) => order.total },
      { label: "Payment", value: (order) => order.paymentMethod },
      {
        label: "Status",
        value: (order) =>
          ORDER_STATUSES.find((entry) => entry.id === order.status)?.label ??
          order.status,
      },
      { label: "Notes", value: (order) => order.notes },
    ]);

    downloadCsv(`zaifys-orders-${new Date().toISOString().split("T")[0]}.csv`, csv);
  };

  const filterOptions = [
    { id: "all", label: "All" },
    ...ORDER_STATUSES.map((entry) => ({ id: entry.id, label: entry.label })),
  ];

  const nextStep = openOrder ? NEXT_STEP[openOrder.status] : null;

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} total · ${counts.new ?? 0} awaiting confirmation`}
      >
        <button type="button" className="admin-btn" onClick={exportOrders}>
          <Download size={15} strokeWidth={2} />
          Export ({filtered.length})
        </button>
      </PageHeader>

      <div className="admin-toolbar">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search by order, name or phone…"
          label="Search orders"
        />
      </div>

      <FilterTabs
        options={filterOptions}
        value={status}
        onChange={setStatus}
        counts={counts}
      />

      <div style={{ marginTop: "0.75rem" }}>
        <FilterTabs
          options={[
            { id: "all", label: "All time" },
            { id: "today", label: "Today" },
            { id: "week", label: "Last 7 days" },
          ]}
          value={range}
          onChange={setRange}
        />
      </div>

      <div className="admin-card admin-card--flush" style={{ marginTop: "1.1rem" }}>
        {filtered.length === 0 ? (
          <EmptyState
            title="No orders match"
            message="Try a different status filter, or clear the search."
          />
        ) : (
          <div className="admin-rows">
            {filtered.map((order) => (
              <button
                key={order.id}
                type="button"
                className="admin-row admin-row--orders"
                onClick={() => openOrderDrawer(order.id)}
              >
                <span className="admin-row__primary">
                  <span>
                    <strong className="admin-row__title">
                      {order.customer.name}
                    </strong>
                    <span className="admin-row__meta">
                      {order.id} · {order.customer.phone}
                    </span>
                  </span>
                </span>

                <span className="admin-row__cell admin-row__cell--muted">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} item
                  {order.items.reduce((sum, item) => sum + item.quantity, 0) === 1
                    ? ""
                    : "s"}{" "}
                  · {formatRelative(order.placedAt)}
                </span>

                <span className="admin-row__cell admin-row__cell--total admin-row__amount">
                  {formatRs(order.total)}
                </span>

                <span className="admin-row__end">
                  <StatusPill status={order.status} statuses={ORDER_STATUSES} />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Drawer
        open={Boolean(openOrder)}
        title={openOrder ? openOrder.customer.name : ""}
        subtitle={
          openOrder
            ? `${openOrder.id} · placed ${formatDateTime(openOrder.placedAt)}`
            : ""
        }
        onClose={closeDrawer}
        footer={
          openOrder && (
            <>
              {nextStep && (
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  onClick={() => updateOrderStatus(openOrder.id, nextStep.status)}
                >
                  <nextStep.icon size={16} strokeWidth={2} />
                  {nextStep.label}
                </button>
              )}

              {!["delivered", "cancelled"].includes(openOrder.status) && (
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  onClick={() => updateOrderStatus(openOrder.id, "cancelled")}
                >
                  <X size={16} strokeWidth={2} />
                  Cancel
                </button>
              )}

              {/* Printing is the one action the kitchen needs on paper. The
                  ticket markup is already in the DOM, so this only has to
                  hand off to the browser's print dialog. */}
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={() => window.print()}
              >
                <Printer size={15} strokeWidth={2} />
                Print ticket
              </button>

              <ConfirmButton
                label="Delete"
                confirmLabel="Tap again to delete"
                icon={Trash2}
                className="admin-btn admin-btn--ghost"
                onConfirm={() => {
                  deleteOrder(openOrder.id);
                  closeDrawer();
                }}
              />
            </>
          )
        }
      >
        {openOrder && (
          <>
            <div className="admin-block">
              <h3 className="admin-block__title">Customer</h3>
              <DetailRow label="Name" value={openOrder.customer.name} />
              <DetailRow label="Phone" value={openOrder.customer.phone} />
              <DetailRow label="Address" value={openOrder.customer.address} />
              <DetailRow label="City" value={openOrder.customer.city} />

              <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.9rem", flexWrap: "wrap" }}>
                <a
                  className="admin-btn"
                  href={`tel:${openOrder.customer.phone.replace(/\s/g, "")}`}
                >
                  <Phone size={15} strokeWidth={2} />
                  Call
                </a>
                <a
                  className="admin-btn admin-btn--ok"
                  href={toWhatsAppHref(
                    openOrder.customer.phone,
                    `Hello ${openOrder.customer.name}, this is Zaify's Restaurant about your order ${openOrder.id}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={15} strokeWidth={2} />
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="admin-block">
              <h3 className="admin-block__title">
                Items ({openOrder.items.length})
              </h3>
              <div className="admin-line-items">
                {openOrder.items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="admin-line-item">
                    <ResponsiveImage src={item.image} alt="" loading="lazy" />
                    <div className="admin-line-item__info">
                      <strong>{item.name}</strong>
                      <span>
                        {item.size}
                        {item.spice ? ` · ${item.spice}` : ""} · ×{item.quantity}
                        {item.notes ? ` · ${item.notes}` : ""}
                      </span>
                    </div>
                    <span className="admin-line-item__price">
                      {formatRs(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-block">
              <h3 className="admin-block__title">Payment</h3>
              <DetailRow label="Method" value={openOrder.paymentMethod} />
              <DetailRow label="Subtotal" value={formatRs(openOrder.subtotal)} />
              <DetailRow
                label="Delivery"
                value={openOrder.deliveryFee === 0 ? "Free" : formatRs(openOrder.deliveryFee)}
              />
              <DetailRow label="Total" value={formatRs(openOrder.total)} strong />
            </div>

            <div className="admin-block">
              <h3 className="admin-block__title">Status</h3>
              <select
                className="admin-field"
                value={openOrder.status}
                onChange={(event) =>
                  updateOrderStatus(openOrder.id, event.target.value)
                }
                aria-label="Order status"
                style={{
                  minHeight: "44px",
                  width: "100%",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border-strong)",
                  background: "var(--color-card)",
                  color: "var(--color-text)",
                  padding: "0.6rem 0.85rem",
                  fontFamily: "inherit",
                  fontSize: "0.88rem",
                }}
              >
                {ORDER_STATUSES.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-block">
              <h3 className="admin-block__title">Kitchen notes</h3>
              <textarea
                className="admin-field"
                value={notesDraft ?? openOrder.notes}
                placeholder="Allergies, delivery instructions, anything the kitchen should know…"
                onChange={(event) => setNotesDraft(event.target.value)}
                style={{
                  width: "100%",
                  minHeight: "90px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border-strong)",
                  background: "var(--color-card)",
                  color: "var(--color-text)",
                  padding: "0.7rem 0.85rem",
                  fontFamily: "inherit",
                  fontSize: "0.88rem",
                  lineHeight: 1.6,
                }}
              />
              {notesDraft !== null && notesDraft !== openOrder.notes && (
                <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.7rem" }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary"
                    onClick={() => {
                      updateOrderNotes(openOrder.id, notesDraft);
                      setNotesDraft(null);
                    }}
                  >
                    Save note
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    onClick={() => setNotesDraft(null)}
                  >
                    Discard
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </Drawer>

      <PrintTicket order={openOrder} restaurant={restaurant} />
    </>
  );
}

export default Orders;
