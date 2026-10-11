import ResponsiveImage from "../ResponsiveImage";
import { useState } from "react";
import { useReveal } from "../../hooks/useReveal";
import { addReservation, useRestaurantInfo } from "../../store/restaurantStore";
import { pakistanDateInputValue, validPhone } from "../../utils/forms";
import "./Reservation.css";

const INITIAL_STATE = {
  name: "",
  phone: "",
  guests: "2",
  date: "",
  time: "",
  message: "",
};

function validate(values) {
  const errors = {};

  if (!values.name.trim() || values.name.trim().length < 2) {
    errors.name = "Please enter your full name.";
  }

  if (!validPhone(values.phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!values.date) {
    errors.date = "Please pick a date.";
  }

  if (!values.time) {
    errors.time = "Please pick a time.";
  }

  return errors;
}

function Reservation() {
  const info = useRestaurantInfo();
  const imageRef = useReveal();
  const formRef = useReveal();
  const [values, setValues] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);

  const today = pakistanDateInputValue();
  const requestText = submitted ? `Hi Zaify’s! I’d like to reserve a table.\nName: ${submitted.name}\nPhone: ${submitted.phone}\nGuests: ${submitted.guests}\nDate: ${submitted.date}\nTime: ${submitted.time}\nSpecial requests: ${submitted.message || "None"}\nReference: ${submitted.id}\nPlease confirm availability.` : "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(values);
    if (values.date && values.date < today) validationErrors.date = "Please choose today or a future date.";
    if (values.date === today && values.time && new Date(`${values.date}T${values.time}:00+05:00`).getTime() <= Date.now()) validationErrors.time = "Please choose a future time.";
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) document.getElementById(`res-${Object.keys(validationErrors)[0]}`)?.focus();

    if (Object.keys(validationErrors).length === 0) {
      // Record the booking so it lands in the admin panel immediately.
      // NOTE: stored in THIS browser only until a backend exists.
      const reservation = addReservation({
        name: values.name.trim(),
        phone: values.phone.trim(),
        guests: Number(values.guests),
        date: values.date,
        time: values.time,
        message: values.message.trim(),
      });

      setSubmitted(reservation);
      setValues(INITIAL_STATE);
    }
  };

  return (
    <section id="reservation" className="reservation section-padding">
      <div className="container reservation__grid">
        
        {/* Decorative Media Frame with Floating SAVE YOUR SEAT */}
        <div ref={imageRef} className="reservation__media-wrapper reveal">
          <div className="reservation__media">
            <ResponsiveImage
              src="/images/photo-1544148103-0773bf10d330.webp"
              alt="A beautifully set dining table"
              loading="lazy"
              width="900"
              height="1050"
            />
            <div className="reservation__media-note">
              <span className="eyebrow reservation__media-note-eyebrow">
                SAVE YOUR SEAT
              </span>
              <p className="reservation__media-note-text">
                Weekend evenings fill quickly — reserve at least a day ahead for
                parties of 4 or more.
              </p>
            </div>
          </div>
        </div>

        {/* Reservation Form Card Wrapper */}
        <div ref={formRef} className="reservation__form-wrap reveal">
          <span className="eyebrow">Reservation</span>
          <h2 className="section-heading">Your people. Your table.</h2>
          <p className="section-sub">
            Plan a family dinner, a birthday, or a just-because evening. Send
            your request to our team on WhatsApp to confirm availability.
          </p>

          {/* Success Validation Message */}
          {submitted && (
            <div className="reservation__success" role="status">
              <strong>Your table request is ready.</strong>
              <span>
                Send reference {submitted.id} to our team on WhatsApp. Your table
                is confirmed once the restaurant replies.
              </span>
              <a className="btn btn-gold reservation__handoff" href={`https://wa.me/${info.whatsappHref}?text=${encodeURIComponent(requestText)}`} target="_blank" rel="noopener noreferrer">Send request on WhatsApp ↗</a>
            </div>
          )}

          <form className="reservation__form" onSubmit={handleSubmit} noValidate>
            <div className="reservation__field">
              <label htmlFor="res-name">Full Name</label>
              <input
                id="res-name"
                name="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={handleChange}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "res-name-error" : undefined}
                placeholder="Your name"
              />
              {errors.name && (
                <span className="reservation__error" id="res-name-error">
                  {errors.name}
                </span>
              )}
            </div>

            <div className="reservation__field">
              <label htmlFor="res-phone">Phone Number</label>
              <input
                id="res-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={handleChange}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "res-phone-error" : undefined}
                placeholder="03XX XXXXXXX"
              />
              {errors.phone && (
                <span className="reservation__error" id="res-phone-error">
                  {errors.phone}
                </span>
              )}
            </div>

            {/* Combined Segment Row */}
            <div className="reservation__row">
              <div className="reservation__field">
                <label htmlFor="res-guests">Guests</label>
                <div className="reservation__select-wrapper">
                  <select
                    id="res-guests"
                    name="guests"
                    value={values.guests}
                    onChange={handleChange}
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="reservation__field">
                <label htmlFor="res-date">Date</label>
                <input
                  id="res-date"
                  name="date"
                  type="date"
                  min={today}
                  value={values.date}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.date)}
                  aria-describedby={errors.date ? "res-date-error" : undefined}
                />
                {errors.date && <span id="res-date-error" className="reservation__error">{errors.date}</span>}
              </div>

              <div className="reservation__field">
                <label htmlFor="res-time">Time</label>
                <input
                  id="res-time"
                  name="time"
                  type="time"
                  value={values.time}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.time)}
                  aria-describedby={errors.time ? "res-time-error" : undefined}
                />
                {errors.time && <span id="res-time-error" className="reservation__error">{errors.time}</span>}
              </div>
            </div>

            <div className="reservation__field">
              <label htmlFor="res-message">Special Requests (optional)</label>
              <textarea
                id="res-message"
                name="message"
                rows="3"
                value={values.message}
                onChange={handleChange}
                placeholder="Birthday cake, window seating, allergies..."
              />
            </div>

            <button type="submit" className="btn btn-gold reservation__submit">
              Prepare table request
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Reservation;
