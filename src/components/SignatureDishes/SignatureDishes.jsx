import ResponsiveImage from "../ResponsiveImage";
import { useReveal } from "../../hooks/useReveal";
import { useSignatureDishes } from "../../store/restaurantStore";
import { defaultSize, formatRs } from "../../utils/price";
import "./SignatureDishes.css";

function SignatureCard({ dish, isLarge }) {
  const ref = useReveal();
  return (
    <article
      ref={ref}
      className={`signature-card reveal ${isLarge ? "signature-card--large" : ""}`}
    >
      <ResponsiveImage src={dish.image} alt={dish.name} loading="lazy" />
      <div className="signature-card__scrim" aria-hidden="true" />
      
      {/* Content Area with absolute z-indexing */}
      <div className="signature-card__content">
        <span className="signature-card__category">{dish.category}</span>
        <h3>{dish.name}</h3>
        <p className="signature-card__desc">{dish.description}</p>
        <span className="signature-card__price">
          {formatRs(defaultSize(dish)?.price)}
        </span>

        {/* The admin panel can mark any dish unavailable, so the showcase has
            to say so rather than advertising a dish that cannot be ordered. */}
        {dish.available === false && (
          <span className="signature-card__soldout">Sold out</span>
        )}
      </div>
    </article>
  );
}

function SignatureDishes() {
  const headRef = useReveal();
  const signatureDishes = useSignatureDishes();

  return (
    <section id="signature" className="signature section-padding">
      <div className="container">
        <div ref={headRef} className="section-head reveal">
          <span className="eyebrow">Signature Dishes</span>
          <h2 className="section-heading">The four plates people come back for</h2>
        </div>

        <div className="signature__grid">
          {signatureDishes.map((dish, index) => (
            <SignatureCard key={dish.id} dish={dish} isLarge={index === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default SignatureDishes;