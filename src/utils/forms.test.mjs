import assert from "node:assert/strict";
import test from "node:test";
import { pakistanDateInputValue, validPhone } from "./forms.js";

test("Reservation dates remain ISO dates across the Pakistan midnight boundary", () => {
  assert.equal(pakistanDateInputValue(new Date("2026-10-11T18:59:59Z")), "2026-10-11");
  assert.equal(pakistanDateInputValue(new Date("2026-10-11T19:00:00Z")), "2026-10-12");
});

test("Phone validation allows local and international forms while rejecting punctuation", () => {
  assert.equal(validPhone("0300 1234567"), true);
  assert.equal(validPhone("+92 (300) 1234567"), true);
  assert.equal(validPhone("------"), false);
});
