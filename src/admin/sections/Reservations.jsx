import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Download,
  MessageCircle,
  Phone,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  RESERVATION_STATUSES,
  addReservation,
  deleteReservation,
  updateReservationStatus,
  useAdminStore,
} from "../../store/restaurantStore";
import {
  ConfirmButton,
  DetailRow,
  Drawer,
  EmptyState,
  Field,
  FilterTabs,
  PageHeader,
  SearchField,
  StatusPill,
} from "../ui";
import { downloadCsv, formatRelative, toCsv, toWhatsAppHref } from "../format";

const TODAY = () => new Date().toISOString().split("T")[0];

const BLANK_BOOKING = {
  name: "",
  phone: "",
  guests: 2,
  date: "",
  time: "20:00",
  message: "",
};

/** Manually records a booking taken over the phone or at the door. */
function BookingForm({ onClose, onCreated }) {
  const [draft, setDraft] = useState({ ...BLANK_BOOKING, date: TODAY() });
  const [showErrors, setShowErrors] = useState(false);

  const errors = {
    name: draft.name.trim().length < 2 ? "Enter the guest's name." : null,
    phone: /^[0-9+\s-]{7,15}$/.test(draft.phone.trim())
      ? null
      : "Enter a valid phone number.",
    date: draft.date ? null : "Pick a date.",
    time: draft.time ? null : "Pick a time.",
  };
  const valid = Object.values(errors).every((error) => error === null);

  const set = (patch) => setDraft((previous) => ({ ...previous, ...patch }));

  return (
    <Drawer
      open
      title="New reservation"
      subtitle="For bookings taken by phone or at the door"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => {
              if (!valid) {
                setShowErrors(true);
                return;
              }
              const created = addReservation({
                name: draft.name.trim(),
                phone: draft.phone.trim(),
                guests: Number(draft.guests),
                date: draft.date,
                time: draft.time,
                message: draft.message.trim(),
              });
              onCreated(created);
            }}
          >
            <Plus size={16} strokeWidth={2} />
            Add reservation
          </button>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
            Cancel
          </button>
        </>
      }
    >
      <Field label="Guest name">
        <input
          type="text"
          value={draft.name}
          placeholder="e.g. Imran Khan"
          onChange={(event) => set({ name: event.target.value })}
        />
      </Field>
      {showErrors && errors.name && (
        <p className="admin-login__error">{errors.name}</p>
      )}

      <Field label="Phone number">
        <input
          type="tel"
          value={draft.phone}
          placeholder="03XX XXXXXXX"
          onChange={(event) => set({ phone: event.target.value })}
        />
      </Field>
      {showErrors && errors.phone && (
        <p className="admin-login__error">{errors.phone}</p>
      )}

      <div className="admin-form-row">
        <Field label="Guests">
          <input
            type="number"
            min="1"
            max="40"
            value={draft.guests}
            onChange={(event) =>
              set({ guests: Math.max(1, Number(event.target.value) || 1) })
            }
          />
        </Field>
        <Field label="Date">
          <input
            type="date"
            value={draft.date}
            onChange={(event) => set({ date: event.target.value })}
          />
        </Field>
        <Field label="Time">
          <input
            type="time"
            value={draft.time}
            onChange={(event) => set({ time: event.target.value })}
          />
        </Field>
      </div>
      {showErrors && (errors.date || errors.time) && (
        <p className="admin-login__error">{errors.date ?? errors.time}</p>
      )}

      <Field label="Special requests (optional)">
        <textarea
          value={draft.message}
          placeholder="Birthday cake, window seating, allergies…"
          onChange={(event) => set({ message: event.target.value })}
        />
      </Field>
    </Drawer>
  );
}

