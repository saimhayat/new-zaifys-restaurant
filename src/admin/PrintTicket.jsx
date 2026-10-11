/**
 * Printable kitchen ticket.
 *
 * The markup is always rendered while an order drawer is open but hidden on
 * screen — `@media print` in admin.css hides the entire app and reveals only
 * this block. Printing from the same document avoids pop-up blockers and keeps
 * the design in one place.
 */
function PrintTicket({ order, restaurant }) {
  if (!order) return null;

  const placed = new Date(order.placedAt);

  return (
    <div className="admin-ticket" aria-hidden="true">
      <div className="admin-ticket__head">
        <div>
          <h1>{restaurant.name}</h1>
          <p>{restaurant.address}</p>
          <p>
            {restaurant.phone} · Kitchen ticket
          </p>
        </div>
        <div className="admin-ticket__id">
          <strong>{order.id}</strong>
          <span>{order.status.replace(/-/g, " ")}</span>
        </div>
      </div>

      <div className="admin-ticket__meta">
        <div>
          <span className="admin-ticket__label">Placed</span>
          {placed.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div>
          <span className="admin-ticket__label">Payment</span>
          {order.paymentMethod}
        </div>
        <div>
          <span className="admin-ticket__label">Customer</span>
          {order.customer.name} · {order.customer.phone}
        </div>
        <div className="admin-ticket__address">
          <span className="admin-ticket__label">Deliver to</span>
          {order.customer.address}, {order.customer.city}
        </div>
      </div>

      <table className="admin-ticket__table">
        <thead>
          <tr>
            <th>Qty</th>
            <th>Item</th>
            <th>Size</th>
            <th>Heat</th>
            <th className="admin-ticket__num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={`${item.id}-${index}`}>
              <td className="admin-ticket__qty">{item.quantity}</td>
              <td>
                {item.name}
                {item.notes && (
                  <em className="admin-ticket__note">{item.notes}</em>
                )}
              </td>
              <td>{item.size}</td>
              <td>{item.spice ?? "—"}</td>
              <td className="admin-ticket__num">
                {Number(item.totalPrice).toLocaleString("en-PK")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="admin-ticket__totals">
        <div>
          <span>Subtotal</span>
          <span>{Number(order.subtotal).toLocaleString("en-PK")}</span>
        </div>
        <div>
          <span>Delivery</span>
          <span>
            {order.deliveryFee === 0
              ? "Free"
              : Number(order.deliveryFee).toLocaleString("en-PK")}
          </span>
        </div>
        <div className="admin-ticket__grand">
          <span>Total (Rs.)</span>
          <span>{Number(order.total).toLocaleString("en-PK")}</span>
        </div>
      </div>

      {order.notes && (
        <div className="admin-ticket__notes">
          <span className="admin-ticket__label">Kitchen notes</span>
          {order.notes}
        </div>
      )}

      <p className="admin-ticket__foot">
        Printed {new Date().toLocaleString("en-GB")} · {order.items.length} line
        {order.items.length === 1 ? "" : "s"} ·{" "}
        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
      </p>
    </div>
  );
}

export default PrintTicket;
