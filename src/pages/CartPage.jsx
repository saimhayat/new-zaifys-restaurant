import { useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import ResponsiveImage from "../components/ResponsiveImage";
import "./CartPage.css";

function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, deliveryFee, grandTotal, clearCart, qualifiesForFreeDelivery, freeDeliveryGap, freeDeliveryOver } = useCart();
  const navigate = useNavigate();

  const goToMenu = () => {
    navigate("/#menu");
  };

  const goToCheckout = () => {
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page__empty">
        <div className="cart-empty__icon">🛒</div>
        <h1 className="cart-empty__title">Your Cart is Empty</h1>
        <p className="cart-empty__text">Looks like you haven't added any delicious meals yet.</p>
        <button onClick={goToMenu} className="cart-empty__btn">Browse Menu</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container cart-page__container">
        
        {/* Header */}
        <div className="cart-page__header">
          <h1 className="cart-page__title">Your Order</h1>
          <button className="cart-page__clear" onClick={clearCart}>
            Clear All
          </button>
        </div>

        <div className="cart-page__layout">
          
          {/* Left Side: Cart Items */}
          <div className="cart-items__list">
            <button onClick={goToMenu} className="cart-back-btn">
              <ArrowLeft size={17} strokeWidth={2.2} /> Add more items
            </button>

            {cartItems.map((item, index) => (
              <div className="cart-item" key={index}>
                <ResponsiveImage src={item.image} alt={item.name} className="cart-item__img" sizes="120px" width="120" height="120" loading="lazy" />
                
                <div className="cart-item__details">
                  <h3 className="cart-item__name">{item.name}</h3>
                  <div className="cart-item__tags">
                    <span>{item.size}</span>
                    {item.spice && <span>{item.spice} Spice</span>}
                  </div>
                  {item.notes && <p className="cart-item__notes">📝 {item.notes}</p>}
                  
                  <div className="cart-item__actions">
  <div className="cart-item__qty">
    <button aria-label={`Decrease ${item.name} quantity`} disabled={item.quantity <= 1} onClick={() => updateQuantity(index, item.quantity - 1)}>−</button>
    <span>{item.quantity}</span> {/* <-- FIXED THIS LINE */}
    <button aria-label={`Increase ${item.name} quantity`} onClick={() => updateQuantity(index, item.quantity + 1)}>+</button>
  </div>
  <button className="cart-item__remove" onClick={() => removeFromCart(index)}>
    <Trash2 size={15} strokeWidth={2} /> Remove
  </button>
</div>
                </div>

                <div className="cart-item__price">
                  <small>Subtotal</small>
                  <strong>Rs. {item.totalPrice.toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side: Order Summary */}
          <div className="cart-summary">
            <h2 className="cart-summary__title">Order Summary</h2>
            
            <div className="cart-summary__row">
              <span>Subtotal</span>
              <span>Rs. {cartTotal.toLocaleString()}</span>
            </div>
            <div className="cart-summary__row">
              <span>Delivery Fee</span>
              <span>Rs. {deliveryFee.toLocaleString()}</span>
            </div>
            {freeDeliveryOver > 0 && (
              <div className="cart-summary__row cart-summary__row--muted">
                <span>
                  {qualifiesForFreeDelivery
                    ? "Free delivery unlocked"
                    : `Add Rs. ${freeDeliveryGap.toLocaleString()} more for free delivery`}
                </span>
              </div>
            )}

            <div className="cart-summary__divider"></div>

            <div className="cart-summary__row cart-summary__total">
              <span>Total</span>
              <span>Rs. {grandTotal.toLocaleString()}</span>
            </div>

            <button className="cart-checkout__btn" onClick={goToCheckout}>
              Proceed to Checkout
            </button>

            <div className="cart-summary__trust">
              <span>🔒 Secure Checkout</span>
              <span>⚡ Fast Delivery</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CartPage;
