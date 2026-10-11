import { Link } from "react-router-dom";
import { Utensils, CalendarDays, ShoppingBag, MessageCircle } from "lucide-react";
import { useRestaurantInfo } from "../../store/restaurantStore";
import { useCart } from "../../context/CartContext";
import { scrollToSection } from "../../utils/scrollTo";
import "./FloatingActions.css";
export default function FloatingActions() {
  const info = useRestaurantInfo(), {totalItems}=useCart();
  return <><a className="desktop-chat" href={`https://wa.me/${info.whatsappHref}`} target="_blank" rel="noopener noreferrer" aria-label="Chat with Zaify's on WhatsApp"><MessageCircle size={23} /></a><nav className="action-bar" aria-label="Quick actions"><button onClick={()=>scrollToSection("menu")}><Utensils size={18} aria-hidden="true" /><span>The menu</span></button><button className="action-bar__primary" onClick={()=>scrollToSection("reservation")}><CalendarDays size={18} aria-hidden="true" /><span>Book a table</span></button><Link to="/cart" aria-label={`Your bag, ${totalItems} items`}><span className="action-bar__bag"><ShoppingBag size={19} aria-hidden="true" />{totalItems>0&&<b>{totalItems}</b>}</span><span>Your bag</span></Link></nav></>;
}