function Reservations() {
  const state = useAdminStore();
  const [status, setStatus] = useState("all");
  const [day, setDay] = useState("upcoming");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [creating, setCreating] = useState(false);

  const reservations = state.reservations;
  const openReservation = openId
    ? reservations.find((reservation) => reservation.id === openId)
    : null;

  const counts = useMemo(() => {
    const tally = { all: reservations.length };
    RESERVATION_STATUSES.forEach((entry) => {
      tally[entry.id] = reservations.filter(
        (reservation) => reservation.status === entry.id
      ).length;
    });
    return tally;
  }, [reservations]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const today = TODAY();

    return reservations
      .filter((reservation) => {
        if (status !== "all" && reservation.status !== status) return false;

        if (day === "today" && reservation.date !== today) return false;
        if (day === "past" && reservation.date >= today) return false;
        if (day === "upcoming" && reservation.date < today) return false;

        if (!needle) return true;

        return (
          reservation.name.toLowerCase().includes(needle) ||
          reservation.id.toLowerCase().includes(needle) ||
          reservation.phone.replace(/\s/g, "").includes(needle.replace(/\s/g, ""))
        );
      })
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  }, [reservations, status, day, query]);

  const dayOptions = [
    { id: "upcoming", label: "Upcoming" },
    { id: "today", label: "Today" },
    { id: "past", label: "Past" },
    { id: "all", label: "All dates" },
  ];

  const reservedCovers = filtered
    .filter((reservation) => reservation.status !== "cancelled")
    .reduce((sum, reservation) => sum + reservation.guests, 0);

  const exportReservations = () => {
    const csv = toCsv(filtered, [
      { label: "Reference", value: (r) => r.id },
      { label: "Guest", value: (r) => r.name },
      { label: "Phone", value: (r) => r.phone },
      { label: "Date", value: (r) => r.date },
      { label: "Time", value: (r) => r.time },
      { label: "Guests", value: (r) => r.guests },
      {
        label: "Status",
        value: (r) =>
          RESERVATION_STATUSES.find((entry) => entry.id === r.status)?.label ?? r.status,
      },
      { label: "Special requests", value: (r) => r.message },
      { label: "Requested at", value: (r) => r.createdAt },
    ]);

    downloadCsv(
      `zaifys-reservations-${new Date().toISOString().split("T")[0]}.csv`,
      csv
    );
  };

  return (
    <>
      <PageHeader
        title="Reservations"
        subtitle={`${counts.pending ?? 0} awaiting confirmation · ${reservedCovers} covers in view`}
      >
        <button type="button" className="admin-btn" onClick={exportReservations}>
          <Download size={15} strokeWidth={2} />
          Export ({filtered.length})
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={() => setCreating(true)}
        >
          <Plus size={16} strokeWidth={2} />
          New reservation
        </button>
      </PageHeader>

      <div className="admin-toolbar">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search by name, phone or reference…"
          label="Search reservations"
        />
      </div>

      <FilterTabs
        options={[
          { id: "all", label: "All" },
          ...RESERVATION_STATUSES.map((entry) => ({
            id: entry.id,
            label: entry.label,
          })),
        ]}
        value={status}
        onChange={setStatus}
        counts={counts}
      />

      <div style={{ marginTop: "0.75rem" }}>
        <FilterTabs options={dayOptions} value={day} onChange={setDay} />
      </div>

      <div className="admin-card admin-card--flush" style={{ marginTop: "1.1rem" }}>
        {filtered.length === 0 ? (
          <EmptyState
            title="No reservations match"
            message="Try another date range, or take a booking over the phone."
            action={
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={() => setCreating(true)}
              >
                <Plus size={16} strokeWidth={2} />
                New reservation
              </button>
            }
          />
        ) : (
          <div className="admin-rows">
            {filtered.map((reservation) => (
              <button
                key={reservation.id}
                type="button"
                className="admin-row admin-row--reservations"
                onClick={() => setOpenId(reservation.id)}
              >
                <span className="admin-row__primary">
                  <span>
                    <strong className="admin-row__title">{reservation.name}</strong>
                    <span className="admin-row__meta">
                      {reservation.id} · {reservation.phone}
                    </span>
                  </span>
                </span>

                <span className="admin-row__cell admin-row__cell--date">
                  <span>
                    {new Date(`${reservation.date}T00:00:00`).toLocaleDateString(
                      "en-GB",
                      { weekday: "short", day: "2-digit", month: "short" }
                    )}{" "}
                    · {reservation.time}
                  </span>
                </span>

                <span className="admin-row__cell admin-row__cell--muted">
                  {reservation.guests} guest{reservation.guests === 1 ? "" : "s"}
                </span>

                <span className="admin-row__end">
                  <StatusPill status={reservation.status} statuses={RESERVATION_STATUSES} />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {creating && (
        <BookingForm
          onClose={() => setCreating(false)}
          onCreated={(created) => {
            setCreating(false);
            setOpenId(created.id);
          }}
        />
      )}

      <Drawer
        open={Boolean(openReservation)}
        title={openReservation ? openReservation.name : ""}
        subtitle={
          openReservation
            ? `${openReservation.id} · requested ${formatRelative(openReservation.createdAt)}`
            : ""
        }
        onClose={() => setOpenId(null)}
        footer={
          openReservation && (
            <>
              {openReservation.status === "pending" && (
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  onClick={() =>
                    updateReservationStatus(openReservation.id, "confirmed")
                  }
                >
                  <BadgeCheck size={16} strokeWidth={2} />
                  Confirm table
                </button>
              )}

              {openReservation.status === "confirmed" && (
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  onClick={() => updateReservationStatus(openReservation.id, "seated")}
                >
                  <Users size={16} strokeWidth={2} />
                  Mark seated
                </button>
              )}

              {openReservation.status !== "cancelled" && (
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  onClick={() =>
                    updateReservationStatus(openReservation.id, "cancelled")
                  }
                >
                  <X size={16} strokeWidth={2} />
                  Cancel
                </button>
              )}

              <ConfirmButton
                label="Delete"
                confirmLabel="Tap again to delete"
                icon={Trash2}
                className="admin-btn admin-btn--ghost"
                onConfirm={() => {
                  deleteReservation(openReservation.id);
                  setOpenId(null);
                }}
              />
            </>
          )
        }
      >
        {openReservation && (
          <>
            <div className="admin-block">
              <h3 className="admin-block__title">Booking</h3>
              <DetailRow
                label="Date"
                value={new Date(
                  `${openReservation.date}T00:00:00`
                ).toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              />
              <DetailRow label="Time" value={openReservation.time} />
              <DetailRow
                label="Party size"
                value={`${openReservation.guests} guest${
                  openReservation.guests === 1 ? "" : "s"
                }`}
              />
              <DetailRow
                label="Status"
                value={
                  RESERVATION_STATUSES.find(
                    (entry) => entry.id === openReservation.status
                  )?.label ?? openReservation.status
                }
              />
            </div>

            <div className="admin-block">
              <h3 className="admin-block__title">Guest</h3>
              <DetailRow label="Name" value={openReservation.name} />
              <DetailRow label="Phone" value={openReservation.phone} />
              <DetailRow
                label="Requested"
                value={formatRelative(openReservation.createdAt)}
              />

              <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.9rem", flexWrap: "wrap" }}>
                <a
                  className="admin-btn"
                  href={`tel:${openReservation.phone.replace(/\s/g, "")}`}
                >
                  <Phone size={15} strokeWidth={2} />
                  Call
                </a>
                <a
                  className="admin-btn admin-btn--ok"
                  href={toWhatsAppHref(
                    openReservation.phone,
                    `Hello ${openReservation.name}, this is Zaify's Restaurant confirming your table for ${openReservation.guests} on ${openReservation.date} at ${openReservation.time}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={15} strokeWidth={2} />
                  Confirm on WhatsApp
                </a>
              </div>
            </div>

            {openReservation.message && (
              <div className="admin-block">
                <h3 className="admin-block__title">Special requests</h3>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "var(--color-text-muted)", margin: 0 }}>
                  {openReservation.message}
                </p>
              </div>
            )}
          </>
        )}
      </Drawer>
    </>
  );
}

export default Reservations;
