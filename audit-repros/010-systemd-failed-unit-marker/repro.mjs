import assert from "node:assert/strict";

function serviceName(unit) {
  return unit.endsWith(".service") ? unit.slice(0, -8) : null;
}

function parseRuntime(output) {
  const services = new Map();
  for (const line of output.split("\n")) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 4) continue;
    const [unit, loadState, activeState, subState] = parts;
    const name = serviceName(unit);
    if (name) services.set(name, { loadState, activeState, subState });
  }
  return services;
}

const runtime = parseRuntime("● broken.service loaded failed failed Deliberately broken");
const unitFileNames = ["broken"];
const merged = unitFileNames.map((name) => runtime.get(name) ?? {
  loadState: "loaded",
  activeState: "inactive",
  subState: "dead",
});

console.log({ parsedRuntimeCount: runtime.size, displayed: merged[0] });
assert.equal(runtime.size, 0);
assert.deepEqual(merged[0], { loadState: "loaded", activeState: "inactive", subState: "dead" });
console.log("CONFIRMED: failed/failed is silently changed to inactive/dead.");
