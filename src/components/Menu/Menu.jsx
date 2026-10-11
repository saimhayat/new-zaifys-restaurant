import ResponsiveImage from "../ResponsiveImage";
import { useMemo, useState } from "react";
import { ArrowUpRight, Clock, Search, X, Plus, Flame } from "lucide-react";
import { useReveal } from "../../hooks/useReveal";
import { menuCategories } from "../../data/menuData";
import { useAdminMenu } from "../../store/restaurantStore";
import { defaultSize, formatRs } from "../../utils/price";
import OrderModal from "./OrderModal";
import "./Menu.css";
function MenuCard({ item, onOrder }) {
  const ref = useReveal(), soldOut = item.available === false;
  return <article ref={ref} className={`menu-card reveal ${soldOut ? "menu-card--soldout" : ""}`}>
    <button className="menu-card__image" onClick={() => onOrder(item)} aria-label={`View ${item.name}`}><ResponsiveImage sizes={"(max-width: 767px) 45vw, (max-width: 1100px) 30vw, 23vw"} src={item.image} alt={item.name} loading="lazy" width="600" height="450" />{item.badge && <span className="menu-card__badge"><Flame size={12} aria-hidden="true" /> {item.badge}</span>}{soldOut && <span className="menu-card__soldout">Sold out</span>}</button>
    <div className="menu-card__body"><div className="menu-card__meta"><span>{item.category}</span><span><Clock size={12} aria-hidden="true" /> {item.prepTime} min</span></div><div className="menu-card__title-row"><h3>{item.name}</h3><span className="menu-card__price">{formatRs(defaultSize(item)?.price)}</span></div><p className="menu-card__description">{item.description}</p><div className="menu-card__bottom"><span className="menu-card__tag">{item.tags[0]}</span><button className="menu-card__order" onClick={() => onOrder(item)} disabled={soldOut} aria-label={`Customise and add ${item.name}`}><Plus size={20} aria-hidden="true" /></button></div></div>
  </article>;
}
export default function Menu() {
  const menuItems = useAdminMenu();
  const [activeCategory, setCategory] = useState("All"), [query, setQuery] = useState(""), [count, setCount] = useState(8), [selectedItem, setSelectedItem] = useState(null);
  const headRef = useReveal();
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase(), first = ["chicken-karahi","biryani","malai-boti","moroccan-steak"];
    return menuItems.filter(item => (activeCategory === "All" || item.category === activeCategory) && (!q || `${item.name} ${item.description}`.toLowerCase().includes(q))).sort((a,b) => (first.includes(a.id) ? first.indexOf(a.id) : 99) - (first.includes(b.id) ? first.indexOf(b.id) : 99));
  }, [activeCategory, query, menuItems]);
  const categories = [...new Set([...menuCategories, ...menuItems.map(item => item.category)])];
  return <>
    <section id="menu" className="menu section-padding"><div className="container">
      <div ref={headRef} className="menu__heading reveal"><div><span className="eyebrow">THE CRAVING COLLECTION</span><h2 className="section-heading">Good food.<br /><em>Great choices.</em></h2></div><div className="menu__intro"><p>From sizzling karahis to smoky BBQ, wok-tossed favourites and something sweet. There’s a little something for everyone.</p><span><Flame size={15} aria-hidden="true" /> Your next favourite is right here.</span></div></div>
      <div className="menu__toolbar"><div className="menu__tabs" role="group" aria-label="Filter menu by category">{categories.map(category => <button key={category} aria-pressed={activeCategory === category} className={`menu__tab ${activeCategory === category ? "menu__tab--active" : ""}`} onClick={() => { setCategory(category); setCount(8); }}>{category === "All" ? "All cravings" : category}</button>)}</div><div className="menu__search"><Search size={16} aria-hidden="true" /><input type="search" placeholder="Find a favourite…" value={query} onChange={e => { setQuery(e.target.value); setCount(8); }} aria-label="Search dishes" />{query && <button aria-label="Clear search" onClick={() => { setQuery(""); setCount(8); }}><X size={16} /></button>}</div></div>
      <p className="menu__results" role="status">{filtered.length ? `${Math.min(count, filtered.length)} of ${filtered.length} dishes · Made for your cravings` : "No matching dishes"}</p>
      {filtered.length ? <div className="menu__grid">{filtered.slice(0,count).map(item => <MenuCard key={item.id} item={item} onOrder={setSelectedItem} />)}</div> : <div className="menu__empty"><Search size={34} aria-hidden="true" /><h3>No dishes found</h3><p>Try another craving, or browse the whole menu.</p><button className="btn btn-outline" onClick={() => { setQuery(""); setCategory("All"); setCount(8); }}>Show all dishes</button></div>}
      {count < filtered.length && <div className="menu__more"><button className="btn btn-outline" onClick={() => setCount(value => value + 8)}>More delicious things <ArrowUpRight size={18} aria-hidden="true" /></button><span>Go on. There’s always room for more.</span></div>}
    </div></section>
    {selectedItem && <OrderModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
  </>;
}
