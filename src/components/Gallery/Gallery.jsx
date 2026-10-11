import ResponsiveImage from "../ResponsiveImage";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, ArrowLeft, ArrowRight, X } from "lucide-react";
import { galleryImages } from "../../data/siteData";
import { useReveal } from "../../hooks/useReveal";
import { useDialog } from "../../hooks/useDialog";
import "./Gallery.css";
export default function Gallery() {
  const ref = useReveal();
  const [filter, setFilter] = useState("All moments"), [index, setIndex] = useState(null);
  const photos = useMemo(() => galleryImages.filter(image => filter === "All moments" || (filter === "Around the room" ? ["Interior","Family","Chefs"].includes(image.category) : !["Interior","Family","Chefs"].includes(image.category))), [filter]);
  const dialogRef = useDialog(index !== null, () => setIndex(null));
  useEffect(() => {
    if (index === null) return;
    const key = e => { if(e.key === "ArrowRight") setIndex(i => (i+1)%photos.length); if(e.key === "ArrowLeft") setIndex(i => (i-1+photos.length)%photos.length); };
    window.addEventListener("keydown",key);return () => window.removeEventListener("keydown",key);
  },[index,photos.length]);
  return <section id="gallery" className="gallery section-padding"><div className="container">
    <div ref={ref} className="gallery__heading reveal"><div><span className="eyebrow">A PLACE FOR YOUR PEOPLE</span><h2 className="section-heading">Settle in.<br /><em>Stay a little longer.</em></h2></div><p>Good food is only half the story.<br />The rest is the people you share it with.</p></div>
    <div className="gallery__filters" role="group" aria-label="Filter gallery">{["All moments","On the plate","Around the room"].map(label => <button key={label} aria-pressed={filter === label} className={filter === label ? "gallery__filter--active" : ""} onClick={() => { setFilter(label); setIndex(null); }}>{label}</button>)}</div>
    <div className="gallery__masonry">{photos.map((photo,i) => <button key={photo.id} className="gallery__item" onClick={() => setIndex(i)} aria-label={`Open image: ${photo.alt}`}><ResponsiveImage sizes={i === 0 ? "(max-width: 767px) 90vw, 60vw" : "(max-width: 767px) 45vw, 30vw"} src={photo.src} alt={photo.alt} loading="lazy" width="800" height="650" /><div className="gallery__caption"><span>{photo.category}</span><ArrowUpRight size={20} /></div></button>)}</div>
  </div>{index !== null && createPortal(<div className="lightbox" onClick={() => setIndex(null)}><div ref={dialogRef} className="lightbox__content" role="dialog" aria-modal="true" aria-label="Gallery image viewer" tabIndex={-1} onClick={e => e.stopPropagation()}><button className="lightbox__close icon-button" onClick={() => setIndex(null)} aria-label="Close image viewer"><X /></button><figure><ResponsiveImage sizes="(max-width: 1148px) calc(100vw - 48px), 1100px" src={photos[index].src} alt={photos[index].alt} /><figcaption>{photos[index].alt}</figcaption></figure><div className="lightbox__controls"><button className="icon-button" aria-label="Previous image" onClick={() => setIndex(i => (i-1+photos.length)%photos.length)}><ArrowLeft size={19} /></button><span aria-live="polite">{index+1} / {photos.length}</span><button className="icon-button" aria-label="Next image" onClick={() => setIndex(i => (i+1)%photos.length)}><ArrowRight size={19} /></button></div></div></div>,document.body)}</section>;
}
