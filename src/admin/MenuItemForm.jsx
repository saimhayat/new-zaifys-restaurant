import ResponsiveImage from "../components/ResponsiveImage";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  addMenuItem,
  deleteMenuItem,
  duplicateMenuItem,
  updateMenuItem,
  useMenuCategories,
} from "../store/restaurantStore";
import { ConfirmButton, Drawer, Field, Pill, Toggle } from "./ui";
import { formatRs } from "./format";

const BADGES = ["None", "Bestseller", "Chef's Pick", "New"];

/** `null` spice means the dish carries no heat setting at all. */
const SPICE_OPTIONS = [
  { value: "none", label: "No heat control (drinks, desserts)" },
  { value: "Mild", label: "Mild" },
  { value: "Medium", label: "Medium" },
  { value: "Hot", label: "Hot" },
];

const BLANK_ITEM = {
  name: "",
  category: "",
  description: "",
  image: "",
  sizes: [{ label: "Full", price: 0 }],
  tags: [],
  spice: null,
  prepTime: 20,
  available: true,
  rating: 0,
  reviewCount: 0,
  badge: null,
};

function MenuItemForm({ mode, item, onClose, onCreated }) {
  const isCreate = mode === "create";
  const categories = useMenuCategories();

  const [draft, setDraft] = useState(BLANK_ITEM);
  const [tagDraft, setTagDraft] = useState("");

  // One set of fields drives both modes: a brand new dish is held in local
  // draft state, an existing one writes straight through to the store.
  const current = isCreate ? draft : item;

  const change = (patch) => {
    if (isCreate) setDraft((previous) => ({ ...previous, ...patch }));
    else updateMenuItem(item.id, patch);
  };

  const setSizes = (sizes) => change({ sizes });

  const addSize = () =>
    setSizes([...current.sizes, { label: "", price: 0 }]);

  const updateSize = (index, patch) =>
    setSizes(
      current.sizes.map((size, i) => (i === index ? { ...size, ...patch } : size))
    );

  const removeSize = (index) =>
    setSizes(current.sizes.filter((_, i) => i !== index));

  const addTag = () => {
    const tag = tagDraft.trim();
    if (!tag) return;
    if (!current.tags.includes(tag)) change({ tags: [...current.tags, tag] });
    setTagDraft("");
  };

  const canSave =
    current.name.trim().length > 0 &&
    current.category.trim().length > 0 &&
    current.sizes.length > 0 &&
    current.sizes.every((size) => size.label.trim().length > 0);

  const handleSave = () => {
    if (!canSave) return;
    const created = addMenuItem(draft);
    onCreated?.(created);
  };

  return (
    <Drawer
      open
      title={isCreate ? "Add new item" : current.name}
      subtitle={
        isCreate
          ? "It appears on the website the moment you save"
          : `${current.category} · ${current.id}`
      }
      onClose={onClose}
      footer={
        isCreate ? (
          <>
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={handleSave}
              disabled={!canSave}
            >
              <Plus size={16} strokeWidth={2} />
              Add to menu
            </button>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="admin-btn admin-btn--block"
              onClick={onClose}
            >
              Done
            </button>
            <button
              type="button"
              className="admin-btn"
              onClick={() => {
                const copy = duplicateMenuItem(current.id);
                if (copy) onCreated?.(copy);
              }}
            >
              Duplicate
            </button>
            <ConfirmButton
              label="Delete dish"
              confirmLabel="Tap again to delete"
              icon={Trash2}
              className="admin-btn admin-btn--danger"
              onConfirm={() => {
                deleteMenuItem(current.id);
                onClose();
              }}
            />
          </>
        )
      }
    >
      {!canSave && isCreate && (
        <p className="admin-field__hint" style={{ marginTop: 0, marginBottom: "1rem" }}>
          A name, a category and at least one named size are required.
        </p>
      )}

      <div className="admin-block">
        <h3 className="admin-block__title">Basics</h3>

        <Field label="Dish name">
          <input
            type="text"
            value={current.name}
            placeholder="e.g. Beef Chapli Kabab"
            onChange={(event) => change({ name: event.target.value })}
          />
        </Field>

        <Field
          label="Category"
          hint="Type a new name to create a new category on the website."
        >
          <input
            type="text"
            list="admin-menu-categories"
            value={current.category}
            placeholder="e.g. BBQ"
            onChange={(event) => change({ category: event.target.value })}
          />
        </Field>
        <datalist id="admin-menu-categories">
          {categories.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>

        <Field label="Description">
          <textarea
            value={current.description}
            placeholder="How it is cooked, what makes it worth ordering."
            onChange={(event) => change({ description: event.target.value })}
          />
        </Field>
      </div>

      <div className="admin-block">
        <h3 className="admin-block__title">Photo</h3>

        <Field
          label="Image URL"
          hint="Required for a complete menu card. File uploads need the backend."
        >
          <input
            type="url"
            value={current.image}
            placeholder="https://…"
            onChange={(event) => change({ image: event.target.value })}
          />
        </Field>

        {current.image && (
          <ResponsiveImage
            className="admin-image-preview"
            src={current.image}
            alt=""
            onError={(event) => {
              event.currentTarget.dataset.broken = "true";
            }}
          />
        )}
      </div>

      <div className="admin-block">
        <h3 className="admin-block__title">Sizes &amp; pricing</h3>

        {current.sizes.map((size, index) => (
          <div key={index} className="admin-size-row">
            <input
              type="text"
              value={size.label}
              placeholder="Full"
              aria-label={`Size ${index + 1} name`}
              onChange={(event) => updateSize(index, { label: event.target.value })}
            />
            <div className="admin-size-row__price">
              <span>Rs.</span>
              <input
                type="number"
                min="0"
                step="10"
                value={size.price}
                aria-label={`Size ${index + 1} price`}
                onChange={(event) =>
                  updateSize(index, { price: Math.max(0, Number(event.target.value) || 0) })
                }
              />
            </div>
            <button
              type="button"
              className="admin-icon-btn"
              aria-label={`Remove size ${index + 1}`}
              disabled={current.sizes.length === 1}
              onClick={() => removeSize(index)}
            >
              <Trash2 size={15} strokeWidth={2} />
            </button>
          </div>
        ))}

        <button type="button" className="admin-btn" onClick={addSize}>
          <Plus size={15} strokeWidth={2} />
          Add another size
        </button>

        <p className="admin-field__hint">
          The first size is what the menu card advertises and what the order
          modal selects by default.
        </p>
      </div>

      <div className="admin-block">
        <h3 className="admin-block__title">Availability</h3>
        <div className="admin-availability">
          <Toggle
            checked={current.available !== false}
            label="Availability"
            onChange={() => change({ available: current.available === false })}
          />
          <span className="admin-availability__text">
            {current.available === false
              ? "Sold out — the card cannot be ordered"
              : "Available to order"}
          </span>
        </div>
      </div>

      <div className="admin-block">
        <h3 className="admin-block__title">Kitchen</h3>

        <div className="admin-form-row">
          <Field label="Prep time (minutes)">
            <input
              type="number"
              min="1"
              value={current.prepTime}
              onChange={(event) =>
                change({ prepTime: Math.max(1, Number(event.target.value) || 1) })
              }
            />
          </Field>

          <Field label="Heat level">
            <select
              value={current.spice ?? "none"}
              onChange={(event) =>
                change({
                  spice: event.target.value === "none" ? null : event.target.value,
                })
              }
            >
              {SPICE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Badge">
          <select
            value={current.badge ?? "None"}
            onChange={(event) =>
              change({ badge: event.target.value === "None" ? null : event.target.value })
            }
          >
            {BADGES.map((badge) => (
              <option key={badge} value={badge}>
                {badge}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="admin-block">
        <h3 className="admin-block__title">Rating</h3>
        <div className="admin-form-row">
          <Field label="Average (0–5)">
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={current.rating}
              onChange={(event) =>
                change({
                  rating: Math.min(5, Math.max(0, Number(event.target.value) || 0)),
                })
              }
            />
          </Field>
          <Field label="Number of reviews">
            <input
              type="number"
              min="0"
              value={current.reviewCount}
              onChange={(event) =>
                change({ reviewCount: Math.max(0, Number(event.target.value) || 0) })
              }
            />
          </Field>
        </div>
        <p className="admin-field__hint">
          Shown on the dish panel. Only enter figures you can stand behind.
        </p>
      </div>

      <div className="admin-block">
        <h3 className="admin-block__title">Tags</h3>

        <div className="admin-tag-list">
          {current.tags.length === 0 && (
            <span className="admin-availability__text">No tags yet.</span>
          )}
          {current.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--chip"
              title={`Remove ${tag}`}
              onClick={() =>
                change({ tags: current.tags.filter((entry) => entry !== tag) })
              }
            >
              {tag} ×
            </button>
          ))}
        </div>

        <div className="admin-inline-add">
          <input
            type="text"
            value={tagDraft}
            placeholder="Add a tag, e.g. Contains Nuts"
            onChange={(event) => setTagDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addTag();
              }
            }}
          />
          <button type="button" className="admin-btn" disabled={!tagDraft.trim()} onClick={addTag}>
            Add
          </button>
        </div>
      </div>

      <div className="admin-block">
        <h3 className="admin-block__title">On the website it reads as</h3>
        <p className="admin-preview-line">
          <strong>{formatRs(current.sizes[0]?.price)}</strong>
          <span>
            {current.prepTime} min prep
            {current.rating ? ` · ${current.rating} (${current.reviewCount})` : ""}
          </span>
        </p>
        <div className="admin-tag-list">
          {current.badge && <Pill tone="warn">{current.badge}</Pill>}
          <Pill tone={current.available === false ? "danger" : "ok"}>
            {current.available === false ? "Sold out" : "Available"}
          </Pill>
          {current.tags.map((tag) => (
            <Pill key={tag}>{tag}</Pill>
          ))}
        </div>
      </div>
    </Drawer>
  );
}

export default MenuItemForm;
