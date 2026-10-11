import assert from "node:assert/strict";
import test from "node:test";
import { menuItems } from "../data/menuData.js";
import { createDaawatSelections, daawatCartItem, daawatLines } from "./daawat.js";

test("A spread reads prices from the supplied menu", () => {
  const selections = createDaawatSelections("desi", 4, menuItems);
  const changedMenu = menuItems.map(item => item.id === "chicken-karahi" ? { ...item, sizes: [{ label: "Full", price: 1775 }] } : item);
  const lines = daawatLines(selections, changedMenu);
  assert.equal(lines.reduce((sum, line) => sum + line.total, 0), 2725);
  assert.equal(lines[0].unitPrice, 1775);
});

test("Two-person suggestions select available half portions", () => {
  const lines = daawatLines(createDaawatSelections("desi", 2, menuItems), menuItems);
  assert.deepEqual(lines.map(line => [line.size, line.quantity]), [["Half", 1], ["Half", 1]]);
  assert.equal(lines.reduce((sum, line) => sum + line.total, 0), 1650);
});

test("Unavailable, removed and invalidly priced dishes cannot enter a bag", () => {
  const selections = createDaawatSelections("mixed", 4, menuItems);
  const changedMenu = menuItems.filter(item => item.id !== "biryani").map(item => {
    if (item.id === "chicken-karahi") return { ...item, available: false };
    if (item.id === "malai-boti") return { ...item, sizes: [{ label: "Full", price: NaN }] };
    return item;
  });
  const lines = daawatLines(selections, changedMenu);
  assert.equal(lines.length, 2);
  assert.ok(lines.every(line => line.total === 0 && daawatCartItem(line) === null));
});

test("Guest suggestions and custom portions survive conversion to a cart line", () => {
  const selections = createDaawatSelections("desi", 8, menuItems);
  selections["chicken-karahi"] = { size: "Half", quantity: 3 };
  const line = daawatLines(selections, menuItems)[0];
  const cartItem = daawatCartItem(line);
  assert.equal(cartItem.quantity, 3);
  assert.equal(cartItem.size, "Half");
  assert.equal(cartItem.totalPrice, 3150);
  assert.equal(cartItem.spice, "Hot");
  assert.equal(cartItem.image, menuItems.find(item => item.id === cartItem.id).image);
});

test("Removed servings and corrupt quantities do not add free or invalid dishes", () => {
  for (const quantity of [0, -2, NaN, 1.5]) {
    const [line] = daawatLines({ "chicken-karahi": { size: "Full", quantity } }, menuItems);
    assert.equal(daawatCartItem(line), null);
  }
});

test("A changed portion label resolves to the current menu's default", () => {
  const selections = createDaawatSelections("desi", 2, menuItems);
  const changedMenu = menuItems.map(item => item.id === "chicken-karahi" ? { ...item, sizes: [{ label: "Sharing", price: 1750 }] } : item);
  const [line] = daawatLines(selections, changedMenu);
  assert.equal(line.size, "Sharing");
  assert.equal(daawatCartItem(line).unitPrice, 1750);
});
