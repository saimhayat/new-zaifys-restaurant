import { createContext, useState, useContext, useEffect } from "react";
import { computeTotals, useRestaurantInfo } from "../store/restaurantStore";
import { normalizeCartItems } from "../utils/cart";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // 1. Initialize state from localStorage (if it exists)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem("zaify_cart");
      const parsed = localData ? JSON.parse(localData) : [];
      return normalizeCartItems(parsed);
    } catch (error) {
      return [];
    }
  });

  // 2. Save to localStorage every time cartItems changes
  useEffect(() => {
    try {
      localStorage.setItem("zaify_cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage");
    }
  }, [cartItems]);

  // Delivery fee and free-delivery threshold are managed in the admin panel.
  const settings = useRestaurantInfo();

  // Check if item exists (same id, size, and spice level)
  const addToCart = (item) => {
    const [validItem] = normalizeCartItems([item]);
    if (!validItem) return;
    setCartItems(current => {
      const index = current.findIndex(line => line.id === validItem.id && line.size === validItem.size && line.spice === validItem.spice && line.unitPrice === validItem.unitPrice && line.notes === validItem.notes);
      if (index < 0) return [...current, validItem];
      return current.map((line, i) => i === index ? { ...line, quantity: line.quantity + validItem.quantity, totalPrice: (line.quantity + validItem.quantity) * line.unitPrice } : line);
    });
  };
  const removeFromCart = index => setCartItems(current => current.filter((_, i) => i !== index));
  const updateQuantity = (index, newQty) => {
    if (!Number.isSafeInteger(newQty) || newQty < 1) return;
    setCartItems(current => current.map((line, i) => i === index ? { ...line, quantity: newQty, totalPrice: newQty * line.unitPrice } : line));
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Changed this line to count unique items instead of total quantity
  const totalItems = cartItems.length; 
  
  // Delivery fee and the free-delivery threshold live in admin settings, so
  // the cart and the settings panel can never disagree.
  const {
    deliveryFee,
    total: grandTotal,
    qualifiesForFreeDelivery,
    freeDeliveryGap,
  } = computeTotals(cartTotal, settings);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        totalItems,
        deliveryFee,
        grandTotal,
        qualifiesForFreeDelivery,
        freeDeliveryGap,
        freeDeliveryOver: settings.freeDeliveryOver,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
