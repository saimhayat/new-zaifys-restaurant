import ResponsiveImage from "../ResponsiveImage";
import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Minus, Plus, ShoppingBag, Clock } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useDialog } from "../../hooks/useDialog";
import { defaultSize, formatRs, priceForSize } from "../../utils/price";
import "./OrderModal.css";
export default function OrderModal({ item, onClose }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1), [spice, setSpice] = useState(item.spice ?? null), [size, setSize] = useState(defaultSize(item)?.label ?? ""), [notes, setNotes] = useState("");
  const ref = useDialog(true,onClose), price = priceForSize(item,size), available = item.available !== false;
  const add = () => { if (!available) return; addToCart({ id:item.id,name:item.name,image:item.image,quantity,spice,size,notes,unitPrice:price,totalPrice:price*quantity }); onClose(); };
  return createPortal(<div className="order-modal-overlay" onClick={onClose}><div ref={ref} className="order-modal" role="dialog" aria-modal="true" aria-labelledby="dish-title" tabIndex={-1} onClick={e => e.stopPropagation()}>
    <button className="order-modal__close icon-button" aria-label="Close dish details" onClick={onClose}><X size={22} /></button>
    <div className="order-modal__left"><ResponsiveImage sizes="(max-width: 650px) calc(100vw - 24px), 400px" src={item.image} alt={item.name} className="order-modal__image" /><span className="order-modal__badge">{item.category}</span></div>
    <div className="order-modal__right"><span className="eyebrow">MAKE IT YOURS</span><h2 id="dish-title">{item.name}</h2><p className="order-modal__description">{item.description}</p><div className="order-modal__meta"><span><Clock size={14} /> {item.prepTime} min prep</span>{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
      <fieldset className="order-section"><legend>Serving size</legend><div className="option-group">{item.sizes.map(option => <button key={option.label} className={`option ${size === option.label ? "active" : ""}`} aria-pressed={size === option.label} onClick={() => setSize(option.label)}><span>{option.label}</span><small>{formatRs(option.price)}</small></button>)}</div></fieldset>
      {item.spice && <fieldset className="order-section"><legend>How spicy?</legend><div className="spice-group">{["Mild","Medium","Hot"].map(level => <button key={level} className={`spice ${spice === level ? "active" : ""}`} aria-pressed={spice === level} onClick={() => setSpice(level)}>{level}</button>)}</div></fieldset>}
      <div className="order-section"><label htmlFor="dish-notes">A little extra? <small>(optional)</small></label><textarea id="dish-notes" rows={2} placeholder="Allergies or special requests…" value={notes} onChange={e => setNotes(e.target.value)} /></div>
      <div className="order-footer"><div className="quantity-box"><button aria-label="Decrease quantity" disabled={quantity===1} onClick={() => setQuantity(q=>Math.max(1,q-1))}><Minus size={16} /></button><output aria-label="Quantity" aria-live="polite">{quantity}</output><button aria-label="Increase quantity" onClick={() => setQuantity(q=>q+1)}><Plus size={16} /></button></div><button className="btn btn-gold add-cart-btn" disabled={!available} onClick={add}><ShoppingBag size={17} /> {available ? `Add · ${formatRs(price*quantity)}` : "Sold out"}</button></div>
    </div>
  </div></div>,document.body);
}
