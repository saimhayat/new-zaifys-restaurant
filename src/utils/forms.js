export function validPhone(value) {
  const phone = value.trim(), digits = phone.replace(/\D/g, "");
  return /^\+?[\d\s()-]+$/.test(phone) && digits.length >= 7 && digits.length <= 15;
}

/** Date inputs need ISO order regardless of the browser's locale formatting. */
export function pakistanDateInputValue(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Karachi", numberingSystem: "latn", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
