import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Flame, GlassWater, Minus, Plus, RotateCcw, ShoppingBag, Sparkles, Users } from "lucide-react";
import { useAdminMenu } from "../../store/restaurantStore";
import { useCart } from "../../context/CartContext";
import { useReveal } from "../../hooks/useReveal";
import { formatRs } from "../../utils/price";
import { resolveImageSrc } from "../../utils/images";
import { DAAWAT_EXTRAS, DAAWAT_GUESTS, DAAWAT_PROFILES, createDaawatSelections, daawatCartItem, daawatLines, daawatSelection } from "../../utils/daawat";
import ResponsiveImage from "../ResponsiveImage";
import "./DaawatStudio.css";

const originalKarahi = "/images/photo-1631452180519-c014fe946bc7.webp";
const sceneImage = item => item.id === "chicken-karahi" && resolveImageSrc(item.image) === originalKarahi ? "/images/hero-karahi.webp" : item.image;

export default function DaawatStudio() {
  const menu = useAdminMenu(), { addToCart } = useCart(), headingRef = useReveal();
  const [guests, setGuests] = useState(4), [profileId, setProfileId] = useState("desi");
  const [selections, setSelections] = useState(() => createDaawatSelections("desi", 4, menu));
  const [spotlightId, setSpotlightId] = useState("chicken-karahi"), [addedKey, setAddedKey] = useState(null);
  const lines = daawatLines(selections, menu), chosen = lines.filter(line => line.available && line.quantity > 0);
  const subtotal = chosen.reduce((sum, line) => sum + line.total, 0);
  const profile = DAAWAT_PROFILES.find(entry => entry.id === profileId);
  const spotlight = lines.find(line => line.item.id === spotlightId) ?? lines[0];
  const satellites = lines.filter(line => line.item.id !== spotlight?.item.id).slice(0, 2);
  const unavailable = lines.some(line => !line.available) || Object.keys(selections).length > lines.length;
  const revision = JSON.stringify(chosen.map(line => [line.item.id, line.item.name, line.size, line.unitPrice, line.quantity, line.item.spice]));
  const added = chosen.length > 0 && addedKey === revision;

  const reset = (nextProfile = profileId, nextGuests = guests) => {
    setSelections(createDaawatSelections(nextProfile, nextGuests, menu));
    setSpotlightId(DAAWAT_PROFILES.find(entry => entry.id === nextProfile).dishes[0]);
    setAddedKey(null);
  };
  const update = (id, values) => { setSelections(current => ({ ...current, [id]: { ...current[id], ...values } })); setAddedKey(null); };
  const toggleExtra = (extra, enabled) => {
    const item = menu.find(dish => dish.id === extra.id);
    setSelections(current => {
      const next = { ...current };
      const selected = enabled ?? !Boolean(current[extra.id]);
      if (selected && item && item.available !== false) next[extra.id] = daawatSelection(item, guests, true);
      else delete next[extra.id];
      return next;
    });
    setAddedKey(null);
  };
  const addSpread = () => {
    if (!chosen.length || added) return;
    chosen.forEach(line => addToCart(daawatCartItem(line)));
    setAddedKey(revision);
  };

  return <section id="daawat" className="daawat" aria-labelledby="daawat-title">
    <div className="container">
      <div ref={headingRef} className="daawat__heading reveal">
        <div><span className="eyebrow">THE DAAWAT STUDIO</span><h2 id="daawat-title">Your people.<br /><em>Your perfect spread.</em></h2></div>
        <p>A table full of favourites. A little something for everyone.<br />Choose your company. We’ll help you start the spread.</p>
      </div>
      <div className="daawat__layout">
        <div className="daawat__showcase">
          <div className="daawat__showcase-top"><span><Flame size={14} aria-hidden="true" /> MADE FOR THE MIDDLE OF THE TABLE</span><span className="daawat__edition">ZAIFY’S / 01</span></div>
          <div className="daawat__scene" data-parallax="55" data-ambient>
            <span className="daawat__urdu" lang="ur" dir="rtl" aria-hidden="true">دعوت</span>
            <div className="daawat__orbit daawat__orbit--outer" aria-hidden="true" /><div className="daawat__orbit daawat__orbit--inner" aria-hidden="true" />
            <div className="daawat__stage" aria-hidden="true">
              {spotlight ? <div key={spotlight.item.id} className={`daawat__main-dish ${sceneImage(spotlight.item) === "/images/hero-karahi.webp" ? "daawat__main-dish--cutout" : ""}`}><ResponsiveImage src={sceneImage(spotlight.item)} alt="" loading="lazy" sizes="(max-width: 600px) 85vw, (max-width: 1000px) 65vw, 44vw" /></div> : <div className="daawat__empty-scene"><ShoppingBag size={55} /><span>Make room for your favourites.</span></div>}
              {satellites.map((line, index) => <div key={line.item.id} className={`daawat__satellite daawat__satellite--${index + 1}`}><ResponsiveImage src={line.item.image} alt="" loading="lazy" sizes="(max-width: 767px) 110px, 160px" /></div>)}
              <i className="daawat__star daawat__star--one">✳</i><i className="daawat__star daawat__star--two">✦</i>
            </div>
            <div className="daawat__table-note"><Users size={16} aria-hidden="true" /><span>A little gathering.<br /><strong>A lot of good food.</strong></span></div>
          </div>
          <div className="daawat__dish-caption"><div><span>IN THE SPOTLIGHT</span><h3>{spotlight?.item.name ?? "Your next great meal"}</h3></div><span className="daawat__dish-number" aria-hidden="true">{spotlight ? String(lines.indexOf(spotlight) + 1).padStart(2, "0") : "✳"}</span></div>
          <p className="daawat__dish-description">{spotlight?.item.description ?? "Choose a spread to get started."}</p>
          <div className="daawat__showcase-footer"><span><span aria-hidden="true">✦</span> DESI AT HEART. BETTER TOGETHER.</span><span>Tap a dish to take a closer look.</span></div>
        </div>

        <div className="daawat__planner">
          <div className="daawat__planner-title"><div><span>LET’S MAKE IT A DAAWAT</span><h3>Set your table.</h3></div><button className="daawat__reset" onClick={() => reset()} aria-label="Reset your spread"><RotateCcw size={17} aria-hidden="true" /></button></div>
          <fieldset className="daawat__guests"><legend><Users size={16} aria-hidden="true" /> Who’s coming?</legend><div>{DAAWAT_GUESTS.map(count => <button key={count} aria-pressed={guests === count} onClick={() => { setGuests(count); reset(profileId, count); }}><strong>{count}</strong><span>people</span></button>)}</div></fieldset>
          <fieldset className="daawat__profiles"><legend>Pick the mood</legend><div>{DAAWAT_PROFILES.map(entry => <button key={entry.id} aria-pressed={profileId === entry.id} onClick={() => { setProfileId(entry.id); reset(entry.id, guests); }}>{entry.name}</button>)}</div></fieldset>
          <p className="daawat__profile-note">{profile.note}</p>
          <div className="daawat__receipt" aria-label="Adjust the dishes in your spread">
            {lines.map(line => <div key={line.item.id} className={`daawat__line ${line.quantity === 0 || !line.available ? "daawat__line--inactive" : ""}`} data-dish-id={line.item.id}>
              <button className="daawat__thumbnail" aria-label={`Show ${line.item.name}`} aria-pressed={spotlight?.item.id === line.item.id} onClick={() => setSpotlightId(line.item.id)}><ResponsiveImage src={line.item.image} alt="" loading="lazy" sizes="56px" width="56" height="56" /></button>
              <div className="daawat__line-info"><h4>{line.item.name}</h4><div>{line.available ? <><select aria-label={`Portion for ${line.item.name}`} value={line.size} onChange={event => update(line.item.id, { size: event.target.value })}>{line.item.sizes.map(size => <option key={size.label} value={size.label}>{size.label}</option>)}</select><span>{formatRs(line.unitPrice)} each</span></> : <span className="daawat__sold-out">Currently unavailable</span>}</div></div>
              <div className="daawat__quantity"><button aria-label={`Remove one ${line.item.name}`} disabled={!line.available || line.quantity === 0} onClick={() => update(line.item.id, { quantity: Math.max(0, line.quantity - 1) })}><Minus size={14} aria-hidden="true" /></button><output aria-label={`Quantity of ${line.item.name}`}>{line.quantity}</output><button aria-label={`Add one ${line.item.name}`} disabled={!line.available || line.quantity >= 20} onClick={() => update(line.item.id, { quantity: line.quantity + 1 })}><Plus size={14} aria-hidden="true" /></button></div>
            </div>)}
            {!lines.length && <p className="daawat__unavailable">This spread isn’t available right now. Try another mood or explore the menu.</p>}
          </div>
          <fieldset className="daawat__extras"><legend>A little extra?</legend><div>{DAAWAT_EXTRAS.map(extra => {
            const item = menu.find(dish => dish.id === extra.id), disabled = !item || item.available === false, selected = Boolean(selections[extra.id]);
            return <label key={extra.id} htmlFor={`daawat-extra-${extra.id}`} className={`${disabled ? "daawat__extra--unavailable" : ""} ${selected ? "daawat__extra--selected" : ""}`.trim()} onClick={event => {
              if (event.target.tagName === "INPUT") return;
              event.preventDefault();
              if (!disabled) toggleExtra(extra);
            }}><input id={`daawat-extra-${extra.id}`} type="checkbox" checked={selected} disabled={disabled} onChange={event => toggleExtra(extra, event.target.checked)} /><span className="daawat__checkbox" aria-hidden="true"><Check size={13} /></span>{extra.icon === "sweet" ? <Sparkles size={17} aria-hidden="true" /> : <GlassWater size={17} aria-hidden="true" />}<span><strong>{extra.name}</strong><small>{disabled ? "Currently unavailable" : extra.note}</small></span></label>;
          })}</div></fieldset>
          {unavailable && <p className="daawat__unavailable" role="status">Unavailable dishes are excluded from your subtotal and bag.</p>}
          <div className="daawat__summary"><div><span>YOUR SPREAD · FOOD SUBTOTAL</span><output aria-live="polite" aria-atomic="true" aria-label="Spread subtotal">{formatRs(subtotal)}</output></div><span>{chosen.length > 0 ? <>About <strong>{formatRs(subtotal / guests)}</strong><br />per person</> : "Add a dish to begin"}</span></div>
          {added ? <Link to="/cart" className="btn daawat__add daawat__add--success"><Check size={18} aria-hidden="true" /> Spread added · View your bag <ArrowUpRight size={18} aria-hidden="true" /></Link> : <button className="btn daawat__add" onClick={addSpread} disabled={!chosen.length}><ShoppingBag size={18} aria-hidden="true" /> Add this spread to my bag <ArrowUpRight size={18} aria-hidden="true" /></button>}
          <p className="daawat__status" role="status">{added ? "Your dishes are in your bag. Review your spread before checkout." : "Suggested quantities, not a fixed set menu. Adjust for your appetite. Delivery is calculated at checkout."}</p>
          <div className="daawat__receipt-footer"><span>GOOD FOOD. GOOD COMPANY.</span><span className="daawat__mini-brand">zaify’s<span aria-hidden="true">✳</span></span></div>
        </div>
      </div>
    </div>
  </section>;
}
