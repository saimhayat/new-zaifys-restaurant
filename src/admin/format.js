/**
 * Formatting helpers for the admin panel.
 *
 * These live apart from `ui.jsx` so that file only exports components — mixing
 * the two breaks React Fast Refresh.
 */

// One currency formatter for the whole app, shared with the public menu.
export { formatRs } from "../utils/price";

/**
 * Compact rupees for chart axes and tight labels: 0 → "Rs 0",
 * 4500 → "Rs 4.5k", 125000 → "Rs 1.25L". South-Asian lakh notation,
 * because that is how the staff already read large takings.
 */
export function formatRsCompact(value) {
  const amount = Number(value) || 0;
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `Rs ${lakhs >= 10 ? Math.round(lakhs) : Math.round(lakhs * 100) / 100}L`;
  }
  if (amount >= 1000) {
    const thousands = amount / 1000;
    return `Rs ${thousands >= 10 ? Math.round(thousands) : Math.round(thousands * 10) / 10}k`;
  }
  return `Rs ${amount}`;
}

/**
 * Normalises a locally-typed Pakistani number into the digits-only,
 * country-coded form `wa.me` expects: "0300 1234567" → "923001234567".
 */
export function toWhatsAppHref(phone, message) {
  const digits = String(phone).replace(/\D/g, "");
  const international = digits.startsWith("0")
    ? `92${digits.slice(1)}`
    : digits.startsWith("92")
      ? digits
      : `92${digits}`;

  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${international}${text}`;
}

/**
 * Builds a CSV string from `columns` — each entry is `{ label, value(row) }`.
 * Values are quoted only when they contain a comma, quote or newline (RFC
 * 4180), so the file opens cleanly in Excel and Sheets.
 */
export function toCsv(rows, columns) {
  const escape = (value) => {
    const text = value === null || value === undefined ? "" : String(value);
    const needsQuoting =
      text.includes(",") ||
      text.includes('"') ||
      text.includes("\n") ||
      text.includes("\r");
    return needsQuoting ? '"' + text.replace(/"/g, '""') + '"' : text;
  };

  return [
    columns.map((column) => escape(column.label)).join(","),
    ...rows.map((row) =>
      columns.map((column) => escape(column.value(row))).join(",")
    ),
  ].join("\n");
}

/** Triggers a file download. The BOM keeps Excel happy with UTF-8. */
export function downloadCsv(filename, csv) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(iso) {
  if (!iso) return "—";

  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;

  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}
