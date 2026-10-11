import assert from "node:assert/strict";
import test from "node:test";
import { installPerformanceProfile, performanceMode } from "./performance.js";

test("Missing optional browser hints keep the normal profile", () => {
  assert.equal(performanceMode({}), "full");
  assert.equal(performanceMode({ deviceMemory: undefined, hardwareConcurrency: undefined }), "full");
  assert.equal(performanceMode({ deviceMemory: 0, hardwareConcurrency: -1 }), "full");
});

test("Limited device and network hints select a lighter profile", () => {
  assert.equal(performanceMode({ deviceMemory: 4, hardwareConcurrency: 8 }), "lite");
  assert.equal(performanceMode({ deviceMemory: 8, hardwareConcurrency: 2 }), "lite");
  assert.equal(performanceMode({ connection: { saveData: true, effectiveType: "4g" } }), "lite");
  assert.equal(performanceMode({ connection: { effectiveType: "3g" } }), "lite");
  assert.equal(performanceMode({ deviceMemory: 8, hardwareConcurrency: 8, connection: { effectiveType: "4g" } }), "full");
});

test("Network changes update the profile without overwriting the user's motion preference", () => {
  const listeners = new Set(), events = [], root = { dataset: { motion: "off" } };
  const connection = { saveData: false, effectiveType: "4g", addEventListener: (_, listener) => listeners.add(listener), removeEventListener: (_, listener) => listeners.delete(listener) };
  const win = { navigator: { connection }, document: { documentElement: root }, Event: class { constructor(type) { this.type = type; } }, dispatchEvent: event => events.push(event.type) };
  const dispose = installPerformanceProfile(win);
  assert.equal(root.dataset.performance, "full");
  connection.saveData = true;
  listeners.forEach(listener => listener());
  assert.equal(root.dataset.performance, "lite");
  assert.equal(root.dataset.motion, "off");
  assert.equal(events.length, 2);
  listeners.forEach(listener => listener());
  assert.equal(events.length, 2);
  dispose();
  assert.equal(listeners.size, 0);
});
