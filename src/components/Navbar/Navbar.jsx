import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { ArrowUpRight, Menu, X, ShoppingBag, MapPin } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useDialog } from "../../hooks/useDialog";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import "./Navbar.css";
const links = [{ label: "Our story", id: "about" }, { label: "The menu", id: "menu" }, { label: "The space", id: "gallery" }, { label: "Visit us", id: "contact" }];
export default function Navbar() {
  const [open, setOpen] = useState(false), [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart(), location = useLocation(), navigate = useNavigate();
  const dialogRef = useDialog(open, () => setOpen(false));
  useEffect(() => { const update = () => setScrolled(window.scrollY > 24); update(); window.addEventListener("scroll", update, { passive: true }); return () => window.removeEventListener("scroll", update); }, []);
  useEffect(() => { const media = window.matchMedia("(min-width: 901px)"); const close = () => { if (media.matches) setOpen(false); }; media.addEventListener("change", close); return () => media.removeEventListener("change", close); }, []);
  const go = id => { setOpen(false); navigate(`/#${id}`); };
  return <>
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__progress" aria-hidden="true" />
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo" aria-label="Zaify's home" onClick={event => { if (location.pathname === "/") { event.preventDefault(); go("home"); } }}><span className="brand-word">zaify’s<span className="brand-star" aria-hidden="true">✳</span></span><span className="brand-tagline">PAKISTANI AT HEART</span></Link>
        <nav className="navbar__links" aria-label="Main navigation">{links.map(link => <button key={link.id} onClick={() => go(link.id)}>{link.label}</button>)}</nav>
        <div className="navbar__actions"><ThemeToggle /><Link className="navbar__cart" to="/cart" aria-label={`Your bag${totalItems ? `, ${totalItems} items` : ""}`}><ShoppingBag size={20} aria-hidden="true" />{totalItems > 0 && <span>{totalItems}</span>}</Link><button className="btn btn-gold navbar__cta" onClick={() => go("reservation")}>Book a table <ArrowUpRight size={17} aria-hidden="true" /></button><button className="navbar__toggle" aria-label="Open navigation" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(true)}><Menu size={25} /></button></div>
      </div>
    </header>
    {open && createPortal(<div className="nav-overlay" onClick={() => setOpen(false)}><div ref={dialogRef} id="mobile-navigation" className="nav-drawer" role="dialog" aria-modal="true" aria-label="Navigation" tabIndex={-1} onClick={e => e.stopPropagation()}>
      <div className="nav-drawer__head"><span className="brand-word">zaify’s<span className="brand-star">✳</span></span><button className="icon-button" aria-label="Close navigation" onClick={() => setOpen(false)}><X /></button></div>
      <nav aria-label="Mobile navigation">{links.map((link, index) => <button key={link.id} onClick={() => go(link.id)}><small>0{index + 1}</small>{link.label}<ArrowUpRight /></button>)}</nav><button className="btn btn-gold" onClick={() => go("reservation")}>Book a table <ArrowUpRight size={18} /></button><p className="nav-drawer__location"><MapPin size={17} /> Satellite Town, Rawalpindi</p>
    </div></div>, document.body)}
  </>;
}
