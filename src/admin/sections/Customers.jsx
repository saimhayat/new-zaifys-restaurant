import { useMemo, useState } from "react";
import { MessageCircle, Phone, Star } from "lucide-react";
import {
  ORDER_STATUSES,
  deriveCustomers,
  useAdminStore,
} from "../../store/restaurantStore";
import {
  DetailRow,
  Drawer,
  EmptyState,
  PageHeader,
  Pill,
  SearchField,
  StatusPill,
} from "../ui";
import { formatRelative, formatRs, toWhatsAppHref } from "../format";

function Customers() {
  const state = useAdminStore();
  const [query, setQuery] = useState("");
  const [openPhone, setOpenPhone] = useState(null);

  const customers = useMemo(() => deriveCustomers(state.orders), [state.orders]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return customers;

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(needle) ||
        customer.phone.replace(/\s/g, "").includes(needle.replace(/\s/g, ""))
    );
  }, [customers, query]);

  const openCustomer = openPhone
    ? customers.find((customer) => customer.phone === openPhone)
    : null;

  const history = openCustomer
    ? state.orders.filter((order) => order.customer.phone === openCustomer.phone)
    : [];

  const repeatCount = customers.filter((customer) => customer.orders > 1).length;

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} people · ${repeatCount} have ordered more than once`}
      />

      <div className="admin-toolbar">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search by name or phone…"
          label="Search customers"
        />
      </div>

      <div className="admin-card admin-card--flush">
        {filtered.length === 0 ? (
          <EmptyState
            title="No customers yet"
            message="Customers are built automatically from the orders that come in."
          />
        ) : (
          <div className="admin-rows">
            {filtered.map((customer) => (
              <button
                key={customer.phone}
                type="button"
                className="admin-row admin-row--orders"
                onClick={() => setOpenPhone(customer.phone)}
              >
                <span className="admin-row__primary">
                  <span>
                    <strong className="admin-row__title">{customer.name}</strong>
                    <span className="admin-row__meta">{customer.phone}</span>
                  </span>
                </span>

                <span className="admin-row__cell admin-row__cell--muted">
                  {customer.orders} order{customer.orders === 1 ? "" : "s"} ·{" "}
                  {formatRelative(customer.lastOrderAt)}
                </span>

                <span className="admin-row__cell admin-row__cell--total admin-row__amount">
                  {formatRs(customer.spend)}
                </span>

                <span className="admin-row__end">
                  {customer.orders > 1 ? (
                    <Pill tone="ok">
                      <Star size={11} strokeWidth={2.5} />
                      Repeat
                    </Pill>
                  ) : (
                    <Pill>New</Pill>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Drawer
        open={Boolean(openCustomer)}
        title={openCustomer?.name ?? ""}
        subtitle={openCustomer?.phone ?? ""}
        onClose={() => setOpenPhone(null)}
      >
        {openCustomer && (
          <>
            <div className="admin-block">
              <h3 className="admin-block__title">Summary</h3>
              <DetailRow label="Orders placed" value={openCustomer.orders} />
              <DetailRow label="Lifetime value" value={formatRs(openCustomer.spend)} />
              <DetailRow
                label="Average order"
                value={formatRs(openCustomer.spend / openCustomer.orders)}
              />
              <DetailRow label="Last order" value={formatRelative(openCustomer.lastOrderAt)} />
              <DetailRow label="Address" value={openCustomer.lastAddress} />
              <DetailRow label="City" value={openCustomer.city} />

              <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.9rem", flexWrap: "wrap" }}>
                <a
                  className="admin-btn"
                  href={`tel:${openCustomer.phone.replace(/\s/g, "")}`}
                >
                  <Phone size={15} strokeWidth={2} />
                  Call
                </a>
                <a
                  className="admin-btn admin-btn--ok"
                  href={toWhatsAppHref(
                    openCustomer.phone,
                    `Hello ${openCustomer.name}, this is Zaify's Restaurant.`
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
              <h3 className="admin-block__title">Order history</h3>
              {history.map((order) => (
                <div
                  key={order.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                    padding: "0.6rem 0",
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  <span>
                    <strong style={{ display: "block", fontSize: "0.86rem", color: "var(--color-primary)" }}>
                      {order.id}
                    </strong>
                    <span style={{ fontSize: "0.76rem", color: "var(--color-text-muted)" }}>
                      {formatRelative(order.placedAt)} · {order.items.length} item
                      {order.items.length === 1 ? "" : "s"}
                    </span>
                  </span>
                  <span className="admin-row__amount">{formatRs(order.total)}</span>
                  <StatusPill status={order.status} statuses={ORDER_STATUSES} />
                </div>
              ))}
            </div>
          </>
        )}
      </Drawer>
    </>
  );
}

export default Customers;
