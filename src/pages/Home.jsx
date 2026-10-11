import Seo from "../components/Seo";
import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import About from "../components/About/About";
import Menu from "../components/Menu/Menu";
import Gallery from "../components/Gallery/Gallery";
import Testimonials from "../components/Testimonials/Testimonials";
import Reservation from "../components/Reservation/Reservation";
import FAQ from "../components/FAQ/FAQ";
import Contact from "../components/Contact/Contact";
import Footer from "../components/Footer/Footer";
import FloatingActions from "../components/FloatingActions/FloatingActions";
import { useScrollMotion } from "../hooks/useScrollMotion";
import "./Home.css";
export default function Home() {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://zaifys-spice-and-soul.classygrass8.chatgpt.site";
  useScrollMotion();
  return <><Seo title="Zaify’s — Spice & Soul | Pakistani Food in Rawalpindi" description="Big desi flavours, good company and unforgettable meals. Explore Zaify’s Pakistani favourites, smoky BBQ and more in Satellite Town, Rawalpindi." canonicalUrl={`${origin}/`} ogImage={`${origin}/images/hero-karahi.webp`} /><a href="#main-content" className="skip-link">Skip to content</a><Navbar /><main id="main-content" tabIndex={-1}><Hero /><div className="flavour-band" aria-label="Desi flavour, good company, made with love"><div className="flavour-band__track">{[0,1].map(copy=><div key={copy} aria-hidden={copy===1?"true":undefined}><span>DESI AT HEART</span><i>✳</i><span>BIG ON FLAVOUR</span><i>✳</i><span>MADE TO SHARE</span><i>✳</i><span>ALWAYS ZAIFY’S</span><i>✳</i></div>)}</div></div><Menu /><About /><Gallery /><Testimonials /><Reservation /><FAQ /><Contact /></main><Footer /><FloatingActions /></>;
}
