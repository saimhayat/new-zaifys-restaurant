import { useReveal } from "../../hooks/useReveal";
import { FeatureIcon } from "../Icons";
import { features } from "../../data/siteData";
import "./Features.css";

function FeatureCard({ feature, index }) {
  const ref = useReveal();
  // Formats index as '01', '02', '03', etc.
  const formattedIndex = String(index + 1).padStart(2, "0");

  return (
    <div
      ref={ref}
      className="feature-card reveal"
      style={{ transitionDelay: `${(index % 4) * 80}ms` }}
    >
      <div className="feature-card__header">
        <div className="feature-card__icon">
          <FeatureIcon name={feature.icon} width="24" height="24" />
        </div>
        <span className="feature-card__number">{formattedIndex}</span>
      </div>
      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
    </div>
  );
}

function Features() {
  const headRef = useReveal();

  return (
    <section id="why-us" className="features section-padding">
      <div className="container">
        <div ref={headRef} className="section-head center reveal">
          <span className="eyebrow">Why Zaify&rsquo;s</span>
          <h2 className="section-heading">The details that set the table apart</h2>
          <p className="section-sub">
            Small standards, kept consistently, are what turn a meal into a
            memory.
          </p>
        </div>

        <div className="features__grid">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;