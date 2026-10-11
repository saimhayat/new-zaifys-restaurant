import ResponsiveImage from "../ResponsiveImage";
import { ArrowUpRight, Flame, Heart, ChefHat } from "lucide-react";
import { useReveal } from "../../hooks/useReveal";
import { scrollToSection } from "../../utils/scrollTo";
import "./About.css";
export default function About() {
  const photoRef = useReveal(), copyRef = useReveal();
  return <section id="about" className="about section-padding"><div className="container about__grid">
    <div ref={photoRef} className="about__visual reveal"><div className="about__photo" data-parallax="65"><ResponsiveImage src="/images/photo-1577219491135-ce391730fb2c.webp" alt="Chef carefully finishing a dish in the kitchen" loading="lazy" width="800" height="1000" /></div><span className="about__photo-label">THE CRAFT BEHIND THE CRAVING.</span><div className="about__note"><span aria-hidden="true">✳</span><p>Made with heart.<br /><strong>Shared with love.</strong></p></div></div>
    <div ref={copyRef} className="about__copy reveal"><span className="eyebrow">OUR KIND OF FOOD. OUR KIND OF PEOPLE.</span><h2 className="section-heading">Desi roots.<br /><em>A world of flavour.</em></h2><p className="about__lead">Some meals fill you up.<br />The good ones bring you together.</p><p className="section-sub">That’s the spirit of Zaify’s. A little corner of Satellite Town where familiar Pakistani favourites meet new cravings — and every table has room for one more.</p><div className="about__details"><div><Flame size={21} /><span><strong>A little fire</strong><small>Smoky grills. Sizzling karahis. Big flavour.</small></span></div><div><ChefHat size={21} /><span><strong>A lot of care</strong><small>From the first ingredient to the final garnish.</small></span></div><div><Heart size={21} /><span><strong>All heart</strong><small>For family dinners and just-because evenings.</small></span></div></div><button className="about__link" onClick={() => scrollToSection("reservation")}>Make yourself at home <ArrowUpRight size={20} /></button></div>
  </div></section>;
}
