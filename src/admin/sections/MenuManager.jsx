import ResponsiveImage from "../../components/ResponsiveImage";
import { useMemo, useState } from "react";
import { Ban, Check, Download, Info, Plus } from "lucide-react";
import {
  setMenuAvailability,
  toggleMenuItemAvailability,
  updateMenuItemSize,
  useAdminStore,
} from "../../store/restaurantStore";
import {
  ConfirmButton,
  EmptyState,
  FilterTabs,
  PageHeader,
  SearchField,
  Toggle,
} from "../ui";
import { downloadCsv, toCsv } from "../format";
import MenuItemForm from "../MenuItemForm";

function MenuManager() {
  const state = useAdminStore();
  const menu = state.menu;

  const [category, setCategory] = useState("All");
  const [availability, setAvailability] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [creating, setCreating] = useState(false);

  // Resolved fresh each render, so if a dish is deleted the drawer simply
  // stops rendering rather than holding a stale copy.
  const openItem = openId ? menu.find((item) => item.id === openId) : null;

  const categories = useMemo(() => {
    const unique = [...new Set(menu.map((item) => item.category))].sort();
    return [{ id: "All", label: "All" }, ...unique.map((name) => ({ id: name, label: name }))];
  }, [menu]);

  const counts = useMemo(() => {
    const tally = { All: menu.length };
    menu.forEach((item) => {
      tally[item.category] = (tally[item.category] ?? 0) + 1;
    });
    return tally;
  }, [menu]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return menu.filter((item) => {
      if (category !== "All" && item.category !== category) return false;
      if (availability === "soldout" && item.available !== false) return false;
      if (availability === "available" && item.available === false) return false;
      if (!needle) return true;

      return (
        item.name.toLowerCase().includes(needle) ||
        item.category.toLowerCase().includes(needle) ||
        item.tags.some((tag) => tag.toLowerCase().includes(needle))
      );
    });
  }, [menu, category, availability, query]);

  const soldOutCount = menu.filter((item) => item.available === false).length;

  const exportMenu = () => {
    const csv = toCsv(menu, [
      { label: "ID", value: (item) => item.id },
      { label: "Name", value: (item) => item.name },
      { label: "Category", value: (item) => item.category },
      {
        label: "Sizes",
        value: (item) => item.sizes.map((s) => `${s.label}: ${s.price}`).join(" / "),
      },
      { label: "First size price", value: (item) => item.sizes[0]?.price ?? 0 },
      { label: "Available", value: (item) => (item.available === false ? "No" : "Yes") },
      { label: "Badge", value: (item) => item.badge ?? "" },
      { label: "Prep time", value: (item) => item.prepTime },
      { label: "Rating", value: (item) => item.rating },
      { label: "Reviews", value: (item) => item.reviewCount },
      { label: "Tags", value: (item) => item.tags.join("; ") },
    ]);

    downloadCsv(`zaifys-menu-${new Date().toISOString().split("T")[0]}.csv`, csv);
  };

  return (
    <>
      <PageHeader
        title="Menu"
        subtitle={`${menu.length} dishes · ${soldOutCount} marked sold out`}
      >
        <button type="button" className="admin-btn" onClick={exportMenu}>
          <Download size={15} strokeWidth={2} />
          Export
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={() => setCreating(true)}
        >
          <Plus size={16} strokeWidth={2} />
          Add new item
        </button>
      </PageHeader>

      <div className="admin-banner">
        <Info size={17} strokeWidth={2} />
        <div>
          Changes here go live on the website immediately — the public menu reads
          from the same data. Price edits keep the card, the order modal and the
          cart in step automatically.
        </div>
      </div>

      <div className="admin-toolbar">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search dishes or tags…"
          label="Search the menu"
        />
      </div>

      {/* Bulk actions apply to whatever the filters are currently showing, so
          "everything in BBQ is off tonight" is one deliberate tap. */}
      {filtered.length > 0 && (
        <div className="admin-bulk">
          <span className="admin-bulk__text">
            Applies to the {filtered.length} dish
            {filtered.length === 1 ? "" : "es"} shown
          </span>

          <ConfirmButton
            label="Mark shown sold out"
            confirmLabel={`Tap again to sell out ${filtered.length}`}
            icon={Ban}
            className="admin-btn admin-btn--danger"
            onConfirm={() =>
              setMenuAvailability(
                filtered.map((item) => item.id),
                false
              )
            }
          />

          <button
            type="button"
            className="admin-btn"
            disabled={!filtered.some((item) => item.available === false)}
            onClick={() =>
              setMenuAvailability(
                filtered.map((item) => item.id),
                true
              )
            }
          >
            <Check size={15} strokeWidth={2} />
            Mark shown available
          </button>
        </div>
      )}

      <FilterTabs
        options={categories}
        value={category}
        onChange={setCategory}
        counts={counts}
      />

      <div style={{ marginTop: "0.75rem" }}>
        <FilterTabs
          options={[
            { id: "all", label: "All dishes" },
            { id: "available", label: "Available" },
            { id: "soldout", label: "Sold out" },
          ]}
          value={availability}
          onChange={setAvailability}
          counts={{ soldout: soldOutCount, available: menu.length - soldOutCount }}
        />
      </div>

      <div className="admin-card admin-card--flush" style={{ marginTop: "1.1rem" }}>
        {filtered.length === 0 ? (
          <EmptyState
            title="No dishes match"
            message="Try a different category, or clear the search."
            action={
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={() => setCreating(true)}
              >
                <Plus size={16} strokeWidth={2} />
                Add new item
              </button>
            }
          />
        ) : (
          <div className="admin-rows">
            {filtered.map((item) => (
              <div key={item.id} className="admin-row admin-row--menu">
                <div className="admin-row__primary">
                  <ResponsiveImage className="admin-row__thumb" src={item.image} alt="" loading="lazy" />
                  <span style={{ minWidth: 0 }}>
                    <strong className="admin-row__title">{item.name}</strong>
                    <span className="admin-row__meta">
                      {item.category} · {item.prepTime} min
                      {item.badge ? ` · ${item.badge}` : ""}
                      {item.rating ? ` · ${item.rating}★` : ""}
                    </span>
                  </span>
                </div>

                <div className="admin-price-grid">
                  {item.sizes.map((size) => (
                    <div key={size.label} className="admin-size-input">
                      <span>{size.label}</span>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={size.price}
                        aria-label={`${item.name} ${size.label} price`}
                        onChange={(event) =>
                          updateMenuItemSize(
                            item.id,
                            size.label,
                            Math.max(0, Number(event.target.value) || 0)
                          )
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="admin-availability">
                  <Toggle
                    checked={item.available !== false}
                    label={`${item.name} availability`}
                    onChange={() => toggleMenuItemAvailability(item.id)}
                  />
                  <span className="admin-availability__text">
                    {item.available === false ? "Sold out" : "Available"}
                  </span>
                </div>

                <div className="admin-row__end">
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    onClick={() => setOpenId(item.id)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {creating && (
        <MenuItemForm
          mode="create"
          onClose={() => setCreating(false)}
          onCreated={(created) => {
            setCreating(false);
            setOpenId(created.id);
          }}
        />
      )}

      {openItem && (
        <MenuItemForm
          key={openItem.id}
          mode="edit"
          item={openItem}
          onClose={() => setOpenId(null)}
          onCreated={(copy) => setOpenId(copy.id)}
        />
      )}
    </>
  );
}

export default MenuManager;
