export function validPhone(value) {
  const phone = value.trim(), digits = phone.replace(/\D/g, "");
  return /^\+?[\d\s()-]+$/.test(phone) && digits.length >= 7 && digits.length <= 15;
}
