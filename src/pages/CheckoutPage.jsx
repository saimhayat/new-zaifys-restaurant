import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, Banknote, CreditCard, Check } from "lucide-react";
import { useCart } from "../context/CartContext";
import { addOrder, useRestaurantInfo } from "../store/restaurantStore";
import ResponsiveImage from "../components/ResponsiveImage";
import { validPhone } from "../utils/forms";
import "./CheckoutPage.css";

function CheckoutPage() {
  const { cartItems, cartTotal, deliveryFee, grandTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const info = useRestaurantInfo();
  
  const [placedOrder, setPlacedOrder] = useState(null);
  const [errors, setErrors] = useState({});
  const [formInfo, setFormInfo] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    paymentMethod: "Cash on Delivery"
  });

  useEffect(() => { if (placedOrder) window.scrollTo({ top: 0, behavior: "instant" }); }, [placedOrder]);

  // If cart is empty and order isn't placed, redirect to cart
  if (cartItems.length === 0 && !placedOrder) {
    return <Navigate to="/cart" replace />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInfo((prev) => ({ ...prev, [name]: value }));
    setErrors(previous => ({ ...previous, [name]: undefined }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const customer = Object.fromEntries(["name", "phone", "address", "city"].map(key => [key, formInfo[key].trim()]));
    const invalid = {};
    if (customer.name.length < 2) invalid.name = "Please enter your full name.";
    if (!validPhone(customer.phone)) invalid.phone = "Enter a valid phone number.";
    if (customer.address.length < 5) invalid.address = "Please enter your delivery address.";
    if (customer.city.length < 2) invalid.city = "Please enter your city.";
    setErrors(invalid);
    if (Object.keys(invalid).length) { document.getElementById(`checkout-${Object.keys(invalid)[0]}`)?.focus(); return; }
    setFormInfo(previous => ({ ...previous, ...customer }));

    // Record the order so it appears in the admin panel straight away.
    // NOTE: until a backend exists this is stored in THIS browser only — the
    // restaurant's own device will not see it. See the note in the admin panel.
    const order = addOrder({
      customer,
      items: cartItems,
      subtotal: cartTotal,
      deliveryFee,
      total: grandTotal,
      paymentMethod: formInfo.paymentMethod,
    });

    setPlacedOrder(order);
    clearCart(); // Empty the cart only once the order is safely recorded
  };

  const backToCart = () => navigate("/cart");
  const backToHome = () => navigate("/");

  // Success Screen
  if (placedOrder) {
    return (
      <div className="checkout-page__success">
        <div className="success-card">
          <div className="success-card__icon">
            <Check size={40} strokeWidth={3} />
          </div>
          <h1>Your order is ready to send.</h1>
          <p>Send your order to our team on WhatsApp to confirm delivery and payment.</p>
          <p className="success-card__subtext">Your order reference is <strong>{placedOrder.id}</strong>.</p>
          <a className="btn btn-gold checkout-handoff" href={`https://wa.me/${info.whatsappHref}?text=${encodeURIComponent(`Hi Zaify’s! I would like to order.\nReference: ${placedOrder.id}\nName: ${formInfo.name}\nPhone: ${formInfo.phone}\nAddress: ${formInfo.address}, ${formInfo.city}\n${placedOrder.items.map(item => `${item.quantity} × ${item.name} (${item.size}${item.spice ? `, ${item.spice}` : ""}) — Rs. ${item.totalPrice}${item.notes ? `\nNotes: ${item.notes}` : ""}`).join("\n")}\nDelivery: Rs. ${placedOrder.deliveryFee}\nTotal: Rs. ${placedOrder.total}\nPayment preference: ${formInfo.paymentMethod}\nPlease confirm availability and delivery.`)}`} target="_blank" rel="noopener noreferrer">Send order on WhatsApp ↗</a>
          <button className="success-card__btn" onClick={backToHome}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container checkout-page__container">
        
        <div className="checkout-page__header">
          <h1 className="checkout-page__title">Checkout</h1>
          <button className="cart-back-btn" onClick={backToCart}>
            <ArrowLeft size={17} strokeWidth={2.2} /> Back to Cart
          </button>
        </div>

        <form className="checkout-page__layout" onSubmit={handlePlaceOrder} noValidate>
          
          {/* Left Side: Forms */}
          <div className="checkout-details">
            
            <div className="checkout-section">
              <h2 className="checkout-section__title">Contact Information</h2>
              <div className="checkout-form__grid">
                <div className="checkout-field">
                  <label htmlFor="checkout-name">Full Name</label>
                  <input type="text" id="checkout-name" autoComplete="name" name="name" value={formInfo.name} onChange={handleInputChange} required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "checkout-name-error" : undefined} placeholder="Your full name" />
                  {errors.name && <span className="checkout-error" id="checkout-name-error">{errors.name}</span>}
                </div>
                <div className="checkout-field">
                  <label htmlFor="checkout-phone">Phone Number</label>
                  <input type="tel" id="checkout-phone" autoComplete="tel" name="phone" value={formInfo.phone} onChange={handleInputChange} required aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "checkout-phone-error" : undefined} placeholder="03XX-XXXXXXX" />
                  {errors.phone && <span className="checkout-error" id="checkout-phone-error">{errors.phone}</span>}
                </div>
              </div>
            </div>

            <div className="checkout-section">
              <h2 className="checkout-section__title">Delivery Address</h2>
              <div className="checkout-field" style={{ marginBottom: "1rem" }}>
                <label htmlFor="checkout-address">Street Address</label>
                <input type="text" id="checkout-address" autoComplete="street-address" name="address" value={formInfo.address} onChange={handleInputChange} required aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? "checkout-address-error" : undefined} placeholder="House #, Street, Area" />
                {errors.address && <span className="checkout-error" id="checkout-address-error">{errors.address}</span>}
              </div>
              <div className="checkout-field">
                <label htmlFor="checkout-city">City</label>
                <input type="text" id="checkout-city" autoComplete="address-level2" name="city" value={formInfo.city} onChange={handleInputChange} required aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? "checkout-city-error" : undefined} placeholder="Rawalpindi" />
                {errors.city && <span className="checkout-error" id="checkout-city-error">{errors.city}</span>}
              </div>
            </div>

            <div className="checkout-section">
              <h2 className="checkout-section__title">Payment Method</h2>
              <div className="payment-options">
                <label className={`payment-card ${formInfo.paymentMethod === "Cash on Delivery" ? "active" : ""}`}>
                  <input type="radio" name="paymentMethod" value="Cash on Delivery" checked={formInfo.paymentMethod === "Cash on Delivery"} onChange={handleInputChange} />
                  <Banknote size={17} strokeWidth={2} />
                  <span>Cash on Delivery</span>
                </label>
                <label className={`payment-card ${formInfo.paymentMethod === "Card" ? "active" : ""}`}>
                  <input type="radio" name="paymentMethod" value="Card" checked={formInfo.paymentMethod === "Card"} onChange={handleInputChange} />
                  <CreditCard size={17} strokeWidth={2} />
                  <span>Credit / Debit Card</span>
                </label>
              </div>
            </div>

          </div>

          {/* Right Side: Summary */}
          <div className="checkout-summary">
            <h2 className="checkout-summary__title">Order Summary</h2>
            
            <div className="checkout-items__list">
              {cartItems.map((item, index) => (
                <div className="checkout-item" key={index}>
                  <div className="checkout-item__img">
                    <ResponsiveImage src={item.image} alt={item.name} width="60" height="60" sizes="60px" loading="lazy" />
                    <span className="checkout-item__qty">{item.quantity}</span>
                  </div>
                  <div className="checkout-item__info">
                    <h4>{item.name}</h4>
                    <small>{item.spice ? `${item.size} · ${item.spice}` : item.size}</small>
                  </div>
                  <div className="checkout-item__price">
                    Rs. {item.totalPrice.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="checkout-summary__divider"></div>

            <div className="checkout-summary__row">
              <span>Subtotal</span>
              <span>Rs. {cartTotal.toLocaleString()}</span>
            </div>
            <div className="checkout-summary__row">
              <span>Delivery Fee</span>
              <span>Rs. {deliveryFee.toLocaleString()}</span>
            </div>

            <div className="checkout-summary__divider"></div>

            <div className="checkout-summary__row checkout-summary__total">
              <span>Total</span>
              <span>Rs. {grandTotal.toLocaleString()}</span>
            </div>

            <button type="submit" className="checkout-place__btn">
              Prepare Order
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CheckoutPage;
