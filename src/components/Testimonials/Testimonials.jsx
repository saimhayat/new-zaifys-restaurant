import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Star, Quote } from "lucide-react";
import { testimonials, restaurantInfo } from "../../data/siteData";
import { useReveal } from "../../hooks/useReveal";
import "./Testimonials.css";
export default function Testimonials() {
  const ref = useReveal(), start = useRef(null);
  const [index, setIndex] = useState(0), review = testimonials[index];
  const go = direction => setIndex(i => (i+direction+testimonials.length)%testimonials.length);
  return <section id="reviews" className="testimonials section-padding"><div className="container testimonials__layout">
    <div ref={ref} className="testimonials__intro reveal"><span className="eyebrow">WORD AROUND THE TABLE</span><h2 className="section-heading">Good food.<br /><em>Better memories.</em></h2><p className="section-sub">A few words from the people who make this place what it is.</p><div className="testimonials__rating"><Star size={27} fill="currentColor" aria-hidden="true" /><strong>{restaurantInfo.rating}<small> / 5</small></strong><span>{restaurantInfo.reviews}+ Google reviews</span></div></div>
    <div className="testimonials__review" onTouchStart={e => { start.current = { x:e.touches[0].clientX,y:e.touches[0].clientY }; }} onTouchEnd={e => { if(!start.current) return;const dx=e.changedTouches[0].clientX-start.current.x,dy=e.changedTouches[0].clientY-start.current.y;start.current=null;if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)) go(dx<0?1:-1); }} onTouchCancel={() => { start.current=null; }}>
      <Quote size={35} className="testimonials__quote-mark" aria-hidden="true" /><div key={review.id} className="testimonials__slide"><div className="testimonials__stars" aria-label={`${review.rating} out of 5 stars`}>{Array.from({length:5},(_,i)=><Star key={i} size={13} fill={i<review.rating?"currentColor":"none"} aria-hidden="true" />)}</div><blockquote>{review.quote}</blockquote><div className="testimonials__author"><span>{review.name.charAt(0)}</span><div><strong>{review.name}</strong><small>{review.role}</small></div></div></div>
      <div className="testimonials__controls"><span aria-live="polite">0{index+1} <i>/ 0{testimonials.length}</i></span><div><button className="icon-button" onClick={()=>go(-1)} aria-label="Previous review"><ArrowLeft size={18} /></button><button className="icon-button" onClick={()=>go(1)} aria-label="Next review"><ArrowRight size={18} /></button></div></div>
    </div>
  </div></section>;
}
