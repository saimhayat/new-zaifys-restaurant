import { useRef, useState } from "react";
import { AlertTriangle, RotateCcw, Save } from "lucide-react";
import {
  DEMO_PASSCODE,
  resetDemoData,
  updateSettings,
  useAdminStore,
} from "../../store/restaurantStore";
import { PageHeader } from "../ui";
import { formatRs } from "../format";

/**
 * Restaurant details and ordering rules.
 *
 * These are held in the same store the public site reads, so the delivery fee
 * and free-delivery threshold take effect on the cart immediately. The contact
 * details are stored here ready to be wired to the contact section when a
 * backend lands.
 */
function Settings() {
  const { settings } = useAdminStore();
  const [saved, setSaved] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const savedTimer = useRef(null);

  const patch = (changes) => {
    updateSettings(changes);
    setSaved(true);
    clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 1600);
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Restaurant details and the rules the website orders by"
      >
        {saved && (
          <span className="admin-pill admin-pill--ok">
            <Save size={12} strokeWidth={2.5} />
            Saved
          </span>
        )}
      </PageHeader>

      <div className="admin-grid admin-grid--split" style={{ alignItems: "start" }}>
        <section className="admin-card">
          <div className="admin-card__head" style={{ padding: "0 0 1.1rem", border: "none" }}>
            <div>
              <h2>Restaurant details</h2>
              <p>Shown across the public website</p>
            </div>
          </div>

          <label className="admin-field">
            <span className="admin-field__label">Name</span>
            <input
              type="text"
              value={settings.name}
              onChange={(event) => patch({ name: event.target.value })}
            />
          </label>

          <label className="admin-field">
            <span className="admin-field__label">Tagline</span>
            <input
              type="text"
              value={settings.tagline}
              onChange={(event) => patch({ tagline: event.target.value })}
            />
          </label>

          <label className="admin-field">
            <span className="admin-field__label">Address</span>
            <input
              type="text"
              value={settings.address}
              onChange={(event) => patch({ address: event.target.value })}
            />
          </label>

          <div className="admin-form-row">
            <label className="admin-field">
              <span className="admin-field__label">Phone</span>
              <input
                type="text"
                value={settings.phone}
                onChange={(event) => patch({ phone: event.target.value })}
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">WhatsApp number</span>
              <input
                type="text"
                value={settings.whatsappHref}
                onChange={(event) => patch({ whatsappHref: event.target.value })}
              />
            </label>
          </div>

          <label className="admin-field">
            <span className="admin-field__label">Price range</span>
            <input
              type="text"
              value={settings.priceRange}
              onChange={(event) => patch({ priceRange: event.target.value })}
            />
          </label>

          <label className="admin-field">
            <span className="admin-field__label">Services</span>
            <input
              type="text"
              value={settings.services.join(", ")}
              onChange={(event) =>
                patch({
                  services: event.target.value
                    .split(",")
                    .map((entry) => entry.trim())
                    .filter(Boolean),
                })
              }
            />
            <span className="admin-field__hint">
              Comma separated — these appear in the website footer.
            </span>
          </label>
        </section>

        <div>
          <section className="admin-card" style={{ marginBottom: "1.25rem" }}>
            <div className="admin-card__head" style={{ padding: "0 0 1.1rem", border: "none" }}>
              <div>
                <h2>Delivery rules</h2>
                <p>Applied to the cart and checkout</p>
              </div>
            </div>

            <label className="admin-field">
              <span className="admin-field__label">Delivery fee (Rs.)</span>
              <input
                type="number"
                min="0"
                step="10"
                value={settings.deliveryFee}
                onChange={(event) =>
                  patch({ deliveryFee: Math.max(0, Number(event.target.value) || 0) })
                }
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Free delivery over (Rs.)</span>
              <input
                type="number"
                min="0"
                step="100"
                value={settings.freeDeliveryOver}
                onChange={(event) =>
                  patch({
                    freeDeliveryOver: Math.max(0, Number(event.target.value) || 0),
                  })
                }
              />
              <span className="admin-field__hint">
                Set to 0 to always charge delivery. Right now, orders over{" "}
                {formatRs(settings.freeDeliveryOver)} ship free.
              </span>
            </label>
          </section>

          <section className="admin-card">
            <div className="admin-card__head" style={{ padding: "0 0 1.1rem", border: "none" }}>
              <div>
                <h2>Demo data</h2>
                <p>Reset the panel to its seeded state</p>
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.7, marginTop: 0 }}>
              Every order, reservation and menu edit made here is stored in this
              browser only. Resetting throws all of it away and rebuilds the
              original sample data. Orders placed from the website on this device
              will be lost too.
            </p>

            <div className="admin-banner" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
              <AlertTriangle size={17} strokeWidth={2} />
              <div>
                <strong>Sign-in is a placeholder.</strong> The passcode{" "}
                <code>{DEMO_PASSCODE}</code> is compiled into the bundle, so it
                offers no protection. Real authentication needs the backend.
              </div>
            </div>

            {confirmingReset ? (
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  onClick={() => {
                    resetDemoData();
                    setConfirmingReset(false);
                  }}
                >
                  <RotateCcw size={15} strokeWidth={2} />
                  Yes, reset everything
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={() => setConfirmingReset(false)}
                >
                  Keep my data
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="admin-btn"
                onClick={() => setConfirmingReset(true)}
              >
                <RotateCcw size={15} strokeWidth={2} />
                Reset demo data
              </button>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default Settings;
