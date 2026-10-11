import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useReveal } from "../../hooks/useReveal";
import { faqs } from "../../data/siteData";
import "./FAQ.css";

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className={`faq__item ${isOpen ? "faq__item--open" : ""}`}>
      <button
        className="faq__question"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${faq.id}`}
      >
        <span>{faq.question}</span>
        <ChevronDown size={18} strokeWidth={2} className="faq__chevron" />
      </button>
      <div
        id={`faq-answer-${faq.id}`}
        className="faq__answer"
        role="region"
        hidden={!isOpen}
      >
        <p>{faq.answer}</p>
      </div>
    </div>
  );
}

function FAQ() {
  const headRef = useReveal();
  const [openId, setOpenId] = useState(faqs[0]?.id ?? null);

  return (
    <section id="faq" className="faq section-padding">
      <div className="container faq__inner">
        <div ref={headRef} className="section-head center reveal">
          <span className="eyebrow">Good to Know</span>
          <h2 className="section-heading">Frequently asked questions</h2>
          <p className="section-sub">
            Everything guests usually ask before their first visit. Still
            curious? Call us — a human always answers.
          </p>
        </div>

        <div className="faq__list">
          {faqs.map((faq) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              isOpen={openId === faq.id}
              onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
