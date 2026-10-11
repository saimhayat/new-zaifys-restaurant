import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { scrollToSection } from "../../utils/scrollTo";
import { useRestaurantInfo } from "../../store/restaurantStore";
import "./Footer.css";
export default function Footer() {
  const info=useRestaurantInfo();
  return <footer className="footer"><div className="container"><div className="footer__top"><div className="footer__invite"><span>GOOD FOOD. GOOD PEOPLE. GOOD TIMES.</span><h2>Hungry yet?</h2><button className="btn" onClick={()=>scrollToSection("menu")}>Let’s fix that <ArrowUpRight size={19} /></button></div><nav className="footer__links" aria-label="Footer navigation"><h3>Pull up a chair</h3><button onClick={()=>scrollToSection("menu")}>Explore the menu</button><button onClick={()=>scrollToSection("reservation")}>Book a table</button><Link to="/cart">Your bag</Link></nav><div className="footer__contact"><h3>Say hello</h3><a href={`tel:${info.phoneHref}`}>{info.phone}</a><a href={`https://wa.me/${info.whatsappHref}`} target="_blank" rel="noopener noreferrer">WhatsApp us <ArrowUpRight size={13} /></a><p>Satellite Town,<br />Rawalpindi, Pakistan.</p></div></div><div className="footer__wordmark" aria-label="Zaify's">zaify’s<span aria-hidden="true">✳</span></div><div className="footer__bottom"><p>© {new Date().getFullYear()} Zaify’s Restaurant.</p><span>PAKISTANI AT HEART. ALWAYS.</span><button onClick={()=>scrollToSection("home")}>Back to top ↑</button></div></div></footer>;
}
