import { useRef, useState } from "react";
import ResponsiveImage from "../ResponsiveImage";
import { ArrowDown, ArrowUpRight, MapPin, Flame, Utensils, Pause, Play } from "lucide-react";
import { scrollToSection } from "../../utils/scrollTo";
import "./Hero.css";
export default function Hero() {
  const visualRef = useRef(null);
  const [paused, setPaused] = useState(() => typeof document !== "undefined" && document.documentElement.dataset.motion === "off");
  const toggleMotion = () => { const next = !paused; setPaused(next); visualRef.current?.style.setProperty("--pointer-x", "0px"); visualRef.current?.style.setProperty("--pointer-y", "0px"); document.documentElement.dataset.motion = next ? "off" : "on"; try { localStorage.setItem("zaify_motion", next ? "off" : "on"); } catch {} window.dispatchEvent(new Event("zaify-motion")); };
  const pointer = event => { if (!window.matchMedia("(hover: hover) and (min-width: 768px)").matches || paused || document.documentElement.dataset.performance === "lite" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; const rect = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.setProperty("--pointer-x", `${((event.clientX - rect.left) / rect.width - .5) * 12}px`); event.currentTarget.style.setProperty("--pointer-y", `${((event.clientY - rect.top) / rect.height - .5) * 12}px`); };
  return <section id="home" className="hero">
    <div className="container hero__layout">
      <div className="hero__copy"><div className="hero__location"><span className="hero__dot" /><MapPin size={13} aria-hidden="true" /> RAWALPINDI, PAKISTAN</div><h1>A little spice.<br />A lot of <span>soul<span className="hero__period">.</span></span></h1><p className="hero__description">Big desi flavours. Good company. Unforgettable meals.<br className="desktop-break" /> Pull up a chair — you’re at Zaify’s.</p><div className="hero__actions"><button className="btn btn-gold" onClick={() => scrollToSection("menu")}>Find your flavour <ArrowUpRight size={19} aria-hidden="true" /></button><button className="hero__secondary" onClick={() => scrollToSection("reservation")}>Book a table <span aria-hidden="true">↗</span></button></div><button className="hero__studio-link" onClick={() => scrollToSection("daawat")}><span className="hero__studio-icon" aria-hidden="true">✳</span><span>Bringing your people?<strong>Build your daawat</strong></span><ArrowUpRight size={17} aria-hidden="true" /></button><div className="hero__footnote"><span className="hero__footnote-icon"><Utensils size={17} aria-hidden="true" /></span><p>From our kitchen, with love.<br /><strong>Dine in · Take away · Delivery</strong></p></div></div>
      <div ref={visualRef} className="hero__visual" data-parallax="85" data-ambient onPointerMove={pointer} onPointerLeave={e => { e.currentTarget.style.setProperty("--pointer-x", "0px"); e.currentTarget.style.setProperty("--pointer-y", "0px"); }}>
        <div className="hero__orange" aria-hidden="true"><span lang="ur" dir="rtl">ذائقہ</span><i className="hero__spark">✳</i><i className="hero__spark hero__spark--small">✳</i></div>
        <div className="hero__dish-position"><div className="hero__dish-float"><ResponsiveImage sizes="(max-width: 767px) 100vw, (max-width: 1400px) 50vw, 700px" src="/images/hero-karahi.webp" className="hero__dish" alt="Chicken karahi with fresh green chillies, coriander and ginger" width="1312" height="1199" fetchPriority="high" /></div></div>
        <div className="hero__stamp" aria-label="Made with heart, served with soul"><svg viewBox="0 0 120 120" aria-hidden="true"><defs><path id="stamp-circle" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" /></defs><text><textPath href="#stamp-circle">MADE WITH HEART • SERVED WITH SOUL • </textPath></text></svg><Flame aria-hidden="true" size={30} /></div>
        <div className="hero__dish-label"><span>THE DESI CLASSIC</span><strong>Chicken Karahi</strong><i aria-hidden="true">↗</i></div><div className="hero__made"><span aria-hidden="true">✦</span> Desi. Delicious. Zaify’s.</div>
      </div>
    </div>
    <div className="container hero__bottom"><button className="hero__scroll" onClick={() => scrollToSection("menu")}><span className="hero__scroll-circle"><ArrowDown size={17} aria-hidden="true" /></span> GOOD FOOD AHEAD</button><button className="hero__motion" onClick={toggleMotion} aria-pressed={paused}>{paused ? <Play size={13} /> : <Pause size={13} />} {paused ? "Play motion" : "Pause motion"}</button><span className="hero__bottom-note">GOOD TIMES START AT THE TABLE.</span></div>
  </section>;
}
